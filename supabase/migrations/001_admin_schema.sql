-- Nguyễn Quân BĐS: schema ban đầu cho khu vực quản trị.
-- Chạy trong Supabase SQL Editor. Không lưu mật khẩu trong các bảng ứng dụng.

create table if not exists public.consignments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_name text not null,
  phone text not null,
  property_type text,
  project text,
  address text,
  area_m2 numeric(10,2),
  asking_price numeric(16,2),
  notes text,
  status text not null default 'new' check (status in ('new','contacted','verified','listed','closed','rejected'))
);

create index if not exists consignments_created_at_idx on public.consignments (created_at desc);
create index if not exists consignments_owner_id_idx on public.consignments (owner_id);

alter table public.consignments enable row level security;

-- Chỉ tài khoản có email Admin đã xác minh mới được xem/quản lý dữ liệu.
drop policy if exists "Admin email can read consignments" on public.consignments;
create policy "Admin email can read consignments"
on public.consignments for select to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'nguyenngocquan1223@gmail.com'
  and coalesce(auth.jwt() ->> 'email_verified','false') = 'true'
);

drop policy if exists "Admin email can manage consignments" on public.consignments;
create policy "Admin email can manage consignments"
on public.consignments for all to authenticated
using (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'nguyenngocquan1223@gmail.com'
  and coalesce(auth.jwt() ->> 'email_verified','false') = 'true'
)
with check (
  lower(coalesce(auth.jwt() ->> 'email','')) = 'nguyenngocquan1223@gmail.com'
  and coalesce(auth.jwt() ->> 'email_verified','false') = 'true'
);

grant select, insert, update, delete on public.consignments to authenticated;

-- Lưu ý: không tạo policy công khai. Biểu mẫu ký gửi chỉ được mở sau khi có
-- endpoint server-side chống spam, kiểm tra dữ liệu và gán owner_id an toàn.
