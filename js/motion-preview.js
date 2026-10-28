/* One-shot brand film: explicit pause/replay; no scroll hijacking. */
(function(){
 'use strict';
 var hero=document.querySelector('.mount-hero'),video=document.getElementById('mount-film');
 if(!hero||!video)return;
 var toggle=document.getElementById('film-toggle'),skip=document.getElementById('film-skip'),bar=document.getElementById('film-progress'),status=document.getElementById('film-status');
 var chapters=document.querySelectorAll('.film-chapters span'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),attempt=0;
 var headline=hero.querySelector('h1'),headlineObserver;
 function revealHeadline(){
  if(!headline)return;
  headlineObserver?.disconnect();
  if(headline._ewInitialHtml===undefined)headline._ewInitialHtml=headline.innerHTML;
  var lines=headline.innerHTML.replace(/<br\s*\/?\s*>/gi,'\n');
  var plain=document.createElement('div');plain.innerHTML=lines;
  var content=headline.querySelector('.film-line')?Array.from(headline.querySelectorAll('.film-line')).map(function(el){return el.textContent;}):plain.textContent.split('\n');
  headline.replaceChildren();
  content.forEach(function(text,i){var mask=document.createElement('span'),line=document.createElement('span');mask.className='film-line';line.className='film-line-text';line.style.setProperty('--line-index',i);line.textContent=text;mask.appendChild(line);headline.appendChild(mask);});
  headlineObserver?.observe(headline,{childList:true,subtree:true,characterData:true});
 }
 headlineObserver=new MutationObserver(revealHeadline);revealHeadline();
 function state(value){hero.dataset.film=value;toggle.textContent=value==='playing'?'Ⅱ 一時停止':value==='paused'?'▶ 再開':'▶ 動画を見る';skip.hidden=value!=='playing'&&value!=='paused';}
 function sync(){var fraction=video.duration?Math.min(1,video.currentTime/video.duration):0;bar.style.transform='scaleX('+fraction+')';chapters.forEach(function(el,i){el.classList.toggle('is-current',i===(fraction<4/15?0:fraction<12/15?1:2));});}
 function stop(){attempt++;video.pause();var focusBack=document.activeElement===skip;state('finished');status.textContent='イメージ映像';if(focusBack)toggle.focus({preventScroll:true});}
 async function start(){var id=++attempt;if(!video.src)video.src=video.dataset.src;if(hero.dataset.film!=='paused'){video.currentTime=0;revealHeadline();}try{await video.play();if(id!==attempt||document.hidden){video.pause();return;}state('playing');status.textContent='イメージ映像';}catch(e){if(id===attempt){state('ready');status.textContent='静止画を表示中';}}}
 toggle.addEventListener('click',function(){if(!video.paused){video.pause();state('paused');}else start();});
 skip.addEventListener('click',stop);video.addEventListener('ended',stop);video.addEventListener('timeupdate',sync);
 video.addEventListener('error',function(){stop();status.textContent='動画を読み込めませんでした';toggle.disabled=true;});
 document.addEventListener('visibilitychange',function(){if(document.hidden&&!video.paused){video.pause();state('paused');}});
 reduced.addEventListener('change',function(){if(reduced.matches)stop();});
 state('ready');if(!reduced.matches&&!navigator.connection?.saveData)start();
})();
