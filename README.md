# Nguyễn Quân – BĐS Cao Cấp

Website tĩnh của chuyên viên kinh doanh Nguyễn Ngọc Quân (River Homes), triển khai trên Netlify tại https://nguyenquanbdscaocap.com.

- `index.html`: trang chủ (giới thiệu, danh sách dự án, ký gửi, liên hệ)
- `central-park/`: dự án Gamuda Central Park (tòa Brighton)
- `iconia-lakeside/`: dự án Iconia LakeSide (Mipec Tố Hữu)

Ảnh lấy từ tài liệu chủ đầu tư, xuất ở kích thước gốc, không phóng to.
Triển khai: Netlify, nhánh `main`, không cần lệnh build, thư mục publish là thư mục gốc.

## Phần dùng chung
- `site.css`: thanh Gọi/Zalo nổi trên điện thoại (né biểu tượng Netlify), menu cuộn ngang có mờ mép phải, kiểu form liên hệ.
- `lead.js`: gửi form "Nhận bảng giá" tới Netlify Forms không rời trang; tắt JavaScript thì chuyển sang `/cam-on/`.
- Form tên `lien-he` có ở cả 3 trang; ô ẩn `trang` cho biết khách gửi từ trang nào. Cần bật **Forms → Form detection** trong Netlify và cài email thông báo.
- `sitemap.xml`, `robots.txt`, `favicon.svg`: khi thêm dự án mới, thêm URL vào `sitemap.xml`.
