/* ============================================================
   古墓迷踪 · Tomb of Eternity
   Adventure puzzle in an ancient Egyptian tomb.
   ============================================================ */

const S = {
  room: 'entrance',
  inv: [],
  scrolls: [],
  flags: {},
  msgTimer: null,
};

const ITEMS = {
  torch: '火把',
  chisel: '凿子',
  amulet: '护身符',
  scarab_key: '圣甲虫钥匙',
  golden_ankh: '黄金安卡',
  papyrus: '莎草纸',
  rope: '绳索',
};

const SCROLLS = {
  scroll1: { title:'莎草纸 · 一', text:'……法老阿蒙霍特普四世的陵墓。\n\n他试图推翻众神的祭司，独尊太阳神阿顿。\n\n愤怒的祭司在他死后诅咒了这座陵墓——「入者永困，直至太阳再次升起于西方。」' },
  scroll2: { title:'莎草纸 · 二', text:'……墓室的四个角落藏着四件圣物：\n\n黄金安卡——生命的象征\n圣甲虫钥匙——重生之门\n护身符——抵御诅咒\n凿子——凡人的智慧\n\n集齐四件，方可开启太阳祭坛的出口。' },
  scroll3: { title:'莎草纸 · 三', text:'……象形文字走廊的谜题：\n\n「太阳升起于东方，落下于西方。法老的灵魂在黑暗中行走，直到光明重现。」\n\n答案在于太阳运行的方向。象形文字描绘了太阳神的旅程：\n从东到西，再从西回到东。\n\n然而，祭司将方向编码为阿特巴什密文（Atbash），刻于壁画之上。\n密文为：VDVD\n用解码器破解，得到正确的方向序列。' },
  scroll4: { title:'莎草纸 · 四', text:'……如果你读到了这张莎草纸，说明你已经走到了最后。\n\n太阳祭坛需要一个最终的献祭——黄金安卡。\n将它放在太阳圆盘上，当阳光照射到它时，出口的大门就会打开。\n\n但记住：护身符必须随身携带。没有它，诅咒会永远附着在你身上。' },
};

const BRIEF = `考古笔记：

    你是一名考古学家，在撒哈拉沙漠深处发现了一座从未被记录的埃及古墓。

    墓门上刻着法老阿蒙霍特普四世的名字——那个试图推翻众神祭司的异端法老。

    你独自进入了墓室。身后传来轰隆声——入口坍塌了。

    你必须破解古墓中的谜题，找到四件圣物，从太阳祭坛逃离。

    注意：墓中的陷阱和诅咒是真实的。`;

const ROOMS = {
  entrance: {
    name: '入口大厅',
    img: 'images/tomb_entrance.jpg',
    desc: '你站在墓室的入口大厅。身后，巨大的石块已经将入口完全封死——没有退路了。\n\n左侧的墙壁上有色彩鲜艳的浮雕，描绘着神灵和法老。右侧墙壁上有一个铜制火把架，上面插着一根未点燃的火把。\n\n前方有一条通往深处的走廊。',
    nav: [
      { to:'corridor', label:'→ 走向前方的象形文字走廊' }
    ],
    hotspots: [
      { id:'ent_rubble', x:15, y:30, w:60, h:50, label:'坍塌的入口', action:'entRubble' },
      { id:'ent_relief', x:0, y:10, w:20, h:55, label:'墙壁浮雕', action:'entRelief' },
      { id:'ent_torch', x:75, y:25, w:20, h:35, label:'火把架', action:'entTorch' }
    ]
  },
  corridor: {
    name: '象形文字走廊',
    img: 'images/tomb_corridor.jpg',
    desc: '狭窄的走廊两壁密密麻麻刻满了象形文字。空气中弥漫着几千年的尘土味。\n\n左壁上有一个圆形的星象图案，某些符号隐约发光。右壁上是一系列描绘冥界旅程的壁画，其中隐藏着一个杠杆机关。\n\n前方的地板上有可疑的缝隙——那是一个陷阱。',
    nav: [
      { to:'entrance', label:'← 返回入口大厅' },
      { to:'burial', label:'→ 进入墓室' },
      { to:'river', label:'→ 通往地下河', locked:true, lockMsg:'走廊尽头的门紧锁着。门上有一个圣甲虫形状的锁孔。', need:'riverOpen' }
    ],
    hotspots: [
      { id:'cor_left', x:0, y:5, w:30, h:75, label:'左壁象形文字', action:'corLeft' },
      { id:'cor_right', x:70, y:5, w:30, h:75, label:'右壁壁画', action:'corRight' },
      { id:'cor_trap', x:30, y:60, w:35, h:25, label:'地板陷阱', action:'corTrap' }
    ]
  },
  burial: {
    name: '墓室',
    img: 'images/tomb_burial.jpg',
    desc: '墓室中央放置着一具巨大的石棺，上面雕刻着法老的面容，金蓝色的颜料仍然鲜艳。石棺盖微微移开——像是有人从里面推开过。\n\n左侧的石台上放着四个卡诺匹斯罐，每个有不同的兽首。右侧墙壁上是一幅描绘"心脏称重"仪式的壁画。',
    nav: [
      { to:'corridor', label:'← 返回走廊' },
      { to:'treasure', label:'→ 进入宝藏室', locked:true, lockMsg:'宝藏室的门上有一个安卡形状的锁孔。', need:'treasureOpen' }
    ],
    hotspots: [
      { id:'bur_sarc', x:25, y:25, w:40, h:53, label:'石棺', action:'burSarc' },
      { id:'bur_jars', x:0, y:35, w:20, h:35, label:'卡诺匹斯罐', action:'burJars' },
      { id:'bur_wall', x:72, y:10, w:23, h:50, label:'心脏称重壁画', action:'burWall' }
    ]
  },
  river: {
    name: '地下河',
    img: 'images/tomb_river.jpg',
    desc: '地下河在黑暗中流淌，水面反射着微弱的磷光。洞穴顶上悬挂着钟乳石，空气中充满了潮湿的泥土味。\n\n左侧有一艘旧芦苇船，系在石柱上。右侧墙壁上有一个石质机关，轮盘和锁链控制着一道铁栅门。',
    nav: [
      { to:'corridor', label:'← 返回走廊' },
      { to:'altar', label:'→ 穿过铁栅门，前往太阳祭坛', locked:true, lockMsg:'铁栅门紧闭。需要操作右侧的机关才能打开。', need:'altarOpen' }
    ],
    hotspots: [
      { id:'riv_water', x:15, y:35, w:65, h:45, label:'地下河水', action:'rivWater' },
      { id:'riv_boat', x:0, y:30, w:18, h:40, label:'芦苇船', action:'rivBoat' },
      { id:'riv_mech', x:75, y:20, w:20, h:40, label:'石质机关', action:'rivMech' }
    ]
  },
  treasure: {
    name: '宝藏室',
    img: 'images/tomb_burial.jpg',
    desc: '宝藏室里堆满了金器、珠宝和陶器。但空气中有一股奇异的气味——某些金器上涂着毒药。\n\n室中央的石台上放着一把黄金安卡，在火把光下闪闪发光。角落里还有一卷莎草纸。',
    nav: [
      { to:'burial', label:'← 返回墓室' }
    ],
    hotspots: [
      { id:'tre_ankh', x:30, y:35, w:35, h:35, label:'黄金安卡', action:'treAnkh' },
      { id:'tre_scroll', x:0, y:55, w:20, h:25, label:'莎草纸', action:'treScroll' },
      { id:'tre_gold', x:65, y:45, w:25, h:30, label:'金器堆', action:'treGold' }
    ]
  },
  altar: {
    name: '太阳祭坛',
    img: 'images/tomb_altar.jpg',
    desc: '太阳祭坛是一个圆形的石室，顶部有一个开口，一束阳光从上方射入，照在中央的石坛上。石坛上有一个金色的太阳圆盘。\n\n左侧有一个石质的日晷/历法装置。右侧是一扇巨大的石门，上面刻满了象形文字，微微开启，阳光从缝隙中透出。',
    nav: [
      { to:'river', label:'← 返回地下河' }
    ],
    hotspots: [
      { id:'alt_disk', x:25, y:30, w:40, h:48, label:'太阳圆盘', action:'altDisk' },
      { id:'alt_dial', x:0, y:25, w:22, h:45, label:'日晷装置', action:'altDial' },
      { id:'alt_door', x:72, y:20, w:23, h:52, label:'石门', action:'altDoor' }
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
function hasScroll(id) { return S.scrolls.includes(id); }
function addScroll(id) { if (!hasScroll(id)) { S.scrolls.push(id); saveGame(); return true; } return false; }
function shakeRoom() {
  const r = $('room-img-wrap');
  r.classList.remove('shake');
  void r.offsetWidth;
  r.classList.add('shake');
}
function h_found(h) { flag(h.id + '_found', true); }

// ============================================================
// SAVE / LOAD
// ============================================================
const SAVE_KEY = 'tombQuest_save';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      room: S.room, inv: S.inv, scrolls: S.scrolls, flags: S.flags,
    }));
  } catch(e) {}
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    S.room = data.room || 'entrance';
    S.inv = data.inv || [];
    S.scrolls = data.scrolls || [];
    S.flags = data.flags || {};
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
  box.innerHTML = S.inv.map((it, idx) => {
    let extra = '';
    if (it === ITEMS.torch && flag('torch_lit')) extra = ' lit';
    return `<span class="inv-item${extra}" data-idx="${idx}">${it}</span>`;
  }).join('');
  box.querySelectorAll('.inv-item').forEach(el => {
    el.onclick = () => useInvItem(S.inv[parseInt(el.dataset.idx)]);
  });
}

function useInvItem(item) {
  if (item === ITEMS.torch) {
    if (flag('torch_lit')) { msg('火把已经点燃了。火焰在墓室中跳动。'); return; }
    if (flag('ent_torch_taken')) {
      flag('torch_lit', true);
      renderInv();
      msgFade('你用墓室墙壁上的残留火焰点燃了火把。光明驱散了部分黑暗。', 'good');
    } else {
      msg('一根未点燃的火把。也许能在墓室的某个地方找到火源。');
    }
  } else if (item === ITEMS.chisel) {
    msg('一把锋利的铜凿子。可以撬开石板、修复机关、或破解某些谜题。');
  } else if (item === ITEMS.amulet) {
    msg('荷鲁斯之眼护身符。戴上它，你感到一股保护的力量环绕着你。\n它能抵御墓中的诅咒。');
  } else if (item === ITEMS.golden_ankh) {
    msg('黄金安卡——生命的象征。它在火光下闪闪发光。\n也许在太阳祭坛上有用。');
  } else if (item === ITEMS.scarab_key) {
    msg('圣甲虫形状的钥匙。上面刻着太阳神的纹章。\n也许能打开某扇门。');
  } else if (item === ITEMS.rope) {
    msg('一捆结实的麻绳。在地下河或需要攀爬的地方可能有用。');
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
        if (n.need === 'riverOpen' && has(ITEMS.scarab_key)) {
          flag('riverOpen', true);
          msgFade('你将圣甲虫钥匙插入锁孔。「咔嗒」一声，门开了。', 'good');
          renderRoom(); return;
        }
        if (n.need === 'treasureOpen' && has(ITEMS.golden_ankh)) {
          flag('treasureOpen', true);
          msgFade('你将黄金安卡插入锁孔。宝藏室的门缓缓打开。', 'good');
          renderRoom(); return;
        }
        msgFade(n.lockMsg || '这条路走不通。', 'warn');
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
// SCROLLS & BRIEF
// ============================================================
$('btn-scrolls').onclick = () => {
  let html = '<h2>莎草纸</h2>';
  if (S.scrolls.length === 0) {
    html += '<p style="text-align:center;color:var(--muted);padding:30px;">尚未发现任何莎草纸。<br>探索古墓，寻找遗留的文献……</p>';
  } else {
    html += `<p style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:16px;">已收集 ${S.scrolls.length} / 4 张</p>`;
    S.scrolls.forEach(id => {
      const s = SCROLLS[id];
      html += `<div class="papyrus"><strong style="color:var(--gold);">${s.title}</strong>\n\n${s.text}</div>`;
    });
  }
  Modal.open(html);
};

$('btn-brief').onclick = () => {
  Modal.open(`<h2>考古笔记</h2><div class="papyrus">${BRIEF}</div>`);
};

// ============================================================
// HOTSPOT ACTIONS
// ============================================================
const Hotspot = {
  activate(h) {
    const fn = h.action;
    if (Hotspot[fn]) Hotspot[fn](h);
  },

  // ---------- ENTRANCE ----------
  entRubble(h) {
    msg('巨大的石块堵住了入口。无论你怎么推，它们纹丝不动。\n你只能向前探索，寻找另一条出路。');
  },

  entRelief(h) {
    if (flag('ent_relief_read')) { msg('浮雕描绘着法老阿蒙霍特普四世向太阳神阿顿献祭的场景。'); return; }
    flag('ent_relief_read', true);
    msgFade('浮雕描绘着法老阿蒙霍特普四世向太阳神阿顿献祭的场景。\n浮雕下方刻着一行象形文字，你辨认出：\n「四件圣物，归于一处。太阳之门，方为出口。」\n——四件圣物？你需要找到它们。', 'warn');
    h_found(h);
  },

  entTorch(h) {
    if (has(ITEMS.torch)) { msg('火把架上已经空了。'); return; }
    msgFade('你从火把架上取下一根火把。墙壁上还有残留的火焰——你点燃了火把。\n光明驱散了墓室中的黑暗。', 'good');
    addInv(ITEMS.torch);
    flag('ent_torch_taken', true);
    flag('torch_lit', true);
    renderInv();
    h_found(h);
  },

  // ---------- CORRIDOR ----------
  corLeft(h) {
    if (flag('cor_puzzle_solved')) { msg('左壁的象形文字已经暗淡下来。星象图案不再发光。'); return; }
    if (hasScroll('scroll3')) {
      // Player can attempt the puzzle
      Modal.open(`<h2>左壁 · 星象谜题</h2>
        <p>左壁上的星象图案发出微光。你想起莎草纸上的提示——</p>
        <p style="color:var(--gold);text-align:center;">「按照太阳的路径触碰壁画，陷阱就会关闭。」</p>
        <p>太阳的路径是什么？输入方向序列（用 E/W 表示东西方向）：</p>
        <p class="puzzle-hint">提示：方向序列已用阿特巴什密文编码。莎草纸上的密文是 VDVD。用解码器破解。</p>
        <p class="puzzle-hint" style="color:var(--danger);">📁 ARG提示：检查页面源代码(Ctrl+U)中的注释。</p>
        <div class="puzzle-row">
          <input id="p-input" maxlength="4" placeholder="????" style="text-transform:uppercase;">
          <button id="p-ok">确认</button>
        </div>`);
      $('p-ok').onclick = () => {
        const v = $('p-input').value.trim().toUpperCase();
        if (v === 'EWEW' || v === 'EWWE') {
          flag('cor_puzzle_solved', true);
          h_found(h);
          Modal.close();
          msgFade('星象图案亮起，然后暗淡。地板上的陷阱缝隙合拢了——走廊安全了！', 'good');
        } else {
          msgFade('壁画发出刺眼的光芒——但陷阱没有关闭。答案不对。', 'warn');
          $('p-input').value = '';
        }
      };
      $('p-input').focus();
      $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
    } else {
      if (flag('cor_left_seen')) {
        msg('左壁上的星象图案隐约发光。你感觉这里有一个谜题，但还缺少线索。\n也许某张莎草纸上有提示……');
      } else {
        flag('cor_left_seen', true);
        msgFade('左壁上密密麻麻的象形文字中，有一个圆形星象图案格外醒目。\n某些符号在火把光下隐约发光——这似乎是一个谜题。\n但你不知道如何解开它。也许需要找到某种线索。', 'warn');
        h_found(h);
      }
    }
  },

  corRight(h) {
    if (has(ITEMS.chisel)) { msg('右壁壁画上凿子曾经嵌着的位置已经空了。'); return; }
    if (flag('cor_right_seen')) {
      msgFade('你再次查看右壁壁画。壁画的冥界旅程中，一个杠杆机关若隐若现——\n机关旁边嵌着一把铜凿子。你试着拔出它——它松动了！', 'good');
      addInv(ITEMS.chisel);
      h_found(h);
      return;
    }
    flag('cor_right_seen', true);
    msgFade('右壁的壁画描绘着太阳神穿越冥界的旅程——从黄昏到黎明。\n你注意到壁画中有一个杠杆机关，旁边嵌着一把铜凿子。\n但凿子卡得很紧，第一次没能拔出来。', 'warn');
    h_found(h);
  },

  corTrap(h) {
    if (flag('cor_puzzle_solved')) { msg('陷阱已经关闭。地板上的缝隙合拢了。走廊安全。'); return; }
    if (flag('cor_trap_triggered')) {
      msg('你小心地绕过陷阱区域。但每次经过都心惊胆战。\n如果能解开左壁的星象谜题，陷阱就会永久关闭。');
      return;
    }
    flag('cor_trap_triggered', true);
    msgFade('你踩到了地板上的缝隙——「咔嚓」！\n地板下陷，你险些掉入深坑。你抓住边缘爬了回来，但手受了伤。\n这个陷阱需要被永久关闭才能安全通过。也许左壁的星象谜题是关键。', 'danger');
    shakeRoom();
  },

  // ---------- BURIAL CHAMBER ----------
  burSarc(h) {
    if (has(ITEMS.amulet)) { msg('石棺已经空了。法老的木乃伊不在其中——但护身符已被你取走。'); return; }
    if (flag('bur_sarc_opened')) {
      msgFade('你再次查看石棺。石棺内空空如也——法老的遗体不在其中。\n但石棺底部刻着一行字：「护身符在心脏称重壁画后面。」', 'warn');
      return;
    }
    flag('bur_sarc_opened', true);
    msgFade('你推开石棺盖——比想象中轻。石棺内空空如也！\n法老的遗体不在其中。石棺底部刻着一行字：\n「护身符在心脏称重壁画后面。」', 'warn');
    h_found(h);
  },

  burJars(h) {
    if (has(ITEMS.scarab_key)) { msg('卡诺匹斯罐已经翻过了。圣甲虫钥匙已被你取走。'); return; }
    if (flag('bur_jars_searched')) {
      msg('四个卡诺匹斯罐分别是人头、狒狒头、胡狼头和鹰头。\n你已经翻过了——但没找到钥匙。');
      return;
    }
    flag('bur_jars_searched', true);
    msgFade('你仔细查看四个卡诺匹斯罐——人头、狒狒头、胡狼头、鹰头。\n鹰首罐底部有一个暗格！你打开暗格，发现了一把圣甲虫形状的钥匙！', 'good');
    addInv(ITEMS.scarab_key);
    h_found(h);
  },

  burWall(h) {
    if (has(ITEMS.amulet)) { msg('心脏称重壁画后面已经空了。护身符已被你取走。'); return; }
    if (flag('bur_sarc_opened')) {
      // Player knows amulet is behind the painting
      if (has(ITEMS.chisel)) {
        msgFade('你用凿子撬开心脏称重壁画后的暗格——里面放着荷鲁斯之眼护身符！\n戴上它，你感到一股温暖的力量环绕着你。诅咒无法近身。', 'good');
        addInv(ITEMS.amulet);
        h_found(h);
      } else {
        msgFade('壁画后面似乎有暗格，但被石板封住了。你需要某种工具来撬开它——也许一把凿子？', 'warn');
      }
    } else {
      msg('壁画描绘着亡灵审判——死者的心脏与玛阿特女神的羽毛放在天平两端。\n如果心脏比羽毛重，死者就会被吞噬。壁画后面似乎有什么东西……');
    }
  },

  // ---------- RIVER ----------
  rivWater(h) {
    msg('地下河的水冰冷而黑暗。水面反射着洞顶的磷光，像星空倒映在水中。\n河对岸似乎有另一个洞穴入口。');
  },

  rivBoat(h) {
    if (has(ITEMS.rope)) { msg('芦苇船旁的绳索已被你取走。'); return; }
    if (flag('riv_boat_examined')) {
      msgFade('你再次检查芦苇船。船身虽然老旧，但还能用。\n船上系着一捆结实的麻绳——你取下了它。也许能在某处用到。', 'good');
      addInv(ITEMS.rope);
      h_found(h);
      return;
    }
    flag('riv_boat_examined', true);
    msgFade('一艘旧芦苇船系在石柱上。船身虽然老旧，但看起来还能使用。\n船上系着一捆绳索。也许可以用来过河或攀爬。', 'warn');
    h_found(h);
  },

  rivMech(h) {
    if (flag('altarOpen')) { msg('铁栅门已经打开了。机关的轮盘静止不动。'); return; }
    if (!has(ITEMS.chisel)) {
      msgFade('石质机关上有一个轮盘和锁链，控制着前方的铁栅门。\n但轮盘被锈蚀卡住了。你需要某种工具来撬动它——也许一把凿子？', 'warn');
      return;
    }
    Modal.open(`<h2>石质机关</h2>
      <p>你用凿子撬动锈蚀的轮盘——「嘎吱」一声，轮盘松动了。</p>
      <p>你用力转动轮盘。锁链哗哗作响，铁栅门缓缓升起……</p>
      <p style="color:var(--gold);text-align:center;">「轰隆——」铁栅门完全打开！</p>
      <p>门后是一条通往太阳祭坛的通道。阳光从通道尽头透进来。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">前往祭坛</button></div>`);
    $('m-ok').onclick = () => {
      flag('altarOpen', true);
      Modal.close();
      msgFade('铁栅门打开了！通往太阳祭坛的通道出现在你面前。', 'good');
      h_found(h);
      renderRoom();
    };
  },

  // ---------- TREASURE ROOM ----------
  treAnkh(h) {
    if (has(ITEMS.golden_ankh)) { msg('石台上已经空了。黄金安卡已被你取走。'); return; }
    msgFade('你拿起黄金安卡——生命的象征。它在火光下闪闪发光。\n但你的手指触碰到金器时感到了一阵刺痛——金器上涂着毒药！\n幸好你有护身符——荷鲁斯之眼挡住了诅咒的侵蚀。', has(ITEMS.amulet) ? 'good' : 'danger');
    if (!has(ITEMS.amulet)) {
      msgFade('没有护身符的保护，毒药开始侵蚀你的身体……你感到一阵眩晕。\n（提示：你需要在墓室找到护身符才能安全接触圣物。）', 'danger');
    }
    addInv(ITEMS.golden_ankh);
    h_found(h);
  },

  treScroll(h) {
    if (hasScroll('scroll2')) { msg('角落里的莎草纸已经被你收走了。'); return; }
    msgFade('你在宝藏室角落里找到了一卷莎草纸。上面写着四件圣物的秘密……', 'good');
    addScroll('scroll2');
    h_found(h);
  },

  treGold(h) {
    if (flag('tre_gold_touched')) { msg('金器上涂着毒药。你没有护身符的保护，不敢再碰。'); return; }
    flag('tre_gold_touched', true);
    if (has(ITEMS.amulet)) {
      msg('金器堆里闪闪发光，但大部分涂着毒药。护身符保护你免受伤害。\n除了一卷莎草纸，没有其他有用的东西。');
    } else {
      msgFade('你伸手触碰金器——一阵剧痛！金器上涂着毒药！\n你的手开始发麻……你需要找到护身符才能安全接触这些东西。', 'danger');
    }
  },

  // ---------- SUN ALTAR ----------
  altDisk(h) {
    if (flag('gameComplete')) { msg('太阳圆盘上的安卡散发着金光。石门已经完全打开了。'); return; }
    if (!has(ITEMS.golden_ankh)) {
      msgFade('石坛上的太阳圆盘有一个凹槽——形状正好是安卡。\n你需要将黄金安卡放在上面才能开启石门。', 'warn');
      return;
    }
    const hasAmulet = has(ITEMS.amulet);
    Modal.open(`<h2>太阳圆盘</h2>
      <p>你将黄金安卡放在太阳圆盘的凹槽上——</p>
      <p style="color:var(--gold);text-align:center;">阳光穿过顶部的开口，照射在安卡上。</p>
      <p>金色的光芒四散开来，石门上的象形文字开始发光——</p>
      ${hasAmulet
        ? '<p>你身上的荷鲁斯之眼护身符也发出温暖的光芒，与安卡的光芒交相辉映。诅咒的力量在光芒中消散。</p>'
        : '<p style="color:var(--danger);">但你身上没有护身符。诅咒开始侵蚀你的身体——你的皮肤在变灰……</p>'}
      <p>石门缓缓打开，阳光倾泻而入。你看到了外面的沙漠——自由就在眼前。</p>
      <div style="text-align:center;margin-top:14px;">
        <button class="act" id="ending-go">冲向光明</button>
      </div>`);
    $('ending-go').onclick = () => {
      Modal.close();
      Game.ending(hasAmulet ? 'true' : 'curse');
    };
  },

  altDial(h) {
    if (flag('alt_dial_examined')) { msg('日晷装置上刻着太阳历法。你已经记下了它的内容。'); return; }
    flag('alt_dial_examined', true);
    msgFade('日晷装置上刻着复杂的太阳历法。\n你辨认出一段文字：「当安卡回归太阳，死者之门为生者而开。」\n——将安卡放在太阳圆盘上，石门就会打开。', 'warn');
    h_found(h);
  },

  altDoor(h) {
    if (flag('gameComplete')) { msg('石门已经完全打开。阳光从外面照进来。你自由了。'); return; }
    msg('巨大的石门微微开启，阳光从缝隙中透出。\n门上刻满了象形文字：「唯有安卡归位，门方可全开。」\n你需要将黄金安卡放在太阳圆盘上。');
  }
};

// ============================================================
// ENDINGS
// ============================================================
function Game() {}

Game.ending = function(type) {
  flag('gameComplete', true);
  clearSave();
  Modal.close();
  if (window.ARG) ARG.saveFragment('TQ', 'TOMB');

  if (type === 'true') {
    shakeRoom();
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 重 见 天 日 ·</h2>
        <p>你冲过石门，阳光刺得你睁不开眼。</p>
        <p>当你适应了光线，你看到了广阔的撒哈拉沙漠——金色的沙丘在阳光下绵延起伏。</p>
        <p>身后的石门缓缓合拢，古墓再次沉入黑暗。但你手中的荷鲁斯之眼护身符温暖如初。</p>
        <p>你成功了。你带出了法老阿蒙霍特普四世的故事——那个试图推翻众神的异端法老。</p>
        <p>你的考古笔记上将记录下人类历史上最伟大的发现之一。</p>
        <p style="color:var(--gold);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 破墓而出 ——</p>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">莎草纸：${S.scrolls.length} / 4 · 护身符在手</p>
        <p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 TOMB 已回收 · 档案 #TQ-EWEW 已归档</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'curse') {
    setTimeout(() => {
      Modal.open(`<h2 class="ending-bad">· 诅 咒 ·</h2>
        <p>你冲向石门——但你的双腿已经变成了石头。</p>
        <p>诅咒从你的脚开始蔓延，将你一寸一寸地变成金色的雕像。</p>
        <p>你最后看到的，是门外的阳光——那么近，又那么远。</p>
        <p>法老的诅咒应验了：「入者永困。」</p>
        <p>你成为了古墓中又一个永恒的守卫。和那些之前的探险者一样——</p>
        <p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 永困古墓 ——</p>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">提示：你需要找到荷鲁斯之眼护身符来抵御诅咒。</p>
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
  Modal.open(`<h2>阿蒙霍特普远征</h2>
    <div class="arg-intro-banner">
      <div class="arg-classified">机密 · 已解密 · 卷宗编号 TQ-EWEW</div>
      <div class="arg-title">阿蒙霍特普四世陵墓远征记录</div>
      <div class="arg-note">本卷宗包含编码信息。使用解码器破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--gold);letter-spacing:3px;font-size:13px;">TOMB OF ETERNITY</p>
    <p style="margin-top:16px;">你是国家文物局的考古调查员。一份泄露的远征卷宗揭示了一座未被记录的古埃及陵墓——法老阿蒙霍特普四世之墓。</p>
    <p>卷宗记载，祭司将陵墓中的方向密码编码为阿特巴什密文（Atbash）。你需要使用解码器破解莎草纸上的密文。</p>
    <p style="color:var(--gold);text-align:center;font-style:italic;margin-top:14px;">「入者永困，直至太阳再次升起于西方。」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">
      ${continueBtn}
      <button class="act" id="intro-start">开 启 调 查</button>
    </div>`);
  if (hasSave) {
    $('intro-continue').onclick = () => {
      loadGame();
      Modal.close();
      renderInv();
      renderRoom();
    };
  }
  $('intro-start').onclick = () => {
    clearSave();
    S.room = 'entrance'; S.inv = []; S.scrolls = []; S.flags = {};
    Modal.close();
    renderInv();
    renderRoom();
    setTimeout(() => $('btn-brief').onclick(), 400);
  };
};

// ============================================================
// INIT
// ============================================================
renderInv();
renderRoom();
Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if (window.ARG) {
  ARG.plantClues([
    { type:'console', gameId:'TQ', text:'[系统] 卷宗 TQ-EWEW 已加载。方向密码已用阿特巴什密文编码。' },
    { type:'console', gameId:'TQ', encoded:'VDVD', cipherType:'阿特巴什', hint:'象形文字方向密码（4个字母）' },
    { type:'console', gameId:'TQ', encoded:'U2NyYWJfS2V5OiBCdXJpYWw=', cipherType:'Base64', hint:'圣甲虫钥匙位置（解码后查看）' },
    { type:'console', gameId:'TQ', text:'[通讯] 开罗考古队最后联系: +20 2-2574-XXXX · 埃及文物局' },
    { type:'console', gameId:'TQ', text:'[关联] 墓中壁画描绘的「古镜」与档案 #MH-1911 雾隐宅出土古镜为同一时期器物。' },
    { type:'console', gameId:'TQ', text:'[坐标] 陵墓位置: 25.7402°N 32.6014°E — 帝王谷，底比斯墓地' },
    { type:'console', gameId:'TQ', encoded:'5a6d61h6c6Z6d575a6d61h6c6Z6', cipherType:'十六进制', hint:'墓室铭文（需解码）' },
  ]);
}
