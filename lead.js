/* Gửi form "Nhận bảng giá" tới Netlify Forms mà không rời trang.
   Nếu trình duyệt tắt JavaScript, form vẫn gửi bình thường và chuyển tới /cam-on/. */
(function () {
  document.querySelectorAll("form.leadform").forEach(function (form) {
    var msg = form.querySelector(".lead-msg");
    var btn = form.querySelector("button[type=submit]");
    var phone = form.querySelector("input[name=so-dien-thoai]");

    function say(text, cls) { msg.className = "lead-msg " + (cls || ""); msg.innerHTML = text; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var digits = phone.value.replace(/\D/g, "").replace(/^84/, "0");
      if (!/^0\d{9,10}$/.test(digits)) {
        say("Số điện thoại chưa đúng, vui lòng kiểm tra lại (10 số, bắt đầu bằng 0).", "err");
        phone.focus();
        return;
      }
      phone.value = digits;
      btn.disabled = true;
      say("Đang gửi…");
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset();
        say("Đã nhận thông tin. Em sẽ gọi lại cho Anh/Chị trong thời gian sớm nhất.", "ok");
      }).catch(function () {
        say('Chưa gửi được. Anh/Chị nhắn Zalo giúp em: <a href="https://zalo.me/0929599292" target="_blank" rel="noopener">0929 599 292</a>.', "err");
      }).finally(function () { btn.disabled = false; });
    });
  });
})();
