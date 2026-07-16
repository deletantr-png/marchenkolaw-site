/* Адвокатське бюро Руслана Марченка — інтерактив */
(function () {
  "use strict";

  /* ---- Mobile drawer ---- */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("overlay");
  function openDrawer() { if (drawer) { drawer.classList.add("open"); overlay.classList.add("open"); document.body.style.overflow = "hidden"; } }
  function closeDrawer() { if (drawer) { drawer.classList.remove("open"); overlay.classList.remove("open"); document.body.style.overflow = ""; } }
  if (burger) burger.addEventListener("click", openDrawer);
  if (overlay) overlay.addEventListener("click", closeDrawer);
  var dc = document.querySelector(".drawer-close");
  if (dc) dc.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.contains("open");
      var parent = item.closest(".faq");
      if (parent) parent.querySelectorAll(".faq-item.open").forEach(function (o) {
        if (o !== item) { o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null; }
      });
      if (open) { item.classList.remove("open"); a.style.maxHeight = null; }
      else { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---- Share site button ---- */
  document.querySelectorAll(".share-site").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var url = btn.getAttribute("data-share-url") || window.location.href;
      var text = btn.getAttribute("data-share-text") || document.title;
      if (navigator.share) {
        navigator.share({ title: document.title, text: text, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          btn.classList.add("copied");
          setTimeout(function () { btn.classList.remove("copied"); }, 2000);
        });
      }
    });
  });

  /* ---- Scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Cookie banner ---- */
  var cookie = document.getElementById("cookie");
  try {
    if (cookie && !localStorage.getItem("rm_cookie_ok")) {
      setTimeout(function () { cookie.classList.add("show"); }, 900);
    }
    var cb = document.getElementById("cookie-accept");
    if (cb) cb.addEventListener("click", function () {
      try { localStorage.setItem("rm_cookie_ok", "1"); } catch (e) {}
      cookie.classList.remove("show");
    });
  } catch (e) { if (cookie) cookie.classList.add("show"); }

  /* ---- Forms (Formspree endpoint OR graceful fallback) ---- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      var endpoint = form.getAttribute("action") || "";
      var configured = endpoint.indexOf("XXXXXXX") === -1 && endpoint.indexOf("formspree.io/f/") !== -1;

      function show(cls, msg) {
        if (!status) { alert(msg); return; }
        status.className = "form-status show " + cls;
        status.textContent = msg;
      }

      if (configured) {
        var data = new FormData(form);
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (r.ok) { form.reset(); show("ok", "Дякуємо! Ваш запит надіслано. Ми зв'яжемося з Вами найближчим часом."); }
            else { show("info", "Не вдалося надіслати автоматично. Зателефонуйте, будь ласка: +38 097 878-65-00."); }
          })
          .catch(function () { show("info", "Немає зʼєднання. Зателефонуйте, будь ласка: +38 097 878-65-00 або напишіть у Telegram/Viber."); });
      } else {
        /* Fallback: prefill mailto so the form is usable before Formspree is connected */
        var name = (form.querySelector("[name=name]") || {}).value || "";
        var phone = (form.querySelector("[name=phone]") || {}).value || "";
        var topic = (form.querySelector("[name=topic]") || {}).value || "";
        var msg = (form.querySelector("[name=message]") || {}).value || "";
        var body = "Ім'я: " + name + "%0D%0AТелефон: " + phone + (topic ? "%0D%0AНапрям: " + topic : "") + (msg ? "%0D%0AПовідомлення: " + msg : "");
        window.location.href = "mailto:Urist_chetc@ukr.net?subject=" + encodeURIComponent("Запит на консультацію з сайту") + "&body=" + body;
        show("info", "Відкриваємо Вашу поштову програму. Або зателефонуйте: +38 097 878-65-00.");
      }
    });
  });

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector("header.site");
  if (header) {
    window.addEventListener("scroll", function () {
      header.style.boxShadow = window.scrollY > 20 ? "0 10px 30px -18px rgba(0,0,0,.6)" : "none";
    }, { passive: true });
  }

  /* ---- Current year ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
