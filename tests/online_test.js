// Teste focado: renderChipTable e playMissionResult nos contêineres ONLINE
const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = '/home/claude/saloon-redesign/';
let html = fs.readFileSync(path+'index.html','utf8').replace(/<script src="https:[^>]+><\/script>/g,'').replace(/<link href="https:[^>]+>/g,'');
const dom = new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://x.test/'});
const { window } = dom; const { document } = window;
window.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
window.Audio=class{play(){return Promise.resolve();}pause(){}set volume(v){}set loop(v){}set currentTime(v){}};
const fb={ref:()=>({on(){},off(){},once:()=>Promise.resolve({val:()=>null}),set(){},update(){},remove(){}})};
window.db=fb; window.firebase={initializeApp(){},database:()=>fb};
window.eval(['i18n.js','art.js','fx.js','app.js'].map(f=>fs.readFileSync(path+f,'utf8')).join('\n;\n'));
const tick=(ms)=>new Promise(r=>setTimeout(r,ms));
let pass=0,fail=0; const check=(c,m)=>{if(c){pass++;console.log('  ✓',m);}else{fail++;console.log('  ✗',m);}};

(async()=>{
  await new Promise(res=>{document.addEventListener('DOMContentLoaded',()=>setTimeout(res,10));setTimeout(()=>{document.dispatchEvent(new window.Event('DOMContentLoaded',{bubbles:true}));setTimeout(res,10);},200);});
  const $=(id)=>document.getElementById(id);

  // Mostra a tela online de missão manualmente e renderiza a mesa
  window.eval("showScreen('screen-online-mission')");
  $('online-mission-action-area').classList.remove('hidden');
  window.eval(`renderChipTable({rowId:'online-mission-chip-row',warnId:'online-law-warning',confirmId:'online-mission-confirm',nextBtnId:null,isLaw:true,onChoice(){window.__chose=true;},onNext(){}})`);
  await tick(50);
  console.log('— Mesa de fichas ONLINE —');
  check($('online-mission-chip-row').querySelectorAll('.decision-chip').length===2,'2 fichas na mesa');
  check($('online-mission-chip-row').querySelectorAll('.dc-frente svg').length>=2,'fichas SVG');
  // Lei toca em sabotar → bloqueia
  $('online-mission-chip-row').querySelector('.decision-chip.verm').click();
  await tick(20);
  check(!window.__chose,'Lei bloqueada ao tocar sabotar (não registrou)');
  check($('online-law-warning').classList.contains('on'),'aviso da Lei apareceu');
  // toca cumprir → registra
  $('online-mission-chip-row').querySelector('.decision-chip.azul').click();
  await tick(20);
  check(window.__chose===true,'cumprir registrou a escolha');

  console.log('— Resultado ONLINE (1 sabotagem em equipe de 3) —');
  window.eval("showScreen('screen-online-mission-result')");
  window.eval(`playMissionResult({rowId:'online-result-chip-row',boardId:'online-sabotage-board',numId:'online-mission-sabotage-count',outcomeId:'online-mission-outcome',loreId:'online-mission-outcome-lore',nextBtnId:'online-btn-mission-next',sabotages:1,total:3,missionSuccess:false,onNext(){window.__next=true;}})`);
  await tick(50);
  check($('online-result-chip-row').querySelectorAll('.result-chip').length===3,'3 fichas de resultado');
  check($('online-result-chip-row').querySelectorAll('.result-chip svg').length>=3,'fichas de resultado SVG');
  // reduced-motion → animação imediata; placar e número já definidos
  await tick(50);
  check(String($('online-mission-sabotage-count').innerText)==='1','placar mostra 1 sabotagem');
  check($('online-mission-outcome').innerText.length>3,'veredito preenchido');

  console.log(`\nONLINE VISUAL: ${pass} ✓ / ${fail} ✗`);
  process.exit(fail?1:0);
})().catch(e=>{console.error('ERRO:',e);process.exit(1);});
