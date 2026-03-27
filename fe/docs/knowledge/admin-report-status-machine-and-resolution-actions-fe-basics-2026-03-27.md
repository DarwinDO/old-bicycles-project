# Admin Report Status Machine And Resolution Actions Ở FE: giải thích cho người mới học

## 1. Bối cảnh

Backend đã đổi report flow sang 4 trạng thái:

- `pending`
- `investigating`
- `resolved_upheld`
- `resolved_dismissed`

Nếu FE vẫn giữ logic cũ kiểu `pending / reviewed / resolved` thì sẽ có 2 lỗi lớn:

- admin không xử lý tiếp được case đang `investigating`
- user nhìn thấy nhãn trạng thái sai hoặc mơ hồ

Vì vậy FE phải sync cả kiểu dữ liệu lẫn cách render UI.

## 2. Các file chính

- `src/types/report.ts`
- `src/pages/admin/AdminReportsPage.tsx`
- `src/pages/MyReportsPage.tsx`
- `src/components/dashboard/StatusBadge.tsx`
- `src/pages/admin/AdminReportsPage.test.tsx`
- `src/pages/MyReportsPage.test.tsx`

## 3. FE đổi gì ở lớp dữ liệu

`ReportStatus` trong `src/types/report.ts` bây giờ là:

- `pending`
- `investigating`
- `resolved_upheld`
- `resolved_dismissed`

Điều này giúp TypeScript chặn sớm các chỗ còn dùng status cũ.

## 4. Admin page xử lý report thế nào

`AdminReportsPage.tsx` làm 3 việc quan trọng:

- filter theo 4 trạng thái mới
- chỉ cho xử lý report đang mở
- ép admin chọn hành động rõ ràng trong dialog

Rule xử lý ở UI:

- `pending` có thể chuyển sang `investigating`
- `pending` cũng có thể đóng thẳng thành `resolved_upheld` hoặc `resolved_dismissed`
- `investigating` có thể kết thúc ở `resolved_upheld` hoặc `resolved_dismissed`
- report đã đóng thì không còn nút process

Điểm này phải khớp với backend state machine. Nếu UI rộng hơn backend, admin sẽ bấm được nhưng API fail. Nếu UI hẹp hơn backend, case sẽ bị kẹt.

## 5. Vì sao phải có `labelOverride` trong `StatusBadge`

`StatusBadge` là component dùng chung cho nhiều ngữ cảnh:

- listing
- refund
- order
- report

Vấn đề là status `pending` ở từng ngữ cảnh không mang cùng nghĩa:

- listing: gần nghĩa `chờ duyệt`
- report: gần nghĩa `chờ xử lý`

Nếu đổi label `pending` toàn cục thành `Chờ xử lý`, các màn listing sẽ sai nghĩa.

Giải pháp FE dùng ở bản sửa này:

- `StatusBadge` giữ config chung
- thêm prop `labelOverride`
- riêng `AdminReportsPage` và `MyReportsPage` truyền label report-specific

Nhờ vậy ta không phá các màn khác chỉ vì report flow đổi wording.

## 6. My Reports page đổi gì

`MyReportsPage.tsx` bây giờ hiển thị đúng nhãn moderation của report:

- `Chờ xử lý`
- `Đang điều tra`
- `Xác nhận vi phạm`
- `Bác bỏ báo cáo`

Điều này quan trọng vì reporter cần hiểu case của mình đang ở bước nào, thay vì nhìn một badge chung chung.

## 7. Test đang khóa gì

`AdminReportsPage.test.tsx` khóa các hành vi:

- tải danh sách report với filter hiện tại
- mở dialog detail và xem ảnh bằng chứng
- đóng case `investigating` bằng `resolved_dismissed`

`MyReportsPage.test.tsx` khóa việc:

- reporter vẫn thấy ảnh bằng chứng
- reporter thấy admin note
- reporter thấy đúng nhãn `Chờ xử lý`

`StatusBadge.test.tsx` khóa:

- label của các trạng thái report mới
- hành vi `labelOverride`

## 8. Chốt ngắn

Slice FE này làm UI report khớp với moderation flow mới của backend:

- type an toàn hơn
- admin xử lý được cả case `investigating`
- user nhìn thấy đúng nhãn report
- badge dùng chung nhưng không làm sai nghĩa ở ngữ cảnh khác

Đây là phần nối cần thiết để state machine mới không chỉ đúng ở API mà còn đúng ở trải nghiệm quản trị và theo dõi report.
