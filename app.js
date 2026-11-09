/* ============================================================
 * 选择你的江湖命格 · 交互逻辑
 * ------------------------------------------------------------
 * 目录：
 *   1. 配置区  DIMS（八维） / RANKS（八命格） / QUESTIONS（题库） / MOCK（假数据）
 *   2. 工具函数
 *   3. 状态与页面切换
 *   4. 首页「已测试人数」
 *   5. 答题页（渲染 / 选择 / 上一题下一题）
 *   6. 结算：维度累加 + 命格匹配
 *   7. 结果页渲染（雷达图 / 八维偏向 / 选择分布）
 *   8. 复制文字
 *   9. 生成分享长图（Canvas 手绘，不依赖 html2canvas）
 *  10. 启动
 *
 * 想改题库 / 文案 / 分值，只需要动第 1 节的三个对象：
 *   - QUESTIONS[].options[].scores  该选项给八个维度各加多少分
 *   - QUESTIONS[].options[].rank    该选项偏向的命格 id（可以写数组，表示二选一都可能）
 *   - RANKS[id].profile             该命格的八维画像（1~5 分），用于雷达图与匹配
 * ============================================================ */

/* ============================================================
 * 1. 配置区
 * ============================================================ */

/** 八维维度（顺序即雷达图顺时针顺序） */
const DIMS = ['热忱', '洒脱', '隐忍', '野心', '共情', '疏离', '侠义', '随性'];

/** 八个江湖命格
 *  profile：八维画像 1~5 分，既用于雷达图基准，也用于最终命格匹配
 *  seal：结果卡片右上角印章里的那个字
 */
const RANKS = {
  xiaoyao: {
    id: 'xiaoyao',
    name: '逍遥剑客',
    slogan: '身携一剑，不问归途',
    seal: '剑',
    desc:
      '靠近你便会撞见山野长风，你不喜束缚，江湖规矩大多入不了你的心。你有自己的道义，不主动惹纷争，但从不会任人拿捏。偏爱自在，来去随心，热闹可以参与，独处也自得其乐。旁人总羡慕你无牵无挂，可只有你知道，你只为心里认定的值得奔赴。',
    profile: { 热忱: 2, 洒脱: 5, 隐忍: 2, 野心: 1, 共情: 2, 疏离: 4, 侠义: 4, 随性: 4 },
  },
  yizhe: {
    id: 'yizhe',
    name: '隐世医者',
    slogan: '悬壶不问名利，只渡有缘之人',
    seal: '医',
    desc:
      '你骨子里柔软悲悯，习惯看见别人的难处，愿意伸手托住陷入困境的人。不爱争风头，不爱卷入江湖纷争，守着一方小天地。但你的善良有底线，清楚什么人值得善待，一旦被消耗，便会悄悄退回深山不再露面。温和但有风骨。',
    profile: { 热忱: 3, 洒脱: 1, 隐忍: 4, 野心: 1, 共情: 5, 疏离: 2, 侠义: 3, 随性: 2 },
  },
  zhanggui: {
    id: 'zhanggui',
    name: '商行掌柜',
    slogan: '算盘算得失，心底存温情',
    seal: '商',
    desc:
      '通透务实，看人眼光很准，懂得权衡利弊，擅长把杂乱的事情理顺。在外精明稳重，懂人情世故，在江湖里给自己挣一份安稳。看似处处计较得失，实则内心很重情义，认定的朋友，危难之时愿意倾力相助。',
    profile: { 热忱: 4, 洒脱: 2, 隐忍: 3, 野心: 4, 共情: 2, 疏离: 2, 侠义: 2, 随性: 2 },
  },
  shaozhu: {
    id: 'shaozhu',
    name: '门派少主',
    slogan: '身负期许，进退皆有担当',
    seal: '少',
    desc:
      '天生带着一份责任感，习惯扛事，别人很容易信任、依赖你。有格局，懂分寸，遇事不会慌乱。肩上一直背着旁人的期待，偶尔也会想抛开一切逃去山野。你强大可靠，但也会偷偷疲惫，渴望有人看见你卸下重担的模样。',
    profile: { 热忱: 3, 洒脱: 1, 隐忍: 4, 野心: 5, 共情: 2, 疏离: 2, 侠义: 4, 随性: 1 },
  },
  cike: {
    id: 'cike',
    name: '独行刺客',
    slogan: '来去无声，心事自藏',
    seal: '刺',
    desc:
      '习惯独自前行，很少向外袒露软肋，防备心很重，不轻易交付信任。目标感极强，认准的事会安静坚持到底。看起来冷淡疏离，不爱合群，可内心藏着一份不对外言说的坚持，有自己绝对不会打破的底线。',
    profile: { 热忱: 1, 洒脱: 2, 隐忍: 4, 野心: 3, 共情: 1, 疏离: 5, 侠义: 1, 随性: 1 },
  },
  laoban: {
    id: 'laoban',
    name: '客栈老板娘',
    slogan: '迎八方来客，知人间悲欢',
    seal: '客',
    desc:
      '你是江湖里温柔的落脚点，擅长倾听，包容各色各样的人。通透又乐观，见多了江湖离合，很少偏激。热闹是你的底色，你愿意接纳路过的旅人，可你心里始终留着一块只属于自己的安静角落。',
    profile: { 热忱: 5, 洒脱: 2, 隐忍: 2, 野心: 1, 共情: 4, 疏离: 1, 侠义: 2, 随性: 4 },
  },
  sanren: {
    id: 'sanren',
    name: '山野散人',
    slogan: '居山林之间，与风月为伴',
    seal: '散',
    desc:
      '不喜喧嚣争斗，对世俗名利没有执念，偏爱平淡松弛的日子。情绪稳定，很少与人起冲突，对很多事情都看得很淡。不是软弱，只是你想要的从来不是江湖功名，只是风、山、安静的时光。',
    profile: { 热忱: 2, 洒脱: 4, 隐忍: 2, 野心: 1, 共情: 2, 疏离: 3, 侠义: 1, 随性: 5 },
  },
  shuoshu: {
    id: 'shuoshu',
    name: '说书人',
    slogan: '阅尽江湖事，笑说往来人',
    seal: '说',
    desc:
      '你善于观察所有人，看透人心却很少戳破。口才好，有趣，总能把平淡的故事讲得动人。你游离在纷争之外，做一个旁观者。你见过很多悲欢，看似什么都懂，却很少有人真正读懂你藏在故事背后的心事。',
    profile: { 热忱: 2, 洒脱: 3, 隐忍: 2, 野心: 1, 共情: 4, 疏离: 3, 侠义: 1, 随性: 4 },
  },
};

/** 命格顺序（同时决定“其几”的编号与结果页展示顺序） */
const RANK_LIST = [
  RANKS.xiaoyao,
  RANKS.yizhe,
  RANKS.zhanggui,
  RANKS.shaozhu,
  RANKS.cike,
  RANKS.laoban,
  RANKS.sanren,
  RANKS.shuoshu,
];

/** 八道题
 *  scores：本选项在八维上的加分（只写要加的维度）
 *  rank  ：本选项偏向的命格，可写字符串或数组
 */
const QUESTIONS = [
  {
    title: '你赶路途经岔路，前方有三条路，你会选？',
    options: [
      { text: '热闹的城镇官道', rank: 'laoban', scores: { 热忱: 3, 共情: 2, 随性: 1 } },
      { text: '幽静无人的山间小路', rank: 'sanren', scores: { 随性: 3, 洒脱: 2, 疏离: 1 } },
      { text: '危机四伏、藏有秘宝的险道', rank: 'cike', scores: { 疏离: 3, 野心: 2, 隐忍: 1 } },
      { text: '能最快抵达目的地的大路', rank: 'shaozhu', scores: { 野心: 3, 侠义: 2, 隐忍: 1 } },
    ],
  },
  {
    title: '萍水相逢的路人身陷险境，你会？',
    options: [
      { text: '权衡利弊，有把握再出手', rank: 'zhanggui', scores: { 野心: 2, 隐忍: 2, 热忱: 1 } },
      { text: '出手相救，不问对方身份', rank: 'yizhe', scores: { 共情: 3, 侠义: 2, 热忱: 1 } },
      { text: '看心情，顺路就帮，不顺路便离开', rank: 'xiaoyao', scores: { 洒脱: 3, 随性: 1, 侠义: 1 } },
      { text: '远远旁观，记下这段故事就走', rank: 'shuoshu', scores: { 疏离: 3, 共情: 1, 洒脱: 1 } },
    ],
  },
  {
    title: '江湖好友邀你一同争夺武林至宝，你的想法？',
    options: [
      { text: '宝物不重要，和朋友同行就很好', rank: 'laoban', scores: { 热忱: 3, 共情: 2, 侠义: 1 } },
      { text: '毫无兴趣，只想远离纷争', rank: 'sanren', scores: { 随性: 3, 疏离: 2, 洒脱: 1 } },
      { text: '志在必得，这是你想要的目标', rank: 'shaozhu', scores: { 野心: 3, 侠义: 2, 隐忍: 1 } },
      { text: '宝物可以换需要的东西，值得谋划', rank: 'zhanggui', scores: { 野心: 2, 隐忍: 2, 洒脱: 1 } },
    ],
  },
  {
    title: '夜深独坐，你更愿意？',
    options: [
      { text: '独自练剑，享受安静', rank: 'xiaoyao', scores: { 洒脱: 2, 疏离: 2, 随性: 1 } },
      { text: '和来往旅人闲谈，听各地故事', rank: 'laoban', scores: { 热忱: 3, 共情: 2 } },
      { text: '整理药方，研磨草药', rank: 'yizhe', scores: { 共情: 3, 隐忍: 2, 热忱: 1 } },
      { text: '复盘谋划，盘算往后的安排', rank: 'cike', scores: { 隐忍: 3, 野心: 2, 疏离: 1 } },
    ],
  },
  {
    title: '被人误会、无端诋毁时，你会？',
    options: [
      { text: '懒得辩解，随别人怎么想', rank: 'sanren', scores: { 随性: 3, 洒脱: 2, 疏离: 1 } },
      { text: '有理有据，冷静澄清，守住自己的名声', rank: 'zhanggui', scores: { 隐忍: 2, 野心: 2, 热忱: 1 } },
      { text: '沉默记在心里，不再和此人深交', rank: 'cike', scores: { 疏离: 3, 隐忍: 2 } },
      { text: '一笑而过，把这件事当成一段新故事', rank: 'shuoshu', scores: { 洒脱: 2, 随性: 2, 共情: 1 } },
    ],
  },
  {
    title: '你心中的江湖，更接近？',
    options: [
      { text: '快意恩仇，无拘无束', rank: 'xiaoyao', scores: { 洒脱: 3, 侠义: 2, 随性: 1 } },
      { text: '烟火不息，人来人往', rank: 'laoban', scores: { 热忱: 3, 共情: 2, 随性: 1 } },
      { text: '秩序道义，责任为先', rank: 'shaozhu', scores: { 侠义: 3, 野心: 2, 隐忍: 1 } },
      { text: '人海浮沉，众生皆故事', rank: 'shuoshu', scores: { 共情: 2, 疏离: 3 } },
    ],
  },
  {
    title: '赶路途中囊中羞涩，你会？',
    options: [
      { text: '凭手艺换盘缠（行医／说书／卖艺）', rank: ['yizhe', 'shuoshu'], scores: { 共情: 2, 隐忍: 1, 洒脱: 1 } },
      { text: '想办法做生意周转', rank: 'zhanggui', scores: { 野心: 2, 热忱: 2, 隐忍: 1 } },
      { text: '随缘，能走多远算多远', rank: 'sanren', scores: { 随性: 3, 洒脱: 2 } },
      { text: '接一单有风险的差事换取报酬', rank: 'cike', scores: { 野心: 3, 隐忍: 2, 疏离: 1 } },
    ],
  },
  {
    title: '如果可以选择，你最想要的结局？',
    options: [
      { text: '名扬江湖，受人敬重', rank: 'shaozhu', scores: { 野心: 3, 侠义: 2, 隐忍: 1 } },
      { text: '归隐山林，不问世事', rank: 'sanren', scores: { 随性: 3, 疏离: 2, 洒脱: 1 } },
      { text: '四海漂泊，永远在路上', rank: 'xiaoyao', scores: { 洒脱: 3, 随性: 2, 侠义: 1 } },
      { text: '守一方小店，看往来过客', rank: 'laoban', scores: { 热忱: 2, 共情: 3, 随性: 1 } },
    ],
  },
];

/** 前端假数据：已测试人数的基数（真实项目里换成接口返回值即可） */
const MOCK = {
  testedBase: 28416, // 基数
  testedJitter: 1531, // 每日浮动
  localKey: 'jianghu.tested', // 本地记录自己贡献的次数
};

/* 匹配权重：命格投票占 55%，八维画像相似度占 45%
 * 投票会先按「该命格在题库里最多能拿多少票」归一，
 * 这样只出现 3 次的隐世医者不会天然吃亏 */
const MATCH_WEIGHTS = { vote: 0.55, profile: 0.45 };

/** 每个命格在题库里最多能拿到的票数（用于归一化，自动统计，不用手改） */
const RANK_ATTAIN = (() => {
  const map = {};
  RANK_LIST.forEach((r) => (map[r.id] = 0));
  QUESTIONS.forEach((q) =>
    q.options.forEach((opt) => {
      const targets = (Array.isArray(opt.rank) ? opt.rank : [opt.rank]).filter(Boolean);
      targets.forEach((id) => {
        if (map[id] !== undefined) map[id] += 1 / targets.length;
      });
    })
  );
  return map;
})();

/* ============================================================
 * 2. 工具函数
 * ============================================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八'];
const OPT_MARK = ['甲', '乙', '丙', '丁'];
const SERIF =
  '"Source Han Serif SC","Source Han Serif CN","Noto Serif SC","Songti SC","STSong","SimSun",serif';
const SANS = '"Inter",-apple-system,"Helvetica Neue",Arial,"PingFang SC","Microsoft YaHei",sans-serif';

const formatNum = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** 元素淡入淡出切换：先给 .is-out，再换内容 */
function withFade(el, fn, delay = 150) {
  el.classList.add('is-out');
  window.clearTimeout(el._fadeTimer);
  el._fadeTimer = window.setTimeout(() => {
    fn();
    el.classList.remove('is-out');
  }, delay);
}

let toastTimer = null;
function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.classList.add('is-show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-show'), 2200);
}

/* ============================================================
 * 3. 状态与页面切换
 * ============================================================ */
const state = {
  index: 0, // 当前第几题（0 起）
  answers: new Array(QUESTIONS.length).fill(null), // 每题选了第几个选项
  locked: false, // 自动跳题的短暂锁
  autoTimer: null,
  result: null, // 结算结果
};

const SCREENS = {
  cover: $('#screen-cover'),
  quiz: $('#screen-quiz'),
  result: $('#screen-result'),
};

function showScreen(name) {
  Object.entries(SCREENS).forEach(([key, el]) => {
    el.classList.toggle('is-active', key === name);
  });
  window.scrollTo({ top: 0, behavior: 'auto' });
}

/* ============================================================
 * 4. 首页「已测试人数」（纯前端假数据，可换成接口）
 * ============================================================ */
function readLocalCount() {
  try {
    return Number(window.localStorage.getItem(MOCK.localKey) || 0) || 0;
  } catch (e) {
    return 0;
  }
}
function bumpLocalCount() {
  try {
    window.localStorage.setItem(MOCK.localKey, String(readLocalCount() + 1));
  } catch (e) {
    /* 隐私模式下忽略 */
  }
}
function fakeTestedCount() {
  const day = Math.floor(Date.now() / 86400000);
  const daily = (day * 7919) % MOCK.testedJitter;
  const wave = ((day * 37) % 97) * 3;
  return MOCK.testedBase + daily + wave + readLocalCount();
}

/** 数字滚动：从 target-40 涨到 target，900ms 缓出 */
function animateCount(el, target) {
  const from = Math.max(0, target - 40);
  const dur = 900;
  const t0 = performance.now();
  const tick = (now) => {
    const p = clamp((now - t0) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = formatNum(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ============================================================
 * 5. 答题页
 * ============================================================ */
const quizBody = $('#quiz-body');
const optionsEl = $('#options');
const qTitleEl = $('#q-title');
const qIndexEl = $('#q-index');
const progressFill = $('#progress-fill');
const progressText = $('#quiz-progress-text');
const btnPrev = $('#btn-prev');
const btnNext = $('#btn-next');

function updateProgress() {
  const current = state.index + 1;
  const total = QUESTIONS.length;
  progressText.textContent = `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  progressFill.style.width = `${(current / total) * 100}%`;
  const bar = $('.progress');
  if (bar) bar.setAttribute('aria-valuenow', String(current));
}

function updateNav() {
  const isLast = state.index === QUESTIONS.length - 1;
  const answered = state.answers[state.index] !== null;
  btnPrev.disabled = state.index === 0;
  btnNext.disabled = !answered;
  btnNext.textContent = isLast ? '查看命格' : '下一题';
  btnNext.classList.toggle('btn-primary', isLast);
  btnNext.classList.toggle('btn-outline', !isLast);
}

function renderQuestion() {
  const q = QUESTIONS[state.index];
  qIndexEl.textContent = `第 ${CN_NUM[state.index]} 问`;
  qTitleEl.textContent = q.title;
  optionsEl.innerHTML = q.options
    .map((opt, i) => {
      const checked = state.answers[state.index] === i;
      return `<button class="option${checked ? ' is-selected' : ''}" type="button"
        role="radio" aria-checked="${checked}" data-idx="${i}" style="--i:${i}">
        <span class="mark">${OPT_MARK[i] || i + 1}</span>
        <span class="text">${opt.text}</span>
      </button>`;
    })
    .join('');
  updateProgress();
  updateNav();
}

/** 切到第 index 题（带一次柔和淡出淡入） */
function gotoQuestion(index) {
  if (index === state.index) return;
  window.clearTimeout(state.autoTimer);
  state.locked = false;
  withFade(quizBody, () => {
    state.index = index;
    renderQuestion();
  });
}

function chooseOption(idx) {
  if (state.locked) return;
  const q = QUESTIONS[state.index];
  if (!q.options[idx]) return;
  state.answers[state.index] = idx;

  $$('.option', optionsEl).forEach((el, i) => {
    const on = i === idx;
    el.classList.toggle('is-selected', on);
    el.setAttribute('aria-checked', String(on));
  });
  updateNav();

  // 选完稍作停顿自动进入下一题；最后一题则自动结算（也都可以手动点按钮）
  state.locked = true;
  window.clearTimeout(state.autoTimer);
  if (state.index < QUESTIONS.length - 1) {
    state.autoTimer = window.setTimeout(() => {
      state.locked = false;
      gotoQuestion(state.index + 1);
    }, 420);
  } else {
    state.autoTimer = window.setTimeout(() => {
      state.locked = false;
      settle();
    }, 560);
  }
}

function nextStep() {
  window.clearTimeout(state.autoTimer);
  state.locked = false;
  if (state.index < QUESTIONS.length - 1) {
    gotoQuestion(state.index + 1);
  } else {
    settle();
  }
}

function prevStep() {
  window.clearTimeout(state.autoTimer);
  state.locked = false;
  if (state.index > 0) gotoQuestion(state.index - 1);
}

/* ============================================================
 * 6. 结算：维度累加 + 命格匹配
 * ============================================================ */
function computeResult(answers) {
  const dimTotals = DIMS.map(() => 0);
  const votes = {};
  RANK_LIST.forEach((r) => (votes[r.id] = 0));

  answers.forEach((pick, qi) => {
    const q = QUESTIONS[qi];
    if (!q || pick === null || !q.options[pick]) return;
    const opt = q.options[pick];

    // ① 维度加分
    Object.keys(opt.scores || {}).forEach((dim) => {
      const idx = DIMS.indexOf(dim);
      if (idx >= 0) dimTotals[idx] += opt.scores[dim];
    });

    // ② 命格投票（选项可同时偏向两个命格，则各得一半票）
    const targets = (Array.isArray(opt.rank) ? opt.rank : [opt.rank]).filter(Boolean);
    targets.forEach((id) => {
      if (votes[id] !== undefined) votes[id] += 1 / targets.length;
    });
  });

  const maxDim = Math.max(...dimTotals, 1);

  const scored = RANK_LIST.map((rank) => {
    // 八维画像相似度：把答题得分与命格画像都归一到 0~1 后算距离
    let dist2 = 0;
    DIMS.forEach((dim, i) => {
      const user = dimTotals[i] / maxDim;
      const base = rank.profile[dim] / 5;
      dist2 += (user - base) * (user - base);
    });
    const sim = clamp(1 - Math.sqrt(dist2) / Math.sqrt(DIMS.length), 0, 1);
    // 命格票数按各自可得上限归一化
    const vote = votes[rank.id] / (RANK_ATTAIN[rank.id] || 1);
    return {
      rank,
      votes: votes[rank.id],
      sim,
      weight: vote * MATCH_WEIGHTS.vote + sim * MATCH_WEIGHTS.profile,
    };
  });

  // 排序：综合分 → 票数 → 画像相似度
  const ranked = scored.slice().sort((a, b) => b.weight - a.weight || b.votes - a.votes || b.sim - a.sim);

  // 本次选择分布（百分比取整并配平到 100%）
  const sumWeight = ranked.reduce((s, x) => s + x.weight, 0) || 1;
  const raw = ranked.map((x) => (x.weight / sumWeight) * 100);
  const pcts = raw.map((v) => Math.floor(v));
  let rest = 100 - pcts.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ i }) => {
      if (rest > 0) {
        pcts[i] += 1;
        rest -= 1;
      }
    });
  const dist = ranked.map((x, i) => ({ rank: x.rank, pct: pcts[i], weight: x.weight }));

  // 雷达图数值：把得分映射到 30~100，形状更好看，同时保留相对强弱
  const minDim = Math.min(...dimTotals);
  const span = maxDim - minDim || 1;
  const radarValues = dimTotals.map((v) => Math.round(30 + 70 * ((v - minDim) / span)));

  return { rank: ranked[0].rank, dimTotals, radarValues, dist };
}

/* ============================================================
 * 7. 结果页渲染
 * ============================================================ */
let radarChart = null;
const resultEl = {
  no: $('#rank-no'),
  seal: $('#rank-seal'),
  name: $('#rank-name'),
  slogan: $('#rank-slogan'),
  desc: $('#rank-desc'),
  chips: $('#dim-chips'),
  dist: $('#dist-list'),
};

/** 取命格画像里最高的三个维度，做「八维偏向」小标签 */
function topDims(profile) {
  return DIMS.map((d) => ({ dim: d, value: profile[d] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}
const starText = (n) => '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n));

function renderDimChips(rank) {
  resultEl.chips.innerHTML = topDims(rank.profile)
    .map(({ dim, value }) => {
      const on = '★'.repeat(value);
      const off = '★'.repeat(Math.max(0, 5 - value));
      return `<li><span>${dim}</span><span class="stars">${on}<i class="off">${off}</i></span></li>`;
    })
    .join('');
}

function renderDistribution(dist) {
  resultEl.dist.innerHTML = dist
    .map(
      (item, i) => `<li class="dist-row${i === 0 ? ' is-top' : ''}">
        <span class="name">${item.rank.name}</span>
        <span class="bar"><i data-w="${item.pct}"></i></span>
        <span class="pct">${item.pct}%</span>
      </li>`
    )
    .join('');
  // 下一帧再设宽度，让条形有一次柔和的生长
  requestAnimationFrame(() => {
    $$('#dist-list .bar i').forEach((el) => {
      el.style.width = `${el.dataset.w}%`;
    });
  });
}

function renderRadar(values) {
  const canvas = $('#radar');
  if (!canvas || typeof Chart === 'undefined') return;
  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }
  radarChart = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: DIMS,
      datasets: [
        {
          data: values,
          borderColor: 'rgba(107,124,124,.9)',
          borderWidth: 1.6,
          backgroundColor: 'rgba(107,124,124,.13)',
          pointBackgroundColor: '#8c6b55',
          pointBorderColor: '#f6f3ec',
          pointBorderWidth: 1.2,
          pointRadius: 2.6,
          pointHoverRadius: 2.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000, easing: 'easeOutQuart' },
      layout: { padding: 4 },
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          angleLines: { color: 'rgba(51,51,51,.10)', lineWidth: 1 },
          grid: { color: 'rgba(51,51,51,.09)', lineWidth: 1, circular: false },
          ticks: { display: false, stepSize: 25 },
          pointLabels: {
            color: '#4a4a48',
            padding: 7,
            font: { family: SERIF, size: 12.5 },
          },
        },
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      elements: { line: { tension: 0 } },
    },
  });
}

function renderResult(result) {
  const { rank, dist, radarValues } = result;
  resultEl.no.textContent = CN_NUM[RANK_LIST.indexOf(rank)] || '一';
  resultEl.seal.textContent = rank.seal;
  resultEl.name.textContent = rank.name;
  resultEl.slogan.textContent = `「${rank.slogan}」`;
  resultEl.desc.textContent = rank.desc;
  renderDimChips(rank);
  renderDistribution(dist);
  requestAnimationFrame(() => renderRadar(radarValues));
}

function settle() {
  // 保险：万一有题没答，按第一项补齐
  state.answers = state.answers.map((v, i) => (v === null ? 0 : v));
  state.result = computeResult(state.answers);
  renderResult(state.result);
  bumpLocalCount();
  showScreen('result');
}

/* ============================================================
 * 8. 复制文字
 * ============================================================ */
function resultText(result) {
  const { rank, dist } = result;
  const dims = topDims(rank.profile)
    .map(({ dim, value }) => `${dim} ${'★'.repeat(value)}`)
    .join('  ');
  return [
    `我的江湖命格：${rank.name}`,
    `「${rank.slogan}」`,
    '',
    rank.desc,
    '',
    `八维偏向：${dims}`,
    `本次选择分布：${dist.map((d) => `${d.rank.name} ${d.pct}%`).join(' / ')}`,
    '',
    '—— 选择你的江湖命格 · 8 道直觉题测出你的江湖命格',
  ].join('\n');
}

async function copyResult() {
  if (!state.result) return;
  const text = resultText(state.result);
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', 'readonly');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast('文案已复制，去粘贴吧');
  } catch (e) {
    toast('复制失败，请手动长按选择文字');
  }
}

/* ============================================================
 * 9. 生成分享长图（1080 × 1620，2:3，适合小红书）
 * ============================================================ */
const POSTER = { w: 1080, h: 1620, pad: 96 };

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** 按字距居中绘制文字（Canvas 无 letter-spacing，手写一份） */
function drawSpaced(g, text, cx, y, spacing) {
  const chars = Array.from(text);
  const widths = chars.map((c) => g.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  chars.forEach((c, i) => {
    g.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  return total;
}

/** 中文折行：避免行首出现标点 */
const NO_LINE_START = '，。、；：？！）」』】…·%';
function wrapText(g, text, maxWidth) {
  const lines = [];
  let line = '';
  Array.from(text).forEach((ch) => {
    if (ch === '\n') {
      lines.push(line);
      line = '';
      return;
    }
    const test = line + ch;
    if (line && g.measureText(test).width > maxWidth) {
      if (NO_LINE_START.includes(ch)) {
        lines.push(test); // 标点挤在行尾，不下移
        line = '';
        return;
      }
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

/** 纸张纹理：细颗粒 + 纤维 + 一角淡墨 */
function posterPaper(g) {
  const { w, h } = POSTER;
  g.fillStyle = '#f6f3ec';
  g.fillRect(0, 0, w, h);

  // 淡墨晕
  const blob = g.createRadialGradient(w * 0.82, h * 0.08, 20, w * 0.82, h * 0.08, 420);
  blob.addColorStop(0, 'rgba(107,124,124,.10)');
  blob.addColorStop(0.55, 'rgba(107,124,124,.04)');
  blob.addColorStop(1, 'rgba(107,124,124,0)');
  g.fillStyle = blob;
  g.fillRect(0, 0, w, h * 0.5);

  // 颗粒
  for (let i = 0; i < 2400; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    g.fillStyle = `rgba(51,51,51,${0.012 + Math.random() * 0.028})`;
    g.fillRect(x, y, 1.3, 1.3);
  }
  // 纤维
  for (let i = 0; i < 34; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const len = 50 + Math.random() * 150;
    g.strokeStyle = `rgba(140,107,85,${0.012 + Math.random() * 0.018})`;
    g.lineWidth = 0.8;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + len, y + (Math.random() - 0.5) * 5);
    g.stroke();
  }
}

function drawSeal(g, char, x, y, size) {
  g.save();
  g.translate(x, y);
  g.rotate((-4 * Math.PI) / 180);
  g.strokeStyle = 'rgba(140,107,85,.62)';
  g.lineWidth = 2;
  roundRect(g, -size / 2, -size / 2, size, size, 6);
  g.stroke();
  g.strokeStyle = 'rgba(140,107,85,.22)';
  g.lineWidth = 1;
  roundRect(g, -size / 2 + 5, -size / 2 + 5, size - 10, size - 10, 3);
  g.stroke();
  g.fillStyle = 'rgba(140,107,85,.92)';
  g.font = `400 ${Math.round(size * 0.56)}px ${SERIF}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(char, 0, 2);
  g.restore();
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
}

/** 在给定 context 上绘制海报；draw=false 时只量高度 */
function paintPoster(g, result, radarImg, opt, draw) {
  const { w, h, pad } = POSTER;
  const cx = w / 2;
  const rank = result.rank;
  const sp = opt.spread || 0; // 版面有富余时，均摊到几个大间距里
  if (draw) posterPaper(g);

  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';

  // —— 顶部小字 ——
  let y = 108;
  if (draw) {
    g.fillStyle = 'rgba(107,124,124,.95)';
    g.font = `400 24px ${SANS}`;
    drawSpaced(g, `江湖命格 · 其 ${CN_NUM[RANK_LIST.indexOf(rank)]}`, cx, y, 9);
    drawSeal(g, rank.seal, w - pad - 22, 96, 62);
  }

  // —— 命格大标题 ——
  y += 88;
  if (draw) {
    g.fillStyle = '#333333';
    g.font = `600 ${opt.titleSize}px ${SERIF}`;
    drawSpaced(g, rank.name, cx, y, 14);
  }

  // —— slogan ——
  y += 58;
  if (draw) {
    g.fillStyle = 'rgba(140,107,85,.95)';
    g.font = `400 30px ${SERIF}`;
    drawSpaced(g, `「${rank.slogan}」`, cx, y, 4);
  }

  // —— 分隔线 ——
  y += 38;
  if (draw) {
    g.strokeStyle = 'rgba(51,51,51,.16)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx - 56, y);
    g.lineTo(cx + 56, y);
    g.stroke();
    g.fillStyle = 'rgba(107,124,124,.75)';
    g.beginPath();
    g.arc(cx, y, 2.6, 0, Math.PI * 2);
    g.fill();
  }

  // —— 长文案 ——
  y += 52;
  g.font = `400 ${opt.descSize}px ${SERIF}`;
  const descWidth = w - pad * 2 - 40;
  const lines = wrapText(g, rank.desc, descWidth);
  if (draw) {
    g.fillStyle = '#45453f';
    g.font = `400 ${opt.descSize}px ${SERIF}`;
    const startX = cx - descWidth / 2;
    lines.forEach((line, i) => {
      g.fillText(line, startX, y + i * opt.descLH);
    });
  }
  y += (lines.length - 1) * opt.descLH;

  // —— 雷达图标题 ——
  y += 54 + sp;
  if (draw) {
    g.fillStyle = 'rgba(107,124,124,.95)';
    g.font = `400 21px ${SANS}`;
    drawSpaced(g, '你的性格八维雷达图', cx, y, 7);
  }

  // —— 雷达图 ——
  const radarSize = opt.radarSize;
  const radarTop = y + 24;
  if (draw && radarImg) {
    g.drawImage(radarImg, cx - radarSize / 2, radarTop, radarSize, radarSize);
  }
  y = radarTop + radarSize;

  // —— 八维偏向 ——
  y += 36 + sp;
  if (draw) {
    g.fillStyle = 'rgba(140,107,85,.92)';
    g.font = `400 21px ${SERIF}`;
    const parts = topDims(rank.profile).map(({ dim, value }) => `${dim} ${'★'.repeat(value)}`);
    drawSpaced(g, parts.join('   '), cx, y, 3);
  }

  // —— 本次选择分布 ——
  y += 48 + sp * 0.85;
  if (draw) {
    g.fillStyle = 'rgba(107,124,124,.95)';
    g.font = `400 21px ${SANS}`;
    drawSpaced(g, '本次选择分布', cx, y, 7);
  }
  y += 36;

  const dist = result.dist;
  const colX = [pad + 26, cx + 34];
  const rowH = 42;
  const nameW = 132;
  const barW = 150;
  dist.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = colX[col];
    const rowY = y + row * rowH;
    if (!draw) return;
    const isTop = i === 0;
    g.font = `400 20px ${SERIF}`;
    g.fillStyle = isTop ? '#333333' : 'rgba(51,51,51,.62)';
    g.fillText(item.rank.name, x, rowY + 14);

    const barX = x + nameW;
    const barY = rowY + 6;
    g.fillStyle = 'rgba(51,51,51,.08)';
    roundRect(g, barX, barY, barW, 5, 2.5);
    g.fill();
    g.fillStyle = isTop ? 'rgba(51,51,51,.8)' : 'rgba(107,124,124,.55)';
    roundRect(g, barX, barY, Math.max(3, (barW * item.pct) / 100), 5, 2.5);
    g.fill();

    g.font = `400 18px ${SANS}`;
    g.fillStyle = isTop ? 'rgba(140,107,85,.95)' : 'rgba(51,51,51,.42)';
    g.textAlign = 'right';
    g.fillText(`${item.pct}%`, barX + barW + 52, rowY + 14);
    g.textAlign = 'left';
  });
  y += rowH * 4;

  // —— 页脚 ——
  const footY = h - 74;
  if (draw) {
    g.strokeStyle = 'rgba(51,51,51,.12)';
    g.setLineDash([4, 5]);
    g.beginPath();
    g.moveTo(pad + 30, footY - 44);
    g.lineTo(w - pad - 30, footY - 44);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = 'rgba(107,124,124,.7)';
    g.font = `400 19px ${SANS}`;
    drawSpaced(g, '选择你的江湖命格 · 江湖命格测试', cx, footY, 4);
  }
  // 只返回内容底边，页脚单独定位（否则量高度时永远等于页脚位置）
  return y;
}

/** 为海报单独渲染一张高清雷达图（字号更大，缩放到海报里才清楚） */
async function posterRadarImage(values) {
  if (typeof Chart === 'undefined') return null;
  const size = 760;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'radar',
    data: {
      labels: DIMS,
      datasets: [
        {
          data: values,
          borderColor: 'rgba(107,124,124,.92)',
          borderWidth: 2,
          backgroundColor: 'rgba(107,124,124,.12)',
          pointBackgroundColor: '#8c6b55',
          pointBorderColor: '#f6f3ec',
          pointBorderWidth: 1.6,
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      devicePixelRatio: 1,
      layout: { padding: 16 },
      scales: {
        r: {
          min: 0,
          max: 100,
          angleLines: { color: 'rgba(51,51,51,.11)', lineWidth: 1.2 },
          grid: { color: 'rgba(51,51,51,.10)', lineWidth: 1.2, circular: false },
          ticks: { display: false, stepSize: 25 },
          pointLabels: {
            color: '#4a4a48',
            padding: 14,
            font: { family: SERIF, size: 27 },
          },
        },
      },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      elements: { line: { tension: 0 } },
    },
  });
  const url = chart.toBase64Image('image/png', 1);
  chart.destroy();
  return loadImage(url);
}

/** 裁掉雷达图四周的透明留白，这样同样尺寸下图形能画得更大 */
function cropCanvasImage(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d');
  g.drawImage(img, 0, 0);
  const { data } = g.getImageData(0, 0, c.width, c.height);

  let minX = c.width;
  let minY = c.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) {
      if (data[(y * c.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return img;

  // 裁成正方形，保证雷达不被拉变形
  const side = Math.max(maxX - minX, maxY - minY) + 24;
  const cxBox = (minX + maxX) / 2;
  const cyBox = (minY + maxY) / 2;
  const out = document.createElement('canvas');
  out.width = side;
  out.height = side;
  out
    .getContext('2d')
    .drawImage(c, cxBox - side / 2, cyBox - side / 2, side, side, 0, 0, side, side);
  return loadImage(out.toDataURL('image/png'));
}

/** 生成海报 Canvas（自动适配内容高度：先量后画，必要时缩小雷达图） */
async function buildPoster(result) {
  const { w, h } = POSTER;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext('2d');

  // 雷达图单独渲染一张高清图，透明底，直接叠在纸上
  let radarImg = null;
  try {
    radarImg = await cropCanvasImage(await posterRadarImage(result.radarValues));
  } catch (e) {
    radarImg = null;
  }

  const opt = { titleSize: 88, descSize: 30, descLH: 54, radarSize: 600, spread: 0 };
  const scratch = document.createElement('canvas').getContext('2d');
  const footY = h - 74;
  const limit = footY - 70; // 内容最多到这里，给页脚的虚线留出空当

  // 第一遍：量高度。超出版面就压缩雷达图 / 字号
  let bottom = paintPoster(scratch, result, radarImg, opt, false);
  let guard = 0;
  while (bottom > limit && guard < 16) {
    guard += 1;
    if (opt.radarSize > 400) {
      opt.radarSize -= 22;
    } else if (opt.descSize > 25) {
      opt.descSize -= 1;
      opt.descLH = Math.round(opt.descSize * 1.8);
    } else {
      break;
    }
    bottom = paintPoster(scratch, result, radarImg, opt, false);
  }

  // 第二遍：版面还有富余，就把空当均摊进几个大间距，整体更舒展
  const free = limit - bottom;
  if (free > 20) opt.spread = Math.min(56, free / 2.9);

  paintPoster(g, result, radarImg, opt, true);
  return canvas;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

async function savePoster() {
  if (!state.result) return;
  const btn = $('#btn-save');
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = '正在生成…';
  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = await buildPoster(state.result);
    const fileName = `江湖命格-${state.result.rank.name}.png`;

    if (isIOS()) {
      // iOS 不支持 <a download>，改为展示大图，提示长按保存
      const url = canvas.toDataURL('image/png');
      $('#overlay-img').src = url;
      $('#image-overlay').classList.add('is-show');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) {
        toast('生成失败，请截图保存');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast('图片已保存到下载目录');
    }, 'image/png');
  } catch (e) {
    toast('生成失败，试试直接截屏');
  } finally {
    btn.disabled = false;
    btn.textContent = old;
  }
}

/* ============================================================
 * 10. 启动与事件绑定
 * ============================================================ */
function restart() {
  state.index = 0;
  state.answers = new Array(QUESTIONS.length).fill(null);
  state.locked = false;
  state.result = null;
  window.clearTimeout(state.autoTimer);
  if (radarChart) {
    radarChart.destroy();
    radarChart = null;
  }
  renderQuestion();
  showScreen('quiz');
}

function init() {
  // 首页人数
  const countEl = $('#tester-count');
  animateCount(countEl, fakeTestedCount());

  // 封面 → 开始
  $('#btn-start').addEventListener('click', () => {
    renderQuestion();
    showScreen('quiz');
  });

  // 选项点击（事件委托）
  optionsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.option');
    if (!btn) return;
    chooseOption(Number(btn.dataset.idx));
  });

  btnPrev.addEventListener('click', prevStep);
  btnNext.addEventListener('click', nextStep);

  // 键盘：← → 切换，1~4 选择
  document.addEventListener('keydown', (e) => {
    if (!SCREENS.quiz.classList.contains('is-active')) return;
    if (e.key === 'ArrowLeft') prevStep();
    if (e.key === 'ArrowRight' && !btnNext.disabled) nextStep();
    const n = Number(e.key);
    if (n >= 1 && n <= 4) chooseOption(n - 1);
  });

  // 结果页操作
  $('#btn-copy').addEventListener('click', copyResult);
  $('#btn-save').addEventListener('click', savePoster);
  $('#btn-restart').addEventListener('click', restart);

  // 长按保存浮层
  $('#overlay-close').addEventListener('click', () => {
    $('#image-overlay').classList.remove('is-show');
  });

  // 预先渲染第一题，开始按钮点下去无延迟
  renderQuestion();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
