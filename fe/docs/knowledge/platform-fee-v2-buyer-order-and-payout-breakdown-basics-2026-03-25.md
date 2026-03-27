# Platform Fee V2 ở FE: buyer order, payment breakdown và payout breakdown

## 1. Mục tiêu của slice này

Slice FE này làm 3 việc chính:

- buyer thấy rõ phí sàn trước khi tạo order
- buyer thấy rõ breakdown khi lấy hướng dẫn thanh toán và khi gửi refund
- seller và admin thấy rõ `gross / fee deduction / net` thay vì chỉ một số tiền mơ hồ

Điểm quan trọng là FE không còn giả định:

- `paidAmount` luôn là số tiền buyer thực trả
- `amount` của payout luôn là toàn bộ ý nghĩa tài chính

Với Policy V2, backend đã tách thêm các field như:

- `buyerFeeAmount`
- `buyerChargeAmount`
- `platformFeeTotal`
- `sellerGrossPayoutAmount`
- `sellerNetPayoutAmount`
- `protectedAmount`
- `grossAmount`
- `feeDeductionAmount`
- `netAmount`

FE phải đọc đúng các field này thì UI mới phản ánh đúng nghiệp vụ.

---

## 2. File nào thay đổi

Các file FE chính trong slice này:

- `src/pages/BikeDetailPage.tsx`
- `src/components/profile/BuyerOrdersView.tsx`
- `src/pages/seller/SellerOrdersPage.tsx`
- `src/pages/admin/AdminPayoutsPage.tsx`
- `src/lib/platform-fee-preview.ts`
- `src/lib/order-display.ts`
- `src/types/order.ts`
- `src/types/payment.ts`
- `src/types/payout.ts`

Các file test liên quan:

- `src/lib/platform-fee-preview.test.ts`
- `src/lib/order-display.test.ts`
- `src/pages/admin/AdminPayoutsPage.test.tsx`

---

## 3. Buyer tạo order ở BikeDetailPage

### Luồng FE

```text
Buyer mở trang chi tiết xe
-> BikeDetailPage render dialog tạo order
-> FE đọc giá xe và số tiền upfront buyer nhập
-> calculatePlatformFeePreview(...) tính preview ngay ở FE
-> dialog hiển thị buyer fee, seller fee, buyer charge
-> buyer bấm tạo order
-> ordersApi.create(...) gửi productId + paymentOption + upfrontAmount
-> backend tự snapshot phí thật
```

### Vì sao phải preview ở FE?

Vì buyer cần biết trước:

- phí sàn tổng là bao nhiêu
- buyer chịu bao nhiêu
- seller chịu bao nhiêu
- bước hiện tại buyer cần chuyển bao nhiêu

Nếu không có preview, buyer chỉ thấy giá xe và số tiền ứng trước, nhưng không hiểu vì sao tới lúc thanh toán lại có số tiền lớn hơn.

### Rule quan trọng ở partial

FE cũng kiểm tra trước rule:

- `upfrontAmount` không vượt quá giá xe
- `upfrontAmount` phải đủ để cover phần `seller fee`

Rule này giúp chặn sớm case backend chắc chắn sẽ từ chối.

---

## 4. Buyer xem đơn và lấy hướng dẫn thanh toán

File chính:

- `src/components/profile/BuyerOrdersView.tsx`

### Luồng FE

```text
Buyer mở Profile -> tab Orders
-> BuyerOrdersView gọi ordersApi.getMine()
-> FE render từng order
-> nếu order có thể thanh toán thì buyer bấm "Lấy thông tin thanh toán"
-> paymentsApi.createRequest(order.id)
-> backend trả về PaymentRequestResponse
-> FE hiển thị QR, transfer content, protectedAmount, buyerFeeAmount, amount
```

### Ý nghĩa các field trong box thanh toán

- `amount`: tổng số tiền buyer phải chuyển ở bước này
- `protectedAmount`: phần tiền hệ thống giữ cho giao dịch
- `buyerFeeAmount`: phần phí sàn phía buyer trong lần thanh toán này

Điểm mới là FE không còn coi `amount` và `protectedAmount` là một.

---

## 5. Refund ở buyer view

Trước đây FE gửi refund theo:

- `order.paidAmount`

Nhưng với Policy V2, buyer có thể đã trả:

- `protected amount + buyer fee`

Nên FE phải dùng:

- `buyerChargeAmount`

Trong helper `order-display.ts`, hàm:

- `getOrderRefundableBuyerAmount(order)`

sẽ ưu tiên `buyerChargeAmount`, nếu không có mới fallback về `paidAmount`.

### Luồng refund mới

```text
Buyer bấm "Yêu cầu hoàn tiền"
-> BuyerOrdersView mở DisputeModal
-> refundAmount lấy từ getOrderRefundableBuyerAmount(order)
-> refundsApi.create(...) gửi đúng số tiền buyer thực phải được hoàn
-> backend đối chiếu amount với payment amount
```

Điểm này quan trọng vì backend V2 đã kiểm tra chặt hơn: amount refund phải khớp với số tiền buyer thực bị charge.

---

## 6. Seller view: thấy net payout dự kiến

File chính:

- `src/pages/seller/SellerOrdersPage.tsx`

Slice này thêm block thông tin để seller thấy:

- `platformFeeTotal`
- `sellerFeeAmount`
- `sellerGrossPayoutAmount`
- `sellerNetPayoutAmount`

Ý nghĩa:

- seller biết mình bị trừ bao nhiêu phí
- seller biết số tiền dự kiến thực nhận nếu giao dịch đi tới bước giải ngân

Điều này giúp seller không hiểu nhầm rằng số tiền sàn đang giữ luôn bằng số tiền mình sẽ nhận thật.

---

## 7. Admin payouts: từ một con số sang gross / fee / net

File chính:

- `src/pages/admin/AdminPayoutsPage.tsx`

### Luồng FE

```text
Admin mở AdminPayoutsPage
-> payoutsApi.getAdminPayouts(...)
-> FE render bảng payouts
-> mỗi row đọc grossAmount / feeDeductionAmount / netAmount
-> admin mở detail hoặc complete dialog
-> FE tiếp tục hiển thị cùng breakdown để tránh nhầm lúc xác nhận chuyển tiền
```

### Vì sao cần breakdown ở admin?

Vì `amount` cũ chỉ là compatibility mirror của `netAmount`.

Nếu admin chỉ nhìn một cột `amount`, admin có thể không biết:

- số gross ban đầu là bao nhiêu
- hệ thống đã trừ seller fee bao nhiêu
- số tiền thực công ty cần chuyển là bao nhiêu

Khi hiển thị đủ `gross / fee deduction / net`, thao tác manual payout bớt mơ hồ hơn rất nhiều.

---

## 8. Helper mới ở FE

### `platform-fee-preview.ts`

File này dùng để tính preview ở FE theo cùng policy với backend:

- fee rate 2%
- làm tròn theo nghìn
- min 20.000
- max 500.000
- buyer và seller chia đôi fee

Nó không thay backend.

Nó chỉ giúp FE:

- preview số liệu sớm
- validate basic input
- hiển thị UI rõ ràng trước khi API chạy

### `order-display.ts`

File này gom các helper đọc order theo nghĩa mới:

- `getOrderPlatformFeeTotal`
- `getOrderBuyerFeeAmount`
- `getOrderBuyerChargeAmount`
- `getOrderSellerFeeAmount`
- `getOrderSellerGrossPayoutAmount`
- `getOrderSellerNetPayoutAmount`
- `getOrderRefundableBuyerAmount`

Nhờ đó page code không phải tự viết fallback logic ở nhiều chỗ.

---

## 9. Những gì vẫn còn pending

Slice này chưa làm xong mọi thứ.

Phần còn lại lớn nhất là:

- test page-level cho dialog tạo order ở `BikeDetailPage`
- test page-level cho buyer payment instruction box trong `BuyerOrdersView`
- làm sạch dần các block text mojibake cũ ở một số file FE legacy

Tức là:

- logic và contract chính đã nối
- build đã chạy được
- nhưng coverage UI end-to-end theo page vẫn còn có thể tăng thêm

---

## 10. Cách nhớ ngắn gọn

Nếu chỉ nhớ một câu:

- `paidAmount` là số cũ dễ gây hiểu nhầm
- `buyerChargeAmount` mới là số buyer thực bị charge
- `amount` ở payout chỉ còn là mirror của `netAmount`
- muốn hiểu đúng giao dịch thì phải nhìn breakdown, không nhìn một con số đơn lẻ
