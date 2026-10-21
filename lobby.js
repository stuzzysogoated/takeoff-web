// Multiplayer client. Same protocol as the original TAKEOFF (requestId/response/lobbyUpdate), now authenticated.
const L={ws:null,pend:new Map(),cur:null,active:false,results:false,skew:0,lastStart:null,retry:0,lastId:localStorage.getItem('lastLobby')||null,tries:0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
L.reset=()=>{L.cur=null;L.active=false;L.results=false;L.ws&&(L.ws.onclose=null,L.ws.close());L.ws=null};
L.connect=()=>new Promise((res,rej)=>{
  if(L.ws&&L.ws.readyState===1)return res();
  const ws=new WebSocket(WS_URL+'/?token='+encodeURIComponent(S.token||''));L.ws=ws;let opened=false;
  ws.onopen=()=>{opened=true;L.retry=0;res()};
  ws.onmessage=e=>L.msg(JSON.parse(e.data));
  ws.onclose=ev=>{if(L.ws!==ws)return;for(const p of L.pend.values())p.rej(new Error('Connection lost.'));L.pend.clear();
    if(!opened)return rej(new Error('Could not connect.'));
    if(ev.code===4001||ev.code===4003){toast('Session ended.',1);return logout(true)}
    if(L.cur)setTimeout(()=>L.reconnect(),Math.min(5000,1000*++L.retry))};
});
L.reconnect=async()=>{if(!L.cur||!S.token)return;try{await L.connect();L.cur=await L.send('joinLobby',{id:L.cur.id});L.onLobby(L.cur)}catch(e){if(/exist|started|removed/i.test(e.message)){toast('Lobby closed.',1);L.cur=null;show('lobbyMenu')}else setTimeout(()=>L.reconnect(),2000)}};
L.send=async(type,payload)=>{await L.connect();return new Promise((res,rej)=>{const requestId=Math.random().toString(36).slice(2);L.pend.set(requestId,{res,rej});L.ws.send(JSON.stringify({type,requestId,...payload}));setTimeout(()=>{if(L.pend.delete(requestId))rej(new Error('Request timed out.'))},8000)})};
L.msg=m=>{if(m.type==='response'){const p=L.pend.get(m.requestId);if(!p)return;L.pend.delete(m.requestId);m.ok?p.res(m.lobby):p.rej(new Error(m.error))}
  else if(m.type==='lobbyUpdate'&&L.cur&&m.lobby.id===L.cur.id)L.onLobby(m.lobby);
  else if(m.type==='kicked'&&L.cur&&m.lobbyId===L.cur.id){L.cur=null;L.results=false;L.active=false;toast('The Game Master removed you from the lobby.',1);show('lobbyMenu')}};
L.enter=l=>{L.cur=l;L.lastId=l.id;localStorage.setItem('lastLobby',l.id);show('lobby');L.render()};
L.onLobby=l=>{L.cur=l;if($('#lobby').classList.contains('on'))L.render();if(L.results)L.renderResults();
  if(l.status==='playing'&&l.startAt&&l.startAt!==L.lastStart&&($('#lobby').classList.contains('on')||L.results))L.begin(l)};
const ranked=l=>[...l.players].sort((a,b)=>b.score-a.score);
L.render=()=>{const l=L.cur;if(!l)return;const gm=l.gameMaster===S.me?.username;$('#lTitle').textContent=l.id;$('#lGm').textContent='Game Master: '+l.gameMaster;
  const show_=l.status!=='waiting';$('#lPlayers').innerHTML=(show_?ranked(l):l.players).map((p,i)=>`<li class="row ${show_&&l.status==='finished'&&i<3?'r'+(i+1):''}">${show_?`<b>#${i+1}</b>`:''}<span class="av">${esc(p.username[0].toUpperCase())}<img alt="" src="${API_URL}/api/players/${p.pid}/avatar" onerror="this.remove()"></span><span class="nm">${esc(p.username)}${p.username===l.gameMaster?' <small>Game Master</small>':''}</span>${show_?`<span class="sc">${p.score}</span><small>${p.finished?'Done':'Flying'}</small>`:''}${gm&&l.status!=='playing'&&p.username!==l.gameMaster?`<button class="ghost kick" data-pid="${p.pid}" aria-label="Remove ${esc(p.username)}">Remove</button>`:''}</li>`).join('');
  const w=ranked(l)[0];$('#lStatus').textContent=l.status==='waiting'?(gm?`Share “${l.id}” with friends. ${l.players.length} player${l.players.length>1?'s':''} ready.`:'Waiting for the Game Master to start the game…'):l.status==='playing'?'Round in progress…':`Round over. ${w.username} wins with ${w.score}.`;
  $('#lStart').hidden=!(gm&&l.status!=='playing');$('#lStart').textContent=l.status==='finished'?'Play again':'Start Game'};
L.begin=async l=>{L.lastStart=l.startAt;L.active=true;L.results=false;show('game');ov.classList.remove('on');$('#sc').textContent=0;$('#gcn').textContent=0;$('#pause').hidden=true;
  run={id:null,done:false,lobby:l.id};const t0=Date.now();
  try{const r=await api('/runs','POST',{lobbyId:l.id});run.id=r.runId;L.skew=r.serverTime-(t0+Date.now())/2}catch(e){toast(e.message,1);L.active=false;show('lobby');return}
  $('.stage').className='stage '+(isLight(mapKey())?'lt':'dk');game.reset(mapKey(),skinKey(),l.seed);game.noPause=true;game.startCountdown((l.startAt-(Date.now()+L.skew))/1000)};
L.live=n=>{if(L.cur)L.send('liveScore',{id:L.cur.id,score:n}).catch(()=>{})};
L.over=async()=>{L.results=true;L.renderResults();await bank();L.renderResults()};
L.renderResults=()=>{const l=L.cur;if(!l||!L.results)return;const done=l.status==='finished';
  panel(`<h2>${done?'Round over':'You crashed'}</h2><p>Your score <b>${game.score|0}</b>${done?'':' · waiting for others…'}</p><ol class="rows" style="padding:0;width:100%">${ranked(l).slice(0,6).map((p,i)=>`<li class="row r${i<3?i+1:''}"><b>#${i+1}</b><span class="nm">${esc(p.username)}</span><span class="sc">${p.score}</span><small>${p.finished?'Done':'Flying'}</small></li>`).join('')}</ol><button class="btn b2" id="o2">Back to lobby</button>`);
  $('#o2').onclick=()=>{L.results=false;L.active=false;show('lobby');L.render()}};
// ---- screens ----
$('#bMulti').onclick=()=>{if(!S.me)return needAuth();if(L.cur){show('lobby');L.render()}else{$('#le').textContent='';show('lobbyMenu')}};
const NAME=/^[A-Za-z0-9 _-]{3,16}$/;
async function lobbyForm(e,type,input){e.preventDefault();const id=$(input).value.trim();if(!NAME.test(id))return $('#le').textContent='Lobby names are 3–16 letters, numbers, spaces, - or _.';
  try{L.enter(await L.send(type,{id}));$('#le').textContent=''}catch(x){$('#le').textContent=x.message}}
$('#lcForm').onsubmit=e=>lobbyForm(e,'createLobby','#lcName');$('#ljForm').onsubmit=e=>lobbyForm(e,'joinLobby','#ljName');
$('#lPlayers').onclick=async e=>{const b=e.target.closest('[data-pid]');if(!b||!L.cur)return;try{await L.send('kickPlayer',{id:L.cur.id,pid:b.dataset.pid});toast('Player removed')}catch(x){toast(x.message,1)}};
$('#lStart').onclick=async()=>{try{await L.send('startGame',{id:L.cur.id})}catch(x){toast(x.message,1)}};
$('#lLeave').onclick=async()=>{try{await L.send('leaveLobby',{id:L.cur.id})}catch{}L.cur=null;show('lobbyMenu')};
$('#lBoard').onclick=()=>{S.bt='lobby';show('board');loadBoard()};
