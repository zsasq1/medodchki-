/* axis3d.js — электрическая ось сердца в 3D: прозрачное сердце, фронтальная плоскость, оси 6 отведений от конечностей,
   треугольник Эйнтховена, стрелка оси (крутится ползунком), 6 мини-ЭКГ, режим «угадай ось».
   Нужны three.js r128 + GLTFLoader + OrbitControls (теги script до этого файла).
   Axis3D(fig,{src:'3d/heart.glb.txt'}). Нормы — кардио.pdf, с. 91–93.
   Координаты модели: +X — левая сторона пациента, +Y — вверх, +Z — вперёд. Угол α по ЭКГ: 0° — к левой руке, +90° — вниз. */
(function(){
const LEADS=[['I',0],['II',60],['III',120],['aVF',90],['aVL',-30],['aVR',-150]];
const SECT=[[-30,0,'#e0a43a','отклонение влево'],[0,30,'#7cc29b','горизонтальное'],[30,70,'#2f9e6e','нормальное'],[70,90,'#7cc29b','вертикальное'],[90,120,'#e0a43a','отклонение вправо'],[120,180,'#d0505e','резкое отклонение вправо'],[-90,-30,'#d0505e','резкое отклонение влево'],[-180,-90,'#9aa0a6','крайнее (в методичке не описано)']];
const cat=a=>{a=((a+180)%360+360)%360-180;if(a>=30&&a<=70)return['нормальное положение','ok'];if(a>=0&&a<30)return['горизонтальное положение (вариант нормы)','ok'];if(a>70&&a<=90)return['вертикальное положение (вариант нормы)','ok'];
  if(a<0&&a>=-30)return['отклонение влево','warn'];if(a<-30&&a>=-90)return['резкое отклонение влево','bad'];if(a>90&&a<=120)return['отклонение вправо','warn'];if(a>120)return['резкое отклонение вправо','bad'];return['крайнее отклонение — в методичке этот сектор не описан','bad']};
const rad=d=>d*Math.PI/180,dir=a=>[Math.cos(rad(a)),-Math.sin(rad(a))];
function Axis3D(fig,opt){
  const box=fig.querySelector('.ax-3d'),ecg=fig.querySelector('.ax-ecg'),ui=fig.querySelector('.ax-ui'),info=fig.querySelector('.ax-info');
  let alpha=50,guess=null,truth=null;
  ui.innerHTML=`<div class="ax-row"><label for="ax-r">Угол оси α: <b class="ax-val">+50°</b></label><input id="ax-r" type="range" min="-180" max="180" step="5" value="50"></div>
   <div class="ax-pre" role="group" aria-label="Примеры">${[['норма',50],['горизонтальная',15],['вертикальная',80],['влево',-20],['резко влево',-50],['вправо',105],['резко вправо',140]].map(([t,a])=>`<button type="button" data-a="${a}">${t} ${a>0?'+':''}${a}°</button>`).join('')}</div>
   <div class="ax-pre"><button type="button" data-g="1" class="ax-game">🎯 Угадай ось по ЭКГ</button><label class="ax-chk"><input type="checkbox" data-t checked> треугольник и электроды</label><label class="ax-chk"><input type="checkbox" data-h checked> сердце</label></div>`;
  const R=ui.querySelector('input[type=range]'),val=ui.querySelector('.ax-val'),gameB=ui.querySelector('[data-g]');
  /* ---------- 6 мини-ЭКГ ---------- */
  function drawECG(a,hide){const cols=(ecg.clientWidth||600)<520?3:6,cw=100,H=170,W=cols*cw,HT=H*Math.ceil(6/cols);let s='';const amp=LEADS.map(([n,t])=>Math.cos(rad(a-t)));
    const mx=Math.max(...amp.map(Math.abs)),imax=amp.indexOf(Math.max(...amp)),iper=amp.map(Math.abs).indexOf(Math.min(...amp.map(Math.abs)));
    LEADS.forEach(([n,t],i)=>{const x0=(i%cols)*cw,y0=Math.floor(i/cols)*H,b=y0+88,c=amp[i],Rv=Math.max(.06,(1+c)/2)*1.25,Sv=Math.max(.04,(1-c)/2)*1.25,k=42;
      const pts=[[0,0],[28,0],[33,.08],[38,0],[43,-.06],[50,Rv],[57,-Sv],[62,0],[70,0],[80,.18*Math.sign(c||1)*Math.min(1,Math.abs(c)+.3)],[90,0],[100,0]];
      const d=pts.map(([x,v],j)=>(j?'L':'M')+(x0+x).toFixed(1)+' '+(b-v*k).toFixed(1)).join('');
      const hl=!hide&&(i===imax?'max':i===iper?'per':'');
      s+=`<g class="ax-l ${hl}"><rect x="${x0+2}" y="${y0+4}" width="${cw-4}" height="${H-8}" rx="6"/><text x="${x0+8}" y="${y0+24}" class="ax-ln">${n}</text>
        <text x="${x0+cw-8}" y="${y0+24}" class="ax-deg" text-anchor="end">${t>0?'+':''}${t}°</text><path d="${d}"/>
        ${hide?'':`<text x="${x0+cw/2}" y="${y0+H-10}" class="ax-cap" text-anchor="middle">${c>.35?'R больше':c<-.35?'S больше':'R ≈ S'}</text>`}</g>`});
    ecg.setAttribute('viewBox',`0 0 ${W} ${HT}`);ecg.innerHTML=s;return{imax,iper}}
  /* ---------- текст ---------- */
  function explain(a){const [c,cl]=cat(a),{imax,iper}=drawECG(a,false);const sg=a>0?'+':'';
    const rI=Math.cos(rad(a)),rII=Math.cos(rad(a-60)),rIII=Math.cos(rad(a-120));
    let vis='';if(rII>rI&&rI>rIII)vis='R<sub>II</sub> > R<sub>I</sub> > R<sub>III</sub> — так выглядит нормальное положение';else if(rI>rII&&rII>rIII)vis='R<sub>I</sub> > R<sub>II</sub> > R<sub>III</sub> — горизонтальное положение';
    if(LEADS[imax][0]==='III')vis='R<sub>III</sub> самый большой — отклонение вправо';if(LEADS[imax][0]==='aVL')vis='R<sub>aVL</sub> самый большой — отклонение влево';
    info.innerHTML=`<p class="ax-cat ${cl}">α = ${sg}${a}° — <b>${c}</b> <span class="src">кардио.pdf, с. 91</span></p>
     <ul><li>Самый большой положительный комплекс — в <b>${LEADS[imax][0]}</b>: стрелка ближе всего к оси этого отведения (правило 1, с. 92).</li>
     <li>R ≈ S (самый маленький комплекс) — в <b>${LEADS[iper][0]}</b>: его ось почти поперёк стрелки (правило 2, с. 92).</li>
     ${vis?`<li>Визуальный способ: ${vis} (с. 92–93).</li>`:''}</ul>`}
  /* ---------- 3D ---------- */
  let gl=null,scene,cam,ctl,heart=null,tri=null,arrow,garrow,labels=[];const lab=document.createElement('div');lab.className='v3d-labels ax-lab';
  if(!window.THREE||!THREE.GLTFLoader||!THREE.OrbitControls){box.innerHTML='<p class="v3d-msg">3D не загрузилось (нет доступа к three.js). Ползунок и ЭКГ работают.</p>'}
  else{try{gl=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){box.innerHTML='<p class="v3d-msg">WebGL недоступен — 3D не показывается. Ползунок и ЭКГ работают.</p>'}}
  function setup(center,r){
    scene=new THREE.Scene();cam=new THREE.PerspectiveCamera(30,1,.002,20);scene.add(new THREE.HemisphereLight(0xffffff,0x554444,1));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(.3,.6,1);cam.add(dl);scene.add(cam);
    ctl=new THREE.OrbitControls(cam,gl.domElement);ctl.enableDamping=true;ctl.enablePan=false;ctl.addEventListener('change',req);
    const L=r*1.75;
    /* диск фронтальной плоскости с секторами */
    const disc=new THREE.Group();disc.position.copy(center);
    SECT.forEach(([a1,a2,col])=>{const g=new THREE.CircleGeometry(L*.92,48,-rad(a2),rad(a2-a1));const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false}));disc.add(m)});
    const ring=new THREE.Mesh(new THREE.RingGeometry(L*.92,L*.94,96),new THREE.MeshBasicMaterial({color:0x555555,transparent:true,opacity:.5,side:THREE.DoubleSide}));disc.add(ring);
    scene.add(disc);
    /* оси отведений */
    const mkCyl=(a,len,rr,col,op)=>{const d=dir(a),g=new THREE.CylinderGeometry(rr,rr,len,12);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:col,transparent:op<1,opacity:op,depthTest:false}));
      m.position.set(center.x+d[0]*len/2,center.y+d[1]*len/2,center.z);m.rotation.z=-rad(a)-Math.PI/2;m.renderOrder=5;return m};
    LEADS.forEach(([n,t])=>{scene.add(mkCyl(t,L,r*.012,0x1d55b0,.95));scene.add(mkCyl(t+180,L*.9,r*.007,0x8a8f98,.6));const d=dir(t);labels.push([`${n} <small>${t>0?'+':''}${t}°</small>`,new THREE.Vector3(center.x+d[0]*L*1.07,center.y+d[1]*L*1.07,center.z),'ax-lead'])});
    [[0,'0°'],[90,'+90°'],[180,'±180°'],[-90,'−90°']].forEach(([a,t])=>{const d=dir(a);labels.push([t,new THREE.Vector3(center.x+d[0]*L*.82,center.y+d[1]*L*.82,center.z),'ax-tick'])});
    /* треугольник Эйнтховена */
    tri=new THREE.Group();const k=L*1.25,Rp=[-k,k*.577],Lp=[k,k*.577],Fp=[0,-k*1.155];
    const v=p=>new THREE.Vector3(center.x+p[0],center.y+p[1],center.z);
    const lg=new THREE.BufferGeometry().setFromPoints([v(Rp),v(Lp),v(Fp),v(Rp)]);tri.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:0x666666,transparent:true,opacity:.6})));
    [[Rp,0xd63a3a,'R<br><small>правая рука</small>'],[Lp,0xe6c229,'L<br><small>левая рука</small>'],[Fp,0x2e9e4f,'F <small>левая нога</small>']].forEach(([p,c,t])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(r*.06,20,14),new THREE.MeshStandardMaterial({color:c}));s.position.copy(v(p));tri.add(s);labels.push([t,v([p[0],p[1]+(p[1]>0?r*.16:-r*.16)]),'ax-el'])});
    scene.add(tri);
    /* стрелки: ось (и догадка) */
    const mkArrow=(col)=>{const g=new THREE.Group(),len=L*1.0,sh=new THREE.Mesh(new THREE.CylinderGeometry(r*.045,r*.045,len*.8,16),new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true,opacity:1}));sh.position.y=len*.4;
      const cone=new THREE.Mesh(new THREE.ConeGeometry(r*.11,len*.22,20),new THREE.MeshBasicMaterial({color:col,depthTest:false,transparent:true,opacity:1}));cone.position.y=len*.89;sh.renderOrder=cone.renderOrder=8;g.add(sh,cone);g.position.copy(center);scene.add(g);return g};
    arrow=mkArrow(0xd62f3a);garrow=mkArrow(0x7b3fc4);garrow.visible=false;
    const tc=new THREE.Vector3(center.x,center.y-k*.25,center.z),dist=k*1.25/Math.sin(rad(15));cam.position.set(tc.x,tc.y,tc.z+dist);ctl.target.copy(tc);
    size();place()}
  function place(){if(!arrow)return;const show=truth==null?alpha:truth;arrow.rotation.z=-Math.PI/2-rad(show);
    arrow.visible=truth==null||fig.classList.contains('ax-reveal');garrow.visible=truth!=null;garrow.rotation.z=-Math.PI/2-rad(alpha);req()}
  function size(){if(!gl||!cam)return;const w=box.clientWidth,h=Math.round(Math.min(w*.85,innerHeight*.6,560));gl.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();req()}
  let pend=false;function req(){if(gl&&!pend&&cam){pend=true;requestAnimationFrame(()=>{pend=false;const mv=ctl.update();gl.render(scene,cam);drawLabels();if(mv)req()})}}
  function drawLabels(){const W=gl.domElement.clientWidth,H=gl.domElement.clientHeight;const showTri=tri&&tri.visible;
    lab.innerHTML=labels.filter(([,, c])=>c!=='ax-el'||showTri).map(([t,p,c])=>{const q=p.clone().project(cam);if(q.z>1)return'';return`<span class="${c}" style="left:${((q.x+1)/2*W).toFixed(0)}px;top:${((1-q.y)/2*H).toFixed(0)}px">${t}</span>`}).join('')}
  if(gl){gl.setPixelRatio(Math.min(devicePixelRatio,2));gl.outputEncoding=THREE.sRGBEncoding;box.appendChild(gl.domElement);box.appendChild(lab);new ResizeObserver(size).observe(box);box.classList.add('loading');
    fetch(opt.src).then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{const b=atob(t.trim()),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);
      new THREE.GLTFLoader().parse(u.buffer,'',g=>{heart=g.scene;const bb=new THREE.Box3();heart.traverse(o=>{if(o.isMesh){const n=(o.userData.ru||o.parent&&o.parent.userData&&o.parent.userData.ru||o.name||'')+'';
          if(/коронарн|ветвь|вена сердца|ЛКА|ПКА|створк|заслонк|папилляр/i.test(n)){o.visible=false;return}
          o.material=new THREE.MeshStandardMaterial({color:/стенк/i.test(n)?0xd98c8c:0xb9c3d6,transparent:true,opacity:/стенк/i.test(n)?.28:.15,depthWrite:false,side:THREE.DoubleSide,roughness:.6})}});
        heart.updateMatrixWorld(true);heart.traverse(o=>{if(o.isMesh&&o.visible&&/стенк/i.test((o.userData.ru||o.parent&&o.parent.userData&&o.parent.userData.ru||o.name||'')+''))bb.expandByObject(o)});
        const c=bb.getCenter(new THREE.Vector3()),r=bb.getSize(new THREE.Vector3()).length()/2;setup(c,r);scene.add(heart);box.classList.remove('loading')},fail)}).catch(fail)}
  function fail(){box.classList.remove('loading');box.innerHTML='<p class="v3d-msg">Не удалось загрузить 3D-модель. Ползунок и ЭКГ работают.</p>'}
  /* ---------- управление ---------- */
  function set(a){alpha=a;R.value=a;val.textContent=(a>0?'+':'')+a+'°';if(truth==null)explain(a);else{drawECG(truth,true);info.innerHTML=`<p>Двигайте ползунок: <b style="color:#7b3fc4">фиолетовая стрелка</b> — ваша догадка (${val.textContent}). Смотрите на 6 ЭКГ: где самый большой R, где R ≈ S. Затем «Проверить».</p><button type="button" class="ax-check">Проверить</button>`}place()}
  R.addEventListener('input',()=>set(+R.value));
  ui.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.a!=null){truth=null;fig.classList.remove('ax-reveal');gameB.textContent='🎯 Угадай ось по ЭКГ';set(+b.dataset.a)}
    if(b.dataset.g){if(truth==null){truth=Math.round((Math.random()*230-80)/5)*5;fig.classList.remove('ax-reveal');gameB.textContent='✕ выйти из игры';set(0)}else{truth=null;fig.classList.remove('ax-reveal');gameB.textContent='🎯 Угадай ось по ЭКГ';set(alpha)}}});
  info.addEventListener('click',e=>{if(!e.target.closest('.ax-check')||truth==null)return;fig.classList.add('ax-reveal');const d=Math.abs(((alpha-truth+540)%360)-180),[c]=cat(truth);place();drawECG(truth,false);
    info.innerHTML=`<p class="ax-cat ${d<=15?'ok':d<=35?'warn':'bad'}">Правильный ответ: α = ${truth>0?'+':''}${truth}° — <b>${c}</b>. Ваша догадка отличается на ${d}° ${d<=15?'— отлично!':d<=35?'— близко.':'— посмотрите ещё раз на правила ниже.'}</p>
     <p>Красная стрелка — правильная ось, фиолетовая — ваша. Самый большой R — в отведении, ось которого ближе всего к стрелке; R ≈ S — в отведении поперёк стрелки (с. 92).</p><button type="button" class="ax-next">Ещё раз</button>`});
  info.addEventListener('click',e=>{if(e.target.closest('.ax-next')){truth=Math.round((Math.random()*230-80)/5)*5;fig.classList.remove('ax-reveal');set(0)}});
  ui.querySelector('[data-t]').addEventListener('change',e=>{if(tri){tri.visible=e.target.checked;req()}});
  ui.querySelector('[data-h]').addEventListener('change',e=>{if(heart){heart.visible=e.target.checked;req()}});
  new ResizeObserver(()=>{truth==null?explain(alpha):drawECG(truth,!fig.classList.contains('ax-reveal'))}).observe(ecg);set(50)}
window.Axis3D=Axis3D;
})();
