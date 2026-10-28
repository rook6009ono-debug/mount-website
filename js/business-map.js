(function(){
 'use strict';
 var services=[
  ['renovation','大規模修繕','RENOVATION','建物全体の状態を確認し、外壁・屋上・共用部などを計画的に修繕。これからも安心して使い続けられる建物へ整えます。',['調査・計画','外壁・共用部','各工事の工程管理']],
  ['temporary','共通仮設工事','RENOVATION','工事を進めるための現場事務所、仮囲い、資材置場などを整備。居住者様の動線にも配慮して、現場の作業環境を整えます。',['現場事務所','仮囲い・養生','安全な動線']],
  ['scaffold','足場仮設工事','RENOVATION','建物の形状や作業内容に合わせて足場を設置。外壁の点検や修繕作業を行うための作業床と安全設備を整えます。',['足場の設置','作業床・手すり','飛散防止対策']],
  ['repair','下地補修工事','RENOVATION','外壁などのひび割れや浮き、欠損を調査し、状態に合わせて補修。仕上げを支える下地を整えます。',['ひび割れ','浮き・欠損','下地の調整']],
  ['seal','シーリング工事','RENOVATION','外壁の目地や窓まわりのシーリングを更新。建物の動きに追従しながら、雨水の侵入を防ぐ部分を整えます。',['外壁目地','窓まわり','シーリングの更新']],
  ['clean','洗浄工事','RENOVATION','外壁や共用部に付着した汚れを、素材や状態に合った方法で洗浄。建物の美観と、次の工程に必要な表面状態を整えます。',['外壁の洗浄','共用部の洗浄','素材に応じた方法']],
  ['paint','塗装工事','RENOVATION','外壁や鉄部などの下地を整え、塗膜を更新。色と質感を整えながら、建物を風雨から守ります。',['外壁塗装','鉄部塗装','塗膜の更新']],
  ['waterproof','防水工事','RENOVATION','屋上やバルコニーなどの防水層を点検・更新。部位や既存の状態に応じた方法で、水の侵入を防ぎます。',['屋上','バルコニー','防水層の更新']],
  ['metal','金物工事','RENOVATION','手すりや金属製の共用設備などを点検し、必要な補修や交換を行います。安全性と使いやすさを支える工事です。',['手すり','金属部材','補修・交換']],
  ['electric','電気工事','ELECTRICAL','建物と街の電気設備を支える工事。照明、信号、通信、高圧設備など、用途と現場に合わせて対応します。',['照明・信号','通信','高圧設備']],
  ['streetlight','街灯設置','ELECTRICAL','道路や敷地を照らす街灯を設置・更新。照明器具、柱、配線などを整え、夜の視認性を支えます。',['照明器具','照明柱','配線']],
  ['signal','信号機設置','ELECTRICAL','交差点の信号機や関連設備を設置・更新。道路利用者へ情報を伝える設備を整えます。',['信号灯器','支柱','関連設備']],
  ['communication','通信','ELECTRICAL','建物や設備で使う通信の配線・機器を整備。必要な情報をつなぐ環境づくりを支えます。',['通信配線','通信機器','接続環境']],
  ['voltage','高圧','ELECTRICAL','建物へ電力を供給する高圧受電設備などを整備。設備や工事の条件を確認し、必要な計画を立てて進めます。',['受電設備','設備の更新','工事計画']],
  ['other','その他','ELECTRICAL','上記以外の電気設備についても、まずはご相談ください。現場とご要望を確認し、対応内容をご案内します。',['設備のご相談','現地の確認','対応内容のご案内']]
 ];
 var byId=Object.fromEntries(services.map(function(s){return[s[0],s];}));
 // Reuse Equal Web's standard text slots. Source nodes retain fallbacks when a slot is cleared.
 var sources=document.createElement('div');sources.hidden=true;sources.id='business-text-sources';
 var sourceNodes={};
 services.forEach(function(s){sourceNodes[s[0]]={};[['title',s[1]],['body',s[3]],['points',s[4].join('\n')]].forEach(function(pair){var el=document.createElement('p');el.dataset.ewText='business-'+s[0]+'-'+pair[0];el.textContent=pair[1];sourceNodes[s[0]][pair[0]]=el;sources.appendChild(el);});});
 document.body.appendChild(sources);
 function readSource(id,field){var copy=sourceNodes[id][field].cloneNode(true);copy.querySelectorAll("br").forEach(function(br){br.replaceWith("\n");});return copy.textContent;}
 var scene=document.getElementById('city-scene'),canvas=document.getElementById('city-canvas');
 function box(x,y,w,h,d,front,side,top){return '<polygon points="'+x+','+y+' '+(x+d)+','+(y-d*.55)+' '+(x+w+d)+','+(y-d*.55)+' '+(x+w)+','+y+'" fill="'+top+'"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+front+'"/><polygon points="'+(x+w)+','+y+' '+(x+w+d)+','+(y-d*.55)+' '+(x+w+d)+','+(y+h-d*.55)+' '+(x+w)+','+(y+h)+'" fill="'+side+'"/>';}
 function worker(x,y,scale,kind){return '<g transform="translate('+x+' '+y+') scale('+scale+')"><ellipse cy="28" rx="12" ry="4" fill="#10273720"/><path d="M-4 11L-7 27M4 11L8 27" stroke="#173c4e" stroke-width="5" stroke-linecap="round"/><rect x="-8" y="-8" width="16" height="23" rx="4" fill="'+(kind==='resident'?'#d2a880':'#528b76')+'"/><path d="M-7 -4H7M-5 -8V13M5 -8V13" stroke="#ddeac9" stroke-width="2"/><g class="worker-arm"><path d="M6 -3L17 4L22 -3" fill="none" stroke="#e6bf9d" stroke-width="4" stroke-linecap="round"/><path d="M22 -8V1" stroke="#455b65" stroke-width="3"/></g><circle cy="-17" r="8" fill="#e6bf9d"/>'+(kind==='resident'?'<path d="M-8 -18Q0 -31 8 -18" fill="#263e49"/>':'<path d="M-10 -18Q-10 -31 0 -31Q10 -31 10 -18Z" fill="#fff"/><path d="M-12 -18H12" stroke="#e4ece7" stroke-width="3"/>')+'</g>';}
 function tree(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cy="14" rx="25" ry="9" fill="#10273715"/><path d="M0 -20V15" stroke="#8c9b86" stroke-width="6"/><circle cy="-29" r="25" fill="#82ad8f"/><circle cx="-13" cy="-21" r="16" fill="#669b7a"/><circle cx="9" cy="-37" r="15" fill="#a9c9a7"/></g>';}
 function art(id,markup){return '<g id="art-'+id+'" class="interactive-art" data-service="'+id+'" role="button" tabindex="0" aria-label="'+byId[id][1]+'の紹介を開く">'+markup+'</g>';}
 var svg='<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#e5eeea"/><stop offset="1" stop-color="#f5f7f0"/></linearGradient><linearGradient id="glass" x2="1" y2="1"><stop stop-color="#bfdde0"/><stop offset="1" stop-color="#5c909a"/></linearGradient><pattern id="tile" width="18" height="16" patternUnits="userSpaceOnUse"><path d="M0 0H18V16" fill="none" stroke="#d4dfd7" stroke-width=".7"/></pattern></defs><rect width="1400" height="830" fill="url(#sky)"/>';
 // Distant contemporary skyline, kept pale so the work areas remain the focus.
 [[800,65,65,160,20],[900,100,60,110,25],[1030,70,65,170,30],[1165,120,70,140,25],[1250,155,50,120,20]].forEach(function(b){svg+='<g opacity=".28">'+box(...b,'#b9cfc7','#9bb7ad','#e2ece6')+'</g>';});
 svg+='<path d="M45 510L845 278L1370 592L540 815Z" fill="#d2ded5"/><path d="M45 510V530L540 835V815ZM540 815L1370 592V612L540 835Z" fill="#b6c9be"/><path d="M65 525L850 310L1340 595L545 795Z" fill="#f3f4e9"/><path d="M65 604L650 442L1340 659L1110 735L548 552L200 651Z" fill="#91a3a6"/><path d="M65 604L650 442L1340 659" fill="none" stroke="#fff" stroke-width="4"/><path d="M200 651L548 552L1110 735" fill="none" stroke="#fff" stroke-width="4"/><path d="M110 627L600 491L1230 700" fill="none" stroke="#eaf0eb" stroke-width="3" stroke-dasharray="24 21"/>';
 svg+='<path d="M745 400L1020 335L1240 460L965 535Z" fill="#c4d8bd"/><path d="M770 412L1017 352L1212 461L965 517Z" fill="#e8ecdf"/>';
 // Renovation building: roof, facade, balconies and visible work zones.
 var building=box(285,183,330,330,100,'#e6ece6','#b8cac2','#f8faf4');
 for(var row=0;row<4;row++){for(var col=0;col<5;col++){building+='<rect x="'+(305+col*60)+'" y="'+(221+row*65)+'" width="38" height="43" rx="1" fill="url(#glass)"/><path d="M'+(324+col*60)+' '+(221+row*65)+'v43" stroke="#f7faf4" stroke-width="2"/>';}}
 for(var floor=0;floor<4;floor++){building+='<path d="M285 '+(277+floor*65)+'H615L715 '+(222+floor*65)+'" fill="none" stroke="#f9faf6" stroke-width="9"/>';}
 building+='<rect x="418" y="465" width="55" height="48" fill="#517783"/><path d="M445 465V513" stroke="#f4f7f3" stroke-width="3"/><text x="306" y="207" font-size="11" fill="#526d65" letter-spacing="3">MOUNT RESIDENCE</text>';
 svg+=art('renovation',building);
 svg+=art('waterproof','<path d="M307 170L390 124H690L607 170Z" fill="#769f9b"/><path class="roof-coating" d="M315 166L392 130H544L466 166Z" fill="#9ecac1"/><path d="M390 130H685M350 150H645" stroke="#deece5" stroke-width="2"/>'+worker(570,142,.65)+'<path d="M584 146L611 158" stroke="#365962" stroke-width="3"/>');
 svg+=art('repair','<path d="M351 313l10 7-5 9 9 10-5 11" fill="none" stroke="#a8806c" stroke-width="3"/><path d="M345 310H372V355H345Z" fill="#d5c8b2" opacity=".55"/>'+worker(370,359,.75));
 svg+=art('seal','<rect x="544" y="287" width="42" height="49" fill="none" stroke="#e6b878" stroke-width="4"/>'+worker(593,337,.72));
 svg+=art('paint','<rect x="480" y="363" width="50" height="63" fill="#97b6a5"/><g class="roller"><path d="M511 413L513 388L501 388" stroke="#465c60" stroke-width="3" fill="none"/><rect x="488" y="378" width="28" height="9" rx="3" fill="#678f79"/></g>'+worker(541,424,.8));
 svg+=art('clean',worker(330,492,.8)+'<path d="M347 478L375 458" stroke="#294957" stroke-width="5"/><path class="water-spray" d="M375 458L402 433M375 458L410 445M375 458L404 456" stroke="#71b9ca" stroke-width="3"/><path d="M330 500Q300 532 363 542" fill="none" stroke="#4e7981" stroke-width="3"/>');
 var scaffold='<path d="M273 205V548M393 205V548M513 205V548M626 205V548" stroke="#7f9897" stroke-width="6"/>';
 for(var sy=275;sy<550;sy+=65){scaffold+='<path d="M270 '+sy+'H632" stroke="#91aaa5" stroke-width="5"/><path d="M273 '+(sy-60)+'L393 '+sy+'L513 '+(sy-60)+'L626 '+sy+'" fill="none" stroke="#b2c5bb" stroke-width="2"/>';}
 scaffold+='<path d="M273 530H632M273 510H632" stroke="#d4e0d8" stroke-width="3"/>';
 svg+=art('scaffold',scaffold);
 svg+=art('metal','<path d="M623 455L706 410M623 478L706 433" stroke="#526f78" stroke-width="5"/><path d="M630 451V474M651 440V463M675 427V450M699 414V437" stroke="#789297" stroke-width="3"/>'+worker(678,484,.7));
 // Temporary site setup and protected access.
 var temp=box(145,557,100,63,40,'#f8faf5','#b6c9bf','#e0e8df')+'<rect x="158" y="569" width="34" height="25" fill="#a8ced1"/><rect x="209" y="574" width="23" height="46" fill="#7fa194"/><text x="158" y="611" font-size="9" fill="#48675a">SITE OFFICE</text><path d="M95 610L295 671" stroke="#eef1e6" stroke-width="30"/><path d="M95 602L295 663M95 615L295 676" stroke="#6b8d79" stroke-width="3"/>'+worker(280,615,.85);
 svg+=art('temporary',temp);
 // High-voltage cabinets in a fenced utility area.
 var utility='<path d="M985 345L1146 305L1242 363L1085 406Z" fill="#ced9d1"/>';
 utility+=box(1030,288,57,96,28,'#e1e8e2','#a2b8b2','#f7f9f5')+box(1100,270,57,96,28,'#d4e0da','#91aaa3','#f0f4ef');
 utility+='<path d="M1040 306H1075M1040 313H1075M1040 320H1075M1110 288H1145M1110 295H1145" stroke="#91a6a1" stroke-width="3"/><path d="M1057 335l-8 14h16Z" fill="#e7c475"/><path d="M1057 338l-3 5h4l-2 4" fill="none" stroke="#526057"/><path d="M990 362L1085 417L1242 375" stroke="#90a89c" stroke-width="3" fill="none"/>';
 svg+=art('voltage',utility);
 // Communication hub and travelling data pulses.
 var comm=box(865,274,92,140,40,'#f1f6f0','#a6bfb5','#fff')+'<path d="M910 275V215" stroke="#758e8c" stroke-width="4"/><circle cx="910" cy="211" r="5" fill="#608d7a"/><path class="data-flow" d="M883 205Q910 177 937 205M874 193Q910 155 946 193" fill="none" stroke="#6b9e88" stroke-width="3"/><path class="data-flow" d="M920 412L1015 452L1180 495" stroke="#6b9e88" stroke-width="3" fill="none"/><rect x="882" y="307" width="56" height="36" fill="url(#glass)"/><text x="881" y="384" fill="#58766b" font-size="9" letter-spacing="2">NETWORK</text>';
 svg+=art('communication',comm);
 // Streetlights, signal and electrical maintenance.
 var lamp='<path d="M795 500V347Q795 332 813 335L841 345" stroke="#6f8b8a" stroke-width="6" fill="none"/><path d="M826 342L852 350" stroke="#e4ece4" stroke-width="10" stroke-linecap="round"/><path class="light-beam" d="M829 352L787 489L908 513L852 357Z" fill="#fff5bd" opacity=".3"/><ellipse cx="798" cy="501" rx="12" ry="5" fill="#91aaa0"/>';
 svg+=art('streetlight',lamp);
 var signal='<path d="M1100 603V459Q1100 443 1087 439L1007 414" fill="none" stroke="#657f83" stroke-width="7"/><g transform="translate(967 395)"><rect width="86" height="34" rx="10" fill="#294755"/><circle class="signal-red" cx="17" cy="17" r="10"/><circle class="signal-yellow" cx="43" cy="17" r="10"/><circle class="signal-green" cx="69" cy="17" r="10"/></g><rect x="1089" y="493" width="22" height="35" rx="4" fill="#294755"/><path d="M1096 507l5-8 4 10M1101 499v20" stroke="#e8826d" stroke-width="3" fill="none"/>';
 svg+=art('signal',signal);
 svg+='<g fill="#f4f6ed" transform="translate(1010 581) rotate(18)"><rect width="12" height="66"/><rect x="22" width="12" height="66"/><rect x="44" width="12" height="66"/><rect x="66" width="12" height="66"/></g>';
 var other=box(1200,462,47,63,22,'#c6d9cb','#98b5a5','#e5ede5')+'<path d="M1214 479h16v21h-16Z" fill="#5b7f74"/>'+worker(1188,526,.85)+'<path d="M1198 520Q1160 540 1210 550" fill="none" stroke="#506f74" stroke-width="3"/>';
 svg+=art('other',other);
 svg+=art('electric','<g transform="translate(860 588)">'+box(0,0,75,35,25,'#f8faf6','#c1d2ca','#e8efe8')+'<path d="M75 2h28l18 19v21H75Z" fill="#607f6b"/><path d="M84 8h15l13 13H84Z" fill="#b9d9db"/><circle cx="19" cy="38" r="11" fill="#284855"/><circle cx="94" cy="41" r="11" fill="#284855"/><text x="8" y="22" fill="#607f6b" font-size="10" font-weight="700">MOUNT</text></g>');
 // Park, moving residents and a quiet street vehicle.
 [[115,475,1],[205,465,.8],[740,560,.8],[825,440,.75],[1000,320,.65],[1290,513,.9],[1168,645,.7],[470,718,.8],[560,748,.7]].forEach(function(t){svg+=tree(...t);});
 svg+='<g class="pedestrian">'+worker(695,580,.75,'resident')+'</g><g class="pedestrian second">'+worker(905,480,.68,'resident')+'</g><g class="vehicle" transform="translate(0 0)"><g transform="translate(510 659)"><path d="M0 0l47-13 55 20-48 13Z" fill="#e4eeea"/><path d="M0 0v21l54 20V20Z" fill="#f9fbf6"/><path d="M54 20l48-13v21L54 41Z" fill="#a5beb4"/><path d="M17 0l26-7 31 12-27 7Z" fill="#7faab2"/><ellipse cx="15" cy="26" rx="8" ry="10" fill="#294652"/><ellipse cx="84" cy="31" rx="8" ry="10" fill="#294652"/></g></g>';
 svg+='<text x="400" y="787" transform="rotate(18 400 787)" font-family="Oswald,sans-serif" font-size="19" letter-spacing="8" fill="#96b2a2">BUILD FOR TOMORROW</text>';
 scene.innerHTML=svg;
 var pins=[['renovation',466,82,'01'],['waterproof',551,153,'02'],['scaffold',220,293,'03'],['repair',333,352,'04'],['seal',642,298,'05'],['paint',537,429,'06'],['clean',346,538,'07'],['metal',713,489,'08'],['temporary',174,653,'09'],['electric',920,663,'10'],['streetlight',783,318,'11'],['signal',1056,555,'12'],['communication',918,238,'13'],['voltage',1134,259,'14'],['other',1246,568,'15']];
 pins.forEach(function(pin){var s=byId[pin[0]],b=document.createElement('button');b.type='button';b.className='map-pin'+(s[2]==='ELECTRICAL'?' electric':'');b.dataset.service=s[0];b.style.left=(pin[1]/14)+'%';b.style.top=(pin[2]/8.3)+'%';b.setAttribute('aria-label',s[1]+'の紹介を開く');b.innerHTML='<b>'+pin[3]+'</b><span>'+s[1]+'</span>';canvas.appendChild(b);});
 services.forEach(function(s){var b=document.createElement('button');b.type='button';b.dataset.service=s[0];b.textContent=s[1];document.getElementById(s[2]==='RENOVATION'?'renovation-list':'electrical-list').appendChild(b);});
 var dialog=document.getElementById('service-dialog'),lastTrigger=null,wasPaused=false;
 function fillDetail(id){var s=byId[id];document.getElementById('detail-kicker').textContent=s[2];document.getElementById('detail-title').textContent=readSource(id,'title');document.getElementById('detail-description').textContent=readSource(id,'body');var list=document.getElementById('detail-points');list.replaceChildren();readSource(id,'points').split('\n').filter(function(text){return text.trim();}).forEach(function(text){var li=document.createElement('li');li.textContent=text;list.appendChild(li);});}
 function openService(id,trigger){if(!byId[id])return;lastTrigger=trigger;wasPaused=canvas.classList.contains('is-paused');canvas.classList.add('is-paused');dialog.dataset.serviceId=id;fillDetail(id);dialog.showModal();}
 new MutationObserver(function(){services.forEach(function(s){var title=readSource(s[0],'title');document.querySelectorAll('[data-service="'+s[0]+'"]').forEach(function(el){if(el.classList.contains('map-pin')){el.querySelector('span').textContent=title;el.setAttribute('aria-label',title+'の紹介を開く');}else if(el.classList.contains('interactive-art')){el.setAttribute('aria-label',title+'の紹介を開く');}else{el.textContent=title;}});});if(dialog.open)fillDetail(dialog.dataset.serviceId);}).observe(sources,{childList:true,subtree:true,characterData:true});
 document.addEventListener('click',function(e){var b=e.target.closest('[data-service]');if(b)openService(b.dataset.service,b);});
 scene.addEventListener('keydown',function(e){var b=e.target.closest('[data-service]');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openService(b.dataset.service,b);}});
 document.querySelectorAll('.map-pin').forEach(function(b){var target=document.getElementById('art-'+b.dataset.service);['mouseenter','focus'].forEach(function(event){b.addEventListener(event,function(){target.classList.add('is-highlighted');});});['mouseleave','blur'].forEach(function(event){b.addEventListener(event,function(){target.classList.remove('is-highlighted');});});});
 document.getElementById('dialog-close').addEventListener('click',function(){dialog.close();});
 dialog.addEventListener('click',function(e){if(e.target===dialog){var r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',function(){canvas.classList.toggle('is-paused',wasPaused);lastTrigger?.focus({preventScroll:true});});
 var reduced=matchMedia('(prefers-reduced-motion: reduce)'),toggle=document.getElementById('map-motion');
 function updateMotion(){if(reduced.matches){canvas.classList.add('is-paused');toggle.textContent='動きを減らして表示中';toggle.disabled=true;}else{toggle.disabled=false;toggle.textContent=canvas.classList.contains('is-paused')?'▶ 動きを再開':'Ⅱ 動きを止める';}toggle.setAttribute('aria-pressed',String(canvas.classList.contains('is-paused')));}
 toggle.addEventListener('click',function(){canvas.classList.toggle('is-paused');updateMotion();});
 reduced.addEventListener('change',updateMotion);updateMotion();
})();
