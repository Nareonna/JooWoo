/* JooWoo · сайт: оформление, небо, карусели, лайтбокс, появление блоков */
(function(){
  var root=document.documentElement;

  /* ── переключатель оформления ── */
  var btns=[].slice.call(document.querySelectorAll('.skin button,.door'));
  function setSkin(s){root.dataset.skin=s;if(window.jwSwap)jwSwap();btns.forEach(function(b){b.classList.toggle('on',b.dataset.set===s)});try{localStorage.setItem('jw-skin',s)}catch(e){}sky.reset()}
  btns.forEach(function(b){b.addEventListener('click',function(){setSkin(b.dataset.set)})});

  /* ── небо: звёзды (midnight) или лепестки и блики (camellia) ── */
  var sky=(function(){
    var c=document.getElementById('sky'),x=c.getContext('2d'),W,H,dpr,parts=[],reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    function size(){dpr=Math.min(2,window.devicePixelRatio||1);W=c.width=innerWidth*dpr;H=c.height=innerHeight*dpr}
    function make(){var cam=root.dataset.skin==='camellia',n=Math.round(Math.min(110,innerWidth/12));parts=[];
      for(var i=0;i<n;i++){var petal=cam&&i%4===0;parts.push({x:Math.random()*W,y:Math.random()*H,r:(petal?3+Math.random()*3:.5+Math.random()*1.4)*dpr,
        s:.2+Math.random()*.8,t:Math.random()*6.28,petal:petal,vx:(Math.random()-.5)*.15*dpr,vy:(cam?.12+Math.random()*.2:.02)*dpr,rot:Math.random()*6.28})}}
    function draw(){x.clearRect(0,0,W,H);var cam=root.dataset.skin==='camellia';
      parts.forEach(function(p){p.t+=.012*p.s;var a=.25+.55*(.5+.5*Math.sin(p.t));
        if(!reduce){p.x+=p.vx;p.y+=p.vy;p.rot+=.004;if(p.y>H+10){p.y=-10;p.x=Math.random()*W}if(p.x<-10)p.x=W+10;if(p.x>W+10)p.x=-10}
        if(p.petal){x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.globalAlpha=a*.55;x.fillStyle='#d6aab6';x.beginPath();x.ellipse(0,0,p.r*1.6,p.r*.75,0,0,6.28);x.fill();x.restore();}
        else{x.globalAlpha=a;x.fillStyle=cam?'#dfe8ef':(p.s>.75?'#ffd9a8':'#fff3e6');x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fill();
          if(p.r>1.6*dpr){x.globalAlpha=a*.25;x.beginPath();x.arc(p.x,p.y,p.r*3,0,6.28);x.fill()}}});
      x.globalAlpha=1;if(!reduce)requestAnimationFrame(draw)}
    size();make();draw();addEventListener('resize',function(){size();make();if(reduce)draw()});
    return {reset:function(){make();if(reduce)draw()}};
  })();
  setSkin(root.dataset.skin||'midnight');

  /* ── картинки и файлы под язык и тему: {L} — en/ru, {X} — '-en' или '', {S} — тема ── */
  window.jwSwap=function(){var l=root.lang==='ru'?'ru':'en',sk=root.dataset.skin||'midnight';
    [].forEach.call(document.querySelectorAll('[data-l],[data-l-en]'),function(el){
      var v=el.hasAttribute('data-l-en')?el.getAttribute('data-l-'+l):el.getAttribute('data-l').replace('{L}',l).replace('{X}',l==='en'?'-en':'').replace('{S}',sk==='camellia'?'camellia':'midnight');
      var at=el.tagName==='A'?'href':'src';if(el.getAttribute(at)!==v)el.setAttribute(at,v)})};

  /* ── язык: английский в разметке, русский из JW_RU ── */
  var tr=[].slice.call(document.querySelectorAll('[data-i18n]')),EN={};
  tr.forEach(function(el){EN[el.dataset.i18n]=el.innerHTML});
  var lbtn=[].slice.call(document.querySelectorAll('.lang button'));
  function setLang(l){var d=l==='ru'?(window.JW_RU||{}):EN;root.lang=l;
    tr.forEach(function(el){var k=el.dataset.i18n;if(d[k]!=null)el.innerHTML=d[k]});
    lbtn.forEach(function(b){b.classList.toggle('on',b.dataset.lang===l)});
    document.title=l==='ru'?'JooWoo ✧ для Tavo':'JooWoo ✧ for Tavo';jwSwap();try{localStorage.setItem('jw-lang',l)}catch(e){}}
  lbtn.forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.lang)})});
  setLang(root.lang==='ru'?'ru':'en');

  /* ── меню на телефоне ── */
  var nav=document.getElementById('nav'),bur=document.getElementById('burger');
  bur.addEventListener('click',function(){var o=nav.classList.toggle('open');bur.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');bur.setAttribute('aria-expanded',false)}});

  /* ── карусели ── */
  [].forEach.call(document.querySelectorAll('[data-carousel]'),function(car){
    var imgs=[].slice.call(car.querySelectorAll('img')),wrap=car.parentNode,dots=wrap.querySelector('.dots'),i=0,timer;
    imgs.forEach(function(_,k){var d=document.createElement('i');d.addEventListener('click',function(){go(k)});dots.appendChild(d)});
    function go(k){i=(k+imgs.length)%imgs.length;imgs.forEach(function(im,j){im.classList.toggle('on',j===i)});[].forEach.call(dots.children,function(d,j){d.classList.toggle('on',j===i)});clearInterval(timer);timer=setInterval(function(){go(i+1)},5500)}
    wrap.querySelector('.prev').addEventListener('click',function(){go(i-1)});
    wrap.querySelector('.next').addEventListener('click',function(){go(i+1)});
    var sx=null;car.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
    car.addEventListener('touchend',function(e){if(sx==null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));sx=null});
    go(0);
  });

  /* ── лайтбокс ── */
  var lb=document.getElementById('lightbox'),lbi=lb.querySelector('img');
  document.addEventListener('click',function(e){var im=e.target.closest('.carousel img,.gallery img,.guide-img img');if(im){lbi.src=im.src;lbi.alt=im.alt;lb.hidden=false}});
  lb.addEventListener('click',function(e){if(e.target!==lbi)lb.hidden=true});
  addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true});

  /* ── появление блоков и активный пункт меню ── */
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.12});
  [].forEach.call(document.querySelectorAll('.reveal'),function(el){io.observe(el)});
  var links=[].slice.call(nav.querySelectorAll('a'));
  var so=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)})})},{rootMargin:'-45% 0px -50% 0px'});
  [].forEach.call(document.querySelectorAll('section[id]'),function(s){so.observe(s)});

  /* ── кнопка наверх ── */
  var up=document.querySelector('.up');addEventListener('scroll',function(){up.classList.toggle('show',scrollY>700)},{passive:true});
})();
