# Login page email/password only basics - 2026-03-24

## Bối cảnh

Màn hình đăng nhập trước đó vẫn hiển thị hai nút:

- Đăng nhập với Google
- Đăng nhập với Facebook

Nhưng ở phạm vi sản phẩm hiện tại, web app chỉ dùng luồng đăng nhập bằng email và mật khẩu. Giữ lại hai nút social login sẽ làm người dùng hiểu nhầm là tính năng đó đang hoạt động đầy đủ.

## Khái niệm đơn giản

`Login UI` là giao diện người dùng nhìn thấy khi vào trang đăng nhập.

`Auth flow` là luồng xác thực, tức là cách người dùng gửi thông tin đăng nhập lên backend và nhận kết quả.

Trong slice này:

- `Login UI` được thu gọn về email/mật khẩu
- `Auth flow` thật bên dưới không đổi, vẫn là FE gọi API login của backend

## File nào đã đổi

- [LoginPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/LoginPage.tsx)
- [LoginPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/LoginPage.test.tsx)

## Luồng chạy của FE

1. Người dùng mở route `/login`
2. Router render `LoginPage`
3. `LoginPage` hiển thị:
   - ô email
   - ô mật khẩu
   - nút đăng nhập
   - link quên mật khẩu
   - link đăng ký
4. Khi submit form, component gọi `login` từ `AuthContext`
5. Nếu backend trả thành công, FE điều hướng người dùng về trang trước đó hoặc trang chủ
6. Nếu backend trả lỗi, FE hiển thị message lỗi trên form

## Điều gì đã bị bỏ

Đã bỏ:

- divider `hoặc`
- nút Google
- nút Facebook

Việc này giúp màn hình đăng nhập phản ánh đúng tính năng mà người dùng thật sự có thể dùng.

## Test mới để chống hồi quy

`LoginPage.test.tsx` kiểm tra hai ý:

1. Trang login chỉ còn form email/mật khẩu và không còn hai nút social login
2. Submit form vẫn gọi `login` đúng dữ liệu và điều hướng sau khi thành công

## Lưu ý

Việc bỏ nút ở FE không tự động xóa toàn bộ code OAuth ở backend. Nó chỉ thay đổi hành vi giao diện hiện đang công bố cho người dùng. Vì đây là thay đổi hành vi sản phẩm, các bản SRS cũng được cập nhật cùng slice này.
