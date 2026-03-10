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

const MISSIONS_LORE = [
    "Missão 1: Escolta da Diligência. O ouro deve chegar intacto.",
    "Missão 2: Defesa do Banco. Há rumores de um assalto pela madrugada.",
    "Missão 3: Investigação no Saloon. Descubra as informações antes que fujam.",
    "Missão 4: Patrulha no Desfiladeiro. Ponto estratégico sendo vigiado.",
    "Missão 5: Defesa Final de Red Rock. Os bandidos estão chegando."
];

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
        // Botão continua visível sobre o painel (z-index maior)
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
    shot:    'sounds/shot.mp3'
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
            if (btn) btn.innerText = '🔇 Som Desativado';
        } else {
            if (this.bgm) this.bgm.play().catch(e => console.warn("BGM play failed", e));
            if (btn) btn.innerText = '🔊 Som Ativado';
            this.playSFX('click');
        }
    },

    startBGM() {
        // Chamado no primeiro toque do usuário
        if (!this.isInitialized) this.init();
        if (!this.isMuted && this.bgm) {
            this.bgm.play().catch(e => console.warn("BGM play failed", e));
        }
        const btn = document.getElementById('menu-sound-btn');
        if (btn) btn.innerText = this.isMuted ? '🔇 Som Desativado' : '🔊 Som Ativado';
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

// ============================================
// INICIALIZAÇÃO DO DOM
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    // Botão hamburguer (menu lateral)
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
    // Estado inicial do botão de som
    document.getElementById('menu-sound-btn').innerText = '🔊 Som Ativado';

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

    // Listener global de cliques (som de feedback)
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .selectable-item, .mode-card, .info-btn, button, input[type="submit"], .custom-checkbox');
        if (target && target.id !== 'btn-hamburger' && !target.closest('#side-menu-panel')) {
            AudioManager.playSFX('click');
        }
    }, true);

    showScreen('screen-splash');

    // ---- Splash: primeiro toque inicia BGM e mostra hamburger ----
    document.getElementById('screen-splash').onclick = () => {
        AudioManager.startBGM();
        showHamburger();
        showScreen('screen-mode-select');
    };

    // ---- Navegação de telas ----

    // Modo offline
    document.getElementById('btn-mode-offline').onclick  = () => showScreen('screen-setup-players');
    document.getElementById('btn-go-to-advanced').onclick = () => showScreen('screen-setup-advanced');
    document.getElementById('btn-back-to-players').onclick = () => showScreen('screen-setup-players');
    document.getElementById('btn-back-main').onclick      = () => showScreen('screen-mode-select');

    // Modo online
    document.getElementById('btn-mode-online').onclick       = () => showScreen('screen-online-profile');
    document.getElementById('btn-back-from-profile').onclick = () => showScreen('screen-mode-select');
    document.getElementById('btn-back-to-mode').onclick      = () => showScreen('screen-mode-select');

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
        if (!nameInput) return alert("Preencha seu nome!");
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
        if (!code) return alert('Digite o código da sala!');
        db.ref('rooms/' + code).once('value').then(snapshot => {
            if (!snapshot.exists()) return alert('Sala não encontrada!');
            const room = snapshot.val();
            if (room.status !== 'waiting') return alert('Esta partida já começou!');
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
    // Remove apenas o jogador atual
    db.ref('rooms/' + code + '/players/' + onlineProfile.name).remove();
    // Cancela todos os listeners
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

document.getElementById('add-player-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('player-name-input');
    const name = input.value.trim();
    if (!name) return;
    if (state.players.length >= 10) return showError("Máximo de 10 jogadores alcançado.");
    if (state.players.find(p => p.name.toLowerCase() === name.toLowerCase())) return showError("Nome já existe.");
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
        li.innerHTML = `<span>${p.name}</span> <button onclick="removePlayer(${idx})"><img src="images/trash.png" style="width: 32px; height: 32px; vertical-align: middle;"></button>`;
        list.appendChild(li);
    });
    const btnGoNext = document.getElementById('btn-go-to-advanced');
    if (state.players.length >= 5 && state.players.length <= 10) {
        btnGoNext.disabled = false;
        showError("");
    } else {
        btnGoNext.disabled = true;
        if (state.players.length > 0) showError("Mínimo de 5 jogadores para iniciar.");
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

    showScreen('screen-pass-device');
    document.getElementById('pass-device-target').innerText = state.players[targetIndex].name;
    document.getElementById('btn-reveal-action').onclick = () => executeInteraction(targetIndex);
}

function executeInteraction(targetIndex) {
    if (state.pendingAction === 'REVEAL')  executeRevealPhase(targetIndex);
    else if (state.pendingAction === 'MISSION') executeMissionPhase(targetIndex);
    else if (state.pendingAction === 'DUEL')    executeDuelActionPhase(targetIndex);
}

function endInteractionLoop() {
    if (state.pendingAction === 'REVEAL')       startBoardTurn();
    else if (state.pendingAction === 'MISSION') showSuspenseScreen();
    else if (state.pendingAction === 'DUEL')    showDuelSuspense();
}

// ============================================
// OFFLINE — REVELAÇÃO DE IDENTIDADE
// ============================================

function executeRevealPhase(playerIdx) {
    showScreen('screen-role-reveal');
    const p = state.players[playerIdx];
    const roleCard = document.getElementById('role-card-display');
    const roleName = document.getElementById('role-name');
    const roleDesc = document.getElementById('role-description');
    const roleDesc2 = document.getElementById('role-description-2');
    const spiesList = document.getElementById('role-spies-list');

    // Reset de todos os blocos condicionais
    document.getElementById('revolver-notice').classList.add('hidden');
    document.getElementById('delegate-notice').classList.add('hidden');
    spiesList.classList.add('hidden');
    roleDesc2.innerText = '';
    roleCard.className = 'role-card ' + (p.role === 'LAW' ? 'law' : 'outlaw');

    if (p.role === 'LAW') {
        if (p.isDelegado) {
            // DELEGADO
            roleName.innerText = 'DELEGADO';
            roleName.className = 'neon-text blue';
            roleDesc.innerText = 'Ajude o Xerife nas missões e descubra quem são os fora da lei.';
            roleDesc2.innerText = 'Você deve cumprir todas as missões que estiver.';

            // Aviso do outlaw conhecido
            document.getElementById('delegate-notice').classList.remove('hidden');
            document.getElementById('delegate-notice-text').innerHTML =
                `<span style="font-weight:900;color:#dc2626;">${state.players[state.delegadoTargetIndex].name}</span> é um fora da lei,<br>mas não deixe claro que você sabe disso...`;
            document.getElementById('delegate-target').innerText = '';
        } else {
            // EQUIPE DA LEI
            roleName.innerText = 'Equipe da Lei';
            roleName.className = 'neon-text blue';
            roleDesc.innerText = 'Ajude o Xerife nas missões e descubra quem são os fora da lei.';
            roleDesc2.innerText = 'Você deve cumprir todas as missões que estiver.';
        }
    } else {
        // OUTLAW
        if (p.isBoss) {
            roleName.innerText = 'Chefe (Fora da Lei)';
        } else {
            roleName.innerText = 'Fora da Lei!';
        }
        roleName.className = 'neon-text red';
        roleDesc.innerText = 'Você está infiltrado na cidade.';
        roleDesc2.innerText = 'Sabote (ou não) as missões sem ser percebido' + (p.isBoss ? ' e descubra o delegado.' : '.');

        // Lista de outros outlaws
        spiesList.classList.remove('hidden');
        const ul = document.getElementById('spies-ul');
        ul.innerHTML = '';
        state.players.forEach((op, opIdx) => {
            if (op.role === 'OUTLAW' && opIdx !== playerIdx) {
                ul.innerHTML += `<li style="color:#dc2626;">${op.name}${op.isBoss ? ' (Chefe)' : ''}</li>`;
            }
        });
    }

    // Revólver — sempre ao final, independente do papel
    if (state.extras.revolver && playerIdx === state.revolverOwnerIndex) {
        document.getElementById('revolver-notice').classList.remove('hidden');
    }

    document.getElementById('btn-role-understood').onclick = () => {
        state.currentPlayerInteractionIndex++;
        startInteractionLoop();
    };
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
    document.getElementById('mission-lore').innerText = MISSIONS_LORE[state.currentMissionIndex];
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
    mContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = "mission-bubble";
        bubble.innerText = state.config.missions[i];
        if (state.missionResults[i] === true)       bubble.classList.add('success');
        else if (state.missionResults[i] === false) bubble.classList.add('fail');
        else if (i === state.currentMissionIndex)   bubble.classList.add('current');
        if (state.config.twoFailsRequired === i)    bubble.innerHTML += `<div class="miss-sub">2 Fails</div>`;
        mContainer.appendChild(bubble);
    }

    document.getElementById('reject-count').innerText = state.rejectedTeams;
    const rDots = document.getElementById('reject-dots-container');
    rDots.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.className = "reject-dot " + (i < state.rejectedTeams ? 'filled' : '');
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
            return endGame("Vitória dos Fora-da-Lei! 5 grupos sucessivos foram rejeitados pela cidade.", 'OUTLAW');
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

    document.getElementById('btn-mission-sabotage').classList.remove('hidden');
    document.getElementById('btn-mission-success').onclick = () => submitMission(true);
    document.getElementById('btn-mission-sabotage').onclick = () => {
        if (p.role === 'LAW') {
            const warning = document.querySelector('#screen-mission .small');
            warning.classList.add('warning-pulse');
            setTimeout(() => warning.classList.remove('warning-pulse'), 800);
            return;
        }
        submitMission(false);
    };
}

function submitMission(isSuccess) {
    state.missionChoices.push(isSuccess);
    state.currentPlayerInteractionIndex++;
    startInteractionLoop();
}

function showSuspenseScreen() {
    showScreen('screen-mission-suspense');
    document.getElementById('btn-reveal-mission-result').onclick = () => processMission();
}

function processMission() {
    showScreen('screen-mission-result');
    const sabotages = state.missionChoices.filter(c => c === false).length;
    const failsRequired = state.config.twoFailsRequired === state.currentMissionIndex ? 2 : 1;
    const missionSuccess = sabotages < failsRequired;

    const outcomeH1  = document.getElementById('mission-outcome');
    const outcomeLore = document.getElementById('mission-outcome-lore');

    if (missionSuccess) {
        AudioManager.playSFX('success');
        document.body.classList.add('bg-winner-law');
        outcomeH1.innerText  = "Missão Bem-sucedida!";
        outcomeH1.className  = "neon-text blue";
        outcomeLore.innerText = "A operação em Red Rock foi concluída.";
    } else {
        AudioManager.playSFX('fail');
        document.body.classList.add('bg-winner-outlaw');
        outcomeH1.innerText  = "Missão Sabotada!";
        outcomeH1.className  = "neon-text red";
        outcomeLore.innerText = "Havia espiões na equipe e a operação falhou!";
    }

    document.getElementById('sabotage-number').innerText = sabotages;
    state.missionResults[state.currentMissionIndex] = missionSuccess;

    document.getElementById('btn-mission-result-next').onclick = () => {
        document.body.classList.remove('bg-winner-outlaw', 'bg-winner-law');
        const winsLaw    = state.missionResults.filter(r => r === true).length;
        const winsOutlaw = state.missionResults.filter(r => r === false).length;

        if (winsLaw >= 3) {
            if (state.extras.roles) return showBossAssassination();
            else return endGame("Vitória da Lei! A cidade de Red Rock foi salva.", "LAW");
        } else if (winsOutlaw >= 3) {
            return endGame("Vitória dos Fora-da-Lei! Red Rock sucumbiu.", "OUTLAW");
        }

        if ((state.currentMissionIndex === 1 || state.currentMissionIndex === 2) && state.extras.revolver) {
            startDuelChoosePhase();
        } else {
            state.currentMissionIndex++;
            state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
            startBoardTurn();
        }
    };
}

// ============================================
// OFFLINE — SISTEMA DE DUELO
// ============================================

function startDuelChoosePhase() {
    state.duel.shooterIndex = state.revolverOwnerIndex;
    showScreen('screen-duel-choose');
    document.getElementById('duel-owner-name').innerText = state.players[state.duel.shooterIndex].name + " possui o revólver.";

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
    document.getElementById('duel-action-title').innerText = isShooter ? "Você iniciou o duelo" : "Você foi desafiado";
    document.getElementById('btn-duel-shoot').onclick = () => submitDuelAction(isShooter, true);
    document.getElementById('btn-duel-down').onclick  = () => submitDuelAction(isShooter, false);
}

function submitDuelAction(isShooter, didShoot) {
    if (isShooter) {
        state.duel.shooterAction = didShoot;
        if (didShoot) AudioManager.playSFX('shot');
        state.duel.stage = 1;
        startInteractionLoop();
    } else {
        state.duel.targetAction = didShoot;
        if (didShoot) AudioManager.playSFX('shot');
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
    showScreen('screen-duel-result');
    const sShoot = state.duel.shooterAction;
    const tShoot = state.duel.targetAction;
    const resP = document.getElementById('duel-result-text');
    let hasIntimidation = false;

    if (sShoot && tShoot) {
        resP.innerHTML = "Ambos atiraram!<br>Por sorte, erraram os tiros.";
        hasIntimidation = true;
    } else if (!sShoot && !tShoot) {
        resP.innerHTML = "Ambos abaixaram as armas.<br>Clima de paz.";
        hasIntimidation = true;
    } else {
        resP.innerHTML = "Uma pessoa atirou e a outra abaixou a arma.<br>Um dos dois foi traiçoeiro.";
        hasIntimidation = false;
    }

    document.getElementById('btn-duel-result-next').onclick = () => {
        if (hasIntimidation) {
            showScreen('screen-pass-device');
            document.getElementById('pass-device-target').innerText = state.players[state.duel.shooterIndex].name;
            document.getElementById('pass-device-title').innerText = "Revelação confidencial para:";
            document.getElementById('btn-reveal-action').onclick = () => showDuelReveal(state.duel.targetIndex);
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
        rLabel.innerText  = "RESISTÊNCIA (Lei)";
        rLabel.className  = "neon-text blue";
    } else {
        rLabel.innerText  = "FORA DA LEI";
        rLabel.className  = "neon-text red";
    }
    document.getElementById('btn-duel-understood').onclick = () => {
        document.getElementById('pass-device-title').innerText = "Passe o celular para:";
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
            endGame("BANG! O Chefe da Gangue assassinou o Delegado antes de fugir! Vitória dos Fora-da-Lei!", "OUTLAW");
        } else {
            endGame("O Chefe atirou na pessoa errada. A cidade executou todos eles! Vitória Incontestável da Lei!", "LAW");
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
        if (p.isBoss)     title += " (CHEFE)";
        if (p.isDelegado) title += " (DELEGADO)";
        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li><span>${title}</span></li>`;
        } else {
            outUl.innerHTML += `<li><span>${title}</span> <span class="neon-text red">Traíra</span></li>`;
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
    let html = '';

    if (type === 'GENERAL') {
        html = `
            <h2 class="text-center" style="margin-top:0">Como Jogar</h2>
            <p><strong>Saloon</strong> é um jogo de dedução social para 5-10 jogadores.</p>
            <p><strong>Objetivo:</strong> A Lei deve completar 3 missões com sucesso. Outlaws devem fazer 3 missões falharem ou causar 5 impasses seguidos.</p>
            <hr style="border:1px dashed #881337">
            <p>1. A cada rodada, um Xerife propõe uma equipe para a missão.</p>
            <p>2. Todos votam (Sim/Não) na equipe proposta.</p>
            <p>3. Se aprovada, a equipe decide secretamente se a missão terá sucesso ou falha.</p>
            <p>4. Se rejeitada, o cargo de Xerife passa para o próximo jogador.</p>
            <p><strong>Atenção:</strong> 5 rejeições seguidas dão vitória imediata aos Outlaws!</p>
        `;
    } else if (type === 'DELEGADO') {
        html = `
            <h2 class="text-center" style="margin-top:0">Delegado e Chefe</h2>
            <p><strong>Delegado (Lei):</strong> Conhece quem são os Fora-da-Lei desde o início, mas deve agir com cautela para não ser identificado.</p>
            <p><strong>Chefe da Gangue (Fora-da-Lei):</strong> É o único Fora-da-Lei que o Delegado NÃO conhece. Ele deve liderar sua gangue pelas sombras.</p>
            <hr style="border:1px dashed #881337">
            <p>Se a Lei vencer as 3 missões, os Fora-da-Lei têm uma chance final: Tentar assassinar o Delegado. Se acertarem, eles roubam a vitória!</p>
        `;
    } else if (type === 'REVOLVER') {
        html = `
            <h2 class="text-center" style="margin-top:0">Revólver Carregado</h2>
            <p>Habilita a mecânica de <strong>Duelo</strong> nas Rodadas 2 e 3.</p>
            <hr style="border:1px dashed #881337">
            <p>O dono do Revólver pode escolher um jogador para um duelo de olhares.</p>
            <p>No duelo, ambos escolhem secretamente: <strong>ATIRAR</strong> ou <strong>ABAIXAR</strong>. Se ambos escolherem o mesmo (atirar/atirar ou abaixar/abaixar), o dono do revólver descobre a lealdade do oponente. Caso contrário, apenas a tensão fica no ar!</p>
            <p>Após o duelo, o revólver passa para o oponente (e não pode ser imediatamente devolvido).</p>
        `;
    }

    contentDiv.innerHTML = html;
    showScreen('screen-tutorial');
}

function closeTutorial() {
    showScreen(lastScreenId);
}

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
                list.innerHTML += `<li><span><img src="${p.avatar}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;vertical-align:middle;"> ${p.name} ${p.isHost ? '👑' : ''}</span></li>`;
            });
            const isHost = players[onlineProfile.name] && players[onlineProfile.name].isHost;
            const count  = Object.keys(players).length;
            const btn    = document.getElementById('btn-start-online-game');
            if (isHost) {
                btn.classList.remove('hidden');
                btn.disabled = count < 5;
                btn.innerText = count < 5 ? `Aguardando jogadores (${count}/5)` : 'Iniciar Partida!';
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
                showOnlineGameOver(code, s.val(), 'OUTLAW', '5 equipes foram rejeitadas! Os Fora-da-Lei vencem!');
            });
        } else if (status === 'gameover_law') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', 'A Lei completou 3 missões! Red Rock está salva!');
            });
        } else if (status === 'gameover_outlaw_missions') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', 'Os Fora-da-Lei sabotaram 3 missões! Red Rock caiu!');
            });
        } else if (status === 'boss_assassination') {
            showOnlineBossAssassination(code);
        } else if (status === 'gameover_boss_win') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', 'BANG! O Chefe assassinou o Delegado! Vitória dos Fora-da-Lei!');
            });
        } else if (status === 'gameover_boss_fail') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', 'O Chefe errou o alvo. Vitória Incontestável da Lei!');
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
        if (extras.roles)    chkRoles.classList.add('checked-visual');
        else                 chkRoles.classList.remove('checked-visual');
        if (extras.revolver) chkRevolver.classList.add('checked-visual');
        else                 chkRevolver.classList.remove('checked-visual');
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
                const outlawIdxs  = players.map((p,i) => roles[i] === 'OUTLAW' ? i : -1).filter(i => i !== -1);
                const lawIdxs     = players.map((p,i) => roles[i] === 'LAW'    ? i : -1).filter(i => i !== -1);
                const bossIdx     = outlawIdxs[Math.floor(Math.random() * outlawIdxs.length)];
                const delegadoIdx = lawIdxs[Math.floor(Math.random() * lawIdxs.length)];
                const commonOuts  = outlawIdxs.filter(i => i !== bossIdx);
                const delegadoTargetIdx = commonOuts[Math.floor(Math.random() * commonOuts.length)];
                updates[`players/${players[bossIdx].name}/isBoss`]          = true;
                updates[`players/${players[delegadoIdx].name}/isDelegado`]  = true;
                updates['delegadoTargetName']  = players[delegadoTargetIdx].name;
                updates['delegadoName']        = players[delegadoIdx].name;
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
// ONLINE — REVELAÇÃO DE IDENTIDADE
// ============================================

function showOnlineRoleReveal(code) {
    // Cancelar listener de status da sala de espera para evitar duplicatas
    db.ref('rooms/' + code + '/status').off();

    db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
        const p = snap.val();
        db.ref('rooms/' + code + '/players').once('value').then(allSnap => {
            const allPlayersObj = allSnap.val();
            const count = Object.keys(allPlayersObj).length;

            showScreen('screen-online-role-reveal');

            document.getElementById('online-role-name').innerText =
                p.isDelegado ? 'DELEGADO' :
                p.isBoss     ? 'Chefe (Fora da Lei)' :
                p.role === 'LAW' ? 'Equipe da Lei' : 'Fora da Lei!';
            document.getElementById('online-role-name').className =
                p.role === 'LAW' ? 'neon-text blue' : 'neon-text red';

            const roleDesc       = document.getElementById('online-role-desc');
            const roleDesc2      = document.getElementById('online-role-desc-2');
            const outlawsList    = document.getElementById('online-outlaws-list');
            const delegateNotice = document.getElementById('online-delegate-notice');
            outlawsList.classList.add('hidden');
            delegateNotice.classList.add('hidden');
            roleDesc2.innerText = '';

            if (p.role === 'LAW') {
                roleDesc.innerText = 'Ajude o Xerife nas missões e descubra quem são os fora da lei.';
                roleDesc2.innerText = 'Você deve cumprir todas as missões que estiver.';
                if (p.isDelegado) {
                    db.ref('rooms/' + code + '/delegadoTargetName').once('value').then(s => {
                        document.getElementById('online-delegate-notice-text').innerHTML =
                            `<span style="font-weight:900;color:#dc2626;">${s.val()}</span> é um fora da lei,<br>mas não deixe claro que você sabe disso...`;
                        document.getElementById('online-delegate-target').innerText = '';
                        delegateNotice.classList.remove('hidden');
                    });
                }
            } else {
                roleDesc.innerText = 'Você está infiltrado na cidade.';
                roleDesc2.innerText = 'Sabote (ou não) as missões sem ser percebido' + (p.isBoss ? ' e descubra o delegado.' : '.');
                outlawsList.classList.remove('hidden');
                const ul = document.getElementById('online-spies-ul');
                ul.innerHTML = '';
                Object.values(allPlayersObj).forEach(op => {
                    if (op.role === 'OUTLAW' && op.name !== onlineProfile.name) {
                        ul.innerHTML += `<li style="color:#dc2626;">${op.name}${op.isBoss ? ' (Chefe)' : ''}</li>`;
                    }
                });
            }

            // Revólver
            db.ref('rooms/' + code + '/revolverOwnerName').once('value').then(rvSnap => {
                const revoNotice = document.getElementById('online-revolver-notice');
                if (rvSnap.val() && rvSnap.val() === onlineProfile.name) {
                    revoNotice.classList.remove('hidden');
                } else {
                    revoNotice.classList.add('hidden');
                }
            });

            // Contador de prontos
            db.ref('rooms/' + code + '/ready').on('value', readySnap => {
                const ready = readySnap.val() ? Object.keys(readySnap.val()).length : 0;
                document.getElementById('online-ready-count').innerText = `✓ ${ready}/${count}`;
                if (ready >= count) {
                    db.ref('rooms/' + code + '/ready').off();
                    db.ref('rooms/' + code + '/ready').remove();
                    fadeToBlack(() => {
                        // Reativar listener de status para o jogo
                        listenToGameStatus(code);
                        showOnlineBoard(code);
                    });
                }
            });

            // Botão "Entendi" com toggle
            const btn = document.getElementById('btn-online-understood');
            // Remove listener anterior para evitar duplicatas
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', () => {
                const isReady = newBtn.classList.contains('is-ready');
                if (!isReady) {
                    newBtn.classList.add('is-ready');
                    newBtn.style.opacity = '0.5';
                    newBtn.innerText = 'Aguardando todos...';
                    db.ref('rooms/' + code + '/ready/' + onlineProfile.name).set(true);
                } else {
                    newBtn.classList.remove('is-ready');
                    newBtn.style.opacity = '1';
                    newBtn.innerText = 'Entendi';
                    db.ref('rooms/' + code + '/ready/' + onlineProfile.name).remove();
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
                showOnlineGameOver(code, s.val(), 'OUTLAW', '5 equipes foram rejeitadas! Os Fora-da-Lei vencem!');
            });
        } else if (status === 'gameover_law') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', 'A Lei completou 3 missões! Red Rock está salva!');
            });
        } else if (status === 'gameover_outlaw_missions') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', 'Os Fora-da-Lei sabotaram 3 missões! Red Rock caiu!');
            });
        } else if (status === 'boss_assassination') {
            showOnlineBossAssassination(code);
        } else if (status === 'gameover_boss_win') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'OUTLAW', 'BANG! O Chefe assassinou o Delegado! Vitória dos Fora-da-Lei!');
            });
        } else if (status === 'gameover_boss_fail') {
            db.ref('rooms/' + code).once('value').then(s => {
                showOnlineGameOver(code, s.val(), 'LAW', 'O Chefe errou o alvo. Vitória Incontestável da Lei!');
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
        const room        = snap.val();
        const players     = Object.values(room.players);
        const sheriffName = room.currentSheriffName;
        const missionIndex = room.currentMissionIndex || 0;
        const config      = GAME_CONFIG[players.length];
        const missionSize = config.missions[missionIndex];
        const isSheriff   = sheriffName === onlineProfile.name;

        showScreen('screen-online-board');

        // Missões
        const mContainer = document.getElementById('online-mission-track-container');
        mContainer.innerHTML = '';
        const missionResults = room.missionResults || {};
        for (let i = 0; i < 5; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'mission-bubble';
            bubble.innerText = config.missions[i];
            if (missionResults[i] === true)       bubble.classList.add('success');
            else if (missionResults[i] === false) bubble.classList.add('fail');
            else if (i === missionIndex)          bubble.classList.add('current');
            if (config.twoFailsRequired === i)    bubble.innerHTML += `<div class="miss-sub">2 Fails</div>`;
            mContainer.appendChild(bubble);
        }

        // Rejeições
        document.getElementById('online-reject-count').innerText = room.rejectedTeams || 0;
        const rDots = document.getElementById('online-reject-dots-container');
        rDots.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'reject-dot ' + (i < (room.rejectedTeams || 0) ? 'filled' : '');
            rDots.appendChild(dot);
        }

        document.getElementById('online-mission-num').innerText  = missionIndex + 1;
        document.getElementById('online-mission-lore').innerText = MISSIONS_LORE[missionIndex];

        if (isSheriff) {
            document.getElementById('online-sheriff-area').classList.remove('hidden');
            document.getElementById('online-waiting-area').classList.add('hidden');
            document.getElementById('online-sheriff-instruction').innerText =
                `Você é o Xerife! Monte uma equipe de ${missionSize} pessoas para a Missão ${missionIndex + 1}.`;

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
                `${sheriffName} está montando a equipe para a Missão ${missionIndex + 1}...`;
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
    team.forEach(name => { teamList.innerHTML += `<li>${name}</li>`; });

    if (onlineProfile.name === sheriffName) {
        db.ref('rooms/' + code + '/votes/' + onlineProfile.name).set('yes');
        document.getElementById('online-vote-area').classList.add('hidden');
        document.getElementById('online-voted-msg').classList.remove('hidden');
    } else {
        document.getElementById('online-vote-area').classList.remove('hidden');
        document.getElementById('online-voted-msg').classList.add('hidden');

        // Clonar botões para remover listeners antigos
        const yesBtn = document.getElementById('online-btn-vote-yes');
        const noBtn  = document.getElementById('online-btn-vote-no');
        const newYes = yesBtn.cloneNode(true);
        const newNo  = noBtn.cloneNode(true);
        yesBtn.parentNode.replaceChild(newYes, yesBtn);
        noBtn.parentNode.replaceChild(newNo, noBtn);

        newYes.onclick = () => {
            db.ref('rooms/' + code + '/votes/' + onlineProfile.name).set('yes');
            document.getElementById('online-vote-area').classList.add('hidden');
            document.getElementById('online-voted-msg').classList.remove('hidden');
        };
        newNo.onclick = () => {
            db.ref('rooms/' + code + '/votes/' + onlineProfile.name).set('no');
            document.getElementById('online-vote-area').classList.add('hidden');
            document.getElementById('online-voted-msg').classList.remove('hidden');
        };
    }

    // Ouvir votos
    db.ref('rooms/' + code + '/votes').off();
    db.ref('rooms/' + code + '/votes').on('value', votesSnap => {
        const votes = votesSnap.val() || {};
        const count = Object.keys(votes).length;
        document.getElementById('online-votes-count').innerText = `${count}/${playerCount} votaram`;

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

    document.getElementById('online-vote-outcome').innerText = approved ? '✅ Equipe Aprovada!' : '❌ Equipe Rejeitada!';
    document.getElementById('online-vote-outcome').className = approved ? 'neon-text blue' : 'neon-text red';

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
                        const nextSheriff = playerNames[nextIdx];
                        const newRejected = (room.rejectedTeams || 0) + 1;

                        const updates = {
                            currentSheriffName:  nextSheriff,
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

        const succBtn = document.getElementById('online-btn-mission-success');
        const sabBtn  = document.getElementById('online-btn-mission-sabotage');
        const newSucc = succBtn.cloneNode(true);
        const newSab  = sabBtn.cloneNode(true);
        succBtn.parentNode.replaceChild(newSucc, succBtn);
        sabBtn.parentNode.replaceChild(newSab, sabBtn);

        newSucc.onclick = () => {
            db.ref('rooms/' + code + '/missionChoices/' + onlineProfile.name).set('success');
            document.getElementById('online-mission-action-area').classList.add('hidden');
            document.getElementById('online-mission-waiting-area').classList.remove('hidden');
            document.getElementById('online-mission-waiting-text').innerText = 'Escolha registrada! Aguardando os outros...';
        };

        newSab.onclick = () => {
            db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
                if (snap.val().role === 'LAW') {
                    const warning = document.getElementById('online-law-warning');
                    warning.classList.add('warning-pulse');
                    setTimeout(() => warning.classList.remove('warning-pulse'), 800);
                    return;
                }
                db.ref('rooms/' + code + '/missionChoices/' + onlineProfile.name).set('sabotage');
                document.getElementById('online-mission-action-area').classList.add('hidden');
                document.getElementById('online-mission-waiting-area').classList.remove('hidden');
                document.getElementById('online-mission-waiting-text').innerText = 'Escolha registrada! Aguardando os outros...';
            });
        };
    } else {
        document.getElementById('online-mission-action-area').classList.add('hidden');
        document.getElementById('online-mission-waiting-area').classList.remove('hidden');
        document.getElementById('online-mission-waiting-text').innerText = 'Aguardando o resultado da missão...';
    }

    // Quando todos da equipe escolheram
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
                        db.ref('rooms/' + code + '/missionResult').set({ sabotages, missionIndex: mIdx });
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
    const sabotages = result.sabotages;
    const missionIdx = result.missionIndex || 0;

    // Verifica twoFailsRequired
    db.ref('rooms/' + code + '/players').once('value').then(pSnap => {
        const pCount = Object.keys(pSnap.val()).length;
        const config = GAME_CONFIG[pCount];
        const failsRequired = config.twoFailsRequired === missionIdx ? 2 : 1;
        const missionSuccess = sabotages < failsRequired;

        document.getElementById('online-mission-outcome').innerText = missionSuccess ? 'Missão Bem-sucedida!' : 'Missão Sabotada!';
        document.getElementById('online-mission-outcome').className = missionSuccess ? 'neon-text blue' : 'neon-text red';
        document.getElementById('online-mission-sabotage-count').innerText = sabotages;

        if (missionSuccess) {
            AudioManager.playSFX('success');
            document.body.classList.add('bg-winner-law');
        } else {
            AudioManager.playSFX('fail');
            document.body.classList.add('bg-winner-outlaw');
        }

        const nextBtn = document.getElementById('online-btn-mission-next');
        const waitEl  = document.getElementById('online-mission-result-waiting');

        db.ref('rooms/' + code + '/currentSheriffName').once('value').then(sheriffSnap => {
            if (sheriffSnap.val() === onlineProfile.name) {
                nextBtn.classList.remove('hidden');
                if (waitEl) waitEl.classList.add('hidden');

                const newBtn = nextBtn.cloneNode(true);
                nextBtn.parentNode.replaceChild(newBtn, nextBtn);

                newBtn.onclick = () => {
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
                            missionChoices:      null,
                            proposedTeam:        null,
                            missionResult:       null,
                            [`missionResults/${missionIdx}`]: missionSuccess,
                            currentSheriffName:  playerNames[nextIdx],
                            currentSheriffIndex: nextIdx,
                        };

                        if (winsLaw >= 3) {
                            // Verificar se tem extras.roles para assassinação
                            if (room.extras && room.extras.roles) {
                                updates['status'] = 'boss_assassination';
                            } else {
                                updates['status'] = 'gameover_law';
                            }
                        } else if (winsOutlaw >= 3) {
                            updates['status'] = 'gameover_outlaw_missions';
                        } else {
                            // Verificar duelo (revólver)
                            const nextMissionIdx = missionIdx + 1;
                            updates['currentMissionIndex'] = nextMissionIdx;
                            if ((missionIdx === 1 || missionIdx === 2) && room.extras && room.extras.revolver && room.revolverOwnerName) {
                                updates['status'] = 'duel_choose';
                                // Não avança missão ainda; vai avançar após o duelo
                                updates['currentMissionIndex'] = missionIdx; // mantém por enquanto
                            } else {
                                updates['status'] = 'board';
                            }
                        }

                        db.ref('rooms/' + code).update(updates);
                    });
                };
            } else {
                nextBtn.classList.add('hidden');
                if (waitEl) waitEl.classList.remove('hidden');
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
        const isSheriff = room.currentSheriffName === onlineProfile.name;
        const isRevolverOwner = revolverOwner === onlineProfile.name;

        showScreen('screen-online-duel-choose');

        document.getElementById('online-duel-owner-name').innerText =
            `${revolverOwner} possui o revólver!`;

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

        // Listener para quando status mudar para duel_action
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
                isShooter ? 'Você iniciou o duelo' : 'Você foi desafiado!';

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
                if (action === 'shoot') AudioManager.playSFX('shot');
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
                    // Só o atirador processa
                    const sShoot = d.shooterAction === 'shoot';
                    const tShoot = d.targetAction  === 'shoot';
                    const hasIntimidation = (sShoot === tShoot); // ambos igual = intimidação

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

    const sShoot = result.shooterAction === 'shoot';
    const tShoot = result.targetAction  === 'shoot';
    const resP   = document.getElementById('online-duel-result-text');

    if (sShoot && tShoot) {
        resP.innerHTML = "Ambos atiraram!<br>Por sorte, erraram os tiros.";
    } else if (!sShoot && !tShoot) {
        resP.innerHTML = "Ambos abaixaram as armas.<br>Clima de paz.";
    } else {
        resP.innerHTML = "Uma pessoa atirou e a outra abaixou a arma.<br>Um dos dois foi traiçoeiro.";
    }

    // Se houve intimidação, o atirador vê o time do alvo
    if (result.hasIntimidation && result.shooterName === onlineProfile.name) {
        document.getElementById('online-duel-intimidation-area').classList.remove('hidden');
        // Buscar role do alvo
        db.ref('rooms/' + code + '/players/' + result.targetName).once('value').then(tSnap => {
            const targetPlayer = tSnap.val();
            document.getElementById('online-intimidated-name').innerText = result.targetName;
            const roleLabel = document.getElementById('online-intimidated-role');
            if (targetPlayer.role === 'LAW') {
                roleLabel.innerText   = 'RESISTÊNCIA (Lei)';
                roleLabel.className   = 'neon-text blue';
            } else {
                roleLabel.innerText   = 'FORA DA LEI';
                roleLabel.className   = 'neon-text red';
            }
        });
    } else {
        document.getElementById('online-duel-intimidation-area').classList.add('hidden');
    }

    const nextBtn = document.getElementById('online-btn-duel-result-next');
    const newBtn  = nextBtn.cloneNode(true);
    nextBtn.parentNode.replaceChild(newBtn, nextBtn);

    newBtn.onclick = () => {
        // Só quem pode avançar o jogo (atirador do duelo)
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
            // Outros aguardam
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
        if (p.isBoss)     title += ' (CHEFE)';
        if (p.isDelegado) title += ' (DELEGADO)';
        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li><span>${title}</span></li>`;
        } else {
            outUl.innerHTML += `<li><span>${title}</span> <span class="neon-text red">Traíra</span></li>`;
        }
    });

    const playAgainBtn = document.getElementById('online-btn-play-again');
    const newBtn = playAgainBtn.cloneNode(true);
    playAgainBtn.parentNode.replaceChild(newBtn, playAgainBtn);

    newBtn.onclick = () => {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
        // Limpar sala completamente se for host
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
