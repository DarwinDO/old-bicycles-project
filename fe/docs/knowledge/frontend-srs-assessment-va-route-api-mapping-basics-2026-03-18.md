# Frontend SRS Assessment Và Cách Map Route/API - 2026-03-18

## Bối cảnh

Khi nhìn một dự án FE, người mới rất dễ đánh giá sai:

- thấy có nhiều page rồi tưởng là tính năng đã xong
- thấy route chạy được rồi tưởng là đã đúng SRS
- thấy UI đẹp rồi tưởng là có thể tích hợp thật

Thực tế không phải vậy.

Một page FE chỉ nên được coi là “gần xong” khi nó đi được hết luồng:

`user action -> route -> page -> component/state -> API/WebSocket -> backend response -> UI update`

Nếu thiếu một mắt xích trong chuỗi này, page đó thường chỉ mới ở mức `Partial`.

---

## SRS là gì?

`SRS` là viết tắt của `Software Requirements Specification`.

Hiểu đơn giản:

- đây là tài liệu ghi hệ thống phải có những chức năng gì
- ai được dùng
- dữ liệu nào cần hiển thị
- business rule nào phải tuân theo

Ví dụ:

- `F-006 Messaging System`
- `F-008 Deposit & Order`
- `F-011 Admin Dashboard`

Mỗi `F-*` là một feature lớn.

---

## Assessment là gì?

`Assessment` là bước đối chiếu:

- SRS nói phải có gì
- code hiện tại thực sự đã có gì

Rồi phân loại thành:

- `Done`: đã đủ để dùng đúng nghĩa của feature
- `Partial`: có một phần, nhưng chưa đủ
- `Missing`: gần như chưa có

---

## Vì sao FE không thể chấm theo “có page là Done”?

Ví dụ có route:

```tsx
<Route path={ROUTES.INSPECTOR_REQUESTS} element={<InspectionRequestsPage />} />
```

Điều đó chỉ chứng minh:

- app có đường dẫn để mở page

Nó **không chứng minh**:

- page đó gọi API thật
- page có dữ liệu thật
- page xử lý loading/error/empty state đúng
- page đang bám đúng business rule

Nên khi audit FE, phải nhìn sâu hơn route.

---

## Cách map FE với SRS trong dự án này

### 1. Bắt đầu từ route

File quan trọng:

- [index.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/router/index.tsx)

Đây là nơi trả lời câu hỏi:

- feature đó có màn hình không?
- role nào được vào?
- page nằm ở đâu?

Ví dụ:

- buyer có `messages`, `profile`, `notifications`, `wishlist`
- admin có `dashboard`, `users`, `listings`, `reports`, `categories`, `disputes`

### 2. Tìm page thật

Ví dụ:

- [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx)
- [AdminDisputesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminDisputesPage.tsx)
- [MessagesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/messages/MessagesPage.tsx)

Ở đây ta kiểm tra:

- page có dùng API thật không
- có `loading/error/empty state` không
- có dùng data từ backend hay chỉ hard-code

### 3. Tìm API module

Ví dụ:

- [products.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/products.api.ts)
- [orders.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/orders.api.ts)
- [refunds.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/refunds.api.ts)
- [chat.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/chat.api.ts)

API module giúp biết:

- FE đang gọi endpoint nào
- request shape ra sao
- response shape ra sao

### 4. Nếu là realtime thì tìm WebSocket client

Ví dụ:

- [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts)

Với chat realtime, không thể chỉ nhìn REST API.

Phải xem thêm:

- client connect vào đâu
- subscribe topic nào
- reconnect/resubscribe ra sao

### 5. Kiểm tra dữ liệu có quay lại UI không

Đây là bước hay bị quên.

Ví dụ:

- gọi API thành công nhưng không `setState`
- hoặc nhận WebSocket message rồi nhưng không rerender

Nếu vậy, feature vẫn chưa hoàn chỉnh.

---

## Luồng đi thực tế trong FE

Ví dụ với `Admin Disputes`:

```text
Admin mở route /admin/disputes
-> AppRouter render AdminDisputesPage
-> AdminDisputesPage gọi refundsApi.getAll(...)
-> http client gọi backend /api/admin/refunds
-> backend trả danh sách refund
-> page set state refunds
-> DataTable render dữ liệu
-> admin bấm review
-> page gọi refundsApi.review(...)
-> backend cập nhật refund
-> page load lại danh sách và rerender
```

Ví dụ với `Messages`:

```text
User mở /messages
-> MessagesPage render
-> ConversationList gọi chatApi.getMine()
-> user chọn 1 conversation
-> ChatWindow gọi chatApi.getMessages(...)
-> ChatWindow connect STOMP
-> subscribe topic conversation
-> khi có message mới, socket callback chạy
-> state message list được cập nhật
-> UI hiển thị tin nhắn mới
```

---

## Vì sao một màn bị xếp `Partial`?

Ví dụ:

- có route nhưng page chỉ là placeholder
- có page nhưng chưa gọi API thật
- có API nhưng chưa gắn vào nút người dùng thật sự dùng

Trường hợp cụ thể trong repo hiện tại:

### 1. `InspectionRequestsPage`

File:

- [InspectionRequestsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/inspector/InspectionRequestsPage.tsx)

Vấn đề:

- mới là màn trống
- chưa load danh sách inspection request thật

Nên:

- route có
- page có
- nhưng feature inspection phía inspector vẫn chỉ `Partial`

### 2. `ReportModal`

File:

- [ReportModal.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/common/ReportModal.tsx)

Vấn đề:

- component đã viết
- nhưng chưa gắn thật vào luồng user-facing như `BikeDetailPage`

Nên report system FE chưa thể chấm `Done`.

---

## Những thuật ngữ quan trọng

### Route

`Route` là đường dẫn trên trình duyệt.

Ví dụ:

- `/market`
- `/messages`
- `/admin/disputes`

### Page

`Page` là component lớn đại diện cho một màn hình.

Ví dụ:

- `BikeDetailPage`
- `ProfilePage`
- `AdminUsersPage`

### API module

Là file FE gom các lời gọi HTTP đến backend.

Ví dụ:

- `orders.api.ts`
- `chat.api.ts`

Mục đích:

- tránh viết `fetch/axios` lung tung trong nhiều page
- dễ bảo trì hơn

### State

`State` là dữ liệu hiện tại của UI.

Ví dụ:

- danh sách đơn hàng
- cuộc trò chuyện đang chọn
- dialog đang mở hay đóng

Nếu state không đổi, UI không cập nhật.

### Re-render

`Re-render` là lúc React vẽ lại UI khi state hoặc props thay đổi.

Ví dụ:

- page nhận dữ liệu mới từ backend
- React render lại danh sách

---

## Một mẹo audit FE rất quan trọng

Khi muốn biết một feature đã “thật” hay chưa, hãy hỏi 5 câu:

1. Có route hoặc entry point thật chưa?
2. Có page/component thật chưa?
3. Có API/WebSocket thật chưa?
4. Có state update thật chưa?
5. Có loading/error/empty state chưa?

Nếu thiếu một trong 5 câu này, đa số feature chỉ nên chấm `Partial`.

---

## Áp dụng vào dự án này

Trong lượt audit này, FE được đánh giá theo kiểu:

- nhìn route ở [index.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/router/index.tsx)
- nhìn page ở `src/pages/`
- nhìn API ở `src/api/`
- nhìn WebSocket ở [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts)
- rồi map lại với SRS

Kết quả quan trọng:

- FE đã khá tốt ở auth, marketplace cơ bản, chat realtime, notifications, admin moderation, payment/refund flow
- FE vẫn còn hụt ở:
  - social login
  - advanced filter đầy đủ
  - seller reply review
  - inspection requests/history thật
  - report submit integration thật
  - groupset / size chart admin UI
  - chatbot / logistics

---

## Hiểu lầm thường gặp

### Hiểu lầm 1: “Có route là xong”

Sai.

Route chỉ là cửa vào.

### Hiểu lầm 2: “Có component là xong”

Sai.

Component có thể chỉ đang hiển thị data giả.

### Hiểu lầm 3: “Có API module là xong”

Sai.

API module có thể đã viết nhưng chưa có page nào gọi.

### Hiểu lầm 4: “Build pass là feature done”

Sai.

`Build pass` chỉ chứng minh code biên dịch được.

Nó không chứng minh feature đã bám đúng SRS.

---

## Kết luận

Audit FE theo SRS là công việc nối 3 lớp lại với nhau:

1. `SRS nói gì`
2. `FE có route/page/api nào`
3. `luồng dữ liệu thực tế có chạy hết không`

Khi đọc assessment FE, đừng chỉ nhìn phần trăm.

Hãy nhìn:

- feature nào đã `Done`
- feature nào mới `Partial`
- blocker cụ thể là gì

Đó mới là thứ giúp team quyết định nên làm tiếp phần nào.
