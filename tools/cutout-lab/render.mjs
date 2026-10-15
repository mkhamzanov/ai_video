#!/usr/bin/env node
// Render a trusted local ES module exporting {duration, renderSvg(t)}.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
const require=createRequire(import.meta.url);
let sharp;
try{sharp=require('sharp');}catch(e){if(!process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES)throw e;sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'));}
const [input,output,...flags]=process.argv.slice(2);
if(!input||!output){console.error('node render.mjs INPUT.mjs OUTPUT.mp4 [--width=1080] [--fps=30] [--still=2.5]');process.exit(2);}
const value=(key,def)=>Number(flags.find(s=>s.startsWith(`--${key}=`))?.split('=')[1]??def);
const width=value('width',1080),height=width*16/9,fps=value('fps',30);
if(!Number.isInteger(width)||!Number.isInteger(height)||width%2||height%2||fps<=0)throw new Error('Use an even 9:16 resolution and positive FPS');
const mod=await import(pathToFileURL(path.resolve(input)));
if(typeof mod.renderSvg!=='function'||!(mod.duration>0))throw new Error('Composition must export renderSvg and positive duration');
await fs.mkdir(path.dirname(path.resolve(output)),{recursive:true});
const raster=t=>sharp(Buffer.from(mod.renderSvg(t)),{density:72*width/720}).resize(width,height).removeAlpha();
if(flags.some(s=>s.startsWith('--still='))){await raster(value('still',0)).png().toFile(output);console.log(output);process.exit(0);}
const temporaryOutput=path.join(path.dirname(path.resolve(output)),`.cutout-${randomUUID()}.mp4`);
const args=['-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',`${width}x${height}`,'-r',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','4','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',temporaryOutput];
const proc=spawn('ffmpeg',args,{stdio:['pipe','inherit','inherit']});
let pipeError=null;proc.stdin.on('error',e=>{pipeError=e;});
const finished=new Promise((resolve,reject)=>{proc.once('error',reject);proc.once('close',c=>c===0?resolve():reject(new Error(`ffmpeg exited ${c}`)));});
finished.catch(()=>{});
const frames=Math.round(mod.duration*fps),start=performance.now();
try{
 for(let f=0;f<frames;f++){
  if(pipeError)throw pipeError;
  const data=await raster(f/fps).raw().toBuffer();
  if(!proc.stdin.write(data))await once(proc.stdin,'drain');
  if(f%150===0)console.log(`${path.basename(output)} ${f}/${frames}`);
 }
 proc.stdin.end();await finished;
 await fs.rename(temporaryOutput,path.resolve(output));
 console.log(JSON.stringify({file:output,frames,width,height,fps,audio:false,seconds:(performance.now()-start)/1000}));
}catch(e){proc.kill();await finished.catch(()=>{});await fs.rm(temporaryOutput,{force:true});throw e;}
