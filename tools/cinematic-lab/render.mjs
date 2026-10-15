#!/usr/bin/env node
// Deterministic 2.5D animation from local scene art and a JSON timeline.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
let api;
try { api=require('@napi-rs/canvas'); }
catch(e) { if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e; api=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas')); }
const {createCanvas,loadImage,GlobalFonts}=api;
const [input,output,...flags]=process.argv.slice(2);
if(!input||!output)throw new Error('node render.mjs timeline.json output.mp4 [--width=1080] [--fps=30] [--still=2]');
const arg=(k,d)=>Number(flags.find(x=>x.startsWith(`--${k}=`))?.split('=')[1]??d);
const width=arg('width',1080),height=width*16/9,fps=arg('fps',30);
if(!Number.isInteger(width)||!Number.isInteger(height)||width%2||height%2||!Number.isFinite(fps)||fps<=0)throw new Error('Even 9:16 dimensions and positive FPS required');
const base=path.dirname(path.resolve(input)),data=JSON.parse(await fs.readFile(input,'utf8'));
if(!Number.isFinite(data.duration)||data.duration<=0||!Array.isArray(data.shots)||!data.shots.length)throw new Error('Positive duration and shots required');
const fontFile=process.env.CINEMATIC_FONT??'/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
if(!GlobalFonts.registerFromPath(fontFile,'Cinema'))throw new Error(`Cannot load font: ${fontFile}`);
const pictures=new Map();
for(const shot of data.shots){
 if(!(shot.end>shot.start)||!Array.isArray(shot.focus))throw new Error('Each shot needs start, end and focus [x,y]');
 if(!pictures.has(shot.image))pictures.set(shot.image,await loadImage(path.resolve(base,shot.image)));
}
const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
const W=1080,H=1920,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
const hash=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function poly(points,fill,stroke,lw=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function glow(x,y,r,a=.4){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,224,157,${a})`);g.addColorStop(.15,`rgba(255,198,90,${a*.35})`);g.addColorStop(1,'rgba(255,174,58,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
function particles(t,density=50){
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<density;i++){
  const d=.25+hash(i+12)*.75,x=((hash(i)*W+t*(8+25*d)+Math.sin(t+i)*12)%(W+100))-50,y=((hash(i+90)*H-t*(14+20*d))%(H+100)+(H+100))%(H+100)-50;
  ctx.globalAlpha=(.16+hash(i+32)*.45)*(.65+.35*Math.sin(t*1.8+i));ctx.fillStyle=i%4?'#e6c391':'#ffffff';ctx.beginPath();ctx.ellipse(x,y,1.2+3*d,1.2+3*d,0,0,TAU);ctx.fill();
 }ctx.restore();
}
// The moving illuminated edge makes perspective and rotation visible on each sheet.
function paper(t,i,intensity=1){
 const loop=(t*.19+i*.233)%1,x=lerp(-260,1340,loop),y=400+hash(i+30)*650+Math.sin(t*1.7+i)*190;
 const scale=(.45+hash(i)*.5)*intensity,rot=t*(.5+hash(i)*1.2)+i;
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(scale,scale);
 const fold=Math.cos(t*1.6+i)*65;
 ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=26;ctx.shadowOffsetY=15;
 const g=ctx.createLinearGradient(-100,-140,120,140);g.addColorStop(0,'#fcf3d9');g.addColorStop(.5,'#e8d4a9');g.addColorStop(1,'#b99762');
 poly([[-105,-140],[90,-120+fold],[115,145],[-90,128-fold]],g,'#fff0ce',1.4);ctx.shadowBlur=0;
 ctx.strokeStyle='rgba(75,62,41,.35)';ctx.lineWidth=3;
 for(let l=0;l<8;l++){ctx.beginPath();ctx.moveTo(-71,-85+l*24);ctx.lineTo(56+(l%3)*12,-78+l*24+fold*.2);ctx.stroke();}
 ctx.restore();
}
function orb(x,y,r,t,icon=0,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;glow(x,y,r*1.9,.36);
 const g=ctx.createRadialGradient(x-r*.25,y-r*.35,1,x,y,r);g.addColorStop(0,'rgba(255,253,231,.45)');g.addColorStop(.55,'rgba(43,76,79,.6)');g.addColorStop(.9,'rgba(19,37,42,.64)');g.addColorStop(1,'rgba(255,218,145,.95)');
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle='#ffd78a';ctx.lineWidth=2.2;ctx.stroke();
 ctx.save();ctx.translate(x,y);ctx.strokeStyle='rgba(255,234,183,.8)';ctx.lineWidth=2.6;ctx.fillStyle='rgba(246,214,149,.23)';
 if(icon%3===0){for(let b=0;b<3;b++){const h=20+((b+icon)%3)*14;ctx.fillRect(-r*.5+b*r*.34,20-h,r*.24,h);ctx.strokeRect(-r*.5+b*r*.34,20-h,r*.24,h);}}
 else if(icon%3===1){poly([[-r*.55,21],[-r*.1,-r*.4],[r*.2,-5],[r*.4,-r*.18],[r*.6,21]],'rgba(235,230,210,.25)','#f5dca0',2);}
 else{ctx.beginPath();ctx.ellipse(0,-7,r*.32,r*.4,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-13,24);ctx.lineTo(13,24);ctx.moveTo(-9,31);ctx.lineTo(9,31);ctx.stroke();}
 ctx.restore();
 ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x-r*.05,y-r*.08,r*.8,Math.PI*1.07,Math.PI*1.5);ctx.stroke();
 ctx.restore();
}
function orbits(t,mode){
 const reduced=mode==='focus',n=reduced?1:7;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<n;i++){
  const a=t*(reduced?.25:.48)+i*TAU/n;
  const x=reduced?790+Math.sin(t*.8)*35:540+Math.cos(a)*(320+40*Math.sin(t*.3));
  const y=reduced?1120+Math.cos(t)*24:600+Math.sin(a)*310;
  const r=reduced?62:38+15*(.5+.5*Math.sin(a));
  ctx.strokeStyle='rgba(245,202,113,.23)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-100,y+20,x-155,y+80);ctx.stroke();
  orb(x,y,r,t,i,reduced?.8:.7);
 }ctx.restore();
}
function network(t,mode){
 const nodes=[[170,1070],[355,880],[540,1020],[750,840],[895,1070],[460,1260],[790,1280]];
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=1;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],p=(t*.45+i*.21)%1;
  ctx.strokeStyle='rgba(249,205,116,.18)';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
  const x=lerp(a[0],b[0],p),y=lerp(a[1],b[1],p);glow(x,y,26,.55);ctx.fillStyle='#ffe2a6';ctx.beginPath();ctx.arc(x,y,3,0,TAU);ctx.fill();
 }
 if(mode==='scan'){
  const x=140+((Math.sin(t*.65)+1)/2)*800;
  const g=ctx.createLinearGradient(x-140,0,x+140,0);g.addColorStop(0,'rgba(248,220,170,0)');g.addColorStop(.5,'rgba(248,220,170,.1)');g.addColorStop(1,'rgba(248,220,170,0)');poly([[x-140,0],[x+140,0],[x+390,1500],[x-160,1500]],g);
 }ctx.restore();
}
function doors(t,u,mode){
 ctx.save();
 if(mode==='doors'){
  // Two hinged foreground panels rotate away from camera during each shot.
  const open=ease(clamp(u/.7));
  for(const side of [-1,1]){
   const hinge=side<0?-20:1100,leaf=lerp(310,44,open),inner=hinge-side*leaf;
   const g=ctx.createLinearGradient(Math.min(hinge,inner),0,Math.max(hinge,inner),0);g.addColorStop(0,'#152c31');g.addColorStop(.48,'#30433e');g.addColorStop(.94,'#8b7139');g.addColorStop(1,'#d9b16b');
   poly([[hinge,-30],[inner,140+open*80],[inner,1430-open*130],[hinge,1580]],g,'#e6bd73',3);
   ctx.strokeStyle='rgba(239,204,136,.45)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(inner-side*16,200);ctx.lineTo(inner-side*16,1320);ctx.stroke();
  }
 }
 const branches=[[-120,1200],[160,1350],[910,1300],[1200,1050]];
 ctx.globalCompositeOperation='screen';
 for(let i=0;i<branches.length;i++){
  const [bx,by]=branches[i],p=(t*.28+i*.19)%1;
  const x=lerp(bx,540,ease(p)),y=lerp(by,490,p);
  glow(x,y,34,.4);ctx.fillStyle='#ffe9b3';ctx.beginPath();ctx.arc(x,y,3.4,0,TAU);ctx.fill();
 }
 ctx.restore();
}
function imagePlane(shot,p,t){
 const img=pictures.get(shot.image),z=lerp(shot.zoom?.[0]??1.05,shot.zoom?.[1]??1.25,ease(p));
 const dw=W*z,dh=H*z;
 const drift=(shot.pan??36)*Math.sin(p*Math.PI-Math.PI/2);
 let dx=(W-dw)*shot.focus[0]+drift,dy=(H-dh)*shot.focus[1]+Math.sin(t*.65)*3;
 dx=clamp(dx,W-dw,0);dy=clamp(dy,H-dh,0);
 ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // Slight vertical depth shear of strips: foreground drifts faster than background.
 const slices=64;
 for(let j=0;j<slices;j++){
  const sy=img.height*j/slices,sh=img.height/slices+1;
  const y=dy+dh*j/slices,hh=dh/slices+2;
  const depth=Math.pow(j/slices,2),shift=Math.sin(p*Math.PI)*Math.sin(t*.48)*(depth-.3)*13;
  ctx.drawImage(img,0,sy,img.width,Math.min(sh,img.height-sy),dx+shift,y,dw,hh);
 }
 ctx.restore();
}
function label(t){
 ctx.save();
 const g=ctx.createLinearGradient(0,0,0,270);g.addColorStop(0,'rgba(2,12,18,.62)');g.addColorStop(1,'rgba(2,12,18,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,270);
 ctx.fillStyle='#f7d995';ctx.fillRect(56,78,6,52);ctx.font='bold 27px Cinema';ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,.92)';ctx.fillText(data.label??'ANIMATED ESSAY',82,102);
 ctx.font='bold 18px Cinema';ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillText(data.kicker??'ВИЗУАЛЬНАЯ МЕТАФОРА',82,134);
 ctx.restore();
}
function caption(t){
 const cap=data.captions?.find(x=>t>=x.start&&t<x.end);if(!cap)return;
 const local=t-cap.start,a=ease(local/.14),offset=lerp(24,0,a);
 ctx.save();
 const g=ctx.createLinearGradient(0,1300,0,H);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.35,'rgba(2,8,13,.40)');g.addColorStop(.72,'rgba(2,8,13,.86)');g.addColorStop(1,'rgba(2,8,13,.94)');ctx.fillStyle=g;ctx.fillRect(0,1300,W,620);
 ctx.globalAlpha=a;ctx.translate(0,offset);ctx.textAlign='center';ctx.textBaseline='alphabetic';
 let size=cap.size??72;
 do{ctx.font=`bold ${size}px Cinema`;if(Math.max(...cap.lines.map(x=>ctx.measureText(x).width))<=W-128)break;size--;}while(size>38);
 const gap=size*1.23,start=cap.lines.length===1?1700:1630;
 ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.75)';ctx.lineWidth=8;
 cap.lines.forEach((line,i)=>{ctx.fillStyle=i===(cap.highlight??1)?'#ffdd83':'#ffffff';ctx.strokeText(line,W/2,start+i*gap);ctx.fillText(line,W/2,start+i*gap);});
 if(cap.note){ctx.font='bold 23px Cinema';ctx.fillStyle='rgba(255,255,255,.68)';ctx.fillText(cap.note,W/2,1791);}
 ctx.restore();
 ctx.save();ctx.textAlign='center';ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='bold 18px Cinema';ctx.fillText(cap.source??data.source??'',W/2,1837);ctx.restore();
}
function frame(t){
 ctx.resetTransform();ctx.clearRect(0,0,width,height);ctx.scale(width/W,height/H);ctx.fillStyle='#0a141b';ctx.fillRect(0,0,W,H);
 const shot=data.shots.find(s=>t>=s.start&&t<s.end)??data.shots.at(-1),p=clamp((t-shot.start)/(shot.end-shot.start));
 imagePlane(shot,p,t);
 const m=shot.motion??'particles';
 if(m==='papers'){for(let i=0;i<4;i++)paper(t,i,.7);}
 if(m==='orbits'||m==='focus')orbits(t,m);
 if(m==='network'||m==='scan')network(t,m);
 if(m==='doors'||m==='paths')doors(t,p,m);
 particles(t,m==='papers'?70:45);
 // A brief light wipe makes each purposeful change of viewpoint legible.
 const into=t-shot.start;
 if(shot.start>0&&into<.18){ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle=`rgba(240,203,139,${(1-into/.18)*.16})`;ctx.fillRect(0,0,W,H);ctx.restore();}
 label(t);caption(t);
 const endFade=clamp((t-(data.duration-.3))/.3);if(endFade){ctx.fillStyle=`rgba(2,8,13,${endFade})`;ctx.fillRect(0,0,W,H);}
}
await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
if(flags.some(x=>x.startsWith('--still='))){frame(arg('still',0));await fs.writeFile(output,await canvas.encode('png'));console.log(output);process.exit(0);}
const temp=path.join(path.dirname(path.resolve(output)),`.cinematic-${randomUUID()}.mp4`);
const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgba','-s',`${width}x${height}`,'-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','4','-preset','fast','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',temp],{stdio:['pipe','inherit','inherit']});
let pipeError;ff.stdin.on('error',e=>{pipeError=e;});
const done=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(new Error(`ffmpeg exit ${code}`)));});done.catch(()=>{});
const n=Math.round(data.duration*fps),started=performance.now();
try{
 for(let f=0;f<n;f++){
  if(pipeError)throw pipeError;frame(f/fps);
  const bytes=canvas.data();if(!ff.stdin.write(bytes))await once(ff.stdin,'drain');
  if(f%150===0)console.log(`${path.basename(output)} ${f}/${n}`);
 }
 ff.stdin.end();await done;await fs.rename(temp,path.resolve(output));
 console.log(JSON.stringify({file:output,frames:n,width,height,fps,audio:false,renderSeconds:(performance.now()-started)/1000}));
}catch(error){ff.kill();await done.catch(()=>{});await fs.rm(temp,{force:true});throw error;}
