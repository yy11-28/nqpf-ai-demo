/* ============ 生产力实验室：要素沙盘 + 数据价值流桑基 + 全球AI竞赛 ============ */
(function () {
  if (typeof echarts === 'undefined') return;

  const T = () => Lc.getTheme() === 'light';
  const EN = () => Lc.getLang() === 'en';
  const C = () => ({
    txt: T() ? '#13233f' : '#e5eefc',
    dim: T() ? '#51658a' : '#8ea3c4',
    split: T() ? 'rgba(19,35,63,.10)' : 'rgba(64,150,255,.15)',
    tipBg: T() ? 'rgba(255,255,255,.96)' : 'rgba(10,22,48,.94)',
    tipBd: T() ? 'rgba(59,130,246,.35)' : 'rgba(64,150,255,.35)',
  });

  let gauge, radar, line, sankey, race;
  let raceTimer = null, raceYear = 2015, racePlaying = false;

  /* ---------- 沙盘模型 ---------- */
  const DEF = { c: 30, d: 30, t: 20, a: 20, p: 60 };
  function getState() {
    return {
      c: +document.getElementById('sC').value,
      d: +document.getElementById('sD').value,
      t: +document.getElementById('sT').value,
      a: +document.getElementById('sA').value,
      p: +document.getElementById('sP').value,
    };
  }
  function computeModel(s) {
    // 边际收益递减
    const raw = .90 * Math.sqrt(s.c) + .80 * Math.sqrt(s.d) + .70 * Math.sqrt(s.t) + .80 * Math.sqrt(s.a);
    // 协同乘数：算力×数据、人才×算法
    const synCD = Math.min(s.c, s.d) / Math.max(Math.max(s.c, s.d), 1);
    const synTA = Math.min(s.t, s.a) / Math.max(Math.max(s.t, s.a), 1);
    const syn = synCD * synTA;                      // 0~1
    // 失衡内耗
    const vals = [s.c, s.d, s.t, s.a];
    const mean = vals.reduce((x, y) => x + y, 0) / 4 || 1;
    const sd = Math.sqrt(vals.reduce((x, y) => x + (y - mean) ** 2, 0) / 4);
    const bal = Math.max(.55, 1 - (sd / mean) * .45);
    const core = raw * (1 + .38 * syn) * bal;       // 要素综合能级
    const tfp = Math.min(178, 52 + (s.p / 100) * core * .92);
    return { tfp, syn, synCD, synTA, bal, core };
  }
  const RATINGS = v => v < 70 ? ['diag_r1', '#94a3b8'] : v < 95 ? ['diag_r2', '#38bdf8'] : v < 122 ? ['diag_r3', '#22d3ee'] : v < 148 ? ['diag_r4', '#a855f7'] : ['diag_r5', '#fbbf24'];

  function updateSandbox() {
    const s = getState();
    ['C', 'D', 'T', 'A'].forEach(k => { document.getElementById('v' + k).textContent = s[k.toLowerCase()]; });
    document.getElementById('vP').textContent = s.p + '%';
    document.getElementById('labTotal').textContent = s.c + s.d + s.t + s.a;

    const m = computeModel(s);
    const col = T() ? '#13233f' : '#e5eefc';
    const dim = T() ? '#51658a' : '#8ea3c4';
    const light = T();

    /* 仪表盘 */
    if (gauge) gauge.setOption({
      series: [{
        data: [{ value: +m.tfp.toFixed(1), name: 'TFP' }],
        detail: { color: col },
        progress: { itemStyle: { color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [{ offset: 0, color: '#22d3ee' }, { offset: .6, color: '#3b82f6' }, { offset: 1, color: '#a855f7' }]
        } } },
        axisLine: { lineStyle: { color: [[1, light ? 'rgba(19,35,63,.10)' : 'rgba(64,150,255,.15)']] } },
      }]
    });

    /* 雷达：五维画像 */
    if (radar) radar.setOption({
      radar: {
        indicator: [
          { name: EN() ? 'Efficiency' : '效率', max: 100 },
          { name: EN() ? 'Quality' : '质量', max: 100 },
          { name: EN() ? 'Innovation' : '创新', max: 100 },
          { name: EN() ? 'Green' : '绿色', max: 100 },
          { name: EN() ? 'Resilience' : '韧性', max: 100 },
        ],
        axisName: { color: dim, fontSize: 11 },
        splitLine: { lineStyle: { color: C().split } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: C().split } },
      },
      series: [{
        data: [{
          value: [
            Math.min(100, 30 + m.tfp * .42),
            Math.min(100, 28 + s.d * .8 + m.tfp * .28),
            Math.min(100, 22 + s.a * .9 + s.t * .35),
            Math.min(100, 30 + m.tfp * .30 + s.p * .18),
            Math.min(100, 26 + s.t * .6 + m.bal * 42),
          ].map(v => +v.toFixed(1)),
          name: 'NQPF',
        }],
      }]
    });

    /* GDP 增量预测 */
    if (line) {
      const years = ['2026', '2027', '2028', '2029', '2030'];
      const base = [2400, 3600, 5300, 7600, 10500];
      const vals = base.map(v => Math.round(v * (m.tfp / 100) * 1.0));
      line.setOption({
        xAxis: { data: years, axisLabel: { color: dim }, axisLine: { lineStyle: { color: C().split } } },
        series: [{ data: vals,
          areaStyle: { color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: light ? 'rgba(59,130,246,.35)' : 'rgba(34,211,238,.35)' }, { offset: 1, color: 'rgba(59,130,246,0)' }]
          } },
          lineStyle: { color: '#3b82f6', width: 3 },
          itemStyle: { color: '#3b82f6' },
          label: { show: true, position: 'top', color: dim, fontSize: 11, formatter: p => p.value.toLocaleString() },
        }],
        graphic: [{ id: 'gdpVal', type: 'text', right: 24, top: 8, style: { text: 'Σ ' + vals.reduce((a, b) => a + b, 0).toLocaleString() + (EN() ? ' CNY 100M' : ' 亿元'), fill: '#22d3ee', fontSize: 18, fontWeight: 800 } }],
      });
    }

    /* AI 诊断卡 */
    const vals = [['c', s.c], ['d', s.d], ['t', s.t], ['a', s.a]];
    const minV = vals.reduce((a, b) => b[1] < a[1] ? b : a);
    const tips = [];
    if (m.tfp < 70 && s.p < 30) tips.push(Lc.t(minV[0] === 'c' ? 'diag_tip_c' : minV[0] === 'd' ? 'diag_tip_d' : minV[0] === 't' ? 'diag_tip_t' : 'diag_tip_a'));
    if (minV[1] < 15) tips.push(Lc.t('diag_tip_' + minV[0]));
    if (m.syn < .35) tips.push(Lc.t('diag_tip_sync'));
    if (m.bal < .8) tips.push(Lc.t('diag_tip_bal'));
    if (!tips.length) tips.push(Lc.t('diag_ok'));
    const [rk, rc] = RATINGS(m.tfp);
    document.getElementById('labDiag').innerHTML = `
      <div class="diag-row"><span>${Lc.t('diag_sync')}</span><div class="diag-bar"><i style="width:${Math.round(m.syn * 100)}%;background:linear-gradient(90deg,#22d3ee,#a855f7)"></i></div><b>${Math.round(m.syn * 100)}</b></div>
      <div class="diag-row"><span>${EN() ? 'Balance' : '配置均衡度'}</span><div class="diag-bar"><i style="width:${Math.round(m.bal * 100)}%;background:linear-gradient(90deg,#38bdf8,#3b82f6)"></i></div><b>${Math.round(m.bal * 100)}</b></div>
      <div class="diag-tips">${tips.map(t => '💡 ' + t).join('</div><div class="diag-tips">')}</div>`;
  }

  function initSandboxCharts() {
    const col = T() ? '#13233f' : '#e5eefc';
    const dim = T() ? '#51658a' : '#8ea3c4';
    gauge = echarts.init(document.getElementById('labGauge'));
    gauge.setOption({
      series: [{
        type: 'gauge', min: 0, max: 180, startAngle: 210, endAngle: -30, radius: '96%',
        progress: { show: true, width: 16, roundCap: true },
        axisLine: { lineStyle: { width: 16 } },
        pointer: { show: false }, axisTick: { show: false },
        splitLine: { show: false }, axisLabel: { show: false },
        anchor: { show: false },
        title: { show: true, offsetCenter: [0, '32%'], color: dim, fontSize: 12 },
        detail: { valueAnimation: true, fontSize: 40, fontWeight: 800, offsetCenter: [0, '2%'], color: col, formatter: v => v.toFixed(1) },
        data: [{ value: 0, name: EN() ? 'TFP Index (Baseline=100)' : '指数（基线=100）' }],
      }]
    });

    radar = echarts.init(document.getElementById('labRadar'));
    radar.setOption({
      tooltip: { backgroundColor: C().tipBg, borderColor: C().tipBd, textStyle: { color: C().txt } },
      series: [{
        type: 'radar', symbolSize: 5,
        itemStyle: { color: '#22d3ee' },
        lineStyle: { color: '#22d3ee', width: 2 },
        areaStyle: { color: 'rgba(34,211,238,.22)' },
      }]
    });

    line = echarts.init(document.getElementById('labLine'));
    line.setOption({
      tooltip: { trigger: 'axis', backgroundColor: C().tipBg, borderColor: C().tipBd, textStyle: { color: C().txt },
        formatter: ps => ps[0].axisValue + '<br/>' + (EN() ? 'GDP increment: ' : 'GDP 增量：') + '<b>' + ps[0].value.toLocaleString() + '</b>' },
      grid: { left: 70, right: 30, top: 40, bottom: 30 },
      xAxis: { type: 'category', boundaryGap: false },
      yAxis: { type: 'value', axisLabel: { color: dim }, splitLine: { lineStyle: { color: C().split } } },
      series: [{ type: 'line', smooth: true, symbolSize: 7 }],
    });

    sankey = echarts.init(document.getElementById('sankeyChart'));
    renderSankey();

    race = echarts.init(document.getElementById('raceChart'));
    renderRace();
  }

  /* ---------- 桑基图 ---------- */
  function renderSankey() {
    const c = C();
    const nodes = DATA.sankey.nodes.map((n, i) => ({
      name: EN() ? n.e : n.n,
      itemStyle: i < 4 ? { color: '#22d3ee' } : i < 8 ? { color: '#3b82f6' } : i < 12 ? { color: '#a855f7' } : { color: '#fbbf24' },
    }));
    const links = DATA.sankey.links.map(([a, b, v]) => ({
      source: EN() ? DATA.sankey.nodes[a].e : DATA.sankey.nodes[a].n,
      target: EN() ? DATA.sankey.nodes[b].e : DATA.sankey.nodes[b].n,
      value: v,
    }));
    sankey.setOption({
      tooltip: { trigger: 'item', backgroundColor: c.tipBg, borderColor: c.tipBd, textStyle: { color: c.txt } },
      series: [{
        type: 'sankey', layout: 'none', left: 12, right: 130, top: 16, bottom: 16, nodeWidth: 16, nodeGap: 12,
        emphasis: { focus: 'adjacency' },
        nodeAlign: 'justify',
        label: { color: c.txt, fontSize: 12 },
        lineStyle: { color: 'gradient', curveness: .5, opacity: .35 },
        itemStyle: { borderWidth: 0 },
        levels: [
          { depth: 0, label: { position: 'right' } },
          { depth: 1 }, { depth: 2 },
          { depth: 3, label: { position: 'left' } },
          { depth: 4, label: { position: 'right' } },
        ],
        data: nodes, links,
      }]
    }, true);
  }

  /* ---------- 全球AI竞赛（bar race） ---------- */
  function raceVals(y) {
    return DATA.race.map(c => ({
      name: EN() ? c.name_en : c.name,
      value: +(c.v0 * Math.exp(c.g * (y - 2015))).toFixed(1),
    }));
  }
  const RACE_COLORS = ['#3b82f6','#ef4444','#22d3ee','#a855f7','#fbbf24','#34d399','#f472b6','#60a5fa','#fb923c','#c084fc'];
  function renderRace() {
    const c = C();
    const vals = raceVals(raceYear);
    race.setOption({
      grid: { left: 110, right: 90, top: 30, bottom: 26 },
      title: { text: String(raceYear), left: 'center', top: 0, textStyle: { color: c.txt, fontSize: 40, fontWeight: 800, opacity: .9 } },
      tooltip: { trigger: 'item', backgroundColor: c.tipBg, borderColor: c.tipBd, textStyle: { color: c.txt },
        formatter: p => p.name + '：' + (EN() ? '≈ ' : '约 ') + '<b>' + p.value + '</b>' + (EN() ? ' bn USD' : ' 十亿美元') },
      xAxis: { type: 'value', max: 'dataMax', axisLabel: { color: c.dim }, splitLine: { lineStyle: { color: c.split } } },
      yAxis: { type: 'category', realtimeSort: true, axisLabel: { color: c.txt, fontSize: 13, fontWeight: 600 }, axisTick: { show: false }, axisLine: { show: false }, inverse: false },
      series: [{
        type: 'bar', realtimeSort: true, barWidth: '62%',
        data: vals.map((v, i) => ({ ...v, itemStyle: { color: RACE_COLORS[i], borderRadius: [0, 8, 8, 0] } })),
        label: { show: true, position: 'right', color: c.txt, fontWeight: 700, fontFamily: 'monospace', formatter: p => p.value.toFixed(1) },
      }],
      animationDuration: 0, animationDurationUpdate: 600, animationEasing: 'linear', animationEasingUpdate: 'linear',
    }, true);
  }
  function setRaceYear(y, keepPlaying) {
    raceYear = y;
    document.getElementById('raceYear').value = y;
    document.getElementById('raceYearVal').textContent = y;
    renderRace();
    if (!keepPlaying) stopRace();
  }
  function startRace() {
    if (racePlaying) return;
    racePlaying = true;
    document.getElementById('racePlay').textContent = Lc.t('race_pause');
    raceTimer = setInterval(() => {
      if (raceYear >= 2025) { setRaceYear(2015, true); return; }  // 循环播放
      setRaceYear(raceYear + 1, true);
    }, 750);
  }
  function stopRace() {
    racePlaying = false;
    clearInterval(raceTimer); raceTimer = null;
    const b = document.getElementById('racePlay');
    if (b) b.textContent = Lc.t('race_play');
  }

  function initRace() {
    document.getElementById('racePlay').addEventListener('click', () => racePlaying ? stopRace() : startRace());
    document.getElementById('raceYear').addEventListener('input', e => setRaceYear(+e.target.value));
    // 进入视口自动播放一次
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { startRace(); io.disconnect(); } });
    }, { threshold: .35 });
    io.observe(document.getElementById('raceChart'));
  }

  /* ---------- 重置 / 刷新 / 初始化 ---------- */
  function refreshLab() {
    // 语言或主题切换：销毁重建
    [gauge, radar, line, sankey, race].forEach(ch => ch && ch.dispose());
    gauge = radar = line = sankey = race = null;
    initSandboxCharts();
    updateSandbox();
    document.getElementById('racePlay').textContent = racePlaying ? Lc.t('race_pause') : Lc.t('race_play');
  }

  function boot() {
    initSandboxCharts();
    updateSandbox();
    initRace();
    ['sC', 'sD', 'sT', 'sA', 'sP'].forEach(id => document.getElementById(id).addEventListener('input', updateSandbox));
    document.getElementById('labReset').addEventListener('click', () => {
      const d = DEF;
      document.getElementById('sC').value = d.c; document.getElementById('sD').value = d.d;
      document.getElementById('sT').value = d.t; document.getElementById('sA').value = d.a;
      document.getElementById('sP').value = d.p;
      updateSandbox();
    });
    window.addEventListener('resize', () => [gauge, radar, line, sankey, race].forEach(ch => ch && ch.resize()));
  }

  window.refreshLab = refreshLab;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
