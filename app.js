// ════════════════════════════════════════════
// SALOON — app.js
// Jogo de dedução social pass-and-play.
// Roda 100% offline: nenhuma chamada de rede.
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


// ============================================
// ESTADO DO JOGO
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
    escrivaoIndex: -1,
    falsificadorIndex: -1,

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
    bgm:     'sounds/bgm.m4a',
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
        if (this.isMuted) {
            if (this.bgm) this.bgm.pause();
        } else {
            if (this.bgm) this.bgm.play().catch(e => console.warn("BGM play failed", e));
            this.playSFX('click');
        }
        this.rotulo();
    },

    // O rótulo do menu segue o estado e o idioma: com data-i18n, a troca de
    // idioma atualiza o texto sozinha.
    rotulo() {
        const btn = document.getElementById('menu-sound-btn');
        if (!btn) return;
        const chave = this.isMuted ? 'sound_off' : 'sound_on';
        btn.setAttribute('data-i18n', chave);
        btn.innerText = t(chave);
    },

    startBGM() {
        if (!this.isInitialized) this.init();
        if (!this.isMuted && this.bgm) {
            this.bgm.play().catch(e => console.warn("BGM play failed", e));
        }
        this.rotulo();
    },

    // O app saiu da tela (fechado, trocado de app, tela bloqueada): a música
    // para, e volta quando ele reaparece. Se o iOS não deixar tocar sem um
    // toque na tela, ela volta no próximo toque.
    pausarPorFundo() {
        if (this.bgm && !this.bgm.paused) {
            this.bgm.pause();
            this._pausadaPorFundo = true;
        }
    },

    voltarDoFundo() {
        if (!this._pausadaPorFundo) return;
        this._pausadaPorFundo = false;
        if (this.isMuted || !this.bgm) return;
        this.bgm.play().catch(() => {
            document.addEventListener('pointerdown', () => {
                if (!this.isMuted) this.bgm.play().catch(() => {});
            }, { once: true });
        });
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
// HAPTICS
// ============================================
// Usa o plugin nativo do Capacitor quando empacotado; cai para
// navigator.vibrate no navegador. Vira no-op onde nada existe.

const Haptics = {
    // Navegadores bloqueiam vibrate() enquanto não houver um toque real na página.
    userGestured: false,

    get plugin() {
        return window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
    },

    fire(nativeCall, pattern) {
        if (AudioManager.isMuted) return;
        const p = this.plugin;
        if (p) {
            nativeCall(p).catch(() => {});
        } else if (this.userGestured && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },

    impact(style, fallbackMs) {
        this.fire(p => p.impact({ style }), fallbackMs);
    },

    notify(type, fallbackPattern) {
        this.fire(p => p.notification({ type }), fallbackPattern);
    },

    tap()     { this.impact('LIGHT', 10); },
    select()  { this.impact('MEDIUM', 20); },
    thud()    { this.impact('HEAVY', 40); },
    success() { this.notify('SUCCESS', [30, 60, 30]); },
    failure() { this.notify('ERROR', [60, 40, 60, 40, 120]); }
};

// ============================================
// BOOTSTRAP NATIVO (Capacitor)
// ============================================
// No navegador nada disso existe e a função não faz nada.

function initNative() {
    const plugins = window.Capacitor && window.Capacitor.Plugins;
    if (!plugins) return;

    if (plugins.StatusBar) {
        // 'LIGHT' no Capacitor = feito para fundo claro, ou seja, texto ESCURO.
        // O topo das telas é o degradê de areia.
        plugins.StatusBar.setStyle({ style: 'LIGHT' }).catch(() => {});
        plugins.StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
    }
    // A splash nativa é o mesmo degradê de areia. Só some depois do 'load'
    // (fundo e fontes prontos), senão pisca a cor lisa entre as duas.
    // Teclado: sem redimensionar a página nem rolá-la (capacitor.config.json);
    // aqui só pegamos a altura para colar a barra de nomes em cima dele.
    if (plugins.Keyboard) {
        plugins.Keyboard.addListener('keyboardWillShow', (info) => {
            Teclado.altura = info.keyboardHeight;
            _posicionaBarra();
        });
        plugins.Keyboard.addListener('keyboardWillHide', () => { Teclado.altura = 0; });
    }
    if (plugins.SplashScreen) {
        const hide = () => plugins.SplashScreen.hide().catch(() => {});
        if (document.readyState === 'complete') hide();
        else window.addEventListener('load', hide, { once: true });
    }
}

// ============================================
// UTILITÁRIOS GERAIS
// ============================================

// Telas em que o brilho de vitória/derrota continua aceso. O site
// acrescenta as telas online dele.
const TELAS_DE_DESFECHO = ['screen-mesa', 'screen-mission-result', 'screen-game-over'];

// direcao 'volta' faz a tela entrar pela esquerda (botões de voltar).
function showScreen(screenId, direcao) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.toggle('volta', direcao === 'volta');
        target.classList.add('active');
    }
    if (!TELAS_DE_DESFECHO.includes(screenId)) {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    }
    // A cena da mesa é imersiva: sem gaveta por cima dela.
    document.body.classList.toggle('scene-mode', screenId === 'screen-mesa');
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

// ── A parede do saloon ──
// Uma frase em cima, um título grande, um aviso e um único botão, com a
// mesma cara do primeiro ato da mesa. Serve para passar o celular (duelo)
// e para segurar o resultado da missão até todos estarem olhando.
function showParede(o) {
    showScreen('screen-pass-device');
    document.getElementById('pass-device-title').innerText = o.eyebrow;
    document.getElementById('pass-device-target').innerText = o.titulo;
    document.getElementById('pass-device-note').innerText = o.nota;

    const velho = document.getElementById('btn-reveal-action');
    const btn = velho.cloneNode(true);
    velho.parentNode.replaceChild(btn, velho);
    btn.innerText = o.botao;
    btn.onclick = o.aoTocar;

    // O botão aparece depois de um instante: dá tempo do celular trocar de
    // mão, e evita que um toque duplo pule a tela sem ninguém ver.
    btn.classList.add('surgindo');
    setTimeout(() => btn.classList.remove('surgindo'), REDUCED_MOTION ? 0 : (o.espera || 2000));
}

function showPassConfirm(targetName, titleKey, onYes) {
    showParede({
        eyebrow: t(titleKey || 'pass_to'),
        titulo:  targetName,
        nota:    t('no_peeking'),
        botao:   t('im_name', { name: targetName }),
        aoTocar: onYes
    });
}

// ============================================
// INICIALIZAÇÃO DO DOM
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    applyLanguage();
    initNative();

    document.addEventListener('pointerdown', () => { Haptics.userGestured = true; }, { once: true });

    // Botão do menu lateral (leque de cartas)
    const menuBtn = document.getElementById('btn-hamburger');
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
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
    AudioManager.rotulo();

    document.getElementById('menu-tutorial-btn').onclick = () => {
        SideMenu.close();
        showTutorial('GENERAL');
    };

    document.getElementById('menu-home-btn').onclick = async () => {
        SideMenu.close();
        if (state.emAndamento && !(await perguntar({
            titulo: t('leave_game_title'), texto: t('leave_game_text'),
            sim: t('leave_game_yes'), nao: t('leave_game_no')
        }))) return;
        resetGameState();
        updateSetupUI();
        showScreen('screen-setup-players', 'volta');
    };

    // Música para quando o app sai da tela. visibilitychange cobre o WebView;
    // pause/resume são os avisos do Capacitor quando o app vai para o fundo.
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) AudioManager.pausarPorFundo();
        else AudioManager.voltarDoFundo();
    });
    document.addEventListener('pause',  () => AudioManager.pausarPorFundo());
    document.addEventListener('resume', () => AudioManager.voltarDoFundo());
    window.addEventListener('pagehide', () => AudioManager.pausarPorFundo());

    // Depois de trocar o idioma, refaz o que o jogo escreveu na tela aberta.
    document.addEventListener('idioma', () => {
        const aberta = document.querySelector('.screen.active');
        if (!aberta) return;
        if (aberta.id === 'screen-tutorial' && tutorialAtual) showTutorial(tutorialAtual);
        if (aberta.id === 'screen-setup-players') _sincronizaSetup();
    });

    // Troca de idioma (PT 🇧🇷 / EN 🇺🇸)
    document.querySelectorAll('.lang-opt').forEach(btn => {
        btn.onclick = () => {
            AudioManager.playSFX('chip');
            setLanguage(btn.dataset.lang);
        };
    });

    // Listener global de cliques: todo botão vibra, mas o engatilhar da arma
    // só toca nos momentos marcados com data-som="arma" (abrir a mesa e
    // desafiar para o duelo). Em todo clique ele cansava rápido.
    document.addEventListener('click', (e) => {
        const sel = e.target.closest('.selectable-item');
        if (sel) {
            AudioManager.playSFX('chip');
            Haptics.select();
            return;
        }
        const target = e.target.closest('.btn, .mode-card, .info-btn, button, input[type="submit"], .custom-checkbox');
        if (target && target.id !== 'btn-hamburger' && !target.closest('#side-menu-panel')) {
            if (target.dataset.som === 'arma') AudioManager.playSFX('click');
            Haptics.tap();
        }
    }, true);

    showScreen('screen-splash');

    // ---- Splash: primeiro toque inicia BGM e abre direto o setup ----
    document.getElementById('screen-splash').onclick = () => {
        AudioManager.startBGM();
        showHamburger();
        updateSetupUI();
        showScreen('screen-setup-players');
    };

    // ---- Navegação de telas ----
    document.getElementById('btn-go-to-advanced').onclick  = () => {
        refreshExtraCards();
        showScreen('screen-setup-advanced');
    };
    document.getElementById('btn-back-to-players').onclick = () => showScreen('screen-setup-players', 'volta');
});

// Pergunta com a janela do jogo (em vez do confirm() do sistema).
// Resolve true em "sim" e false em "não" ou num toque fora da caixa.
// Sem `nao`, é só um aviso com um botão.
function perguntar({ titulo, texto, sim, nao }) {
    const caixa = document.getElementById('confirma');
    document.getElementById('confirma-titulo').innerText = titulo;
    document.getElementById('confirma-texto').innerText = texto;
    const bSim = document.getElementById('confirma-sim');
    const bNao = document.getElementById('confirma-nao');
    bSim.innerText = sim;
    bNao.innerText = nao || '';
    bNao.classList.toggle('hidden', !nao);   // só "sim": vira um aviso com OK
    document.getElementById('confirma-texto').classList.toggle('hidden', !texto);
    caixa.classList.remove('hidden');
    return new Promise(resolve => {
        const fecha = (resposta) => {
            caixa.classList.add('hidden');
            bSim.onclick = bNao.onclick = caixa.onclick = null;
            resolve(resposta);
        };
        bSim.onclick = () => fecha(true);
        bNao.onclick = () => fecha(false);
        caixa.onclick = (e) => { if (e.target === caixa) fecha(false); };
    });
}

function resetGameState() {
    state.emAndamento = false;
    state.players.forEach(p => { p.role = null; p.isBoss = false; p.isDelegado = false; p.isEscrivao = false; p.isFalsificador = false; });
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
// SETUP DE JOGADORES
// ============================================

// Lixeira cheia (tampa + corpo, frisos vazados), na cor do botão (currentColor).
const TRASH_SVG = `<svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">`
    + `<path fill="currentColor" d="M9.2 2.8h5.6a1.2 1.2 0 0 1 1.2 1.2v.6h3.3a1.3 1.3 0 0 1 0 2.6H4.7a1.3 1.3 0 0 1 0-2.6H8v-.6a1.2 1.2 0 0 1 1.2-1.2z"/>`
    + `<path fill="currentColor" d="M5.7 8.6h12.6l-.95 11.1a2.6 2.6 0 0 1-2.6 2.4H9.25a2.6 2.6 0 0 1-2.6-2.4z"/>`
    + `<path d="M10 11.6v6.8M14 11.6v6.8" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>`;

// Cada jogador é uma linha da lista, na ordem em que estão sentados, e a
// última está sempre vazia. Os nomes NÃO são digitados dentro da lista:
// tocar numa linha abre uma barra de texto colada em cima do teclado, e a
// linha só espelha o que é digitado. Como a caixa em foco fica sempre acima
// do teclado, o iOS nunca precisa empurrar a tela para mostrá-la.
const MAX_JOGADORES = 10;
const setupLista = () => document.getElementById('player-setup-list');
const barraNome  = () => document.getElementById('barra-nome');
const campoNome  = () => document.getElementById('player-name-input');
let linhaEditada = null;

function _linhaJogador(nome) {
    const li = document.createElement('li');
    li.className = 'linha-jogador';
    li.innerHTML = `<span class="nome"></span><button class="lixeira" aria-label="${t('remove_player')}">${TRASH_SVG}</button>`;
    li.querySelector('.nome').textContent = nome || '';
    return li;
}
const _nomeDa = (li) => li.querySelector('.nome').textContent.trim();

// Tira a linha com animação; ela só sai do DOM quando a animação acaba.
function _removeLinha(li) {
    if (li === linhaEditada) linhaEditada = null;
    if (REDUCED_MOTION) { li.remove(); return; }
    li.classList.add('some');
    li.addEventListener('animationend', () => li.remove(), { once: true });
}

// Garante exatamente uma linha vazia no fim (a não ser que a mesa esteja cheia).
function _garanteLinhaVazia(animar) {
    const lista = setupLista();
    const cheias = lista.querySelectorAll('.linha-jogador:not(.vazia):not(.some)').length;
    let vazia = lista.querySelector('.linha-jogador.vazia:not(.some)');
    if (cheias >= MAX_JOGADORES) {
        if (vazia) _removeLinha(vazia);
        return;
    }
    if (!vazia) {
        vazia = _linhaJogador('');
        vazia.classList.add('vazia');
        if (animar) vazia.classList.add('nasce');
        lista.appendChild(vazia);
    }
    if (vazia !== linhaEditada) {
        const nome = vazia.querySelector('.nome');
        nome.setAttribute('data-i18n', 'name_ph');
        nome.textContent = t('name_ph');
    }
}

// Lê os nomes das linhas, marca repetidos e libera o "Próximo".
function _sincronizaSetup() {
    const linhas = [...setupLista().querySelectorAll('.linha-jogador:not(.vazia):not(.some)')];
    const nomes = linhas.map(_nomeDa);
    const conta = {};
    nomes.forEach(n => { if (n) conta[n.toLowerCase()] = (conta[n.toLowerCase()] || 0) + 1; });
    let repetido = false;
    linhas.forEach((li, i) => {
        const dup = !!nomes[i] && conta[nomes[i].toLowerCase()] > 1;
        li.classList.toggle('repetido', dup);
        repetido = repetido || dup;
    });

    state.players = nomes.filter(Boolean).map(name => ({ name, role: null }));
    const n = state.players.length;
    document.getElementById('btn-go-to-advanced').disabled = repetido || n < 5 || n > MAX_JOGADORES;
    if (repetido)           showError(t('name_exists'));
    else if (n > 0 && n < 5) showError(t('min_players'));
    else                     showError('');
}

// Monta a lista inteira a partir de state.players (ao entrar na tela).
function updateSetupUI() {
    fecharBarraNome();
    const lista = setupLista();
    lista.innerHTML = '';
    state.players.forEach(p => lista.appendChild(_linhaJogador(p.name)));
    _garanteLinhaVazia();
    _sincronizaSetup();
}

// ── A barra de digitação, colada em cima do teclado ──
// No app, o plugin de teclado informa a altura exata; no navegador, o
// visualViewport encolhe quando o teclado virtual aparece.
const Teclado = { altura: 0 };

function _posicionaBarra() {
    const barra = barraNome();
    if (!barra.classList.contains('aberta')) return;
    let base;   // onde o teclado começa (ou o pé da tela, sem teclado)
    if (Teclado.altura > 0)        base = window.innerHeight - Teclado.altura;
    else if (window.visualViewport) base = visualViewport.offsetTop + visualViewport.height;
    else                            base = window.innerHeight;
    barra.style.setProperty('--barra-y', (base - barra.offsetHeight) + 'px');
}

function editarLinha(li) {
    if (!li) return;
    if (linhaEditada && linhaEditada !== li) linhaEditada.classList.remove('editando');
    linhaEditada = li;
    li.classList.add('editando');
    const campo = campoNome();
    if (li.classList.contains('vazia')) {
        campo.value = '';
        const nome = li.querySelector('.nome');       // só o cursor piscando
        nome.removeAttribute('data-i18n');
        nome.textContent = '';
    } else {
        campo.value = _nomeDa(li);
    }
    const barra = barraNome();
    if (!barra.classList.contains('aberta')) {
        barra.classList.add('aberta');
        _posicionaBarra();
    }
    campo.focus();   // precisa acontecer dentro do toque, senão o iOS não abre o teclado
}

// Encerra a edição: linha de jogador que ficou sem nome sai da lista.
function _confirmaLinha() {
    const li = linhaEditada;
    if (!li) return;
    li.classList.remove('editando');
    linhaEditada = null;
    if (li.classList.contains('vazia')) {
        _garanteLinhaVazia();                      // devolve o "Nome do jogador"
    } else if (!_nomeDa(li)) {
        _removeLinha(li);
        _garanteLinhaVazia(true);
    }
    _sincronizaSetup();
}

function fecharBarraNome() {
    _confirmaLinha();
    const barra = barraNome();
    if (barra) barra.classList.remove('aberta');
}

// Com a barra aberta, tocar noutra linha não pode tirar o foco do campo —
// senão o teclado fecha e abre de novo.
setupLista().addEventListener('pointerdown', (e) => {
    if (linhaEditada && e.target.closest('.linha-jogador') && !e.target.closest('.lixeira')) e.preventDefault();
});

setupLista().addEventListener('click', (e) => {
    const li = e.target.closest('.linha-jogador');
    if (!li || li.classList.contains('some')) return;
    if (e.target.closest('.lixeira')) {
        _removeLinha(li);
        _garanteLinhaVazia(true);
        _sincronizaSetup();
        return;
    }
    if (li !== linhaEditada) {
        _confirmaLinha();
        editarLinha(li);
    }
});

// O que é digitado na barra aparece na linha. Começou a digitar na linha
// vazia, ela vira jogador e nasce outra embaixo.
campoNome().addEventListener('input', (e) => {
    let li = linhaEditada;
    if (!li) {   // digitou sem tocar numa linha (teclado físico): vai para a linha nova
        li = setupLista().querySelector('.linha-jogador.vazia:not(.some)');
        if (!li) return;
        linhaEditada = li;
        li.classList.add('editando');
    }
    const texto = e.target.value;
    const nome = li.querySelector('.nome');
    if (li.classList.contains('vazia')) {
        if (!texto.trim()) return;
        li.classList.remove('vazia');
        nome.removeAttribute('data-i18n');
        _garanteLinhaVazia(true);
    }
    nome.textContent = texto;
    _sincronizaSetup();
});

// "Próximo" do teclado: passa para a linha de baixo com o mesmo campo em
// foco, então o teclado não pisca. Na última linha, fecha.
campoNome().addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    let prox = linhaEditada ? linhaEditada.nextElementSibling : null;
    while (prox && prox.classList.contains('some')) prox = prox.nextElementSibling;
    _confirmaLinha();
    if (prox) { editarLinha(prox); return; }
    // Última linha: fecha a barra de vez — não depende de o campo perder o foco.
    fecharBarraNome();
    campoNome().blur();
});

campoNome().addEventListener('blur', () => fecharBarraNome());
document.getElementById('barra-ok').addEventListener('click', () => { fecharBarraNome(); campoNome().blur(); });
if (window.visualViewport) window.visualViewport.addEventListener('resize', _posicionaBarra);

document.getElementById('btn-start-game').addEventListener('click', () => initializeGame());

// ============================================
// INICIALIZAÇÃO DA PARTIDA
// ============================================

function initializeGame() {
    const pCount = state.players.length;
    state.config = GAME_CONFIG[pCount];
    state.extras.roles    = document.getElementById('chk-roles').checked;
    state.extras.revolver = document.getElementById('chk-revolver').checked;
    state.extras.farsante = document.getElementById('chk-farsante').checked && state.extras.roles;
    state.currentSheriffIndex = Math.floor(Math.random() * pCount);

    let roles = [];
    for (let i = 0; i < state.config.outlaws; i++) roles.push('OUTLAW');
    for (let i = 0; i < pCount - state.config.outlaws; i++) roles.push('LAW');
    roles = shuffle(roles);
    state.players.forEach((p, i) => {
        p.role = roles[i]; p.isBoss = false; p.isDelegado = false;
        p.isEscrivao = false; p.isFalsificador = false;
    });

    if (state.extras.roles) {
        let outlawsIdx = state.players.map((p, i) => p.role === 'OUTLAW' ? i : -1).filter(i => i !== -1);
        let lawIdx     = state.players.map((p, i) => p.role === 'LAW'    ? i : -1).filter(i => i !== -1);
        state.bossIndex = outlawsIdx[Math.floor(Math.random() * outlawsIdx.length)];
        state.players[state.bossIndex].isBoss = true;
        state.delegadoIndex = lawIdx[Math.floor(Math.random() * lawIdx.length)];
        state.players[state.delegadoIndex].isDelegado = true;
        let commonOutlaws = outlawsIdx.filter(i => i !== state.bossIndex);
        state.delegadoTargetIndex = commonOutlaws[Math.floor(Math.random() * commonOutlaws.length)];

        if (state.extras.farsante) {
            // Falsificador: um fora-da-lei comum (nunca o Chefe).
            let falsCandidates = commonOutlaws;
            state.falsificadorIndex = falsCandidates[Math.floor(Math.random() * falsCandidates.length)];
            state.players[state.falsificadorIndex].isFalsificador = true;
            // Escrivão: um membro da Lei comum (nunca o Delegado).
            let escrCandidates = lawIdx.filter(i => i !== state.delegadoIndex);
            state.escrivaoIndex = escrCandidates[Math.floor(Math.random() * escrCandidates.length)];
            state.players[state.escrivaoIndex].isEscrivao = true;
            // O Delegado NÃO vê o Falsificador. Reescolhe o alvo visível entre
            // os comuns que não sejam o Falsificador (e já não é o Chefe).
            let visiveis = commonOutlaws.filter(i => i !== state.falsificadorIndex);
            if (visiveis.length > 0) {
                state.delegadoTargetIndex = visiveis[Math.floor(Math.random() * visiveis.length)];
            }
            // Se não houver outro comum visível, o Delegado vê o Chefe (com Farsante
            // ele PODE ver o Chefe). Garante que sempre haja um nome.
            else {
                state.delegadoTargetIndex = state.bossIndex;
            }
        } else {
            state.falsificadorIndex = -1;
            state.escrivaoIndex = -1;
        }
    }

    if (state.extras.revolver) {
        state.revolverOwnerIndex = Math.floor(Math.random() * pCount);
        state.revolverPreviousOwnerIndex = -1;
    }

    state.currentPlayerInteractionIndex = 0;
    state.pendingAction = 'REVEAL';
    state.emAndamento = true;
    startInteractionLoop();
}

// ============================================
// LOOP DE INTERAÇÕES (PASS-AND-PLAY)
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
    // A revelação tem cena própria: ela já começa com o "passe o celular"
    // na parede do saloon e desce até a mesa.
    if (state.pendingAction === 'REVEAL' || state.pendingAction === 'MISSION') {
        executeInteraction(targetIndex);
        return;
    }
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
// REVELAÇÃO DE IDENTIDADE (A CARTA)
// ============================================

// Monta os dados que a carta vai exibir para um jogador offline
function buildRoleData(playerIdx) {
    const p = state.players[playerIdx];
    let suitKey = p.role;
    if (p.isDelegado) suitKey = 'DELEGADO';
    else if (p.isBoss) suitKey = 'BOSS';
    else if (p.isEscrivao) suitKey = 'ESCRIVAO';
    else if (p.isFalsificador) suitKey = 'FALSIFICADOR';

    const data = {
        team: p.role,
        suitKey: suitKey,
        hasRevolver: state.extras.revolver && playerIdx === state.revolverOwnerIndex
    };

    if (p.role === 'LAW') {
        data.desc1 = t('law_desc1');
        data.desc2 = t('law_desc2');
        if (p.isDelegado) {
            data.name = t('role_delegado');
            // Delegado vê os fora-da-lei, MENOS o Falsificador (quando Farsante ativa).
            // Sem Farsante, não vê o Chefe. Aqui o alvo já é um comum != Chefe.
            data.delegateHtml = t('delegate_notice', { name: state.players[state.delegadoTargetIndex].name });
        } else if (p.isEscrivao) {
            data.name = t('role_escrivao');
            data.desc1 = t('escrivao_desc1');
            data.desc2 = '';
            // Vê dois nomes: o Delegado verdadeiro e o Falsificador, embaralhados.
            const dois = shuffle([
                state.players[state.delegadoIndex].name,
                state.players[state.falsificadorIndex].name
            ]);
            data.escrivaoNames = dois;
        } else {
            data.name = t('role_law');
        }
    } else {
        data.desc1 = t('outlaw_desc1');
        if (p.isBoss) {
            data.name = t('role_boss');
            data.desc2 = t('boss_desc2');
        } else if (p.isFalsificador) {
            data.name = t('role_falsificador');
            data.desc2 = t('falsificador_desc2');
            data.falsificadorNotice = true;
        } else {
            data.name = t('role_outlaw');
            data.desc2 = t('outlaw_desc2');
        }
        // Falsificador e Chefe veem os outros fora-da-lei, como qualquer bandido.
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
    showScreen('screen-mesa');
    runRevealScene(buildRoleData(playerIdx), state.players[playerIdx].name, () => {
        state.currentPlayerInteractionIndex++;
        startInteractionLoop();
    });
}

// ============================================
// TABULEIRO
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
    document.getElementById('team-selection-area').classList.remove('hidden');

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

    // Zerado, o placar de rejeições é só ruído: aparece na primeira equipe
    // rejeitada e some de novo quando uma equipe for aprovada.
    document.querySelector('#screen-board .reject-track').classList.toggle('hidden', state.rejectedTeams === 0);
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
// VOTAÇÃO EM GRUPO
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
// EXECUÇÃO DE MISSÃO
// ============================================

function executeMissionPhase(playerIdx) {
    showScreen('screen-mesa');
    const p = state.players[playerIdx];

    runMissionScene(p.name, {
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
    // Pausa antes de revelar: o último da equipe devolve o celular para a
    // mesa, e alguém toca quando todos estiverem olhando. O suspense das
    // fichas caindo continua na própria tela de resultado.
    showParede({
        eyebrow: t('mission_ready'),
        titulo:  t('mission_n', { n: state.currentMissionIndex + 1 }),
        nota:    t('mission_ready_note'),
        botao:   t('see_result'),
        espera:  1200,
        aoTocar: processMission
    });
}

function processMission() {
    showScreen('screen-mission-result');
    const sabotages = state.missionChoices.filter(c => c === false).length;
    const failsRequired = state.config.twoFailsRequired === state.currentMissionIndex ? 2 : 1;
    const missionSuccess = sabotages < failsRequired;
    state.missionResults[state.currentMissionIndex] = missionSuccess;
    state._justResolvedMission = state.currentMissionIndex;
    setTimeout(() => missionSuccess ? Haptics.success() : Haptics.failure(), 900);

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
// SISTEMA DE DUELO
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
        Haptics.thud();
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
// ASSASSINATO DO CHEFE
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

    // Numa partida nova o botão tem de começar travado de novo, senão dava
    // para atirar sem escolher ninguém.
    document.getElementById('btn-boss-shoot').disabled = true;
    document.getElementById('btn-boss-shoot').onclick = () => {
        if (targetSelected < 0) return;
        AudioManager.playSFX('shot');
        Haptics.thud();
        if (targetSelected === state.delegadoIndex) {
            endGame(t('win_boss_shot'), "OUTLAW");
        } else {
            endGame(t('win_boss_missed'), "LAW");
        }
    };
}

// ============================================
// FIM DE JOGO
// ============================================

function endGame(reason, winner) {
    showScreen('screen-game-over');
    document.getElementById('game-over-reason').innerText = reason;

    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
    if (winner === 'LAW') {
        AudioManager.playSFX('success');
        document.body.classList.add('bg-winner-law');
        Haptics.success();
    } else if (winner === 'OUTLAW') {
        AudioManager.playSFX('fail');
        document.body.classList.add('bg-winner-outlaw');
        Haptics.failure();
    }

    const lawUl = document.getElementById('final-law-list');
    const outUl = document.getElementById('final-outlaw-list');
    lawUl.innerHTML = '';
    outUl.innerHTML = '';

    state.emAndamento = false;
    // Cada nome com o ícone do papel (o mesmo da carta) e o cargo, se tiver.
    state.players.forEach(p => {
        let papel = p.role, cargo = '';
        if (p.isBoss)              { papel = 'BOSS';         cargo = t('tag_boss'); }
        else if (p.isDelegado)     { papel = 'DELEGADO';     cargo = t('tag_delegado'); }
        else if (p.isEscrivao)     { papel = 'ESCRIVAO';     cargo = t('tag_escrivao'); }
        else if (p.isFalsificador) { papel = 'FALSIFICADOR'; cargo = t('tag_falsificador'); }
        const li = document.createElement('li');
        li.className = 'final-li';
        li.innerHTML = `<span class="final-icone">${suitSVG(papel)}</span><span class="final-nome"></span><span class="final-cargo"></span>`;
        li.querySelector('.final-nome').textContent = p.name;
        li.querySelector('.final-cargo').textContent = cargo.replace(/[()]/g, '').trim();
        (p.role === 'LAW' ? lawUl : outUl).appendChild(li);
    });

    document.getElementById('btn-play-again').onclick = () => {
        resetGameState();
        updateSetupUI();
        showScreen('screen-setup-players');
    };
}

// ============================================
// TUTORIAL
// ============================================

let lastScreenId = 'screen-splash';

function toggleExtra(nome) {
    const chk = document.getElementById('chk-' + nome);

    // Farsante depende do Distintivo: sem ele, sacode o card do requisito.
    if (nome === 'farsante' && !document.getElementById('chk-roles').checked) {
        const distCard = document.getElementById('card-roles');
        distCard.classList.add('shake-req');
        setTimeout(() => distCard.classList.remove('shake-req'), 500);
        chk.checked = false;
        refreshExtraCards();
        return;
    }

    chk.checked = !chk.checked;

    // Desligar o Distintivo desliga a Farsante junto.
    if (nome === 'roles' && !chk.checked) {
        document.getElementById('chk-farsante').checked = false;
    }
    refreshExtraCards();
}

function refreshExtraCards() {
    const rolesOn = document.getElementById('chk-roles').checked;

    ['roles', 'farsante', 'revolver'].forEach(nome => {
        const card = document.getElementById('card-' + nome);
        card.classList.toggle('selected', document.getElementById('chk-' + nome).checked);
    });

    // O aviso "Requer Distintivo" só faz sentido enquanto o requisito não foi atendido.
    document.getElementById('card-farsante').classList.toggle('disabled-card', !rolesOn);
}

let tutorialAtual = null;
function showTutorial(type) {
    tutorialAtual = type;
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id !== 'screen-tutorial') {
        lastScreenId = activeScreen.id;
    }
    const contentDiv = document.getElementById('tutorial-content');
    const dict = I18N[LANG].tutorials || I18N.pt.tutorials;
    contentDiv.innerHTML = dict[type] || '';
    const titulos = { GENERAL: 'how_to_play', DELEGADO: 'extra_roles', FARSANTE: 'extra_farsante', REVOLVER: 'extra_revolver' };
    document.getElementById('tutorial-title').innerText = t(titulos[type] || 'how_to_play');

    // As cartinhas usam a moldura e o ícone das cartas de verdade, e começam
    // com o verso para cima: viram quando aparecem na tela.
    const DA_LEI = ['LAW', 'DELEGADO', 'ESCRIVAO'];
    contentDiv.querySelectorAll('.mini-card[data-papel]').forEach(c => {
        const papel = c.dataset.papel;
        c.classList.add(DA_LEI.includes(papel) ? 'team-law' : 'team-outlaw');
        c.innerHTML = `<div class="mini-inner">`
            + `<div class="mini-face mini-frente"><div class="face-frame"></div><span class="mini-icone">${suitSVG(papel)}</span>${c.innerHTML}</div>`
            + `<div class="mini-face mini-verso"></div></div>`;
    });
    // E as fichas, as mesmas do tabuleiro. "lei:2" = missão de 2 já cumprida
    // (vira do verso numerado para o resultado), "3" = a jogar, "3!" = a atual.
    contentDiv.querySelectorAll('.chips-row[data-fichas]').forEach(row => {
        row.innerHTML = row.dataset.fichas.split(' ').map((f, i) => {
            const [tipo, n] = f.split(':');
            if (n) return `<div class="tut-ficha resolvida" style="--i:${i}"><div class="tf-inner">`
                + `<div class="tf-lado">${chipBackNumbered(n)}</div>`
                + `<div class="tf-lado tf-frente">${_chipArt(tipo)}</div></div></div>`;
            const atual = tipo.endsWith('!');
            return `<div class="tut-ficha${atual ? ' atual' : ''}" style="--i:${i}">${chipBackNumbered(tipo.replace('!', ''))}</div>`;
        }).join('');
    });
    contentDiv.scrollTop = 0;
    _revelaAoRolar(contentDiv);
    showScreen('screen-tutorial');
    _avisoRolar(contentDiv);
}

// Cada parte do tutorial anima quando entra na tela ao rolar. As que já
// aparecem juntas entram em cascata (--atraso).
let _tutObservador = null;
function _revelaAoRolar(contentDiv) {
    const alvos = contentDiv.querySelectorAll('.tut-sub, .card, .teams, .chips-row, .chip-legenda, .trilha, .passo, .alerta, .nota');
    alvos.forEach(el => el.classList.add('revela'));
    if (_tutObservador) _tutObservador.disconnect();
    if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
        alvos.forEach(el => el.classList.add('visivel'));
        return;
    }
    _tutObservador = new IntersectionObserver((entradas) => {
        let k = 0;
        entradas.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.style.setProperty('--atraso', (k++ * 0.09) + 's');
            e.target.classList.add('visivel');
            _tutObservador.unobserve(e.target);
        });
    }, { root: contentDiv, threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    alvos.forEach(el => _tutObservador.observe(el));
}

// Quem abre o tutorial não sabe que tem mais embaixo: a pílula "deslize
// para ver mais" aparece logo que ele abre e volta sempre que a pessoa para
// de rolar com conteúdo ainda por ver (depois das fichas, por exemplo).
// Some enquanto rola e no fim da página. Tocar nela rola um pedaço.
function _avisoRolar(contentDiv) {
    const aviso = document.getElementById('tut-rolar');
    const temMais = () => contentDiv.scrollHeight - contentDiv.clientHeight - contentDiv.scrollTop > 40;
    // Aparece e, se ninguém rolar, sai sozinho depois de uns segundos para
    // não ficar tapando o texto de quem está lendo.
    const mostraDaquiA = (ms) => {
        clearTimeout(aviso._timer);
        clearTimeout(aviso._some);
        aviso._timer = setTimeout(() => {
            if (!temMais()) return;
            aviso.classList.remove('escondida');
            aviso._some = setTimeout(() => aviso.classList.add('escondida'), 4000);
        }, REDUCED_MOTION ? 0 : ms);
    };
    aviso.classList.add('escondida');
    contentDiv.onscroll = () => {
        aviso.classList.add('escondida');
        mostraDaquiA(1400);
    };
    aviso.onclick = () => contentDiv.scrollBy({ top: contentDiv.clientHeight * 0.6, behavior: 'smooth' });
    mostraDaquiA(900);
}

function closeTutorial() {
    showScreen(lastScreenId);
}
