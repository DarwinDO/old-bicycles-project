# FE: cảnh báo refund, chặn seller accept khi thiếu payout profile, và nút admin nhắc user

## Bối cảnh

Slice này đổi một số hành vi ở FE:

- buyer mở modal refund sẽ được cảnh báo nếu chưa có payout profile
- buyer có shortcut sang tab `Nhận tiền`
- seller chưa có payout profile thì không thể bấm `Chấp nhận đơn`
- admin có thể bấm `Nhắc cập nhật payout profile` trong màn payouts
- order status hiển thị rõ hơn sau khi refund hoàn tất: listing đã bị ẩn và muốn bán lại phải qua flow kiểm soát lại

## Dòng chảy FE

### 1. Buyer mở refund modal

User action:

- buyer bấm `Yêu cầu hoàn tiền`

Route / page:

- [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)

Component:

- page mở [DisputeModal.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/DisputeModal.tsx)

State:

- `BuyerOrdersView` load payout profile hiện tại bằng `payoutsApi.getMyProfile()`
- FE dùng helper [payout-profile.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/payout-profile.ts) để tính `payoutProfileReady`
- giá trị này được truyền xuống `DisputeModal`

UI:

- nếu `payoutProfileReady = false`
- modal hiện warning màu vàng
- có nút sang:
  - `/profile?tab=payout`

Điểm quan trọng:

- FE chỉ cảnh báo
- không chặn buyer gửi refund request

### 2. Seller accept order

User action:

- seller mở màn đơn bán

Page:

- [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx)

Flow:

- page load payout profile của seller
- nếu profile chưa đủ:
  - hiện warning banner
  - ẩn nút `Chấp nhận đơn`
  - thay bằng CTA sang `/profile?tab=payout`

Ý nghĩa:

- FE đang phản ánh business rule mới của backend
- seller phải khai tài khoản nhận tiền trước khi chấp nhận đơn mới

### 3. Admin nhắc cập nhật payout profile

Page:

- [AdminPayoutsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminPayoutsPage.tsx)

Flow:

- page load payouts qua `payoutsApi.getAdminPayouts(...)`
- nếu một dòng payout có `status = profile_required`
- dropdown action sẽ hiện:
  - `Nhắc cập nhật payout profile`

Khi bấm:

- FE gọi `payoutsApi.remindProfileRequiredPayout(payoutId)`
- backend gửi notification lại cho recipient
- FE hiện notice thành công

## Vì sao buyer và seller không xử lý giống nhau?

### Buyer

Buyer đang ở tình huống khiếu nại / yêu cầu hoàn tiền.

Nếu chặn cứng buyer chỉ vì chưa khai bank thì trải nghiệm sẽ tệ:

- user có vấn đề thật với đơn
- nhưng lại không được gửi yêu cầu tranh chấp

Vì vậy FE chỉ:

- cảnh báo
- gợi ý cập nhật payout profile

### Seller

Seller là bên chủ động đi vào giao dịch.

Nếu seller thiếu payout profile mà vẫn cho accept order:

- hệ thống có thể đi rất xa trong flow
- nhưng cuối cùng lại kẹt ở bước giải ngân

Vì vậy FE chặn sớm hơn ở bước accept.

## File chính

- [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)
- [DisputeModal.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/DisputeModal.tsx)
- [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx)
- [AdminPayoutsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminPayoutsPage.tsx)
- [order-display.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.ts)
- [payouts.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/payouts.api.ts)

## Ví dụ ngắn

### Buyer chưa có payout profile

1. buyer bấm refund
2. modal vẫn mở bình thường
3. FE hiện cảnh báo
4. buyer có thể:
   - cập nhật payout profile trước
   - hoặc gửi refund luôn rồi cập nhật sau

### Seller chưa có payout profile

1. seller mở đơn bán
2. FE phát hiện profile thiếu
3. nút `Chấp nhận đơn` không còn dùng được
4. seller phải sang `Nhận tiền` để bổ sung thông tin

## Hiểu lầm thường gặp

### Hiểu lầm 1: FE warning là đã fix toàn bộ logic

Không.

FE warning chỉ giúp UX rõ hơn.
Rule thật vẫn phải có ở backend.

### Hiểu lầm 2: admin reminder là thay đổi trạng thái payout

Không.

Nút reminder chỉ gửi nhắc lại user.
Nó không tự chuyển `profile_required` thành `pending_transfer`.
