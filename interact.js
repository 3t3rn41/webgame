/* ============================================================
   interact.js — Shared interaction enhancement system v2
   Uses MutationObserver to detect game state changes.
   No function hooking needed — works with any game.
   ============================================================ */

(function() {
  'use strict';

  // ===== AUDIO SYSTEM (Web Audio API — no files needed) =====
  let audioCtx = null;
  let audioEnabled = true;
  let ambientNode = null;

  function initAudio() {
    if (audioCtx) return;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch(e) { audioEnabled = false; }
  }

  function playTone(freq, duration, type, volume) {
    if (!audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume || 0.08, audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
  }

  function playSeq(notes) {
    notes.forEach(n => setTimeout(() => playTone(n.f, n.d || 0.15, n.t || 'sine', n.v || 0.08), n.delay || 0));
  }

  const SFX = {
    click:    () => playTone(800, 0.05, 'square', 0.03),
    hover:    () => playTone(1200, 0.02, 'sine', 0.015),
    pickup:   () => playSeq([{f:523,d:0.1,delay:0},{f:659,d:0.1,delay:80},{f:784,d:0.15,delay:160}]),
    door:     () => playSeq([{f:200,d:0.2,t:'sawtooth',v:0.04,delay:0},{f:150,d:0.3,t:'sawtooth',v:0.03,delay:100}]),
    locked:   () => playSeq([{f:150,d:0.08,t:'square',v:0.06,delay:0},{f:120,d:0.12,t:'square',v:0.06,delay:80}]),
    puzzle:   () => playSeq([{f:523,d:0.1,delay:0},{f:659,d:0.1,delay:100},{f:784,d:0.1,delay:200},{f:1047,d:0.25,delay:300}]),
    error:    () => playSeq([{f:300,d:0.08,t:'sawtooth',v:0.05,delay:0},{f:200,d:0.15,t:'sawtooth',v:0.05,delay:80}]),
    reveal:   () => playSeq([{f:400,d:0.12,t:'sine',v:0.05,delay:0},{f:600,d:0.12,t:'sine',v:0.04,delay:90},{f:800,d:0.18,t:'sine',v:0.03,delay:180}]),
    ending:   () => playSeq([{f:523,d:0.2,delay:0},{f:659,d:0.2,delay:200},{f:784,d:0.2,delay:400},{f:1047,d:0.5,delay:600}]),
  };

  // ===== AMBIENT DRONE =====
  function startAmbient() {
    if (!audioEnabled || !audioCtx || ambientNode) return;
    try {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc1.type = 'sine'; osc1.frequency.value = 55;
      osc2.type = 'sine'; osc2.frequency.value = 82.4;
      filter.type = 'lowpass'; filter.frequency.value = 200;
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.012, audioCtx.currentTime + 3);
      osc1.connect(filter); osc2.connect(filter);
      filter.connect(gain); gain.connect(audioCtx.destination);
      osc1.start(); osc2.start();
      ambientNode = { osc1, osc2, gain };
    } catch(e) {}
  }
  function stopAmbient() {
    if (!ambientNode) return;
    try {
      ambientNode.gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      setTimeout(() => { if (ambientNode) { ambientNode.osc1.stop(); ambientNode.osc2.stop(); ambientNode = null; } }, 600);
    } catch(e) {}
  }

  // ===== TOAST NOTIFICATIONS =====
  function ensureToast() {
    let c = document.getElementById('toast-container');
    if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
    return c;
  }
  function toast(text, type, dur) {
    const c = ensureToast();
    const t = document.createElement('div');
    t.className = 'toast ' + (type || 'item');
    const icons = { item:'✦', good:'✓', warn:'⚠', danger:'✕' };
    t.innerHTML = '<span class="toast-icon">' + (icons[type]||'✦') + '</span>' + text;
    c.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, dur || 2800);
    t.onclick = () => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); };
  }

  // ===== SCREEN FLASH =====
  function ensureFlash() {
    let f = document.getElementById('screen-flash');
    if (!f) { f = document.createElement('div'); f.id = 'screen-flash'; document.body.appendChild(f); }
    return f;
  }
  function screenFlash(type) {
    const f = ensureFlash();
    f.className = '';
    void f.offsetWidth;
    f.classList.add('flash-' + (type || 'gold'), 'show');
    setTimeout(() => f.classList.remove('show'), 500);
  }

  // ===== CLICK RIPPLE =====
  function addRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = ((e ? e.clientX : rect.left + rect.width/2) - rect.left - size/2) + 'px';
    ripple.style.top = ((e ? e.clientY : rect.top + rect.height/2) - rect.top - size/2) + 'px';
    el.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }

  // ===== TYPEWRITER EFFECT =====
  let typeTimer = null;
  let lastMsgText = '';
  let isTyping = false;  // Independent flag — NOT class-based
  let typeTargetEl = null;  // The element being typed into

  function typewriteMsg(el, text) {
    if (typeTimer) { clearInterval(typeTimer); typeTimer = null; }
    lastMsgText = text;
    isTyping = true;
    typeTargetEl = el;
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    typeTimer = setInterval(() => {
      if (i < text.length) {
        el.textContent += text[i];
        if (i % 3 === 0) playTone(600 + Math.random()*200, 0.01, 'square', 0.01);
        i++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
        el.classList.remove('typing');
        isTyping = false;
        typeTargetEl = null;
      }
    }, 22);
  }

  // ===== KEYBOARD NAVIGATION =====
  function setupKeyboard() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        const bg = document.getElementById('modal-bg');
        if (bg && bg.classList.contains('show')) {
          bg.classList.remove('show');
          SFX.click();
          return;
        }
      }
      if (e.key >= '1' && e.key <= '9' && document.activeElement.tagName !== 'INPUT') {
        const btns = document.querySelectorAll('#nav .navbtn');
        const idx = parseInt(e.key) - 1;
        if (btns[idx]) { btns[idx].click(); }
      }
      if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        const msg = document.getElementById('msg');
        if (msg && msg.textContent) { msg.textContent = ''; msg.className = ''; }
      }
    });
  }

  // ===== AUDIO TOGGLE =====
  function setupAudioToggle() {
    const btn = document.createElement('button');
    btn.id = 'audio-toggle';
    btn.innerHTML = '🔊';
    btn.title = '音效开关';
    btn.onclick = () => {
      audioEnabled = !audioEnabled;
      btn.innerHTML = audioEnabled ? '🔊' : '🔇';
      btn.classList.toggle('muted', !audioEnabled);
      if (!audioEnabled) stopAmbient();
      else { initAudio(); startAmbient(); }
    };
    document.body.appendChild(btn);
  }

  // ===== KB HINT =====
  function showKbHint() {
    const hint = document.createElement('div');
    hint.id = 'kb-hint';
    hint.textContent = 'ESC关闭 · 数字键导航 · Enter清除消息';
    document.body.appendChild(hint);
    setTimeout(() => { hint.style.transition = 'opacity 1s'; hint.style.opacity = '0'; }, 8000);
  }

  // ===== MUTATION OBSERVERS =====
  // Track inventory size to detect item pickups
  let prevInvCount = 0;

  function setupObservers() {
    // --- Inventory observer: detect new items ---
    const invEl = document.getElementById('inv-items');
    if (invEl) {
      prevInvCount = invEl.children.length;
      const invObs = new MutationObserver(() => {
        const count = invEl.querySelectorAll('.inv-item').length;
        if (count > prevInvCount) {
          // Item added!
          SFX.pickup();
          const items = invEl.querySelectorAll('.inv-item');
          const last = items[items.length - 1];
          if (last) {
            const itemName = last.textContent.trim();
            toast('获得物品：' + itemName, 'item');
            screenFlash('gold');
            last.classList.add('new-item');
            setTimeout(() => last.classList.remove('new-item'), 600);
          }
        }
        prevInvCount = count;
      });
      invObs.observe(invEl, { childList: true, subtree: true });
    }

    // --- Message observer: typewriter effect ---
    // Uses isTyping flag to prevent feedback loop:
    // typewriteMsg modifies textContent → triggers observer →
    // isTyping guard prevents re-entry.
    const msgEl = document.getElementById('msg');
    if (msgEl) {
      const msgObs = new MutationObserver(() => {
        // If we're currently typing, ignore all mutations
        if (isTyping) return;
        const text = msgEl.textContent.trim();
        if (text && text !== lastMsgText) {
          // Game set new text — start typewriter
          typewriteMsg(msgEl, text);
        }
      });
      // Only watch childList — textContent changes create/remove text nodes
      // Do NOT watch characterData to reduce noise
      msgObs.observe(msgEl, { childList: true, subtree: true });
    }

    // --- Modal observer: play sound on open ---
    const modalBg = document.getElementById('modal-bg');
    if (modalBg) {
      const modalObs = new MutationObserver(() => {
        if (modalBg.classList.contains('show')) {
          SFX.reveal();
        }
      });
      modalObs.observe(modalBg, { attributes: true, attributeFilter: ['class'] });
    }

    // --- Hotspot & Nav enhancement: re-attach on room change ---
    const roomEl = document.getElementById('hotspots') || document.getElementById('room');
    const navEl = document.getElementById('nav');
    const enhanceAll = () => {
      document.querySelectorAll('.hotspot:not(.enhanced)').forEach(hs => {
        hs.classList.add('enhanced');
        hs.addEventListener('mouseenter', () => SFX.hover(), { once: true });
        hs.addEventListener('click', e => {
          addRipple(hs, e);
          hs.classList.add('flash');
          setTimeout(() => hs.classList.remove('flash'), 500);
          SFX.click();
        }, { capture: true });
      });
      document.querySelectorAll('.navbtn:not(.enhanced)').forEach(btn => {
        btn.classList.add('enhanced');
        btn.addEventListener('click', () => {
          if (btn.classList.contains('locked')) SFX.locked();
          else SFX.door();
        }, { capture: true });
      });
    };
    enhanceAll();
    if (roomEl) {
      new MutationObserver(enhanceAll).observe(roomEl, { childList: true, subtree: true });
    }
    if (navEl) {
      new MutationObserver(enhanceAll).observe(navEl, { childList: true, subtree: true });
    }

    // --- Shake detection: play error sound ---
    const wrapEl = document.getElementById('room-img-wrap');
    if (wrapEl) {
      const shakeObs = new MutationObserver(() => {
        if (wrapEl.classList.contains('shake')) {
          SFX.error();
          screenFlash('bad');
        }
      });
      shakeObs.observe(wrapEl, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // ===== INIT =====
  function init() {
    ensureToast();
    ensureFlash();
    setupAudioToggle();
    setupKeyboard();
    showKbHint();

    // Unlock audio on first interaction (browser policy)
    const unlock = () => {
      initAudio();
      startAmbient();
      document.removeEventListener('click', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('keydown', unlock);

    // Setup observers after a short delay to ensure game JS has rendered
    setTimeout(setupObservers, 200);
  }

  window.Interact = { SFX, toast, screenFlash, init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
