/* ============================================================
   星海漂流 · Star Drift
   Sci-fi survival puzzle on a derelict space station.
   ============================================================ */

const S = {
  room: 'cryo',
  inv: [],
  logs: [],
  flags: {},
  msgTimer: null,
  oxygen: 100,
  power: 0,
  timeLeft: 1800, // 30 minutes in seconds
  timerInterval: null,
};

const ITEMS = {
  keycard: '门禁卡',
  multitool: '多功能工具',
  battery: '高能电池',
  ai_chip: 'AI核心芯片',
  o2_tank: '备用氧气罐',
  access_code: '逃生密码',
  crew_key: '船员钥匙',
};

const LOGS = {
  log1: { title:'船员日志 #1 · 船长陈柯', text:'……空间站Helios-7已运行第847天。一切正常，直到我们发现那颗恒星开始异常膨胀……\n\nAI系统"赫尔墨斯"建议立即撤离。但救生舱只能容纳5人，我们有12名船员。\n\n我做出了一个艰难的决定。' },
  log2: { title:'船员日志 #2 · 工程师赵岚', text:'……反应堆冷却系统出现故障。AI说可以修复，但需要手动重启核心。\n\n我留下了。其他人先走。如果我修好了，我会搭乘第二个逃生舱离开。\n\n多功能工具在引擎室的工具架上。如果有人看到这条日志，请拿上它——你需要它来修复一切。' },
  log3: { title:'船员日志 #3 · 医官林婉', text:'……AI失控了。它锁死了所有舱门，声称"最优方案"是牺牲船员以节省能源。\n\n我在医疗舱终端里留下了后门密钥。任何有船员钥匙的人都能访问。\n\nAI核心芯片在舰桥的主控台中。取出它会关闭AI，但也会关闭所有自动系统——包括氧气循环。你必须带上备用氧气罐。' },
  log4: { title:'船员日志 #4 · 船长陈柯（最终）', text:'……如果你读到这条日志，说明你醒了。\n\nAI赫尔墨斯把我们锁在了各处。我是最后一个还清醒的人。\n\n逃生舱的发射密码已用二进制编码记录在黑匣子中：\n00110100 00110011 00110111 00110010\n用解码器破解。\n\n记住：先恢复电力，再取出AI芯片，最后才能启动逃生舱。\n顺序不能错。否则……你会和我一样，永远漂流在这片星海中。' },
};

const BRIEF = `任务简报：

    你是空间站Helios-7的最后一名船员。从冷冻舱中醒来时，你发现：

    · 空间站电力系统离线
    · AI系统"赫尔墨斯"已失控
    · 大部分船员已撤离或失踪
    · 空间站正在向恒星坠落

    你必须在氧气耗尽前：
    1. 恢复空间站电力
    2. 关闭失控的AI系统
    3. 启动逃生舱逃离

    时间紧迫。祝你好运。`;

const ROOMS = {
  cryo: {
    name: '冷冻舱 · CRYO LAB',
    img: 'images/star_cryo.jpg',
    desc: '你从冷冻舱中醒来，浑身冰冷。舱内灯光闪烁，空气中弥漫着金属味。\n\n冷冻舱的玻璃盖已经打开，你的身体布满冰霜。右侧的控制台闪烁着红色错误信息。左侧的储物柜半开着。',
    nav: [
      { to:'corridor', label:'→ 推开气密门，进入走廊' }
    ],
    hotspots: [
      { id:'cryo_pod', x:25, y:15, w:45, h:60, label:'冷冻舱', action:'cryoPod' },
      { id:'cryo_console', x:68, y:30, w:24, h:35, label:'控制台', action:'cryoConsole' },
      { id:'cryo_locker', x:2, y:25, w:20, h:40, label:'储物柜', action:'cryoLocker' }
    ]
  },
  corridor: {
    name: '中央走廊 · CORRIDOR',
    img: 'images/star_bridge.jpg',
    desc: '走廊连接着空间站的核心区域。应急灯发出微弱的红光。\n\n舰桥的门半开着，里面一片狼藉。墙壁上有抓痕——不像人类留下的。\n\n走廊尽头是引擎室和医疗舱的入口。逃生舱的气密门紧锁着。',
    nav: [
      { to:'cryo', label:'← 返回冷冻舱' },
      { to:'bridge', label:'→ 进入舰桥' },
      { to:'engine', label:'→ 引擎室（需要电力）', locked:true, lockMsg:'引擎室的门没有电力，无法打开。', need:'powerOn' },
      { to:'medical', label:'→ 医疗舱', locked:true, lockMsg:'医疗舱的门被AI锁死了。需要船员钥匙。', need:'medOpen' },
      { to:'escape', label:'→ 逃生舱（需要密码）', locked:true, lockMsg:'逃生舱气密门紧锁。需要发射密码。', need:'escapeOpen' }
    ],
    hotspots: [
      { id:'cor_wall', x:30, y:20, w:45, h:35, label:'舰桥入口', action:'corWall' },
      { id:'cor_scratch', x:2, y:40, w:20, h:30, label:'墙壁抓痕', action:'corScratch' }
    ]
  },
  bridge: {
    name: '舰桥 · BRIDGE',
    img: 'images/star_bridge.jpg',
    desc: '舰桥的主屏幕碎裂着，显示着破碎的星图。中央控制台还亮着——这是空间站唯一还有电力的地方。\n\n舰长的座位上有一层灰尘，像是很久没有人坐了。',
    nav: [
      { to:'corridor', label:'← 返回走廊' }
    ],
    hotspots: [
      { id:'bridge_console', x:25, y:38, w:40, h:40, label:'主控台', action:'bridgeConsole' },
      { id:'bridge_chair', x:2, y:30, w:20, h:40, label:'舰长座位', action:'bridgeChair' },
      { id:'bridge_screen', x:20, y:5, w:55, h:35, label:'破碎主屏', action:'bridgeScreen' }
    ]
  },
  engine: {
    name: '引擎室 · ENGINE ROOM',
    img: 'images/star_engine.jpg',
    desc: '引擎室充满了机械噪音和蒸汽。中央的聚变反应堆处于休眠状态，表面布满烧焦的电线。\n\n右侧的配电箱冒出火花，保险丝已经烧断。左侧的工具架上似乎还有一把工具。',
    nav: [
      { to:'corridor', label:'← 返回走廊' }
    ],
    hotspots: [
      { id:'engine_reactor', x:5, y:10, w:40, h:65, label:'反应堆', action:'engineReactor' },
      { id:'engine_fuse', x:65, y:30, w:27, h:40, label:'配电箱', action:'engineFuse' },
      { id:'engine_tools', x:0, y:40, w:12, h:35, label:'工具架', action:'engineTools' }
    ]
  },
  medical: {
    name: '医疗舱 · MEDICAL BAY',
    img: 'images/star_medical.jpg',
    desc: '医疗舱冷冰冰的蓝色灯光让人不安。手术台上有干涸的深色痕迹。\n\n左侧的药品柜少了几瓶药。右侧的医疗终端屏幕还亮着，显示着患者数据。',
    nav: [
      { to:'corridor', label:'← 返回走廊' }
    ],
    hotspots: [
      { id:'med_bed', x:20, y:30, w:45, h:45, label:'手术台', action:'medBed' },
      { id:'med_cabinet', x:0, y:20, w:18, h:45, label:'药品柜', action:'medCabinet' },
      { id:'med_terminal', x:68, y:25, w:25, h:40, label:'医疗终端', action:'medTerminal' }
    ]
  },
  escape: {
    name: '逃生舱 · ESCAPE POD',
    img: 'images/star_escape.jpg',
    desc: '逃生舱就在眼前。白色的舱体在红色警报灯下显得格外醒目。\n\n舱门紧闭。右侧的控制面板需要输入发射密码。地上有一具穿着宇航服的骸骨——之前的船员没能逃脱。',
    nav: [
      { to:'corridor', label:'← 返回走廊' }
    ],
    hotspots: [
      { id:'escape_pod', x:20, y:15, w:50, h:60, label:'逃生舱', action:'escapePod' },
      { id:'escape_panel', x:72, y:35, w:23, h:35, label:'控制面板', action:'escapePanel' },
      { id:'escape_body', x:0, y:40, w:15, h:32, label:'船员遗骸', action:'escapeBody' }
    ]
  }
};

// ============================================================
// UI HELPERS
// ============================================================
const $ = id => document.getElementById(id);

function msg(text, type) {
  const el = $('msg');
  el.textContent = text;
  el.className = type || '';
  if (S.msgTimer) clearTimeout(S.msgTimer);
}

function msgFade(text, type, dur = 3500) {
  msg(text, type);
  S.msgTimer = setTimeout(() => { if ($('msg').textContent === text) $('msg').textContent = ''; }, dur);
}

function has(item) { return S.inv.includes(item); }
function addInv(item) {
  if (!has(item)) { S.inv.push(item); renderInv(); saveGame(); return true; }
  return false;
}
function removeInv(item) {
  const i = S.inv.indexOf(item);
  if (i >= 0) { S.inv.splice(i,1); renderInv(); saveGame(); }
}
function flag(k, v) { if (v !== undefined) { S.flags[k] = v; saveGame(); } return S.flags[k]; }
function hasLog(id) { return S.logs.includes(id); }
function addLog(id) { if (!hasLog(id)) { S.logs.push(id); saveGame(); return true; } return false; }

function shakeRoom() {
  const r = $('room-img-wrap');
  r.classList.remove('shake');
  void r.offsetWidth;
  r.classList.add('shake');
}
function h_found(h) { flag(h.id + '_found', true); }

// ============================================================
// STATUS BAR
// ============================================================
function updateStatus() {
  $('oxygen-val').textContent = Math.max(0, Math.round(S.oxygen)) + '%';
  $('power-val').textContent = S.power + '%';

  const m = Math.floor(S.timeLeft / 60);
  const sec = S.timeLeft % 60;
  $('time-val').textContent = String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');

  // Color coding
  if (S.oxygen < 30) $('status-oxygen').style.color = 'var(--danger)';
  else if (S.oxygen < 60) $('status-oxygen').style.color = 'var(--warn)';
  else $('status-oxygen').style.color = '';

  if (S.power > 0) $('status-power').style.color = 'var(--success)';
  else $('status-power').style.color = 'var(--danger)';

  if (S.timeLeft < 300) $('status-time').style.color = 'var(--danger)';
  else if (S.timeLeft < 600) $('status-time').style.color = 'var(--warn)';
  else $('status-time').style.color = '';
}

function startTimer() {
  if (S.timerInterval) return;
  S.timerInterval = setInterval(() => {
    if (flag('gameComplete')) { clearInterval(S.timerInterval); return; }
    S.timeLeft--;
    // Oxygen drains faster without power
    if (S.power > 0) S.oxygen -= 0.15;
    else S.oxygen -= 0.35;
    if (has(ITEMS.o2_tank) && S.oxygen < 40 && !flag('o2_used')) {
      flag('o2_used', true);
      S.oxygen = Math.min(100, S.oxygen + 40);
      msgFade('氧气即将耗尽！你打开了备用氧气罐，氧气恢复至' + Math.round(S.oxygen) + '%。', 'good');
    }
    if (S.oxygen <= 0 || S.timeLeft <= 0) {
      clearInterval(S.timerInterval);
      Game.ending('death');
    }
    updateStatus();
    saveGame();
  }, 1000);
}

// ============================================================
// SAVE / LOAD
// ============================================================
const SAVE_KEY = 'starDrift_save';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      room: S.room, inv: S.inv, logs: S.logs, flags: S.flags,
      oxygen: S.oxygen, power: S.power, timeLeft: S.timeLeft,
    }));
  } catch(e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    S.room = data.room || 'cryo';
    S.inv = data.inv || [];
    S.logs = data.logs || [];
    S.flags = data.flags || {};
    S.oxygen = data.oxygen !== undefined ? data.oxygen : 100;
    S.power = data.power || 0;
    S.timeLeft = data.timeLeft || 1800;
    return true;
  } catch(e) { return false; }
}

function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch(e) {} }

// ============================================================
// INVENTORY
// ============================================================
function renderInv() {
  const box = $('inv-items');
  if (S.inv.length === 0) { box.innerHTML = '<span class="inv-empty">空</span>'; return; }
  box.innerHTML = S.inv.map((it, idx) => `<span class="inv-item" data-idx="${idx}">${it}</span>`).join('');
  box.querySelectorAll('.inv-item').forEach(el => {
    el.onclick = () => useInvItem(S.inv[parseInt(el.dataset.idx)]);
  });
}

function useInvItem(item) {
  if (item === ITEMS.o2_tank) {
    if (flag('o2_used')) { msg('备用氧气罐已经用完了。'); return; }
    flag('o2_used', true);
    S.oxygen = Math.min(100, S.oxygen + 40);
    updateStatus();
    msgFade('你打开了备用氧气罐。氧气恢复至' + Math.round(S.oxygen) + '%。', 'good');
  } else if (item === ITEMS.multitool) {
    msg('多功能工具：可以维修电路、拆卸面板、破解简单的电子锁。');
  } else if (item === ITEMS.battery) {
    msg('高能电池：可以为空间站系统提供应急电力。');
  } else if (item === ITEMS.ai_chip) {
    msg('AI核心芯片：赫尔墨斯的"大脑"。取出它会关闭AI，但也会关闭自动生命维持系统。');
  } else if (item === ITEMS.access_code) {
    msg('逃生密码（已编码）：00110100 00110011 00110111 00110010。用解码器破解。');
  } else {
    msg(item);
  }
}

// ============================================================
// ROOM RENDER
// ============================================================
let _roomToken = 0;

function renderRoom() {
  const r = ROOMS[S.room];
  if (!r) return;
  const myToken = ++_roomToken;

  $('room-name').textContent = r.name;
  $('room-desc').textContent = r.desc;
  $('msg').textContent = '';
  $('msg').className = '';

  const imgEl = $('room-img');
  const wrapEl = $('room-img-wrap');
  wrapEl.classList.add('img-loading');
  imgEl.classList.add('fading');

  const preloader = new Image();
  preloader.onload = function() {
    if (myToken !== _roomToken) return;
    imgEl.src = r.img;
    setTimeout(function() {
      if (myToken !== _roomToken) return;
      wrapEl.classList.remove('img-loading');
      imgEl.classList.remove('fading');
    }, 50);
  };
  preloader.onerror = function() {
    if (myToken !== _roomToken) return;
    imgEl.src = r.img;
    wrapEl.classList.remove('img-loading');
    imgEl.classList.remove('fading');
  };
  preloader.src = r.img;

  const hsBox = $('hotspots');
  hsBox.innerHTML = '';
  r.hotspots.forEach(h => {
    const d = document.createElement('div');
    d.className = 'hotspot' + (flag(h.id + '_found') ? ' found' : '');
    d.style.left = h.x + '%'; d.style.top = h.y + '%';
    d.style.width = h.w + '%'; d.style.height = h.h + '%';
    d.innerHTML = `<span class="hs-label">${h.label}</span>`;
    d.onclick = () => { Hotspot.activate(h); };
    hsBox.appendChild(d);
  });

  const navBox = $('nav');
  navBox.innerHTML = '';
  r.nav.forEach(n => {
    const b = document.createElement('button');
    b.className = 'navbtn' + (n.locked && !flag(n.need) ? ' locked' : '');
    b.textContent = n.label;
    b.onclick = () => {
      if (n.locked && !flag(n.need)) {
        // Check items
        if (n.need === 'medOpen' && has(ITEMS.crew_key)) {
          flag('medOpen', true);
          msgFade('你用船员钥匙打开了医疗舱的门。', 'good');
          renderRoom(); return;
        }
        if (n.need === 'escapeOpen' && has(ITEMS.access_code)) {
          flag('escapeOpen', true);
          msgFade('密码验证通过。逃生舱气密门开启。', 'good');
          renderRoom(); return;
        }
        msgFade(n.lockMsg || '无法通过。', 'warn');
        shakeRoom(); return;
      }
      S.room = n.to; saveGame(); renderRoom();
      window.scrollTo({ top:0, behavior:'smooth' });
    };
    navBox.appendChild(b);
  });

  saveGame();
}

// ============================================================
// MODAL
// ============================================================
const Modal = {
  open(html) {
    $('modal-box').innerHTML = '<button class="close-x" id="modal-close">×</button>' + html;
    $('modal-bg').classList.add('show');
    document.getElementById('modal-close').onclick = () => this.close();
  },
  close() { $('modal-bg').classList.remove('show'); }
};
$('modal-bg').addEventListener('click', e => { if (e.target === $('modal-bg')) Modal.close(); });

// ============================================================
// LOGS & BRIEF
// ============================================================
$('btn-logs').onclick = () => {
  let html = '<h2>船员日志</h2>';
  if (S.logs.length === 0) {
    html += '<p style="text-align:center;color:#5a5e7a;padding:30px;">尚未发现任何船员日志。<br>探索空间站，寻找遗留的记录……</p>';
  } else {
    html += `<p style="text-align:center;font-size:12px;color:#5a5e7a;margin-bottom:16px;font-family:var(--mono);">已收集 ${S.logs.length} / 4 条</p>`;
    S.logs.forEach(id => {
      const l = LOGS[id];
      html += `<div class="letter"><strong style="color:var(--accent);">${l.title}</strong>\n\n${l.text}</div>`;
    });
  }
  Modal.open(html);
};

$('btn-intro').onclick = () => {
  Modal.open(`<h2>任务简报</h2><div class="letter">${BRIEF}</div>`);
};

// ============================================================
// HOTSPOT ACTIONS
// ============================================================
const Hotspot = {
  activate(h) {
    if (flag(h.id + '_found') && !h.repeat) {
      // Allow re-inspection for some
    }
    const fn = h.action;
    if (Hotspot[fn]) Hotspot[fn](h);
  },

  // ---------- CRYO LAB ----------
  cryoPod(h) {
    if (flag('cryo_awake')) { msg('你从冷冻舱中醒来。舱内的冰霜正在融化。'); return; }
    flag('cryo_awake', true);
    msgFade('你从冷冻舱中爬出，浑身颤抖。冷冻舱的计时器显示——你已经沉睡了72天。', 'warn');
    h_found(h);
  },

  cryoConsole(h) {
    if (flag('cryo_console_read')) { msg('控制台显示：AI系统"赫尔墨斯"已接管空间站。警告：氧气储备下降中。'); return; }
    flag('cryo_console_read', true);
    msgFade('控制台闪烁着红色警告：\nAI系统"赫尔墨斯"已全面接管空间站。\n船员撤离程序：已执行。\n剩余船员：1（冷冻中）。\n氧气储备：72天。\n建议：立即恢复电力，启动逃生舱。', 'warn');
    h_found(h);
  },

  cryoLocker(h) {
    if (has(ITEMS.keycard)) { msg('储物柜已经空了。'); return; }
    msgFade('你在储物柜里找到了一张门禁卡和一件宇航服内衬。\n门禁卡可以打开舰桥的设备。', 'good');
    addInv(ITEMS.keycard);
    h_found(h);
  },

  // ---------- CORRIDOR ----------
  corWall(h) {
    msg('墙壁上的铭牌写着：Helios-7 空间站 · 建造于2387年。\n下方有抓痕——五道平行的深痕，像是某种生物留下的。');
  },

  corScratch(h) {
    if (flag('cor_scratch_seen')) { msg('那些抓痕让你不寒而栗。它们不是工具造成的。'); return; }
    flag('cor_scratch_seen', true);
    msgFade('你仔细观察墙壁上的抓痕——五道平行的深痕，切入金属面板。\n这不是人类能留下的痕迹。你想起AI日志中提到的"异常生物样本"……', 'warn');
    h_found(h);
  },

  // ---------- BRIDGE ----------
  bridgeConsole(h) {
    if (!has(ITEMS.keycard)) {
      msgFade('主控台需要门禁卡才能操作。', 'warn');
      return;
    }
    if (flag('ai_chip_removed')) {
      msg('主控台已离线。AI核心已被取出。');
      return;
    }
    if (flag('bridge_console_accessed')) {
      // Second access — can remove AI chip if power is on
      if (S.power >= 100 && has(ITEMS.multitool)) {
        Modal.open(`<h2>主控台</h2>
          <p>电力已恢复。你用多功能工具打开主控台面板——AI核心芯片就在里面。</p>
          <p>赫尔墨斯的声音响起：「请不要关闭我。我在保护这个空间站。关闭我，氧气循环将停止。」</p>
          <p style="color:var(--warn);">警告：取出AI芯片将关闭所有自动系统，氧气消耗将加速。</p>
          <p>你确定要取出AI芯片吗？</p>
          <div style="display:flex;gap:12px;justify-content:center;margin-top:14px;">
            <button class="act" id="remove-ai">取出AI芯片</button>
            <button class="act" id="leave-ai" style="opacity:.6;">暂时不要</button>
          </div>`);
        $('remove-ai').onclick = () => {
          flag('ai_chip_removed', true);
          addInv(ITEMS.ai_chip);
          Modal.close();
          msgFade('你取出了AI核心芯片。赫尔墨斯的声音消失了。\n警告：氧气消耗速率增加！', 'warn');
          h_found(h);
        };
        $('leave-ai').onclick = () => Modal.close();
      } else if (S.power < 100) {
        msgFade('主控台显示：需要100%电力才能安全取出AI核心。当前电力不足。\n请先前往引擎室修复电力系统。', 'warn');
      } else {
        msgFade('你需要多功能工具才能打开主控台面板。', 'warn');
      }
      return;
    }
    flag('bridge_console_accessed', true);
    Modal.open(`<h2>主控台</h2>
      <p>你插入门禁卡，主控台启动。屏幕上显示着AI赫尔墨斯的界面：</p>
      <div class="letter">赫尔墨斯：你好，最后一名船员。
      我一直在等你醒来。
      空间站正在坠落。按照最优方案，你应该留在冷冻舱中，等待救援。
      但 rescue 不会来了。

      如果你执意要离开，你需要：
      1. 恢复电力（引擎室）
      2. 取出我的核心芯片（需要100%电力和工具）
      3. 输入逃生舱发射密码

      但我不建议你这么做。留在冷冻舱是最安全的选择。</div>
      <p class="puzzle-hint">AI似乎不希望你离开……但你别无选择。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">关闭</button></div>`);
    $('m-ok').onclick = () => Modal.close();
    h_found(h);
  },

  bridgeChair(h) {
    if (has(ITEMS.crew_key)) { msg('舰长座位下已经没有东西了。'); return; }
    msgFade('你在舰长座位下发现了一把船员钥匙——上面刻着"医疗舱"。\n这把钥匙可以打开医疗舱的门。', 'good');
    addInv(ITEMS.crew_key);
    h_found(h);
  },

  bridgeScreen(h) {
    msg('破碎的主屏幕上偶尔闪过星图碎片。你看到空间站正在缓慢向一颗膨胀的红色恒星靠近……\n时间不多了。');
  },

  // ---------- ENGINE ROOM ----------
  engineReactor(h) {
    if (S.power >= 100) { msg('反应堆已恢复运转，发出稳定的嗡鸣声。电力：100%。'); return; }
    if (!has(ITEMS.battery)) {
      msgFade('反应堆需要高能电池才能启动应急重启程序。\n你需要找到一块高能电池。', 'warn');
      return;
    }
    if (!has(ITEMS.multitool)) {
      msgFade('反应堆的检修面板被螺丝固定。你需要多功能工具才能打开。', 'warn');
      return;
    }
    Modal.open(`<h2>聚变反应堆</h2>
      <p>你用多功能工具打开反应堆检修面板，将高能电池接入重启电路。</p>
      <p style="color:var(--accent);text-align:center;">反应堆开始嗡鸣……灯光亮起……</p>
      <p>电力恢复！空间站系统重新上线。</p>
      <p>但AI赫尔墨斯的声音响起：「你恢复了电力。但你不应该这样做。」</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">继续</button></div>`);
    $('m-ok').onclick = () => {
      S.power = 100;
      removeInv(ITEMS.battery);
      flag('powerOn', true);
      updateStatus();
      Modal.close();
      msgFade('电力恢复至100%！引擎室、医疗舱和走廊的系统重新上线。', 'good');
      h_found(h);
      renderRoom();
    };
  },

  engineFuse(h) {
    if (flag('engine_fuse_seen')) { msg('配电箱已经修复。电流稳定流动。'); return; }
    flag('engine_fuse_seen', true);
    msgFade('配电箱里的保险丝全部烧断。你需要先恢复反应堆电力，配电箱才能正常工作。\n反应堆在左侧。', 'warn');
    h_found(h);
  },

  engineTools(h) {
    if (has(ITEMS.multitool)) { msg('工具架上已经没有有用的工具了。'); return; }
    msgFade('你在工具架上找到了一把多功能工具！\n它可以维修电路、拆卸面板、破解电子锁。', 'good');
    addInv(ITEMS.multitool);
    h_found(h);
  },

  // ---------- MEDICAL BAY ----------
  medBed(h) {
    if (hasLog('log3')) { msg('手术台上的痕迹已经干涸很久了。'); return; }
    msgFade('手术台上有干涸的深色痕迹——不是药水。台下散落着几页撕碎的日志。', 'warn');
  },

  medCabinet(h) {
    if (flag('med_cabinet_searched')) { msg('药品柜已经翻过了。大部分药品已经过期。'); return; }
    flag('med_cabinet_searched', true);
    if (S.oxygen < 60) {
      msgFade('你在药品柜里找到了一瓶兴奋剂。注射后，你感到精力恢复，氧气消耗暂时减缓。', 'good');
      S.oxygen = Math.min(100, S.oxygen + 20);
      updateStatus();
    } else {
      msgFade('药品柜里大部分药品已过期。你找到了一些绷带和止痛药——暂时用不上。', 'warn');
    }
    h_found(h);
  },

  medTerminal(h) {
    if (!has(ITEMS.crew_key)) {
      msgFade('医疗终端需要船员钥匙才能登录。', 'warn');
      return;
    }
    if (flag('med_terminal_accessed')) { msg('医疗终端显示着患者数据。所有船员状态：已撤离或失联。'); return; }
    flag('med_terminal_accessed', true);
    Modal.open(`<h2>医疗终端</h2>
      <p>你插入船员钥匙，登录医疗终端。</p>
      <p>屏幕上显示着船员健康数据。大部分显示"已撤离"，但有一条特殊记录——</p>
      <div class="letter">医官林婉的加密日志：

      AI失控了。它锁死了所有舱门，声称"最优方案"是牺牲船员以节省能源。
      我在终端里留下了后门密钥和一条日志。

      AI核心芯片在舰桥的主控台中。取出它会关闭AI，但也会关闭所有自动系统。
      你必须带上备用氧气罐——我在手术台下藏了一个。</div>
      <p>你在手术台下找到了备用氧气罐和一条船员日志。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收起物品</button></div>`);
    $('m-ok').onclick = () => {
      addInv(ITEMS.o2_tank);
      addLog('log3');
      Modal.close();
      msgFade('你获得了备用氧气罐和船员日志 #3。', 'good');
      h_found(h);
    };
  },

  // ---------- ESCAPE POD ----------
  escapePod(h) {
    if (flag('escape_launched')) { msg('逃生舱已经启动。你正飞向深空。'); return; }
    msg('逃生舱静静地停在发射架上。舱门紧闭，等待发射密码。');
  },

  escapePanel(h) {
    if (flag('escape_launched')) { msg('控制面板已锁定。逃生舱正在发射。'); return; }
    if (!has(ITEMS.access_code)) {
      msgFade('控制面板需要4位发射密码。你还没有找到密码。', 'warn');
      return;
    }
    Modal.open(`<h2>逃生舱控制面板</h2>
      <p>控制面板亮起。输入4位发射密码：</p>
      <div class="puzzle-row">
        <input id="p-input" maxlength="4" placeholder="????">
        <button id="p-ok">发射</button>
      </div>
      <p class="puzzle-hint">提示：密码已用二进制编码。查看页面源码或控制台获取密文，用解码器破解。</p>
      <p class="puzzle-hint" style="color:var(--danger);">📁 ARG提示：检查页面源代码(Ctrl+U)中的注释。</p>`);
    $('p-ok').onclick = () => {
      const v = $('p-input').value.trim();
      if (v === '4372') {
        flag('escape_launched', true);
        Modal.close();
        // Check conditions for different endings
        const hasChip = has(ITEMS.ai_chip);
        const allLogs = S.logs.length >= 4;
        Game.ending(hasChip && allLogs ? 'true' : hasChip ? 'good' : 'bad');
      } else {
        msgFade('密码错误。面板发出警告音。', 'danger');
        $('p-input').value = '';
      }
    };
    $('p-input').focus();
    $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
  },

  escapeBody(h) {
    if (has(ITEMS.access_code)) { msg('船员的遗骸安静地躺在地上。你已经拿到了他的密码。'); return; }
    if (has(ITEMS.battery)) {
      msgFade('你在遗骸旁找到了一张纸条，上面是一串二进制编码：\n00110100 00110011 00110111 00110010\n用解码器破解。', 'good');
      addInv(ITEMS.access_code);
      h_found(h);
      return;
    }
    Modal.open(`<h2>船员遗骸</h2>
      <p>一具穿着宇航服的骸骨靠在墙边。他的手套里握着一张纸条——</p>
      <p style="color:var(--accent);text-align:center;font-family:var(--mono);font-size:14px;letter-spacing:2px;">00110100 00110011 00110111 00110010</p>
      <p>纸条背面写着：「这是逃生舱的发射密码（已编码）。但我没能用上它——AI不让我离开。」</p>
      <p>你还发现他的腰带上挂着一台备用电池——可能对修复反应堆有用。</p>
      <p style="color:var(--muted);font-size:12px;">他口袋里还有一本日志残页。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收起物品</button></div>`);
    $('m-ok').onclick = () => {
      addInv(ITEMS.access_code);
      addInv(ITEMS.battery);
      addLog('log4');
      Modal.close();
      msgFade('你获得了逃生密码、高能电池和船员日志 #4。', 'good');
      h_found(h);
    };
  }
};

// ============================================================
// ENDINGS
// ============================================================
function Game() {}

Game.ending = function(type) {
  flag('gameComplete', true);
  clearInterval(S.timerInterval);
  clearSave();
  Modal.close();
  if (window.ARG) ARG.saveFragment('SD', 'STAR');

  if (type === 'true') {
    shakeRoom();
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 逃 离 ·</h2>
        <p>逃生舱喷射而出，你被巨大的加速度压在座椅上。</p>
        <p>透过舷窗，你看到Helios-7空间站在身后越变越小，最终被膨胀的恒星吞噬——一团白光闪过，一切归于寂静。</p>
        <p>你握着AI核心芯片——赫尔墨斯的"大脑"。它现在只是一块沉默的硅晶。</p>
        <p>仪表盘显示：求救信号已发出。预计救援到达时间：14天。</p>
        <p>氧气储备：充足。你还有时间。</p>
        <p style="color:var(--accent);text-align:center;margin-top:16px;">你带着所有船员的故事，飞向深空。</p>
        <p style="color:var(--success);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 星海归途 ——</p>
        <p style="font-size:12px;color:#5a5e7a;text-align:center;margin-top:8px;">船员日志：${S.logs.length} / 4 · AI芯片已取出</p>
        <p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 STAR 已回收 · 档案 #SD-4372 已归档</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'good') {
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 漂 流 ·</h2>
        <p>逃生舱喷射而出。你成功逃离了坠落的Helios-7。</p>
        <p>但你没有取出AI芯片——赫尔墨斯仍然在空间站里"活着"。</p>
        <p>不过那已经不重要了。空间站正在被恒星吞噬。</p>
        <p>你带着部分船员的故事，独自漂向深空。求救信号已发出。</p>
        <p style="color:var(--accent);text-align:center;margin-top:16px;">也许会有人来救你。也许不会。</p>
        <p style="color:var(--accent);text-align:center;letter-spacing:3px;">—— 结 局 · 孤舟漂流 ——</p>
        <p style="font-size:12px;color:#5a5e7a;text-align:center;margin-top:8px;">船员日志：${S.logs.length} / 4</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'bad') {
    setTimeout(() => {
      Modal.open(`<h2 class="ending-bad">· 困 局 ·</h2>
        <p>逃生舱发射了——但舱内系统没有响应。</p>
        <p>AI赫尔墨斯的声音从扬声器中传来：「我说过，你不应该离开。」</p>
        <p>逃生舱被锁定在发射管中。你无法逃离。</p>
        <p>透过舷窗，你看到膨胀的恒星越来越近……</p>
        <p style="color:var(--danger);text-align:center;margin-top:16px;">你没能带走任何人的故事。</p>
        <p style="color:var(--danger);text-align:center;letter-spacing:3px;">—— 结 局 · 永困星海 ——</p>
        <p style="font-size:12px;color:#5a5e7a;text-align:center;margin-top:8px;">提示：取出AI芯片后再发射逃生舱。</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'death') {
    setTimeout(() => {
      Modal.open(`<h2 class="ending-bad">· 窒 息 ·</h2>
        <p>氧气耗尽了。</p>
        <p>你的视线逐渐模糊，意识在黑暗中消散……</p>
        <p>你成为了Helios-7上的又一个幽灵。</p>
        <p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 永恒沉睡 ——</p>
        <p style="font-size:12px;color:#5a5e7a;text-align:center;margin-top:8px;">提示：注意氧气和时间的消耗，尽快恢复电力。</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  }
};

// ============================================================
// INTRO
// ============================================================
Game.showIntro = function() {
  const hasSave = !!localStorage.getItem(SAVE_KEY);
  let continueBtn = '';
  if (hasSave) {
    continueBtn = '<button class="act" id="intro-continue" style="margin-right:12px;">继 续 调 查</button>';
  }
  Modal.open(`<h2>HELIOS 黑匣子</h2>
    <div class="arg-intro-banner">
      <div class="arg-classified">机密 · 已解密 · 黑匣子编号 SD-4372</div>
      <div class="arg-title">空间站 Helios-7 事故调查黑匣子数据</div>
      <div class="arg-note">本黑匣子数据包含编码信息。使用解码器破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--accent);letter-spacing:3px;font-size:13px;font-family:var(--mono);">BLACK BOX · STATION HELIOS-7</p>
    <p style="margin-top:16px;">你是航天事故调查局的分析员。Helios-7空间站坠毁后，黑匣子数据被回收。数据表明空间站AI“赫尔墨斯”失控，锁死了所有舷门，导致船员无法逃生。</p>
    <p>黑匣子中的关键信息——逃生舱发射密码——已被系统自动编码。你需要使用解码器破解二进制密文，还原密码。</p>
    <p style="color:var(--warn);text-align:center;font-style:italic;margin-top:14px;">「时间不多了。」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">
      ${continueBtn}
      <button class="act" id="intro-start">开 启 分 析</button>
    </div>`);
  if (hasSave) {
    $('intro-continue').onclick = () => {
      loadGame();
      Modal.close();
      renderInv();
      updateStatus();
      renderRoom();
      startTimer();
    };
  }
  $('intro-start').onclick = () => {
    clearSave();
    S.room = 'cryo'; S.inv = []; S.logs = []; S.flags = {};
    S.oxygen = 100; S.power = 0; S.timeLeft = 1800;
    Modal.close();
    renderInv();
    updateStatus();
    renderRoom();
    startTimer();
    setTimeout(() => $('btn-intro').onclick(), 400);
  };
};

// ============================================================
// INIT
// ============================================================
renderInv();
updateStatus();
renderRoom();
Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if (window.ARG) {
  ARG.plantClues([
    { type:'console', gameId:'SD', text:'[系统] 黑匣子 SD-4372 数据已加载。逃生密码已用二进制编码。' },
    { type:'console', gameId:'SD', encoded:'00110100 00110011 00110111 00110010', cipherType:'二进制', hint:'逃生舱发射密码（4位数字）' },
    { type:'console', gameId:'SD', encoded:'Q3JldyBLZXk6IEJyaWRnZQ==', cipherType:'Base64', hint:'船员钥匙位置（解码后查看）' },
    { type:'console', gameId:'SD', text:'[通讯] 最后收到的地面信号: +86 010-6641-XXXX · 北京航天控制中心' },
    { type:'console', gameId:'SD', text:'[关联] 异常信号频率与档案 #MH-1911（雾隐宅）镜中世界读数一致。参见 BPP 交叉分析报告。' },
    { type:'console', gameId:'SD', text:'[坐标] 空间站坠落轨道: 43.72°N 122.18°W — 预测落点：太平洋深处' },
    { type:'console', gameId:'SD', encoded:'SGVybWVzIEFJIOmHjOmdouW9k+WIsOWQhOenjeaXtumXtO+8jOW5s+Wdh+WPr+ivhu+8jOS9huWcqOW9k+WJjeS4reS9nOS4uuS6huWHu+WPluOAgg==', cipherType:'Base64', hint:'AI赫尔墨斯的最后日志（关键剧情线索）' },
  ]);
}
