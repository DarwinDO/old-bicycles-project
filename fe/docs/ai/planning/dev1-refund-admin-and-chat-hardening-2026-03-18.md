# FE Dev 1 Refund Admin And Chat Hardening - 2026-03-18

## Goal

Khóa nốt 2 phần còn lại của FE Dev 1:

- bỏ mock ở trang admin tranh chấp / hoàn tiền
- làm chat realtime bền hơn khi mất kết nối rồi tự kết nối lại

## What Was Added

- `src/api/refunds.api.ts`
  - thêm `refundsApi.getAll(...)` để lấy danh sách refund cho admin
- `src/types/refund.ts`
  - thêm `AdminRefund` và `AdminRefundFilters`
- `src/pages/admin/AdminDisputesPage.tsx`
  - dùng API thật `GET /api/admin/refunds`
  - filter theo `keyword`, `status`
  - xem chi tiết yêu cầu
  - review theo 3 bước:
    - `pending -> approved`
    - `pending -> rejected`
    - `approved -> completed`
- `src/sockets/chat.stomp.ts`
  - giữ lại danh sách subscription mong muốn
  - tự subscribe lại khi STOMP reconnect
  - thêm `addConnectionListener(...)`
- `src/components/messages/ChatWindow.tsx`
  - phản ứng đúng với trạng thái socket
  - hiển thị lỗi khi realtime tạm gián đoạn
  - tự trở lại trạng thái sẵn sàng khi reconnect thành công
- `src/components/dashboard/StatusBadge.tsx`
  - thêm trạng thái `approved`

## Verification

- `npm run test:run -- src/sockets/chat.stomp.test.ts src/components/dashboard/StatusBadge.test.tsx src/pages/messages/MessagesPage.test.tsx src/lib/chat-unread.test.ts src/lib/chat-display.test.ts src/lib/order-display.test.ts`
- `npm run build`

Kết quả:

- targeted tests pass
- build pass
- còn warning cũ:
  - CSS `@import` order
  - chunk size lớn

## Impact To Other FE Devs

- Dev 3:
  - admin page `AdminDisputesPage` giờ đã có dữ liệu thật, không nên quay lại mock
- Dev 2:
  - không cần đổi logic ở marketplace
- Shared:
  - mọi component hiển thị refund status nên hiểu thêm `approved`
  - chat realtime hiện đã có reconnect ở socket wrapper, không nên tự mỗi page viết lại logic reconnect riêng
