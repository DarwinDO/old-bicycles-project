# Buyer review và seller reply review ở FE: giải thích cho người mới học

## 1. Bối cảnh

Sau khi backend đã hỗ trợ:

- buyer gửi review
- seller reply review

thì FE phải nối được 3 chỗ:

1. Buyer thấy nút viết review trong đơn mua đã hoàn tất.
2. Seller thấy danh sách review của mình và có ô reply.
3. Trang chi tiết xe hiển thị được reply của seller bên dưới review.

Các file chính:

- [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)
- [ReviewOrderDialog.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/ReviewOrderDialog.tsx)
- [SellerReviewsSection.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/SellerReviewsSection.tsx)
- [ProfilePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/ProfilePage.tsx)
- [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx)
- [reviews.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/reviews.api.ts)
- [review.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/types/review.ts)
- [order-display.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.ts)

## 2. `Dialog` trong bài này là gì?

`Dialog` là một hộp nổi lên trên màn hình.

Nó thường dùng khi:

- người dùng cần nhập dữ liệu ngắn
- nhưng không muốn rời khỏi trang hiện tại

Trong slice này:

- buyer không phải rời trang `Đơn mua`
- chỉ cần bấm nút
- dialog hiện ra để nhập số sao và nhận xét

## 3. Luồng FE khi buyer gửi review

```text
User click "Viết đánh giá"
-> BuyerOrdersView mở ReviewOrderDialog
-> user chọn sao + nhập comment
-> ReviewOrderDialog gọi onSubmit(...)
-> BuyerOrdersView gọi reviewsApi.submit(orderId, payload)
-> backend lưu review
-> FE gọi ordersApi.getMine() để lấy lại đơn mới nhất
-> state orders cập nhật
-> nút review biến mất vì buyerReviewSubmitted = true
```

### Giải thích từng bước

1. Người dùng vào tab `Đơn mua`.
2. [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx) dùng helper:
   - `canBuyerSubmitReview(order)`
3. Nếu order đủ điều kiện, FE hiện nút `Viết đánh giá`.
4. Khi bấm nút, FE mở [ReviewOrderDialog.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/ReviewOrderDialog.tsx).
5. Dialog thu 2 dữ liệu:
   - `rating`
   - `comment`
6. Sau khi submit, `BuyerOrdersView` gọi [reviews.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/reviews.api.ts):
   - `reviewsApi.submit(orderId, request)`
7. Khi backend trả thành công, FE refetch `ordersApi.getMine()`.
8. Vì order đó giờ có `buyerReviewSubmitted = true`, FE không hiện nút review nữa.

## 4. Vì sao phải có `canBuyerSubmitReview(order)`?

Đây là một helper để gom business rule UI vào một chỗ.

Nếu không có helper này, logic sẽ bị rải rác ở nhiều component.

Trong [order-display.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.ts), helper này giúp FE kiểm tra:

- order đã hoàn tất chưa
- buyer đã review chưa

Lợi ích:

- dễ đọc hơn
- dễ test hơn
- tránh lặp code

## 5. Luồng FE khi seller reply review

```text
Seller mở tab "Đánh giá" trong ProfilePage
-> ProfilePage render SellerReviewsSection
-> SellerReviewsSection gọi reviewsApi.getSellerReviews(...)
-> danh sách review hiện ra
-> seller nhập reply
-> SellerReviewsSection gọi reviewsApi.reply(reviewId, { reply })
-> backend lưu reply
-> FE cập nhật lại review trong state
-> reply mới xuất hiện ngay trong UI
```

### Chỗ render chính

[ProfilePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/ProfilePage.tsx) kiểm tra role:

- nếu user là `seller`
  - render [SellerReviewsSection.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/SellerReviewsSection.tsx)
- nếu không phải seller
  - render placeholder đơn giản

### `SellerReviewsSection` làm gì?

Component này có 4 trách nhiệm:

1. load review của seller
2. giữ state nội bộ cho từng ô reply
3. gửi API reply
4. cập nhật lại UI sau khi save thành công

## 6. Luồng FE khi buyer khác xem trang chi tiết xe

Trang [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx) đã có sẵn danh sách review của seller.

Bản sửa mới thêm:

- nếu review có `sellerReply`
- FE render thêm khối "Phản hồi từ người bán"

Điều này quan trọng vì buyer khác khi xem sản phẩm sẽ không chỉ thấy:

- review gốc

mà còn thấy:

- seller đã phản hồi như thế nào

## 7. Runtime flow tổng quát ở FE

```text
User action
-> page/component
-> local state mở dialog hoặc textarea
-> reviewsApi gọi backend
-> backend response về FE
-> setState cập nhật
-> React rerender
-> UI đổi theo dữ liệu mới
```

Trong slice này, hai API chính là:

- `POST /api/reviews/{orderId}`
- `PUT /api/reviews/{reviewId}/reply`

## 8. Vì sao FE phải refetch orders sau khi submit review?

Sau khi buyer review xong, FE có 2 cách:

1. tự sửa state local bằng tay
2. gọi lại `ordersApi.getMine()`

Ở đây tôi chọn cách 2 vì thực dụng hơn.

Lý do:

- backend đã có `buyerReviewSubmitted`
- refetch sẽ lấy state thật mới nhất
- tránh sai lệch nếu sau này backend thêm field khác

## 9. Test FE đã khóa những gì?

Các test mới:

- [ReviewOrderDialog.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/ReviewOrderDialog.test.tsx)
- [SellerReviewsSection.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/SellerReviewsSection.test.tsx)
- [order-display.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.test.ts)

Những gì đã được bảo vệ:

- dialog không cho submit comment rỗng
- dialog gửi đúng `rating` và `comment` đã trim
- seller section load được review
- seller reply gọi đúng API
- helper `canBuyerSubmitReview(order)` hoạt động đúng

## 10. Những lỗi dễ gặp

### Lỗi 1: Submit xong nhưng nút review vẫn còn

Nguyên nhân thường là:

- FE không refetch orders
- hoặc không cập nhật `buyerReviewSubmitted`

### Lỗi 2: Seller reply xong nhưng UI không đổi

Nguyên nhân thường là:

- save thành công nhưng không cập nhật state `reviews`

### Lỗi 3: Review có ở profile seller nhưng không thấy ở bike detail

Nguyên nhân thường là:

- FE chưa render `sellerReply`
- hoặc type `Review` thiếu field reply

## 11. Chốt ngắn

Slice FE này hoàn thiện 3 đường đi:

- buyer viết review từ `Đơn mua`
- seller reply review ở `Profile`
- buyer khác thấy reply của seller ở `Bike detail`

Nhìn ở góc độ React, đây là ví dụ rất điển hình của luồng:

- user action
- state change
- API call
- response
- rerender

Nếu hiểu được slice này, bạn sẽ dễ hiểu hơn các phần khác như:

- refund dialog
- payout profile form
- chat composer
