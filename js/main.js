/* ============================================================
   共通スクリプト: ヘッダー / モバイルナビ / スクロール出現 / ページトップ
============================================================ */
(function () {
  'use strict';

  /* ?noanim 付きURLでは出現アニメーションを無効化（スクリーンショット・検証用） */
  var noanim = /[?&]noanim/.test(location.search);
  if (noanim) document.documentElement.classList.add('noanim');

  var header = document.querySelector('.site-header');
  var pagetop = document.querySelector('.pagetop');

  /* ヘッダー背景 & 自動格納 & ページトップ表示 */
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle('scrolled', y > 40);
      var down = y > lastY;
      header.classList.toggle('hide', down && y > 320 && !document.body.classList.contains('nav-open'));
    }
    if (pagetop) pagetop.classList.toggle('on', y > 600);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* モバイルナビ */
  var tgl = document.querySelector('.nav-tgl');
  if (tgl) {
    tgl.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.gnav a'), function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* スクロール出現（.rv / .pic カーテンリビール） */
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 })
    : null;

  function reveal() {
    Array.prototype.forEach.call(document.querySelectorAll('.rv:not(.on), .pic:not(.on)'), function (el) {
      if (io && !noanim) { io.observe(el); } else { el.classList.add('on'); }
    });
  }
  window.reveal = reveal; // equalweb.js が描画後に再実行する
  reveal();

  /* パララックス（.plx に --plx を渡す） */
  var plxEls = document.querySelectorAll('.plx');
  if (plxEls.length && !noanim && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    function plx() {
      ticking = false;
      var vh = window.innerHeight;
      Array.prototype.forEach.call(plxEls, function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var offset = ((r.top + r.height / 2) - vh / 2) / vh; // -0.5〜0.5程度
        el.style.setProperty('--plx', (offset * -34).toFixed(1) + 'px');
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(plx); }
    }, { passive: true });
    plx();
  }

  /* ヒーロー動画の再生保証（自動再生ブロック時は静止画のまま） */
  var hv = document.querySelector('.video-bg video');
  if (hv) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }

  /* 数字カウントアップ（.stat .num[data-count]） */
  var counters = document.querySelectorAll('[data-count]');
  if (noanim) {
    Array.prototype.forEach.call(counters, function (el) {
      el.firstChild.nodeValue = el.getAttribute('data-count');
    });
  } else if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        var el = e.target, goal = parseFloat(el.getAttribute('data-count')) || 0;
        var start = null, dur = 1400;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var v = goal * (1 - Math.pow(1 - p, 3));
          el.firstChild.nodeValue = (goal % 1 === 0) ? String(Math.round(v)) : v.toFixed(1);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
  }
})();
