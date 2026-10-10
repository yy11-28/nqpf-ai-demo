/* ============ AI 智能助手：本地规则问答引擎（双语） ============ */
(function () {
  const fab = document.getElementById('aiFab');
  const panel = document.getElementById('aiPanel');
  const body = document.getElementById('aiBody');
  const input = document.getElementById('aiInput');
  const chipsEl = document.getElementById('aiChips');
  let opened = false;

  /* 知识库：kw 中文关键词 / kwEn 英文关键词 */
  const QA = [
    {
      kw: ['新质生产力', '定义', '是什么', '概念'], kwEn: ['nqpf', 'what is', 'definition', 'new quality'],
      a: '"新质生产力"是2023年9月提出的概念：由**技术革命性突破、生产要素创新性配置、产业深度转型升级**催生的先进生产力质态。它以"高科技、高效能、高质量"为特征，核心标志是**全要素生产率大幅提升**。你可以去"概念解码"板块看它的公式和三要素翻转卡。',
      aEn: '"New Quality Productive Forces" (NQPF) was proposed in Sept 2023: advanced productive forces born from **revolutionary tech breakthroughs, innovative factor allocation, and deep industrial transformation**. Characterized by high-tech, high-efficiency and high-quality, its core indicator is a **major leap in Total Factor Productivity**. Check the "Concept" section for the formula and flip cards.',
    },
    {
      kw: ['核心引擎', '为什么', '作用', '意义'], kwEn: ['core engine', 'why', 'role', 'significance'],
      a: 'AI之所以是新质生产力的核心引擎，因为它是一种**通用目的技术（GPT）**——像蒸汽机、电力、互联网一样渗透所有行业：重塑劳动者（AI数字员工）、劳动资料（智能工具与算力）、劳动对象（数据要素）。普华永道预测到2030年AI将为全球经济贡献**15.7万亿美元**。',
      aEn: 'AI is the core engine of NQPF because it is a **General Purpose Technology** — like steam, electricity and the internet, it permeates every industry: reshaping workers (AI agents), means of labor (smart tools & compute), and objects of labor (data as a factor). PwC forecasts AI will contribute **$15.7 trillion** to the global economy by 2030.',
    },
    {
      kw: ['失业', '就业', '岗位', '取代', '替代'], kwEn: ['unemploy', 'job', 'replace', 'layoff'],
      a: '历史上每次技术革命都是"替代旧岗位+创造新岗位"。世界经济论坛《未来就业报告》预测：到2027年AI将**替代约8300万个岗位，同时创造约6900万个新岗位**。真正的趋势是"人机协作"——重复性工作交给AI，人类转向创造性、情感性和决策性工作。关键在于终身学习。',
      aEn: 'Every technological revolution replaced old jobs and created new ones. The WEF Future of Jobs Report predicts AI will **displace ~83M roles but create ~69M new ones by 2027**. The real trend is human-AI collaboration: repetitive tasks go to AI while humans move to creative, empathetic and decision-making work. Lifelong learning is key.',
    },
    {
      kw: ['数据', '要素', '石油'], kwEn: ['data', 'factor', 'oil'],
      a: '数据被称为"新石油"，是继土地、劳动力、资本、技术之后的**第五大生产要素**。中国数据产量超8.1 ZB居全球第二。数据只有经过"清洗标注→模型训练→场景应用"才能释放价值——去看看"生产力实验室"里的**数据要素价值流桑基图**，直观展示了这条增值链。',
      aEn: 'Data is called "the new oil" — the **fifth production factor** after land, labor, capital and technology. China\'s data output exceeds 8.1 ZB (2nd globally). Data only releases value after "cleaning & labeling → model training → application". Check the **Data Factor Value Stream Sankey** in the NQPF Lab section.',
    },
    {
      kw: ['全要素生产率', 'tfp'], kwEn: ['total factor productivity', 'tfp'],
      a: '全要素生产率（TFP）= 产出中**不能**由资本和劳动投入解释的部分，即技术、效率、组织带来的"额外增长"。它是新质生产力的**核心标志**——靠堆人力资本拉动的增长是粗放的，靠AI让同样的要素产出更多，才是质的跃迁。去"生产力实验室"拖动滑块，亲手体验TFP如何跃迁！',
      aEn: 'Total Factor Productivity (TFP) is the part of output **not** explained by capital and labor — the "extra growth" from technology, efficiency and organization. It is the **core hallmark** of NQPF: growth by adding inputs is extensive; producing more with the same inputs via AI is a qualitative leap. Try the sliders in the NQPF Lab!',
    },
    {
      kw: ['算力', '智算', '数据中心'], kwEn: ['computing power', 'compute', 'data center'],
      a: '算力是AI时代的"电力"。中国算力总规模已超**230 EFLOPS、居全球第二**，其中智能算力占比快速提升；"东数西算"工程把西部的绿色电力转化为东部的智能算力。算力基础设施正是"新型劳动资料"的典型代表。',
      aEn: 'Compute is the "electricity" of the AI era. China\'s total compute exceeds **230 EFLOPS (2nd globally)**, with intelligent compute rising fast; the "Eastern Data, Western Computing" project turns green power in the west into intelligence for the east. Compute infrastructure is a prime example of the "new means of labor".',
    },
    {
      kw: ['大模型', 'gpt', 'chatgpt', 'llm'], kwEn: ['llm', 'large model', 'gpt', 'chatgpt'],
      a: '大模型（LLM）是基于Transformer架构、用海量数据训练的深度神经网络，具有涌现能力。从2017年Transformer论文到ChatGPT两个月破亿用户，只用了5年。中国已有200+个大模型发布。本站的"浪潮之巅"板块有参数量演进图和全球AI竞赛动画。',
      aEn: 'Large Language Models are deep neural networks based on the Transformer architecture, trained on massive data with emergent capabilities. From the 2017 Transformer paper to ChatGPT reaching 100M users in 2 months took just 5 years. China has released 200+ LLMs. See the parameter evolution chart and Global AI Race animation in "The AI Wave" section.',
    },
    {
      kw: ['制造', '工厂', '灯塔'], kwEn: ['manufactur', 'factory', 'lighthouse'],
      a: '智能制造是AI落地最深的领域：中国"灯塔工厂"数量**79家居全球第一**，制造业机器人密度470台/万人居全球第三。AI质检让不良品率下降超50%，预测性维护降低非计划停机30%+。去"产业赋能"板块体验**AI质检产线交互演示**！',
      aEn: 'Smart manufacturing is where AI goes deepest: China leads with **79 Lighthouse Factories** and ranks 3rd globally in robot density (470 per 10k workers). AI inspection cuts defect rates by 50%+, predictive maintenance reduces unplanned downtime by 30%+. Try the **AI quality-inspection demo** in the Industries section!',
    },
    {
      kw: ['医疗', '诊断', '药'], kwEn: ['health', 'medical', 'doctor', 'drug'],
      a: 'AI医疗三大突破：①影像诊断——肺结节筛查准确率95%+，效率提升40%+；②药物研发——周期从10年缩短到2-3年，AlphaFold已破解**2亿+蛋白质结构**；③手术机器人与健康管理。"产业赋能"板块有**AI阅片交互演示**。',
      aEn: 'Three AI healthcare breakthroughs: ① Imaging — 95%+ lung-nodule screening accuracy, 40%+ efficiency gain; ② Drug R&D — cycles shrink from 10 years to 2-3, AlphaFold predicted **200M+ protein structures**; ③ Surgical robots & health management. Try the **AI reading-scan demo** in the Industries section!',
    },
    {
      kw: ['农业', '种植', '粮食'], kwEn: ['agricultur', 'farm', 'crop'],
      a: 'AI让"会种地"变"慧种地"：无人机巡田+多光谱成像识别病虫害，精准灌溉**节水15%+**，AI育种缩短周期20%+。中国数字农业试点面积已超3000万亩。"产业赋能"板块有**精准灌溉交互演示**。',
      aEn: 'AI turns farming from experience-driven to data-driven: drone patrols + multispectral imaging detect pests, precision irrigation **saves 15%+ water**, AI breeding shortens cycles by 20%+. China\'s digital agriculture pilot area exceeds 2M hectares. Try the **precision irrigation demo** in the Industries section!',
    },
    {
      kw: ['交通', '驾驶', '汽车'], kwEn: ['transport', 'driv', 'vehicle', 'car'],
      a: '智能交通：L2+辅助驾驶渗透率已超50%（2024），Robotaxi累计订单超10万单，智慧港口效率提升30%。车路云一体化让"单车智能"进化为"系统智能"。"产业赋能"板块有**交通信号AI调度演示**。',
      aEn: 'Smart transport: L2+ assisted driving penetration exceeds 50% (2024), Robotaxi orders surpass 100K cumulative, smart ports gain 30% efficiency. Vehicle-road-cloud integration evolves "single-car intelligence" into "system intelligence". Try the **traffic-signal AI demo** in the Industries section!',
    },
    {
      kw: ['教育', '学习', '学生'], kwEn: ['educat', 'learn', 'student', 'teacher'],
      a: 'AI教育：国家智慧教育平台用户超**2亿**，大模型化身"AI教师"提供千人千面的学习路径，AI作文批改、智能答疑覆盖城乡。联合国教科文组织称AI是"教育公平的加速器"。"产业赋能"板块有**AI学习路径演示**。',
      aEn: 'AI education: China\'s national smart-education platform has **200M+ users**; LLMs act as "AI teachers" offering personalized paths; AI grading and Q&A cover both cities and villages. UNESCO calls AI "an accelerator of educational equity". Try the **AI learning-path demo** in the Industries section!',
    },
    {
      kw: ['金融', '风控', '银行'], kwEn: ['financ', 'bank', 'risk', 'fintech'],
      a: 'AI金融：反欺诈识别率达**99%+**，信贷审批时间缩短80%+，智能投顾管理规模超万亿。量化交易、反洗钱、智能客服全面渗透。"产业赋能"板块有**AI风控扫描演示**。',
      aEn: 'AI finance: fraud detection accuracy reaches **99%+**, credit approval time cut by 80%+, robo-advisors manage ¥1T+ assets. Quant trading, AML and smart customer service are fully penetrated. Try the **AI risk-scan demo** in the Industries section!',
    },
    {
      kw: ['中国', '水平', '地位', '排名'], kwEn: ['china', 'status', 'rank', 'level'],
      a: '中国AI的全球坐标：核心产业规模**5784亿元（2023）**；AI企业超4500家；生成式AI专利申请量**全球第一**（占比60%+）；算力总规模全球第二；"灯塔工厂"全球第一。形成北京、长三角、粤港澳三大高地——详见"区域版图"地图。',
      aEn: 'China\'s AI position: core industry scale **CNY 578.4bn (2023)**; 4,500+ AI enterprises; **#1 globally** in generative-AI patents (60%+ share); 2nd in compute; 1st in Lighthouse Factories. Three highlands: Beijing-Tianjin-Hebei, Yangtze Delta, GBA — see the AI Map section.',
    },
    {
      kw: ['普通人', '拥抱', '怎么办', '学习ai', '入门', '建议'], kwEn: ['how can i', 'embrace', 'advice', 'start', 'beginner'],
      a: '普通人的AI行动指南：①**用起来**——把AI工具融入写作、编程、设计，效率立增50%+；②**学原理**——理解大模型能做什么、不能做什么；③**炼判断**——AI时代稀缺的是提出好问题的能力和审美；④**守底线**——注意数据隐私与AI幻觉。正如本站所示：AI不会取代人，但会用AI的人将取代不会用的人。',
      aEn: 'An action guide: ①**Use it** — integrate AI tools into writing, coding, design for instant 50%+ gains; ②**Learn the basics** — know what LLMs can and cannot do; ③**Sharpen judgment** — asking good questions and taste are the scarce skills; ④**Stay safe** — mind privacy and AI hallucinations. As this site shows: AI won\'t replace people, but people using AI will replace those who don\'t.',
    },
    {
      kw: ['未来', '趋势', '预测', '前景'], kwEn: ['future', 'trend', 'forecast'],
      a: '四大未来趋势：①**具身智能**——人形机器人2025年量产元年；②**AI for Science**——重塑科学发现范式；③**智能体时代**——AI Agent成为"数字劳动力"；④**绿色智能**——AI优化电网，让新质生产力也是绿色生产力。麦肯锡预测生成式AI每年可为全球经济增加**2.6~4.4万亿美元**。',
      aEn: 'Four future trends: ①**Embodied AI** — humanoid robots mass-produce from 2025; ②**AI for Science** — reshaping scientific discovery; ③**Age of Agents** — AI Agents as the "digital workforce"; ④**Green Intelligence** — AI optimizes grids, making NQPF green too. McKinsey: generative AI adds **$2.6-4.4 trillion** to the global economy annually.',
    },
    {
      kw: ['数据来源', '来源', '引用', '参考'], kwEn: ['source', 'reference', 'citation', 'data from'],
      a: '本站数据来源包括：中国信通院《人工智能发展报告》、工信部、WIPO《生成式AI专利报告》、IFR世界机器人报告、PwC《Sizing the Prize》、麦肯锡生成式AI经济报告、斯坦福《AI Index》、WEF《未来就业报告》等公开资料，部分预测值为多机构估算中值。',
      aEn: 'Data sources: CAICT AI Development Report, MIIT, WIPO Gen-AI Patent Report, IFR World Robotics, PwC "Sizing the Prize", McKinsey Gen-AI economic report, Stanford AI Index, WEF Future of Jobs Report, etc. Some forecasts are median estimates from multiple institutions.',
    },
    {
      kw: ['主题', '暗色', '亮色', '切换', '语言', '英文', '网站'], kwEn: ['theme', 'dark', 'light', 'language', 'english', 'switch', 'website'],
      a: '本站支持**🌓 暗色/亮色主题**与**中/英双语**切换（右上角按钮），所有图表、演示与文案都会实时切换并记住你的偏好。全站共有8大板块、10+图表、7个交互演示与本AI助手——欢迎逐个探索！',
      aEn: 'This site supports **🌓 dark/light themes** and **Chinese/English** switching (buttons top-right); all charts, demos and copy switch in real time and your preference is remembered. Explore 8 sections, 10+ charts, 7 interactive demos and this AI assistant!',
    },
  ];

  const FALLBACK = {
    zh: '这个问题很有意思！我目前专注于"AI×新质生产力"主题，可以试试问我：\n· 什么是新质生产力？\n· AI如何赋能制造业/医疗/农业？\n· AI会导致失业吗？\n· 什么是全要素生产率？\n也可以点击下方的问题卡片直接提问。',
    en: 'Great question! I currently focus on "AI × NQPF" topics. Try asking:\n· What is NQPF?\n· How does AI empower manufacturing/healthcare/agriculture?\n· Will AI cause unemployment?\n· What is total factor productivity?\nOr click a suggestion card below.',
  };

  function match(msg) {
    const en = Lc.getLang() === 'en';
    const q = msg.toLowerCase();
    let best = null, bestScore = 0;
    for (const item of QA) {
      const kws = en ? (item.kwEn || item.kw) : item.kw;
      let score = 0;
      for (const k of kws) if (q.includes(k.toLowerCase()) || msg.includes(k)) score += k.length;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (!best) return FALLBACK[en ? 'en' : 'zh'];
    return en ? best.aEn : best.a;
  }

  function bubble(cls, html) {
    const div = document.createElement('div');
    div.className = 'ai-msg ' + cls;
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function typeOut(text) {
    const b = bubble('bot', '');
    let i = 0;
    const html = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n·/g, '<br>·').replace(/\n/g, '<br>');
    const plain = text.replace(/\*\*/g, '');
    const timer = setInterval(() => {
      i += 2;
      const done = plain.slice(0, i).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
      // 简化：按比例截取已渲染的html文本长度
      b.innerHTML = html.slice(0, Math.floor(html.length * Math.min(1, i / plain.length)));
      body.scrollTop = body.scrollHeight;
      if (i >= plain.length) { clearInterval(timer); b.innerHTML = html; }
    }, 16);
  }

  function send(text) {
    const msg = (text || input.value).trim();
    if (!msg) return;
    input.value = '';
    bubble('user', msg.replace(/</g, '&lt;'));
    const typing = bubble('bot typing', '<span></span><span></span><span></span>');
    setTimeout(() => {
      typing.remove();
      typeOut(match(msg));
    }, 600 + Math.random() * 500);
  }

  function renderChips() {
    const chips = ['chip1', 'chip2', 'chip3', 'chip4', 'chip5', 'chip6'];
    chipsEl.innerHTML = chips.map(k => `<button data-q="${Lc.t(k).replace(/"/g, '')}">${Lc.t(k)}</button>`).join('');
    chipsEl.querySelectorAll('button').forEach(b => b.addEventListener('click', () => send(b.dataset.q)));
  }

  function greet() {
    body.innerHTML = '';
    bubble('bot', Lc.t('ai_greet').replace(/"(.+?)"/g, '"$1"'));
  }

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    fab.classList.toggle('open');
    if (panel.classList.contains('open') && !opened) { opened = true; greet(); renderChips(); }
    if (panel.classList.contains('open')) input.focus();
  });
  document.getElementById('aiClose').addEventListener('click', () => { panel.classList.remove('open'); fab.classList.remove('open'); });
  document.getElementById('aiSend').addEventListener('click', () => send());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

  window.refreshAssistant = function () {
    renderChips();
    if (opened) greet();
  };
})();
