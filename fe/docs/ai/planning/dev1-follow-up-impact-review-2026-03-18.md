---
phase: planning
title: Dev 1 Follow-up Impact Review
description: Follow-up note for Dev 1 FE integration, unread badge, and cross-dev impact after bridge flows
---

# Dev 1 Follow-up Impact Review - 2026-03-18

## Phần Dev 1 đã hoàn tất thêm

Sau tranche chat/order trước đó, Dev 1 đã hoàn tất thêm các phần sau:

- `BikeDetailPage -> MessagesPage?productId=...`
- `BikeDetailPage -> create order -> /profile?tab=orders`
- unread badge toàn cục cho chat qua private queue `/user/queue/messages`

Các file chính:

- [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx)
- [LoginPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/LoginPage.tsx)
- [ProfilePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/ProfilePage.tsx)
- [MessagesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/messages/MessagesPage.tsx)
- [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx)
- [chat-unread.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/chat-unread.ts)

## Impact review với Dev 2 và Dev 3

Kết luận hiện tại:

- Không có bug bắt buộc Dev 2 hoặc Dev 3 phải sửa code ngay chỉ vì thay đổi của Dev 1.
- Có một số thay đổi về ý nghĩa nghiệp vụ và điều hướng mà cả team phải hiểu đúng.

### Những điểm team phải hiểu đúng

1. `completed` giờ là sau khi buyer xác nhận đã nhận xe.
2. Có thêm trạng thái `awaiting_buyer_confirmation`.
3. CTA chat từ trang chi tiết xe đi qua `?productId=...`.
4. `ProfilePage` hiểu `?tab=orders`.

### Điều đó có nghĩa gì cho Dev 2?

- Nếu Dev 2 chạm `BikeDetailPage`, phải giữ lại flow chat và create-order bridge đã có.
- Nếu Dev 2 render `order status` ở nơi khác, phải hiểu đúng `awaiting_buyer_confirmation`.
- Ngoài ra, hiện chưa có chỗ nào bắt Dev 2 phải sửa ngay.

### Điều đó có nghĩa gì cho Dev 3?

- Nếu Dev 3 đụng `AppHeader`, phải giữ logic unread badge chat.
- Nếu Dev 3 đụng route/login redirect, phải giữ query string khi cần quay lại flow chat hoặc order.
- Nếu Dev 3 render status order ở dashboard/report/notification, phải hiểu đúng semantics mới.
- Ngoài ra, hiện chưa có chỗ nào bắt Dev 3 phải sửa ngay.

## Phần Dev 1 còn lại

Hiện Dev 1 còn lại 2 việc đáng làm:

1. reconnect/resubscribe nâng cao cho chat
2. admin refund review UI nếu phần đó được giao cho Dev 1

## Verification đã chạy

```bash
npm run test:run -- src/lib/chat-unread.test.ts src/pages/messages/MessagesPage.test.tsx src/lib/chat-display.test.ts src/lib/order-display.test.ts src/components/dashboard/StatusBadge.test.tsx
npm run build
```

Cả hai đều pass.
