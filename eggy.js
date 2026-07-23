/* ============================================================
   蛋仔派对岛 · Eggy Party Island
   A cute party adventure — collect 5 stars to win the crown!
   ============================================================ */
const S={room:'plaza',inv:[],flags:{},msgTimer:null,stars:0,level:1};
const ITEMS={ticket:'派对门票',gummy_key:'软糖钥匙',lever:'操纵杆',gear:'金色齿轮',crown:'派对皇冠'};
const BRIEF=`派对指南：

    欢迎来到蛋仔派对岛！

    你是一个圆滚滚的蛋仔，来到了漂浮在天空中的派对岛。
    这里正在举办一年一度的派对大赛——赢取派对皇冠！

    规则很简单：
    · 通过5个关卡，每关收集1颗星星
    · 集齐5颗星星，就能挑战皇冠塔
    · 获得皇冠，成为派对冠军！

    各关卡：
    1. 派对广场 → 获取门票和钥匙
    2. 果冻舞台 → 弹弹弹，拿星星
    3. 蛋糕工厂 → 操作机器，找齿轮
    4. 玩具箱 → 搭积木，拿齿轮
    5. 皇冠塔 → 终极挑战！

    加油鸭，蛋仔！`;
const ROOMS={
  plaza:{name:'派对广场 · PARTY PLAZA',img:'images/eggy_plaza.jpg',
    desc:'派对广场热闹非凡！彩旗和气球飘满天空，中央的派对舞台上有一个上锁的宝箱。左侧的票亭里有一个蛋仔NPC。右侧有三扇彩色门——红色通向果冻舞台，蓝色通向蛋糕工厂，黄色通向玩具箱。\n\n远处可以看到彩虹皇冠塔的轮廓！',
    nav:[{to:'jelly',label:'→ 红门：果冻舞台'},{to:'cake',label:'→ 蓝门：蛋糕工厂',locked:true,lockMsg:'蓝门锁着。需要软糖钥匙。',need:'cakeOpen'},{to:'toybox',label:'→ 黄门：玩具箱',locked:true,lockMsg:'黄门锁着。需要软糖钥匙。',need:'toyboxOpen'},{to:'crown',label:'→ 彩虹皇冠塔（需要5颗星星）',locked:true,lockMsg:'皇冠塔的彩虹桥还没亮起来。需要5颗星星！',need:'crownOpen'}],
    hotspots:[{id:'pz_chest',x:20,y:20,w:45,h:55,label:'派对宝箱',action:'pzChest'},{id:'pz_booth',x:0,y:20,w:18,h:45,label:'票亭NPC',action:'pzBooth'},{id:'pz_doors',x:72,y:25,w:23,h:40,label:'彩色门',action:'pzDoors'}]},
  jelly:{name:'果冻舞台 · JELLY STAGE',img:'images/eggy_jelly.jpg',
    desc:'欢迎来到果冻舞台！这里的一切都是软弹弹的——踩上去会蹦蹦蹦地跳！中央的果冻平台上有一个星星按钮。左侧的大橡皮糖熊举着什么东西。右侧的棉花糖机可以当作蹦床使用，顶部有旗帜。\n\n注意不要被弹到边缘外！',
    nav:[{to:'plaza',label:'← 返回派对广场'}],
    hotspots:[{id:'jy_button',x:20,y:25,w:45,h:50,label:'星星按钮',action:'jyButton'},{id:'jy_bear',x:0,y:25,w:18,h:40,label:'橡皮糖熊',action:'jyBear'},{id:'jy_candy',x:70,y:20,w:25,h:45,label:'棉花糖机',action:'jyCandy'}]},
  cake:{name:'蛋糕工厂 · CAKE FACTORY',img:'images/eggy_cake.jpg',
    desc:'蛋糕工厂充满了甜蜜的香气！传送带上运送着蛋糕切片，但控制面板似乎坏了。左侧的巨大搅拌碗旁有梯子通向上方平台。右侧的糖霜机器有操纵杆，管道通向下一个房间。\n\n机器启动后，也许能弹出什么好东西！',
    nav:[{to:'plaza',label:'← 返回派对广场'}],
    hotspots:[{id:'ck_panel',x:20,y:25,w:45,h:50,label:'控制面板',action:'ckPanel'},{id:'ck_bowl',x:0,y:20,w:18,h:45,label:'搅拌碗',action:'ckBowl'},{id:'jy_machine',x:70,y:20,w:25,h:48,label:'糖霜机器',action:'ckMachine'}]},
  toybox:{name:'玩具箱 · TOY BOX',img:'images/eggy_toybox.jpg',
    desc:'你进入了巨型玩具箱的内部！到处都是积木、玩具和彩色方块。中央的发条机器人举着一个金色齿轮。左侧的积木可以搭成楼梯。右侧的娃娃屋门开着，里面似乎有东西在闪光。\n\n好想全部玩一遍！但先完成任务吧！',
    nav:[{to:'plaza',label:'← 返回派对广场'}],
    hotspots:[{id:'tb_robot',x:20,y:25,w:45,h:50,label:'发条机器人',action:'tbRobot'},{id:'tb_blocks',x:0,y:20,w:18,h:45,label:'积木楼梯',action:'tbBlocks'},{id:'tb_house',x:70,y:20,w:25,h:48,label:'娃娃屋',action:'tbHouse'}]},
  crown:{name:'皇冠塔 · CROWN TOWER',img:'images/eggy_crown.jpg',
    desc:'皇冠塔的塔顶！螺旋楼梯通向金色的派对皇冠。左侧的彩色大炮可以把蛋仔发射到高处。右侧有一个巨大的开关按钮，按下后彩虹桥就会亮起来，通往皇冠。\n\n彩纸从天空飘落，派对音乐在响——这是最终挑战！',
    nav:[{to:'plaza',label:'← 返回派对广场'}],
    hotspots:[{id:'cr_stairs',x:25,y:15,w:40,h:60,label:'螺旋楼梯',action:'crStairs'},{id:'cr_cannon',x:0,y:25,w:20,h:40,label:'彩色大炮',action:'crCannon'},{id:'cr_switch',x:70,y:15,w:25,h:50,label:'彩虹开关',action:'crSwitch'}]}
};
const $=id=>document.getElementById(id);
function msg(t,c){const e=$('msg');e.textContent=t;e.className=c||'';if(S.msgTimer)clearTimeout(S.msgTimer);}
function msgFade(t,c,d=3500){msg(t,c);S.msgTimer=setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent='';},d);}
function has(i){return S.inv.includes(i);}
function addInv(i){if(!has(i)){S.inv.push(i);renderInv();saveGame();return true;}return false;}
function removeInv(i){const j=S.inv.indexOf(i);if(j>=0){S.inv.splice(j,1);renderInv();saveGame();}}
function flag(k,v){if(v!==undefined){S.flags[k]=v;saveGame();}return S.flags[k];}
function shakeRoom(){const r=$('room-img-wrap');r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');}
function h_found(h){flag(h.id+'_found',true);}
const SAVE_KEY='eggyParty_save';
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({room:S.room,inv:S.inv,flags:S.flags,stars:S.stars,level:S.level}));}catch(e){}}
function loadGame(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return false;const d=JSON.parse(r);S.room=d.room||'plaza';S.inv=d.inv||[];S.flags=d.flags||{};S.stars=d.stars||0;S.level=d.level||1;return true;}catch(e){return false;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function renderInv(){const b=$('inv-items');if(S.inv.length===0){b.innerHTML='<span class="inv-empty">空空如也~</span>';return;}b.innerHTML=S.inv.map((it,i)=>`<span class="inv-item" data-idx="${i}">${it}</span>`).join('');b.querySelectorAll('.inv-item').forEach(e=>{e.onclick=()=>useInvItem(S.inv[parseInt(e.dataset.idx)]);});}
function useInvItem(item){
  if(item===ITEMS.ticket)msg('派对门票！凭此可以参加派对大赛。票亭的蛋仔NPC给你的。');
  else if(item===ITEMS.gummy_key)msg('一把软糖钥匙！闻起来甜甜的。可以打开蓝色和黄色的门。');
  else if(item===ITEMS.lever)msg('一个操纵杆。可以装到蛋糕工厂的控制面板上。');
  else if(item===ITEMS.gear)msg('一个闪闪发光的金色齿轮！是启动皇冠塔彩虹桥的关键零件。');
  else if(item===ITEMS.crown)msg('🏆 派对皇冠！你是蛋仔派对的冠军！');
  else msg(item);
}
function updateStatus(){
  $('star-val').textContent=S.stars;
  $('level-val').textContent=S.level;
  if(S.stars>=5){$('star-val').style.color='var(--accent)';}else{$('star-val').style.color='';}
}
function addStar(){S.stars++;S.level++;updateStatus();saveGame();}
let _roomToken=0;
function renderRoom(){
  const r=ROOMS[S.room];if(!r)return;const tk=++_roomToken;
  $('room-name').textContent=r.name;$('room-desc').textContent=r.desc;$('msg').textContent='';$('msg').className='';
  const ie=$('room-img'),we=$('room-img-wrap');we.classList.add('img-loading');ie.classList.add('fading');
  const pl=new Image();
  pl.onload=function(){if(tk!==_roomToken)return;ie.src=r.img;setTimeout(function(){if(tk!==_roomToken)return;we.classList.remove('img-loading');ie.classList.remove('fading');},50);};
  pl.onerror=function(){if(tk!==_roomToken)return;ie.src=r.img;we.classList.remove('img-loading');ie.classList.remove('fading');};
  pl.src=r.img;
  const hb=$('hotspots');hb.innerHTML='';
  r.hotspots.forEach(h=>{const d=document.createElement('div');d.className='hotspot'+(flag(h.id+'_found')?' found':'');d.style.left=h.x+'%';d.style.top=h.y+'%';d.style.width=h.w+'%';d.style.height=h.h+'%';d.innerHTML=`<span class="hs-label">${h.label}</span>`;d.onclick=()=>{Hotspot.activate(h);};hb.appendChild(d);});
  const nb=$('nav');nb.innerHTML='';
  r.nav.forEach(n=>{const b=document.createElement('button');b.className='navbtn'+(n.locked&&!flag(n.need)?' locked':'');b.textContent=n.label;b.onclick=()=>{if(n.locked&&!flag(n.need)){if(n.need==='cakeOpen'&&has(ITEMS.gummy_key)){flag('cakeOpen',true);msgFade('软糖钥匙打开了蓝门！甜甜的~','good');renderRoom();return;}if(n.need==='toyboxOpen'&&has(ITEMS.gummy_key)){flag('toyboxOpen',true);msgFade('软糖钥匙打开了黄门！好香~','good');renderRoom();return;}if(n.need==='crownOpen'&&S.stars>=5){flag('crownOpen',true);msgFade('5颗星星亮起了彩虹桥！皇冠塔的门打开了！','good');renderRoom();return;}msgFade(n.lockMsg||'这扇门打不开~','warn');shakeRoom();return;}S.room=n.to;saveGame();renderRoom();window.scrollTo({top:0,behavior:'smooth'});};nb.appendChild(b);});
  saveGame();
}
const Modal={open(h){$('modal-box').innerHTML='<button class="close-x" id="modal-close">×</button>'+h;$('modal-bg').classList.add('show');document.getElementById('modal-close').onclick=()=>this.close();},close(){$('modal-bg').classList.remove('show');}};
$('modal-bg').addEventListener('click',e=>{if(e.target===$('modal-bg'))Modal.close();});
$('btn-stars').onclick=()=>{let h='<h2>⭐ 星星收集</h2>';const stages=[{n:'果冻舞台',done:flag('jy_star')},{n:'蛋糕工厂',done:flag('ck_star')},{n:'玩具箱',done:flag('tb_star')},{n:'皇冠塔',done:flag('cr_star')},{n:'派对宝箱',done:flag('pz_star')}];h+='<div style="display:flex;flex-direction:column;gap:8px;">';stages.forEach((s,i)=>{h+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;background:${s.done?'rgba(102,187,106,.1)':'rgba(255,255,255,.03)'};border:1px solid ${s.done?'rgba(102,187,106,.3)':'rgba(255,255,255,.05)'};"><span style="font-size:20px;">${s.done?'⭐':'☆'}</span><span style="color:${s.done?'var(--success)':'var(--muted)'};font-weight:700;">${s.n}</span></div>`;});h+='</div>';h+=`<p style="text-align:center;margin-top:12px;color:var(--accent);font-weight:700;">已收集 ${S.stars} / 5 颗星星</p>`;Modal.open(h);};
$('btn-intro').onclick=()=>{Modal.open(`<h2>派对指南</h2><div class="eggy-box">${BRIEF}</div>`);};
const Hotspot={
  activate(h){const fn=h.action;if(Hotspot[fn])Hotspot[fn](h);},
  // ---------- PLAZA ----------
  pzChest(h){
    if(flag('pz_star')){msg('宝箱已经空了。你之前拿到了里面的星星！');return;}
    if(!has(ITEMS.ticket)){msgFade('宝箱锁着呢！上面写着：「需要派对门票才能打开」','warn');return;}
    msgFade('你用派对门票打开了宝箱——\n里面有一颗亮闪闪的星星！⭐','good');flag('pz_star',true);addStar();h_found(h);
  },
  pzBooth(h){
    if(has(ITEMS.ticket)){msg('票亭的蛋仔NPC对你微笑。你已经拿到门票了~');return;}
    if(has(ITEMS.gummy_key)){msgFade('蛋仔NPC说：「你已经有软糖钥匙了！去打开蓝门和黄门吧~」','good');return;}
    Modal.open(`<h2>票亭蛋仔NPC</h2><p>一个圆滚滚的蛋仔NPC在票亭里向你招手：</p><div class="eggy-box">「嗨！欢迎来到蛋仔派对岛！
这是你的派对门票~

对了，你看到宝箱了吗？用门票就能打开它！

还有——如果你在果冻舞台拿到了软糖钥匙，
就能打开蓝门和黄门了。

加油鸭！成为派对冠军！</div><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收到！谢谢蛋仔~</button></div>`);
    $('m-ok').onclick=()=>{addInv(ITEMS.ticket);Modal.close();msgFade('获得了派对门票！','good');h_found(h);};
  },
  pzDoors(h){
    msg('三扇彩色门：\n🔴 红门 → 果冻舞台（已开放）\n🔵 蓝门 → 蛋糕工厂（需要软糖钥匙）\n🟡 黄门 → 玩具箱（需要软糖钥匙）\n\n远处还有彩虹皇冠塔——需要5颗星星！');
  },
  // ---------- JELLY ----------
  jyButton(h){
    if(flag('jy_star')){msg('果冻平台上的星星按钮已经被你按过了。弹弹弹~');return;}
    msgFade('你跳上果冻平台，踩中了星星按钮——\n「Boing!」果冻把你弹到了空中！\n一颗星星从天而降！⭐','good');flag('jy_star',true);addStar();h_found(h);
  },
  jyBear(h){
    if(has(ITEMS.gummy_key)){msg('橡皮糖熊已经把软糖钥匙给你了。它对你挥手~');return;}
    msgFade('大橡皮糖熊把软糖钥匙递给了你！\n软糖钥匙可以打开蓝门和黄门。','good');addInv(ITEMS.gummy_key);h_found(h);
  },
  jyCandy(h){
    msg('棉花糖机可以当作蹦床使用！跳上去可以蹦得很高~\n但你现在不需要它，星星按钮在果冻平台上。');
  },
  // ---------- CAKE FACTORY ----------
  ckPanel(h){
    if(flag('ck_star')){msg('控制面板已经正常运转了。传送带上在运送蛋糕~');return;}
    if(!has(ITEMS.lever)){msgFade('控制面板缺少操纵杆！\n操纵杆在糖霜机器上。','warn');return;}
    flag('ck_star',true);removeInv(ITEMS.lever);
    msgFade('你把操纵杆装到控制面板上——\n「嗡嗡嗡——」传送带开始运转！\n一颗星星从蛋糕中弹了出来！⭐','good');addStar();h_found(h);renderRoom();
  },
  ckBowl(h){
    msg('巨大的搅拌碗！爬上梯子可以到达上方的平台。\n但那里只有一些蛋糕配方，对你没有用。');
  },
  ckMachine(h){
    if(has(ITEMS.lever)){msg('糖霜机器的操纵杆已经被你取下了。','warn');return;}
    msgFade('你从糖霜机器上取下了操纵杆！\n可以装到控制面板上。','good');addInv(ITEMS.lever);h_found(h);
  },
  // ---------- TOYBOX ----------
  tbRobot(h){
    if(flag('tb_star')){msg('发条机器人已经把齿轮和星星都给你了。它还在原地转圈~');return;}
    if(!has(ITEMS.gear)){msgFade('发条机器人举着一个金色齿轮，但它似乎没电了。\n你需要先找到什么东西来激活它。','warn');return;}
    flag('tb_star',true);
    Modal.open(`<h2>发条机器人</h2><p>你把金色齿轮装到了发条机器人身上——</p><p style="text-align:center;color:var(--accent);">「叮叮叮——」机器人开始转圈！</p><p>它兴奋地跳了起来，从肚子里弹出了一颗星星！⭐</p><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">耶！拿到星星了！</button></div>`);
    $('m-ok').onclick=()=>{removeInv(ITEMS.gear);Modal.close();addStar();msgFade('获得了星星！现在有'+S.stars+'颗了~','good');h_found(h);};
  },
  tbBlocks(h){
    if(has(ITEMS.gear)){msg('积木楼梯已经搭好了。你之前爬上去拿到了齿轮。');return;}
    msgFade('你把积木搭成了楼梯，爬到了上方——\n那里有一架玩具飞机，飞机上挂着一个金色齿轮！\n这应该能启动发条机器人。','good');addInv(ITEMS.gear);h_found(h);
  },
  tbHouse(h){
    msg('娃娃屋的门开着，里面有一个小小的金色皇冠——\n但那只是玩具皇冠，不是真正的派对皇冠。\n真正的皇冠在皇冠塔顶！');
  },
  // ---------- CROWN TOWER ----------
  crStairs(h){
    if(flag('gameComplete')){msg('你已经获得了派对皇冠！你是冠军！🏆');return;}
    if(!flag('rainbow_on')){msgFade('螺旋楼梯通向皇冠，但中间断了——\n需要先按下彩虹开关，激活彩虹桥！','warn');return;}
    Modal.open(`<h2>螺旋楼梯</h2><p>彩虹桥亮起来了！你沿着螺旋楼梯跑向塔顶——</p><p>金色的派对皇冠就在基座上闪闪发光！</p><div style="text-align:center;margin-top:14px;"><button class="act" id="grab-crown">拿下皇冠！</button></div>`);
    $('grab-crown').onclick=()=>{Modal.close();Game.ending();};
  },
  crCannon(h){
    msg('彩色大炮可以把蛋仔发射到高处！\n「嘭——」你飞上了天空，又落回了原地。\n好刺激！但彩虹开关在右边。');
  },
  crSwitch(h){
    if(flag('rainbow_on')){msg('彩虹桥已经亮起来了！七彩的光芒通向皇冠。');return;}
    if(S.stars<5){msgFade('彩虹开关需要5颗星星的能量才能启动！\n你现在只有'+S.stars+'颗。','warn');return;}
    flag('rainbow_on',true);
    msgFade('你按下了彩虹开关——\n「哗——」五颗星星的能量涌入，彩虹桥亮起来了！\n七彩的光芒连接了楼梯的断口，通向皇冠！','good');h_found(h);renderRoom();
  }
};
function Game(){}
Game.ending=function(){
  flag('gameComplete',true);addInv(ITEMS.crown);clearSave();
  if (window.ARG) ARG.saveFragment('EP', 'EGGY');
  setTimeout(()=>{Modal.open(`<h2 class="ending-good">🏆 派 对 冠 军！</h2><p>你拿起了金色的派对皇冠——</p><p style="text-align:center;font-size:18px;color:var(--accent);">🎉🎉🎉</p><p>彩纸从天空飘落，派对音乐响起！所有蛋仔NPC都在为你欢呼！</p><p>「冠军！冠军！冠军！」</p><p>你把皇冠戴在头上——作为蛋仔派对岛的冠军，你的名字将被刻在派对广场的冠军墙上！</p><p style="color:var(--accent);text-align:center;margin-top:16px;letter-spacing:2px;">—— 恭 喜 通 关 · 蛋 仔 派 对 冠 军 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">星星：5 / 5 · 获得派对皇冠！</p><p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 EGGY 已回收 · 档案 #EP-5523 已归档 · ⚠ 此档案为「门计划」关键节点</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);
};
Game.showIntro=function(){
  const sv=!!localStorage.getItem(SAVE_KEY);let cb='';if(sv){cb='<button class="act" id="ic" style="margin-right:12px;">继 续 调 查</button>';}
  Modal.open(`<h2>虚拟空间档案</h2>
    <div class="bpp-intro-banner">
      <div class="bpp-classified">机密 · 已解密 · 档案编号 EP-5523</div>
      <div class="bpp-title">「蛋仔派对岛」虚拟空间异常事件</div>
      <div class="bpp-subtitle">异常等级: ??? · 调查员: [待分配] · ⚠ 关键档案</div>
      <div class="bpp-note">本档案包含编码信息。使用<span class="bpp-highlight">解码器</span>破解密文。<span style="color:#ff6b6b;">此档案与「门计划」直接相关。</span></div>
    </div>
    <p style="text-align:center;color:var(--cyan);letter-spacing:2px;font-size:13px;font-family:monospace;">EGGY PARTY ISLAND · 冲鸭蛋仔！</p>
    <p style="margin-top:16px;">你是异常现象调查局的调查员。档案 #EP-5523 记录了一个名为「蛋仔派对岛」的虚拟空间。表面看是一个无害的派对游戏，但BPP检测到异常数据波动。</p><p>你调阅此档案，意识被投射进虚拟空间——你成为了一个圆滚滚的蛋仔。通过5个关卡，收集5颗星星……</p><p style="color:var(--accent);text-align:center;font-style:italic;margin-top:14px;">「加油鸭，蛋仔！……但这里真的只是游戏吗？」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">${cb}<button class="act" id="is">调 入 档 案</button></div>`);
  if(sv){$('ic').onclick=()=>{loadGame();Modal.close();renderInv();updateStatus();renderRoom();};}
  $('is').onclick=()=>{clearSave();S.room='plaza';S.inv=[];S.flags={};S.stars=0;S.level=1;Modal.close();renderInv();updateStatus();renderRoom();setTimeout(()=>$('btn-intro').onclick(),400);};
};
renderInv();updateStatus();renderRoom();Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if (window.ARG) {
  ARG.plantClues([
    { type:'console', gameId:'EP', text:'[系统] 档案 EP-5523 已加载。主密码已用 Base64 编码。' },
    { type:'console', gameId:'EP', encoded:'NTUyMw==', cipherType:'Base64', hint:'虚拟空间主密码（4位数字）' },
    { type:'console', gameId:'EP', encoded:'R3VtbXkgS2V5OiBKZWxseQ==', cipherType:'Base64', hint:'软糖钥匙位置（解码后查看）' },
    { type:'console', gameId:'EP', text:'[通讯] 服务器IP: 192.168.55.23:8080 · 位置: [隐藏]' },
    { type:'console', gameId:'EP', text:'[关联] ⚠ 此虚拟空间是「门计划」的入口。所有其他档案（MH/SD/TQ/DA/TI/WE/IA）均为此空间的模拟投射。' },
    { type:'console', gameId:'EP', text:'[坐标] 物理服务器: 35.6762°N 139.6503°E — 与档案 #IA-1920 坐标一致' },
    { type:'console', gameId:'EP', encoded:'WW91IGFyZSBub3QgcGxheWluZyBhIGdhbWUgLSB5b3UgYXJlIGluc2lkZSB0aGUgc2ltdWxhdGlvbi4gRXZlcnkgZ2FtZSB5b3UgcGxheWVkIHdhcyBhIHRlc3Qu', cipherType:'Base64', hint:'「门计划」真相（终极线索）' },
  ]);
}
