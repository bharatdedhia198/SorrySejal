// ══════════════════════════════
//  BACKGROUND ANIMATIONS
// ══════════════════════════════
const heartsBg = document.getElementById('heartsBg');
const heartSymbols = ['🥺', '🥹', '😢', '😭', '🙏', '😔', '😞', '😿', '🫂', '✨', '🌸', '🌼', '🍃', '🌷', '🫧', '🌟', '🦋', '🕊️'];
const heartColors = ['#f48fb1','#e91e63','#ff80ab','#f06292','#c2185b','#fce4ec','#ff4081'];

// 1. Floating emoji hearts
for (let i = 0; i < 18; i++) {
  const h = document.createElement('div');
  h.className = 'heart-float';
  h.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = (0.7 + Math.random() * 1.4) + 'rem';
  h.style.animationDuration = (7 + Math.random() * 10) + 's';
  h.style.animationDelay   = -(Math.random() * 15) + 's';
  heartsBg.appendChild(h);
}

// 2. CSS-drawn drifting heart shapes
for (let i = 0; i < 12; i++) {
  const s = document.createElement('div');
  s.className = 'heart-shape';
  const size = 8 + Math.random() * 16;
  s.style.width  = size + 'px';
  s.style.height = size + 'px';
  s.style.left   = Math.random() * 100 + 'vw';
  s.style.background = heartColors[Math.floor(Math.random() * heartColors.length)];
  s.style.animationDuration = (8 + Math.random() * 12) + 's';
  s.style.animationDelay   = -(Math.random() * 15) + 's';
  s.style.opacity = (0.2 + Math.random() * 0.4).toString();
  heartsBg.appendChild(s);
}

// 3. Sparkle dots scattered around
for (let i = 0; i < 20; i++) {
  const sp = document.createElement('div');
  sp.className = 'sparkle';
  sp.style.left = Math.random() * 100 + 'vw';
  sp.style.top  = Math.random() * 100 + 'vh';
  sp.style.background = heartColors[Math.floor(Math.random() * heartColors.length)];
  sp.style.width  = (4 + Math.random() * 6) + 'px';
  sp.style.height = sp.style.width;
  sp.style.animationDuration = (2 + Math.random() * 3) + 's';
  sp.style.animationDelay   = -(Math.random() * 4) + 's';
  heartsBg.appendChild(sp);
}

// ══════════════════════════════
//  SCREEN 3: POLAROID SWIPER
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const stack = document.getElementById('polaroidStack');
  const countEl = document.getElementById('polaroidCount');
  if (!stack) return;

  const cards = Array.from(stack.querySelectorAll('.polaroid-card'));
  const total = cards.length;
  let current3 = 0;

  function getTopCard() {
    return cards.find(c => !c.classList.contains('swiped-left') && !c.classList.contains('swiped-right'));
  }

  function updateCount() {
    const swiped = cards.filter(c => c.classList.contains('swiped-left') || c.classList.contains('swiped-right')).length;
    current3 = swiped;
    countEl.textContent = `${Math.min(current3 + 1, total)} / ${total}`;
  }

  function swipeCard(dir) {
    const top = getTopCard();
    if (!top) return;
    top.classList.add(dir === 'left' ? 'swiped-left' : 'swiped-right');
    updateCount();
  }

  // Touch swipe
  let startX = 0;
  stack.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  stack.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) swipeCard(diff < 0 ? 'left' : 'right');
  });

  // Mouse drag
  let mouseStartX = 0, dragging = false;
  stack.addEventListener('mousedown', e => { mouseStartX = e.clientX; dragging = true; });
  stack.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = e.clientX - mouseStartX;
    if (Math.abs(diff) > 40) swipeCard(diff < 0 ? 'left' : 'right');
  });
});

// ══════════════════════════════
//  SCREEN 2: PARALLAX SCROLL DEPTH
//  Revealed cards shift horizontally at different rates = depth illusion
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('msScroll');
  if (!scroller) return;
  scroller.addEventListener('scroll', () => {
    if (window.innerWidth < 1024) return;
    const scrolled = scroller.scrollTop;
    scroller.querySelectorAll('.ms-node.revealed').forEach((node, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const speed = 0.018 + (i % 3) * 0.008;
      const shift = (scrolled * speed * dir).toFixed(2);
      node.style.transform = `translateZ(0) translateX(${shift}px)`;
    });
  }, { passive: true });
});

// ══════════════════════════════
//  TIMELINE SCROLL: REVEAL + PROGRESS + COUNTER + UNLOCK
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const scroller    = document.getElementById('msScroll');
  const progressFill= document.getElementById('msProgressFill');
  const counter     = document.getElementById('msCounter');
  const tlNext      = document.getElementById('tlNext');
  if (!scroller) return;

  const nodes = Array.from(scroller.querySelectorAll('.ms-node'));
  const total = nodes.length;
  let revealed = 0;

  // IntersectionObserver for scroll-reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('revealed')) {
        entry.target.classList.add('revealed');
        revealed++;
        counter.textContent = `${revealed} / ${total} memories`;
      }
    });
  }, { root: scroller, threshold: 0.25 });

  nodes.forEach(n => observer.observe(n));

  // scroll indicator stays permanently visible

  // progress bar + unlock Next on scroll
  scroller.addEventListener('scroll', () => {
    const pct = scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight);
    progressFill.style.width = Math.min(pct * 100, 100) + '%';
    if (pct >= 0.92 && tlNext) {
      tlNext.style.opacity = '1';
      tlNext.style.pointerEvents = 'auto';
    }
  });
});

// ══════════════════════════════
//  SCREEN NAVIGATION
// ══════════════════════════════
let current = 1;

function goTo(n) {
  const curEl = document.getElementById('s' + current);
  curEl.classList.add('exit');

  setTimeout(() => {
    curEl.classList.remove('active', 'exit');
    current = n;
    const nextEl = document.getElementById('s' + n);
    nextEl.classList.add('active');
  }, 500);
}

// ══════════════════════════════
//  ENVELOPE OPEN
// ══════════════════════════════
function openEnvelope() {
  const wrap = document.getElementById('envWrap');
  wrap.classList.add('open');
  setTimeout(() => goTo(5), 800);
}

// ══════════════════════════════
//  FORGIVENESS METER
// ══════════════════════════════
let tapCount = 0;
const totalTaps = 10;

function tapHeart() {
  if (tapCount >= totalTaps) return;

  tapCount++;
  const forgiveness = tapCount * 20;

  const fill    = document.getElementById('progressFill');
  const label   = document.getElementById('pctLabel');
  const gif     = document.getElementById('meterGif');
  const btn     = document.getElementById('heartBtn');

  // Update bar & label
  fill.style.width = forgiveness + '%';
  label.textContent = forgiveness + '% FORGIVEN';

  // Heart pop animation
  btn.style.transform = 'scale(1.4)';
  setTimeout(() => (btn.style.transform = ''), 200);

  // Change gif at 60%
  if (forgiveness === 60) {
    gif.src = 'https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif';
  }

  // At 100% → confetti + go to final screen
  if (forgiveness === 100) {
    setTimeout(() => {
      launchConfetti();
      goTo(7);
    }, 600);
  }
}

// ══════════════════════════════
//  CONFETTI
// ══════════════════════════════
function launchConfetti() {
  const colors = ['#e91e63', '#f48fb1', '#ff80ab', '#fce4ec', '#ff4081', '#f8bbd0', '#c2185b'];

  for (let i = 0; i < 90; i++) {
    const c = document.createElement('div');
    c.className = 'confetti-piece';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.top = '-10px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.width  = (6 + Math.random() * 8) + 'px';
    c.style.height = (6 + Math.random() * 8) + 'px';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    c.style.animationDuration = (2 + Math.random() * 2) + 's';
    c.style.animationDelay   = (Math.random() * 0.8) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
}
