/* ============ 智能内核 · 就业重塑 · 技术谱系与治理（三大交互板块） ============ */
(function () {
'use strict';
const isEn = () => window.Lc && Lc.getLang() === 'en';
const isLight = () => window.Lc && Lc.getTheme() === 'light';
const T = k => window.Lc ? Lc.t(k) : k;

function pal() {
  return isLight() ? {
    axis:'#475569', split:'rgba(15,23,42,.08)', tipBg:'rgba(255,255,255,.96)', tipTx:'#13233f', tipBd:'#dbe5f2',
    cyan:'#2563eb', purple:'#9333ea', gold:'#d97706', green:'#059669', red:'#dc2626',
    tx:'#13233f', dim:'#64748b', gridLine:'rgba(15,23,42,.08)'
  } : {
    axis:'#8ea3c4', split:'rgba(64,150,255,.12)', tipBg:'rgba(8,18,38,.95)', tipTx:'#e5eefc', tipBd:'rgba(64,150,255,.3)',
    cyan:'#22d3ee', purple:'#a855f7', gold:'#fbbf24', green:'#34d399', red:'#f87171',
    tx:'#e5eefc', dim:'#8ea3c4', gridLine:'rgba(64,150,255,.12)'
  };
}
const tip = (extra={}) => Object.assign({
  backgroundColor:pal().tipBg, borderColor:pal().tipBd, borderWidth:1,
  textStyle:{color:pal().tipTx, fontSize:12}, extraCss:'box-shadow:0 8px 30px rgba(0,0,0,.25);border-radius:10px;'
}, extra);
const chartInsts = {};
function mkChart(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  // 用 echarts.dispose(dom) 彻底释放，避免快速重建时实例注册表错乱（孤儿 canvas 不响应事件）
  try { echarts.dispose(el); } catch (e) {}
  delete chartInsts[id];
  const c = echarts.init(el);
  chartInsts[id] = c;
  return c;
}

/* ================================================================
   PART 1 — 智能内核：可交互机器学习沙盒（真实梯度下降训练）
   ================================================================ */
const sigmoid = z => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
const tanh = z => { const e1=Math.exp(Math.max(-30,Math.min(30,z))), e2=1/e1; return (e1-e2)/(e1+e2); };

const ML = {
  pts: [], cls: 0, model: 'nn', H: 6, lr: .12,
  W1:null, b1:null, W2:null, b:0, w0:0, w1:0, lb:0,
  epoch: 0, run: true, losses: [], raf: 0, frame: 0,
  cv:null, ctx:null, bg:null, bgx:null, lcv:null, lctx:null,
  GW: 56, GH: 40,
};
function resetWeights() {
  const H = ML.H;
  ML.W1 = [[],[]]; ML.b1 = []; ML.W2 = [];
  for (let j=0;j<H;j++){
    ML.W1[0][j] = (Math.random()*2-1)*1.1;
    ML.W1[1][j] = (Math.random()*2-1)*1.1;
    ML.b1[j] = 0;
    ML.W2[j] = (Math.random()*2-1)*.8;
  }
  ML.b = 0; ML.w0 = (Math.random()*2-1)*.4; ML.w1 = (Math.random()*2-1)*.4; ML.lb = 0;
  ML.epoch = 0; ML.losses = [];
}
function fwd(x0, x1) {
  if (ML.model === 'lr') return sigmoid(ML.w0*x0 + ML.w1*x1 + ML.lb);
  const H = ML.H, z = [];
  for (let j=0;j<H;j++) z[j] = tanh(x0*ML.W1[0][j] + x1*ML.W1[1][j] + ML.b1[j]);
  let s = ML.b;
  for (let j=0;j<H;j++) s += z[j]*ML.W2[j];
  return sigmoid(s);
}
function trainStep() {
  const n = ML.pts.length; if (!n) return;
  const lr = ML.lr;
  if (ML.model === 'lr') {
    let g0=0,g1=0,gb=0;
    for (const p of ML.pts) { const e = fwd(p.x,p.y) - p.c; g0 += e*p.x; g1 += e*p.y; gb += e; }
    ML.w0 -= lr*g0/n; ML.w1 -= lr*g1/n; ML.lb -= lr*gb/n;
    return;
  }
  const H = ML.H;
  const aW1=[[],[]]; aW1[0]=new Array(H).fill(0); aW1[1]=new Array(H).fill(0);
  const ab1=new Array(H).fill(0), aW2=new Array(H).fill(0);
  let ab=0;
  for (const p of ML.pts) {
    const z=[];
    for (let j=0;j<H;j++) z[j]=tanh(p.x*ML.W1[0][j]+p.y*ML.W1[1][j]+ML.b1[j]);
    let o=ML.b; for (let j=0;j<H;j++) o+=z[j]*ML.W2[j];
    o=sigmoid(o); const d=o-p.c; ab+=d;
    for (let j=0;j<H;j++){
      aW2[j]+=d*z[j];
      const dz=d*ML.W2[j]*(1-z[j]*z[j]);
      ab1[j]+=dz; aW1[0][j]+=dz*p.x; aW1[1][j]+=dz*p.y;
    }
  }
  for (let j=0;j<H;j++){
    ML.W1[0][j]-=lr*aW1[0][j]/n; ML.W1[1][j]-=lr*aW1[1][j]/n;
    ML.b1[j]-=lr*ab1[j]/n; ML.W2[j]-=lr*aW2[j]/n;
  }
  ML.b -= lr*ab/n;
}
function metrics() {
  let loss=0, correct=0;
  for (const p of ML.pts) {
    const o=fwd(p.x,p.y);
    loss -= (p.c*Math.log(o+1e-9) + (1-p.c)*Math.log(1-o+1e-9));
    if ((o>=.5?1:0)===p.c) correct++;
  }
  return { loss: ML.pts.length ? loss/ML.pts.length : 0, acc: ML.pts.length ? correct/ML.pts.length : 0 };
}
function genData(kind) {
  const pts=[]; const R=(a,b)=>a+Math.random()*(b-a);
  const push=(x,y,c)=>pts.push({x:Math.max(-1,Math.min(1,x)), y:Math.max(-1,Math.min(1,y)), c});
  if (kind==='linear') {
    for (let i=0;i<32;i++){
      const x=R(-.95,.95);
      push(x+R(-.07,.07), (-.2*x-.28)+R(-.18,.18), 0);
      push(x+R(-.07,.07), (-.2*x+.28)+R(-.18,.18), 1);
    }
  } else if (kind==='moon') {
    const N=34;
    for (let i=0;i<N;i++){
      const a=Math.PI*i/(N-1);
      push(Math.cos(a)*.62-.08+R(-.05,.05), Math.sin(a)*.5+.18+R(-.05,.05), 0);
      push(1-Math.cos(a)*.62+.08+R(-.05,.05), -Math.sin(a)*.5-.12+R(-.05,.05), 1);
    }
  } else {
    for (let i=0;i<36;i++){
      const a=R(0,Math.PI*2), r=R(.12,.34);
      push(Math.cos(a)*r+R(-.03,.03), Math.sin(a)*r+R(-.03,.03), 0);
    }
    for (let i=0;i<36;i++){
      const a=R(0,Math.PI*2), r=R(.58,.88);
      push(Math.cos(a)*r+R(-.04,.04), Math.sin(a)*r+R(-.04,.04), 1);
    }
  }
  return pts;
}
function renderBoundary() {
  const {GW,GH}=ML;
  const img=ML.bgx.createImageData(GW,GH);
  for (let gy=0;gy<GH;gy++){
    for (let gx=0;gx<GW;gx++){
      const x=(gx/(GW-1))*2-1, y=(1-gy/(GH-1))*2-1;
      const p=fwd(x,y);
      const d=Math.abs(p-.5);                       // 0 在边界, .5 在类别中心
      // 色相：190 青（类0）→ 280 紫（类1）；越靠近决策边界越暗
      const hue=190+p*90, sat=85, lig=isLight()?42:50;
      const alpha=d<.06 ? .03 : Math.min(.5, d*.62);
      const [r,g,b]=hslToRgb(hue/360,sat/100,lig/100);
      const k=(gy*GW+gx)*4;
      img.data[k]=r; img.data[k+1]=g; img.data[k+2]=b; img.data[k+3]=Math.round(alpha*255);
    }
  }
  ML.bgx.putImageData(img,0,0);
}
function hslToRgb(h,s,l){
  if(s===0) return [l*255,l*255,l*255];
  const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q;
  const f=t=>{ if(t<0)t++; if(t>1)t--; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
  return [f(h+1/3)*255, f(h)*255, f(h-1/3)*255];
}
function drawML() {
  const cv=ML.cv, ctx=ML.ctx, W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';
  ctx.drawImage(ML.bg,0,0,W,H);
  // 坐标轴
  ctx.strokeStyle=isLight()?'rgba(15,23,42,.15)':'rgba(142,163,196,.2)';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  // 数据点
  for (const p of ML.pts){
    const px=(p.x+1)/2*W, py=(1-(p.y+1)/2)*H;
    ctx.beginPath(); ctx.arc(px,py,5.5,0,Math.PI*2);
    ctx.fillStyle=p.c?pal().purple:pal().cyan;
    ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle=isLight()?'#fff':'#0b1426'; ctx.stroke();
  }
}
function drawLoss(m) {
  const cv=ML.lcv, ctx=ML.lctx, W=cv.width, H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle=isLight()?'rgba(15,23,42,.1)':'rgba(142,163,196,.15)';
  ctx.lineWidth=1;
  for (let i=1;i<4;i++){ const y=H*i/4; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  const L=ML.losses; if (L.length<2) return;
  const maxL=Math.max(...L,.1);
  ctx.beginPath();
  L.forEach((v,i)=>{
    const x=i/(160-1)*W, y=H-Math.min(v/maxL,1)*(H-6)-3;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  });
  const g=ctx.createLinearGradient(0,0,W,0);
  g.addColorStop(0,pal().cyan); g.addColorStop(1,pal().purple);
  ctx.strokeStyle=g; ctx.lineWidth=2; ctx.stroke();
}
function loop() {
  if (ML.run && ML.pts.length>=4) {
    for (let k=0;k<3;k++) trainStep();
    ML.epoch+=3;
    if (ML.frame%2===0){
      const m=metrics();
      ML.losses.push(m.loss); if (ML.losses.length>160) ML.losses.shift();
      updateMLStats(m); renderBoundary(); drawLoss(m);
    }
    ML.frame++;
  }
  drawML();
  ML.raf=requestAnimationFrame(loop);
}
function updateMLStats(m) {
  const el=id=>document.getElementById(id);
  if (!el('mlEpoch')) return;
  el('mlEpoch').textContent=ML.epoch;
  el('mlLoss').textContent=m.loss.toFixed(4);
  el('mlAcc').textContent=(m.acc*100).toFixed(1)+'%';
}
function toCanvasXY(e) {
  const r=ML.cv.getBoundingClientRect();
  const x=((e.clientX-r.left)/r.width)*2-1;
  const y=(1-(e.clientY-r.top)/r.height)*2-1;
  return {x:Math.max(-1,Math.min(1,x)), y:Math.max(-1,Math.min(1,y))};
}
let painting=false;
function initMLSandbox() {
  ML.cv=document.getElementById('mlCanvas'); if(!ML.cv) return;
  ML.ctx=ML.cv.getContext('2d');
  ML.bg=document.createElement('canvas'); ML.bg.width=ML.GW; ML.bg.height=ML.GH;
  ML.bgx=ML.bg.getContext('2d');
  ML.lcv=document.getElementById('lossCanvas'); ML.lctx=ML.lcv.getContext('2d');
  function fit(){
    const dpr=window.devicePixelRatio||1;
    [ [ML.cv,ML.ctx], [ML.lcv,ML.lctx] ].forEach(([c,x])=>{
      const w=c.clientWidth, h=c.clientHeight;
      c.width=w*dpr; c.height=h*dpr; x.setTransform(dpr,0,0,dpr,0,0);
    });
    // 边界栅格用 CSS 像素逻辑（drawImage 时会被 transform 缩放）
    ML.bg.width=ML.GW; ML.bg.height=ML.GH;
    if (ML.pts.length) renderBoundary();
  }
  // 让 drawImage 用 CSS 像素尺寸
  const origDraw=drawML;
  window.addEventListener('resize', ()=>{ setTimeout(()=>{ fitCanvasPx(); if(ML.pts.length) renderBoundary(); },120); });
  function fitCanvasPx(){
    const dpr=window.devicePixelRatio||1;
    ML.cv.width=ML.cv.clientWidth*dpr; ML.cv.height=ML.cv.clientHeight*dpr;
    ML.ctx.setTransform(ML.cv.width,0,0,ML.cv.height,0,0); // 归一化坐标
    ML.lcv.width=ML.lcv.clientWidth*dpr; ML.lcv.height=ML.lcv.clientHeight*dpr;
    ML.lctx.setTransform(ML.lcv.width,0,0,ML.lcv.height,0,0);
  }
  // 重写绘制使用归一化坐标
  fitCanvasPx();
  // 事件
  ML.cv.addEventListener('mousedown',e=>{ painting=true; addPt(e); });
  window.addEventListener('mouseup',()=>painting=false);
  ML.cv.addEventListener('mousemove',e=>{ if(painting) addPt(e); });
  let lastAdd=0;
  function addPt(e){
    const now=performance.now(); if(now-lastAdd<40) return; lastAdd=now;
    const r=ML.cv.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width)*2-1, y=(1-(e.clientY-r.top)/r.height)*2-1;
    ML.pts.push({x:Math.max(-1,Math.min(1,x)), y:Math.max(-1,Math.min(1,y)), c:ML.cls});
    resetWeights();
  }
  // 控件
  document.querySelectorAll('[data-mlcls]').forEach(b=>b.addEventListener('click',()=>{
    ML.cls=+b.dataset.mlcls;
    document.querySelectorAll('[data-mlcls]').forEach(x=>x.classList.toggle('active',+x.dataset.mlcls===ML.cls));
  }));
  document.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>{
    ML.model=b.dataset.model;
    document.querySelectorAll('[data-model]').forEach(x=>x.classList.toggle('active',x===b));
    resetWeights();
  }));
  document.querySelectorAll('[data-ds]').forEach(b=>b.addEventListener('click',()=>{
    ML.pts=genData(b.dataset.ds); resetWeights();
    document.querySelectorAll('[data-ds]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  }));
  document.getElementById('mlClear').addEventListener('click',()=>{
    ML.pts=[]; ML.losses=[]; resetWeights();
    ML.bgx.clearRect(0,0,ML.GW,ML.GH); ML.lctx.clearRect(0,0,ML.lcv.width,ML.lcv.height);
    document.getElementById('mlEpoch').textContent='0';
    document.getElementById('mlLoss').textContent='—';
    document.getElementById('mlAcc').textContent='—';
    document.querySelectorAll('[data-ds]').forEach(x=>x.classList.remove('active'));
  });
  document.getElementById('mlRun').addEventListener('click',()=>{
    ML.run=!ML.run;
    document.getElementById('mlRun').textContent=ML.run?'⏸':'▶';
  });
  const lrS=document.getElementById('mlLr'), hS=document.getElementById('mlHidden');
  lrS.addEventListener('input',()=>{ ML.lr=+lrS.value; document.getElementById('mlLrVal').textContent=ML.lr.toFixed(2); });
  hS.addEventListener('input',()=>{ ML.H=+hS.value; document.getElementById('mlHVal').textContent=ML.H; resetWeights(); });

  // 默认月牙数据 + 神经网络
  ML.pts=genData('moon');
  resetWeights();
  cancelAnimationFrame(ML.raf);
  // 使用归一化坐标重写绘制函数
  startNormLoop();
  const ro=new ResizeObserver(()=>{ fitCanvasPx(); if(ML.pts.length) renderBoundary(); });
  ro.observe(ML.cv); ro.observe(ML.lcv);
}
function startNormLoop() {
  drawML=function(){
    const ctx=ML.ctx;
    ctx.clearRect(0,0,1,1);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    ctx.drawImage(ML.bg,0,0,1,1);
    ctx.strokeStyle=isLight()?'rgba(15,23,42,.15)':'rgba(142,163,196,.2)';
    ctx.lineWidth=1/Math.max(ML.cv.width,ML.cv.height)*1.2;
    ctx.beginPath(); ctx.moveTo(0,.5); ctx.lineTo(1,.5); ctx.moveTo(.5,0); ctx.lineTo(.5,1); ctx.stroke();
    for (const p of ML.pts){
      const px=(p.x+1)/2, py=(1-(p.y+1)/2)/2;
      const rad=5.5/Math.max(ML.cv.clientWidth,ML.cv.clientHeight)*2.2;
      ctx.beginPath(); ctx.arc(px,py,Math.max(.008,rad),0,Math.PI*2);
      ctx.fillStyle=p.c?pal().purple:pal().cyan; ctx.fill();
      ctx.lineWidth=1.5/Math.max(ML.cv.width,ML.cv.height);
      ctx.strokeStyle=isLight()?'#fff':'#0b1426'; ctx.stroke();
    }
  };
  drawLoss=function(){
    const ctx=ML.lctx;
    ctx.clearRect(0,0,1,1);
    ctx.strokeStyle=isLight()?'rgba(15,23,42,.1)':'rgba(142,163,196,.15)';
    ctx.lineWidth=.002;
    for (let i=1;i<4;i++){ ctx.beginPath(); ctx.moveTo(0,i/4); ctx.lineTo(1,i/4); ctx.stroke(); }
    const L=ML.losses; if (L.length<2) return;
    const maxL=Math.max(...L,.1);
    ctx.beginPath();
    L.forEach((v,i)=>{ const x=i/159, y=1-Math.min(v/maxL,1)*.92-.03; i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    const g=ctx.createLinearGradient(0,0,1,0);
    g.addColorStop(0,pal().cyan); g.addColorStop(1,pal().purple);
    ctx.strokeStyle=g; ctx.lineWidth=.012; ctx.stroke();
  };
  cancelAnimationFrame(ML.raf);
  (function tick(){
    if (ML.run && ML.pts.length>=4){
      for (let k=0;k<3;k++) trainStep();
      ML.epoch+=3;
      if (ML.frame++%2===0){
        const m=metrics();
        ML.losses.push(m.loss); if (ML.losses.length>160) ML.losses.shift();
        updateMLStats(m); renderBoundary(); drawLoss(m);
      }
    }
    drawML();
    ML.raf=requestAnimationFrame(tick);
  })();
}

/* ================================================================
   PART 1b — ECharts：人类 vs AI 基准突破
   ================================================================ */
const BENCH = [
  {v:2015, zh:'ImageNet 图像识别', en:'ImageNet Image Recognition'},
  {v:2016, zh:'语音识别 Switchboard', en:'Switchboard Speech Recognition'},
  {v:2018, zh:'机器翻译 WMT', en:'WMT Machine Translation'},
  {v:2018, zh:'阅读理解 SQuAD', en:'SQuAD Reading Comprehension'},
  {v:2020, zh:'蛋白质结构预测', en:'Protein Structure (AlphaFold)'},
  {v:2021, zh:'常识推理 HellaSwag', en:'HellaSwag Commonsense Reasoning'},
  {v:2023, zh:'代码生成 HumanEval', en:'HumanEval Code Generation'},
  {v:2024, zh:'数学奥赛 IMO 奖牌', en:'IMO Math Olympiad Medal'},
];
function benchChart() {
  const c=mkChart('benchChart'); if(!c) return;
  const en=isEn(), p=pal();
  c.setOption({
    grid:{left: en?150:120, right:46, top:14, bottom:26},
    tooltip: tip({ formatter:x=>`${x.name} · ${x.value}` }),
    xAxis:{ type:'value', min:2013, max:2026, interval:2,
      axisLine:{lineStyle:{color:p.axis}}, axisLabel:{color:p.axis},
      splitLine:{lineStyle:{color:p.gridLine}} },
    yAxis:{ type:'category', inverse:true,
      data:BENCH.map(b=>en?b.en:b.zh),
      axisLine:{lineStyle:{color:p.axis}}, axisTick:{show:false},
      axisLabel:{color:p.tx,fontSize:11} },
    series:[{
      type:'bar', barWidth:13,
      data:BENCH.map((b,i)=>({value:b.v,
        itemStyle:{borderRadius:[0,7,7,0],
          color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:p.cyan},{offset:1,color:i>=6?p.purple:p.cyan}])}})),
      label:{show:true,position:'right',color:p.dim,fontSize:11,formatter:'{c}'},
      markLine:{symbol:'none', label:{formatter:en?'ChatGPT 2022':'ChatGPT 2022',color:p.gold,fontSize:10},
        lineStyle:{color:p.gold,type:'dashed'},data:[{xAxis:2022}]}
    }]
  });
}

/* ================================================================
   PART 2 — 就业重塑：职业自动化计算器 + 技能自测
   ================================================================ */
const JOBS = [
  {id:'entry', icon:'⌨️', risk:92, aug:25, change:-48, salary:-12,
   sk:[20,85,8,18,55], zh:'数据录入员', en:'Data Entry Clerk',
   ad_zh:'重复性最高的岗位之一。出路：转向数据治理、RPA流程监督，学习让AI替你录入，自己负责审核与异常处理。',
   ad_en:'Among the most repetitive roles. Pivot to data governance or RPA supervision — let AI do the entry while you handle review and exceptions.'},
  {id:'qa', icon:'🏭', risk:81, aug:42, change:-30, salary:6,
   sk:[35,70,15,25,50], zh:'流水线质检员', en:'Assembly-Line QC Inspector',
   ad_zh:'机器视觉24小时无休，准确率已超人工。转型方向：质检设备运维、缺陷分析工程师。',
   ad_en:'Machine vision works 24/7 and already outperforms humans. Pivot to inspection-equipment maintenance or defect analysis.'},
  {id:'cs', icon:'🎧', risk:76, aug:62, change:-22, salary:8,
   sk:[55,45,30,80,58], zh:'客服专员', en:'Customer Service Agent',
   ad_zh:'标准化问答将由AI接管，但高共情、复杂投诉处理更值钱。练好"情绪价值+AI坐席协同"。',
   ad_en:'Standard Q&A goes to AI, but empathy and complex complaints become more valuable. Master "emotional value + AI-agent collaboration".'},
  {id:'trans', icon:'🌐', risk:69, aug:72, change:-12, salary:10,
   sk:[70,30,60,55,65], zh:'笔译/口译员', en:'Translator / Interpreter',
   ad_zh:'普通翻译被大模型替代，专业领域（法律、医学、会议同传）译后编辑需求大增——从"翻译"变"审校+领域专家"。',
   ad_en:'General translation is automated; specialist post-editing (legal, medical, conference) surges — from translator to "reviewer + domain expert".'},
  {id:'acc', icon:'🧮', risk:61, aug:78, change:-8, salary:12,
   sk:[65,55,25,40,70], zh:'会计核算', en:'Accounting Clerk',
   ad_zh:'记账、报税自动化。管理会计、业财融合、AI审计监督是增长方向。',
   ad_en:'Bookkeeping and filing are automated. Management accounting and AI-audit oversight are growing.'},
  {id:'drive', icon:'🚚', risk:58, aug:45, change:-15, salary:5,
   sk:[30,50,10,35,40], zh:'货运司机', en:'Freight Driver',
   ad_zh:'L4自动驾驶在干线物流率先落地，但城市末端与应急场景仍需人类；提前学习车队智能调度。',
   ad_en:'L4 autonomy arrives first on trunk routes; urban last-mile still needs humans. Learn smart fleet dispatch early.'},
  {id:'code', icon:'💻', risk:46, aug:88, change:6, salary:22,
   sk:[85,35,75,60,90], zh:'初级程序员', en:'Junior Programmer',
   ad_zh:'AI写代码，人定义问题。CRUD岗位收缩，系统设计、需求抽象、AI工程化能力决定薪资。',
   ad_en:'AI writes code; humans define problems. CRUD roles shrink; system design and AI engineering set salaries.'},
  {id:'design', icon:'🎨', risk:42, aug:85, change:8, salary:15,
   sk:[80,20,92,55,80], zh:'平面设计师', en:'Graphic Designer',
   ad_zh:'出图速度不再是壁垒，审美、品牌策略、AI工作流编排成为核心竞争力。',
   ad_en:'Output speed is no longer a barrier; taste, brand strategy and AI-workflow orchestration are the core.'},
  {id:'fa', icon:'📊', risk:36, aug:90, change:14, salary:20,
   sk:[88,45,65,65,85], zh:'金融分析师', en:'Financial Analyst',
   ad_zh:'AI处理数据与初稿，分析师向"决策伙伴"升级：洞察、沟通、承担责任。',
   ad_en:'AI handles data and drafts; analysts become decision partners — insight, communication, accountability.'},
  {id:'teacher', icon:'📚', risk:16, aug:82, change:12, salary:10,
   sk:[75,15,70,92,68], zh:'中小学教师', en:'K-12 Teacher',
   ad_zh:'知识传授可被AI辅助，但品格塑造、课堂组织、情感联结无法替代——用AI做个性化备课。',
   ad_en:'Knowledge delivery is AI-assisted, but character building and emotional connection cannot be replaced — use AI for personalized lesson prep.'},
  {id:'doctor', icon:'🩺', risk:15, aug:86, change:10, salary:14,
   sk:[92,30,60,90,72], zh:'全科医生', en:'General Practitioner',
   ad_zh:'AI阅片、辅助诊断成为标配，而问诊沟通、伦理决策、终极责任仍在医生——"AI+医生"远胜二者单独。',
   ad_en:'AI imaging and diagnosis become standard; communication and ultimate responsibility stay with doctors — "AI + doctor" beats either alone.'},
  {id:'nurse', icon:'🩹', risk:9, aug:55, change:22, salary:12,
   sk:[50,60,30,95,45], zh:'养老护理员', en:'Elder-Care Worker',
   ad_zh:'老龄化+低自动化=长期紧缺。机器人做体力活，人提供尊严与陪伴，是AI时代的"反脆弱"职业。',
   ad_en:'Aging + low automation = persistent shortage. Robots do the lifting; humans provide dignity and companionship — an antifragile career.'},
  {id:'clerk', icon:'🗂️', risk:78, aug:40, change:-20, salary:5,
   sk:[38,62,22,28,52], zh:'行政文员', en:'Administrative Clerk',
   ad_zh:'日程、归档、报销等文书工作高度标准化，AI助手已能处理大半。出路：转向流程优化与行政数字化运营。',
   ad_en:'Scheduling, filing and expense workflows are highly standardized and mostly AI-handled. Pivot to process optimization and admin digitalization.'},
  {id:'telesales', icon:'📞', risk:80, aug:35, change:-25, salary:6,
   sk:[30,55,15,72,44], zh:'电话销售', en:'Telemarketer',
   ad_zh:'AI外呼机器人已覆盖大批量触达，纯话术销售被替代。转型方向：高净值客户经营、复杂方案顾问式销售。',
   ad_en:'AI dialers cover mass outreach; scripted selling is replaced. Pivot to key-account farming and consultative complex sales.'},
  {id:'mkt', icon:'📣', risk:40, aug:84, change:10, salary:14,
   sk:[70,38,74,85,62], zh:'市场营销专员', en:'Marketing Specialist',
   ad_zh:'投放、文案初稿可交给AI，但品牌洞察、用户心理与整合策划仍靠人——学会用AI放大创意。',
   ad_en:'Bidding and copy drafts go to AI; brand insight, psychology and integrated strategy stay human — amplify creativity with AI.'},
  {id:'da', icon:'📈', risk:30, aug:92, change:18, salary:18,
   sk:[90,58,52,60,82], zh:'数据分析师', en:'Data Analyst',
   ad_zh:'AI自动取数建模，分析师的价值上移到业务解读与决策建议——从"跑数"到"讲故事+定策略"。',
   ad_en:'AI automates extraction and modeling; analysts rise to business insight and decisioning — from running numbers to telling stories and setting strategy.'},
  {id:'lawyer', icon:'⚖️', risk:22, aug:80, change:8, salary:16,
   sk:[86,46,55,85,66], zh:'律师', en:'Lawyer',
   ad_zh:'合同审查、法条检索被AI加速，但出庭、谈判与责任承担不可替代；用AI做案例与文书效率翻倍。',
   ad_en:'Contract review and legal research are AI-accelerated; advocacy, negotiation and accountability stay human — AI doubles drafting efficiency.'},
  {id:'psy', icon:'🧠', risk:8, aug:60, change:20, salary:10,
   sk:[62,40,42,95,50], zh:'心理咨询师', en:'Psychologist',
   ad_zh:'深度共情、信任关系与伦理判断无法被AI替代，反而是AI时代的稀缺能力——"人"就是最大的壁垒。',
   ad_en:'Deep empathy, trust and ethical judgment are irreplaceable — the rarest skills in the AI era. Being human is the ultimate moat.'},
];
let curJob = 'code';
let jobRadar = null;

function jobPanel(id) {
  curJob=id;
  const j=JOBS.find(x=>x.id===id), en=isEn(), p=pal();
  document.querySelectorAll('[data-job]').forEach(b=>b.classList.toggle('active',b.dataset.job===id));
  document.getElementById('jobAdvice').textContent=en?j.ad_en:j.ad_zh;
  document.getElementById('jobName').textContent=j.icon+' '+(en?j.en:j.zh);
  const changeEl=document.getElementById('jobChange');
  changeEl.textContent=(j.change>0?'+':'')+j.change+'%';
  changeEl.style.color=j.change>=0?p.green:p.red;
  document.getElementById('jobSalary').textContent=(j.salary>=0?'+':'')+j.salary+'%';
  document.getElementById('jobAug').textContent=j.aug+'%';
  const riskL=document.getElementById('jobRiskLvl');
  riskL.textContent=j.risk>=70?(en?'High Risk · Automation':'高风险 · 易被自动化')
    :j.risk>=40?(en?'Medium · Human-AI Collaboration':'中风险 · 人机协作')
    :(en?'Low Risk · AI-Enhanced':'低风险 · AI增强型');
  riskL.style.color=j.risk>=70?p.red:j.risk>=40?p.gold:p.green;
  const riskT=document.getElementById('jobRiskTitle');
  if(riskT){ riskT.textContent=en?'Automation Risk':'自动化替代风险'; riskT.style.color=p.dim; }
  // 仪表盘
  const g=mkChart('jobGauge');
  g.setOption({
    series:[{
      type:'gauge', startAngle:210, endAngle:-30, min:0, max:100, radius:'80%', center:['50%','50%'],
      progress:{show:true,width:12,itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:p.cyan},{offset:1,color:j.risk>=70?p.red:p.purple}])}},
      axisLine:{lineStyle:{width:12,color:[[1,isLight()?'#e2e8f5':'rgba(64,150,255,.15)']]}},
      axisTick:{show:false}, splitLine:{show:false}, axisLabel:{show:false}, pointer:{show:false},
      anchor:{show:false},
      detail:{valueAnimation:true,formatter:'{value}%',color:p.tx,fontSize:30,fontWeight:800,offsetCenter:[0,'0%']},
      title:{show:false},
      data:[{value:j.risk,name:en?'Automation Risk':'自动化替代风险'}]
    }]
  });
  // 使环形画布匹配容器当前高度（容器为自适应高度，避免画布撑开导致溢出）
  try { g.resize(); } catch(e) {}
  // 雷达
  if(!jobRadar) jobRadar=echarts.init(document.getElementById('jobRadar'));
  else jobRadar.resize();
  jobRadar.setOption({
    tooltip:tip(),
    radar:{
      indicator:(en?['Cognitive','Routine','Creative','Social','Digital']:['认知能力','重复操作','创造力','社交协作','数字技能'])
        .map(n=>({name:n,max:100})),
      radius:'64%', center:['50%','52%'],
      axisName:{color:p.tx,fontSize:11},
      splitLine:{lineStyle:{color:p.gridLine}}, splitArea:{show:false},
      axisLine:{lineStyle:{color:p.gridLine}}
    },
    series:[{
      type:'radar', areaStyle:{opacity:.25},
      lineStyle:{width:2,color:p.cyan}, itemStyle:{color:p.cyan},
      data:[{value:j.sk, name:en?j.en:j.zh}]
    }]
  });
}

/* 人机协作指数自测 */
function skillTest() {
  const ids=['stRep','stData','stCre','stSoc','stDig'];
  const vals=ids.map(id=>+document.getElementById(id).value);
  ids.forEach(id=>{ document.getElementById(id+'V').textContent=document.getElementById(id).value; });
  // 重复劳动是负向，其余正向；数字工具与创造权重更高
  const score=Math.round(
    (100-vals[0])*.22 + vals[1]*.16 + vals[2]*.22 + vals[3]*.16 + vals[4]*.24
  );
  const en=isEn(), p=pal();
  document.getElementById('stScore').textContent=score;
  document.getElementById('stBar').style.width=score+'%';
  const lvl=score>=75?(en?'AI-Native Talent · You lead the machines':'AI原生人才 · 驾驭机器的人')
    :score>=55?(en?'Strong Collaborator · Human + AI > AI alone':'协作高手 · 人+AI > AI')
    :score>=35?(en?'Transition Zone · Actively upgrade your toolkit':'转型区间 · 主动升级工具箱')
    :(en?'High Exposure · Start using AI tools today':'高暴露区 · 今天就开始用AI工具');
  document.getElementById('stLvl').textContent=lvl;
  document.getElementById('stLvl').style.color=score>=55?p.green:score>=35?p.gold:p.red;
}

/* 岗位增减 & 技能变迁 */
const JOBS_LOST = [
  {v:-38,zh:'收银/票务员',en:'Cashiers & Ticket Clerks'},{v:-29,zh:'行政秘书',en:'Administrative Secretaries'},
  {v:-25,zh:'银行柜员',en:'Bank Tellers'},{v:-21,zh:'印刷/包装工',en:'Printing & Packaging Workers'},
  {v:-18,zh:'装配/流水线工',en:'Assembly Workers'},{v:-15,zh:'快递分拣员',en:'Parcel Sorters'},
];
const JOBS_NEW = [
  {v:42,zh:'AI/机器学习工程师',en:'AI / ML Engineers'},{v:35,zh:'大数据分析师',en:'Big-Data Specialists'},
  {v:30,zh:'养老护理员',en:'Elder-Care Workers'},{v:26,zh:'数字化转型顾问',en:'Digital Transformation Consultants'},
  {v:22,zh:'金融科技工程师',en:'FinTech Engineers'},{v:19,zh:'AI训练师/提示工程师',en:'AI Trainers / Prompt Engineers'},
];
const SKILLS = [
  {zh:'AI与大数据',en:'AI & Big Data',a:62,b:91},{zh:'创造性思维',en:'Creative Thinking',a:78,b:86},
  {zh:'分析思维',en:'Analytical Thinking',a:85,b:83},{zh:'韧性与灵活性',en:'Resilience & Flexibility',a:75,b:82},
  {zh:'技术素养',en:'Tech Literacy',a:72,b:80},{zh:'好奇心与终身学习',en:'Curiosity & Lifelong Learning',a:66,b:79},
  {zh:'领导力与影响力',en:'Leadership',a:55,b:66},
  {zh:'手工/体力技能',en:'Manual Skills',a:58,b:39},{zh:'基础读写算',en:'Basic Literacy & Math',a:72,b:56},
];
function jobsCharts() {
  const en=isEn(), p=pal();
  const c1=mkChart('jobsLostChart');
  c1.setOption({
    grid:{left:en?140:108,right:44,top:30,bottom:22},
    tooltip:tip({formatter:x=>`${x.name}<br>${en?'Change':'变化'}: ${x.value} ${en?'k persons':'万人'}`}),
    title:{text:en?'Jobs Declining 2025-30 (10k persons)':'岗位净收缩 TOP6（2025-2030，万人）',textStyle:{color:p.tx,fontSize:13},left:6,top:0},
    xAxis:{type:'value',axisLabel:{color:p.axis},axisLine:{lineStyle:{color:p.axis}},splitLine:{lineStyle:{color:p.gridLine}}},
    yAxis:{type:'category',inverse:true,data:JOBS_LOST.map(j=>en?j.en:j.zh),axisLabel:{color:p.tx,fontSize:11},axisTick:{show:false},axisLine:{lineStyle:{color:p.axis}}},
    series:[{type:'bar',barWidth:12,data:JOBS_LOST.map(j=>({value:j.v,itemStyle:{color:p.red,borderRadius:[7,0,0,7]}})),
      label:{show:true,position:'left',color:p.dim,fontSize:11,formatter:'{c}'}}]
  });
  const c2=mkChart('jobsNewChart');
  c2.setOption({
    grid:{left:en?140:108,right:44,top:30,bottom:22},
    tooltip:tip({formatter:x=>`${x.name}<br>${en?'Change':'变化'}: +${x.value} ${en?'k persons':'万人'}`}),
    title:{text:en?'Jobs Growing 2025-30 (10k persons)':'岗位净增长 TOP6（2025-2030，万人）',textStyle:{color:p.tx,fontSize:13},left:6,top:0},
    xAxis:{type:'value',axisLabel:{color:p.axis},axisLine:{lineStyle:{color:p.axis}},splitLine:{lineStyle:{color:p.gridLine}}},
    yAxis:{type:'category',inverse:true,data:JOBS_NEW.map(j=>en?j.en:j.zh),axisLabel:{color:p.tx,fontSize:11},axisTick:{show:false},axisLine:{lineStyle:{color:p.axis}}},
    series:[{type:'bar',barWidth:12,data:JOBS_NEW.map(j=>({value:j.v,itemStyle:{color:new echarts.graphic.LinearGradient(0,0,1,0,[{offset:0,color:p.green},{offset:1,color:p.cyan}]),borderRadius:[0,7,7,0]}})),
      label:{show:true,position:'right',color:p.dim,fontSize:11,formatter:'+{c}'}}]
  });
  const c3=mkChart('skillsChart');
  c3.setOption({
    color:[p.dim,p.cyan],
    legend:{data:['2025','2030'],top:0,right:10,textStyle:{color:p.tx}},
    grid:{left:en?150:118,right:40,top:34,bottom:22},
    tooltip:tip(),
    xAxis:{type:'value',max:100,axisLabel:{color:p.axis,formatter:'{value}%'},axisLine:{lineStyle:{color:p.axis}},splitLine:{lineStyle:{color:p.gridLine}}},
    yAxis:{type:'category',inverse:true,data:SKILLS.map(s=>en?s.en:s.zh),axisLabel:{color:p.tx,fontSize:11},axisTick:{show:false},axisLine:{lineStyle:{color:p.axis}}},
    series:[
      {name:'2025',type:'bar',barWidth:8,data:SKILLS.map(s=>s.a),itemStyle:{borderRadius:4,opacity:.55}},
      {name:'2030',type:'bar',barWidth:8,data:SKILLS.map(s=>s.b),itemStyle:{borderRadius:4}}
    ]
  });
}

/* ================================================================
   PART 3 — 技术谱系知识图谱 + 风险矩阵 + 治理雷达
   ================================================================ */
const KG = {
  nodes:[
    {id:'ai', n:0, zh:'人工智能',en:'Artificial Intelligence',cat:0},
    {id:'ml',n:1,zh:'机器学习',en:'Machine Learning',cat:0},
    {id:'dl',n:2,zh:'深度学习',en:'Deep Learning',cat:0},
    {id:'rl',n:1,zh:'强化学习',en:'Reinforcement Learning',cat:0},
    {id:'symbol',n:1,zh:'符号主义',en:'Symbolism',cat:3},
    {id:'sup',n:2,zh:'监督学习',en:'Supervised Learning',cat:1},
    {id:'unsup',n:2,zh:'无监督学习',en:'Unsupervised Learning',cat:1},
    {id:'cnn',n:3,zh:'CNN 卷积网络',en:'CNN',cat:1},
    {id:'rnn',n:3,zh:'RNN / LSTM',en:'RNN / LSTM',cat:1},
    {id:'trans',n:3,zh:'Transformer',en:'Transformer',cat:1},
    {id:'gnn',n:3,zh:'图神经网络',en:'GNN',cat:1},
    {id:'bert',n:4,zh:'BERT',en:'BERT',cat:2},
    {id:'gpt',n:4,zh:'GPT 系列',en:'GPT Series',cat:2},
    {id:'llm',n:3,zh:'大语言模型',en:'LLM',cat:2},
    {id:'multi',n:4,zh:'多模态模型',en:'Multimodal Models',cat:2},
    {id:'diff',n:4,zh:'扩散模型',en:'Diffusion Models',cat:2},
    {id:'agent',n:4,zh:'AI Agent 智能体',en:'AI Agents',cat:2},
    {id:'alphago',n:4,zh:'AlphaGo',en:'AlphaGo',cat:2},
    {id:'cv',n:5,zh:'计算机视觉',en:'Computer Vision',cat:4},
    {id:'nlp',n:5,zh:'自然语言处理',en:'NLP',cat:4},
    {id:'speech',n:5,zh:'语音识别',en:'Speech Recognition',cat:4},
    {id:'drive2',n:5,zh:'自动驾驶',en:'Autonomous Driving',cat:4},
    {id:'embod',n:5,zh:'具身智能/机器人',en:'Embodied AI / Robotics',cat:4},
    {id:'sci',n:5,zh:'AI for Science',en:'AI for Science',cat:4},
    {id:'gpu',n:6,zh:'算力·智算中心',en:'Compute · AI Data Centers',cat:5},
    {id:'data2',n:6,zh:'数据要素',en:'Data Factor',cat:5},
  ],
  links:[
    ['ai','ml'],['ai','symbol'],['ai','rl'],['ml','dl'],['ml','sup'],['ml','unsup'],
    ['dl','cnn'],['dl','rnn'],['dl','trans'],['dl','gnn'],
    ['trans','bert'],['trans','gpt'],['trans','multi'],['trans','diff'],
    ['gpt','llm'],['llm','agent'],['multi','cv'],['multi','nlp'],
    ['rl','alphago'],['rl','llm'],['cnn','cv'],['rnn','speech'],['rnn','nlp'],
    ['cv','drive2'],['cv','embod'],['llm','sci'],['multi','embod'],
    ['gpu','dl'],['data2','dl'],['data2','llm']
  ],
  detail:{
    ai:{zh:'研究如何让机器具备感知、推理、学习与决策能力的学科，是新一轮科技革命的核心。',en:'The science of making machines perceive, reason, learn and decide — the core of the new tech revolution.'},
    ml:{zh:'让计算机从数据中自动学习规律，而非逐条编写规则。',en:'Letting computers learn patterns from data instead of hand-coded rules.'},
    dl:{zh:'基于多层神经网络的表示学习，是2012年以来AI爆发的直接引擎。',en:'Representation learning with multi-layer neural networks — the direct engine of the AI boom since 2012.'},
    rl:{zh:'智能体在环境中试错、以奖励信号学习最优策略，AlphaGo与大模型推理的关键技术。',en:'Agents learn optimal policies through trial, error and rewards — key to AlphaGo and LLM reasoning.'},
    symbol:{zh:'用逻辑规则与知识推理实现智能的早期路线，如今与神经网络融合形成"神经-符号"AI。',en:'The early logic-and-rules route, now merging with neural nets into neuro-symbolic AI.'},
    trans:{zh:'2017年Google提出的自注意力架构，支持并行训练与超长上下文，是现代大模型的统一底座。',en:'Google\u2019s 2017 self-attention architecture enabling parallel training and long context — the foundation of modern LLMs.'},
    gpt:{zh:'生成式预训练Transformer系列，GPT-4 已在多项考试中达到人类前10%水平。',en:'Generative Pre-trained Transformer series; GPT-4 scores in the human top 10% on many exams.'},
    llm:{zh:'千亿参数级语言模型，正在成为像操作系统一样的智能基础设施。',en:'Hundred-billion-parameter language models becoming an OS-like intelligence infrastructure.'},
    agent:{zh:'能自主规划、调用工具、执行多步任务的智能体，被视为下一代"数字员工"。',en:'Autonomous planners that call tools and execute multi-step tasks — the next-generation digital workforce.'},
    multi:{zh:'同时理解文本、图像、语音、视频的模型，打通机器对物理世界的感知。',en:'Models understanding text, images, audio and video together — bridging machines to the physical world.'},
    diff:{zh:'通过逐步去噪生成高质量图像与视频，催生AIGC内容产业。',en:'Generates high-quality images and video via iterative denoising, powering the AIGC industry.'},
    alphago:{zh:'2016年战胜李世石，2017年Master连胜人类60局，让世界重新认识深度学习。',en:'Beat Lee Sedol in 2016 and won 60 straight as Master in 2017, putting deep learning on the world stage.'},
    cv:{zh:'让机器"看懂"图像与视频：人脸识别、质检、医学影像、自动驾驶的眼睛。',en:'Making machines see: facial recognition, QC, medical imaging and the eyes of autonomous driving.'},
    nlp:{zh:'让机器理解与生成语言：翻译、搜索、写作、知识问答。',en:'Machine understanding and generation of language: translation, search, writing, QA.'},
    drive2:{zh:'感知-预测-规控全链路AI化，预计重塑出行、物流与城市空间。',en:'Full-stack AI for perception-prediction-planning, reshaping mobility, logistics and cities.'},
    embod:{zh:'AI进入机器人身体，在物理世界中行动——2025年人形机器人进入量产元年。',en:'AI entering robotic bodies to act in the physical world — humanoid robots entered mass production in 2025.'},
    sci:{zh:'AI预测蛋白质结构、加速药物发现、辅助可控核聚变，重塑科学研究范式。',en:'Protein prediction, drug discovery and fusion research — reshaping the paradigm of scientific discovery.'},
    gpu:{zh:'并行算力是智能时代的"发电机"：一次大模型训练需数千张GPU协同工作。',en:'Parallel compute is the power generator of the intelligence age — one LLM run needs thousands of GPUs.'},
    data2:{zh:'数据是新的生产要素，经清洗、标注、交易后转化为模型能力与产业价值。',en:'Data is a new production factor — cleaned, labeled and traded into model capability and industrial value.'},
    sup:{zh:'用带标签数据训练预测模型，占当前产业落地的80%以上。',en:'Training predictive models on labeled data — over 80% of today\u2019s industrial AI.'},
    unsup:{zh:'从无标签数据中发现结构，聚类、降维与大模型预训练的理论基础。',en:'Finding structure in unlabeled data — basis of clustering, dimensionality reduction and LLM pretraining.'},
    cnn:{zh:'擅长提取空间特征，是图像识别的经典架构。',en:'Excels at spatial features — the classic architecture for image recognition.'},
    rnn:{zh:'按时间序列处理信息，奠定语音与早期翻译系统。',en:'Processes information in sequence — foundation of early speech and translation systems.'},
    gnn:{zh:'直接在图结构数据上学习，用于药物分子、社交网络与推荐系统。',en:'Learns on graph-structured data for molecules, social networks and recommendation.'},
    bert:{zh:'双向理解编码器，曾把11项NLP纪录刷到人类水平之上。',en:'Bidirectional encoder that pushed 11 NLP benchmarks past human performance.'},
    speech:{zh:'语音转文字、语音合成与声纹识别，催生智能助理与会议AI。',en:'Speech-to-text, synthesis and voiceprint recognition, powering assistants and meeting AI.'}
  }
};
function kgChart() {
  const c=mkChart('kgChart'); if(!c) return;
  const en=isEn(), p=pal();
  const catColors=[p.cyan,'#38bdf8','#818cf8',p.purple,'#e879f9',p.green,p.gold];
  const cats=(en?['Core','Paradigm','Architecture','Model','Application','Foundation','Classical']
    :['核心','范式','网络架构','模型','应用','基础支撑','早期路线'])
    .map((name,i)=>({name,itemStyle:{color:catColors[i]}}));
  const dom=c.getDom();
  const W=Math.max(dom.clientWidth||600,320), H=Math.max(dom.clientHeight||320,220);
  // 均匀网格 + 轻微随机抖动：节点均匀铺满画布（可缩放、放大不被遮挡）
  let _seed=42;
  const rnd=()=>{let t=++_seed+0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
  const n=KG.nodes.length;
  const padTop=H*0.14, padY=H*0.12;            // 顶部留出图例空间，四周留边距
  const uW=W-24, uH=H-padTop-padY;
  const cols=Math.ceil(Math.sqrt(n*uW/uH));     // 按宽高比取列数，网格接近方形、均匀
  const rows=Math.ceil(n/cols);
  const coord={};
  const order=Array.from({length:n},(_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  KG.nodes.forEach((node,idx)=>{
    const oi=order[idx];
    const col=oi%cols, row=Math.floor(oi/cols);
    const cx=(col+0.5)/cols*uW+12;
    const cy=padTop+(row+0.5)/rows*uH;
    coord[node.id]=[cx+(rnd()-.5)*uW/cols*.55, cy+(rnd()-.5)*uH/rows*.55];
  });
  c.setOption({
    tooltip:tip({formatter:x=>x.dataType==='node'?(en?x.data.en:x.data.zh):''}),
    legend:[{data:cats.map(c=>c.name),textStyle:{color:p.tx,fontSize:11},top:6,icon:'circle',itemWidth:9,itemHeight:9}],
    series:[{
      type:'graph', layout:'none',
      roam:{scale:true,move:true,scaleLimit:{min:.4,max:1.8}},
      draggable:true,
      categories:cats,
      label:{show:true,color:p.tx,fontSize:10},
      lineStyle:{color:isLight()?'rgba(100,116,139,.4)':'rgba(142,163,196,.3)',width:1.2,curveness:.08},
      emphasis:{focus:'adjacency',lineStyle:{width:2.5}},
      data:KG.nodes.map(n=>({
        id:n.id, name:n.id, zh:n.zh, en:n.en, cat:n.cat, n:n.n,
        label:{formatter:en?n.en:n.zh},
        category:n.cat,
        symbolSize:n.cat===0?46:n.n<=3?30:22,
        x:coord[n.id][0], y:coord[n.id][1]
      })),
      links:KG.links.map(l=>({source:l[0],target:l[1]}))
    }]
  });
  c.off('click');
  c.on('click',x=>{
    if(x.dataType!=='node')return;
    const d=KG.detail[x.data.id];
    document.getElementById('kgDetail').innerHTML =
      `<b>${x.data.zh} · ${x.data.en}</b><p>${en?d.en:d.zh}</p>`;
  });
}
const RISKS=[
  {v:[88,72,62],zh:'虚假信息与深度伪造',en:'Disinformation & Deepfakes',short:{zh:'虚假信息',en:'Deepfakes'}},
  {v:[82,80,70],zh:'数据隐私泄露',en:'Data Privacy Breaches',short:{zh:'隐私泄露',en:'Privacy'}},
  {v:[80,75,58],zh:'算法偏见与歧视',en:'Algorithmic Bias & Discrimination',short:{zh:'算法偏见',en:'Bias'}},
  {v:[78,55,46],zh:'算力能耗压力',en:'Compute Energy Footprint',short:{zh:'算力能耗',en:'Energy'}},
  {v:[72,50,40],zh:'版权与劳动权益',en:'Copyright & Labor Rights',short:{zh:'版权权益',en:'Copyright'}},
  {v:[70,85,72],zh:'结构性失业冲击',en:'Structural Unemployment',short:{zh:'就业冲击',en:'Jobs'}},
  {v:[60,92,80],zh:'关键设施网络攻击',en:'Critical-Infrastructure Attacks',short:{zh:'设施攻击',en:'Cyberattacks'}},
  {v:[35,95,85],zh:'长期对齐与失控风险',en:'Long-term Alignment / Loss of Control',short:{zh:'失控风险',en:'Alignment'}},
];
function riskChart() {
  const c=mkChart('riskChart'); if(!c) return;
  const en=isEn(), p=pal();
  const callouts=[[85,35],[70,67],[63,56],[57,35],[50,18],[60,96],[46,76],[12,84]];
  const compactCallouts=[[1,3],[0,3],[1,2],[0,2],[1,1],[0,1],[1,0],[0,0]];
  // 密集点的文字落点（放到空白处，避免挤在圆旁）：0虚假/1隐私/2算法/3算力/4版权/5就业
  const calloutMap={0:[78,36],1:[52,55],2:[58,72],3:[78,20],4:[50,22],5:[62,30]};
  c.setOption({
    grid:{left:52,right:26,top:34,bottom:46},
    tooltip:tip({formatter:x=>{
      const [likelihood,impact,,index]=x.data.value;
      const risk=RISKS[index];
      return `${en?risk.en:risk.zh}<br>${en?'Likelihood':'发生概率'}: ${likelihood}%<br>${en?'Impact':'影响程度'}: ${impact}%`;
    }}),
    xAxis:{name:en?'Likelihood (%)':'发生概率 (%)',nameLocation:'middle',nameGap:28,nameTextStyle:{color:p.dim},
      min:0,max:100,axisLabel:{color:p.axis,formatter:v=>+v===60?'':`${v}%`},axisLine:{lineStyle:{color:p.axis}},splitLine:{lineStyle:{color:p.gridLine}}},
    yAxis:{name:en?'Impact':'影响',nameTextStyle:{color:p.dim},min:0,max:100,
      axisLabel:{color:p.axis,formatter:'{value}%'},axisLine:{lineStyle:{color:p.axis}},splitLine:{lineStyle:{color:p.gridLine}}},
    series:[{
      type:'scatter',
      symbolSize:d=>d[2]*.32+7,
      data:RISKS.map((r,i)=>({value:[...r.v,i],
        itemStyle:{color:r.v[0]>=70&&r.v[1]>=70?p.red:r.v[0]>=60?p.gold:p.cyan,opacity:.72,borderColor:'#fff2'}})),
      label:{show:false},
      markLine:{silent:true,symbol:'none',lineStyle:{color:p.dim,type:'dashed',opacity:.5},
        data:[{xAxis:60},{yAxis:60}]}
    },{
      type:'custom',coordinateSystem:'cartesian2d',silent:true,z:2,
      data:RISKS.map((risk,i)=>[risk.v[0],risk.v[1],callouts[i][0],callouts[i][1],i]),
      renderItem:(params,api)=>{
        const [x,y,labelX,labelY,index]=[0,1,2,3,4].map(i=>api.value(i));
        const point=api.coord([x,y]);
        const size=RISKS[index].v[2]*.32+7;
        const bg=isLight()?'rgba(255,255,255,.94)':'rgba(8,18,38,.9)';
        const color=isLight()?'rgba(71,85,105,.72)':'rgba(190,205,230,.78)';
        const short=en?RISKS[index].short.en:RISKS[index].short.zh;
        if(index>=6){
          // 设施/失控：孤立大圆，文字贴圆上方，无箭头
          const ty=point[1]-size/2-5;
          return {type:'group',children:[{type:'text',style:{
            x:point[0],y:ty,text:short,font:'600 10px sans-serif',fill:p.tx,
            textAlign:'center',textVerticalAlign:'middle',backgroundColor:bg,padding:[2,4],borderRadius:3
          }}]};
        }
        // 密集点：文字写到旁边空白位置，箭头从圆指向文字
        const [cx,cy]=calloutMap[index];
        const label=api.coord([cx,cy]);
        const vx=point[0]-label[0],vy=point[1]-label[1],len=Math.hypot(vx,vy)||1;
        const ux=vx/len,uy=vy/len,px=-uy,py=ux;
        const edgeX=point[0]+ux*(size/2+2),edgeY=point[1]+uy*(size/2+2);
        const tipX=label[0],tipY=label[1];
        return {type:'group',children:[
          {type:'polyline',shape:{points:[[edgeX,edgeY],[tipX-ux*6,tipY-uy*6]]},style:{stroke:color,lineWidth:1,fill:null}},
          {type:'polygon',shape:{points:[[tipX,tipY],[tipX-ux*6+px*3,tipY-uy*6+py*3],[tipX-ux*6-px*3,tipY-uy*6-py*3]]},style:{fill:color}},
          {type:'text',style:{x:label[0],y:label[1],text:short,font:'600 10px sans-serif',fill:p.tx,textAlign:'left',textVerticalAlign:'middle',backgroundColor:bg,padding:[2,4],borderRadius:3}}
        ]};
      }
    }]
  });
}
function govChart() {
  const c=mkChart('govChart'); if(!c) return;
  const en=isEn(), p=pal();
  const dims=en?['Regulation','Innovation','Data Governance','Ethics','Global Voice']
    :['监管完善','创新速度','数据治理','伦理共识','国际话语权'];
  c.setOption({
    color:[p.cyan,p.gold,p.purple,p.dim],
    legend:{bottom:0,left:'center',textStyle:{color:p.tx,fontSize:11}},
    tooltip:tip(),
    radar:{indicator:dims.map(d=>({name:d,max:100})),radius:'54%',center:['50%','46%'],
      axisName:{color:p.tx,fontSize:11},splitLine:{lineStyle:{color:p.gridLine}},
      splitArea:{show:false},axisLine:{lineStyle:{color:p.gridLine}}},
    series:[{type:'radar',symbolSize:4,
      data:[
        {name:'EU 欧盟',value:[100,100,100,8,8],lineStyle:{width:2.5}},
        {name:'US 美国',value:[30,8,8,100,100],lineStyle:{width:2.5}},
        {name:'China 中国',value:[82,90,84,76,74],areaStyle:{opacity:.08},lineStyle:{width:2.5}},
        {name:en?'Global Avg.':'全球均值',value:[72,80,70,70,68],lineStyle:{type:'dashed',width:1.5},areaStyle:{opacity:.03}}
      ]}]
  });
}

/* ================================================================
   统一初始化 & 语言/主题刷新
   ================================================================ */
function buildAllCharts() {
  if (typeof echarts==='undefined') return;
  benchChart(); jobsCharts(); kgChart(); riskChart(); govChart();
  if (document.getElementById('jobGauge')) jobPanel(curJob);
  if (jobRadar) jobRadar.resize();
}
function bindOnce() {
  if (!document.getElementById('mlCanvas')) return;
  initMLSandbox();
  document.querySelectorAll('[data-job]').forEach(b=>b.addEventListener('click',()=>jobPanel(b.dataset.job)));
  ['stRep','stData','stCre','stSoc','stDig'].forEach(id=>{
    document.getElementById(id).addEventListener('input',skillTest);
  });
  skillTest();
  jobPanel(curJob);
  // 知识图谱默认详情
  document.getElementById('kgDetail').innerHTML =
    `<b>${isEn()?'Click any node':'点击任意节点'}</b><p>${isEn()?'Drag nodes to explore the AI technology family tree; click a node to read its explanation.':'拖拽节点探索 AI 技术族谱，点击节点查看它在智能革命中的角色。'}</p>`;
  // 滚动懒加载图表（只触发一次完整构建，避免多目标重复 dispose/init）
  let ioFired=false;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting && !ioFired){ ioFired=true; buildAllCharts(); }
  }),{threshold:.08});
  ['benchChart','jobsLostChart','kgChart','riskChart'].forEach(id=>{const el=document.getElementById(id); if(el)io.observe(el);});
  window.addEventListener('resize',()=>{ Object.values(chartInsts).forEach(c=>c.resize()); if(jobRadar)jobRadar.resize(); });
}
window.refreshAILab=function(){
  buildAllCharts();
  // 刷新静态动态文案（职业详情、自测）
  if (document.getElementById('jobName')) { jobPanel(curJob); skillTest(); }
};
if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindOnce);
else bindOnce();
})();
