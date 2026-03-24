# Order Timeout, Countdown Và Trạng Thái Hết Hạn Ở FE

## 1. Bài toán

Backend đã có rule mới:

- order đang chờ thanh toán có `paymentDeadline`
- quá hạn thì order sẽ tự hủy
- nếu tiền vào muộn sau khi đơn đã hủy, FE phải hiển thị đó là nhánh hoàn tiền chứ không phải đơn sống lại

Nếu FE không cập nhật theo rule này thì người dùng sẽ thấy:

- nút thanh toán vẫn còn dù đơn đã quá hạn,
- seller vẫn thấy nút xác nhận tiền mặt,
- buyer không hiểu vì sao đơn bị hủy,
- hoặc late payment bị hiển thị sai nghĩa.

## 2. File nào chịu trách nhiệm chính?

File trung tâm là:

- [order-display.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.ts)

Đây là nơi gom business rule hiển thị cho order:

- label trạng thái,
- helper text,
- điều kiện bật/tắt nút,
- countdown cho deadline.

Các page dùng nó:

- [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)
- [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx)

## 3. Khái niệm cần hiểu

### Countdown là gì?

`Countdown` là phần FE tính còn bao lâu tới deadline.

Ví dụ:

- deadline là `14:30`
- hiện tại là `13:00`
- FE hiển thị `Còn 1 giờ 30 phút`

### Expired state là gì?

Đó là trạng thái FE hiểu rằng deadline đã qua, dù scheduler backend có thể đang chạy ngay lúc đó hoặc vừa đồng bộ xong.

FE không đợi backend đổi trạng thái rồi mới phản ứng. FE có thể chủ động khóa nút dựa trên thời gian cục bộ để UX rõ ràng hơn.

## 4. Những helper mới

### `isPaymentDeadlineExpired(order, nowMs)`

Helper này kiểm tra:

- order có `paymentDeadline` hay không
- thời điểm hiện tại đã vượt qua deadline chưa

Nếu đã quá hạn thì:

- buyer không còn nút thanh toán
- seller không còn nút xác nhận cash deposit
- nút hủy đơn kiểu manual cũng bị tắt cho case đã quá hạn

### `getPaymentCountdownText(paymentDeadline, nowMs)`

Helper này trả text dễ đọc:

- `Còn 1 giờ 30 phút`
- `Còn 5 phút 12 giây`
- hoặc `Đã quá hạn thanh toán`

### `getOrderStatusMeta(order, nowMs)`

Helper này map business state sang UI state.

Ví dụ mới:

- `pending + awaiting_payment + expired`  
  -> `Đã hết hạn thanh toán`

- `cancelled + payment_expired + unpaid`  
  -> `Đã hết hạn thanh toán`

- `cancelled + refund_pending_transfer`  
  -> `Chờ chuyển khoản hoàn tiền`

## 5. Luồng FE chạy như thế nào?

### Buyer

1. [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx) tải danh sách order bằng `ordersApi.getMine()`
2. Component giữ `nowMs` bằng `setInterval`
3. Mỗi lần rerender:
   - gọi `getOrderStatusMeta(order, nowMs)`
   - gọi `getPaymentCountdownText(order.paymentDeadline, nowMs)`
   - gọi `canBuyerRequestPayment(order, nowMs)`
4. UI hiện:
   - deadline,
   - countdown,
   - hoặc badge/hint hết hạn

### Seller

1. [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx) cũng tải order
2. Page giữ `nowMs`
3. Helper quyết định:
   - seller còn được xác nhận tiền mặt hay không
   - có nên hiện trạng thái “Đơn đã hết hạn thanh toán” hay không

## 6. Ví dụ cụ thể

### Case 1: Chưa quá hạn

- order: `pending`
- funding: `awaiting_payment`
- deadline: còn 2 giờ

FE sẽ hiện:

- `Chờ thanh toán`
- `Hạn thanh toán: ...`
- `Còn 2 giờ ...`
- buyer còn nút `Lấy thông tin thanh toán`

### Case 2: Quá hạn nhưng scheduler chưa kịp chạy

- order vẫn đang là `pending`
- funding vẫn là `awaiting_payment`
- nhưng local time đã vượt deadline

FE sẽ hiện:

- `Đã hết hạn thanh toán`
- `Đơn hàng đã quá hạn thanh toán. Hệ thống sẽ tự hủy hoặc đang đồng bộ trạng thái hủy.`
- không còn nút thanh toán

### Case 3: Đã auto-cancel

- order: `cancelled`
- cancelReason: `payment_expired`
- funding: `unpaid`

FE sẽ hiện:

- `Đã hết hạn thanh toán`
- helper text giải thích đơn đã tự hủy

### Case 4: Thanh toán đến muộn

- order: `cancelled`
- funding: `refund_pending_transfer`

FE sẽ hiểu:

- tiền đã vào muộn
- order không quay lại trạng thái mua bán
- hệ thống đang chờ hoàn tiền thủ công

## 7. Test đã thêm

File:

- [order-display.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.test.ts)

Các case chính:

- pending unpaid
- pending awaiting payment
- expired before scheduler sync
- cancelled vì `payment_expired`
- cancelled nhưng `refund_pending_transfer`
- completed và payout pending

## 8. Vì sao cách này tốt hơn?

Vì FE không chỉ “dịch chữ” từ backend.

FE còn giúp:

- chặn thao tác sai ngay trên giao diện,
- giải thích rõ trạng thái cho user,
- giảm cảm giác hệ thống “bị lag” khi scheduler backend vừa mới chạy hoặc sắp chạy.

## 9. Lỗi dễ gặp

### Chỉ nhìn `order.status`

Sai.

Phải nhìn cả:

- `status`
- `fundingStatus`
- `cancelReason`
- `paymentDeadline`

### Chờ backend đổi rồi mới khóa nút

Sai.

Nếu đợi backend hoàn toàn thì người dùng có thể vẫn thấy nút thanh toán trong vài giây/phút sau deadline. UX sẽ rối.

### Dùng text cứng ở từng page

Sai.

Nên gom vào [order-display.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.ts) để buyer page và seller page không tự mỗi nơi hiểu một kiểu.
