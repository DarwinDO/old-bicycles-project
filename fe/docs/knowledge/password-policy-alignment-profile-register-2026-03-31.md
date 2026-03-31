# Password Policy Alignment For Profile And Register Basics

## Mục tiêu

Ghi chú này giải thích vì sao frontend cần kiểm tra mật khẩu theo đúng rule của backend, và luồng chạy của phần đổi mật khẩu cùng đăng ký trong nhánh `profile-cleanup`.

## Rule mật khẩu đang áp dụng

Backend hiện yêu cầu mật khẩu phải có:

- ít nhất `8` ký tự
- ít nhất `1` chữ hoa
- ít nhất `1` chữ số

Frontend đã được chỉnh để dùng cùng đúng rule này ở cả:

- trang đăng ký
- phần đổi mật khẩu trong trang hồ sơ cá nhân

## Vì sao cần đồng bộ FE và BE

Nếu frontend kiểm tra quá lỏng, người dùng có thể bấm gửi thành công ở giao diện nhưng backend lại từ chối. Khi đó người dùng sẽ thấy lỗi muộn và khó hiểu.

Ví dụ:

- người dùng nhập `abcdefgh`
- frontend cũ của profile chỉ kiểm tra độ dài nên cho gửi
- backend vẫn chặn vì thiếu chữ hoa và chữ số

Sau khi chỉnh, frontend chặn ngay tại form với đúng thông điệp mà backend đang yêu cầu.

## File nào xử lý việc này

- `src/lib/password-policy.ts`
- `src/pages/register/useRegisterPage.ts`
- `src/pages/profile/useProfilePage.ts`
- `src/pages/profile/ProfileSecuritySection.tsx`

## Luồng chạy của trang đăng ký

1. Người dùng nhập mật khẩu ở `RegisterPage`.
2. Component form gọi hook `useRegisterPage`.
3. Hook dùng `getPasswordPolicyChecks(password)` từ `src/lib/password-policy.ts`.
4. Nếu mật khẩu không đạt rule, hook trả lỗi ngay bằng `PASSWORD_POLICY_GUIDANCE`.
5. Nếu hợp lệ, hook mới gọi `useAuth().register(...)`.
6. Request đi tới backend để tạo tài khoản.

Nói đơn giản:

- `page/component` nhận input
- `hook` kiểm tra rule
- `auth context/service` gửi API
- backend xử lý thật

## Luồng chạy của phần đổi mật khẩu

1. Người dùng vào `ProfilePage`, mở tab bảo mật.
2. `ProfileSecuritySection` render 3 ô:
   - mật khẩu hiện tại
   - mật khẩu mới
   - xác nhận mật khẩu mới
3. Ngay dưới ô mật khẩu mới, component hiển thị hướng dẫn `PASSWORD_POLICY_GUIDANCE`.
4. Khi submit form, `useProfilePage` chạy `submitPasswordChange(...)`.
5. Hook gọi `getPasswordPolicyChecks(passwordData.newPassword)`.
6. Nếu không hợp lệ, frontend dừng ngay và hiện lỗi.
7. Nếu hợp lệ, hook gọi `authService.changePassword(...)`.
8. Backend mới kiểm tra lại lần cuối và đổi mật khẩu thật.

## `password-policy.ts` làm gì

File này là nơi gom rule chung để tránh viết mỗi nơi một kiểu.

Nó trả về:

- `hasMinimumLength`
- `hasUppercase`
- `hasNumber`
- `isValid`

Ý nghĩa:

- mỗi cờ nhỏ cho biết mật khẩu đạt hay chưa ở từng điều kiện
- `isValid` là kết quả tổng cuối cùng

## Vì sao đây là cách tốt hơn

- tránh copy-paste regex hoặc điều kiện ở nhiều hook
- dễ sửa nếu backend đổi policy sau này
- đăng ký và đổi mật khẩu không còn mỗi nơi báo một kiểu khác nhau
- test đơn vị cho utility dễ viết và dễ tin hơn

## Test đã thêm

File test:

- `src/lib/password-policy.test.ts`

Test này kiểm tra:

- mật khẩu đúng rule thì pass
- thiếu chữ hoa thì fail
- thiếu chữ số thì fail
- quá ngắn thì fail

## Điều không thay đổi

Đây không phải rule sản phẩm mới. Backend đã yêu cầu như vậy từ trước. Frontend chỉ được chỉnh để bám đúng backend hơn.
