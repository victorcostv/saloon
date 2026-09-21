// ════════════════════════════════════════════
// SALOON — FX: câmera e a carta de identidade
// ════════════════════════════════════════════

const REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Movimento de câmera entre jogadores ──────
// Zoom-out + pan, como se a câmera deslizasse da carta do
// jogador anterior até a posição do próximo.
let camBusy = false;
function cinematicTransition(swapFn) {
    const container = document.getElementById('app-container');
    if (REDUCED_MOTION || camBusy) {
        swapFn();
        return;
    }
    camBusy = true;
    container.classList.add('cam-out');
    setTimeout(() => {
        container.classList.remove('cam-out');
        swapFn();
        container.classList.add('cam-in');
        setTimeout(() => {
            container.classList.remove('cam-in');
            camBusy = false;
        }, 720);
    }, 540);
}

// ── Telas de tensão (mantido para uso futuro; sem efeito visual) ──
const TENSION_SCREENS = [
    'screen-mission-suspense', 'screen-duel-suspense',
    'screen-boss-assassination', 'screen-online-boss-assassination',
    'screen-duel-action', 'screen-online-duel-action'
];
function updateTension(screenId) {
    document.body.classList.toggle('tension', TENSION_SCREENS.includes(screenId));
}

// ════════════════════════════════════════════
// A CARTA — componente compartilhado (offline e online)
// ════════════════════════════════════════════
//
// Naipes ILUSTRADOS por papel (SVG em art.js):
//   Lei → estrela de xerife (azul) | Delegado → estrela no anel (azul)
//   Fora-da-Lei → caveira (vermelho) | Chefe → caveira de chapéu (vermelho)
//
// Decisão de design: o VERSO é neutro (igual para os dois times).
// Um verso colorido por time revelaria a identidade de quem segura
// o celular antes mesmo de virar — quebraria o sigilo do pass-and-play.

// Monta o HTML da frente da carta — TODAS as informações ficam
// dentro dela (descrição, alvo do delegado, lista de fora-da-lei
// e revólver). O naipe aparece nos cantos, como marca d'água e grande
// acima do nome. Quando há telegrama embaixo, o índice inferior some.
// roleData: { team, suitKey, name, desc1, desc2,
//             delegateHtml?, outlaws?: [..], hasRevolver? }
function buildCardFace(faceEl, roleData) {
    const suitKey = roleData.suitKey || 'LAW';
    const suit = suitSVG(suitKey);
    const teamClass = roleData.team === 'LAW' ? 'team-law' : 'team-outlaw';
    faceEl.className = 'card-face ' + teamClass;

    let extraHtml = '';
    if (roleData.delegateHtml) {
        extraHtml += `<div class="face-extra"><p>${roleData.delegateHtml}</p></div>`;
    }
    if (roleData.escrivaoNames && roleData.escrivaoNames.length === 2) {
        extraHtml += `<div class="face-extra"><h3>${t('escrivao_title')}</h3><p class="escrivao-nomes">`
            + `${roleData.escrivaoNames[0]} &middot; ${roleData.escrivaoNames[1]}</p></div>`;
    }
    if (roleData.outlaws && roleData.outlaws.length) {
        extraHtml += `<div class="face-extra"><h3>${t('others_outlaws')}</h3><ul>` +
            roleData.outlaws.map(o => `<li>${o}</li>`).join('') + `</ul></div>`;
    }
    if (roleData.falsificadorNotice) {
        extraHtml += `<div class="face-extra falsificador-notice"><p>${t('falsificador_notice')}</p></div>`;
    }
    if (roleData.hasRevolver) {
        extraHtml += `<div class="face-extra revolver-line">${t('has_revolver')} <img src="images/revolver.png" alt=""></div>`;
    }

    faceEl.innerHTML = `
        <div class="face-frame"></div>
        <div class="face-content">
            <div class="face-suit">${suit}</div>
            <h1 class="face-role-name">${roleData.name}</h1>
            <p class="face-desc">${roleData.desc1}</p>
            <p class="face-desc" style="margin-top:6px;">${roleData.desc2 || ''}</p>
            ${extraHtml}
        </div>`;
}

// ════════════════════════════════════════════
// A MESA — cena de tudo que é secreto
// ════════════════════════════════════════════
// Dois atos, sempre iguais: a parede do saloon com "passe o celular para
// Fulano", e a mesa lá embaixo. O que espera sobre o feltro muda conforme
// o momento — a carta de identidade ou as duas fichas da missão.

const MESA_BOTOES = ['btn-scene-im', 'btn-flip-card', 'btn-role-understood', 'mission-next-btn'];
const mesaEspera = (ms) => REDUCED_MOTION ? 0 : ms;

// Um botão por vez no rodapé; os outros ficam invisíveis mas ocupando o
// lugar, para a troca não mexer no layout. Busca por id porque os botões
// são clonados a cada rodada.
function mesaMostrar(id) {
    MESA_BOTOES.forEach(b => {
        const el = document.getElementById(b);
        if (el) el.classList.toggle('hidden', b !== id);
    });
}

// Clonar remove os listeners da rodada anterior e devolve o nó vivo.
function mesaTrocaBotao(id) {
    const velho = document.getElementById(id);
    const novo = velho.cloneNode(true);
    velho.parentNode.replaceChild(novo, velho);
    return novo;
}

// Ato 1 → 2. `grupoId` é o que fica esperando sobre o feltro.
function abrirMesa(nome, grupoId, aoChegarNaMesa) {
    const cam = document.getElementById('scene-cam');
    document.getElementById('scene-target').innerText = nome;
    document.querySelectorAll('#screen-mesa .mesa-grupo')
        .forEach(g => g.classList.toggle('hidden', g.id !== grupoId));

    cam.classList.remove('at-table');
    const bIm = mesaTrocaBotao('btn-scene-im');
    bIm.innerText = t('im_name', { name: nome });
    mesaMostrar(null);
    // O botão demora de propósito: dá tempo do celular chegar na mão certa
    // antes de existir algo para tocar.
    setTimeout(() => mesaMostrar('btn-scene-im'), mesaEspera(2000));

    bIm.onclick = () => {
        Haptics.select();
        mesaMostrar(null);
        cam.classList.add('at-table');
        setTimeout(aoChegarNaMesa, mesaEspera(820));
    };
}

// Direto no ato 2, sem o "passe o celular": no modo online cada um joga no
// próprio aparelho (só o site usa). A câmera já nasce na mesa, sem descer.
function mesaDireto(grupoId, aoChegarNaMesa) {
    const cam = document.getElementById('scene-cam');
    document.querySelectorAll('#screen-mesa .mesa-grupo')
        .forEach(g => g.classList.toggle('hidden', g.id !== grupoId));
    cam.style.transition = 'none';
    cam.classList.add('at-table');
    void cam.offsetHeight;
    cam.style.transition = '';
    mesaMostrar(null);
    aoChegarNaMesa();
}

// A carta grande tem tamanho fixo (80% da largura da mesa). Com muitos
// comparsas, revólver e avisos, o texto não cabia e rolava dentro dela —
// o último nome podia passar despercebido. Mede numa cópia invisível no
// tamanho final e encolhe a letra só o necessário, antes de a carta virar.
function ajustaCarta(faceEl) {
    const mesa = document.querySelector('#screen-mesa .act-table');
    const largura = mesa ? mesa.clientWidth * 0.8 : 0;   // .card3d.big { width: 80% }
    faceEl.querySelector('.face-content').style.removeProperty('--esc');
    if (!largura) return;
    const medida = faceEl.cloneNode(true);
    medida.removeAttribute('id');
    Object.assign(medida.style, {
        position: 'fixed', left: '-10000px', top: '0', right: 'auto', bottom: 'auto',
        width: largura + 'px', height: (largura * 7 / 5) + 'px',
        transform: 'none', visibility: 'hidden'
    });
    document.body.appendChild(medida);
    const conteudo = medida.querySelector('.face-content');
    let esc = 1;
    while (esc > 0.72 && conteudo.scrollHeight > conteudo.clientHeight + 1) {
        esc = Math.round((esc - 0.03) * 100) / 100;
        conteudo.style.setProperty('--esc', esc);
    }
    medida.remove();
    if (esc < 1) faceEl.querySelector('.face-content').style.setProperty('--esc', esc);
}

// ── Revelação: a carta descola da mesa, cresce e gira ──
// opts (só o site usa): direto → sem o "passe o celular";
// rotuloFim → texto do botão de esconder.
function runRevealScene(roleData, targetName, onDone, opts = {}) {
    const card  = document.getElementById('reveal-card');
    const inner = document.getElementById('reveal-card-inner');

    buildCardFace(document.getElementById('role-card-display'), roleData);
    ajustaCarta(document.getElementById('role-card-display'));
    card.classList.remove('big');
    inner.classList.remove('flipped');

    const chegar = opts.direto ? (fn) => mesaDireto('mesa-carta', fn)
                               : (fn) => abrirMesa(targetName, 'mesa-carta', fn);
    chegar(() => {
        const bFlip = mesaTrocaBotao('btn-flip-card');
        bFlip.innerText = t('reveal_card');
        mesaMostrar('btn-flip-card');

        bFlip.onclick = () => {
            AudioManager.playSFX('card');
            Haptics.tap();
            mesaMostrar(null);
            card.classList.add('big');
            setTimeout(() => inner.classList.add('flipped'), mesaEspera(220));

            setTimeout(() => {
                const bDone = mesaTrocaBotao('btn-role-understood');
                bDone.innerText = opts.rotuloFim || t('hide_card');
                mesaMostrar('btn-role-understood');
                // A carta desvira, volta ao lugar, e só então o próximo
                // jogador entra (senão as duas cartas se cruzam).
                bDone.onclick = () => {
                    AudioManager.playSFX('card');
                    mesaMostrar(null);
                    inner.classList.remove('flipped');
                    setTimeout(() => card.classList.remove('big'), mesaEspera(300));
                    setTimeout(onDone, mesaEspera(920));
                };
            }, mesaEspera(1000));
        };
    });
}

// ── Missão: as duas fichas são arremessadas na mesa ──
function runMissionScene(targetName, opts) {
    abrirMesa(targetName, 'mesa-fichas', () => renderChipTable(opts));
}

// ════════════════════════════════════════════
// MESA DE DECISÃO — fichas CUMPRIR/SABOTAR
// Duas fichas grandes arremessadas (posição esquerda/direita
// sorteada por jogador). Ao tocar, AMBAS viram pro verso e se
// recolhem empilhadas ao centro (sigilo). Lei tocando na vermelha
// = tremida + aviso, sem registrar.
//
// opts: {
//   rowId, warnId, confirmId, nextBtnId,  // ids dos elementos
//   isLaw,                                // bloqueia sabotar
//   onChoice(isSuccess),                  // registra a escolha
//   onNext()                              // botão "passar o celular"
// }
// ════════════════════════════════════════════
function renderChipTable(opts) {
    const row     = document.getElementById(opts.rowId);
    const warnEl  = document.getElementById(opts.warnId);
    const confEl  = document.getElementById(opts.confirmId);

    const nextBtn = opts.nextBtnId ? mesaTrocaBotao(opts.nextBtnId) : null;
    mesaMostrar(null);

    warnEl.classList.remove('on');
    confEl.classList.remove('on');

    // Sorteia posição: cumprir/sabotar à esquerda ou direita
    const cumprirPrimeiro = Math.random() < 0.5;
    const defs = [
        { tipo: 'cumprir', frente: chipFull('blue', 'LAW'),   verso: chipBack(), label: t('chip_cumprir') },
        { tipo: 'sabotar', frente: chipFull('red', 'OUTLAW'), verso: chipBack(), label: t('chip_sabotar') }
    ];
    if (!cumprirPrimeiro) defs.reverse();

    row.innerHTML = defs.map(d => `
        <div class="chip-col">
            <div class="decision-chip ${d.tipo === 'cumprir' ? 'azul' : 'verm'}" data-tipo="${d.tipo}">
                <div class="dc-inner">
                    <div class="dc-face dc-frente">${d.frente}</div>
                    <div class="dc-face dc-verso">${d.verso}</div>
                </div>
            </div>
            <span class="chip-rotulo">${d.label}</span>
        </div>`).join('');

    const cols   = [...row.children];
    const fichas = cols.map(c => c.querySelector('.decision-chip'));
    let travado  = false;

    // Arremesso
    fichas.forEach((f, i) => {
        setTimeout(() => {
            f.classList.add('thrown');
            AudioManager.playSFX('chip');
        }, REDUCED_MOTION ? 0 : 250 + i * 220);
    });

    fichas.forEach(f => {
        f.onclick = () => {
            if (travado) return;
            if (opts.isLaw && f.dataset.tipo === 'sabotar') {
                f.classList.add('nega');
                warnEl.classList.add('on');
                setTimeout(() => f.classList.remove('nega'), 450);
                setTimeout(() => warnEl.classList.remove('on'), 1800);
                return;
            }
            travado = true;
            AudioManager.playSFX('chip');
            // Mesma vibração para as duas fichas: quem está perto não pode
            // sentir/ouvir diferença entre cumprir e sabotar.
            Haptics.select();
            // Ambas viram pro verso, depois recolhem empilhadas
            fichas.forEach(x => x.classList.add('virada'));
            setTimeout(() => {
                cols.forEach(c => c.classList.add('some'));
                fichas[0].classList.add('recolhe-esq');
                fichas[1].classList.add('recolhe-dir');
                AudioManager.playSFX('chip');
            }, REDUCED_MOTION ? 0 : 500);
            setTimeout(() => confEl.classList.add('on'), REDUCED_MOTION ? 0 : 1050);
            if (nextBtn) {
                setTimeout(() => mesaMostrar(opts.nextBtnId), REDUCED_MOTION ? 0 : 1400);
            }

            opts.onChoice(f.dataset.tipo === 'cumprir');
        };
    });

    // Botão "passar o celular" / avançar (só offline)
    if (nextBtn) nextBtn.onclick = () => { if (travado) opts.onNext(); };
}

// ════════════════════════════════════════════
// RESULTADO DA MISSÃO — fichas arremessadas na mesa
// Uma ficha por membro: azuis primeiro, vermelhas por último.
// Suspense (rufar + escurecida) antes da PRIMEIRA vermelha; e
// também, ocasionalmente (~45%), antes da última azul em missões
// limpas — para o rufar não denunciar que vem sabotagem.
// Vermelha cai com slam/thud/tremida. Overlay vermelho leve na falha.
//
// opts: { rowId, boardId, numId, outcomeId, loreId, nextBtnId,
//         sabotages, total, missionSuccess, onNext() }
// ════════════════════════════════════════════
const CHANCE_SUSPENSE_LIMPO = 0.45;

function playMissionResult(opts) {
    const row     = document.getElementById(opts.rowId);
    const board   = document.getElementById(opts.boardId);
    const numEl   = document.getElementById(opts.numId);
    const outEl   = document.getElementById(opts.outcomeId);
    const loreEl  = document.getElementById(opts.loreId);

    // Clona o botão antes dos timers
    const oldNext = document.getElementById(opts.nextBtnId);
    const nextBtn = oldNext.cloneNode(true);
    oldNext.parentNode.replaceChild(nextBtn, oldNext);
    nextBtn.style.opacity = '0';
    nextBtn.style.pointerEvents = 'none';

    board.classList.remove('on', 'zero');
    outEl.className = 'display text-center';
    outEl.innerText = '';
    loreEl.classList.remove('on');
    document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');

    const azuis = opts.total - opts.sabotages;
    // ordem: azuis, depois vermelhas
    const chips = [];
    for (let i = 0; i < opts.total; i++) chips.push(i >= azuis); // true = vermelha

    // Até 3 fichas cabem numa linha só. De 4 em diante quebra em duas linhas
    // com a menor em cima: 4 → 2+2, 5 → 2+3, 6 → 3+3.
    row.innerHTML = '';
    const naPrimeira = opts.total <= 3 ? opts.total : Math.floor(opts.total / 2);
    const novaLinha = () => {
        const l = document.createElement('div');
        l.className = 'rc-linha';
        row.appendChild(l);
        return l;
    };
    const linhaCima = novaLinha();
    const linhaBaixo = opts.total > naPrimeira ? novaLinha() : linhaCima;

    const els = chips.map((red, i) => {
        const d = document.createElement('div');
        d.className = 'result-chip' + (red ? ' red' : '');
        d.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(1) + 'deg');
        d.innerHTML = red ? chipFull('red', 'OUTLAW') : chipFull('blue', 'LAW');
        d.style.opacity = '0';
        (i < naPrimeira ? linhaCima : linhaBaixo).appendChild(d);
        return d;
    });

    const RM = REDUCED_MOTION;
    let timeouts = [];
    const later = (fn, ms) => timeouts.push(setTimeout(fn, RM ? 0 : ms));

    const suspenseLimpo = opts.sabotages === 0 && Math.random() < CHANCE_SUSPENSE_LIMPO;
    let t = 300;

    els.forEach((el, i) => {
        const red = chips[i];
        const ultima = i === els.length - 1;

        if (!red && ultima && suspenseLimpo) {
            // última azul COM suspense → alívio
            t += 250;
            later(() => { document.body.classList.add('suspense-dim'); AudioManager.playSFX('suspense'); }, t);
            t += 1600;
            later(() => {
                document.body.classList.remove('suspense-dim');
                el.style.opacity = '1';
                el.classList.add('slam-blue');
                AudioManager.playSFX('chip');
            }, t);
            t += 600;
        } else if (!red) {
            later(() => { el.style.opacity = '1'; el.classList.add('thrown'); AudioManager.playSFX('chip'); }, t);
            t += 440;
        } else if (i === azuis) {
            // PRIMEIRA vermelha: suspense + slam
            t += 250;
            later(() => { document.body.classList.add('suspense-dim'); AudioManager.playSFX('suspense'); }, t);
            t += 1600;
            later(() => {
                document.body.classList.remove('suspense-dim');
                el.style.opacity = '1';
                el.classList.add('slam');
                AudioManager.playSFX('thud');
                const stage = document.getElementById('app-container');
                stage.classList.add('result-shake');
                setTimeout(() => stage.classList.remove('result-shake'), RM ? 0 : 500);
            }, t);
            t += 600;
        } else {
            // vermelhas seguintes: rápidas
            later(() => { el.style.opacity = '1'; el.classList.add('slam'); AudioManager.playSFX('thud'); }, t);
            t += 480;
        }
    });

    // Placar
    t += 300;
    later(() => {
        numEl.innerText = opts.sabotages;
        board.classList.add('on');
        if (opts.sabotages === 0) board.classList.add('zero');
    }, t);

    // Veredito + overlay
    t += 550;
    later(() => {
        if (opts.missionSuccess) {
            AudioManager.playSFX('success');
            outEl.innerText = t_('mission_success_t');
            outEl.classList.add('neon-text', 'blue');
            // Sucesso com sabotagem só acontece na missão que precisa de 2:
            // sem explicar, a caveira na mesa parecia um erro do jogo.
            loreEl.innerText = opts.sabotages > 0 ? t_('needed_two_fails') : t_('mission_success_lore');
            document.body.classList.add('bg-winner-law');
        } else {
            AudioManager.playSFX('fail');
            outEl.innerText = t_('mission_fail_t');
            outEl.classList.add('neon-text', 'red');
            loreEl.innerText = t_('mission_fail_lore');
            document.body.classList.add('bg-winner-outlaw');
        }
        loreEl.classList.add('on');
    }, t);

    later(() => {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
    }, t + 450);

    nextBtn.onclick = () => {
        document.body.classList.remove('bg-winner-law', 'bg-winner-outlaw');
        opts.onNext();
    };
}

// atalho seguro p/ t() (evita sombra de variável local 't')
function t_(k, v) { return t(k, v); }

// ════════════════════════════════════════════
// TRILHA DE MISSÕES — fichas que viram
// Cada ficha tem verso (número da missão) e frente (resultado).
// Pendentes ficam de costas; cumpridas/sabotadas viram pra frente.
// Quando uma missão acaba de acontecer (newlyResolvedIndex), anima a virada.
//
// container: elemento da trilha
// missions: array de números (tamanho de cada missão)
// results: { idx: true/false } (true=cumprida, false=sabotada)
// currentIndex: missão atual (de costas, com destaque)
// twoFailsIdx: índice que exige 2 falhas (ou -1)
// newlyResolvedIndex: índice que deve animar a virada agora (ou -1)
// ════════════════════════════════════════════
function buildMissionTrack(container, missions, results, currentIndex, twoFailsIdx, newlyResolvedIndex) {
    container.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const resolved = results[i] === true || results[i] === false;
        const status = results[i] === true ? 'success' : results[i] === false ? 'fail' : 'pending';

        const bubble = document.createElement('div');
        bubble.className = 'mission-bubble';
        if (status === 'success') bubble.classList.add('success');
        if (status === 'fail')    bubble.classList.add('fail');
        if (!resolved && i === currentIndex) bubble.classList.add('current');

        const willAnimate = (i === newlyResolvedIndex);
        // Estrutura de virada: verso (número) + frente (resultado)
        bubble.innerHTML =
            `<div class="mb-inner">
                <div class="mb-side mb-back">${chipBackNumbered(missions[i])}</div>
                <div class="mb-side mb-front">${resolved ? missionFrontSVG(status) : chipBackNumbered(missions[i])}</div>
            </div>`;

        // Resolvidas já entram viradas; a recém-resolvida anima a virada.
        if (resolved && !willAnimate) bubble.classList.add('flipped');

        if (twoFailsIdx === i) bubble.innerHTML += `<div class="miss-sub">${t('two_fails')}</div>`;
        container.appendChild(bubble);

        if (willAnimate) {
            // começa de costas e vira após um instante
            requestAnimationFrame(() => {
                setTimeout(() => bubble.classList.add('flipped'), REDUCED_MOTION ? 0 : 250);
            });
        }
    }
}
