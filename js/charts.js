/* ============ ECharts：主题 + 语言感知 ============ */
const charts = {};
let _cachedGeo = null;
const chartResizeObserver = typeof ResizeObserver !== 'undefined'
  ? new ResizeObserver(entries => {
    entries.forEach(({ target }) => {
      const chart = charts[target.id];
      if (chart) chart.resize();
    });
  })
  : null;

function makeChart(id, option) {
  const el = document.getElementById(id);
  if (!el || typeof echarts === 'undefined') return;
  if (charts[id]) charts[id].dispose();
  const c = echarts.init(el, null, { renderer: 'canvas' });
  c.setOption(option);
  charts[id] = c;
  if (chartResizeObserver) chartResizeObserver.observe(el);
  else requestAnimationFrame(() => c.resize());
}

window.addEventListener('resize', () => {
  Object.values(charts).forEach(c => c.resize());
});

function initCharts() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const isEn = window.Lc && Lc.getLang() === 'en';

  const AX = {
    axisLine: { lineStyle: { color: isLight ? 'rgba(60,80,110,.4)' : 'rgba(142,163,196,.35)' } },
    axisLabel: { color: isLight ? '#4a5b76' : '#8ea3c4', fontSize: 11 },
    splitLine: { lineStyle: { color: isLight ? 'rgba(60,80,110,.12)' : 'rgba(142,163,196,.12)' } }
  };
  const TIP = {
    trigger: 'axis',
    backgroundColor: isLight ? 'rgba(255,255,255,.95)' : 'rgba(8,18,38,.92)',
    borderColor: 'rgba(64,150,255,.4)',
    textStyle: { color: isLight ? '#13233f' : '#e5eefc', fontSize: 12 }
  };
  const COLORS = ['#22d3ee', '#3b82f6', '#a855f7', '#f59e0b', '#34d399', '#f472b6'];
  const textMain = isLight ? '#13233f' : '#e5eefc';
  const textDim = isLight ? '#4a5b76' : '#8ea3c4';

  /* ---- 1. 产业规模 ---- */
  makeChart('chartIndustry', {
    tooltip: { ...TIP, formatter: p => {
      const i = p[0].dataIndex, v = DATA.industryScale.values[i];
      const rate = i > 0 ? ((v - DATA.industryScale.values[i - 1]) / DATA.industryScale.values[i - 1] * 100).toFixed(1) : null;
      const u = isEn ? 'B CNY' : '亿元';
      return `${DATA.industryScale.years[i]}<br>${isEn ? 'Scale' : '规模'}：<b style="color:#22d3ee">${v}</b> ${u}` + (rate ? `<br>${isEn ? 'Growth' : '增速'}：<b style="color:#fbbf24">+${rate}%</b>` : '');
    } },
    grid: { left: 60, right: 20, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: DATA.industryScale.years, ...AX },
    yAxis: { type: 'value', name: isEn ? 'B CNY' : '亿元', ...AX, nameTextStyle: { color: textDim } },
    series: [{
      type: 'bar', data: DATA.industryScale.values, barWidth: '55%',
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#22d3ee' }, { offset: 1, color: 'rgba(59,130,246,.35)' }
        ])
      },
      emphasis: { itemStyle: { color: '#a855f7' } },
      label: { show: true, position: 'top', color: textDim, fontSize: 10 },
      animationDelay: i => i * 120
    }],
    animationEasing: 'elasticOut'
  });

  /* ---- 2. 全球GDP贡献 ---- */
  makeChart('chartGdp', {
    tooltip: { ...TIP, trigger: 'item', formatter: p => `${p.name}<br>${isEn ? 'Contribution' : '贡献'}：<b style="color:#fbbf24">${p.value}</b> ${isEn ? 'USD trillion' : '万亿美元'}（${(p.value / 15.7 * 100).toFixed(1)}%）` },
    grid: { left: 100, right: 60, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: isEn ? 'USD T' : '万亿美元', ...AX, nameTextStyle: { color: textDim } },
    yAxis: { type: 'category', data: DATA.gdpContrib.map(d => isEn ? d.name_en : d.name).reverse(), ...AX },
    series: [{
      type: 'bar',
      data: DATA.gdpContrib.map(d => ({
        value: d.value,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: d.name === '中国'
            ? new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#a855f7' }, { offset: 1, color: '#f472b6' }])
            : new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#22d3ee' }])
        }
      })).reverse(),
      barWidth: '60%',
      label: { show: true, position: 'right', color: textMain, fontWeight: 600, formatter: '{c}' },
      animationDelay: i => i * 150
    }]
  });

  /* ---- 3. 算力增长 ---- */
  makeChart('chartCompute', {
    tooltip: { ...TIP, formatter: p => `${p[0].axisValue}<br>${isEn ? 'Compute' : '算力规模'}：<b style="color:#22d3ee">${p[0].value}</b> EFLOPS` },
    grid: { left: 55, right: 20, top: 30, bottom: 35 },
    xAxis: { type: 'category', boundaryGap: false, data: DATA.compute.years, ...AX },
    yAxis: { type: 'value', name: 'EFLOPS', ...AX, nameTextStyle: { color: textDim } },
    series: [{
      type: 'line', data: DATA.compute.values, smooth: true, symbol: 'circle', symbolSize: 9,
      lineStyle: { width: 3, color: '#22d3ee', shadowColor: 'rgba(34,211,238,.6)', shadowBlur: 14 },
      itemStyle: { color: '#22d3ee', borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(34,211,238,.45)' }, { offset: 1, color: 'rgba(34,211,238,.02)' }
      ]) },
      label: { show: true, color: textDim, fontSize: 10 }
    }]
  });

  /* ---- 4. 要素雷达 ---- */
  makeChart('chartRadar', {
    tooltip: { ...TIP, trigger: 'item' },
    legend: {
      data: [Lc.t('legend_traditional'), Lc.t('legend_new')],
      textStyle: { color: textDim, fontSize: 10 },
      top: 4, icon: 'roundRect', itemWidth: 14, itemHeight: 10,
      itemGap: 10
    },
    radar: {
      indicator: DATA.radar.indicator.map(i => ({ name: isEn ? i.name_en : i.name, max: i.max })),
      radius: '52%', center: ['50%', '60%'],
      axisName: { color: textDim, fontSize: 10 },
      splitArea: { areaStyle: { color: ['rgba(59,130,246,.03)', 'rgba(59,130,246,.07)'] } },
      splitLine: { lineStyle: { color: isLight ? 'rgba(60,80,110,.25)' : 'rgba(142,163,196,.2)' } },
      axisLine: { lineStyle: { color: isLight ? 'rgba(60,80,110,.3)' : 'rgba(142,163,196,.25)' } }
    },
    series: [{
      type: 'radar',
      data: [
        { value: DATA.radar.traditional, name: Lc.t('legend_traditional'),
          lineStyle: { color: textDim }, itemStyle: { color: textDim },
          areaStyle: { color: isLight ? 'rgba(74,91,118,.12)' : 'rgba(142,163,196,.15)' } },
        { value: DATA.radar.new, name: Lc.t('legend_new'),
          lineStyle: { color: '#22d3ee', width: 2.5 }, itemStyle: { color: '#22d3ee' },
          areaStyle: { color: 'rgba(34,211,238,.3)' } }
      ],
      animationDuration: 1600
    }]
  });

  /* ---- 5. 行业渗透率 ---- */
  makeChart('chartPenetration', {
    tooltip: { ...TIP, formatter: p => `${p[0].axisValue}<br>${isEn ? 'Penetration' : '渗透率'}：<b style="color:#22d3ee">${p[0].value}%</b>` },
    grid: { left: 60, right: 20, top: 30, bottom: 60 },
    xAxis: { type: 'category', data: isEn ? DATA.penetration.categories_en : DATA.penetration.categories, ...AX, axisLabel: { ...AX.axisLabel, interval: 0, rotate: 20 } },
    yAxis: { type: 'value', max: 100, name: '%', ...AX, nameTextStyle: { color: textDim } },
    series: [{
      type: 'bar', data: DATA.penetration.values, barWidth: '50%',
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: p => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: COLORS[p.dataIndex % COLORS.length] },
          { offset: 1, color: 'rgba(59,130,246,.15)' }
        ])
      },
      label: { show: true, position: 'top', color: textMain, fontSize: 11, formatter: '{c}%' },
      animationDelay: i => i * 100
    }]
  });

  /* ---- 6. 中国地图 ---- */
  renderMap();

  /* ---- 7. 效率对比 ---- */
  makeChart('chartEfficiency', {
    tooltip: { ...TIP, formatter: p => {
      const i = p[0].dataIndex;
      const ratio = DATA.efficiency.after[i] / DATA.efficiency.before[i];
      const cats = isEn ? DATA.efficiency.categories_en : DATA.efficiency.categories;
      return `${cats[i]}<br>${Lc.t('tooltip_1')}：<b>${p[0].value}</b><br>${Lc.t('tooltip_2')}：<b style="color:#22d3ee">${p[1].value}</b><br>${Lc.t('tooltip_speed')}：<b style="color:#fbbf24">${ratio.toFixed(1)}×</b>`;
    } },
    legend: { data: [Lc.t('legend_traditional'), Lc.t('legend_new')], textStyle: { color: textDim }, top: 4 },
    grid: { left: 55, right: 20, top: 44, bottom: 60 },
    xAxis: { type: 'category', data: isEn ? DATA.efficiency.categories_en : DATA.efficiency.categories, ...AX, axisLabel: { ...AX.axisLabel, interval: 0, rotate: 16 } },
    yAxis: { type: 'value', name: isEn ? 'Efficiency' : '效率指数', ...AX, nameTextStyle: { color: textDim } },
    series: [
      { name: Lc.t('legend_traditional'), type: 'bar', data: DATA.efficiency.before, barWidth: '28%',
        itemStyle: { color: isLight ? 'rgba(74,91,118,.45)' : 'rgba(142,163,196,.55)', borderRadius: [5, 5, 0, 0] } },
      { name: Lc.t('legend_new'), type: 'bar', data: DATA.efficiency.after, barWidth: '28%',
        itemStyle: { borderRadius: [5, 5, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#22d3ee' }, { offset: 1, color: '#a855f7' }]),
          shadowColor: 'rgba(34,211,238,.4)', shadowBlur: 10 },
        label: { show: true, position: 'top', color: '#22d3ee', fontSize: 10 },
        animationDelay: i => i * 140 }
    ]
  });

  /* ---- 8. 典型场景（玫瑰图） ---- */
  const effCats = isEn ? DATA.efficiency.categories_en : DATA.efficiency.categories;
  makeChart('chartCases', {
    tooltip: { ...TIP, trigger: 'item', formatter: p => `${p.name}<br>${Lc.t('tooltip_speed')}：<b style="color:#fbbf24">${(p.value / 100).toFixed(1)}×</b>` },
    legend: { textStyle: { color: textDim }, left: 4, top: 'center', orient: 'vertical', icon: 'circle' },
    series: [{
      type: 'pie', roseType: 'radius',
      radius: ['18%', '70%'], center: ['58%', '56%'],
      itemStyle: { borderRadius: 8, borderColor: isLight ? '#eef3fb' : '#050b1a', borderWidth: 2 },
      label: { color: isLight ? '#33415c' : '#c7d8f0', fontSize: 11, formatter: '{b}\n{d}%' },
      labelLine: { lineStyle: { color: isLight ? 'rgba(74,91,118,.5)' : 'rgba(142,163,196,.5)' } },
      data: effCats.map((c, i) => ({
        name: c, value: DATA.efficiency.after[i],
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
          { offset: 0, color: COLORS[i % COLORS.length] },
          { offset: 1, color: 'rgba(59,130,246,.5)' }
        ]) }
      })),
      animationType: 'scale', animationEasing: 'elasticOut'
    }]
  });

  /* ---- 9. 未来预测 ---- */
  makeChart('chartFuture', {
    tooltip: { ...TIP, formatter: p => `${p[0].axisValue}<br>${isEn ? 'Scale' : '产业规模'}：<b style="color:#a855f7">${p[0].value}</b> ${isEn ? 'B CNY (forecast)' : '亿元（预测）'}` },
    grid: { left: 60, right: 30, top: 30, bottom: 35 },
    xAxis: { type: 'category', boundaryGap: false, data: DATA.future.years, ...AX },
    yAxis: { type: 'value', name: isEn ? 'B CNY' : '亿元', ...AX, nameTextStyle: { color: textDim } },
    series: [{
      type: 'line', data: DATA.future.values, smooth: true, symbol: 'diamond', symbolSize: 11,
      lineStyle: { width: 3.5, type: 'dashed', color: '#a855f7', shadowColor: 'rgba(168,85,247,.7)', shadowBlur: 16 },
      itemStyle: { color: '#a855f7', borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(168,85,247,.4)' }, { offset: 1, color: 'rgba(168,85,247,.02)' }
      ]) },
      markPoint: {
        data: [{ coord: ['2030E', 20500], value: isEn ? '¥2T+' : '2万亿+', itemStyle: { color: '#fbbf24' } }],
        label: { color: '#050b1a', fontWeight: 700, fontSize: 11 },
        symbolSize: 64
      },
      label: { show: true, color: textDim, fontSize: 10 }
    }]
  });

  /* ---- 10. 大模型参数量 ---- */
  makeChart('chartModels', {
    tooltip: { ...TIP, trigger: 'item', formatter: p => `<b style="color:${p.data.itemStyle.color}">${p.data[2]}</b><br>${isEn ? 'Year' : '发布年份'}：${p.data[0]}<br>${isEn ? 'Params' : '参数量'}：≈ <b>${p.data[1] >= 10000 ? (p.data[1] / 10000).toFixed(0) + (isEn ? 'B' : ' 亿') : p.data[1] + (isEn ? 'M' : ' 百万')}</b>` },
    grid: { left: 80, right: 40, top: 30, bottom: 45 },
    xAxis: { type: 'value', name: isEn ? 'Year' : '年份', min: 2016.5, max: 2025.5, interval: 1, ...AX, nameTextStyle: { color: textDim },
      axisLabel: { ...AX.axisLabel, formatter: v => Math.floor(v) } },
    yAxis: { type: 'log', name: isEn ? 'Params (M, log)' : '参数量（百万，对数轴）', min: 50, ...AX, nameTextStyle: { color: textDim } },
    series: [{
      type: 'scatter',
      data: DATA.models.map(m => ({ value: [m.year, m.params], name: m.name, itemStyle: { color: m.color, shadowBlur: 14, shadowColor: m.color } })),
      symbolSize: d => Math.max(16, Math.log10(d[1]) * 7),
      label: { show: true, position: 'top', color: isLight ? '#33415c' : '#c7d8f0', fontSize: 10, formatter: p => p.data.name },
      animationDuration: 1800
    }]
  });
}

/* ---- 中国地图（GeoJSON 缓存 + 降级） ---- */
function renderMap() {
  const el = document.getElementById('chartMap');
  if (!el || typeof echarts === 'undefined') return;
  const isEn = window.Lc && Lc.getLang() === 'en';
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const textDim = isLight ? '#4a5b76' : '#8ea3c4';
  const TIPMAP = {
    trigger: 'item',
    backgroundColor: isLight ? 'rgba(255,255,255,.95)' : 'rgba(8,18,38,.92)',
    borderColor: 'rgba(64,150,255,.4)',
    textStyle: { color: isLight ? '#13233f' : '#e5eefc', fontSize: 12 }
  };
  const mapData = [
    { name: '北京市', value: 1900 }, { name: '广东省', value: 1250 }, { name: '上海市', value: 920 },
    { name: '浙江省', value: 720 }, { name: '江苏省', value: 680 }, { name: '山东省', value: 420 },
    { name: '四川省', value: 360 }, { name: '湖北省', value: 310 }, { name: '安徽省', value: 290 },
    { name: '福建省', value: 260 }, { name: '陕西省', value: 230 }, { name: '湖南省', value: 210 },
    { name: '天津市', value: 190 }, { name: '重庆市', value: 175 }, { name: '河南省', value: 160 },
    { name: '辽宁省', value: 145 }, { name: '河北省', value: 120 }, { name: '江西省', value: 95 },
    { name: '广西壮族自治区', value: 70 }, { name: '山西省', value: 65 }, { name: '云南省', value: 60 },
    { name: '贵州省', value: 55 }, { name: '黑龙江省', value: 50 }, { name: '吉林省', value: 42 },
    { name: '内蒙古自治区', value: 35 }, { name: '新疆维吾尔自治区', value: 30 }, { name: '甘肃省', value: 28 },
    { name: '海南省', value: 40 }, { name: '宁夏回族自治区', value: 18 }, { name: '青海省', value: 10 },
    { name: '西藏自治区', value: 5 }, { name: '台湾省', value: 210 }, { name: '香港特别行政区', value: 180 }, { name: '澳门特别行政区', value: 12 }
  ];
  function renderFallback() {
    makeChart('chartMap', {
      tooltip: TIPMAP,
      grid: { left: 70, right: 40, top: 20, bottom: 30 },
      xAxis: { type: 'value', axisLine: { lineStyle: { color: 'rgba(142,163,196,.35)' } }, axisLabel: { color: textDim, fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(142,163,196,.12)' } } },
      yAxis: { type: 'category', data: mapData.slice().sort((a, b) => a.value - b.value).map(d => d.name),
        axisLine: { lineStyle: { color: 'rgba(142,163,196,.35)' } }, axisLabel: { color: textDim, fontSize: 9 }, splitLine: { show: false } },
      series: [{ type: 'bar', data: mapData.map(d => d.value),
        itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#22d3ee' }]), borderRadius: [0, 6, 6, 0] } }]
    });
  }
  function renderWithGeo(geo) {
    echarts.registerMap('china', geo);
    makeChart('chartMap', {
      tooltip: { ...TIPMAP, formatter: p => `${p.name}<br>${isEn ? 'AI density' : 'AI企业集聚度'}：<b style="color:#22d3ee">${isNaN(p.value) ? '—' : p.value}</b>${isEn ? ' (est.)' : '（估算指数）'}` },
      visualMap: {
        min: 0, max: 800, left: 16, bottom: 16, text: [isEn ? 'High' : '高', isEn ? 'Low' : '低'],
        textStyle: { color: textDim },
        inRange: { color: isLight
          ? ['#e9f2fc', '#a7c6f0', '#5f9be6', '#1d6fd6', '#5b21b6']
          : ['#0b1b3a', '#134b8f', '#1d7fd1', '#22d3ee', '#a855f7'] },
        calculable: true
      },
      series: [{
        type: 'map', map: 'china', roam: false,
        layoutCenter: ['50%', '68%'], layoutSize: '140%', zoom: 1.08, aspectScale: 0.9,
        label: { show: true, color: isLight ? '#33475e' : '#c8dcf5', fontSize: 10 },
        emphasis: { label: { show: true, color: isLight ? '#0f1f38' : '#fff', fontSize: 12, fontWeight: 'bold' }, itemStyle: { areaColor: '#fbbf24', shadowBlur: 20, shadowColor: 'rgba(251,191,36,.6)' } },
        itemStyle: { borderColor: isLight ? 'rgba(59,130,246,.4)' : 'rgba(34,211,238,.35)', borderWidth: .8 },
        select: { disabled: true },
        data: mapData
      }]
    });
  }
  if (_cachedGeo) { renderWithGeo(_cachedGeo); return; }
  fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
    .then(r => r.json())
    .then(geo => { _cachedGeo = geo; renderWithGeo(geo); })
    .catch(renderFallback);
}

/* ---- 对外暴露：刷新全部图表 ---- */
window.refreshCharts = initCharts;

initCharts();
