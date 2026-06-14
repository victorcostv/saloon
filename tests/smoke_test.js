// Smoke test do Saloon redesign — fluxo offline completo via jsdom
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = '/home/claude/saloon-redesign/';

let html = fs.readFileSync(path + 'index.html', 'utf8');
// Remove scripts externos (fonts/firebase) para o jsdom
html = html.replace(/<script src="https:[^>]+><\/script>/g, '');
html = html.replace(/<link href="https:[^>]+>/g, '');

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://saloon.test/' });
const { window } = dom;
const { document } = window;

// ── Stubs ──
window.matchMedia = () => ({ matches: true, addListener(){}, removeListener(){} }); // reduced motion p/ pular delays
window.Audio = class { constructor(){} load(){} play(){ return Promise.resolve(); } pause(){} set volume(v){} get volume(){return 0;} set currentTime(v){} set loop(v){} set onended(f){} };
window.alert = (m) => { window.__lastAlert = m; };
const fbStub = { ref: () => ({ on(){}, off(){}, once: () => Promise.resolve({ val: () => null, exists: () => false }), set: () => Promise.resolve(), update: () => Promise.resolve(), remove: () => Promise.resolve() }) };
window.db = fbStub;
window.firebase = { initializeApp(){}, database: () => fbStub };

// ── Carregar scripts na ordem ──
const bundle = ['i18n.js', 'art.js', 'fx.js', 'app.js'].map(f => fs.readFileSync(path + f, 'utf8')).join('\n;\n');
window.eval(bundle);
async function waitDomReady() {
// Aguardar o DOMContentLoaded NATURAL do jsdom (disparado async após o load)
await new Promise(resolve => {
    if (window.__domReadyFired) return resolve();
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    document.addEventListener('DOMContentLoaded', () => setTimeout(finish, 10));
    setTimeout(() => { // fallback: dispara manualmente se o jsdom não disparar
        if (!done) {
            document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true }));
            setTimeout(finish, 10);
        }
    }, 300);
});
}

const $ = (id) => document.getElementById(id);
const activeScreen = () => document.querySelector('.screen.active')?.id;
const click = (id) => { const el = $(id); if (!el) throw new Error('Elemento não achado: ' + id); el.click(); };
const tick = (ms) => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗ FALHOU:', msg, '| tela ativa:', activeScreen()); } };

(async () => {
    await waitDomReady();
    console.log('— Boot —');
    check(activeScreen() === 'screen-splash', 'splash ativa no boot');

    // Idioma aplicado
    check($('btn-mode-offline') && document.documentElement.lang.startsWith('pt'), 'idioma PT aplicado');

    click('screen-splash');
    check(activeScreen() === 'screen-mode-select', 'splash → seleção de modo');

    console.log('— Troca de idioma —');
    document.querySelector('.lang-opt[data-lang="en"]').click();
    check($('btn-mode-offline').innerText.includes('Pass & Play'), 'EN aplicado em botão');
    document.querySelector('.lang-opt[data-lang="pt"]').click();
    check(document.documentElement.lang === 'pt-BR', 'volta para PT');

    console.log('— Setup de jogadores —');
    click('btn-mode-offline');
    check(activeScreen() === 'screen-setup-players', 'tela de setup');
    const names = ['Ana', 'Beto', 'Caio', 'Duda', 'Eva'];
    const form = $('add-player-form');
    for (const n of names) {
        $('player-name-input').value = n;
        form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    }
    check(document.querySelectorAll('#player-setup-list li').length === 5, '5 jogadores listados');
    check(!$('btn-go-to-advanced').disabled, 'botão Próximo habilitado com 5');

    click('btn-go-to-advanced');
    check(activeScreen() === 'screen-setup-advanced', 'tela de extras');

    console.log('— Início da partida e revelação (a carta) —');
    click('btn-start-game');
    await tick(150); // cinematicTransition (reduced motion = imediato, mas com folga)
    console.log('  [debug] telas ativas:', [...document.querySelectorAll('.screen.active')].map(s => s.id).join(', '));
    check(activeScreen() === 'screen-pass-device', 'confirmação "Você é X?"');
    check($('pass-device-target').innerText === 'Ana', 'primeiro jogador é Ana');
    check($('pass-device-question').innerHTML.includes('Ana'), 'pergunta menciona o nome');

    // Botão "Não" → dica
    click('btn-confirm-no');
    check($('pass-hint').innerText.includes('Ana'), '"Não" mostra dica de passar o celular');

    // Loop de revelação dos 5 jogadores
    for (let i = 0; i < 5; i++) {
        click('btn-reveal-action'); // Sim, sou eu
        await tick(80);
        check(activeScreen() === 'screen-role-reveal', `(${i + 1}/5) cena da carta aberta`);
        await tick(500); // arremesso (reduzido)
        check(!$('btn-flip-card').classList.contains('hidden'), `(${i + 1}/5) botão "Virar carta" apareceu`);
        click('btn-flip-card');
        await tick(80);
        check($('reveal-card-inner').classList.contains('flipped'), `(${i + 1}/5) carta virada`);
        const faceNameEl = $('role-card-display').querySelector('.face-role-name');
        if (!faceNameEl) console.log('  [debug] face innerHTML:', $('role-card-display').innerHTML.slice(0, 200));
        check(faceNameEl && (faceNameEl.textContent || '').length > 0, `(${i + 1}/5) papel exibido na carta`);
        click('btn-role-understood');
        await tick(300);
    }

    check(activeScreen() === 'screen-board', 'após 5 revelações → tabuleiro');
    check(document.querySelectorAll('#mission-track-container .mission-bubble').length === 5, '5 fichas de missão');
    check(document.querySelector('#mission-track-container .mission-bubble.current'), 'ficha atual destacada');
    check($('mission-lore').innerText.includes('Missão 1'), 'lore da missão 1');

    console.log('— Propor equipe e votação —');
    const reqSize = parseInt(String($('mission-size-req').innerText)); // 2 para 5 jogadores
    const items = document.querySelectorAll('#team-select-list .selectable-item');
    for (let i = 0; i < reqSize; i++) items[i].click();
    check(!$('btn-submit-team').disabled, 'Propor Equipe habilitado com time completo');
    click('btn-submit-team');
    check(activeScreen() === 'screen-voting', 'tela de votação');
    console.log('  [debug] majority-number =', JSON.stringify($('majority-number')?.innerText), '| count de ids:', document.querySelectorAll('#majority-number').length);
    check(String($('majority-number').innerText) === '3', 'maioria = 3 para 5 jogadores');

    click('btn-vote-trust-group'); // aprovada
    await tick(150);
    check(activeScreen() === 'screen-pass-device', 'missão: confirmação do 1º membro');

    console.log('— Execução da missão —');
    for (let i = 0; i < reqSize; i++) {
        click('btn-reveal-action');
        check(activeScreen() === 'screen-mission', `membro ${i + 1} na tela de missão`);
        await tick(60);
        check($('mission-chip-row').querySelectorAll('.decision-chip').length === 2, `(${i+1}) duas fichas na mesa`);
        check($('mission-chip-row').querySelectorAll('.dc-frente svg').length >= 2, `(${i+1}) fichas SVG renderizadas`);
        // toca na ficha CUMPRIR (a azul)
        $('mission-chip-row').querySelector('.decision-chip.azul').click();
        await tick(80);
        click('mission-next-btn');
        await tick(120);
    }
    check(activeScreen() === 'screen-mission-result', 'resultado da missão (suspense embutido)');
    check($('result-chip-row').querySelectorAll('.result-chip').length === reqSize, 'fichas de resultado = tamanho da equipe');
    check($('result-chip-row').querySelectorAll('.result-chip svg').length >= reqSize, 'fichas de resultado em SVG');
    await tick(200);
    check($('mission-outcome').innerText.length > 3, 'texto do resultado preenchido');
    check(String($('sabotage-number').innerText) === '0', '0 sabotagens');

    await tick(200);
    click('btn-mission-result-next');
    check(activeScreen() === 'screen-board', 'volta ao tabuleiro para missão 2');
    console.log('  [debug] current-mission-num =', JSON.stringify($('current-mission-num')?.innerText), '| ids:', document.querySelectorAll('#current-mission-num').length, '| lore:', $('mission-lore').innerText.slice(0,30));
    check(String($('current-mission-num').innerText) === '2', 'missão 2 ativa');
    check(document.querySelector('#mission-track-container .mission-bubble.success'), 'ficha 1 azul (sucesso)');

    console.log('— Tutorial e menu —');
    window.showTutorial('GENERAL');
    check(activeScreen() === 'screen-tutorial', 'tutorial abre');
    check($('tutorial-content').innerHTML.includes('dedução social'), 'conteúdo do tutorial em PT');
    check($('tutorial-content').querySelectorAll('.mini-card').length === 2, 'mini-cartas dos times no tutorial');
    check($('tutorial-content').querySelectorAll('.passo').length === 4, '4 passos na trilha da rodada');
    check($('tutorial-content').querySelectorAll('.chip').length === 5, '5 fichas ilustrativas');
    check($('tutorial-content').querySelector('.alerta'), 'alerta das 5 rejeições presente');
    window.closeTutorial();
    check(activeScreen() === 'screen-board', 'tutorial fecha e volta ao tabuleiro');

    console.log('— Tutoriais dos extras e versão EN —');
    window.showTutorial('DELEGADO');
    check($('tutorial-content').innerHTML.includes('Delegado e Chefe'), 'tutorial do Delegado/Chefe (via botão i)');
    check($('tutorial-content').querySelectorAll('.mini-card').length === 2, 'mini-cartas ♣/♥ no tutorial dos extras');
    window.closeTutorial();
    window.showTutorial('REVOLVER');
    check($('tutorial-content').innerHTML.includes('duelo'), 'tutorial do Revólver (via botão i)');
    window.closeTutorial();

    document.querySelector('.lang-opt[data-lang="en"]').click();
    window.showTutorial('GENERAL');
    check($('tutorial-content').innerHTML.includes('social deduction'), 'tutorial GENERAL em inglês');
    window.closeTutorial();
    document.querySelector('.lang-opt[data-lang="pt"]').click();

    console.log(`\nRESULTADO: ${pass} ✓ / ${fail} ✗`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERRO FATAL:', e); process.exit(1); });
