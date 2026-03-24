# Bike Detail Order Modal: Transfer-Only va Formatted Upfront Amount Basics (2026-03-24)

## Mục tiêu của thay đổi

Trong modal `Tạo yêu cầu mua xe` ở trang chi tiết xe, buyer cần hiểu nhanh:

- giá niêm yết của xe
- số tiền ứng trước mình đang nhập là bao nhiêu
- phương thức thanh toán nào đang được hệ thống hỗ trợ thật

Trước thay đổi này, ô `Số tiền ứng trước` nhận số trần như `2000`, khó đọc khi số lớn. Ngoài ra UI còn để phần `Phương thức thanh toán` như một lựa chọn, trong khi public flow thực tế chỉ đang theo dõi và đối soát ổn định với `chuyển khoản`.

## File liên quan

- `src/pages/BikeDetailPage.tsx`
- `src/lib/currency-input.ts`
- `../SRS-Old-Bicycles-Marketplace (1).md`

## Runtime flow sau khi sửa

1. Buyer mở trang chi tiết xe ở `BikeDetailPage`.
2. Buyer bấm `Tạo yêu cầu mua`.
3. Modal order mở ra.
4. Buyer chọn `Hình thức thanh toán`:
   - `Đặt cọc một phần`
   - hoặc `Thanh toán toàn bộ`
5. Nếu là `Đặt cọc một phần`, buyer nhập `Số tiền ứng trước`.
6. `onChange` của input gọi `formatCurrencyInput(...)`.
7. Giá trị hiển thị trong ô được format theo `vi-VN`, ví dụ:
   - `2000` -> `2.000`
   - `2500000` -> `2.500.000`
8. Khi submit, `handleCreateOrder()` dùng `parseCurrencyInput(...)` để đổi lại về số sạch trước khi gửi API.

## Vì sao bỏ lựa chọn tiền mặt ở UI

Public buyer flow hiện đang bám vào:

- payment deadline
- timeout / expiry / auto-cancel
- webhook xác nhận thanh toán
- đối soát giao dịch

Các phần này hiện ổn định với `chuyển khoản`. Nhánh `cash` vẫn còn ở backend như một đường legacy/manual cho vài trường hợp nội bộ, nhưng không còn phù hợp để hiện như lựa chọn bình thường cho buyer ngoài giao diện công khai.

Vì vậy, modal không còn cho buyer chọn `Tiền mặt`. Thay vào đó, UI hiển thị cố định:

- `Phương thức thanh toán áp dụng: Chuyển khoản`

## Ảnh hưởng lên SRS

SRS đã được sync để ghi rõ:

- flow công khai của buyer hiện hỗ trợ `transfer`
- `cash` chỉ còn là nhánh legacy/manual nội bộ, không phải lựa chọn công khai cho buyer
