let W=400,RX=110,DARK=false;const H=700,GH=34,R=12,PW=70,G=1500,TAP=-480; // H is fixed so gameplay is identical on every screen; W follows the screen width
let _ac,MUTE=localStorage.getItem('mute')==='1';
function sfx(f,d=.08,ty='square',v=.04){if(MUTE)return;try{_ac=_ac||new AudioContext();const o=_ac.createOscillator(),g=_ac.createGain();o.type=ty;o.frequency.value=f;g.gain.value=v;g.gain.exponentialRampToValueAtTime(.0001,_ac.currentTime+d);o.connect(g);g.connect(_ac.destination);o.start();o.stop(_ac.currentTime+d)}catch{}}
const TH={classic:{sky:['#fdfbfb','#efe4e4'],pil:['#4a0a0a','#971b1b'],edge:'#fdfbfb',ground:['#630f0f','#200404']},
neonscape:{sky:['#07021a','#44117a'],pil:['#1a0f3f','#31196b'],edge:'#ff3df2',ground:['#25105a','#07021a']},
amazon:{sky:['#d4f2a8','#2f8f4e'],pil:['#7a4e2a','#4a2f17'],edge:'#2e7d32',ground:['#3b2a14','#1b1208'],light:1},
blizzard:{sky:['#eefaff','#7fb8e6'],pil:['#e1f6ff','#7cc4f0'],edge:'#ffffff',ground:['#9cc7e6','#5f8fb5'],light:1}};
const FX={'classic':{t:['#c93a37','#b12626','#e0504c','#fdfbfb'],r:55,s:6,b:18,tri:1},'classic-white':{t:['#fdfbfb','#c3c9d6','#c93a37'],r:55,s:6,b:18,tri:1},'classic-black':{t:['#2b2e38','#7d1414','#c93a37'],r:55,s:6,b:18,tri:1},
'neon-missile':{t:['#00e5ff','#ff3df2','#c9d1de'],r:70,s:5,b:16},'jet':{t:['#dfe8f5','#6aa9ff','#ffd27a'],r:70,s:5,b:16},
'parrot':{t:['#e53935','#1e88e5','#43a047','#fdd835'],r:50,s:4,b:10,f:1},'dragon':{t:['#ff1744','#ff6d00','#ffd54f'],r:110,s:7,b:22,e:1}};
const CUSTOM={},BUILTIN=new Set(['classic','classic-white','classic-black','neon-missile','jet','parrot','dragon']);
function regSkin(s){if(BUILTIN.has(s.key)||!s.colorPalette?.length)return;CUSTOM[s.key]=s.colorPalette;FX[s.key]={t:s.colorPalette,r:55,s:6,b:18,tri:1}}
function shade(h,f){const n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,t=f<0?0:255,p=Math.abs(f),m=v=>Math.round((t-v)*p+v);return'#'+((1<<24)+(m(r)<<16)+(m(g)<<8)+m(b)).toString(16).slice(1)}
const rnd=(s=>()=>(s=s*16807%2147483647)/2147483647)(42),LY={};
const nh=(a,b,c)=>{const v=Math.sin(a*127.1+b*311.7+c*758.5)*43758.5453;return v-Math.floor(v)};
const LIT=.2; // Neonscape: fraction of windows that are lit (0.2 = 20%)
const isLight=th=>th==='classic'?!DARK:!!TH[th].light;
const mb=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
function lay(th){return LY[th]||(LY[th]=(()=>{const a=[];let x=0;while(x<800){const w=18+rnd()*40;a.push({x,w,h:60+rnd()*200,s:rnd()});x+=w+(th==='classic'?30:6)}
return{a,st:[...Array(70)].map(()=>({x:rnd()*800,y:rnd()*H,r:.5+rnd()*1.5}))}})())}
function bg(c,th,d,t){if(th==='classic')return classicBg(c,d,t);const T=TH[th],g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,T.sky[0]);g.addColorStop(1,T.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,H);const L=lay(th);
if(th==='neonscape'){c.fillStyle='#fff';for(const s of L.st){const x=((s.x-d*.05*s.r)%800+800)%800;if(x<W){c.globalAlpha=.4+.4*Math.sin(t*2+s.x);c.fillRect(x,s.y,s.r,s.r)}}c.globalAlpha=1}
const lyr=(f,hs,fn)=>{const off=(d*f)%800;for(let k=0;k<2;k++)for(const b of L.a){const X=b.x-off+k*800;if(X<W&&X+b.w>0)fn(X,b,b.h*hs)}};
if(th==='classic')lyr(.15,1,(X,b,h)=>{c.fillStyle='#0d1640';c.fillRect(X,H-h,b.w,h);c.fillStyle='#29e0ff55';c.fillRect(X,H-h,b.w,2)});
else if(th==='neonscape'){lyr(.12,1.6,(X,b,h)=>{c.fillStyle='#160a3a';c.fillRect(X,H-h,b.w,h)});lyr(.3,1.1,(X,b,h)=>{c.fillStyle='#25105a';c.fillRect(X,H-h,b.w,h);const cl=['#ff3df2','#29e0ff','#ffd54f'];c.globalAlpha=.7;for(let j=0,y=H-h+8;y<H-6;y+=12,j++)for(let i=0,x=X+4;x<X+b.w-4;x+=10,i++){const q=nh(i,j,b.s*100);if(q<LIT){c.fillStyle=cl[(q/LIT*3|0)%3];c.fillRect(x,y,4,5)}}c.globalAlpha=1;if(b.s>.94){c.globalAlpha=.55;c.fillStyle='#ff3df2';c.fillRect(X+4,H-h-14,b.w-8,4);c.globalAlpha=1}})}
else if(th==='amazon'){lyr(.2,1.8,(X,b,h)=>{c.fillStyle='#1b5e32';c.fillRect(X+b.w*.3,H-h,b.w*.4,h)});c.fillStyle='#14532d';lyr(.25,1,(X,b)=>{c.beginPath();c.arc(X+b.w/2,30+b.s*30,b.w*.9,0,6.3);c.fill()});c.fillStyle='#fff3';for(let i=0;i<4;i++){const x=60+i*110+Math.sin(t+i)*20;c.beginPath();c.moveTo(x,0);c.lineTo(x+40,0);c.lineTo(x-60,H);c.lineTo(x-100,H);c.fill()}}
else{lyr(.1,1.8,(X,b,h)=>{c.fillStyle='#b9d9ee';c.beginPath();c.moveTo(X-b.w,H);c.lineTo(X+b.w/2,H-h);c.lineTo(X+b.w*2,H);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(X+b.w/2,H-h);c.lineTo(X+b.w*.1,H-h+h*.2);c.lineTo(X+b.w*.9,H-h+h*.2);c.fill()});
const f=c.createLinearGradient(0,H*.6,0,H);f.addColorStop(0,'#fff0');f.addColorStop(1,'#fffc');c.fillStyle=f;c.fillRect(0,H*.6,W,H*.4);c.fillStyle='#fff';for(let i=0;i<60;i++){const x=((i*53.7-t*25-d*.3)%W+W)%W,y=((i*91.3+t*70)%H);c.fillRect(x,y,2,2)}}}

function classicBg(c,d,t){const dk=DARK,g=c.createRadialGradient(W/2+Math.sin(t*.08)*24,H*.4,0,W/2,H*.4,Math.max(W,H)*.85);g.addColorStop(0,dk?'#2d171c':'#fdfbfb');g.addColorStop(.75,dk?'#1a0f12':'#f5eeee');g.addColorStop(1,dk?'#0e080a':'#efe4e4');c.fillStyle=g;c.fillRect(0,0,W,H);
for(const [rx,ry,r,col,sp,ph] of [[.18,.22,.42,'151,27,27',.05,0],[.85,.78,.36,'99,15,15',.037,2.1],[.7,.15,.24,dk?'232,193,99':'177,38,38',.061,4.4]]){const x=W*rx+Math.sin(t*sp+ph)*W*.04,y=H*ry+Math.cos(t*sp*.8+ph)*H*.04,b=c.createRadialGradient(x,y,0,x,y,Math.max(W,H)*r);b.addColorStop(0,`rgba(${col},${(dk?.3:.22)+.1*Math.sin(t*.6+ph)})`);b.addColorStop(1,`rgba(${col},0)`);c.fillStyle=b;c.fillRect(0,0,W,H)}
for(const [rx,ry,r,col,sp,ph] of [[.18,.22,.42,'151,27,27',.05,0],[.85,.78,.36,'99,15,15',.037,2.1],[.7,.15,.24,'177,38,38',.061,4.4]]){const x=W*rx+Math.sin(t*sp+ph)*W*.04,y=H*ry+Math.cos(t*sp*.8+ph)*H*.04,b=c.createRadialGradient(x,y,0,x,y,H*r);b.addColorStop(0,`rgba(${col},${.22+.1*Math.sin(t*.6+ph)})`);b.addColorStop(1,`rgba(${col},0)`);c.fillStyle=b;c.fillRect(0,0,W,H)}
const L=lay('classic');for(const [f,al,hs] of [[.08,.05,1.7],[.18,.09,1]]){const off=(d*f)%800;c.fillStyle=dk?`rgba(232,193,99,${al*.8})`:`rgba(99,15,15,${al})`;for(let k=0;k<2;k++)for(const b of L.a){const X=b.x-off+k*800;if(X<W&&X+b.w>0){const h=b.h*hs;c.fillRect(X,H-GH-h,b.w,h);c.fillRect(X+b.w*.45,H-GH-h-14,2,14)}}}}
function ground(c,th){const T=TH[th],y=H-GH,g=c.createLinearGradient(0,y,0,H);g.addColorStop(0,T.ground[0]);g.addColorStop(1,T.ground[1]);c.fillStyle=g;c.fillRect(0,y,W,GH);c.strokeStyle='rgba(253,251,251,.5)';c.lineWidth=1.5;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
function pilClassic(c,x,gy,gap,id){const jt=i=>.35+.65*((id*7+i*13)%10)/10,tH=22,n=5;
const one=(yT,yB,down)=>{const g=c.createLinearGradient(x,0,x+PW,0);g.addColorStop(0,'#4a0a0a');g.addColorStop(.5,'#971b1b');g.addColorStop(1,'#340707');const p=[];
if(down){p.push([x,yT],[x+PW,yT],[x+PW,yB-tH*.4]);for(let i=n;i>=0;i--)p.push([x+PW*i/n,i%2?yB-tH*jt(i):yB]);p.push([x,yB-tH*.4])}
else{p.push([x,yB],[x,yT+tH*.4]);for(let i=0;i<=n;i++)p.push([x+PW*i/n,i%2?yT+tH*jt(i):yT]);p.push([x+PW,yT+tH*.4],[x+PW,yB])}
c.save();c.shadowColor='rgba(150,20,26,.45)';c.shadowBlur=12;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(const q of p)c.lineTo(q[0],q[1]);c.closePath();c.fillStyle=g;c.fill();c.shadowBlur=0;
c.strokeStyle='rgba(253,251,251,.35)';c.lineWidth=1.4;c.beginPath();for(let i=1;i<3;i++){c.moveTo(x+PW*i/3,yT);c.lineTo(x+PW*i/3,yB)}c.stroke();
c.strokeStyle='rgba(253,251,251,.55)';c.lineWidth=2;c.beginPath();const a=down?3:1,b=down?p.length-1:p.length-2;c.moveTo(p[a][0],p[a][1]);for(let i=a+1;i<b;i++)c.lineTo(p[i][0],p[i][1]);c.stroke();c.restore()};
one(-20,gy-gap/2,true);one(gy+gap/2,H,false)}
function facet(c,k,pal){const L=40,h=L*.46,C=pal?[shade(pal[0],-.15),shade(pal[0],-.55),shade(pal[0],.2),shade(pal[0],-.35),shade(pal[0],-.45),shade(pal[0],-.15),pal[1]||'#ffffff']:{classic:['#7d1414','#340707','#b12626','#630f0f','#4a0a0a','#7d1414','rgba(253,251,251,.85)'],'classic-white':['#e9ecf3','#aab2c4','#ffffff','#cfd5e2','#b9c0d0','#e1e5ee','#971b1b'],'classic-black':['#2b2e38','#0d0e13','#3a3e4b','#171920','#0f1016','#2b2e38','#fdfbfb']}[k];
c.shadowColor=pal?pal[0]+'88':'rgba(150,20,26,.5)';c.shadowBlur=12;
poly(c,[L*.62,0,-L*.5,-h,-L*.12,0],C[0]);poly(c,[L*.62,0,-L*.5,-h,L*.05,-h*.32],C[1]);poly(c,[L*.62,0,-L*.12,0,-L*.5,h],C[2]);poly(c,[-L*.5,h,-L*.12,0,L*.62,0],C[3]);poly(c,[-L*.5,-h,-L*.92,-h*1.35,-L*.3,-h*.28],C[4]);poly(c,[-L*.5,h,-L*.92,h*1.35,-L*.3,h*.28],C[5]);
c.shadowBlur=0;c.strokeStyle=C[6];c.lineWidth=1.4;c.lineJoin='round';c.beginPath();c.moveTo(L*.62,0);c.lineTo(-L*.12,0);c.moveTo(L*.62,0);c.lineTo(L*.05,-h*.32);c.moveTo(-L*.5,-h);c.lineTo(-L*.12,0);c.lineTo(-L*.5,h);c.stroke()}
function pil(c,th,x,gy,gap,id){if(th==='classic')return pilClassic(c,x,gy,gap,id);const T=TH[th];const seg=(y,h,cap)=>{const g=c.createLinearGradient(x,0,x+PW,0);g.addColorStop(0,T.pil[0]);g.addColorStop(.5,T.pil[1]);g.addColorStop(1,T.pil[0]);c.fillStyle=g;c.fillRect(x,y,PW,h);
if(th==='neonscape'){c.globalAlpha=.7;for(let r=0,yy=y+8;yy<y+h-8;yy+=14,r++)for(let k=0;k<4;k++)if(nh(k,r,id*3.7+(y>0?1:0))<LIT){c.fillStyle=k%2?'#29e0ff':'#ffd54f';c.fillRect(x+8+k*15,yy,8,6)}c.globalAlpha=1}
else if(th==='amazon'){c.lineWidth=3;for(let i=0;i<2;i++){c.strokeStyle='#4caf50';c.beginPath();for(let yy=y;yy<=y+h;yy+=8){const px=x+PW*(.3+.4*i)+Math.sin(yy*.05+i*2+id)*10;yy===y?c.moveTo(px,yy):c.lineTo(px,yy)}c.stroke()}}
else if(th==='blizzard'){c.strokeStyle='#fff9';c.lineWidth=2;for(let yy=y+10;yy<y+h;yy+=46){c.beginPath();c.moveTo(x+10,yy+16);c.lineTo(x+28,yy);c.stroke()}}
else{c.fillStyle='#0003';for(let yy=y+10;yy<y+h;yy+=22)c.fillRect(x,yy,PW,2)}
c.globalAlpha=th==='neonscape'?.35:1;c.strokeStyle=T.edge;c.lineWidth=2;c.strokeRect(x+1,y+1,PW-2,h-2);c.fillStyle=T.edge;c.fillRect(x,cap,PW,6);c.globalAlpha=1};
seg(-20,gy-gap/2+20,gy-gap/2-6);seg(gy+gap/2,H,gy+gap/2)}
function poly(c,p,f,s){c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.closePath();if(f){c.fillStyle=f;c.fill()}if(s){c.strokeStyle=s;c.lineWidth=2;c.stroke()}}
const el=(c,x,y,rx,ry,f)=>{c.fillStyle=f;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.3);c.fill()};
function skin(c,k,t,b){const fl=Math.sin(t*14)*.6+b*.6;if(CUSTOM[k]){facet(c,k,CUSTOM[k]);return}
if(k==='classic'||k==='classic-white'||k==='classic-black')facet(c,k);
else if(k==='neon-missile'){poly(c,[-18,-5,-28,-13,-10,-5],'#ff3df2');poly(c,[-18,5,-28,13,-10,5],'#ff3df2');poly(c,[32,0,14,-7,-18,-6,-18,6,14,7],'#c9d1de','#00e5ff');c.fillStyle='#00e5ff';c.fillRect(-10,-1.5,24,3)}
else if(k==='jet'){poly(c,[4,0,-14,-22,-20,-22,-8,0],'#cfe0f5');poly(c,[4,0,-14,22,-20,22,-8,0],'#cfe0f5');poly(c,[-16,-4,-24,-14,-20,-4],'#cfe0f5');poly(c,[30,0,16,-6,-20,-5,-22,0,-20,5,16,6],'#fff','#6aa9ff');el(c,10,-1,6,3,'#6aa9ff')}
else if(k==='parrot'){poly(c,[-10,0,-30,-8,-30,0],'#1e88e5');poly(c,[-10,0,-30,7,-30,0],'#fdd835');el(c,0,0,16,10,'#e53935');el(c,2,4,9,4,'#fdd835');c.save();c.translate(-2,-3);c.rotate(-fl*.9);el(c,-4,-9,7,14,'#43a047');el(c,-4,-14,4,8,'#1e88e5');c.restore();el(c,14,-6,7,7,'#e53935');poly(c,[20,-8,29,-4,20,-1],'#fdd835');el(c,16,-8,2,2,'#fff')}
else{c.save();c.translate(-2,-4);c.rotate(-fl);poly(c,[0,0,-6,-30,-20,-26,-14,-12,-30,-14,-20,0],'#8e0000','#ff6d00');c.restore();poly(c,[-12,0,-34,6,-40,-2,-30,-3],'#b71c1c');poly(c,[-30,-3,-40,-2,-38,-9],'#ff6d00');el(c,0,0,17,9,'#b71c1c');el(c,2,4,12,4,'#ffb74d');poly(c,[14,-5,30,-3,32,3,14,6],'#d32f2f');poly(c,[14,-5,10,-14,18,-6],'#ffd54f');el(c,18,-2,2.2,2.2,'#ffd54f')}}
function add(P,x,y,vx,vy,l,c,s,k){if(P.length>260)P.shift();P.push({x,y,vx,vy,l,m:l,c,s,k})}
function fx(P,key,dt,x,y,sp){const f=FX[key]||FX.classic;P.acc=(P.acc||0)+f.r*dt;while(P.acc>=1){P.acc--;add(P,x-30,y,-sp*.3-30-Math.random()*60,(Math.random()-.5)*40,.5,f.t[Math.random()*f.t.length|0],f.s,f.tri?'t':f.f&&Math.random()<.25?'f':f.e&&Math.random()<.4?'e':'c')}}
function burst(P,key,x,y){const f=FX[key]||FX.classic;for(let i=0;i<f.b;i++)add(P,x-28,y,-100-Math.random()*220,(Math.random()-.5)*160,.5+Math.random()*.4,f.t[i%f.t.length],f.s*1.2,f.tri?'t':f.f&&i%2?'f':f.e?'e':'c')}
function stepP(P,dt){for(let i=P.length-1;i>=0;i--){const p=P[i];p.l-=dt;if(p.l<=0){P.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt+(p.k==='e'?-40*dt:p.k==='f'?30*dt:p.k==='t'?60*dt:0)}}
function drawP(c,P,light){c.globalCompositeOperation=light?'source-over':'lighter';for(const p of P){const a=p.l/p.m;c.globalAlpha=a;c.fillStyle=p.c;if(p.k==='f'){c.save();c.translate(p.x,p.y);c.rotate(p.l*8);c.fillRect(-4,-1.5,8,3);c.restore()}else if(p.k==='t'){const z=p.s;c.save();c.translate(p.x,p.y);c.rotate(p.l*6);c.beginPath();c.moveTo(0,-z);c.lineTo(z*.86,z*.6);c.lineTo(-z*.86,z*.6);c.closePath();c.fill();c.restore()}else{c.beginPath();c.arc(p.x,p.y,p.s*(.5+a*.5),0,6.3);c.fill()}}c.globalAlpha=1;c.globalCompositeOperation='source-over'}
function coin(c,x,y,t,ph){const w=Math.abs(Math.cos(t*2.2+ph))*.72+.28;c.save();c.translate(x,y);
const h=c.createRadialGradient(0,0,3,0,0,20);h.addColorStop(0,'rgba(255,201,60,.5)');h.addColorStop(1,'rgba(255,201,60,0)');c.fillStyle=h;c.beginPath();c.arc(0,0,20,0,6.3);c.fill();
c.scale(w,1);const g=c.createLinearGradient(-9,-9,9,9);g.addColorStop(0,'#fff6c9');g.addColorStop(.5,'#ffc93c');g.addColorStop(1,'#b8801a');c.fillStyle=g;c.beginPath();c.arc(0,0,9,0,6.3);c.fill();
c.strokeStyle='#8a5a00';c.lineWidth=1.3;c.stroke();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1;c.beginPath();c.arc(0,0,5.6,0,6.3);c.stroke();
c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.ellipse(-3,-3.6,1.9,1,-.7,0,6.3);c.fill();c.restore()}
const hit=(cx,cy,r,rx,ry,rw,rh)=>{const nx=Math.max(rx,Math.min(cx,rx+rw)),ny=Math.max(ry,Math.min(cy,ry+rh));return(cx-nx)**2+(cy-ny)**2<r*r};
class Game{
constructor(cv,h){this.cv=cv;this.c=cv.getContext('2d');this.h=h;this.mode='idle';this.rt=0;this.acc=0;this.loop=this.loop.bind(this);this.fit();addEventListener('resize',()=>this.fit());
cv.addEventListener('pointerdown',e=>{e.preventDefault();this.tap()});
addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='ArrowUp')&&!e.repeat&&this.mode==='play'){e.preventDefault();this.tap()}});
document.addEventListener('visibilitychange',()=>document.hidden&&this.pause());requestAnimationFrame(this.loop)}
fit(){const w=innerWidth,h=innerHeight,sc=h/H,d=devicePixelRatio||1,st=this.cv.parentElement;this.sc=sc;this.d=d;W=Math.max(300,Math.round(w/sc));RX=Math.round(Math.max(100,Math.min(W*.28,260)));
this.cv.style.width=w+'px';this.cv.style.height=h+'px';this.cv.width=Math.round(w*d);this.cv.height=Math.round(h*d);st.style.width=w+'px';st.style.height=h+'px';st.style.fontSize=16*Math.min(1.3,Math.max(.85,sc))+'px'}
reset(th,sk,seed){Object.assign(this,{rng:seed==null?Math.random:mb(seed),noPause:false,th,skin:sk,t:0,dist:0,score:0,coins:0,py:H/2,vy:0,boost:0,P:[],pl:[],mode:'idle',cd:3,cn:0,sp:180,nid:0});this.spawn()}
gap(){return Math.max(150,172-this.nid*.65)}
spawn(){const l=this.pl[this.pl.length-1],gap=this.gap(),x=l?l.x+372:RX+520;let gy=l?l.gy+this.rng()*260-130:H/2;gy=Math.max(gap/2+70,Math.min(H-GH-gap/2-70,gy));
const p={x,gy,gap,id:this.nid++,coins:[]};if(l)p.coins.push({dx:(l.x+PW+x)/2-x,y:(l.gy+gy)/2,got:false});this.pl.push(p)}
startCountdown(sec=3){this.mode='count';this.cd=sec;this.cn=0;if(sec<=0){this.mode='play';this.h.count('GO!')}}
tap(){if(this.mode!=='play')return;this.vy=TAP;this.boost=1;burst(this.P,this.skin,RX,this.py);sfx(420,.06,'triangle')}
pause(){if(!this.noPause&&this.mode==='play'){this.mode='pause';this.h.pause()}}
resume(){if(this.mode==='pause'){this.mode='count';this.cd=3;this.cn=0}}
revive(){const n=this.pl.find(p=>p.x+PW>RX-R-5);this.pl=this.pl.filter(p=>p.x>=n.x);const d=RX+240-n.x;if(d>0)for(const p of this.pl)p.x+=d;this.py=n.gy;this.vy=0;this.startCountdown()}
step(dt){this.t+=dt;this.sp=240+Math.min(60,this.t);const mv=this.sp*dt;this.dist+=mv;
this.vy=Math.min(700,this.vy+G*dt);this.py+=this.vy*dt;if(this.py<R){this.py=R;this.vy=Math.max(0,this.vy)}
for(const p of this.pl)p.x-=mv;if(this.pl[0].x<-PW-40)this.pl.shift();while(this.pl[this.pl.length-1].x<W+300)this.spawn();
fx(this.P,this.skin,dt,RX,this.py,this.sp);let dead=this.py>H-GH-R;
for(const p of this.pl){if(!p.passed&&p.x+PW<RX-R){p.passed=true;this.score++;this.h.score(this.score)}if(p.x<RX+R+20&&p.x+PW>RX-R-20&&(hit(RX,this.py,R,p.x,-50,PW,p.gy-p.gap/2+50)||hit(RX,this.py,R,p.x,p.gy+p.gap/2,PW,H)))dead=true;
for(const k of p.coins)if(!k.got&&(p.x+k.dx-RX)**2+(k.y-this.py)**2<(R+9)**2){k.got=true;this.coins++;this.h.coins(this.coins);for(let i=0;i<7;i++)add(this.P,p.x+k.dx,k.y,(Math.random()-.5)*260,(Math.random()-.5)*260,.45,i%2?'#ffd54a':'#fff3b0',3,'c');sfx(880,.08,'sine',.06)}}
if(dead){this.mode='over';for(let i=0;i<24;i++)add(this.P,RX,this.py,(Math.random()-.5)*400,(Math.random()-.5)*400,.8,'#ff6d00',5,'c');sfx(110,.4,'sawtooth',.06);this.h.over()}}
draw(){const c=this.c,k=this.sc*this.d;c.setTransform(k,0,0,k,0,0);bg(c,this.th,this.dist,this.rt);
for(const p of this.pl){pil(c,this.th,p.x,p.gy,p.gap,p.id);for(const q of p.coins)if(!q.got)coin(c,p.x+q.dx,q.y+Math.sin(this.rt*2+p.id)*2.5,this.rt,p.id)}
ground(c,this.th);drawP(c,this.P,isLight(this.th));if(this.mode!=='over'){c.save();c.translate(RX,this.py);c.rotate(Math.max(-.5,Math.min(.7,this.vy/900)));skin(c,this.skin,this.rt,this.boost);c.restore()}}
loop(ts){requestAnimationFrame(this.loop);const dt=Math.min(.1,(ts-(this.last||ts))/1000);this.last=ts;if(!this.th||this.cv.offsetParent===null)return;this.rt+=dt;
if(this.mode==='count'){this.cd-=dt;if(this.cd<=0){this.mode='play';this.cn=0;this.h.count('GO!')}else if(Math.ceil(this.cd)!==this.cn){this.cn=Math.ceil(this.cd);this.h.count(this.cn);sfx(520,.1)}}
if(this.mode==='play'){this.acc+=dt;while(this.acc>=1/60&&this.mode==='play'){this.step(1/60);this.acc-=1/60}}
stepP(this.P,dt);this.boost=Math.max(0,this.boost-dt*4);this.draw()}}
