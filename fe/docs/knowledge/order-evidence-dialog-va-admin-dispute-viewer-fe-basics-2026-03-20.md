# Order Evidence Dialog Và Admin Viewer Ở FE: giải thích cho người mới học

## 1. Bối cảnh

Ở phía backend, đơn hàng đã hỗ trợ:

- seller upload ảnh lúc bàn giao xe
- buyer upload ảnh lúc xác nhận đã nhận xe

Nhưng nếu FE không có UI tương ứng thì người dùng sẽ không dùng được tính năng này.

Cho nên bản sửa ở FE làm 3 việc:

- tạo dialog upload evidence
- gắn dialog đó vào flow seller và buyer
- cho admin xem evidence ở màn tranh chấp

## 2. Những file chính

### FE upload và hiển thị evidence

- `src/components/profile/OrderEvidenceDialog.tsx`
- `src/components/profile/OrderEvidenceSection.tsx`
- `src/api/orders.api.ts`
- `src/types/order.ts`

### FE gắn vào flow nghiệp vụ

- `src/pages/seller/SellerOrdersPage.tsx`
- `src/components/profile/BuyerOrdersView.tsx`
- `src/pages/admin/AdminDisputesPage.tsx`

## 3. `Dialog` là gì?

`Dialog` là một cửa sổ nổi nhỏ hiện lên trên màn hình hiện tại.

Ta hay gọi nó là:

- modal
- popup có overlay

Trong task này:

- seller bấm `Báo đã giao xe`
- buyer bấm `Xác nhận đã nhận xe`

thì FE mở dialog để nhập:

- ghi chú
- ảnh chứng cứ

## 4. Vì sao FE phải dùng `FormData`?

Backend đã đổi sang:

- `multipart/form-data`

Nên FE không thể chỉ gọi:

```ts
http.patch('/api/orders/123/complete', { note, files })
```

vì JSON không chở file thật theo cách backend cần.

FE phải tạo:

```ts
const formData = new FormData()
formData.append('note', note)
files.forEach((file) => formData.append('files', file))
```

Rồi mới gửi request đi.

## 5. Luồng FE của seller

```text
Người dùng bấm "Báo đã giao xe"
-> SellerOrdersPage mở OrderEvidenceDialog
-> user nhập note + chọn ảnh
-> ordersApi.complete(orderId, values)
-> http client gửi multipart request
-> backend trả Order mới có sellerHandoverEvidence
-> FE reload orders
-> SellerOrdersPage render lại evidence section
```

### Điểm quan trọng

Ở seller flow:

- ảnh là **bắt buộc**

Cho nên `OrderEvidenceDialog` nhận prop:

- `requireFiles = true`

Nếu seller chưa chọn ảnh mà bấm submit, dialog sẽ chặn lại.

## 6. Luồng FE của buyer

```text
Người dùng bấm "Xác nhận đã nhận xe"
-> BuyerOrdersView mở OrderEvidenceDialog
-> buyer có thể nhập note + có thể chọn ảnh
-> ordersApi.confirmReceived(orderId, values)
-> backend trả Order mới có buyerReceiptEvidence
-> FE reload orders
-> UI hiển thị lại evidence của buyer và seller
```

Ở buyer flow:

- ảnh **không bắt buộc**
- vì buyer confirm đã là một hành động mạnh rồi

## 7. Luồng FE của admin

```text
Admin vào trang tranh chấp
-> AdminDisputesPage gọi refundsApi.getAll(...)
-> backend trả AdminRefund kèm sellerHandoverEvidence / buyerReceiptEvidence
-> admin bấm "Xem chi tiết"
-> dialog chi tiết mở ra
-> OrderEvidenceSection render ảnh, note, người gửi, thời gian
```

Nói ngắn:

- seller và buyer **tạo** evidence
- admin **xem** evidence

## 8. Vì sao tách `OrderEvidenceDialog` và `OrderEvidenceSection`?

Đây là cách tách component theo trách nhiệm.

### `OrderEvidenceDialog`

Chuyên lo:

- input note
- chọn file
- preview ảnh
- validation
- submit

### `OrderEvidenceSection`

Chuyên lo:

- hiển thị evidence đã có
- note
- người gửi
- thời gian
- gallery ảnh

Nếu trộn cả 2 việc vào một file rất to, code sẽ khó đọc và khó tái sử dụng.

## 9. Runtime flow của FE trong task này

### Seller/buyer upload

1. User action ở page
2. Component mở dialog
3. Dialog giữ local state:
   - `note`
   - `files`
4. API module tạo `FormData`
5. Backend trả order mới
6. Page reload danh sách order
7. React rerender evidence block

### Admin xem evidence

1. AdminDisputesPage fetch page refund
2. Dữ liệu được giữ trong state `refunds`
3. Admin mở detail dialog
4. Refund đang chọn được đưa vào state `detailDialog.refund`
5. `OrderEvidenceSection` đọc evidence trong object đó và render ra

## 10. Test đã khóa những gì

Task này thêm test cho:

- `OrderEvidenceDialog`

Các case chính:

- nếu seller bắt buộc ảnh mà chưa chọn file thì không submit
- nếu có note + file thì submit ra payload đúng

Điều này rất quan trọng vì dialog upload là chỗ dễ lỗi:

- quên trim note
- quên append file
- quên validate số lượng file

## 11. Những hiểu lầm dễ gặp

### Hiểu lầm 1: “Preview ảnh nghĩa là đã upload thành công”

Không đúng.

Preview chỉ là:

- FE tạo URL tạm từ file local để người dùng xem trước

Ảnh chỉ thật sự được upload sau khi gọi API thành công.

### Hiểu lầm 2: “Admin cần form upload giống buyer/seller”

Không đúng.

Ở task này, admin chỉ cần xem evidence để xử lý tranh chấp.
Admin không phải bên tạo evidence giao/nhận.

### Hiểu lầm 3: “Dialog là UI nhỏ nên không cần test”

Không đúng.

Dialog kiểu upload file có rất nhiều điểm rủi ro:

- required file
- validate số lượng
- tạo payload multipart
- hiển thị lỗi

## 12. Chốt ngắn

Slice FE này giúp tính năng order evidence đi trọn vòng:

- seller upload được
- buyer upload được
- admin xem được

Về mặt học tập, đây là một ví dụ tốt để hiểu:

- vì sao FE phải đổi từ JSON sang `FormData`
- vì sao nên tách component theo trách nhiệm
- vì sao UI upload file luôn nên có test riêng
