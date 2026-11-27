import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const ADMIN_EMAIL = "Nguyenngocquan1223@gmail.com".toLowerCase();
const list = document.querySelector("#consignments");
const count = document.querySelector("#consignment-count");
const emailLabel = document.querySelector("#admin-email");
const logout = document.querySelector("#logout");
async function start() {
  try {
    const response = await fetch("/.netlify/functions/get-config");
    if (!response.ok) throw new Error("Chưa cấu hình Supabase trên Netlify.");
    const config = await response.json();
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || (session.user.email || "").toLowerCase() !== ADMIN_EMAIL) { location.replace("/admin/login/"); return; }
    emailLabel.textContent = session.user.email;
    logout.addEventListener("click", async () => { logout.disabled = true; await supabase.auth.signOut(); location.replace("/admin/login/"); });
    const { data, error } = await supabase.from("consignments").select("id,created_at,owner_name,phone,property_type,project,status").order("created_at",{ascending:false}).limit(50);
    if (error) throw error;
    count.textContent = String(data.length);
    if (!data.length) { list.textContent = "Chưa có yêu cầu ký gửi nào trong cơ sở dữ liệu."; return; }
    const table = document.createElement("div"); table.className = "table-wrap";
    const tableEl = document.createElement("table");
    const headers = ["Ngày nhận","Khách hàng","Số điện thoại","Loại BĐS","Dự án","Trạng thái"];
    const thead = document.createElement("thead"), trh = document.createElement("tr");
    headers.forEach(h=>{const th=document.createElement("th");th.textContent=h;trh.append(th)});thead.append(trh);tableEl.append(thead);
    const tbody=document.createElement("tbody");
    data.forEach(item=>{const tr=document.createElement("tr");[new Date(item.created_at).toLocaleDateString("vi-VN"),item.owner_name,item.phone,item.property_type,item.project,item.status].forEach(v=>{const td=document.createElement("td");td.textContent=v||"—";tr.append(td)});tbody.append(tr)});
    tableEl.append(tbody);table.append(tableEl);list.replaceChildren(table);
  } catch (error) { list.textContent = error.message || "Không tải được dữ liệu. Vui lòng kiểm tra cấu hình và quyền truy cập."; }
}
start();