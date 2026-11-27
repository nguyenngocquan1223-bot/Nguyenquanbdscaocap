// Tính số tiền từng đợt theo giá căn khách nhập, và cập nhật trạng thái thẻ chính sách.
(function () {
  function fmt(v) {
    v = Math.round(v);
    if (Math.abs(v) >= 1e9) return (v / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
    if (Math.abs(v) >= 1e6) return Math.round(v / 1e6).toLocaleString("vi-VN") + " triệu";
    return v.toLocaleString("vi-VN") + " đ";
  }
  function parse(s) { return Number(String(s).replace(/[^\d]/g, "")) || 0; }
  function num(el, k, d) { var v = el.getAttribute(k); return v === null ? d : Number(v); }

  function calc(box) {
    var input = box.querySelector(".pc-price");
    if (!input) return;
    var price = parse(input.value);
    box.querySelectorAll(".pc-plan").forEach(function (plan) {
      var disc = num(plan, "data-disc", 0), up = num(plan, "data-up", 0), kp = num(plan, "data-kpbt", 0.02);
      var net = price * (1 - disc + up), own = 0, bank = 0, fee = net * kp;
      plan.querySelectorAll(".tl-step").forEach(function (st) {
        var p = num(st, "data-p", 0), n = num(st, "data-n", 1), fixed = num(st, "data-fixed", 0);
        var less = num(st, "data-less", 0), cash = st.getAttribute("data-cash") !== "0";
        var one = fixed || (p * net - less);
        if (st.hasAttribute("data-kpbt")) one += fee;
        var amt = st.querySelector(".tl-amt");
        if (!amt) return;
        if (st.hasAttribute("data-na")) { amt.innerHTML = '<span class="na">' + (st.getAttribute("data-na") || "Theo thông báo của CĐT") + "</span>"; return; }
        if (!cash) { amt.innerHTML = "0 đ<small>trừ vào tiền cọc</small>"; return; }
        var total = one * n;
        if (st.classList.contains("bank")) bank += total; else own += total;
        amt.innerHTML = fmt(one) + (n > 1 ? "<small>× " + n + " đợt = " + fmt(total) + "</small>" : "");
        amt.title = Math.round(one).toLocaleString("vi-VN") + " đồng";
      });
      var set = function (c, v) { var e = plan.querySelector(c); if (e) e.textContent = fmt(v); };
      set(".pc-net", net); set(".pc-own", own); set(".pc-bank", bank); set(".pc-fee", fee);
    });
  }

  document.querySelectorAll(".paycalc").forEach(function (box) {
    var input = box.querySelector(".pc-price");
    var re = function () {
      if (!input) return;
      var v = parse(input.value);
      input.value = v ? v.toLocaleString("vi-VN") : "";
      calc(box);
    };
    if (input) input.addEventListener("input", re);
    box.querySelectorAll("[data-set]").forEach(function (b) {
      b.addEventListener("click", function () { if (!input) return; input.value = b.getAttribute("data-set"); re(); });
    });
    // Gợi ý kéo ngang chỉ hiện khi dòng thời gian dài hơn khung
    var hint = function () {
      box.querySelectorAll(".pc-plan").forEach(function (p) {
        var tl = p.querySelector(".tl"), h = p.querySelector(".pc-hint");
        if (tl && h) h.classList.toggle("on", tl.scrollWidth > tl.clientWidth + 4);
      });
    };
    window.addEventListener("resize", hint);
    document.addEventListener("click", function () { setTimeout(hint, 60); });
    var tabs = box.querySelectorAll(".pc-tab"), plans = box.querySelectorAll(".pc-plan");
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        tabs.forEach(function (x, j) { x.setAttribute("aria-selected", i === j ? "true" : "false"); });
        plans.forEach(function (p, j) { p.hidden = i !== j; });
      });
    });
    re(); hint();
  });

  // Trạng thái thẻ chính sách theo ngày hôm nay
  var today = new Date(); today.setHours(0, 0, 0, 0);
  document.querySelectorAll(".doc[data-to]").forEach(function (d) {
    var to = new Date(d.getAttribute("data-to") + "T23:59:59");
    var st = d.querySelector(".st");
    if (st && to < today) { st.textContent = "Hết hạn"; st.className = "st off"; }
  });
})();
