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

  /* ---- Deadline calculator (kalkulyatory.html) ---- */
  var dlTypeEl = document.getElementById("dl-type");
  if (dlTypeEl) {
    var dlRules = {
      inheritance: { months: 6, label: "прийняття спадщини", cite: "частина перша статті 1270 Цивільного кодексу України" },
      limitation: { years: 3, label: "позовної давності", cite: "стаття 257 Цивільного кодексу України" },
      appeal: { days: 30, label: "апеляційного оскарження", cite: "стаття 354 Цивільного процесуального кодексу України" }
    };
    var dlDateEl = document.getElementById("dl-date");
    var dlResultEl = document.getElementById("dl-result");
    var dlNoteEl = document.getElementById("dl-note");

    function dlCompute() {
      if (!dlDateEl.value) {
        dlResultEl.textContent = "—";
        dlNoteEl.textContent = "Оберіть дату події, щоб побачити розрахунок.";
        return;
      }
      var rule = dlRules[dlTypeEl.value];
      var start = new Date(dlDateEl.value + "T00:00:00");
      var end = new Date(start);
      if (rule.months) end.setMonth(end.getMonth() + rule.months);
      if (rule.years) end.setFullYear(end.getFullYear() + rule.years);
      if (rule.days) end.setDate(end.getDate() + rule.days);

      var fmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" });
      dlResultEl.textContent = fmt.format(end);

      var today = new Date(); today.setHours(0, 0, 0, 0);
      var diffDays = Math.round((end - today) / 86400000);
      var daysText = diffDays >= 0 ? ("Залишилось днів: " + diffDays.toLocaleString("uk-UA") + ". ") : "Строк, за цим орієнтовним розрахунком, уже минув. ";
      dlNoteEl.textContent = daysText + "Строк " + rule.label + " відповідно до " + rule.cite + ".";
    }
    dlTypeEl.addEventListener("change", dlCompute);
    dlDateEl.addEventListener("change", dlCompute);
    dlCompute();
  }

  /* ---- Salary indexation calculator (kalkulyatory.html) ---- */
  var ixSalaryEl = document.getElementById("ix-salary");
  if (ixSalaryEl) {
    var IX_CAP = 3328; /* прожитковий мінімум для працездатних осіб, 2026 */
    var IX_THRESHOLD = 103;
    var ixCpiEl = document.getElementById("ix-cpi");
    var ixTimeEl = document.getElementById("ix-time");
    var ixResultEl = document.getElementById("ix-result");
    var ixNoteEl = document.getElementById("ix-note");
    var ixBaseNote = ixNoteEl.textContent;

    function ixCompute() {
      var salary = parseFloat(ixSalaryEl.value);
      var cpi = parseFloat(ixCpiEl.value);
      var timePct = parseFloat(ixTimeEl.value);
      if (!salary || salary <= 0 || !cpi || cpi <= 0) {
        ixResultEl.textContent = "—";
        ixNoteEl.textContent = ixBaseNote;
        return;
      }
      if (!timePct || timePct <= 0 || timePct > 100) timePct = 100;

      if (cpi <= IX_THRESHOLD) {
        ixResultEl.textContent = "0 грн";
        ixNoteEl.textContent = "Право на індексацію ще не виникло: накопичений ІСЦ має перевищити поріг " + IX_THRESHOLD + "%. " + ixBaseNote;
        return;
      }
      var base = Math.min(salary, IX_CAP);
      var amount = base * (cpi - 100) / 100 * (timePct / 100);
      amount = Math.round(amount);
      ixResultEl.textContent = amount.toLocaleString("uk-UA") + " грн";
      ixNoteEl.textContent = "Розрахунок: " + base.toLocaleString("uk-UA") + " грн × (" + cpi + "% − 100%) × " + timePct + "%. " + ixBaseNote;
    }
    ixSalaryEl.addEventListener("input", ixCompute);
    ixCpiEl.addEventListener("input", ixCompute);
    ixTimeEl.addEventListener("input", ixCompute);
    ixCompute();
  }

  /* ---- Vacation days calculator (kalkulyatory.html) ---- */
  var vacHireEl = document.getElementById("vac-hire");
  if (vacHireEl) {
    var vacAsofEl = document.getElementById("vac-asof");
    var vacResultEl = document.getElementById("vac-result");
    var vacNoteEl = document.getElementById("vac-note");

    var todayIso = new Date().toISOString().slice(0, 10);
    if (!vacAsofEl.value) vacAsofEl.value = todayIso;

    function fullMonthsBetween(a, b) {
      var months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
      if (b.getDate() < a.getDate()) months -= 1;
      return Math.max(0, months);
    }

    function vacCompute() {
      if (!vacHireEl.value || !vacAsofEl.value) {
        vacResultEl.textContent = "—";
        vacNoteEl.textContent = "Вкажіть дату працевлаштування та дату розрахунку.";
        return;
      }
      var hire = new Date(vacHireEl.value + "T00:00:00");
      var asof = new Date(vacAsofEl.value + "T00:00:00");
      if (asof < hire) {
        vacResultEl.textContent = "—";
        vacNoteEl.textContent = "Дата розрахунку не може бути раніше дати працевлаштування.";
        return;
      }
      var totalMonths = fullMonthsBetween(hire, asof);
      var workingYearNumber, monthsIntoYear;
      if (totalMonths === 0) {
        workingYearNumber = 1; monthsIntoYear = 0;
      } else {
        workingYearNumber = Math.floor((totalMonths - 1) / 12) + 1;
        monthsIntoYear = totalMonths - (workingYearNumber - 1) * 12;
      }
      var accrued = Math.min(24, monthsIntoYear * 2);

      vacResultEl.textContent = accrued + " " + (accrued === 1 ? "день" : (accrued >= 2 && accrued <= 4 ? "дні" : "днів"));

      var noteParts = [];
      noteParts.push("Це " + workingYearNumber + "-й робочий рік (відлічується від дати працевлаштування, а не з початку календарного року).");
      if (totalMonths < 6) {
        noteParts.push("Право на використання щорічної відпустки за загальним правилом виникає після 6 місяців безперервної роботи (частина п'ята статті 10 Закону України «Про відпустки»); за згодою сторін відпустку можливо надати й раніше.");
      }
      noteParts.push("Розрахунок для стандартної щорічної основної відпустки — 24 календарні дні на рік (стаття 6 Закону України «Про відпустки»), без урахування додаткових відпусток і перерв у страховому стажі.");
      vacNoteEl.textContent = noteParts.join(" ");
    }
    vacHireEl.addEventListener("change", vacCompute);
    vacAsofEl.addEventListener("change", vacCompute);
    vacCompute();
  }

  /* ---- Mediation vs court comparison (mediatsiya.html) ---- */
  var cmpToggleEl = document.querySelector(".cmp-toggle");
  if (cmpToggleEl) {
    var cmpData = {
      family: {
        timeMed: "Зазвичай 2–6 тижнів",
        timeCourt: "Від 6 місяців до 2 років з урахуванням апеляції",
        barMedLabel: "2–6 тижнів", barCourtLabel: "6–24 місяці",
        barMedWidth: 12, barCourtWidth: 100,
        pubCourt: "Відкритий судовий процес за загальним правилом",
        costCourt: "Судовий збір і витрати на представництво в усіх інстанціях",
        relMed: "Орієнтована на збереження стосунків — особливо важливо за наявності спільних дітей"
      },
      business: {
        timeMed: "Зазвичай 2–4 тижні",
        timeCourt: "Від 6–12 місяців у першій інстанції, довше з апеляцією чи касацією",
        barMedLabel: "2–4 тижні", barCourtLabel: "6–18+ місяців",
        barMedWidth: 10, barCourtWidth: 100,
        pubCourt: "Рішення потрапляє до Єдиного державного реєстру судових рішень",
        costCourt: "Судовий збір (залежить від суми позову) і представництво в усіх інстанціях",
        relMed: "Залишає можливість продовжити ділові стосунки з контрагентом"
      }
    };
    var cmpButtons = cmpToggleEl.querySelectorAll("button");
    var cmpEls = {
      timeMed: document.getElementById("cmp-time-med"),
      timeCourt: document.getElementById("cmp-time-court"),
      pubCourt: document.getElementById("cmp-pub-court"),
      costCourt: document.getElementById("cmp-cost-court"),
      relMed: document.getElementById("cmp-rel-med"),
      barMed: document.getElementById("cmp-bar-med"),
      barCourt: document.getElementById("cmp-bar-court"),
      barMedLabel: document.getElementById("cmp-bar-med-label"),
      barCourtLabel: document.getElementById("cmp-bar-court-label")
    };
    function cmpRender(key) {
      var d = cmpData[key];
      cmpEls.timeMed.textContent = d.timeMed;
      cmpEls.timeCourt.textContent = d.timeCourt;
      cmpEls.pubCourt.textContent = d.pubCourt;
      cmpEls.costCourt.textContent = d.costCourt;
      cmpEls.relMed.textContent = d.relMed;
      cmpEls.barMedLabel.textContent = d.barMedLabel;
      cmpEls.barCourtLabel.textContent = d.barCourtLabel;
      cmpEls.barMed.style.width = d.barMedWidth + "%";
      cmpEls.barCourt.style.width = d.barCourtWidth + "%";
    }
    cmpButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        cmpButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        cmpRender(btn.getAttribute("data-case"));
      });
    });
    cmpRender("family");
  }

  /* ---- Calculator category tabs (kalkulyatory.html) ---- */
  var calcTabsEl = document.querySelector(".calc-tabs");
  if (calcTabsEl) {
    var calcTabButtons = calcTabsEl.querySelectorAll("button");
    var calcPanels = document.querySelectorAll(".calc-panel");
    calcTabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.getAttribute("data-panel");
        calcTabButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        calcPanels.forEach(function (p) {
          p.classList.toggle("active", p.getAttribute("data-panel") === panel);
        });
      });
    });
  }

  /* ---- Debt under art. 625 of the Civil Code: 3% + inflation losses (kalkulyatory.html) ---- */
  var d625SumEl = document.getElementById("d625-sum");
  if (d625SumEl) {
    var d625CpiEl = document.getElementById("d625-cpi");
    var d625StartEl = document.getElementById("d625-start");
    var d625EndEl = document.getElementById("d625-end");
    var d625ResultEl = document.getElementById("d625-result");
    var d625NoteEl = document.getElementById("d625-note");
    var d625BaseNote = d625NoteEl.textContent;

    var d625TodayIso = new Date().toISOString().slice(0, 10);
    if (!d625EndEl.value) d625EndEl.value = d625TodayIso;

    function d625Compute() {
      var sum = parseFloat(d625SumEl.value);
      if (!sum || sum <= 0 || !d625StartEl.value || !d625EndEl.value) {
        d625ResultEl.textContent = "—";
        d625NoteEl.textContent = d625BaseNote;
        return;
      }
      var start = new Date(d625StartEl.value + "T00:00:00");
      var end = new Date(d625EndEl.value + "T00:00:00");
      var days = Math.round((end - start) / 86400000);
      if (days < 0) {
        d625ResultEl.textContent = "—";
        d625NoteEl.textContent = "Дата розрахунку не може бути раніше дати початку прострочення.";
        return;
      }
      var threePct = sum * 0.03 * days / 365;
      var cpi = parseFloat(d625CpiEl.value);
      var inflation = (cpi && cpi > 100) ? sum * (cpi - 100) / 100 : 0;
      var total = sum + threePct + inflation;

      d625ResultEl.textContent = Math.round(total).toLocaleString("uk-UA") + " грн";
      var parts = [];
      parts.push("Прострочення: " + days + " дн.");
      parts.push("3% річних: " + Math.round(threePct).toLocaleString("uk-UA") + " грн");
      parts.push(cpi ? ("інфляційні втрати: " + Math.round(inflation).toLocaleString("uk-UA") + " грн") : "інфляційні втрати не вказані");
      d625NoteEl.textContent = parts.join("; ") + ". " + d625BaseNote;
    }
    d625SumEl.addEventListener("input", d625Compute);
    d625CpiEl.addEventListener("input", d625Compute);
    d625StartEl.addEventListener("change", d625Compute);
    d625EndEl.addEventListener("change", d625Compute);
    d625Compute();
  }

  /* ---- Court fee (kalkulyatory.html) ---- */
  var cfTypeEl = document.getElementById("cf-type");
  if (cfTypeEl) {
    var CF_PM = 3328; /* прожитковий мінімум для працездатних осіб, 2026 */
    var cfPayerEl = document.getElementById("cf-payer");
    var cfPayerFieldEl = document.getElementById("cf-payer-field");
    var cfPriceEl = document.getElementById("cf-price");
    var cfPriceFieldEl = document.getElementById("cf-price-field");
    var cfResultEl = document.getElementById("cf-result");
    var cfNoteEl = document.getElementById("cf-note");
    var cfBaseNote = cfNoteEl.textContent;

    function cfUpdateVisibility() {
      var t = cfTypeEl.value;
      var needsPrice = (t === "maynovyy" || t === "propertyDivorce");
      var needsPayer = (t === "maynovyy" || t === "nemaynovyy");
      cfPriceFieldEl.style.display = needsPrice ? "" : "none";
      cfPayerFieldEl.style.display = needsPayer ? "" : "none";
    }

    function cfCompute() {
      cfUpdateVisibility();
      var t = cfTypeEl.value;
      var payer = cfPayerEl.value;
      var price = parseFloat(cfPriceEl.value) || 0;
      var fee = 0;
      var note = "";

      if (t === "maynovyy") {
        if ((price) <= 0) {
          cfResultEl.textContent = "—";
          cfNoteEl.textContent = "Вкажіть ціну позову. " + cfBaseNote;
          return;
        }
        if (payer === "yur") {
          fee = Math.min(Math.max(price * 0.015, CF_PM), 350 * CF_PM);
          note = "1,5% ціни позову, не менше 1 та не більше 350 розмірів прожиткового мінімуму.";
        } else {
          fee = Math.min(Math.max(price * 0.01, 0.4 * CF_PM), 5 * CF_PM);
          note = "1% ціни позову, не менше 0,4 та не більше 5 розмірів прожиткового мінімуму.";
        }
      } else if (t === "nemaynovyy") {
        fee = (payer === "yur") ? CF_PM : 0.4 * CF_PM;
        note = "Фіксована ставка для позовів немайнового характеру.";
      } else if (t === "divorce") {
        fee = 0.4 * CF_PM;
        note = "Фіксована ставка за подання позову про розірвання шлюбу.";
      } else if (t === "propertyDivorce") {
        if (price <= 0) {
          cfResultEl.textContent = "—";
          cfNoteEl.textContent = "Вкажіть ціну позову. " + cfBaseNote;
          return;
        }
        fee = Math.min(Math.max(price * 0.01, 0.4 * CF_PM), 3 * CF_PM);
        note = "1% ціни позову, не менше 0,4 та не більше 3 розмірів прожиткового мінімуму.";
      }

      cfResultEl.textContent = fee.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " грн";
      cfNoteEl.textContent = note + " " + cfBaseNote;
    }

    cfTypeEl.addEventListener("change", cfCompute);
    cfPayerEl.addEventListener("change", cfCompute);
    cfPriceEl.addEventListener("input", cfCompute);
    cfCompute();
  }

  /* ---- Penalty (double NBU discount rate) (kalkulyatory.html) ---- */
  var penSumEl = document.getElementById("pen-sum");
  if (penSumEl) {
    var penRateEl = document.getElementById("pen-rate");
    var penStartEl = document.getElementById("pen-start");
    var penEndEl = document.getElementById("pen-end");
    var penResultEl = document.getElementById("pen-result");
    var penNoteEl = document.getElementById("pen-note");
    var penBaseNote = penNoteEl.textContent;

    var penTodayIso = new Date().toISOString().slice(0, 10);
    if (!penEndEl.value) penEndEl.value = penTodayIso;

    function penCompute() {
      var sum = parseFloat(penSumEl.value);
      var rate = parseFloat(penRateEl.value);
      if (!sum || sum <= 0 || !rate || rate <= 0 || !penStartEl.value || !penEndEl.value) {
        penResultEl.textContent = "—";
        penNoteEl.textContent = penBaseNote;
        return;
      }
      var start = new Date(penStartEl.value + "T00:00:00");
      var end = new Date(penEndEl.value + "T00:00:00");
      var days = Math.round((end - start) / 86400000);
      if (days < 0) {
        penResultEl.textContent = "—";
        penNoteEl.textContent = "Дата розрахунку не може бути раніше дати початку прострочення.";
        return;
      }
      var amount = sum * (2 * rate / 100 / 365) * days;
      penResultEl.textContent = Math.round(amount).toLocaleString("uk-UA") + " грн";
      penNoteEl.textContent = "Прострочення: " + days + " дн. за ставкою " + rate + "%. " + penBaseNote;
    }
    penSumEl.addEventListener("input", penCompute);
    penRateEl.addEventListener("input", penCompute);
    penStartEl.addEventListener("change", penCompute);
    penEndEl.addEventListener("change", penCompute);
    penCompute();
  }

  /* ---- Minimum child alimony (kalkulyatory.html) ---- */
  var almAgeEl = document.getElementById("alm-age");
  if (almAgeEl) {
    var almCountEl = document.getElementById("alm-count");
    var almResultEl = document.getElementById("alm-result");
    var almNoteEl = document.getElementById("alm-note");

    function almCompute() {
      var pmChild = (almAgeEl.value === "under6") ? 2817 : 3512; /* прожитковий мінімум для дитини відповідного віку, 2026 */
      var guaranteed = Math.round(pmChild * 0.5 * 100) / 100;
      var recommended = pmChild;
      var shareMap = { "1": "1/4", "2": "1/3", "3": "1/2" };
      var share = shareMap[almCountEl.value];

      almResultEl.textContent = guaranteed.toLocaleString("uk-UA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " грн";
      almNoteEl.textContent = "Мінімальний рекомендований розмір (за наявності достатнього доходу платника) — " + recommended.toLocaleString("uk-UA") + " грн (стаття 182 Сімейного кодексу України). Орієнтовна частка доходу платника при стягненні у частці заробітку — " + share + " (стаття 183 Сімейного кодексу України). У наказному провадженні стягнення аліментів у частці доходу обмежене 10 прожитковими мінімумами на дитину відповідного віку (частина п'ята статті 183 СК); у позовному провадженні законодавчого максимуму немає — суд визначає розмір з урахуванням доведених потреб дитини.";
    }
    almAgeEl.addEventListener("change", almCompute);
    almCountEl.addEventListener("change", almCompute);
    almCompute();
  }

  /* ---- Alimony arrears penalty (kalkulyatory.html) ---- */
  var almpenDebtEl = document.getElementById("almpen-debt");
  if (almpenDebtEl) {
    var almpenStartEl = document.getElementById("almpen-start");
    var almpenEndEl = document.getElementById("almpen-end");
    var almpenResultEl = document.getElementById("almpen-result");
    var almpenNoteEl = document.getElementById("almpen-note");
    var almpenBaseNote = almpenNoteEl.textContent;

    var almpenTodayIso = new Date().toISOString().slice(0, 10);
    if (!almpenEndEl.value) almpenEndEl.value = almpenTodayIso;

    function almpenCompute() {
      var debt = parseFloat(almpenDebtEl.value);
      if (!debt || debt <= 0 || !almpenStartEl.value || !almpenEndEl.value) {
        almpenResultEl.textContent = "—";
        almpenNoteEl.textContent = almpenBaseNote;
        return;
      }
      var start = new Date(almpenStartEl.value + "T00:00:00");
      var end = new Date(almpenEndEl.value + "T00:00:00");
      var days = Math.round((end - start) / 86400000);
      if (days < 0) {
        almpenResultEl.textContent = "—";
        almpenNoteEl.textContent = "Дата розрахунку не може бути раніше дати виникнення заборгованості.";
        return;
      }
      var raw = debt * 0.01 * days;
      var cap = debt;
      var result = Math.min(raw, cap);
      almpenResultEl.textContent = Math.round(result).toLocaleString("uk-UA") + " грн";
      almpenNoteEl.textContent = (raw > cap ? "Розрахункова сума перевищила заборгованість і обмежена 100% (" + Math.round(cap).toLocaleString("uk-UA") + " грн). " : ("Прострочення: " + days + " дн. ")) + almpenBaseNote;
    }
    almpenDebtEl.addEventListener("input", almpenCompute);
    almpenStartEl.addEventListener("change", almpenCompute);
    almpenEndEl.addEventListener("change", almpenCompute);
    almpenCompute();
  }

  /* ---- Compensation for delayed settlement upon dismissal, art. 117 KZpP (kalkulyatory.html) ---- */
  var setAvgEl = document.getElementById("set-avg");
  if (setAvgEl) {
    var setStartEl = document.getElementById("set-start");
    var setEndEl = document.getElementById("set-end");
    var setResultEl = document.getElementById("set-result");
    var setNoteEl = document.getElementById("set-note");
    var setBaseNote = setNoteEl.textContent;

    var setTodayIso = new Date().toISOString().slice(0, 10);
    if (!setEndEl.value) setEndEl.value = setTodayIso;

    function setCompute() {
      var avg = parseFloat(setAvgEl.value);
      if (!avg || avg <= 0 || !setStartEl.value || !setEndEl.value) {
        setResultEl.textContent = "—";
        setNoteEl.textContent = setBaseNote;
        return;
      }
      var start = new Date(setStartEl.value + "T00:00:00");
      var end = new Date(setEndEl.value + "T00:00:00");
      if (end < start) {
        setResultEl.textContent = "—";
        setNoteEl.textContent = "Дата розрахунку не може бути раніше дати звільнення.";
        return;
      }
      var cap = new Date(start);
      cap.setMonth(cap.getMonth() + 6);
      var capped = end > cap;
      var effectiveEnd = capped ? cap : end;
      var days = Math.round((effectiveEnd - start) / 86400000);
      var fullDays = Math.round((end - start) / 86400000);
      var amount = avg * days;

      setResultEl.textContent = Math.round(amount).toLocaleString("uk-UA") + " грн";
      setNoteEl.textContent = (capped ? ("Період обмежено шістьма місяцями з дня звільнення (враховано " + days + " з " + fullDays + " фактичних днів затримки). ") : ("Затримка: " + days + " дн. ")) + setBaseNote;
    }
    setAvgEl.addEventListener("input", setCompute);
    setStartEl.addEventListener("change", setCompute);
    setEndEl.addEventListener("change", setCompute);
    setCompute();
  }

  /* ---- Severance pay, art. 44 KZpP (kalkulyatory.html) ---- */
  var sevGroundEl = document.getElementById("sev-ground");
  if (sevGroundEl) {
    var SEV_MZP = 8647; /* мінімальна заробітна плата, 2026 */
    var sevAvgEl = document.getElementById("sev-avg");
    var sevResultEl = document.getElementById("sev-result");
    var sevNoteEl = document.getElementById("sev-note");

    var sevRules = {
      x1: { mult: 1, label: "не менше середньомісячного заробітку (1×)" },
      military: { fixed: 2 * SEV_MZP, label: "2 мінімальні заробітні плати" },
      x3: { mult: 3, label: "не менше тримісячного середнього заробітку (3×)" },
      x6: { mult: 6, label: "не менше шестимісячного середнього заробітку (6×)" }
    };

    function sevCompute() {
      var rule = sevRules[sevGroundEl.value];
      if (rule.fixed) {
        sevResultEl.textContent = rule.fixed.toLocaleString("uk-UA") + " грн";
        sevNoteEl.textContent = "Фіксований мінімум — " + rule.label + " (мінімальна заробітна плата у 2026 році — 8 647 грн), незалежно від заробітку працівника.";
        return;
      }
      var avg = parseFloat(sevAvgEl.value);
      if (!avg || avg <= 0) {
        sevResultEl.textContent = "—";
        sevNoteEl.textContent = "Вкажіть середньомісячний заробіток, щоб побачити розрахунок.";
        return;
      }
      var amount = avg * rule.mult;
      sevResultEl.textContent = Math.round(amount).toLocaleString("uk-UA") + " грн";
      sevNoteEl.textContent = "Мінімум — " + rule.label + ". Це встановлений законом мінімум; колективний чи трудовий договір може передбачати вищий розмір.";
    }
    sevGroundEl.addEventListener("change", sevCompute);
    sevAvgEl.addEventListener("input", sevCompute);
    sevCompute();
  }

  /* ---- Executive (enforcement) fee (kalkulyatory.html) ---- */
  var efTypeEl = document.getElementById("ef-type");
  if (efTypeEl) {
    var EF_MZP = 8647; /* мінімальна заробітна плата, 2026 */
    var efSumEl = document.getElementById("ef-sum");
    var efSumFieldEl = document.getElementById("ef-sum-field");
    var efResultEl = document.getElementById("ef-result");
    var efNoteEl = document.getElementById("ef-note");
    var efBaseNote = efNoteEl.textContent;

    function efCompute() {
      var t = efTypeEl.value;
      efSumFieldEl.style.display = (t === "property") ? "" : "none";
      var amount;
      if (t === "property") {
        var sum = parseFloat(efSumEl.value);
        if (!sum || sum <= 0) {
          efResultEl.textContent = "—";
          efNoteEl.textContent = "Вкажіть суму, що підлягає стягненню. " + efBaseNote;
          return;
        }
        amount = sum * 0.10;
      } else if (t === "nonpropFiz") {
        amount = 2 * EF_MZP;
      } else {
        amount = 4 * EF_MZP;
      }
      efResultEl.textContent = Math.round(amount).toLocaleString("uk-UA") + " грн";
      efNoteEl.textContent = efBaseNote;
    }
    efTypeEl.addEventListener("change", efCompute);
    efSumEl.addEventListener("input", efCompute);
    efCompute();
  }

  /* ---- Deadline to present an enforcement document (kalkulyatory.html) ---- */
  var edTypeEl = document.getElementById("ed-type");
  if (edTypeEl) {
    var edForceEl = document.getElementById("ed-force");
    var edResultEl = document.getElementById("ed-result");
    var edNoteEl = document.getElementById("ed-note");

    function edCompute() {
      var t = edTypeEl.value;
      if (t === "periodic") {
        edResultEl.textContent = "Протягом усього періоду виплат";
        edNoteEl.textContent = "Для стягнення періодичних платежів (аліменти тощо) строк пред'явлення обчислюється за кожен платіж окремо і триває протягом усього періоду, на який вони присуджені (частина третя статті 12 Закону України «Про виконавче провадження»).";
        return;
      }
      if (!edForceEl.value) {
        edResultEl.textContent = "—";
        edNoteEl.textContent = "Вкажіть дату набрання рішенням законної сили.";
        return;
      }
      var start = new Date(edForceEl.value + "T00:00:00");
      var end = new Date(start);
      if (t === "short") end.setMonth(end.getMonth() + 3);
      else end.setFullYear(end.getFullYear() + 3);

      var fmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" });
      edResultEl.textContent = fmt.format(end);

      var today = new Date(); today.setHours(0, 0, 0, 0);
      var diffDays = Math.round((end - today) / 86400000);
      var daysText = diffDays >= 0 ? ("Залишилось днів: " + diffDays.toLocaleString("uk-UA") + ". ") : "Строк, за цим орієнтовним розрахунком, уже минув — можливе поновлення пропущеного строку за заявою (стаття 12 Закону). ";
      edNoteEl.textContent = daysText + "Перебіг строку починається з наступного дня після набрання рішенням законної сили.";
    }
    edTypeEl.addEventListener("change", edCompute);
    edForceEl.addEventListener("change", edCompute);
    edCompute();
  }

  /* ---- Working pensioner recalculation eligibility (kalkulyatory.html) ---- */
  var prLastEl = document.getElementById("pr-last");
  if (prLastEl) {
    var prAsofEl = document.getElementById("pr-asof");
    var prResultEl = document.getElementById("pr-result");
    var prNoteEl = document.getElementById("pr-note");

    var prTodayIso = new Date().toISOString().slice(0, 10);
    if (!prAsofEl.value) prAsofEl.value = prTodayIso;

    function prFullMonthsBetween(a, b) {
      var months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
      if (b.getDate() < a.getDate()) months -= 1;
      return Math.max(0, months);
    }

    function prCompute() {
      if (!prLastEl.value || !prAsofEl.value) {
        prResultEl.textContent = "—";
        prNoteEl.textContent = "Вкажіть дату призначення або попереднього перерахунку пенсії.";
        return;
      }
      var last = new Date(prLastEl.value + "T00:00:00");
      var asof = new Date(prAsofEl.value + "T00:00:00");
      if (asof < last) {
        prResultEl.textContent = "—";
        prNoteEl.textContent = "Дата перевірки не може бути раніше дати призначення чи попереднього перерахунку.";
        return;
      }
      var months = prFullMonthsBetween(last, asof);
      var twoYears = new Date(last); twoYears.setFullYear(twoYears.getFullYear() + 2);
      var fmt = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" });

      prResultEl.textContent = months + " міс. з 24";

      if (months >= 24) {
        prNoteEl.textContent = "Накопичено достатньо страхового стажу (24 місяці і більше). Якщо це підтверджено даними Пенсійного фонду станом на 1 березня поточного року, перерахунок здійснюється автоматично з 1 квітня без заяви; в іншому разі можна звернутися із заявою (частина четверта статті 42 Закону України «Про загальнообов'язкове державне пенсійне страхування» № 1058-IV).";
      } else {
        prNoteEl.textContent = "Ще не накопичено 24 місяців страхового стажу. За заявою перерахунок можливий не раніше ніж через два роки з дати призначення чи попереднього перерахунку — орієнтовно з " + fmt.format(twoYears) + ".";
      }
    }
    prLastEl.addEventListener("change", prCompute);
    prAsofEl.addEventListener("change", prCompute);
    prCompute();
  }

  /* ---- War damage compensation pre-check (kalkulyatory.html) ---- */
  var mcQ1El = document.getElementById("mc-q1");
  if (mcQ1El) {
    var mcQ2El = document.getElementById("mc-q2");
    var mcQ3El = document.getElementById("mc-q3");
    var mcQ4El = document.getElementById("mc-q4");
    var mcResultEl = document.getElementById("mc-result");

    function mcCompute() {
      var answers = [mcQ1El.value, mcQ2El.value, mcQ3El.value, mcQ4El.value];
      var noCount = answers.filter(function (a) { return a === "no"; }).length;
      var unsureCount = answers.filter(function (a) { return a === "unsure"; }).length;

      if (noCount > 0) {
        mcResultEl.textContent = "Висока ймовірність відмови";
      } else if (unsureCount > 0) {
        mcResultEl.textContent = "Потрібно уточнити деталі";
      } else {
        mcResultEl.textContent = "Базові умови дотримано";
      }
    }
    mcQ1El.addEventListener("change", mcCompute);
    mcQ2El.addEventListener("change", mcCompute);
    mcQ3El.addEventListener("change", mcCompute);
    mcQ4El.addEventListener("change", mcCompute);
    mcCompute();
  }
})();
