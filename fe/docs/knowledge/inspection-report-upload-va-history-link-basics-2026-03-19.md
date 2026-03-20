# Upload báo cáo kiểm định ở FE và link báo cáo trong lịch sử

## 1. Bối cảnh

Inspector đã có trang điền điểm kiểm định, nhưng trước đó còn thiếu:

- chỗ chọn file báo cáo
- chỗ xem lại link báo cáo trong lịch sử kiểm định

Điều này làm người dùng FE có cảm giác:

- hệ thống chỉ chấm điểm bằng chữ
- chưa có tài liệu kiểm định thật đi kèm

## 2. Bản sửa lần này làm gì?

File chính:

- [InspectionFormPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionFormPage.tsx)
- [InspectionHistoryPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionHistoryPage.tsx)
- [inspections.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/inspections.api.ts)
- [inspection.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/types/inspection.ts)

Các thay đổi:

1. thêm `inspectionsApi.uploadReport(productId, reportFile)`
2. trang form cho inspector chọn file
3. nếu đã có báo cáo cũ thì có link để mở
4. trang history có nút `Xem báo cáo`

## 3. Luồng đi của FE trong task này

```text
Inspector mở /inspector/inspect/:id
-> InspectionFormPage mount
-> page gọi productsApi.getById(id)
-> page gọi inspectionsApi.getByProduct(id)
-> user nhập điểm + ghi chú + chọn file
-> FE gọi inspectionsApi.uploadReport(id, file) nếu có file
-> FE gọi inspectionsApi.evaluate(id, payload)
-> backend lưu kết quả và gửi notification cho seller
-> FE navigate sang /inspector/history
-> InspectionHistoryPage gọi inspectionsApi.getHistory(...)
-> history item hiển thị nút mở báo cáo nếu có reportFileUrl
```

## 4. Giải thích từng bước đơn giản

### Bước 1: Form tải context hiện tại

Trong [InspectionFormPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionFormPage.tsx):

- page lấy product
- page lấy inspection hiện có

Mục đích:

- biết xe nào đang được chấm
- biết đã có báo cáo cũ hay chưa

### Bước 2: User chọn file

FE giữ file trong state:

- `reportFile`

State này chưa phải là file đã lưu trên server.

Nó chỉ là file tạm mà browser đang giữ sau khi user chọn.

### Bước 3: FE upload file bằng `FormData`

Trong [inspections.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/inspections.api.ts):

- FE tạo `FormData`
- append `reportFile`
- gửi request `multipart/form-data`

Đây là pattern thường dùng khi upload file từ browser.

### Bước 4: FE gửi tiếp kết quả evaluate

Sau khi file upload xong, FE mới gọi:

- `inspectionsApi.evaluate(...)`

Như vậy, khi backend chốt kết quả, inspection đã có sẵn `reportFileUrl`.

### Bước 5: History render link báo cáo

Trang [InspectionHistoryPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionHistoryPage.tsx) đọc:

- `inspection.reportFileUrl`

Nếu có:

- render nút `Xem báo cáo`

Nếu không có:

- chỉ hiện dữ liệu chấm điểm

## 5. Vì sao cách này thực dụng?

Vì nó sửa ít nhưng hiệu quả rõ:

- không cần viết lại toàn bộ flow kiểm định
- không cần đổi router
- không cần thêm state manager phức tạp

Chỉ cần:

- thêm một API upload
- nối form với API đó
- hiển thị link ở history

## 6. Thuật ngữ cần nhớ

### `FormData`

`FormData` là một đối tượng trong browser dùng để gửi dữ liệu kiểu form, nhất là khi có file.

Ví dụ:

- text field
- image
- PDF

### `multipart/form-data`

Đây là kiểu `Content-Type` thường dùng để upload file.

Nó khác với JSON.

JSON phù hợp với dữ liệu text có cấu trúc, còn multipart phù hợp với file nhị phân.

## 7. Hiểu lầm dễ gặp

### Hiểu lầm 1: “Chọn file là đã upload xong”

Sai.

Chọn file mới chỉ là browser giữ file trong state.

Chỉ khi gọi API thì file mới đi lên server.

### Hiểu lầm 2: “Trang history tự có link báo cáo mà không cần đổi type”

Sai.

Nếu type FE không có `reportFileUrl`, TypeScript sẽ không biết field này tồn tại.

### Hiểu lầm 3: “Upload file thì phải gộp chung với mọi request khác”

Không cần.

Tách một request upload riêng thường dễ debug và dễ bảo trì hơn.

## 8. Chốt ngắn

FE lần này được làm thực tế hơn ở cụm inspector:

- inspector có thể đính kèm báo cáo thật
- có thể xem lại báo cáo trong lịch sử
- seller sẽ hưởng lợi gián tiếp vì backend đã có dữ liệu báo cáo để gửi notification và hiển thị ở các màn khác
