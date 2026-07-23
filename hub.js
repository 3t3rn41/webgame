// ============================================================
//  幻境游廊 · Game Hub
//  Multi-game launcher with save-state awareness
// ============================================================

const GAMES = [
  {
    id: 'mist_house',
    title: '雾 隐 档 案',
    en: 'CASE FILE #MH-1911',
    genre: '异常等级: A',
    theme: 'horror',
    url: 'mist_house.html',
    banner: 'images/gate.jpg',
    desc: '1911年，沈氏一族于雾隐宅一夜灭门。调查员调阅此档案，推开生锈的铁门，踏入镜中世界的谜团……',
    tags: ['中式异常', '多结局', '7页日记', '14个场景'],
    saveKey: 'mistHouse_save',
    caseNum: '#MH-1911',
  },
  {
    id: 'star_drift',
    title: 'HELIOS-7 档 案',
    en: 'CASE FILE #SD-4372',
    genre: '异常等级: A',
    theme: 'scifi',
    url: 'star_drift.html',
    banner: 'images/star_cryo.jpg',
    desc: '2187年，HELIOS-7空间站与地球失联。唯一苏醒的船员发现AI系统已失控，空间站正坠入恒星……',
    tags: ['太空异常', '生存解谜', '5个场景', 'AI觉醒'],
    saveKey: 'starDrift_save',
    caseNum: '#SD-4372',
  },
  {
    id: 'tomb_quest',
    title: '法 老 陵 墓 档 案',
    en: 'CASE FILE #TQ-EWEW',
    genre: '异常等级: B',
    theme: 'adventure',
    url: 'tomb_quest.html',
    banner: 'images/tomb_entrance.jpg',
    desc: '1923年，考古队在法老陵墓中触发诅咒，入口坍塌。调查员必须破解古埃及谜题，找到出路……',
    tags: ['古埃及', '诅咒异常', '5个场景', '象形文字'],
    saveKey: 'tombQuest_save',
    caseNum: '#TQ-EWEW',
  },
  {
    id: 'deep_abyss',
    title: '波塞冬-9 档 案',
    en: 'CASE FILE #DA-3850',
    genre: '异常等级: A',
    theme: 'ocean',
    url: 'deep_abyss.html',
    banner: 'images/deep_dock.jpg',
    desc: '2041年，深海研究站波塞冬-9水位异常上升，未知生物逃出封锁。调查员必须在淹没前逃离深渊……',
    tags: ['深海异常', '水位机制', '5个场景', '多结局'],
    saveKey: 'deepAbyss_save',
    caseNum: '#DA-3850',
  },
  {
    id: 'time_inn',
    title: '时光客栈档案',
    en: 'CASE FILE #TI-1145',
    genre: '异常等级: S',
    theme: 'mystery',
    url: 'time_inn.html',
    banner: 'images/inn_lobby.jpg',
    desc: '1145年（?），一间客栈困在无尽的时间循环中。每到子时三刻一切重来。调查员必须打破百年诅咒……',
    tags: ['时间异常', '循环机制', '5个场景', '多周目'],
    saveKey: 'timeInn_save',
    caseNum: '#TI-1145',
  },
  {
    id: 'wasteland',
    title: '末日列车档案',
    en: 'CASE FILE #WE-6604',
    genre: '异常等级: B',
    theme: 'wasteland',
    url: 'wasteland.html',
    banner: 'images/waste_cabin.jpg',
    desc: '2089年，末日列车"永驶者号"发出最后信号后消失。调查员登上列车，发现乘客从未到达目的地……',
    tags: ['废土异常', '生存解谜', '5个场景', '信号机制'],
    saveKey: 'wastelandExpress_save',
    caseNum: '#WE-6604',
  },
  {
    id: 'isekai',
    title: '星岚学园档案',
    en: 'CASE FILE #IA-1920',
    genre: '异常等级: B',
    theme: 'anime',
    url: 'isekai.html',
    banner: 'images/anime_classroom.jpg',
    desc: '1920年，星岚学园每年有一名转学生消失。调查员入学后发现——自己三年前就已经消失了……',
    tags: ['校园异常', '记忆碎片', '5个场景', '灵力系统'],
    saveKey: 'isekaiAcademy_save',
    caseNum: '#IA-1920',
  },
  {
    id: 'eggy',
    title: '虚拟空间档案',
    en: 'CASE FILE #EP-5523',
    genre: '异常等级: ???',
    theme: 'eggy',
    url: 'eggy.html',
    banner: 'images/eggy_plaza.jpg',
    desc: '2024年，一个名为"蛋仔派对岛"的虚拟空间被检测到异常数据波动。看似无害，但所有进入者……',
    tags: ['虚拟异常', '数据波动', '5个关卡', '★ 关键档案'],
    saveKey: 'eggyParty_save',
    caseNum: '#EP-5523',
  },
  {
    id: 'coming_soon',
    title: '未 知 档 案',
    en: 'CLASSIFIED',
    genre: '异常等级: ???',
    theme: 'coming',
    url: '#',
    banner: '',
    desc: '更多档案正在解密中……调查员权限不足，无法调阅。',
    tags: ['待定'],
    saveKey: null,
  },
];

function init() {
  // Refresh terminal if it exists (coming back from a game)
  if (window.BPPTerminal) BPPTerminal.refresh();

  const grid = document.getElementById('games-grid');
  grid.innerHTML = GAMES.map(g => {
    const hasSave = g.saveKey && !!localStorage.getItem(g.saveKey);
    const isComing = g.theme === 'coming';
    const bannerHtml = g.banner
      ? `<img src="${g.banner}" alt="${g.title}" onerror="this.style.display='none'">`
      : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#1a1a2e,#16213e);display:flex;align-items:center;justify-content:center;font-size:40px;color:#333;">?</div>`;
    const playLabel = isComing ? '敬请期待' : (hasSave ? '继续游戏' : '开始游戏');
    const tagsHtml = g.tags.map(t => `<span class="card-tag">${t}</span>`).join('');
    const clickHandler = isComing ? '' : `onclick="location.href='${g.url}'"`;
    return `
      <div class="game-card" data-theme="${g.theme}" ${clickHandler}>
        <div class="card-banner">
          ${bannerHtml}
          <span class="card-genre">${g.genre}</span>
        </div>
        <div class="card-body">
          <div class="card-title">${g.title}</div>
          <div class="card-en">${g.en}</div>
          <div class="card-desc">${g.desc}</div>
          <div class="card-tags">${tagsHtml}</div>
          <div class="card-play">${playLabel}</div>
        </div>
      </div>`;
  }).join('');
}

init();
