/* JooWoo · сайт: оформление, небо, карусели, лайтбокс, появление блоков */
(function(){
  var root=document.documentElement;

  /* ── переключатель оформления ── */
  var btns=[].slice.call(document.querySelectorAll('.skin button,.door,.qs-skin'));
  function setSkin(s){root.dataset.skin=s;if(window.jwSwap)jwSwap();btns.forEach(function(b){b.classList.toggle('on',b.dataset.set===s)});try{localStorage.setItem('jw-skin',s)}catch(e){}sky.reset()}
  btns.forEach(function(b){b.addEventListener('click',function(){setSkin(b.dataset.set)})});

  /* ── небо: звёзды (midnight) или лепестки и блики (camellia), мотыльки и светлячки (lilac) ── */
  var sky=(function(){
    var c=document.getElementById('sky'),x=c.getContext('2d'),W,H,dpr,parts=[],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr}
    function make(){var sk=root.dataset.skin,cam=sk==='camellia',lil=sk==='lilac',n=Math.round(Math.min(lil?60:110,innerWidth/(lil?22:12)));parts=[];
      for(var i=0;i<n;i++){var petal=cam&&i%4===0;parts.push({x:Math.random()*W,y:Math.random()*H,r:(petal?3+Math.random()*3:.5+Math.random()*1.4)*dpr,
        s:.2+Math.random()*.8,t:Math.random()*6.28,petal:petal,vx:(Math.random()-.5)*.15*dpr,vy:(cam?.12+Math.random()*.2:.02)*dpr,rot:Math.random()*6.28})}
      if(lil){var k,nf=Math.round(Math.min(18,innerWidth/80)),nm=innerWidth<700?4:innerWidth<1200?6:9;
        for(k=0;k<nf;k++)parts.push({fly:1,x:Math.random()*W,y:H*(.35+Math.random()*.65),r:(1.1+Math.random()*1.5)*dpr,s:.3+Math.random()*.7,t:Math.random()*6.28,vx:(Math.random()-.5)*.18*dpr,vy:-(.06+Math.random()*.16)*dpr});
        for(k=0;k<nm;k++)parts.push({moth:1,x:Math.random()*W,y:Math.random()*H,sz:(8+Math.random()*7)*dpr,ang:Math.random()*6.28,sp:(.28+Math.random()*.38)*dpr,s:.5+Math.random()*.5,t:Math.random()*6.28,f:Math.random()*6.28,fs:.2+Math.random()*.1,turn:(Math.random()-.5)*.01})}}
    function halo(px,py,r,col,al){var g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.globalAlpha=al;x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,6.28);x.fill()}
    function moth(p){var z=p.sz,fl=.3+.7*Math.abs(Math.sin(p.f));x.save();x.translate(p.x,p.y);x.rotate(p.ang+1.5708);
      halo(0,0,z*2.6,'rgba(240,215,200,.5)',.22);
      for(var sd=-1;sd<=1;sd+=2){x.save();x.scale(sd*fl,1);
        x.globalAlpha=.62;x.fillStyle='#efe1d6';x.beginPath();x.moveTo(0,-z*.15);x.bezierCurveTo(z*.5,-z*1.1,z*1.5,-z*.9,z*1.2,-z*.15);x.bezierCurveTo(z*.9,z*.2,z*.3,z*.15,0,z*.05);x.closePath();x.fill();
        x.globalAlpha=.46;x.fillStyle='#dcc6d4';x.beginPath();x.moveTo(0,0);x.bezierCurveTo(z*.9,z*.05,z*1,z*.8,z*.5,z*.85);x.bezierCurveTo(z*.2,z*.8,z*.05,z*.4,0,z*.2);x.closePath();x.fill();
        x.globalAlpha=.4;x.strokeStyle='#cdb8a8';x.lineWidth=dpr*.7;x.beginPath();x.moveTo(z*.04,-z*.4);x.quadraticCurveTo(z*.2,-z*.8,z*.38,-z*.9);x.stroke();x.restore()}
      x.globalAlpha=.8;x.fillStyle='#bca594';x.beginPath();x.ellipse(0,z*.02,z*.1,z*.46,0,0,6.28);x.fill();x.restore()}
    function draw(){x.clearRect(0,0,W,H);var sk=root.dataset.skin,cam=sk==='camellia',lil=sk==='lilac';
      parts.forEach(function(p){p.t+=.012*p.s;var a=lil?.18+.2*(.5+.5*Math.sin(p.t*.5)):.25+.55*(.5+.5*Math.sin(p.t));
        if(p.moth){if(!reduce){p.f+=p.fs;p.ang+=p.turn+Math.sin(p.t*1.7)*.012;if(Math.random()<.004)p.turn=(Math.random()-.5)*.012;
            p.x+=Math.cos(p.ang)*p.sp;p.y+=Math.sin(p.ang)*p.sp+Math.sin(p.f*.5)*.25*dpr;var m=p.sz*3;
            if(p.x<-m)p.x=W+m;if(p.x>W+m)p.x=-m;if(p.y<-m)p.y=H+m;if(p.y>H+m)p.y=-m}moth(p);return}
        if(!reduce){p.x+=p.vx;p.y+=p.vy;p.rot+=.004;if(p.y>H+10){p.y=-10;p.x=Math.random()*W}if(p.y<-10){p.y=H+10;p.x=Math.random()*W}if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10}
        if(p.fly){var fa=.25+.6*(.5+.5*Math.sin(p.t*2.2));halo(p.x,p.y,p.r*6,'rgba(240,199,164,.7)',fa*.5);x.fillStyle='#f6d9bd';x.globalAlpha=fa;x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fill()}
        else if(p.petal){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=a*.55;x.fillStyle='#d6aab6';x.beginPath();x.ellipse(0,0,p.r*1.6,p.r*.75,0,0,6.28);x.fill();x.restore();}
        else{x.globalAlpha=a;x.fillStyle=lil?'#c9bcdf':cam?'#dfe8ef':(p.s>.75?'#ffd9a8':'#fff3e6');x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fill();
          if(p.r>1.6*dpr&&!lil){x.globalAlpha=a*.25;x.beginPath();x.arc(p.x,p.y,p.r*3,0,6.28);x.fill()}}});
      x.globalAlpha=1;if(!reduce)requestAnimationFrame(draw)}
    size();make();draw();addEventListener('resize',function(){size();make();if(reduce)draw()});
    return {reset:function(){make();if(reduce)draw()}};
  })();
  setSkin(root.dataset.skin||'midnight');

  /* ── картинки и файлы под язык и тему: {L} — en/ru, {X} — '-en' или '', {S} — тема ── */
  window.jwSwap=function(){var l=root.lang==='ru'?'ru':'en',sk=root.dataset.skin||'midnight';
    [].forEach.call(document.querySelectorAll('[data-l],[data-l-en]'),function(el){
      var v=el.hasAttribute('data-l-en')?el.getAttribute('data-l-'+l):el.getAttribute('data-l').replace('{L}',l).replace('{X}',l==='en'?'-en':'').replace('{S}',sk==='camellia'||sk==='lilac'?sk:'midnight');
      var at=el.tagName==='A'?'href':'src';if(el.getAttribute(at)!==v)el.setAttribute(at,v)});if(window.jwFiles)jwFiles()};


  /* ── файлы и версии из files.js: ссылки [data-f], метки [data-v], составы [data-has], таблица #vers ── */
  window.jwFiles=function(){var F=window.JW_FILES;if(!F)return;var l=root.lang==='ru'?'ru':'en',by={},top=0;
    function dn(d){var p=d.split('.');return +(p[2]+p[1]+p[0])}
    F.items.forEach(function(i){by[i.id]=i;top=Math.max(top,dn(i.date))});
    var T=l==='ru'?{nw:'новое',up:'обновлено',dl:'скачать',inside:'внутри',last:'Последнее обновление',cnt:'новых файлов',g:{preset:'Пресет',regex:'Регексы — шапка, следы, переписка',lore:'Лорбук',theme:'Темы',plugin:'Плагины',bundle:'Архивы «всё сразу»'}}
                    :{nw:'new',up:'updated',dl:'download',inside:'inside',last:'Last update',cnt:'new files',g:{preset:'Preset',regex:'Regex sets — header, traces, texts',lore:'Lorebook',theme:'Themes',plugin:'Plugins',bundle:'Everything-in-one archives'}};
    function isNew(i){return dn(i.date)===top}
    function vtxt(i){return (i.ver?'v'+i.ver+' · ':'')+i.date.slice(0,5)}
    function short(i){return i.name[l].replace(/^(Плагин|Тема|Регексы|Пресет|Лорбук)\s+/,'').replace(/\s+(plugin|theme|preset|lorebook)$/i,'').replace(/^Regex\s+/,'').replace(/^\d\s·\s/,'')+(i.ver?' '+i.ver:'')}
    [].forEach.call(document.querySelectorAll('[data-f]'),function(a){var i=by[a.dataset.f];if(i)a.setAttribute('href','files/'+i[l])});
    [].forEach.call(document.querySelectorAll('[data-v]'),function(s){var i=by[s.dataset.v];if(!i)return;s.innerHTML=vtxt(i)+(isNew(i)?'<em>'+T.nw+'</em>':'');s.classList.toggle('new',isNew(i))});
    var sk=root.dataset.skin==='camellia'?1:root.dataset.skin==='lilac'?2:0;
    [].forEach.call(document.querySelectorAll('[data-fsk]'),function(a){var i=by[a.dataset.fsk.split('|')[sk]];if(i)a.setAttribute('href','files/'+i[l])});
    [].forEach.call(document.querySelectorAll('[data-hsk]'),function(p){p.dataset.has=p.dataset.hsk.split('|')[sk]});
    var nw=document.getElementById('news');if(nw){var fresh=F.items.filter(function(i){return isNew(i)&&!i.has&&i.ver}),last=fresh.length?fresh[0].date:'';
      nw.innerHTML='<span class="news-d">'+last.slice(0,5)+'</span><span class="news-t">'+(l==='ru'?'обновлено: ':'updated: ')+fresh.slice(0,3).map(short).join(' · ')+(fresh.length>3?' '+(l==='ru'?'и ещё ':'and ')+(fresh.length-3):'')+'</span><span class="news-a">→</span>'}
    [].forEach.call(document.querySelectorAll('[data-has]'),function(p){var i=by[p.dataset.has];if(!i)return;p.innerHTML=T.inside+': '+i.has.map(function(k){var m=by[k];return '<span class="'+(isNew(m)?'new':'')+'">'+short(m)+'</span>'}).join(' · ')});
    var box=document.getElementById('vers');if(!box)return;
    var n=F.items.filter(function(i){return isNew(i)&&!i.has}).length,last=F.items.filter(function(i){return dn(i.date)===top})[0].date;
    var h='<p class="vers-top">'+T.last+': <b>'+last+'</b> · '+T.cnt+': <b>'+n+'</b></p>',groups=[];
    F.items.forEach(function(i){if(groups.indexOf(i.group)<0)groups.push(i.group)});
    groups.forEach(function(g){h+='<div class="vg"><h4>'+T.g[g]+'</h4>';
      F.items.filter(function(i){return i.group===g}).forEach(function(i){
        var note=i.has?T.inside+': '+i.has.map(function(k){return short(by[k])}).join(' · '):(i.note?i.note[l]:'');
        h+='<div class="vr'+(isNew(i)?' new':'')+'"><div class="vr-m"><b>'+i.name[l]+'</b><small>'+note+'</small><code>'+i[l]+'</code></div>'+
           '<div class="vr-s">'+(i.ver?'<span class="vr-v">v'+i.ver+'</span>':'')+'<span class="vr-d">'+(isNew(i)?'<em>'+T.nw+'</em>':T.up)+' '+i.date+'</span></div>'+
           '<a class="vr-dl" href="files/'+i[l]+'" download aria-label="'+T.dl+'">↓</a></div>'});
      h+='</div>'});
    box.innerHTML=h};

  /* ── язык: английский в разметке, русский из JW_RU ── */
  var tr=[].slice.call(document.querySelectorAll('[data-i18n]')),EN={};
  tr.forEach(function(el){EN[el.dataset.i18n]=el.innerHTML});
  var lbtn=[].slice.call(document.querySelectorAll('.lang button'));
  function setLang(l){var d=l==='ru'?(window.JW_RU||{}):EN;root.lang=l;
    tr.forEach(function(el){var k=el.dataset.i18n;if(d[k]!=null)el.innerHTML=d[k]});
    lbtn.forEach(function(b){b.classList.toggle('on',b.dataset.lang===l)});
    document.title=l==='ru'?'JooWoo ✧ для Tavo':'JooWoo ✧ for Tavo';jwSwap();jwFiles();if(window.jwTlLab)jwTlLab();try{localStorage.setItem('jw-lang',l)}catch(e){}}
  lbtn.forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang)})});
  setLang(root.lang==='ru'?'ru':'en');


  /* ── обновления: свежие сверху, старые свёрнуты ── */
  (function(){var ol=document.querySelector('.timeline');if(!ol)return;var lis=[].slice.call(ol.children),k=3;if(lis.length<=k)return;
    lis.slice(k).forEach(function(li){li.classList.add('old')});
    var b=document.createElement('button');b.className='btn ghost tl-more';ol.parentNode.insertBefore(b,ol.nextSibling);
    function lab(){var ru=root.lang==='ru',o=ol.classList.contains('all');b.textContent=o?(ru?'Свернуть':'Show less'):(ru?'Ранние обновления · ':'Earlier updates · ')+(o?'':lis.length-k)}
    b.addEventListener('click',function(){ol.classList.toggle('all');lab()});lab();window.jwTlLab=lab})();

  /* ── меню на телефоне ── */
  var nav=document.getElementById('nav'),bur=document.getElementById('burger');
  bur.addEventListener('click',function(){var o=nav.classList.toggle('open');bur.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');bur.setAttribute('aria-expanded',false)}});

  /* ── ленты скринов ── */
  [].forEach.call(document.querySelectorAll('.strip-wrap'),function(w){
    var s=w.querySelector('.strip'),pv=w.querySelector('.prev'),nx=w.querySelector('.next');
    function st(){pv.disabled=s.scrollLeft<8;nx.disabled=s.scrollLeft+s.clientWidth>=s.scrollWidth-8}
    pv.addEventListener('click',function(){s.scrollBy({left:-s.clientWidth*.8,behavior:'smooth'})});
    nx.addEventListener('click',function(){s.scrollBy({left:s.clientWidth*.8,behavior:'smooth'})});
    s.addEventListener('scroll',st,{passive:true});addEventListener('resize',st);[].forEach.call(s.querySelectorAll('img'),function(im){im.addEventListener('load',st)});st();
  });

  /* ── лайтбокс ── */
  var lb=document.getElementById('lightbox'),lbi=lb.querySelector('img');
  document.addEventListener('click',function(e){var im=e.target.closest('.strip img,.gallery img,.guide-img img,.upd-gal img');if(im){lbi.src=im.src;lbi.alt=im.alt;lb.hidden=false}});
  lb.addEventListener('click',function(e){if(e.target!==lbi)lb.hidden=true});
  addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true});

  /* ── появление блоков и активный пункт меню ── */
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12});
  [].forEach.call(document.querySelectorAll('.reveal'),function(el){io.observe(el)});
  var links=[].slice.call(nav.querySelectorAll('a'));
  var so=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  [].forEach.call(document.querySelectorAll('section[id]'),function(s){so.observe(s)});

  /* ── копировать параметры API ── */
  [].forEach.call(document.querySelectorAll('.st-copy'),function(b){b.addEventListener('click',function(){var t=document.getElementById('st-json').textContent,done=function(){var o=b.innerHTML;b.textContent=root.lang==='ru'?'Скопировано':'Copied';setTimeout(function(){b.innerHTML=o},1600)};
    if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,function(){});else{var r=document.createRange();r.selectNodeContents(document.getElementById('st-json'));var s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy');done()}catch(e){}}})});

  /* ── кнопка наверх ── */
  var up=document.querySelector('.up');addEventListener('scroll',function(){up.classList.toggle('show',(window.scrollY||document.documentElement.scrollTop)>700)},{passive:true});
  function toTop(e){e.preventDefault();var sm=!matchMedia('(prefers-reduced-motion: reduce)').matches;try{window.scrollTo({top:0,behavior:sm?'smooth':'auto'})}catch(_){window.scrollTo(0,0)}if(history.replaceState)history.replaceState(null,'',location.pathname+location.search)}
  up.addEventListener('click',toTop);[].forEach.call(document.querySelectorAll('.logo'),function(l){l.addEventListener('click',toTop)});
})();
