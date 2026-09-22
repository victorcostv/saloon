// ════════════════════════════════════════════
// SALOON — modo online (só no site)
// ════════════════════════════════════════════
// O app de iPhone é 100% offline; o site acrescenta este arquivo, o
// screen.js (telão) e as telas de web/online.html por cima do jogo
// (ver scripts/build-web.js). Tudo o que é visual — carta, fichas,
// tabuleiro, resultado — vem do jogo compartilhado (fx.js, art.js).
// Sincronização: Firebase Realtime Database, sala em rooms/<CÓDIGO>.

let onlineProfile = { name: '', avatar: '' };
let currentRoom = null;
// MODO TELA: true se este dispositivo criou a sala (é o telão, não joga)
let isScreenDevice = false;
// Cronômetro do modo tela (referência para limpar)
let screenTimerInterval = null;

const AVATARES = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `avatars/avatar${n}.png`);

// Avisos na janela do jogo (em vez do alert() do navegador).
const avisar = (texto) => perguntar({ titulo: texto, sim: 'OK' });

// As telas online de resultado e fim de jogo mantêm o brilho de vitória.
TELAS_DE_DESFECHO.push('screen-online-mission-result', 'screen-online-game-over');

// Registrado depois do app.js: roda depois da inicialização do jogo e troca
// o que é diferente no site.
document.addEventListener('DOMContentLoaded', () => {
    // A tela inicial leva à escolha de modo (no app, vai direto aos jogadores).
    document.getElementById('screen-splash').onclick = () => {
        AudioManager.startBGM();
        showHamburger();
        showScreen('screen-mode-select');
    };
    document.getElementById('menu-home-btn').onclick = async () => {
        SideMenu.close();
        if ((currentRoom || state.emAndamento) && !(await perguntar({
            titulo: t(currentRoom ? 'leave_room_title' : 'leave_game_title'),
            texto:  t(currentRoom ? 'leave_room_text' : 'leave_game_text'),
            sim: t('leave_game_yes'), nao: t('leave_game_no')
        }))) return;
        if (currentRoom) {
            cleanupRoom(currentRoom);
            currentRoom = null;
        }
        resetGameState();
        showScreen('screen-mode-select', 'volta');
    };

    // Escolha de modo
    document.getElementById('btn-mode-offline').onclick = () => {
        updateSetupUI();
        showScreen('screen-setup-players');
    };
    document.getElementById('btn-mode-online').onclick       = () => showScreen('screen-online-profile');
    document.getElementById('btn-back-from-profile').onclick = () => showScreen('screen-mode-select', 'volta');
    document.getElementById('btn-back-to-mode').onclick      = () => showScreen('screen-mode-select', 'volta');

    // Link direto de sala: saloongame.com.br/#CODIGO (é o que o QR code abre).
    // Pula a tela inicial e vai direto ao perfil; entra na sala ao confirmar.
    let pendingRoomCode = null;
    const hashCode = (location.hash || '').replace('#', '').trim().toUpperCase();
    if (/^[A-Z0-9]{4,8}$/.test(hashCode)) pendingRoomCode = hashCode;
    if (pendingRoomCode) {
        showHamburger();
        showScreen('screen-online-profile');
    }

    // Avatar (carrossel)
    let avatarIndex = 0;
    onlineProfile.avatar = AVATARES[0];
    const mostraAvatar = () => {
        document.getElementById('avatar-img').src = AVATARES[avatarIndex];
        onlineProfile.avatar = AVATARES[avatarIndex];
    };
    document.getElementById('avatar-prev').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex - 1 + AVATARES.length) % AVATARES.length;
        mostraAvatar();
    };
    document.getElementById('avatar-next').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex + 1) % AVATARES.length;
        mostraAvatar();
    };

    // Perfil
    document.getElementById('online-profile-form').onsubmit = (e) => {
        e.preventDefault();
        const nome = document.getElementById('online-name-input').value.trim();
        if (!nome) return avisar(t('fill_name'));
        onlineProfile.name = nome;
        // Quem veio pelo QR não passou pela tela inicial: a música começa aqui.
        AudioManager.startBGM();
        if (pendingRoomCode) {
            const codigo = pendingRoomCode;
            pendingRoomCode = null;
            joinRoomByCode(codigo);
        } else {
            showScreen('screen-online-lobby');
        }
    };

    // Criar sala
    document.getElementById('btn-create-room').onclick = () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        isScreenDevice = false; // sala normal; o Modo Party é ligado na sala de espera
        db.ref('rooms/' + code).set({
            host: onlineProfile.name,
            hostAvatar: onlineProfile.avatar,
            screenMode: false,
            players: {
                [onlineProfile.name]: { name: onlineProfile.name, avatar: onlineProfile.avatar, isHost: true }
            },
            status: 'waiting',
            extras: { roles: false, revolver: false, farsante: false }
        }).then(() => {
            currentRoom = code;
            showScreen('screen-online-waiting');
            listenToRoom(code);
        });
    };

    // Entrar em sala
    document.getElementById('btn-join-room').onclick = () => {
        const code = document.getElementById('room-code-input').value.trim().toUpperCase();
        if (!code) return avisar(t('type_code'));
        joinRoomByCode(code);
    };
});

// Entra numa sala pelo código (usado pelo botão e pelo link/QR de sala)
function joinRoomByCode(code) {
    code = (code || '').trim().toUpperCase();
    if (!code) return;
    db.ref('rooms/' + code).once('value').then(snapshot => {
        if (!snapshot.exists()) return avisar(t('room_not_found'));
        const room = snapshot.val();
        if (room.status !== 'waiting') return avisar(t('match_started'));
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
}

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
                list.innerHTML += `<li class="jogador-sala"><img class="av" src="${p.avatar}" alt=""><span class="nome">${p.name}</span>${p.isHost ? '<span class="anfitriao">★</span>' : ''}</li>`;
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
            const anfitriao = Object.values(players).find(p => p.isHost);
            const espera = document.getElementById('online-waiting-host');
            espera.classList.toggle('hidden', !!isHost || !anfitriao);
            if (anfitriao) espera.innerText = t('waiting_host', { name: anfitriao.name });
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
        const extras = snap.val() || { roles: false, revolver: false, farsante: false };
        const chkRoles    = document.getElementById('online-chk-roles');
        const chkRevolver = document.getElementById('online-chk-revolver');
        const chkFarsante = document.getElementById('online-chk-farsante');
        chkRoles.classList.toggle('checked-visual', !!extras.roles);
        chkRevolver.classList.toggle('checked-visual', !!extras.revolver);
        // Farsante exige Distintivo: se roles desligar, farsante desliga junto.
        const farsanteOn = !!extras.farsante && !!extras.roles;
        if (chkFarsante) chkFarsante.classList.toggle('checked-visual', farsanteOn);
        const farsCard = document.getElementById('online-card-farsante');
        if (farsCard) farsCard.classList.toggle('disabled-card', !extras.roles);
    });

    // MODO PARTY: card visível só para o host; sincroniza o visual do checkbox
    db.ref('rooms/' + code + '/players').on('value', snap => {
        const players = snap.val() || {};
        const me = players[onlineProfile.name];
        const partyWrap = document.getElementById('online-card-party-wrap');
        if (partyWrap) partyWrap.classList.toggle('hidden', !(me && me.isHost));
    });
    db.ref('rooms/' + code + '/screenMode').on('value', snap => {
        const on = !!snap.val();
        const chkParty = document.getElementById('online-chk-party');
        if (chkParty) chkParty.classList.toggle('checked-visual', on);
    });
    // Host liga o Modo Party (transição para a tela; para voltar, encerra a sala)
    document.getElementById('online-card-party').onclick = () => {
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (!(snap.val() && snap.val().isHost)) return;
            db.ref('rooms/' + code + '/screenMode').once('value').then(s => {
                if (!s.val()) enabledPartyAsHost(code);
            });
        });
    };

    // Extras: somente host pode alterar
    document.getElementById('online-card-roles').onclick = () => {
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                db.ref('rooms/' + code + '/extras').once('value').then(s => {
                    const ex = s.val() || {};
                    const newRoles = !ex.roles;
                    const updates = { roles: newRoles };
                    // desligar Distintivo desliga a Farsante junto
                    if (!newRoles) updates.farsante = false;
                    db.ref('rooms/' + code + '/extras').update(updates);
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

    document.getElementById('online-card-farsante').onclick = () => {
        db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
            if (snap.val() && snap.val().isHost) {
                db.ref('rooms/' + code + '/extras').once('value').then(s => {
                    const ex = s.val() || {};
                    if (!ex.roles) {
                        // sem Distintivo, não deixa ligar; pisca a card do Distintivo
                        const distCard = document.getElementById('online-card-roles');
                        if (distCard) {
                            distCard.classList.add('shake-req');
                            setTimeout(() => distCard.classList.remove('shake-req'), 500);
                        }
                        return;
                    }
                    db.ref('rooms/' + code + '/extras/farsante').set(!ex.farsante);
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
                updates[`players/${p.name}/role`]          = roles[i];
                updates[`players/${p.name}/isBoss`]        = false;
                updates[`players/${p.name}/isDelegado`]    = false;
                updates[`players/${p.name}/isEscrivao`]    = false;
                updates[`players/${p.name}/isFalsificador`]= false;
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
                updates['delegadoName']       = players[delegadoIdx].name;

                if (farsanteOn) {
                    // Falsificador: um fora-da-lei comum (nunca o Chefe).
                    const falsIdx = commonOuts[Math.floor(Math.random() * commonOuts.length)];
                    updates[`players/${players[falsIdx].name}/isFalsificador`] = true;
                    updates['falsificadorName'] = players[falsIdx].name;
                    // Escrivão: um membro da Lei comum (nunca o Delegado).
                    const escrCands = lawIdxs.filter(i => i !== delegadoIdx);
                    const escrIdx = escrCands[Math.floor(Math.random() * escrCands.length)];
                    updates[`players/${players[escrIdx].name}/isEscrivao`] = true;
                    updates['escrivaoName'] = players[escrIdx].name;
                    // O Delegado NÃO vê o Falsificador: alvo visível é um comum != Falsificador.
                    const visiveis = commonOuts.filter(i => i !== falsIdx);
                    delegadoTargetIdx = visiveis.length > 0
                        ? visiveis[Math.floor(Math.random() * visiveis.length)]
                        : bossIdx;
                    // Os dois nomes que o Escrivão vê (Delegado real + Falsificador), embaralhados.
                    updates['escrivaoNames'] = shuffle([players[delegadoIdx].name, players[falsIdx].name]);
                }
                updates['delegadoTargetName'] = players[delegadoTargetIdx].name;
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

            // Monta os dados da carta deste jogador
            let suitKey = p.role;
            if (p.isDelegado) suitKey = 'DELEGADO';
            else if (p.isBoss) suitKey = 'BOSS';
            else if (p.isEscrivao) suitKey = 'ESCRIVAO';
            else if (p.isFalsificador) suitKey = 'FALSIFICADOR';

            const roleData = {
                team: p.role,
                suitKey: suitKey,
                hasRevolver: false
            };
            if (p.role === 'LAW') {
                roleData.desc1 = t('law_desc1');
                roleData.desc2 = t('law_desc2');
                if (p.isDelegado) {
                    roleData.name = t('role_delegado');
                } else if (p.isEscrivao) {
                    roleData.name = t('role_escrivao');
                    roleData.desc1 = t('escrivao_desc1');
                    roleData.desc2 = '';
                } else {
                    roleData.name = t('role_law');
                }
            } else {
                roleData.desc1 = t('outlaw_desc1');
                if (p.isBoss) {
                    roleData.name = t('role_boss');
                    roleData.desc2 = t('boss_desc2');
                } else if (p.isFalsificador) {
                    roleData.name = t('role_falsificador');
                    roleData.desc2 = t('falsificador_desc2');
                    roleData.falsificadorNotice = true;
                } else {
                    roleData.name = t('role_outlaw');
                    roleData.desc2 = t('outlaw_desc2');
                }
                // Falsificador e Chefe veem os outros fora-da-lei.
                roleData.outlaws = [];
                Object.values(allPlayersObj).forEach(op => {
                    if (op.role === 'OUTLAW' && op.name !== onlineProfile.name) {
                        roleData.outlaws.push(op.name + (op.isBoss ? ' ' + t('boss_tagged') : ''));
                    }
                });
            }

            // Dados assíncronos: alvo do delegado, nomes do escrivão e dono do revólver.
            const extraFetches = [];
            if (p.isDelegado) {
                extraFetches.push(
                    db.ref('rooms/' + code + '/delegadoTargetName').once('value').then(s => {
                        if (s.val()) roleData.delegateHtml = t('delegate_notice', { name: s.val() });
                    })
                );
            }
            if (p.isEscrivao) {
                extraFetches.push(
                    db.ref('rooms/' + code + '/escrivaoNames').once('value').then(s => {
                        const arr = s.val();
                        if (arr && arr.length === 2) roleData.escrivaoNames = arr;
                    })
                );
            }
            extraFetches.push(
                db.ref('rooms/' + code + '/revolverOwnerName').once('value').then(s => {
                    roleData.hasRevolver = !!s.val() && s.val() === onlineProfile.name;
                })
            );

            Promise.all(extraFetches).then(() => {
                myRoleData = roleData; // guarda para "Rever minha carta"
                mostrarMinhaCarta(code, true);
            });

            // Contador de prontos
            db.ref('rooms/' + code + '/ready').on('value', readySnap => {
                const ready = readySnap.val() ? Object.keys(readySnap.val()).length : 0;
                const rc = document.getElementById('online-ready-count');
                if (rc) rc.innerText = t('ready_count', { ready, total: count });
                if (ready >= count) {
                    db.ref('rooms/' + code + '/ready').off();
                    // MODO PARTY: o telão é quem avança para o board (não o celular).
                    // No online normal, cada celular avança sozinho.
                    db.ref('rooms/' + code + '/screenMode').once('value').then(sm => {
                        if (sm.val()) {
                            // Party: apenas escuta o status; o telão dispara o board.
                            listenToGameStatus(code);
                        } else {
                            db.ref('rooms/' + code + '/ready').remove();
                            fadeToBlack(() => {
                                listenToGameStatus(code);
                                showOnlineBoard(code);
                            });
                        }
                    });
                }
            });
        });
    });
}

// A carta na mesa, direto: cada um está no próprio celular, então não há
// "passe o celular". Ao esconder, marca o jogador como pronto (só na
// primeira vez) e vai para a espera, de onde dá para rever a carta.
function mostrarMinhaCarta(code, marcarPronto) {
    showScreen('screen-mesa');
    runRevealScene(myRoleData, onlineProfile.name, () => {
        if (marcarPronto) db.ref('rooms/' + code + '/ready/' + onlineProfile.name).set(true);
        showScreen('screen-online-reveal-wait');
        document.getElementById('online-btn-review-card').onclick = () => mostrarMinhaCarta(code, false);
    }, { direto: true, rotuloFim: t('hide_card_only') });
}

// ============================================
// ONLINE — LISTENER DE STATUS DO JOGO
// ============================================

function listenToGameStatus(code) {
    db.ref('rooms/' + code + '/status').off();
    db.ref('rooms/' + code + '/status').on('value', snap => {
        const status = snap.val();
        if (!status) return;

        // NOVA PARTIDA: a sala foi resetada para o lobby de espera.
        if (status === 'waiting') {
            db.ref('rooms/' + code + '/status').off();
            myRoleData = null;
            showScreen('screen-online-waiting');
            listenToRoom(code);
            return;
        }

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

        // Como no jogo local: placar de rejeições só depois da primeira, e a
        // frase da equipe no lugar do texto de história da missão.
        document.querySelector('#screen-online-board .reject-track')
            .classList.toggle('hidden', !(room.rejectedTeams > 0));
        document.getElementById('online-sheriff-name').innerText = sheriffName;
        document.getElementById('online-board-instruction').innerHTML =
            t('sheriff_must_n', { size: missionSize, num: missionIndex + 1 });

        if (isSheriff) {
            document.getElementById('online-sheriff-area').classList.remove('hidden');
            document.getElementById('online-waiting-area').classList.add('hidden');
            document.getElementById('online-sheriff-instruction').innerText = t('select_team');

            // MODO TELA: cronômetro pequeno no topo (sincronizado com o telão)
            if (room.screenMode) {
                showPhonePickTimer(code);
            }

            const teamList = document.getElementById('online-team-select-list');
            teamList.innerHTML = '';
            let selectedTeam = [];

            players.forEach(p => {
                const div = document.createElement('div');
                div.className = 'selectable-item has-avatar';
                const av = p.avatar || 'avatars/avatar1.png';
                div.innerHTML = `<div class="avatar-wrap"><img src="${av}" alt=""><div class="check-badge">✓</div></div><span class="player-name">${p.name}</span>`;
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
                db.ref('rooms/' + code + '/pickEndTime').set(null);
                db.ref('rooms/' + code + '/status').set('voting');
            };
        } else {
            // MODO TELA: jogador fora da vez vê o resumo dos papéis (não a espera padrão)
            if (room.screenMode) {
                showPhoneSummary(code);
                return;
            }
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

    // MODO TELA: detecta se a sala usa telão (o celular não resolve a votação)
    const screenMode = !isScreenDevice; // num celular, screenMode da sala é tratado abaixo

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

    // No modo tela, o cronômetro pequeno aparece no celular (sincronizado com o telão)
    db.ref('rooms/' + code).once('value').then(rSnap => {
        const room = rSnap.val() || {};
        if (room.screenMode) {
            showPhoneMiniTimer(code);
            // oculta o contador de votos no celular (a contagem aparece no telão)
            const vc = document.getElementById('online-votes-count');
            if (vc) vc.style.display = 'none';
            // O celular NÃO resolve a votação nem mostra o resultado:
            // ele apenas escuta o status mudar (o telão resolve e muda o status).
            return;
        }
        // modo online normal: garante o contador visível
        const vc = document.getElementById('online-votes-count');
        if (vc) vc.style.display = '';
        // Modo online normal: cada celular conta e resolve (comportamento original)
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
    outcome.innerText = approved ? t('approved_team') : t('rejected_team');
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

    // Quando todos da equipe escolheram, o celular do xerife fecha o resultado.
    // Roda em todo mundo, porque o xerife pode ter ficado fora da equipe
    // (antes só rodava em quem estava nela, e a missão travava).
    // MODO TELA: quem processa é o telão (não o celular do xerife).
    db.ref('rooms/' + code).once('value').then(rSnap => {
        const room = rSnap.val() || {};
        if (room.screenMode) return; // no modo tela, o telão é o juiz

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
    });

    const esperar = (texto) => {
        showScreen('screen-online-mission');
        document.getElementById('online-mission-waiting-text').innerText = texto;
        db.ref('rooms/' + code + '/currentMissionIndex').once('value').then(s => {
            document.getElementById('online-mission-wait-num').innerText = t('mission_n', { n: (s.val() || 0) + 1 });
        });
    };

    if (!isInTeam) {
        // MODO TELA: quem não está na missão acompanha pelo resumo/telão
        db.ref('rooms/' + code).once('value').then(rSnap => {
            const room = rSnap.val() || {};
            if (room.screenMode) showPhoneSummary(code);
            else esperar(t('waiting_mission_result'));
        });
        return;
    }

    // Quem está na equipe escolhe a ficha na mesa, como no jogo local — sem o
    // "passe o celular", porque o celular já é dele.
    showScreen('screen-mesa');
    db.ref('rooms/' + code + '/players/' + onlineProfile.name).once('value').then(snap => {
        const isLaw = snap.val() && snap.val().role === 'LAW';
        mesaDireto('mesa-fichas', () => renderChipTable({
            rowId: 'mission-chip-row',
            warnId: 'mission-law-warning',
            confirmId: 'mission-confirm',
            nextBtnId: null,
            isLaw: isLaw,
            onChoice: (isSuccess) => {
                db.ref('rooms/' + code + '/missionChoices/' + onlineProfile.name)
                  .set(isSuccess ? 'success' : 'sabotage');
                // Depois das fichas recolherem, vai para a espera — a não ser
                // que o resultado já tenha chegado.
                setTimeout(() => {
                    if (document.getElementById('screen-mesa').classList.contains('active')) {
                        esperar(t('choice_registered'));
                    }
                }, REDUCED_MOTION ? 0 : 1900);
            },
            onNext: () => {}
        }));
    });
}

// ============================================
// ONLINE — RESULTADO DA MISSÃO
// ============================================

function showOnlineMissionResult(code, result) {
    // MODO TELA: o resultado aparece no telão. O celular volta ao resumo.
    db.ref('rooms/' + code).once('value').then(rSnap => {
        const room = rSnap.val() || {};
        if (room.screenMode) {
            showPhoneSummary(code);
            return;
        }
        showMissionResultNormal(code, result);
    });
}

function showMissionResultNormal(code, result) {
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
            // MODO TELA: quem não tem o revólver acompanha pelo telão
            if (room.screenMode) {
                showScreen('screen-phone-watch');
                const wt = document.getElementById('phone-watch-title');
                const ws = document.getElementById('phone-watch-sub');
                if (wt) { wt.innerText = t('phone_duel_title'); wt.style.color = 'var(--accent)'; }
                if (ws) ws.innerText = t('phone_duel_sub');
            } else {
                document.getElementById('online-duel-owner-area').classList.add('hidden');
                document.getElementById('online-duel-waiting-area').classList.remove('hidden');
            }
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
            // MODO TELA: quem não é o Chefe vê a tela de "olhe o telão"
            db.ref('rooms/' + code).once('value').then(rSnap => {
                const room = rSnap.val() || {};
                if (room.screenMode) {
                    showScreen('screen-phone-watch');
                    const wt = document.getElementById('phone-watch-title');
                    const ws = document.getElementById('phone-watch-sub');
                    if (wt) { wt.innerText = t('phone_boss_aiming_title'); wt.style.color = 'var(--outlaw)'; }
                    if (ws) ws.innerText = t('phone_boss_aiming_sub');
                    return;
                }
                document.getElementById('online-boss-action-area').classList.add('hidden');
                document.getElementById('online-boss-waiting-area').classList.remove('hidden');
            });
        }
    });
}

// ============================================
// ONLINE — FIM DE JOGO
// ============================================

function showOnlineGameOver(code, room, winner, reason) {
    db.ref('rooms/' + code + '/status').off();

    // MODO TELA: o resultado completo (papéis revelados) aparece no telão.
    // O celular mostra uma tela simples apontando para o telão.
    if (room && room.screenMode && !isScreenDevice) {
        showScreen('screen-phone-watch');
        const wt = document.getElementById('phone-watch-title');
        const ws = document.getElementById('phone-watch-sub');
        const icon = document.querySelector('#screen-phone-watch .phone-watch-big');
        const winnerIsLaw = winner === 'LAW';
        // troca o ícone do olho pelo naipe do time vencedor
        if (icon) {
            icon.innerHTML = suitSVG(winnerIsLaw ? 'LAW' : 'OUTLAW');
            icon.style.width = '120px';
            icon.style.height = '120px';
        }
        if (wt) wt.innerText = winnerIsLaw ? t('law_wins') : t('outlaw_wins');
        if (wt) wt.style.color = winnerIsLaw ? 'var(--law)' : 'var(--outlaw)';
        if (ws) ws.innerText = t('phone_watch_screen_result');
        return;
    }

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
        let suitKey = p.role;
        let tag = '';
        if (p.isBoss)              { suitKey = 'BOSS';         tag = t('tag_boss'); }
        else if (p.isDelegado)     { suitKey = 'DELEGADO';     tag = t('tag_delegado'); }
        else if (p.isEscrivao)     { suitKey = 'ESCRIVAO';     tag = t('tag_escrivao'); }
        else if (p.isFalsificador) { suitKey = 'FALSIFICADOR'; tag = t('tag_falsificador'); }
        const av = p.avatar || 'avatars/avatar1.png';
        const suit = (typeof suitSVG === 'function') ? suitSVG(suitKey) : '';
        const tagHtml = tag ? `<span class="reveal-tag">${tag.replace(/[()]/g, '').trim()}</span>` : '';
        if (p.role === 'LAW') {
            lawUl.innerHTML += `<li class="reveal-li law"><div class="avatar-wrap"><img src="${av}" alt=""></div><span class="reveal-name">${p.name}</span>${tagHtml}<span class="reveal-suit">${suit}</span></li>`;
        } else {
            outUl.innerHTML += `<li class="reveal-li outlaw"><div class="avatar-wrap"><img src="${av}" alt=""></div><span class="reveal-name">${p.name}</span>${tagHtml}<span class="reveal-suit">${suit}</span></li>`;
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
