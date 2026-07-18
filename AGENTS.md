# Quy tắc an toàn dữ liệu BLANWHI

- Luôn chạy git pull --ff-only origin main trước khi sửa code.
- Trước khi commit, chạy npm run preserve:live-site và npm run check:data.
- Không được thay dữ liệu live bằng dữ liệu mẫu hoặc làm giảm số sản phẩm, URL ảnh, liên kết Pancake nếu chủ shop chưa xác nhận xoá.
- Không xoá hoặc đổi URL ảnh cũ khi chưa có bản thay thế hoạt động.
- Luôn chạy npx tsc --noEmit, commit và push lên nhánh main, sau đó chờ Vercel báo Ready.
- Repo khaitamphatphap-bit/web-blanwhi là repo deploy chính. Repo nguyencaothuan01-ux chỉ là backup; không push sang đó trừ khi đặt rõ BLANWHI_PUSH_BACKUP=1.
- Sau deploy phải kiểm tra /, /admin/site, /admin/orders, /admin/pancake và giao diện điện thoại.