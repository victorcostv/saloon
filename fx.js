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
    const letter = SUIT_LETTER[suitKey] || 'L';
    const teamClass = roleData.team === 'LAW' ? 'team-law' : 'team-outlaw';
    faceEl.className = 'card-face ' + teamClass;

    let extraHtml = '';
    if (roleData.delegateHtml) {
        extraHtml += `<div class="face-extra"><p>${roleData.delegateHtml}</p></div>`;
    }
    if (roleData.outlaws && roleData.outlaws.length) {
        extraHtml += `<div class="face-extra"><h3>${t('others_outlaws')}</h3><ul>` +
            roleData.outlaws.map(o => `<li>${o}</li>`).join('') + `</ul></div>`;
    }
    if (roleData.hasRevolver) {
        extraHtml += `<div class="face-extra revolver-line">${t('has_revolver')} <img src="images/revolver.png" alt=""></div>`;
    }

    // Com telegrama embaixo, o índice inferior é omitido para não competir.
    const brIndex = extraHtml
        ? ''
        : `<div class="corner-index br"><div class="cn">${suit}</div><b>${letter}</b></div>`;

    faceEl.innerHTML = `
        <div class="corner-index tl"><div class="cn">${suit}</div><b>${letter}</b></div>
        ${brIndex}
        <div class="center-pip">${suit}</div>
        <div class="face-content">
            <div class="face-suit">${suit}</div>
            <h1 class="face-role-name">${roleData.name}</h1>
            <p class="face-desc">${roleData.desc1}</p>
            <p class="face-desc" style="margin-top:6px;">${roleData.desc2 || ''}</p>
            ${extraHtml}
        </div>`;
}

// Controla a cena: arremesso → virar → esconder.
// ids:  { card, inner, face, btnFlip, btnDone }
// opts: { onDone(btn), doneLabelKey?, keepCardOnDone? }
function runCardScene(ids, roleData, opts) {
    const onDone       = opts.onDone || function () {};
    const doneLabelKey = opts.doneLabelKey;
    const card  = document.getElementById(ids.card);
    const inner = document.getElementById(ids.inner);
    const face  = document.getElementById(ids.face);

    // Clona os botões ANTES de qualquer agendamento — remove listeners
    // antigos e garante que os timers referenciem os nós vivos no DOM.
    const swapClone = (id) => {
        const old = document.getElementById(id);
        const clone = old.cloneNode(true);
        old.parentNode.replaceChild(clone, old);
        return clone;
    };
    const bFlip = swapClone(ids.btnFlip);
    const bDone = swapClone(ids.btnDone);

    buildCardFace(face, roleData);

    // Estado inicial: carta fora da mesa, virada para baixo
    inner.classList.remove('flipped');
    card.classList.remove('thrown');
    card.classList.add('offstage');
    bFlip.classList.add('hidden');
    bDone.classList.add('hidden');
    bDone.innerText = t(doneLabelKey || 'hide_card');
    bDone.classList.remove('is-ready');
    bDone.style.opacity = '1';

    // Arremesso da carta sobre a mesa
    requestAnimationFrame(() => {
        setTimeout(() => {
            card.classList.remove('offstage');
            card.classList.add('thrown');
            AudioManager.playSFX('card');
            const landMs = REDUCED_MOTION ? 50 : 700;
            setTimeout(() => {
                bFlip.classList.remove('hidden');
            }, landMs);
        }, REDUCED_MOTION ? 0 : 350);
    });

    // Virar a carta
    bFlip.onclick = () => {
        AudioManager.playSFX('card');
        inner.classList.add('flipped');
        bFlip.classList.add('hidden');
        setTimeout(() => {
            bDone.classList.remove('hidden');
        }, REDUCED_MOTION ? 0 : 450);
    };

    // Esconder a carta e seguir
    // (com keepCardOnDone, o botão vira um toggle e a carta permanece à mesa)
    bDone.onclick = () => {
        AudioManager.playSFX('card');
        if (opts.keepCardOnDone) {
            onDone(bDone);
            return;
        }
        inner.classList.remove('flipped');
        bDone.disabled = true;
        setTimeout(() => {
            bDone.disabled = false;
            onDone(bDone);
        }, REDUCED_MOTION ? 50 : 550);
    };

    return { card, inner, doneBtn: bDone };
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

    // Botão "passar o celular" é opcional (offline tem; online não).
    let nextBtn = null;
    const oldNext = opts.nextBtnId ? document.getElementById(opts.nextBtnId) : null;
    if (oldNext) {
        nextBtn = oldNext.cloneNode(true);
        oldNext.parentNode.replaceChild(nextBtn, oldNext);
        nextBtn.style.opacity = '0';
        nextBtn.style.pointerEvents = 'none';
    }

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
                setTimeout(() => {
                    nextBtn.style.opacity = '1';
                    nextBtn.style.pointerEvents = 'auto';
                }, REDUCED_MOTION ? 0 : 1400);
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

    row.innerHTML = '';
    const els = chips.map((red) => {
        const d = document.createElement('div');
        d.className = 'result-chip' + (red ? ' red' : '');
        d.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(1) + 'deg');
        d.innerHTML = red ? chipFull('red', 'OUTLAW') : chipFull('blue', 'LAW');
        d.style.opacity = '0';
        row.appendChild(d);
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
            loreEl.innerText = t_('mission_success_lore');
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
