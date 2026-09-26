// ============================================
// MODO PARTY — o telão e o resumo dos celulares
// ============================================
// O aparelho que liga o Modo Party vira o TELÃO (isScreenDevice = true):
// mostra a mesa para todo mundo — nunca nada secreto — e é o juiz do tempo
// (xerife e votação). Os jogadores entram pelos próprios celulares e seguem
// a sala pelo online.js; aqui ficam só as telas do telão e o resumo que o
// celular mostra fora da vez.

// Tempos do Modo Party (ms).
const TEMPOS = { escolha: 90000, votacao: 60000, resultadoVotacao: 4000, resultadoMissao: 3500 };

const telaoTopo = (code, meio = '') => `
    <div class="tela-top">
        <div class="tela-brand">★ SALOON ★</div>${meio}
        <div class="tela-code">${t('screen_room')} ${esc(code)}</div>
    </div>`;

// ---- Composição de papéis da partida (para o resumo do celular e nada secreto) ----
// Retorna a lista de papéis que existem na mesa, dado nº de jogadores e expansões.
function composicaoDaMesa(numPlayers, extras) {
    const cfg = GAME_CONFIG[numPlayers];
    if (!cfg) return [];
    const outlaws = cfg.outlaws;
    const law = numPlayers - outlaws;
    const roles = !!(extras && extras.roles);
    const farsante = roles && !!extras.farsante;
    const blocks = [];

    // Lado da Lei
    let lawCommon = law - (roles ? 1 : 0) - (farsante ? 1 : 0);
    for (let i = 0; i < lawCommon; i++) blocks.push('LAW');
    if (roles) blocks.push('DELEGADO');
    if (farsante) blocks.push('ESCRIVAO');

    // Lado dos Fora da Lei
    let outCommon = outlaws - (roles ? 1 : 0) - (farsante ? 1 : 0);
    for (let i = 0; i < outCommon; i++) blocks.push('OUTLAW');
    if (roles) blocks.push('BOSS');
    if (farsante) blocks.push('FALSIFICADOR');

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
    const roomUrl = location.origin + location.pathname + '#' + code;
    try {
        const qr = qrcode(0, 'M');
        qr.addData(roomUrl);
        qr.make();
        holder.innerHTML = qr.createImgTag(8, 8);
        const img = holder.querySelector('img');
        if (img) { img.style.width = '100%'; img.style.height = '100%'; img.style.display = 'block'; img.alt = roomUrl; }
    } catch (e) {
        holder.innerHTML = '';
    }
}

// ============================================
// TELÃO — ESCUTAR A SALA
// ============================================
function listenToRoomAsScreen(code) {
    currentRoom = code;
    isScreenDevice = true;
    myRoleData = null;
    guardaSessao();
    limpaHash();
    showHamburger();
    document.body.classList.add('is-screen');
    document.getElementById('screen-room-code').innerText = code;
    generateRoomQRCode(code);

    document.getElementById('btn-screen-start').onclick = () => {
        avancaSala(code, faseAtual, s => {
            const n = nomesDe(s).length;
            if (s.status !== 'waiting' || n < 5 || n > MAX_ONLINE) return false;
            sorteiaPapeis(s);
        });
    };
    document.getElementById('btn-screen-leave').onclick = async () => {
        if (await perguntar({ titulo: t('screen_leave_title'), texto: t('screen_leave_text'),
                              sim: t('screen_leave_yes'), nao: t('leave_game_no') })) encerraTelao();
    };

    escutaSala(code, sala => {
        if (!sala || !sala.status) return salaSumiu(t('room_closed'));
        salaAtual = sala;
        const fase = chaveDaFase(sala);
        if (fase !== faseAtual) {
            const de = faseAtual;
            faseAtual = fase;
            vivo = {};
            limpaRelogios();
            document.body.classList.remove('suspense-dim');
            routeScreenStatus(code, sala, de);
        }
        telaoAoVivo(code, sala);
    });
}

// Encerrar a sala pelo telão: a partida acaba para todos.
function encerraTelao() {
    const code = currentRoom;
    paraDeEscutar();
    soltaTelaAcesa();
    if (code) db.ref('rooms/' + code).remove();
    currentRoom = null;
    isScreenDevice = false;
    esqueceSessao();
    document.body.classList.remove('is-screen', 'bg-winner-law', 'bg-winner-outlaw', 'suspense-dim');
    showScreen('screen-mode-select', 'volta');
}

// O telão mostra sempre a informação pública; nunca nada secreto.
function routeScreenStatus(code, sala, de) {
    const st = sala.status;
    if (st === 'waiting')            return showScreen('screen-screen-lobby');
    if (st === 'revealing')          return renderScreenRevealing(code, sala);
    if (st === 'board')              return renderScreenBoard(code, sala, de);
    if (st === 'voting')             return renderScreenVoting(code, sala);
    if (st === 'mission')            return renderScreenMission(code, sala);
    if (st === 'missionResult')      return renderScreenMissionResult(code, sala);
    if (st === 'duel_choose' || st === 'duel_action') return renderScreenDuel(code, sala);
    if (st === 'duel_result')        return renderScreenDuelResult(code, sala);
    if (st === 'boss_assassination') return renderScreenBossAssassination(code, sala);
    if (fimDeJogo(st))               return renderScreenGameOver(code, sala);
}

// O que muda dentro da fase: quem entrou, quem está pronto, quem votou...
function telaoAoVivo(code, sala) {
    const st = sala.status, fase = faseAtual;
    const nomes = nomesDe(sala);
    const tenta = (tipo, muda) => {
        if (vivo[tipo]) return;
        vivo[tipo] = true;
        avancaSala(code, fase, muda);
    };
    const texto = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };

    if (st === 'waiting') {
        renderScreenLobbyPlayers(jogadoresDe(sala));
        renderScreenLobbyExpansions(code, sala.extras || {});
        const pode = nomes.length >= 5 && nomes.length <= MAX_ONLINE;
        document.getElementById('btn-screen-start').classList.toggle('hidden', !pode);
        const hint = document.getElementById('screen-min-players');
        hint.classList.toggle('hidden', pode);
        hint.innerText = t('screen_need_players_count', { count: nomes.length });
        return;
    }

    if (st === 'revealing') {
        const faltam = nomes.filter(n => !(sala.ready && sala.ready[n]));
        texto('dealing-ready-count', t('screen_ready_count', { ready: nomes.length - faltam.length, total: nomes.length }));
        texto('dealing-faltam', faltam.length ? t('waiting_for', { names: faltam.join(', ') }) : '');
        if (!faltam.length) tenta('tabuleiro', irAoTabuleiro);
        return;
    }

    if (st === 'voting') {
        if (vivo.resolvida) return;
        const votos = sala.votes || {};
        const faltam = nomes.filter(n => !votos[n]);
        const votaram = nomes.length - faltam.length;
        texto('screen-votes-label', `${votaram} ${t('screen_of')} ${nomes.length} ${t('screen_voted')}`);
        texto('screen-votes-faltam', faltam.length ? t('waiting_for', { names: faltam.join(', ') }) : '');
        document.querySelectorAll('#screen-vote-dots .vote-dot').forEach((d, i) => d.classList.toggle('done', i < votaram));
        if (!faltam.length) resolveVotacaoTelao(code, sala, false);
        return;
    }

    if (st === 'mission') {
        const escolhas = sala.missionChoices || {};
        const equipe = lista(sala.proposedTeam);
        const decididos = equipe.filter(n => escolhas[n]);
        texto('screen-mission-status', `${decididos.length} ${t('screen_of')} ${equipe.length} ${t('screen_agents_decided')}`);
        document.querySelectorAll('.screen-agent').forEach(el => {
            if (!decididos.includes(el.dataset.name) || el.classList.contains('decided')) return;
            el.classList.add('decided');
            const badge = el.querySelector('.ag-badge');
            if (badge) { badge.classList.remove('ag-think'); badge.classList.add('ag-check'); badge.textContent = '✓'; }
        });
        if (equipe.length && decididos.length === equipe.length) tenta('missao', fechaMissao);
        return;
    }

    if (st === 'duel_action') {
        const d = sala.duel;
        if (d && d.shooterAction && d.targetAction) tenta('duelo', fechaDuelo);
    }
}

// ============================================
// TELÃO — LOBBY
// ============================================
function renderScreenLobbyPlayers(players) {
    document.getElementById('screen-lobby-players').innerHTML = players.map(p =>
        `<div class="tela-lobby-player"><div class="tlp-av"><img src="${esc(p.avatar || AVATARES[0])}" alt=""></div><span>${esc(p.name)}</span></div>`
    ).join('');
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
            <img src="${d.img}" class="tec-icon" alt="">
            <div class="tec-text"><span class="tec-title">${d.title}</span><span class="tec-sub">${d.sub}</span>
            ${d.req ? `<span class="tec-req">${t('farsante_req')}</span>` : ''}</div>`;
        div.onclick = () => toggleScreenExpansion(code, d.key);
        cont.appendChild(div);
    });
}

function toggleScreenExpansion(code, key) {
    const ex = (salaAtual && salaAtual.extras) || {};
    if (key === 'farsante' && !ex.roles) {
        // Sem Distintivo, a Farsante não liga: pisca o cartão do Distintivo.
        const dist = document.querySelector('.tela-exp-card');
        if (dist) { dist.classList.add('shake-req'); setTimeout(() => dist.classList.remove('shake-req'), 500); }
        return;
    }
    avancaSala(code, null, s => {
        if (s.status !== 'waiting') return false;
        s.extras = Object.assign({ roles: false, revolver: false, farsante: false }, s.extras);
        if (key === 'farsante' && !s.extras.roles) return false;
        s.extras[key] = !s.extras[key];
        if (key === 'roles' && !s.extras.roles) s.extras.farsante = false;
    });
}

// ============================================
// CELULAR — RESUMO (fora da vez)
// ============================================
function showPhoneSummary(code) {
    const sala = salaAtual;
    if (!sala) return;
    renderPhoneRoles(composicaoDaMesa(nomesDe(sala).length, sala.extras || {}));
    document.getElementById('btn-phone-review-card').onclick = () => mostrarMinhaCarta(code, false);
    showScreen('screen-phone-summary');
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
            <button type="button" class="rb-info" aria-label="${t('more_info')}">i</button>`;
        div.querySelector('.rb-info').onclick = () => openPhoneRoleModal(info.name, papelDesc(suitKey));
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
            <button type="button" class="phone-modal-close"></button></div>`;
        document.body.appendChild(modal);
        modal.querySelector('.phone-modal-close').onclick = () => modal.classList.remove('show');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('show'); };
    }
    modal.querySelector('.phone-modal-close').innerText = t('understood');
    modal.querySelector('h3').innerText = title;
    modal.querySelector('p').innerText = desc;
    modal.classList.add('show');
}

// ============================================
// TELÃO — CARTAS SENDO VISTAS
// ============================================
function renderScreenRevealing(code, sala) {
    const content = document.getElementById('screen-board-content');
    showScreen('screen-screen-board');

    // composição da mesa, separada por time (quantos de cada papel)
    const blocks = composicaoDaMesa(nomesDe(sala).length, sala.extras || {});
    const order = ['LAW', 'DELEGADO', 'ESCRIVAO', 'OUTLAW', 'BOSS', 'FALSIFICADOR'];
    const counts = {};
    blocks.forEach(k => { counts[k] = (counts[k] || 0) + 1; });

    function compRow(suitKey) {
        if (!counts[suitKey]) return '';
        const info = papelInfo(suitKey);
        const cor = info.team === 'law' ? 'var(--law)' : 'var(--outlaw)';
        return `<div class="comp-row">
            <div class="comp-suit">${suitSVG(suitKey)}</div>
            <span class="comp-qtd">${counts[suitKey]}×</span>
            <span class="comp-name" style="color:${cor}">${info.name}</span>
        </div>`;
    }
    const lawRows = order.filter(k => papelInfo(k).team === 'law').map(compRow).join('');
    const outRows = order.filter(k => papelInfo(k).team === 'outlaw').map(compRow).join('');

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="screen-dealing-center">
            <h1 class="tela-h1">${t('screen_dealing_title')}</h1>
            <p class="tela-sub">${t('screen_dealing_sub')}</p>
            <div class="dealing-eyebrow">${t('screen_dealing_comp')}</div>
            <div class="dealing-cols">
                <div class="dealing-col law">
                    <div class="dealing-col-head">${t('dealing_side_law')}</div>
                    ${lawRows}
                </div>
                <div class="dealing-vs">×</div>
                <div class="dealing-col outlaw">
                    <div class="dealing-col-head">${t('dealing_side_outlaw')}</div>
                    ${outRows}
                </div>
            </div>
            <div class="dealing-ready-count" id="dealing-ready-count"></div>
            <p class="tela-faltam" id="dealing-faltam"></p>
        </div>`;
}

// Miniatura da trilha, parada (reusada em várias telas do telão)
function miniTrilha(sala) {
    const cfg = GAME_CONFIG[nomesDe(sala).length];
    const holder = document.createElement('div');
    buildMissionTrack(holder, cfg.missions, sala.missionResults || {}, sala.currentMissionIndex || 0,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, -1);
    return holder.innerHTML;
}

// ============================================
// TELÃO — TABULEIRO (o xerife monta a equipe; o tempo corre)
// ============================================
function renderScreenBoard(code, sala, de) {
    const content = document.getElementById('screen-board-content');
    showScreen('screen-screen-board');
    const cfg = GAME_CONFIG[nomesDe(sala).length];
    const missionIdx = sala.currentMissionIndex || 0;
    const missionSize = cfg.missions[missionIdx];
    const xerife = esc(sala.currentSheriffName || '');
    const rejected = sala.rejectedTeams || 0;
    const rdots = [0, 1, 2, 3, 4].map(i =>
        `<div class="rdot" style="background:${i < rejected ? 'var(--outlaw)' : '#e8d5c0'}"></div>`).join('');
    // Mesmo status de antes: a vez passou porque o tempo do xerife acabou.
    const passou = de && de.split('|')[0] === 'board';

    content.innerHTML = `
        ${telaoTopo(code, '<div class="screen-board-timer" id="screen-pick-timer">' + mmss(TEMPOS.escolha) + '</div>')}
        <div class="screen-mission-info">
            <div class="smi-label">${t('screen_mission_label')} ${missionIdx + 1}</div>
            ${passou ? `<div class="smi-aviso">${t('screen_pick_timeout')}</div>` : ''}
            <div class="smi-lore">${t('screen_sheriff_picks', { name: xerife, size: missionSize })}</div>
        </div>
        <div class="screen-board-grid">
            <div class="screen-card">
                <div class="screen-card-title">${t('screen_track')}</div>
                <div class="screen-track">${miniTrilha(sala)}</div>
            </div>
            <div class="screen-bottom-row">
                <div class="screen-card screen-rejects">
                    <div class="screen-card-title" style="margin:0">${t('rejected_teams_short')}</div>
                    <div class="screen-rejects-label">${rejected} / 5</div>
                    <div class="rdots">${rdots}</div>
                </div>
                <div class="screen-card screen-sheriff">
                    <span class="screen-star">⭐</span>
                    <span class="screen-sheriff-txt">${t('screen_sheriff_label')}: <b>${xerife}</b></span>
                </div>
            </div>
        </div>`;

    // O telão é o juiz do tempo: ao zerar, a vez passa (conta como rejeição).
    let fim = sala.pickEndTime;
    if (!fim) {
        fim = Date.now() + TEMPOS.escolha;
        db.ref('rooms/' + code + '/pickEndTime').set(fim);
    }
    const fase = faseAtual;
    const pinta = () => {
        // O prazo que vale é o da sala (o mesmo que o celular do xerife mostra).
        const prazo = (salaAtual && salaAtual.pickEndTime) || fim;
        const resta = prazo - Date.now();
        const el = document.getElementById('screen-pick-timer');
        if (el) el.textContent = mmss(resta);
        if (resta > 0 || vivo.esgotou) return;
        vivo.esgotou = true;
        avancaSala(code, fase, s => {
            if (s.status !== 'board' || s.pickEndTime !== prazo) return false;
            s.rejectedTeams = (s.rejectedTeams || 0) + 1;
            delete s.proposedTeam;
            delete s.pickEndTime;
            proximoXerife(s);
            s.status = s.rejectedTeams >= 5 ? 'gameover_outlaw' : 'board';
        });
    };
    pinta();
    repete(pinta, 250);
}

// ============================================
// TELÃO — VOTAÇÃO (1 min; ao zerar, a equipe é aprovada)
// O telão é o juiz: conta os votos e resolve.
// ============================================
function renderScreenVoting(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = jogadoresDe(sala);
    const byName = {};
    players.forEach(p => { byName[p.name] = p; });
    const team = lista(sala.proposedTeam);
    const missionIdx = sala.currentMissionIndex || 0;

    const teamHtml = team.map(name => {
        const av = (byName[name] && byName[name].avatar) || AVATARES[0];
        return `<div class="prop-member"><div class="pm-av"><img src="${esc(av)}" alt=""></div><span class="pm-name">${esc(name)}</span></div>`;
    }).join('');

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track">${miniTrilha(sala)}</div></div>
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
                            transform="rotate(-90 50 50)" style="transition: stroke-dashoffset .25s linear"/>
                    </svg>
                    <div class="time-text" id="screen-timer-text">${mmss(TEMPOS.votacao)}</div>
                </div>
                <div class="votes-label" id="screen-votes-label">0 ${t('screen_of')} ${players.length} ${t('screen_voted')}</div>
                <div class="vote-dots" id="screen-vote-dots">${players.map(() => '<div class="vote-dot"></div>').join('')}</div>
                <p class="tela-faltam" id="screen-votes-faltam"></p>
            </div>
        </div>`;

    // O telão marca o fim da votação (uma vez; sobrevive a uma recarga).
    let fim = sala.voteEndTime;
    if (!fim) {
        fim = Date.now() + TEMPOS.votacao;
        db.ref('rooms/' + code + '/voteEndTime').set(fim);
    }
    const pinta = () => {
        if (vivo.resolvida) return;
        const prazo = (salaAtual && salaAtual.voteEndTime) || fim;
        const resta = Math.max(0, prazo - Date.now());
        const arc = document.getElementById('screen-timer-arc');
        const txt = document.getElementById('screen-timer-text');
        if (arc) arc.style.strokeDashoffset = (276.5 * (1 - resta / TEMPOS.votacao)).toFixed(1);
        if (txt) txt.textContent = mmss(resta);
        if (resta <= 0) resolveVotacaoTelao(code, salaAtual, true);
    };
    pinta();
    repete(pinta, 250);
}

// Resolve a votação (todos votaram ou o tempo acabou), uma vez por fase:
// mostra o resultado por alguns segundos e segue.
function resolveVotacaoTelao(code, sala, esgotou) {
    if (vivo.resolvida || !sala) return;
    vivo.resolvida = true;
    const fase = faseAtual;
    renderScreenVoteResult(code, sala, esgotou);
    agenda(() => avancaSala(code, fase, s => aplicaVotacao(s, esgotou)), TEMPOS.resultadoVotacao);
}

function renderScreenVoteResult(code, sala, esgotou) {
    const content = document.getElementById('screen-board-content');
    const nomes = nomesDe(sala);
    const votos = sala.votes || {};
    const yesNames = nomes.filter(n => votos[n] === 'yes');
    const noNames  = nomes.filter(n => votos[n] === 'no');
    const approved = esgotou || yesNames.length >= Math.floor(nomes.length / 2) + 1;

    const outcomeTxt = approved ? t('approved_team') : t('rejected_team');
    const outcomeColor = approved ? 'var(--law)' : 'var(--outlaw)';
    const yesHtml = yesNames.map(n => `<span class="vr-chip yes">${esc(n)}</span>`).join('') || '<span class="vr-none">—</span>';
    const noHtml  = noNames.map(n => `<span class="vr-chip no">${esc(n)}</span>`).join('') || '<span class="vr-none">—</span>';

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="screen-vr-center">
            <h1 class="screen-vr-title" style="color:${outcomeColor}">${outcomeTxt}</h1>
            ${esgotou ? `<p class="tela-sub" style="color:#fff">${t('screen_vote_timeout')}</p>` : ''}
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
}

// ============================================
// TELÃO — MISSÃO EM ANDAMENTO (só mostra QUEM já decidiu, nunca o quê)
// ============================================
function renderScreenMission(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const byName = {};
    jogadoresDe(sala).forEach(p => { byName[p.name] = p; });
    const team = lista(sala.proposedTeam);

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track">${miniTrilha(sala)}</div></div>
        <h1 class="tela-h1" style="color:var(--accent)">${t('screen_mission_title')}</h1>
        <p class="tela-sub" style="color:#fff">${t('screen_mission_sub')}</p>
        <p class="screen-dust">· · · ${t('screen_mission_dust')} · · ·</p>
        <div class="screen-mission-center">
            <div class="screen-agents" id="screen-agents"></div>
            <div class="screen-status-line" id="screen-mission-status">0 ${t('screen_of')} ${team.length} ${t('screen_agents_decided')}</div>
        </div>`;

    const agentsEl = document.getElementById('screen-agents');
    team.forEach(name => {
        const av = (byName[name] && byName[name].avatar) || AVATARES[0];
        const div = document.createElement('div');
        div.className = 'screen-agent';
        div.dataset.name = name;
        div.innerHTML = `<div class="ag-av"><img src="${esc(av)}" alt=""><div class="ag-badge ag-think">…</div></div><span class="ag-name">${esc(name)}</span>`;
        agentsEl.appendChild(div);
    });
}

// ============================================
// TELÃO — RESULTADO DA MISSÃO (a mesma animação das fichas; segue sozinho)
// ============================================
function renderScreenMissionResult(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const cfg = GAME_CONFIG[nomesDe(sala).length];
    const result = sala.missionResult || { sabotages: 0, missionIndex: sala.currentMissionIndex || 0 };
    const missionIdx = result.missionIndex || 0;
    const sabotages = result.sabotages || 0;
    const total = result.total || cfg.missions[missionIdx];
    const missionSuccess = missaoCumprida(sala, result);

    // resultado já aplicado na trilha (a ficha vira)
    const mResults = Object.assign({}, sala.missionResults);
    mResults[missionIdx] = missionSuccess;

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="mini-board"><span class="mb-label">${t('screen_track')}</span>
            <div class="mini-track" id="mr-track"></div></div>
        <div class="screen-mr-result">
            <div class="result-chip-row" id="screen-result-chip-row"></div>
            <div class="sabotage-board" id="screen-sabotage-board">
                <span class="sb-label">${t('n_sabotages')}</span>
                <div class="sb-num" id="screen-mr-sab-count">0</div>
            </div>
            <h1 id="screen-mr-outcome" class="display text-center"></h1>
            <p id="screen-mr-outcome-lore" class="lore-text"></p>
            <button id="screen-mr-next-hidden" class="hidden"></button>
        </div>`;

    // A ficha da missão vira na própria trilha (montada direto na tela,
    // senão a virada acontece numa cópia que ninguém vê).
    buildMissionTrack(document.getElementById('mr-track'), cfg.missions, mResults, missionIdx,
        cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, missionIdx);

    const fase = faseAtual;
    const segue = () => avancaSala(code, fase, aplicaResultadoMissao);
    playMissionResult({
        rowId: 'screen-result-chip-row',
        boardId: 'screen-sabotage-board',
        numId: 'screen-mr-sab-count',
        outcomeId: 'screen-mr-outcome',
        loreId: 'screen-mr-outcome-lore',
        nextBtnId: 'screen-mr-next-hidden',
        sabotages: sabotages,
        total: total,
        missionSuccess: missionSuccess,
        onNext: segue
    });

    // No telão não há botão "próxima rodada": segue sozinho uns segundos
    // depois do veredito, para todos verem.
    const animacao = REDUCED_MOTION ? 0 : 300 + total * 700 + (sabotages > 0 ? 1900 : 0) + 1400;
    agenda(segue, animacao + TEMPOS.resultadoMissao);
}

// ============================================
// TELÃO — DUELO (suspense; o segredo fica no celular de quem desafiou)
// ============================================
function renderScreenDuel(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const duel = sala.status === 'duel_action' ? (sala.duel || {}) : null;

    if (!duel) {
        // o dono do revólver decide quem desafiar
        content.innerHTML = `
            ${telaoTopo(code)}
            <div class="screen-duel-center">
                <div class="screen-duel-icon"><img src="images/revolver.png" alt=""></div>
                <h1 class="tela-h1" style="color:var(--accent)">${t('screen_duel_title')}</h1>
                <p class="tela-sub" style="color:#fff">${t('screen_duel_choose_sub', { name: esc(sala.revolverOwnerName || '') })}</p>
                <p class="screen-dust">· · · ${t('screen_duel_dust')} · · ·</p>
            </div>`;
    } else {
        // atirar ou abaixar a arma
        content.innerHTML = `
            ${telaoTopo(code)}
            <div class="screen-duel-center">
                <div class="screen-duel-faceoff">
                    <span class="duel-name">${esc(duel.shooterName)}</span>
                    <div class="screen-duel-icon"><img src="images/revolver.png" alt=""></div>
                    <span class="duel-name">${esc(duel.targetName)}</span>
                </div>
                <h1 class="tela-h1" style="color:var(--outlaw)">${t('screen_duel_faceoff_title')}</h1>
                <p class="tela-sub" style="color:#fff">${t('screen_duel_faceoff_sub')}</p>
                <p class="screen-dust">· · · ${t('screen_duel_dust')} · · ·</p>
            </div>`;
    }
}

// Resultado do duelo no telão: neutro (o time do alvo fica no celular de quem desafiou)
function renderScreenDuelResult(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const result = sala.duelResult || {};
    const txt = t(DUELO_TEXTO[result.tipo] || 'duel_both_down');
    if (result.tipo !== 'ambos_abaixaram') AudioManager.playSFX('shot');

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="screen-duel-center">
            <div class="screen-duel-icon" style="animation:none">💥</div>
            <h1 class="tela-h1" style="color:var(--outlaw)">${t('screen_duel_done')}</h1>
            <p class="tela-sub" style="color:#fff">${txt.replace(/<[^>]+>/g, ' ')}</p>
            <p class="screen-dust">· · · ${t('screen_duel_resolved')} · · ·</p>
        </div>`;
}

// ============================================
// TELÃO — A ÚLTIMA BALA DO CHEFE (suspense)
// ============================================
function renderScreenBossAssassination(code, sala) {
    showScreen('screen-screen-board');
    document.getElementById('screen-board-content').innerHTML = `
        ${telaoTopo(code)}
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
function renderScreenGameOver(code, sala) {
    showScreen('screen-screen-board');
    const content = document.getElementById('screen-board-content');
    const players = jogadoresDe(sala);
    const [winner, motivo] = DESFECHOS[sala.status] || ['LAW', ''];
    const winnerColor = winner === 'LAW' ? 'var(--law)' : 'var(--outlaw)';
    const winnerTxt = winner === 'LAW' ? t('law_wins') : t('outlaw_wins');
    AudioManager.playSFX(winner === 'LAW' ? 'success' : 'fail');

    function playerRow(p) {
        let suitKey = p.role, tag = '';
        if (p.isBoss) { suitKey = 'BOSS'; tag = t('tag_boss'); }
        else if (p.isDelegado) { suitKey = 'DELEGADO'; tag = t('tag_delegado'); }
        else if (p.isEscrivao) { suitKey = 'ESCRIVAO'; tag = t('tag_escrivao'); }
        else if (p.isFalsificador) { suitKey = 'FALSIFICADOR'; tag = t('tag_falsificador'); }
        const tagHtml = tag ? `<span class="sgo-tag">${tag.replace(/[()]/g, '').trim()}</span>` : '';
        return `<div class="sgo-row ${p.role === 'LAW' ? 'law' : 'outlaw'}">
            <div class="sgo-av"><img src="${esc(p.avatar || AVATARES[0])}" alt=""></div>
            <span class="sgo-name">${esc(p.name)}</span>${tagHtml}
            <span class="sgo-suit">${suitSVG(suitKey)}</span>
        </div>`;
    }
    const lawRows = players.filter(p => p.role === 'LAW').map(playerRow).join('');
    const outRows = players.filter(p => p.role !== 'LAW').map(playerRow).join('');

    content.innerHTML = `
        ${telaoTopo(code)}
        <div class="screen-gameover">
            <h1 class="sgo-title" style="color:${winnerColor}">${winnerTxt}</h1>
            <p class="sgo-reason">${t(motivo)}</p>
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
            <button id="btn-screen-newgame" class="btn btn-primary lg">${t('screen_new_game')}</button>
        </div>`;

    // Nova partida: a sala volta ao lobby com os mesmos jogadores, e os
    // celulares voltam sozinhos para a sala de espera.
    const fase = faseAtual;
    const newBtn = document.getElementById('btn-screen-newgame');
    newBtn.onclick = () => {
        newBtn.disabled = true;
        avancaSala(code, fase, novaPartida);
    };
}
