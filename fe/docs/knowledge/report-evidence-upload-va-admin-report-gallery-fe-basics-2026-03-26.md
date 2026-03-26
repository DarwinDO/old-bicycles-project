# Report Evidence Upload Và Admin Report Gallery Ở FE: giải thích cho người mới học

## 1. Bối cảnh

Ở bước trước, FE đã có:

- nút báo cáo `tin đăng`
- nút báo cáo `người bán`
- modal báo cáo mở từ `BikeDetailPage`

Nhưng modal đó vẫn chỉ gửi text. User chưa gửi được ảnh bằng chứng cho report.

Bản sửa ngày `2026-03-26` nối nốt vòng còn thiếu:

- `ReportModal` hỗ trợ chọn ảnh
- `reportsApi.submit(...)` đổi sang `FormData`
- admin report detail và `MyReportsPage` hiển thị lại ảnh đã gửi

## 2. Khái niệm cần hiểu

### `API module` là gì?

`API module` là file FE chuyên lo chuyện gọi backend.

Ví dụ trong slice này:

- `src/api/reports.api.ts`

Page hoặc component không nên tự build request phức tạp ở nhiều nơi khác nhau. Ta gom logic đó vào một API module.

### `evidence gallery` là gì?

Đây là vùng giao diện hiển thị danh sách ảnh bằng chứng.

Trong slice này, gallery được dùng ở:

- `AdminReportsPage`
- `MyReportsPage`

## 3. Các file chính

- `src/components/common/ReportModal.tsx`
- `src/components/common/ReportEvidenceSection.tsx`
- `src/api/reports.api.ts`
- `src/pages/admin/AdminReportsPage.tsx`
- `src/pages/MyReportsPage.tsx`
- `src/types/report.ts`

## 4. Luồng FE sau bản sửa

```text
User mở BikeDetailPage
-> bấm báo cáo product hoặc seller
-> ReportModal mở ra
-> user chọn reason, nhập mô tả, chọn ảnh
-> ReportModal gọi reportsApi.submit(...)
-> reportsApi biến dữ liệu thành FormData
-> backend trả về report có evidenceFiles
-> admin hoặc reporter xem lại ảnh trong AdminReportsPage / MyReportsPage
```

## 5. Vai trò của từng phần

### `ReportModal.tsx`

Component này giữ state cục bộ cho:

- `reason`
- `description`
- `files`

Nó là nơi người dùng nhập dữ liệu.

Khi submit, component tạo `payload` rồi gọi `reportsApi.submit(...)`.

### `reportsApi.ts`

Đây là nơi chuyển request sang `FormData`.

Nó append:

- `targetId`
- `targetType`
- `reason`
- `description`
- `files`

Đây là bước quan trọng nhất để FE khớp với backend multipart contract.

### `types/report.ts`

File này khai báo rõ hơn shape dữ liệu:

- `ReportRequest` có thêm `files?: File[]`
- `Report` có thêm `evidenceFiles?: ReportEvidenceFile[]`

Nhờ vậy component biết chính xác report response có thể chứa những gì.

### `ReportEvidenceSection.tsx`

Đây là component hiển thị ảnh bằng chứng theo dạng gallery.

Tách riêng component này có lợi vì:

- admin page và my-reports page dùng lại cùng một UI
- tránh lặp code render ảnh ở nhiều chỗ

### `AdminReportsPage.tsx`

Admin mở chi tiết report sẽ thấy:

- metadata của report
- mô tả
- trạng thái
- ảnh bằng chứng user gửi kèm

Điều này giúp admin review report không còn bị thiếu ngữ cảnh hình ảnh.

### `MyReportsPage.tsx`

Người báo cáo cũng xem lại được ảnh mình đã gửi.

Đây là điểm nhỏ nhưng quan trọng, vì user có thể kiểm tra:

- mình đã gửi đúng file chưa
- report hiện còn giữ đủ bằng chứng hay không

## 6. Ví dụ nhỏ

User đang ở `BikeDetailPage` của một chiếc xe đáng ngờ.

User:

1. bấm “Báo cáo tin đăng này”
2. chọn lý do `fake`
3. nhập mô tả
4. chọn 2 ảnh chụp màn hình
5. bấm gửi

Sau đó:

- admin mở `AdminReportsPage` sẽ thấy 2 ảnh này trong dialog chi tiết
- chính user vào `MyReportsPage` cũng thấy lại 2 ảnh đã gửi

## 7. Test đã bảo vệ những gì?

Slice này thêm test ở:

- `src/api/reports.api.test.ts`
- `src/pages/admin/AdminReportsPage.test.tsx`
- `src/pages/MyReportsPage.test.tsx`

Ý nghĩa:

- test API helper khóa việc phải gửi `multipart/form-data`
- test admin page khóa việc evidence gallery thật sự xuất hiện trong dialog chi tiết
- test `MyReportsPage` khóa việc reporter vẫn nhìn thấy ảnh bằng chứng và ghi chú admin trong lịch sử report của mình

Nhờ vậy, nếu sau này ai đó vô tình đổi report API về JSON hoặc bỏ mất ảnh ở admin dialog, test sẽ báo lỗi sớm.

## 8. Những hiểu lầm dễ gặp

### Hiểu lầm 1: “Có upload file là admin tự thấy ảnh”

Không đúng.

Muốn admin thấy ảnh, FE còn phải:

- mở rộng kiểu dữ liệu `Report`
- render gallery ở dialog chi tiết

### Hiểu lầm 2: “My Reports chỉ cần text là đủ”

Không hẳn.

Nếu user đã gửi ảnh, việc hiển thị lại ảnh giúp flow rõ ràng và đáng tin hơn.

### Hiểu lầm 3: “Gallery report và gallery refund là hai luồng giống hệt nhau”

Không hẳn.

UI có thể gần giống nhau, nhưng dữ liệu và ngữ cảnh nghiệp vụ khác nhau:

- report hướng tới trust & safety
- refund hướng tới dispute và hoàn tiền

## 9. Chốt ngắn

Slice này làm FE đi hết vòng cho report evidence:

- user chọn ảnh trong modal
- API helper gửi multipart đúng contract
- admin thấy ảnh trong report detail
- reporter thấy lại ảnh trong lịch sử report của mình

Đó là khác biệt giữa “có nút báo cáo” và “có luồng báo cáo hoàn chỉnh, có bằng chứng và xem lại được”.
