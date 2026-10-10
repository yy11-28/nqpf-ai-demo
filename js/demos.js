/* =========================================================
 * 交互实验室 v3 —— 观察式对比
 * 用户只点 1~3 个"说人话"的按钮，画面自动并排播放
 * 「传统方式 vs AI 智能体」的应对过程，分差实时拉开，
 * 结尾一张结论卡直说 AI 在该领域的作用。
 * ========================================================= */

let demoCleanup = null;
function cleanupDemo(){ if(demoCleanup){ try{demoCleanup();}catch(e){} demoCleanup=null; } }

function B(zh, en){ return (window.Lc && Lc.getLang() === 'en') ? en : zh; }

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const $ = (r, s) => r.querySelector(s);
const $$ = (r, s) => Array.from(r.querySelectorAll(s));
const rnd = (a, b) => a + Math.random() * (b - a);

function chip(label, id){ return `<div class="demo-chip">${label}<b id="${id}">—</b></div>`; }
function setChip(root, id, val, win){
  const el = $(root, '#' + id); if(!el) return;
  el.textContent = val;
  el.classList.toggle('win', !!win);
}
function action(root, id, cb){ const b = $(root, '#' + id); if(b) b.addEventListener('click', cb); }
function sceneBtn(id, label){ return `<button class="demo-btn scene-btn" id="${id}">${label}</button>`; }
function evidence(root, html){
  const e = $(root, '.nq-evidence'); if(!e) return;
  e.innerHTML = html; e.classList.add('show', 'verdict');
}
function canvasKit(root, id){
  const cv = $(root, '#' + id), ctx = cv.getContext('2d');
  const rs = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
  rs(); const ro = new ResizeObserver(rs); ro.observe(cv);
  return { cv, ctx, ro };
}
/* 双列对比骨架：actionsHTML = 场景按钮；L/R = {html, kpis, msg} */
function duelCols(actionsHTML, L, R){
  return `
  <div class="duel-actions">${actionsHTML}</div>
  <div class="duel">
    <div class="duel-col is-trad">
      <div class="duel-tag">👷 ${B('传统方式','Traditional')}</div>
      <div class="duel-stage">${L.html}</div>
      <div class="duel-msg" id="${L.msg}"></div>
      <div class="duel-kpis">${L.kpis}</div>
    </div>
    <div class="duel-col is-ai">
      <div class="duel-tag">🤖 ${B('AI 智能体','AI Agent')}</div>
      <div class="duel-stage">${R.html}</div>
      <div class="duel-msg" id="${R.msg}"></div>
      <div class="duel-kpis">${R.kpis}</div>
    </div>
  </div>
  <div class="demo-result nq-evidence"></div>`;
}
function setMsg(root, id, html){ const el = $(root, '#' + id); if(el) el.innerHTML = html; }

const DEMO_META = {
  manufacture:{ t:() => B('同一间工厂，两种大脑','One Factory, Two Brains'), h:() => B('点一个按钮触发真实生产事件：左边传统车间、右边 AI 工厂自动应对——看数字怎么拉开。','Press a button to fire a real production event: the traditional line on the left and the AI line on the right react automatically — watch the gap open.') },
  medical:{ t:() => B('深夜的急诊 CT 海','Midnight Flood of CT Scans'), h:() => B('深夜急诊涌入大批 CT。点按钮让两边同时开工：一位医生 vs 一条 AI 阅片流水线。','A midnight flood of CT scans hits. Press start: one radiologist versus an AI reading pipeline, side by side.') },
  agriculture:{ t:() => B('同一场天灾，两种收成','One Disaster, Two Harvests'), h:() => B('选一种灾害按下播放，两块田同时经历它——全靠人 vs 全靠数据。','Pick a disaster and hit play: both fields live through the same weather — experience versus data.') },
  transport:{ t:() => B('救护车的生死竞速','Ambulance Race for Life'), h:() => B('同样的车、同样的司机、同样的路线，唯一不同：红绿灯由谁控制。','Same car, same driver, same route. The only difference: who controls the traffic lights.') },
  education:{ t:() => B('8 周之后的分岔路','Two Paths After 8 Weeks'), h:() => B('选一个学生，按下开始，看传统课堂和 AI 助教分别带他走过 8 周。','Pick a student and press start: the one-size classroom versus the AI tutor over 8 weeks.') },
  finance:{ t:() => B('追踪一笔脏钱','Chasing Dirty Money'), h:() => B('一笔洗钱资金混入网络。看传统风控和 AI 资金图谱，分别能追到哪一步。','Dirty money enters the network. Watch how far rule-based monitoring and an AI fund graph can each follow it.') },
};

function renderDemo(key){
  cleanupDemo();
  const stage = document.getElementById('demoStage');
  if(!stage) return;
  const meta = DEMO_META[key] || DEMO_META.manufacture;
  document.getElementById('demoTitle').textContent = meta.t();
  document.getElementById('demoHint').textContent = meta.h();
  stage.innerHTML = '';
  const builders = { manufacture: demoManufacture, medical: demoMedical, agriculture: demoAgriculture, transport: demoTransport, education: demoEducation, finance: demoFinance };
  demoCleanup = builders[key] ? builders[key](stage) : null;
}

/* ============ 1. 智能制造：同一间工厂，两种大脑 ============ */
function demoManufacture(stage){
  function lineHTML(p){
    return `<div class="line-strip">
      <div class="belt ${p}belt"><i></i><span class="belt-count" id="${p}Cnt">0 ${B('件','pcs')}</span></div>
      <div class="machines">
        ${[1,2,3].map(n => `<div class="machine ok" id="${p}m${n}"><span class="mdot"></span><span>${B('机床','Machine')}${n}</span></div>`).join('')}
      </div>
    </div>`;
  }
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    sceneBtn('mGo',   B('▶️ 开工：正常的一天','▶️ Start: a normal day')) +
    sceneBtn('mFault',B('🛠 突发：机床异响','🛠 Machine makes noise')) +
    sceneBtn('mRush', B('🔥 插入加急订单','🔥 Rush order in')),
    { html: lineHTML('t'), kpis: chip(B('今日产量','Output'),'tOut') + chip(B('停机','Downtime'),'tDown') + chip(B('准时交付','On-time'),'tOTD'), msg: 'tMsg' },
    { html: lineHTML('a'), kpis: chip(B('今日产量','Output'),'aOut') + chip(B('停机','Downtime'),'aDown') + chip(B('准时交付','On-time'),'aOTD'), msg: 'aMsg' }
  )}</div>`;

  const T = [], Iv = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));
  const every = (f, ms) => { const i = setInterval(f, ms); Iv.push(i); return i; };

  const S = {
    t: { out:0, down:0, otd:100, st:'idle', target:0 },
    a: { out:0, down:0, otd:100, st:'idle', target:0 },
  };
  let running = false, faultPlayed = false;

  function stName(s){
    return { idle:B('待命中…','Idle'), run:B('生产中','Running'), down:B('故障停机','BREAKDOWN'),
             repair:B('智能检修','Smart repair'), slow:B('降速运行','Slow-down'), replan:B('手工重排…','Manual replan…') }[s] || s;
  }
  function beltCls(p, s){
    const b = $(stage, '.' + p + 'belt'); if(!b) return;
    b.classList.remove('run','stop','slow');
    if(s === 'run') b.classList.add('run');
    else if(s === 'down') b.classList.add('stop');
    else if(s === 'slow' || s === 'replan' || s === 'repair') b.classList.add('slow');
  }
  function mach(p, n, cls){ const el = $(stage, '#' + p + 'm' + n); if(el){ el.className = 'machine ' + cls; } }

  function tick(){
    if(!running) return;
    ['t','a'].forEach(p => {
      const s = S[p];
      if(s.st === 'down'){
        s.down += 24;                                  // 每 tick ≈ 24 分钟模拟
        if(s.down >= s.target){
          s.st = 'run';
          if(p === 't') setMsg(stage, 'tMsg', B('6 小时后终于修复，恢复生产——今天的交付已延期。','Fixed after 6h. Back to work — today\'s delivery is already late.'));
          else setMsg(stage, 'aMsg', B('检修完成，几乎零影响，继续满速生产。','Repair done in a shift gap. Barely any impact.'));
        }
      } else if(s.st === 'repair'){ s.down += 24; s.out += 2; if(s.down >= s.target){ s.st = 'run'; mach('a',3,'ok'); beltCls('a','run'); setMsg(stage,'aMsg',B('✅ 检修完成，产量几乎没受影响。','✅ Repaired. Output barely dipped.')); } }
      else if(s.st === 'slow'){ s.out += 3; }
      else if(s.st === 'replan'){ /* 停手等重排 */ }
      else if(s.st === 'run'){ s.out += 6; }
    });
    upd();
  }
  function upd(){
    setChip(stage, 'tOut', Math.round(S.t.out));
    setChip(stage, 'aOut', Math.round(S.a.out), S.a.out >= S.t.out);
    setChip(stage, 'tDown', Math.round(S.t.down) + B(' 分','m'));
    setChip(stage, 'aDown', Math.round(S.a.down) + B(' 分','m'), S.a.down <= S.t.down);
    setChip(stage, 'tOTD', S.t.otd + '%');
    setChip(stage, 'aOTD', S.a.otd + '%', S.a.otd >= S.t.otd);
  }
  function verdict(){
    evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B('AI 最大的本事不是干得快，而是<b>提前知道要出事</b>：声纹监测在故障前发现轴承磨损，把"6 小时意外停机"变成"换班间隙 1 小时检修"；订单一变，智能体 0.3 秒完成重排。预测性维护让非计划停机减少约 85% —— 这一幕正在全球 189 家"灯塔工厂"每天上演。','AI\'s real power is not speed — it is <b>knowing trouble before it happens</b>. Acoustic monitoring spots bearing wear days early, turning a 6-hour breakdown into a 1-hour planned repair; the agent reschedules in 0.3 s. Predictive maintenance cuts unplanned downtime by ~85% — happening daily in the world\'s 189 "lighthouse factories".')}</p>`);
  }

  every(tick, 600);

  action(stage, 'mGo', () => {
    running = true;
    S.t.st = S.a.st = 'run';
    beltCls('t','run'); beltCls('a','run');
    setMsg(stage, 'tMsg', B('开工，三台机床满负荷生产。','Lines running at full load.'));
    setMsg(stage, 'aMsg', B('开工，三台机床满负荷生产。','Lines running at full load.'));
  });

  action(stage, 'mFault', () => {
    if(!running){ running = true; S.t.st = S.a.st = 'run'; beltCls('t','run'); beltCls('a','run'); }
    faultPlayed = true;
    mach('t',3,'bad'); beltCls('t','stop');
    S.t.st = 'down'; S.t.target = S.t.down + 360;    // 6 小时
    setMsg(stage, 'tMsg', B('⚡ 3 号机床突然异响罢工！老师傅紧急抢修，全线停产 6 小时…','⚡ Machine 3 seizes! Emergency repair stops the whole line for 6 hours…'));
    mach('a',3,'warn'); beltCls('a','slow'); S.a.st = 'slow';
    setMsg(stage, 'aMsg', B('🔔 AI 声纹监测：3 号主轴轴承磨损 72%，安排在换班间隙检修…','🔔 AI acoustic monitor: spindle bearing 72% worn — repair scheduled for the shift change…'));
    later(() => {
      mach('a',3,'fix'); S.a.st = 'repair'; S.a.target = S.a.down + 60;   // 1 小时
      setMsg(stage, 'aMsg', B('🔧 换班间隙自动检修中（约 1 小时），产线降速不停转。','🔧 Auto-repair in the shift gap (~1 h); line slows but never stops.'));
    }, 2400);
    later(verdict, 5200);
  });

  action(stage, 'mRush', () => {
    if(!running){ running = true; S.t.st = S.a.st = 'run'; beltCls('t','run'); beltCls('a','run'); }
    S.t.st = 'replan'; beltCls('t','slow'); S.t.otd -= 8;
    setMsg(stage, 'tMsg', B('📋 急单插入！调度员放下手头工作手工重排，其他订单全部顺延…','📋 Rush order! The planner drops everything to reshuffle by hand; all other orders slip.'));
    setMsg(stage, 'aMsg', B('⚡ 智能体 0.3 秒重排完成：急单插到队首，其余订单纹丝不动。','⚡ Agent rescheduled in 0.3 s: rush first, nothing else moves.'));
    S.a.otd = Math.min(100, S.a.otd);
    later(() => { S.t.st = 'run'; beltCls('t','run'); }, 3000);
    if(faultPlayed) later(verdict, 1200);
  });

  return () => { T.forEach(clearTimeout); Iv.forEach(clearInterval); };
}

/* ============ 2. 医疗：深夜的急诊 CT 海 ============ */
function demoMedical(stage){
  const POS = new Set([3, 9, 15]);                    // 20 张急诊里的 3 张阳性
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    sceneBtn('sNight', B('🌙 深夜高峰来袭：一次涌入 20 张 CT','🌙 Midnight rush: 20 CTs at once')) +
    sceneBtn('sZoom',  B('🔍 看看 AI 圈出了什么','🔍 What did AI circle?')),
    { html:`<div class="med-trad">
        <div class="med-doc">🧑‍⚕️ ${B('放射科医生 × 1（全院就这一位值夜班）','Radiologist × 1 (the only one on call)')}</div>
        <div class="med-queue" id="mQ"></div>
      </div>`,
      kpis: chip(B('已阅片','Read'),'tDone') + chip(B('还在排队','Queued'),'tQueue') + chip(B('最长等待','Max wait'),'tWait'), msg: 'tMsg2' },
    { html:`<div class="med-ai">
        <div class="med-flow-label">🤖 AI 预筛流水线 <span>· 0.3 ${B('秒/张','s/scan')}</span></div>
        <div class="med-flow" id="aFlow"></div>
        <div class="med-review" id="aReview"><span class="mr-hint">${B('医生复核区（只有 AI 拿不准的才会进来）','Doctor review bay (only AI-flagged scans)')}</span></div>
      </div>`,
      kpis: chip(B('已阅片','Read'),'aDone') + chip(B('还在排队','Queued'),'aQueue') + chip(B('最长等待','Max wait'),'aWait'), msg: 'aMsg2' }
  )}</div>
  <div class="ct-zoom" id="ctZoom">
    <div class="ctz-head"><b>🔬 ${B('AI 标注示例：一张胸部 CT','AI annotation on a chest CT')}</b><button class="demo-btn" id="ctzClose">✕</button></div>
    <canvas id="ctzCv" width="520" height="300"></canvas>
    <p class="ctz-note">${B('红圈即 AI 标出的疑似结节位置与置信度——医生第一天上班就能看懂，不需要十年阅片经验。','The red circle is where AI flags a suspected nodule, with a confidence score — readable on day one, no decade of experience required.')}</p>
  </div>`;

  const T = [], Iv = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));
  const every = (f, ms) => { const i = setInterval(f, ms); Iv.push(i); return i; };

  let total = 3;
  const st = { t:{done:0, left:3, clock:18*60}, a:{done:0, left:3, review:0, clock:18*60, idx:0} };
  let started = false, verdicted = false;

  function clockStr(min){ const h = Math.floor(min/60)%24, m = Math.round(min%60); return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; }
  function fmtWait(min){ return min >= 60 ? (min/60).toFixed(1) + B(' 小时',' h') : Math.round(min) + B(' 分钟',' min'); }

  function renderQueue(){
    const q = $(stage, '#mQ'); if(!q) return;
    const show = Math.min(st.t.left, 7);
    let html = '';
    for(let i = 0; i < show; i++) html += `<div class="mq-card" style="opacity:${1 - i*0.09}">🩻 CT</div>`;
    if(st.t.left > show) html += `<div class="mq-more">…${B('还有','and')} ${st.t.left - show} ${B('张','more')}</div>`;
    if(st.t.left === 0) html = `<div class="mq-done">✅ ${B('全部阅完','All read')}</div>`;
    q.innerHTML = html;
  }
  function upd(){
    setChip(stage, 'tDone', st.t.done); setChip(stage, 'aDone', st.a.done, st.a.done >= st.t.done);
    setChip(stage, 'tQueue', st.t.left); setChip(stage, 'aQueue', st.a.left + st.a.review, st.a.left + st.a.review <= st.t.left);
    const tw = st.t.left * 8, aw = st.a.left * 0.3 + st.a.review * 3;
    setChip(stage, 'tWait', fmtWait(tw)); setChip(stage, 'aWait', fmtWait(Math.max(aw, 0)), aw <= tw);
  }
  function verdict(){
    if(verdicted) return; verdicted = true;
    evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B('AI 没有取代医生——它把 <b>17 张正常片子秒过</b>，把 3 张可疑的自动圈出来推给医生复核。<b>等待从 4 个多小时缩到十几分钟</b>，医生从"一张张翻"变成"只看最要紧的"。对胸痛、卒中的急诊患者，这几小时就是生死之差。','AI does not replace the radiologist — it clears <b>17 normal scans in seconds</b> and auto-circles the 3 suspicious ones. Waiting time drops from hours to minutes; the doctor reads only what matters. For stroke or chest-pain patients, those hours are the difference between life and death.')}</p>`);
  }

  renderQueue(); upd();

  action(stage, 'sNight', () => {
    if(started) return; started = true;
    total = 23; st.t.left += 20; st.a.left += 20;
    setMsg(stage, 'tMsg2', B('🌙 23 张 CT 同时涌入——医生按顺序一张张读，每张约 8 分钟。','🌙 23 CTs flood in — one doctor reads them one by one, ~8 min each.'));
    setMsg(stage, 'aMsg2', B('🌙 同样 23 张——AI 流水线 0.3 秒预筛一张，可疑的才推给医生。','🌙 Same 23 CTs — AI pre-screens each in 0.3 s; only flagged ones reach the doctor.'));
    renderQueue(); upd();

    every(() => {                                        // 传统：1.2 真实秒 = 1 张（模拟 8 分钟）
      if(st.t.left <= 0) return;
      st.t.left--; st.t.done++; st.t.clock += 8;
      renderQueue(); upd();
      setMsg(stage, 'tMsg2', B(`🕐 ${clockStr(st.t.clock)} · 已读 ${st.t.done} 张 · 还有 ${st.t.left} 张在排队`,'🕐 '+clockStr(st.t.clock)+' · read '+st.t.done+' · '+st.t.left+' still waiting'));
      if(st.t.left === 0){ setMsg(stage, 'tMsg2', B(`🕐 ${clockStr(st.t.clock)} 全部读完——离涌入已过去 3 个多小时。`,`🕐 ${clockStr(st.t.clock)} all read — more than 3 hours after the flood.`)); verdict(); }
    }, 1200);

    every(() => {                                        // AI 流水线
      if(st.a.left <= 0){ if(st.a.review <= 0 && !verdicted){ setMsg(stage, 'aMsg2', B(`🕐 ${clockStr(st.a.clock)} 预筛+复核全部完成——从涌入到清零仅 12 分钟。`,`🕐 ${clockStr(st.a.clock)} screened & reviewed — 12 minutes end to end.`)); verdict(); } return; }
      st.a.left--; st.a.done++; st.a.idx++; st.a.clock += 0.3;
      const flow = $(stage, '#aFlow'); if(!flow) return;
      const card = document.createElement('div');
      card.className = 'ct-card'; flow.appendChild(card);
      const isPos = POS.has(st.a.idx);
      setTimeout(() => {
        if(isPos){
          card.classList.add('bad');
          st.a.review++; st.a.clock += 3;
          const rv = $(stage, '#aReview');
          if(rv){ const h = rv.querySelector('.mr-hint'); const c = card.cloneNode(true); rv.appendChild(c); if(h) h.remove(); }
          setMsg(stage, 'aMsg2', B(`🚨 第 ${st.a.idx} 张可疑！AI 已圈出位置（置信度 92%）→ 送医生复核`,'🚨 Case '+st.a.idx+' flagged! AI circled the spot (92%) → doctor review'));
        } else card.classList.add('ok');
        upd();
        if(!isPos) setTimeout(() => card.remove(), 700);
        else setTimeout(() => { card.remove(); const rv = $(stage, '#aReview'); if(rv){ const c = rv.querySelector('.ct-card'); if(c) c.remove(); } }, 1600);
      }, 360);
      if(st.a.left === 0) setMsg(stage, 'aMsg2', B('✅ 23 张预筛完毕，等 3 张复核结束','✅ 23 screened — 3 in doctor review'));
      upd();
    }, 400);
  });

  action(stage, 'sZoom', () => { const z = $(stage, '#ctZoom'); if(z) z.classList.add('open'); drawCT(); });
  action(stage, 'ctzClose', () => { const z = $(stage, '#ctZoom'); if(z) z.classList.remove('open'); });

  function drawCT(){
    const cv = $(stage, '#ctzCv'); if(!cv) return;
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#0a0f1c'; ctx.fillRect(0,0,w,h);
    const cx = 200, cy = 150, R = 118;
    const g = ctx.createRadialGradient(cx,cy,20,cx,cy,R);
    g.addColorStop(0,'#3b4358'); g.addColorStop(1,'#1a2030');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fill();
    ctx.fillStyle = 'rgba(14,18,30,.85)';                        // 双肺
    ctx.beginPath(); ctx.ellipse(cx-45,cy+8,38,62,.12,0,7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+45,cy+8,38,62,-.12,0,7); ctx.fill();
    ctx.fillStyle = '#454e66';                                   // 纵隔
    ctx.beginPath(); ctx.ellipse(cx,cy,20,52,0,0,7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.10)';                     // 纹理
    for(let i=0;i<130;i++){ ctx.fillRect(cx-100+rnd(0,200), cy-100+rnd(0,200), 1.4, 1.4); }
    const nx = cx+52, ny = cy-6;                                 // 结节
    const ng = ctx.createRadialGradient(nx,ny,1,nx,ny,9);
    ng.addColorStop(0,'#fff'); ng.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx,ny,9,0,7); ctx.fill();
    ctx.strokeStyle = '#ff4d5e'; ctx.lineWidth = 2; ctx.setLineDash([6,4]);   // 标注圈
    ctx.beginPath(); ctx.arc(nx,ny,26,0,7); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(nx+26,ny); ctx.lineTo(340,60); ctx.stroke();
    ctx.fillStyle = 'rgba(255,77,94,.14)'; ctx.strokeStyle = '#ff4d5e';
    ctx.beginPath(); ctx.roundRect(340,36,168,52,8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff8a95'; ctx.font = 'bold 14px sans-serif';
    ctx.fillText(B('疑似磨玻璃结节','Suspected ground-glass nodule'), 350, 56);
    ctx.fillStyle = '#ffd7db'; ctx.font = '12px sans-serif';
    ctx.fillText(B('置信度 92% · 建议 48h 内复查','Confidence 92% · re-check in 48h'), 350, 76);
    ctx.fillStyle = '#7ee2ff'; ctx.font = '12px sans-serif';
    ctx.fillText(B('← 左肺野清晰，AI 已自动排除','← Left lung clear, auto-cleared by AI'), 30, 285);
  }

  return () => { T.forEach(clearTimeout); Iv.forEach(clearInterval); };
}

/* ============ 3. 农业：同一场天灾，两种收成 ============ */
function demoAgriculture(stage){
  function farmHTML(p){
    return `<div class="farm-duel">
      <div class="paddy" id="${p}Farm">${'<i class="plot soil"></i>'.repeat(36)}</div>
      <div class="farm-res"><span id="${p}Res"></span></div>
    </div>`;
  }
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    sceneBtn('fSun',    B('☀️ 播放：风调雨顺的一季','☀️ Play: a kind season')) +
    sceneBtn('fDrought',B('🌵 播放：干旱来袭','🌵 Play: drought hits')) +
    sceneBtn('fPest',   B('🐛 播放：虫害来袭','🐛 Play: locusts hit')),
    { html: farmHTML('t'), kpis: chip(B('粮食产量','Harvest'),'tY') + chip(B('用水','Water'),'tW') + chip(B('农药','Pesticide'),'tP'), msg: 'tMsg' },
    { html: farmHTML('a'), kpis: chip(B('粮食产量','Harvest'),'aY') + chip(B('用水','Water'),'aW') + chip(B('农药','Pesticide'),'aP'), msg: 'aMsg' }
  )}</div>`;

  const T = [], Iv = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));
  const every = (f, ms) => { const i = setInterval(f, ms); Iv.push(i); return i; };

  const YIELD = { soil:0, grow:120, ripe:560, dry:0, watered:330, drip:520, pest:140, spot:275 };
  let playing = false;

  function plots(p){ return $$(stage, '#' + p + 'Farm .plot'); }
  function harvest(p){
    return plots(p).reduce((s, el) => s + (YIELD[el.dataset.s] || 0), 0);
  }
  function resourceCount(p){
    return plots(p).reduce((acc, el) => {
      const s = el.dataset.s;
      acc.water += (s === 'watered') ? 3.4 : (s === 'drip') ? 1.1 : 0;
      acc.pest += (s === 'pest') ? 0 : 0;
      return acc;
    }, { water:0, pest:0 });
  }
  function upd(){
    ['t','a'].forEach((p, i) => {
      const y = harvest(p), r = resourceCount(p);
      const water = p === 't' ? (S.t.water || 0) : (S.a.water || 0);
      const pest  = p === 't' ? (S.t.pest  || 0) : (S.a.pest  || 0);
      setChip(stage, p + 'Y', y + ' kg', i === 1 && S.a.y >= S.t.y);
      setChip(stage, p + 'W', Math.round(water) + ' m³');
      setChip(stage, p + 'P', Math.round(pest) + ' g');
    });
  }
  const S = { t:{water:0,pest:0,y:0}, a:{water:0,pest:0,y:0} };

  function reset(){
    ['t','a'].forEach(p => {
      plots(p).forEach(el => { el.className = 'plot soil'; el.dataset.s = 'soil'; });
      S[p] = { water:0, pest:0, y:0 };
      setMsg(stage, p + 'Msg', B('🌱 播种完成，开始生长…','🌱 Sown. Growing…'));
      $(stage, '#' + p + 'Res').textContent = '';
    });
    upd();
  }
  function play(scenario){
    if(playing) return; playing = true;
    reset();
    every(() => {                                        // 生长阶段：soil → grow
      ['t','a'].forEach(p => plots(p).forEach(el => { if(el.dataset.s === 'soil' && Math.random() < .16){ el.className = 'plot grow'; el.dataset.s = 'grow'; } }));
    }, 200);
    later(() => {                                        // 事件阶段
      Iv.forEach(clearInterval); Iv.length = 0;
      applyScenario(scenario);
    }, 5200);
    later(() => {                                        // 收获阶段：grow → ripe
      every(() => {
        let left = 0;
        ['t','a'].forEach(p => plots(p).forEach(el => { if(el.dataset.s === 'grow'){ el.className = 'plot ripe'; el.dataset.s = 'ripe'; } }));
        ['t','a'].forEach(p => left += plots(p).filter(el => el.dataset.s === 'grow').length);
        S.t.y = harvest('t'); S.a.y = harvest('a'); upd();
        if(left === 0) settle(scenario);
      }, 160);
    }, scenario === 'sun' ? 7200 : 8600);
  }
  function applyScenario(sc){
    const tPlots = plots('t'), aPlots = plots('a');
    const pick = arr => arr[Math.floor(Math.random()*arr.length)];
    if(sc === 'sun'){
      S.t.water = 92; S.t.pest = 88; S.a.water = 44; S.a.pest = 16;
      setMsg(stage, 'tMsg', B('😅 风调雨顺，凭经验 uniform 大水漫灌+预防式打药，产量不错。','😅 A kind season; blanket irrigation and spraying still pay off.'));
      setMsg(stage, 'aMsg', B('😊 墒情传感网络实时配水肥，按需供给，产量更高、浪费更少。','😊 Sensor net waters and feeds on demand: higher yield, less waste.'));
      S.t.y = Math.round(tPlots.length * 560 * .93); S.a.y = Math.round(aPlots.length * 560 * 1.02);
    } else if(sc === 'drought'){
      setMsg(stage, 'tMsg', B('🌵 干旱第 5 天才被发现——大水漫灌抢救，仍有三成田地旱死，水费翻倍。','🌵 Drought noticed on day 5 — flood-irrigation rescue; ~30% lost, water bill doubled.'));
      setMsg(stage, 'aMsg', B('💧 土壤墒情传感器当日告警 → 无人机精准滴灌，一片都没死。','💧 Soil-moisture sensors alarm same-day → drone drip irrigation; nothing dies.'));
      for(let i = 0; i < 13; i++){ const el = pick(tPlots); el.className = 'plot dry'; el.dataset.s = 'dry'; }
      for(let i = 0; i < 14; i++){ const el = pick(tPlots); if(el.dataset.s === 'grow'){ el.className = 'plot watered'; el.dataset.s = 'watered'; } }
      later(() => { for(let i = 0; i < 3; i++){ const el = pick(aPlots); if(el.dataset.s === 'grow'){ el.className = 'plot dry'; el.dataset.s = 'dry'; } } aPlots.forEach(el => { if(el.dataset.s === 'grow'){ el.classList.add('drip'); } }), S.a.water = 38; }, 900);
      S.t.water = 124; S.t.pest = 60; S.a.pest = 12;
    } else {
      setMsg(stage, 'tMsg', B('🐛 虫情发现时已蔓延全田——整田喷药，作物仍损失七成收成。','🐛 Pests already spread when spotted — blanket spraying, still ~70% crop loss.'));
      setMsg(stage, 'aMsg', B('📸 虫情测报灯+AI 图像识别：虫子刚落脚就被锁定，无人机点杀 3 个斑块。','📸 Pest lamp + AI vision: hotspots locked the moment locusts land; drones spot-spray 3 patches.'));
      for(let i = 0; i < 22; i++){ const el = pick(tPlots); if(el.dataset.s === 'grow'){ el.className = 'plot pest'; el.dataset.s = 'pest'; } }
      later(() => { for(let i = 0; i < 3; i++){ const el = pick(aPlots); if(el.dataset.s === 'grow'){ el.className = 'plot spot'; el.dataset.s = 'spot'; } } }, 900);
      S.t.water = 58; S.t.pest = 205; S.a.water = 30; S.a.pest = 18;
    }
    upd();
  }
  function settle(sc){
    Iv.forEach(clearInterval); Iv.length = 0;
    playing = false;
    ['t','a'].forEach(p => S[p].y = harvest(p));
    upd();
    const gap = Math.round((S.a.y - S.t.y) / Math.max(S.t.y,1) * 100);
    evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B(`同样的地、同样的天，AI 农田多收 <b>${gap}%</b>、省下一半以上的水和药。传感器把"发现灾情"从第 5 天提前到当天，变量灌溉把"整田漫灌"变成"按需滴灌"——农业从<b>靠天吃饭</b>变成<b>知天而作</b>。`,`Same land, same weather: the AI field harvests <b>${gap}% more</b> with half the water and chemicals. Sensors move discovery from day 5 to day 0; variable-rate irrigation replaces blanket flooding — farming turns from <b>weather-dependent</b> into <b>weather-informed</b>.`)}</p>`);
  }

  action(stage, 'fSun', () => play('sun'));
  action(stage, 'fDrought', () => play('drought'));
  action(stage, 'fPest', () => play('pest'));

  return () => { T.forEach(clearTimeout); Iv.forEach(clearInterval); };
}

/* ============ 4. 交通：救护车的生死竞速 ============ */
function demoTransport(stage){
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    sceneBtn('vGo',  B('🚑 救护车出发！','🚑 Ambulance, go!')) +
    sceneBtn('vRush',B('🌧 重跑：早高峰模式','🌧 Replay: rush hour')),
    { html:`<canvas class="tnet-cv" id="vT"></canvas>`, kpis: chip(B('到院用时','ETA'),'tT') + chip(B('红灯等待','Red lights'),'tR') + chip(B('黄金抢救窗','Golden window'),'tG'), msg: 'tMsg' },
    { html:`<canvas class="tnet-cv" id="vA"></canvas>`, kpis: chip(B('到院用时','ETA'),'aT') + chip(B('红灯等待','Red lights'),'aR') + chip(B('黄金抢救窗','Golden window'),'aG'), msg: 'aMsg' }
  )}</div>`;

  const T = [], Iv = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));

  /* 逻辑坐标 460×230：2×2 路口 */
  const JX = [130, 300], JY = [70, 160], RW = 18;
  const HOSP = { x: 442, y: 160 };
  /* 救护车路径：东→南→东→东（段端点） */
  const PATH = [ {x:18,y:70}, {x:130,y:70}, {x:130,y:160}, {x:300,y:160}, {x:438,y:160} ];
  /* 路径每段需要的方向：0=EW 1=NS */
  const SEGS = [ {dir:0}, {dir:1}, {dir:0}, {dir:0} ];

  function newWorld(isAI){
    return {
      amb: { seg:0, t:0, wait:0, waits:0, waiting:false, done:false, time:0 },
      lights: [ {ph:0, tm:rnd(0,3.5), lock:-1}, {ph:0, tm:rnd(0,3.5), lock:-1}, {ph:1, tm:rnd(0,3.5), lock:-1}, {ph:0, tm:rnd(0,3.5), lock:-1} ],
      cars: [], rush: false, aiLock: !!isAI,
    };
  }
  const WT = newWorld(false), WA = newWorld(true);
  let raf, running = false;

  function segLen(a, b){ return Math.hypot(b.x-a.x, b.y-a.y); }
  function segPoint(i, t){
    const a = PATH[i], b = PATH[i+1];
    return { x: a.x + (b.x-a.x)*t, y: a.y + (b.y-a.y)*t };
  }
  /* 段 i 末端的路口灯：段 0→J1, 段 1→J3, 段 2→J4, 段 3→医院(无灯) */
  function lightFor(w, i){ return i < 3 ? w.lights[[0, 2, 3][i]] : null; }

  function stepWorld(w, dt, isAI){
    w.lights.forEach(L => { if(L.lock >= 0) return; L.tm += dt; if(L.tm > 3.5){ L.tm = 0; L.ph = 1 - L.ph; } });
    const A = w.amb;
    if(A.done) return;
    A.time += dt;
    const seg = PATH[A.seg], nxt = PATH[A.seg+1], len = segLen(seg, nxt);
    const L = lightFor(w, A.seg);
    if(L){
      const dToEnd = (1 - A.t) * len;
      if(isAI){
        if(dToEnd < 60 && dToEnd > 6) L.lock = 1;        // AI 提前锁定该路口
        if(A.t > .92) L.lock = -1;
        if(L.lock >= 0) L.ph = SEGS[A.seg].dir;          // 锁成车行方向（绿波）
      }
      const green = L.ph === SEGS[A.seg].dir;
      if(!green && dToEnd < 10){
        if(!A.waiting){ A.waiting = true; A.waits++; }
        updRush(w, dt);
        return;                                          // 等灯
      }
      A.waiting = false;
    }
    A.t += dt / (len / 62);                              // 62 px/s
    if(A.t >= 1){
      A.t = 0; A.seg++;
      if(A.seg >= PATH.length - 1){ A.done = true; onArrive(w, isAI); }
    }
    updRush(w, dt);
  }
  /* 背景车找"前方 50px 内"的路口灯 */
  function aheadLight(w, c){
    let best = null;
    w.lights.forEach((L, i) => {
      const jx = JX[i%2], jy = JY[(i/2)|0];
      const along = c.hor ? jx : jy, pos = c.hor ? c.x : c.y;
      const cross = Math.abs((c.hor ? jy : jx) - (c.hor ? c.y : c.x));
      if(cross > 8) return;
      const d = (along - pos) * c.dir;
      if(d > 0 && d < 50 && (!best || d < best.d)) best = { L, d };
    });
    return best;
  }
  function updRush(w, dt){
    if(!w.rush) return;
    if(w.cars.length < 14 && Math.random() < .08){
      if(Math.random() < .5) w.cars.push({ hor:true,  x: rnd(0,460), y: JY[Math.floor(rnd(0,2))] + rnd(-4,4), v: rnd(26,42), dir: Math.random() < .5 ? 1 : -1 });
      else                   w.cars.push({ hor:false, x: JX[Math.floor(rnd(0,2))] + rnd(-4,4), y: rnd(0,230), v: rnd(26,42), dir: Math.random() < .5 ? 1 : -1 });
    }
    w.cars.forEach(c => {
      if(!w.aiLock){                                     // AI 侧：自适应信号，全网少等待
        const hit = aheadLight(w, c);
        if(hit && hit.L.ph !== (c.hor ? 0 : 1) && hit.d < 12) return;   // 红灯前停车
      }
      if(c.hor){ c.x += c.v * c.dir * dt; if(c.x > 470) c.x = -10; if(c.x < -10) c.x = 470; }
      else     { c.y += c.v * c.dir * dt; if(c.y > 240) c.y = -10; if(c.y < -10) c.y = 240; }
    });
  }
  function onArrive(w, isAI){
    const A = w.amb, sec = A.time;
    setChip(stage, isAI ? 'aT' : 'tT', sec.toFixed(1) + ' s', isAI);
    setChip(stage, isAI ? 'aR' : 'tR', A.waits + B(' 次','×'), isAI);
    const gw = clamp((90 - sec) / 90 * 100, 0, 100);
    setChip(stage, isAI ? 'aG' : 'tG', gw.toFixed(0) + '%', isAI);
    if(isAI){
      setMsg(stage, 'aMsg', B(`🏁 到院仅 ${sec.toFixed(0)} 秒，一路绿灯——AI 提前把沿途路口调成绿波。`,`🏁 Arrived in ${sec.toFixed(0)} s without stopping — AI pre-tuned every light into a green wave.`));
      evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B('救护车没有开快一公里——<b>是红灯学会了为生命让路</b>。AI 从接到警情那一刻就锁定车辆、预调沿途信号，路口等待从 2~3 次降到 0 次。心脏骤停抢救每提前 1 分钟，存活率提高约 10%。','The ambulance never sped — <b>the lights learned to yield</b>. AI locks onto the vehicle at dispatch and pre-tunes every signal; red-light stops fall from 2–3 to zero. For cardiac arrest, every minute saved lifts survival by ~10%.')}</p>`);
    } else {
      setMsg(stage, 'tMsg', B(`🏥 到院用时 ${sec.toFixed(1)} 秒，途中等了 ${A.waits} 次红灯——司机再急也只能等。`,`🏥 Arrived in ${sec.toFixed(1)} s after ${A.waits} red lights — the driver could only wait.`));
    }
  }

  function draw(w, isAI){
    const cv = $(stage, isAI ? '#vA' : '#vT'); if(!cv) return;
    const ctx = cv.getContext('2d'), kx = cv.width/460, ky = cv.height/230, k = Math.min(kx, ky);
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.save(); ctx.scale(cv.width/460, cv.height/230);
    ctx.fillStyle = '#232c44';                                        // 路面
    JY.forEach(y => ctx.fillRect(0, y-RW/2, 460, RW));
    JX.forEach(x => ctx.fillRect(x-RW/2, 0, RW, 230));
    ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.lineWidth = 1;     // 车道虚线
    JY.forEach(y => { ctx.setLineDash([8,8]); ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(460,y); ctx.stroke(); });
    JX.forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,230); ctx.stroke(); });
    ctx.setLineDash([]);
    w.cars.forEach(c => { ctx.fillStyle = '#8a93ad'; if(c.hor) ctx.fillRect(c.x-4, c.y-2.5, 8, 5); else ctx.fillRect(c.x-2.5, c.y-4, 5, 8); });
    w.lights.forEach((L, i) => {                                      // 路口红绿灯
      const jx = JX[i%2], jy = JY[Math.floor(i/2)];
      ctx.fillStyle = L.ph === 0 ? '#22c55e' : '#ef4444';             // EW 灯
      ctx.beginPath(); ctx.arc(jx-11, jy-11, 3.2, 0, 7); ctx.fill();
      ctx.fillStyle = L.ph === 1 ? '#22c55e' : '#ef4444';             // NS 灯
      ctx.beginPath(); ctx.arc(jx+11, jy+11, 3.2, 0, 7); ctx.fill();
      if(isAI && L.lock >= 0){ ctx.strokeStyle = 'rgba(34,211,238,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(jx, jy, 16, 0, 7); ctx.stroke(); ctx.fillStyle = '#7ee2ff'; ctx.font = '9px sans-serif'; ctx.fillText(B('AI 预调','AI'), jx-9, jy-18); }
    });
    ctx.fillStyle = '#39456b'; ctx.font = '11px sans-serif';          // 医院
    ctx.fillRect(HOSP.x-14, HOSP.y-12, 26, 24);
    ctx.fillStyle = '#ff5b6a'; ctx.fillRect(HOSP.x-6, HOSP.y-9, 4, 12); ctx.fillRect(HOSP.x-9, HOSP.y-6, 10, 4);
    ctx.fillStyle = '#aab4d4'; ctx.fillText(B('医院','HOSP'), HOSP.x-12, HOSP.y+22);
    if(!w.amb.done){                                                  // 救护车
      const p = segPoint(w.amb.seg, w.amb.t);
      const blink = (Math.sin(performance.now()/90)+1)/2;
      ctx.fillStyle = `rgba(255,80,80,${.25 + blink*.4})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(p.x-7, p.y-4.5, 14, 9);
      ctx.fillStyle = '#ff4d5e'; ctx.fillRect(p.x-1.5, p.y-3, 3, 6); ctx.fillRect(p.x-3, p.y-1.5, 6, 3);
    } else {
      const p = PATH[PATH.length-1];
      ctx.fillStyle = '#7ee2ff'; ctx.font = 'bold 12px sans-serif';
      ctx.fillText(B('🏁 已到院','🏁 Arrived'), p.x-28, p.y-18);
    }
    ctx.restore();
  }
  let last = 0;
  function frame(ts){
    const dt = Math.min((ts - last)/1000, .05); last = ts;
    if(running){
      stepWorld(WT, dt, false);
      stepWorld(WA, dt, true);
    }
    draw(WT, false); draw(WA, true);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  function start(rush){
    [WT, WA].forEach(w => {
      w.amb = { seg:0, t:0, wait:0, waits:0, waiting:false, done:false, time:0 };
      w.rush = !!rush; w.cars = [];
      w.lights.forEach(L => { L.tm = rnd(0,3.5); L.lock = -1; });
    });
    running = true;
    setChip(stage,'tT','—'); setChip(stage,'aT','—'); setChip(stage,'tR','—'); setChip(stage,'aR','—'); setChip(stage,'tG','—'); setChip(stage,'aG','—');
    setMsg(stage,'tMsg', rush ? B('🌧 早高峰：社会车辆涌入，传统定周期信号灯开始堆积。','🌧 Rush hour: traffic floods in; fixed-time signals start to clog.') : B('🚑 警情确认！救护车出发——信号灯按固定周期轮转，听不见警报。','🚑 Dispatched! Fixed-cycle lights, deaf to the siren.'));
    setMsg(stage,'aMsg', rush ? B('🌧 早高峰：AI 实时调配相位，救护车路线已锁定绿波。','🌧 Rush hour: AI adapts phases live; the route is locked on a green wave.') : B('🚑 警情确认！AI 立刻锁定车辆，沿途路口提前变绿。','🚑 Dispatched! AI locks on and pre-turns every light green.'));
  }
  action(stage, 'vGo', () => start(false));
  action(stage, 'vRush', () => start(true));

  return () => { cancelAnimationFrame(raf); T.forEach(clearTimeout); };
}

/* ============ 5. 教育：8 周之后的分岔路 ============ */
function demoEducation(stage){
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    `<div class="stu-pick">${B('选择学生：','Pick a student:')}
      <button class="demo-btn stu-btn active" data-p="shan">👧 ${B('小山 · 基础薄弱','Xiaoshan · struggling')}</button>
      <button class="demo-btn stu-btn" data-p="xian">🧒 ${B('小县 · 中等','Xiaoxian · middle')}</button>
      <button class="demo-btn stu-btn" data-p="cheng">👦 ${B('小城 · 基础扎实','Xiaocheng · strong')}</button>
    </div>` +
    sceneBtn('eGo', B('📅 开始 8 周学习','📅 Start 8 weeks')),
    { html:`<div class="klass">
        <div class="klass-title">${B('传统课堂：全班同一本教案','One-size classroom')}</div>
        <div class="stu-row">${Array.from({length:12},(_,i)=>`<span class="stu" id="stu${i}">${['🧒','👧','👦'][i%3]}</span>`).join('')}</div>
        <div class="klass-bar"><i id="tBar"></i></div>
      </div>`,
      kpis: chip(B('平均提分','Avg gain'),'tGain') + chip(B('掉队人数','Left behind'),'tLost') + chip(B('成绩差距','Spread'),'tGap'), msg: 'tMsg' },
    { html:`<div class="edu-ai">
        <div class="klass-title">🤖 ${B('AI 助教：一人一条路线','AI tutor: a path per student')}</div>
        <canvas class="edu-cv" id="eCv"></canvas>
      </div>`,
      kpis: chip(B('平均提分','Avg gain'),'aGain') + chip(B('掉队人数','Left behind'),'aLost') + chip(B('成绩差距','Spread'),'aGap'), msg: 'aMsg' }
  )}</div>`;

  const T = [], Iv = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));
  const every = (f, ms) => { const i = setInterval(f, ms); Iv.push(i); return i; };

  /* 知识图谱：8 节点 + 前置依赖 */
  const NODES = [
    { n:B('分数运算','Fractions'),  x:70,  y:55  },
    { n:B('正负数','Signed nums'),  x:70,  y:145 },
    { n:B('方程','Equations'),      x:180, y:100 },
    { n:B('不等式','Inequalities'), x:290, y:55  },
    { n:B('函数','Functions'),      x:290, y:145 },
    { n:B('几何证明','Proofs'),     x:395, y:55  },
    { n:B('概率','Probability'),    x:395, y:145 },
    { n:B('统计','Statistics'),     x:395, y:200 },
  ];
  const EDGES = [[0,2],[1,2],[2,3],[2,4],[0,6],[3,4]];
  const PATHSEQ = [0, 1, 2, 3, 4];                      // AI 规划的补漏→主线顺序
  const PROFILES = {
    shan:  { base:38, drop:5, name:B('小山','Xiaoshan') },
    xian:  { base:60, drop:2, name:B('小县','Xiaoxian') },
    cheng: { base:82, drop:0, name:B('小城','Xiaocheng') },
  };
  let prof = 'shan', playing = false, week = 0;
  const lit = new Set(), weak = new Set(), dot = { seg:0, t:0 };

  function draw(){
    const cv = $(stage, '#eCv'); if(!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.save(); ctx.scale(cv.width/460, cv.height/240);
    ctx.strokeStyle = 'rgba(150,165,205,.35)'; ctx.lineWidth = 1.5;
    EDGES.forEach(([a,b]) => {
      const A = NODES[a], Bn = NODES[b];
      const on = lit.has(a) && lit.has(b);
      ctx.strokeStyle = on ? 'rgba(34,211,238,.85)' : 'rgba(150,165,205,.28)';
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(Bn.x, Bn.y); ctx.stroke();
    });
    NODES.forEach((nd, i) => {
      const isLit = lit.has(i), isWeak = weak.has(i);
      ctx.beginPath(); ctx.arc(nd.x, nd.y, 13, 0, 7);
      ctx.fillStyle = isWeak ? 'rgba(255,90,110,.28)' : isLit ? 'rgba(34,211,238,.25)' : 'rgba(120,132,168,.15)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isWeak ? '#ff5a6e' : isLit ? '#22d3ee' : 'rgba(150,165,205,.5)';
      ctx.stroke();
      ctx.fillStyle = isWeak ? '#ff9aa6' : isLit ? '#9feaff' : '#8b96b5';
      ctx.font = '10.5px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(nd.n, nd.x, nd.y + 27);
    });
    if(dot.seg >= 0 && dot.seg < PATHSEQ.length){        // 学生光点
      const A = NODES[PATHSEQ[dot.seg]], Bn = NODES[PATHSEQ[Math.min(dot.seg+1, PATHSEQ.length-1)]];
      const x = A.x + (Bn.x-A.x)*dot.t, y = A.y + (Bn.y-A.y)*dot.t;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fillStyle = '#ffd166'; ctx.fill();
      ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🧑‍🎓', x, y - 9);
    }
    ctx.restore();
  }
  const ro = new ResizeObserver(draw); const cvEl = $(stage, '#eCv'); if(cvEl) ro.observe(cvEl);

  $$(stage, '.stu-btn').forEach(b => b.addEventListener('click', () => {
    $$(stage, '.stu-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); prof = b.dataset.p;
  }));

  action(stage, 'eGo', () => {
    if(playing) return; playing = true; week = 0;
    lit.clear(); weak.clear(); dot.seg = -1; dot.t = 0;
    const P = PROFILES[prof];
    setChip(stage,'tGain','—'); setChip(stage,'tLost','—'); setChip(stage,'tGap','—');
    setChip(stage,'aGain','—'); setChip(stage,'aLost','—'); setChip(stage,'aGap','—');
    setMsg(stage, 'tMsg', B(`📚 第 1 周：全班统一从第 1 章讲起——不管${P.name}卡在哪。`,'📚 Week 1: everyone starts at chapter 1 — regardless of where '+P.name+' is stuck.'));
    setMsg(stage, 'aMsg', B(`🔍 AI 助教先做诊断：发现${P.name}的漏洞出在「分数运算」「正负数」。`,'🔍 AI diagnoses first: gaps found in fractions and signed numbers.'));
    weak.add(0); weak.add(1); draw();

    let dropped = 0;
    every(() => {
      week++;
      /* 传统侧 */
      const bar = $(stage, '#tBar'); if(bar) bar.style.width = (week/8*100) + '%';
      const msgs = {
        shan: [B(`📚 第 ${week} 周：统一进度推进，${P.name}越听越懵（当前基础 ${P.base} 分）`,`📚 Week ${week}: uniform pace — ${P.name} is increasingly lost (base ${P.base})`),
               B(`😞 第 ${week} 周：新知识全压在没补的漏洞上，${P.name}开始害怕上数学课`,`😞 Week ${week}: new material piles onto the gaps — ${P.name} dreads math class`),
               B(`🪫 第 ${week} 周：掉队的同学又多了几个——统一进度救不了每个人`,'🪫 Week '+week+': more students drift away — one pace fits nobody')],
        xian: [B(`📚 第 ${week} 周：进度适中，${P.name}勉强跟得上，但薄弱环节没人管`,`📚 Week ${week}: pace is okay, but nobody tends to ${P.name}'s weak spots`)],
        cheng:[B(`📚 第 ${week} 周：${P.name}基础好，统一进度略显无聊，"吃不饱"`,`📚 Week ${week}: strong base — the uniform pace bores ${P.name}`)],
      };
      const arr = msgs[prof]; const m = arr[Math.min(arr.length-1, Math.floor((week-1)/3))];
      setMsg(stage, 'tMsg', m);
      if(week >= 3 && dropped < P.drop){ dropped++; const el = $(stage, '#stu' + (2 + dropped*2)); if(el) el.classList.add('lost'); }
      /* AI 侧 */
      if(week === 2){ weak.delete(0); lit.add(0); draw(); setMsg(stage, 'aMsg', B(`✅ 第 2 周：漏洞①「分数运算」已补上，进入「正负数」`,'✅ Week 2: fractions patched; on to signed numbers')); dot.seg = 0; dot.t = .5; }
      else if(week === 3){ weak.delete(1); lit.add(1); draw(); setMsg(stage, 'aMsg', B(`✅ 第 3 周：漏洞②「正负数」补完——前置全部打通`,'✅ Week 3: signed numbers done — all prerequisites cleared')); dot.seg = 1; dot.t = 1; }
      else if(week === 4){ lit.add(2); draw(); setMsg(stage, 'aMsg', B(`🚀 第 4 周：正式学「方程」——这次地基是牢的`,'🚀 Week 4: equations, on solid ground this time')); dot.seg = 2; dot.t = .5; }
      else if(week === 5){ lit.add(3); draw(); setMsg(stage, 'aMsg', B(`🚀 第 5 周：「不等式」一次就懂`,'🚀 Week 5: inequalities click instantly')); dot.seg = 3; dot.t = .5; }
      else if(week === 6){ lit.add(4); draw(); setMsg(stage, 'aMsg', B(`🎯 第 6 周：「函数」——从${P.name}自己的错题里长出来的理解`,'🎯 Week 6: functions — understanding grown from '+P.name+"'s own mistakes")); dot.seg = 4; dot.t = 1; }
      else if(week === 7){ setMsg(stage, 'aMsg', B(`🧠 第 7 周：AI 每晚 10 分钟抗遗忘练习，防再滑落`,'🧠 Week 7: 10-minute nightly AI review against forgetting')); }
      if(week >= 8) settle();
    }, 1500);
  });

  function settle(){
    Iv.forEach(clearInterval); Iv.length = 0; playing = false;
    const P = PROFILES[prof];
    setChip(stage, 'tGain', '+' + (P.drop >= 5 ? 6 : P.drop >= 2 ? 9 : 12));
    setChip(stage, 'tLost', P.drop + B(' 人',''));
    setChip(stage, 'tGap', P.drop >= 5 ? '58 分' : P.drop >= 2 ? '31 分' : '14 分');
    setChip(stage, 'aGain', '+' + (21 + (P.base < 50 ? 10 : 0)), true);
    setChip(stage, 'aLost', '0', true);
    setChip(stage, 'aGap', '9 分', true);
    setMsg(stage, 'tMsg', B(`📉 期中：全班平均 +${P.drop>=5?6:9} 分，但${P.name}几乎原地踏步，${P.drop} 人掉队。`,`📉 Midterm: class average +${P.drop>=5?6:9}, but ${P.name} barely moved; ${P.drop} left behind.`));
    setMsg(stage, 'aMsg', B(`📈 期中：${P.name} +${21+(P.base<50?10:0)} 分，全班 0 掉队——因为每个人的路线都不一样。`,`📈 Midterm: ${P.name} +${21+(P.base<50?10:0)}, zero left behind — everyone had their own path.`));
    evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B('名师只有一位，而 AI 路线图可以<b>人手一份</b>。它做不到讲得比名师更生动，但它记得每个孩子卡在哪一步：先补漏洞、再学新知、每天抗遗忘。传统课堂拉大差距，AI 助教<b>让最弱的学生也不再掉队</b>——这才是"因材施教"第一次真正可行。','There is one master teacher, but AI can hand <b>every child a personal roadmap</b>. It patches gaps before new lessons, then runs daily anti-forgetting review. Uniform classrooms widen gaps; the AI tutor makes sure <b>even the weakest student is never left behind</b> — personalized teaching finally scales.')}</p>`);
  }

  draw();
  return () => { T.forEach(clearTimeout); Iv.forEach(clearInterval); ro.disconnect(); };
}

/* ============ 6. 金融：追踪一笔脏钱 ============ */
function demoFinance(stage){
  stage.innerHTML = `<div class="duel-wrap">${duelCols(
    sceneBtn('xGo',  B('💸 混入一笔可疑资金','💸 Inject dirty money')) +
    sceneBtn('xRe',  B('↺ 重放追踪','↺ Replay')),
    { html:`<canvas class="fin-cv" id="xF"></canvas>`, kpis: chip(B('拦截金额','Blocked'),'xB') + chip(B('漏放金额','Slipped'),'xL') + chip(B('标记账户','Flagged'),'xF2'), msg: 'xMsgT' },
    { html:`<canvas class="fin-cv" id="xJ"></canvas>`, kpis: chip(B('拦截金额','Blocked'),'xJB') + chip(B('漏放金额','Slipped'),'xJL') + chip(B('标记账户','Flagged'),'xJF'), msg: 'xMsgA' }
  )}</div>`;

  const T = [];
  const later = (f, ms) => T.push(setTimeout(f, ms));

  /* 26 节点：0=入口 hub，1..5=欺诈环，24=离境出口，其余噪声 */
  const N = 26, HUB = 0, EXIT = 24;
  const nodes = [], edges = [];
  for(let i = 0; i < N; i++){
    const ang = rnd(0, Math.PI*2), r = i === HUB ? 0 : rnd(40, 150);
    nodes.push({ x: 230 + Math.cos(ang)*r, y: 130 + Math.sin(ang)*r*.6, vx:0, vy:0, i });
  }
  nodes[HUB].x = 60; nodes[HUB].y = 130;
  nodes[EXIT].x = 410; nodes[EXIT].y = 130;
  const RING = [1,2,3,4,5];
  const push = (a,b) => edges.push([a,b]);
  push(0,1); push(1,2); push(2,3); push(3,4); push(4,5); push(5,1); push(5,EXIT);
  while(edges.length < 24){
    const a = 6 + Math.floor(rnd(0, 18)), b = 6 + Math.floor(rnd(0, 18));
    if(a !== b && !edges.some(e => (e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))) push(a,b);
  }
  push(0, 8); push(7, EXIT);

  let raf, playing = false, step = -1;
  const pulse = { T:{e:null,t:0,dead:true}, A:{e:null,t:0,dead:true} };   // 双轨脉冲：传统/AI 各一份
  const stateT = { flagged:new Set(), frozen:new Set(), blocked:0, leaked:0 };
  const stateA = { flagged:new Set(), frozen:new Set(), blocked:0, leaked:0 };

  function physics(){
    for(let i = 0; i < N; i++){
      const A = nodes[i];
      for(let j = i+1; j < N; j++){
        const Bn = nodes[j];
        let dx = A.x-Bn.x, dy = A.y-Bn.y, d2 = dx*dx+dy*dy;
        if(d2 < 130*130 && d2 > 1){
          const f = 900/d2, d = Math.sqrt(d2);
          dx /= d; dy /= d;
          A.vx += dx*f; A.vy += dy*f; Bn.vx -= dx*f; Bn.vy -= dy*f;
        }
      }
      A.vx += (230-A.x)*.0012; A.vy += (130-A.y)*.0012;   // 向心
    }
    edges.forEach(([a,b]) => {
      const A = nodes[a], Bn = nodes[b];
      const dx = Bn.x-A.x, dy = Bn.y-A.y, d = Math.hypot(dx,dy)||1;
      const f = (d-90)*.004;
      A.vx += dx/d*f; A.vy += dy/d*f; Bn.vx -= dx/d*f; Bn.vy -= dy/d*f;
    });
    nodes.forEach(n => { n.vx *= .82; n.vy *= .82; n.x += n.vx; n.y += n.vy; });
  }

  function draw(w, isAI){
    const cv = $(stage, isAI ? '#xJ' : '#xF'); if(!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0,0,cv.width,cv.height);
    ctx.save(); ctx.scale(cv.width/460, cv.height/260);
    edges.forEach(([a,b]) => {
      const A = nodes[a], Bn = nodes[b];
      const ringEdge = isAI && stateA.flagged.size >= 6 && RING.includes(a) && RING.includes(b);
      ctx.strokeStyle = ringEdge ? 'rgba(255,77,94,.75)' : 'rgba(150,165,205,.22)';
      ctx.lineWidth = ringEdge ? 1.8 : 1;
      ctx.beginPath(); ctx.moveTo(A.x,A.y); ctx.lineTo(Bn.x,Bn.y); ctx.stroke();
    });
    const P = isAI ? pulse.A : pulse.T;                   // 各自轨道的脏钱
    if(P.e && !P.dead){                                   // 脏钱脉冲
      const A = nodes[P.e[0]], Bn = nodes[P.e[1]];
      const x = A.x+(Bn.x-A.x)*P.t, y = A.y+(Bn.y-A.y)*P.t;
      ctx.fillStyle = '#ffd166'; ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(x,y,5,0,7); ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = '11px sans-serif'; ctx.fillText('💰', x-6, y-9);
    }
    nodes.forEach((n, i) => {
      const st = isAI ? stateA : stateT;
      const isHub = i === HUB, isExit = i === EXIT, isRing = RING.includes(i);
      ctx.beginPath(); ctx.arc(n.x, n.y, isHub||isExit ? 9 : 5.5, 0, 7);
      if(st.frozen.has(i)){ ctx.fillStyle = '#ff4d5e'; ctx.shadowColor='#ff4d5e'; ctx.shadowBlur=10; }
      else if(st.flagged.has(i)){ ctx.fillStyle = '#fbbf24'; }
      else if(isExit){ ctx.fillStyle = '#7ee2ff'; }
      else if(isHub){ ctx.fillStyle = '#a855f7'; }
      else ctx.fillStyle = 'rgba(150,165,205,.55)';
      ctx.fill(); ctx.shadowBlur = 0;
      if(st.frozen.has(i)){ ctx.font = '9px sans-serif'; ctx.fillText('❄', n.x-5, n.y+3); }
      if(isHub){ ctx.fillStyle = '#b78aff'; ctx.font = '9px sans-serif'; ctx.textAlign='center'; ctx.fillText(B('入口','in'), n.x, n.y+18); }
      if(isExit){ ctx.fillStyle = '#7ee2ff'; ctx.font = '9px sans-serif'; ctx.textAlign='center'; ctx.fillText(B('离境','out'), n.x, n.y+18); }
    });
    ctx.restore();
  }
  function frame(){
    physics();
    draw(stateT, false); draw(stateA, true);
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  const SEQ = [
    { e:[0,1] }, { e:[1,2] }, { e:[2,3] }, { e:[3,4] }, { e:[4,5] },
    { e:[5,1] },                                        // 回流成环
    { e:[5,EXIT] },                                     // 试图离境
  ];
  function runStep(){
    step++;
    if(step >= SEQ.length){ finish(); return; }
    [pulse.T, pulse.A].forEach(P => { P.e = SEQ[step].e; P.t = 0; P.dead = false; });
    const dur = step === 6 ? 1400 : 950;
    const t0 = performance.now();
    (function anim(now){
      const p = clamp((now - t0)/dur, 0, 1);
      pulse.T.t = pulse.A.t = p;
      if(p < 1) requestAnimationFrame(anim);
    })(t0);
    if(step === 0){
      setMsg(stage,'xMsgT',B('💸 一笔 80 万资金进入账户网络，开始在中转账户间跳转。','💸 $800k of dirty money enters and starts hopping between shells.'));
      setMsg(stage,'xMsgA',B('💸 同一笔资金。AI 图谱盯住的不是单笔金额，而是钱的"完整旅程"。','💸 Same money. The AI graph tracks the journey, not single amounts.'));
    }
    if(step === 1){
      stateT.flagged.add(HUB);
      setChip(stage,'xF2','1');
      setMsg(stage,'xMsgT',B('🔔 规则引擎：单笔大额 80 万 → 标记入口账户，通知人工审核。','🔔 Rule engine: large single transfer → flag the source account, await review.'));
    }
    if(step === 3){
      stateT.flagged.delete(HUB);
      setChip(stage,'xF2','0');
      setMsg(stage,'xMsgT',B('🙃 30 分钟后：对方把金额拆成 19 笔小额——每笔都"合规"，标记自动解除。','🙃 30 min later: amount split into 19 small "compliant" transfers — flag auto-cleared.'));
    }
    if(step === 5){                                     // 回流成环：AI 亮整个环
      RING.forEach(i => stateA.flagged.add(i));
      setChip(stage,'xJF','6', true);
      setMsg(stage,'xMsgA',B('🚨 AI 图谱：资金绕了一圈又回到原点——<b>闭环回流</b>！6 个账户实为同一团伙。','🚨 AI graph: the money loops back to where it started — a closed ring! 6 accounts, one gang.'));
    }
    if(step === 6){
      later(() => {                                     // AI：离境前拦截
        pulse.A.dead = true;
        RING.forEach(i => { stateA.flagged.delete(i); stateA.frozen.add(i); });
        stateA.blocked = 80;
        setChip(stage,'xJB','80 万', true); setChip(stage,'xJL','0', true); setChip(stage,'xJF','6', true);
        setMsg(stage,'xMsgA',B('❄ 全链冻结！80 万在离境前被拦下——环上 6 个账户一锅端。','❄ Frozen! $800k blocked before exit — all 6 ring accounts seized.'));
        evidence(stage, `<b>💡 ${B('这一幕说明了什么','What this means')}</b><p><i>AI 的作用</i>${B('每笔交易单独看都"合规"，规则引擎只能盯单笔金额，骗子把钱拆散就能穿透。而 AI 看得见<b>钱的完整旅程</b>——"绕一圈回到原点"的环形回流是洗钱藏不住的破绽。传统风控追丢的 80 万，资金图谱一键拦下。','Each transfer looks "compliant"; rules watch single amounts, so splitting defeats them. AI sees <b>the whole journey</b> — money that loops back to its origin is a fingerprint no launderer can hide. The $800k rules lost, the graph blocks in one move.')}</p>`);
      }, 800);
      later(() => {                                     // 传统：钱跑了
        pulse.T.dead = true;
        stateT.leaked = 80;
        setChip(stage,'xB','0'); setChip(stage,'xL','80 万'); setChip(stage,'xF2','0');
        setMsg(stage,'xMsgT',B('出境以下资金已被取现——离境成功，追缴失败。','Cash withdrawn beyond the border — money gone, recovery failed.'));
      }, 1500);
    }
  }
  function finish(){ playing = false; }
  function start(){
    step = -1;
    [pulse.T, pulse.A].forEach(P => { P.e = null; P.t = 0; P.dead = true; });
    stateT.flagged.clear(); stateT.frozen.clear(); stateT.blocked = 0; stateT.leaked = 0;
    stateA.flagged.clear(); stateA.frozen.clear(); stateA.blocked = 0; stateA.leaked = 0;
    setChip(stage,'xB','—'); setChip(stage,'xL','—'); setChip(stage,'xF2','—');
    setChip(stage,'xJB','—'); setChip(stage,'xJL','—'); setChip(stage,'xJF','—');
    setMsg(stage,'xMsgT',''); setMsg(stage,'xMsgA','');
    playing = true;
    for(let k = 0; k < SEQ.length + 1; k++) later(runStep, 400 + k*980);
  }
  action(stage, 'xGo', start);
  action(stage, 'xRe', start);

  return () => { cancelAnimationFrame(raf); T.forEach(clearTimeout); };
}
