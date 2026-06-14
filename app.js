// ════════════════════════════════════════════
// SALOON — app.js (redesign)
// Lógica de jogo original preservada.
// Mudanças: i18n via t(), fluxo de revelação com
// carta 3D, transições de câmera, novos sons.
// ════════════════════════════════════════════

// ============================================
// CONFIGURAÇÕES DO JOGO
// ============================================

const GAME_CONFIG = {
    5:  { outlaws: 2, missions: [2, 3, 2, 3, 3], twoFailsRequired: -1 },
    6:  { outlaws: 2, missions: [2, 3, 4, 3, 4], twoFailsRequired: -1 },
    7:  { outlaws: 3, missions: [2, 3, 3, 4, 4], twoFailsRequired: 3 },
    8:  { outlaws: 3, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
    9:  { outlaws: 3, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
    10: { outlaws: 4, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
};

const missionLore = (i) => I18N[LANG].missions_lore[i];

// ============================================
// ESTADO DO JOGO (OFFLINE)
// ============================================

const state = {
    players: [], // { name, role: 'LAW'|'OUTLAW', isDelegado: bool, isBoss: bool }
    config: null,

    extras: { roles: false, revolver: false },
    revolverOwnerIndex: -1,
    revolverPreviousOwnerIndex: -1,
    delegadoTargetIndex: -1,
    bossIndex: -1,
    delegadoIndex: -1,

    currentMissionIndex: 0,
    rejectedTeams: 0,
    missionResults: [null, null, null, null, null],

    currentSheriffIndex: 0,
    currentTeamProposal: [],

    currentPlayerInteractionIndex: 0,
    pendingAction: null, // 'REVEAL' | 'MISSION' | 'DUEL'
    votes: [],
    missionChoices: [],

    duel: {
        shooterIndex: -1,
        targetIndex: -1,
        shooterAction: null,
        targetAction: null,
        stage: 0
    }
};

// ============================================
// PERFIL E SALA ONLINE
// ============================================

let onlineProfile = { name: '', avatar: '' };
let currentRoom = null;

// ============================================
// MENU LATERAL
// ============================================

function showHamburger() {
    const btn = document.getElementById('btn-hamburger');
    if (btn) btn.style.display = 'flex';
}

const SideMenu = {
    isOpen: false,

    open() {
        this.isOpen = true;
        document.getElementById('side-menu-overlay').classList.remove('hidden');
        document.getElementById('side-menu-panel').classList.add('open');
    },

    close() {
        this.isOpen = false;
        document.getElementById('side-menu-overlay').classList.add('hidden');
        document.getElementById('side-menu-panel').classList.remove('open');
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }
};

// ============================================
// GERENCIADOR DE ÁUDIO
// ============================================

const AudioAssets = {
    bgm:     'sounds/bgm.mp3',
    click:   'sounds/click.mp3',
    success: 'sounds/success.mp3',
    fail:    'sounds/fail.mp3',
    shot:    'sounds/shot.wav',
    card:    'sounds/card.wav',
    chip:    'sounds/chip.wav',
    suspense:'sounds/suspense.wav',
    thud:    'sounds/thud.wav'
};

const AudioManager = {
    bgm: null,
    sounds: {},
    isInitialized: false,
    isMuted: false,

    init() {
        if (this.isInitialized) return;
        try {
            this.bgm = new Audio(AudioAssets.bgm);
            this.bgm.loop = true;
            this.bgm.volume = 0.3;
            for (const key in AudioAssets) {
                if (key !== 'bgm') {
                    this.sounds[key] = new Audio(AudioAssets[key]);
                    this.sounds[key].load();
                }
            }
            this.isInitialized = true;
        } catch (e) {
            console.error("AudioManager: Init failed", e);
        }
    },

    toggle() {
        if (!this.isInitialized) this.init();
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('menu-sound-btn');
        if (this.isMuted) {
            if (this.bgm) this.bgm.pause();
            if (btn) btn.innerText = '🔇 ' + t('sound_off');
        } else {
            if (this.bgm) this.bgm.play().catch(e => console.warn("BGM play failed", e));
            if (btn) btn.innerText = '🔊 ' + t('sound_on');
            this.playSFX('click');
        }
    },

    startBGM() {
        if (!this.isInitialized) this.init();
        if (!this.isMuted && this.bgm) {
            this.bgm.play().catch(e => console.warn("BGM play failed", e));
        }
        const btn = document.getElementById('menu-sound-btn');
        if (btn) btn.innerText = this.isMuted ? '🔇 ' + t('sound_off') : '🔊 ' + t('sound_on');
    },

    playSFX(type) {
        if (this.isMuted) return;
        const sfx = this.sounds[type];
        if (sfx) {
            if (type === 'success' || type === 'fail') {
                if (this.bgm) this.bgm.volume = 0.05;
                sfx.onended = () => { if (this.bgm) this.bgm.volume = 0.3; };
            }
            sfx.currentTime = 0;
            sfx.play().catch(e => console.warn("SFX play failed", type, e));
        }
    }
};

// ============================================
// UTILITÁRIOS GERAIS
// ============================================

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    const coloredScreens = [
        'screen-online-role-reveal', 'screen-role-reveal',
        'screen-mission-result', 'screen-online-mission-result',
        'screen-game-over', 'screen-online-game-over'
    ];
    if (!coloredScreens.includes(screenId)) {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    }
    updateTension(screenId);
    SideMenu.close();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showError(msg) {
    document.getElementById('setup-error-msg').innerText = msg;
}

function fadeToBlack(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:black;opacity:0;z-index:9999;transition:opacity 1s ease;';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.style.opacity = '1', 50);
    setTimeout(() => {
        callback();
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 1000);
        }, 500);
    }, 1100);
}

// ── Confirmação de identidade ("Você é fulano?") ──
// Usada antes de revelar cartas, executar missões e duelos.
// Evita o erro clássico do pass-and-play: a pessoa errada abrir a tela.
function showPassConfirm(targetName, titleKey, onYes) {
    showScreen('screen-pass-device');
    const stage = document.querySelector('#screen-pass-device .pass-stage');
    document.getElementById('pass-device-title').innerText = t(titleKey || 'pass_to');
    document.getElementById('pass-device-target').innerText = targetName;
    document.getElementById('pass-device-question').innerHTML = t('are_you', { name: targetName });
    const hint = document.getElementById('pass-hint');
    hint.innerText = '';

    document.getElementById('btn-confirm-no').onclick = () => {
        stage.classList.remove('shake');
        void stage.offsetWidth; // reinicia a animação
        stage.classList.add('shake');
        hint.innerText = t('pass_hint', { name: targetName });
    };
    document.getElementById('btn-reveal-action').onclick = onYes;
}

// ============================================
// INICIALIZAÇÃO DO DOM
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    applyLanguage();

    // Botão do menu lateral (leque de cartas)
    const menuBtn = document.getElementById('btn-hamburger');
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            AudioManager.playSFX('click');
            SideMenu.toggle();
        };
    }

    // Fechar menu ao clicar no overlay
    const overlay = document.getElementById('side-menu-overlay');
    if (overlay) {
        overlay.onclick = () => SideMenu.close();
    }

    // Botões do menu lateral
    document.getElementById('menu-sound-btn').onclick = () => {
        AudioManager.toggle();
    };
    document.getElementById('menu-sound-btn').innerText = '🔊 ' + t('sound_on');

    document.getElementById('menu-tutorial-btn').onclick = () => {
        SideMenu.close();
        showTutorial('GENERAL');
    };

    document.getElementById('menu-home-btn').onclick = () => {
        SideMenu.close();
        if (currentRoom) {
            cleanupRoom(currentRoom);
            currentRoom = null;
        }
        resetOfflineState();
        showScreen('screen-mode-select');
    };

    // Troca de idioma (PT 🇧🇷 / EN 🇺🇸)
    document.querySelectorAll('.lang-opt').forEach(btn => {
        btn.onclick = () => {
            AudioManager.playSFX('chip');
            setLanguage(btn.dataset.lang);
        };
    });

    // Listener global de cliques (sons de feedback: fichas e cliques)
    document.addEventListener('click', (e) => {
        const sel = e.target.closest('.selectable-item');
        if (sel) {
            AudioManager.playSFX('chip');
            return;
        }
        const target = e.target.closest('.btn, .mode-card, .info-btn, button, input[type="submit"], .custom-checkbox');
        if (target && target.id !== 'btn-hamburger' && !target.closest('#side-menu-panel')) {
            AudioManager.playSFX('click');
        }
    }, true);

    showScreen('screen-splash');

    // ---- Splash: primeiro toque inicia BGM e mostra o menu ----
    document.getElementById('screen-splash').onclick = () => {
        AudioManager.startBGM();
        showHamburger();
        showScreen('screen-mode-select');
    };

    // ---- Navegação de telas ----

    // Modo offline
    document.getElementById('btn-mode-offline').onclick   = () => showScreen('screen-setup-players');
    document.getElementById('btn-go-to-advanced').onclick = () => showScreen('screen-setup-advanced');
    document.getElementById('btn-back-to-players').onclick = () => showScreen('screen-setup-players');
    document.getElementById('btn-back-main').onclick       = () => showScreen('screen-mode-select');

    // Modo online
    document.getElementById('btn-mode-online').onclick        = () => showScreen('screen-online-profile');
    document.getElementById('btn-back-from-profile').onclick  = () => showScreen('screen-mode-select');
    document.getElementById('btn-back-to-mode').onclick       = () => showScreen('screen-mode-select');

    // ---- Avatar (Carrossel) ----

    const avatars = [
        'avatars/avatar1.png', 'avatars/avatar2.png', 'avatars/avatar3.png', 'avatars/avatar4.png',
        'avatars/avatar5.png', 'avatars/avatar6.png', 'avatars/avatar7.png', 'avatars/avatar8.png'
    ];
    let avatarIndex = 0;
    onlineProfile.avatar = avatars[0];

    document.getElementById('avatar-prev').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex - 1 + avatars.length) % avatars.length;
        document.getElementById('avatar-display').innerHTML = `<img src="${avatars[avatarIndex]}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        onlineProfile.avatar = avatars[avatarIndex];
    };

    document.getElementById('avatar-next').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex + 1) % avatars.length;
        document.getElementById('avatar-display').innerHTML = `<img src="${avatars[avatarIndex]}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        onlineProfile.avatar = avatars[avatarIndex];
    };

    // ---- Perfil Online ----

    document.getElementById('online-profile-form').onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('online-name-input').value.trim();
        if (!nameInput) return alert(t('fill_name'));
        onlineProfile.name = nameInput;
        showScreen('screen-online-lobby');
    };

    // ---- Criar Sala ----

    document.getElementById('btn-create-room').onclick = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const roomRef = db.ref('rooms/' + code);
        roomRef.set({
            host: onlineProfile.name,
            hostAvatar: onlineProfile.avatar,
            players: {
                [onlineProfile.name]: {
                    name: onlineProfile.name,
                    avatar: onlineProfile.avatar,
                    isHost: true
                }
            },
            status: 'waiting',
            extras: { roles: false, revolver: false }
        }).then(() => {
            currentRoom = code;
            showScreen('screen-online-waiting');
            listenToRoom(code);
        });
    };

    // ---- Entrar em Sala ----

    document.getElementById('btn-join-room').onclick = () => {
        const code = document.getElementById('room-code-input').value.trim().toUpperCase();
        if (!code) return alert(t('type_code'));
        db.ref('rooms/' + code).once('value').then(snapshot => {
            if (!snapshot.exists()) return alert(t('room_not_found'));
            const room = snapshot.val();
            if (room.status !== 'waiting') return alert(t('match_started'));
            db.ref('rooms/' + code + '/players/' + onlineProfile.name).set({
                name: onlineProfile.name,
                avatar: onlineProfile.avatar,
                isHost: false
            }).then(() => {
                currentRoom = code;
                showScreen('screen-online-waiting');
                listenToRoom(code);
            });
        });
    };
});

// ============================================
// LIMPEZA DE SALA
// ============================================

function cleanupRoom(code) {
    if (!code) return;
    db.ref('rooms/' + code + '/players/' + onlineProfile.name).remove();
    db.ref('rooms/' + code).off();
}

function cleanupRoomEntirely(code) {
    if (!code) return;
    db.ref('rooms/' + code).remove();
}

function resetOfflineState() {
    state.players.forEach(p => { p.role = null; p.isBoss = false; p.isDelegado = false; });
    state.currentMissionIndex = 0;
    state.rejectedTeams = 0;
    state.missionResults = [null, null, null, null, null];
    state.currentSheriffIndex = 0;
    state.currentTeamProposal = [];
    state.revolverOwnerIndex = -1;
    state.revolverPreviousOwnerIndex = -1;
    state.bossIndex = -1;
    state.delegadoIndex = -1;
    state.delegadoTargetIndex = -1;
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
}

// ============================================
// OFFLINE — SETUP DE JOGADORES
// ============================================

const TRASH_SVG = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7b2d35" stroke-width="2.4" stroke-linecap="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>`;

document.getElementById('add-player-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('player-name-input');
    const name = input.value.trim();
    if (!name) return;
    if (state.players.length >= 10) return showError(t('max_players'));
    if (state.players.find(p => p.name.toLowerCase() === name.toLowerCase())) return showError(t('name_exists'));
    state.players.push({ name, role: null });
    input.value = "";
    input.focus();
    updateSetupUI();
});

function updateSetupUI() {
    const list = document.getElementById('player-setup-list');
    list.innerHTML = '';
    state.players.forEach((p, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${p.name}</span> <button onclick="removePlayer(${idx})" aria-label="Remover">${TRASH_SVG}</button>`;
        list.appendChild(li);
    });
    const btnGoNext = document.getElementById('btn-go-to-advanced');
    if (state.players.length >= 5 && state.players.length <= 10) {
        btnGoNext.disabled = false;
        showError("");
    } else {
        btnGoNext.disabled = true;
        if (state.players.length > 0) showError(t('min_players'));
    }
}

function removePlayer(idx) {
    state.players.splice(idx, 1);
    updateSetupUI();
}

document.getElementById('btn-start-game').addEventListener('click', () => initializeGame());

// ============================================
// OFFLINE — INICIALIZAÇÃO DA PARTIDA
// ============================================

function initializeGame() {
    const pCount = state.players.length;
    state.config = GAME_CONFIG[pCount];
    state.extras.roles    = document.getElementById('chk-roles').checked;
    state.extras.revolver = document.getElementById('chk-revolver').checked;
    state.currentSheriffIndex = Math.floor(Math.random() * pCount);

    let roles = [];
    for (let i = 0; i < state.config.outlaws; i++) roles.push('OUTLAW');
    for (let i = 0; i < pCount - state.config.outlaws; i++) roles.push('LAW');
    roles = shuffle(roles);
    state.players.forEach((p, i) => { p.role = roles[i]; p.isBoss = false; p.isDelegado = false; });

    if (state.extras.roles) {
        let outlawsIdx = state.players.map((p, i) => p.role === 'OUTLAW' ? i : -1).filter(i => i !== -1);
        let lawIdx     = state.players.map((p, i) => p.role === 'LAW'    ? i : -1).filter(i => i !== -1);
        state.bossIndex = outlawsIdx[Math.floor(Math.random() * outlawsIdx.length)];
        state.players[state.bossIndex].isBoss = true;
        state.delegadoIndex = lawIdx[Math.floor(Math.random() * lawIdx.length)];
        state.players[state.delegadoIndex].isDelegado = true;
        let commonOutlaws = outlawsIdx.filter(i => i !== state.bossIndex);
        state.delegadoTargetIndex = commonOutlaws[Math.floor(Math.random() * commonOutlaws.length)];
    }

    if (state.extras.revolver) {
        state.revolverOwnerIndex = Math.floor(Math.random() * pCount);
        state.revolverPreviousOwnerIndex = -1;
    }

    state.currentPlayerInteractionIndex = 0;
    state.pendingAction = 'REVEAL';
    startInteractionLoop();
}

// ============================================
// OFFLINE — LOOP DE INTERAÇÕES (PASS-AND-PLAY)
// ============================================

function startInteractionLoop() {
    let targetIndex = -1;

    if (state.pendingAction === 'REVEAL') {
        if (state.currentPlayerInteractionIndex >= state.players.length) return endInteractionLoop();
        targetIndex = state.currentPlayerInteractionIndex;
    } else if (state.pendingAction === 'MISSION') {
        if (state.currentPlayerInteractionIndex >= state.currentTeamProposal.length) return endInteractionLoop();
        targetIndex = state.currentTeamProposal[state.currentPlayerInteractionIndex];
    } else if (state.pendingAction === 'DUEL') {
        if (state.duel.stage === 0)      targetIndex = state.duel.shooterIndex;
        else if (state.duel.stage === 1) targetIndex = state.duel.targetIndex;
        else return endInteractionLoop();
    }

    const name = state.players[targetIndex].name;
    // Movimento de câmera sobre a mesa até o próximo jogador
    cinematicTransition(() => {
        showPassConfirm(name, 'pass_to', () => executeInteraction(targetIndex));
    });
}

function executeInteraction(targetIndex) {
    if (state.pendingAction === 'REVEAL')       executeRevealPhase(targetIndex);
    else if (state.pendingAction === 'MISSION') executeMissionPhase(targetIndex);
    else if (state.pendingAction === 'DUEL')    executeDuelActionPhase(targetIndex);
}

function endInteractionLoop() {
    if (state.pendingAction === 'REVEAL')       startBoardTurn();
    else if (state.pendingAction === 'MISSION') showSuspenseScreen();
    else if (state.pendingAction === 'DUEL')    showDuelSuspense();
}

// ============================================
// OFFLINE — REVELAÇÃO DE IDENTIDADE (A CARTA)
// ============================================

// Monta os dados que a carta vai exibir para um jogador offline
function buildOfflineRoleData(playerIdx) {
    const p = state.players[playerIdx];
    const data = {
        team: p.role,
        suitKey: p.isDelegado ? 'DELEGADO' : (p.isBoss ? 'BOSS' : p.role),
        hasRevolver: state.extras.revolver && playerIdx === state.revolverOwnerIndex
    };

    if (p.role === 'LAW') {
        data.name  = p.isDelegado ? t('role_delegado') : t('role_law');
        data.desc1 = t('law_desc1');
        data.desc2 = t('law_desc2');
        if (p.isDelegado) {
            data.delegateHtml = t('delegate_notice', { name: state.players[state.delegadoTargetIndex].name });
        }
    } else {
        data.name  = p.isBoss ? t('role_boss') : t('role_outlaw');
        data.desc1 = t('outlaw_desc1');
        data.desc2 = p.isBoss ? t('boss_desc2') : t('outlaw_desc2');
        data.outlaws = [];
        state.players.forEach((op, opIdx) => {
            if (op.role === 'OUTLAW' && opIdx !== playerIdx) {
                data.outlaws.push(op.name + (op.isBoss ? ' ' + t('boss_tagged') : ''));
            }
        });
    }
    return data;
}

function executeRevealPhase(playerIdx) {
    showScreen('screen-role-reveal');
    const roleData = buildOfflineRoleData(playerIdx);

    runCardScene({
        card:    'reveal-card',
        inner:   'reveal-card-inner',
        face:    'role-card-display',
        btnFlip: 'btn-flip-card',
        btnDone: 'btn-role-understood'
    }, roleData, {
        doneLabelKey: 'hide_card',
        onDone: () => {
            state.currentPlayerInteractionIndex++;
            startInteractionLoop();
        }
    });
}

// ============================================
// OFFLINE — TABULEIRO
// ============================================

function startBoardTurn() {
    showScreen('screen-board');
    updateBoardUI();

    state.currentTeamProposal = [];
    const sheriff = state.players[state.currentSheriffIndex];
    const reqSize = state.config.missions[state.currentMissionIndex];

    document.getElementById('current-sheriff-name').innerText = sheriff.name;
    document.getElementById('mission-size-req').innerText = reqSize;
    document.getElementById('current-mission-num').innerText = state.currentMissionIndex + 1;
    document.getElementById('mission-lore').innerText = missionLore(state.currentMissionIndex);
    document.getElementById('team-selection-area').classList.remove('hidden');
    document.getElementById('waiting-team-area').classList.add('hidden');

    const teamList = document.getElementById('team-select-list');
    teamList.innerHTML = '';
    state.players.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = 'selectable-item';
        div.innerText = p.name;
        div.onclick = () => toggleTeamSelection(idx, div, reqSize);
        teamList.appendChild(div);
    });

    validateTeamSubmitBtn(reqSize);
}

function updateBoardUI() {
    const mContainer = document.getElementById('mission-track-container');
    const newly = (state._justResolvedMission !== undefined) ? state._justResolvedMission : -1;
    state._justResolvedMission = undefined;
    buildMissionTrack(
        mContainer,
        state.config.missions,
        state.missionResults,
        state.currentMissionIndex,
        state.config.twoFailsRequired === undefined ? -1 : state.config.twoFailsRequired,
        newly
    );

    document.getElementById('reject-count').innerText = state.rejectedTeams;
    const rDots = document.getElementById('reject-dots-container');
    rDots.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = "reject-dot";
        dot.innerHTML = rejectChipSVG(i < state.rejectedTeams);
        rDots.appendChild(dot);
    }
}

function toggleTeamSelection(idx, divEl, reqSize) {
    const pos = state.currentTeamProposal.indexOf(idx);
    if (pos >= 0) {
        state.currentTeamProposal.splice(pos, 1);
        divEl.classList.remove('selected');
    } else {
        if (state.currentTeamProposal.length < reqSize) {
            state.currentTeamProposal.push(idx);
            divEl.classList.add('selected');
        }
    }
    validateTeamSubmitBtn(reqSize);
}

function validateTeamSubmitBtn(reqSize) {
    const btn = document.getElementById('btn-submit-team');
    btn.disabled = state.currentTeamProposal.length !== reqSize;
    btn.onclick = () => showGroupVotingPhase();
}

// ============================================
// OFFLINE — VOTAÇÃO EM GRUPO
// ============================================

function showGroupVotingPhase() {
    showScreen('screen-voting');
    const majority = Math.floor(state.players.length / 2) + 1;
    document.getElementById('majority-number').innerText = majority;
    document.getElementById('voting-sheriff-name').innerText = state.players[state.currentSheriffIndex].name;

    const previewList = document.getElementById('voting-team-preview');
    previewList.innerHTML = '';
    state.currentTeamProposal.forEach(tIdx => {
        previewList.innerHTML += `<li><span>${state.players[tIdx].name}</span></li>`;
    });

    document.getElementById('btn-vote-trust-group').onclick    = () => processGroupVote(true);
    document.getElementById('btn-vote-distrust-group').onclick = () => processGroupVote(false);
}

function processGroupVote(approved) {
    if (approved) {
        state.rejectedTeams = 0;
        state.currentPlayerInteractionIndex = 0;
        state.pendingAction = 'MISSION';
        state.missionChoices = [];
        startInteractionLoop();
    } else {
        state.rejectedTeams++;
        if (state.rejectedTeams >= 5) {
            return endGame(t('win_outlaw_rejects'), 'OUTLAW');
        }
        state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
        startBoardTurn();
    }
}

// ============================================
// OFFLINE — EXECUÇÃO DE MISSÃO
// ============================================

function executeMissionPhase(playerIdx) {
    showScreen('screen-mission');
    const p = state.players[playerIdx];
    document.getElementById('mission-player-name').innerText = p.name;

    renderChipTable({
        rowId: 'mission-chip-row',
        warnId: 'mission-law-warning',
        confirmId: 'mission-confirm',
        nextBtnId: 'mission-next-btn',
        isLaw: p.role === 'LAW',
        onChoice: (isSuccess) => { state._pendingMissionChoice = isSuccess; },
        onNext: () => {
            state.missionChoices.push(state._pendingMissionChoice);
            state._pendingMissionChoice = undefined;
            state.currentPlayerInteractionIndex++;
            startInteractionLoop();
        }
    });
}

function submitMission(isSuccess) {
    state.missionChoices.push(isSuccess);
    state.currentPlayerInteractionIndex++;
    startInteractionLoop();
}

function showSuspenseScreen() {
    // O suspense agora está embutido na própria tela de resultado
    // (as fichas caem com rufar antes da vermelha). Vai direto.
    processMission();
}

function processMission() {
    showScreen('screen-mission-result');
    const sabotages = state.missionChoices.filter(c => c === false).length;
    const failsRequired = state.config.twoFailsRequired === state.currentMissionIndex ? 2 : 1;
    const missionSuccess = sabotages < failsRequired;
    state.missionResults[state.currentMissionIndex] = missionSuccess;
    state._justResolvedMission = state.currentMissionIndex;

    playMissionResult({
        rowId: 'result-chip-row',
        boardId: 'sabotage-board',
        numId: 'sabotage-number',
        outcomeId: 'mission-outcome',
        loreId: 'mission-outcome-lore',
        nextBtnId: 'btn-mission-result-next',
        sabotages: sabotages,
        total: state.missionChoices.length,
        missionSuccess: missionSuccess,
        onNext: () => {
            const winsLaw    = state.missionResults.filter(r => r === true).length;
            const winsOutlaw = state.missionResults.filter(r => r === false).length;

            if (winsLaw >= 3) {
                if (state.extras.roles) return showBossAssassination();
                else return endGame(t('win_law_missions'), "LAW");
            } else if (winsOutlaw >= 3) {
                return endGame(t('win_outlaw_missions'), "OUTLAW");
            }

            if ((state.currentMissionIndex === 1 || state.currentMissionIndex === 2) && state.extras.revolver) {
                startDuelChoosePhase();
            } else {
                state.currentMissionIndex++;
                state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
                startBoardTurn();
            }
        }
    });
}

// ============================================
// OFFLINE — SISTEMA DE DUELO
// ============================================

function startDuelChoosePhase() {
    state.duel.shooterIndex = state.revolverOwnerIndex;
    showScreen('screen-duel-choose');
    document.getElementById('duel-owner-name').innerText = t('duel_owner_has', { name: state.players[state.duel.shooterIndex].name });

    const targetsList = document.getElementById('duel-targets-list');
    targetsList.innerHTML = '';
    let targetSelected = -1;

    state.players.forEach((p, idx) => {
        if (idx !== state.duel.shooterIndex && idx !== state.revolverPreviousOwnerIndex) {
            const div = document.createElement('div');
            div.className = 'selectable-item';
            div.innerText = p.name;
            div.onclick = () => {
                const prev = targetsList.querySelector('.selected');
                if (prev) prev.classList.remove('selected');
                div.classList.add('selected');
                targetSelected = idx;
                document.getElementById('btn-challenge').disabled = false;
            };
            targetsList.appendChild(div);
        }
    });

    document.getElementById('btn-challenge').disabled = true;
    document.getElementById('btn-challenge').onclick = () => {
        state.duel.targetIndex = targetSelected;
        state.duel.stage = 0;
        state.pendingAction = 'DUEL';
        startInteractionLoop();
    };

    document.getElementById('btn-skip-duel').onclick = () => {
        state.currentMissionIndex++;
        state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
        startBoardTurn();
    };
}

function executeDuelActionPhase(playerIdx) {
    showScreen('screen-duel-action');
    const isShooter = state.duel.stage === 0;
    document.getElementById('duel-action-title').innerText = isShooter ? t('duel_started_you') : t('duel_challenged');
    document.getElementById('btn-duel-shoot').onclick = () => submitDuelAction(isShooter, true);
    document.getElementById('btn-duel-down').onclick  = () => submitDuelAction(isShooter, false);
}

function submitDuelAction(isShooter, didShoot) {
    // ATENÇÃO: nenhum som aqui — a escolha do duelo é SECRETA.
    // Tocar o tiro neste momento revelaria a decisão do jogador.
    if (isShooter) {
        state.duel.shooterAction = didShoot;
        state.duel.stage = 1;
        startInteractionLoop();
    } else {
        state.duel.targetAction = didShoot;
        state.duel.stage = 2;
        state.revolverPreviousOwnerIndex = state.duel.shooterIndex;
        state.revolverOwnerIndex = state.duel.targetIndex;
        showDuelSuspense();
    }
}

function showDuelSuspense() {
    showScreen('screen-duel-suspense');
    document.getElementById('btn-reveal-duel-result').onclick = () => processDuelResult();
}

function processDuelResult() {
    if (state.duel.shooterAction || state.duel.targetAction) {
        AudioManager.playSFX('shot'); // momento público: o resultado revela quem atirou
    }
    showScreen('screen-duel-result');
    const sShoot = state.duel.shooterAction;
    const tShoot = state.duel.targetAction;
    const resP = document.getElementById('duel-result-text');
    let hasIntimidation = false;

    if (sShoot && tShoot) {
        resP.innerHTML = t('duel_both_shot');
        hasIntimidation = true;
    } else if (!sShoot && !tShoot) {
        resP.innerHTML = t('duel_both_down');
        hasIntimidation = true;
    } else {
        resP.innerHTML = t('duel_mixed');
        hasIntimidation = false;
    }

    document.getElementById('btn-duel-result-next').onclick = () => {
        if (hasIntimidation) {
            const shooterName = state.players[state.duel.shooterIndex].name;
            cinematicTransition(() => {
                showPassConfirm(shooterName, 'confidential_to', () => showDuelReveal(state.duel.targetIndex));
            });
        } else {
            finishDuelEntirely();
        }
    };
}

function showDuelReveal(shownIdx) {
    showScreen('screen-duel-reveal');
    document.getElementById('intimidated-name').innerText = state.players[shownIdx].name;
    const rLabel = document.getElementById('intimidated-role');
    if (state.players[shownIdx].role === 'LAW') {
        rLabel.innerText  = t('law_resistance');
        rLabel.className  = "neon-text blue display";
    } else {
        rLabel.innerText  = t('outlaw_team');
        rLabel.className  = "neon-text red display";
    }
    document.getElementById('btn-duel-understood').onclick = () => {
        finishDuelEntirely();
    };
}

function finishDuelEntirely() {
    state.currentMissionIndex++;
    state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
    startBoardTurn();
}

// ============================================
// OFFLINE — ASSASSINATO DO CHEFE
// ============================================

function showBossAssassination() {
    showScreen('screen-boss-assassination');
    const assassinateList = document.getElementById('assassination-list');
    assassinateList.innerHTML = '';
    let targetSelected = -1;

    state.players.forEach((p, idx) => {
        if (idx !== state.bossIndex) {
            const div = document.createElement('div');
            div.className = 'selectable-item';
            div.innerText = p.name;
            div.onclick = () => {
                const prev = assassinateList.querySelector('.selected');
                if (prev) prev.classList.remove('selected');
                div.classList.add('selected');
                targetSelected = idx;
                document.getElementById('btn-boss-shoot').disabled = false;
            };
            assassinateList.appendChild(div);
        }
    });

    document.getElementById('btn-boss-shoot').onclick = () => {
        if (targetSelected === state.delegadoIndex) {
            AudioManager.playSFX('shot');
            endGame(t('win_boss_shot'), "OUTLAW");
        } else {
            AudioManager.playSFX('shot');
            endGame(t('win_boss_missed'), "LAW");
        }
    };
}

// ============================================
// OFFLINE — FIM DE JOGO
// ============================================

function endGame(reason, winner) {
    showScreen('screen-game-over');
    document.getElementById('game-over-reason').innerText = reason;

    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    if (winner === 'LAW') {
        AudioManager.playSFX('success');
        document.body.classList.add('bg-winner-law');
    } else if (winner === 'OUTLAW') {
        AudioManager.playSFX('fail');
        document.body.classList.add('bg-winner-outlaw');
    }

    const lawUl = document.getElementById('final-law-list');
    const outUl = document.getElementById('final-outlaw-list');
    lawUl.innerHTML = '';
    outUl.innerHTML = '';

    state.players.forEach(p => {
        let title = p.name;
        if (p.isBoss)     title += t('tag_boss');
        if (p.isDelegado) title += t('tag_delegado');
        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li><span>${title}</span></li>`;
        } else {
            outUl.innerHTML += `<li><span>${title}</span> <span style="color:var(--outlaw);font-size:0.95rem;">${t('traitor')}</span></li>`;
        }
    });

    document.getElementById('btn-play-again').onclick = () => {
        resetOfflineState();
        updateSetupUI();
        showScreen('screen-setup-players');
    };
}

// ============================================
// TUTORIAL
// ============================================

let lastScreenId = 'screen-splash';

function showTutorial(type) {
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id !== 'screen-tutorial') {
        lastScreenId = activeScreen.id;
    }
    const contentDiv = document.getElementById('tutorial-content');
    const dict = I18N[LANG].tutorials || I18N.pt.tutorials;
    contentDiv.innerHTML = dict[type] || '';
    showScreen('screen-tutorial');
}

function closeTutorial() {
    showScreen(lastScreenId);
}

// ############################################################
// ##                    LÓGICA ONLINE                       ##
// ############################################################

// ============================================
// ONLINE — SALA DE ESPERA (listenToRoom)
// ============================================

function listenToRoom(code) {
    document.getElementById('room-code-display').innerText = code;

    // Lista de jogadores em tempo real
    db.ref('rooms/' + code + '/players').on('value', snapshot => {
        const players = snapshot.val();
        const list = document.getElementById('waiting-players-list');
        list.innerHTML = '';
        if (players) {
            Object.values(players).forEach(p => {
                list.innerHTML += `<li><span><img src="${p.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;vertical-align:middle;border:2px solid var(--gold-dark);"> ${p.name} ${p.isHost ? '★' : ''}</span></li>`;
            });
            const isHost = players[onlineProfile.name] && players[onlineProfile.name].isHost;
            const count  = Object.keys(players).length;
            const btn    = document.getElementById('btn-start-online-game');
            if (isHost) {
                btn.classList.remove('hidden');
                btn.disabled = count < 5;
                btn.innerText = count < 5 ? t('waiting_players', { count }) : t('start_match');
            } else {
                btn.classList.add('hidden');
            }
        }
    });

    // Mudança de status
    db.ref('rooms/' + code + '/status').on('value', snap => {
        const status = snap.val();
        if (status === 'revealing') {
            fadeToBlack(() => showOnlineRoleReveal(code));
        } else if (status === 'gameover_outlaw') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_outlaw_rejects'));
            });
        } else if (status === 'gameover_law') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', t('win_law_missions'));
            });
        } else if (status === 'gameover_outlaw_missions') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_outlaw_missions'));
            });
        } else if (status === 'boss_assassination') {
            showOnlineBossAssassination(code);
        } else if (status === 'gameover_boss_win') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_boss_shot'));
            });
        } else if (status === 'gameover_boss_fail') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', t('win_boss_missed'));
            });
        } else if (status === 'duel_choose') {
            showOnlineDuelChoose(code);
        }
    });

    // Extras: sincronizar checkboxes em tempo real
    db.ref('rooms/' + code + '/extras').on('value', snap => {
        const extras = snap.val() || { roles: false, revolver: false };
        const chkRoles    = document.getElementById('online-chk-roles');
        const chkRevolver = document.getElementById('online-chk-revolver');
        chkRoles.classList.toggle('checked-visual', !!extras.roles);
        chkRevolver.classList.toggle('checked-visual', !!extras.revolver);
    });

    // Extras: somente host pode alterar
    document.getElementById('online-card-roles').onclick = () => {
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                db.ref('rooms/' + code + '/extras/roles').once('value').then(s => {
                    db.ref('rooms/' + code + '/extras/roles').set(!s.val());
                });
            }
        });
    };

    document.getElementById('online-card-revolver').onclick = () => {
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                db.ref('rooms/' + code + '/extras/revolver').once('value').then(s => {
                    db.ref('rooms/' + code + '/extras/revolver').set(!s.val());
                });
            }
        });
    };

    // Iniciar partida (somente host)
    document.getElementById('btn-start-online-game').onclick = () => {
        const roomRef = db.ref('rooms/' + code);
        roomRef.once('value').then(snap => {
            const room    = snap.val();
            const players = Object.values(room.players);
            const count   = players.length;
            const config  = GAME_CONFIG[count];
            const extras  = room.extras || { roles: false, revolver: false };

            let roles = [];
            for (let i = 0; i < config.outlaws; i++) roles.push('OUTLAW');
            for (let i = 0; i < count - config.outlaws; i++) roles.push('LAW');
            roles = shuffle(roles);

            const updates = {};
            players.forEach((p, i) => {
                updates[`players/${p.name}/role`]       = roles[i];
                updates[`players/${p.name}/isBoss`]     = false;
                updates[`players/${p.name}/isDelegado`] = false;
            });

            if (extras.roles) {
                const outlawIdxs  = players.map((p, i) => roles[i] === 'OUTLAW' ? i : -1).filter(i => i !== -1);
                const lawIdxs     = players.map((p, i) => roles[i] === 'LAW'    ? i : -1).filter(i => i !== -1);
                const bossIdx     = outlawIdxs[Math.floor(Math.random() * outlawIdxs.length)];
                const delegadoIdx = lawIdxs[Math.floor(Math.random() * lawIdxs.length)];
                const commonOuts  = outlawIdxs.filter(i => i !== bossIdx);
                const delegadoTargetIdx = commonOuts[Math.floor(Math.random() * commonOuts.length)];
                updates[`players/${players[bossIdx].name}/isBoss`]         = true;
                updates[`players/${players[delegadoIdx].name}/isDelegado`] = true;
                updates['delegadoTargetName'] = players[delegadoTargetIdx].name;
                updates['delegadoName']       = players[delegadoIdx].name;
            }

            if (extras.revolver) {
                updates['revolverOwnerName']         = players[Math.floor(Math.random() * count)].name;
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
    };

    // Sair da Sala
    document.getElementById('btn-leave-room').onclick = () => {
        cleanupRoom(code);
        currentRoom = null;
        showScreen('screen-online-lobby');
    };
}

// ============================================
// ONLINE — REVELAÇÃO DE IDENTIDADE (A CARTA)
// ============================================

function showOnlineRoleReveal(code) {
    // Cancela o listener da sala de espera para evitar duplicatas
    db.ref('rooms/' + code + '/status').off();

    db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
        const p = snap.val();
        db.ref('rooms/' + code + '/players').once('value').then(allSnap => {
            const allPlayersObj = allSnap.val();
            const count = Object.keys(allPlayersObj).length;

            showScreen('screen-online-role-reveal');

            // Monta os dados da carta deste jogador
            const roleData = {
                team: p.role,
                suitKey: p.isDelegado ? 'DELEGADO' : (p.isBoss ? 'BOSS' : p.role),
                hasRevolver: false
            };
            if (p.role === 'LAW') {
                roleData.name  = p.isDelegado ? t('role_delegado') : t('role_law');
                roleData.desc1 = t('law_desc1');
                roleData.desc2 = t('law_desc2');
            } else {
                roleData.name  = p.isBoss ? t('role_boss') : t('role_outlaw');
                roleData.desc1 = t('outlaw_desc1');
                roleData.desc2 = p.isBoss ? t('boss_desc2') : t('outlaw_desc2');
                roleData.outlaws = [];
                Object.values(allPlayersObj).forEach(op => {
                    if (op.role === 'OUTLAW' && op.name !== onlineProfile.name) {
                        roleData.outlaws.push(op.name + (op.isBoss ? ' ' + t('boss_tagged') : ''));
                    }
                });
            }

            // Dados assíncronos: alvo do delegado e dono do revólver,
            // resolvidos ANTES de lançar a carta na mesa.
            const extraFetches = [];
            if (p.isDelegado) {
                extraFetches.push(
                    db.ref('rooms/' + code + '/delegadoTargetName').once('value').then(s => {
                        if (s.val()) roleData.delegateHtml = t('delegate_notice', { name: s.val() });
                    })
                );
            }
            extraFetches.push(
                db.ref('rooms/' + code + '/revolverOwnerName').once('value').then(s => {
                    roleData.hasRevolver = !!s.val() && s.val() === onlineProfile.name;
                })
            );

            Promise.all(extraFetches).then(() => {
                runCardScene({
                    card:    'online-reveal-card',
                    inner:   'online-reveal-card-inner',
                    face:    'online-role-card-display',
                    btnFlip: 'online-btn-flip-card',
                    btnDone: 'btn-online-understood'
                }, roleData, {
                    doneLabelKey: 'understood',
                    keepCardOnDone: true,
                    onDone: (doneBtn) => {
                        // Toggle de "pronto": marca/desmarca no Firebase
                        const isReady = doneBtn.classList.contains('is-ready');
                        if (!isReady) {
                            doneBtn.classList.add('is-ready');
                            doneBtn.style.opacity = '0.55';
                            doneBtn.innerText = t('waiting_all');
                            db.ref('rooms/' + code + '/ready/' + onlineProfile.name).set(true);
                        } else {
                            doneBtn.classList.remove('is-ready');
                            doneBtn.style.opacity = '1';
                            doneBtn.innerText = t('understood');
                            db.ref('rooms/' + code + '/ready/' + onlineProfile.name).remove();
                        }
                    }
                });
            });

            // Contador de prontos
            db.ref('rooms/' + code + '/ready').on('value', readySnap => {
                const ready = readySnap.val() ? Object.keys(readySnap.val()).length : 0;
                document.getElementById('online-ready-count').innerText = `✓ ${ready}/${count}`;
                if (ready >= count) {
                    db.ref('rooms/' + code + '/ready').off();
                    db.ref('rooms/' + code + '/ready').remove();
                    fadeToBlack(() => {
                        listenToGameStatus(code);
                        showOnlineBoard(code);
                    });
                }
            });
        });
    });
}

// ============================================
// ONLINE — LISTENER DE STATUS DO JOGO
// ============================================

function listenToGameStatus(code) {
    db.ref('rooms/' + code + '/status').off();
    db.ref('rooms/' + code + '/status').on('value', snap => {
        const status = snap.val();
        if (!status) return;

        if (status === 'voting') {
            setTimeout(() => {
                db.ref('rooms/' + code + '/proposedTeam').once('value').then(teamSnap => {
                    db.ref('rooms/' + code + '/currentSheriffName').once('value').then(sheriffSnap => {
                        db.ref('rooms/' + code + '/players').once('value').then(pSnap => {
                            const pCount = Object.keys(pSnap.val()).length;
                            if (teamSnap.val()) {
                                showOnlineVoting(code, teamSnap.val(), sheriffSnap.val(), pCount);
                            }
                        });
                    });
                });
            }, 300);
        } else if (status === 'board') {
            showOnlineBoard(code);
        } else if (status === 'mission') {
            db.ref('rooms/' + code + '/proposedTeam').once('value').then(teamSnap => {
                showOnlineMission(code, teamSnap.val());
            });
        } else if (status === 'missionResult') {
            db.ref('rooms/' + code + '/missionResult').once('value').then(resultSnap => {
                showOnlineMissionResult(code, resultSnap.val());
            });
        } else if (status === 'gameover_outlaw') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_outlaw_rejects'));
            });
        } else if (status === 'gameover_law') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', t('win_law_missions'));
            });
        } else if (status === 'gameover_outlaw_missions') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_outlaw_missions'));
            });
        } else if (status === 'boss_assassination') {
            showOnlineBossAssassination(code);
        } else if (status === 'gameover_boss_win') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', t('win_boss_shot'));
            });
        } else if (status === 'gameover_boss_fail') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', t('win_boss_missed'));
            });
        } else if (status === 'duel_choose') {
            showOnlineDuelChoose(code);
        } else if (status === 'duel_result') {
            db.ref('rooms/' + code + '/duelResult').once('value').then(dSnap => {
                showOnlineDuelResult(code, dSnap.val());
            });
        }
    });
}

// ============================================
// ONLINE — TABULEIRO
// ============================================

function showOnlineBoard(code) {
    db.ref('rooms/' + code).once('value').then(snap => {
        const room         = snap.val();
        const players      = Object.values(room.players);
        const sheriffName  = room.currentSheriffName;
        const missionIndex = room.currentMissionIndex || 0;
        const config       = GAME_CONFIG[players.length];
        const missionSize  = config.missions[missionIndex];
        const isSheriff    = sheriffName === onlineProfile.name;

        showScreen('screen-online-board');

        // Trilha de missões — fichas que viram (verso numerado → frente do resultado)
        const mContainer = document.getElementById('online-mission-track-container');
        const missionResults = room.missionResults || {};
        buildMissionTrack(
            mContainer,
            config.missions,
            missionResults,
            missionIndex,
            config.twoFailsRequired === undefined ? -1 : config.twoFailsRequired,
            -1
        );

        document.getElementById('online-reject-count').innerText = room.rejectedTeams || 0;
        const rDots = document.getElementById('online-reject-dots-container');
        rDots.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'reject-dot';
            dot.innerHTML = rejectChipSVG(i < (room.rejectedTeams || 0));
            rDots.appendChild(dot);
        }

        document.getElementById('online-mission-num').innerText  = missionIndex + 1;
        document.getElementById('online-mission-lore').innerText = missionLore(missionIndex);

        if (isSheriff) {
            document.getElementById('online-sheriff-area').classList.remove('hidden');
            document.getElementById('online-waiting-area').classList.add('hidden');
            document.getElementById('online-sheriff-instruction').innerText =
                t('sheriff_pick_online', { size: missionSize });

            const teamList = document.getElementById('online-team-select-list');
            teamList.innerHTML = '';
            let selectedTeam = [];

            players.forEach(p => {
                const div = document.createElement('div');
                div.className = 'selectable-item';
                div.innerText = p.name;
                div.onclick = () => {
                    const pos = selectedTeam.indexOf(p.name);
                    if (pos >= 0) {
                        selectedTeam.splice(pos, 1);
                        div.classList.remove('selected');
                    } else if (selectedTeam.length < missionSize) {
                        selectedTeam.push(p.name);
                        div.classList.add('selected');
                    }
                    document.getElementById('online-btn-propose').disabled = selectedTeam.length !== missionSize;
                };
                teamList.appendChild(div);
            });

            document.getElementById('online-btn-propose').disabled = true;
            document.getElementById('online-btn-propose').onclick = () => {
                db.ref('rooms/' + code + '/proposedTeam').set(selectedTeam);
                db.ref('rooms/' + code + '/status').set('voting');
            };
        } else {
            document.getElementById('online-sheriff-area').classList.add('hidden');
            document.getElementById('online-waiting-area').classList.remove('hidden');
            document.getElementById('online-waiting-text').innerText =
                t('building_team', { name: sheriffName, num: missionIndex + 1 });
        }
    });
}

// ============================================
// ONLINE — VOTAÇÃO
// ============================================

function showOnlineVoting(code, team, sheriffName, playerCount) {
    showScreen('screen-online-voting');

    const teamList = document.getElementById('online-voting-team');
    teamList.innerHTML = '';
    team.forEach(name => { teamList.innerHTML += `<li><span>${name}</span></li>`; });

    if (onlineProfile.name === sheriffName) {
        db.ref('rooms/' + code + '/votes/' + onlineProfile.name).set('yes');
        document.getElementById('online-vote-area').classList.add('hidden');
        document.getElementById('online-voted-msg').classList.remove('hidden');
    } else {
        document.getElementById('online-vote-area').classList.remove('hidden');
        document.getElementById('online-voted-msg').classList.add('hidden');

        const yesBtn = document.getElementById('online-btn-vote-yes');
        const noBtn  = document.getElementById('online-btn-vote-no');
        const newYes = yesBtn.cloneNode(true);
        const newNo  = noBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYes, yesBtn);
        noBtn.parentNode.replaceChild(newNo, noBtn);

        const registerVote = (vote) => {
            db.ref('rooms/' + code + '/votes/' + onlineProfile.name).set(vote);
            document.getElementById('online-vote-area').classList.add('hidden');
            document.getElementById('online-voted-msg').classList.remove('hidden');
        };
        newYes.onclick = () => registerVote('yes');
        newNo.onclick  = () => registerVote('no');
    }

    // Ouvir votos
    db.ref('rooms/' + code + '/votes').off();
    db.ref('rooms/' + code + '/votes').on('value', votesSnap => {
        const votes = votesSnap.val() || {};
        const count = Object.keys(votes).length;
        document.getElementById('online-votes-count').innerText =
            t('votes_count', { count, total: playerCount });

        if (count >= playerCount) {
            db.ref('rooms/' + code + '/votes').off();
            const yesVotes = Object.values(votes).filter(v => v === 'yes').length;
            const majority = Math.floor(playerCount / 2) + 1;
            const approved = yesVotes >= majority;
            setTimeout(() => showOnlineVoteResult(code, votes, approved, team, playerCount), 800);
        }
    });
}

// ============================================
// ONLINE — RESULTADO DA VOTAÇÃO
// ============================================

function showOnlineVoteResult(code, votes, approved, team, playerCount) {
    showScreen('screen-online-vote-result');

    const yesVotes = Object.entries(votes).filter(([k, v]) => v === 'yes').map(([k]) => k);
    const noVotes  = Object.entries(votes).filter(([k, v]) => v === 'no').map(([k]) => k);

    const outcome = document.getElementById('online-vote-outcome');
    outcome.innerText = approved ? '✅ ' + t('approved_team') : '❌ ' + t('rejected_team');
    outcome.className = 'display text-center ' + (approved ? 'neon-text blue' : 'neon-text red');

    const yesList = document.getElementById('online-yes-list');
    const noList  = document.getElementById('online-no-list');
    yesList.innerHTML = '';
    noList.innerHTML  = '';
    yesVotes.forEach(name => yesList.innerHTML += `<li>${name}</li>`);
    noVotes.forEach(name  => noList.innerHTML  += `<li>${name}</li>`);

    // Só o xerife avança
    db.ref('rooms/' + code + '/currentSheriffName').once('value').then(sheriffSnap => {
        const nextBtn = document.getElementById('online-btn-vote-next');
        const waitMsg = document.getElementById('online-vote-waiting');

        if (sheriffSnap.val() === onlineProfile.name) {
            nextBtn.classList.remove('hidden');
            waitMsg.classList.add('hidden');

            const newBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newBtn, nextBtn);

            newBtn.onclick = () => {
                if (approved) {
                    db.ref('rooms/' + code + '/votes').remove();
                    db.ref('rooms/' + code + '/status').set('mission');
                } else {
                    db.ref('rooms/' + code).once('value').then(snap => {
                        const room        = snap.val();
                        const playerNames = Object.keys(room.players);
                        const currentIdx  = room.currentSheriffIndex || 0;
                        const nextIdx     = (currentIdx + 1) % playerNames.length;
                        const newRejected = (room.rejectedTeams || 0) + 1;

                        const updates = {
                            currentSheriffName:  playerNames[nextIdx],
                            currentSheriffIndex: nextIdx,
                            rejectedTeams:       newRejected,
                            votes:               null,
                            proposedTeam:        null,
                            status: newRejected >= 5 ? 'gameover_outlaw' : 'board'
                        };
                        db.ref('rooms/' + code).update(updates);
                    });
                }
            };
        } else {
            nextBtn.classList.add('hidden');
            waitMsg.classList.remove('hidden');
        }
    });
}

// ============================================
// ONLINE — EXECUÇÃO DE MISSÃO
// ============================================

function showOnlineMission(code, team) {
    const isInTeam = team && team.includes(onlineProfile.name);
    showScreen('screen-online-mission');

    if (isInTeam) {
        document.getElementById('online-mission-action-area').classList.remove('hidden');
        document.getElementById('online-mission-waiting-area').classList.add('hidden');
        document.getElementById('online-mission-player').innerText = onlineProfile.name;
        document.getElementById('online-mission-after').style.opacity = '0';

        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            const isLaw = snap.val() && snap.val().role === 'LAW';
            renderChipTable({
                rowId: 'online-mission-chip-row',
                warnId: 'online-law-warning',
                confirmId: 'online-mission-confirm',
                nextBtnId: 'online-btn-mission-next-hidden', // não usamos botão aqui
                isLaw: isLaw,
                onChoice: (isSuccess) => {
                    db.ref('rooms/' + code + '/missionChoices/' + onlineProfile.name)
                      .set(isSuccess ? 'success' : 'sabotage');
                    // após escolher, mostra "aguardando os outros"
                    setTimeout(() => {
                        document.getElementById('online-mission-after').style.opacity = '1';
                        document.getElementById('online-mission-after').innerText = t('choice_registered');
                    }, REDUCED_MOTION ? 0 : 1100);
                },
                onNext: () => {} // sem avanço manual no online
            });
        });
    } else {
        document.getElementById('online-mission-action-area').classList.add('hidden');
        document.getElementById('online-mission-waiting-area').classList.remove('hidden');
        document.getElementById('online-mission-waiting-text').innerText = t('waiting_mission_result');
    }

    // Quando todos da equipe escolheram, o xerife processa
    db.ref('rooms/' + code + '/missionChoices').off();
    db.ref('rooms/' + code + '/missionChoices').on('value', choicesSnap => {
        const choices = choicesSnap.val() || {};
        if (team && Object.keys(choices).length >= team.length) {
            db.ref('rooms/' + code + '/missionChoices').off();
            db.ref('rooms/' + code + '/currentSheriffName').once('value').then(sheriffSnap => {
                if (sheriffSnap.val() === onlineProfile.name) {
                    const sabotages = Object.values(choices).filter(c => c === 'sabotage').length;
                    db.ref('rooms/' + code + '/currentMissionIndex').once('value').then(mSnap => {
                        const mIdx = mSnap.val() || 0;
                        db.ref('rooms/' + code + '/missionResult').set({ sabotages, missionIndex: mIdx, total: team.length });
                        db.ref('rooms/' + code + '/status').set('missionResult');
                    });
                }
            });
        }
    });
}

// ============================================
// ONLINE — RESULTADO DA MISSÃO
// ============================================

function showOnlineMissionResult(code, result) {
    showScreen('screen-online-mission-result');
    const sabotages  = result.sabotages;
    const missionIdx = result.missionIndex || 0;

    db.ref('rooms/' + code + '/players').once('value').then(pSnap => {
        const pCount = Object.keys(pSnap.val()).length;
        const config = GAME_CONFIG[pCount];
        const failsRequired  = config.twoFailsRequired === missionIdx ? 2 : 1;
        const missionSuccess = sabotages < failsRequired;
        const total = result.total || config.missions[missionIdx];

        const waitEl = document.getElementById('online-mission-result-waiting');
        waitEl.classList.add('hidden'); // só reaparece após a animação, p/ não-xerife

        // Animação de fichas para TODOS; o botão next só para o xerife
        playMissionResult({
            rowId: 'online-result-chip-row',
            boardId: 'online-sabotage-board',
            numId: 'online-mission-sabotage-count',
            outcomeId: 'online-mission-outcome',
            loreId: 'online-mission-outcome-lore',
            nextBtnId: 'online-btn-mission-next',
            sabotages: sabotages,
            total: total,
            missionSuccess: missionSuccess,
            onNext: () => {
                document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
                db.ref('rooms/' + code).once('value').then(snap => {
                    const room = snap.val();
                    const mResults = room.missionResults || {};
                    mResults[missionIdx] = missionSuccess;
                    const winsLaw    = Object.values(mResults).filter(r => r === true).length;
                    const winsOutlaw = Object.values(mResults).filter(r => r === false).length;
                    const playerNames = Object.keys(room.players);
                    const currentIdx  = room.currentSheriffIndex || 0;
                    const nextIdx     = (currentIdx + 1) % playerNames.length;

                    const updates = {
                        missionChoices: null,
                        proposedTeam:   null,
                        missionResult:  null,
                        [`missionResults/${missionIdx}`]: missionSuccess,
                        currentSheriffName:  playerNames[nextIdx],
                        currentSheriffIndex: nextIdx,
                    };
                    if (winsLaw >= 3) {
                        updates['status'] = (room.extras && room.extras.roles) ? 'boss_assassination' : 'gameover_law';
                    } else if (winsOutlaw >= 3) {
                        updates['status'] = 'gameover_outlaw_missions';
                    } else {
                        updates['currentMissionIndex'] = missionIdx + 1;
                        if ((missionIdx === 1 || missionIdx === 2) && room.extras && room.extras.revolver && room.revolverOwnerName) {
                            updates['status'] = 'duel_choose';
                            updates['currentMissionIndex'] = missionIdx;
                        } else {
                            updates['status'] = 'board';
                        }
                    }
                    db.ref('rooms/' + code).update(updates);
                });
            }
        });

        // Quem não é xerife: esconde o botão e mostra "aguardando" após a animação
        db.ref('rooms/' + code + '/currentSheriffName').once('value').then(sheriffSnap => {
            const isSheriff = sheriffSnap.val() === onlineProfile.name;
            const nextBtn = document.getElementById('online-btn-mission-next');
            if (!isSheriff) {
                if (nextBtn) nextBtn.classList.add('hidden');
                // tempo aproximado da animação antes de mostrar o aviso
                const delay = REDUCED_MOTION ? 0 : 2500 + (sabotages > 0 ? 1800 : 0);
                setTimeout(() => waitEl.classList.remove('hidden'), delay);
            } else if (nextBtn) {
                nextBtn.classList.remove('hidden');
            }
        });
    });
}

// ============================================
// ONLINE — DUELO (REVÓLVER)
// ============================================

function showOnlineDuelChoose(code) {
    db.ref('rooms/' + code).once('value').then(snap => {
        const room = snap.val();
        const revolverOwner = room.revolverOwnerName;
        const revolverPrev  = room.revolverPreviousOwnerName || null;
        const isRevolverOwner = revolverOwner === onlineProfile.name;

        showScreen('screen-online-duel-choose');

        document.getElementById('online-duel-owner-name').innerText =
            t('duel_owner_has_online', { name: revolverOwner });

        if (isRevolverOwner) {
            document.getElementById('online-duel-owner-area').classList.remove('hidden');
            document.getElementById('online-duel-waiting-area').classList.add('hidden');

            const players = Object.values(room.players);
            const targetsList = document.getElementById('online-duel-targets-list');
            targetsList.innerHTML = '';
            let targetSelected = null;

            players.forEach(p => {
                if (p.name !== revolverOwner && p.name !== revolverPrev) {
                    const div = document.createElement('div');
                    div.className = 'selectable-item';
                    div.innerText = p.name;
                    div.onclick = () => {
                        const prev = targetsList.querySelector('.selected');
                        if (prev) prev.classList.remove('selected');
                        div.classList.add('selected');
                        targetSelected = p.name;
                        document.getElementById('online-btn-challenge').disabled = false;
                    };
                    targetsList.appendChild(div);
                }
            });

            document.getElementById('online-btn-challenge').disabled = true;
            document.getElementById('online-btn-challenge').onclick = () => {
                db.ref('rooms/' + code + '/duel').set({
                    shooterName: revolverOwner,
                    targetName: targetSelected,
                    shooterAction: null,
                    targetAction: null
                });
                db.ref('rooms/' + code + '/status').set('duel_action');
            };

            document.getElementById('online-btn-skip-duel').onclick = () => {
                db.ref('rooms/' + code + '/currentMissionIndex').once('value').then(mSnap => {
                    const nextMission = (mSnap.val() || 0) + 1;
                    db.ref('rooms/' + code).update({
                        currentMissionIndex: nextMission,
                        status: 'board'
                    });
                });
            };
        } else {
            document.getElementById('online-duel-owner-area').classList.add('hidden');
            document.getElementById('online-duel-waiting-area').classList.remove('hidden');
        }

        // Listener para quando o status mudar
        db.ref('rooms/' + code + '/status').off();
        db.ref('rooms/' + code + '/status').on('value', statusSnap => {
            if (statusSnap.val() === 'duel_action') {
                db.ref('rooms/' + code + '/status').off();
                showOnlineDuelAction(code);
            } else if (statusSnap.val() === 'board' && !isRevolverOwner) {
                // Dono pulou o duelo
                db.ref('rooms/' + code + '/status').off();
                listenToGameStatus(code);
                showOnlineBoard(code);
            }
        });
    });
}

function showOnlineDuelAction(code) {
    db.ref('rooms/' + code + '/duel').once('value').then(duelSnap => {
        const duel = duelSnap.val();
        const isShooter = duel.shooterName === onlineProfile.name;
        const isTarget  = duel.targetName  === onlineProfile.name;

        showScreen('screen-online-duel-action');

        if (isShooter || isTarget) {
            document.getElementById('online-duel-action-area').classList.remove('hidden');
            document.getElementById('online-duel-action-waiting').classList.add('hidden');
            document.getElementById('online-duel-action-title').innerText =
                isShooter ? t('duel_started_you') : t('duel_challenged');

            const shootBtn = document.getElementById('online-btn-duel-shoot');
            const downBtn  = document.getElementById('online-btn-duel-down');
            const newShoot = shootBtn.cloneNode(true);
            const newDown  = downBtn.cloneNode(true);
            shootBtn.parentNode.replaceChild(newShoot, shootBtn);
            downBtn.parentNode.replaceChild(newDown, downBtn);

            const submitDuelChoice = (action) => {
                const field = isShooter ? 'shooterAction' : 'targetAction';
                db.ref('rooms/' + code + '/duel/' + field).set(action);
                document.getElementById('online-duel-action-area').classList.add('hidden');
                document.getElementById('online-duel-action-waiting').classList.remove('hidden');
                // Sem som: a escolha é secreta — o tiro só toca na revelação pública.
            };

            newShoot.onclick = () => submitDuelChoice('shoot');
            newDown.onclick  = () => submitDuelChoice('down');
        } else {
            document.getElementById('online-duel-action-area').classList.add('hidden');
            document.getElementById('online-duel-action-waiting').classList.remove('hidden');
        }

        // Quando ambos escolheram, o atirador processa o resultado
        db.ref('rooms/' + code + '/duel').off();
        db.ref('rooms/' + code + '/duel').on('value', duelUpdSnap => {
            const d = duelUpdSnap.val();
            if (d && d.shooterAction && d.targetAction) {
                db.ref('rooms/' + code + '/duel').off();
                if (duel.shooterName === onlineProfile.name) {
                    const sShoot = d.shooterAction === 'shoot';
                    const tShoot = d.targetAction  === 'shoot';
                    const hasIntimidation = (sShoot === tShoot); // ambos iguais = intimidação

                    db.ref('rooms/' + code).update({
                        duelResult: {
                            shooterName: d.shooterName,
                            targetName:  d.targetName,
                            shooterAction: d.shooterAction,
                            targetAction:  d.targetAction,
                            hasIntimidation
                        },
                        revolverOwnerName:         d.targetName,
                        revolverPreviousOwnerName: d.shooterName,
                        status: 'duel_result'
                    });
                }
            }
        });

        // Escutar status
        db.ref('rooms/' + code + '/status').off();
        db.ref('rooms/' + code + '/status').on('value', stSnap => {
            if (stSnap.val() === 'duel_result') {
                db.ref('rooms/' + code + '/status').off();
                db.ref('rooms/' + code + '/duelResult').once('value').then(drSnap => {
                    showOnlineDuelResult(code, drSnap.val());
                });
            }
        });
    });
}

function showOnlineDuelResult(code, result) {
    showScreen('screen-online-duel-result');

    if (result.shooterAction === 'shoot' || result.targetAction === 'shoot') {
        AudioManager.playSFX('shot'); // momento público
    }

    const sShoot = result.shooterAction === 'shoot';
    const tShoot = result.targetAction  === 'shoot';
    const resP   = document.getElementById('online-duel-result-text');

    if (sShoot && tShoot)        resP.innerHTML = t('duel_both_shot');
    else if (!sShoot && !tShoot) resP.innerHTML = t('duel_both_down');
    else                         resP.innerHTML = t('duel_mixed');

    // Se houve intimidação, o atirador vê o time do alvo
    if (result.hasIntimidation && result.shooterName === onlineProfile.name) {
        document.getElementById('online-duel-intimidation-area').classList.remove('hidden');
        db.ref('rooms/' + code + '/players/' + result.targetName).once('value').then(tSnap => {
            const targetPlayer = tSnap.val();
            document.getElementById('online-intimidated-name').innerText = result.targetName;
            const roleLabel = document.getElementById('online-intimidated-role');
            if (targetPlayer.role === 'LAW') {
                roleLabel.innerText = t('law_resistance');
                roleLabel.className = 'neon-text blue display';
            } else {
                roleLabel.innerText = t('outlaw_team');
                roleLabel.className = 'neon-text red display';
            }
        });
    } else {
        document.getElementById('online-duel-intimidation-area').classList.add('hidden');
    }

    const nextBtn = document.getElementById('online-btn-duel-result-next');
    const newBtn  = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newBtn, nextBtn);

    newBtn.onclick = () => {
        // Só o atirador avança o jogo
        if (result.shooterName === onlineProfile.name) {
            db.ref('rooms/' + code + '/currentMissionIndex').once('value').then(mSnap => {
                const nextMission = (mSnap.val() || 0) + 1;
                db.ref('rooms/' + code).update({
                    currentMissionIndex: nextMission,
                    duel: null,
                    duelResult: null,
                    status: 'board'
                });
            });
        } else {
            listenToGameStatus(code);
        }
    };

    // Todos ficam ouvindo o próximo status
    db.ref('rooms/' + code + '/status').off();
    db.ref('rooms/' + code + '/status').on('value', stSnap => {
        if (stSnap.val() === 'board') {
            db.ref('rooms/' + code + '/status').off();
            listenToGameStatus(code);
            showOnlineBoard(code);
        }
    });
}

// ============================================
// ONLINE — ASSASSINATO DO CHEFE
// ============================================

function showOnlineBossAssassination(code) {
    db.ref('rooms/' + code + '/players').once('value').then(snap => {
        const players = Object.values(snap.val());
        const myData  = players.find(p => p.name === onlineProfile.name);
        const isBoss  = myData && myData.isBoss;

        showScreen('screen-online-boss-assassination');

        if (isBoss) {
            document.getElementById('online-boss-action-area').classList.remove('hidden');
            document.getElementById('online-boss-waiting-area').classList.add('hidden');

            const assassinateList = document.getElementById('online-assassination-list');
            assassinateList.innerHTML = '';
            let targetSelected = null;

            players.forEach(p => {
                if (!p.isBoss) {
                    const div = document.createElement('div');
                    div.className = 'selectable-item';
                    div.innerText = p.name;
                    div.onclick = () => {
                        const prev = assassinateList.querySelector('.selected');
                        if (prev) prev.classList.remove('selected');
                        div.classList.add('selected');
                        targetSelected = p.name;
                        document.getElementById('online-btn-boss-shoot').disabled = false;
                    };
                    assassinateList.appendChild(div);
                }
            });

            document.getElementById('online-btn-boss-shoot').disabled = true;
            document.getElementById('online-btn-boss-shoot').onclick = () => {
                AudioManager.playSFX('shot');
                db.ref('rooms/' + code + '/delegadoName').once('value').then(dSnap => {
                    const delegadoName = dSnap.val();
                    const newStatus = targetSelected === delegadoName
                        ? 'gameover_boss_win'
                        : 'gameover_boss_fail';
                    db.ref('rooms/' + code + '/status').set(newStatus);
                });
            };
        } else {
            document.getElementById('online-boss-action-area').classList.add('hidden');
            document.getElementById('online-boss-waiting-area').classList.remove('hidden');
        }
    });
}

// ============================================
// ONLINE — FIM DE JOGO
// ============================================

function showOnlineGameOver(code, room, winner, reason) {
    db.ref('rooms/' + code + '/status').off();
    showScreen('screen-online-game-over');

    document.getElementById('online-game-over-reason').innerText = reason;

    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    if (winner === 'LAW') {
        AudioManager.playSFX('success');
        document.body.classList.add('bg-winner-law');
    } else {
        AudioManager.playSFX('fail');
        document.body.classList.add('bg-winner-outlaw');
    }

    const players = room.players ? Object.values(room.players) : [];
    const lawUl   = document.getElementById('online-final-law-list');
    const outUl   = document.getElementById('online-final-outlaw-list');
    lawUl.innerHTML = '';
    outUl.innerHTML = '';

    players.forEach(p => {
        let title = p.name;
        if (p.isBoss)     title += ' ' + t('tag_boss');
        if (p.isDelegado) title += ' ' + t('tag_delegado');
        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li><span>${title}</span></li>`;
        } else {
            outUl.innerHTML += `<li><span>${title}</span> <span class="neon-text red" style="font-size:0.95rem;">${t('traitor')}</span></li>`;
        }
    });

    const playAgainBtn = document.getElementById('online-btn-play-again');
    const newBtn = playAgainBtn.cloneNode(true);
    playAgainBtn.parentNode.replaceChild(newBtn, playAgainBtn);

    newBtn.onclick = () => {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                cleanupRoomEntirely(code);
            } else {
                cleanupRoom(code);
            }
            currentRoom = null;
            showScreen('screen-online-lobby');
        });
    };

    const menuBtn = document.getElementById('online-btn-back-menu');
    const newMenuBtn = menuBtn.cloneNode(true);
    menuBtn.parentNode.replaceChild(newMenuBtn, menuBtn);

    newMenuBtn.onclick = () => {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                cleanupRoomEntirely(code);
            } else {
                cleanupRoom(code);
            }
            currentRoom = null;
            showScreen('screen-mode-select');
        });
    };
}
