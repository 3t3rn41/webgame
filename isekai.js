/* ============================================================
   异世界学园 · Isekai Academy
   Anime-style school mystery with magical elements.
   ============================================================ */
const S={room:'classroom',inv:[],memories:[],flags:{},msgTimer:null,mana:100,clues:0};
const ITEMS={letter:'神秘信件',orb:'水晶球',key:'旧钥匙',tome:'魔法书',photo:'合照照片',badge:'学生证'};
const MEMORIES={
  m1:{title:'记忆碎片 · 一',text:'……转学第一天。\n你站在校门口，看到一个少女从教学楼顶楼跳下——\n但当你冲过去时，地面上什么也没有。她消失了。\n同学们说：「这里每年都有一个转学生消失。」'},
  m2:{title:'记忆碎片 · 二',text:'……图书馆深处有一本魔法书。\n上面记载着「星之门」的仪式：\n当五颗记忆碎片汇聚，星之门就会打开。\n\n消失的学生们并没有死——他们被传送到了另一个世界。\n但如果没有回来的方法，他们就永远困在那里了。'},
  m3:{title:'记忆碎片 · 三',text:'……社团教室的布告栏上，失踪学生的照片用红线连在一起。\n所有失踪者都在同一天转学——十月十五日。\n所有失踪者都在子时（23:00）出现在天台。\n所有失踪者都曾收到一封没有署名的信。'},
  m4:{title:'记忆碎片 · 四',text:'……校长办公室的画像后面有一个保险箱。\n保险箱里是学校的建校档案——\n这所学校建在一个灵脉节点上。\n每年来一个转学生，是为了维持灵脉的平衡。\n\n但你不一样。你是被选中的「归 还 者」。'},
  m5:{title:'记忆碎片 · 五',text:'……你终于记起了一切。\n你也是消失的学生之一——来自三年前。\n你被送回了三年后的现在，以转学生的身份回来。\n\n你的任务是打开星之门，让所有消失的学生回归。\n水晶球+魔法书+旧钥匙=星之门的钥匙。\n在天台使用它，就能打开门。'},
};
const BRIEF=`转学手册：

    你是星岚学园的新转学生。
    
    这所学校的传闻——每年都有一个转学生在十月十五日消失。
    
    你发现：
    · 教室的课桌上有给你的信
    · 图书馆深处藏着魔法书
    · 天台有某种仪式的痕迹
    · 神秘社团在调查失踪事件
    · 校长办公室藏有真相

    收集5块记忆碎片，找回消失的学生们。
    
    注意：灵力是有限的资源，合理使用。`;
const ROOMS={
  classroom:{name:'教室 · CLASSROOM',img:'images/anime_classroom.jpg',
    desc:'夕阳透过窗户洒进教室，将一切都染成橙红色。课桌上散落着课本，窗外的樱花瓣随风飘入。\n\n你的课桌上放着一封没有署名的信。讲台上有一颗微微发光的水晶球。窗边的课桌似乎有人刚刚坐过——椅子还是温的。',
    nav:[{to:'library',label:'→ 前往图书馆'},{to:'club',label:'→ 去社团教室',locked:true,lockMsg:'社团教室的门锁着。需要学生证。',need:'clubOpen'}],
    hotspots:[{id:'cr_desk',x:20,y:25,w:45,h:50,label:'课桌',action:'crDesk'},{id:'cr_teacher',x:0,y:20,w:18,h:45,label:'讲台',action:'crTeacher'},{id:'cr_window',x:72,y:15,w:23,h:50,label:'窗户',action:'crWindow'}]},
  library:{name:'图书馆 · LIBRARY',img:'images/anime_library.jpg',
    desc:'图书馆的书架高耸入云，空气中弥漫着旧书的气味。中央的大阅读桌上放着几本发光的书。左侧的书架上有一本书发出蓝色的光芒。右侧的彩绘玻璃窗上描绘着一个魔法符号，月光透过玻璃洒在地板上。',
    nav:[{to:'classroom',label:'← 返回教室'},{to:'rooftop',label:'→ 上天台',locked:true,lockMsg:'通往天台的门锁着。需要旧钥匙。',need:'roofOpen'}],
    hotspots:[{id:'lib_table',x:20,y:20,w:45,h:55,label:'阅读桌',action:'libTable'},{id:'lib_shelf',x:0,y:10,w:18,h:60,label:'发光书架',action:'libShelf'},{id:'lib_window',x:72,y:20,w:23,h:45,label:'彩绘玻璃窗',action:'libWindow'}]},
  rooftop:{name:'天台 · ROOFTOP',img:'images/anime_rooftop.jpg',
    desc:'天台上风很大，夜空中繁星点点。铁丝网围栏上挂着一把锁。天台中央有一个小祭坛，上面插着蜡烛。左侧的水塔上有一个隐藏的隔间。右侧的星空中，有一个星座在发出微弱的光芒。',
    nav:[{to:'library',label:'← 返回图书馆'}],
    hotspots:[{id:'rf_fence',x:25,y:30,w:40,h:45,label:'围栏',action:'rfFence'},{id:'rf_altar',x:20,y:25,w:45,h:50,label:'祭坛',action:'rfAltar'},{id:'rf_tower',x:0,y:15,w:20,h:50,label:'水塔',action:'rfTower'}]},
  club:{name:'社团教室 · CLUB ROOM',img:'images/anime_club.jpg',
    desc:'社团教室充满了神秘的氛围。圆桌上放着占卜板、塔罗牌和水晶球。左侧的储物柜里有药水和密封的盒子。右侧的布告栏上贴着失踪学生的照片，用红线连在一起。',
    nav:[{to:'classroom',label:'← 返回教室'},{to:'office',label:'→ 校长办公室',locked:true,lockMsg:'校长办公室的门锁着。需要旧钥匙。',need:'officeOpen'}],
    hotspots:[{id:'cl_table',x:20,y:25,w:45,h:50,label:'圆桌',action:'clTable'},{id:'cl_cabinet',x:0,y:20,w:18,h:45,label:'储物柜',action:'clCabinet'},{id:'cl_board',x:70,y:20,w:25,h:45,label:'布告栏',action:'clBoard'}]},
  office:{name:'校长办公室 · PRINCIPAL OFFICE',img:'images/anime_office.jpg',
    desc:'校长办公室气派非凡。大办公桌上放着一面传送门镜和一本古书。左侧的高大的落地钟停在11:45，发出微弱的光。右侧的墙上挂着一幅学校创始人的画像。',
    nav:[{to:'club',label:'← 返回社团教室'}],
    hotspots:[{id:'of_desk',x:25,y:25,w:40,h:50,label:'办公桌',action:'ofDesk'},{id:'of_clock',x:0,y:15,w:20,h:50,label:'落地钟',action:'ofClock'},{id:'of_painting',x:70,y:20,w:25,h:45,label:'画像',action:'ofPainting'}]}
};
const $=id=>document.getElementById(id);
function msg(t,c){const e=$('msg');e.textContent=t;e.className=c||'';if(S.msgTimer)clearTimeout(S.msgTimer);}
function msgFade(t,c,d=3500){msg(t,c);S.msgTimer=setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent='';},d);}
function has(i){return S.inv.includes(i);}
function addInv(i){if(!has(i)){S.inv.push(i);renderInv();saveGame();return true;}return false;}
function removeInv(i){const j=S.inv.indexOf(i);if(j>=0){S.inv.splice(j,1);renderInv();saveGame();}}
function flag(k,v){if(v!==undefined){S.flags[k]=v;saveGame();}return S.flags[k];}
function hasMemory(id){return S.memories.includes(id);}
function addMemory(id){if(!hasMemory(id)){S.memories.push(id);S.clues++;updateStatus();saveGame();return true;}return false;}
function shakeRoom(){const r=$('room-img-wrap');r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');}
function h_found(h){flag(h.id+'_found',true);}
const SAVE_KEY='isekaiAcademy_save';
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({room:S.room,inv:S.inv,memories:S.memories,flags:S.flags,mana:S.mana}));}catch(e){}}
function loadGame(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return false;const d=JSON.parse(r);S.room=d.room||'classroom';S.inv=d.inv||[];S.memories=d.memories||[];S.flags=d.flags||{};S.mana=d.mana||100;S.clues=S.memories.length;return true;}catch(e){return false;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function renderInv(){const b=$('inv-items');if(S.inv.length===0){b.innerHTML='<span class="inv-empty">空</span>';return;}b.innerHTML=S.inv.map((it,i)=>`<span class="inv-item" data-idx="${i}">${it}</span>`).join('');b.querySelectorAll('.inv-item').forEach(e=>{e.onclick=()=>useInvItem(S.inv[parseInt(e.dataset.idx)]);});}
function useInvItem(item){
  if(item===ITEMS.letter)msg('一封没有署名的信。上面写着：「十月十五日子时，到天台来。带上水晶球。」');
  else if(item===ITEMS.orb)msg('一颗微微发光的水晶球。能感知灵力波动。\n它是打开星之门的关键道具之一。');
  else if(item===ITEMS.key)msg('一把旧钥匙。上面刻着「天台」和「校长室」。\n可以打开这两扇门。');
  else if(item===ITEMS.tome)msg('一本古老的魔法书。记载着「星之门」仪式：\n水晶球+魔法书+旧钥匙=星之门的钥匙。\n在天台使用即可打开门。');
  else if(item===ITEMS.photo)msg('一张合照，上面有五个人——但其中三个人的脸模糊不清。\n背面写着：「星岚学园·超自然研究社·2019年」');
  else if(item===ITEMS.badge)msg('一张学生证。名字栏写着「星岚超研社」。\n可以打开社团教室的门。');
  else msg(item);
}
function updateStatus(){
  $('mana-val').textContent=S.mana;
  $('clue-val').textContent=S.clues;
  if(S.mana<30)$('mana-val').style.color='var(--danger)';else if(S.mana<60)$('mana-val').style.color='var(--warn)';else $('mana-val').style.color='';
}
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
  r.nav.forEach(n=>{const b=document.createElement('button');b.className='navbtn'+(n.locked&&!flag(n.need)?' locked':'');b.textContent=n.label;b.onclick=()=>{if(n.locked&&!flag(n.need)){if(n.need==='clubOpen'&&has(ITEMS.badge)){flag('clubOpen',true);msgFade('你用学生证打开了社团教室的门。','good');renderRoom();return;}if(n.need==='roofOpen'&&has(ITEMS.key)){flag('roofOpen',true);msgFade('你用旧钥匙打开了天台的门。','good');renderRoom();return;}if(n.need==='officeOpen'&&has(ITEMS.key)){flag('officeOpen',true);msgFade('你用旧钥匙打开了校长办公室。','good');renderRoom();return;}msgFade(n.lockMsg||'此路不通。','warn');shakeRoom();return;}S.room=n.to;saveGame();renderRoom();window.scrollTo({top:0,behavior:'smooth'});};nb.appendChild(b);});
  // Add ritual button on rooftop if has all items
  if(S.room==='rooftop'&&has(ITEMS.orb)&&has(ITEMS.tome)&&has(ITEMS.key)){
    const rb=document.createElement('button');rb.className='navbtn';rb.style.borderColor='var(--accent)';rb.style.color='var(--accent)';rb.textContent='🔮 用三件圣物打开星之门';
    rb.onclick=()=>Game.tryRitual();nb.appendChild(rb);
  }
  saveGame();
}
const Modal={open(h){$('modal-box').innerHTML='<button class="close-x" id="modal-close">×</button>'+h;$('modal-bg').classList.add('show');document.getElementById('modal-close').onclick=()=>this.close();},close(){$('modal-bg').classList.remove('show');}};
$('modal-bg').addEventListener('click',e=>{if(e.target===$('modal-bg'))Modal.close();});
$('btn-memory').onclick=()=>{let h='<h2>记忆碎片</h2>';if(S.memories.length===0){h+='<p style="text-align:center;color:var(--muted);padding:30px;">尚未获得任何记忆碎片。<br>探索学园，找回丢失的记忆……</p>';}else{h+=`<p style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:16px;">已收集 ${S.memories.length} / 5 块</p>`;S.memories.forEach(id=>{const m=MEMORIES[id];h+=`<div class="anime-box"><strong style="color:var(--accent);">${m.title}</strong>\n\n${m.text}</div>`;});}Modal.open(h);};
$('btn-intro').onclick=()=>{Modal.open(`<h2>转学手册</h2><div class="anime-box">${BRIEF}</div>`);};
const Hotspot={
  activate(h){const fn=h.action;if(Hotspot[fn])Hotspot[fn](h);},
  crDesk(h){
    if(has(ITEMS.letter)){msg('课桌上的信已经被你拿走了。');return;}
    msgFade('你在课桌上发现了一封没有署名的信——\n「十月十五日子时，到天台来。带上水晶球。」','good');addInv(ITEMS.letter);h_found(h);
  },
  crTeacher(h){
    if(has(ITEMS.orb)){msg('讲台上的水晶球已被你拿走。');return;}
    msgFade('讲台上有一颗微微发光的水晶球。你拿起了它——\n水晶球在你手中发出温暖的光芒，似乎在回应你的灵力。','good');addInv(ITEMS.orb);addMemory('m1');S.mana-=10;updateStatus();h_found(h);
  },
  crWindow(h){
    msg('窗外樱花飘落，夕阳将天空染成紫橙色。\n你看到教学楼的倒影中，天台上似乎有人影闪过……');
  },
  libTable(h){
    if(has(ITEMS.tome)){msg('桌上的魔法书已被你拿走。');return;}
    if(!has(ITEMS.orb)){msgFade('桌上有几本发光的书，但你需要水晶球才能阅读它们。\n水晶球是解读魔法文字的钥匙。','warn');return;}
    msgFade('你用水晶球照亮魔法书——文字开始跳动，变得可读了！\n你获得了一本记载「星之门」仪式的魔法书。','good');addInv(ITEMS.tome);addMemory('m2');S.mana-=10;updateStatus();h_found(h);
  },
  libShelf(h){
    if(has(ITEMS.key)){msg('发光的书已经被你取走了。里面藏着钥匙。');return;}
    msgFade('你从发光的书架中取出一本书——\n书是空心的！里面藏着一把旧钥匙。\n钥匙上刻着「天台」和「校长室」。','good');addInv(ITEMS.key);h_found(h);
  },
  libWindow(h){
    msg('彩绘玻璃窗上描绘着一个魔法符号——五角星内有一个传送门。\n月光透过玻璃洒在地板上，形成光斑。\n光斑指向图书馆深处——那里藏着魔法书。');
  },
  rfFence(h){
    msg('铁丝网围栏上的锁已经被你的钥匙打开了。\n从这里可以看到整个校园——以及下方操场上的倒影中，那些模糊的人影。');
  },
  rfAltar(h){
    if(flag('ritual_done')){msg('祭坛上的蜡烛已经熄灭。星之门已关闭。');return;}
    msg('天台中央的小祭坛。蜡烛已经燃尽，上面有某种仪式的痕迹。\n这里就是打开星之门的地方。');
  },
  rfTower(h){
    if(hasMemory('m3')){msg('水塔的隔间已经空了。记忆碎片已被你获取。');return;}
    msgFade('你在水塔的隐藏隔间里找到了一块记忆碎片！\n碎片中闪过画面——失踪的学生们都在子时出现在天台。','good');addMemory('m3');S.mana-=10;updateStatus();h_found(h);
  },
  clTable(h){
    if(has(ITEMS.badge)){msg('圆桌上的学生证已被你拿走。');return;}
    msgFade('圆桌上的占卜板旁边，有一张学生证——\n上面写着「星岚超研社」。\n这张学生证可以打开社团教室的门。','good');addInv(ITEMS.badge);h_found(h);
  },
  clCabinet(h){
    if(hasMemory('m4')){msg('储物柜里已经没有更多线索了。');return;}
    msgFade('你在储物柜的密封盒子里找到了一块记忆碎片！\n碎片中闪过画面——学校建在灵脉节点上，转学生是维持平衡的祭品。','good');addMemory('m4');S.mana-=10;updateStatus();h_found(h);
  },
  clBoard(h){
    if(has(ITEMS.photo)){msg('布告栏上的合照已被你取下。');return;}
    msgFade('布告栏上失踪学生的照片用红线连在一起。\n你取下了一张合照——上面有五个人，三个人的脸模糊不清。\n背面写着「星岚学园·超自然研究社·2019年」','good');addInv(ITEMS.photo);h_found(h);
  },
  ofDesk(h){
    if(hasMemory('m5')){msg('办公桌上的真相已被你揭示。');return;}
    if(!has(ITEMS.tome)){msgFade('办公桌上有一面传送门镜和一本古书。\n但你需要魔法书才能解读古书中的内容。','warn');return;}
    msgFade('你用魔法书解读办公桌上的古书——\n最后一块记忆碎片涌入脑海！\n你是三年前消失的学生，被送回来打开星之门。','good');addMemory('m5');S.mana-=10;updateStatus();h_found(h);
  },
  ofClock(h){
    msg('高大的落地钟停在11:45。\n这正好是子时前的十五分钟——仪式开始的时间。\n钟面上刻着一行小字：「星之门开于子时，闭于子末。」');
  },
  ofPainting(h){
    msg('学校创始人的画像后面有一个保险箱——\n但保险箱需要密码。密码与建校年份有关。\n画像右下角写着：「星岚学园，公元一九二〇年建。」');
  }
};
function Game(){}
Game.tryRitual=function(){
  const allMem=S.memories.length>=5;
  Modal.open(`<h2>星之门仪式</h2><p>你站在天台的祭坛前，手中握着水晶球、魔法书和旧钥匙。</p>${allMem?'<p style="color:var(--accent);">五块记忆碎片全部找回。你记起了一切——你是三年前的失踪学生。</p>':'<p style="color:var(--warn);">你还没有找回所有记忆碎片。仪式可能不完全。</p>'}<p>将三件圣物合在一起，打开星之门——</p><div style="display:flex;gap:12px;justify-content:center;margin-top:14px;"><button class="act" id="ritual-go">打开星之门</button><button class="act" id="ritual-cancel" style="opacity:.6;">再等等</button></div>`);
  $('ritual-go').onclick=()=>{Modal.close();Game.ending(allMem?'true':'bad');};
  $('ritual-cancel').onclick=()=>Modal.close();
};
Game.ending=function(type){
  flag('gameComplete',true);clearSave();Modal.close();
  if (window.ARG) ARG.saveFragment('IA', 'ISEK');
  if(type==='true'){shakeRoom();setTimeout(()=>{Modal.open(`<h2 class="ending-good">· 星 之 门 ·</h2><p>三件圣物在祭坛上合为一体——一道光柱冲向天空！</p><p>星之门在夜空中打开了。你看到了另一个世界——那里有草地、河流和阳光。</p><p>模糊的人影从门中走出——一个、两个、三个……所有消失的学生都回来了。</p><p>你看到了三年前的自己。那个你微笑着说：「谢谢你替我完成了任务。现在，该回家了。」</p><p>你感到自己的身体在变轻，记忆在回流。你不再只是「归还者」——你终于完整了。</p><p style="color:var(--accent);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 归 还 之 日 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">记忆碎片：${S.memories.length} / 5 · 灵力：${S.mana}</p><p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 ISEK 已回收 · 档案 #IA-1920 已归档</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else{setTimeout(()=>{Modal.open(`<h2 class="ending-bad">· 未 完 之 门 ·</h2><p>三件圣物在祭坛上合为一体，但星之门只是微微开启了一条缝——</p><p>你没有找回所有记忆碎片。仪式不完整。</p><p>门缝中传来了呼喊声——那些被困的学生在呼唤你。但你无法打开门。</p><p>你成为了第六个消失的转学生。</p><p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 门 之 外 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">提示：收集全部5块记忆碎片后再进行仪式。</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
};
Game.showIntro=function(){
  const sv=!!localStorage.getItem(SAVE_KEY);let cb='';if(sv){cb='<button class="act" id="ic" style="margin-right:12px;">继 续 调 查</button>';}
  Modal.open(`<h2>星岚学园档案</h2>
    <div class="bpp-intro-banner">
      <div class="bpp-classified">机密 · 已解密 · 档案编号 IA-1920</div>
      <div class="bpp-title">星岚学园转学生消失事件</div>
      <div class="bpp-subtitle">异常等级: B · 调查员: [待分配]</div>
      <div class="bpp-note">本档案包含编码信息。使用<span class="bpp-highlight">解码器</span>破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--cyan);letter-spacing:3px;font-size:13px;font-family:monospace;">ISEKAI ACADEMY · 转学生物语</p>
    <p style="margin-top:16px;">你是异常现象调查局的调查员。档案 #IA-1920 记录了一起校园异常：星岚学园每年有一名转学生在十月十五日消失。</p><p>你调阅此档案，意识被投射进学园——你成为了新的转学生。教室里给你留了信，图书馆藏着魔法书，天台有仪式的痕迹。</p><p>你必须收集5块记忆碎片，打开星之门，找回消失的学生——也许你自己就是其中之一。</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">${cb}<button class="act" id="is">调 入 档 案</button></div>`);
  if(sv){$('ic').onclick=()=>{loadGame();Modal.close();renderInv();updateStatus();renderRoom();};}
  $('is').onclick=()=>{clearSave();S.room='classroom';S.inv=[];S.memories=[];S.flags={};S.mana=100;S.clues=0;Modal.close();renderInv();updateStatus();renderRoom();setTimeout(()=>$('btn-intro').onclick(),400);};
};
renderInv();updateStatus();renderRoom();Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if (window.ARG) {
  ARG.plantClues([
    { type:'console', gameId:'IA', text:'[系统] 档案 IA-1920 已加载。建校密码已用 Base64 编码。' },
    { type:'console', gameId:'IA', encoded:'MTkyMA==', cipherType:'Base64', hint:'建校年份（4位数字）' },
    { type:'console', gameId:'IA', encoded:'S2V5OiBPZmZpY2U=', cipherType:'Base64', hint:'关键钥匙位置（解码后查看）' },
    { type:'console', gameId:'IA', text:'[通讯] 学园最后联系: +81 3-3261-XXXX · 文京区教育委员会' },
    { type:'console', gameId:'IA', text:'[关联] 灵力频率读数与档案 #SD-4372 HELIOS-7 AI信号频谱高度吻合。' },
    { type:'console', gameId:'IA', text:'[坐标] 学园位置: 35.6762°N 139.6503°E — 原东京文京区' },
    { type:'console', gameId:'IA', encoded:'VGhlIGFjYWRlbXkgaXMgYSB3YXRjaCBwb2ludCAtIGV2ZXJ5IHN0dWRlbnQgd2hvIHZhbmNoZXMgYmVjb21lcyBhbiBhbmNob3I=', cipherType:'Base64', hint:'学园真相（关键剧情线索）' },
  ]);
}
