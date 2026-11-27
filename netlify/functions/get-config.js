// Chỉ trả về Supabase URL và anon/publishable key (đây là khóa công khai dành cho client).
// Tuyệt đối không đặt SUPABASE_SERVICE_ROLE_KEY trong phản hồi này.
exports.handler = async function () {
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseAnonKey) {
    return { statusCode: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ error: "Supabase chưa được cấu hình." }) };
  }
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    body: JSON.stringify({ supabaseUrl, supabaseAnonKey })
  };
};