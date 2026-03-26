---
title: Buyer order payment refund browser E2E và FE drawio sync basics
date: 2026-03-26
---

# Buyer order payment refund browser E2E và FE drawio sync basics

## Bối cảnh

Trong slice này, FE đã có thêm một test browser E2E lớn hơn cho luồng buyer:

1. Buyer mở trang chi tiết xe.
2. Buyer tạo order kiểu `partial`.
3. FE chuyển buyer sang tab đơn mua.
4. Buyer lấy hướng dẫn thanh toán.
5. FE refresh lại order sang trạng thái `held`.
6. Buyer gửi yêu cầu hoàn tiền kèm ảnh bằng chứng.

Điểm quan trọng là đây không còn là test unit hay test mock component nhỏ nữa. Đây là test chạy qua trình duyệt Playwright, nên nó gần hơn với cách người dùng thật bấm trên giao diện.

## File test mới

- `tests/e2e/buyer-order-payment-refund-flow.spec.ts`

Test này khóa 3 ý chính:

- contract tạo order từ `BikeDetailPage`
- contract lấy payment instruction trong `BuyerOrdersView`
- contract gửi refund multipart có file ảnh bằng chứng

## Luồng FE của test

### 1. User action

Buyer truy cập `BikeDetailPage` và bấm tạo yêu cầu mua.

### 2. Route / page

- `/bikes/:productId`
- sau khi tạo order, FE điều hướng sang `/profile?tab=orders`

### 3. Component

- `BikeDetailPage`
- `ProfilePage`
- `BuyerOrdersView`
- `DisputeModal`

### 4. API mock trong browser E2E

Test chặn các request có `pathname` bắt đầu bằng `/api/` rồi mock các endpoint chính:

- `/api/auth/me`
- `/api/products/:id`
- `/api/orders`
- `/api/orders/me`
- `/api/payments/orders/:id/request`
- `/api/orders/:id/refunds`

Điều này giúp app vẫn mount bình thường, vì test không vô tình chặn các file source của Vite như `/src/...`.

## Vì sao phải có test browser E2E này

Khi chỉ có unit test hoặc component test, ta biết từng mảnh nhỏ chạy đúng.

Nhưng với flow order -> payment -> refund, lỗi thường xuất hiện ở chỗ nối giữa nhiều màn:

- điều hướng route
- state sau khi tạo order
- button chỉ hiện ở đúng status
- multipart upload ở modal refund

Browser E2E giúp bắt các lỗi nối flow như vậy.

## Drawio của FE đang nằm ở đâu

Một điểm dễ nhầm là trong thư mục `fe/` không có file `.drawio`.

Các diagram được FE cùng dùng lại đang nằm ở repo root:

- `old-bicycles-project/CONCEPTUAL-ERD.drawio`
- `old-bicycles-project/LOGICAL-ERD.drawio`

Nghĩa là nếu bạn search bên trong `fe/` thì sẽ không thấy, nhưng diagram vẫn thuộc phạm vi FE vì FE đang dùng cùng mô hình dữ liệu với backend.

## Những gì đã sync vào drawio

### Conceptual ERD

Đã có các khái niệm mới:

- `REPORT FILE`
- `REFUND REQUEST FILE`
- `FINANCIAL TRANSACTION`
- `ORDER` có fee snapshot
- `PAYMENT` có buyer charge và protected amount
- `PAYOUT` có gross / fee deduction / net

### Logical ERD

Đã sync các bảng và field mới quan trọng:

- `orders` có nhóm field `platform_fee_*`, `buyer_fee_amount`, `seller_fee_amount`, `buyer_charge_amount`
- `payments` có `protected_amount`, `buyer_fee_amount`, `gateway`, `phase`, `gateway_response`, `payment_date`
- `refund_requests` có `requester_id`, `refund_reference`, `processed_at`, `created_at`
- `payouts` có `type`, `gross_amount`, `fee_deduction_amount`, `net_amount`, `transfer_content`, `admin_note`
- bảng mới `report_files`
- bảng mới `refund_request_files`
- bảng mới `financial_transactions`

## Ý nghĩa cho người mới

Nếu bạn là sinh viên năm đầu hoặc mới đọc dự án:

- `buyer charge amount` là tổng tiền buyer thực sự chuyển
- `protected amount` là phần tiền giao dịch hệ thống đang giữ để bảo chứng
- `financial transaction` là bảng ghi log tài chính để sau này đối soát payment, refund, payout

Nói ngắn gọn:

- FE test mới giúp khóa luồng nghiệp vụ thực hơn
- drawio đã được kéo theo để không bị lệch khỏi code hiện tại
