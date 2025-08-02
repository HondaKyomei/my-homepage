// スムーズフェードイン on scroll
document.addEventListener("DOMContentLoaded", () => {
    // 年更新
    document.getElementById("year").textContent = new Date().getFullYear();
  
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
  });
  