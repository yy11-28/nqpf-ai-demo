const DATA = {
  industryScale: {
    years: ['2018','2019','2020','2021','2022','2023','2024E','2025E'],
    values: [2382,2896,3458,4150,5080,5784,6900,8200],
  },
  gdpContrib: [
    { name:'北美', name_en:'N. America', value:3.7 },
    { name:'中国', name_en:'China', value:7.0 },
    { name:'欧洲', name_en:'Europe', value:2.5 },
    { name:'其他亚洲', name_en:'Other Asia', value:1.5 },
    { name:'拉丁美洲', name_en:'Latin America', value:0.5 },
    { name:'其他', name_en:'Others', value:0.5 },
  ],
  compute: {
    years: ['2019','2020','2021','2022','2023','2024E'],
    values: [80, 95, 135, 180, 230, 310],
  },
  radar: {
    indicator: [
      { name:'劳动生产率', name_en:'Labor Productivity', max:100 },
      { name:'全要素生产率', name_en:'Total Factor Productivity', max:100 },
      { name:'创新密度', name_en:'Innovation Density', max:100 },
      { name:'绿色生产率', name_en:'Green Productivity', max:100 },
      { name:'数字渗透率', name_en:'Digital Penetration', max:100 },
      { name:'人均产出', name_en:'Output per Capita', max:100 },
    ],
    traditional: [60, 55, 35, 45, 40, 55],
    new: [95, 88, 92, 85, 95, 90],
  },
  penetration: {
    categories: ['智能制造','智慧医疗','智慧农业','智能交通','智慧教育','金融科技','智慧能源','新零售'],
    categories_en: ['Manufacturing','Healthcare','Agriculture','Transport','Education','Finance','Energy','Retail'],
    values: [72, 54, 41, 65, 48, 58, 45, 51],
  },
  efficiency: {
    categories: ['新药研发','代码生成','质量检测','客户服务','金融风控','内容创作'],
    categories_en: ['Drug R&D','Coding','Quality Inspection','Customer Service','Risk Control','Content Creation'],
    before: [100, 100, 100, 100, 100, 100],
    after:  [320, 420, 560, 380, 450, 350],
  },
  future: {
    years: ['2023','2024E','2025E','2026E','2027E','2028E','2029E','2030E'],
    values: [5784,6900,8200,9800,11800,14200,17000,20500],
  },
  models: [
    { year:2017, name:'Transformer', params:65, color:'#f59e0b' },
    { year:2018, name:'BERT', params:340, color:'#f59e0b' },
    { year:2019, name:'GPT-2', params:1500, color:'#f59e0b' },
    { year:2020, name:'GPT-3', params:175000, color:'#f59e0b' },
    { year:2021, name:'Switch Transformer', params:1600000, color:'#f59e0b' },
    { year:2022, name:'PaLM', params:540000, color:'#22d3ee' },
    { year:2023, name:'GPT-4', params:1760000, color:'#22d3ee' },
    { year:2024, name:'GPT-4o/Claude 3', params:1760000, color:'#22d3ee' },
    { year:2025, name:'GPT-5(Est.)', params:7000000, color:'#a855f7' },
  ],
  timeline: [
    { year:'1950s', title:'人工智能诞生', badge:'奠基', desc:'图灵测试（1950）与达特茅斯会议（1956）定义了AI的诞生。符号主义方法兴起。',
      en:{ title:'Birth of AI', badge:'Foundation', desc:'The Turing Test (1950) and Dartmouth Conference (1956) defined the birth of AI. Symbolic approaches emerged.' } },
    { year:'1980s', title:'专家系统繁荣', badge:'第一波浪潮', desc:'基于规则的专家系统在医疗、金融领域广泛应用，但扩展性差。',
      en:{ title:'Expert Systems Boom', badge:'1st Wave', desc:'Rule-based expert systems spread in medicine and finance, but scaled poorly.' } },
    { year:'1997', title:'深蓝战胜卡斯帕罗夫', badge:'里程碑', desc:'IBM深蓝超级计算机击败国际象棋世界冠军，标志机器首次在复杂策略游戏中超越人类顶尖选手。',
      en:{ title:'Deep Blue Beats Kasparov', badge:'Milestone', desc:'IBM Deep Blue defeated the world chess champion — the first time a machine beat a top human in a complex strategy game.' } },
    { year:'2012', title:'深度学习的爆发', badge:'转折点', desc:'AlexNet在ImageNet竞赛中以压倒性优势获胜，开启基于深度神经网络的视觉革命。',
      en:{ title:'Deep Learning Explosion', badge:'Turning Point', desc:'AlexNet won ImageNet by a landslide, launching the vision revolution powered by deep neural networks.' } },
    { year:'2016', title:'AlphaGo击败李世石', badge:'里程碑', desc:'Google DeepMind的AlphaGo战胜围棋世界冠军，强化学习+深度神经网络震撼全球。',
      en:{ title:'AlphaGo Defeats Lee Sedol', badge:'Milestone', desc:'DeepMind\u2019s AlphaGo beat the Go world champion; reinforcement learning + deep networks stunned the world.' } },
    { year:'2017', title:'Transformer架构', badge:'架构革命', desc:'《Attention Is All You Need》发表，Transformer成为现代大模型的基础架构。',
      en:{ title:'Transformer Architecture', badge:'Architecture Revolution', desc:'"Attention Is All You Need" was published; Transformer became the foundation of modern large models.' } },
    { year:'2022.11', title:'ChatGPT发布', badge:'引爆全球', desc:'OpenAI发布ChatGPT，5天用户数破百万，2个月破亿。生成式AI真正走入大众视野。',
      en:{ title:'ChatGPT Launches', badge:'Global Ignition', desc:'OpenAI launched ChatGPT: 1M users in 5 days, 100M in 2 months. Generative AI entered the mainstream.' } },
    { year:'2023', title:'百模大战', badge:'中国热潮', desc:'中国超200个大模型发布，大模型产业竞争白热化。开源生态（LLaMA、通义千问等）蓬勃发展。',
      en:{ title:'War of 100 Models', badge:'China Boom', desc:'Over 200 large models released in China; competition intensified. Open-source ecosystems (LLaMA, Qwen) thrived.' } },
    { year:'2024', title:'Sora 与视频生成', badge:'多模态突破', desc:'OpenAI发布Sora，实现高质量长视频生成。多模态大模型成为新战场，AI Agent兴起。',
      en:{ title:'Sora & Video Generation', badge:'Multimodal Breakthrough', desc:'OpenAI unveiled Sora for high-quality long-video generation. Multimodality became the new frontier; AI Agents emerged.' } },
    { year:'2025', title:'具身智能元年', badge:'正在进行', desc:'人形机器人量产、自动驾驶L3+大规模落地，AI从“数字世界”走向“物理世界”。',
      en:{ title:'Year of Embodied AI', badge:'Happening Now', desc:'Mass production of humanoid robots and L3+ autonomous driving at scale — AI steps from the digital world into the physical world.' } },
  ],
  industries: {
    manufacture: {
      title: '智能制造',
      desc: '人工智能正在重塑全球制造业：从预测性维护、智能质检到自适应排产，AI让工厂从“自动化”迈向“智能化”。中国“灯塔工厂”数量达79家居全球第一，AI助力制造业全要素生产率提升15%以上。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20smart%20manufacturing%20factory%20floor%20at%20night%2C%20robotic%20arms%20with%20glowing%20LEDs%2C%20digital%20twin%20hologram%20display%20over%20assembly%20line%2C%20blue%20and%20cyan%20ambient%20light%2C%20clean%20high-tech%20industrial%20scene%2C%20cinematic%20render&image_size=landscape_16_9',
      metrics: [
        { val: '79', unit:'家', label: '全球灯塔工厂（中国第一）' },
        { val: '470', unit:'台/万人', label: '制造业机器人密度（全球第三）' },
        { val: '+15', unit:'%', label: 'AI赋能生产率提升均值' },
        { val: '3.2', unit:'万+', label: '已建数字化车间和工厂' },
      ],
      en: {
        title: 'Smart Manufacturing',
        desc: 'AI is reshaping global manufacturing: from predictive maintenance and intelligent quality inspection to adaptive scheduling — factories evolve from "automated" to "intelligent". China leads the world with 79 "Lighthouse Factories", and AI lifts manufacturing total factor productivity by 15%+.',
        metrics: [
          { val: '79', unit:'', label: 'Lighthouse factories worldwide (China #1)' },
          { val: '470', unit:'/10K workers', label: 'Robot density in manufacturing (#3 globally)' },
          { val: '+15', unit:'%', label: 'Avg. productivity gain from AI' },
          { val: '32', unit:'K+', label: 'Digital workshops & factories built' },
        ]
      }
    },
    medical: {
      title: '智慧医疗',
      desc: 'AI辅助诊断准确率在某些疾病上已达到甚至超越人类医生；药物研发周期从10年缩短到2-3年；AlphaFold已破解超过2亿种蛋白质结构，为疾病治疗带来全新可能。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20medical%20AI%20lab%2C%20doctor%20interacting%20with%20holographic%20body%20scan%20and%20DNA%20strand%2C%20blue%20glowing%20data%20visualizations%20on%20screens%2C%20sterile%20white%20and%20teal%20lighting%2C%20highly%20detailed%20cinematic%20digital%20art&image_size=landscape_16_9',
      metrics: [
        { val: '95', unit:'%+', label: '肺结节AI筛查准确率' },
        { val: '5', unit:'倍', label: 'AI新药发现效率提升' },
        { val: '2', unit:'亿+', label: 'AlphaFold预测蛋白质结构' },
        { val: '40', unit:'%+', label: 'AI影像诊断效率提升' },
      ],
      en: {
        title: 'Smart Healthcare',
        desc: 'AI-assisted diagnosis now matches or exceeds human doctors for certain diseases; drug discovery cycles shrink from 10 years to 2-3; AlphaFold has predicted 200M+ protein structures, opening new possibilities for treatment.',
        metrics: [
          { val: '95', unit:'%+', label: 'AI lung-nodule screening accuracy' },
          { val: '5', unit:'×', label: 'Faster AI drug discovery' },
          { val: '200', unit:'M+', label: 'Protein structures predicted by AlphaFold' },
          { val: '40', unit:'%+', label: 'Efficiency gain in AI imaging diagnosis' },
        ]
      }
    },
    agriculture: {
      title: '智慧农业',
      desc: '从无人机巡田、AI育种到精准灌溉，人工智能让“会种地”变成“慧种地”。中国农作物耕种收综合机械化率超73%，AI正让农业这个最古老的产业焕发全新生机。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aerial%20view%20of%20smart%20agriculture%20greenhouses%20at%20dusk%2C%20drone%20flying%20over%20fields%20scanning%20crops%2C%20digital%20data%20overlays%20showing%20plant%20health%2C%20warm%20sunset%20light%20mixed%20with%20blue%20LED%20grow%20lights%2C%20cinematic%20high%20detail&image_size=landscape_16_9',
      metrics: [
        { val: '73', unit:'%+', label: '耕种收综合机械化率' },
        { val: '15', unit:'%', label: 'AI精准施肥节水省肥' },
        { val: '20', unit:'%+', label: 'AI育种缩短周期' },
        { val: '3000', unit:'万亩+', label: '数字农业试点面积' },
      ],
      en: {
        title: 'Smart Agriculture',
        desc: 'From drone patrols and AI breeding to precision irrigation, AI turns farming from experience-driven to data-driven. China\u2019s comprehensive mechanization rate exceeds 73%, and AI is revitalizing the oldest industry on Earth.',
        metrics: [
          { val: '73', unit:'%+', label: 'Mechanization rate of crop farming' },
          { val: '15', unit:'%', label: 'Water & fertilizer saved by precision AI' },
          { val: '20', unit:'%+', label: 'Shorter AI breeding cycles' },
          { val: '2', unit:'M ha+', label: 'Digital agriculture pilot area' },
        ]
      }
    },
    transport: {
      title: '智能交通',
      desc: '自动驾驶、智能物流、车路云一体化正在重塑出行与物流体系。百度Apollo、华为ADS、小鹏XNGP等产品推动L2+辅助驾驶快速普及，无人配送与智慧港口成为AI落地标杆。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20smart%20city%20highway%20at%20night%2C%20autonomous%20vehicles%20with%20glowing%20sensor%20beams%2C%20traffic%20data%20streams%20in%20the%20air%2C%20neon%20blue%20and%20purple%20ambient%20light%2C%20modern%20skyline%20in%20background%2C%20cinematic%20ultra%20detailed&image_size=landscape_16_9',
      metrics: [
        { val: 'L2+', unit:'', label: '渗透率超50%（2024）' },
        { val: '10', unit:'万+', label: 'Robotaxi累计订单' },
        { val: '30', unit:'%', label: '智慧港口效率提升' },
        { val: '15', unit:'%', label: '智能物流降本' },
      ],
      en: {
        title: 'Smart Transportation',
        desc: 'Autonomous driving, intelligent logistics and vehicle-road-cloud integration are reshaping mobility. Baidu Apollo, Huawei ADS and XPeng XNGP drive L2+ adoption, while unmanned delivery and smart ports set AI benchmarks.',
        metrics: [
          { val: 'L2+', unit:'', label: 'Penetration over 50% (2024)' },
          { val: '100', unit:'K+', label: 'Robotaxi cumulative orders' },
          { val: '30', unit:'%', label: 'Smart port efficiency gain' },
          { val: '15', unit:'%', label: 'Smart logistics cost reduction' },
        ]
      }
    },
    education: {
      title: '智慧教育',
      desc: '大模型化身“AI教师”，为每个学生提供千人千面的学习方案；自适应学习系统、AI作文批改、智能答疑正在重塑教育生态，让优质教育资源跨越地理鸿沟。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20classroom%20with%20students%20using%20holographic%20tablets%2C%20AI%20tutor%20avatar%20floating%20on%20screen%2C%20individual%20learning%20paths%20visualized%20as%20glowing%20charts%2C%20warm%20and%20inspiring%20lighting%2C%20clean%20modern%20architecture%2C%20cinematic%20render&image_size=landscape_16_9',
      metrics: [
        { val: '2', unit:'亿+', label: '国家智慧教育平台用户' },
        { val: '50', unit:'%+', label: 'AI助学效率提升（均值）' },
        { val: '100', unit:'%', label: '个性化学习路径覆盖' },
        { val: '6', unit:'亿+', label: '生成式AI学习用户' },
      ],
      en: {
        title: 'Smart Education',
        desc: 'Large models act as "AI teachers", offering every student a personalized learning plan. Adaptive learning systems, AI essay grading and intelligent Q&A are reshaping education, bridging geographical gaps in quality resources.',
        metrics: [
          { val: '200', unit:'M+', label: 'National smart-edu platform users' },
          { val: '50', unit:'%+', label: 'Avg. efficiency gain with AI tutoring' },
          { val: '100', unit:'%', label: 'Personalized learning path coverage' },
          { val: '600', unit:'M+', label: 'Generative-AI learning users' },
        ]
      }
    },
    finance: {
      title: '金融科技',
      desc: 'AI风控模型使欺诈识别率提升至99%+，智能投顾管理资产规模超万亿。量化交易、智能信贷审批、反洗钱——AI正在让金融服务更普惠、更安全、更高效。',
      img: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20fintech%20command%20center%2C%20giant%20curved%20screens%20showing%20real%20time%20stock%20charts%20and%20blockchain%20networks%2C%20analysts%20with%20holographic%20interfaces%2C%20dark%20blue%20and%20gold%20color%20scheme%2C%20cinematic%20high%20detail%20digital%20art&image_size=landscape_16_9',
      metrics: [
        { val: '99', unit:'%+', label: 'AI反欺诈识别率' },
        { val: '80', unit:'%+', label: '信贷审批时间缩短' },
        { val: '万亿', unit:'级', label: '智能投顾管理规模' },
        { val: '20', unit:'%+', label: '量化策略超额收益' },
      ],
      en: {
        title: 'FinTech',
        desc: 'AI risk-control models push fraud detection accuracy above 99%, and robo-advisors manage over a trillion yuan. Quantitative trading, instant credit approval and anti-money-laundering — AI makes finance more inclusive, safer and faster.',
        metrics: [
          { val: '99', unit:'%+', label: 'AI anti-fraud detection rate' },
          { val: '80', unit:'%+', label: 'Faster credit approval' },
          { val: '¥1T', unit:'+', label: 'Assets under robo-advisory' },
          { val: '20', unit:'%+', label: 'Excess return of quant strategies' },
        ]
      }
    },
  },

  /* ===== 生产力实验室 ===== */
  race: [
    { name:'美国', name_en:'United States', v0:12.0,  g:0.28 },
    { name:'中国', name_en:'China',         v0:2.5,   g:0.40 },
    { name:'英国', name_en:'United Kingdom',v0:3.0,   g:0.22 },
    { name:'德国', name_en:'Germany',       v0:2.0,   g:0.24 },
    { name:'加拿大', name_en:'Canada',      v0:2.0,   g:0.23 },
    { name:'印度', name_en:'India',         v0:1.0,   g:0.30 },
    { name:'韩国', name_en:'South Korea',   v0:1.5,   g:0.26 },
    { name:'日本', name_en:'Japan',         v0:2.0,   g:0.21 },
    { name:'以色列', name_en:'Israel',      v0:1.5,   g:0.24 },
    { name:'法国', name_en:'France',        v0:1.5,   g:0.23 },
  ],
  sankey: {
    nodes: [
      {n:'企业数据', e:'Enterprise Data'}, {n:'政务数据', e:'Gov Data'},
      {n:'互联网数据', e:'Internet Data'}, {n:'物联网感知', e:'IoT Sensing'},
      {n:'清洗与标注', e:'Cleaning & Labeling'}, {n:'数据交易所', e:'Data Exchange'},
      {n:'通用大模型', e:'Foundation LLM'}, {n:'行业大模型', e:'Industry LLM'},
      {n:'智能制造', e:'Manufacturing'}, {n:'智慧医疗', e:'Healthcare'},
      {n:'智能交通', e:'Transport'}, {n:'智慧城市', e:'Smart City'},
      {n:'降本增效', e:'Cost Reduction'}, {n:'产品创新', e:'Product Innovation'},
      {n:'新业态新模式', e:'New Business Forms'},
    ],
    links: [
      [0,4,30],[1,4,20],[2,4,25],[3,4,22],
      [0,5,12],[1,5,10],[2,5,14],
      [4,6,32],[4,7,28],[5,7,22],[5,6,10],
      [6,8,16],[6,9,10],[6,10,10],[6,11,12],
      [7,8,18],[7,9,14],[7,10,12],[7,11,10],
      [8,12,16],[8,13,12],[8,14,8],
      [9,12,10],[9,13,12],
      [10,12,10],[10,14,10],
      [11,13,10],[11,14,14],
    ],
  },
};
