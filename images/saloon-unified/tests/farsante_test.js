const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = '/home/claude/saloon-unified/';
let html = fs.readFileSync(path+'index.html','utf8').replace(/<script src="https:[^>]+><\/script>/g,'').replace(/<link href="https:[^>]+>/g,'');
const dom = new JSDOM(html,{runScripts:'outside-only',pretendToBeVisual:true,url:'https://x.test/'});
const { window } = dom; const { document } = window;
window.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
window.Audio=class{play(){return Promise.resolve();}pause(){}set volume(v){}set loop(v){}set currentTime(v){}};
const fb={ref:()=>({on(){},off(){},once:()=>Promise.resolve({val:()=>null}),set(){},update(){},remove(){}})};
window.db=fb; window.firebase={initializeApp(){},database:()=>fb};

// roda tudo num escopo só e expõe via window
const code = ['i18n.js','art.js','fx.js','app.js'].map(f=>fs.readFileSync(path+f,'utf8')).join('\n;\n')
  + '\n;window.state=state; window.GAME_CONFIG=GAME_CONFIG; window.shuffle=shuffle; window.buildOfflineRoleData=buildOfflineRoleData;';
window.eval(code);

const state=window.state, GAME_CONFIG=window.GAME_CONFIG, shuffle=window.shuffle, buildOfflineRoleData=window.buildOfflineRoleData;
let pass=0,fail=0; const check=(c,m)=>{if(c)pass++;else{fail++;console.log('  ✗',m);}};

state.players = ['A','B','C','D','E','F','G'].map(n=>({name:n}));
state.extras = state.extras||{};

function distribute(farsante) {
  const pCount=state.players.length;
  state.config=GAME_CONFIG[pCount];
  state.extras.roles=true; state.extras.revolver=false; state.extras.farsante=farsante;
  let roles=[]; for(let i=0;i<state.config.outlaws;i++)roles.push('OUTLAW'); for(let i=0;i<pCount-state.config.outlaws;i++)roles.push('LAW');
  roles=shuffle(roles);
  state.players.forEach((p,i)=>{p.role=roles[i];p.isBoss=false;p.isDelegado=false;p.isEscrivao=false;p.isFalsificador=false;});
  let outlawsIdx=state.players.map((p,i)=>p.role==='OUTLAW'?i:-1).filter(i=>i!==-1);
  let lawIdx=state.players.map((p,i)=>p.role==='LAW'?i:-1).filter(i=>i!==-1);
  state.bossIndex=outlawsIdx[Math.floor(Math.random()*outlawsIdx.length)];
  state.players[state.bossIndex].isBoss=true;
  state.delegadoIndex=lawIdx[Math.floor(Math.random()*lawIdx.length)];
  state.players[state.delegadoIndex].isDelegado=true;
  let commonOutlaws=outlawsIdx.filter(i=>i!==state.bossIndex);
  state.delegadoTargetIndex=commonOutlaws[Math.floor(Math.random()*commonOutlaws.length)];
  if(farsante){
    state.falsificadorIndex=commonOutlaws[Math.floor(Math.random()*commonOutlaws.length)];
    state.players[state.falsificadorIndex].isFalsificador=true;
    let escr=lawIdx.filter(i=>i!==state.delegadoIndex);
    state.escrivaoIndex=escr[Math.floor(Math.random()*escr.length)];
    state.players[state.escrivaoIndex].isEscrivao=true;
    let vis=commonOutlaws.filter(i=>i!==state.falsificadorIndex);
    state.delegadoTargetIndex = vis.length>0 ? vis[Math.floor(Math.random()*vis.length)] : state.bossIndex;
  } else { state.falsificadorIndex=-1; state.escrivaoIndex=-1; }
}

const total=400;
let fc=0,ed=0,df=0,e2=0,fn=0;
for(let r=0;r<total;r++){
  distribute(true);
  if(state.falsificadorIndex!==state.bossIndex)fc++;
  if(state.escrivaoIndex!==state.delegadoIndex)ed++;
  if(state.delegadoTargetIndex!==state.falsificadorIndex)df++;
  const rd=buildOfflineRoleData(state.escrivaoIndex);
  if(rd.escrivaoNames&&rd.escrivaoNames.length===2)e2++;
  // os 2 nomes do escrivão devem ser exatamente o delegado real e o falsificador
  const exp=[state.players[state.delegadoIndex].name, state.players[state.falsificadorIndex].name].sort().join();
  const got=[...rd.escrivaoNames].sort().join();
  const rf=buildOfflineRoleData(state.falsificadorIndex);
  if(rf.falsificadorNotice && rf.suitKey==='FALSIFICADOR' && exp===got)fn++;
}
check(fc===total,'Falsificador nunca é o Chefe ('+fc+'/'+total+')');
check(ed===total,'Escrivão nunca é o Delegado ('+ed+'/'+total+')');
check(df===total,'Delegado nunca vê o Falsificador ('+df+'/'+total+')');
check(e2===total,'Escrivão sempre vê 2 nomes ('+e2+'/'+total+')');
check(fn===total,'Falsificador: aviso+suit+nomes corretos ('+fn+'/'+total+')');

distribute(false);
check(state.escrivaoIndex===-1&&state.falsificadorIndex===-1,'Sem Farsante não há Escrivão/Falsificador');
// suit do delegado e chefe ainda corretos sem farsante
const rdel=buildOfflineRoleData(state.delegadoIndex);
const rbos=buildOfflineRoleData(state.bossIndex);
check(rdel.suitKey==='DELEGADO','Delegado suit ok sem farsante');
check(rbos.suitKey==='BOSS','Chefe suit ok sem farsante');

console.log(`\nFARSANTE OFFLINE: ${pass} ✓ / ${fail} ✗`);
process.exit(fail?1:0);
