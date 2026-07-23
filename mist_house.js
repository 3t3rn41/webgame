/* ============================================================
   雾中宅 · The House in the Mist
   A horror puzzle game — all images pre-generated locally.
   ============================================================ */

// ---------- Game State ----------
const S = {
  room: 'gate',
  inv: [],          // inventory items
  diary: [],        // collected diary page ids
  flags: {},        // puzzle flags
  msgTimer: null,
};

// ---------- Item & Flag definitions ----------
const ITEMS = {
  key_copper: '铜钥匙',
  key_iron: '铁钥匙',
  key_basement: '地下室钥匙',
  candle: '蜡烛',
  match: '火柴',
  lens: '水晶镜片',
  dagger: '银匕首',
  note_clock: '字条（钟）',
  note_mirror: '字条（镜）',
  rope: '绳索',
  incense: '线香',
  jade: '玉佩',
  photo: '旧照片',
  talisman: '镇魂符',
};

// Key-to-door mapping (which inventory key opens which locked nav)
const KEY_DOORS = {
  studyOpen:    ITEMS.key_copper,
  basementOpen: ITEMS.key_basement,
  // atticOpen is opened via a mechanism (wardrobe ladder), not a key
};

// Note contents (viewable from inventory)
const NOTE_TEXTS = {
  [ITEMS.note_clock]:  '纸片上是一串0和1的编码：\n00110011 00110001 00110101\n\n背面写着：「……挂钟停在……那是她最后一次……」\n用解码器解读这串二进制码。',
  [ITEMS.note_mirror]: '字条上写着：\n「子时三刻，镜中世界门开。沈氏五人，已入其四。」\n\n已入其四？那第五个人是谁？',
};

// Photo contents (viewable from inventory)
const PHOTO_TEXT = '一张泛黄的全家福照片。照片上有五个人——\n曾祖父沈鹤年、曾祖母沈王氏、祖父沈文渊、祖母沈李氏、父亲沈明远。\n\n照片背面写着：「光绪卅三年摄于雾隐宅。」\n\n奇怪的是，照片中每个人的眼睛处都被针刺了一个小洞。';

// ============================================================
// ROOM DEFINITIONS
// ============================================================
const ROOMS = {

  gate: {
    name: '宅院大门',
    img: 'images/gate.jpg',
    desc: '你站在雾隐宅的铁门前。浓雾从山林间涌来，将这座老宅包裹得严严实实。\n\n铁门上的铜锁已经锈蚀，但锁孔旁刻着一行小字——\n「欲入此门，须知沈家灭亡之年。」\n\n门前的石碑上依稀可辨：沈氏雾隐宅，建于光绪十三年。',
    nav: [
      { to:'hall', label:'→ 推开铁门', locked:true, lockMsg:'铁门紧锁。需要知道沈家灭亡的那一年。', need:'gateOpen' }
    ],
    hotspots: [
      { id:'gate_lock', x:38, y:52, w:22, h:32, label:'铜锁', action:'gateLock' },
      { id:'gate_stone', x:1, y:68, w:20, h:22, label:'石碑', action:'gateStone' }
    ]
  },

  hall: {
    name: '门厅',
    img: 'images/hall.jpg',
    desc: '推门而入，一股霉湿的气息扑面而来。门厅昏暗狭长，月光透过破损的窗棂洒落。\n\n正对着一面落满灰尘的落地镜，镜面模糊不清。左侧是一座老式衣帽架，上面挂着一件褪色的长衫。角落里有一张积灰的供桌。',
    nav: [
      { to:'gate', label:'← 返回大门' },
      { to:'living', label:'→ 东侧门，通往客厅' },
      { to:'dining', label:'→ 北侧，餐厅方向传来滴水声' },
      { to:'courtyard', label:'→ 南侧门，通往庭院' },
      { to:'study', label:'→ 西侧，一扇紧闭的木门', locked:true, lockMsg:'西侧的木门被一把铜锁锁住了。', need:'studyOpen' }
    ],
    hotspots: [
      { id:'hall_mirror', x:36, y:12, w:26, h:58, label:'落地镜', action:'hallMirror' },
      { id:'hall_coat', x:2, y:22, w:16, h:52, label:'衣帽架', action:'hallCoat' },
      { id:'hall_table', x:76, y:38, w:22, h:38, label:'供桌', action:'hallTable' }
    ]
  },

  living: {
    name: '客厅',
    img: 'images/living.jpg',
    desc: '客厅比门厅更暗。正中央的八仙桌早已坍塌，墙上挂着一幅巨大的油画——画中是一位穿旗袍的女人，面容模糊，却让人觉得她在直视着你。\n\n壁炉里堆着冰冷的灰烬，旁边散落着几根烧焦的木柴。',
    nav: [
      { to:'hall', label:'← 返回门厅' },
      { to:'kitchen', label:'→ 穿过小门，通往厨房' }
    ],
    hotspots: [
      { id:'living_painting', x:28, y:8, w:42, h:48, label:'油画', action:'livingPainting' },
      { id:'living_fireplace', x:58, y:38, w:28, h:38, label:'壁炉', action:'livingFireplace' },
      { id:'living_table', x:6, y:52, w:28, h:28, label:'八仙桌', action:'livingTable' }
    ]
  },

  dining: {
    name: '餐厅',
    img: 'images/dining.jpg',
    desc: '餐厅里摆着一张长桌，桌上竟还整齐地摆着五副碗筷——仿佛主人刚刚离去。饭菜早已化作灰烬，但碗碟上诡异的纹路仍清晰可辨。\n\n墙上有一座老式挂钟，指针停在了某个时刻，再未走过。',
    nav: [
      { to:'hall', label:'← 返回门厅' },
      { to:'basement', label:'→ 地板下传来寒气……一扇暗门', locked:true, lockMsg:'地板下似乎有空间，但入口被一块沉重的铁盖封住了。', need:'basementOpen' }
    ],
    hotspots: [
      { id:'dining_table', x:8, y:42, w:82, h:38, label:'长桌', action:'diningTable' },
      { id:'dining_clock', x:73, y:5, w:20, h:32, label:'挂钟', action:'diningClock' },
      { id:'dining_cabinet', x:1, y:18, w:15, h:42, label:'碗柜', action:'diningCabinet' }
    ]
  },

  kitchen: {
    name: '厨房',
    img: 'images/kitchen.jpg',
    desc: '厨房里弥漫着腐朽与香料混杂的气味。灶台上落满灰尘，墙角堆着发黑的柴火。\n\n灶台旁的墙上钉着一块木板，上面用图钉泛黄的菜谱。水缸里的水早已干涸，缸底沉着几片枯叶。',
    nav: [
      { to:'living', label:'← 返回客厅' }
    ],
    hotspots: [
      { id:'kitchen_recipe', x:58, y:12, w:24, h:32, label:'菜谱', action:'kitchenRecipe' },
      { id:'kitchen_stove', x:2, y:32, w:32, h:42, label:'灶台', action:'kitchenStove' },
      { id:'kitchen_drawer', x:38, y:52, w:20, h:22, label:'抽屉', action:'kitchenDrawer' }
    ]
  },

  study: {
    name: '书房',
    img: 'images/study.jpg',
    desc: '书房里堆满了线装书和发黄的信件。一张红木书桌上摆着文房四宝，砚台里的墨迹还未全干——这不可能，这宅子已经荒废了几十年。\n\n书架最高处放着一个铜匣子，隐约透出微光。',
    nav: [
      { to:'hall', label:'← 返回门厅' },
      { to:'bedroom', label:'→ 穿过帘子，通往卧室' }
    ],
    hotspots: [
      { id:'study_desk', x:22, y:42, w:54, h:38, label:'书桌', action:'studyDesk' },
      { id:'study_bookshelf', x:1, y:2, w:24, h:58, label:'书架', action:'studyBookshelf' },
      { id:'study_chest', x:76, y:5, w:18, h:24, label:'铜匣子', action:'studyChest' }
    ]
  },

  bedroom: {
    name: '卧室',
    img: 'images/bedroom.jpg',
    desc: '卧室里摆着一张雕花大床，被褥凌乱，仿佛有人刚刚起身。梳妆台的镜子碎裂成几块，每一块映出的影像都略有不同。\n\n床下似乎有什么东西在反光。',
    nav: [
      { to:'study', label:'← 返回书房' },
      { to:'attic', label:'→ 头顶传来脚步声……通往阁楼的暗梯', locked:true, lockMsg:'头顶有一块活动地板，但够不到，需要找到梯子或机关。', need:'atticOpen' }
    ],
    hotspots: [
      { id:'bedroom_bed', x:8, y:48, w:58, h:36, label:'雕花床', action:'bedroomBed' },
      { id:'bedroom_dresser', x:68, y:28, w:26, h:46, label:'梳妆台', action:'bedroomDresser' },
      { id:'bedroom_wardrobe', x:1, y:12, w:20, h:58, label:'衣柜', action:'bedroomWardrobe' }
    ]
  },

  basement: {
    name: '地下室',
    img: 'images/basement.jpg',
    desc: '暗门之下是狭窄的石阶，通向更深的黑暗。空气中弥漫着潮湿的石灰味。\n\n地下室的四壁刻满了奇怪的符号，中央摆着一张石台，台上放着一本厚重的皮面书。墙角有一个生锈的铁箱。',
    nav: [
      { to:'dining', label:'← 返回餐厅' },
      { to:'passage', label:'→ 墙壁裂开的缝隙……通往密道', locked:true, lockMsg:'墙壁上有一道裂缝，似乎可以进一步打开，但需要找到机关。', need:'passageOpen' }
    ],
    hotspots: [
      { id:'basement_wall', x:1, y:2, w:26, h:52, label:'墙壁符号', action:'basementWall' },
      { id:'basement_book', x:33, y:38, w:32, h:32, label:'皮面书', action:'basementBook' },
      { id:'basement_box', x:73, y:42, w:22, h:32, label:'铁箱', action:'basementBox' }
    ]
  },

  attic: {
    name: '阁楼',
    img: 'images/attic.jpg',
    desc: '阁楼里堆满了蒙尘的家具和旧箱子。一束月光从天窗射入，照亮了角落里的一面巨大的镜子——\n\n那面镜子与门厅的落地镜不同。它的镜面漆黑如渊，仿佛通往另一个世界。镜框上刻满了与地下室相同的符号。\n\n镜前摆着一张小凳，凳上放着一封未拆的信。',
    nav: [
      { to:'bedroom', label:'← 返回卧室' },
      { to:'mirror_world', label:'→ 踏入镜中世界', locked:true, lockMsg:'镜面漆黑如渊。你需要银匕首、点燃的蜡烛和水晶镜片才能进入。', need:'mirrorEntered' }
    ],
    hotspots: [
      { id:'attic_mirror', x:28, y:8, w:42, h:62, label:'漆黑的镜子', action:'atticMirror' },
      { id:'attic_letter', x:63, y:52, w:20, h:20, label:'镜前的信', action:'atticLetter' },
      { id:'attic_telescope', x:2, y:18, w:22, h:42, label:'旧望远镜', action:'atticTelescope' }
    ]
  },

  // ===== NEW ROOMS =====

  courtyard: {
    name: '庭院',
    img: 'images/courtyard.jpg',
    desc: '推开南侧的小门，你走进了宅院的庭院。杂草从石板缝隙间疯长，几乎吞没了整条小径。\n\n左侧有一棵枯死的老槐树，光秃秃的枝干上挂着一根绳索。庭院中央偏右有一口石井，井口黑洞洞的。右侧是一张石凳，上面落满了枯叶。',
    nav: [
      { to:'hall', label:'← 返回门厅' },
      { to:'shrine', label:'→ 穿过月洞门，通往祠堂' },
      { to:'well', label:'→ 走近古井查看' }
    ],
    hotspots: [
      { id:'courtyard_tree', x:2, y:10, w:22, h:55, label:'枯槐树', action:'courtyardTree' },
      { id:'courtyard_well', x:55, y:42, w:25, h:32, label:'石井', action:'courtyardWell' },
      { id:'courtyard_bench', x:75, y:55, w:20, h:25, label:'石凳', action:'courtyardBench' }
    ]
  },

  shrine: {
    name: '祠堂',
    img: 'images/shrine.jpg',
    desc: '祠堂里弥漫着陈年的檀香味，似乎从未散去。正中的供桌上摆着一排灵位，上面刻着沈家五代人的名讳。供桌前的香炉里插着早已燃尽的残香。\n\n左侧墙上挂着一幅巨大的祖宗画像，画中人物的面容已经模糊不清。',
    nav: [
      { to:'courtyard', label:'← 返回庭院' }
    ],
    hotspots: [
      { id:'shrine_tablets', x:30, y:12, w:40, h:35, label:'灵位', action:'shrineTablets' },
      { id:'shrine_burner', x:35, y:48, w:30, h:32, label:'香炉', action:'shrineBurner' },
      { id:'shrine_painting', x:1, y:8, w:20, h:52, label:'祖宗画像', action:'shrinePainting' }
    ]
  },

  well: {
    name: '古井',
    img: 'images/well.jpg',
    desc: '你走到井边，探头往里看去——井深不见底，黑暗中隐约有水光闪动。一股阴冷潮湿的气流从井底涌上来，带着腐朽的气味。\n\n井壁上长满了青苔，隐约可见一些刻痕。井口旁有一架老旧的辘轳，上面缠着半截断裂的绳索。',
    nav: [
      { to:'courtyard', label:'← 返回庭院' }
    ],
    hotspots: [
      { id:'well_opening', x:15, y:25, w:55, h:50, label:'井口', action:'wellOpening' },
      { id:'well_wall', x:1, y:5, w:18, h:60, label:'井壁刻痕', action:'wellWall' },
      { id:'well_bucket', x:72, y:40, w:18, h:30, label:'辘轳', action:'wellBucket' }
    ]
  },

  passage: {
    name: '密道',
    img: 'images/secret_passage.jpg',
    desc: '地下室的墙壁在机关触发后缓缓移开，露出一条狭窄的石砌密道。密道两侧的墙壁上刻着与地下室相同的符号，空气中弥漫着比地下室更浓重的霉味。\n\n密道尽头有一扇半开的木门，透出微弱的光。右侧墙壁的底部似乎嵌着一个小石匣。',
    nav: [
      { to:'basement', label:'← 返回地下室' },
      { to:'courtyard', label:'→ 推开木门，走向光亮处' }
    ],
    hotspots: [
      { id:'passage_wall', x:1, y:5, w:25, h:60, label:'墙壁符号', action:'passageWall' },
      { id:'passage_box', x:68, y:38, w:22, h:32, label:'石壁暗匣', action:'passageBox' },
      { id:'passage_door', x:30, y:30, w:35, h:45, label:'木门', action:'passageDoor' }
    ]
  },

  mirror_world: {
    name: '镜中世界',
    img: 'images/mirror_world.jpg',
    desc: '你踏入镜面，如同穿过一层冰冷的水幕。眼前的世界与你所在的阁楼一模一样，但一切都笼罩在一层诡异的蓝光之中。\n\n五个半透明的人影站在你面前——沈家的五个人。他们的面容模糊，却齐齐注视着你。\n\n左侧有一座石台，上面放着一个发光的物体。右侧空气中有一道裂缝，金色的光从裂缝中透出——那是通往现实世界的出口。',
    nav: [
      { to:'attic', label:'← 退回镜外（阁楼）' }
    ],
    hotspots: [
      { id:'mw_ghosts', x:28, y:15, w:40, h:55, label:'沈家五人', action:'mwGhosts' },
      { id:'mw_altar', x:1, y:38, w:25, h:38, label:'石台', action:'mwAltar' },
      { id:'mw_crack', x:72, y:25, w:20, h:45, label:'现实裂缝', action:'mwCrack' }
    ]
  }

};

// ============================================================
// DIARY PAGES (5 fragments)
// ============================================================
const DIARY = {
  page1: { title:'日记残页 · 一', text:'……祖母又开始对着那面镜子说话了。她说镜子里的世界才是真实的，而我们这边才是倒影。\n父亲不许她再说，可每到子时，祖母总会悄悄走进阁楼……\n\n沈家的事，恐怕要从那面镜子说起。' },
  page2: { title:'日记残页 · 二', text:'……光绪十三年，曾祖父建这宅子时，在地基下挖到一面古镜。镜面朝下，嵌在一块青石里。\n自从古镜被挖出，沈家便不得安宁。夜里总有人听见脚步声，却找不到人。\n\n曾祖父在日记里写道：「镜中有目，目中有我。」' },
  page3: { title:'日记残页 · 三', text:'……我终于明白那五副碗筷的含义了。\n沈家五口人——曾祖父、曾祖母、祖父、祖母、还有父亲——他们不是消失了。\n他们走进了镜子里。\n\n而镜子需要五个人才能「平衡」。现在，还差一个。' },
  page4: { title:'日记残页 · 四', text:'……我找到了那个铜匣子里的东西。一片水晶镜片，和一张字条。\n字条上是祖母的笔迹：「子时三刻，以镜照镜，以目还目。银匕断缘，方可破局。」\n\n她早就知道会有这一天。她留下了破解的方法。' },
  page5: { title:'日记残页 · 五', text:'……如果你读到了这页，说明你已经走到了最后。\n那面镜子是一个通道。沈家的五个人被困在镜中世界，成为了维持通道的「锚」。\n\n要解救他们，也解救你自己——\n在子时，用银匕首刺向镜面中央。\n\n但记住：镜中的「他们」，可能已经不是你所认识的人了。' },
  page6: { title:'日记残页 · 六', text:'……今天去了祠堂。灵位上刻着五代人的名字，但最后一排——父亲那一排——的灵位是空的。\n\n祖母说，空灵位是留给「还没走的人」的。\n\n我问她：「还没走」是什么意思？\n她只是笑了笑，说：「你以后会知道的。」\n\n我不明白。但我知道祠堂的香炉有一个秘密——按照五人长幼顺序点香，灵位后面会打开一个暗格。' },
  page7: { title:'日记残页 · 七', text:'……我把那块玉佩扔进了井里。\n\n那是曾祖母的遗物，据说是从古镜旁边找到的。祖母说玉佩能「镇住」镜中的东西。但我觉得它只是在拖延。\n\n井底似乎连着地下室的某个地方。我曾听到地下室传来水声，却找不到水源。\n\n如果你找到了这块玉佩，记住——它能让镜中之人短暂地恢复意识。也许在最后的时刻，你需要它。' },
};

// The letter from Lin Mo (intro)
const LETTER = `好友亲启：

    我已抵达雾隐宅。这里荒废已久，却处处透着诡异——宅子里的东西像是被人刻意摆放过，仿佛在等待什么人的到来。

    我在宅子里发现了沈家人的日记，但日记被撕成了许多碎片，藏在不同的房间里。沈家曾是这里的主人，却在几十年前一夜之间全部失踪。

    所有线索都指向阁楼里的一面镜子。我先去阁楼调查。如果你收到这封信，请来雾隐宅找我。

    找到日记碎片，拼凑出真相。小心那面镜子。

                            林默
                            十月十五日夜`;

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
  if (!has(item)) {
    S.inv.push(item);
    renderInv();
    saveGame();
    return true;
  }
  return false;
}
function removeInv(item) {
  const i = S.inv.indexOf(item);
  if (i >= 0) { S.inv.splice(i,1); renderInv(); saveGame(); }
}

function flag(k, v) { if (v !== undefined) { S.flags[k] = v; saveGame(); } return S.flags[k]; }

function hasDiary(id) { return S.diary.includes(id); }
function addDiary(id) {
  if (!hasDiary(id)) {
    S.diary.push(id);
    saveGame();
    return true;
  }
  return false;
}

function shakeRoom() {
  const r = $('room-img-wrap');
  r.classList.remove('shake');
  void r.offsetWidth;
  r.classList.add('shake');
}

// Mark a hotspot as found (greyed out)
function h_found(h) {
  flag(h.id + '_found', true);
}

// Collect a diary page (silently adds; calling context narrates)
function collectDiary(id) {
  addDiary(id);
}

// ============================================================
// SAVE / LOAD
// ============================================================
const SAVE_KEY = 'mistHouse_save';

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      room: S.room,
      inv: S.inv,
      diary: S.diary,
      flags: S.flags,
    }));
  } catch(e) { /* ignore storage errors */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    S.room   = data.room   || 'gate';
    S.inv    = data.inv    || [];
    S.diary  = data.diary  || [];
    S.flags  = data.flags  || {};
    return true;
  } catch(e) { return false; }
}

function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch(e) {}
}

// ============================================================
// INVENTORY RENDER
// ============================================================
function renderInv() {
  const box = $('inv-items');
  if (S.inv.length === 0) {
    box.innerHTML = '<span class="inv-empty">空无一物</span>';
    return;
  }
  box.innerHTML = S.inv.map((it, idx) => {
    let extra = '';
    if (it === ITEMS.candle && flag('candleLit')) extra = ' lit';
    return `<span class="inv-item${extra}" data-idx="${idx}" title="点击查看">${it}</span>`;
  }).join('');
  box.querySelectorAll('.inv-item').forEach(el => {
    el.onclick = () => useInvItem(S.inv[parseInt(el.dataset.idx)]);
  });
}

function useInvItem(item) {
  if (item === ITEMS.candle) {
    if (flag('candleLit')) { msg('蜡烛已经点燃了。火苗静静燃烧，驱散着四周的寒气。'); return; }
    if (has(ITEMS.match)) {
      flag('candleLit', true);
      renderInv();
      msgFade('你划亮火柴，点燃了蜡烛。温暖的火光驱散了四周的黑暗。', 'good');
    } else {
      msgFade('你有蜡烛，但没有火柴。无法点燃。', 'warn');
    }
  } else if (item === ITEMS.match) {
    if (flag('candleLit')) { msg('蜡烛已经点燃了。火柴已无用。'); return; }
    if (has(ITEMS.candle)) {
      flag('candleLit', true);
      renderInv();
      msgFade('你划亮火柴，点燃了蜡烛。温暖的火光驱散了四周的黑暗。', 'good');
    } else {
      msg('一盒火柴。需要蜡烛才能使用。');
    }
  } else if (item === ITEMS.lens) {
    msg('水晶镜片在手中微微发光。透过它看去，周围的一切似乎都蒙上了一层淡蓝色的光晕。');
  } else if (item === ITEMS.dagger) {
    msg('银匕首寒光凛凛，刃上的符文在暗处隐隐发亮。');
  } else if (item === ITEMS.rope) {
    msg('一截粗麻绳，看起来还算结实。也许能在某处用到。');
  } else if (item === ITEMS.incense) {
    msg('一束线香，虽然陈旧但似乎还能点燃。也许该在香炉中使用。');
  } else if (item === ITEMS.jade) {
    msg('一块温润的玉佩，上面刻着镜子的纹样。握在手中，你感到一丝安宁——仿佛有什么东西在保护着你。');
  } else if (item === ITEMS.photo) {
    showPhoto();
  } else if (item === ITEMS.talisman) {
    msg('一张泛黄的符咒，上面画着复杂的图形。背面写着：「贴于镜面，可封镜门一时。」');
  } else if (item && item.indexOf('钥匙') >= 0) {
    msg(item + '。钥匙上刻着字，暗示它能打开某处。');
  } else if (item && item.indexOf('字条') >= 0) {
    showNote(item);
  } else {
    msg(item);
  }
}

function showNote(item) {
  const text = NOTE_TEXTS[item] || '字条上的字迹模糊不清，无法辨认。';
  Modal.open(`<h2>${item}</h2><p style="white-space:pre-wrap;line-height:2;">${text}</p>`);
}

function showPhoto() {
  Modal.open(`<h2>旧照片</h2><p style="white-space:pre-wrap;line-height:2;">${PHOTO_TEXT}</p>`);
}

// ============================================================
// ROOM RENDER
// ============================================================
let _roomToken = 0; // Prevents race conditions during rapid navigation

function renderRoom() {
  const r = ROOMS[S.room];
  if (!r) return;

  // Generate a unique token for this render to prevent race conditions
  const myToken = ++_roomToken;

  // Update text content immediately
  $('room-name').textContent = r.name;
  $('room-desc').textContent = r.desc;
  $('msg').textContent = '';
  $('msg').className = '';

  // --- Robust image loading with preload + fade ---
  const imgEl = $('room-img');
  const wrapEl = $('room-img-wrap');

  // Show loading state (fade out old image)
  wrapEl.classList.add('img-loading');
  imgEl.classList.add('fading');

  // Preload the new image using a separate Image object.
  // This forces the browser to fetch and decode the image
  // before we swap it into the visible <img> element.
  const preloader = new Image();

  preloader.onload = function() {
    // Check if a newer renderRoom call has superseded this one
    if (myToken !== _roomToken) return;

    // Image is now in browser cache — set it on the visible element.
    // This triggers an immediate display since the image is already decoded.
    imgEl.src = r.img;

    // Remove fade-out to reveal the new image with a smooth fade-in.
    // Small delay ensures the browser has painted the new image first.
    setTimeout(function() {
      if (myToken !== _roomToken) return;
      wrapEl.classList.remove('img-loading');
      imgEl.classList.remove('fading');
    }, 50);
  };

  preloader.onerror = function() {
    if (myToken !== _roomToken) return;
    // Fallback: set src directly even if preload failed
    imgEl.src = r.img;
    wrapEl.classList.remove('img-loading');
    imgEl.classList.remove('fading');
  };

  // Start preloading
  preloader.src = r.img;

  // --- Hotspots ---
  const hsBox = $('hotspots');
  hsBox.innerHTML = '';
  r.hotspots.forEach(h => {
    const d = document.createElement('div');
    d.className = 'hotspot' + (flag(h.id + '_found') ? ' found' : '');
    d.style.left = h.x + '%';
    d.style.top = h.y + '%';
    d.style.width = h.w + '%';
    d.style.height = h.h + '%';
    d.innerHTML = `<span class="hs-label">${h.label}</span>`;
    d.onclick = () => { Hotspot.activate(h); };
    hsBox.appendChild(d);
  });

  // --- Navigation buttons ---
  const navBox = $('nav');
  navBox.innerHTML = '';
  r.nav.forEach(n => {
    const b = document.createElement('button');
    b.className = 'navbtn' + (n.locked && !flag(n.need) ? ' locked' : '');
    b.textContent = n.label;
    b.onclick = () => {
      if (n.locked && !flag(n.need)) {
        // Check if player has the key for this door
        const keyNeeded = KEY_DOORS[n.need];
        if (keyNeeded && has(keyNeeded)) {
          flag(n.need, true);
          msgFade('你用' + keyNeeded + '打开了锁。「咔嗒」一声，门开了。', 'good');
          renderRoom();
          return;
        }
        msgFade(n.lockMsg || '这条路走不通。', 'warn');
        shakeRoom();
        return;
      }
      S.room = n.to;
      saveGame();
      renderRoom();
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
$('modal-bg').addEventListener('click', e => {
  if (e.target === $('modal-bg')) Modal.close();
});

// ============================================================
// JOURNAL (collected diary)
// ============================================================
const Journal = {
  open() {
    let html = '<h2>📖 日记残页</h2>';
    if (S.diary.length === 0) {
      html += '<p style="text-align:center;color:#666;padding:30px;">尚未收集到任何日记残页。<br>探索老宅，寻找散落的线索……</p>';
    } else {
      html += `<p style="text-align:center;font-size:12px;color:#777;margin-bottom:16px;">已收集 ${S.diary.length} / 7 页</p>`;
      S.diary.forEach(id => {
        const p = DIARY[id];
        html += `<div class="diary-page"><span class="page-num">${id.replace('page','第 ')} 页</span><div class="page-title">${p.title}</div>${p.text}</div>`;
      });
      if (S.diary.length >= 5) {
        html += '<p style="text-align:center;color:var(--gold);margin-top:16px;font-size:13px;">—— 日记核心内容已拼凑完整。 ——</p>';
      }
      if (S.diary.length === 7) {
        html += '<p style="text-align:center;color:var(--gold);margin-top:8px;font-size:12px;">—— 全部残页已集齐。你掌握了所有的真相。 ——</p>';
      }
    }
    Modal.open(html);
  }
};
$('btn-journal').onclick = () => Journal.open();

// ============================================================
// LETTER (intro)
// ============================================================
$('btn-letter').onclick = () => {
  Modal.open(`<h2>✉ 林默的信</h2><div class="letter">${LETTER}</div>
    <p style="font-size:12px;color:#666;text-align:center;margin-top:10px;">—— 这封信在你出发前就已收到。它或许能帮你理解接下来发生的事。 ——</p>`);
};

function Game() {}

// ============================================================
// HOTSPOT ACTIONS
// ============================================================
const Hotspot = {
  activate(h) {
    if (flag(h.id + '_found')) return;
    const fn = h.action;
    if (Hotspot[fn]) Hotspot[fn](h);
  },

  // ---------- GATE ----------
  gateLock(h) {
    if (flag('gateOpen')) { msg('门已经打开了。'); return; }
    Modal.open(`<h2>铜锁</h2>
      <p>铁门上的铜锁锈迹斑斑，但锁孔旁刻着一行小字：</p>
      <p style="color:var(--gold);text-align:center;font-style:italic;">「欲入此门，须知沈家灭亡之年。」</p>
      <p>输入四位数年份：</p>
      <div class="puzzle-row">
        <input id="p-input" maxlength="4" placeholder="????">
        <button id="p-ok">确认</button>
      </div>
      <p class="puzzle-hint">提示：石碑上的电报码隐藏着沈家灭亡的年份。用解码器破解。</p>
      <p class="puzzle-hint" style="color:var(--blood-bright);">📁 ARG提示：查看浏览器控制台(F12)可能有额外线索。</p>`);
    $('p-ok').onclick = () => {
      const v = $('p-input').value.trim();
      if (v === '1911') {
        flag('gateOpen', true);
        h_found(h);
        Modal.close();
        msgFade('「咔哒」一声，铜锁弹开。铁门在雾中缓缓敞开……', 'good');
        renderRoom();
      } else {
        msgFade('锁纹丝不动。年份不对。', 'warn');
        $('p-input').value = '';
      }
    };
    $('p-input').focus();
    $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
  },

  gateStone(h) {
    msgFade('石碑上刻着：沈氏雾隐宅，建于光绪十三年。\n下方有一行用点和划刻出的符号，与寻常文字不同——\n\n.---- ----. .---- .----\n\n这像是某种电报码。用解码器或许能解读出年份。', 'warn');
    h_found(h);
  },

  // ---------- HALL ----------
  hallMirror(h) {
    if (flag('hallMirror_cleaned')) {
      msg('镜子已经被擦过了。镜中映出你的脸……但你的倒影似乎慢了半拍。');
      return;
    }
    Modal.open(`<h2>落地镜</h2>
      <p>镜面蒙着一层厚厚的灰。你用手轻轻擦拭——</p>
      <p style="color:var(--gold);text-align:center;">镜中映出的不是你的脸。</p>
      <p>而是一个陌生女人。她穿着旗袍，嘴唇翕动，无声地说着什么。你辨认着她的口型：</p>
      <p style="text-align:center;color:var(--blood-bright);font-size:16px;letter-spacing:3px;">「画 后」</p>
      <p>你猛然回头——客厅里确实挂着一幅油画。</p>
      <p class="puzzle-hint">镜中的女人……是沈家的人吗？她在指引你。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">放下镜子</button></div>`);
    $('m-ok').onclick = () => {
      flag('hallMirror_cleaned', true);
      h_found(h);
      Modal.close();
      msgFade('你放下手。镜面重新变得模糊。但「画后」二字已印在你脑海中。', 'warn');
    };
  },

  hallCoat(h) {
    if (has(ITEMS.key_copper)) { msg('长衫里已经没有什么了。'); return; }
    msgFade('你在长衫口袋里摸到了一把冰凉的铜钥匙。钥匙上刻着一个「书」字。', 'good');
    addInv(ITEMS.key_copper);
    h_found(h);
  },

  hallTable(h) {
    if (flag('hallTable_read')) { msg('供桌上的字条你已经读过了。'); return; }
    flag('hallTable_read', true);
    msgFade('供桌抽屉里有一张发黄的纸条，上面是陌生的笔迹：\n「子时三刻，镜中世界门开。沈氏五人，已入其四。」\n——入其四？那第五个人是谁？', 'warn');
    addInv(ITEMS.note_mirror);
    h_found(h);
  },

  // ---------- LIVING ROOM ----------
  livingPainting(h) {
    if (flag('livingPainting_moved')) {
      msg('油画已经被移开了。墙上的壁龛空空如也。');
      return;
    }
    Modal.open(`<h2>油画</h2>
      <p>你试着把油画从墙上移开——它比想象中轻。油画背后，墙上有一个小小的壁龛。</p>
      <p>壁龛里放着一个铁盒，盒上有一把三位数的密码锁。</p>
      <p class="puzzle-hint">密码是三位数……壁炉中找到的二进制编码可能就是答案。用解码器破解。</p>
      <div class="puzzle-row">
        <input id="p-input" maxlength="3" placeholder="???">
        <button id="p-ok">确认</button>
      </div>`);
    $('p-ok').onclick = () => {
      const v = $('p-input').value.trim();
      if (v === '315') {
        flag('livingPainting_moved', true);
        h_found(h);
        Modal.close();
        msgFade('锁开了。铁盒里有一截白蜡烛，和一张日记残页。', 'good');
        addInv(ITEMS.candle);
        collectDiary('page1');
        renderRoom();
      } else {
        msgFade('密码不对。锁纹丝不动。', 'warn');
        $('p-input').value = '';
      }
    };
    $('p-input').focus();
    $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
  },

  livingFireplace(h) {
    if (flag('livingFireplace_searched')) { msg('壁炉里只有灰烬。'); return; }
    flag('livingFireplace_searched', true);
    msgFade('你在壁炉的灰烬中翻找，发现了一张未烧尽的纸片。\n纸片上没有文字，只有一串0和1：\n\n00110011 00110001 00110101\n\n背面写着：「……挂钟停在……那是她最后一次……」\n这串数字似乎隐藏着什么。用解码器试试。', 'warn');
    addInv(ITEMS.note_clock);
    h_found(h);
  },

  livingTable(h) {
    msg('八仙桌已经坍塌，桌面上全是灰尘。桌腿旁散落着几枚铜钱，已经锈得无法辨认。');
  },

  // ---------- DINING ROOM ----------
  diningTable(h) {
    msg('五副碗筷整齐地摆在桌上。五个碗，五双筷子，五把椅子。\n你注意到每个碗底都刻着一个字，但大部分已经磨损，只能辨认出：「沈」「氏」「镜」「中」「人」。');
  },

  diningClock(h) {
    if (flag('diningClock_set')) { msg('挂钟已经指向了三时十五分。钟摆纹丝不动，仿佛时间在这里凝固。'); return; }
    Modal.open(`<h2>老式挂钟</h2>
      <p>挂钟的指针停在了一个未知的位置，钟摆静止。钟面上有一行小字：</p>
      <p style="color:var(--gold);text-align:center;font-style:italic;">「时辰已定，不可更改。」</p>
      <p>但你能拨动指针。拨到什么时刻？</p>
      <p class="puzzle-hint">输入时间，格式 H:MM 或 HH:MM。壁炉纸片上的编码暗含时间。</p>
      <div class="puzzle-row">
        <input id="p-input" maxlength="5" placeholder="?:??">
        <button id="p-ok">确认</button>
      </div>`);
    $('p-ok').onclick = () => {
      const v = $('p-input').value.trim();
      if (v === '3:15' || v === '03:15') {
        flag('diningClock_set', true);
        h_found(h);
        Modal.close();
        msgFade('你拨动指针，指向三时十五分。\n「咔嗒」一声，钟摆后面的墙板弹开一个小格——里面藏着一张日记残页。', 'good');
        collectDiary('page3');
        renderRoom();
      } else {
        msgFade('指针拨过去又弹回来。时间不对。', 'warn');
        $('p-input').value = '';
      }
    };
    $('p-input').focus();
    $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
  },

  diningCabinet(h) {
    if (flag('diningCabinet_searched')) { msg('碗柜已经翻过了。'); return; }
    flag('diningCabinet_searched', true);
    msgFade('你翻开碗柜，在层层叠叠的旧碗碟后面，发现了一把铁钥匙。\n钥匙上刻着一个「箱」字。', 'good');
    addInv(ITEMS.key_iron);
    h_found(h);
  },

  // ---------- KITCHEN ----------
  kitchenRecipe(h) {
    if (flag('kitchenRecipe_read')) { msg('菜谱你已经读过了。'); return; }
    flag('kitchenRecipe_read', true);
    msgFade('菜谱上写着五道菜，每道菜对应家中一人——\n「曾祖父：红烧蹄筋」「曾祖母：桂花藕粉」「祖父：酱肘子」「祖母：翡翠豆腐」「父亲：……」\n最后一道菜名被墨水涂掉了，旁边只写着两个字：「镜中」。', 'warn');
    h_found(h);
  },

  kitchenStove(h) {
    if (flag('kitchenStove_searched')) { msg('灶台冰冷，积满灰尘。灶膛里空空如也。'); return; }
    flag('kitchenStove_searched', true);
    msgFade('灶台冰冷，积满灰尘。你在灶膛深处翻找，发现了一束保存完好的线香——\n也许是以前祭祀灶神时用的。', 'good');
    addInv(ITEMS.incense);
    h_found(h);
  },

  kitchenDrawer(h) {
    if (flag('kitchenDrawer_searched')) { msg('抽屉里已经没有什么了。'); return; }
    flag('kitchenDrawer_searched', true);
    msgFade('抽屉里散落着发霉的米粒和几根火柴。你挑出几根还算干燥的。', 'good');
    addInv(ITEMS.match);
    h_found(h);
  },

  // ---------- STUDY ----------
  studyDesk(h) {
    if (flag('studyDesk_searched')) { msg('书桌你已经翻过了。'); return; }
    if (!has(ITEMS.key_copper)) {
      msgFade('书桌的抽屉上锁着一把小铜锁。你需要一把铜钥匙。', 'warn');
      return;
    }
    flag('studyDesk_searched', true);
    msgFade('你用铜钥匙打开了书桌抽屉。抽屉里有一把地下室钥匙，和一张字条。\n字条上写着：「地下室的铁箱，需用铁钥匙方能开启。」', 'good');
    addInv(ITEMS.key_basement);
    h_found(h);
  },

  studyBookshelf(h) {
    if (flag('studyBookshelf_searched')) { msg('书架你已经翻过了。'); return; }
    flag('studyBookshelf_searched', true);
    msgFade('你在书架的夹层中发现了一页日记残页，被折得整整齐齐，藏在两本《易经》之间。', 'good');
    collectDiary('page2');
    h_found(h);
  },

  studyChest(h) {
    if (flag('studyChest_opened')) { msg('铜匣子已经打开了。里面空空如也。'); return; }
    if (!has(ITEMS.key_copper)) {
      msgFade('铜匣子上有一把精致的铜锁。你需要一把铜钥匙。', 'warn');
      return;
    }
    flag('studyChest_opened', true);
    msgFade('你用铜钥匙打开了铜匣子。匣子里放着一片水晶镜片，和一张日记残页。\n水晶镜片在暗处微微发光。', 'good');
    addInv(ITEMS.lens);
    collectDiary('page4');
    h_found(h);
  },

  // ---------- BEDROOM ----------
  bedroomBed(h) {
    if (flag('bedroomBed_searched')) { msg('床下已经看过了。'); return; }
    flag('bedroomBed_searched', true);
    msgFade('你趴下身往床底看去——黑暗中有微弱反光。\n仔细看去，是碎裂的镜片，从梳妆台落下滚到床底。每一片镜片映出的画面都略有不同——有的是白天，有的是黑夜。\n其中一片上刻着符号，与阁楼镜框上的相同。', 'warn');
    h_found(h);
  },

  bedroomDresser(h) {
    if (flag('bedroomDresser_used')) { msg('碎裂的镜面映出你的脸——但每一块碎片中的表情都不同。有一块甚至映出了你的背影。'); return; }
    if (has(ITEMS.lens)) {
      Modal.open(`<h2>梳妆台</h2>
        <p>梳妆台的镜子碎裂成几块。每一块映出的影像都略有不同。</p>
        <p>你举起水晶镜片，透过它看向碎裂的镜面——</p>
        <p style="color:var(--gold);text-align:center;">镜片中的碎片不再映出你的脸。</p>
        <p>每一块碎镜都映出了不同的人——一个老人、一个老妇人、一个中年男人、一个中年女人、一个年轻人。他们的嘴唇都在翕动，无声地说着同一句话：</p>
        <p style="text-align:center;color:var(--blood-bright);font-size:16px;letter-spacing:3px;">「放 我 们 出 去」</p>
        <p>你猛然放下镜片。镜中又只剩下你的倒影。</p>
        <p class="puzzle-hint">沈家五人……他们真的在镜子里。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">放下镜片</button></div>`);
      $('m-ok').onclick = () => {
        flag('bedroomDresser_used', true);
        h_found(h);
        Modal.close();
        msgFade('你的手在发抖。那五个人……是真的在镜中世界吗？', 'warn');
      };
    } else {
      msg('碎裂的镜面映出你的脸——但每一块碎片中的表情都不同。有一块甚至映出了你的背影，而你明明面对着镜子。');
    }
  },

  bedroomWardrobe(h) {
    if (flag('atticOpen')) { msg('衣柜深处的暗格已经打开，折叠梯已取出。'); return; }
    if (flag('bedroomBed_searched')) {
      // Player has seen the symbols from bed碎片 → can find the mechanism
      Modal.open(`<h2>衣柜</h2>
        <p>你再次查看衣柜。这次，你想起了床下碎片上的符号。</p>
        <p>你在衣柜内壁摸索——手指触到了一处凹槽，形状与碎片上的符号吻合。</p>
        <p>你按下凹槽——</p>
        <p style="color:var(--gold);text-align:center;">「咔嗒」</p>
        <p>衣柜底板弹开，露出暗格。里面放着一把折叠梯。</p>
        <p>头顶的活动地板，现在够得着了。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">取出折叠梯</button></div>`);
      $('m-ok').onclick = () => {
        flag('atticOpen', true);
        h_found(h);
        Modal.close();
        msgFade('你取出折叠梯，撑开后搭在活动地板下方。头顶的暗门可以打开了。', 'good');
        renderRoom();
      };
    } else {
      if (flag('bedroomWardrobe_searched')) {
        msg('衣柜里只有旧衣裳和樟脑丸的气味。深处似乎有一块松动的壁板，但你找不到机关。');
      } else {
        flag('bedroomWardrobe_searched', true);
        msgFade('衣柜里挂着几件褪色的衣裳，散发着陈年樟脑丸的气味。深处有一块壁板似乎可以活动，但你找不到机关在哪。', 'warn');
        h_found(h);
      }
    }
  },

  // ---------- BASEMENT ----------
  basementWall(h) {
    if (flag('basementWall_read')) {
      // After reading, if player has seen the well wall carvings too, they can find the mechanism
      if (flag('wellWall_read') && !flag('passageOpen')) {
        Modal.open(`<h2>墙壁符号</h2>
          <p>你再次查看墙壁上的符号。这次，你注意到了一个之前忽略的细节——</p>
          <p>符号的排列方式与古井壁上的刻痕完全吻合。两组符号似乎在指示同一个机关。</p>
          <p>你顺着符号的指引，在墙壁上摸索——手指触到了一块松动的石砖。</p>
          <p style="color:var(--gold);text-align:center;">你用力按下——</p>
          <p>「轰隆隆——」墙壁缓缓移开，露出一条黑暗的密道！</p>
          <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">查看密道</button></div>`);
        $('m-ok').onclick = () => {
          flag('passageOpen', true);
          Modal.close();
          msgFade('墙壁移开了！一条密道出现在你面前。', 'good');
          renderRoom();
        };
      } else if (flag('passageOpen')) {
        msg('密道已经打开了。符号在暗处微微发光。');
      } else {
        msg('墙壁上的符号你已经记下了。但你感觉还缺少什么——也许其他地方还有类似的符号？');
      }
      return;
    }
    flag('basementWall_read', true);
    msgFade('四壁刻满了符号——有星辰、有眼目、有镜子，还有一些你不认识的古老文字。\n其中一组符号反复出现：一面镜子，镜中五个人影，旁边是一把匕首。\n这像是某种仪式的图解。\n\n你还注意到，符号的边缘有一些奇怪的凹槽，似乎与某种机关有关……', 'warn');
    h_found(h);
  },

  basementBook(h) {
    if (flag('basementBook_read')) { msg('皮面书你已经读过了。'); return; }
    flag('basementBook_read', true);
    msgFade('你翻开皮面书。书页泛黄，上面的字迹与日记残页相同——这是沈家某代人的手记。\n书的最后一页夹着一张日记残页。', 'good');
    collectDiary('page5');
    h_found(h);
  },

  basementBox(h) {
    if (flag('basementBox_opened')) { msg('铁箱已经打开了。里面空空如也。'); return; }
    if (!has(ITEMS.key_iron)) {
      msgFade('铁箱上有一把锈蚀的铁锁。你需要一把铁钥匙。', 'warn');
      return;
    }
    flag('basementBox_opened', true);
    msgFade('你用铁钥匙打开了铁箱。箱内衬着红绸，正中央放着一把银匕首。\n匕首寒光凛凛，刃上刻着细密的符文——与墙壁上的符号一致。', 'good');
    addInv(ITEMS.dagger);
    h_found(h);
  },

  // ---------- ATTIC ----------
  atticTelescope(h) {
    if (flag('atticTelescope_used')) { msg('你透过望远镜看到了星空。子时三刻，天机已现。'); return; }
    flag('atticTelescope_used', true);
    msgFade('你透过旧望远镜望向天窗外的夜空——\n星辰排列成奇怪的图案，正中央是一轮暗红的月亮。\n你辨认出星图：这是子时三刻的天象。\n子时，阴气最盛之时。正是镜门开启的时刻。', 'warn');
    h_found(h);
  },

  atticLetter(h) {
    if (flag('atticLetter_read')) { msg('信你已经读过了。'); return; }
    flag('atticLetter_read', true);
    Modal.open(`<h2>镜前的信</h2>
      <p>信封上写着「致后来者」。你拆开信——</p>
      <div class="letter">友人如晤：

    我已走到最后一步。银匕首在手，水晶镜片在手，蜡烛已点燃。

    我透过镜片看向漆黑的镜面——镜中不是倒影，是另一个世界。沈家五人站在镜中，面容模糊，却齐齐看向我。

    祖母说得对。镜中世界才是真实的。而我们这边才是倒影。

    我要刺下去了。如果你读到这里，说明我或许已经成功了，或许已经失败了。

    但无论如何——不要忘记：镜中的「他们」，可能已经不是你所认识的人了。

    对不起了。

                              林默</div>
      <p class="puzzle-hint">林默……他来过这里。他做了和你要做的一样的事。</p>`);
    h_found(h);
  },

  atticMirror(h) {
    if (flag('gameComplete')) {
      msg('漆黑的镜子已经碎裂。镜中世界的门，已经关闭。碎片散落一地，每一片都映着不同的天空。');
      return;
    }

    const hasDagger  = has(ITEMS.dagger);
    const hasLens    = has(ITEMS.lens);
    const candleLit  = flag('candleLit');

    // Stage 1: Need dagger
    if (!hasDagger) {
      Modal.open(`<h2>漆黑的镜子</h2>
        <p>镜面漆黑如渊，仿佛通往无底的深渊。你感到一阵刺骨的寒意从镜中袭来。</p>
        <p>镜框上的符号与地下室墙壁上的一模一样。</p>
        <p>你隐约觉得，需要某种工具才能应对这面镜子……</p>
        <p class="puzzle-hint">日记中提到的「银匕断缘」……你还需要银匕首。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
      $('m-ok').onclick = () => Modal.close();
      return;
    }

    // Stage 2: Need lit candle
    if (!candleLit) {
      Modal.open(`<h2>漆黑的镜子</h2>
        <p>银匕首在手中微微发烫。但镜面漆黑一片，你什么都看不见。</p>
        <p>你需要光。这里太暗了——你需要点燃蜡烛。</p>
        <p class="puzzle-hint">在物品栏中点击蜡烛来点燃它（需要火柴）。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
      $('m-ok').onclick = () => Modal.close();
      return;
    }

    // Stage 3: Need crystal lens
    if (!hasLens) {
      Modal.open(`<h2>漆黑的镜子</h2>
        <p>烛光照亮了镜面，但镜中仍是漆黑一片。你的倒影消失了，镜面像一扇黑色的窗。</p>
        <p>你需要透过水晶镜片才能看清镜中的世界。</p>
        <p class="puzzle-hint">日记中提到的水晶镜片……你需要找到它。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
      $('m-ok').onclick = () => Modal.close();
      return;
    }

    // Stage 4: Mirror is now accessible — enter or strike
    const diaryCount = S.diary.length;
    const hasJade = has(ITEMS.jade);
    const hasTalisman = has(ITEMS.talisman);
    let extraHint = '';
    if (hasJade) extraHint += '<p class="puzzle-hint" style="color:var(--gold);">你手中的玉佩微微发热——也许在镜中世界能发挥某种作用。</p>';
    if (hasTalisman) extraHint += '<p class="puzzle-hint" style="color:var(--gold);">镇魂符在口袋中微微颤动——也许可以用来封印镜门。</p>';

    Modal.open(`<h2>漆黑的镜子</h2>
      <p>烛火摇曳，照亮了漆黑的镜面。你举起水晶镜片，透过它看向镜中——</p>
      <p style="color:var(--gold);text-align:center;">镜中不再是黑暗。</p>
      <p>你看到了另一个世界——与这间阁楼一模一样的房间，但一切都被一层淡蓝色的光笼罩。</p>
      <p>镜中站着五个人影。他们的面容模糊，但你认得出——沈家的五个人。</p>
      <p>银匕首在你手中微微发烫。刃上的符文亮起暗红色的光。</p>
      ${extraHint}
      ${diaryCount < 5 ? '<p class="puzzle-hint">你还没能集齐全部日记残页。也许还有更多真相等待发掘……</p>' : '<p class="puzzle-hint" style="color:var(--gold);">日记已拼凑完整。你知道该怎么做了。</p>'}
      <p>你可以——</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;flex-wrap:wrap;">
        <button class="act" id="enter-mirror">踏入镜中世界</button>
        <button class="act" id="ending-stab" style="border-color:var(--blood);color:var(--blood-bright);">直接刺向镜面</button>
      </div>`);
    $('enter-mirror').onclick = () => {
      flag('mirrorEntered', true);
      Modal.close();
      S.room = 'mirror_world';
      renderRoom();
      window.scrollTo({ top:0, behavior:'smooth' });
    };
    $('ending-stab').onclick = () => Game.ending('good');
  },

  // ---------- COURTYARD ----------
  courtyardTree(h) {
    if (has(ITEMS.rope)) { msg('枯树上已经没有东西了。'); return; }
    msgFade('你走到枯槐树前。树枝上挂着一根粗麻绳，虽然腐朽但还算结实。\n你取下了绳索。也许能在某处用到。', 'good');
    addInv(ITEMS.rope);
    h_found(h);
  },

  courtyardWell(h) {
    msg('一口古老的石井。井口黑洞洞的，看不到底。你隐约听到井底有水声……\n要查看井底，需要走近古井。');
  },

  courtyardBench(h) {
    if (flag('courtyardBench_searched')) { msg('石凳上只有枯叶和青苔。'); return; }
    flag('courtyardBench_searched', true);
    msgFade('你拂去石凳上的枯叶，发现凳面上刻着几行小字：\n「井通地下，地通镜。三者一脉，破之有道。」\n——井、地下、镜子，三者相连？', 'warn');
    h_found(h);
  },

  // ---------- SHRINE ----------
  shrineTablets(h) {
    if (flag('shrine_tablets_read')) { msg('灵位上的名字你已经记下了。'); return; }
    flag('shrine_tablets_read', true);
    msgFade('灵位上刻着沈家五代人的名讳：\n曾祖父 沈鹤年\n曾祖母 沈王氏\n祖父 沈文渊\n祖母 沈李氏\n父亲 沈明远\n\n最后一排有一个空灵位，上面没有名字——但刻着一行小字：「留给归来者。」', 'warn');
    h_found(h);
  },

  shrineBurner(h) {
    if (flag('shrine_incense_done')) { msg('香炉中的线香静静燃烧，青烟袅袅。灵位后的暗格已经打开了。'); return; }
    if (!has(ITEMS.incense)) {
      msgFade('香炉里只剩下燃尽的残香。你需要新的线香才能点燃。', 'warn');
      return;
    }
    if (!has(ITEMS.match)) {
      msgFade('你有线香，但没有火源来点燃。需要火柴。', 'warn');
      return;
    }
    Modal.open(`<h2>香炉</h2>
      <p>你拿出线香，用火柴点燃，插入香炉。</p>
      <p>五支线香，对应沈家五人——</p>
      <p style="color:var(--gold);text-align:center;">按照长幼顺序，依次为：</p>
      <p style="text-align:center;font-size:13px;line-height:2.2;">
        曾祖父 → 曾祖母 → 祖父 → 祖母 → 父亲<br>
        <span style="color:#777;font-size:12px;">（输入顺序，用数字 1-5 表示，如：12345）</span>
      </p>
      <p class="puzzle-hint">提示：灵位上的排列顺序就是长幼顺序。页面源码中隐藏着确认编码。</p>
      <p class="puzzle-hint" style="color:var(--blood-bright);">📁 ARG提示：查看页面源代码(Ctrl+U)寻找隐藏的Base64编码。</p>
      <div class="puzzle-row">
        <input id="p-input" maxlength="5" placeholder="?????">
        <button id="p-ok">确认</button>
      </div>`);
    $('p-ok').onclick = () => {
      const v = $('p-input').value.trim();
      if (v === '12345') {
        flag('shrine_incense_done', true);
        h_found(h);
        Modal.close();
        msgFade('五支线香依次燃起，青烟袅袅上升。灵位后的墙壁缓缓移开——一个暗格出现在灵位之后！\n暗格里放着一张旧照片和一张日记残页。', 'good');
        addInv(ITEMS.photo);
        collectDiary('page6');
        renderRoom();
      } else {
        msgFade('线香燃起又熄灭。顺序不对。', 'warn');
        $('p-input').value = '';
      }
    };
    $('p-input').focus();
    $('p-input').onkeydown = e => { if (e.key === 'Enter') $('p-ok').onclick(); };
  },

  shrinePainting(h) {
    if (flag('shrine_painting_examined')) { msg('祖宗画像上的人物面容模糊。你注意到每个人的眼睛处都被涂抹过。'); return; }
    flag('shrine_painting_examined', true);
    msgFade('你走近祖宗画像。画中是五个身着清代服饰的人，但面容已经模糊不清——\n奇怪的是，每个人的眼睛处都被针刺了小洞，和旧照片上的痕迹一模一样。\n\n画框右下角写着：「镜中无目，目中无镜。」', 'warn');
    h_found(h);
  },

  // ---------- WELL ----------
  wellOpening(h) {
    if (flag('well_retrieved')) { msg('井底已经被你捞过了。水面平静，映着井口的一小片天空。'); return; }
    if (!has(ITEMS.rope)) {
      msgFade('你探头看向井底——黑暗深处有微弱的反光，像是某种金属制品。\n但井太深了，你需要绳索才能下去取。', 'warn');
      return;
    }
    // Has rope — can retrieve item
    Modal.open(`<h2>古井</h2>
      <p>你将绳索系在井口的辘轳上，慢慢将半截断绳接上你的绳索，然后放下去。</p>
      <p>绳索垂入黑暗的井中……你感到末端触到了水面。</p>
      <p>你小心翼翼地摸索——手指触到了一个冰凉的小物件！</p>
      <p style="color:var(--gold);text-align:center;">你缓缓拉起绳索——</p>
      <p>是一块温润的玉佩，上面刻着镜子的纹样。井底的水面上还浮着一张日记残页。</p>
      <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收起玉佩和残页</button></div>`);
    $('m-ok').onclick = () => {
      flag('well_retrieved', true);
      h_found(h);
      Modal.close();
      msgFade('你获得了玉佩和一张日记残页。玉佩在手中微微发热。', 'good');
      addInv(ITEMS.jade);
      collectDiary('page7');
      renderRoom();
    };
  },

  wellWall(h) {
    if (flag('wellWall_read')) { msg('井壁上的刻痕你已经记下了。其中一组编码值得注意。'); return; }
    flag('wellWall_read', true);
    msgFade('你仔细查看井壁上的刻痕——青苔下隐约可见古老的符号。\n其中一处刻痕与众不同，是一串十六进制编码：\n\n57 45 4C 4C 3D 42 41 53 4D 54\n\n这些符号与地下室的似乎有关联……用解码器解读。', 'warn');
    h_found(h);
  },

  wellBucket(h) {
    msg('老旧的辘轳上缠着半截断裂的绳索。如果能找到新的绳索，也许可以用它探入井底。');
  },

  // ---------- SECRET PASSAGE ----------
  passageWall(h) {
    if (flag('passageWall_read')) { msg('密道墙壁上的符号在烛光下微微闪烁。'); return; }
    flag('passageWall_read', true);
    msgFade('密道墙壁上的符号比地下室的更加密集。你辨认出一段文字——\n「此道通庭院，沈氏秘建。辛亥之变，全家入镜，唯此道可逃。」\n\n辛亥之变——1911年。沈家灭亡的那一年。这条密道是他们的逃生通道……但他们没能逃出去。', 'warn');
    h_found(h);
  },

  passageBox(h) {
    if (flag('passageBox_opened')) { msg('石壁暗匣已经打开了。里面空空如也。'); return; }
    flag('passageBox_opened', true);
    msgFade('你扣住暗匣的边缘，用力拉出——里面放着一张泛黄的符咒。\n符咒上画着复杂的图形，背面写着：「贴于镜面，可封镜门一时。」', 'good');
    addInv(ITEMS.talisman);
    h_found(h);
  },

  passageDoor(h) {
    msg('木门半开着，透进来的光是庭院的月光。推开门，你就能直接从地下室到达庭院。');
  },

  // ---------- MIRROR WORLD ----------
  mwGhosts(h) {
    if (flag('mw_ghosts_spoken')) {
      if (has(ITEMS.jade)) {
        msg('你再次举起玉佩。这一次，人影的面容清晰了一些。他们的眼中似乎有泪光。');
      } else {
        msg('人影依旧模糊，无声地注视着你。你感到一阵深入骨髓的寒意。');
      }
      return;
    }
    if (has(ITEMS.jade)) {
      // With jade, ghosts can communicate
      Modal.open(`<h2>沈家五人</h2>
        <p>你举起玉佩——蓝色的光芒从玉佩中射出，照向五个人影。</p>
        <p style="color:var(--gold);text-align:center;">他们的面容渐渐清晰了。</p>
        <p>最年长的曾祖父开口了，声音如同从很远的地方传来：</p>
        <div class="letter">「我们……等了很久。镜中的世界，时间不再流动。我们被困在这里，成为了通道的锚。</p>
        <p>那把银匕首——可以斩断我们与镜子的联系。但如果你从外面刺入镜面，我们会被碎片吞噬。</p>
        <p>如果你从里面——从镜中世界——用匕首刺向镜面，我们就能真正解脱。</p>
        <p>但代价是……你也可能被困在镜中。</p>
        <p>除非——你有那块玉佩。它能在最后关头，把你拉回现实。」</div>
        <p class="puzzle-hint" style="color:var(--gold);">原来如此……在镜中世界刺破镜面，才是真正的解法。而玉佩能保护你脱身。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
      flag('mw_ghosts_spoken', true);
      h_found(h);
      $('m-ok').onclick = () => Modal.close();
    } else {
      // Without jade, ghosts are hostile
      Modal.open(`<h2>沈家五人</h2>
        <p>五个人影面容模糊，嘴唇翕动，无声地说着什么。</p>
        <p>你辨认出口型——</p>
        <p style="text-align:center;color:var(--blood-bright);font-size:16px;letter-spacing:3px;">「换 我」</p>
        <p>他们开始缓缓向你走来。你感到一阵刺骨的寒意。</p>
        <p>你后退几步。也许你需要某种东西来与他们沟通……</p>
        <p class="puzzle-hint">日记中提到过一块玉佩……它能「镇住」镜中之物。</p>
        <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
      $('m-ok').onclick = () => Modal.close();
    }
  },

  mwAltar(h) {
    if (flag('mw_altar_used')) { msg('石台上的光芒已经消散。'); return; }

    const hasDagger = has(ITEMS.dagger);
    const hasJade = has(ITEMS.jade);
    const hasTalisman = has(ITEMS.talisman);

    if (!hasDagger) {
      msg('石台上放着一个发光的球体，但似乎需要某种工具才能触动它。');
      return;
    }

    Modal.open(`<h2>石台</h2>
      <p>石台上放着一个半透明的球体，内部流转着淡蓝色的光芒。</p>
      <p>你将银匕首放在球体上——球体发出耀眼的光芒，银匕首上的符文开始剧烈闪烁。</p>
      <p style="color:var(--gold);text-align:center;">银匕首被镜中世界的力量增强了。</p>
      <p>现在，如果你从镜中世界刺向镜面，力量足以斩断沈家五人与镜子的联系。</p>
      ${hasJade ? '<p style="color:var(--gold);">你有玉佩——它能在镜面碎裂时保护你回到现实世界。</p>' : '<p style="color:var(--blood-bright);">但你没有玉佩。如果从镜中刺破镜面，你可能无法回到现实世界……</p>'}
      ${hasTalisman ? '<p>你有镇魂符——也许可以先用它封印镜门，给自己留一条退路。</p>' : ''}
      <p>你准备好了吗？</p>
      <div style="display:flex;gap:12px;justify-content:center;margin-top:18px;flex-wrap:wrap;">
        ${hasJade ? '<button class="act" id="ending-true">从镜中刺破镜面</button>' : '<button class="act" id="ending-sacrifice" style="border-color:var(--blood);color:var(--blood-bright);">从镜中刺破镜面（无玉佩）</button>'}
        ${hasTalisman ? '<button class="act" id="use-talisman">先贴镇魂符</button>' : ''}
        <button class="act" id="m-ok" style="opacity:.6;">再等等</button>
      </div>`);
    flag('mw_altar_used', true);
    h_found(h);

    if (hasJade) {
      $('ending-true').onclick = () => Game.ending('true');
    } else {
      $('ending-sacrifice').onclick = () => Game.ending('sacrifice');
    }
    if (hasTalisman) {
      $('use-talisman').onclick = () => {
        flag('talismanUsed', true);
        removeInv(ITEMS.talisman);
        Modal.close();
        msgFade('你将镇魂符贴在镜面内侧。符咒发出金光，镜门暂时被封印——你有了退路。', 'good');
        setTimeout(() => {
          msg('现在可以从石台处行动了。', 'warn');
        }, 500);
      };
    }
    $('m-ok').onclick = () => Modal.close();
  },

  mwCrack(h) {
    msg('空气中的裂缝透出温暖的金色光芒——那是现实世界的光。你可以随时从这里退回阁楼。\n\n但如果要从镜中刺破镜面，你需要找到镜面在镜中世界的对应物——也许在石台那里。');
  }
};

// ============================================================
// ENDINGS
// ============================================================
Game.ending = function(type) {
  flag('gameComplete', true);
  clearSave();
  Modal.close();
  if (window.ARG) ARG.saveFragment('MH', 'MIST');

  if (type === 'true') {
    // True ending — best outcome: save everyone including yourself
    shakeRoom();
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 真 相 ·</h2>
        <p>你在镜中世界举起银匕首——刃上的符文爆发出刺眼的白光。</p>
        <p>你将匕首刺向镜面内侧——</p>
        <p style="color:var(--gold);text-align:center;">镜面从内向外炸裂开来。</p>
        <p>无数碎片飞散，每一片都映着不同的天空。沈家五人的身影在光芒中渐渐清晰，然后化为温暖的光点，向上飘散。</p>
        <p>曾祖父的声音在耳边响起：「谢谢你……终于自由了。」</p>
        <p>玉佩在你手中发出最后一道蓝光——你感到一股力量将你拉向那道金色的裂缝。</p>
        <p>你被甩出镜中世界，跌落在阁楼地板上。身后，镜子碎成了齑粉。</p>
        <p>寒意散去。天窗外，暗红的月亮渐渐变回银白色。远处传来钟声——一，二，三。</p>
        <p>子时三刻。一切，结束了。</p>
        <p>你带着沈家的故事，走出了雾隐宅。浓雾在身后散去，露出了山林本来的面目。</p>
        <p style="color:var(--gold);text-align:center;margin-top:20px;letter-spacing:3px;">—— 真 结 局 · 破镜重圆 ——</p>
        <p style="font-size:12px;color:#666;text-align:center;margin-top:12px;">日记残页：${S.diary.length} / 7 · 你找到了所有的真相。</p>
        <p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 MIST 已回收 · 档案 #MH-1911 已归档</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'good') {
    shakeRoom();
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 破 局 ·</h2>
        <p>银匕首刺入镜面——</p>
        <p>没有碎裂声。匕首没入漆黑的镜面，如同刺入水面。镜面泛起一圈圈涟漪。</p>
        <p>镜中的五个人影开始颤抖，扭曲，渐渐化为光点，消散在涟漪中。</p>
        <p style="color:var(--gold);text-align:center;">镜面从漆黑变为透明，再变为碎裂。</p>
        <p>「咔——嚓——」</p>
        <p>镜子碎成了无数片。每一片都映着不同的天空——有白昼，有星夜，有霞光。</p>
        <p>寒意散去。你听到远处传来钟声——一，二，三……</p>
        <p>三响。子时三刻。</p>
        <p>沈家的五个人，自由了。而你也走出了雾隐宅。</p>
        <p style="color:var(--ink);text-align:center;margin-top:12px;font-size:12px;">（你从镜外刺破了镜面。沈家人虽然解脱了，但也许还有更好的方式……）</p>
        <p style="color:var(--gold);text-align:center;margin-top:16px;letter-spacing:3px;">—— 完 ——</p>
        <p style="font-size:12px;color:#666;text-align:center;margin-top:12px;">日记残页：${S.diary.length} / 7 收集</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else if (type === 'sacrifice') {
    // Sacrifice ending — save everyone but trap yourself
    setTimeout(() => {
      Modal.open(`<h2 class="ending-good">· 牺 牲 ·</h2>
        <p>你在镜中世界举起银匕首——没有玉佩保护，你知道这一刺意味着什么。</p>
        <p>你将匕首刺向镜面内侧——</p>
        <p style="color:var(--gold);text-align:center;">镜面从内向外炸裂开来。</p>
        <p>沈家五人的身影在光芒中渐渐清晰。他们看着你，面露悲悯。</p>
        <p>曾祖父低声说：「谢谢你……代替我们。」</p>
        <p>碎片飞散。你感到自己的身体开始变得透明——你正在成为镜中世界的新「锚」。</p>
        <p>你回头看向那道金色的裂缝——它正在合拢。</p>
        <p>你微笑着。至少，他们自由了。</p>
        <p style="color:var(--blood-bright);text-align:center;margin-top:16px;">你成为了新的守镜人。镜中世界，永恒宁静。</p>
        <p style="color:var(--gold);text-align:center;margin-top:20px;letter-spacing:3px;">—— 牺 牲 结 局 ——</p>
        <p style="font-size:12px;color:#666;text-align:center;margin-top:12px;">日记残页：${S.diary.length} / 7 · 你做出了最崇高的选择。</p>
        <div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);
      $('restart').onclick = () => location.href = 'index.html';
    }, 800);
  } else {
    // Bad ending — enter mirror willingly
    setTimeout(() => {
      Modal.open(`<h2 class="ending-bad">· 入 镜 ·</h2>
        <p>你放下银匕首，迈向镜中——</p>
        <p>镜面如水般荡开，你的身体没入其中，没有一丝阻碍。</p>
        <p>镜中的世界一片宁静。沈家五人微笑着看着你。</p>
        <p>但当你回头时——身后的镜面已经合拢。</p>
        <p>你再也出不去了。</p>
        <p style="color:var(--blood-bright);text-align:center;margin-top:16px;letter-spacing:2px;">你成为了第六个人。</p>
        <p style="color:var(--blood-bright);text-align:center;">镜中世界，如今平衡了。</p>
        <p style="color:var(--gold);text-align:center;margin-top:20px;letter-spacing:3px;">—— 完 ——</p>
        <p style="font-size:12px;color:#666;text-align:center;margin-top:12px;">日记残页：${S.diary.length} / 7 收集</p>
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
  Modal.open(`<h2>雾 隐 档 案</h2>
    <div class="arg-intro-banner">
      <div class="arg-classified">机密 · 已解密 · 档案编号 MH-1911</div>
      <div class="arg-title">沈氏雾隐宅失踪事件调查卷宗</div>
      <div class="arg-note">本档案包含编码信息。使用解码器破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--gold);letter-spacing:3px;font-size:13px;">CASE FILE · THE HOUSE IN THE MIST</p>
    <p style="margin-top:16px;">你是市级档案馆的一名档案管理员。在整理旧案卷时，你发现了编号 MH-1911 的解密卷宗——关于辛亥年（1911）沈氏家族集体失踪案的调查记录。</p>
    <p>卷宗中附有民俗学者林默的田野笔记。林默曾独自前往雾隐宅调查，之后便音讯全无。卷宗中所有关键信息均已编码，你需要使用解码器逐一破解。</p>
    <p style="color:var(--gold);text-align:center;font-style:italic;margin-top:14px;">「找到日记碎片，拼凑出真相。小心那面镜子。」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：点击场景中的区域进行调查。所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
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
    S.room = 'gate'; S.inv = []; S.diary = []; S.flags = {};
    Modal.close();
    renderInv();
    renderRoom();
    setTimeout(() => $('btn-letter').onclick(), 400);
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
    { type:'console', gameId:'MH', text:'[系统] 档案 MH-1911 已加载。注意：所有年代信息均已编码。' },
    { type:'console', gameId:'MH', encoded:'.---- ----. .---- .----', cipherType:'摩斯码', hint:'石碑上的摩斯码记录了沈家灭亡之年' },
    { type:'console', gameId:'MH', encoded:'00110011 00110001 00110101', cipherType:'二进制', hint:'壁炉残片记录了关键时间（3位数）' },
    { type:'console', gameId:'MH', encoded:'MTIzNDU=', cipherType:'Base64', hint:'祠堂仪式密码（查看页面源代码确认）' },
    { type:'console', gameId:'MH', encoded:'57 45 4C 4C 3D 42 41 53 4D 54', cipherType:'十六进制', hint:'井壁密文：与地下室机关有关' },
    { type:'hidden', id:'mh-meta', text:'WELL=BASMT' },
    { type:'console', gameId:'MH', text:'[通讯] 线人林默最后联系: +86 138-0011-XXXX · 安徽黄山山区' },
    { type:'console', gameId:'MH', text:'[关联] 镜中世界异常信号频率与档案 #SD-4372（HELIOS-7）AI觉醒时完全一致。两者可能通过同一"门"连接。' },
    { type:'console', gameId:'MH', text:'[坐标] 雾隐宅位置: 30.1472°N 118.1578°E — 安徽黄山南麓' },
    { type:'console', gameId:'MH', encoded:'VGhlIG1pcnJvciBpcyBub3QgYSBtaXJyb3IgLSBpdCBpcyBhIGdhdGUsIGFuZCBpdCB3YXMgb3BlbmVkIGZyb20gdGhlIG90aGVyIHNpZGU=', cipherType:'Base64', hint:'镜中世界真相（终极线索）' },
  ]);
}
