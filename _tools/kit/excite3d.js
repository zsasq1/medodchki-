/* Excite3D — 3D-сердце с проводящей системой и волной возбуждения, синхронной с ЭКГ.
   Нужны (тегами script до этого файла): three.js r128 (cdnjs), GLTFLoader и OrbitControls из three@0.128.0/examples/js (jsdelivr).
   Разметка: <figure class="ex3d" id="…"><div class="figbar">…</div><div class="ex-3d"></div><svg class="ex-ecg"></svg>
     <div class="ex-ctrl"></div><p class="phase" aria-live="polite"></p><div class="ex-ph"></div><figcaption>…</figcaption></figure>
   Excite3D(fig,{src:'3d/heart.glb.txt', cond:{…из cond.json…}, phases:[{t0,t1,key,label}]})
   Модель времени: один цикл 0,8 с (ЧСС ≈ 75 в мин). Активация стенок считается по расстоянию до синусового узла (предсердия)
   и до концов волокон Пуркинье (желудочки) — это учебная схема, не расчёт по реальной электрофизиологии. */
(function(){
const gs=(x,s)=>Math.exp(-x*x/(2*s*s)),sm=(x,a,b)=>{const k=Math.min(1,Math.max(0,(x-a)/(b-a)));return k*k*(3-2*k)};
const W=t=>.15*gs(t-.05,.018)-.1*gs(t-.175,.006)+gs(t-.20,.009)-.25*gs(t-.225,.008)+.3*gs(t-.42,.04);
const CYC=.8;
function Excite3D(fig,opt){
  const box=fig.querySelector('.ex-3d'),svg=fig.querySelector('.ex-ecg'),ctrl=fig.querySelector('.ex-ctrl'),ph=fig.querySelector('.phase'),phb=fig.querySelector('.ex-ph');
  const P=opt.phases,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ЭКГ-полоса */
  const X=t=>20+t/CYC*560,Y=v=>92-v*70;let d='';for(let t=0;t<=CYC+1e-9;t+=.002)d+=(d?'L':'M')+X(t).toFixed(1)+' '+Y(W(t)).toFixed(1);
  svg.setAttribute('viewBox','0 0 600 150');
  svg.innerHTML=`<g class="ex-bands">${P.filter(p=>p.band).map(p=>`<rect data-k="${p.key}" x="${X(p.t0)}" y="8" width="${X(p.t1)-X(p.t0)}" height="112" rx="3"/><text x="${(X(p.t0)+X(p.t1))/2}" y="140" text-anchor="middle">${p.band}</text>`).join('')}</g>
    <line x1="20" x2="580" y1="${Y(0)}" y2="${Y(0)}" class="ex-iso"/><path d="${d}" class="ex-wave"/><path class="ex-done" d=""/>
    <line class="ex-cur" x1="20" x2="20" y1="6" y2="122"/><circle class="ex-dot" r="5" cx="20" cy="${Y(0)}"/>`;
  const done=svg.querySelector('.ex-done'),cur=svg.querySelector('.ex-cur'),dot=svg.querySelector('.ex-dot'),bands=[...svg.querySelectorAll('.ex-bands rect')];
  /* кнопки */
  ctrl.innerHTML=`<button type="button" data-a="play" aria-label="Пуск">▶</button>
   <label>скорость <select data-a="spd"><option value=".05">×0,05</option><option value=".15" selected>×0,15</option><option value=".5">×0,5</option><option value="1">×1 (реально)</option></select></label>
   <input type="range" min="0" max="800" step="1" value="0" data-a="t" aria-label="Момент цикла, мс"><span class="ex-ms">0 мс</span>
   <label><input type="checkbox" data-a="lab" checked> подписи</label>`;
  phb.innerHTML=P.map((p,i)=>`<button type="button" data-i="${i}">${p.short}</button>`).join('');
  const pb=ctrl.querySelector('[data-a=play]'),rng=ctrl.querySelector('[data-a=t]'),ms=ctrl.querySelector('.ex-ms'),spdS=ctrl.querySelector('[data-a=spd]'),labC=ctrl.querySelector('[data-a=lab]');
  let pend=false,tau=RM?.20:0,playing=false,spd=.15,visible=false,user=false,curPh=-1,last=0;
  /* 3D */
  if(!window.THREE||!THREE.GLTFLoader||!THREE.OrbitControls){box.innerHTML='<p class="v3d-msg">3D-модель не загрузилась: нет доступа к библиотеке three.js. ЭКГ и подписи фаз работают.</p>'}
  let gl=null;try{if(window.THREE)gl=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){box.innerHTML='<p class="v3d-msg">Это устройство не поддерживает WebGL, 3D-модель недоступна.</p>'}
  let scene,cam,ctl,walls=[],sparks=[],tubes=[],nodes=[],labEls=[],ready=false;
  const lab=document.createElement('div');lab.className='v3d-labels';
  if(gl){
    gl.outputEncoding=THREE.sRGBEncoding;gl.setPixelRatio(Math.min(devicePixelRatio,2));box.appendChild(gl.domElement);box.appendChild(lab);
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(30,1,.002,20);
    scene.add(new THREE.HemisphereLight(0xfff6ee,0x4a3a3a,1.0));const dl=new THREE.DirectionalLight(0xffffff,.6);dl.position.set(.4,.8,1);cam.add(dl);scene.add(cam);
    ctl=new THREE.OrbitControls(cam,gl.domElement);ctl.enableDamping=true;ctl.dampingFactor=.12;ctl.enablePan=false;ctl.addEventListener('change',req);
    const size=()=>{const w=box.clientWidth,h=Math.round(Math.min(w*.85,innerHeight*.62,600));gl.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();req()};
    new ResizeObserver(size).observe(box);size();
    box.classList.add('loading');
    fetch(opt.src).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{const b=atob(t.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
      new THREE.GLTFLoader().parse(u.buffer,'',build,fail)}).catch(fail);
  }
  function fail(){box.classList.remove('loading');box.innerHTML='<p class="v3d-msg">Не удалось загрузить 3D-модель.</p>'}
  const C=opt.cond,v3=a=>new THREE.Vector3(a[0],a[1],a[2]);
  function build(g){
    const root=g.scene;scene.add(root);root.updateMatrixWorld(true);
    const SA=v3(C.SA),srcV=[];C.pk.forEach(p=>{const q=p[p.length-1];srcV.push([v3(q),q[3]])});
    Object.values(C.paths).forEach(p=>{const q=p[p.length-1];srcV.push([v3(q),q[3]])});srcV.push([v3(C.septL),.165]);(C.pkSrc||[]).forEach(q=>srcV.push([v3(q),q[3]]));
    const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});
    meshes.forEach(o=>{const ud=Object.keys(o.userData||{}).length?o.userData:(o.parent&&o.parent.userData)||{};const n=[ud.ru,ud.en,o.name,o.parent&&o.parent.name].filter(Boolean).join(' ').replace(/_/g,' ');
      const atr=/стенка (правого|левого) предсерд|wall of (right|left) atrium/i.test(n),ven=/стенки желудочков|wall of ventricle/i.test(n);
      if(atr||ven){/* стенки: цвет по вершинам */
        const geo=o.geometry.clone();o.geometry=geo;if(!geo.attributes.normal)geo.computeVertexNormals();
        const pos=geo.attributes.position,N=pos.count,ta=new Float32Array(N),tr=new Float32Array(N),col=new Float32Array(N*3),v=new THREE.Vector3();
        const wp=[];for(let i=0;i<N;i++){v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);wp.push(v.clone())}
        if(atr){wp.forEach((p,i)=>{ta[i]=p.distanceTo(SA)})}
        else{/* желудочки: время = min(t_k + d/скорость), скорость подобрана так, чтобы всё закончилось к 0,245 с (QRS 0,08 с) */
          const dist=wp.map(p=>srcV.map(([q,t])=>[p.distanceTo(q),t]));
          let lo=.05,hi=20;for(let it=0;it<40;it++){const cv=(lo+hi)/2;let mx=0;dist.forEach(a=>{let m=1e9;a.forEach(([dd,t])=>{m=Math.min(m,t+dd/cv)});mx=Math.max(mx,m)});if(mx>.245)lo=cv;else hi=cv}
          const cv=hi;dist.forEach((a,i)=>{let m=1e9;a.forEach(([dd,t])=>{m=Math.min(m,t+dd/cv)});ta[i]=m})}
        o.userData.kind=atr?'a':'v';o.userData.ta=ta;o.userData.tr=tr;o.userData.col=col;
        geo.setAttribute('color',new THREE.BufferAttribute(col,3));
        o.material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,metalness:0,transparent:true,opacity:.5,depthWrite:false,side:THREE.DoubleSide});
        o.renderOrder=2;walls.push(o)}
      else{const big=/аорт|лёгочн|полая|вена|синус/i.test(n)&&!/створк|заслонк/i.test(n);
        if(/коронарн|ветвь|вена сердца|ЛКА|ПКА|coronary|cardiac vein|branch/i.test(n)&&!/полая|лёгочн|pulmonary|cava/i.test(n)){o.visible=false;return}
        o.material=new THREE.MeshStandardMaterial({color:big?0xb9c3d6:0xe8d8c8,transparent:true,opacity:big?.18:.28,depthWrite:false,roughness:.7});o.renderOrder=1}});
    /* предсердия: нормируем время так, чтобы P закончился к 0,095 с (P ≤ 0,10 с) */
    let amx=0;walls.filter(o=>o.userData.kind==='a').forEach(o=>o.userData.ta.forEach(x=>{amx=Math.max(amx,x)}));
    walls.forEach(o=>{const {ta,tr}=o.userData;for(let i=0;i<ta.length;i++){if(o.userData.kind==='a'){ta[i]=.008+ta[i]/amx*.087;tr[i]=ta[i]+.15}else{tr[i]=.47-(ta[i]-.165)*1.0}}});
    /* проводящая система */
    const mkTube=(pts,r,col)=>{const cu=new THREE.CatmullRomCurve3(pts.map(v3));const m=new THREE.Mesh(new THREE.TubeGeometry(cu,Math.max(8,pts.length*10),r,8,false),
        new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true,opacity:.95}));m.renderOrder=10;scene.add(m);return{m,cu}};
    const spark=()=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.0026,16,12),new THREE.MeshBasicMaterial({color:0xffffff,depthTest:false}));s.renderOrder=12;s.visible=false;scene.add(s);return s};
    Object.entries(C.paths).forEach(([k,p])=>{const tb=mkTube(p,.0013,0x9a7a10);tubes.push({...tb,t0:p[0][3],t1:p[p.length-1][3],k,s:spark()})});
    C.pk.forEach(p=>{const tb=mkTube(p,.0006,0x9a7a10);tubes.push({...tb,t0:p[0][3],t1:p[p.length-1][3],k:'pk',s:null})});
    const ball=(p,r,col)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),new THREE.MeshBasicMaterial({color:col,depthTest:false}));m.position.copy(v3(p));m.renderOrder=11;scene.add(m);return m};
    nodes=[ball(C.SA,.0042,0xd8342c),ball(C.AV,.0038,0xd8342c)];
    labEls=[['синусовый узел',v3(C.SA)],['AV-узел',v3(C.AV)],['пучок Гиса',v3(C.paths.his[1])],['левая ножка',v3(C.paths.lb[2])],['правая ножка',v3(C.paths.rb[2])],['волокна Пуркинье',v3(C.pk[C.pk.length>10?10:0][2])]];
    /* камера */
    const b=new THREE.Box3();walls.forEach(o=>b.expandByObject(o));const c=b.getCenter(new THREE.Vector3()),r=b.getSize(new THREE.Vector3()).length()/2;
    ctl.target.copy(c);cam.position.copy(c.clone().add(new THREE.Vector3(.25,.05,1).normalize().multiplyScalar(r/Math.sin(THREE.MathUtils.degToRad(15))*.82)));
    box.classList.remove('loading');ready=true;paint();req()}
  const REST=[.78,.42,.42],DEP=[1,.66,.12],FRONT=[1,1,.72];
  function paint(){if(!ready)return;const t=tau;
    walls.forEach(o=>{const {ta,tr,col}=o.userData;for(let i=0;i<ta.length;i++){let c;const a=ta[i],r=tr[i];
        if(t<a||t>r+.04)c=REST;else if(t<a+.014)c=FRONT;else if(t<r)c=DEP;else{const k=(t-r)/.04;c=[DEP[0]+(REST[0]-DEP[0])*k,DEP[1]+(REST[1]-DEP[1])*k,DEP[2]+(REST[2]-DEP[2])*k]}
        col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}o.geometry.attributes.color.needsUpdate=true});
    tubes.forEach(T=>{const on=t>=T.t0&&t<=.47;T.m.material.color.setHex(on?(t<=T.t1+.01?0xfff2a0:0xf0b400):0x9a7a10);
      if(T.s){const act=t>=T.t0&&t<=T.t1;T.s.visible=act;if(act)T.s.position.copy(T.cu.getPoint((t-T.t0)/(T.t1-T.t0||1)))}});
    nodes[0].material.color.setHex(t<.02?0xffffff:0xd8342c);nodes[1].material.color.setHex(t>.045&&t<.125?0xffffff:0xd8342c);
    /* AV-задержка: искра в узле пульсирует */
    nodes[1].scale.setScalar(t>.045&&t<.125?1+.35*Math.sin(t*120)**2:1)}
  function labels(){if(!ready||!labC.checked){lab.innerHTML='';return}const Wd=gl.domElement.clientWidth,Hd=gl.domElement.clientHeight,pl=[];let h='';
    labEls.forEach(([s,p])=>{const q=p.clone().project(cam);if(q.z>1)return;const x0=(q.x+1)/2*Wd,y0=(1-q.y)/2*Hd;const opts=[[x0,y0-16],[x0,y0+16],[x0+60,y0],[x0-60,y0]];const o=opts.find(([x,y])=>!pl.some(([a,b])=>Math.abs(a-x)<74&&Math.abs(b-y)<20));if(!o)return;const [x,y]=o;pl.push([x,y]);
      h+=`<span style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px">${s}</span>`});lab.innerHTML=h}
  function req(){if(!pend&&gl){pend=true;requestAnimationFrame(draw)}}
  function draw(){pend=false;const mv=ctl.update();gl.render(scene,cam);labels();if(mv)req()}
  /* время */
  function show(){const t=tau;const x=X(t);cur.setAttribute('x1',x);cur.setAttribute('x2',x);dot.setAttribute('cx',x);dot.setAttribute('cy',Y(W(t)));
    let dd='';for(let s=0;s<=t+1e-9;s+=.002)dd+=(dd?'L':'M')+X(s).toFixed(1)+' '+Y(W(s)).toFixed(1);done.setAttribute('d',dd);
    rng.value=Math.round(t*1000);ms.textContent=Math.round(t*1000)+' мс';
    let i=P.findIndex(p=>t>=p.t0&&t<p.t1);if(i<0)i=P.length-1;
    if(i!==curPh){curPh=i;ph.innerHTML=P[i].label;[...phb.children].forEach((b,k)=>b.classList.toggle('on',k===i));bands.forEach(r=>r.classList.toggle('on',r.dataset.k===P[i].key))}
    paint();req()}
  function loop(now){if(!playing)return;const dt=Math.min(.05,(now-last)/1000);last=now;tau=(tau+dt*spd)%CYC;show();requestAnimationFrame(loop)}
  const setPlay=p=>{playing=p;pb.textContent=p?'❚❚':'▶';pb.setAttribute('aria-label',p?'Пауза':'Пуск');if(p){last=performance.now();requestAnimationFrame(loop)}};
  pb.addEventListener('click',()=>{user=!playing?false:true;setPlay(!playing)});
  spdS.addEventListener('change',()=>{spd=+spdS.value});
  rng.addEventListener('input',()=>{user=true;setPlay(false);tau=rng.value/1000;show()});
  labC.addEventListener('change',req);
  phb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const p=P[+b.dataset.i];user=true;setPlay(false);tau=p.at??(p.t0+p.t1)/2;show()});
  new IntersectionObserver(es=>es.forEach(en=>{visible=en.isIntersecting;if(visible){if(!user&&!RM&&!playing)setPlay(true)}else if(playing)setPlay(false)}),{threshold:.25}).observe(fig);
  show();
  return{seek(t){tau=t;show()}};
}
window.Excite3D=Excite3D;
})();
