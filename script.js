/* ============================================================
   NIPUN ANAND — PORTFOLIO v4
   Dark premium — animated geometry, scroll reveals, interactions.
   Performance: pauses canvas animation when tab is hidden.
   ============================================================ */

(function () {
  'use strict';

  /* ==== ANIMATED GEOMETRIC CANVAS ==== */
  var canvas = document.getElementById('geoCanvas');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w, h;
    var shapes = [];
    var mouse = { x: -1000, y: -1000 };
    var smoothMouse = { x: -1000, y: -1000 };
    var gridOpacity = 0.04;
    var time = 0;
    var animationId = null;
    var isVisible = true; // track tab visibility

    function resize() {
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createShapes() {
      shapes = [];
      var count = Math.min(Math.floor(w / 100), 15);
      for (var i = 0; i < count; i++) {
        shapes.push({
          x: Math.random() * w,
          y: Math.random() * h * 3,
          size: 20 + Math.random() * 60,
          type: Math.floor(Math.random() * 4),
          speed: 0.15 + Math.random() * 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.005,
          baseOpacity: 0.03 + Math.random() * 0.05,
          opacity: 0.03 + Math.random() * 0.05,
          color: Math.random() > 0.5 ? '99,102,241' : '34,211,238'
        });
      }
    }

    function drawGrid() {
      var spacing = 60;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,' + gridOpacity + ')';
      ctx.beginPath();
      for (var x = 0; x < w; x += spacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (var y = 0; y < h; y += spacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      if (smoothMouse.x > -500) {
        var glowR = 350;
        ctx.save();
        ctx.beginPath();
        ctx.arc(smoothMouse.x, smoothMouse.y, glowR, 0, Math.PI * 2);
        ctx.clip();

        ctx.strokeStyle = 'rgba(99,102,241,0.12)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        var startX = Math.max(0, Math.floor((smoothMouse.x - glowR) / spacing) * spacing);
        var endX = Math.min(w, smoothMouse.x + glowR);
        var startY = Math.max(0, Math.floor((smoothMouse.y - glowR) / spacing) * spacing);
        var endY = Math.min(h, smoothMouse.y + glowR);
        for (var gx = startX; gx <= endX; gx += spacing) {
          ctx.moveTo(gx, startY);
          ctx.lineTo(gx, endY);
        }
        for (var gy = startY; gy <= endY; gy += spacing) {
          ctx.moveTo(startX, gy);
          ctx.lineTo(endX, gy);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    function drawDots() {
      var spacing = 60;
      var radius = 400;
      var litDots = [];
      var pulse = Math.sin(time * 0.03) * 0.15;

      for (var x = 0; x < w; x += spacing) {
        for (var y = 0; y < h; y += spacing) {
          var dx = x - smoothMouse.x;
          var dy = y - smoothMouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            var t = 1 - dist / radius;
            var ease = t * t;
            var alpha = ease * (0.7 + pulse);
            var dotSize = 1.5 + ease * 3.5;

            ctx.beginPath();
            ctx.arc(x, y, dotSize + 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34,211,238,' + (alpha * 0.2) + ')';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99,102,241,' + alpha + ')';
            ctx.fill();

            litDots.push({ x: x, y: y, alpha: alpha });
          }
        }
      }

      if (litDots.length > 1) {
        var lineRadius = 100;
        ctx.lineWidth = 0.6;
        for (var i = 0; i < litDots.length; i++) {
          for (var j = i + 1; j < litDots.length; j++) {
            var ddx = litDots[i].x - litDots[j].x;
            var ddy = litDots[i].y - litDots[j].y;
            var dd = Math.sqrt(ddx * ddx + ddy * ddy);
            if (dd < lineRadius) {
              var lineAlpha = (1 - dd / lineRadius) * Math.min(litDots[i].alpha, litDots[j].alpha) * 0.5;
              ctx.beginPath();
              ctx.moveTo(litDots[i].x, litDots[i].y);
              ctx.lineTo(litDots[j].x, litDots[j].y);
              ctx.strokeStyle = 'rgba(99,102,241,' + lineAlpha + ')';
              ctx.stroke();
            }
          }
        }
      }
    }

    function drawMouseGlow() {
      if (smoothMouse.x < -500) return;
      var pulse = 1 + Math.sin(time * 0.02) * 0.1;
      var glowSize = 350 * pulse;

      var grad = ctx.createRadialGradient(
        smoothMouse.x, smoothMouse.y, 0,
        smoothMouse.x, smoothMouse.y, glowSize
      );
      grad.addColorStop(0, 'rgba(99,102,241,0.07)');
      grad.addColorStop(0.4, 'rgba(34,211,238,0.03)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(smoothMouse.x - glowSize, smoothMouse.y - glowSize, glowSize * 2, glowSize * 2);

      var core = ctx.createRadialGradient(smoothMouse.x, smoothMouse.y, 0, smoothMouse.x, smoothMouse.y, 60);
      core.addColorStop(0, 'rgba(255,255,255,0.04)');
      core.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = core;
      ctx.fillRect(smoothMouse.x - 60, smoothMouse.y - 60, 120, 120);
    }

    function drawShape(s, scrollY) {
      var sy = ((s.y - scrollY * s.speed) % (h * 1.5 + s.size * 2)) - s.size;

      var mdx = s.x - smoothMouse.x;
      var mdy = sy - smoothMouse.y;
      var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      var proxRadius = 350;
      var proxFactor = mDist < proxRadius ? (1 - mDist / proxRadius) : 0;
      var proxEase = proxFactor * proxFactor;

      s.opacity = s.baseOpacity + proxEase * 0.25;
      var currentRotSpeed = s.rotSpeed + proxEase * 0.02 * Math.sign(s.rotSpeed || 1);

      ctx.save();
      ctx.translate(s.x, sy);
      ctx.rotate(s.rotation);
      ctx.strokeStyle = 'rgba(' + s.color + ',' + s.opacity + ')';
      ctx.lineWidth = 1 + proxEase * 1;

      var sz = s.size / 2;
      switch (s.type) {
        case 0:
          ctx.beginPath();
          ctx.arc(0, 0, sz, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 1:
          ctx.strokeRect(-sz, -sz, s.size, s.size);
          break;
        case 2:
          ctx.beginPath();
          ctx.moveTo(0, -sz);
          ctx.lineTo(sz, sz);
          ctx.lineTo(-sz, sz);
          ctx.closePath();
          ctx.stroke();
          break;
        case 3:
          ctx.beginPath();
          ctx.moveTo(-sz, 0); ctx.lineTo(sz, 0);
          ctx.moveTo(0, -sz); ctx.lineTo(0, sz);
          ctx.stroke();
          break;
      }

      if (proxEase > 0.1) {
        ctx.strokeStyle = 'rgba(' + s.color + ',' + (proxEase * 0.1) + ')';
        ctx.lineWidth = 3 + proxEase * 4;
        if (s.type === 0) {
          ctx.beginPath();
          ctx.arc(0, 0, sz + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
      s.rotation += currentRotSpeed;
    }

    function animate() {
      // Only run if tab is visible — saves battery & CPU
      if (!isVisible) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = 'rgba(6,6,12,0.25)';
      ctx.fillRect(0, 0, w, h);
      if (time % 4 === 0) {
        ctx.clearRect(0, 0, w, h);
      }

      var scrollY = window.scrollY || window.pageYOffset;
      time++;

      if (mouse.x > -500) {
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.12;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.12;
      } else {
        smoothMouse.x = -1000;
        smoothMouse.y = -1000;
      }

      var grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, 'rgba(99,102,241,0.015)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      drawGrid();
      drawMouseGlow();
      drawDots();

      for (var i = 0; i < shapes.length; i++) {
        drawShape(shapes[i], scrollY);
      }

      animationId = requestAnimationFrame(animate);
    }

    resize();
    createShapes();
    animate();

    window.addEventListener('resize', function () {
      resize();
      createShapes();
    });

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', function () {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Pause animation when tab is hidden — saves battery & CPU
    document.addEventListener('visibilitychange', function () {
      isVisible = !document.hidden;
    });
  }


  /* ==== MOBILE NAVIGATION ==== */
  var hamburger = document.getElementById('hamburger');
  var nav = document.getElementById('nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* ==== HEADER SCROLL EFFECT ==== */
  var header = document.getElementById('header');
  var scrolled = false;
  window.addEventListener('scroll', function () {
    var isScrolled = window.scrollY > 20;
    if (isScrolled !== scrolled) {
      scrolled = isScrolled;
      header.classList.toggle('header--scrolled', scrolled);
    }
  }, { passive: true });


  /* ==== SCROLL REVEAL FALLBACK ==== */
  if (!CSS.supports || !CSS.supports('animation-timeline', 'scroll()')) {
    var fadeEls = document.querySelectorAll('.fade-in');
    fadeEls.forEach(function (el) { el.classList.add('fade-in--js'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(function (el) { observer.observe(el); });
  }


  /* ==== STAT COUNTER ANIMATION ==== */
  var statEls = document.querySelectorAll('[data-count]');
  if (statEls.length) {
    var statObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statObserver.observe(el); });
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.textContent.replace(/[0-9]/g, '');
    var duration = 1200;
    var start = performance.now();

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

})();
