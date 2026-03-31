# Căn chỉnh lại test expectation sau khi UI và business rule đổi

## Bối cảnh

Có 3 test ở frontend bị fail nhưng nguyên nhân không phải do luồng chạy của ứng dụng bị hỏng.

- `LoginPage.test.tsx`
- `AdminPayoutsPage.test.tsx`
- `PlatformFeeBuyerFlow.integration.test.tsx`

Vấn đề nằm ở chỗ `test expectation` đã cũ hơn code thật.

## Test expectation là gì

`Test expectation` là điều mà test đang chờ nhìn thấy sau khi code chạy xong.

Ví dụ:

- test chờ thấy dòng chữ `Gross:`
- nhưng giao diện thật đã đổi thành `Tổng số tiền:`

Lúc đó test sẽ báo fail, dù trang thật ra vẫn chạy đúng.

## 1. LoginPage

### Vấn đề

Test cũ chờ thông điệp tiếng Anh:

- `Please verify your email before logging in`

Nhưng giao diện thật ở `LoginPage.tsx` đã hiển thị nội dung tiếng Việt:

- `Tài khoản này chưa xác thực email.`

### Ý nghĩa

Luồng không hỏng. Chỉ là test vẫn đang bám vào text cũ.

## 2. AdminPayoutsPage

### Vấn đề

Test cũ kiểm tra các label tiếng Anh:

- `Gross:`
- `Fee deduction:`

Nhưng UI thật đã đổi sang tiếng Việt:

- `Tổng số tiền:`
- `Khoản phí khấu trừ:`

### Ý nghĩa

Trang admin payout vẫn render đúng dữ liệu payout, chỉ là test chưa được cập nhật theo wording mới.

## 3. PlatformFeeBuyerFlow

### Vấn đề

Test cũ chờ thấy `400.000` ở phần phí buyer.

Nhưng logic mới trong `platform-fee-preview.ts` đã chia `platform fee` cho cả buyer và seller:

- tổng phí sàn: `400.000`
- buyer chịu: `200.000`
- seller chịu: `200.000`

Vì vậy giao diện thật hiển thị:

- `Phí buyer: 200.000`
- `Bạn cần chuyển ngay: 4.200.000`

### Ý nghĩa

Đây không phải bug ở flow mua hàng. Đây là test đang kiểm tra theo business rule cũ.

## Flow frontend của case này

### LoginPage

`user nhập form -> LoginPage -> useAuth().login -> backend trả lỗi email chưa xác thực -> state lỗi cập nhật -> component render nút gửi lại email`

### AdminPayoutsPage

`user mở trang admin payout -> page gọi payoutsApi.getAdminPayouts -> dữ liệu đổ vào table -> component render label tiền và trạng thái`

### Platform fee buyer flow

`user nhập số tiền ứng trước -> BikeDetailPage tính preview bằng platform-fee-preview.ts -> component render phí buyer, số tiền phải chuyển và số tiền seller dự kiến nhận`

## Điều cần nhớ

Khi sửa giao diện hoặc business rule, có 2 thứ phải đi cùng nhau:

1. code thật
2. expectation trong test

Nếu chỉ sửa code mà quên sửa test, ta sẽ gặp `false negative`, tức là test báo đỏ dù tính năng thật vẫn đúng.
