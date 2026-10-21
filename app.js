const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S={token:localStorage.getItem('tk'),me:null,skins:[],maps:[],guest:false,tab:'maps',bt:'global'};
const RM=matchMedia('(prefers-reduced-motion:reduce)').matches;
async function api(p,m='GET',b){const r=await fetch(API_URL+'/api'+p,{method:m,headers:{'Content-Type':'application/json',...(S.token?{Authorization:'Bearer '+S.token}:{})},body:b?JSON.stringify(b):undefined});
const j=await r.json().catch(()=>({}));if(!r.ok){if(r.status===401&&S.token)logout(true);if(r.status===403&&j.reason){toast('Suspended: '+j.reason,1);logout(true)}throw Object.assign(new Error(j.error||'Request failed'),{status:r.status})}return j}
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='on'+(bad?' bad':'');clearTimeout(t.h);t.h=setTimeout(()=>t.className='',2600)}
function countTo(e,v){const a=+e.dataset.v||0;e.dataset.v=v;if(RM){e.textContent=v.toLocaleString();return}const t0=performance.now();(function f(n){const k=Math.min(1,(n-t0)/500);e.textContent=Math.round(a+(v-a)*k).toLocaleString();if(k<1)requestAnimationFrame(f)})(t0)}
const skinKey=()=>S.skins.find(s=>s._id===S.me?.equippedSkin)?.key||'classic';
const mapKey=()=>S.maps.find(m=>m._id===S.me?.equippedMap)?.key||'classic';
const bal=()=>S.me?.currency||0;
function syncCoins(){countTo($('#hc'),bal());countTo($('#sc2'),bal())}
function avatar(el,id,name){el.innerHTML=(name||'?')[0].toUpperCase()+(id?`<img alt="" src="${API_URL}/api/players/${id}/avatar?${Date.now()>>16}" onerror="this.remove()">`:'')}
// ---- previews ----
let prevs=[];
function mkPrev(cv,kind,key){const d=devicePixelRatio||1,w=cv.clientWidth||200,h=cv.clientHeight||140;cv.width=w*d;cv.height=h*d;
const p={cv,c:cv.getContext('2d'),kind,key,w,h,d,t:0,P:[],py:h/2,vy:0,boost:0};cv.onpointerdown=()=>ptap(p);prevs.push(p)}
function ptap(p){p.vy=-230;p.boost=1;burst(p.P,p.key,p.w*.4,p.py);sfx(420,.05,'triangle',.02)}
function pdraw(p,dt){const c=p.c;p.t+=dt;c.setTransform(p.d,0,0,p.d,0,0);
if(p.kind==='ambient'){c.clearRect(0,0,p.w,p.h);const z=Math.min(p.w,p.h)/150;p.hop=Math.max(0,(p.hop||0)-dt*2.6);const x=p.w>720?p.w*.76:p.w*.5,y=p.h*.6+(RM?0:Math.sin(p.t*.6)*10)-p.hop*16*z;p.ax=x;p.ay=y;p.z=z;
stepP(p.P,dt);drawP(c,p.P,!DARK);c.save();c.translate(x,y);c.rotate(-.6+(RM?0:Math.sin(p.t*.45)*.05)-p.hop*.18);c.scale(z,z);skin(c,p.key,p.t*.3,p.hop);c.restore();return}
if(p.kind==='map'){const sw=W;W=400;const s=p.w/W;c.save();c.beginPath();c.rect(0,0,p.w,p.h);c.clip();c.translate(0,p.h/2-350*s);c.scale(s,s);bg(c,p.key,p.t*80,p.t);
for(let i=0;i<2;i++)pil(c,p.key,(((300*i+240-p.t*80)%600)+600)%600-100,350+i*60,200,i);ground(c,p.key);c.restore();W=sw;return}
p.vy+=700*dt;p.py+=p.vy*dt;if(p.py>p.h*.6&&p.vy>0)ptap(p);p.boost=Math.max(0,p.boost-dt*4);
const g=c.createLinearGradient(0,0,0,p.h);g.addColorStop(0,DARK?'#2a1519':'#fdfbfb');g.addColorStop(1,DARK?'#150d10':'#efe4e4');c.fillStyle=g;c.fillRect(0,0,p.w,p.h);
const x=p.w*.4;fx(p.P,p.key,dt,x,p.py,120);stepP(p.P,dt);drawP(c,p.P,!DARK);c.save();c.translate(x,p.py);c.rotate(Math.max(-.4,Math.min(.5,p.vy/600)));skin(c,p.key,p.t,p.boost);c.restore()}
let lt=0;(function tick(n){requestAnimationFrame(tick);const dt=Math.min(.05,(n-lt)/1000);lt=n;for(const p of prevs)p.cv.isConnected&&pdraw(p,dt)})(0);
// ---- navigation ----
function show(id){$$('.screen').forEach(s=>s.classList.toggle('on',s.id===id));prevs=[];if(id==='home')initHome()}
function initHome(){syncCoins();avatar($('#av'),S.me?.id,S.me?.username||'?');$('#hs').textContent=S.me?'Best '+S.me.highScore:'Guest mode: progress is not saved';mkPrev($('#hr'),'ambient',skinKey())}
addEventListener('resize',()=>{if($('#home').classList.contains('on')){prevs=[];mkPrev($('#hr'),'ambient',skinKey())}});
document.addEventListener('pointermove',e=>{const t=e.target.closest?.('.btn,.card,.row,.coins,.tab,.pbtn');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--gx',(e.clientX-r.left)/r.width*100+'%');t.style.setProperty('--gy',(e.clientY-r.top)/r.height*100+'%')});
function needAuth(){$('#ae').textContent='';$('#auth').classList.add('on');$('#au').focus()}
function logout(silent){if(typeof L!=='undefined')L.reset();if(!silent&&S.token)api('/auth/logout','POST').catch(()=>{});S.token=null;S.me=null;localStorage.removeItem('tk');show('home');needAuth()}
$$('.back').forEach(b=>b.onclick=()=>show('home'));
const IC={sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',moon:'<path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z"/>',snd:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',mut:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',fs:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'};
const svg=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
function setTheme(t){document.documentElement.dataset.theme=t;DARK=t==='dark';localStorage.setItem('theme',t);$('#theme').innerHTML=svg(DARK?'sun':'moon');$('#theme').setAttribute('aria-label',DARK?'Switch to light mode':'Switch to dark mode')}
function setMute(m){MUTE=m;localStorage.setItem('mute',m?'1':'0');$('#mute').innerHTML=svg(m?'mut':'snd');$('#mute').setAttribute('aria-label',m?'Sound off':'Sound on')}
$('#mute').onclick=()=>setMute(!MUTE);$('#theme').onclick=()=>setTheme(DARK?'light':'dark');setMute(MUTE);setTheme(document.documentElement.dataset.theme==='dark'?'dark':'light');
$('#fs').innerHTML=svg('fs');if(!document.fullscreenEnabled)$('#fs').hidden=true;$('#fs').onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{});
$('#home').addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const p=prevs.find(q=>q.kind==='ambient');if(!p||RM)return;p.hop=1;const z=p.z||1,tx=p.ax-34*z*Math.cos(.6),ty=p.ay+34*z*Math.sin(.6),f=FX[p.key]||FX.classic;for(let i=0;i<f.b;i++)add(p.P,tx,ty,-(40+Math.random()*160)*z*.5,(40+Math.random()*150)*z*.5-30,.7,f.t[i%f.t.length],f.s*z*.7,f.tri?'t':f.f&&i%2?'f':f.e?'e':'c')});
$('#av').onclick=()=>S.me?openProfile():needAuth();
$('#bShop').onclick=()=>{show('shop');renderShop();loadCatalog().then(()=>{if($('#shop').classList.contains('on'))renderShop()}).catch(()=>{})};$('#bBoard').onclick=()=>{show('board');loadBoard()};
// ---- auth ----
$('#guest').onclick=()=>{S.guest=true;$('#auth').classList.remove('on')};
$('#af').onsubmit=async e=>{e.preventDefault();const k=e.submitter?.dataset.k||'login';try{const r=await api('/auth/'+k,'POST',{username:$('#au').value.trim(),password:$('#ap').value});
S.token=r.token;localStorage.setItem('tk',r.token);S.me=r.player;S.guest=false;await loadCatalog().catch(()=>{});$('#ap').value='';$('#auth').classList.remove('on');show('home');toast('Welcome, '+r.player.username)}catch(x){$('#ae').textContent=x.message}};
// ---- game flow ----
let run=null;const ov=$('#ov');
const game=new Game($('#gc'),{score:n=>{$('#sc').textContent=n;if(typeof L!=='undefined'&&L.active)L.live(n)},coins:n=>$('#gcn').textContent=n,
count(n){const c=$('#cd');c.textContent=n;c.classList.remove('pop');void c.offsetWidth;c.classList.add('pop');ov.classList.remove('on')},
pause(){panel('<h2>Paused</h2><button class="btn b1" id="o1">Resume</button><button class="btn b2" id="o2">Restart</button><button class="btn b3" id="o3">Main menu</button>');
$('#o1').onclick=()=>{ov.classList.remove('on');game.resume()};$('#o2').onclick=async()=>{await bank();startRun()};$('#o3').onclick=async()=>{await bank();show('home')}},
over(){if(L.active)return L.over();const r0=run,draw=()=>{const best=Math.max(S.me?.highScore||0,game.score|0),left=run.id&&!game.rev&&S.me,can=left&&bal()>=10;
panel(`<h2>Crashed</h2><p>Score <b>${game.score|0}</b> · Best <b>${best}</b></p><p>Coins this run <b>${game.coins}</b> · Balance <b>${bal()}</b></p>`+
(run.id?`<button class="btn b1" id="o1" ${can?'':'disabled'}>Revive — 10 Coins</button><p>${game.rev?'Revive already used this run.':bal()<10?'Not enough coins to revive.':'1 revive per run.'}</p>`:'<p>Guest run: nothing is saved. Sign in to bank coins.</p>')+
'<button class="btn b2" id="o2">Play again</button><button class="btn b3" id="o3">Main menu</button>');
if(run.id)$('#o1').onclick=async()=>{try{const r=await api(`/runs/${run.id}/revive`,'POST');S.me.currency=r.currency;game.rev=1;ov.classList.remove('on');game.revive()}catch(x){toast(x.message,1)}};
$('#o2').onclick=async()=>{await bank();startRun()};$('#o3').onclick=async()=>{await bank();show('home')}};
draw();if(r0.id&&(game.rev||bal()<10))bank().then(()=>{if(run===r0&&game.mode==='over')draw()})}});
function panel(h){ov.innerHTML='<div class="ovbox">'+h+'</div>';ov.classList.add('on')}
// Saves the current run to the server. Safe to call repeatedly: one request per run, and callers can await it.
// Only a network failure (no HTTP status) re-arms it for a retry; a server verdict (4xx) is final.
function bank(){const r=run;if(!r||!r.id)return Promise.resolve();if(r.p)return r.p;r.done=true;
return r.p=(async()=>{try{const x=await api(`/runs/${r.id}/finish`,'POST',{score:game.score|0,coins:game.coins});S.me=x.player;if(x.newHighScore)toast('New high score!')}
catch(e){if(!e.status){r.p=null;r.done=false}toast(e.message,1)}})()}
// Tab closed / refreshed / app swiped away after a crash: still deliver the result.
addEventListener('pagehide',()=>{const r=run;if(!r||!r.id||r.p||r.lobby||!S.token||!['over','play','pause'].includes(game.mode))return;r.done=true;r.p=Promise.resolve();
try{fetch(API_URL+`/api/runs/${r.id}/finish`,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',Authorization:'Bearer '+S.token},body:JSON.stringify({score:game.score|0,coins:game.coins})})}catch{}});
async function startRun(){if(typeof L!=='undefined')L.active=false;$('#pause').hidden=false;show('game');ov.classList.remove('on');$('#sc').textContent=0;$('#gcn').textContent=0;run={id:null,done:false};
if(S.me)try{run.id=(await api('/runs','POST',{})).runId}catch(e){toast(e.message,1);return show('home')}
$('.stage').className='stage '+(isLight(mapKey())?'lt':'dk');game.reset(mapKey(),skinKey());game.startCountdown()}
$('#bStart').onclick=()=>S.me||S.guest?startRun():needAuth();$('#pause').onclick=()=>game.pause();
// ---- shop ----
$$('#shop .tab').forEach(t=>t.onclick=()=>{S.tab=t.dataset.t;renderShop()});
function renderShop(){prevs=[];const sk=S.tab==='skins',list=sk?S.skins:S.maps,own=sk?S.me?.ownedSkins:S.me?.ownedMaps,eq=sk?S.me?.equippedSkin:S.me?.equippedMap;
$$('#shop .tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.t===S.tab));syncCoins();
$('#grid').innerHTML=list.map(i=>{const o=own?.includes(i._id)||(!S.me&&i.price===0&&!sk),e=eq===i._id;
return`<div class="card" style="--rc:var(--${i.rarity||'common'})"><canvas data-k="${esc(i.key)}" aria-label="${esc(i.name)} preview"></canvas><h3>${esc(i.name)}${i.isAvailable===false?' <small>(retired)</small>':''}</h3>${sk?`<span class="rar">${esc(i.rarity)}</span>`:''}<p>${esc(i.description||'')}</p>
<button class="btn ${e?'b1':o?'b2':'b3'}" data-id="${i._id}" data-o="${o?1:0}" ${e?'disabled':''}>${e?'Equipped':o?'Equip':i.price?'Buy · '+i.price:'Free'}</button></div>`}).join('');
$$('#grid canvas').forEach(c=>mkPrev(c,sk?'skin':'map',c.dataset.k));
$$('#grid button').forEach(b=>b.onclick=()=>shopAct(b.dataset.id,b.dataset.o==='1'))}
async function shopAct(id,owned){if(!S.me)return needAuth();const sk=S.tab==='skins',n=sk?'skin':'map';
try{if(!owned){S.me=await api(`/${n}s/${id}/purchase`,'POST');toast(sk?'Skin unlocked!':'Map unlocked!')}else{S.me=await api(`/players/me/equip-${n}`,'PUT',{id});toast('Equipped')}renderShop()}catch(e){toast(e.message,1)}}
// ---- leaderboard ----
$$('#board .tab').forEach(t=>t.onclick=()=>{S.bt=t.dataset.t;loadBoard()});
async function loadBoard(){$$('#board .tab').forEach(t=>t.setAttribute('aria-selected',t.dataset.t===S.bt));const rows=$('#rows');rows.innerHTML='<li class="sk"></li>'.repeat(5);
try{const r=S.bt==='lobby'?(L.lastId?await api('/leaderboard/lobby/'+encodeURIComponent(L.lastId)):[]):await api('/leaderboard/'+S.bt),l=r.entries||r;
rows.innerHTML=l.length?l.map(e=>`<li class="row r${e.rank<4?e.rank:''}" data-id="${e.playerId}" tabindex="0"><b>#${e.rank}</b><span class="av">${e.username[0].toUpperCase()}<img alt="" src="${API_URL}/api/players/${e.playerId}/avatar" onerror="this.remove()"></span><span class="nm">${e.username}</span><span class="sc">${e.score}</span><small>${new Date(e.at).toLocaleDateString()}</small></li>`).join(''):'<li class="empty">No scores yet. Play a run to claim #1.</li>';
$$('#rows .row').forEach(r=>r.onclick=async()=>{try{const p=await api(`/players/${r.dataset.id}/public`);toast(`${p.username} · best ${p.highScore} · ${p.totalGamesPlayed} games`)}catch(e){toast(e.message,1)}})}
catch(e){rows.innerHTML=`<li class="empty">Could not load scores: ${e.message}</li>`}}
// ---- profile ----
function openProfile(){show('profile');const m=S.me,n=(l,L)=>L.find(x=>x._id===l)?.name||'Default';
$('#pf').innerHTML=`<button class="avatar" id="pa" aria-label="Change picture"></button><input type="file" id="pfile" accept="image/png,image/jpeg,image/webp" hidden>
<div class="stats"><div><span>Coins</span>${m.currency}</div><div><span>High score</span>${m.highScore}</div><div><span>Games played</span>${m.totalGamesPlayed}</div><div><span>Skin / Map</span>${n(m.equippedSkin,S.skins)} / ${n(m.equippedMap,S.maps)}</div></div>
${m.role==='admin'?'<a class="btn b2" href="/admin.html">Admin dashboard</a>':''}<label>Username<input id="pu" value="${m.username}" maxlength="14"></label><button class="btn b2" id="su">Save username</button>
<label>Current password<input id="cp" type="password" autocomplete="current-password"></label><label>New password<input id="np" type="password" autocomplete="new-password"></label><button class="btn b2" id="sp">Change password</button><button class="btn b3" id="lo">Log out</button>`;
avatar($('#pa'),m.id,m.username);$('#pa').onclick=()=>$('#pfile').click();
$('#pfile').onchange=e=>{const f=e.target.files[0];if(!f)return;if(f.size>150*1024)return toast('Picture must be under 150 KB',1);const r=new FileReader();r.onload=async()=>{try{await api('/players/me/avatar','PUT',{image:r.result});avatar($('#pa'),m.id,m.username);toast('Picture updated')}catch(x){toast(x.message,1)}};r.readAsDataURL(f)};
$('#su').onclick=async()=>{try{S.me=await api('/players/me','PUT',{username:$('#pu').value.trim()});toast('Username saved')}catch(x){toast(x.message,1)}};
$('#sp').onclick=async()=>{try{const r=await api('/players/me/password','PUT',{currentPassword:$('#cp').value,newPassword:$('#np').value});S.token=r.token;localStorage.setItem('tk',r.token);$('#cp').value=$('#np').value='';toast('Password changed')}catch(x){toast(x.message,1)}};
$('#lo').onclick=()=>logout()}
// ---- intro + boot ----
let introDone=false;function endIntro(){if(introDone)return;introDone=true;show('home');if(!S.me&&!S.guest)needAuth()}
$('#skip').onclick=endIntro;
(function intro(){const cv=$('#ic'),c=cv.getContext('2d'),P=[];let t=0,l=0;const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;
(function f(n){if(introDone)return;requestAnimationFrame(f);const dt=Math.min(.05,(n-l)/1000);l=n;t+=dt;const w=innerWidth,h=innerHeight;c.setTransform(d,0,0,d,0,0);
const g=c.createRadialGradient(w/2,h*.4,0,w/2,h*.4,Math.max(w,h)*.85);g.addColorStop(0,DARK?'#2d171c':'#fdfbfb');g.addColorStop(.75,DARK?'#1a0f12':'#f5eeee');g.addColorStop(1,DARK?'#0e080a':'#efe4e4');c.fillStyle=g;c.fillRect(0,0,w,h);
for(const [rx,ry,r,col] of [[.18,.22,.42,'151,27,27'],[.85,.78,.36,'99,15,15']]){const b=c.createRadialGradient(w*rx,h*ry,0,w*rx,h*ry,Math.max(w,h)*r);b.addColorStop(0,`rgba(${col},.22)`);b.addColorStop(1,`rgba(${col},0)`);c.fillStyle=b;c.fillRect(0,0,w,h)}
const k=Math.max(0,t-.6),y=h-70-k*k*110;if(t>.4)for(let i=0;i<3;i++)add(P,w/2+(Math.random()-.5)*10,y+34,(Math.random()-.5)*50,140+Math.random()*140,.7,['#c93a37','#b12626','#7d1414'][i],5,'t');
stepP(P,dt);drawP(c,P,!DARK);c.save();c.translate(w/2,y);c.rotate(-Math.PI/2);c.scale(1.4,1.4);skin(c,'classic',t,1);c.restore();if(t>3.6)endIntro()})(0)})();
if(RM)endIntro();
async function loadCatalog(){[S.skins,S.maps]=await Promise.all([api('/skins'),api('/maps')]);S.skins.forEach(regSkin)}
(async()=>{try{if(S.token)S.me=await api('/players/me')}catch(e){}try{await loadCatalog()}catch(e){}if(introDone)show('home')})();
