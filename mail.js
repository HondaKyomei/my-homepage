// nanoFACTORY mail.js — メールアドレスのスパム対策
// ・HTMLソースにアドレスを平文で置かない（data-m に「逆順→Base64」した値だけを持つ）
// ・表示用は data-m-text を付けた要素にだけ、読み込み後にJSで書き込む
// ・<a data-m> の mailto: は、ホバー/フォーカス/タップされた瞬間に初めて付ける
//   （自動収集ボットの多くはJSを実行せず、実行しても操作はしないため拾われにくい）
// エンコード値の作り方（Python）: base64.b64encode(addr[::-1].encode()).decode()
(function () {
  function decode(v) {
    try { return atob(v).split("").reverse().join(""); } catch (e) { return ""; }
  }
  document.querySelectorAll("[data-m]").forEach(function (el) {
    var addr = decode(el.getAttribute("data-m"));
    if (!addr) return;
    if (el.hasAttribute("data-m-text")) el.textContent = addr;
    if (el.tagName === "A") {
      var arm = function () {
        var q = el.getAttribute("data-m-query");
        el.setAttribute("href", "mailto:" + addr + (q ? "?" + q : ""));
      };
      ["pointerenter", "focus", "touchstart", "mousedown"].forEach(function (ev) {
        el.addEventListener(ev, arm, { once: true, passive: true });
      });
    }
  });
})();
