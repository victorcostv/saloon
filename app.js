// Configurações do Jogo baseadas em Resistance
const GAME_CONFIG = {
    5: { outlaws: 2, missions: [2, 3, 2, 3, 3], twoFailsRequired: -1 },
    6: { outlaws: 2, missions: [2, 3, 4, 3, 4], twoFailsRequired: -1 },
    7: { outlaws: 3, missions: [2, 3, 3, 4, 4], twoFailsRequired: 3 }, // index 3 = mission 4
    8: { outlaws: 3, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
    9: { outlaws: 3, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
    10: { outlaws: 4, missions: [3, 4, 4, 5, 5], twoFailsRequired: 3 },
};

const MISSIONS_LORE = [
    "Missão 1: Escolta da Diligência. O ouro deve chegar intacto.",
    "Missão 2: Defesa do Banco. Há rumores de um assalto pela madrugada.",
    "Missão 3: Investigação no Saloon. Descubra as informações antes que fujam.",
    "Missão 4: Patrulha no Desfiladeiro. Ponto estratégico sendo vigiado.",
    "Missão 5: Defesa Final de Red Rock. Os bandidos estão chegando."
];

// Estado do Jogo
const state = {
    players: [], // { name, role: 'LAW'|'OUTLAW', isDelegado: bool, isBoss: bool }
    config: null,

    // Extras
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

    // Loops Interativos
    currentPlayerInteractionIndex: 0,
    pendingAction: null, // 'REVEAL', 'VOTE', 'MISSION', 'DUEL'
    votes: [],
    missionChoices: [],

    // Duelo logic
    duel: {
        shooterIndex: -1,
        targetIndex: -1,
        shooterAction: null,
        targetAction: null,
        stage: 0
    }
};

// Gerenciador de Áudio
const AudioAssets = {
    bgm: 'bgm.mp3',
    click: 'click.mp3',
    success: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
    fail: 'fail.mp3',
    shot: 'https://assets.mixkit.co/sfx/preview/mixkit-handgun-click-2114.mp3' // Som de gatilho/tiro
};

const AudioManager = {
    bgm: null,
    sounds: {}, // Cache para SFX
    isInitialized: false,
    isMuted: true,

    init() {
        if (this.isInitialized) return;
        try {
            // Inicializa BGM
            this.bgm = new Audio(AudioAssets.bgm);
            this.bgm.loop = true;
            this.bgm.volume = 0.3;

            // Pré-carrega SFX
            for (const key in AudioAssets) {
                if (key !== 'bgm') {
                    this.sounds[key] = new Audio(AudioAssets[key]);
                    this.sounds[key].load();
                }
            }

            this.isInitialized = true;
            console.log("AudioManager: Initialized with preloading");
        } catch (e) {
            console.error("AudioManager: Init failed", e);
        }
    },

    toggle() {
        if (!this.isInitialized) this.init();
        this.isMuted = !this.isMuted;
        const btn = document.getElementById('btn-toggle-sound');

        if (this.isMuted) {
            if (this.bgm) this.bgm.pause();
            btn.innerText = '🔇';
        } else {
            if (this.bgm) {
                this.bgm.play().catch(e => console.warn("BGM play failed", e));
            }
            btn.innerText = '🔊';
            this.playSFX('click'); // Feedback imediato
        }
    },

    playSFX(type) {
        if (this.isMuted) return;
        const sfx = this.sounds[type];
        if (sfx) {
            // Reinicia o som se já estiver tocando
            sfx.currentTime = 0;
            sfx.play().catch(e => console.warn("SFX play failed", type, e));
        }
    }
};

function showScreen(screenId) {
    // Som de clique agora é tratado pelo listener global, mas mantemos aqui por segurança
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Event listener para o botão de som
    const soundToggle = document.getElementById('btn-toggle-sound');
    if (soundToggle) {
        soundToggle.onclick = (e) => {
            e.stopPropagation();
            AudioManager.toggle();
        };
    }

    // Listener Global para cliques em botões e itens selecionáveis
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.btn, .selectable-item, .mode-card, .info-btn, button, input[type="submit"], .custom-checkbox');

        if (target && target.id !== 'btn-toggle-sound') {
            AudioManager.playSFX('click');
        }
    }, true);
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 1. Setup Phase
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
        li.innerHTML = `<span>${p.name}</span> <button onclick="removePlayer(${idx})"><img src="trash.png" style="width: 32px; height: 32px; vertical-align: middle;"></button>`;
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

function showError(msg) {
    document.getElementById('setup-error-msg').innerText = msg;
}

document.getElementById('btn-start-game').addEventListener('click', () => {
    initializeGame();
});

function initializeGame() {
    const pCount = state.players.length;
    state.config = GAME_CONFIG[pCount];

    state.extras.roles = document.getElementById('chk-roles').checked;
    state.extras.revolver = document.getElementById('chk-revolver').checked;

    state.currentSheriffIndex = Math.floor(Math.random() * pCount);

    let roles = [];
    for (let i = 0; i < state.config.outlaws; i++) roles.push('OUTLAW');
    for (let i = 0; i < pCount - state.config.outlaws; i++) roles.push('LAW');
    roles = shuffle(roles);

    state.players.forEach((p, i) => {
        p.role = roles[i];
        p.isBoss = false;
        p.isDelegado = false;
    });

    if (state.extras.roles) {
        let outlawsIdx = state.players.map((p, i) => p.role === 'OUTLAW' ? i : -1).filter(i => i !== -1);
        let lawIdx = state.players.map((p, i) => p.role === 'LAW' ? i : -1).filter(i => i !== -1);

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

// Interações Centralizadas
function startInteractionLoop() {
    let targetIndex = -1;

    if (state.pendingAction === 'REVEAL') {
        if (state.currentPlayerInteractionIndex >= state.players.length) return endInteractionLoop();
        targetIndex = state.currentPlayerInteractionIndex;
    } else if (state.pendingAction === 'MISSION') {
        if (state.currentPlayerInteractionIndex >= state.currentTeamProposal.length) return endInteractionLoop();
        targetIndex = state.currentTeamProposal[state.currentPlayerInteractionIndex];
    } else if (state.pendingAction === 'DUEL') {
        if (state.duel.stage === 0) targetIndex = state.duel.shooterIndex;
        else if (state.duel.stage === 1) targetIndex = state.duel.targetIndex;
        else return endInteractionLoop();
    } // VOTE era em grupo, não passa celular

    showScreen('screen-pass-device');
    document.getElementById('pass-device-target').innerText = state.players[targetIndex].name;
    document.getElementById('btn-reveal-action').onclick = () => executeInteraction(targetIndex);
}

function executeInteraction(targetIndex) {
    if (state.pendingAction === 'REVEAL') executeRevealPhase(targetIndex);
    else if (state.pendingAction === 'MISSION') executeMissionPhase(targetIndex);
    else if (state.pendingAction === 'DUEL') executeDuelActionPhase(targetIndex);
}

function endInteractionLoop() {
    if (state.pendingAction === 'REVEAL') {
        startBoardTurn();
    } else if (state.pendingAction === 'MISSION') {
        showSuspenseScreen();
    } else if (state.pendingAction === 'DUEL') {
        showDuelSuspense();
    }
}

// 2. Role Reveal
function executeRevealPhase(playerIdx) {
    showScreen('screen-role-reveal');
    const p = state.players[playerIdx];
    const roleCard = document.getElementById('role-card-display');
    const roleName = document.getElementById('role-name');
    const roleDesc = document.getElementById('role-description');
    const spiesList = document.getElementById('role-spies-list');

    document.getElementById('revolver-notice').classList.add('hidden');
    document.getElementById('delegate-notice').classList.add('hidden');

    roleCard.className = "role-card " + (p.role === 'LAW' ? 'law' : 'outlaw');
    spiesList.classList.add('hidden');

    if (p.role === 'LAW') {
        roleName.innerText = "Equipe da Lei";
        roleName.className = "neon-text blue";
        roleDesc.innerText = "Você defende Red Rock. Descubra os Fora-da-Lei.";

        if (p.isDelegado) {
            roleName.innerText = "DELEGADO DA LEI";
            document.getElementById('delegate-notice').classList.remove('hidden');
            document.getElementById('delegate-target').innerText = state.players[state.delegadoTargetIndex].name;
        }
    } else {
        roleName.innerText = "Fora-da-Lei (Outlaw)";
        roleName.className = "neon-text red";
        roleDesc.innerText = "Você está infiltrado na cidade.";

        if (p.isBoss) {
            roleName.innerText = "CHEFE DA GANGUE";
        }

        spiesList.classList.remove('hidden');
        const ul = document.getElementById('spies-ul');
        ul.innerHTML = '';
        state.players.forEach((op, opIdx) => {
            if (op.role === 'OUTLAW' && opIdx !== playerIdx) {
                ul.innerHTML += `<li>${op.name} ${op.isBoss ? '(Chefe)' : ''}</li>`;
            }
        });
    }

    if (state.extras.revolver && playerIdx === state.revolverOwnerIndex) {
        document.getElementById('revolver-notice').classList.remove('hidden');
    }

    document.getElementById('btn-role-understood').onclick = () => {
        state.currentPlayerInteractionIndex++;
        startInteractionLoop();
    };
}

// 3. Board
function startBoardTurn() {
    showScreen('screen-board');
    updateBoardUI();

    state.currentTeamProposal = [];
    const sheriff = state.players[state.currentSheriffIndex];
    document.getElementById('current-sheriff-name').innerText = sheriff.name;
    const reqSize = state.config.missions[state.currentMissionIndex];
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
        if (state.missionResults[i] === true) bubble.classList.add('success');
        else if (state.missionResults[i] === false) bubble.classList.add('fail');
        else if (i === state.currentMissionIndex) bubble.classList.add('current');
        if (state.config.twoFailsRequired === i) bubble.innerHTML += `<div class="miss-sub">2 Fails</div>`;
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

// 4. Group Voting Phase
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

    document.getElementById('btn-vote-trust-group').onclick = () => processGroupVote(true);
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

// 5. Mission Exec
function executeMissionPhase(playerIdx) {
    showScreen('screen-mission');
    const p = state.players[playerIdx];
    const btnSabotage = document.getElementById('btn-mission-sabotage');
    const btnSuccess = document.getElementById('btn-mission-success');

    btnSabotage.classList.remove('hidden');

    btnSuccess.onclick = () => submitMission(true);
    btnSabotage.onclick = () => {
        if (p.role === 'LAW') return alert('Você é da Equipe da Lei! Não pode sabotar.');
        submitMission(false);
    }
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
    let failsRequired = state.config.twoFailsRequired === state.currentMissionIndex ? 2 : 1;
    const missionSuccess = sabotages < failsRequired;

    const outcomeH1 = document.getElementById('mission-outcome');
    const outcomeLore = document.getElementById('mission-outcome-lore');

    if (missionSuccess) {
        AudioManager.playSFX('success');
        outcomeH1.innerText = "Missão Bem-sucedida!";
        outcomeH1.className = "neon-text blue";
        outcomeLore.innerText = "A operação em Red Rock foi concluída.";
    } else {
        AudioManager.playSFX('fail');
        outcomeH1.innerText = "Missão Sabotada!";
        outcomeH1.className = "neon-text red";
        outcomeLore.innerText = "Havia espiões na equipe e a operação falhou!";
    }

    document.getElementById('sabotage-number').innerText = sabotages;
    state.missionResults[state.currentMissionIndex] = missionSuccess;

    document.getElementById('btn-mission-result-next').onclick = () => {
        const winsLaw = state.missionResults.filter(r => r === true).length;
        const winsOutlaw = state.missionResults.filter(r => r === false).length;

        if (winsLaw >= 3) {
            if (state.extras.roles) return showBossAssassination();
            else return endGame("Vitória da Lei! A cidade de Red Rock foi salva.", "LAW");
        } else if (winsOutlaw >= 3) {
            return endGame("Vitória dos Fora-da-Lei! Red Rock sucumbiu.", "OUTLAW");
        }

        // Verifica se é final de Rodada 2 ou 3 E o revolver está ativado E ninguém ganhou
        if ((state.currentMissionIndex === 1 || state.currentMissionIndex === 2) && state.extras.revolver) {
            startDuelChoosePhase();
        } else {
            state.currentMissionIndex++;
            state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
            startBoardTurn();
        }
    };
}

// 6. Duel System
function startDuelChoosePhase() {
    state.duel.shooterIndex = state.revolverOwnerIndex;
    showScreen('screen-duel-choose');

    document.getElementById('duel-owner-name').innerText = state.players[state.duel.shooterIndex].name + " possui o revólver.";

    const targetsList = document.getElementById('duel-targets-list');
    targetsList.innerHTML = '';

    let targetSelected = -1;

    state.players.forEach((p, idx) => {
        // Can't choose yourself, or the previous shooter (if rodada 3)
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
        state.duel.stage = 0; // go to shooter action via Loop
        state.pendingAction = 'DUEL';
        startInteractionLoop();
    };

    document.getElementById('btn-skip-duel').onclick = () => {
        // Proceed normally if skipped
        state.currentMissionIndex++;
        state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
        startBoardTurn();
    };
}

function executeDuelActionPhase(playerIdx) {
    showScreen('screen-duel-action');
    const isShooter = state.duel.stage === 0;

    document.getElementById('duel-action-title').innerText = isShooter ? "Você iniciou o duelo" : "Você foi desafiado";

    document.getElementById('btn-duel-shoot').onclick = () => {
        submitDuelAction(isShooter, true);
    };
    document.getElementById('btn-duel-down').onclick = () => {
        submitDuelAction(isShooter, false);
    };
}

function submitDuelAction(isShooter, didShoot) {
    if (isShooter) {
        state.duel.shooterAction = didShoot;
        if (didShoot) AudioManager.playSFX('shot');
        state.duel.stage = 1;
        startInteractionLoop(); // Next is target
    } else {
        state.duel.targetAction = didShoot;
        if (didShoot) AudioManager.playSFX('shot');
        state.duel.stage = 2; // finish loop
        state.revolverPreviousOwnerIndex = state.duel.shooterIndex; // Update the memory of rodada 2
        state.revolverOwnerIndex = state.duel.targetIndex; // transfer gun
        showDuelSuspense(); // will call processDuelResult directly
    }
}

function showDuelSuspense() {
    showScreen('screen-duel-suspense');
    document.getElementById('btn-reveal-duel-result').onclick = () => {
        processDuelResult();
    };
}

function processDuelResult() {
    showScreen('screen-duel-result');
    const shooter = state.players[state.duel.shooterIndex];
    const target = state.players[state.duel.targetIndex];
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
        resP.innerHTML = "Uma pessoa atirou e a outra abaixou a arma, sem trato feito.<br>Um dos dois foi traiçoeiro.";
        hasIntimidation = false;
    }

    document.getElementById('btn-duel-result-next').onclick = () => {
        if (hasIntimidation) {
            const viewerIdx = state.duel.shooterIndex; // always challenger
            const shownIdx = state.duel.targetIndex; // always challenged

            showScreen('screen-pass-device');
            document.getElementById('pass-device-target').innerText = state.players[viewerIdx].name;
            document.getElementById('pass-device-title').innerText = "Revelação confidencial para:";
            document.getElementById('btn-reveal-action').onclick = () => {
                showDuelReveal(shownIdx);
            };
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
        rLabel.innerText = "RESISTÊNCIA (Lei)";
        rLabel.className = "neon-text blue";
    } else {
        rLabel.innerText = "FORA DA LEI";
        rLabel.className = "neon-text red";
    }

    document.getElementById('btn-duel-understood').onclick = () => {
        document.getElementById('pass-device-title').innerText = "Passe o celular para:"; // reset title
        finishDuelEntirely();
    };
}

function finishDuelEntirely() {
    state.currentMissionIndex++;
    state.currentSheriffIndex = (state.currentSheriffIndex + 1) % state.players.length;
    startBoardTurn();
}


// 7. Boss Assassination
function showBossAssassination() {
    showScreen('screen-boss-assassination');
    const assassinateList = document.getElementById('assassination-list');
    assassinateList.innerHTML = '';

    let targetSelected = -1;

    state.players.forEach((p, idx) => {
        // Can't choose boss himself
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
            endGame("BANG! O Chefe da Gangue assassinou o Delegado antes de fugir! A cidade perdeu a sua Liderança. Vitória dos Fora-da-Lei!", "OUTLAW");
        } else {
            endGame("O Chefe atirou na pessoa errada. A cidade executou todos eles! Vitória Incontestável da Lei!", "LAW");
        }
    }
}


// 8. Game Over
function endGame(reason, winner) {
    showScreen('screen-game-over');
    document.getElementById('game-over-reason').innerText = reason;

    const body = document.body;
    body.classList.remove('bg-winner-law', 'bg-winner-outlaw');

    if (winner === 'LAW') {
        AudioManager.playSFX('success');
        body.classList.add('bg-winner-law');
    } else if (winner === 'OUTLAW') {
        AudioManager.playSFX('fail');
        body.classList.add('bg-winner-outlaw');
    }

    const lawUl = document.getElementById('final-law-list');
    const outUl = document.getElementById('final-outlaw-list');
    lawUl.innerHTML = '';
    outUl.innerHTML = '';

    state.players.forEach(p => {
        let title = p.name;
        if (p.isBoss) title += " (CHEFE)";
        if (p.isDelegado) title += " (DELEGADO)";

        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li><span>${title}</span></li>`;
        } else {
            outUl.innerHTML += `<li><span>${title}</span> <span class="neon-text red">Traíra</span></li>`;
        }
    });

    document.getElementById('btn-play-again').onclick = () => {
        state.players.forEach(p => {
            p.role = null; p.isBoss = false; p.isDelegado = false;
        });
        state.currentMissionIndex = 0;
        state.rejectedTeams = 0;
        state.missionResults = [null, null, null, null, null];
        state.currentSheriffIndex = 0;
        state.currentTeamProposal = [];
        state.revolverOwnerIndex = -1;
        state.revolverPreviousOwnerIndex = -1;

        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');

        updateSetupUI();
        showScreen('screen-setup-players');
    };
}

// 9. Initialize Menu & Modes
let onlineProfile = { name: '', avatar: '' };

document.addEventListener('DOMContentLoaded', () => {
    showScreen('screen-splash');

    // Splash -> Mode Select
    document.getElementById('screen-splash').onclick = () => {
        showScreen('screen-mode-select');
    };

    // Mode: Offline
    document.getElementById('btn-mode-offline').onclick = () => {
        showScreen('screen-setup-players');
    };

    // Offline: Go to Advanced
    document.getElementById('btn-go-to-advanced').onclick = () => {
        showScreen('screen-setup-advanced');
    };

    // Offline: Back to Players
    document.getElementById('btn-back-to-players').onclick = () => {
        showScreen('screen-setup-players');
    };

    // Offline: Back to Menu
    document.getElementById('btn-back-main').onclick = () => {
        showScreen('screen-mode-select');
    };

    // Como jogar
    document.getElementById('btn-how-to-play').onclick = () => {
        alert(
            "🤠 COMO JOGAR - SALOON\n\n" +
            "O jogo tem dois times: a LEI e os FORA-DA-LEI.\n\n" +
            "📋 OBJETIVO:\n" +
            "• Lei: vencer 3 missões\n" +
            "• Fora-da-Lei: sabotar 3 missões\n\n" +
            "🔄 TURNO:\n" +
            "1. O Xerife monta uma equipe\n" +
            "2. Todos votam (aprova/rejeita) em grupo\n" +
            "3. Equipe aprovada executa a missão em segredo\n" +
            "4. Resultado revelado!\n\n" +
            "⚠️ 5 rejeições seguidas = Fora-da-Lei vencem automaticamente.\n\n" +
            "Boa sorte, parceiro! 🌵"
        );
    };

    // Mode: Online
    document.getElementById('btn-mode-online').onclick = () => {
        showScreen('screen-online-profile');
    };

    // Avatar Selection Logic
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.onclick = () => {
            document.querySelectorAll('.avatar-item').forEach(a => a.classList.remove('selected'));
            item.classList.add('selected');
            onlineProfile.avatar = item.getAttribute('data-avatar');
        };
    });

    // Online Profile Submit
    document.getElementById('online-profile-form').onsubmit = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('online-name-input').value.trim();
        if (!nameInput) {
            alert("Preencha seu nome!");
            return;
        }
        if (!onlineProfile.avatar) {
            alert("Escolha um personagem clicando na carinha!");
            return;
        }
        onlineProfile.name = nameInput;
        showScreen('screen-online-lobby');
    };

    // Online Profile: Back to Mode Select
    document.getElementById('btn-back-from-profile').onclick = () => {
        showScreen('screen-mode-select');
    };

    // Lobby: Back to Menu
    document.getElementById('btn-back-to-mode').onclick = () => {
        showScreen('screen-mode-select');
    };
});

// Funções Globais de Tutorial
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
            <p>O Xerife da rodada recebe o Revólver e pode escolher um jogador para um duelo de olhares.</p>
            <p>No duelo, o alvo pode ser forçado a revelar sua lealdade ou o Xerife pode perder sua influência. É uma faca de dois gumes!</p>
        `;
    }

    contentDiv.innerHTML = html;
    showScreen('screen-tutorial');
}

function closeTutorial() {
    showScreen(lastScreenId);
}
