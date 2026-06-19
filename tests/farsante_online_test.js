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
const code=['i18n.js','art.js','fx.js','app.js'].map(f=>fs.readFileSync(path+f,'utf8')).join('\n;\n')
  + '\n;window.shuffle=shuffle; window.GAME_CONFIG=GAME_CONFIG;';
window.eval(code);
const shuffle=window.shuffle, GAME_CONFIG=window.GAME_CONFIG;
let pass=0,fail=0; const check=(c,m)=>{if(c)pass++;else{fail++;console.log('  ✗',m);}};

// Replica EXATA da lógica de distribuição online do host (do app.js)
function hostDistribute(playerNames, extras) {
  const players = playerNames.map(n=>({name:n}));
  const count = players.length;
  const config = GAME_CONFIG[count];
  let roles=[];
  for(let i=0;i<config.outlaws;i++)roles.push('OUTLAW');
  for(let i=0;i<count-config.outlaws;i++)roles.push('LAW');
  roles=shuffle(roles);
  const updates={};
  players.forEach((p,i)=>{
    updates[`players/${p.name}/role`]=roles[i];
    updates[`players/${p.name}/isBoss`]=false;
    updates[`players/${p.name}/isDelegado`]=false;
    updates[`players/${p.name}/isEscrivao`]=false;
    updates[`players/${p.name}/isFalsificador`]=false;
  });
  const farsanteOn = !!extras.farsante && !!extras.roles;
  if(extras.roles){
    const outlawIdxs=players.map((p,i)=>roles[i]==='OUTLAW'?i:-1).filter(i=>i!==-1);
    const lawIdxs=players.map((p,i)=>roles[i]==='LAW'?i:-1).filter(i=>i!==-1);
    const bossIdx=outlawIdxs[Math.floor(Math.random()*outlawIdxs.length)];
    const delegadoIdx=lawIdxs[Math.floor(Math.random()*lawIdxs.length)];
    const commonOuts=outlawIdxs.filter(i=>i!==bossIdx);
    let delegadoTargetIdx=commonOuts[Math.floor(Math.random()*commonOuts.length)];
    updates[`players/${players[bossIdx].name}/isBoss`]=true;
    updates[`players/${players[delegadoIdx].name}/isDelegado`]=true;
    updates['delegadoName']=players[delegadoIdx].name;
    if(farsanteOn){
      const falsIdx=commonOuts[Math.floor(Math.random()*commonOuts.length)];
      updates[`players/${players[falsIdx].name}/isFalsificador`]=true;
      updates['falsificadorName']=players[falsIdx].name;
      const escrCands=lawIdxs.filter(i=>i!==delegadoIdx);
      const escrIdx=escrCands[Math.floor(Math.random()*escrCands.length)];
      updates[`players/${players[escrIdx].name}/isEscrivao`]=true;
      updates['escrivaoName']=players[escrIdx].name;
      const visiveis=commonOuts.filter(i=>i!==falsIdx);
      delegadoTargetIdx = visiveis.length>0 ? visiveis[Math.floor(Math.random()*visiveis.length)] : bossIdx;
      updates['escrivaoNames']=shuffle([players[delegadoIdx].name, players[falsIdx].name]);
    }
    updates['delegadoTargetName']=players[delegadoTargetIdx].name;
  }
  return {updates, players, roles};
}

const names=['A','B','C','D','E','F','G'];
const total=400;
let fc=0,ed=0,df=0,en=0,bossSeen=0;
for(let r=0;r<total;r++){
  const {updates,players}=hostDistribute(names,{roles:true,revolver:false,farsante:true});
  const boss=updates['falsificadorName']; // nome
  // acha quem é o quê
  const get=(flag)=>players.find(p=>updates[`players/${p.name}/${flag}`]===true);
  const bossP=get('isBoss'), delP=get('isDelegado'), escrP=get('isEscrivao'), falsP=get('isFalsificador');
  if(falsP.name!==bossP.name)fc++;
  if(escrP.name!==delP.name)ed++;
  if(updates['delegadoTargetName']!==falsP.name)df++;
  // escrivaoNames = delegado real + falsificador
  const exp=[delP.name, falsP.name].sort().join();
  const got=[...updates['escrivaoNames']].sort().join();
  if(exp===got)en++;
  // o alvo do delegado nunca é o falsificador; mas PODE ser o chefe se não houver outro comum
  if(updates['delegadoTargetName']===bossP.name)bossSeen++;
}
check(fc===total,'[online] Falsificador nunca é o Chefe ('+fc+'/'+total+')');
check(ed===total,'[online] Escrivão nunca é o Delegado ('+ed+'/'+total+')');
check(df===total,'[online] Delegado nunca vê o Falsificador ('+df+'/'+total+')');
check(en===total,'[online] escrivaoNames = Delegado real + Falsificador ('+en+'/'+total+')');

// Sem farsante: ninguém é escrivão/falsificador
let semFars=0;
for(let r=0;r<100;r++){
  const {updates,players}=hostDistribute(names,{roles:true,revolver:false,farsante:false});
  const anyEscr=players.some(p=>updates[`players/${p.name}/isEscrivao`]===true);
  const anyFals=players.some(p=>updates[`players/${p.name}/isFalsificador`]===true);
  if(!anyEscr&&!anyFals)semFars++;
}
check(semFars===100,'[online] Sem Farsante não há Escrivão/Falsificador ('+semFars+'/100)');

// farsante sem roles = desligada
const {updates:u2,players:p2}=hostDistribute(names,{roles:false,revolver:false,farsante:true});
const anyE=p2.some(p=>u2[`players/${p.name}/isEscrivao`]===true);
check(!anyE,'[online] Farsante exige Distintivo (roles=false => sem escrivão)');

console.log(`\nFARSANTE ONLINE: ${pass} ✓ / ${fail} ✗`);
process.exit(fail?1:0);
