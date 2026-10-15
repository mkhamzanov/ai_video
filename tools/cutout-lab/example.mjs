import {shell,person,plant,building,C} from './art.mjs';
export const duration=30;
export function renderSvg(t){return shell({t,duration,palette:'#a8c5b0',series:'CUTOUT LAB',name:'Пример анимации',headline:['ИДЕЯ РАСТЁТ','ВМЕСТЕ С ТОБОЙ.'],sub:'Детерминированная SVG-анимация',body:person(290,680,{t,kind:'casual',coat:C.teal})+plant(490,825,.4+(t%5)/8)+building(150,830,'school',.55),label:'ДЕМОНСТРАЦИЯ ДВИЖКА',footer:'Оригинальная векторная графика • без аудио',index:Math.min(5,Math.floor(t/5))});}
