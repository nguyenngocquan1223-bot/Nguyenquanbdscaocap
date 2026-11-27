// Tiến độ thanh toán: tính số tiền từng đợt theo giá khách nhập và dựng các cách xem
// theo từng nhóm dự án (data-layout trên .paycalc):
//   masteri  – thẻ tối, dòng thời gian ngang (Masteri Grand Coast, Masteri Era Landmark)
//   lumiere  – thẻ sáng viền vàng, bảng "hạn đóng – số tiền – lũy kế", chọn từng phương án (dự án LUMIÈRE)
//   year     – bảng so sánh các phương án theo năm + bảng chi tiết (Gamuda Central Park)
//   phase    – bảng so sánh các phương án theo mốc + bảng chi tiết (Iconia LakeSide)
//   mik      – các phương án đặt cạnh nhau để so sánh (dự án MIK Group)
(function () {
  function fmt(v) {
    v = Math.round(v);
    if (Math.abs(v) >= 1e9) return (v / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
    if (Math.abs(v) >= 1e6) return Math.round(v / 1e6).toLocaleString("vi-VN") + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
  }
  function pc(v) { return (Math.round(v * 1000) / 10).toLocaleString("vi-VN") + "%"; }
  function parse(s) { return Number(String(s).replace(/[^\d]/g, "")) || 0; }
  function num(el, k, d) { var v = el.getAttribute(k); return v === null || v === "" ? d : Number(v); }
  function txt(el, sel) { var e = el.querySelector(sel); return e ? e.textContent.trim() : ""; }
  function html(el, sel) { var e = el.querySelector(sel); return e ? e.innerHTML.trim() : ""; }
  var today = new Date(); today.setHours(0, 0, 0, 0);

  var PH = {
    sign: "Khi ký (đặt cọc, HĐMB)",
    pre: "Trong thời gian xây dựng",
    hand: "Khi bàn giao",
    so: "Khi nhận sổ"
  };
  function phaseOf(when, st) {
    if (/nhận sổ/i.test(when)) return "so";
    if (st.classList.contains("hand") || /bàn giao/i.test(when)) return "hand";
    if (/^(ký|ngày|trong 7 ngày|khi ký|đặt cọc)/i.test(when)) return "sign";
    return "pre";
  }
  function dateOf(s) {
    var m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(s);
    return m ? new Date(+m[3], m[2] - 1, +m[1]) : null;
  }

  function read(plan) {
    return Array.prototype.map.call(plan.querySelectorAll(".tl-step"), function (st, i) {
      var when = txt(st, ".tl-when");
      return {
        el: st, i: i, when: when, whenHtml: html(st, ".tl-when"), what: html(st, ".tl-what"), big: html(st, ".tl-big"),
        p: num(st, "data-p", 0), n: num(st, "data-n", 1), fixed: num(st, "data-fixed", 0), less: num(st, "data-less", 0),
        kpbt: st.hasAttribute("data-kpbt"), cash: st.getAttribute("data-cash") !== "0",
        na: st.hasAttribute("data-na") ? (st.getAttribute("data-na") || "Theo thông báo của CĐT") : null,
        bank: st.classList.contains("bank"), m: st.getAttribute("data-m"), every: num(st, "data-every", 1),
        ph: phaseOf(when, st), date: dateOf(when)
      };
    });
  }

  function compute(plan, price, steps) {
    var disc = num(plan, "data-disc", 0), up = num(plan, "data-up", 0), kp = num(plan, "data-kpbt", 0.02);
    var net = price * (1 - disc + up), fee = net * kp, cum = 0, r = { net: net, fee: fee, own: 0, bank: 0, na: false, ph: {} };
    steps.forEach(function (s) {
      s.one = 0; s.total = 0; s.share = 0;
      if (s.na) { r.na = true; s.cum = null; return; }
      var one = s.fixed || (s.p * net - s.less);
      if (s.kpbt) one += fee;
      if (s.cash) {
        s.one = one; s.total = one * s.n;
        if (s.bank) r.bank += s.total; else r.own += s.total;
        var ph = r.ph[s.ph] || (r.ph[s.ph] = { amt: 0, bank: 0 });
        ph.amt += s.total; if (s.bank) ph.bank += s.total;
        cum += (s.fixed || (s.p * net - s.less)) * s.n;
      }
      s.cum = net ? cum / net : 0;
    });
    r.cash = r.own + r.bank;
    return r;
  }

  // Dòng thời gian (thẻ Masteri, MIK)
  function paintTimeline(steps) {
    steps.forEach(function (s) {
      var amt = s.el.querySelector(".tl-amt");
      if (!amt) return;
      if (s.na) { amt.innerHTML = '<span class="na">' + s.na + "</span>"; return; }
      if (!s.cash) { amt.innerHTML = "0 đ<small>trừ vào tiền cọc</small>"; return; }
      amt.innerHTML = fmt(s.one) + (s.n > 1 ? "<small>× " + s.n + " đợt = " + fmt(s.total) + "</small>" : "") +
        '<small class="cum">Lũy kế ' + pc(s.cum) + "</small>";
      amt.title = Math.round(s.one).toLocaleString("vi-VN") + " đồng";
    });
  }

  // Thanh "đóng bao nhiêu ở mỗi giai đoạn"
  function paintPhases(plan, r) {
    var box = plan.querySelector(".pc-phase");
    if (!box) {
      box = document.createElement("div"); box.className = "pc-phase";
      var sum = plan.querySelector(".pc-sum");
      if (!sum) return;
      sum.parentNode.insertBefore(box, sum.nextSibling);
    }
    var keys = ["sign", "pre", "hand", "so"].filter(function (k) { return r.ph[k] && r.ph[k].amt > 0; });
    var bar = keys.map(function (k) {
      return '<i class="ph-' + k + '" style="width:' + (r.ph[k].amt / r.cash * 100).toFixed(2) + '%"></i>';
    }).join("");
    var li = keys.map(function (k) {
      var x = r.ph[k];
      return '<li class="ph-' + k + '"><span>' + PH[k] + "</span><b>" + fmt(x.amt) + "</b><small>" + pc(x.amt / r.cash) +
        (x.bank ? " · ngân hàng " + fmt(x.bank) : "") + "</small></li>";
    }).join("");
    if (r.na) li += '<li class="ph-na"><span>Mốc chưa công bố tỷ lệ</span><b>—</b><small>chưa tính vào tổng</small></li>';
    box.innerHTML = '<p class="ph-title">Đóng bao nhiêu, vào lúc nào</p><div class="ph-bar">' + bar + "</div><ul>" + li + "</ul>";
  }

  // Bảng chi tiết từng đợt
  function paintTable(plan, steps, hasPrice) {
    var wrap = plan.querySelector(".pc-table-wrap");
    if (!wrap) {
      wrap = document.createElement("div"); wrap.className = "pc-table-wrap";
      var tl = plan.querySelector(".tl");
      tl.parentNode.insertBefore(wrap, tl);
    }
    var rows = steps.map(function (s, k) {
      var cls = [s.bank ? "bank" : "", s.el.classList.contains("past") ? "past" : "", "ph-" + s.ph].join(" ");
      var what = s.what || ({ sign: "Ký hợp đồng", pre: "Theo tiến độ", hand: "Bàn giao căn hộ", so: "Đợt cuối" })[s.ph];
      var amt = "", cum = "";
      if (hasPrice) {
        if (s.na) amt = '<span class="na">' + s.na + "</span>";
        else if (!s.cash) amt = "0 đ<small>trừ vào tiền cọc</small>";
        else amt = fmt(s.one) + (s.n > 1 ? "<small>mỗi đợt · tổng " + fmt(s.total) + "</small>" : "");
        if (s.cum !== null) cum = '<span class="cumbar"><i style="width:' + Math.min(100, s.cum * 100).toFixed(1) + '%"></i></span>' + pc(s.cum);
      }
      return '<tr class="' + cls + '"><td class="c-when">' + s.whenHtml + '</td><td class="c-what">' + what +
        '</td><td class="c-pct">' + s.big + "</td>" + (hasPrice ? '<td class="c-amt">' + amt + '</td><td class="c-cum">' + cum + "</td>" : "") + "</tr>";
    }).join("");
    wrap.innerHTML = '<table class="pc-table"><thead><tr><th>Hạn thanh toán</th><th>Khoản</th><th class="r">Tỷ lệ</th>' +
      (hasPrice ? '<th class="r">Số tiền</th><th class="r">Lũy kế</th>' : "") + "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  // Bảng so sánh các phương án (theo năm hoặc theo mốc)
  function addMonths(start, m) { return new Date(start.getFullYear(), start.getMonth() + m, 1); }
  function buckets(box, layout) {
    if (layout === "year") {
      var st = (box.getAttribute("data-start") || "2027-01").split("-");
      var start = new Date(+st[0], st[1] - 1, 1), hand = box.getAttribute("data-hand") || "Bàn giao";
      var cols = [], seen = {};
      box.querySelectorAll(".tl-step[data-m]").forEach(function (e) {
        var n = num(e, "data-n", 1), ev = num(e, "data-every", 1), m0 = num(e, "data-m", 0);
        for (var k = 0; k < n; k++) { var y = addMonths(start, m0 + k * ev).getFullYear(); if (!seen[y]) { seen[y] = 1; cols.push(y); } }
      });
      cols.sort();
      var list = cols.map(function (y) { return { key: "y" + y, label: "Năm " + y, sub: y === start.getFullYear() ? "gồm ký HĐMB" : "" }; });
      list.push({ key: "hand", label: hand, sub: "gồm kinh phí bảo trì" }, { key: "so", label: "Nhận sổ", sub: "" });
      return {
        cols: list,
        place: function (s, add) {
          if (s.ph === "hand" || s.ph === "so") return add(s.ph, s.total);
          var m0 = s.m === null ? 0 : Number(s.m);
          for (var k = 0; k < s.n; k++) add("y" + addMonths(start, m0 + k * s.every).getFullYear(), s.one);
        }
      };
    }
    return {
      cols: [{ key: "sign", label: "Khi ký", sub: "cọc, HĐMB" }, { key: "pre", label: "Trước bàn giao", sub: "các đợt sau ký" },
        { key: "hand", label: "Khi bàn giao", sub: "" }, { key: "so", label: "Khi nhận sổ", sub: "" }],
      place: function (s, add) { add(s.ph, s.total); }
    };
  }
  function paintMatrix(box, layout, data) {
    var wrap = box.querySelector(".pc-matrix");
    if (!wrap) {
      wrap = document.createElement("div"); wrap.className = "pc-matrix";
      var nav = box.querySelector(".pc-jump");
      nav.parentNode.insertBefore(wrap, nav);
    }
    var b = buckets(box, layout);
    var head = "<tr><th>Phương án</th>" + b.cols.map(function (c) { return '<th class="r">' + c.label + (c.sub ? "<small>" + c.sub + "</small>" : "") + "</th>"; }).join("") +
      '<th class="r">Tổng phải trả<small>sau chiết khấu</small></th></tr>';
    var body = data.map(function (d) {
      var cell = {}, bank = {};
      d.steps.forEach(function (s) {
        if (s.na || !s.cash) return;
        b.place(s, function (k, v) { cell[k] = (cell[k] || 0) + v; if (s.bank) bank[k] = (bank[k] || 0) + v; });
      });
      return '<tr><th><a href="#' + d.plan.id + '" data-pick="' + d.plan.id + '">' + d.name + "</a></th>" + b.cols.map(function (c) {
        var v = cell[c.key];
        return '<td class="r" data-l="' + c.label + '">' + (v ? "<b>" + fmt(v) + "</b><small>" + pc(v / d.r.cash) + (bank[c.key] ? " · NH " + fmt(bank[c.key]) : "") + "</small>" : '<span class="dash">—</span>') + "</td>";
      }).join("") + '<td class="r tot" data-l="Tổng phải trả"><b>' + fmt(d.r.cash) + "</b><small>" + (d.r.bank ? "tự trả " + fmt(d.r.own) : "vốn tự có") + "</small></td></tr>";
    }).join("");
    wrap.innerHTML = '<p class="mx-title">So sánh nhanh: mỗi phương án đóng bao nhiêu, ' + (layout === "year" ? "theo từng năm" : "theo từng mốc") +
      '</p><div class="mx-scroll"><table><thead>' + head + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<p class="mx-hint">Bấm tên phương án để xem lịch chi tiết từng đợt. NH = ngân hàng giải ngân.</p>';
  }

  // Chọn từng phương án (lumiere, year, phase)
  function setupTabs(box) {
    var links = box.querySelectorAll(".pc-jump a"), plans = box.querySelectorAll(".pc-plan");
    function pick(id, scroll) {
      plans.forEach(function (p) { p.classList.toggle("off", p.id !== id); });
      links.forEach(function (a) { a.setAttribute("aria-current", a.getAttribute("href") === "#" + id ? "true" : "false"); });
      var p = document.getElementById(id);
      if (scroll && p) p.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    box.addEventListener("click", function (e) {
      var a = e.target.closest(".pc-jump a, a[data-pick]");
      if (!a || !box.contains(a)) return;
      e.preventDefault();
      pick(a.getAttribute("href").slice(1), a.hasAttribute("data-pick"));
    });
    if (plans.length) pick(plans[0].id, false);
  }

  document.querySelectorAll(".paycalc").forEach(function (box) {
    var layout = box.getAttribute("data-layout") || "masteri";
    var input = box.querySelector(".pc-price"), hasPrice = !!input;
    var plans = Array.prototype.slice.call(box.querySelectorAll(".pc-plan"));
    var data = plans.map(function (p) {
      var steps = read(p);
      steps.forEach(function (s) { if (s.date && s.date < today) s.el.classList.add("past"); });
      return { plan: p, steps: steps, name: txt(p, ".pc-head h3") };
    });
    box.classList.add("js-on");
    var tabbed = layout === "lumiere" || layout === "year" || layout === "phase";
    if (tabbed) setupTabs(box);

    function run() {
      var price = hasPrice ? parse(input.value) : 0;
      data.forEach(function (d) {
        if (hasPrice) {
          d.r = compute(d.plan, price, d.steps);
          paintTimeline(d.steps);
          paintPhases(d.plan, d.r);
          var set = function (c, v) { var e = d.plan.querySelector(c); if (e) e.textContent = fmt(v); };
          set(".pc-net", d.r.net); set(".pc-own", d.r.own); set(".pc-bank", d.r.bank); set(".pc-fee", d.r.fee);
        }
        if (tabbed) paintTable(d.plan, d.steps, hasPrice);
      });
      if (hasPrice && (layout === "year" || layout === "phase")) paintMatrix(box, layout, data);
      hint();
    }
    function hint() {
      plans.forEach(function (p) {
        var tl = p.querySelector(".tl"), h = p.querySelector(".pc-hint");
        if (tl && h) h.classList.toggle("on", tl.offsetParent !== null && tl.scrollWidth > tl.clientWidth + 4);
      });
    }
    if (input) input.addEventListener("input", function () {
      var v = parse(input.value);
      input.value = v ? v.toLocaleString("vi-VN") : "";
      run();
    });
    box.querySelectorAll("[data-set]").forEach(function (b) {
      b.addEventListener("click", function () { if (input) { input.value = b.getAttribute("data-set"); run(); } });
    });
    window.addEventListener("resize", hint);
    document.addEventListener("click", function () { setTimeout(hint, 60); });
    run();
  });

  // Trạng thái thẻ tài liệu chính sách theo ngày hôm nay
  document.querySelectorAll(".doc[data-to]").forEach(function (d) {
    var to = new Date(d.getAttribute("data-to") + "T23:59:59");
    var st = d.querySelector(".st");
    if (st && to < today) { st.textContent = "Hết hạn"; st.className = "st off"; }
  });
})();
