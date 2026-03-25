# Buyer Flow Regression Và Khoảng Trống Ảnh Refund, Report Admin

## 1. Bối cảnh

Slice này có 3 mục tiêu:

- thêm test integration cho luồng buyer từ tạo order đến xin hoàn tiền
- kiểm tra xem yêu cầu hoàn tiền hiện có gửi kèm ảnh riêng hay chưa
- kiểm tra xem tab báo cáo ở admin đang lấy dữ liệu từ đâu và người dùng hiện có thể báo cáo bằng cách nào

Điểm quan trọng là ba việc này liên quan với nhau:

- test giúp mình biết luồng buyer đang chạy ổn đến đâu
- refund cần biết buyer đang gửi bằng chứng kiểu gì
- admin reports chỉ có ý nghĩa nếu user thật sự tạo được report

---

## 2. Luồng buyer đã được test theo kiểu nào?

Repo FE hiện chưa có Playwright hay một stack browser E2E riêng.

Vì vậy, kiểu gần E2E nhất đang phù hợp với hạ tầng hiện có là:

- dùng `Vitest + Testing Library`
- render các page thật
- mock API theo đúng contract hiện tại
- chạy tuần tự qua nhiều màn để kiểm tra một luồng người dùng hoàn chỉnh

Test mới nằm ở:

- `src/tests/PlatformFeeBuyerFlow.integration.test.tsx`

### Luồng trong test

```text
Buyer mở BikeDetailPage
-> nhập upfront và tạo order
-> FE gọi ordersApi.create(...)
-> chuyển sang BuyerOrdersView
-> buyer lấy thông tin thanh toán
-> FE gọi paymentsApi.createRequest(...)
-> trạng thái order được mock sang held
-> buyer gửi yêu cầu hoàn tiền
-> FE gọi refundsApi.create(...) với buyerChargeAmount
```

### Vì sao test này có ích?

Vì nó bảo vệ đúng chỗ dễ vỡ nhất của `Policy V2`:

- buyer phải thấy breakdown phí đúng khi tạo order
- payment instruction phải tách `protectedAmount` và `buyerFeeAmount`
- refund phải dùng `buyerChargeAmount`, không quay lại logic cũ là `paidAmount`

---

## 3. Refund hiện có gửi kèm ảnh riêng hay chưa?

## Kết luận ngắn

Chưa.

Hiện tại refund chỉ có:

- `amount`
- `reason`
- `evidenceNote`

Nghĩa là buyer chỉ gửi được:

- số tiền hoàn
- lý do
- ghi chú mô tả bằng chữ

Chưa có API upload file riêng cho refund request.

### Dấu hiệu ở FE

Trong `src/components/profile/DisputeModal.tsx`, form refund chỉ có:

- chọn lý do
- nhập `evidenceNote`

Ngay trong UI cũng có dòng nhắc rằng hiện FE chỉ gửi `evidenceNote` và chưa có API upload file riêng cho khiếu nại.

### Dấu hiệu ở backend

Ở backend:

- `RefundCreateRequestDTO` chỉ có `amount`, `reason`, `evidenceNote`
- `RefundController` nhận `@RequestBody`
- `RefundRequest` entity cũng chỉ lưu `evidenceNote`

Điều này cho thấy refund hiện là JSON request bình thường, không phải `multipart/form-data`.

### Admin hiện thấy được gì khi duyệt refund?

Admin dispute detail hiện xem được:

- `evidenceNote` của refund
- ảnh seller bàn giao xe
- ảnh buyer xác nhận đã nhận

Hai nhóm ảnh này là ảnh của `order evidence`, không phải ảnh đính kèm riêng cho refund request.

Nói cách khác:

- hệ thống có ảnh bằng chứng của đơn hàng
- nhưng chưa có ảnh đính kèm dành riêng cho lần buyer gửi yêu cầu hoàn tiền

---

## 4. Tab báo cáo ở admin hiện có thật không?

## Kết luận ngắn

Có, nhưng mới hoàn chỉnh ở tầng backend và trang quản trị.

### Những gì đã có

Ở backend đã có đầy đủ các phần chính:

- bảng `reports`
- `ReportController`
- `ReportServiceImpl`
- API tạo report: `POST /api/reports`
- API report của chính mình: `GET /api/reports/me`
- API admin xem toàn bộ report: `GET /api/admin/reports`
- API admin xử lý report: `PUT /api/admin/reports/{reportId}/process`

Ở frontend cũng đã có:

- `src/pages/admin/AdminReportsPage.tsx`
- `src/pages/MyReportsPage.tsx`
- `src/api/reports.api.ts`
- `src/components/common/ReportModal.tsx`

Nghĩa là tab báo cáo của admin không phải UI giả. Nó đọc dữ liệu thật từ backend.

---

## 5. Vậy người dùng hiện báo cáo bằng cách nào?

## Điểm đang thiếu

Phần quan trọng nhất đang thiếu là:

- chưa có chỗ nào trong UI thật sự mở `ReportModal`

Khi tìm usage của `ReportModal`, hiện chỉ thấy file component đó được định nghĩa, nhưng chưa được mount vào page nào như:

- trang chi tiết sản phẩm
- trang hồ sơ người bán
- trang chat
- trang đơn hàng

Điều này dẫn tới tình trạng:

- backend báo cáo đã có
- admin reports page đã có
- my reports page đã có
- nhưng user cuối chưa có nút hoặc entry point rõ ràng để tạo report từ giao diện đang chạy

### Hiểu đơn giản

Hiện tại report đang ở trạng thái:

- **backend ready**
- **admin view ready**
- **user trigger chưa nối xong**

Nên nếu hỏi “người dùng báo cáo bằng cách nào?” thì câu trả lời thực tế là:

- về mặt kỹ thuật có thể gọi API `POST /api/reports`
- nhưng trong UI hiện tại chưa có luồng người dùng bình thường để bấm báo cáo

---

## 6. Luồng report hiện tại chạy như thế nào?

```text
Người dùng gửi POST /api/reports
-> ReportController nhận request
-> ReportServiceImpl kiểm tra target có tồn tại không
-> kiểm tra người này đã có report mở với target đó chưa
-> lưu bản ghi vào bảng reports
-> gửi notification cho admin
-> admin vào AdminReportsPage để xem và xử lý
-> nếu resolved thì backend có thể ẩn product hoặc banned user
```

### Điều này nghĩa là gì với admin tab?

Admin tab báo cáo hiện sẽ hoạt động tốt nếu có dữ liệu report được tạo vào hệ thống.

Vấn đề không nằm ở admin tab.

Vấn đề nằm ở đầu vào của report từ phía user.

---

## 7. Tóm tắt rất ngắn

- Buyer flow theo `Policy V2` hiện đã có thêm một test integration chạy qua `BikeDetailPage` và `BuyerOrdersView`.
- Refund hiện chưa cho upload ảnh riêng; chỉ có `evidenceNote` bằng chữ.
- Admin dispute có thể xem ảnh bàn giao/ảnh xác nhận của order, nhưng đó không phải ảnh đính kèm riêng của refund.
- Admin reports tab đã có backend thật và page thật.
- Tuy nhiên user hiện chưa có nút báo cáo nào được nối vào UI, vì `ReportModal` chưa được dùng ở page nào.

## 8. Nếu muốn đi tiếp

Hai bước hợp lý tiếp theo là:

1. thêm `refund evidence upload` riêng cho yêu cầu hoàn tiền
2. gắn `ReportModal` vào ít nhất một entry point thật, ví dụ `BikeDetailPage` và trang hồ sơ seller
