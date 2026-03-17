---
phase: planning
title: FE Dev 1 API Integration Plan
description: File-level backlog and execution order for FE Dev 1 API integration
---

# FE Dev 1 API Integration Plan - 2026-03-17

## Progress Update - 2026-03-17

Đã xong shared foundation và tranche đầu tiên của Dev 1:

- shared `src/types/**`
- shared `src/api/**`
- shared `src/lib/http.ts`
- shared `src/lib/auth-storage.ts`
- shared auth/session wiring (`AuthContext`, `ProtectedRoute`, router role guard)
- `src/pages/admin/AdminListingsPage.tsx` đã nối API thật

Admin listings hiện đã:

- bỏ `mockListings`
- load danh sách thật từ `GET /api/admin/products`
- lọc theo `keyword` và `status`
- approve/hide listing thật
- có loading/error/pagination state

Validation mới nhất:

- `npm run test:run -- src/components/dashboard/StatusBadge.test.tsx src/pages/admin/AdminListingsPage.test.tsx`
- `npm run build`

Trạng thái execution:

- Phase 1: done
- Phase 2: done cho nhóm shared + admin product domain
- Phase 3: in progress, phần admin listings đã xong

## Goal

Hoàn thành phần tích hợp API khó nhất của FE Dev 1 cho 3 cụm:

- admin product moderation
- seller order / payment / refund
- chat realtime

## Current FE Reality

### What already exists

- Có router, layout, page skeleton, UI primitives, table/dialog/shared components.
- Có các màn đúng domain của Dev 1:
  - `src/pages/admin/AdminListingsPage.tsx`
  - `src/pages/seller/SellerOrdersPage.tsx`
  - `src/pages/messages/MessagesPage.tsx`
  - `src/components/messages/ConversationList.tsx`
  - `src/components/messages/ChatWindow.tsx`
  - `src/components/profile/BuyerOrdersView.tsx`
  - `src/components/profile/DisputeModal.tsx`

### What is still missing

- Hầu hết màn Dev 1 ngoài admin listings vẫn đang dùng mock data hoặc state cục bộ
- chat realtime mới có foundation, chưa gắn vào UI thật
- order/payment/refund chưa nối API ở seller/buyer flow

## Files That Prove Dev 1 Scope Is Still Mock

- `src/pages/admin/AdminListingsPage.tsx`
  - đã không còn mock, đây là tranche đầu tiên đã hoàn thành
- `src/pages/seller/SellerOrdersPage.tsx`
  - dùng `FAKE_ORDERS`
  - chưa gọi BE
- `src/components/profile/BuyerOrdersView.tsx`
  - state cục bộ `INITIAL_ORDERS`
  - comment ghi rõ "In a real app, this would be an API call"
- `src/components/profile/DisputeModal.tsx`
  - mới có UI, chưa bind request thật
- `src/components/messages/ConversationList.tsx`
  - dùng `FAKE_CONVERSATIONS`
- `src/components/messages/ChatWindow.tsx`
  - dùng `getMessagesForChat`
  - gửi message kiểu fake local

## Dependency Order

Dev 1 không nên đi thẳng vào từng page. Thứ tự đúng là:

1. shared foundation
2. admin moderation
3. order / payment / refund
4. chat REST
5. chat realtime
6. loading / error / empty states

## Task Breakdown

### Phase 1 - Integration Spine

- [x] Tạo `src/types/api.ts`
  - Verify: có type chung cho `ApiResponse<T>` và `PageResponse<T>`
- [x] Tạo `src/lib/http.ts`
  - Verify: có base URL từ `import.meta.env`, auto parse JSON, unwrap `result`
- [x] Tạo `src/lib/auth-storage.ts`
  - Verify: có helper đọc/ghi `accessToken`, `refreshToken`, `user`
- [x] Chuẩn hóa `ProtectedRoute`
  - Verify: không còn hardcode `localStorage.getItem('authToken')`

### Phase 2 - Shared Dev 1 Types & API Modules

- [x] Tạo `src/types/product.ts`
  - Verify: chứa `ProductStatus`, `ProductResponse`
- [x] Tạo `src/types/order.ts`
  - Verify: chứa `OrderResponse`, `PaymentOption`, `OrderStatus`
- [x] Tạo `src/types/payment.ts`
  - Verify: chứa `PaymentRequestResponse`, `PaymentResponse`, `Refund*`
- [x] Tạo `src/types/chat.ts`
  - Verify: chứa `ConversationResponse`, `MessageResponse`, `ChatSendMessageRequest`
- [x] Tạo API modules:
  - `src/api/admin-products.api.ts`
  - `src/api/orders.api.ts`
  - `src/api/payments.api.ts`
  - `src/api/refunds.api.ts`
  - `src/api/chat.api.ts`
  - Verify: mỗi file map đúng endpoint BE

### Phase 3 - Admin Product Moderation

- [x] Nối `src/pages/admin/AdminListingsPage.tsx` vào `GET /api/admin/products`
  - Verify: table render data thật từ backend
- [x] Thêm state filter `status`, `keyword`
  - Verify: query string map đúng BE
- [x] Nối actions `approve`, `hide`
  - Verify: sau action thì row state cập nhật đúng
- [x] Bổ sung loading, empty, error handling
  - Verify: page không còn mock/console.log

### Phase 4 - Seller Orders / Payment / Refund

- [ ] Thay `FAKE_ORDERS` trong `src/pages/seller/SellerOrdersPage.tsx`
  - Verify: dùng `GET /api/orders/me`
- [ ] Thêm phân loại order theo vai trò seller
  - Verify: chỉ render các order seller liên quan
- [ ] Gắn actions:
  - `PATCH /api/orders/{id}/accept`
  - `PATCH /api/orders/{id}/confirm-deposit`
  - `PATCH /api/orders/{id}/complete`
  - `PATCH /api/orders/{id}/cancel`
  - Verify: transition đúng theo response mới nhất
- [ ] Nối `BuyerOrdersView` vào data thật
  - Verify: buyer xem được order thật và mở refund flow
- [ ] Nối `DisputeModal` vào `POST /api/orders/{id}/refunds`
  - Verify: submit modal tạo refund thành công
- [ ] Thêm admin refund review flow nếu FE Dev 1 phụ trách cùng page tranh chấp
  - Verify: `PATCH /api/admin/refunds/{refundId}/review` hoạt động
- [ ] Tạo payment request UI
  - Verify: `POST /api/payments/orders/{orderId}/request` trả QR/instructions và render được
- [ ] Thêm polling order/payment state
  - Verify: FE refresh được `GET /api/payments/orders/{orderId}` và cập nhật timeline

### Phase 5 - Chat REST First

- [ ] Thay `FAKE_CONVERSATIONS` trong `ConversationList`
  - Verify: dùng `GET /api/conversations/me`
- [ ] Thay `getMessagesForChat` trong `ChatWindow`
  - Verify: dùng `GET /api/conversations/{id}/messages`
- [ ] Nối mark-as-read
  - Verify: mở conversation sẽ gọi `PUT /api/conversations/{id}/read`
- [ ] Tạo flow start chat từ bike detail
  - Verify: `POST /api/conversations?productId=` tạo/lấy conversation rồi route sang `/messages`

### Phase 6 - Chat Realtime

- [x] Cài package WebSocket/STOMP
  - `@stomp/stompjs` + `sockjs-client`
  - Verify: package xuất hiện trong `package.json`
- [x] Tạo `src/sockets/chat.stomp.ts`
  - Verify: có nền để connect tới `/ws`, gửi JWT ở frame `CONNECT`
- [ ] Subscribe:
  - `/topic/conversation/{conversationId}`
  - `/user/queue/messages`
  - Verify: message mới cập nhật đúng cho open chat và unread badge
- [ ] Nối send message từ `ChatWindow`
  - Verify: FE send tới `/app/chat.sendMessage`
- [ ] Thêm reconnect + resubscribe
  - Verify: reload mạng hoặc reconnect vẫn nghe đúng channel

### Phase 7 - UI State Polish

- [ ] Thêm loading state cho 3 cụm page
  - Verify: không còn layout jump thô
- [ ] Thêm empty state thật
  - Verify: empty data không crash
- [ ] Thêm error banner/toast cho API fail
  - Verify: user hiểu được action fail vì sao

## Recommended FE Structure For Dev 1

```text
src/
  api/
    admin-products.api.ts
    orders.api.ts
    payments.api.ts
    refunds.api.ts
    chat.api.ts
  sockets/
    chat.stomp.ts
  types/
    api.ts
    product.ts
    order.ts
    payment.ts
    chat.ts
  lib/
    http.ts
    auth-storage.ts
```

## Backend Contracts Dev 1 Must Follow

### Admin Product Moderation

- `GET /api/admin/products`
- `PATCH /api/admin/products/{id}/approve`
- `PATCH /api/admin/products/{id}/hide`
- `PATCH /api/admin/products/{id}/status?status=active|hidden|pending`

Important:

- `approve` = shortcut cho `active`
- `hide` = shortcut cho `hidden`
- backend hiện không có `rejected` enum riêng cho moderation

### Orders

- `POST /api/orders`
- `GET /api/orders/me`
- `PATCH /api/orders/{orderId}/accept`
- `PATCH /api/orders/{orderId}/confirm-deposit`
- `PATCH /api/orders/{orderId}/complete`
- `PATCH /api/orders/{orderId}/cancel`

### Payments / Refunds

- `POST /api/payments/orders/{orderId}/request`
- `GET /api/payments/orders/{orderId}`
- `POST /api/orders/{orderId}/refunds`
- `PATCH /api/admin/refunds/{refundId}/review`

Important:

- payment flow hiện là webhook-only ở backend
- FE không gọi webhook
- FE chỉ tạo payment request rồi refresh/poll state

### Chat REST + WebSocket

- REST:
  - `POST /api/conversations?productId=`
  - `GET /api/conversations/me`
  - `GET /api/conversations/{conversationId}/messages?page=&size=`
  - `PUT /api/conversations/{conversationId}/read`
- WebSocket:
  - endpoint `/ws`
  - `withSockJS()` đã bật ở backend
  - send destination `/app/chat.sendMessage`
  - subscribe `/topic/conversation/{conversationId}`
  - subscribe `/user/queue/messages`

## Risks

### 1. Không nên tách riêng một auth/session layer cục bộ cho Dev 1

Shared foundation đã có. Nếu Dev 1 tự dựng auth handling riêng trong page của mình, sau này rất dễ chồng với Dev 2/3.

### 2. Chưa dùng React Query / TanStack Query

Repo hiện chưa cài query library. Nếu vẫn giữ stack hiện tại:

- có thể dùng `useEffect + useState` trước
- nhưng phải tự quản loading/error/refetch/polling

Nếu nhóm muốn scale tốt hơn:

- cân nhắc cài `@tanstack/react-query`
- nhưng phải thống nhất cả nhóm trước

### 3. Chat realtime vẫn chưa được gắn hết vào UI

Nền STOMP đã có nhưng phần connect/subscription/send thật trong page/component vẫn là việc còn lại của Dev 1.

### 4. Một số file FE cũ đang có lỗi mojibake

Khi sửa các file cũ, nên:

- ưu tiên block đang chạm
- giữ file ở UTF-8
- không trộn text đã hỏng với text mới nếu có thể rewrite sạch

## Done When

- [x] Admin listings page dùng data thật và moderation action thật
- [ ] Seller/buyer order flow không còn fake data
- [ ] Payment request render QR/instructions từ backend thật
- [ ] Refund create/review flow chạy được
- [ ] Messages page dùng REST + WebSocket thật
- [x] ProtectedRoute không còn hardcode auth check kiểu placeholder
- [ ] Không còn `FAKE_*` hoặc `console.log` trong các file Dev 1 đang sở hữu
