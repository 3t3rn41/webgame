/* ============================================================
   arg.js — Shared ARG (Alternate Reality Game) Toolkit
   Provides: cipher functions, decoder UI, hidden clue system,
   console clues, cross-game meta-puzzle tracking.
   Loaded by every ARG-transformed game.
   ============================================================ */

(function () {
  'use strict';

  // ===== MORSE CODE TABLES =====
  var MORSE_ENC = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
    'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
    'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
    'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-',',': '--..--','?': '..--..','!': '-.-.--','/': '-..-.',
    ' ': '/'
  };
  var MORSE_DEC = {};
  for (var k in MORSE_ENC) { MORSE_DEC[MORSE_ENC[k]] = k; }

  // ===== CIPHER PRIMITIVES =====
  function caesarShift(text, shift) {
    return text.split('').map(function (c) {
      var code = c.charCodeAt(0);
      if (code >= 65 && code <= 90)
        return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
      if (code >= 97 && code <= 122)
        return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
      return c;
    }).join('');
  }

  function atbashShift(text) {
    return text.split('').map(function (c) {
      var code = c.charCodeAt(0);
      if (code >= 65 && code <= 90)  return String.fromCharCode(90 - (code - 65));
      if (code >= 97 && code <= 122) return String.fromCharCode(122 - (code - 97));
      return c;
    }).join('');
  }

  // ===== CIPHER DEFINITIONS =====
  var CIPHERS = {
    base64: {
      name: 'Base64',
      encode: function (t) { return btoa(unescape(encodeURIComponent(t))); },
      decode: function (t) {
        try { return decodeURIComponent(escape(atob(t.trim()))); }
        catch (e) { return null; }
      }
    },
    binary: {
      name: '二进制',
      encode: function (t) {
        return t.split('').map(function (c) {
          return c.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
      },
      decode: function (t) {
        try {
          return t.trim().split(/\s+/).map(function (b) {
            return String.fromCharCode(parseInt(b, 2));
          }).join('');
        } catch (e) { return null; }
      }
    },
    hex: {
      name: '十六进制',
      encode: function (t) {
        return t.split('').map(function (c) {
          return c.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase();
        }).join(' ');
      },
      decode: function (t) {
        try {
          return t.trim().split(/\s+/).map(function (h) {
            return String.fromCharCode(parseInt(h, 16));
          }).join('');
        } catch (e) { return null; }
      }
    },
    morse: {
      name: '摩斯码',
      encode: function (t) {
        return t.toUpperCase().split('').map(function (c) {
          return MORSE_ENC[c] || '';
        }).filter(Boolean).join(' ');
      },
      decode: function (t) {
        try {
          return t.trim().split(' / ').map(function (word) {
            return word.split(' ').map(function (m) {
              return MORSE_DEC[m] || '';
            }).join('');
          }).join(' ');
        } catch (e) { return null; }
      }
    },
    caesar3: {
      name: '凯撒位移 +3',
      encode: function (t) { return caesarShift(t, 3); },
      decode: function (t) { return caesarShift(t, -3); }
    },
    rot13: {
      name: 'ROT13',
      encode: function (t) { return caesarShift(t, 13); },
      decode: function (t) { return caesarShift(t, 13); }
    },
    reverse: {
      name: '反转',
      encode: function (t) { return t.split('').reverse().join(''); },
      decode: function (t) { return t.split('').reverse().join(''); }
    },
    atbash: {
      name: '阿特巴什',
      encode: function (t) { return atbashShift(t); },
      decode: function (t) { return atbashShift(t); }
    },
    caesar5: {
      name: '凯撒位移 +5',
      encode: function (t) { return caesarShift(t, 5); },
      decode: function (t) { return caesarShift(t, -5); }
    },
    caesarN: {
      name: '凯撒位移 (任意)',
      encode: function (t) { return t; },
      decode: function (t) {
        // Return all 26 shifts for brute-force
        var results = [];
        for (var s = 0; s < 26; s++) {
          results.push({ shift: s, text: caesarShift(t, -s) });
        }
        return results;
      }
    },
    pigpen: {
      name: '猪圈密码',
      encode: function (t) { return t; }, // too complex to encode client-side
      decode: function (t) { return '参见猪圈密码对照表'; }
    },
    octal: {
      name: '八进制',
      encode: function (t) {
        return t.split('').map(function (c) {
          return c.charCodeAt(0).toString(8).padStart(3, '0');
        }).join(' ');
      },
      decode: function (t) {
        try {
          return t.trim().split(/\s+/).map(function (o) {
            return String.fromCharCode(parseInt(o, 8));
          }).join('');
        } catch (e) { return null; }
      }
    },
  };

  // ===== AUTO-DETECT =====
  function isPrintable(text) {
    if (!text || text.length === 0) return false;
    var printable = 0;
    for (var i = 0; i < text.length; i++) {
      var code = text.charCodeAt(i);
      if ((code >= 32 && code <= 126) || code > 0x4e00) printable++;
    }
    return printable / text.length > 0.6;
  }

  function autoDecode(input) {
    var results = [];
    var keys = ['base64', 'binary', 'hex', 'morse', 'caesar3', 'rot13', 'reverse', 'atbash'];
    for (var i = 0; i < keys.length; i++) {
      var cipher = CIPHERS[keys[i]];
      var decoded = cipher.decode(input);
      if (decoded && isPrintable(decoded) && decoded !== input) {
        results.push({ cipher: cipher.name, text: decoded });
      }
    }
    return results;
  }

  // ===== UTILITY =====
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===== DECODER MODAL =====
  function ensureDecoderModal() {
    if (document.getElementById('arg-decoder-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'arg-decoder-modal';
    modal.className = 'arg-modal-bg';
    modal.innerHTML =
      '<div class="arg-modal">' +
        '<div class="arg-modal-header">' +
          '<h2>🔓 密码解码器</h2>' +
          '<button class="arg-close" id="arg-close-btn">×</button>' +
        '</div>' +
        '<div class="arg-modal-body">' +
          '<p class="arg-desc">输入你在调查中发现的编码文本，选择解码方式或使用自动检测。</p>' +
          '<textarea id="arg-input" class="arg-textarea" placeholder="在此粘贴编码文本…" rows="4"></textarea>' +
          '<div class="arg-controls">' +
            '<select id="arg-cipher-type" class="arg-select">' +
              '<option value="auto">自动检测</option>' +
              '<option value="base64">Base64</option>' +
              '<option value="binary">二进制</option>' +
              '<option value="hex">十六进制</option>' +
              '<option value="morse">摩斯码</option>' +
              '<option value="caesar3">凯撒位移 +3</option>' +
              '<option value="rot13">ROT13</option>' +
              '<option value="reverse">反转</option>' +
              '<option value="atbash">阿特巴什</option>' +
            '</select>' +
            '<button id="arg-decode-btn" class="arg-btn">解码</button>' +
          '</div>' +
          '<div id="arg-output" class="arg-output"></div>' +
        '</div>' +
        '<div class="arg-modal-footer">' +
          '<p class="arg-hint">💡 提示：留意页面源码中的注释、浏览器控制台信息，以及场景中异常的符号与文本</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('arg-close-btn').onclick = function () {
      modal.classList.remove('show');
    };
    document.getElementById('arg-decode-btn').onclick = decodeInput;
    document.getElementById('arg-input').onkeydown = function (e) {
      if (e.key === 'Enter' && e.ctrlKey) decodeInput();
    };
    modal.onclick = function (e) {
      if (e.target === modal) modal.classList.remove('show');
    };
  }

  function decodeInput() {
    var input = document.getElementById('arg-input').value.trim();
    var type = document.getElementById('arg-cipher-type').value;
    var output = document.getElementById('arg-output');

    if (!input) {
      output.innerHTML = '<p class="arg-error">请输入编码文本</p>';
      return;
    }

    if (type === 'auto') {
      var results = autoDecode(input);
      if (results.length === 0) {
        output.innerHTML = '<p class="arg-error">未能自动识别编码方式。请尝试手动选择。</p>';
      } else {
        var html = '<p class="arg-success-title">自动检测结果：</p>';
        for (var i = 0; i < results.length; i++) {
          html += '<div class="arg-result">' +
            '<span class="arg-result-type">' + results[i].cipher + '</span>' +
            '<span class="arg-result-text">' + escapeHtml(results[i].text) + '</span>' +
          '</div>';
        }
        output.innerHTML = html;
      }
    } else {
      var cipher = CIPHERS[type];
      if (!cipher) {
        output.innerHTML = '<p class="arg-error">未知的解码方式</p>';
        return;
      }
      var decoded = cipher.decode(input);
      if (decoded && isPrintable(decoded)) {
        output.innerHTML =
          '<div class="arg-result arg-result-single">' +
            '<span class="arg-result-type">' + cipher.name + '</span>' +
            '<span class="arg-result-text">' + escapeHtml(decoded) + '</span>' +
          '</div>';
      } else {
        output.innerHTML = '<p class="arg-error">解码失败。请检查输入或尝试其他方式。</p>';
      }
    }
  }

  function openDecoder() {
    ensureDecoderModal();
    var modal = document.getElementById('arg-decoder-modal');
    modal.classList.add('show');
    setTimeout(function () {
      var input = document.getElementById('arg-input');
      if (input) input.focus();
    }, 100);
  }

  // ===== CONSOLE CLUE SYSTEM =====
  function logClue(text, gameId) {
    var prefix = gameId ? '[' + gameId + '] ' : '';
    console.log(
      '%c' + prefix + text,
      'color:#00ff88;background:#0a0a0a;font-family:monospace;font-size:13px;padding:4px 8px;display:block;border-left:3px solid #00ff88;'
    );
  }

  function logHidden(gameId, hint, encoded, cipherType) {
    console.log(
      '%c⚠ 隐藏线索 [' + gameId + ']',
      'color:#ff6b6b;background:#1a0a0a;font-family:monospace;font-size:13px;padding:4px 8px;display:block;border-left:3px solid #ff6b6b;'
    );
    console.log(
      '%c密文: ' + encoded + '  [' + cipherType + ']',
      'color:#ffd93d;background:#1a1a0a;font-family:monospace;font-size:13px;padding:4px 8px;display:block;border-left:3px solid #ffd93d;'
    );
    if (hint) {
      console.log(
        '%c提示: ' + hint,
        'color:#6bcfff;font-family:monospace;font-size:12px;padding:4px 8px;display:block;'
      );
    }
  }

  function logMeta(gameId, fragment) {
    console.log(
      '%c◆ 档案碎片 [' + gameId + '] ' + fragment,
      'color:#e040fb;background:#0d0010;font-family:monospace;font-size:14px;padding:6px 10px;display:block;border-left:3px solid #e040fb;font-weight:bold;'
    );
  }

  // ===== HIDDEN CLUE PLANTING =====
  function plantClues(clues) {
    clues.forEach(function (clue) {
      if (clue.type === 'comment') {
        var comment = document.createComment(' ' + clue.text + ' ');
        document.body.appendChild(comment);
      } else if (clue.type === 'console') {
        if (clue.encoded && clue.cipherType) {
          logHidden(clue.gameId, clue.hint, clue.encoded, clue.cipherType);
        } else {
          logClue(clue.text, clue.gameId);
        }
      } else if (clue.type === 'hidden') {
        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;opacity:0;pointer-events:none;';
        el.setAttribute('data-arg-clue', clue.id || '');
        el.textContent = clue.text;
        document.body.appendChild(el);
      } else if (clue.type === 'meta') {
        var meta = document.createElement('meta');
        meta.setAttribute('name', clue.name || 'arg-clue');
        meta.setAttribute('content', clue.text);
        document.head.appendChild(meta);
      }
    });
  }

  // ===== CSS CLUE INJECTION =====
  function plantCSSClue(selector, content) {
    var el = document.querySelector(selector);
    if (!el) return;
    var style = document.createElement('style');
    style.setAttribute('data-arg-css-clue', 'true');
    style.textContent = selector + '::after { content: "' + content.replace(/"/g, '\\"') + '"; font-size:10px;color:transparent;background:transparent;position:absolute;pointer-events:none; }';
    document.head.appendChild(style);
  }

  // ===== REDACTION =====
  function redact(text, percent) {
    if (!percent) percent = 30;
    var chars = text.split('');
    var count = Math.floor(chars.length * percent / 100);
    var indices = [];
    for (var i = 0; i < chars.length; i++) indices.push(i);
    // Shuffle and pick
    for (var n = indices.length - 1; n > 0; n--) {
      var j = Math.floor(Math.random() * (n + 1));
      var tmp = indices[n]; indices[n] = indices[j]; indices[j] = tmp;
    }
    var redacted = {};
    for (var k = 0; k < count; k++) redacted[indices[k]] = true;
    return chars.map(function (c, i) {
      if (redacted[i]) return '█';
      return c;
    }).join('');
  }

  // ===== CASE FILE INIT =====
  function initCaseFile(gameId, caseNumber) {
    addArgIndicator(gameId, caseNumber);
    console.log(
      '%c╔══════════════════════════════════════════╗\n║  异常现象调查局 (BPP)  ·  档案调阅终端    ║\n║                                          ║\n║  档案: ' + caseNumber +
      '                              \n║  调查员权限: 已激活                        ║\n║  密级: 绝密                               ║\n║                                          ║\n║  ► 使用解码器破解密文                      ║\n║  ► 线索可能隐藏在源码/控制台中             ║\n║  ► 完成调查后将记录档案碎片                ║\n╚══════════════════════════════════════════╝',
      'color:#00ff88;font-family:monospace;font-size:12px;line-height:1.6;'
    );
    // Plant a classified stamp if the element exists
    var stamp = document.createElement('div');
    stamp.className = 'bpp-stamp';
    stamp.textContent = 'BPP 机密';
    stamp.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%) rotate(-15deg);z-index:2998;pointer-events:none;';
    document.body.appendChild(stamp);
  }

  // ===== ARG INDICATOR (floating button) =====
  function addArgIndicator(gameId, caseNumber) {
    var existing = document.getElementById('arg-indicator');
    if (existing) existing.remove();

    var indicator = document.createElement('div');
    indicator.id = 'arg-indicator';
    indicator.className = 'arg-indicator';
    indicator.innerHTML =
      '<span class="arg-case">📁 ' + caseNumber + '</span>' +
      '<button class="arg-decoder-btn" id="arg-decoder-open">🔓 解码器</button>';
    document.body.appendChild(indicator);

    document.getElementById('arg-decoder-open').onclick = openDecoder;
  }

  // ===== CROSS-GAME META SYSTEM =====
  var META_KEY = 'arg_meta_fragments';

  function saveFragment(gameId, fragment) {
    try {
      var data = JSON.parse(localStorage.getItem(META_KEY) || '{}');
      data[gameId] = fragment;
      localStorage.setItem(META_KEY, JSON.stringify(data));
      logMeta(gameId, fragment);
    } catch (e) {}
  }

  function getFragments() {
    try {
      return JSON.parse(localStorage.getItem(META_KEY) || '{}');
    } catch (e) { return {}; }
  }

  function getFragmentCount() {
    return Object.keys(getFragments()).length;
  }

  // ===== INIT =====
  function init() {
    var html = document.documentElement;
    var gameId = html.getAttribute('data-arg-game');
    var caseNumber = html.getAttribute('data-arg-case');

    if (gameId && caseNumber) {
      initCaseFile(gameId, caseNumber);
    }
  }

  // ===== EXPORT =====
  window.ARG = {
    CIPHERS: CIPHERS,
    autoDecode: autoDecode,
    openDecoder: openDecoder,
    logClue: logClue,
    logHidden: logHidden,
    logMeta: logMeta,
    plantClues: plantClues,
    plantCSSClue: plantCSSClue,
    redact: redact,
    initCaseFile: initCaseFile,
    addArgIndicator: addArgIndicator,
    saveFragment: saveFragment,
    getFragments: getFragments,
    getFragmentCount: getFragmentCount,
    encode: function (type, text) { return CIPHERS[type] ? CIPHERS[type].encode(text) : null; },
    decode: function (type, text) { return CIPHERS[type] ? CIPHERS[type].decode(text) : null; },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
