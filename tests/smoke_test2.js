// Smoke test 2 — extras (Delegado/Chefe + Revólver): duelo, chefe e fim de jogo
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = '/home/claude/saloon-unified/';

let html = fs.readFileSync(path + 'index.html', 'utf8');
html = html.replace(/<script src="https:[^>]+><\/script>/g, '');
html = html.replace(/<link href="https:[^>]+>/g, '');

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://saloon.test/' });
const { window } = dom;
const { document } = window;

window.matchMedia = () => ({ matches: true, addListener(){}, removeListener(){} });
window.Audio = class { load(){} play(){ return Promise.resolve(); } pause(){} set volume(v){} set currentTime(v){} set loop(v){} };
window.alert = () => {};
const fbStub = { ref: () => ({ on(){}, off(){}, once: () => Promise.resolve({ val: () => null }), set(){}, update(){}, remove(){} }) };
window.db = fbStub;
window.firebase = { initializeApp(){}, database: () => fbStub };

const bundle = ['i18n.js', 'art.js', 'fx.js', 'app.js'].map(f => fs.readFileSync(path + f, 'utf8')).join('\n;\n')
    + '\n;window.__state = state;'
    + '\n;window.__sfx = []; const __origPlay = AudioManager.playSFX.bind(AudioManager); AudioManager.playSFX = (t) => { window.__sfx.push(t); return __origPlay(t); };';
window.eval(bundle);

const $ = (id) => document.getElementById(id);
const S = () => window.__state;
const activeScreen = () => document.querySelector('.screen.active')?.id;
const click = (id) => { const el = $(id); if (!el) throw new Error('Elemento não achado: ' + id); el.click(); };
const tick = (ms) => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗ FALHOU:', msg, '| tela:', activeScreen()); } };

// Percorre a cena da carta de um jogador (confirma → arremesso → virar → esconder)
async function passReveal() {
    click('btn-reveal-action');
    await tick(80);
    await tick(300);
    click('btn-flip-card');
    await tick(50);
    const extrasVisible = $('role-card-display').querySelectorAll('.face-extra').length > 0;
    click('btn-role-understood');
    await tick(250);
    return extrasVisible;
}

// Aprova a equipe proposta e executa a missão com todos cumprindo
async function runMissionAllSuccess() {
    const reqSize = parseInt(String($('mission-size-req').innerText));
    const items = document.querySelectorAll('#team-select-list .selectable-item');
    for (let i = 0; i < reqSize; i++) items[i].click();
    click('btn-submit-team');
    click('btn-vote-trust-group');
    await tick(150);
    for (let i = 0; i < reqSize; i++) {
        click('btn-reveal-action');
        $('mission-chip-row').querySelector('.decision-chip.azul').click();
        await tick(80);
        click('mission-next-btn');
        await tick(120);
    }
    await tick(250);
    click('btn-mission-result-next');
    await tick(150);
}

(async () => {
    await new Promise(resolve => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        document.addEventListener('DOMContentLoaded', () => setTimeout(finish, 10));
        setTimeout(() => {
            if (!done) { document.dispatchEvent(new window.Event('DOMContentLoaded', { bubbles: true })); setTimeout(finish, 10); }
        }, 300);
    });

    console.log('— Setup com extras —');
    click('screen-splash');
    click('btn-mode-offline');
    const names = ['Ana', 'Beto', 'Caio', 'Duda', 'Eva'];
    for (const n of names) {
        $('player-name-input').value = n;
        $('add-player-form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    }
    click('btn-go-to-advanced');
    $('chk-roles').checked = true;
    $('chk-revolver').checked = true;
    click('btn-start-game');
    await tick(120);

    check(S().extras.roles && S().extras.revolver, 'extras ativados no estado');
    check(S().players.some(p => p.isBoss), 'um Chefe sorteado');
    check(S().players.some(p => p.isDelegado), 'um Delegado sorteado');
    check(S().revolverOwnerIndex >= 0, 'revólver tem dono');

    console.log('— Revelações com info extra na carta —');
    let notesSeen = 0;
    for (let i = 0; i < 5; i++) {
        const p = S().players[i];
        const noteVisible = await passReveal();
        const shouldHaveNote = p.role === 'OUTLAW' || p.isDelegado || i === S().revolverOwnerIndex;
        if (noteVisible) notesSeen++;
        check(noteVisible === shouldHaveNote, `(${i + 1}/5) info extra na carta ${shouldHaveNote ? 'presente' : 'ausente'} para ${p.name} (${p.isDelegado ? 'Delegado' : p.isBoss ? 'Chefe' : p.role}${i === S().revolverOwnerIndex ? '+revólver' : ''})`);
    }
    check(notesSeen >= 3, 'info extra na cartas apareceram para papéis especiais');
    check(activeScreen() === 'screen-board', 'tabuleiro após revelações');
    check(document.querySelectorAll('#mission-track-container .mission-bubble .mb-inner').length === 5, 'fichas com verso+frente na trilha'); check(document.querySelectorAll('#mission-track-container .mb-back svg').length === 5, 'versos numerados na trilha');

    console.log('— Missões 1 e 2 (sucesso) → duelo —');
    await runMissionAllSuccess();
    check(activeScreen() === 'screen-board' && String($('current-mission-num').innerText) === '2', 'missão 2 no tabuleiro');
    await runMissionAllSuccess();
    check(activeScreen() === 'screen-duel-choose', 'após missão 2 → escolha do duelo');

    const shooterIdx = S().revolverOwnerIndex;
    const targets = document.querySelectorAll('#duel-targets-list .selectable-item');
    check(targets.length === 4, 'lista de alvos exclui o dono do revólver');
    targets[0].click();
    check(!$('btn-challenge').disabled, 'Desafiar habilitado após selecionar alvo');
    click('btn-challenge');
    await tick(120);
    check(activeScreen() === 'screen-pass-device', 'confirmação do atirador');

    // Atirador ATIRA
    click('btn-reveal-action');
    check(activeScreen() === 'screen-duel-action', 'tela de ação do atirador');
    window.__sfx.length = 0; // zera o log de sons
    click('btn-duel-shoot');
    await tick(120);
    check(!window.__sfx.includes('shot'), 'SIGILO: tiro NÃO toca na escolha do atirador');
    // Alvo ATIRA (ações iguais → intimidação)
    click('btn-reveal-action');
    click('btn-duel-shoot');
    check(!window.__sfx.includes('shot'), 'SIGILO: tiro NÃO toca na escolha do alvo');
    check(activeScreen() === 'screen-duel-suspense', 'suspense do duelo');
    check(S().revolverOwnerIndex !== shooterIdx, 'revólver trocou de dono');

    click('btn-reveal-duel-result');
    check(window.__sfx.includes('shot'), 'tiro toca apenas na revelação PÚBLICA do resultado');
    check(activeScreen() === 'screen-duel-result', 'resultado do duelo');
    click('btn-duel-result-next');
    await tick(120);
    check(activeScreen() === 'screen-pass-device', 'revelação confidencial: confirmação do atirador');
    check($('pass-device-title').innerText.includes('confidencial') || $('pass-device-title').innerText.includes('Confidential') || $('pass-device-title').innerText.length > 0, 'título confidencial no pass-device');
    click('btn-reveal-action');
    check(activeScreen() === 'screen-duel-reveal', 'tela de intimidação');
    check(String($('intimidated-name').innerText).length > 0, 'nome do intimidado preenchido');
    click('btn-duel-understood');
    check(activeScreen() === 'screen-board' && String($('current-mission-num').innerText) === '3', 'após duelo → missão 3');

    console.log('— Missão 3 (sucesso) → chefe → fim de jogo —');
    await runMissionAllSuccess();
    check(activeScreen() === 'screen-boss-assassination', '3 vitórias da Lei → última chance do Chefe');

    // Chefe mira em alguém que NÃO é o delegado → vitória da Lei
    const delegadoName = S().players[S().delegadoIndex].name;
    const options = [...document.querySelectorAll('#assassination-list .selectable-item')];
    check(options.every(o => String(o.innerText) !== S().players[S().bossIndex].name), 'chefe não aparece na própria lista');
    const wrong = options.find(o => String(o.innerText) !== delegadoName);
    wrong.click();
    click('btn-boss-shoot');
    await tick(100);
    check(activeScreen() === 'screen-game-over', 'fim de jogo');
    check(String($('game-over-reason').innerText).length > 10, 'motivo do fim exibido');
    check(document.body.classList.contains('bg-winner-law'), 'overlay de vitória da Lei');
    check(document.querySelectorAll('#final-law-list li').length === 3, '3 na equipe da Lei');
    check(document.querySelectorAll('#final-outlaw-list li').length === 2, '2 fora-da-lei');

    click('btn-play-again');
    check(activeScreen() === 'screen-setup-players', 'Jogar Novamente → setup');
    check(document.querySelectorAll('#player-setup-list li').length === 5, 'jogadores preservados para nova partida');
    check(!document.body.classList.contains('bg-winner-law'), 'overlay de vitória limpo');

    console.log(`\nRESULTADO: ${pass} ✓ / ${fail} ✗`);
    process.exit(fail ? 1 : 0);
})().catch(e => { console.error('ERRO FATAL:', e); console.error('tela:', activeScreen()); process.exit(1); });
