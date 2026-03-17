---
phase: planning
title: FE Dev 1 API Integration Plan
description: File-level backlog and execution order for FE Dev 1 API integration
---

# FE Dev 1 API Integration Plan - 2026-03-17

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

- Chưa có `src/api/`
- Chưa có `src/types/`
- Chưa có auth store / session layer thật
- Chưa có HTTP client unwrap `ApiResponse<T>`
- Chưa có refresh-token flow
- Chưa có WebSocket/STOMP client
- Hầu hết màn Dev 1 đang dùng mock data hoặc optimistic state local

## Files That Prove Dev 1 Scope Is Still Mock

- `src/pages/admin/AdminListingsPage.tsx`
  - dùng `mockListings`
  - action hiện chỉ `console.log`
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
- `src/router/ProtectedRoute.tsx`
  - chỉ check `localStorage.getItem('authToken')`

## Dependency Order

Dev 1 không nên đi thẳng vào từng page. Thứ tự đúng là:

1. dựng integration spine dùng chung
2. nối admin moderation
3. nối order / payment / refund
4. nối chat REST
5. nối chat realtime
6. polish loading / error / empty states

## Task Breakdown

### Phase 1 - Integration Spine

- [ ] Tạo `src/types/api.ts`
  - Verify: có type chung cho `ApiResponse<T>` và `PageResponse<T>`
- [ ] Tạo `src/lib/http.ts`
  - Verify: có base URL từ `import.meta.env`, auto parse JSON, unwrap `result`
- [ ] Tạo `src/lib/auth-storage.ts`
  - Verify: có helper đọc/ghi `accessToken`, `refreshToken`, `user`
- [ ] Tạo `src/lib/http-auth.ts`
  - Verify: request protected tự gắn `Authorization: Bearer <token>`
- [ ] Chuẩn hóa `ProtectedRoute`
  - Verify: không còn hardcode `localStorage.getItem('authToken')`

### Phase 2 - Shared Dev 1 Types & API Modules

- [ ] Tạo `src/types/product.ts`
  - Verify: chứa `ProductStatus`, `ProductResponse`
- [ ] Tạo `src/types/order.ts`
  - Verify: chứa `OrderResponse`, `PaymentOption`, `OrderStatus`
- [ ] Tạo `src/types/payment.ts`
  - Verify: chứa `PaymentRequestResponse`, `PaymentResponse`, `Refund*`
- [ ] Tạo `src/types/chat.ts`
  - Verify: chứa `ConversationResponse`, `MessageResponse`, `ChatSendMessageRequest`
- [ ] Tạo API modules:
  - `src/api/admin-products.api.ts`
  - `src/api/orders.api.ts`
  - `src/api/payments.api.ts`
  - `src/api/refunds.api.ts`
  - `src/api/chat.api.ts`
  - Verify: mỗi file map đúng endpoint BE

### Phase 3 - Admin Product Moderation

- [ ] Nối `src/pages/admin/AdminListingsPage.tsx` vào `GET /api/admin/products`
  - Verify: table render data thật từ backend
- [ ] Thêm state filter `status`, `keyword`, `sellerId?`
  - Verify: query string map đúng BE
- [ ] Nối actions `approve`, `hide`, `status`
  - Verify: sau action thì row state cập nhật đúng
- [ ] Bổ sung loading, empty, optimistic error handling
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

- [ ] Cài package WebSocket/STOMP
  - Đề xuất: `@stomp/stompjs` + `sockjs-client`
  - Verify: package xuất hiện trong `package.json`
- [ ] Tạo `src/sockets/chat.stomp.ts`
  - Verify: connect được tới `/ws`, gửi JWT ở frame `CONNECT`
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
    http-auth.ts
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

### 1. No shared auth/session architecture yet

Nếu Dev 1 tự dựng auth handling cục bộ trong page của mình, sau này rất dễ chồng với Dev 2/3.

Mitigation:

- chốt shared auth storage + HTTP auth helper trước

### 2. No React Query / TanStack Query

Repo hiện chưa cài query library. Nếu vẫn giữ stack hiện tại:

- có thể dùng `useEffect + useState` trước
- nhưng phải tự quản loading/error/refetch/polling

Nếu nhóm muốn scale tốt hơn:

- cân nhắc cài `@tanstack/react-query`
- nhưng phải thống nhất cả nhóm trước

### 3. WebSocket lib is missing

Repo chưa có STOMP client. Chat realtime không thể hoàn thành nếu chưa thêm lib.

### 4. FE files have mojibake in many Vietnamese strings

Một số file trên disk đã có dấu hiệu lỗi encoding. Nếu sửa trực tiếp mà không cẩn thận:

- có thể làm text vỡ thêm
- gây diff rất ồn

Mitigation:

- tập trung ưu tiên logic/API trước
- nếu chỉnh text, giữ file ở UTF-8 và sửa theo block rõ ràng

## Done When

- [ ] Admin listings page dùng data thật và moderation action thật
- [ ] Seller/buyer order flow không còn fake data
- [ ] Payment request render QR/instructions từ backend thật
- [ ] Refund create/review flow chạy được
- [ ] Messages page dùng REST + WebSocket thật
- [ ] ProtectedRoute không còn hardcode auth check kiểu placeholder
- [ ] Không còn `FAKE_*` hoặc `console.log` trong các file Dev 1 đang sở hữu
