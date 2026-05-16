// 動画フォールバック（読み込み失敗時はposter画像をimgに差し替え）
document.addEventListener("DOMContentLoaded", function() {
  function tryImageFallback(img, basePath) {
    var candidates = [basePath + ".png", basePath + ".jpg"];
    var index = 0;
    function next() {
      if (index >= candidates.length) return;
      var candidate = candidates[index++];
      var tester = new Image();
      tester.onload = function() { img.src = candidate; };
      tester.onerror = next;
      tester.src = candidate;
    }
    next();
  }

  document.querySelectorAll("img[src]").forEach(function(img) {
    img.addEventListener("error", function onImgError() {
      img.removeEventListener("error", onImgError);
      var src = img.getAttribute("src") || "";
      var basePath = src.replace(/\.[^.\/]+$/, "");
      if (basePath !== src) tryImageFallback(img, basePath);
    });
  });

  var vid = document.getElementById("sani-video");
  if (!vid) return;
  var fallback = function() {
    var img = document.createElement("img");
    var source = vid.querySelector("source");
    var sourceSrc = source ? (source.getAttribute("src") || "") : "";
    var basePath = sourceSrc.replace(/\.[^.\/]+$/, "");
    img.src = vid.getAttribute("poster");
    img.alt = "SANI-CAM";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:inherit;";
    img.addEventListener("error", function onFallbackError() {
      img.removeEventListener("error", onFallbackError);
      if (basePath && basePath !== sourceSrc) {
        tryImageFallback(img, basePath);
      }
    });
    vid.parentNode.replaceChild(img, vid);
  };
  // 3秒以内に再生開始しなければ画像に差し替え
  var timer = setTimeout(fallback, 3000);
  vid.addEventListener("playing", function() { clearTimeout(timer); }, { once: true });
  vid.querySelector("source").addEventListener("error", fallback, { once: true });
});

// ヘッダースクロール縮小
(function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }, { passive: true });
})();

// スムーズフェードイン on scroll
document.addEventListener("DOMContentLoaded", () => {
    // 年更新
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  
    const faders = document.querySelectorAll(".fade-up, .fade-in");
    const options = {
      threshold: 0.15,
      rootMargin: "0px 0px -10px 0px"
    };
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          // for fade-in without move, just opacity
          if (entry.target.classList.contains("fade-in")) {
            entry.target.style.transform = "none";
          }
          obs.unobserve(entry.target);
        }
      });
    }, options);

    faders.forEach(el => observer.observe(el));

    // グローバル業種切り替え（data-industry-tab / data-industry-panel）
    const industryTabs = document.querySelectorAll("[data-industry-tab]");
    const heroSection = document.getElementById("hero");
    if (industryTabs.length) {
      industryTabs.forEach(function(tab) {
        tab.addEventListener("click", function() {
          const target = tab.dataset.industryTab;
          industryTabs.forEach(function(t) {
            t.classList.toggle("is-active", t === tab);
          });
          if (heroSection) {
            heroSection.classList.remove("hero--mfg", "hero--med", "hero--food");
            heroSection.classList.add("hero--" + target);
          }
          document.querySelectorAll("[data-industry-panel]").forEach(function(panel) {
            panel.classList.toggle("is-active", panel.dataset.industryPanel === target);
          });
        });
      });
    }

    // LP内タブ・活用シーンタブ（.tab-group スコープ）
    document.querySelectorAll(".tab-group").forEach(function(group) {
      group.querySelectorAll("[data-tab]").forEach(function(tab) {
        tab.addEventListener("click", function() {
          const target = tab.dataset.tab;
          group.querySelectorAll("[data-tab]").forEach(function(t) {
            t.classList.toggle("is-active", t === tab);
          });
          group.querySelectorAll("[data-panel]").forEach(function(panel) {
            panel.classList.toggle("is-active", panel.dataset.panel === target);
          });
        });
      });
    });

    // テックアニメーション（比較グラフカルーセル）
    function startCarousel(carousel) {
      var panels = Array.from(carousel.querySelectorAll(".comp-chart-panel"));
      var dots   = Array.from(carousel.querySelectorAll(".carousel-dot"));
      if (!panels.length) return;
      var current = 0;
      var timer = null;

      function animateBars(panel) {
        panel.querySelectorAll(".comp-bar").forEach(function(bar) {
          bar.classList.remove("is-animated");
          void bar.offsetWidth;
          bar.classList.add("is-animated");
        });
      }

      function showPanel(index) {
        panels[current].classList.remove("is-active");
        if (dots[current]) dots[current].classList.remove("is-active");
        current = (index + panels.length) % panels.length;
        panels[current].classList.add("is-active");
        if (dots[current]) dots[current].classList.add("is-active");
        animateBars(panels[current]);
      }

      // ドットクリックで指定パネルへ移動＆自動再生停止
      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          if (timer) { clearInterval(timer); timer = null; }
          showPanel(i);
        });
      });

      animateBars(panels[0]);
      timer = setInterval(function() { showPanel(current + 1); }, 3200);
    }

    var techAnimObserver = new IntersectionObserver(function(entries, obs) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        if (entry.target.classList.contains("js-chart-carousel")) {
          startCarousel(entry.target);
        }
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".js-tech-anim").forEach(function(el) { techAnimObserver.observe(el); });

    // VF3.0 オーバーレイ・スライドショー(ぼかし消失→画像表示→次スライドへ)
    document.querySelectorAll("[data-vsg-slider]").forEach(function(slider) {
      var inner  = slider.querySelector(".vsg-slider__inner");
      var slides = slider.querySelectorAll(".vsg-slide");
      var dots   = slider.querySelectorAll(".vsg-dot");
      if (!slides.length || !inner) return;
      var current = 0;
      var timer = null;
      var DURATION = 5800;
      var FADE_MS  = 780;

      function goTo(idx) {
        inner.classList.add("is-fading");
        setTimeout(function() {
          slides[current].classList.remove("is-active");
          if (dots[current]) dots[current].classList.remove("is-active");
          current = (idx + slides.length) % slides.length;
          slides[current].classList.add("is-active");
          if (dots[current]) dots[current].classList.add("is-active");
          inner.classList.remove("is-fading");
        }, FADE_MS);
      }
      function startAuto() {
        if (timer) clearInterval(timer);
        timer = setInterval(function() { goTo(current + 1); }, DURATION);
      }
      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          goTo(Number(dot.dataset.goto));
          startAuto();
        });
      });
      startAuto();
    });

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.getElementById("site-nav");

    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          nav.classList.remove("is-open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
  
