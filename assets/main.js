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

  /* ---- Fee calculator (tsiny.html) ---- */
  var fcGroupEl = document.getElementById("fc-group");
  if (fcGroupEl) {
    var fcData = [
      { name: "Консультації та юридичні документи", items: [
        ["Усна консультація без вивчення документів", "від 500 грн"],
        ["Усна консультація з вивченням документів", "від 2 000 грн"],
        ["Письмова консультація з посиланням на норми права", "від 3 000 грн"],
        ["Правовий аналіз правочину (договору)", "від 3 000 грн"],
        ["Адвокатський запит", "від 1 500 грн"],
        ["Складання документів, звернень, заяв тощо", "від 2 500 грн"]
      ]},
      { name: "Договірна робота", items: [
        ["Складання індивідуального договору", "від 5 000 грн"],
        ["Складання типового договору", "від 2 500 грн"],
        ["Представництво інтересів клієнта в установах з виїздом", "від 1 прожиткового мінімуму / год"],
        ["Абонентське обслуговування юридичної особи", "30 000 грн / місяць"],
        ["Абонентське обслуговування фізичної особи", "20 000 грн / місяць"]
      ]},
      { name: "Справи про адміністративні правопорушення (КУпАП)", items: [
        ["Складання пояснень, скарги", "від 3 500 грн"],
        ["Представництво у судовому процесі", "від 15 000 грн"],
        ["Складання апеляційної скарги (без участі)", "від 8 000 грн"]
      ]},
      { name: "Цивільні справи (ЦПК України)", items: [
        ["Позовна заява про розірвання шлюбу", "від 3 000 грн"],
        ["Заява про видачу судового наказу", "від 3 000 грн"],
        ["Позовна заява про стягнення аліментів", "від 5 000 грн"],
        ["Позовна заява немайнового характеру", "від 8 000 грн"],
        ["Позовна заява майнового характеру", "від 12 000 грн"],
        ["Представництво у суді першої інстанції (немайновий спір)", "від 20 000 грн + 5 000 грн / судодень"],
        ["Представництво у суді першої інстанції (майновий спір)", "від 25 000 грн + 5 000 грн*"],
        ["Гонорар за прийняття рішення на користь клієнта", "від 5%"],
        ["Апеляційна скарга (без участі / з участю)", "від 12 000 / від 20 000 грн + 5 000 грн*"],
        ["Касаційна скарга (без участі / з участю)", "від 16 000 / від 26 000 грн + 5 000 грн*"]
      ]},
      { name: "Господарські справи (ГПК України)", items: [
        ["Складання позовної заяви", "від 20 000 грн"],
        ["Представництво у суді першої інстанції", "від 30 000 грн + 5 000 грн*"],
        ["Апеляційна скарга (без участі / з участю)", "від 20 000 / від 25 000 грн + 5 000 грн*"],
        ["Касаційна скарга (без участі / з участю)", "від 30 000 / від 35 000 грн + 5 000 грн*"],
        ["Гонорар за прийняття рішення на користь клієнта", "від 5%"]
      ]},
      { name: "Адміністративні справи (КАС України)", items: [
        ["Складання позовної заяви", "від 12 000 грн"],
        ["Представництво у суді першої інстанції", "від 20 000 грн + 5 000 грн*"],
        ["Апеляційна скарга (без участі / з участю)", "від 12 000 / від 20 000 грн + 5 000 грн*"],
        ["Касаційна скарга (без участі / з участю)", "від 16 000 / від 26 000 грн + 5 000 грн*"],
        ["Гонорар за прийняття рішення на користь клієнта", "від 5%"]
      ]},
      { name: "Інші послуги", items: [
        ["Супровід виконавчого провадження", "10 000 грн + 5% суми виконавчого провадження"],
        ["Відкладення засідання не з ініціативи адвоката", "5 000 грн / судодень"]
      ]}
    ];
    var fcItemEl = document.getElementById("fc-item");
    var fcPriceEl = document.getElementById("fc-price");
    fcData.forEach(function (g, gi) {
      var opt = document.createElement("option");
      opt.value = gi; opt.textContent = g.name;
      fcGroupEl.appendChild(opt);
    });
    function fcRenderItems() {
      var g = fcData[Number(fcGroupEl.value)];
      fcItemEl.innerHTML = "";
      g.items.forEach(function (it, ii) {
        var opt = document.createElement("option");
        opt.value = ii; opt.textContent = it[0];
        fcItemEl.appendChild(opt);
      });
      fcRenderPrice();
    }
    function fcRenderPrice() {
      var g = fcData[Number(fcGroupEl.value)];
      var it = g.items[Number(fcItemEl.value)];
      fcPriceEl.textContent = it[1];
    }
    fcGroupEl.addEventListener("change", fcRenderItems);
    fcItemEl.addEventListener("change", fcRenderPrice);
    fcRenderItems();
  }

  /* ---- Practice-area navigator (index.html) ---- */
  var wzStep1 = document.getElementById("wz-step1");
  if (wzStep1) {
    var wzTree = {
      family: {
        q: "Що саме стосується Вашої ситуації?",
        options: [
          { label: "Розлучення, аліменти, поділ майна", href: "simeyni-spravy.html", desc: "Супровід розірвання шлюбу, стягнення аліментів та поділу спільного майна подружжя." },
          { label: "Спадщина, спадкові спори", href: "spadkovi-spravy.html", desc: "Оформлення спадщини, оскарження заповіту та вирішення спорів між спадкоємцями." },
          { label: "Медіація, позасудове врегулювання", href: "mediatsiya.html", desc: "Пошук компромісу без суду — швидше, дешевше та без публічності судового процесу." }
        ]
      },
      property: {
        q: "Що саме стосується нерухомості?",
        options: [
          { label: "Купівля чи продаж нерухомості", href: "nerukhomist-pid-klyuch.html", desc: "Перевірка об'єкта, супровід угоди та мінімізація ризиків до підписання договору." },
          { label: "Оформлення права власності за старими документами", href: "reyestratsiya-prava-vlasnosti-drrp.html", desc: "Внесення свідоцтв, виданих до 2013 року, до Державного реєстру речових прав." },
          { label: "Компенсація за пошкоджене війною житло", href: "viyskova-kompensatsiya.html", desc: "«єВідновлення» та Міжнародний реєстр збитків — хто має право і як подати заяву." }
        ]
      },
      business: {
        q: "Що саме стосується бізнесу?",
        options: [
          { label: "Стягнення заборгованості, господарський спір", href: "gospodarske-pravo.html", desc: "Захист інтересів бізнесу в господарських спорах і стягнення боргів контрагентів." },
          { label: "Банкрутство фізичної особи або ФОП", href: "bankrutstvo-fizosib-ta-fop.html", desc: "Законне списання чи реструктуризація боргів через процедуру банкрутства." },
          { label: "Реєстрація торгової марки", href: "torgovi-marky.html", desc: "Захист бренду — від пошуку до отримання свідоцтва на торговельну марку." },
          { label: "Участь у тендері", href: "tenderniy-suprovid.html", desc: "Супровід підготовки та подання тендерної пропозиції, оскарження рішень замовника." }
        ]
      },
      state: {
        q: "Що саме Вас цікавить?",
        options: [
          { label: "Компенсація за зруйноване чи пошкоджене житло", href: "viyskova-kompensatsiya.html", desc: "«єВідновлення», RD4U та інші державні й міжнародні програми компенсації." },
          { label: "Перерахунок пенсії", href: "pererahunok-pensiy.html", desc: "Перерахунок пенсії військовим, силовим структурам та працюючим пенсіонерам." }
        ]
      },
      dispute: {
        q: "Що саме стосується спору?",
        options: [
          { label: "Виконавче провадження, примусове стягнення", href: "vykonavche-provadzhennya.html", desc: "Захист прав боржника чи стягувача на етапі примусового виконання рішення суду." },
          { label: "Ще не знаю, до якої категорії належить моя справа", href: "index.html#contact", desc: "Опишіть ситуацію одним повідомленням — ми самі визначимо потрібний напрям." }
        ]
      }
    };
    var wzStep2 = document.getElementById("wz-step2");
    var wzStep2Q = document.getElementById("wz-step2-q");
    var wzStep2Opts = document.getElementById("wz-step2-opts");
    var wzResult = document.getElementById("wz-result");
    var wzResultTitle = document.getElementById("wz-result-title");
    var wzResultDesc = document.getElementById("wz-result-desc");
    var wzResultLink = document.getElementById("wz-result-link");
    var wzBack = document.getElementById("wz-back");
    var wzRestart = document.getElementById("wz-restart");

    function wzShowStep1() {
      wzResult.hidden = true; wzStep2.hidden = true; wzStep1.hidden = false;
    }
    function wzShowStep2(groupKey) {
      var g = wzTree[groupKey];
      wzStep2Q.textContent = g.q;
      wzStep2Opts.innerHTML = "";
      g.options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button"; btn.className = "wizard-opt"; btn.textContent = opt.label;
        btn.addEventListener("click", function () { wzShowResult(opt); });
        wzStep2Opts.appendChild(btn);
      });
      wzStep1.hidden = true; wzResult.hidden = true; wzStep2.hidden = false;
    }
    function wzShowResult(opt) {
      wzResultTitle.textContent = opt.label;
      wzResultDesc.textContent = opt.desc;
      wzResultLink.href = opt.href;
      wzStep1.hidden = true; wzStep2.hidden = true; wzResult.hidden = false;
    }
    wzStep1.querySelectorAll(".wizard-opt").forEach(function (btn) {
      btn.addEventListener("click", function () { wzShowStep2(btn.getAttribute("data-group")); });
    });
    wzBack.addEventListener("click", wzShowStep1);
    wzRestart.addEventListener("click", wzShowStep1);
  }
})();
