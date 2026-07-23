/* ============================================================
   时光客栈 · Time Inn
   A time-loop mystery in an ancient Chinese inn.
   ============================================================ */
const S={room:'lobby',inv:[],clues:[],flags:{},msgTimer:null,loop:1};
const ITEMS={ink_brush:'墨笔',key_bronze:'铜钥匙',mirror:'铜镜',talisman:'镇魂符',herb:'药草',hourglass:'沙漏'};
const CLUES={
  c1:{title:'线索 · 客簿残页',text:'客簿上记载：\n「八月十五，子时三刻，有客投宿。\n客名：无名。\n来路：不详。\n去路：——」\n\n去路一栏是空白的。仿佛这个人从未离开过。'},
  c2:{title:'线索 · 厨房药渣',text:'你在灶台边发现了药渣。辨认后确认——\n这是「迷魂散」的残渣。\n\n有人在食物中下了迷魂药。\n每次循环中，你都是在晚餐后昏迷的……'},
  c3:{title:'线索 · 井中倒影',text:'你探头看向井中——\n井水倒映的不是你的脸，而是一个陌生人的面容。\n\n你突然想起了一切：你不是投宿的客人。\n你就是这个客栈的主人。你已经死了。'},
  c4:{title:'线索 · 地窖日记',text:'地窖桌上的日记写着：\n\n「这是我第99次经历这一天。\n每次到了子时三刻，一切重来。\n\n我发现了一个规律：客栈里有一座黄铜机械装置。\n它就是时间循环的源头。\n\n要打破循环，需要在子时三刻——\n将沙漏倒置，同时用铜镜照向机械装置。\n这会逆转时间流，让循环终结。\n\n但如果我没有镇魂符保护，逆转的冲击会摧毁我的灵魂。」'},
};
const BRIEF=`客栈手记：

    你在一个古老的客栈中醒来。
    你不记得自己是怎么来到这里的。

    客栈里空无一人——但茶还是温的，
    床铺好像刚有人睡过，灶台上的水还在沸腾。

    你发现每到子时三刻（深夜11:45），
    一切都会重来。你回到了客栈大堂，
    一切恢复原状——除了你记得的记忆。

    你必须找出时间循环的真相，
    并在子时三刻打破循环。

    注意：每次循环中收集的物品都会保留，
    但房间状态会重置。利用记忆优势。`;
const ROOMS={
  lobby:{name:'客栈大堂',img:'images/inn_lobby.jpg',
    desc:'客栈大堂弥漫着檀香和旧木头的气味。柜台上的油灯摇曳着，将影子投在斑驳的墙壁上。\n\n柜台上的客簿翻开着，上面有墨迹未干的字迹。左边的楼梯通向二楼客房。右边的告示板上贴着通缉令，旁边的布谷钟指向戌时。\n\n大堂后方有一扇门通往厨房，侧门通向后院。',
    nav:[{to:'room',label:'→ 上楼进入客房'},{to:'kitchen',label:'→ 进入厨房'},{to:'courtyard',label:'→ 走向后院'}],
    hotspots:[{id:'lb_desk',x:25,y:20,w:40,h:55,label:'柜台客簿',action:'lbDesk'},{id:'lb_stairs',x:0,y:15,w:20,h:50,label:'楼梯',action:'lbStairs'},{id:'lb_clock',x:72,y:25,w:23,h:40,label:'布谷钟',action:'lbClock'}]},
  room:{name:'客房',img:'images/inn_room.jpg',
    desc:'客房不大，一张木床靠墙放着，旁边的小桌上有茶杯和一封未拆的信。左侧的衣柜半开着，里面有一面铜镜。\n\n窗户的木格透进月光。墙上的日历显示八月十五，某个日期被红笔圈了起来。',
    nav:[{to:'lobby',label:'← 返回大堂'},{to:'cellar',label:'→ 打开地板暗门，进入地窖',locked:true,lockMsg:'地板上有一个暗门，但被铜锁锁住了。',need:'cellarOpen'}],
    hotspots:[{id:'rm_bed',x:20,y:25,w:45,h:50,label:'木床',action:'rmBed'},{id:'rm_wardrobe',x:0,y:20,w:18,h:45,label:'衣柜',action:'rmWardrobe'},{id:'rm_window',x:70,y:20,w:25,h:45,label:'窗户和日历',action:'rmWindow'}]},
  kitchen:{name:'厨房',img:'images/inn_kitchen.jpg',
    desc:'厨房里热气腾腾，灶台上的火还在烧着。大锅里的水翻滚着，但没有人看火。左侧的水缸旁有调料架。右侧的砧板上插着一把菜刀，旁边有一坛酒。\n\n灶台边有一些药渣——不像是食物的残余。',
    nav:[{to:'lobby',label:'← 返回大堂'}],
    hotspots:[{id:'kt_stove',x:20,y:25,w:45,h:50,label:'灶台',action:'ktStove'},{id:'kt_water',x:0,y:25,w:18,h:40,label:'水缸',action:'ktWater'},{id:'kt_block',x:70,y:30,w:25,h:38,label:'砧板',action:'ktBlock'}]},
  courtyard:{name:'后院',img:'images/inn_courtyard.jpg',
    desc:'后院在月光下宁静而美丽。院中央有一口石井，井水映着月光。左侧的梅树开满了花，花瓣如雪般飘落。\n\n石桌上有两杯茶——一杯还冒着热气。仿佛刚才还有人坐在这里。',
    nav:[{to:'lobby',label:'← 返回大堂'}],
    hotspots:[{id:'cy_well',x:20,y:20,w:45,h:55,label:'石井',action:'cyWell'},{id:'cy_tree',x:0,y:15,w:20,h:50,label:'梅树',action:'cyTree'},{id:'cy_table',x:70,y:20,w:25,h:45,label:'石桌',action:'cyTable'}]},
  cellar:{name:'地窖',img:'images/inn_cellar.jpg',
    desc:'地窖在暗门的下方。空气中弥漫着陈年的酒香和灰尘。蜡烛发出微弱的光，照亮了中央的一张旧木桌。\n\n桌上有一个沙漏、一个由黄铜齿轮组成的奇怪机械装置，和一本翻开的日记。左侧的酒架上有一坛酒已经碎了。右侧墙上画着一幅壁画——同一个客栈在不同季节的样子，仿佛时间在重复。',
    nav:[{to:'room',label:'← 返回客房'}],
    hotspots:[{id:'cl_table',x:25,y:25,w:40,h:50,label:'木桌',action:'clTable'},{id:'cl_shelf',x:0,y:20,w:20,h:45,label:'酒架',action:'clShelf'},{id:'cl_mural',x:70,y:20,w:25,h:50,label:'壁画',action:'clMural'}]}
};
const $=id=>document.getElementById(id);
function msg(t,c){const e=$('msg');e.textContent=t;e.className=c||'';if(S.msgTimer)clearTimeout(S.msgTimer);}
function msgFade(t,c,d=3500){msg(t,c);S.msgTimer=setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent='';},d);}
function has(i){return S.inv.includes(i);}
function addInv(i){if(!has(i)){S.inv.push(i);renderInv();saveGame();return true;}return false;}
function removeInv(i){const j=S.inv.indexOf(i);if(j>=0){S.inv.splice(j,1);renderInv();saveGame();}}
function flag(k,v){if(v!==undefined){S.flags[k]=v;saveGame();}return S.flags[k];}
function hasClue(id){return S.clues.includes(id);}
function addClue(id){if(!hasClue(id)){S.clues.push(id);saveGame();return true;}return false;}
function shakeRoom(){const r=$('room-img-wrap');r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');}
function h_found(h){flag(h.id+'_found',true);}
const SAVE_KEY='timeInn_save';
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({room:S.room,inv:S.inv,clues:S.clues,flags:S.flags,loop:S.loop}));}catch(e){}}
function loadGame(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return false;const d=JSON.parse(r);S.room=d.room||'lobby';S.inv=d.inv||[];S.clues=d.clues||[];S.flags=d.flags||{};S.loop=d.loop||1;return true;}catch(e){return false;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function renderInv(){const b=$('inv-items');if(S.inv.length===0){b.innerHTML='<span class="inv-empty">空</span>';return;}b.innerHTML=S.inv.map((it,i)=>`<span class="inv-item" data-idx="${i}">${it}</span>`).join('');b.querySelectorAll('.inv-item').forEach(e=>{e.onclick=()=>useInvItem(S.inv[parseInt(e.dataset.idx)]);});}
function useInvItem(item){
  if(item===ITEMS.ink_brush)msg('一支墨笔。笔尖仍有墨香。也许可以在客簿上书写。');
  else if(item===ITEMS.key_bronze)msg('一把古旧的铜钥匙。也许能打开某个锁。');
  else if(item===ITEMS.mirror)msg('一面铜镜，背面刻着八卦纹。镜面微微泛着紫光。\n它似乎能照出事物的本质。');
  else if(item===ITEMS.talisman)msg('一张镇魂符，上面画着复杂的符箓。\n它能在时间逆转时保护你的灵魂不被撕裂。');
  else if(item===ITEMS.herb)msg('一束药草，散发着清苦的气味。可以解毒。');
  else if(item===ITEMS.hourglass)msg('一个精致的沙漏。里面的沙子向上流动——\n时间在这里是倒着走的。');
  else msg(item);
}
function updateLoop(){
  $('loop-num').textContent=S.loop;
  const times=['戌时','亥时','子时'];
  $('loop-time').textContent=times[Math.min(S.loop-1,2)]||'子时';
}
function triggerLoop(){
  S.loop++;
  S.room='lobby';
  // Reset room-specific flags but keep items and clues
  const keepFlags=['cellarOpen'];
  const newFlags={};
  keepFlags.forEach(k=>{if(S.flags[k])newFlags[k]=S.flags[k];});
  S.flags=newFlags;
  saveGame();updateLoop();renderRoom();
  Modal.open(`<h2>时 间 重 置</h2><p style="text-align:center;color:var(--accent);font-size:16px;letter-spacing:4px;">—— 第 ${S.loop} 次循环 ——</p><p>子时三刻到。一切重来。</p><p>客栈恢复原状。但你的记忆和物品保留了下来。</p><p style="color:var(--muted);text-align:center;font-size:12px;">利用前几次循环的记忆，更快地找到真相。</p><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">继续</button></div>`);
  $('m-ok').onclick=()=>Modal.close();
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
  r.nav.forEach(n=>{const b=document.createElement('button');b.className='navbtn'+(n.locked&&!flag(n.need)?' locked':'');b.textContent=n.label;b.onclick=()=>{if(n.locked&&!flag(n.need)){if(n.need==='cellarOpen'&&has(ITEMS.key_bronze)){flag('cellarOpen',true);msgFade('你用铜钥匙打开了地板暗门。','good');renderRoom();return;}msgFade(n.lockMsg||'此路不通。','warn');shakeRoom();return;}S.room=n.to;saveGame();renderRoom();window.scrollTo({top:0,behavior:'smooth'});};nb.appendChild(b);});
  saveGame();
}
const Modal={open(h){$('modal-box').innerHTML='<button class="close-x" id="modal-close">×</button>'+h;$('modal-bg').classList.add('show');document.getElementById('modal-close').onclick=()=>this.close();},close(){$('modal-bg').classList.remove('show');}};
$('modal-bg').addEventListener('click',e=>{if(e.target===$('modal-bg'))Modal.close();});
$('btn-clues').onclick=()=>{let h='<h2>已收集线索</h2>';if(S.clues.length===0){h+='<p style="text-align:center;color:var(--muted);padding:30px;">尚未发现任何线索。<br>探索客栈，寻找真相的碎片……</p>';}else{h+=`<p style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:16px;">已收集 ${S.clues.length} / 4 条</p>`;S.clues.forEach(id=>{const c=CLUES[id];h+=`<div class="scroll"><strong style="color:var(--accent);">${c.title}</strong>\n\n${c.text}</div>`;});}Modal.open(h);};
$('btn-intro').onclick=()=>{Modal.open(`<h2>客栈手记</h2><div class="scroll">${BRIEF}</div>`);};
const Hotspot={
  activate(h){const fn=h.action;if(Hotspot[fn])Hotspot[fn](h);},
  lbDesk(h){
    if(has(ITEMS.ink_brush)&&hasClue('c1')){msg('客簿上的内容你已经看过了。无名客人的记录。');return;}
    if(!has(ITEMS.ink_brush)){msgFade('客簿翻开着，上面有墨迹未干的字迹。柜台旁有一支墨笔。','warn');return;}
    msgFade('你在客簿旁找到了一支墨笔，并读到了客簿上的记录——','good');addInv(ITEMS.ink_brush);addClue('c1');h_found(h);
  },
  lbStairs(h){
    msg('木楼梯吱呀作响。每次循环中，你都是从大堂的柜台前醒来的。\n楼梯通向二楼的客房。');
  },
  lbClock(h){
    msg('布谷钟指向戌时（19:00-21:00）。\n但你感觉时间在流逝——到了子时三刻（23:45），一切会重来。\n\n你现在处于第 '+S.loop+' 次循环。');
  },
  rmBed(h){
    if(has(ITEMS.key_bronze)){msg('床上的信已经被你读过了。铜钥匙也已收走。');return;}
    Modal.open(`<h2>床上的信</h2><p>你拿起小桌上的信，拆开——</p><div class="scroll">致后来者：

    如果你在读这封信，说明你也陷入了循环。
    
    我是这间客栈的主人。我在第99次循环中写下了这封信。
    
    地窖在客房地板下。你需要一把铜钥匙——就在这封信的下面。
    
    地窖里有一个黄铜机械装置。它是时间循环的源头。
    要打破循环，需要沙漏和铜镜，以及——镇魂符。
    
    没有镇魂符，时间逆转会撕碎你的灵魂。
    
    镇魂符在梅树上——只有月光照在花上时才能看到。
    沙漏在地窖的桌上。铜镜在衣柜里。
    
    子时三刻，在地窖中将沙漏倒置，用铜镜照向机械装置。
    
    祝你好运。</div>
    <p>信下面压着一把铜钥匙。</p>
    <div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收起信和钥匙</button></div>`);
    $('m-ok').onclick=()=>{addInv(ITEMS.key_bronze);Modal.close();msgFade('你收起了信和铜钥匙。铜钥匙可以打开地窖的暗门。','good');h_found(h);};
  },
  rmWardrobe(h){
    if(has(ITEMS.mirror)){msg('衣柜里的铜镜已被你取走。里面只剩旧衣裳。');return;}
    msgFade('你打开衣柜，在一堆旧衣裳后面找到了一面铜镜。\n铜镜背面刻着八卦纹，镜面微微泛着紫光。','good');addInv(ITEMS.mirror);h_found(h);
  },
  rmWindow(h){
    msg('窗外月光如水。日历上八月十五被红笔圈了起来——\n那应该是循环开始的日子。中秋节。月圆之夜。');
  },
  ktStove(h){
    if(hasClue('c2')){msg('药渣你已经辨认过了。是迷魂散的残渣。');return;}
    if(has(ITEMS.herb)){msg('灶台上的药渣你已经检查过了。');return;}
    msgFade('你在灶台边发现了药渣和一束药草。\n辨认后确认——药渣是「迷魂散」的残渣。有人在食物中下了药。\n药草可以解毒。','warn');addClue('c2');addInv(ITEMS.herb);h_found(h);
  },
  ktWater(h){msg('水缸里的水清澈见底。你看到了自己的倒影——\n但那张脸似乎有些陌生。');},
  ktBlock(h){msg('砧板上插着一把菜刀，旁边是一坛未开封的酒。\n菜刀对你没有用，但酒坛上刻着「百年陈酿」。');},
  cyWell(h){
    if(hasClue('c3')){msg('井中的倒影你已经看过了。那不是你的脸。');return;}
    Modal.open(`<h2>石井</h2><p>你探头看向井中——</p><p>井水映着月光，但你看到的不是自己的倒影。</p><p style="color:var(--accent);text-align:center;">那是一个陌生人的面容。</p><p>你突然想起了什么——碎片般的记忆涌入脑海：</p><div class="scroll">你不是投宿的客人。
你就是这个客栈的主人。

你已经死了。
在这个循环中，你以客人的身份醒来，
但你的灵魂一直困在这里。

客栈中的每一个「你」，
都是同一次死亡的不同侧面。</div><p>你必须打破循环，让自己的灵魂安息。</p><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">后退</button></div>`);
    $('m-ok').onclick=()=>{Modal.close();addClue('c3');msgFade('你记起了一切——你就是客栈的主人。你已死去。','warn');h_found(h);};
  },
  cyTree(h){
    if(has(ITEMS.talisman)){msg('梅树上的镇魂符已被你取走。花瓣仍在飘落。');return;}
    if(S.loop<2){msgFade('梅树开满了花，花瓣如雪般飘落。\n你在月光下仔细查看——似乎有什么东西在花丛中闪烁，但看不真切。\n也许在之后的循环中，你能看得更清楚。','warn');return;}
    msgFade('月光照在梅花上——你看到了！花丛中藏着一张镇魂符！\n它只在月光照耀下才能显现。','good');addInv(ITEMS.talisman);h_found(h);
  },
  cyTable(h){
    msg('石桌上有两杯茶。一杯已经凉了，另一杯还在冒热气。\n仿佛刚才有两个人在这里喝茶——其中一个是你自己。');
  },
  clTable(h){
    if(has(ITEMS.hourglass)){msg('桌上的沙漏已被你取走。机械装置仍在运转。');return;}
    if(hasClue('c4')){
      // Already read the diary — can attempt the ritual
      if(has(ITEMS.hourglass)){msg('你已经拿走了沙漏。');return;}
      msgFade('你再次查看桌上的物品。沙漏还在——里面的沙子向上流动。','warn');addInv(ITEMS.hourglass);h_found(h);return;
    }
    Modal.open(`<h2>地窖木桌</h2><p>桌上有一个沙漏、一个黄铜齿轮机械装置，和一本翻开的日记——</p><div class="scroll">这是我第99次经历这一天。
每次到了子时三刻，一切重来。

客栈里有一座黄铜机械装置。
它就是时间循环的源头。

要打破循环，需要在子时三刻——
将沙漏倒置，同时用铜镜照向机械装置。
这会逆转时间流，让循环终结。

但如果我没有镇魂符保护，
逆转的冲击会摧毁我的灵魂。</div><p>你收起了沙漏和日记。</p><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">收起物品</button></div>`);
    $('m-ok').onclick=()=>{addInv(ITEMS.hourglass);addClue('c4');Modal.close();msgFade('你获得了沙漏和关键线索。现在你需要在子时三刻进行仪式。','good');h_found(h);};
  },
  clShelf(h){msg('酒架上有一坛酒已经碎了。碎片中有一些黄铜齿轮——\n和桌上机械装置的齿轮一样。这证实了机械装置就是循环的源头。');},
  clMural(h){msg('壁画描绘着同一个客栈在春夏秋冬四个季节的样子。\n每个季节的客栈都一模一样——除了月亮的位置不同。\n这似乎在暗示：时间在这里是循环的，四季周而复始。');}
};
function Game(){}
Game.ending=function(type){
  flag('gameComplete',true);clearSave();Modal.close();
  if (window.ARG) ARG.saveFragment('TI', 'TIME');
  if(type==='true'){shakeRoom();setTimeout(()=>{Modal.open(`<h2 class="ending-good">· 破 镜 重 圆 ·</h2><p>你将沙漏倒置，同时举起铜镜照向黄铜机械装置——</p><p style="color:var(--accent);text-align:center;">时间开始逆转。</p><p>齿轮发出刺耳的尖叫声，然后——轰然碎裂。</p><p>镇魂符在你胸口发出温暖的金光，保护着你的灵魂不被撕裂。</p><p>一切归于寂静。月光从地窖的缝隙中照进来。</p><p>你终于想起了一切——你是客栈的主人，在百年前的中秋之夜死去。你的灵魂被困在了自己建造的时间循环中。</p><p>现在，循环终结了。你的灵魂终于可以安息。</p><p>你看到客栈在月光下渐渐化为光点，飘向星空。</p><p style="color:var(--success);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 时光归处 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">线索：${S.clues.length} / 4 · 循环次数：${S.loop} · 镇魂符在手</p><p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 TIME 已回收 · 档案 #TI-1145 已归档</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else if(type==='bad'){setTimeout(()=>{Modal.open(`<h2 class="ending-bad">· 魂 飞 魄 散 ·</h2><p>你将沙漏倒置，举起铜镜——</p><p>但你没有镇魂符！</p><p>时间逆转的冲击如潮水般袭来。你的灵魂在冲击中撕裂——</p><p>碎片散落在时空的缝隙中，永远无法拼合。</p><p>客栈继续着它的循环。你成为了第100个失败者。</p><p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 永困循环 ——</p><p style="font-size:12px;color:var(--muted);text-align:center;margin-top:8px;">提示：你需要镇魂符来保护灵魂。在梅树上寻找——月光下才能看到。</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
};
Game.tryRitual=function(){
  if(!has(ITEMS.hourglass)||!has(ITEMS.mirror)){msgFade('你需要沙漏和铜镜才能进行仪式。','warn');return;}
  const hasTalisman=has(ITEMS.talisman);
  Modal.open(`<h2>子时三刻 · 时间仪式</h2><p>一切就绪。你站在黄铜机械装置前。</p><p>手中握着沙漏和铜镜。${hasTalisman?'镇魂符贴在胸口，发出温暖的光芒。':'但你没有镇魂符——你的灵魂将承受巨大的风险。'}</p><p style="color:var(--accent);text-align:center;">你将沙漏倒置，举起铜镜——</p><div style="display:flex;gap:12px;justify-content:center;margin-top:18px;"><button class="act" id="ritual-go">执行仪式</button><button class="act" id="ritual-cancel" style="opacity:.6;">再等等</button></div>`);
  $('ritual-go').onclick=()=>{Modal.close();Game.ending(hasTalisman?'true':'bad');};
  $('ritual-cancel').onclick=()=>Modal.close();
};
// Override room render to add ritual button in cellar
const _origRender=renderRoom;
renderRoom=function(){
  _origRender();
  if(S.room==='cellar'&&has(ITEMS.hourglass)&&has(ITEMS.mirror)&&hasClue('c4')){
    const nb=$('nav');
    const rb=document.createElement('button');
    rb.className='navbtn';rb.style.borderColor='var(--accent)';rb.style.color='var(--accent)';
    rb.textContent='🔮 在子时三刻执行时间仪式';
    rb.onclick=()=>Game.tryRitual();
    nb.appendChild(rb);
  }
};
Game.showIntro=function(){
  const sv=!!localStorage.getItem(SAVE_KEY);let cb='';if(sv){cb='<button class="act" id="ic" style="margin-right:12px;">继 续 调 查</button>';}
  Modal.open(`<h2>时光客栈档案</h2>
    <div class="bpp-intro-banner">
      <div class="bpp-classified">机密 · 已解密 · 档案编号 TI-1145</div>
      <div class="bpp-title">时光客栈时间循环异常事件</div>
      <div class="bpp-subtitle">异常等级: S · 调查员: [待分配]</div>
      <div class="bpp-note">本档案包含编码信息。使用<span class="bpp-highlight">解码器</span>破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--accent);letter-spacing:3px;font-size:13px;font-family:monospace;">TIME INN · 子时三刻，重来</p>
    <p style="margin-top:16px;">你是异常现象调查局的调查员。档案 #TI-1145 记录了一起时间循环异常：一间古老客栈被困在无尽循环中，每到子时三刻一切重来。</p><p>你调阅此档案，意识被投射进客栈——你不记得自己是怎么来的。茶还是温的，灶台上的水还在沸腾。</p><p>你必须找出时间循环的真相，并在子时三刻打破循环。</p><p style="color:var(--accent);text-align:center;font-style:italic;margin-top:14px;">「你是第几个陷入循环的人？」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">${cb}<button class="act" id="is">调 入 档 案</button></div>`);
  if(sv){$('ic').onclick=()=>{loadGame();Modal.close();renderInv();updateLoop();renderRoom();};}
  $('is').onclick=()=>{clearSave();S.room='lobby';S.inv=[];S.clues=[];S.flags={};S.loop=1;Modal.close();renderInv();updateLoop();renderRoom();setTimeout(()=>$('btn-intro').onclick(),400);};
};
renderInv();updateLoop();renderRoom();Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if (window.ARG) {
  ARG.plantClues([
    { type:'console', gameId:'TI', text:'[系统] 档案 TI-1145 已加载。循环密码已用十六进制编码。' },
    { type:'console', gameId:'TI', encoded:'31 31 34 35', cipherType:'十六进制', hint:'循环核心密码（4位数字）' },
    { type:'console', gameId:'TI', encoded:'VGFsaXNtYW46IE11ZyB0cmVl', cipherType:'Base64', hint:'镇魂符位置（解码后查看）' },
    { type:'console', gameId:'TI', text:'[通讯] 最后记录的时间异常: 子时三刻 (23:45) · 循环次数: 100+' },
    { type:'console', gameId:'TI', text:'[关联] 时间循环节点坐标与档案 #WE-6604 末日列车经过的"时间断层区"重合。' },
    { type:'console', gameId:'TI', text:'[坐标] 客栈位置: 39.9042°N 116.4074°E — 原北京近郊' },
    { type:'console', gameId:'TI', encoded:'VGltZSBsb29wIGlzIG5vdCBuYXR1cmFsIC0gaXQgd2FzIGNyZWF0ZWQgYnkgU2hlbiBmYW1pbHkgdG8gdHJhcCBzb3VscyBmb3IgdGhlIG1pcnJvcg==', cipherType:'Base64', hint:'时间循环真相（关键剧情线索）' },
  ]);
}
