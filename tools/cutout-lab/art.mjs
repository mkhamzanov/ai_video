// Original, deterministic SVG cutout primitives. No RAF, random(), fonts or network fetches.
export const C={ink:'#1c2930',paper:'#f6eee0',gold:'#e6b655',red:'#c95245',teal:'#477e78',white:'#fffaf1',skin:'#d9a982',shadow:'#b8a893'};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return 1-(1-x)**3;};
export const mix=(a,b,x)=>a+(b-a)*x;
export const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const g=(body,x=0,y=0,s=1,r=0,opacity=1)=>`<g transform="translate(${x} ${y}) scale(${s}) rotate(${r})" opacity="${opacity}">${body}</g>`;
export const rect=(x,y,w,h,fill=C.paper,r=0,stroke='none',sw=3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const circle=(x,y,r,fill=C.gold,stroke='none',sw=3)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
export const ellipse=(x,y,rx,ry,fill,opacity=1)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${opacity}"/>`;
export const path=(d,fill='none',stroke=C.ink,sw=4,extra='')=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const line=(x,y,x2,y2,color=C.ink,w=4,extra='')=>path(`M${x} ${y}L${x2} ${y2}`,'none',color,w,extra);
export const text=(x,y,txt,size=30,fill=C.ink,weight=700,anchor='middle',extra='')=>`<text x="${x}" y="${y}" fill="${fill}" font-family="DejaVu Sans" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" ${extra}>${esc(txt)}</text>`;
export const multiline=(lines,x,y,size=44,color=C.ink,gap=1.2)=>lines.map((l,i)=>text(x,y+i*size*gap,l,size,color)).join('');
export function badge(x,y,label,color=C.ink){return g(rect(-110,-21,220,42,color,21)+text(0,7,label,17,C.white),x,y);}
export function coin(x,y,r=14){return circle(x,y,r,C.gold,C.ink,2)+circle(x-2,y-2,r-5,'none','#f8d681',2)+line(x,y-5,x,y+5,C.ink,2);}
export function building(x,y,kind='bank',s=1,col=C.gold){
 let b=rect(-66,-60,132,120,col,3,C.ink,4)+rect(-78,62,156,14,C.ink,2);
 if(kind==='bank'||kind==='school'){
 b=path('M-83 -62L0 -110L83 -62Z',col,C.ink,4)+rect(-72,-62,144,16,C.white,0,C.ink,4);
 for(let j=-1;j<=1;j++)b+=rect(j*48-10,-42,20,102,C.white,0,C.ink,3);
 b+=rect(-78,62,156,14,C.ink,2);
 b+=text(0,-70,kind==='bank'?'БАНК':'ШКОЛА',15,C.ink);
 }else{
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)b+=rect(-49+i*40,-44+j*32,19,19,C.white,1,C.ink,2);
 b+=rect(-13,34,26,29,C.ink,1);
 if(kind==='hotel')b+=rect(-45,-94,90,26,C.red,4,C.ink,3)+text(0,-75,'ОТЕЛЬ',15,C.white);
 }
 return g(b,x,y,s);
}
export function paper(x,y,lines=3,s=1,label=''){
 let a=rect(-46,-62,92,124,C.white,5,C.ink,3)+path('M22 -62V-37H46','none',C.ink,3);
 for(let j=0;j<lines;j++)a+=line(-27,-16+j*18,25,-16+j*18,C.teal,4);
 if(label)a+=text(0,45,label,11);
 return g(a,x,y,s);
}
export function key(x,y,s=1,rot=0){return g(circle(0,0,21,'none',C.gold,10)+line(21,0,79,0,C.gold,12)+line(58,0,58,16,C.gold,10)+line(76,0,76,16,C.gold,10),x,y,s,rot);}
export function bulb(x,y,s=1,col=C.gold){return g(circle(0,-12,25,col,C.ink,3)+rect(-12,9,24,24,C.ink,4)+line(-7,37,7,37,C.ink,4),x,y,s);}
export function plant(x,y,growth=1,col=C.teal){return g(rect(-25,0,50,32,C.red,5,C.ink,3)+path(`M0 0Q-6 ${-44*growth} 0 ${-94*growth}`,'none',C.ink,5)+g(path('M0 0Q-46 -28 -35 -45Q5 -45 0 0Z',col,C.ink,2),0,-35*growth,growth)+g(path('M0 0Q45 -28 38 -47Q-3 -47 0 0Z',col,C.ink,2),0,-56*growth,growth),x,y);}
export function bird(x,y,t,s=1){let r=Math.sin(t*9)*13;return g(ellipse(0,0,32,46,C.ink)+circle(13,-43,24,C.ink)+path('M28 -51L58 -42L30 -36Z',C.gold,C.ink,3)+path('M-7 -62L4 -83L24 -65Z',C.red,C.ink,2)+circle(20,-48,4,C.white)+path('M-19 -14Q30 -24 6 30Z',C.white,C.ink,2)+line(-7,43,-11,66,C.ink,4)+line(8,43,18,66,C.ink,4),x,y,s,r);}
export function person(x,y,{kind='neutral',scale=1,t=0,arm=0,mood='calm',coat=C.ink,pose=0}={}){
 const old=kind==='silver',glasses=kind==='glasses',casual=kind==='casual';
 const breathe=Math.sin(t*2.5)*2,blink=(t%3.7)>3.56;
 let a=ellipse(0,225,99,16,C.ink,.15);
 a+=g(rect(-52,110,43,105,coat,14,C.ink,4)+path('M-52 199L-66 220Q-40 232 -8 221L-9 200Z',C.ink,C.ink),-3,0,1,pose);
 a+=g(rect(9,110,43,105,coat,14,C.ink,4)+path('M9 199L7 221Q38 232 66 221L52 200Z',C.ink,C.ink),3,0,1,-pose);
 a+=path('M-65 -9Q-87 31 -70 137Q0 157 70 137Q88 34 63 -9Z',coat,C.ink,4);
 if(!casual)a+=path('M-30 -9L0 87L32 -9Z',C.white,C.ink,3)+path('M-10 0L0 10L10 0L14 59L0 80L-14 59Z',old?C.gold:C.red,C.ink,2)+path('M-37 -9L-58 31L-32 31L-46 47L0 94M37 -9L58 31L32 31L46 47L0 94','none','#506066',3);
 else a+=path('M-25 -9Q0 15 25 -9M0 11V105','none','#31544e',4);
 for(const side of [-1,1])a+=g(path(`M${side*60} 3Q${side*93} 40 ${side*82} 91`,'none',C.ink,29)+path(`M${side*60} 3Q${side*93} 40 ${side*82} 91`,'none',coat,23)+ellipse(side*82,99,13,20,C.skin),side*60,3,1,side*(arm+Math.sin(t*2)*3)).replace(`translate(${side*60} 3)`,`translate(0 0)`);
 a+=rect(-20,-40,40,45,C.skin,9,C.ink,3);
 let head=ellipse(-63,-91,12,20,C.skin)+ellipse(63,-91,12,20,C.skin)+path('M-60 -130Q-62 -174 0 -179Q61 -177 61 -130L55 -61Q35 -21 0 -22Q-39 -24 -56 -61Z',C.skin,C.ink,4);
 if(old)head+=path('M-60 -104Q-84 -159 -39 -181Q10 -207 57 -163L62 -111L47 -140Q17 -140 6 -162Q-21 -140 -51 -139Z','#cbd1ca',C.ink,4)+path('M-48 -162Q-24 -178 -1 -167M17 -178Q39 -169 46 -151','none','#8e9997',4);
 else if(glasses)head+=path('M-60 -104L-63 -149Q-46 -184 4 -182Q50 -183 64 -150L60 -109L47 -139Q19 -146 -4 -158Q-18 -145 -48 -137Z','#bac3c1',C.ink,4)+path('M-40 -163Q-13 -177 14 -165','none',C.white,4);
 else if(casual)head+=path('M-60 -109L-60 -143Q-49 -171 -30 -174L-40 -134ZM60 -109L60 -144Q49 -170 31 -174L42 -132Z','#e2d9ca',C.ink,3);
 else head+=path('M-60 -118Q-68 -182 0 -183Q61 -185 62 -116L45 -147L-38 -145Z',C.ink,C.ink,4);
 const brow=mood==='worried'?8:0;
 head+=line(-42,-114-brow,-18,-118,C.ink,5)+line(18,-118,42,-114-brow,C.ink,5);
 head+=blink?line(-35,-99,-24,-99,C.ink,3)+line(24,-99,35,-99,C.ink,3):ellipse(-29,-100,4,5,C.ink)+ellipse(29,-100,4,5,C.ink);
 head+=path('M3 -101L-4 -79Q4 -73 12 -79','none','#9e6d55',3)+path(mood==='worried'?'M-19 -49Q0 -61 19 -49':'M-20 -53Q0 -44 20 -53','none',C.ink,3);
 head+=path('M-46 -75L-38 -70M38 -70L46 -75','none','#bc8569',3);
 if(glasses)head+=rect(-49,-112,42,28,'none',8,C.ink,4)+rect(7,-112,42,28,'none',8,C.ink,4)+line(-7,-101,7,-101,C.ink,4);
 if(old)head+=path('M-31 -132H31M-28 -140H24','none','#ab8c76',2);
 a+=g(head,0,breathe,1,Math.sin(t)*1.3);
 return g(a,x,y,scale);
}
export function shell({t,duration=30,palette=C.gold,series='CUTOUT LAB',name='',label='',headline=[],sub='',body='',footer='',index=0}){
 const enter=ease((t%5)/.45),w=720,h=1280;
 let bg=rect(0,0,w,h,C.paper)+`<defs><pattern id="grain" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="3" cy="6" r=".65" fill="#8d8069" opacity=".18"/></pattern><clipPath id="stage"><rect x="30" y="340" width="650" height="640" rx="30"/></clipPath></defs>` ;
 bg+=line(48,133,646,133,C.ink,2)+text(48,100,series,15,C.ink,700,'start','letter-spacing="3"')+text(646,100,String(index+1).padStart(2,'0')+' / 06',14,C.ink,400,'end');
 bg+=text(48,177,name.toUpperCase(),18,C.ink,700,'start','letter-spacing="1"');
 bg+=g(multiline(headline,48,236,37,C.ink,1.22).replaceAll('text-anchor="middle"','text-anchor="start"'),0,(1-enter)*12,1,0,.4+.6*enter);
 bg+=circle(357,649,257,palette)+circle(357,649,224,'none',C.paper,1)+circle(357,649,210,'none',C.paper,1);
 bg+=`<g clip-path="url(#stage)">${g(body,0,15*(1-enter),1,0,1)}</g>`;
 bg+=rect(48,996,594,93,C.ink,10)+multiline(Array.isArray(sub)?sub:[sub],345,1036,21,C.white,1.45);
 bg+=text(48,1126,label,14,C.ink,700,'start')+text(48,1152,footer,12,C.ink,400,'start');
 bg+=rect(48,1195,594,3,'#d5c8b2')+rect(48,1195,594*clamp(t/duration),3,C.ink)+text(48,1230,'ТИХОЕ КИНО / 30 СЕКУНД',10,C.ink,400,'start','letter-spacing="2"');
 return `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280" viewBox="0 0 720 1280">${bg}</svg>`;
}
