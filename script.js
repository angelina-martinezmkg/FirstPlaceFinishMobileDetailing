(function () {
  'use strict';

  var root = document.documentElement;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var reduced = root.classList.contains('reduced');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var anim = hasGsap && !reduced;

  if (!hasGsap) { root.classList.remove('js'); root.classList.add('no-js'); }
  else { gsap.registerPlugin(ScrollTrigger); }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (anim && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(el) {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'home' ? 0 : -70, duration: 1.3 });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Nav ---------- */
  var nav = $('#nav');
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    if (!document.body.classList.contains('menu-open')) {
      if (y > 500 && y > lastY + 2) nav.classList.add('is-hidden');
      else if (y < lastY - 2 || y <= 500) nav.classList.remove('is-hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger');
  var menu = $('#mmenu');
  var menuOpen = false;
  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    nav.classList.remove('is-hidden');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    if (anim) {
      gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .7, ease: 'power3.inOut' });
      gsap.fromTo($$('nav a, .mmenu__cta > *', menu), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, delay: .25, ease: 'power3.out' });
    }
  }
  function closeMenu(cb) {
    if (!menuOpen) { if (cb) cb(); return; }
    menuOpen = false;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    var done = function () {
      menu.hidden = true;
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      if (cb) cb();
    };
    if (anim) gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: .5, ease: 'power3.inOut', onComplete: done });
    else done();
  }
  burger.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { closeMenu(); burger.focus(); } });
  window.addEventListener('resize', function () { if (menuOpen && window.innerWidth > 1100) closeMenu(); });

  /* ---------- Form helpers (used by builder + anchors) ---------- */
  var fService = $('#f-service');
  function fieldOf(el) { return el.closest('.field'); }
  function setErr(el) { fieldOf(el).classList.add('is-invalid'); el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'e-' + el.name); }
  function clearErr(el) { var f = fieldOf(el); if (!f) return; f.classList.remove('is-invalid'); el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }

  /* ---------- Build your detail ---------- */
  var V = {
    car: {
      label: 'Car',
      body: 'M34 196L34 168Q36 148 62 142L168 128Q206 96 252 84Q300 76 372 78Q416 80 450 104L476 122L566 134Q600 140 604 166L606 196Z',
      extra: '',
      glass: 'M196 126Q222 100 258 92L330 89L332 126ZM346 126L344 89L372 89Q410 92 438 122L440 126Z',
      seats: [[392, 126, 99], [288, 126, 101]],
      lamp: [592, 150], wheels: [150, 494], top: 84
    },
    suv: {
      label: 'SUV',
      body: 'M30 196L30 150Q32 128 58 122L150 114L196 66Q204 58 218 58L470 58Q486 58 498 70L548 116Q596 122 604 150L606 196Z',
      extra: '',
      glass: 'M206 110L232 72L340 72L340 110ZM354 110L354 72L470 72Q478 72 484 80L516 110Z',
      seats: [[438, 110, 81], [294, 110, 81]],
      lamp: [592, 140], wheels: [150, 496], top: 62
    },
    truck: {
      label: 'Truck',
      body: 'M28 196L28 124L330 124L330 112L372 62Q378 56 390 56L478 56Q492 56 500 68L536 116Q596 122 606 150L608 196Z',
      extra: 'M28 134L330 134M330 124L330 196',
      glass: 'M384 108L398 70L470 70Q480 70 486 78L512 108Z',
      seats: [[442, 108, 79]],
      lamp: [594, 140], wheels: [136, 500], top: 60
    },
    van: {
      label: 'Van',
      body: 'M30 196L30 62Q30 46 46 46L470 46Q488 46 500 58L560 112Q600 120 606 150L608 196Z',
      extra: '',
      glass: 'M60 102L60 62L190 62L190 102ZM206 102L206 62L360 62L360 102ZM376 102L376 62L468 62Q480 62 488 72L520 102Z',
      seats: [[442, 102, 75], [294, 102, 75], [128, 102, 75]],
      lamp: [594, 140], wheels: [140, 500], top: 50
    }
  };
  var ADD = { paint: 'Paint enhancement', ceramic: 'Ceramic coating', headlight: 'Headlights', wheels: 'Wheels & tires' };
  var PKG = { 'Interior Detail': 'in', 'Exterior Detail': 'ex', 'Full Detail': 'full' };
  var rig = $('.rig');
  var svg = $('.veh');
  var state = { veh: 'car', pkg: 'Full Detail', adds: [] };

  function seatPath(x, base, top) {
    return 'M' + (x - 8) + ' ' + base + 'L' + (x - 12) + ' ' + (top + 6) + 'Q' + (x - 12) + ' ' + top + ' ' + (x - 6) + ' ' + top +
      'L' + (x + 4) + ' ' + top + 'Q' + (x + 10) + ' ' + top + ' ' + (x + 10) + ' ' + (top + 6) + 'L' + (x + 12) + ' ' + base + 'Z';
  }
  function rand(seed) { var s = seed; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function drawVehicle(key) {
    var v = V[key];
    $('.veh__body', svg).setAttribute('d', v.body);
    $('.clip-shape', svg).setAttribute('d', v.body);
    $('.veh__outline', svg).setAttribute('d', v.body + (v.extra || ''));
    $('.veh__glass', svg).setAttribute('d', v.glass);
    var seats = $('.veh__seats', svg);
    var ns = 'http://www.w3.org/2000/svg';
    seats.innerHTML = '';
    v.seats.forEach(function (s) { var p = document.createElementNS(ns, 'path'); p.setAttribute('d', seatPath(s[0], s[1], s[2])); seats.appendChild(p); });
    var lamp = $('.veh__lamp', svg);
    lamp.setAttribute('transform', 'translate(' + v.lamp[0] + ' ' + v.lamp[1] + ')');
    $$('.veh__wheel', svg).forEach(function (w, i) { w.setAttribute('transform', 'translate(' + v.wheels[i] + ' 196)'); });
    var beads = $('.veh__beads', svg);
    beads.setAttribute('clip-path', 'url(#clip-body)');
    beads.innerHTML = '';
    var r = rand(key.length * 31 + 7);
    for (var i = 0; i < 34; i++) {
      var c = document.createElementNS(ns, 'circle');
      var x = 50 + r() * 540, y = v.top + 40 + r() * (150 - v.top);
      if (y > 150 && (Math.abs(x - v.wheels[0]) < 50 || Math.abs(x - v.wheels[1]) < 50)) y -= 40;
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', (1.4 + r() * 2.8).toFixed(1));
      beads.appendChild(c);
    }
  }
  function updateTicket() {
    $('[data-out="veh"]').textContent = V[state.veh].label;
    $('[data-out="pkg"]').textContent = state.pkg;
    $('[data-out="adds"]').textContent = state.adds.length ? '+ ' + state.adds.map(function (a) { return ADD[a]; }).join(', ') : 'No extras';
    rig.setAttribute('data-pkg', PKG[state.pkg]);
    Object.keys(ADD).forEach(function (a) { rig.classList.toggle('add-' + a, state.adds.indexOf(a) > -1); });
  }
  function shine() {
    if (!anim) return;
    gsap.fromTo($('.veh__shine', svg), { attr: { x: -260 } }, { attr: { x: 700 }, duration: 1.1, ease: 'power2.inOut' });
  }
  function spinWheels(dur, turns) {
    if (!anim) return;
    gsap.fromTo($$('.veh__spokes', svg), { rotation: 0 }, { rotation: 360 * turns, duration: dur, ease: 'power2.inOut', transformOrigin: '50% 50%' });
  }
  var swapping = false, drawn = 'car';
  function setVehicle(key) {
    if (key === state.veh && !swapping) return;
    state.veh = key;
    updateTicket();
    if (swapping) return; // picked up when the current swap finishes
    var g = $('.veh__all', svg);
    if (!anim) { drawVehicle(key); drawn = key; return; }
    swapping = true;
    gsap.timeline({ onComplete: function () { swapping = false; if (drawn !== state.veh) { var k = state.veh; state.veh = drawn; setVehicle(k); } } })
      .to(g, { x: 760, duration: .55, ease: 'power2.in', onStart: function () { spinWheels(.55, 2); } })
      .add(function () { drawn = state.veh; drawVehicle(drawn); })
      .fromTo(g, { x: -760 }, { x: 0, duration: .8, ease: 'power3.out', onStart: function () { spinWheels(.8, 2.5); } })
      .add(shine, '-=.2');
  }
  if (rig && svg) {
    drawVehicle('car');
    updateTicket();
    $$('[data-veh]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-veh]').forEach(function (o) { var on = o === b; o.classList.toggle('is-active', on); o.setAttribute('aria-checked', String(on)); });
        setVehicle(b.dataset.veh);
      });
    });
    $$('[data-pkg]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-pkg]').forEach(function (o) { var on = o === b; o.classList.toggle('is-active', on); o.setAttribute('aria-checked', String(on)); });
        if (state.pkg === b.dataset.pkg) return;
        state.pkg = b.dataset.pkg;
        updateTicket();
        shine();
      });
    });
    $$('.opt__b--x').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.dataset.add, i = state.adds.indexOf(a);
        if (i > -1) state.adds.splice(i, 1); else state.adds.push(a);
        b.setAttribute('aria-pressed', String(i < 0));
        updateTicket();
        if (i < 0 && a === 'paint') shine();
        if (i < 0 && a === 'wheels') spinWheels(1, 1);
        if (i < 0 && a === 'ceramic' && anim) gsap.fromTo($$('.veh__beads circle', svg), { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: .5, stagger: .015, ease: 'back.out(3)' });
      });
    });
    // roving focus for radio groups
    $$('.opt__row[role="radiogroup"]').forEach(function (row) {
      row.addEventListener('keydown', function (e) {
        var btns = $$('.opt__b', row), i = btns.indexOf(document.activeElement);
        if (i < 0) return;
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + btns.length) % btns.length;
        if (n === null) return;
        e.preventDefault(); btns[n].focus(); btns[n].click();
      });
    });
    // send choices to the form
    $('.ticket__go').addEventListener('click', function () {
      var radio = $('input[name="vehicle-type"][value="' + V[state.veh].label + '"]');
      if (radio) radio.checked = true;
      fService.value = state.pkg; clearErr(fService);
      $$('.chips--x input').forEach(function (cb) { cb.checked = state.adds.indexOf(cb.dataset.add) > -1; });
    });
  }

  /* ---------- Anchors + preselect ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (a.dataset.service && fService) { fService.value = a.dataset.service; clearErr(fService); }
      closeMenu(function () {
        scrollToEl(target);
        if (id === '#contact') setTimeout(function () { var f = $('#f-name'); if (f) f.focus({ preventScroll: true }); }, lenis ? 1300 : 600);
      });
    });
  });

  /* ---------- Mobile bar ---------- */
  var mbar = $('.mbar');
  var hero = $('.hero');
  if (mbar && 'IntersectionObserver' in window) {
    var vis = { contact: false, hero: true };
    var upd = function () { mbar.classList.toggle('is-hidden', vis.contact || vis.hero); };
    new IntersectionObserver(function (en) { vis.contact = en[0].isIntersecting; upd(); }, { threshold: 0, rootMargin: '0px 0px -35% 0px' }).observe($('#contact'));
    new IntersectionObserver(function (en) { vis.hero = en[0].intersectionRatio > .55; upd(); }, { threshold: [0, .55, 1] }).observe(hero);
  }

  /* ---------- Hero spotlight ---------- */
  var hMedia = $('.hero__media');
  if (finePointer && !reduced && hMedia) {
    var tx = 70, ty = 60, cx = 70, cy = 60, rafOn = false;
    var tick = function () {
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      hMedia.style.setProperty('--sx', cx.toFixed(2) + '%');
      hMedia.style.setProperty('--sy', cy.toFixed(2) + '%');
      if (Math.abs(tx - cx) > .1 || Math.abs(ty - cy) > .1) requestAnimationFrame(tick); else rafOn = false;
    };
    hero.addEventListener('pointermove', function (e) {
      var r = hMedia.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width * 100; ty = (e.clientY - r.top) / r.height * 100;
      hero.classList.add('is-lit');
      if (!rafOn) { rafOn = true; requestAnimationFrame(tick); }
    });
    hero.addEventListener('pointerleave', function () { hero.classList.remove('is-lit'); });
  }

  /* ---------- Intro word split ---------- */
  var introText = $('.intro__text');
  var words = [];
  if (introText) {
    var txt = introText.textContent.trim().split(/\s+/);
    introText.innerHTML = txt.map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = $$('.w', introText);
  }

  /* ---------- Accordion ---------- */
  $$('.acc__btn').forEach(function (btn) {
    var p = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (!anim) { p.hidden = open; return; }
      if (open) {
        gsap.to(p, { height: 0, duration: .45, ease: 'power3.inOut', onComplete: function () { p.hidden = true; p.style.height = ''; ScrollTrigger.refresh(); } });
      } else {
        p.hidden = false;
        gsap.fromTo(p, { height: 0 }, { height: 'auto', duration: .5, ease: 'power3.out', onComplete: function () { p.style.height = ''; ScrollTrigger.refresh(); } });
        gsap.fromTo(p.firstElementChild, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: .5, delay: .08 });
      }
    });
  });

  /* ---------- Form ---------- */
  var form = $('.qform');
  var success = $('.qsuccess');
  var errBox = $('.qform__error');
  var submit = $('.qform__submit');
  var dateEl = $('#f-date');
  if (dateEl) {
    var now = new Date();
    dateEl.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateEl.addEventListener('change', function () { if (dateEl.value && dateEl.value < dateEl.min) dateEl.value = dateEl.min; });
  }
  function check(el) {
    var v = (el.value || '').trim(), ok = true;
    if (el.name === 'name') ok = v.length >= 2;
    else if (el.name === 'phone') ok = v.replace(/\D/g, '').length >= 10;
    else if (el.name === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    else if (el.name === 'service') ok = !!v;
    ok ? clearErr(el) : setErr(el);
    return ok;
  }
  var req = ['#f-name', '#f-phone', '#f-email', '#f-service'].map(function (s) { return $(s); });
  req.forEach(function (el) {
    el.addEventListener('blur', function () { if (el.value) check(el); });
    el.addEventListener('input', function () { if (fieldOf(el).classList.contains('is-invalid')) check(el); });
    el.addEventListener('change', function () { if (fieldOf(el).classList.contains('is-invalid')) check(el); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.hidden = true;
    var bad = req.filter(function (el) { return !check(el); });
    if (bad.length) { bad[0].focus(); return; }
    if (dateEl && dateEl.value && dateEl.value < dateEl.min) dateEl.value = dateEl.min;
    var data = new URLSearchParams(new FormData(form)).toString();
    submit.disabled = true;
    submit.classList.add('is-loading');
    $('.qform__label', submit).textContent = 'Sending...';
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: data })
      .then(function (r) {
        if (!r.ok) throw new Error('Status ' + r.status);
        form.hidden = true;
        success.hidden = false;
        success.focus();
        if (anim) gsap.from(success.children, { y: 20, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' });
      })
      .catch(function () { errBox.hidden = false; })
      .then(function () {
        submit.disabled = false;
        submit.classList.remove('is-loading');
        $('.qform__label', submit).textContent = 'Send my request';
      });
  });

  if (!hasGsap) return;

  /* ---------- Magnetic ---------- */
  if (finePointer && !reduced) {
    $$('.magnetic').forEach(function (el) {
      var xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3' });
      var yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .22);
        yTo((e.clientY - r.top - r.height / 2) * .32);
      });
      el.addEventListener('mouseleave', function () { xTo(0); yTo(0); });
    });
  }

  var laps = $$('.lap');
  if (reduced) {
    words.forEach(function (w) { w.classList.add('is-on'); });
    laps.forEach(function (l) { l.classList.add('is-on'); });
    return;
  }

  /* ---------- Hero intro ---------- */
  var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero__media img', { scale: 1.15, opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
    .fromTo('.hero__sweep', { xPercent: -60 }, { xPercent: 60, duration: 2.2, ease: 'power2.inOut' }, .5)
    .from('.nav__in > *', { y: -20, opacity: 0, duration: .8, stagger: .08 }, .3)
    .from('.pill', { y: 20, opacity: 0, duration: .8 }, .5)
    .from('.ln__in', { yPercent: 110, duration: 1.2, stagger: .13 }, .6)
    .from('.hero__lead, .hero__btns > *', { y: 24, opacity: 0, duration: .9, stagger: .08 }, 1.15)
    .from('.hero__foot', { opacity: 0, duration: 1 }, 1.7)
    .from('.hero .checker', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'power3.inOut' }, 1.2);
  gsap.fromTo('.hero__sweep', { xPercent: -60 }, { xPercent: 60, duration: 2.4, ease: 'power2.inOut', repeat: -1, repeatDelay: 5, delay: 7 });

  gsap.to('.hero__media img', { yPercent: 10, scale: 1.05, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__content', { y: -80, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- Generic reveals ---------- */
  $$('.sec-head, .build__copy > .kick, .build__copy > .h2, .build__copy > .lead, .desert__head > *, .faq__head, .contact__copy > *, .intro .kick').forEach(function (el) {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* ---------- Intro words ---------- */
  if (words.length) {
    ScrollTrigger.create({
      trigger: introText, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: function (self) {
        var n = Math.round(self.progress * words.length);
        words.forEach(function (w, i) { w.classList.toggle('is-on', i < n); });
      }
    });
  }
  gsap.from('.intro__pts li', { y: 50, opacity: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.intro__pts', start: 'top 88%' } });

  /* ---------- Services grid ---------- */
  $$('.slot').forEach(function (s) {
    gsap.fromTo(s, { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 90%' } });
    gsap.fromTo($('.slot__img', s), { clipPath: 'inset(0% 0% 100% 0% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', duration: 1.2, ease: 'power3.inOut', scrollTrigger: { trigger: s, start: 'top 90%' } });
  });
  gsap.from('.grid__flag', { scale: .9, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.grid__flag', start: 'top 92%' } });

  /* ---------- Build ---------- */
  gsap.from('.opt', { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.opt', start: 'top 90%' } });
  gsap.from('.rig', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.rig', start: 'top 85%' } });
  gsap.from('.ticket', { y: 40, opacity: 0, duration: 1, delay: .15, ease: 'power3.out', scrollTrigger: { trigger: '.rig', start: 'top 80%' } });
  ScrollTrigger.create({
    trigger: '.rig', start: 'top 70%', once: true,
    onEnter: function () {
      var g = $('.veh__all');
      gsap.fromTo(g, { x: -760 }, { x: 0, duration: 1.3, ease: 'power3.out' });
      spinWheels(1.3, 3);
      gsap.delayedCall(1, shine);
    }
  });

  /* ---------- Desert ---------- */
  gsap.fromTo('.desert__media', { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.desert', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.desert__sun', { top: '6%', left: '80%', scale: .8 }, { top: '34%', left: '62%', scale: 1.2, ease: 'none', scrollTrigger: { trigger: '.desert', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.dcard', { y: 60, opacity: 0, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.desert__cards', start: 'top 88%' } });

  /* ---------- Track ---------- */
  var track = $('.track');
  var mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', function () {
    gsap.set(track, { '--p': 0 });
    laps.forEach(function (l) { l.classList.remove('is-on'); });
    var st = ScrollTrigger.create({
      trigger: track, start: 'top 75%', end: 'bottom 55%', scrub: .6,
      onUpdate: function (self) {
        var p = self.progress;
        track.style.setProperty('--p', p.toFixed(4));
        laps.forEach(function (l, i) { l.classList.toggle('is-on', p >= i / (laps.length - 1) - .02); });
      }
    });
    gsap.from(laps, { y: 40, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: '.track__steps', start: 'top 88%' } });
    return function () { st.kill(); track.style.removeProperty('--p'); };
  });
  mm.add('(max-width: 760px)', function () {
    var sts = laps.map(function (l) {
      gsap.from(l, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: l, start: 'top 90%' } });
      return ScrollTrigger.create({ trigger: l, start: 'top 72%', onEnter: function () { l.classList.add('is-on'); }, onLeaveBack: function () { l.classList.remove('is-on'); } });
    });
    return function () { sts.forEach(function (s) { s.kill(); }); };
  });

  /* ---------- Band ---------- */
  gsap.fromTo('.band__line--a', { xPercent: 0 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.band__line--b', { xPercent: -28 }, { xPercent: -4, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.band__bg img', { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Gallery mosaic ---------- */
  gsap.from('.tile', { y: 60, opacity: 0, duration: 1.1, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.mosaic', start: 'top 85%' } });
  mm.add('(min-width: 901px)', function () {
    $$('.mosaic__col').forEach(function (c) {
      var s = parseFloat(c.dataset.speed) || 0;
      gsap.fromTo(c, { yPercent: -s }, { yPercent: s, ease: 'none', scrollTrigger: { trigger: '.mosaic', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  });

  /* ---------- FAQ / contact / footer ---------- */
  gsap.from('.acc__item', { y: 30, opacity: 0, duration: .8, stagger: .07, ease: 'power3.out', scrollTrigger: { trigger: '.acc', start: 'top 85%' } });
  gsap.from('.formcard', { y: 70, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.formcard', start: 'top 88%' } });
  gsap.fromTo('.foot__big', { xPercent: -10 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  gsap.from('.checker--foot', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.foot', start: 'top 92%' } });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
