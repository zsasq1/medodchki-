// Рендер слайдов из файлов .ppt/.pptx этого репозитория (на самом деле это HTML-экспорт Quick Look).
// Картинки внутри слайдов в экспорте потеряны — виден только текст и фигуры.
// Использование: node _tools/slides.js "Воспаление.pptx" outdir [с] [по]   (номера слайдов с 1)
// Без outdir-диапазона печатает список слайдов с первой строкой текста.
const {chromium}=require('playwright'); const path=require('path'); const fs=require('fs');
(async()=>{
  const [file,out,from,to]=process.argv.slice(2);
  const tmp=path.join(require('os').tmpdir(),'slides_'+Date.now()+'.html'); fs.copyFileSync(file,tmp);
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:740,height:600},deviceScaleFactor:2});
  await p.goto('file://'+tmp); await p.waitForTimeout(800);
  await p.addStyleTag({content:'img{display:none!important}'});
  const s=await p.$$('div.slide');
  if(!out){ for(let i=0;i<s.length;i++){const t=(await s[i].innerText()).replace(/\s+/g,' ').trim().slice(0,90); console.log(i+1,t);} }
  else { fs.mkdirSync(out,{recursive:true}); const a=+(from||1), z=+(to||s.length);
    for(let i=a;i<=Math.min(z,s.length);i++){ await s[i-1].screenshot({path:path.join(out,`slide${String(i).padStart(3,'0')}.png`)}); }
    console.log('saved',out); }
  await b.close(); fs.unlinkSync(tmp);
})();
