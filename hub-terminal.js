/* ============================================================
   hub-terminal.js — BPP 安全终端 (Bureau of Paranormal Phenomena)
   Game hub meta-terminal: tracks cross-game fragments,
   displays classified status, unlocks the ultimate secret.
   ============================================================ */

(function () {
  'use strict';

  // ===== CASE FILE REGISTRY =====
  // Maps gameId -> { fragment, caseNumber, name, date }
  var CASES = {
    MH: { fragment: 'MIST', caseNumber: '#MH-1911', name: '雾隐宅灭门案', date: '1911.10.10', location: '30.1472°N 118.1578°E' },
    SD: { fragment: 'STAR', caseNumber: '#SD-4372', name: 'HELIOS-7失联事件', date: '2187.03.14', location: '轨道 43.72°N' },
    TQ: { fragment: 'TOMB', caseNumber: '#TQ-EWEW', name: '法老陵墓失踪案', date: '1923.11.04', location: '25.7402°N 32.6014°E' },
    DA: { fragment: 'DEEP', caseNumber: '#DA-3850', name: '波塞冬-9淹没事件', date: '2041.08.22', location: '11.3493°N 142.1996°E' },
    TI: { fragment: 'TIME', caseNumber: '#TI-1145', name: '时光客栈循环事件', date: '1145.09.30', location: '39.9042°N 116.4074°E' },
    WE: { fragment: 'WASTE', caseNumber: '#WE-6604', name: '末日列车信号消失', date: '2089.12.01', location: '41.8781°N 87.6298°E' },
    IA: { fragment: 'ISEK', caseNumber: '#IA-1920', name: '星岚学园消失事件', date: '1920.04.01', location: '35.6762°N 139.6503°E' },
    EP: { fragment: 'EGGY', caseNumber: '#EP-5523', name: '虚拟空间异常事件', date: '2024.06.15', location: '隐藏服务器' },
  };

  var TOTAL_CASES = Object.keys(CASES).length;
  var META_KEY = 'arg_meta_fragments';

  // ===== TERMINAL STATE =====
  var terminalUnlocked = false;
  var secretRevealed = false;

  // ===== GET FRAGMENTS =====
  function getFragments() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); }
    catch (e) { return {}; }
  }

  function getFragmentCount() {
    return Object.keys(getFragments()).length;
  }

  // ===== TYPEWRITER =====
  function typewrite(el, text, speed, callback) {
    var i = 0;
    el.textContent = '';
    var timer = setInterval(function () {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, speed || 25);
  }

  // ===== BUILD TERMINAL =====
  function buildTerminal() {
    var container = document.getElementById('bpp-terminal');
    if (!container) return;

    var fragments = getFragments();
    var count = Object.keys(fragments).length;

    // Header
    var html = '<div class="bpp-terminal-header">' +
      '<span class="bpp-terminal-title">◈ BPP 安全终端 — 调查员接入中</span>' +
      '<span class="bpp-terminal-status">' + count + '/' + TOTAL_CASES + ' 档案碎片已回收</span>' +
      '</div>';

    // Fragment grid
    html += '<div class="bpp-fragment-grid">';
    Object.keys(CASES).forEach(function (gameId) {
      var c = CASES[gameId];
      var found = fragments[gameId];
      if (found) {
        html += '<div class="bpp-fragment-card found">' +
          '<div class="bpp-fragment-code">' + c.fragment + '</div>' +
          '<div class="bpp-fragment-case">' + c.caseNumber + '</div>' +
          '<div class="bpp-fragment-name">' + c.name + '</div>' +
          '<div class="bpp-fragment-meta">' + c.date + ' · ' + c.location + '</div>' +
          '</div>';
      } else {
        html += '<div class="bpp-fragment-card locked">' +
          '<div class="bpp-fragment-code">████</div>' +
          '<div class="bpp-fragment-case">' + c.caseNumber + '</div>' +
          '<div class="bpp-fragment-name">[数据已加密]</div>' +
          '<div class="bpp-fragment-meta">完成调查以解锁</div>' +
          '</div>';
      }
    });
    html += '</div>';

    // Progress bar
    var pct = Math.round(count / TOTAL_CASES * 100);
    html += '<div class="bpp-progress"><div class="bpp-progress-bar" style="width:' + pct + '%"></div>' +
      '<span class="bpp-progress-text">' + pct + '% 完成</span></div>';

    // Secret unlock area
    if (count >= TOTAL_CASES && !secretRevealed) {
      html += '<div class="bpp-secret-locked">' +
        '<button class="bpp-secret-btn" id="bpp-reveal-btn">⚠ 解锁 BPP-0级机密</button>' +
        '<p class="bpp-warning">警告：阅读此文件将永久改变你对所有档案的认知</p>' +
        '</div>';
    } else if (secretRevealed) {
      html += buildSecret();
    } else {
      html += '<div class="bpp-secret-locked">' +
        '<p class="bpp-hint">🔒 收集全部 ' + TOTAL_CASES + ' 个档案碎片以解锁最高机密</p>' +
        '<p class="bpp-hint-sub">提示：完成每个游戏的调查，碎片将自动记录</p>' +
        '</div>';
    }

    container.innerHTML = html;

    // Attach reveal handler
    var revealBtn = document.getElementById('bpp-reveal-btn');
    if (revealBtn) {
      revealBtn.onclick = revealSecret;
    }
  }

  // ===== BUILD SECRET CONTENT =====
  function buildSecret() {
    return '<div class="bpp-secret-revealed">' +
      '<div class="bpp-secret-stamp">最高机密 LEVEL-0</div>' +
      '<div class="bpp-secret-body" id="bpp-secret-text"></div>' +
      '</div>';
  }

  // ===== REVEAL SECRET =====
  function revealSecret() {
    secretRevealed = true;
    var secretText = [
      '> 正在解密 BPP-0级机密文件...',
      '> 访问授权: 8/8 碎片验证通过',
      '> 解密完成。',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  BPP-0级机密 — 门计划 (Project GATE)',
      '  密级: 仅限0级人员',
      '  日期: [已涂黑]',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '',
      '致第9号调查员：',
      '',
      '  如果你正在阅读此文件，说明你已经完成了',
      '  全部8份档案的调查，并回收了所有碎片。',
      '',
      '  现在，你必须知道真相——',
      '',
      '  雾隐宅的镜中世界、HELIOS-7的AI觉醒、',
      '  法老的诅咒、波塞冬-9的深海怪物、',
      '  时光客栈的循环、末日列车的信号、',
      '  星岚学园的消失、蛋仔岛的虚拟异常——',
      '',
      '  这些不是独立的超自然事件。',
      '  它们是实验产物。',
      '  是我们制造的。',
      '',
      '  异常现象调查局（BPP）并非记录异常——',
      '  BPP 在制造异常。',
      '',
      '  "门计划"是一项跨越百年的实验，',
      '  旨在打开通往其他维度的通道。',
      '  8个档案是8次失败的开启尝试。',
      '',
      '  而你，调查员——',
      '  你是第9号实验体。',
      '',
      '  你以为自己在调查案件，',
      '  实际上，你在重复第9次实验。',
      '',
      '  当你读完这段文字的那一刻，',
      '  第9次实验已经开始了。',
      '',
      '  看看你的屏幕倒影。',
      '  它是不是……慢了半拍？',
      '',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      '  [文件结束]',
      '  [档案碎片已归档: MIST·STAR·TOMB·DEEP·TIME·WASTE·ISEK·EGGY]',
      '  [实验状态: 进行中]',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ];

    var container = document.getElementById('bpp-terminal');
    if (!container) return;
    container.innerHTML = buildSecret();

    var textEl = document.getElementById('bpp-secret-text');
    if (!textEl) return;

    // Typewriter reveal
    var i = 0;
    textEl.textContent = '';
    var timer = setInterval(function () {
      if (i < secretText.length) {
        textEl.textContent += secretText[i] + '\n';
        textEl.scrollTop = textEl.scrollHeight;
        i++;
      } else {
        clearInterval(timer);
        // Add final glitch effect
        document.body.classList.add('bpp-glitch');
        setTimeout(function () { document.body.classList.remove('bpp-glitch'); }, 2000);
      }
    }, 60);
  }

  // ===== INIT =====
  function init() {
    buildTerminal();
    // Console welcome
    console.log(
      '%c╔══════════════════════════════════════════╗\n║  异常现象调查局 (BPP)  ·  中央档案库      ║\n║                                          ║\n║  调查员接入中...                          ║\n║  已回收档案碎片: ' + getFragmentCount() + '/' + TOTAL_CASES +
      '                        ║\n║                                          ║\n║  完成全部调查以解锁最高机密                ║\n╚══════════════════════════════════════════╝',
      'color:#e040fb;font-family:monospace;font-size:12px;line-height:1.6;'
    );
  }

  window.BPPTerminal = { init: init, refresh: buildTerminal };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
