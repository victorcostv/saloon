// ════════════════════════════════════════════
// SALOON — modo online (só no site)
// ════════════════════════════════════════════
// O app de iPhone é 100% offline; o site acrescenta este arquivo, o
// screen.js (telão) e as telas de web/online.html por cima do jogo
// (ver scripts/build-web.js). Tudo o que é visual — carta, fichas,
// tabuleiro, resultado — vem do jogo compartilhado (fx.js, art.js).
// Sincronização: Firebase Realtime Database, sala em rooms/<CÓDIGO>.
//
// Como a sala anda: cada aparelho escuta a sala inteira e desenha a tela a
// partir do estado dela (rota). Quem bloqueia o celular, perde a conexão ou
// recarrega a página volta direto para o ponto certo da partida. Toda
// mudança de fase passa por avancaSala(), que só grava se a sala ainda
// estiver na fase esperada: toque duplo ou dois aparelhos avançando juntos
// não pulam rodadas.

let onlineProfile = { name: '', avatar: '' };
let currentRoom = null;
// MODO PARTY: true se este aparelho é o telão (mostra a mesa, não joga)
let isScreenDevice = false;
// A carta deste jogador (para "Rever minha carta")
let myRoleData = null;

const AVATARES = [1, 2, 3, 4, 5, 6, 7, 8].map(n => `avatars/avatar${n}.png`);
const MAX_ONLINE = 10;

// Avisos na janela do jogo (em vez do alert() do navegador).
const avisar = (texto) => perguntar({ titulo: texto, sim: 'OK' });

// As telas online de resultado e fim de jogo mantêm o brilho de vitória.
TELAS_DE_DESFECHO.push('screen-online-mission-result', 'screen-online-game-over');

// ============================================
// NOMES, CÓDIGOS E MEMÓRIA DO APARELHO
// ============================================

// O nome vira chave no Firebase (que recusa . # $ [ ] /) e aparece na tela:
// esses caracteres e os de marcação ficam de fora.
function limpaNome(s) {
    return String(s || '').replace(/[.#$\[\]\/\\<>&\u0000-\u001f\u007f]/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, 15);
}
const limpaCodigo = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
// Sem I, O, 0 e 1, que se confundem ao ditar ou digitar o código.
const LETRAS_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const novoCodigo = () => Array.from({ length: 5 },
    () => LETRAS_CODIGO[Math.floor(Math.random() * LETRAS_CODIGO.length)]).join('');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const guarda = {
    le(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    grava(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    apaga(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

// Cada navegador tem um id, gravado no jogador da sala: é assim que a sala
// reconhece quem volta depois de recarregar a página.
const MEU_ID = (() => {
    let id = guarda.le('saloon-aparelho');
    if (!id) {
        id = Math.random().toString(36).slice(2) + Date.now().toString(36);
        guarda.grava('saloon-aparelho', id);
    }
    return id;
})();

// A sala em que este aparelho está, para voltar a ela se a página recarregar.
const SESSAO_VALE = 12 * 60 * 60 * 1000;
function guardaSessao() {
    guarda.grava('saloon-sala', {
        code: currentRoom, name: onlineProfile.name, avatar: onlineProfile.avatar,
        tela: isScreenDevice, quando: Date.now()
    });
}
function esqueceSessao() { guarda.apaga('saloon-sala'); }
function sessaoGuardada() {
    const s = guarda.le('saloon-sala');
    return s && s.code && Date.now() - (s.quando || 0) < SESSAO_VALE ? s : null;
}

// Tira o #CÓDIGO do endereço depois de usá-lo (senão uma recarga tentaria
// entrar de novo pelo link).
function limpaHash() {
    try { if (location.hash) history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
}

// Leituras que dependem da rede: sem resposta, avisa em vez de ficar parado.
function comPrazo(promessa, ms = 12000) {
    return Promise.race([promessa, new Promise((_, falha) => setTimeout(() => falha(new Error('prazo')), ms))]);
}

// Tela sempre acesa enquanto se joga: o celular que apaga sozinho perde a
// vez e o telão que apaga para a mesa inteira.
let _telaAcesa = null;
async function mantemTelaAcesa() {
    try {
        if (_telaAcesa || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
        _telaAcesa = await navigator.wakeLock.request('screen');
        _telaAcesa.addEventListener('release', () => { _telaAcesa = null; });
    } catch (e) { _telaAcesa = null; }
}
function soltaTelaAcesa() {
    try { if (_telaAcesa) _telaAcesa.release(); } catch (e) {}
    _telaAcesa = null;
}
document.addEventListener('visibilitychange', () => {
    if (currentRoom && document.visibilityState === 'visible') mantemTelaAcesa();
});

// ============================================
// A SALA
// ============================================

const nomesDe = (sala) => Object.keys((sala && sala.players) || {}).filter(n => sala.players[n]).sort();
const jogadoresDe = (sala) => nomesDe(sala).map(n => sala.players[n]);
const lista = (v) => (Array.isArray(v) ? v : Object.values(v || {})).filter(x => x != null);
const fimDeJogo = (st) => typeof st === 'string' && st.indexOf('gameover') === 0;
const mmss = (ms) => {
    const s = Math.ceil(Math.max(0, ms) / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
};

// O que identifica "a mesma tela": quando isto muda, a rota redesenha.
// (O xerife e as rejeições entram porque a vez pode passar sem o status
// mudar, quando o tempo do xerife acaba no Modo Party.)
const chaveDaFase = (sala) => [sala.status, sala.partida || 0, sala.currentMissionIndex || 0,
    sala.rejectedTeams || 0, sala.currentSheriffName || ''].join('|');

function proximoXerife(sala) {
    const nomes = nomesDe(sala);
    const i = (nomes.indexOf(sala.currentSheriffName) + 1) % nomes.length;
    sala.currentSheriffName = nomes[i];
    sala.currentSheriffIndex = i;
}

// Aplica `muda` na sala só se ela ainda estiver na fase `fase` (e se `muda`
// não devolver false). Tudo numa transação: dois aparelhos avançando juntos
// ou um toque duplo não andam duas casas.
function avancaSala(code, fase, muda) {
    return db.ref('rooms/' + code).transaction(sala => {
        if (!sala) return sala;
        if (fase && chaveDaFase(sala) !== fase) return;
        if (muda(sala) === false) return;
        return sala;
    }, undefined, false).catch(e => { console.warn('Saloon: sala não avançou', e); return null; });
}

// Tudo o que é de uma partida (o que fica: jogadores, extras, Modo Party).
const CAMPOS_DA_PARTIDA = ['ready', 'votes', 'proposedTeam', 'missionChoices', 'missionResult',
    'missionResults', 'duel', 'duelResult', 'pickEndTime', 'voteEndTime', 'revolverOwnerName',
    'revolverPreviousOwnerName', 'delegadoName', 'delegadoTargetName', 'escrivaoName', 'escrivaoNames',
    'falsificadorName', 'bossTarget', 'currentSheriffName', 'currentSheriffIndex',
    'currentMissionIndex', 'rejectedTeams'];
function limpaPartida(sala) {
    CAMPOS_DA_PARTIDA.forEach(c => { delete sala[c]; });
    jogadoresDe(sala).forEach(p => {
        delete p.role;
        p.isBoss = p.isDelegado = p.isEscrivao = p.isFalsificador = false;
    });
}

// Sorteia os papéis (mesmas regras do jogo local, ver initializeGame).
function sorteiaPapeis(sala) {
    const nomes = nomesDe(sala);
    const n = nomes.length;
    const cfg = GAME_CONFIG[n];
    const ex = sala.extras || {};
    const extras = { roles: !!ex.roles, revolver: !!ex.revolver };
    extras.farsante = extras.roles && !!ex.farsante;
    const sorteia = (arr) => arr[Math.floor(Math.random() * arr.length)];

    limpaPartida(sala);
    const papeis = shuffle(nomes.map((_, i) => i < cfg.outlaws ? 'OUTLAW' : 'LAW'));
    nomes.forEach((nome, i) => { sala.players[nome].role = papeis[i]; });
    const fora = nomes.filter((_, i) => papeis[i] === 'OUTLAW');
    const lei  = nomes.filter((_, i) => papeis[i] === 'LAW');

    if (extras.roles) {
        const chefe = sorteia(fora);
        const delegado = sorteia(lei);
        const comuns = fora.filter(x => x !== chefe);
        let alvo = sorteia(comuns);
        sala.players[chefe].isBoss = true;
        sala.players[delegado].isDelegado = true;
        sala.delegadoName = delegado;
        if (extras.farsante) {
            // Falsificador: um fora da lei comum; Escrivão: alguém da Lei que
            // não é o Delegado. O Delegado não enxerga o Falsificador.
            const falsificador = sorteia(comuns);
            const escrivao = sorteia(lei.filter(x => x !== delegado));
            sala.players[falsificador].isFalsificador = true;
            sala.players[escrivao].isEscrivao = true;
            sala.falsificadorName = falsificador;
            sala.escrivaoName = escrivao;
            const visiveis = comuns.filter(x => x !== falsificador);
            alvo = visiveis.length ? sorteia(visiveis) : chefe;
            sala.escrivaoNames = shuffle([delegado, falsificador]);
        }
        sala.delegadoTargetName = alvo;
    }
    if (extras.revolver) sala.revolverOwnerName = sorteia(nomes);

    const xerife = Math.floor(Math.random() * n);
    sala.currentSheriffName = nomes[xerife];
    sala.currentSheriffIndex = xerife;
    sala.currentMissionIndex = 0;
    sala.rejectedTeams = 0;
    sala.extras = extras;
    sala.partida = (sala.partida || 0) + 1;
    sala.status = 'revealing';
}

// ── Passagens de fase (cada uma devolve false se não vale mais) ──

function irAoTabuleiro(sala) {
    if (sala.status !== 'revealing') return false;
    if (!nomesDe(sala).every(n => sala.ready && sala.ready[n])) return false;
    delete sala.ready;
    sala.status = 'board';
}

// forca: o tempo da votação acabou no Modo Party (a equipe é aprovada).
function aplicaVotacao(sala, forca) {
    if (sala.status !== 'voting') return false;
    const nomes = nomesDe(sala);
    const votos = sala.votes || {};
    const sim = nomes.filter(n => votos[n] === 'yes').length;
    const aprovada = forca || sim >= Math.floor(nomes.length / 2) + 1;
    ['votes', 'voteEndTime', 'pickEndTime'].forEach(c => { delete sala[c]; });
    if (aprovada) {
        // Como no jogo local: a equipe aprovada zera as rejeições (a derrota
        // é por 5 rejeitadas SEGUIDAS).
        sala.rejectedTeams = 0;
        delete sala.missionChoices;
        sala.status = 'mission';
    } else {
        sala.rejectedTeams = (sala.rejectedTeams || 0) + 1;
        delete sala.proposedTeam;
        proximoXerife(sala);
        sala.status = sala.rejectedTeams >= 5 ? 'gameover_outlaw' : 'board';
    }
}

function fechaMissao(sala) {
    if (sala.status !== 'mission') return false;
    const equipe = lista(sala.proposedTeam);
    const escolhas = sala.missionChoices || {};
    if (!equipe.length || !equipe.every(n => escolhas[n])) return false;
    sala.missionResult = {
        sabotages: equipe.filter(n => escolhas[n] === 'sabotage').length,
        missionIndex: sala.currentMissionIndex || 0,
        total: equipe.length
    };
    // Quem sabotou não fica guardado na sala.
    delete sala.missionChoices;
    sala.status = 'missionResult';
}

function missaoCumprida(sala, res) {
    const cfg = GAME_CONFIG[nomesDe(sala).length];
    return (res.sabotages || 0) < (cfg.twoFailsRequired === (res.missionIndex || 0) ? 2 : 1);
}

function aplicaResultadoMissao(sala) {
    const res = sala.missionResult;
    if (sala.status !== 'missionResult' || !res) return false;
    const idx = res.missionIndex || 0;
    const resultados = Object.assign({}, sala.missionResults);
    resultados[idx] = missaoCumprida(sala, res);
    sala.missionResults = resultados;
    ['missionChoices', 'proposedTeam', 'missionResult', 'votes', 'pickEndTime', 'voteEndTime']
        .forEach(c => { delete sala[c]; });
    proximoXerife(sala);
    const valores = Object.values(resultados);
    const lei  = valores.filter(r => r === true).length;
    const fora = valores.filter(r => r === false).length;
    if (lei >= 3) {
        sala.status = sala.extras && sala.extras.roles ? 'boss_assassination' : 'gameover_law';
    } else if (fora >= 3) {
        sala.status = 'gameover_outlaw_missions';
    } else if ((idx === 1 || idx === 2) && sala.extras && sala.extras.revolver && sala.revolverOwnerName) {
        sala.currentMissionIndex = idx;
        sala.status = 'duel_choose';
    } else {
        sala.currentMissionIndex = idx + 1;
        sala.status = 'board';
    }
}

function fechaDuelo(sala) {
    const d = sala.duel;
    if (sala.status !== 'duel_action' || !d || !d.shooterAction || !d.targetAction) return false;
    const a = d.shooterAction === 'shoot', b = d.targetAction === 'shoot';
    // Só o desfecho fica na sala, não quem fez o quê.
    sala.duelResult = {
        shooterName: d.shooterName,
        targetName: d.targetName,
        tipo: a && b ? 'ambos_atiraram' : (!a && !b ? 'ambos_abaixaram' : 'traicao'),
        hasIntimidation: a === b
    };
    sala.revolverOwnerName = d.targetName;
    sala.revolverPreviousOwnerName = d.shooterName;
    delete sala.duel;
    sala.status = 'duel_result';
}

function fimDoDuelo(sala) {
    if (sala.status !== 'duel_choose' && sala.status !== 'duel_result') return false;
    sala.currentMissionIndex = (sala.currentMissionIndex || 0) + 1;
    delete sala.duel;
    delete sala.duelResult;
    sala.status = 'board';
}

function novaPartida(sala) {
    if (!fimDeJogo(sala.status)) return false;
    limpaPartida(sala);
    sala.status = 'waiting';
}

const DUELO_TEXTO = { ambos_atiraram: 'duel_both_shot', ambos_abaixaram: 'duel_both_down', traicao: 'duel_mixed' };
const DESFECHOS = {
    gameover_law:             ['LAW',    'win_law_missions'],
    gameover_outlaw:          ['OUTLAW', 'win_outlaw_rejects'],
    gameover_outlaw_missions: ['OUTLAW', 'win_outlaw_missions'],
    gameover_boss_win:        ['OUTLAW', 'win_boss_shot'],
    gameover_boss_fail:       ['LAW',    'win_boss_missed'],
};

// ============================================
// ESCUTAR A SALA
// ============================================

let salaRef = null, salaCb = null;
let salaAtual = null;    // último estado recebido
let faseAtual = null;    // chaveDaFase do que está desenhado
let vivo = {};           // o que já aconteceu nesta fase (zera a cada rota)

// Relógios de uma fase: somem quando a fase muda.
const _relogios = new Set();
function agenda(fn, ms) {
    const id = setTimeout(() => { _relogios.delete(id); fn(); }, ms);
    _relogios.add(id);
    return id;
}
function repete(fn, ms) {
    const id = setInterval(fn, ms);
    _relogios.add(id);
    return id;
}
function limpaRelogios() {
    _relogios.forEach(id => { clearTimeout(id); clearInterval(id); });
    _relogios.clear();
}

function escutaSala(code, aoMudar) {
    paraDeEscutar();
    salaRef = db.ref('rooms/' + code);
    salaCb = salaRef.on('value', snap => aoMudar(snap.val()), () => aoMudar(null));
    mantemTelaAcesa();
}

function paraDeEscutar() {
    if (salaRef && salaCb) salaRef.off('value', salaCb);
    salaRef = salaCb = null;
    salaAtual = faseAtual = null;
    vivo = {};
    limpaRelogios();
}

// A sala sumiu ou este aparelho não está mais nela.
function salaSumiu(msg) {
    const eraTelao = isScreenDevice;
    paraDeEscutar();
    soltaTelaAcesa();
    currentRoom = null;
    myRoleData = null;
    isScreenDevice = false;
    esqueceSessao();
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw', 'is-screen', 'suspense-dim');
    showScreen(eraTelao ? 'screen-mode-select' : 'screen-online-lobby', 'volta');
    if (msg) avisar(msg);
}

// ============================================
// ENTRAR, SAIR E VOLTAR
// ============================================

let ocupado = false;   // evita criar/entrar duas vezes com toque duplo

async function criaSala() {
    if (ocupado) return;
    ocupado = true;
    const nome = onlineProfile.name;
    try {
        for (let tentativa = 0; tentativa < 6; tentativa++) {
            const code = novoCodigo();
            const sala = {
                host: nome,
                hostAvatar: onlineProfile.avatar,
                screenMode: false,
                status: 'waiting',
                criadaEm: Date.now(),
                extras: { roles: false, revolver: false, farsante: false },
                players: { [nome]: { name: nome, avatar: onlineProfile.avatar, isHost: true, id: MEU_ID } }
            };
            const r = await comPrazo(db.ref('rooms/' + code)
                .transaction(atual => atual === null ? sala : undefined, undefined, false));
            if (r && r.committed) return entraNaSala(code);
        }
        avisar(t('no_connection'));
    } catch (e) {
        avisar(t('no_connection'));
    } finally {
        ocupado = false;
    }
}

// Entra numa sala pelo código (botão "Entrar" e link/QR de sala).
async function joinRoomByCode(code) {
    code = limpaCodigo(code);
    if (!code) return avisar(t('type_code'));
    if (ocupado) return;
    ocupado = true;
    const nome = onlineProfile.name;
    try {
        const sala = (await comPrazo(db.ref('rooms/' + code).once('value'))).val();
        if (!sala || !sala.status) return avisar(t('room_not_found'));
        const eu = sala.players && sala.players[nome];
        if (eu) {
            // O nome já está na sala: é este aparelho voltando, ou alguém
            // voltando por outro aparelho no meio da partida.
            if (eu.id !== MEU_ID) {
                if (sala.status === 'waiting') return avisar(t('name_taken', { name: nome }));
                const sim = await perguntar({
                    titulo: t('rejoin_other_title', { name: nome }), texto: t('rejoin_other_text'),
                    sim: t('rejoin_other_yes'), nao: t('rejoin_no')
                });
                if (!sim) return;
                await comPrazo(db.ref('rooms/' + code + '/players/' + nome + '/id').set(MEU_ID));
            }
            onlineProfile.avatar = eu.avatar || onlineProfile.avatar;
            return entraNaSala(code);
        }
        if (sala.status !== 'waiting') return avisar(t('match_started'));
        if (nomesDe(sala).length >= MAX_ONLINE) return avisar(t('room_full'));
        const r = await comPrazo(db.ref('rooms/' + code + '/players/' + nome).transaction(atual => atual === null
            ? { name: nome, avatar: onlineProfile.avatar, isHost: false, id: MEU_ID } : undefined, undefined, false));
        if (!r || !r.committed) return avisar(t('name_taken', { name: nome }));
        entraNaSala(code);
    } catch (e) {
        avisar(t('no_connection'));
    } finally {
        ocupado = false;
    }
}

// Liga este celular à sala. A partir daqui, a tela segue a sala.
function entraNaSala(code) {
    currentRoom = code;
    isScreenDevice = false;
    myRoleData = null;
    guardaSessao();
    guarda.grava('saloon-perfil', { name: onlineProfile.name, avatar: onlineProfile.avatar });
    limpaHash();
    showHamburger();
    document.getElementById('room-code-display').innerText = code;
    escutaSala(code, sala => {
        if (!sala || !sala.status) return salaSumiu(t('room_closed'));
        const eu = sala.players && sala.players[onlineProfile.name];
        if (!eu) return salaSumiu(t('removed_from_room'));
        if (eu.id && eu.id !== MEU_ID) return salaSumiu(t('replaced_device'));
        salaAtual = sala;
        const fase = chaveDaFase(sala);
        if (fase !== faseAtual) {
            const de = faseAtual;
            faseAtual = fase;
            vivo = {};
            limpaRelogios();
            rota(code, sala, de);
        }
        aoVivo(code, sala);
    });
}

// Sair por vontade própria. No meio da partida a vaga continua na sala
// (dá para voltar com o mesmo nome); na espera ou no fim, a vaga sai e,
// se era o anfitrião, passa para outro jogador.
function saiDaSala() {
    const code = currentRoom, sala = salaAtual, eu = onlineProfile.name;
    paraDeEscutar();
    soltaTelaAcesa();
    currentRoom = null;
    myRoleData = null;
    esqueceSessao();
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    if (!code || (sala && sala.status !== 'waiting' && !fimDeJogo(sala.status))) return;
    db.ref('rooms/' + code).transaction(s => {
        if (!s) return s;
        if (!s.players || !s.players[eu] || (s.players[eu].id && s.players[eu].id !== MEU_ID)) return;
        const eraAnfitriao = s.players[eu].isHost;
        delete s.players[eu];
        const resto = nomesDe(s);
        if (!resto.length && !s.screenMode) return null;   // o último a sair fecha a sala
        if (eraAnfitriao && resto.length) {
            s.players[resto[0]].isHost = true;
            s.host = resto[0];
        }
        return s;
    }, undefined, false).catch(() => {});
}

// Pergunta se volta para a sala em que este aparelho estava.
async function ofereceVoltar(pendente) {
    const s = sessaoGuardada();
    if (!s || (pendente && pendente !== s.code)) return false;
    let sala;
    try { sala = (await comPrazo(db.ref('rooms/' + s.code).once('value'), 8000)).val(); } catch (e) { return false; }
    const eu = sala && sala.players && sala.players[s.name];
    const valida = sala && sala.status && (s.tela ? sala.screenMode : (eu && eu.id === MEU_ID));
    if (!valida) { esqueceSessao(); return false; }
    if (currentRoom) return false;   // já entrou por outro caminho enquanto esperava
    const sim = await perguntar({
        titulo: t('rejoin_title', { code: s.code }),
        texto: s.tela ? t('rejoin_text_screen') : t('rejoin_text', { name: s.name }),
        sim: t('rejoin_yes'), nao: t('rejoin_no')
    });
    if (!sim || currentRoom) { if (!sim) esqueceSessao(); return false; }
    onlineProfile = { name: s.name, avatar: s.avatar || AVATARES[0] };
    AudioManager.startBGM();
    showHamburger();
    if (s.tela) listenToRoomAsScreen(s.code);
    else entraNaSala(s.code);
    return true;
}

// ============================================
// ROTA: A SALA DIZ QUAL TELA MOSTRAR
// ============================================

function rota(code, sala, de) {
    document.querySelectorAll('.phone-mini-timer').forEach(p => { p.style.display = 'none'; });
    const st = sala.status;
    if (st !== 'waiting') garanteMinhaCarta(sala);
    if (st === 'waiting')                 return mostraSalaDeEspera(code, sala);
    if (st === 'revealing')               return mostraRevelacao(code, sala, de);
    if (st === 'board')                   return mostraTabuleiro(code, sala);
    if (st === 'voting')                  return mostraVotacao(code, sala);
    if (st === 'mission')                 return mostraMissao(code, sala);
    if (st === 'missionResult')           return sala.screenMode ? showPhoneSummary(code) : mostraResultadoMissao(code, sala);
    if (st === 'duel_choose')             return mostraDueloEscolha(code, sala);
    if (st === 'duel_action')             return mostraDueloAcao(code, sala);
    if (st === 'duel_result')             return mostraDueloResultado(code, sala);
    if (st === 'boss_assassination')      return mostraChefe(code, sala);
    if (fimDeJogo(st))                    return mostraFimDeJogo(code, sala);
}

// Volta para a tela da fase atual (depois de rever a carta, por exemplo).
function voltaParaFase() {
    if (currentRoom && salaAtual && !isScreenDevice) rota(currentRoom, salaAtual, null);
}

// O que muda dentro de uma mesma fase: listas, contagens, e as passagens
// que qualquer aparelho pode fazer quando todos já escolheram.
function aoVivo(code, sala) {
    const st = sala.status, eu = onlineProfile.name, fase = faseAtual;
    const nomes = nomesDe(sala);
    const tenta = (tipo, muda) => {
        if (vivo[tipo]) return;
        vivo[tipo] = true;
        avancaSala(code, fase, muda);
    };

    if (st === 'waiting') return renderSalaDeEspera(sala);

    if (st === 'revealing') {
        const faltam = nomes.filter(n => !(sala.ready && sala.ready[n]));
        document.getElementById('online-ready-count').innerText =
            t('ready_count', { ready: nomes.length - faltam.length, total: nomes.length });
        mostraFaltam('online-ready-faltam', faltam);
        if (!faltam.length) tenta('tabuleiro', irAoTabuleiro);
        return;
    }

    if (st === 'board') {
        if (sala.screenMode && sala.currentSheriffName === eu && sala.pickEndTime && vivo.relogio !== sala.pickEndTime) {
            vivo.relogio = sala.pickEndTime;
            relogioCelular('phone-pick-timer', document.getElementById('online-sheriff-area'), sala.pickEndTime);
        }
        return;
    }

    if (st === 'voting') {
        const votos = sala.votes || {};
        const faltam = nomes.filter(n => !votos[n]);
        if (sala.screenMode) {
            if (sala.voteEndTime && vivo.relogio !== sala.voteEndTime) {
                vivo.relogio = sala.voteEndTime;
                relogioCelular('phone-mini-timer', document.getElementById('screen-online-voting'), sala.voteEndTime);
            }
            return;
        }
        document.getElementById('online-votes-count').innerText =
            t('votes_count', { count: nomes.length - faltam.length, total: nomes.length });
        mostraFaltam('online-votes-faltam', faltam);
        if (!faltam.length && !vivo.resultado) {
            vivo.resultado = true;
            agenda(() => mostraResultadoVotacao(code, salaAtual, fase), REDUCED_MOTION ? 0 : 800);
        }
        return;
    }

    if (st === 'mission') {
        const escolhas = sala.missionChoices || {};
        const equipe = lista(sala.proposedTeam);
        const faltam = equipe.filter(n => !escolhas[n]);
        mostraFaltam('online-mission-faltam', faltam);
        if (equipe.length && !faltam.length) tenta('missao', fechaMissao);
        return;
    }

    if (st === 'duel_action') {
        const d = sala.duel;
        if (d && d.shooterAction && d.targetAction) tenta('duelo', fechaDuelo);
    }
}

// "Esperando: Ana, Beto" — para a mesa saber quem está segurando o jogo.
function mostraFaltam(id, nomes) {
    const el = document.getElementById(id);
    if (el) el.textContent = nomes.length ? t('waiting_for', { names: nomes.join(', ') }) : '';
}

// Relógio pequeno do Modo Party no celular (o telão é quem manda no tempo).
function relogioCelular(id, dentroDe, fim) {
    if (!dentroDe) return;
    let pill = document.getElementById(id);
    if (!pill) {
        pill = document.createElement('div');
        pill.id = id;
        pill.className = 'phone-mini-timer';
    }
    dentroDe.insertBefore(pill, dentroDe.firstChild);
    const pinta = () => {
        const resta = fim - Date.now();
        pill.textContent = '⏱ ' + mmss(resta);
        pill.style.display = resta > 0 ? '' : 'none';
    };
    pinta();
    repete(pinta, 250);
}

// ============================================
// SALA DE ESPERA
// ============================================

const souAnfitriao = () => {
    const eu = salaAtual && salaAtual.players && salaAtual.players[onlineProfile.name];
    return !!(eu && eu.isHost);
};

function mostraSalaDeEspera(code, sala) {
    myRoleData = null;
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    document.getElementById('room-code-display').innerText = code;
    showScreen('screen-online-waiting');
}

function renderSalaDeEspera(sala) {
    const jogadores = jogadoresDe(sala);
    const ul = document.getElementById('waiting-players-list');
    ul.innerHTML = jogadores.map(p =>
        `<li class="jogador-sala"><img class="av" src="${esc(p.avatar || AVATARES[0])}" alt="">`
        + `<span class="nome">${esc(p.name)}</span>${p.isHost ? '<span class="anfitriao">★</span>' : ''}</li>`).join('');

    const anfitriao = souAnfitriao();
    const n = jogadores.length;
    const btn = document.getElementById('btn-start-online-game');
    btn.classList.toggle('hidden', !anfitriao);
    btn.disabled = n < 5;
    btn.innerText = n < 5 ? t('waiting_players', { count: n }) : t('start_match');

    const espera = document.getElementById('online-waiting-host');
    const dono = jogadores.find(p => p.isHost);
    const texto = sala.screenMode ? t('waiting_screen_start') : (dono && !anfitriao ? t('waiting_host', { name: dono.name }) : '');
    espera.innerText = texto;
    espera.classList.toggle('hidden', !texto);

    document.getElementById('online-card-party-wrap').classList.toggle('hidden', !anfitriao || !!sala.screenMode);
    document.getElementById('online-chk-party').classList.toggle('checked-visual', !!sala.screenMode);

    const ex = sala.extras || {};
    document.getElementById('online-chk-roles').classList.toggle('checked-visual', !!ex.roles);
    document.getElementById('online-chk-revolver').classList.toggle('checked-visual', !!ex.revolver);
    document.getElementById('online-chk-farsante').classList.toggle('checked-visual', !!ex.farsante && !!ex.roles);
    document.getElementById('online-card-farsante').classList.toggle('disabled-card', !ex.roles);
    // Quem não é o anfitrião vê as expansões, mas não mexe.
    document.querySelector('#screen-online-waiting .extras-sala').classList.toggle('so-ver', !anfitriao);
}

// Só o anfitrião, só na espera.
function mudaExtras(muda) {
    if (!currentRoom || !souAnfitriao() || salaAtual.status !== 'waiting') return;
    avancaSala(currentRoom, null, sala => {
        if (sala.status !== 'waiting') return false;
        sala.extras = Object.assign({ roles: false, revolver: false, farsante: false }, sala.extras);
        return muda(sala.extras);
    });
}

// MODO PARTY: este aparelho vira o telão e sai da lista de jogadores.
async function ligaModoParty() {
    if (!currentRoom || !souAnfitriao() || salaAtual.status !== 'waiting' || salaAtual.screenMode) return;
    const sim = await perguntar({
        titulo: t('party_confirm_title'), texto: t('party_confirm_text'),
        sim: t('party_confirm_yes'), nao: t('party_confirm_no')
    });
    if (!sim || !currentRoom) return;
    const code = currentRoom, eu = onlineProfile.name;
    paraDeEscutar();
    const r = await db.ref('rooms/' + code).transaction(s => {
        if (!s) return s;
        if (s.status !== 'waiting' || !s.players || !s.players[eu] || !s.players[eu].isHost) return;
        delete s.players[eu];
        delete s.host;
        s.screenMode = true;
        return s;
    }, undefined, false).catch(() => null);
    if (r && r.committed && r.snapshot.val()) listenToRoomAsScreen(code);
    else entraNaSala(code);
}

// ============================================
// A CARTA
// ============================================

// Monta a carta deste jogador a partir da sala (mesmos dados do jogo local).
function montaMinhaCarta(sala) {
    const eu = onlineProfile.name;
    const p = sala.players[eu];
    let suitKey = p.role;
    if (p.isDelegado) suitKey = 'DELEGADO';
    else if (p.isBoss) suitKey = 'BOSS';
    else if (p.isEscrivao) suitKey = 'ESCRIVAO';
    else if (p.isFalsificador) suitKey = 'FALSIFICADOR';

    const carta = { team: p.role, suitKey, hasRevolver: sala.revolverOwnerName === eu, partida: sala.partida || 0 };
    if (p.role === 'LAW') {
        carta.desc1 = t('law_desc1');
        carta.desc2 = t('law_desc2');
        if (p.isDelegado) {
            carta.name = t('role_delegado');
            if (sala.delegadoTargetName) carta.delegateHtml = t('delegate_notice', { name: esc(sala.delegadoTargetName) });
        } else if (p.isEscrivao) {
            carta.name = t('role_escrivao');
            carta.desc1 = t('escrivao_desc1');
            carta.desc2 = '';
            const dois = lista(sala.escrivaoNames);
            if (dois.length === 2) carta.escrivaoNames = dois.map(esc);
        } else {
            carta.name = t('role_law');
        }
    } else {
        carta.desc1 = t('outlaw_desc1');
        if (p.isBoss) {
            carta.name = t('role_boss');
            carta.desc2 = t('boss_desc2');
        } else if (p.isFalsificador) {
            carta.name = t('role_falsificador');
            carta.desc2 = t('falsificador_desc2');
            carta.falsificadorNotice = true;
        } else {
            carta.name = t('role_outlaw');
            carta.desc2 = t('outlaw_desc2');
        }
        // Todo fora da lei vê os comparsas.
        carta.outlaws = jogadoresDe(sala).filter(op => op.role === 'OUTLAW' && op.name !== eu)
            .map(op => esc(op.name) + (op.isBoss ? ' ' + t('boss_tagged') : ''));
    }
    return carta;
}

function garanteMinhaCarta(sala) {
    const p = sala.players && sala.players[onlineProfile.name];
    if (!p || !p.role) return;
    if (!myRoleData || myRoleData.partida !== (sala.partida || 0)) myRoleData = montaMinhaCarta(sala);
}

function mostraRevelacao(code, sala, de) {
    if (sala.ready && sala.ready[onlineProfile.name]) return mostraEsperaDasCartas(code);
    const fase = faseAtual;
    const abre = () => { if (faseAtual === fase && currentRoom === code) mostrarMinhaCarta(code, true); };
    // Saindo da sala de espera, a tela escurece antes da carta.
    if (de && de.split('|')[0] === 'waiting') fadeToBlack(abre);
    else abre();
}

function mostraEsperaDasCartas(code) {
    showScreen('screen-online-reveal-wait');
    document.getElementById('online-btn-review-card').onclick = () => mostrarMinhaCarta(code, false);
}

// A carta na mesa, direto: cada um está no próprio celular, então não há
// "passe o celular". Ao esconder pela primeira vez, marca o jogador como
// pronto. Se a fase mudou enquanto a carta estava aberta, segue para ela.
function mostrarMinhaCarta(code, marcarPronto) {
    if (!myRoleData) return voltaParaFase();
    const fase = faseAtual;
    showScreen('screen-mesa');
    runRevealScene(myRoleData, onlineProfile.name, () => {
        if (currentRoom !== code) return;
        if (marcarPronto) db.ref('rooms/' + code + '/ready/' + onlineProfile.name).set(true);
        if (faseAtual === fase && salaAtual && salaAtual.status === 'revealing') mostraEsperaDasCartas(code);
        else voltaParaFase();
    }, { direto: true, rotuloFim: t('hide_card_only') });
}

// ============================================
// TABULEIRO
// ============================================

function mostraTabuleiro(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const jogadores = jogadoresDe(sala);
    const cfg = GAME_CONFIG[jogadores.length];
    const idx = sala.currentMissionIndex || 0;
    const tamanho = cfg.missions[idx];
    const xerife = sala.currentSheriffName;
    const souXerife = xerife === eu;

    // MODO PARTY: fora da vez, o celular mostra o resumo (a mesa está no telão).
    if (sala.screenMode && !souXerife) return showPhoneSummary(code);

    showScreen('screen-online-board');
    buildMissionTrack(document.getElementById('online-mission-track-container'), cfg.missions,
        sala.missionResults || {}, idx, cfg.twoFailsRequired === undefined ? -1 : cfg.twoFailsRequired, -1);

    // Como no jogo local: o placar de rejeições só aparece depois da primeira.
    const rejeitadas = sala.rejectedTeams || 0;
    document.getElementById('online-reject-count').innerText = rejeitadas;
    document.getElementById('online-reject-dots-container').innerHTML =
        [0, 1, 2, 3, 4].map(i => `<div class="reject-dot">${rejectChipSVG(i < rejeitadas)}</div>`).join('');
    document.querySelector('#screen-online-board .reject-track').classList.toggle('hidden', !rejeitadas);
    document.getElementById('online-sheriff-name').innerText = xerife;
    document.getElementById('online-board-instruction').innerHTML = t('sheriff_must_n', { size: tamanho, num: idx + 1 });

    document.getElementById('online-sheriff-area').classList.toggle('hidden', !souXerife);
    document.getElementById('online-waiting-area').classList.toggle('hidden', souXerife);
    if (!souXerife) {
        document.getElementById('online-waiting-text').innerText = t('building_team', { name: xerife, num: idx + 1 });
        return;
    }

    document.getElementById('online-sheriff-instruction').innerText = t('select_team');
    const escolhidos = [];
    const botao = document.getElementById('online-btn-propose');
    botao.disabled = true;
    const listaEl = document.getElementById('online-team-select-list');
    listaEl.innerHTML = '';
    jogadores.forEach(p => {
        const div = document.createElement('div');
        div.className = 'selectable-item has-avatar';
        div.setAttribute('role', 'checkbox');
        div.setAttribute('aria-checked', 'false');
        div.innerHTML = `<div class="avatar-wrap"><img src="${esc(p.avatar || AVATARES[0])}" alt=""></div><span class="player-name">${esc(p.name)}</span>`;
        div.onclick = () => {
            const pos = escolhidos.indexOf(p.name);
            if (pos >= 0) {
                escolhidos.splice(pos, 1);
                div.classList.remove('selected');
            } else if (escolhidos.length < tamanho) {
                escolhidos.push(p.name);
                div.classList.add('selected');
            }
            botao.disabled = escolhidos.length !== tamanho;
        };
        listaEl.appendChild(div);
    });
    botao.onclick = () => {
        if (escolhidos.length !== tamanho) return;
        botao.disabled = true;
        avancaSala(code, fase, s => {
            if (s.status !== 'board' || s.currentSheriffName !== eu) return false;
            s.proposedTeam = escolhidos.slice();
            ['votes', 'pickEndTime', 'voteEndTime'].forEach(c => { delete s[c]; });
            s.status = 'voting';
        });
    };
}

// ============================================
// VOTAÇÃO
// ============================================

function mostraVotacao(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    showScreen('screen-online-voting');
    document.getElementById('online-voting-team').innerHTML =
        lista(sala.proposedTeam).map(n => `<li><span>${esc(n)}</span></li>`).join('');

    const votos = sala.votes || {};
    // O xerife aprova a própria equipe.
    if (sala.currentSheriffName === eu && !votos[eu]) db.ref('rooms/' + code + '/votes/' + eu).set('yes');
    const jaVotou = !!votos[eu] || sala.currentSheriffName === eu;
    const area = document.getElementById('online-vote-area');
    const msg = document.getElementById('online-voted-msg');
    area.classList.toggle('hidden', jaVotou);
    msg.classList.toggle('hidden', !jaVotou);

    const vota = (voto) => {
        if (faseAtual !== fase) return;
        db.ref('rooms/' + code + '/votes/' + eu).set(voto);
        area.classList.add('hidden');
        msg.classList.remove('hidden');
    };
    document.getElementById('online-btn-vote-yes').onclick = () => vota('yes');
    document.getElementById('online-btn-vote-no').onclick = () => vota('no');

    // No Modo Party a contagem e o resultado aparecem no telão.
    document.getElementById('online-votes-count').style.display = sala.screenMode ? 'none' : '';
    document.getElementById('online-votes-faltam').style.display = sala.screenMode ? 'none' : '';
}

function mostraResultadoVotacao(code, sala, fase) {
    if (faseAtual !== fase || !sala) return;
    const eu = onlineProfile.name;
    showScreen('screen-online-vote-result');
    const nomes = nomesDe(sala);
    const votos = sala.votes || {};
    const sim = nomes.filter(n => votos[n] === 'yes');
    const nao = nomes.filter(n => votos[n] === 'no');
    const aprovada = sim.length >= Math.floor(nomes.length / 2) + 1;

    const titulo = document.getElementById('online-vote-outcome');
    titulo.innerText = aprovada ? t('approved_team') : t('rejected_team');
    titulo.className = 'display text-center neon-text ' + (aprovada ? 'blue' : 'red');
    document.getElementById('online-yes-list').innerHTML = sim.map(n => `<li>${esc(n)}</li>`).join('');
    document.getElementById('online-no-list').innerHTML = nao.map(n => `<li>${esc(n)}</li>`).join('');

    // Só o xerife avança.
    const souXerife = sala.currentSheriffName === eu;
    const btn = document.getElementById('online-btn-vote-next');
    const espera = document.getElementById('online-vote-waiting');
    btn.classList.toggle('hidden', !souXerife);
    btn.disabled = false;
    espera.classList.toggle('hidden', souXerife);
    espera.innerText = t('waiting_name_continue', { name: sala.currentSheriffName });
    btn.onclick = () => {
        btn.disabled = true;
        avancaSala(code, fase, s => aplicaVotacao(s, false));
    };
}

// ============================================
// MISSÃO
// ============================================

function esperaMissao(sala, texto) {
    showScreen('screen-online-mission');
    document.getElementById('online-mission-waiting-text').innerText = texto;
    document.getElementById('online-mission-wait-num').innerText = t('mission_n', { n: (sala.currentMissionIndex || 0) + 1 });
}

function mostraMissao(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const equipe = lista(sala.proposedTeam);
    if (!equipe.includes(eu)) {
        // MODO PARTY: quem não foi para a missão acompanha pelo telão.
        return sala.screenMode ? showPhoneSummary(code) : esperaMissao(sala, t('waiting_mission_result'));
    }
    if (sala.missionChoices && sala.missionChoices[eu]) return esperaMissao(sala, t('choice_registered'));

    // Quem está na equipe escolhe a ficha na mesa, como no jogo local — sem
    // o "passe o celular", porque o celular já é dele.
    const ehLei = sala.players[eu].role === 'LAW';
    showScreen('screen-mesa');
    mesaDireto('mesa-fichas', () => renderChipTable({
        rowId: 'mission-chip-row',
        warnId: 'mission-law-warning',
        confirmId: 'mission-confirm',
        nextBtnId: null,
        isLaw: ehLei,
        onChoice: (cumprir) => {
            if (faseAtual !== fase) return;
            db.ref('rooms/' + code + '/missionChoices/' + eu).set(cumprir ? 'success' : 'sabotage');
            // Depois das fichas recolherem, vai para a espera — a não ser
            // que o resultado já tenha chegado.
            agenda(() => {
                if (faseAtual === fase && document.getElementById('screen-mesa').classList.contains('active')) {
                    esperaMissao(salaAtual, t('choice_registered'));
                }
            }, REDUCED_MOTION ? 0 : 1900);
        },
        onNext: () => {}
    }));
}

function mostraResultadoMissao(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    showScreen('screen-online-mission-result');
    const res = sala.missionResult || { sabotages: 0, missionIndex: sala.currentMissionIndex || 0 };
    const cfg = GAME_CONFIG[nomesDe(sala).length];
    const sabotagens = res.sabotages || 0;
    const espera = document.getElementById('online-mission-result-waiting');
    espera.classList.add('hidden');

    playMissionResult({
        rowId: 'online-result-chip-row',
        boardId: 'online-sabotage-board',
        numId: 'online-mission-sabotage-count',
        outcomeId: 'online-mission-outcome',
        loreId: 'online-mission-outcome-lore',
        nextBtnId: 'online-btn-mission-next',
        sabotages: sabotagens,
        total: res.total || cfg.missions[res.missionIndex || 0],
        missionSuccess: missaoCumprida(sala, res),
        onNext: () => avancaSala(code, fase, aplicaResultadoMissao)
    });

    // O botão só existe para o xerife; os outros esperam por ele.
    const souXerife = sala.currentSheriffName === eu;
    document.getElementById('online-btn-mission-next').classList.toggle('hidden', !souXerife);
    if (!souXerife) {
        espera.innerText = t('waiting_name_continue', { name: sala.currentSheriffName });
        agenda(() => espera.classList.remove('hidden'), REDUCED_MOTION ? 0 : 2500 + (sabotagens > 0 ? 1800 : 0));
    }
}

// ============================================
// DUELO (REVÓLVER)
// ============================================

function mostraOlheOTelao(titulo, sub, cor) {
    showScreen('screen-phone-watch');
    const wt = document.getElementById('phone-watch-title');
    wt.innerText = titulo;
    wt.style.color = cor || '';
    document.getElementById('phone-watch-sub').innerText = sub;
}

// Lista de escolha única (alvo do duelo, alvo do Chefe).
function listaDeAlvos(elId, nomes, aoEscolher) {
    const el = document.getElementById(elId);
    el.innerHTML = '';
    nomes.forEach(nome => {
        const div = document.createElement('div');
        div.className = 'selectable-item';
        div.setAttribute('role', 'radio');
        div.setAttribute('aria-checked', 'false');
        div.textContent = nome;
        div.onclick = () => {
            el.querySelectorAll('.selected').forEach(x => x.classList.remove('selected'));
            div.classList.add('selected');
            aoEscolher(nome);
        };
        el.appendChild(div);
    });
}

function mostraDueloEscolha(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const dono = sala.revolverOwnerName;
    if (dono !== eu && sala.screenMode) return mostraOlheOTelao(t('phone_duel_title'), t('phone_duel_sub'), 'var(--accent)');

    showScreen('screen-online-duel-choose');
    document.getElementById('online-duel-owner-name').innerText = t('duel_owner_has_online', { name: dono });
    document.getElementById('online-duel-owner-area').classList.toggle('hidden', dono !== eu);
    document.getElementById('online-duel-waiting-area').classList.toggle('hidden', dono === eu);
    if (dono !== eu) return;

    let alvo = null;
    const desafiar = document.getElementById('online-btn-challenge');
    desafiar.disabled = true;
    listaDeAlvos('online-duel-targets-list',
        nomesDe(sala).filter(n => n !== dono && n !== sala.revolverPreviousOwnerName),
        (nome) => { alvo = nome; desafiar.disabled = false; });
    desafiar.onclick = () => {
        if (!alvo) return;
        desafiar.disabled = true;
        avancaSala(code, fase, s => {
            if (s.status !== 'duel_choose' || s.revolverOwnerName !== eu) return false;
            s.duel = { shooterName: eu, targetName: alvo };
            s.status = 'duel_action';
        });
    };
    document.getElementById('online-btn-skip-duel').onclick = () => avancaSala(code, fase, fimDoDuelo);
}

function mostraDueloAcao(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const d = sala.duel || {};
    const souAtirador = d.shooterName === eu, souAlvo = d.targetName === eu;
    if (!souAtirador && !souAlvo && sala.screenMode) {
        return mostraOlheOTelao(t('phone_duel_title'), t('phone_duel_sub'), 'var(--accent)');
    }
    showScreen('screen-online-duel-action');
    const jaEscolheu = (souAtirador && d.shooterAction) || (souAlvo && d.targetAction);
    const podeEscolher = (souAtirador || souAlvo) && !jaEscolheu;
    document.getElementById('online-duel-action-title').innerText = souAtirador ? t('duel_started_you')
        : souAlvo ? t('duel_challenged') : `${d.shooterName} × ${d.targetName}`;
    const area = document.getElementById('online-duel-action-area');
    const espera = document.getElementById('online-duel-action-waiting');
    area.classList.toggle('hidden', !podeEscolher);
    espera.classList.toggle('hidden', podeEscolher);
    // Sem som: a escolha é secreta — o tiro só toca na revelação pública.
    const escolhe = (acao) => {
        if (faseAtual !== fase) return;
        db.ref('rooms/' + code + '/duel/' + (souAtirador ? 'shooterAction' : 'targetAction')).set(acao);
        area.classList.add('hidden');
        espera.classList.remove('hidden');
    };
    document.getElementById('online-btn-duel-shoot').onclick = () => escolhe('shoot');
    document.getElementById('online-btn-duel-down').onclick = () => escolhe('down');
}

function mostraDueloResultado(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const r = sala.duelResult || {};
    showScreen('screen-online-duel-result');
    if (r.tipo !== 'ambos_abaixaram') {
        AudioManager.playSFX('shot');   // momento público
        Haptics.thud();
    }
    document.getElementById('online-duel-result-text').innerHTML = t(DUELO_TEXTO[r.tipo] || 'duel_both_down');

    // Se os dois fizeram o mesmo, quem desafiou vê o time do alvo. O
    // Falsificador parece da Lei no duelo.
    const intimida = document.getElementById('online-duel-intimidation-area');
    const alvo = sala.players[r.targetName];
    const vejo = r.hasIntimidation && r.shooterName === eu && alvo;
    intimida.classList.toggle('hidden', !vejo);
    if (vejo) {
        const pareceLei = alvo.role === 'LAW' || alvo.isFalsificador;
        document.getElementById('online-intimidated-name').innerText = r.targetName;
        const rotulo = document.getElementById('online-intimidated-role');
        rotulo.innerText = pareceLei ? t('law_resistance') : t('outlaw_team');
        rotulo.className = 'neon-text display ' + (pareceLei ? 'blue' : 'red');
    }

    // Só quem desafiou continua o jogo.
    const btn = document.getElementById('online-btn-duel-result-next');
    const espera = document.getElementById('online-duel-result-waiting');
    const souAtirador = r.shooterName === eu;
    btn.classList.toggle('hidden', !souAtirador);
    btn.disabled = false;
    espera.classList.toggle('hidden', souAtirador);
    espera.innerText = t('waiting_name_continue', { name: r.shooterName || '' });
    btn.onclick = () => {
        btn.disabled = true;
        avancaSala(code, fase, fimDoDuelo);
    };
}

// ============================================
// ÚLTIMA CHANCE DO CHEFE
// ============================================

function mostraChefe(code, sala) {
    const eu = onlineProfile.name, fase = faseAtual;
    const souChefe = !!sala.players[eu].isBoss;
    if (!souChefe && sala.screenMode) {
        return mostraOlheOTelao(t('phone_boss_aiming_title'), t('phone_boss_aiming_sub'), 'var(--outlaw)');
    }
    showScreen('screen-online-boss-assassination');
    document.getElementById('online-boss-action-area').classList.toggle('hidden', !souChefe);
    document.getElementById('online-boss-waiting-area').classList.toggle('hidden', souChefe);
    if (!souChefe) return;

    let alvo = null;
    const atirar = document.getElementById('online-btn-boss-shoot');
    atirar.disabled = true;
    listaDeAlvos('online-assassination-list', jogadoresDe(sala).filter(p => !p.isBoss).map(p => p.name),
        (nome) => { alvo = nome; atirar.disabled = false; });
    atirar.onclick = () => {
        if (!alvo) return;
        atirar.disabled = true;
        AudioManager.playSFX('shot');
        Haptics.thud();
        avancaSala(code, fase, s => {
            if (s.status !== 'boss_assassination') return false;
            s.bossTarget = alvo;
            s.status = alvo === s.delegadoName ? 'gameover_boss_win' : 'gameover_boss_fail';
        });
    };
}

// ============================================
// FIM DE JOGO
// ============================================

function mostraFimDeJogo(code, sala) {
    const [vencedor, motivo] = DESFECHOS[sala.status] || ['LAW', ''];
    const lei = vencedor === 'LAW';

    // MODO PARTY: os papéis aparecem no telão; o celular aponta para ele.
    if (sala.screenMode) {
        return mostraOlheOTelao(lei ? t('law_wins') : t('outlaw_wins'), t('phone_watch_screen_result'),
            lei ? 'var(--law)' : 'var(--outlaw)');
    }

    showScreen('screen-online-game-over');
    document.getElementById('online-game-over-reason').innerText = t(motivo);
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    document.body.classList.add(lei ? 'bg-winner-law' : 'bg-winner-outlaw');
    AudioManager.playSFX(lei ? 'success' : 'fail');

    const linha = (p) => {
        let suitKey = p.role, tag = '';
        if (p.isBoss)              { suitKey = 'BOSS';         tag = t('tag_boss'); }
        else if (p.isDelegado)     { suitKey = 'DELEGADO';     tag = t('tag_delegado'); }
        else if (p.isEscrivao)     { suitKey = 'ESCRIVAO';     tag = t('tag_escrivao'); }
        else if (p.isFalsificador) { suitKey = 'FALSIFICADOR'; tag = t('tag_falsificador'); }
        const tagHtml = tag ? `<span class="reveal-tag">${esc(tag.replace(/[()]/g, '').trim())}</span>` : '';
        return `<li class="reveal-li ${p.role === 'LAW' ? 'law' : 'outlaw'}"><div class="avatar-wrap"><img src="${esc(p.avatar || AVATARES[0])}" alt=""></div>`
            + `<span class="reveal-name">${esc(p.name)}</span>${tagHtml}<span class="reveal-suit">${suitSVG(suitKey)}</span></li>`;
    };
    const jogadores = jogadoresDe(sala);
    document.getElementById('online-final-law-list').innerHTML = jogadores.filter(p => p.role === 'LAW').map(linha).join('');
    document.getElementById('online-final-outlaw-list').innerHTML = jogadores.filter(p => p.role !== 'LAW').map(linha).join('');

    // "Jogar novamente": a mesma sala volta para a espera, com todo mundo.
    const denovo = document.getElementById('online-btn-play-again');
    denovo.disabled = false;
    denovo.onclick = () => {
        denovo.disabled = true;
        avancaSala(code, faseAtual, novaPartida);
    };
    document.getElementById('online-btn-back-menu').onclick = () => {
        saiDaSala();
        showScreen('screen-mode-select', 'volta');
    };
}

// ============================================
// INÍCIO: TELAS DO SITE
// ============================================

// Registrado depois do app.js: roda depois da inicialização do jogo e troca
// o que é diferente no site.
document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    // A tela inicial leva à escolha de modo (no app, vai direto aos jogadores).
    $('screen-splash').onclick = () => {
        AudioManager.startBGM();
        showHamburger();
        showScreen('screen-mode-select');
    };

    $('menu-home-btn').onclick = async () => {
        SideMenu.close();
        if (currentRoom && isScreenDevice) {
            if (await perguntar({ titulo: t('screen_leave_title'), texto: t('screen_leave_text'),
                                  sim: t('screen_leave_yes'), nao: t('leave_game_no') })) encerraTelao();
            return;
        }
        if (currentRoom) {
            const emJogo = salaAtual && salaAtual.status !== 'waiting' && !fimDeJogo(salaAtual.status);
            if (!(await perguntar({ titulo: t('leave_room_title'),
                                    texto: t(emJogo ? 'leave_room_text_game' : 'leave_room_text'),
                                    sim: t('leave_game_yes'), nao: t('leave_game_no') }))) return;
            saiDaSala();
        } else if (state.emAndamento && !(await perguntar({ titulo: t('leave_game_title'), texto: t('leave_game_text'),
                                                            sim: t('leave_game_yes'), nao: t('leave_game_no') }))) {
            return;
        }
        resetGameState();
        showScreen('screen-mode-select', 'volta');
    };

    // Escolha de modo
    $('btn-mode-offline').onclick = () => {
        updateSetupUI();
        showScreen('screen-setup-players');
    };
    $('btn-mode-online').onclick       = () => showScreen('screen-online-profile');
    $('btn-back-from-profile').onclick = () => showScreen('screen-mode-select', 'volta');
    $('btn-back-to-mode').onclick      = () => showScreen('screen-mode-select', 'volta');

    // Link direto de sala: saloongame.com.br/#CODIGO (é o que o QR code abre).
    // Pula a tela inicial e vai direto ao perfil; entra na sala ao confirmar.
    let pendingRoomCode = null;
    const hashCode = limpaCodigo((location.hash || '').replace('#', ''));
    if (hashCode.length >= 4) pendingRoomCode = hashCode;
    if (pendingRoomCode) {
        showHamburger();
        showScreen('screen-online-profile');
    }

    // Perfil: nome e avatar do último jogo já vêm preenchidos.
    const perfil = guarda.le('saloon-perfil') || {};
    let avatarIndex = Math.max(0, AVATARES.indexOf(perfil.avatar));
    const mostraAvatar = () => {
        $('avatar-img').src = AVATARES[avatarIndex];
        onlineProfile.avatar = AVATARES[avatarIndex];
    };
    mostraAvatar();
    if (perfil.name) $('online-name-input').value = limpaNome(perfil.name);
    $('avatar-prev').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex - 1 + AVATARES.length) % AVATARES.length;
        mostraAvatar();
    };
    $('avatar-next').onclick = (e) => {
        e.stopPropagation();
        avatarIndex = (avatarIndex + 1) % AVATARES.length;
        mostraAvatar();
    };

    $('online-profile-form').onsubmit = (e) => {
        e.preventDefault();
        const campo = $('online-name-input');
        const nome = limpaNome(campo.value);
        campo.value = nome;
        if (!nome) return avisar(t('fill_name'));
        onlineProfile.name = nome;
        guarda.grava('saloon-perfil', { name: nome, avatar: onlineProfile.avatar });
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

    // Lobby
    $('btn-create-room').onclick = criaSala;
    $('btn-join-room').onclick = () => joinRoomByCode($('room-code-input').value);
    $('room-code-input').addEventListener('input', (e) => {
        const limpo = limpaCodigo(e.target.value);
        if (limpo !== e.target.value) e.target.value = limpo;
    });
    $('room-code-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); joinRoomByCode(e.target.value); }
    });

    // Sala de espera (só o anfitrião mexe)
    $('online-card-roles').onclick = () => mudaExtras(ex => {
        ex.roles = !ex.roles;
        if (!ex.roles) ex.farsante = false;   // a Farsante exige o Distintivo
    });
    $('online-card-revolver').onclick = () => mudaExtras(ex => { ex.revolver = !ex.revolver; });
    $('online-card-farsante').onclick = () => {
        if (!souAnfitriao()) return;
        if (!(salaAtual.extras && salaAtual.extras.roles)) {
            // Sem Distintivo, não liga: pisca o cartão do Distintivo.
            const dist = $('online-card-roles');
            dist.classList.add('shake-req');
            setTimeout(() => dist.classList.remove('shake-req'), 500);
            return;
        }
        mudaExtras(ex => {
            if (!ex.roles) return false;
            ex.farsante = !ex.farsante;
        });
    };
    $('online-card-party').onclick = ligaModoParty;
    $('btn-start-online-game').onclick = () => {
        if (!currentRoom || !souAnfitriao()) return;
        avancaSala(currentRoom, faseAtual, s => {
            const n = nomesDe(s).length;
            if (s.status !== 'waiting' || n < 5 || n > MAX_ONLINE) return false;
            sorteiaPapeis(s);
        });
    };
    $('btn-leave-room').onclick = () => {
        saiDaSala();
        showScreen('screen-online-lobby', 'volta');
    };

    // Se a página recarregou no meio de uma sala, oferece voltar para ela.
    ofereceVoltar(pendingRoomCode).then(voltou => { if (voltou) pendingRoomCode = null; });
});
