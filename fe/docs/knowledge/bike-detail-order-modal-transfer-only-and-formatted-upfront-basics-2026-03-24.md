# Bike Detail Order Modal: Transfer-Only, Currency Input, and Compact Breakdown Basics (2026-03-24)

## Bối cảnh

Modal `Tạo yêu cầu mua xe` ở `BikeDetailPage` từng bị dài vì hiển thị quá nhiều giải thích cùng lúc:

- giá niêm yết
- hình thức thanh toán
- phương thức thanh toán áp dụng
- quy tắc đặt cọc
- toàn bộ breakdown phí

Khi mọi thứ đều mở sẵn, người dùng phải cuộn nhiều hơn dù mục tiêu chính chỉ là:

1. chọn `partial` hay `full`
2. nhập số tiền ứng trước nếu cần
3. biết mình phải chuyển ngay bao nhiêu

## Khái niệm cần biết

### Progressive disclosure là gì?

`Progressive disclosure` là cách chỉ hiện thông tin quan trọng trước, còn phần chi tiết thì để trong vùng mở rộng.

Ví dụ đơn giản:

- mặt trước: "Bạn cần chuyển ngay 4.200.000 đ"
- mở rộng thêm: "phí sàn tổng", "seller chịu bao nhiêu", "vì sao cash bị ẩn"

Cách này giúp giao diện ngắn hơn nhưng vẫn không làm mất thông tin.

## Vấn đề cũ

Trước thay đổi này:

- modal có một block riêng cho `Phương thức thanh toán áp dụng`
- block này lặp lại ý `Chuyển khoản`
- phần breakdown phí hiển thị đầy đủ ngay từ đầu
- người dùng phải đọc nhiều dòng giải thích trước khi kịp thao tác

## Cách sửa

### 1. Giữ `transfer-only` nhưng hiển thị gọn hơn

Thay vì một block riêng cho `Phương thức thanh toán áp dụng`, modal chỉ giữ:

- badge `Chuyển khoản`
- một dòng giải thích ngắn rằng flow công khai hiện chỉ hỗ trợ chuyển khoản

### 2. Giữ phần tóm tắt ở mặt trước

Khi buyer đã chọn `partial` hoặc `full`, modal ưu tiên hiển thị:

- `Phí buyer`
- `Bạn cần chuyển ngay`

Đây là hai con số buyer cần nhìn thấy sớm nhất để quyết định có tiếp tục hay không.

### 3. Đưa breakdown dài vào vùng mở rộng

Các thông tin chi tiết hơn được đặt sau nút:

- `Xem chi tiết phí và quy tắc`

Khi mở ra mới thấy:

- giá trị xe
- khoản hệ thống đang giữ
- phí sàn tổng
- phần seller chịu
- ghi chú vì sao cash không còn hiển thị ở flow công khai

## File liên quan

- `src/pages/BikeDetailPage.tsx`
- `src/pages/BikeDetailPage.test.tsx`
- `src/lib/currency-input.ts`
- `../SRS-Old-Bicycles-Marketplace (1).md`

## Runtime flow sau khi sửa

### Luồng từ thao tác người dùng đến UI cập nhật

1. Buyer mở `BikeDetailPage`.
2. Buyer bấm `Tạo yêu cầu mua`.
3. `isOrderDialogOpen` chuyển sang `true`.
4. Modal hiện phần tóm tắt ngắn:
   - giá niêm yết
   - badge `Chuyển khoản`
   - lựa chọn `partial` hoặc `full`
5. Nếu chọn `partial`, buyer nhập `Số tiền ứng trước`.
6. `onChange` gọi `formatCurrencyInput(...)` để format số theo kiểu Việt Nam.
7. Component dùng `parseCurrencyInput(...)` và `calculatePlatformFeePreview(...)` để tính preview.
8. FE hiển thị trước:
   - `Phí buyer`
   - `Bạn cần chuyển ngay`
9. Nếu buyer muốn xem sâu hơn, bấm `Xem chi tiết phí và quy tắc`.
10. State `isOrderBreakdownExpanded` đổi từ `false` sang `true`, React render thêm breakdown chi tiết.

## Ví dụ dễ hiểu

Giả sử:

- giá xe: `20.000.000 đ`
- buyer nhập ứng trước: `4.000.000 đ`

FE sẽ ưu tiên cho buyer thấy ngay:

- `Phí buyer`
- `Bạn cần chuyển ngay`

Nếu mở rộng thêm, buyer mới thấy:

- `Phí sàn tổng`
- `Khoản hệ thống đang giữ`
- `Seller chịu`

## Vì sao cách mới dễ dùng hơn?

Vì modal tạo đơn là nơi người dùng ra quyết định nhanh. Nếu giao diện bắt người dùng đọc hết mọi chi tiết tài chính từ đầu, thao tác sẽ nặng hơn mức cần thiết.

Cách mới giữ đúng nguyên tắc:

- thông tin bắt buộc ở mặt trước
- thông tin chi tiết nằm sau hành động chủ động của người dùng

## Test đã bảo vệ gì?

Test ở `src/pages/BikeDetailPage.test.tsx` đang kiểm tra:

- modal vẫn chặn khoản ứng trước thấp hơn mức tối thiểu
- nút submit vẫn bị disable khi số tiền chưa hợp lệ
- phần chi tiết phí không hiện mặc định
- khi bấm nút mở rộng, breakdown chi tiết mới xuất hiện

## Điều quan trọng cần nhớ

Rút ngắn modal không có nghĩa là bỏ luật nghiệp vụ.

Các luật sau vẫn còn nguyên:

- chỉ hỗ trợ `transfer` ở flow công khai
- `partial` phải lớn hơn `0`
- `partial` không được vượt giá xe
- `partial` phải đủ cover phần phí seller nếu fee policy đang áp dụng
