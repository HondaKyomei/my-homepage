// nanoFACTORY site.js — トップページ用（メニュー・業種タブ・年表示などは既存 script.js が担当）

/* Hero：関数で定義した3D流体サーフェス＋表面を流れる粒子＋浮遊する塵 */
(function(){
  const cv = document.getElementById('hero-flow'); if(!cv) return;
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W=0,H=0,dpr=1,run=true,T=0,last=0,COLS=130,ROWS=56,NP=300,ND=140;
  const LV = 12, XR = 2.6, ZR = 3.2;
  let parts = [], dust = [];
  const rnd = (a,b)=>a+Math.random()*(b-a);

  function size(){
    const r = cv.getBoundingClientRect(); dpr = Math.min(devicePixelRatio||1,1.5);
    W = r.width; H = r.height; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const small = W < 700;
    COLS = small ? 70 : 130; ROWS = small ? 36 : 56; NP = small ? 120 : 300; ND = small ? 60 : 140;
    parts = Array.from({length:NP}, ()=>({x:rnd(-XR,XR), z:rnd(0,ZR), life:rnd(0,1), px:null, py:null}));
    dust  = Array.from({length:ND}, ()=>({x:rnd(-XR,XR), y:rnd(0.15,1.1), z:rnd(0,ZR), s:rnd(.4,1.3)}));
  }

  // 高さ関数：向きが回転する方向波の重ね合わせ（ドメインワープ付き）＋漂う2つの波紋
  const WAVES = [[0.17,1.6,0.9,0.0],[0.11,2.3,-1.1,1.9],[0.07,3.7,1.4,3.6],[0.035,6.1,-1.9,5.1],[0.02,9.4,2.3,0.7]];
  function height(X,Z,t){
    const wx = X + 0.36*Math.sin(Z*1.9 + t*0.5) + 0.1*Math.sin(Z*4.3 - t*0.8);
    const wz = Z + 0.30*Math.sin(X*1.7 - t*0.42) + 0.08*Math.sin(X*3.9 + t*0.6);
    let h = 0;
    for(const [a,k,w,ph] of WAVES){
      const ang = ph + t*0.045*w;                       // 波の進行方向がゆっくり回る
      h += a*Math.sin((wx*Math.cos(ang) + wz*Math.sin(ang))*k + t*w);
    }
    h += 0.1*Math.sin(wx*1.1 + t*0.35)*Math.cos(wz*0.9 - t*0.27);   // 大きなうねり
    const s1x = 0.9*Math.sin(t*0.13), s1z = 1.6 + 0.9*Math.sin(t*0.17+1);
    const s2x = -1.2 + 0.7*Math.cos(t*0.11), s2z = 1.1 + 0.6*Math.cos(t*0.19);
    const r1 = Math.hypot(X-s1x, Z-s1z), r2 = Math.hypot(X-s2x, Z-s2z);
    h += 0.10*Math.exp(-r1*r1*0.8)*Math.sin(r1*7.5 - t*2.3);
    h += 0.07*Math.exp(-r2*r2*1.1)*Math.sin(r2*9.0 - t*2.8);
    return h;
  }
  // 表面上の流れ場（高さ関数の勾配に直交する向き＋ゆるい渦）
  function flow(X,Z,t){
    const e = 0.03, h0 = height(X,Z,t);
    const gx = (height(X+e,Z,t)-h0)/e, gz = (height(X,Z+e,t)-h0)/e;
    const a = 0.8*Math.sin(Z*1.3 + t*0.2) + 0.6*Math.cos(X*1.1 - t*0.15);
    return [-gz*0.35 + 0.22*Math.cos(a), gx*0.35 + 0.22*Math.sin(a) - 0.05];
  }

  let cam;
  function setCam(t){
    const yaw = -0.42 + 0.28*Math.sin(t*0.07) + 0.06*Math.sin(t*0.19);
    const pitch = 0.36 + 0.05*Math.sin(t*0.05);
    cam = {cy:Math.cos(yaw), sy:Math.sin(yaw), cp:Math.cos(pitch), sp:Math.sin(pitch),
           dist: 2.3 + 0.28*Math.sin(t*0.09),            // ゆっくり寄ったり引いたり
           f: Math.max(W,H)*0.8, cx: W*0.64, cyS: H*0.84};
  }
  function proj(X,Y,Z){
    const xr = X*cam.cy - (Z-1.6)*cam.sy, zr = X*cam.sy + (Z-1.6)*cam.cy + 1.6;
    const py = Y*1.35 - 0.8, pz = zr + cam.dist;
    const y2 = py*cam.cp + pz*cam.sp, z2 = -py*cam.sp + pz*cam.cp;
    const k = cam.f/Math.max(z2,0.2);
    return [cam.cx + xr*k, cam.cyS - y2*k, z2];
  }

  function draw(dt){
    ctx.clearRect(0,0,W,H);
    setCam(T);
    // 1) サーフェス
    const P = new Array(ROWS);
    for(let j=0;j<ROWS;j++){
      const v = j/(ROWS-1), Z = v*ZR, row = new Array(COLS);
      for(let i=0;i<COLS;i++){
        const X = (i/(COLS-1)*2-1)*XR, h = height(X,Z,T), q = proj(X,h,Z);
        const b = Math.min(1, Math.max(0, (h+0.34)/0.66)), fog = Math.max(0, 1 - v*0.9);
        row[i] = [q[0], q[1], Math.min(LV-1, Math.floor((0.1+0.9*b*b)*fog*LV)), h, fog, v<0.3?1:0];
      }
      P[j] = row;
    }
    const paths = Array.from({length:LV*2},()=>new Path2D());
    const seg = (a,b)=>{ const L = Math.min(a[2],b[2]) + (a[5]&&b[5]?LV:0); paths[L].moveTo(a[0],a[1]); paths[L].lineTo(b[0],b[1]); };
    for(let j=0;j<ROWS;j++) for(let i=1;i<COLS;i++) seg(P[j][i-1],P[j][i]);
    for(let i=0;i<COLS;i+=4) for(let j=1;j<ROWS;j++) seg(P[j-1][i],P[j][i]);
    for(let n=0;n<2;n++){
      ctx.lineWidth = n ? 1.05 : 0.7;                    // 手前ほど太く
      for(let L=1;L<LV;L++){ ctx.strokeStyle = `rgba(98,182,198,${(0.03+0.48*L/LV).toFixed(3)})`; ctx.stroke(paths[L+n*LV]); }
    }
    // 2) 表面を流れる粒子（短い軌跡つき）
    ctx.lineCap = 'round';
    for(const p of parts){
      const [vx,vz] = flow(p.x,p.z,T);
      p.x += vx*dt; p.z += vz*dt; p.life += dt*0.12;
      if(p.life>1 || p.x<-XR || p.x>XR || p.z<0 || p.z>ZR){ p.x=rnd(-XR,XR); p.z=rnd(0,ZR); p.life=0; p.px=null; continue; }
      const h = height(p.x,p.z,T), q = proj(p.x,h+0.015,p.z);
      const fog = Math.max(0, 1 - p.z/ZR*0.95), fade = Math.sin(p.life*Math.PI);
      if(p.px!==null){
        const crest = h>0.2;
        ctx.strokeStyle = crest ? `rgba(214,145,60,${(0.85*fog*fade).toFixed(3)})` : `rgba(190,235,244,${(0.7*fog*fade).toFixed(3)})`;
        ctx.lineWidth = 0.6 + 1.4*fog;
        ctx.beginPath(); ctx.moveTo(p.px,p.py); ctx.lineTo(q[0],q[1]); ctx.stroke();
      }
      p.px = q[0]; p.py = q[1];
    }
    // 3) 空間に浮遊する塵（視差で奥行きを出す）
    for(const d of dust){
      d.x += Math.sin(T*0.3 + d.z*2)*0.02*dt; d.y += Math.cos(T*0.25 + d.x)*0.015*dt;
      const q = proj(d.x,d.y,d.z), fog = Math.max(0, 1 - d.z/ZR*0.9);
      ctx.fillStyle = `rgba(200,230,238,${(0.35*fog).toFixed(3)})`;
      const r = d.s*(0.6+fog); ctx.fillRect(q[0]-r/2, q[1]-r/2, r, r);
    }
  }
  function loop(ts){
    if(!run) return;
    const dt = last ? Math.min((ts-last)/1000,.05) : 0; last = ts;
    T += dt*0.55; draw(dt*0.55); requestAnimationFrame(loop);
  }
  size(); T = 6.0;
  for(let k=0;k<40;k++){ T += 0.02; draw(0.02); }        // 静止画でも粒子の軌跡が見えるよう少し進めておく
  addEventListener('resize', ()=>{ size(); draw(0); });
  if(still) return;
  new IntersectionObserver(es=>{ es.forEach(e=>{ run = e.isIntersecting; if(run){ last=0; requestAnimationFrame(loop);} }); }).observe(cv);
})();

/* スライドショー共通：[data-slideshow] 内の .ss-slide を自動で切り替える
   - .ss-bar i が進捗バー兼ボタン（クリックでその枚へ）
   - ホバー中・画面外では一時停止。data-interval でミリ秒指定（既定5000）
   - リンク内に置いてもバーのクリックでページ遷移しない */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-slideshow]').forEach(function(el){
    var slides = el.querySelectorAll('.ss-slide');
    var bars = el.querySelectorAll('.ss-bar i');
    var num = el.querySelector('.ss-count b');
    if(slides.length < 2) return;
    var dur = +(el.dataset.interval || 5000), n = 0, timer = null, left = dur, t0 = 0, hover = false, inView = false;
    el.style.setProperty('--ss-dur', dur + 'ms');
    var label = el.querySelector('.ss-label');
    function slideDur(k){ return +(slides[k].dataset.dur || dur); }
    function show(i){
      n = (i + slides.length) % slides.length;
      slides.forEach(function(s,j){
        s.classList.toggle('is-active', j===n); s.setAttribute('aria-hidden', j===n ? 'false' : 'true');
        var v = s.querySelector('video');                 // 動画スライドは表示中だけ頭から再生
        if(v){ if(j===n){ try{ v.currentTime = 0; }catch(e){} var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); } else { v.pause(); } }
      });
      el.style.setProperty('--ss-dur', slideDur(n) + 'ms');
      bars.forEach(function(b,j){ b.className = j<n ? 'done' : ''; });
      if(bars[n]){ void bars[n].offsetWidth; bars[n].className = 'on'; }
      if(num) num.textContent = String(n+1).padStart(2,'0');
      if(label) label.textContent = slides[n].dataset.label || '';
      left = slideDur(n); schedule();
    }
    function schedule(){
      clearTimeout(timer); timer = null;
      var paused = reduce || hover || !inView;
      el.classList.toggle('is-paused', paused);
      if(paused) return;
      t0 = performance.now();
      timer = setTimeout(function(){ show(n+1); }, left);
    }
    function pause(){ if(timer){ left -= performance.now() - t0; } schedule(); vids(false); }
    function vids(play){ var v = slides[n] && slides[n].querySelector('video'); if(!v) return; if(play){ var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); } else v.pause(); }
    bars.forEach(function(b,j){
      b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); show(j); });
    });
    el.addEventListener('mouseenter', function(){ hover = true; pause(); });
    el.addEventListener('mouseleave', function(){ hover = false; schedule(); if(inView) vids(true); });
    new IntersectionObserver(function(es){
      es.forEach(function(e){ var was = inView; inView = e.isIntersecting; if(was !== inView){ if(inView){ schedule(); if(!hover) vids(true); } else pause(); } });
    }, {threshold:.25}).observe(el);
    show(0);
  });
})();

/* 比較グラフのタブ：[data-cmp] 内の button[data-j] と .cmp__panel */
(function(){
  document.querySelectorAll('[data-cmp]').forEach(function(el){
    var tabs = el.querySelectorAll('.cmp__tabs button');
    var panels = el.querySelectorAll('.cmp__panel');
    tabs.forEach(function(t){
      t.addEventListener('click', function(){
        var j = +t.dataset.j;
        tabs.forEach(function(b,k){ b.setAttribute('aria-selected', k===j); });
        panels.forEach(function(p,k){ p.classList.toggle('is-active', k===j); });
      });
    });
  });
})();

/* 業種タブの aria-selected を is-active に追従させる（切替本体は script.js） */
(function(){
  var tabs = document.querySelectorAll('.hero-tab[data-industry-tab]');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(b){ b.setAttribute('aria-selected', b===t); });
    });
  });
})();
