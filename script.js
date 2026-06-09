(function() {
  'use strict';

  (function () {
  const canvas = document.getElementById('bgc');
  const ctx = canvas.getContext('2d');
  let W, H, pts = [], raf;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function mkPt(init) {
    const roll = Math.random();
    let r, baseOp, speed;
    if (roll < 0.3) {
      r = Math.random() * 3 + 1;
      baseOp = Math.random() * 0.5 + 0.35;
      speed = Math.random() * 0.35 + 0.15;
    } else if (roll < 0.65) {
      r = Math.random() * 11 + 4;
      baseOp = Math.random() * 0.28 + 0.15;
      speed = Math.random() * 0.2 + 0.06;
    } else if (roll < 0.88) {
      r = Math.random() * 14 + 15;
      baseOp = Math.random() * 0.18 + 0.08;
      speed = Math.random() * 0.12 + 0.03;
    } else {
      r = Math.random() * 18 + 28;
      baseOp = Math.random() * 0.1 + 0.04;
      speed = Math.random() * 0.07 + 0.02;
    }
    return {
      x: Math.random() * W,
      y: init ? Math.random() * H : H + r + 10,
      r,
      baseOp,
      speed,
      vx: (Math.random() - 0.5) * 0.09,
      ph: Math.random() * Math.PI * 2,
      phv: Math.random() * 0.018 + 0.005,
    };
  }

  const COUNT = navigator.hardwareConcurrency <= 4 ? 65 : 90;
  for (let i = 0; i < COUNT; i++) pts.push(mkPt(true));

  function drawPt(p) {
    const op = p.baseOp * (0.5 + 0.5 * Math.sin(p.ph));
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    if (p.r < 5) {
      g.addColorStop(0, `rgba(255,238,160,${op})`);
      g.addColorStop(0.45, `rgba(220,180, 80,${op * 0.55})`);
      g.addColorStop(1, 'rgba(190,150, 50,0)');
    } else {
      g.addColorStop(0, `rgba(240,205,115,${op})`);
      g.addColorStop(0.3, `rgba(215,175, 78,${op * 0.65})`);
      g.addColorStop(0.65, `rgba(180,140, 48,${op * 0.22})`);
      g.addColorStop(1, 'rgba(150,110, 30,0)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p) => {
      p.x += p.vx;
      p.y -= p.speed;
      p.ph += p.phv;
      if (p.y < -p.r * 2) Object.assign(p, mkPt(false));
      if (p.x < -p.r) p.x = W + p.r;
      if (p.x > W + p.r) p.x = -p.r;
      drawPt(p);
    });
    raf = requestAnimationFrame(loop);
  }
  loop();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
})();

(function runIntro() {
  const intro  = document.getElementById('intro');
  const txt    = document.getElementById('intro-txt');
  const lineT  = document.querySelector('.intro-line-top');
  const lineB  = document.querySelector('.intro-line-bot');
  if (!intro || !txt) return;

  const LABEL = 'The Official Popsi Museum\u2122';
  let i = 0;

  /* Draw lines first */
  setTimeout(() => {
    if (lineT) lineT.classList.add('drawn');
    if (lineB) lineB.classList.add('drawn');
  }, 300);

  /* Then type the name */
  setTimeout(() => {
    const t = setInterval(() => {
      txt.textContent = LABEL.slice(0, ++i);
      if (i >= LABEL.length) {
        clearInterval(t);
        /* Hold then dismiss */
        setTimeout(() => intro.classList.add('gone'), 900);
      }
    }, 55);
  }, 700);
})();

(function initPinBoxes() {
  const boxes = [...document.querySelectorAll('.pb')];
  const CODE  = '11061974';
  const err   = document.getElementById('gerr');
  const form  = document.getElementById('gf');

  function getCode() { return boxes.map(b => b.value).join(''); }

  function attemptVerify() {
    if (getCode().length < 8) return;
    if (getCode() === CODE) {
      verify();
    } else {
      err.classList.remove('hide');
      form.classList.add('shake');
      boxes.forEach(b => { b.value = ''; b.classList.remove('filled'); });
      boxes[0].focus();
      setTimeout(() => { form.classList.remove('shake'); err.classList.add('hide'); }, 700);
    }
  }

  boxes.forEach((box, i) => {
    box.addEventListener('input', e => {
      const v = e.target.value.replace(/[^0-9]/g, '');
      box.value = v.slice(-1);
      box.classList.toggle('filled', box.value !== '');
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
      if (i === boxes.length - 1 && getCode().length === 8) attemptVerify();
    });

    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        boxes[i - 1].value = '';
        boxes[i - 1].classList.remove('filled');
        boxes[i - 1].focus();
      }
      if (e.key === 'Enter') attemptVerify();
    });

    /* Handle paste — user pastes full code into first box */
    box.addEventListener('paste', e => {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData)
        .getData('text').replace(/[^0-9]/g, '').slice(0, 8);
      boxes.forEach((b, idx) => {
        b.value = pasted[idx] || '';
        b.classList.toggle('filled', !!b.value);
      });
      const next = boxes[Math.min(pasted.length, 7)];
      if (next) next.focus();
      if (pasted.length === 8) attemptVerify();
    });
  });

  /* Focus first box automatically */
  setTimeout(() => boxes[0] && boxes[0].focus(), 300);

  /* Remove old verify button click and replace */
  const btn = document.getElementById('gbtn');
  if (btn) {
    btn.addEventListener('click', attemptVerify);
    btn.addEventListener('touchend', e => { e.preventDefault(); attemptVerify(); });
  }
})();

function verify() {
  const val = [...document.querySelectorAll('.pb')].map(b=>b.value).join('');
  const err = document.getElementById('gerr');
  const form = document.getElementById('gf');
  const ok = document.getElementById('gok');
  const gate = document.getElementById('gate');
  const main = document.getElementById('main');

  if (val === CODE) {
    form.style.display = 'none';
    ok.classList.add('show');
    gate.classList.add('opening');
    main.classList.add('is-entering');
    setTimeout(() => {
      gate.classList.add('gone');
      main.style.opacity = '1';
      initAll();
    }, 1800);
  } else {
    err.classList.remove('hide');
    form.classList.add('shake');
    document.getElementById('pin').value = '';
    setTimeout(() => {
      form.classList.remove('shake');
      err.classList.add('hide');
    }, 700);
  }
}

function initSpot() {
  const hero = document.getElementById('hero');
  const spot = document.getElementById('hspot');
  const mv = (x, y) => {
    spot.style.background = `radial-gradient(circle 480px at ${x}px ${y}px,rgba(201,168,76,.08) 0%,transparent 60%)`;
  };
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    mv(e.clientX - r.left, e.clientY - r.top);
  }, { passive: true });
  hero.addEventListener('touchmove', (e) => {
    const r = hero.getBoundingClientRect();
    mv(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
  }, { passive: true });
}

const ROLES = ['Father', 'Mentor', 'Provider', 'Legend', 'Friend'];
let ri = 0, ci = 0, del = false;
const rEl = document.getElementById('rtxt');
function typeRole() {
  if (!rEl) return;
  const w = ROLES[ri];
  rEl.textContent = del ? w.slice(0, --ci) : w.slice(0, ++ci);
  if (!del && ci === w.length) {
    del = true;
    setTimeout(typeRole, 1500);
    return;
  }
  if (del && ci === 0) {
    del = false;
    ri = (ri + 1) % ROLES.length;
  }
  setTimeout(typeRole, del ? 55 : 110);
}

function initScroll() {
  const bar = document.getElementById('progress');
  const btt = document.getElementById('btt');
  window.addEventListener('scroll', () => {
    const s = document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${h > 0 ? (s / h) * 100 : 0}%`;
    btt.classList.toggle('vis', s > 600);
  }, { passive: true });
}

function initNav() {
  const nav = document.getElementById('snav');
  const dots = [...document.querySelectorAll('.snd')];
  const secs = dots.map((d) => document.getElementById(d.dataset.t)).filter(Boolean);
  nav.classList.add('vis');
  dots.forEach((d, i) => {
    d.addEventListener('click', () => secs[i] && secs[i].scrollIntoView({ behavior: 'smooth' }));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        dots.forEach((d) => d.classList.toggle('on', d.dataset.t === e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  secs.forEach((s) => io.observe(s));
}

function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.rvc').forEach((c, i) => {
        setTimeout(() => c.classList.add('in'), i * 100);
      });
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('.rv, .gl').forEach((el) => io.observe(el));
}

function initTl() {
  const track = document.getElementById('tlt');
  if (!track) return;
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) track.classList.add('on');
  }, { threshold: 0.08 }).observe(document.getElementById('tlb'));
}

function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        scramble(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach((el) => io.observe(el));
}

function scramble(el) {
  const tgt = parseInt(el.dataset.t, 10);
  if (Number.isNaN(tgt)) return;
  let f = 0;
  const sF = 18, cF = 60;
  (function tick() {
    if (f < sF) {
      el.textContent = Math.floor(Math.random() * 99);
    } else {
      const p = Math.min((f - sF) / cF, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * tgt);
    }
    f++;
    if (f <= sF + cF) requestAnimationFrame(tick);
    else el.textContent = tgt;
  })();
}

function initTilt() {
  if (window.matchMedia('(hover:none)').matches) return;
  document.querySelectorAll('.qc, .mc').forEach((card) => {
    card.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.025)`;
      card.style.boxShadow = `${-x * 16}px ${y * 16}px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(201, 168, 76, 0.08)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'none';
      card.style.boxShadow = 'none';
    });
  });
}

function initConfetti() {
  const finale = document.getElementById('finale');
  const canvas = document.getElementById('cc');
  if (!canvas || !finale) return;
  let fired = false;
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !fired) {
      fired = true;
      fireworks(canvas);
    }
  }, { threshold: 0.25 }).observe(finale);
}

function fireworks(canvas) {
  const ctx = canvas.getContext('2d');
  function sz() {
    canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || 600;
  }
  sz();
  window.addEventListener('resize', sz, { passive: true });
  const W = canvas.width, H = canvas.height;
  const COLORS = ['#C9A84C', '#E8C870', '#FFD700', '#FFF8DC', '#B8860B', '#FFFACD'];
  let pts = [];
  let fr = 0;

  function burst(ox, oy, n, spread = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * (10 * spread) + (3 * spread);
      pts.push({
        x: ox,
        y: oy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 0.8,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: 1,
        r: Math.random() * 3.2 + 1.2,
        trail: [],
        shape: Math.random() > 0.4 ? 'c' : 'r',
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.22,
        life: Math.random() * 90 + 80,
      });
    }
  }

  [
    { x: W * 0.5, y: H * 0.78, n: 90, t: 0, spread: 1.0 },
    { x: W * 0.2, y: H * 0.84, n: 60, t: 350, spread: 0.8 },
    { x: W * 0.8, y: H * 0.84, n: 60, t: 700, spread: 0.8 },
    { x: W * 0.5, y: H * 0.72, n: 55, t: 1000, spread: 0.9 },
    { x: W * 0.5, y: H * 0.76, n: 40, t: 1400, spread: 0.7 }
  ].forEach((l) => setTimeout(() => burst(l.x, l.y, l.n, l.spread), l.t));

  (function loop() {
    ctx.fillStyle = 'rgba(10,10,10,0.14)';
    ctx.fillRect(0, 0, W, H);
    pts.forEach((p) => {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 7) p.trail.shift();
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;
      p.vx *= 0.985;
      p.rot += p.rv;
      p.life -= 1;
      p.a = Math.max(0, p.a - 0.008);
      if (p.life <= 0) p.a = 0;
      for (let t = 0; t < p.trail.length - 1; t++) {
        ctx.save();
        ctx.globalAlpha = p.a * (t / p.trail.length) * 0.32;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.r * 0.55;
        ctx.beginPath();
        ctx.moveTo(p.trail[t].x, p.trail[t].y);
        ctx.lineTo(p.trail[t + 1].x, p.trail[t + 1].y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.a);
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.shape === 'r') {
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    pts = pts.filter((p) => p.a > 0 && p.y < H + 80);
    fr++;
    if (fr < 360 || pts.length > 0) requestAnimationFrame(loop);
    else {
      ctx.clearRect(0, 0, W, H);
      const rb = document.getElementById('replay-btn');
      if (rb) {
        rb.classList.add('vis');
        rb.onclick = () => {
          ctx.clearRect(0, 0, W, H);
          fireworks(canvas);
        };
      }
    }
  })();
}

function initRipple() {
  document.querySelectorAll('.rph').forEach((el) => {
    el.addEventListener('touchstart', function (e) {
      const r = this.getBoundingClientRect();
      const t = e.touches[0];
      const rip = document.createElement('span');
      const sz = Math.max(r.width, r.height) * 1.7;
      rip.className = 'rip';
      rip.style.cssText = `width:${sz}px;height:${sz}px;left:${t.clientX - r.left - sz / 2}px;top:${t.clientY - r.top - sz / 2}px;`;
      this.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    }, { passive: true });
  });
}

function initAll() {
  const required = ['hero','hspot','rtxt','snav','main','progress','btt','finale','cc','tlb','tlt'];
  for (const id of required) {
    if (!document.getElementById(id)) {
      console.warn('Missing element:', id);
    }
  }
  initSpot && initSpot();
  initReveal && initReveal();
  initCounters && initCounters();
  initTl && initTl();
  initScroll && initScroll();
  initNav && initNav();
  initConfetti && initConfetti();
  initRipple && initRipple();
  initTilt && initTilt();
  typeRole && typeRole();
  initAudio && initAudio();
  initEasterEgg && initEasterEgg();
}

function initAudio() {
  const btn = document.getElementById('audio-btn');
  if (!btn) return;
  btn.classList.add('vis');

  let actx = null, nodes = [], playing = false;

  function buildAmbient(ctx) {
    /* A major pad — warm and soft */
    const freqs = [110, 138.59, 164.81, 220, 246.94];
    freqs.forEach((freq, idx) => {
      const osc    = ctx.createOscillator();
      const gain   = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const lfo    = ctx.createOscillator();
      const lfoG   = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      filter.Q.value = 0.5;
      gain.gain.value = 0.018;

      lfo.frequency.value = 0.08 + idx * 0.03;
      lfoG.gain.value = 0.008;

      lfo.connect(lfoG);
      lfoG.connect(gain.gain);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(); lfo.start();
      nodes.push(osc, lfo);
    });
  }

  btn.addEventListener('click', () => {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      buildAmbient(actx);
      playing = true;
      btn.classList.remove('muted');
    } else if (playing) {
      actx.suspend();
      playing = false;
      btn.classList.add('muted');
    } else {
      actx.resume();
      playing = true;
      btn.classList.remove('muted');
    }
  });

  btn.addEventListener('touchend', e => e.preventDefault());
}

function initEasterEgg() {
  const egg   = document.getElementById('egg');
  const close = document.getElementById('egg-close');
  const seal  = document.querySelector('.fseal');
  if (!egg || !seal) return;

  /* Trigger: tap footer seal 5 times within 3 seconds */
  let taps = 0, timer = null;
  seal.style.cursor = 'pointer';
  seal.style.touchAction = 'manipulation';
  seal.addEventListener('click', () => {
    taps++;
    clearTimeout(timer);
    if (taps >= 5) {
      taps = 0;
      egg.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      timer = setTimeout(() => { taps = 0; }, 3000);
    }
  });

  /* Close */
  close.addEventListener('click', closeEgg);
  close.addEventListener('touchend', e => { e.preventDefault(); closeEgg(); });
  egg.addEventListener('click', e => { if (e.target === egg) closeEgg(); });

  function closeEgg() {
    egg.classList.remove('open');
    document.body.style.overflow = '';
  }
}
})();
