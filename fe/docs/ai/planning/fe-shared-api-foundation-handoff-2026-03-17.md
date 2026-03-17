# FE Shared API Foundation Handoff - 2026-03-17

## Mục tiêu

Dựng một lớp nền FE dùng chung cho cả 3 người để:

- không ai phải tự cầm `axios` riêng
- không ai tự định nghĩa lại request/response theo suy đoán
- role guard, auth session, refresh token, WebSocket chat dùng cùng một chuẩn
- giảm merge conflict khi bắt đầu gắn API vào từng page

## Những gì đã được dựng

### 1. Shared auth/session spine

- `src/lib/auth-storage.ts`
  - lưu và xóa `authToken`, `refreshToken`
- `src/lib/http.ts`
  - axios instance dùng chung
  - tự gắn `Authorization: Bearer ...`
  - tự thử refresh token khi gặp `401`
  - có helper:
    - `getResult`
    - `postResult`
    - `patchResult`
    - `putResult`
    - `deleteResult`
    - `compactParams`
- `src/lib/axios.ts`
  - file compatibility, re-export từ `http.ts`
- `src/services/authService.ts`
  - compatibility layer để các page cũ vẫn dùng được
- `src/contexts/AuthContext.tsx`
  - context auth dùng chung
  - có `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `refreshUser`, `hasRole`
- `src/router/ProtectedRoute.tsx`
  - support `allowedRoles`
- `src/router/index.tsx`
  - admin route guard
  - seller route guard
  - inspector route guard

### 2. Shared types/contracts

Đã thêm toàn bộ contract FE dưới `src/types/`:

- `api.ts`
- `auth.ts`
- `product.ts`
- `order.ts`
- `payment.ts`
- `refund.ts`
- `chat.ts`
- `reference-data.ts`
- `admin-user.ts`
- `notification.ts`
- `report.ts`
- `review.ts`
- `inspection.ts`
- `wishlist.ts`
- `dashboard.ts`

Mục đích:

- gom toàn bộ shape BE -> FE vào một chỗ
- ai gắn API thì import type ở đây, không tự viết lại interface trong page

### 3. Shared domain API modules

Đã thêm các module dưới `src/api/`:

- `auth.api.ts`
- `products.api.ts`
- `admin-products.api.ts`
- `orders.api.ts`
- `payments.api.ts`
- `refunds.api.ts`
- `chat.api.ts`
- `reference-data.api.ts`
- `wishlist.api.ts`
- `reviews.api.ts`
- `inspections.api.ts`
- `notifications.api.ts`
- `reports.api.ts`
- `admin-users.api.ts`
- `dashboard.api.ts`

Nguyên tắc:

- page/component không gọi `axios` trực tiếp nữa
- page chỉ gọi module API đúng domain của mình

### 4. Shared WebSocket chat foundation

- `src/sockets/chat.stomp.ts`

Đã có sẵn:

- STOMP client wrapper
- connect bằng JWT
- subscribe conversation topic
- subscribe private inbox queue
- publish message về `/app/chat.sendMessage`

### 5. Package/dependency

Đã thêm package cho chat realtime:

- `@stomp/stompjs`
- `sockjs-client`
- `@types/sockjs-client`

### 6. Validation

Đã chạy:

- `npm run build`
  - pass

Đã kiểm tra:

- `npm run lint`
  - chưa pass toàn repo
  - hiện còn lỗi legacy ở một số file cũ, không nằm trong shared API foundation mới

## Những file shared hiện do lead quản lý

Các file dưới đây xem như **shared foundation**. Dev 2 và Dev 3 không nên tự refactor nếu chưa trao đổi:

- `src/lib/auth-storage.ts`
- `src/lib/http.ts`
- `src/lib/axios.ts`
- `src/services/authService.ts`
- `src/contexts/AuthContext.tsx`
- `src/router/ProtectedRoute.tsx`
- `src/router/index.tsx`
- toàn bộ `src/types/**`
- toàn bộ `src/api/**`
- `src/sockets/chat.stomp.ts`

Nguyên tắc:

- nếu chỉ cần dùng API: import module có sẵn
- không mở PR kiểu “tiện tay sửa luôn shared layer” khi đang làm task page riêng

## Phân công chạm file cho 3 dev

## Dev 1

Phần khó nhất:

- admin product moderation
- order / payment / refund
- chat realtime

File FE chính nên chạm:

- `src/pages/admin/AdminListingsPage.tsx`
- `src/pages/seller/SellerOrdersPage.tsx`
- `src/components/profile/BuyerOrdersView.tsx`
- `src/components/profile/DisputeModal.tsx`
- `src/pages/messages/MessagesPage.tsx`
- `src/components/messages/ConversationList.tsx`
- `src/components/messages/ChatWindow.tsx`

API/module nên dùng:

- `src/api/admin-products.api.ts`
- `src/api/orders.api.ts`
- `src/api/payments.api.ts`
- `src/api/refunds.api.ts`
- `src/api/chat.api.ts`
- `src/sockets/chat.stomp.ts`

Không nên tự sửa:

- `AuthContext`
- `http.ts`
- `ProtectedRoute`

trừ khi phát hiện blocker thật sự.

## Dev 2

Phụ trách marketplace và seller listing/reference data:

- public product list/detail
- seller listing CRUD
- hide/show listing
- reference data
- wishlist
- reviews
- inspection request/view

File FE chính nên chạm:

- `src/pages/BikeListingPage.tsx`
- `src/pages/BikeDetailPage.tsx`
- `src/pages/SellBikePage.tsx`
- `src/pages/seller/SellerListingsPage.tsx`
- `src/pages/admin/AdminCategoriesPage.tsx`
- các component market/list/filter liên quan

API/module nên dùng:

- `src/api/products.api.ts`
- `src/api/reference-data.api.ts`
- `src/api/wishlist.api.ts`
- `src/api/reviews.api.ts`
- `src/api/inspections.api.ts`

Không nên tự sửa:

- `orders.api.ts`
- `payments.api.ts`
- `chat.stomp.ts`
- `router/index.tsx`

## Dev 3

Phụ trách auth/profile/admin users/reports/dashboard/notifications:

- login / register / forgot / reset / verify
- profile / change password
- notification integration
- admin users
- admin reports
- admin dashboard

File FE chính nên chạm:

- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/admin/AdminUsersPage.tsx`
- `src/pages/admin/AdminReportsPage.tsx`
- `src/pages/admin/AdminDashboardPage.tsx`
- layout nào đang hiện số badge, profile summary, notification summary

API/module nên dùng:

- `src/services/authService.ts`
- `src/api/auth.api.ts`
- `src/api/notifications.api.ts`
- `src/api/admin-users.api.ts`
- `src/api/reports.api.ts`
- `src/api/dashboard.api.ts`

Không nên tự sửa:

- `products.api.ts`
- `orders.api.ts`
- `payments.api.ts`
- `chat.api.ts`

## Các seam dễ đụng nhau nhất

### 1. `BikeDetailPage`

Đây là seam giữa Dev 1 và Dev 2.

Dev 2 giữ:

- render product detail
- gallery
- info block
- seller card

Dev 1 giữ:

- CTA chat
- CTA tạo order / payment

Khuyến nghị:

- Dev 2 không tự gắn API chat/order trực tiếp vào page
- Dev 1 cung cấp action hoặc hook riêng cho 2 CTA đó

### 2. `ProfilePage`

Đây là seam giữa Dev 1 và Dev 3.

Dev 3 giữ:

- container page
- auth/profile section
- security section
- tab switching shell

Dev 1 giữ:

- `BuyerOrdersView`
- `DisputeModal`

Khuyến nghị:

- Dev 3 không refactor cấu trúc trong `BuyerOrdersView`
- Dev 1 không đụng business logic của profile/auth trong container

### 3. `router/index.tsx`

Hiện đã có role guard nền.

Không nên để mỗi người tự sửa router theo ý mình.

Nếu cần thêm route:

- báo lead
- thêm route theo tranche
- tránh sửa cùng lúc nhiều layout

## Các lưu ý kỹ thuật quan trọng

### 1. FE không xử lý webhook SePay

Payment ở backend hiện là `webhook-only`.

Nghĩa là FE chỉ làm:

- tạo order
- gọi tạo payment request
- render QR / transfer info
- poll hoặc refetch order/payment state

FE không có callback URL và không tự mark payment success.

### 2. Chat phải đi cả REST lẫn WebSocket

Không thay REST bằng WebSocket thuần.

Luồng đúng:

- REST:
  - lấy conversation list
  - lấy message history
  - mark as read
  - create/get conversation
- WebSocket:
  - nhận message mới realtime
  - nhận private queue event

### 3. `show listing` không làm tin active ngay

API `PATCH /api/products/{id}/show` đưa listing về `pending`.

Nghĩa là seller bật lại tin thì vẫn phải qua moderation.

FE phải render đúng trạng thái này, không gắn label sai là “đã public lại”.

### 4. Tất cả response đều đã được unwrap ở API module

Backend trả dạng:

```json
{
  "code": 200,
  "message": "...",
  "result": ...
}
```

Nhưng page không cần tự chạm `.data.result` nữa.

Ví dụ:

```ts
const orders = await ordersApi.getMine()
```

chứ không tự:

```ts
axios.get(...).then((res) => res.data.result)
```

### 5. Pagination dùng `PageResult<T>`

Các list API dạng page không trả `T[]` trực tiếp.

Chúng trả:

- `content`
- `totalPages`
- `totalElements`
- `number`
- `size`

FE phải map đúng phần `content`.

### 6. Product create/update là multipart

Không tự serialize product form bằng JSON nếu đang gọi create/update listing.

Dùng:

- `productsApi.create(...)`
- `productsApi.update(...)`

vì module này đã build `FormData` đúng format backend cần.

## Trạng thái validation hiện tại

### Đã ổn

- shared foundation compile được
- production build pass
- route guard theo role đã hoạt động ở mức compile/runtime setup
- auth refresh logic đã đi vào shared http layer

### Chưa ổn hoàn toàn

`npm run lint` chưa pass toàn repo vì còn lỗi cũ ở:

- `src/components/dashboard/Sidebar.tsx`
- `src/components/theme-provider.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/lib/utils.test.ts`
- `src/pages/BikeDetailPage.tsx`
- `src/pages/BikeListingPage.tsx`

Những lỗi này là legacy của repo hiện tại, không phải do foundation mới.

Khuyến nghị:

- không mở task cleanup lint toàn repo trong cùng PR tích hợp API
- chỉ sửa khi file đó đúng là file bạn đang phụ trách

## Cách làm việc an toàn cho cả nhóm

1. Mỗi người chỉ chạm page/component trong tranche của mình.
2. Dùng lại `src/api/**` và `src/types/**`, không viết lại bản riêng.
3. Nếu cần thêm field vào type hoặc thêm method vào API module:
   - sửa đúng file shared
   - báo lead trước
4. Không tự ý đổi auth/session/route guard giữa sprint.
5. Khi gắn API vào page:
   - làm từng màn
   - test request/response thật
   - không refactor lan sang phần của người khác

## Kết luận

Hiện FE đã có một lớp foundation đủ để cả 3 dev bắt đầu gắn API thật mà không phải dựng lại từ đầu.

Từ thời điểm này:

- Dev 1 tập trung page khó và realtime/payment
- Dev 2 tập trung marketplace/listing/reference data
- Dev 3 tập trung auth/profile/admin users/reports/dashboard/notifications

Nếu bám đúng ranh giới ở file này, nhóm sẽ giảm được phần lớn merge conflict và tránh tình trạng mỗi người tự định nghĩa contract API theo cách riêng.
