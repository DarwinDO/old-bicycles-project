# Chat send, inspection null và seller edit ở frontend

## Bối cảnh

Frontend vừa gặp 3 vấn đề dễ làm người mới học bị rối:

1. Chat kết nối được nhưng gửi tin nhắn không đi.
2. Console hiện nhiều dòng `404` cho inspection.
3. Seller mở trang edit tin đăng nhưng bị văng ra ngoài.

Ba lỗi này nhìn bề ngoài khác nhau, nhưng đều liên quan đến **luồng dữ liệu giữa frontend và backend**.

## Một vài thuật ngữ cần hiểu

### WebSocket là gì?

`WebSocket` là kết nối hai chiều giữa frontend và backend.

Khác với HTTP bình thường:

- HTTP: gửi xong là đóng
- WebSocket: giữ kết nối mở để gửi nhận dữ liệu realtime

Chat thường dùng WebSocket vì cần thấy tin nhắn mới ngay.

### STOMP là gì?

`STOMP` là một giao thức tin nhắn chạy phía trên WebSocket.

Có thể hiểu đơn giản:

- WebSocket là cái ống truyền dữ liệu
- STOMP là bộ quy tắc để biết gửi vào đâu, subscribe kênh nào, nội dung ra sao

### JSON content-type là gì?

Khi frontend gửi dữ liệu JSON, backend cần biết:

> “payload này là JSON”

Thông tin đó thường nằm trong header:

```text
content-type: application/json
```

Nếu thiếu, backend có thể parse không đúng hoặc validate sai.

## 1. Vì sao chat kết nối được nhưng không gửi được?

### Trước khi sửa

Trong [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts), frontend publish:

- destination đúng
- body đúng JSON string

Nhưng lại thiếu header:

```text
content-type: application/json
```

Backend Spring Boot nhận STOMP message ở:

- `@MessageMapping("/chat.sendMessage")`

và map payload vào DTO.

Khi thiếu `content-type`, việc map payload JSON vào DTO không còn chắc chắn.

### Sau khi sửa

Frontend gửi:

```ts
client.publish({
  destination: '/app/chat.sendMessage',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify(payload),
})
```

### Luồng chat sau khi sửa

```text
Người dùng nhập tin nhắn
-> ChatWindow gọi socketClient.sendMessage(...)
-> chat.stomp.ts publish STOMP frame
-> backend nhận @MessageMapping("/chat.sendMessage")
-> backend lưu message vào database
-> backend broadcast về topic conversation
-> ChatWindow nhận message mới
-> state messages cập nhật
-> React render lại giao diện
```

## 2. Vì sao console có nhiều 404 inspection?

### Trước khi sửa

Frontend gọi:

- `GET /api/inspections/product/{productId}`

cho cả xe chưa có inspection.

Backend lại trả `404`.

Vì vậy console đỏ liên tục, dù thực ra nhiều xe chưa kiểm định là chuyện bình thường.

### Sau khi sửa

Backend trả:

- `200 OK`
- `result = null`

Frontend cũng đổi `inspectionsApi.getByProduct()` thành:

```ts
Promise<Inspection | null>
```

Như vậy page có thể hiểu:

- có inspection -> render thông tin kiểm định
- không có inspection -> bỏ qua, không xem là lỗi

## 3. Vì sao seller edit không mở được tin chờ duyệt?

### Trước khi sửa

Trang [SellerEditProductPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerEditProductPage.tsx) gọi:

- `productsApi.getById(id)`

Đây là public API. Public API không cho xem tin `pending` hoặc `hidden`.

Nên seller mở trang edit chính tin của mình mà vẫn bị lỗi.

### Sau khi sửa

Frontend đổi sang:

- `productsApi.getMineById(id)`

Endpoint này dùng đúng ngữ cảnh seller.

## Luồng file trong frontend của 3 lỗi này

### A. Chat realtime

```text
Người dùng bấm gửi
-> ChatWindow.tsx
-> createChatSocketClient() trong chat.stomp.ts
-> STOMP publish /app/chat.sendMessage
-> backend broadcast lại
-> ChatWindow cập nhật messages
-> giao diện hiện tin nhắn mới
```

### B. Inspection của xe

```text
Người dùng mở trang chi tiết xe
-> BikeDetailPage.tsx
-> inspectionsApi.getByProduct(productId)
-> http.ts gọi /api/inspections/product/{id}
-> backend trả Inspection hoặc null
-> setInspection(...)
-> component quyết định có render thẻ inspection hay không
```

### C. Seller edit product

```text
Người bán mở trang edit
-> SellerEditProductPage.tsx
-> productsApi.getMineById(id)
-> http.ts gọi /api/products/my/{id}
-> backend kiểm tra quyền sở hữu
-> trả Product
-> form đổ dữ liệu ban đầu
-> seller mới sửa và submit được
```

## Những file chính đã đổi

- [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts)
- [chat.stomp.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.test.ts)
- [inspections.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/inspections.api.ts)
- [products.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/products.api.ts)
- [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx)
- [InspectionFormPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionFormPage.tsx)
- [SellerEditProductPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerEditProductPage.tsx)

## Vì sao 3 sửa này quan trọng?

### Với chat

Nếu gửi message không đúng header, UI có thể nhìn như đã connect nhưng dữ liệu không đi hết luồng.

### Với inspection

Không nên biến “không có dữ liệu” thành “lỗi hệ thống”.

Frontend cần phân biệt:

- lỗi thật
- trạng thái rỗng hợp lệ

### Với seller edit

Frontend phải gọi đúng API theo ngữ cảnh:

- public screen -> public API
- seller ownership screen -> owner API

Đây là ý rất quan trọng khi học tích hợp API.

## Hiểu lầm dễ gặp

### Hiểu lầm 1: Console đỏ nghĩa là app hỏng

Không hẳn.

Có trường hợp console đỏ vì contract API chưa hợp lý, không phải do logic chính bị sai.

### Hiểu lầm 2: Kết nối realtime thành công thì gửi tin nhắn chắc chắn thành công

Không đúng.

Kết nối chỉ là bước đầu. Payload gửi đi vẫn phải đúng format backend chờ.

### Hiểu lầm 3: Một trang edit có thể dùng lại luôn API detail public

Không nên mặc định như vậy.

Edit screen thường cần dữ liệu rộng hơn public screen.

## Kết luận

Lượt sửa này giúp frontend ổn hơn ở 3 điểm:

1. Chat gửi tin nhắn đúng chuẩn STOMP + JSON.
2. Xe chưa có inspection không còn tạo 404 ồn ào.
3. Seller edit dùng đúng endpoint theo quyền sở hữu.

Đây là một ví dụ rất điển hình cho bài học frontend:

> Không chỉ cần “gọi được API”, mà còn phải gọi đúng API, đúng ngữ cảnh, và hiểu rõ dữ liệu rỗng khác với lỗi thật như thế nào.
