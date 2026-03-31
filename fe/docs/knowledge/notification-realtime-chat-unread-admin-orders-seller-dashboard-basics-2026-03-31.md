# Notification Realtime, Chat Unread, Admin Orders Và Seller Dashboard Basics

## 1. Bối cảnh

Đợt này frontend được bổ sung 4 phần:

1. Chuông notification cập nhật realtime thay vì chỉ chờ polling.
2. Danh sách conversation có badge unread và không ẩn conversation mới chỉ vì chưa có `lastMessage`.
3. Admin có thêm trang xem toàn bộ đơn hàng.
4. Dashboard seller có thêm số tiền đã thực nhận và số tiền còn chờ giải ngân.

## 2. Khái niệm dễ hiểu

### Polling là gì?

`Polling` là cách frontend hỏi server theo chu kỳ, ví dụ 30 giây hỏi 1 lần.

Ưu điểm:

- dễ làm

Nhược điểm:

- chậm
- không realtime

### WebSocket push là gì?

Đây là cách backend chủ động đẩy dữ liệu sang frontend khi có sự kiện mới.

Ví dụ:

- vừa có notification mới
- backend push luôn lên browser
- frontend tăng badge ngay

## 3. Flow 1: Chuông notification realtime

### File chính

- `src/lib/use-notification-unread-count.ts`
- `src/sockets/notification.stomp.ts`
- `src/components/notifications/NotificationDropdown.tsx`

### Flow

```text
Backend push /user/queue/notifications
-> notification.stomp.ts nhận frame STOMP
-> useNotificationUnreadCount tăng unreadCount local
-> emitNotificationsUpdated()
-> NotificationDropdown và layout rerender
```

### Vì sao vẫn giữ polling?

Vì realtime có thể rớt mạng hoặc reconnect chậm.

Nên code mới dùng cả 2:

- realtime để nhảy số ngay
- polling/focus/visibilitychange làm fallback để tự đồng bộ lại

## 4. Flow 2: Badge unread trong conversation list

### File chính

- `src/types/chat.ts`
- `src/lib/chat-display.ts`
- `src/components/messages/ConversationList.tsx`

### Điều gì đã thay đổi?

- `Conversation` có thêm `unreadCount`
- `ConversationList` hiển thị badge theo từng conversation
- conversation đang được chọn thì badge về `0`
- conversation mới chưa có `lastMessage` vẫn được render trong list

### Tại sao phần “conversation mới” quan trọng?

Trước đây UI chỉ hiện conversation nếu có `lastMessage`.

Vậy nếu buyer vừa tạo conversation nhưng chưa nhắn gì, seller có thể không thấy nó trong cột trái.

Sau khi sửa:

- list không ẩn conversation mới nữa
- inbox socket còn gọi reload conversation list khi có tin nhắn mới

## 5. Flow 3: Admin Orders Page

### File chính

- `src/pages/admin/AdminOrdersPage.tsx`
- `src/constants/routes.ts`
- `src/router/index.tsx`
- `src/components/dashboard/Sidebar.tsx`

### Luồng chạy

```text
Admin mở /admin/orders
-> AdminOrdersPage gọi ordersApi.getMine()
-> backend trả toàn bộ orders vì current user là admin
-> FE lọc theo search/status/fundingStatus
-> render danh sách order cho admin
```

Điểm hay ở đây là chưa cần API mới. FE tận dụng luôn API đang có vì backend đã cho admin nhìn thấy toàn bộ đơn.

## 6. Flow 4: Seller Dashboard có thêm tiền đã nhận và tiền chờ giải ngân

### File chính

- `src/pages/seller/SellerDashboardPage.tsx`

### Cách tính

- `Doanh thu`: tổng `totalAmount` của đơn `completed`
- `Seller đã thực nhận`: tổng `sellerNetPayoutAmount` của đơn `completed + released`
- `Chờ giải ngân`: tổng `sellerNetPayoutAmount` của đơn `completed + seller_payout_pending`

### Ý nghĩa nghiệp vụ

- `Doanh thu` cho biết seller bán được bao nhiêu giá trị xe
- `Đã thực nhận` cho biết tiền seller đã thật sự nhận về sau platform fee
- `Chờ giải ngân` cho biết tiền nào đang còn nằm ở bước admin/manual payout

## 7. Ví dụ nhỏ

Giả sử seller có 2 đơn hoàn tất:

- Đơn A: `totalAmount = 10 triệu`, `sellerNetPayoutAmount = 9.8 triệu`, `fundingStatus = released`
- Đơn B: `totalAmount = 12 triệu`, `sellerNetPayoutAmount = 11.7 triệu`, `fundingStatus = seller_payout_pending`

Thì dashboard sẽ hiểu:

- Doanh thu = `22 triệu`
- Đã thực nhận = `9.8 triệu`
- Chờ giải ngân = `11.7 triệu`

## 8. Chỗ dễ nhầm

### Nhầm 1: doanh thu = tiền seller đã cầm về

Sai. `Doanh thu` và `tiền seller đã thực nhận` là 2 khái niệm khác nhau.

### Nhầm 2: bell realtime thì không cần polling nữa

Sai. Polling vẫn là lớp an toàn để tự sync lại khi socket lỗi.

### Nhầm 3: conversation không có last message thì không cần hiện

Sai. Người dùng vẫn cần biết conversation đã được tạo.

## 9. Tóm tắt

- Notification bell giờ có lớp realtime.
- Chat list giờ có unread badge theo conversation.
- Conversation mới không còn bị ẩn chỉ vì chưa có `lastMessage`.
- Admin có route riêng để xem tất cả đơn hàng.
- Seller dashboard nhìn được cả tiền đã nhận và tiền còn pending payout.
