// ============================================
// MODO TELA — lógica do telão e dos celulares
// O dispositivo que cria a sala vira o TELÃO (isScreenDevice = true).
// Os jogadores entram pelos próprios celulares.
// ============================================

// Guarda a carta do jogador (para o botão "Rever minha carta")
let myRoleData = null;

// ============================================
// LIGAR O MODO PARTY (host vira a tela)
// O host sai da lista de jogadores, a sala vira screenMode, e este
// dispositivo passa a ser o telão.
// ============================================
function enabledPartyAsHost(code) {
    // remove o host da lista de jogadores e marca a sala como Party
    const updates = {
        screenMode: true,
        [`players/${onlineProfile.name}`]: null
    };
    db.ref('rooms/' + code).update(updates).then(() => {
        // para de escutar como jogador e passa a escutar como tela
        db.ref('rooms/' + code + '/players').off();
        db.ref('rooms/' + code + '/status').off();
        db.ref('rooms/' + code + '/extras').off();
        db.ref('rooms/' + code + '/screenMode').off();
        isScreenDevice = true;
        showScreen('screen-screen-lobby');
        listenToRoomAsScreen(code);
    });
}

// ---- Composição de papéis da partida (para o resumo do celular e nada secreto) ----
// Retorna a lista de papéis que existem na mesa, dado nº de jogadores e expansões.
function composicaoDaMesa(numPlayers, extras) {
    const cfg = GAME_CONFIG[numPlayers];
    if (!cfg) return [];
    const outlaws = cfg.outlaws;
    const law = numPlayers - outlaws;
    const blocks = [];

    // Lado da Lei
    let lawCommon = law;
    if (extras && extras.roles) { lawCommon -= 1; }       // Delegado
    if (extras && extras.farsante) { lawCommon -= 1; }    // Escrivão
    for (let i = 0; i < lawCommon; i++) blocks.push('LAW');
    if (extras && extras.roles) blocks.push('DELEGADO');
    if (extras && extras.farsante) blocks.push('ESCRIVAO');

    // Lado dos Fora-da-Lei
    let outCommon = outlaws;
    if (extras && extras.roles) { outCommon -= 1; }        // Chefe
    if (extras && extras.farsante) { outCommon -= 1; }     // Falsificador
    for (let i = 0; i < outCommon; i++) blocks.push('OUTLAW');
    if (extras && extras.roles) blocks.push('BOSS');
    if (extras && extras.farsante) blocks.push('FALSIFICADOR');

    return blocks;
}

// Nome e descrição de cada papel (para o resumo do celular)
function papelInfo(suitKey) {
    const map = {
        LAW:          { name: t('role_law'),          team: 'law' },
        DELEGADO:     { name: t('role_delegado'),     team: 'law' },
        ESCRIVAO:     { name: t('role_escrivao'),     team: 'law' },
        OUTLAW:       { name: t('role_outlaw'),       team: 'outlaw' },
        BOSS:         { name: t('role_boss'),         team: 'outlaw' },
        FALSIFICADOR: { name: t('role_falsificador'), team: 'outlaw' },
    };
    return map[suitKey] || map.LAW;
}

// Descrição curta de cada papel para o modal "i"
function papelDesc(suitKey) {
    const map = {
        LAW:          t('phone_desc_law'),
        DELEGADO:     t('phone_desc_delegado'),
        ESCRIVAO:     t('phone_desc_escrivao'),
        OUTLAW:       t('phone_desc_outlaw'),
        BOSS:         t('phone_desc_boss'),
        FALSIFICADOR: t('phone_desc_falsificador'),
    };
    return map[suitKey] || '';
}

// ============================================
// QR CODE DA SALA
// Monta a URL <origem>/#CODIGO e desenha o QR no lobby do telão.
// Funciona em qualquer domínio (saloongame.com.br, github.io, etc.).
// ============================================
function generateRoomQRCode(code) {
    const holder = document.getElementById('screen-qrcode');
    if (!holder || typeof qrcode === 'undefined') return;
    let base = location.origin + location.pathname;
    const roomUrl = base + '#' + code;
    try {
        const qr = qrcode(0, 'M');
        qr.addData(roomUrl);
        qr.make();
        holder.innerHTML = qr.createImgTag(8, 8);
        const img = holder.querySelector('img');
        if (img) { img.style.width = '100%'; img.style.height = '100%'; img.style.display = 'block'; }
    } catch (e) {
        holder.innerHTML = '';
    }
}

// ============================================
// TELÃO — LOBBY
// ============================================
function listenToRoomAsScreen(code) {
    document.body.classList.add('is-screen');
    document.getElementById('screen-room-code').innerText = code;

    // Gera o QR code com o link direto da sala
    generateRoomQRCode(code);

    // Jogadores entrando
    db.ref('rooms/' + code + '/players').on('value', snap => {
        const players = snap.val() ? Object.values(snap.val()) : [];
        renderScreenLobbyPlayers(players);
        const startBtn = document.getElementById('btn-screen-start');
        const hint = document.getElementById('screen-min-players');
        if (players.length >= 5) {
            startBtn.classList.remove('hidden');
            hint.classList.add('hidden');
        } else {
            startBtn.classList.add('hidden');
            hint.classList.remove('hidden');
            hint.innerText = t('screen_need_players_count', { count: players.length });
        }
    });

    // Expansões (o telão mostra; quem altera são os celulares? Não — no modo tela,
    // a seleção de expansões fica no telão, controlada por toque nele.)
    db.ref('rooms/' + code + '/extras').on('value', snap => {
        const extras = snap.val() || { roles: false, revolver: false, farsante: false };
        renderScreenLobbyExpansions(code, extras);
    });

    // Status: quando começar, o telão vai para o tabuleiro
    db.ref('rooms/' + code + '/status').on('value', snap => {
        const status = snap.val();
        routeScreenStatus(code, status);
    });

    // Botão começar
    document.getElementById('btn-screen-start').onclick = () => {
        db.ref('rooms/' + code + '/players').once('value').then(s => {
            const players = s.val() ? Object.values(s.val()) : [];
            if (players.length < 5) return;
            startScreenMatch(code, players);
        });
    };
    document.getElementById('btn-screen-leave').onclick = () => {
        db.ref('rooms/' + code).remove();
        isScreenDevice = false;
        location.reload();
    };
}

function renderScreenLobbyPlayers(players) {
    const cont = document.getElementById('screen-lobby-players');
    cont.innerHTML = '';
    players.forEach(p => {
        const av = p.avatar || 'avatars/avatar1.png';
        const div = document.createElement('div');
        div.className = 'tela-lobby-player';
        div.innerHTML = `<div class="tlp-av"><img src="${av}"></div><span>${p.name}</span>`;
        cont.appendChild(div);
    });
}

function renderScreenLobbyExpansions(code, extras) {
    const cont = document.getElementById('screen-lobby-expansions');
    const defs = [
        { key: 'roles',    img: 'images/badge_hat.png',    title: t('extra_roles_inline'),    sub: t('extra_roles_sub') },
        { key: 'farsante', img: 'images/exp-farsante.png', title: t('extra_farsante_inline'), sub: t('extra_farsante_sub'), req: true },
        { key: 'revolver', img: 'images/revolver.png',     title: t('extra_revolver_inline'), sub: t('extra_revolver_sub') },
    ];
    cont.innerHTML = '';
    defs.forEach(d => {
        const on = !!extras[d.key] && (d.key !== 'farsante' || !!extras.roles);
        const div = document.createElement('div');
        div.className = 'tela-exp-card' + (on ? ' on' : '') + (d.req && !extras.roles ? ' disabled' : '');
        div.innerHTML = `
            <div class="tec-check">${on ? '✓' : ''}</div>
            <img src="${d.img}" class="tec-icon">
            <div class="tec-text"><span class="tec-title">${d.title}</span><span class="tec-sub">${d.sub}</span>
            ${d.req ? `<span class="tec-req">${t('farsante_req')}</span>` : ''}</div>`;
        div.onclick = () => toggleScreenExpansion(code, d.key, extras);
        cont.appendChild(div);
    });
}

function toggleScreenExpansion(code, key, extras) {
    if (key === 'farsante' && !extras.roles) {
        // pisca o card do distintivo
        const cards = document.querySelectorAll('.tela-exp-card');
        if (cards[0]) { cards[0].classList.add('shake-req'); setTimeout(() => cards[0].classList.remove('shake-req'), 500); }
        return;
    }
    const updates = {};
    updates[key] = !extras[key];
    // desligar Distintivo desliga Farsante
    if (key === 'roles' && extras[key]) updates.farsante = false;
    db.ref('rooms/' + code + '/extras').update(updates);
}

// ============================================
// CELULAR — RESUMO (fora da vez)
// ============================================
function showPhoneSummary(code) {
    db.ref('rooms/' + code).once('value').then(snap => {
        const room = snap.val();
        if (!room) return;
        const players = room.players ? Object.values(room.players) : [];
        const blocks = composicaoDaMesa(players.length, room.extras || {});
        renderPhoneRoles(blocks);
        // botão de rever a própria carta
        const reviewBtn = document.getElementById('btn-phone-review-card');
        if (reviewBtn) {
            reviewBtn.onclick = () => { reviewMyCard(code); };
        }
        showScreen('screen-phone-summary');
    });
}

// Reabre a carta do jogador (modo tela), com botão de voltar ao resumo.
// Não mexe nos listeners de status — é só visual.
function reviewMyCard(code) {
    if (!myRoleData) { showPhoneSummary(code); return; }
    showScreen('screen-online-role-reveal');
    document.getElementById('online-ready-count').innerText = '';
    runCardScene({
        card:    'online-reveal-card',
        inner:   'online-reveal-card-inner',
        face:    'online-role-card-display',
        btnFlip: 'online-btn-flip-card',
        btnDone: 'btn-online-understood'
    }, myRoleData, {
        doneLabelKey: 'phone_back_summary',
        keepCardOnDone: true,
        onDone: () => { showPhoneSummary(code); }
    });
}

function renderPhoneRoles(blocks) {
    const grid = document.getElementById('phone-roles-grid');
    grid.innerHTML = '';
    blocks.forEach(suitKey => {
        const info = papelInfo(suitKey);
        const div = document.createElement('div');
        div.className = 'role-block ' + info.team;
        div.innerHTML = `
            <div class="rb-suit">${suitSVG(suitKey)}</div>
            <span class="rb-name">${info.name}</span>
            <button class="rb-info">i</button>`;
        div.querySelector('.rb-info').onclick = () => {
            openPhoneRoleModal(info.name, papelDesc(suitKey));
        };
        grid.appendChild(div);
    });
}

function openPhoneRoleModal(title, desc) {
    let modal = document.getElementById('phone-role-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'phone-role-modal';
        modal.className = 'phone-modal';
        modal.innerHTML = `<div class="phone-modal-box"><h3></h3><p></p>
            <button class="phone-modal-close"></button></div>`;
        document.body.appendChild(modal);
        modal.querySelector('.phone-modal-close').innerText = t('understood');
        modal.querySelector('.phone-modal-close').onclick = () => modal.classList.remove('show');
    }
    modal.querySelector('h3').innerText = title;
    modal.querySelector('p').innerText = desc;
    modal.classList.add('show');
}

// ============================================
// TELÃO — INICIAR A PARTIDA (distribui papéis)
// ============================================
function startScreenMatch(code, players) {
    const count  = players.length;
    const roomRef = db.ref('rooms/' + code);
    roomRef.once('value').then(snap => {
        const room   = snap.val();
        const config = GAME_CONFIG[count];
        const extras = room.extras || { roles: false, revolver: false, farsante: false };

        let roles = [];
        for (let i = 0; i < config.outlaws; i++) roles.push('OUTLAW');
        for (let i = 0; i < count - config.outlaws; i++) roles.push('LAW');
        roles = shuffle(roles);

        const updates = {};
        players.forEach((p, i) => {
            updates[`players/${p.name}/role`]           = roles[i];
            updates[`players/${p.name}/isBoss`]         = false;
            updates[`players/${p.name}/isDelegado`]     = false;
            updates[`players/${p.name}/isEscrivao`]     = false;
            updates[`players/${p.name}/isFalsificador`] = false;
        });

        const farsanteOn = !!extras.farsante && !!extras.roles;
        if (extras.roles) {
            const outlawIdxs  = players.map((p, i) => roles[i] === 'OUTLAW' ? i : -1).filter(i => i !== -1);
            const lawIdxs     = players.map((p, i) => roles[i] === 'LAW'    ? i : -1).filter(i => i !== -1);
            const bossIdx     = outlawIdxs[Math.floor(Math.random() * outlawIdxs.length)];
            const delegadoIdx = lawIdxs[Math.floor(Math.random() * lawIdxs.length)];
            const commonOuts  = outlawIdxs.filter(i => i !== bossIdx);
            let delegadoTargetIdx = commonOuts[Math.floor(Math.random() * commonOuts.length)];
            updates[`players/${players[bossIdx].name}/isBoss`]         = true;
            updates[`players/${players[delegadoIdx].name}/isDelegado`] = true;
            updates['delegadoName'] = players[delegadoIdx].name;
            if (farsanteOn) {
                const falsIdx = commonOuts[Math.floor(Math.random() * commonOuts.length)];
                updates[`players/${players[falsIdx].name}/isFalsificador`] = true;
                updates['falsificadorName'] = players[falsIdx].name;
                const escrCands = lawIdxs.filter(i => i !== delegadoIdx);
                const escrIdx = escrCands[Math.floor(Math.random() * escrCands.length)];
                updates[`players/${players[escrIdx].name}/isEscrivao`] = true;
                updates['escrivaoName'] = players[escrIdx].name;
                const visiveis = commonOuts.filter(i => i !== falsIdx);
                delegadoTargetIdx = visiveis.length > 0 ? visiveis[Math.floor(Math.random() * visiveis.length)] : bossIdx;
                updates['escrivaoNames'] = shuffle([players[delegadoIdx].name, players[falsIdx].name]);
            }
            updates['delegadoTargetName'] = players[delegadoTargetIdx].name;
        }
        if (extras.revolver) {
            updates['revolverOwnerName'] = players[Math.floor(Math.random() * count)].name;
            updates['revolverPreviousOwnerName'] = null;
        }
        const sheriffIdx = Math.floor(Math.random() * count);
        updates['currentSheriffName']  = players[sheriffIdx].name;
        updates['currentSheriffIndex'] = sheriffIdx;
        updates['currentMissionIndex'] = 0;
        updates['rejectedTeams']       = 0;
        updates['missionResults']      = {};
        updates['extras']              = extras;
        updates['status']              = 'revealing';
        roomRef.update(updates);
    });
}

// ============================================
// TELÃO — ROTEADOR DE STATUS
// O telão mostra sempre a informação pública; nunca nada secreto.
// ============================================
function routeScreenStatus(code, status) {
    if (!isScreenDevice) return;
    if (!status || status === 'waiting') return; // ainda no lobby

    db.ref('rooms/' + code).once('value').then(snap => {
        const room = snap.val();
        if (!room) return;
        if (status === 'revealing') {
            // Enquanto os jogadores veem suas cartas, o telão mostra "distribuindo"
            renderScreenRevealing(room);
        } else if (status === 'board') {
            renderScreenBoard(code, room);
        } else if (status === 'voting') {
            renderScreenVoting(code, room);
        } else if (status === 'mission') {
            renderScreenMission(code, room);
        } else if (status === 'missionResult') {
            renderScreenMissionResult(code, room);
        } else if (status === 'duel_choose' || status === 'duel_action') {
            renderScreenDuel(code, room);
        } else if (status === 'duel_result') {
            renderScreenDuelResult(code, room);
        } else if (status && status.indexOf('gameover') === 0) {
            renderScreenGameOver(code, room, status);
        } else if (status === 'boss_assassination') {
            renderScreenBossAssassination(code, room);
        }
    });
}

// Telão enquanto os jogadores veem suas cartas
function renderScreenRevealing(room) {
    const content = document.getElementById('screen-board-content');
    showScreen('screen-screen-board');
    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${currentRoom}</div>
        </div>
        <div class="screen-center-msg">
            <h1 class="tela-h1">${t('screen_dealing_title')}</h1>
            <p class="tela-sub">${t('screen_dealing_sub')}</p>
            <div class="screen-big-suit">${suitSVG('LAW')}</div>
        </div>`;
}

// Cabeçalho + miniatura da trilha (reusado em várias telas do telão)
function screenHeaderWithTrack(room, label) {
    const cfg = GAME_CONFIG[Object.keys(room.players).length];
    const trackHolder = document.createElement('div');
    buildMissionTrack(
        trackHolder,
        cfg.missions,
        room.missionResults || {},
        room.currentMissionIndex || 0,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired,
        -1
    );
    return `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${currentRoom}</div>
        </div>
        <div class="mini-board"><span class="mb-label">${label || t('screen_track')}</span>
            <div class="mini-track">${trackHolder.innerHTML}</div></div>`;
}

// Telão: tabuleiro principal (entre as fases)
const PICK_DURATION_MS = 90000; // 1min30 para o xerife montar a equipe
function renderScreenBoard(code, room) {
    const content = document.getElementById('screen-board-content');
    showScreen('screen-screen-board');
    const cfg = GAME_CONFIG[Object.keys(room.players).length];
    const missionIdx = room.currentMissionIndex || 0;
    const missionSize = cfg.missions[missionIdx];

    // trilha grande
    const trackHolder = document.createElement('div');
    buildMissionTrack(trackHolder, cfg.missions, room.missionResults || {}, missionIdx,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, -1);

    const rejected = room.rejectedTeams || 0;
    let rdots = '';
    for (let i = 0; i < 5; i++) {
        rdots += `<div class="rdot" style="background:${i < rejected ? 'var(--outlaw)' : '#e8d5c0'}"></div>`;
    }

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="screen-board-timer" id="screen-pick-timer">1:30</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="screen-mission-info">
            <div class="smi-label">${t('screen_mission_label')} ${missionIdx + 1}</div>
            <div class="smi-lore">${t('screen_sheriff_picks', { name: room.currentSheriffName || '', size: missionSize })}</div>
        </div>
        <div class="screen-board-grid">
            <div class="screen-card">
                <div class="screen-card-title">${t('screen_track')}</div>
                <div class="screen-track">${trackHolder.innerHTML}</div>
            </div>
            <div class="screen-bottom-row">
                <div class="screen-card screen-rejects">
                    <div class="screen-card-title" style="margin:0">${t('rejected_teams_short')}</div>
                    <div class="screen-rejects-label">${rejected} / 5</div>
                    <div class="rdots">${rdots}</div>
                </div>
                <div class="screen-card screen-sheriff">
                    <span class="screen-star">⭐</span>
                    <span class="screen-sheriff-txt">${t('screen_sheriff_label')}: <b>${room.currentSheriffName || ''}</b></span>
                </div>
            </div>
        </div>`;

    // Cronômetro da fase do Xerife (o telão é o juiz: ao zerar, passa a vez)
    db.ref('rooms/' + code + '/pickEndTime').once('value').then(snap => {
        let endTime = snap.val();
        if (!endTime) {
            endTime = Date.now() + PICK_DURATION_MS;
            db.ref('rooms/' + code + '/pickEndTime').set(endTime);
        }
        startPickTimer(code, endTime);
    });
}

// Cronômetro pequeno da fase do Xerife; ao zerar, passa a vez (conta rejeição).
function startPickTimer(code, endTime) {
    const txt = document.getElementById('screen-pick-timer');
    if (window._pickTimerRAF) cancelAnimationFrame(window._pickTimerRAF);
    if (window._pickTimerInterval) clearInterval(window._pickTimerInterval);

    function paint() {
        const remaining = Math.max(0, endTime - Date.now());
        const secs = Math.ceil(remaining / 1000);
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        const el = document.getElementById('screen-pick-timer');
        if (el) el.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        if (remaining > 0) window._pickTimerRAF = requestAnimationFrame(paint);
    }
    paint();

    // monitora o tempo: ao zerar, passa a vez
    window._pickTimerInterval = setInterval(() => {
        // se já saiu do board (status mudou), para o timer
        if (Date.now() >= endTime) {
            clearInterval(window._pickTimerInterval);
            window._pickTimerInterval = null;
            db.ref('rooms/' + code).once('value').then(snap => {
                const room = snap.val();
                if (!room || room.status !== 'board') return; // já avançou
                const names = Object.keys(room.players);
                const curIdx = room.currentSheriffIndex || 0;
                const nextIdx = (curIdx + 1) % names.length;
                const newRejected = (room.rejectedTeams || 0) + 1;
                db.ref('rooms/' + code).update({
                    currentSheriffName: names[nextIdx],
                    currentSheriffIndex: nextIdx,
                    rejectedTeams: newRejected,
                    proposedTeam: null,
                    pickEndTime: null,
                    status: newRejected >= 5 ? 'gameover_outlaw' : 'board'
                });
            });
        }
    }, 300);
}

// ============================================
// TELÃO — VOTAÇÃO (cronômetro de 1 min, auto-aprova ao zerar)
// O telão é o "juiz": conta votos e resolve.
// ============================================
const VOTE_DURATION_MS = 60000;

let _screenVotingShown = false;
function renderScreenVoting(code, room) {
    // Se a votação já foi resolvida (mostrando resultado), não re-renderiza por cima.
    if (_screenVoteResolved) return;
    // Renderiza a UI da votação uma vez só (evita múltiplos listeners/timers).
    if (_screenVotingShown) return;
    _screenVotingShown = true;
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = Object.values(room.players);
    const playerCount = players.length;
    const team = room.proposedTeam || [];

    // O telão define o tempo de término da votação (uma vez)
    db.ref('rooms/' + code + '/voteEndTime').once('value').then(snap => {
        let endTime = snap.val();
        if (!endTime) {
            endTime = Date.now() + VOTE_DURATION_MS;
            db.ref('rooms/' + code + '/voteEndTime').set(endTime);
        }
        startScreenVoteUI(code, room, team, players, playerCount, endTime);
    });
}

function startScreenVoteUI(code, room, team, players, playerCount, endTime) {
    const content = document.getElementById('screen-board-content');
    const cfg = GAME_CONFIG[playerCount];
    const missionIdx = room.currentMissionIndex || 0;

    // miniatura da trilha
    const trackHolder = document.createElement('div');
    buildMissionTrack(trackHolder, cfg.missions, room.missionResults || {}, missionIdx,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, -1);

    // equipe proposta com avatares
    const byName = {};
    players.forEach(p => byName[p.name] = p);
    const teamHtml = team.map(name => {
        const av = (byName[name] && byName[name].avatar) || 'avatars/avatar1.png';
        return `<div class="prop-member"><div class="pm-av"><img src="${av}"></div><span class="pm-name">${name}</span></div>`;
    }).join('');

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track">${trackHolder.innerHTML}</div></div>
        <h1 class="tela-h1">${t('screen_vote_title')}</h1>
        <p class="tela-sub">${t('screen_vote_sub', { num: missionIdx + 1 })}</p>
        <div class="screen-vote-center">
            <div class="screen-card prop-card">
                <div class="prop-title">${t('proposed_team')}</div>
                <div class="prop-members">${teamHtml}</div>
            </div>
            <div class="timer-area">
                <div class="timer-ring">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="#fff" stroke="#e8d5c0" stroke-width="8"/>
                        <circle id="screen-timer-arc" cx="50" cy="50" r="44" fill="none" stroke="#881337"
                            stroke-width="8" stroke-linecap="round" stroke-dasharray="276.5" stroke-dashoffset="0"
                            transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="time-text" id="screen-timer-text">1:00</div>
                </div>
                <div class="votes-label" id="screen-votes-label">0 ${t('screen_of')} ${playerCount} ${t('screen_voted')}</div>
                <div class="vote-dots" id="screen-vote-dots"></div>
            </div>
        </div>`;

    // pontos de voto
    const dotsEl = document.getElementById('screen-vote-dots');
    for (let i = 0; i < playerCount; i++) {
        const d = document.createElement('div');
        d.className = 'vote-dot';
        dotsEl.appendChild(d);
    }

    // cronômetro visual
    startScreenTimer(endTime, VOTE_DURATION_MS);

    // monitora votos em tempo real
    db.ref('rooms/' + code + '/votes').off();
    db.ref('rooms/' + code + '/votes').on('value', votesSnap => {
        const votes = votesSnap.val() || {};
        const count = Object.keys(votes).length;
        const label = document.getElementById('screen-votes-label');
        if (label) label.innerText = `${count} ${t('screen_of')} ${playerCount} ${t('screen_voted')}`;
        const dots = document.querySelectorAll('#screen-vote-dots .vote-dot');
        dots.forEach((d, i) => { if (i < count) d.classList.add('done'); });

        if (count >= playerCount) {
            resolveScreenVote(code, votes, team, playerCount);
        }
    });

    // monitora o tempo: ao zerar, auto-aprova
    if (screenTimerInterval) clearInterval(screenTimerInterval);
    screenTimerInterval = setInterval(() => {
        if (Date.now() >= endTime) {
            clearInterval(screenTimerInterval);
            screenTimerInterval = null;
            // auto-aprova: preenche votos faltantes com "yes"
            db.ref('rooms/' + code + '/votes').once('value').then(vs => {
                const votes = vs.val() || {};
                resolveScreenVote(code, votes, team, playerCount, true);
            });
        }
    }, 250);
}

// Resolve a votação (chamada quando todos votam OU o tempo zera).
// Guard para rodar só uma vez.
let _screenVoteResolved = false;
function resolveScreenVote(code, votes, team, playerCount, timedOut) {
    if (_screenVoteResolved) return;
    _screenVoteResolved = true;
    db.ref('rooms/' + code + '/votes').off();
    if (screenTimerInterval) { clearInterval(screenTimerInterval); screenTimerInterval = null; }

    const yesVotes = Object.values(votes).filter(v => v === 'yes').length;
    const majority = Math.floor(playerCount / 2) + 1;
    // se o tempo zerou, a equipe é aprovada automaticamente
    const approved = timedOut ? true : (yesVotes >= majority);

    // Mostra o resultado da votação no telão por 4 segundos, depois segue.
    renderScreenVoteResult(code, votes, approved, team, playerCount, timedOut);
}

// Telão: tela de resultado da votação (4s), depois avança automaticamente.
function renderScreenVoteResult(code, votes, approved, team, playerCount, timedOut) {
    _screenVotingShown = false; // libera para a próxima votação
    const content = document.getElementById('screen-board-content');
    const yesNames = Object.entries(votes).filter(([k, v]) => v === 'yes').map(([k]) => k);
    const noNames  = Object.entries(votes).filter(([k, v]) => v === 'no').map(([k]) => k);

    const outcomeTxt = approved ? t('approved_team') : t('rejected_team');
    const outcomeColor = approved ? 'var(--law)' : 'var(--outlaw)';
    const yesHtml = yesNames.map(n => `<span class="vr-chip yes">${n}</span>`).join('') || '<span class="vr-none">—</span>';
    const noHtml  = noNames.map(n => `<span class="vr-chip no">${n}</span>`).join('') || '<span class="vr-none">—</span>';

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="screen-vr-center">
            <h1 class="screen-vr-title" style="color:${outcomeColor}">${approved ? '✅' : '❌'} ${outcomeTxt}</h1>
            ${timedOut ? `<p class="tela-sub" style="color:#fff">${t('screen_vote_timeout')}</p>` : ''}
            <div class="screen-vr-cols">
                <div class="screen-card vr-col">
                    <div class="vr-head" style="color:var(--law)">👍 ${t('vote_yes_label')}</div>
                    <div class="vr-names">${yesHtml}</div>
                </div>
                <div class="screen-card vr-col">
                    <div class="vr-head" style="color:var(--outlaw)">👎 ${t('vote_no_label')}</div>
                    <div class="vr-names">${noHtml}</div>
                </div>
            </div>
        </div>`;

    // Após 4 segundos, avança automaticamente
    setTimeout(() => {
        db.ref('rooms/' + code).update({ voteEndTime: null }).then(() => {
            if (approved) {
                db.ref('rooms/' + code + '/votes').remove();
                db.ref('rooms/' + code + '/status').set('mission');
            } else {
                db.ref('rooms/' + code).once('value').then(snap => {
                    const room = snap.val();
                    const names = Object.keys(room.players);
                    const curIdx = room.currentSheriffIndex || 0;
                    const nextIdx = (curIdx + 1) % names.length;
                    const newRejected = (room.rejectedTeams || 0) + 1;
                    db.ref('rooms/' + code).update({
                        currentSheriffName: names[nextIdx],
                        currentSheriffIndex: nextIdx,
                        rejectedTeams: newRejected,
                        votes: null,
                        proposedTeam: null,
                        pickEndTime: null,
                        status: newRejected >= 5 ? 'gameover_outlaw' : 'board'
                    });
                });
            }
            setTimeout(() => { _screenVoteResolved = false; }, 1500);
        });
    }, 4000);
}

// Cronômetro visual (anel + texto), baseado no tempo de término sincronizado
function startScreenTimer(endTime, totalMs) {
    const arc = document.getElementById('screen-timer-arc');
    const txt = document.getElementById('screen-timer-text');
    const circ = 276.5;
    function tick() {
        const remaining = Math.max(0, endTime - Date.now());
        const frac = remaining / totalMs;
        if (arc) arc.style.strokeDashoffset = (circ * (1 - frac)).toFixed(1);
        if (txt) {
            const secs = Math.ceil(remaining / 1000);
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            txt.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        }
        if (remaining <= 0) return;
        requestAnimationFrame(tick);
    }
    tick();
}

// ============================================
// TELÃO — MISSÃO EM ANDAMENTO (suspense + processa o resultado)
// ============================================
let _screenMissionShown = false;
function renderScreenMission(code, room) {
    if (_screenMissionResolved) return;
    if (_screenMissionShown) return;
    _screenMissionShown = true;
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = Object.values(room.players);
    const team = room.proposedTeam || [];
    const cfg = GAME_CONFIG[players.length];
    const missionIdx = room.currentMissionIndex || 0;

    const byName = {};
    players.forEach(p => byName[p.name] = p);

    // miniatura da trilha
    const trackHolder = document.createElement('div');
    buildMissionTrack(trackHolder, cfg.missions, room.missionResults || {}, missionIdx,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, -1);

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track">${trackHolder.innerHTML}</div></div>
        <h1 class="tela-h1" style="color:var(--accent)">${t('screen_mission_title')}</h1>
        <p class="tela-sub" style="color:#fff">${t('screen_mission_sub')}</p>
        <p class="screen-dust">· · · ${t('screen_mission_dust')} · · ·</p>
        <div class="screen-mission-center">
            <div class="screen-agents" id="screen-agents"></div>
            <div class="screen-status-line" id="screen-mission-status">0 ${t('screen_of')} ${team.length} ${t('screen_agents_decided')}</div>
        </div>`;

    // agentes em missão
    const agentsEl = document.getElementById('screen-agents');
    team.forEach(name => {
        const av = (byName[name] && byName[name].avatar) || 'avatars/avatar1.png';
        const div = document.createElement('div');
        div.className = 'screen-agent';
        div.dataset.name = name;
        div.innerHTML = `<div class="ag-av"><img src="${av}"><div class="ag-badge ag-think">…</div></div><span class="ag-name">${name}</span>`;
        agentsEl.appendChild(div);
    });

    // monitora as escolhas (sem revelar O QUE cada um escolheu, só SE escolheu)
    db.ref('rooms/' + code + '/missionChoices').off();
    db.ref('rooms/' + code + '/missionChoices').on('value', snap => {
        const choices = snap.val() || {};
        const decided = Object.keys(choices);
        const statusEl = document.getElementById('screen-mission-status');
        if (statusEl) statusEl.innerText = `${decided.length} ${t('screen_of')} ${team.length} ${t('screen_agents_decided')}`;
        // marca quem já decidiu
        document.querySelectorAll('.screen-agent').forEach(el => {
            if (decided.includes(el.dataset.name)) {
                el.classList.add('decided');
                const badge = el.querySelector('.ag-badge');
                if (badge) { badge.classList.remove('ag-think'); badge.classList.add('ag-check'); badge.innerText = '✓'; }
            }
        });

        // TELÃO é o juiz: quando todos decidiram, processa o resultado
        if (team.length > 0 && decided.length >= team.length) {
            db.ref('rooms/' + code + '/missionChoices').off();
            const sabotages = Object.values(choices).filter(c => c === 'sabotage').length;
            db.ref('rooms/' + code + '/missionResult').set({ sabotages, missionIndex: missionIdx, total: team.length });
            db.ref('rooms/' + code + '/status').set('missionResult');
        }
    });
}

// ============================================
// TELÃO — RESULTADO DA MISSÃO (mostra e avança; é o juiz)
// ============================================
let _screenMissionResolved = false;
function renderScreenMissionResult(code, room) {
    if (_screenMissionResolved) return;
    _screenMissionResolved = true;
    _screenMissionShown = false; // libera para a próxima missão

    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = Object.values(room.players);
    const cfg = GAME_CONFIG[players.length];
    const result = room.missionResult || { sabotages: 0, missionIndex: room.currentMissionIndex || 0, total: 0 };
    const missionIdx = result.missionIndex || 0;
    const sabotages = result.sabotages || 0;
    const total = result.total || cfg.missions[missionIdx];

    // quantas sabotagens são necessárias (missão 4 com 7+ jogadores pede 2)
    const failsRequired = (cfg.twoFailsRequired === missionIdx) ? 2 : 1;
    const missionSuccess = sabotages < failsRequired;

    // luz: azul sucesso, vermelho falha
    setLight(missionSuccess ? 'blue' : 'red');

    // miniatura da trilha (com o resultado já aplicado)
    const mResults = Object.assign({}, room.missionResults || {});
    mResults[missionIdx] = missionSuccess;
    const trackHolder = document.createElement('div');
    buildMissionTrack(trackHolder, cfg.missions, mResults, missionIdx,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, missionIdx);

    const outcomeColor = missionSuccess ? 'var(--law)' : 'var(--outlaw)';
    const outcomeTxt = missionSuccess ? t('mission_success') : t('mission_failed');

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track">${trackHolder.innerHTML}</div></div>
        <div class="screen-mr-center">
            <h1 class="screen-mr-title" style="color:${outcomeColor}">${missionSuccess ? '★' : '☠'} ${outcomeTxt}</h1>
            <div class="screen-mr-sabotage">
                <span class="mr-sab-num" style="color:${outcomeColor}">${sabotages}</span>
                <span class="mr-sab-label">${sabotages === 1 ? t('one_sabotage') : t('n_sabotages')}</span>
            </div>
        </div>`;

    // avança automaticamente após 5 segundos
    setTimeout(() => {
        const winsLaw    = Object.values(mResults).filter(r => r === true).length;
        const winsOutlaw = Object.values(mResults).filter(r => r === false).length;
        const names = Object.keys(room.players);
        const curIdx = room.currentSheriffIndex || 0;
        const nextIdx = (curIdx + 1) % names.length;

        const updates = {
            missionChoices: null,
            proposedTeam:   null,
            missionResult:  null,
            pickEndTime:    null,
            voteEndTime:    null,
            [`missionResults/${missionIdx}`]: missionSuccess,
            currentSheriffName:  names[nextIdx],
            currentSheriffIndex: nextIdx,
        };
        if (winsLaw >= 3) {
            updates['status'] = (room.extras && room.extras.roles) ? 'boss_assassination' : 'gameover_law';
        } else if (winsOutlaw >= 3) {
            updates['status'] = 'gameover_outlaw_missions';
        } else {
            setLight('orange');
            updates['currentMissionIndex'] = missionIdx + 1;
            if ((missionIdx === 1 || missionIdx === 2) && room.extras && room.extras.revolver && room.revolverOwnerName) {
                updates['status'] = 'duel_choose';
                updates['currentMissionIndex'] = missionIdx;
            } else {
                updates['status'] = 'board';
            }
        }
        db.ref('rooms/' + code).update(updates);
        setTimeout(() => { _screenMissionResolved = false; }, 1500);
    }, 5000);
}

// Placeholders das telas restantes (próxima fatia)
// ============================================
// TELÃO — DUELO (suspense; o resultado secreto fica no celular do atirador)
// ============================================
function renderScreenDuel(code, room) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const owner = room.revolverOwnerName || '';
    const duel = room.duel || null;

    if (!duel) {
        // fase de escolha: o dono do revólver decide quem desafiar
        content.innerHTML = `
            <div class="tela-top">
                <div class="tela-brand">★ SALOON ★</div>
                <div class="tela-code">SALA ${code}</div>
            </div>
            <div class="screen-duel-center">
                <div class="screen-duel-icon"><img src="images/revolver.png"></div>
                <h1 class="tela-h1" style="color:var(--accent)">${t('screen_duel_title')}</h1>
                <p class="tela-sub" style="color:#fff">${t('screen_duel_choose_sub', { name: owner })}</p>
                <p class="screen-dust">· · · ${t('screen_duel_dust')} · · ·</p>
            </div>`;
    } else {
        // fase de ação: atirar ou recuar
        content.innerHTML = `
            <div class="tela-top">
                <div class="tela-brand">★ SALOON ★</div>
                <div class="tela-code">SALA ${code}</div>
            </div>
            <div class="screen-duel-center">
                <div class="screen-duel-faceoff">
                    <span class="duel-name">${duel.shooterName}</span>
                    <div class="screen-duel-icon"><img src="images/revolver.png"></div>
                    <span class="duel-name">${duel.targetName}</span>
                </div>
                <h1 class="tela-h1" style="color:var(--outlaw)">${t('screen_duel_faceoff_title')}</h1>
                <p class="tela-sub" style="color:#fff">${t('screen_duel_faceoff_sub')}</p>
                <p class="screen-dust">· · · ${t('screen_duel_dust')} · · ·</p>
            </div>`;
    }
}

// Resultado do duelo no telão: neutro (o segredo do time fica no celular do atirador)
function renderScreenDuelResult(code, room) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const result = room.duelResult || {};
    const sShoot = result.shooterAction === 'shoot';
    const tShoot = result.targetAction === 'shoot';
    let txt;
    if (sShoot && tShoot) txt = t('duel_both_shot');
    else if (!sShoot && !tShoot) txt = t('duel_both_down');
    else txt = t('duel_mixed');

    setLight('red');
    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="screen-duel-center">
            <div class="screen-duel-icon" style="animation:none">💥</div>
            <h1 class="tela-h1" style="color:var(--outlaw)">${t('screen_duel_done')}</h1>
            <p class="tela-sub" style="color:#fff">${txt.replace(/<[^>]+>/g, '')}</p>
            <p class="screen-dust">· · · ${t('screen_duel_resolved')} · · ·</p>
        </div>`;
    setTimeout(() => setLight('orange'), 2000);
}
// ============================================
// TELÃO — ADIVINHAÇÃO DO CHEFE (suspense)
// O Chefe mira no celular; o telão mostra o suspense sem revelar.
// ============================================
function renderScreenBossAssassination(code, room) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="screen-boss-center">
            <div class="screen-boss-icon">${suitSVG('BOSS')}</div>
            <h1 class="tela-h1" style="color:var(--outlaw)">${t('screen_boss_title')}</h1>
            <p class="tela-sub" style="color:#fff">${t('screen_boss_sub')}</p>
            <p class="screen-dust">· · · ${t('screen_boss_dust')} · · ·</p>
        </div>`;
}

// ============================================
// TELÃO — FIM DE JOGO (revela todos os papéis)
// ============================================
function renderScreenGameOver(code, room, status) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = Object.values(room.players);

    // determina o vencedor e a razão
    let winner, reason;
    if (status === 'gameover_law') { winner = 'LAW'; reason = t('win_law_missions'); }
    else if (status === 'gameover_outlaw') { winner = 'OUTLAW'; reason = t('win_outlaw_rejects'); }
    else if (status === 'gameover_outlaw_missions') { winner = 'OUTLAW'; reason = t('win_outlaw_missions'); }
    else if (status === 'gameover_boss_win') { winner = 'OUTLAW'; reason = t('win_boss_shot'); }
    else if (status === 'gameover_boss_fail') { winner = 'LAW'; reason = t('win_boss_missed'); }
    else { winner = 'LAW'; reason = ''; }

    setLight(winner === 'LAW' ? 'blue' : 'red');

    const winnerColor = winner === 'LAW' ? 'var(--law)' : 'var(--outlaw)';
    const winnerTxt = winner === 'LAW' ? t('law_wins') : t('outlaw_wins');

    // monta as duas colunas de jogadores com papéis revelados
    function playerRow(p) {
        let suitKey = p.role, tag = '';
        if (p.isBoss) { suitKey = 'BOSS'; tag = t('tag_boss'); }
        else if (p.isDelegado) { suitKey = 'DELEGADO'; tag = t('tag_delegado'); }
        else if (p.isEscrivao) { suitKey = 'ESCRIVAO'; tag = t('tag_escrivao'); }
        else if (p.isFalsificador) { suitKey = 'FALSIFICADOR'; tag = t('tag_falsificador'); }
        const av = p.avatar || 'avatars/avatar1.png';
        const tagHtml = tag ? `<span class="sgo-tag">${tag.trim()}</span>` : '';
        return `<div class="sgo-row ${p.role === 'LAW' ? 'law' : 'outlaw'}">
            <div class="sgo-av"><img src="${av}"></div>
            <span class="sgo-name">${p.name}</span>${tagHtml}
            <span class="sgo-suit">${suitSVG(suitKey)}</span>
        </div>`;
    }
    const lawRows = players.filter(p => p.role === 'LAW').map(playerRow).join('');
    const outRows = players.filter(p => p.role === 'OUTLAW').map(playerRow).join('');

    content.innerHTML = `
        <div class="tela-top">
            <div class="tela-brand">★ SALOON ★</div>
            <div class="tela-code">SALA ${code}</div>
        </div>
        <div class="screen-gameover">
            <h1 class="sgo-title" style="color:${winnerColor}">${winnerTxt}</h1>
            <p class="sgo-reason">${reason}</p>
            <div class="sgo-cols">
                <div class="sgo-col">
                    <div class="sgo-head" style="color:var(--law)">${t('team_law')}</div>
                    ${lawRows}
                </div>
                <div class="sgo-col">
                    <div class="sgo-head" style="color:var(--outlaw)">${t('team_outlaws')}</div>
                    ${outRows}
                </div>
            </div>
            <button id="btn-screen-newgame" class="btn btn-neon-red lg">${t('screen_new_game')}</button>
        </div>`;

    // botão de nova partida: volta todos ao lobby
    const newBtn = document.getElementById('btn-screen-newgame');
    if (newBtn) {
        newBtn.onclick = () => {
            // reseta a sala para o lobby, mantendo os jogadores
            const resetUpdates = {
                status: 'waiting', votes: null, proposedTeam: null, missionChoices: null,
                missionResult: null, missionResults: null, voteEndTime: null,
                currentMissionIndex: 0, rejectedTeams: 0,
                delegadoName: null, delegadoTargetName: null, escrivaoName: null,
                escrivaoNames: null, falsificadorName: null, revolverOwnerName: null
            };
            // limpa os papéis de cada jogador
            const players2 = room.players || {};
            Object.keys(players2).forEach(name => {
                resetUpdates[`players/${name}/role`] = null;
                resetUpdates[`players/${name}/isBoss`] = false;
                resetUpdates[`players/${name}/isDelegado`] = false;
                resetUpdates[`players/${name}/isEscrivao`] = false;
                resetUpdates[`players/${name}/isFalsificador`] = false;
            });
            db.ref('rooms/' + code).update(resetUpdates);
            showScreen('screen-screen-lobby');
        };
    }
}

// ============================================
// CELULAR — cronômetro pequeno do Xerife (sincronizado com o telão)
// ============================================
function showPhonePickTimer(code) {
    db.ref('rooms/' + code + '/pickEndTime').once('value').then(snap => {
        let endTime = snap.val();
        if (!endTime) return;
        let pill = document.getElementById('phone-pick-timer');
        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'phone-pick-timer';
            pill.className = 'phone-mini-timer';
            const area = document.getElementById('online-sheriff-area');
            if (area) area.insertBefore(pill, area.firstChild);
        }
        pill.style.display = 'block';
        if (window._phonePickRAF) cancelAnimationFrame(window._phonePickRAF);
        function tick() {
            const remaining = Math.max(0, endTime - Date.now());
            const secs = Math.ceil(remaining / 1000);
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            if (pill) pill.innerText = `⏱ ${m}:${s.toString().padStart(2, '0')}`;
            if (remaining <= 0) { if (pill) pill.style.display = 'none'; return; }
            window._phonePickRAF = requestAnimationFrame(tick);
        }
        tick();
    });
}

// ============================================
// CELULAR — cronômetro pequeno (sincronizado com o telão via voteEndTime)
// ============================================
function showPhoneMiniTimer(code) {
    db.ref('rooms/' + code + '/voteEndTime').once('value').then(snap => {
        const endTime = snap.val();
        if (!endTime) return;
        // cria a pílula do cronômetro no topo da tela de votação, se não existir
        let pill = document.getElementById('phone-mini-timer');
        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'phone-mini-timer';
            pill.className = 'phone-mini-timer';
            const screen = document.getElementById('screen-online-voting');
            if (screen) screen.insertBefore(pill, screen.firstChild);
        }
        pill.style.display = 'block';
        if (window._phoneTimerRAF) cancelAnimationFrame(window._phoneTimerRAF);
        function tick() {
            const remaining = Math.max(0, endTime - Date.now());
            const secs = Math.ceil(remaining / 1000);
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            if (pill) pill.innerText = `⏱ ${m}:${s.toString().padStart(2, '0')}`;
            if (remaining <= 0) { if (pill) pill.style.display = 'none'; return; }
            window._phoneTimerRAF = requestAnimationFrame(tick);
        }
        tick();
    });
}
