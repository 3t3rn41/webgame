/* ============================================================
   末日列车 · Wasteland Express
   Post-apocalyptic survival on a moving train.
   ============================================================ */
const S={room:'cabin',inv:[],notes:[],flags:{},msgTimer:null,fuel:40,health:80,signal:0};
const ITEMS={axe:'消防斧',fuel_can:'油桶',key_code:'密码纸',wrench:'管钳',flare:'信号枪',radio:'电台',med_kit:'急救包',fuse:'保险丝'};
const NOTES={
  n1:{title:'电报 · 列车长日志',text:'……列车已运行第47天。燃料剩余40%。\n\n前方是「尽头部」——一座废弃的军事掩体。\n据说那里有补给和通讯设备。\n\n但列车无法自动停下。需要有人在尾部车厢拉下紧急制动。\n\n制动密码在引擎室的日志本上。'},
  n2:{title:'电报 · 工程师遗言',text:'……引擎快不行了。主保险丝烧了。\n备用保险丝在货舱的保险柜里——密码以摩斯码记录：\n-.... -.... ----- ....-\n用解码器破解。\n\n如果引擎停转，列车会在沙漠中抛锚。那样就永远到不了尽头站了。\n\n管钳在引擎室工具架上。没有它，打不开保险丝盒。'},
  n3:{title:'电报 · 军方通讯',text:'……这里是「尽头部」军事掩体。\n检测到一列火车正在接近。\n\n如果车上有幸存者，请在到达前发送信号。\n频率：7.5MHz。电台在车顶。\n\n我们会打开掩体大门——但只有一次机会。\n如果没有信号，我们会认为是自动列车，直接击毁。'},
};
const BRIEF=`生存指南：

    末日之后，你是最后一列还在运行的列车上的唯一乘客。
    列车正穿越废土沙漠，驶向传说中的「尽头部」避难所。

    · 燃料有限，引擎状况持续恶化
    · 你需要修复引擎、补充燃料、联系避难所
    · 到达尽头站时，必须发出信号，否则会被击毁
    · 如果引擎停转或燃料耗尽，列车将永远停在沙漠中

    车厢布局：
    客舱 → 引擎室 → 货舱 → 车顶 → 尾部车厢

    快速行动。沙漠不会等你。`;
const ROOMS={
  cabin:{name:'客舱 · PASSENGER CAR',img:'images/waste_cabin.jpg',
    desc:'客舱破败不堪。座椅撕裂，沙子从裂缝的窗户吹进来。一个求生背包放在座椅上。\n\n右侧门通向引擎室，门上的电子锁坏了，上面贴着一张手绘地图。左侧墙壁上有应急斧。\n\n列车在沙漠中颠簸前行，窗外是无尽的黄沙。',
    nav:[{to:'engine',label:'→ 前往引擎室'},{to:'cargo',label:'→ 前往货舱',locked:true,lockMsg:'货舱门被锁住了。需要密码。',need:'cargoOpen'},{to:'caboose',label:'→ 尾部车厢（需要紧急制动密码）',locked:true,lockMsg:'通往尾部车厢的门锁住了。需要制动密码。',need:'brakeOpen'}],
    hotspots:[{id:'cb_bag',x:20,y:20,w:45,h:55,label:'求生背包',action:'cbBag'},{id:'cb_door',x:68,y:25,w:24,h:40,label:'门和地图',action:'cbDoor'},{id:'cb_axe',x:0,y:30,w:18,h:38,label:'应急斧',action:'cbAxe'}]},
  engine:{name:'引擎室 · ENGINE ROOM',img:'images/waste_engine.jpg',
    desc:'引擎室充满了柴油味和蒸汽。巨大的柴油引擎在轰鸣，但声音不太对——有金属摩擦的杂音。\n\n工程师的控制台上有油门手柄和各种仪表。仪表板旁边锁着一本日志。角落里有一个红色油桶。',
    nav:[{to:'cabin',label:'← 返回客舱'},{to:'rooftop',label:'→ 爬上车顶'}],
    hotspots:[{id:'en_engine',x:5,y:10,w:45,h:65,label:'柴油引擎',action:'enEngine'},{id:'en_panel',x:60,y:25,w:32,h:43,label:'控制台',action:'enPanel'},{id:'en_fuel',x:0,y:40,w:8,h:35,label:'油桶',action:'enFuel'}]},
  cargo:{name:'货舱 · CARGO CAR',img:'images/waste_cargo.jpg',
    desc:'货舱堆满了搜刮来的物资。中央的板条箱敞开着，里面有罐头和水。左侧有一个上锁的武器柜。右侧的工作台上有工具、焊枪和一台电台发射器。',
    nav:[{to:'cabin',label:'← 返回客舱'}],
    hotspots:[{id:'cg_crates',x:20,y:25,w:45,h:50,label:'物资箱',action:'cgCrates'},{id:'cg_locker',x:0,y:25,w:18,h:45,label:'武器柜',action:'cgLocker'},{id:'cg_bench',x:70,y:20,w:25,h:48,label:'工作台',action:'cgBench'}]},
  rooftop:{name:'车顶 · ROOFTOP',img:'images/waste_rooftop.jpg',
    desc:'车顶上风很大，沙漠的夕阳将天空染成橙红色。远处可以看到一座建筑的轮廓——那就是「尽头部」。\n\n中央有一座损坏的卫星天线。左侧的储物箱里有信号枪。右侧有梯子通向下一节车厢。',
    nav:[{to:'engine',label:'← 返回引擎室'},{to:'caboose',label:'→ 经梯子前往尾部车厢',locked:true,lockMsg:'梯子通道的门锁住了。需要制动密码。',need:'brakeOpen'}],
    hotspots:[{id:'rf_dish',x:20,y:15,w:45,h:55,label:'卫星天线',action:'rfDish'},{id:'rf_box',x:0,y:30,w:18,h:35,label:'储物箱',action:'rfBox'},{id:'rf_ladder',x:70,y:25,w:25,h:45,label:'梯子',action:'rfLadder'}]},
  caboose:{name:'尾部车厢 · CABOOSE',img:'images/waste_caboose.jpg',
    desc:'尾部车厢是列车最后一节。中央有一个手动制动轮和一个控制台，上面有红色紧急停车按钮。\n\n左侧有急救站。右侧的后窗可以看到铁轨向远方延伸。窗边挂着望远镜。\n\n前方就是尽头部避难所的入口了。',
    nav:[{to:'cabin',label:'← 返回客舱'}],
    hotspots:[{id:'co_brake',x:20,y:20,w:45,h:55,label:'制动轮',action:'coBrake'},{id:'co_aid',x:0,y:25,w:18,h:45,label:'急救站',action:'coAid'},{id:'co_window',x:70,y:20,w:25,h:45,label:'后窗和望远镜',action:'coWindow'}]}
};
const $=id=>document.getElementById(id);
function msg(t,c){const e=$('msg');e.textContent=t;e.className=c||'';if(S.msgTimer)clearTimeout(S.msgTimer);}
function msgFade(t,c,d=3500){msg(t,c);S.msgTimer=setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent='';},d);}
function has(i){return S.inv.includes(i);}
function addInv(i){if(!has(i)){S.inv.push(i);renderInv();saveGame();return true;}return false;}
function removeInv(i){const j=S.inv.indexOf(i);if(j>=0){S.inv.splice(j,1);renderInv();saveGame();}}
function flag(k,v){if(v!==undefined){S.flags[k]=v;saveGame();}return S.flags[k];}
function hasNote(id){return S.notes.includes(id);}
function addNote(id){if(!hasNote(id)){S.notes.push(id);saveGame();return true;}return false;}
function shakeRoom(){const r=$('room-img-wrap');r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');}
function h_found(h){flag(h.id+'_found',true);}
const SAVE_KEY='wastelandExpress_save';
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({room:S.room,inv:S.inv,notes:S.notes,flags:S.flags,fuel:S.fuel,health:S.health,signal:S.signal}));}catch(e){}}
function loadGame(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return false;const d=JSON.parse(r);S.room=d.room||'cabin';S.inv=d.inv||[];S.notes=d.notes||[];S.flags=d.flags||{};S.fuel=d.fuel||40;S.health=d.health||80;S.signal=d.signal||0;return true;}catch(e){return false;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function renderInv(){const b=$('inv-items');if(S.inv.length===0){b.innerHTML='<span class="inv-empty">空</span>';return;}b.innerHTML=S.inv.map((it,i)=>`<span class="inv-item" data-idx="${i}">${it}</span>`).join('');b.querySelectorAll('.inv-item').forEach(e=>{e.onclick=()=>useInvItem(S.inv[parseInt(e.dataset.idx)]);});}
function useInvItem(item){
  if(item===ITEMS.axe)msg('一把消防斧。可以撬开锁住的门或箱子。');
  else if(item===ITEMS.fuel_can)msg('一桶柴油。可以为引擎补充燃料。');
  else if(item===ITEMS.key_code)msg('一张密码纸，上面是摩斯码：\n-.... -.... ----- ....-\n用解码器破解。背面写着「车轮数」。');
  else if(item===ITEMS.wrench)msg('一把管钳。可以拧开螺丝、打开面板。');
  else if(item===ITEMS.flare)msg('一把信号枪，里面有最后一发信号弹。\n在紧急时刻可以发出求救信号。');
  else if(item===ITEMS.radio)msg('一台便携式电台发射器。可以在车顶使用，联系尽头部避难所。');
  else if(item===ITEMS.med_kit)msg('一个急救包。可以恢复健康。');
  else if(item===ITEMS.fuse)msg('一根备用保险丝。可以修复引擎电路。');
  else msg(item);
}
function updateStatus(){
  $('fuel-val').textContent=S.fuel+'%';
  $('health-val').textContent=S.health+'%';
  if(S.fuel<20)$('fuel-val').style.color='var(--danger)';else if(S.fuel<50)$('fuel-val').style.color='var(--warn)';else $('fuel-val').style.color='';
  if(S.health<30)$('health-val').style.color='var(--danger)';else if(S.health<60)$('health-val').style.color='var(--warn)';else $('health-val').style.color='';
  if(S.signal>0){$('signal-val').textContent='已发送';$('signal-val').style.color='var(--success)';}else{$('signal-val').textContent='无';$('signal-val').style.color='var(--danger)';}
}
let _roomToken=0;
function renderRoom(){
  const r=ROOMS[S.room];if(!r)return;
  const tk=++_roomToken;
  $('room-name').textContent=r.name;$('room-desc').textContent=r.desc;$('msg').textContent='';$('msg').className='';
  const ie=$('room-img'),we=$('room-img-wrap');we.classList.add('img-loading');ie.classList.add('fading');
  const pl=new Image();
  pl.onload=function(){if(tk!==_roomToken)return;ie.src=r.img;setTimeout(function(){if(tk!==_roomToken)return;we.classList.remove('img-loading');ie.classList.remove('fading');},50);};
  pl.onerror=function(){if(tk!==_roomToken)return;ie.src=r.img;we.classList.remove('img-loading');ie.classList.remove('fading');};
  pl.src=r.img;
  const hb=$('hotspots');hb.innerHTML='';
  r.hotspots.forEach(h=>{const d=document.createElement('div');d.className='hotspot'+(flag(h.id+'_found')?' found':'');d.style.left=h.x+'%';d.style.top=h.y+'%';d.style.width=h.w+'%';d.style.height=h.h+'%';d.innerHTML=`<span class="hs-label">${h.label}</span>`;d.onclick=()=>{Hotspot.activate(h);};hb.appendChild(d);});
  const nb=$('nav');nb.innerHTML='';
  r.nav.forEach(n=>{const b=document.createElement('button');b.className='navbtn'+(n.locked&&!flag(n.need)?' locked':'');b.textContent=n.label;b.onclick=()=>{if(n.locked&&!flag(n.need)){if(n.need==='cargoOpen'&&has(ITEMS.key_code)){flag('cargoOpen',true);msgFade('你输入密码6604，货舱门打开了。','good');renderRoom();return;}if(n.need==='brakeOpen'&&has(ITEMS.key_code)){flag('brakeOpen',true);msgFade('制动密码验证通过。通往尾部车厢的门开了。','good');renderRoom();return;}msgFade(n.lockMsg||'此路不通。','warn');shakeRoom();return;}S.room=n.to;saveGame();renderRoom();window.scrollTo({top:0,behavior:'smooth'});};nb.appendChild(b);});
  saveGame();
}
const Modal={open(h){$('modal-box').innerHTML='<button class="close-x" id="modal-close">×</button>'+h;$('modal-bg').classList.add('show');document.getElementById('modal-close').onclick=()=>this.close();},close(){$('modal-bg').classList.remove('show');}};
$('modal-bg').addEventListener('click',e=>{if(e.target===$('modal-bg'))Modal.close();});
$('btn-notes').onclick=()=>{let h='<h2>电报记录</h2>';if(S.notes.length===0){h+='<p style="text-align:center;color:var(--muted);padding:30px;">尚未发现任何电报记录。<br>探索列车，寻找遗留的信息……</p>';}else{h+=`<p style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:16px;font-family:var(--mono);">已收集 ${S.notes.length} / 3 条</p>`;S.notes.forEach(id=>{const n=NOTES[id];h+=`<div class="note"><strong style="color:var(--accent);">${n.title}</strong>\n\n${n.text}</div>`;});}Modal.open(h);};
$('btn-intro').onclick=()=>{Modal.open(`<h2>生存指南</h2><div class="note">${BRIEF}</div>`);};
const Hotspot={
  activate(h){const fn=h.action;if(Hotspot[fn])Hotspot[fn](h);},
  cbBag(h){
    if(has(ITEMS.med_kit)){msg('背包已经被翻过了。里面只有一个空水壶。');return;}
    msgFade('你在求生背包里找到了一个急救包和一张手绘地图。\n地图显示列车前方就是「尽头部」避难所。','good');addInv(ITEMS.med_kit);addNote('n1');h_found(h);
  },
  cbDoor(h){
    msg('门上贴的手绘地图显示：\n客舱 → 引擎室 → 货舱 → 车顶 → 尾部车厢\n\n前方就是尽头部避难所。需要紧急制动才能停车。');
  },
  cbAxe(h){
    if(has(ITEMS.axe)){msg('应急斧已被你取走。玻璃碎了一地。');return;}
    msgFade('你打破玻璃，取出了应急消防斧。\n它可以撬开锁住的门或箱子。','good');addInv(ITEMS.axe);h_found(h);
  },
  enEngine(h){
    if(flag('engine_fixed')){msg('引擎运转正常。金属摩擦声消失了。');return;}
    if(!has(ITEMS.fuse)){msgFade('引擎发出金属摩擦的杂音。主保险丝烧断了。\n你需要一根备用保险丝来修复引擎。','warn');return;}
    if(!has(ITEMS.wrench)){msgFade('保险丝盒的螺丝太紧。你需要一把管钳来打开。','warn');return;}
    flag('engine_fixed',true);removeInv(ITEMS.fuse);
    S.health=Math.min(100,S.health+20);updateStatus();
    msgFade('你用管钳打开保险丝盒，换上了备用保险丝。\n引擎的杂音消失了！列车运转恢复正常。','good');h_found(h);
  },
  enPanel(h){
    if(has(ITEMS.key_code)){msg('控制台上的日志本已被你取走。');return;}
    if(flag('log_chain_seen')){
      msgFade('你再次查看控制台。日志本还锁在这里——\n你用斧子砸开了锁链！日志本上记着制动密码。','good');addNote('n2');addInv(ITEMS.key_code);h_found(h);return;
    }
    flag('log_chain_seen',true);
    msgFade('控制台上有一本日志本，用铁链锁着。\n日志本上似乎记着重要信息——制动密码？\n但铁链太结实了，你需要某种工具来弄断它。','warn');h_found(h);
  },
  enFuel(h){
    if(has(ITEMS.fuel_can)){msg('油桶已被你拿走了。');return;}
    msgFade('你提起角落里的红色油桶——还有半桶柴油！\n可以用来给引擎补充燃料。','good');addInv(ITEMS.fuel_can);h_found(h);
  },
  cgCrates(h){
    if(flag('cg_crates_searched')){msg('物资箱已经翻过了。只剩几个空罐头。');return;}
    flag('cg_crates_searched',true);
    S.fuel=Math.min(100,S.fuel+20);
    msgFade('你在物资箱里找到了罐头食品和燃油。\n燃料+20%。','good');updateStatus();h_found(h);
  },
  cgLocker(h){
    if(has(ITEMS.fuse)){msg('武器柜已经空了。里面只有一根保险丝——已被你取走。');return;}
    if(!has(ITEMS.axe)){msgFade('武器柜上了密码锁。你试试用斧子撬开——锁太结实了。\n也许需要先知道密码？','warn');return;}
    Modal.open(`<h2>武器柜</h2><p>武器柜上有密码锁。输入4位密码：</p><div class="puzzle-row"><input id="p-input" maxlength="4" placeholder="????"><button id="p-ok">开锁</button></div><p class="puzzle-hint">提示：密码是车轮数，已用摩斯码编码。用解码器破解。📁 ARG提示：检查页面源代码(Ctrl+U)中的注释。</p>`);
    $('p-ok').onclick=()=>{const v=$('p-input').value.trim();if(v==='6604'){flag('cg_locker_opened',true);Modal.close();msgFade('柜子打开了！里面有一根备用保险丝。','good');addInv(ITEMS.fuse);h_found(h);}else{msgFade('密码错误。','danger');$('p-input').value='';}};
    $('p-input').focus();$('p-input').onkeydown=e=>{if(e.key==='Enter')$('p-ok').onclick();};
  },
  cgBench(h){
    if(has(ITEMS.radio)){msg('工作台上的电台已被你取走。焊枪和工具还在。');return;}
    if(has(ITEMS.wrench)){msgFade('你在工作台上找到了一台便携式电台发射器。\n它可以在车顶用来联系避难所。','good');addInv(ITEMS.radio);h_found(h);return;}
    msgFade('工作台上有焊枪、工具和一台电台发射器。\n你在工具堆里找到了一把管钳！\n电台也可以拿走——也许能联系避难所。','good');addInv(ITEMS.wrench);addInv(ITEMS.radio);h_found(h);
  },
  rfDish(h){
    if(flag('dish_repaired')){msg('卫星天线已修复。可以用来增强电台信号。');return;}
    if(!has(ITEMS.wrench)){msgFade('卫星天线损坏了，几根天线杆弯了。需要工具来修复。','warn');return;}
    flag('dish_repaired',true);
    msgFade('你用管钳将弯曲的天线杆掰直。卫星天线修复了！\n现在可以用电台联系避难所了。','good');h_found(h);
  },
  rfBox(h){
    if(has(ITEMS.flare)){msg('储物箱已空。信号枪已被你取走。');return;}
    msgFade('你在储物箱里找到了一把信号枪！\n里面还有最后一发信号弹。在紧急时刻可以发出求救信号。','good');addInv(ITEMS.flare);h_found(h);
  },
  rfLadder(h){
    msg('梯子通向尾部车厢。但通道的门锁住了——需要制动密码。\n你从车顶望向远方，尽头部避难所的轮廓越来越清晰。');
  },
  coBrake(h){
    if(flag('gameComplete')){msg('紧急制动已拉下。列车停在尽头部前。');return;}
    const sig=flag('signal_sent');
    const fixed=flag('engine_fixed');
    if(!fixed){msgFade('列车还在高速行驶！你拉不动制动轮——引擎太强了。\n需要先修复引擎。','warn');return;}
    Modal.open(`<h2>紧急制动</h2><p>你握住制动轮。前方就是尽头部避难所的大门。</p>${sig?'<p style="color:var(--success);">信号已发送——避难所大门正在打开。</p>':'<p style="color:var(--danger);">你还没有发送信号！避难所可能不会开门。</p>'}<p>拉下紧急制动，列车将在避难所前停下。</p><div style="display:flex;gap:12px;justify-content:center;margin-top:14px;"><button class="act" id="brake-go">拉下制动</button><button class="act" id="brake-cancel" style="opacity:.6;">再等等</button></div>`);
    $('brake-go').onclick=()=>{Modal.close();Game.ending(sig?'true':'bad');};
    $('brake-cancel').onclick=()=>Modal.close();
  },
  coAid(h){
    if(flag('co_aid_used')){msg('急救站的物资已经被你拿走了。');return;}
    flag('co_aid_used',true);
    S.health=Math.min(100,S.health+30);
    msgFade('你在急救站找到了医疗用品。健康+30%。','good');updateStatus();h_found(h);
  },
  coWindow(h){
    msg('后窗外的铁轨向沙漠延伸。用望远镜看前方——\n尽头部避难所的大门清晰可见。大门上方有武器系统。\n如果没有收到信号，他们会击毁接近的列车。');
    // Check if player can send signal from here if they have radio and dish is repaired
    if(has(ITEMS.radio)&&flag('dish_repaired')&&!flag('signal_sent')){
      Modal.open(`<h2>发送信号</h2><p>你有电台发射器，卫星天线也已修复。</p><p>从尾部车厢可以看到尽头部避难所。现在可以发送信号！</p><div style="text-align:center;margin-top:14px;"><button class="act" id="send-signal">发送求救信号</button></div>`);
      $('send-signal').onclick=()=>{flag('signal_sent',true);S.signal=1;Modal.close();msgFade('信号已发送！频率7.5MHz。\n远处避难所的大门开始缓缓打开……','good');updateStatus();};
    }
  }
};
function Game(){}
Game.ending=function(type){
  flag('gameComplete',true);clearSave();Modal.close();
  if(window.ARG)ARG.saveFragment('WE','WASTE');
  if(type==='true'){shakeRoom();setTimeout(()=>{Modal.open(`<h2 class="ending-good">· 到 站 ·</h2><p>你拉下紧急制动。列车发出刺耳的摩擦声，在避难所大门前缓缓停下。</p><p>大门已经打开——你之前发送的信号起了作用。</p><p>你跳下车，脚踏在坚实的混凝土地面上。避难所里有人跑出来迎接你。</p><p>「终于有人活着到了。」他们说着，递给你一瓶水。</p><p>你回头看了一眼身后的列车——它穿越了整个废土，带你抵达了终点。</p><p>这是末日之后的新开始。</p><p style="color:var(--success);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 尽头站 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">电报：${S.notes.length} / 3 · 引擎已修复 · 信号已发送</p><p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 WASTE 已回收 · 档案 #WE-6604 已归档</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else if(type==='bad'){setTimeout(()=>{Modal.open(`<h2 class="ending-bad">· 击 毁 ·</h2><p>你拉下制动，列车在避难所前停下。</p><p>但大门没有打开——你没有发送信号。</p><p>避难所的自动武器系统锁定了列车……</p><p>「轰——！」</p><p>列车在爆炸中化为火球。你永远到不了终点了。</p><p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 灰飞烟灭 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">提示：在车顶修复天线后，用电台发送信号。或在尾部车厢用望远镜发送。</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
};
Game.showIntro=function(){
  const sv=!!localStorage.getItem(SAVE_KEY);let cb='';if(sv){cb='<button class="act" id="ic" style="margin-right:12px;">继 续 调 查</button>';}
  Modal.open(`<h2>方 舟 协 议</h2>
    <div class="arg-intro-banner">
      <div class="arg-classified">机密 · 已解密 · 档案编号 WE-6604</div>
      <div class="arg-title">末日列车方舟协议调查卷宗</div>
      <div class="arg-note">本档案包含编码信息。使用解码器破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--accent);letter-spacing:3px;font-size:13px;font-family:var(--mono);">WASTELAND EXPRESS</p>
    <p style="margin-top:16px;">你是废土搜救队的信号分析员。截获了来自末日列车“方舟号”的无线电电报后，你开始还原这段求生记录。</p>
    <p>列车穿越废土沙漠驶向避难所，但制动密码已被编码为摩斯码。你需要使用解码器破解电报中的密文。</p>
    <p style="color:var(--warn);text-align:center;font-style:italic;margin-top:14px;">「沙漠不会等你。」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">${cb}<button class="act" id="is">开 启 调 查</button></div>`);
  if(sv){$('ic').onclick=()=>{loadGame();Modal.close();renderInv();updateStatus();renderRoom();};}
  $('is').onclick=()=>{clearSave();S.room='cabin';S.inv=[];S.notes=[];S.flags={};S.fuel=40;S.health=80;S.signal=0;Modal.close();renderInv();updateStatus();renderRoom();setTimeout(()=>$('btn-intro').onclick(),400);};
};
renderInv();updateStatus();renderRoom();Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if(window.ARG){
  ARG.plantClues([
    {type:'console',gameId:'WE',text:'[系统] 档案 WE-6604 已加载。制动密码已用摩斯码编码。'},
    {type:'console',gameId:'WE',encoded:'-.... -.... ----- ....-',cipherType:'摩斯码',hint:'制动密码（4位数字）'},
    {type:'console',gameId:'WE',encoded:'U2lnbmFsOiA3LjVNSHo=',cipherType:'Base64',hint:'避难所信号频率（解码后查看）'},
    {type:'console',gameId:'WE',text:'[通讯] 列车长日志: 无线电频率 7.5MHz · 避难所代号"尽头部"'},
    {type:'console',gameId:'WE',text:'[关联] 列车经过的"时间断层区"与档案 #TI-1145 时光客栈的循环节点坐标重合。'},
    {type:'console',gameId:'WE',text:'[坐标] 列车位置: 41.8781°N 87.6298°E — 原芝加哥中央枢纽'},
    {type:'console',gameId:'WE',encoded:'VHJhaW4gIzY2MDQgLSBwYXNzZW5nZXJzIG5ldmVyIGRlcGFydGVkIC0gdGhleSBhcmUgc3RpbGwgb24gYm9hcmQ=',cipherType:'Base64',hint:'列车异常报告（关键线索）'},
  ]);
}
