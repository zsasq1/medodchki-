/* Viewer3D — анатомическая 3D-модель с экскурсией по шагам.
   Нужны (до этого скрипта):
   https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
   https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js
   https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js
   (подключаются тегами script src в этом порядке; внутри JS-кода нельзя писать закрывающий тег script)
   и движок Anim из kit.js (для экскурсии).
   Разметка: <figure class="anim v3d-fig" id="..."><div class="figbar">…</div><div class="v3d"></div><div class="v3d-groups"></div>
             <div class="ctrl" data-ctrl></div><p class="phase"></p><figcaption>…</figcaption></figure>
   Viewer3D(fig, {src:'3d/heart.glb.txt', view:'front', tour:[{label:'…', view:'front', hi:'регэксп по ru/en', ghost:'…', hide:'…'}]})
   Оси модели: +Y вверх, +Z — вперёд (к наблюдателю, стоящему лицом к пациенту), +X — левая сторона пациента. */
function Viewer3D(fig,opt){
  const box=fig.querySelector('.v3d');
  if(!window.THREE||!THREE.GLTFLoader||!THREE.OrbitControls){box.innerHTML='<p class="v3d-msg">3D-модель не загрузилась: нет доступа к библиотеке three.js.</p>';return}
  let gl;try{gl=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){box.innerHTML='<p class="v3d-msg">Это устройство не поддерживает WebGL, 3D-модель недоступна.</p>';return}
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  gl.outputEncoding=THREE.sRGBEncoding;gl.setPixelRatio(Math.min(devicePixelRatio,2));box.appendChild(gl.domElement);
  const lab=document.createElement('div');lab.className='v3d-labels';box.appendChild(lab);
  const pick=document.createElement('div');pick.className='v3d-pick';pick.textContent='Нажмите на структуру, чтобы узнать название. Вращайте пальцем или мышью.';box.appendChild(pick);
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1,0.002,20);
  scene.add(new THREE.HemisphereLight(0xfff6ee,0x4a3a3a,0.95));const dl=new THREE.DirectionalLight(0xffffff,0.75);dl.position.set(0.4,0.8,1);cam.add(dl);scene.add(cam);
  const ctl=new THREE.OrbitControls(cam,gl.domElement);ctl.enableDamping=true;ctl.dampingFactor=0.12;ctl.addEventListener('change',req);
  let meshes=[],root=null,pending=false,hiSet=[],sel=null;
  const V={front:[0,0,1],back:[0,0,-1],right:[-1,0,0],left:[1,0,0],top:[0,1,0.001],bottom:[0,-1,0.001],oblique:[0.55,0.3,0.78],'oblique-r':[-0.55,0.3,0.78]};
  function size(){const w=box.clientWidth,h=Math.round(Math.min(w*0.82,innerHeight*0.68,620));gl.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();req()}
  new ResizeObserver(size).observe(box);
  function req(){if(!pending){pending=true;requestAnimationFrame(draw)}}
  function draw(){pending=false;const moving=ctl.update();gl.render(scene,cam);labels();if(moving)req()}
  const nm=o=>(o.userData.ru||o.name||o.userData.en||'').trim(),en=o=>o.userData.en||o.name;
  const match=(o,re)=>re&&(re.test(nm(o))||re.test(en(o))||re.test(o.userData.group||''));
  function bboxOf(list){const b=new THREE.Box3();list.forEach(o=>{if(o.visible)b.expandByObject(o)});return b}
  function target(view,list){const b=bboxOf(list&&list.length?list:meshes),c=b.getCenter(new THREE.Vector3()),r=b.getSize(new THREE.Vector3()).length()/2;
    const d=new THREE.Vector3(...(V[view]||V.front)).normalize(),dist=r/Math.sin(THREE.MathUtils.degToRad(cam.fov/2))*1.2;
    return{pos:c.clone().add(d.multiplyScalar(dist)),tgt:c}}
  function apply(st){tags=st.tags||null;const hi=st.hi?new RegExp(st.hi,'i'):null,gh=st.ghost?new RegExp(st.ghost,'i'):null,hd=st.hide?new RegExp(st.hide,'i'):null;hiSet=[];
    meshes.forEach(o=>{const m=o.material;o.visible=!match(o,hd);const g=match(o,gh)||(st.ghostRest&&hi&&!match(o,hi));
      m.transparent=g;m.opacity=g?0.16:1;m.depthWrite=!g;m.emissive.setHex(match(o,hi)?0x5a3500:0x000000);m.needsUpdate=true;if(match(o,hi)&&o.visible)hiSet.push(o)});
    groupsUI();req()}
  // подписи у подсвеченных структур: по шагу tags:[[регэксп,'подпись'],…] или по названиям; наложения пропускаются
  let tags=null;
  function labels(){if(!root)return;const groups=new Map();
    if(tags){tags.forEach(([re,t])=>{const r=new RegExp(re,'i');const arr=hiSet.filter(o=>match(o,r));if(arr.length)groups.set(t,arr)})}
    else hiSet.forEach(o=>{const k=nm(o);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(o)});
    const W=gl.domElement.clientWidth,H=gl.domElement.clientHeight,placed=[];let h='';
    groups.forEach((arr,k)=>{if(placed.length>=6)return;const c=bboxOf(arr).getCenter(new THREE.Vector3()).project(cam);if(c.z>1)return;
      const x=(c.x+1)/2*W,y=(1-c.y)/2*H;if(placed.some(([px,py])=>Math.abs(px-x)<90&&Math.abs(py-y)<22))return;placed.push([x,y]);
      h+=`<span style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px">${k}</span>`});lab.innerHTML=h}
  // выбор структуры нажатием
  const ray=new THREE.Raycaster();let down=null;
  gl.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY]});
  gl.domElement.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;const r=gl.domElement.getBoundingClientRect();
    ray.setFromCamera({x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1},cam);
    const hit=ray.intersectObjects(meshes.filter(o=>o.visible&&!o.material.transparent),false)[0];
    if(sel){sel.material.emissive.setHex(sel.userData._em||0)}sel=null;
    if(hit){sel=hit.object;sel.userData._em=sel.material.emissive.getHex();sel.material.emissive.setHex(0x2a4a8a);pick.innerHTML=`<b>${nm(sel)}</b>`+(sel.userData.ru&&sel.userData.en?` <span>(${sel.userData.en})</span>`:'')}
    else pick.textContent='Нажмите на структуру, чтобы узнать название.';req()});
  // переключатели групп
  const gbox=fig.querySelector('.v3d-groups');
  function groupsUI(){if(!gbox||!root)return;const gs=[...new Set(meshes.map(o=>o.userData.group).filter(Boolean))];
    gbox.innerHTML=gs.map(g=>{const vis=meshes.some(o=>o.userData.group===g&&o.visible);return`<button type="button" aria-pressed="${vis}" data-g="${g}">${g}</button>`}).join('')}
  gbox&&gbox.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const g=b.dataset.g,vis=b.getAttribute('aria-pressed')!=='true';
    meshes.forEach(o=>{if(o.userData.group===g)o.visible=vis});b.setAttribute('aria-pressed',vis);req()});
  // загрузка
  box.classList.add('loading');
  // модели в общем сайте лежат как base64-текст (*.glb.txt): артефакты не раздают .glb
  const loadModel=(src,ok,fail)=>fetch(src).then(r=>{if(!r.ok)throw 0;return /\.txt$/.test(src)?r.text().then(t=>{const b=atob(t.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u.buffer}):r.arrayBuffer()})
    .then(buf=>new THREE.GLTFLoader().parse(buf,'',ok,fail)).catch(fail);
  loadModel(opt.src,g=>{root=g.scene;scene.add(root);root.traverse(o=>{if(o.isMesh){o.material=o.material.clone();const ex=o.userData&&Object.keys(o.userData).length?o.userData:(o.parent&&o.parent.userData)||{};o.userData={...ex};meshes.push(o)}});
    box.classList.remove('loading');size();const t0=target(opt.view||'front');cam.position.copy(t0.pos);ctl.target.copy(t0.tgt);
    if(opt.tour&&opt.tour.length&&window.Anim){let from=null,to=null,last=-1;
      Anim(fig,{steps:opt.tour.map(s=>({dur:s.dur||4200,label:s.label})),render(i,t){
        if(i!==last){last=i;apply(opt.tour[i]);from={pos:cam.position.clone(),tgt:ctl.target.clone()};
          const focus=opt.tour[i].focus?meshes.filter(o=>match(o,new RegExp(opt.tour[i].focus,'i'))):null;to=target(opt.tour[i].view||'front',focus)}
        const k=RM?1:Math.min(1,t/0.3),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
        cam.position.lerpVectors(from.pos,to.pos,e);ctl.target.lerpVectors(from.tgt,to.tgt,e);req()}})}
    else{apply({});}
  },()=>{box.classList.remove('loading');box.innerHTML='<p class="v3d-msg">Не удалось загрузить 3D-модель.</p>'});
  return{apply,req};
}
