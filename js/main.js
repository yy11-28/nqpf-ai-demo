/* ============ 全局回调：语言/主题变化时刷新动态内容 ============ */
function onI18nChange(lang, theme) {
  updateNavBtns();
  refreshDynamic();
  if (typeof refreshCharts === 'function') refreshCharts();
  if (typeof refreshLab === 'function') refreshLab();
  if (typeof refreshAILab === 'function') refreshAILab();
  if (typeof refreshAssistant === 'function') refreshAssistant();
}

function refreshDynamic() {
  const activeBtn = document.querySelector('.tab-btn.active');
  const key = activeBtn ? activeBtn.dataset.ind : 'manufacture';
  renderIndustry(key);
  renderTimeline();
  updateSim();
}

/* ============ 滚动进度条 ============ */
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  document.getElementById('progressBar').style.width = (scrollY / h * 100) + '%';
});

/* ============ 导航栏自动显隐（已移除：导航栏固定不动） ============ */

/* ============ 移动端菜单 ============ */
const menuBtn = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuBtn) {
  menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

/* ============ 主题 / 语言切换按钮 ============ */
function updateNavBtns() {
  const themeBtn = document.getElementById('themeToggle');
  const langBtn = document.getElementById('langToggle');
  const t = Lc.getTheme(), l = Lc.getLang();
  themeBtn.textContent = t === 'dark' ? '🌓 亮色' : '🌓 暗色';
  langBtn.textContent = l === 'zh' ? '中 / EN' : 'EN / 中';
}
document.getElementById('themeToggle').addEventListener('click', () => Lc.toggleTheme());
document.getElementById('langToggle').addEventListener('click', () => Lc.toggleLang());

/* ============ 导航高亮 ============ */
const sections = Array.from(document.querySelectorAll('section[id],header[id]'));
const navAnchors = document.querySelectorAll('#navLinks a');
function updateNav() {
  const y = scrollY + 120;
  let cur = sections[0];
  for (const s of sections) if (y >= s.offsetTop) cur = s;
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
}
window.addEventListener('scroll', updateNav, { passive: true });

/* ============ 滚动入场动画 ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const d = parseInt(el.dataset.delay || '0');
      setTimeout(() => el.classList.add('visible'), d);
      io.unobserve(el);
    }
  });
}, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============ 数字滚动计数器 ============ */
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.target);
    const dec = parseInt(el.dataset.decimals || '0');
    const dur = 2200;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 4);
      const val = (target * ease).toFixed(dec);
      el.textContent = val;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('.counter').forEach(el => countIO.observe(el));

/* ============ 返回顶部 ============ */
const topBtn = document.getElementById('backTop');
window.addEventListener('scroll', () => topBtn.classList.toggle('show', scrollY > 600));
topBtn.addEventListener('click', () => scrollTo(0, 0));

/* ============ 产业赋能 Tab 切换（双语感知） ============ */
function renderIndustry(key) {
  const d = DATA.industries[key];
  if (!d) return;
  const en = window.Lc && Lc.getLang() === 'en';
  const t = en && d.en ? d.en : d;
  const panel = document.getElementById('industryPanel');
  panel.dataset.industry = key;
  panel.setAttribute('aria-labelledby', `industry-tab-${key}`);
  tabBtns.forEach(btn => btn.setAttribute('aria-selected', String(btn.dataset.ind === key)));
  const img = document.getElementById('industryImg');
  img.style.opacity = '0';
  img.alt = t.title;
  setTimeout(() => { img.src = d.img; img.style.opacity = '1'; }, 300);
  document.getElementById('industryTitle').textContent = t.title;
  document.getElementById('industryDesc').textContent = t.desc;
  const mEl = document.getElementById('industryMetrics');
  mEl.innerHTML = t.metrics.map(m => `
    <div class="ind-metric reveal visible">
      <b>${m.val}<em>${m.unit}</em></b>
      <span>${m.label}</span>
    </div>
  `).join('');
  if (typeof renderDemo === 'function') renderDemo(key);
}

const tabBtns = document.querySelectorAll('.industry-tab-list .tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderIndustry(btn.dataset.ind);
  });
});
document.addEventListener('DOMContentLoaded', () => renderIndustry('manufacture'));

/* ============ 行业渗透率图表切换 ============ */
const penetrationOpen = document.getElementById('penetrationOpen');
const industryDemo = document.getElementById('industryDemo');
const industryPenetration = document.getElementById('industryPenetration');
function showIndustryPenetration(show) {
  industryDemo.hidden = show;
  industryPenetration.hidden = !show;
  penetrationOpen.setAttribute('aria-pressed', String(show));
  penetrationOpen.classList.toggle('active', show);
  if (show) {
    requestAnimationFrame(() => {
      const chart = charts.chartPenetration;
      if (chart) chart.resize();
    });
  }
}
penetrationOpen.addEventListener('click', () => {
  showIndustryPenetration(industryPenetration.hidden);
});
document.getElementById('penetrationClose').addEventListener('click', () => showIndustryPenetration(false));

/* ============ 生产力模拟器（双语标签） ============ */
const simRate = document.getElementById('simRate');
const simInvest = document.getElementById('simInvest');
const simRateVal = document.getElementById('simRateVal');
const simInvestVal = document.getElementById('simInvestVal');
function simLabels() { return [Lc.t('sim_invest_low'), Lc.t('sim_invest_mid'), Lc.t('sim_invest_high')]; }
function updateSim() {
  const rate = parseInt(simRate.value);
  const invest = parseInt(simInvest.value);
  const labels = simLabels();
  simRateVal.textContent = rate + '%';
  simInvestVal.textContent = labels[invest - 1];
  const mult = [.7, 1, 1.3][invest - 1];
  const eff = Math.round((rate * .7 + 20) * mult);
  const cost = -Math.round((rate * .3 + 10) * mult);
  const defect = -Math.round((rate * .7 + 15) * mult);
  const labor = Math.round(1000 * (rate / 100) * .62);
  document.getElementById('simEff').textContent = '+' + eff + '%';
  document.getElementById('simCost').textContent = cost + '%';
  document.getElementById('simDefect').textContent = defect + '%';
  document.getElementById('simLabor').textContent = labor + (window.Lc && Lc.getLang() === 'en' ? '' : '人');
}
if (simRate) {
  simRate.addEventListener('input', updateSim);
  simInvest.addEventListener('input', updateSim);
  updateSim();
}

/* ============ 时间线渲染（双语） ============ */
const tlList = document.getElementById('tlList');
function renderTimeline() {
  if (!tlList) return;
  const en = window.Lc && Lc.getLang() === 'en';
  tlList.innerHTML = DATA.timeline.map(item => {
    const t = en && item.en ? item.en : item;
    return `
      <div class="tl-item reveal">
        <div class="tl-dot"></div>
        <div class="tl-year">${item.year}</div>
        <div class="tl-card">
          <span class="tl-badge">${t.badge}</span>
          <b>${t.title}</b>
          <p>${t.desc}</p>
        </div>
      </div>
    `;
  }).join('');
  setTimeout(observeTl, 100);
}

/* ============ 时间线滚动入场 ============ */
const tlIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); tlIO.unobserve(e.target); }
  });
}, { threshold: .15, rootMargin: '0px 0px -30px 0px' });
function observeTl() { document.querySelectorAll('.tl-item').forEach(el => tlIO.observe(el)); }

/* ============ 初始化 ============ */
Lc.init();
updateNavBtns();
renderTimeline();

/* ============ 粒子按钮交互动效 ============ */
const heroCanvas = document.getElementById('neuralCanvas');
if (heroCanvas) {
  heroCanvas.addEventListener('click', e => {
    const rect = heroCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const burst = document.createElement('div');
    burst.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:10`;
    burst.innerHTML = '<div style="animation:burst .6s ease forwards;width:8px;height:8px;background:#22d3ee;border-radius:50%;box-shadow:0 0 24px #22d3ee,0 0 48px #a855f7;transform:translate(-50%,-50%)"></div>';
    document.getElementById('hero').appendChild(burst);
    setTimeout(() => burst.remove(), 700);
  });
}

// 动态注入 burst 动画
const burstStyle = document.createElement('style');
burstStyle.textContent = `@keyframes burst {0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(18)}}`;
document.head.appendChild(burstStyle);

/* ============ 图表懒加载优化 ============ */
(function () {
  const chartIDs = ['chartIndustry','chartGdp','chartCompute','chartRadar','chartPenetration','chartMap','chartEfficiency','chartCases','chartFuture','chartModels'];
  const rendered = new Set();
  const chartIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !rendered.has(e.target.id)) {
        rendered.add(e.target.id);
        const c = charts[e.target.id];
        if (c) { c.resize(); c.dispatchAction({ type: 'highlight', seriesIndex: 0 }); }
      }
    });
  }, { threshold: .05 });
  chartIDs.forEach(id => {
    const el = document.getElementById(id);
    if (el) chartIO.observe(el);
  });
})();
