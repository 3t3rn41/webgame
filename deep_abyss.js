/* ============================================================
   深海迷航 · Deep Abyss
   Underwater research station horror with rising water levels.
   ============================================================ */
const S={room:'dock',inv:[],logs:[],flags:{},msgTimer:null,water:0,waterInterval:null};
const ITEMS={wrench:'扳手',keycard:'门禁卡',specimen:'生物样本',fuse:'保险丝',sealant:'密封胶',code_note:'密码纸条'};
const LOGS={
  log1:{title:'研究记录 #1 · 站长李铭',text:'……Poseidon-9深海站已运行第312天。\n我们在海沟深处发现了一种未知的生物群落。\n它们生活在4000米以下的裂缝中，体内含有一种能再生组织的酶。\n\n但我们不知道——它们有智能。'},
  log2:{title:'研究记录 #2 · 生物学家赵雪',text:'……样本逃出了 containment tank。\n它在实验室里迅速生长，破坏了通讯系统。\n\n我们试图用密封胶修补裂缝，但水位仍在上升。\n应急逃生舱在底层，需要站长的门禁卡和启动密码。\n\n密码以摩斯码记录在海沟深度数据中：\n...-- ---.. ..... -----\n用解码器破解。'},
  log3:{title:'研究记录 #3 · 工程师王刚',text:'……电力系统即将失效。主保险丝烧断了，备用保险丝在引擎室。\n\n如果水位超过80%，所有舱门会自动锁死——防止整站淹没。\n但那也意味着……没有人能逃出去了。\n\n我听到了引擎室里有声音。不是机械声。是某种……呼吸声。'},
};
const BRIEF=`任务简报：

    你是深海研究站Poseidon-9的最后一名工作人员。
    从昏迷中醒来时，你发现：

    · 研究站多处漏水，水位持续上升
    · 一种未知生物样本逃出了 containment
    · 通讯系统中断，无法求援
    · 大部分船员已疏散或失踪

    你必须在水位淹没整站之前：
    1. 修复电力系统
    2. 收集逃生舱启动密码
    3. 到达底层逃生舱逃离

    水位不会停止上升。快。`;
const ROOMS={
  dock:{name:'停靠舱 · DOCKING BAY',img:'images/deep_dock.jpg',
    desc:'你在停靠舱醒来，浑身湿透。舱内灯光闪烁，地板上有积水。\n\n中央的潜艇 docking hatch 半开着，水从缝隙中渗入。右侧的声纳控制台屏幕闪烁着洪水警报。左侧的储物柜里有潜水服。',
    nav:[{to:'corridor',label:'→ 通过气密门进入走廊'}],
    hotspots:[{id:'dock_hatch',x:20,y:20,w:50,h:55,label:'潜艇舱口',action:'dockHatch'},{id:'dock_console',x:72,y:30,w:23,h:35,label:'声纳控制台',action:'dockConsole'},{id:'dock_locker',x:0,y:25,w:18,h:45,label:'储物柜',action:'dockLocker'}]},
  corridor:{name:'中央走廊 · CORRIDOR',img:'images/deep_lab.jpg',
    desc:'走廊连接着研究站的各个区域。天花板上的管道在漏水，水滴不断落下。\n\n实验室的门半开着，里面一片狼藉。引擎室在右侧。船员舱在左侧。\n\n走廊尽头是通往底层逃生舱的梯子，但电子锁没有响应。',
    nav:[{to:'dock',label:'← 返回停靠舱'},{to:'lab',label:'→ 进入实验室'},{to:'engine',label:'→ 引擎室',locked:true,lockMsg:'引擎室的门因电力不足无法开启。需要修复电力。',need:'powerOn'},{to:'crew',label:'→ 船员舱'},{to:'escape',label:'→ 逃生舱（需要密码）',locked:true,lockMsg:'通往底层的电子锁需要密码才能解锁。',need:'escapeOpen'}],
    hotspots:[{id:'cor_pipe',x:10,y:5,w:80,h:20,label:'漏水管道',action:'corPipe'},{id:'cor_lock',x:55,y:55,w:30,h:30,label:'电子锁',action:'corLock'}]},
  lab:{name:'实验室 · LABORATORY',img:'images/deep_lab.jpg',
    desc:'实验室一片狼藉。观察窗破裂了，海水缓慢渗入。工作台上的器皿散落一地。\n\n左侧的 containment tank 碎了，里面空空如也——样本不见了。右侧的观察窗外，黑暗的深海中有什么东西在移动。',
    nav:[{to:'corridor',label:'← 返回走廊'}],
    hotspots:[{id:'lab_tank',x:0,y:30,w:18,h:35,label:'containment tank',action:'labTank'},{id:'lab_bench',x:25,y:38,w:40,h:40,label:'工作台',action:'labBench'},{id:'lab_window',x:15,y:5,w:60,h:35,label:'破裂观察窗',action:'labWindow'}]},
  engine:{name:'引擎室 · ENGINE ROOM',img:'images/deep_engine.jpg',
    desc:'引擎室积了半尺深的水。左侧的水力涡轮发电机仍在运转，发出低沉的嗡鸣。右侧的电气面板上有手动控制杆和断路器。\n\n角落里的工具箱半开着，里面有一把扳手。',
    nav:[{to:'corridor',label:'← 返回走廊'}],
    hotspots:[{id:'eng_turbine',x:5,y:10,w:40,h:65,label:'涡轮发电机',action:'engTurbine'},{id:'eng_panel',x:65,y:30,w:27,h:40,label:'电气面板',action:'engPanel'},{id:'eng_tools',x:0,y:40,w:10,h:35,label:'工具箱',action:'engTools'}]},
  crew:{name:'船员舱 · CREW QUARTERS',img:'images/deep_crew.jpg',
    desc:'船员舱已经被水浸了一半。上下铺的床上散落着个人物品——照片、日记本。桌上的一台笔记本电脑屏幕还亮着，显示着一段视频日志。\n\n墙上的急救箱门开着，里面的药品已经少了一半。',
    nav:[{to:'corridor',label:'← 返回走廊'}],
    hotspots:[{id:'crew_bunk',x:20,y:25,w:45,h:50,label:'床铺',action:'crewBunk'},{id:'crew_laptop',x:0,y:20,w:18,h:45,label:'笔记本电脑',action:'crewLaptop'},{id:'crew_aid',x:70,y:30,w:25,h:38,label:'急救箱',action:'crewAid'}]},
  escape:{name:'逃生舱 · ESCAPE POD',img:'images/deep_escape.jpg',
    desc:'逃生舱在研究站的最底层。黄色的球形救生舱固定在发射架上，上方亮着红灯。右侧的发射控制台有一个大红色按钮和密码键盘。\n\n地上的水位已经到了脚踝。墙上有一道裂缝在喷水。角落里有一把消防斧——但玻璃已经碎了。',
    nav:[{to:'corridor',label:'← 返回走廊'}],
    hotspots:[{id:'esc_pod',x:20,y:15,w:50,h:60,label:'逃生舱',action:'escPod'},{id:'esc_console',x:72,y:35,w:23,h:35,label:'发射控制台',action:'escConsole'},{id:'esc_axe',x:0,y:40,w:15,h:32,label:'消防斧',action:'escAxe'}]}
};
const $=id=>document.getElementById(id);
function msg(t,c){const e=$('msg');e.textContent=t;e.className=c||'';if(S.msgTimer)clearTimeout(S.msgTimer);}
function msgFade(t,c,d=3500){msg(t,c);S.msgTimer=setTimeout(()=>{if($('msg').textContent===t)$('msg').textContent='';},d);}
function has(i){return S.inv.includes(i);}
function addInv(i){if(!has(i)){S.inv.push(i);renderInv();saveGame();return true;}return false;}
function removeInv(i){const j=S.inv.indexOf(i);if(j>=0){S.inv.splice(j,1);renderInv();saveGame();}}
function flag(k,v){if(v!==undefined){S.flags[k]=v;saveGame();}return S.flags[k];}
function hasLog(id){return S.logs.includes(id);}
function addLog(id){if(!hasLog(id)){S.logs.push(id);saveGame();return true;}return false;}
function shakeRoom(){const r=$('room-img-wrap');r.classList.remove('shake');void r.offsetWidth;r.classList.add('shake');}
function h_found(h){flag(h.id+'_found',true);}
const SAVE_KEY='deepAbyss_save';
function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({room:S.room,inv:S.inv,logs:S.logs,flags:S.flags,water:S.water}));}catch(e){}}
function loadGame(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return false;const d=JSON.parse(r);S.room=d.room||'dock';S.inv=d.inv||[];S.logs=d.logs||[];S.flags=d.flags||{};S.water=d.water||0;return true;}catch(e){return false;}}
function clearSave(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}}
function renderInv(){const b=$('inv-items');if(S.inv.length===0){b.innerHTML='<span class="inv-empty">空</span>';return;}b.innerHTML=S.inv.map((it,i)=>`<span class="inv-item" data-idx="${i}">${it}</span>`).join('');b.querySelectorAll('.inv-item').forEach(e=>{e.onclick=()=>useInvItem(S.inv[parseInt(e.dataset.idx)]);});}
function useInvItem(item){
  if(item===ITEMS.wrench)msg('一把重型扳手。可以拧紧管道法兰、操作阀门。');
  else if(item===ITEMS.keycard)msg('站长的门禁卡。能打开研究站的高权限门锁。');
  else if(item===ITEMS.specimen)msg('一个密封容器中的生物样本。它发出微弱的蓝色荧光。\n它在不断改变形状……像是活着。');
  else if(item===ITEMS.fuse)msg('一根备用保险丝。可以替换引擎室烧断的主保险丝。');
  else if(item===ITEMS.sealant)msg('一罐水下密封胶。可以临时修补裂缝和泄漏点。');
  else if(item===ITEMS.code_note)msg('一张湿润的纸条，上面是一串摩斯码：\n...-- ---.. ..... -----\n用解码器破解。这是逃生舱的启动密码。');
  else msg(item);
}
function updateStatus(){
  $('water-val').textContent=Math.round(S.water)+'%';
  if(S.water>80){$('pressure-val').textContent='危险';$('st-pressure').style.color='var(--danger)';}
  else if(S.water>50){$('pressure-val').textContent='警告';$('st-pressure').style.color='var(--warn)';}
  else{$('pressure-val').textContent='稳定';$('st-pressure').style.color='';}
  if(flag('powerOn')){$('power-val').textContent='正常';$('st-power').style.color='var(--success)';}
  else{$('power-val').textContent='应急';$('st-power').style.color='var(--warn)';}
  if(S.water>80){$('st-water').style.color='var(--danger)';}else if(S.water>50){$('st-water').style.color='var(--warn)';}else{$('st-water').style.color='';}
}
function startWaterTimer(){
  if(S.waterInterval)return;
  S.waterInterval=setInterval(()=>{
    if(flag('gameComplete')){clearInterval(S.waterInterval);return;}
    let rate=0.3;
    if(flag('lab_window_sealed'))rate-=0.1;
    if(flag('cor_pipe_sealed'))rate-=0.1;
    S.water=Math.min(100,S.water+rate);
    if(S.water>=100){clearInterval(S.waterInterval);Game.ending('drown');}
    updateStatus();saveGame();
  },3000);
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
  r.nav.forEach(n=>{const b=document.createElement('button');b.className='navbtn'+(n.locked&&!flag(n.need)?' locked':'');b.textContent=n.label;b.onclick=()=>{if(n.locked&&!flag(n.need)){if(n.need==='escapeOpen'&&has(ITEMS.code_note)){flag('escapeOpen',true);msgFade('密码验证通过。底层电子锁解除。','good');renderRoom();return;}msgFade(n.lockMsg||'无法通过。','warn');shakeRoom();return;}S.room=n.to;saveGame();renderRoom();window.scrollTo({top:0,behavior:'smooth'});};nb.appendChild(b);});
  saveGame();
}
const Modal={open(h){$('modal-box').innerHTML='<button class="close-x" id="modal-close">×</button>'+h;$('modal-bg').classList.add('show');document.getElementById('modal-close').onclick=()=>this.close();},close(){$('modal-bg').classList.remove('show');}};
$('modal-bg').addEventListener('click',e=>{if(e.target===$('modal-bg'))Modal.close();});
$('btn-logs').onclick=()=>{let h='<h2>研究记录</h2>';if(S.logs.length===0){h+='<p style="text-align:center;color:#3a5a6a;padding:30px;">尚未发现任何研究记录。<br>探索深海站，寻找遗留的数据……</p>';}else{h+=`<p style="text-align:center;font-size:12px;color:#3a5a6a;margin-bottom:16px;font-family:var(--mono);">已收集 ${S.logs.length} / 3 条</p>`;S.logs.forEach(id=>{const l=LOGS[id];h+=`<div class="log"><strong style="color:var(--accent);">${l.title}</strong>\n\n${l.text}</div>`;});}Modal.open(h);};
$('btn-intro').onclick=()=>{Modal.open(`<h2>任务简报</h2><div class="log">${BRIEF}</div>`);};
const Hotspot={
  activate(h){const fn=h.action;if(Hotspot[fn])Hotspot[fn](h);},
  dockHatch(h){msg('潜艇 docking hatch 已经损坏，无法使用。水从缝隙中不断渗入。\n你必须找到另一条逃生路线。');},
  dockConsole(h){
    if(flag('dock_console_read')){msg('声纳显示：海沟深度3850米。研究站结构完整度：71%。水位：'+Math.round(S.water)+'%。');return;}
    flag('dock_console_read',true);
    msgFade('声纳控制台显示：\n海沟深度：3850米\n研究站结构完整度：71%\n警告：多处漏水，水位持续上升。\n逃生舱在底层——需要启动密码和站长门禁卡。','warn');h_found(h);
  },
  dockLocker(h){
    if(has(ITEMS.sealant)){msg('储物柜已经空了。');return;}
    msgFade('你在储物柜里找到了一罐水下密封胶和一套潜水服。\n密封胶可以临时修补裂缝，减缓水位上升。','good');addInv(ITEMS.sealant);h_found(h);
  },
  corPipe(h){
    if(flag('cor_pipe_sealed')){msg('管道已经被密封胶修补好了。漏水停止了。');return;}
    if(has(ITEMS.sealant)){
      flag('cor_pipe_sealed',true);
      msgFade('你用密封胶修补了走廊天花板上的漏水管道。水位上升速度减缓了！','good');h_found(h);
    }else{msgFade('走廊天花板的管道在大量漏水。你需要密封胶来修补它。','warn');}
  },
  corLock(h){
    if(flag('escapeOpen')){msg('电子锁已解除。通往底层的通道已打开。');return;}
    if(has(ITEMS.code_note)){
      Modal.open(`<h2>电子锁</h2><p>输入4位密码来解锁通往底层的通道：</p><div class="puzzle-row"><input id="p-input" maxlength="4" placeholder="????"><button id="p-ok">解锁</button></div><p class="puzzle-hint">提示：密码与海沟深度有关，已用摩斯码编码。用解码器破解。📁 ARG提示：检查页面源代码(Ctrl+U)中的注释。</p>`);
      $('p-ok').onclick=()=>{const v=$('p-input').value.trim();if(v==='3850'){flag('escapeOpen',true);Modal.close();msgFade('密码正确！电子锁解除，通往底层的通道打开了。','good');h_found(h);renderRoom();}else{msgFade('密码错误。','danger');$('p-input').value='';}};
      $('p-input').focus();$('p-input').onkeydown=e=>{if(e.key==='Enter')$('p-ok').onclick();};
    }else{msgFade('电子锁需要4位密码。你还没有找到密码。','warn');}
  },
  labTank(h){
    if(has(ITEMS.specimen)){msg('containment tank 已经碎了，样本早已逃出。');return;}
    if(flag('lab_tank_seen')){msg('碎裂的 containment tank。样本的残余粘液在地板上形成了痕迹——通向引擎室方向。');return;}
    flag('lab_tank_seen',true);
    msgFade('containment tank 碎成了碎片。里面的生物样本已经逃出。\n地板上有粘液痕迹——通向引擎室方向。\n你在碎玻璃旁边找到了一小块残余的样本碎片，装入了密封容器。','warn');addInv(ITEMS.specimen);h_found(h);
  },
  labBench(h){
    if(hasLog('log1')){msg('工作台上的文件你已经读过了。关于深海生物群落的研究报告。');return;}
    msgFade('你在工作台上找到了一份研究记录和一把门禁卡。\n门禁卡上写着"站长 李铭"。','good');addInv(ITEMS.keycard);addLog('log1');h_found(h);
  },
  labWindow(h){
    if(flag('lab_window_sealed')){msg('观察窗已经被密封胶临时修补。海水不再渗入——但窗外的东西还在。');return;}
    if(has(ITEMS.sealant)){
      flag('lab_window_sealed',true);
      msgFade('你用密封胶临时修补了破裂的观察窗。海水渗入速度减缓了！\n但透过修补后的窗户，你仍然看到深海中有巨大的黑影在移动……','good');h_found(h);
    }else{
      msgFade('观察窗破裂了，海水不断渗入。窗外黑暗的深海中，有什么巨大的东西在移动……\n你需要密封胶来修补窗户。','warn');
    }
  },
  engTurbine(h){
    if(flag('powerOn')){msg('涡轮发电机运转正常。电力已恢复。');return;}
    if(!has(ITEMS.fuse)){msgFade('涡轮发电机的主保险丝烧断了。你需要一根备用保险丝才能重启电力。','warn');return;}
    if(!has(ITEMS.wrench)){msgFade('保险丝盒的螺丝拧得太紧。你需要一把扳手来打开它。','warn');return;}
    flag('powerOn',true);removeInv(ITEMS.fuse);
    msgFade('你用扳手打开保险丝盒，换上了备用保险丝。\n「嗡——」涡轮发电机轰鸣着启动了！电力恢复正常！','good');
    h_found(h);updateStatus();renderRoom();
  },
  engPanel(h){
    if(flag('powerOn')){msg('电气面板显示：所有系统正常。电力：100%。');return;}
    msg('电气面板显示：主保险丝烧断。备用保险丝存放在工具箱中。\n面板上有一个手动控制杆——但没有电力，它无法运作。');
  },
  engTools(h){
    if(has(ITEMS.wrench)){msg('工具箱里已经没有有用的工具了。');return;}
    if(has(ITEMS.fuse)){msgFade('你在工具箱里找到了一把重型扳手。','good');addInv(ITEMS.wrench);h_found(h);return;}
    msgFade('你在工具箱里找到了一把重型扳手和一根备用保险丝！\n扳手可以操作阀门和螺丝，保险丝可以修复电力系统。','good');addInv(ITEMS.wrench);addInv(ITEMS.fuse);h_found(h);
  },
  crewBunk(h){
    if(has(ITEMS.code_note)){msg('床铺上的纸条已经被你收走了。');return;}
    if(hasLog('log2')){msgFade('你在枕头下找到了一张湿润的纸条——上面是一串摩斯码：\n...-- ---.. ..... -----\n用解码器破解。这应该是逃生舱的启动密码！','good');addInv(ITEMS.code_note);h_found(h);return;}
    msg('上下铺的床上散落着个人物品。枕头上有一张照片——几名研究员的合影。\n枕头下似乎藏着什么东西……');
  },
  crewLaptop(h){
    if(hasLog('log2')){msg('笔记本电脑的视频日志你已经看过了。');return;}
    flag('crew_laptop_seen',true);
    Modal.open(`<h2>视频日志</h2><p>你打开笔记本电脑，播放了一段视频日志——</p><div class="log">生物学家赵雪的紧急记录：

样本逃出了 containment tank。
它在实验室里迅速生长，破坏了通讯系统。

我们试图用密封胶修补裂缝，但水位仍在上升。
应急逃生舱在底层，需要站长的门禁卡和启动密码。

密码是海沟深度：3-8-5-0。

如果有人看到这段视频……请快一点。
水位超过80%，所有舱门会自动锁死。</div>
<p class="puzzle-hint">密码是摩斯码。你还需要在船员舱找到密码纸条。用解码器破解。</p><div style="text-align:center;margin-top:14px;"><button class="act" id="m-ok">关闭</button></div>`);
    $('m-ok').onclick=()=>Modal.close();addLog('log2');h_found(h);
  },
  crewAid(h){
    if(flag('crew_aid_used')){msg('急救箱已经被翻过了。大部分药品已过期。');return;}
    flag('crew_aid_used',true);
    if(hasLog('log3')){msgFade('你在急救箱里找到了一瓶抗生素和一卷绷带。\n也许在紧急时刻能派上用场。','good');return;}
    msgFade('你在急救箱里找到了一瓶抗生素和一份工程师的研究记录。','good');addLog('log3');h_found(h);
  },
  escPod(h){
    if(flag('escape_launched')){msg('逃生舱已经启动。你正浮向海面。');return;}
    msg('黄色球形逃生舱固定在发射架上。舱门紧闭，等待启动密码。\n水位在脚踝处不断上涨。');
  },
  escConsole(h){
    if(flag('escape_launched')){msg('控制台已锁定。逃生舱正在上浮。');return;}
    if(!has(ITEMS.code_note)){msgFade('控制台需要4位启动密码。你还没有找到密码。','warn');return;}
    if(!flag('powerOn')){msgFade('控制台没有电力！你需要先修复引擎室的电力系统。','warn');return;}
    Modal.open(`<h2>发射控制台</h2><p>控制台亮起。输入4位启动密码：</p><div class="puzzle-row"><input id="p-input" maxlength="4" placeholder="????"><button id="p-ok">发射</button></div><p class="puzzle-hint">提示：密码与海沟深度有关，已用摩斯码编码。用解码器破解。📁 ARG提示：检查页面源代码(Ctrl+U)中的注释。</p>`);
    $('p-ok').onclick=()=>{const v=$('p-input').value.trim();if(v==='3850'){flag('escape_launched',true);Modal.close();const hasSpecimen=has(ITEMS.specimen);const allLogs=S.logs.length>=3;Game.ending(hasSpecimen&&allLogs?'true':hasSpecimen?'good':'bad');}else{msgFade('密码错误。','danger');$('p-input').value='';}};
    $('p-input').focus();$('p-input').onkeydown=e=>{if(e.key==='Enter')$('p-ok').onclick();};
  },
  escAxe(h){
    if(has(ITEMS.wrench)){msg('消防斧很重，但你已经有扳手了。不需要它。');return;}
    msg('一把消防斧挂在墙上，玻璃已碎。但你不需要它——你的工具更适合精密操作。');
  }
};
function Game(){}
Game.ending=function(type){
  flag('gameComplete',true);clearInterval(S.waterInterval);clearSave();Modal.close();
  if(window.ARG)ARG.saveFragment('DA','DEEP');
  if(type==='true'){shakeRoom();setTimeout(()=>{Modal.open(`<h2 class="ending-good">· 浮 出 水 面 ·</h2><p>逃生舱喷射而出，你被推力压在座椅上。</p><p>深度计飞速下降：3000米……2000米……1000米……</p><p>「砰——」逃生舱冲出水面，阳光从舱盖照进来。你已经很久没有见到太阳了。</p><p>你手中紧握着生物样本——那种能在4000米深海再生组织的酶。它将改变人类医学。</p><p>身后，Poseidon-9研究站在深海中沉默地坠入海沟。那东西……也一起沉了下去。</p><p style="color:var(--success);text-align:center;margin-top:16px;letter-spacing:3px;">—— 真 结 局 · 深渊归来 ——</p><p style="font-size:12px;color:#3a5a6a;text-align:center;margin-top:8px;">研究记录：${S.logs.length} / 3 · 样本已回收</p><p style="font-size:11px;color:#e040fb;text-align:center;margin-top:6px;font-family:monospace;">[BPP] 档案碎片 DEEP 已回收 · 档案 #DA-3850 已归档</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else if(type==='good'){setTimeout(()=>{Modal.open(`<h2 class="ending-good">· 上 浮 ·</h2><p>逃生舱冲出水面。你得救了。</p><p>但你没有带回生物样本——那种能改变医学的酶沉入了深海。</p><p>也许这是最好的结局。有些东西，不该被打捞上来。</p><p style="color:var(--accent);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 海面重生 ——</p><p style="font-size:12px;color:#3a5a6a;text-align:center;margin-top:8px;">研究记录：${S.logs.length} / 3</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else if(type==='bad'){setTimeout(()=>{Modal.open(`<h2 class="ending-bad">· 沉 没 ·</h2><p>逃生舱启动了——但没有电力支持，发射失败。</p><p>舱门锁死。水位不断上涨。</p><p>你最后看到的，是观察窗外那个巨大的黑影——它正在注视着你。</p><p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 永沉深渊 ——</p><p style="font-size:12px;color:#3a5a6a;text-align:center;margin-top:8px;">提示：需要先恢复电力，再启动逃生舱。</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
  else if(type==='drown'){setTimeout(()=>{Modal.open(`<h2 class="ending-bad">· 淹 没 ·</h2><p>水位达到了100%。研究站完全淹没。</p><p>冰冷的海水没过了你的头顶。你的意识在黑暗中消散……</p><p>Poseidon-9成为了海沟的一部分。没有人知道这里发生过什么。</p><p style="color:var(--danger);text-align:center;margin-top:16px;letter-spacing:3px;">—— 结 局 · 葬身深海 ——</p><p style="font-size:12px;color:#3a5a6a;text-align:center;margin-top:8px;">提示：用密封胶修补漏点可以减缓水位上升。</p><div style="text-align:center;margin-top:16px;"><button class="act" id="restart">返回档案库</button></div>`);$('restart').onclick=()=>location.href='index.html';},800);}
};
Game.showIntro=function(){
  const sv=!!localStorage.getItem(SAVE_KEY);let cb='';if(sv){cb='<button class="act" id="ic" style="margin-right:12px;">继 续 调 查</button>';}
  Modal.open(`<h2>波 塞 冬 档 案</h2>
    <div class="arg-intro-banner">
      <div class="arg-classified">机密 · 已解密 · 档案编号 DA-3850</div>
      <div class="arg-title">深海研究站 Poseidon-9 事故调查卷宗</div>
      <div class="arg-note">本档案包含编码信息。使用解码器破解密文。线索可能隐藏在页面源码、控制台或场景异常文本中。</div>
    </div>
    <p style="text-align:center;color:var(--accent);letter-spacing:3px;font-size:13px;font-family:var(--mono);">DEEP ABYSS · STATION POSEIDON-9</p>
    <p style="margin-top:16px;">你是海洋事故调查局的调查员。Poseidon-9深海研究站失联后，你被派往调查。</p>
    <p>站点多处漏水，未知生物样本逃出。逃生舱启动密码已被编码为摩斯码，隐藏在海沟深度数据中。</p>
    <p style="color:var(--warn);text-align:center;font-style:italic;margin-top:14px;">「水位不会停止上升。」</p>
    <p class="puzzle-hint" style="text-align:center;">📁 ARG调查模式：所有密码均已编码——使用右上角解码器破解。查看页面源码和控制台可能发现隐藏线索。</p>
    <div style="text-align:center;margin-top:20px;">${cb}<button class="act" id="is">开 启 调 查</button></div>`);
  if(sv){$('ic').onclick=()=>{loadGame();Modal.close();renderInv();updateStatus();renderRoom();startWaterTimer();};}
  $('is').onclick=()=>{clearSave();S.room='dock';S.inv=[];S.logs=[];S.flags={};S.water=0;Modal.close();renderInv();updateStatus();renderRoom();startWaterTimer();setTimeout(()=>$('btn-intro').onclick(),400);};
};
renderInv();updateStatus();renderRoom();Game.showIntro();

// ===== ARG HIDDEN CLUES =====
if(window.ARG){
  ARG.plantClues([
    {type:'console',gameId:'DA',text:'[系统] 档案 DA-3850 已加载。逃生密码已用摩斯码编码。'},
    {type:'console',gameId:'DA',encoded:'...-- ---.. ..... -----',cipherType:'摩斯码',hint:'深度密码（4位数字）'},
    {type:'console',gameId:'DA',encoded:'U3BlY2ltZW46IExhYg==',cipherType:'Base64',hint:'样本位置（解码后查看）'},
    {type:'console',gameId:'DA',text:'[通讯] 深海站最后通讯: +61 3-9214-XXXX · 澳大利亚海洋研究所'},
    {type:'console',gameId:'DA',text:'[关联] 井底深度读数与档案 #MH-1911 古井测量数据一致。两者可能连通同一地下水脉。'},
    {type:'console',gameId:'DA',text:'[坐标] 研究站位置: 11.3493°N 142.1996°E — 马里亚纳海沟，挑战者深渊'},
    {type:'console',gameId:'DA',encoded:'Mzg1MChtZXRlcikgLSBwcmVzc3VyZSBjcml0aWNhbCAtIG9yZ2FuaWMgbWF0dGVyIG5vdCBvcmdhbmljIGluIG9yaWdpbg==',cipherType:'Base64',hint:'深度异常分析报告（关键线索）'},
  ]);
}
