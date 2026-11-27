# Thiết lập khu vực Admin

Website công khai và form Netlify Forms hiện tại được giữ nguyên. Khu vực quản trị mới nằm tại `/admin/login/`.

## 1. Tạo Supabase project
1. Tạo project tại https://supabase.com/dashboard.
2. Trong Project Settings → API, lấy Project URL và anon/public key.
3. Trong Authentication → Providers, bật Email.
4. Tắt public sign-up nếu không cần người dùng tự đăng ký. Tạo/invite duy nhất tài khoản `Nguyenngocquan1223@gmail.com` trong Authentication → Users và xác minh email.
5. Tạo mật khẩu mạnh trực tiếp trong Supabase/luồng mời. Không gửi mật khẩu qua chat hoặc commit vào GitHub.

## 2. Chạy SQL
Mở SQL Editor của Supabase, chạy toàn bộ file `supabase/migrations/001_admin_schema.sql`.

## 3. Cấu hình Netlify
Trong Site configuration → Environment variables, thêm:
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: anon/public key

Không đưa `service_role` key vào website hoặc biến được trả về trình duyệt. Không cần chia sẻ key bí mật với người khác.

Sau khi lưu biến môi trường, trigger deploy lại Netlify.

## 4. Đăng nhập
Mở `https://nguyenquanbdscaocap.com/admin/login/` và đăng nhập bằng email Admin đã được tạo trong Supabase.

## Phạm vi hiện tại
- Đã dựng giao diện đăng nhập và trang tổng quan.
- Xác thực bằng Supabase Auth; trang Admin kiểm tra email được phép.
- Bảng `consignments` bật RLS và chỉ email Admin đã xác minh được truy cập.
- Form khách hàng hiện hữu vẫn gửi Netlify Forms như trước; dữ liệu Netlify Forms cũ chưa được tự động nhập vào Supabase.
- Chưa bật nhận ký gửi vào database, chưa có đồng bộ lead từ Netlify Forms, và chưa triển khai quản lý trạng thái khách hàng. Các phần này cần được làm tiếp sau khi Supabase được cấu hình và kiểm thử.
