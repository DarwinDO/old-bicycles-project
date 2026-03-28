# Seller Listing Public Visibility Vs Seller Action Lock Basics - 2026-03-28

## 1. Vấn đề là gì?

Sau khi backend đổi sang flow nhiều buyer cùng gửi request mua, FE không thể tiếp tục dùng một cờ duy nhất để quyết định mọi thứ.

Nếu chỉ nhìn `lockedForTransaction`, FE rất dễ hiểu sai:

- listing có còn public cho buyer khác hay không
- seller có còn được sửa, ẩn, xóa listing hay không

Hai câu hỏi này không còn là một nữa.

## 2. Hai loại “khóa” khác nhau

### `lockedForTransaction`

Đây là khóa dành cho phía public/buyer.

Khi `lockedForTransaction = true`, nghĩa là:

- seller đã chấp nhận một request và order đó đang chờ thanh toán
- hoặc order đã vào nhánh `deposited`
- hoặc order đã sang `awaiting_buyer_confirmation`

Khi đó:

- buyer khác không còn thấy listing ngoài marketplace
- trang detail cũng không cho tạo thêm yêu cầu mua

### `sellerActionLocked`

Đây là khóa dành cho seller UI.

Khi `sellerActionLocked = true`, seller chưa được:

- sửa tin
- ẩn tin
- xóa tin

Lý do:

- đang có order mở liên quan đến listing
- seller không nên đổi thông tin listing giữa lúc buyer đang chờ

Điểm quan trọng:

- một listing có thể `sellerActionLocked = true`
- nhưng vẫn `lockedForTransaction = false`
- tức là seller bị khóa thao tác, còn buyer khác vẫn thấy listing ngoài marketplace

Đó chính là giai đoạn seller đang nhận nhiều request và chưa chọn buyer.

## 3. FE đã sửa theo hướng nào?

### Trang/API nào tham gia?

- `productsApi.getMine(...)`
- `SellerListingsPage.tsx`
- `SellerListingsSection.tsx`
- `SellerDashboardPage.tsx`
- `seller-listing-visibility.ts`

### Data flow mới

1. FE gọi `productsApi.getMine(...)`.
2. API module chuẩn hóa dữ liệu product từ backend.
3. Product bây giờ có thêm `sellerActionLocked`.
4. `seller-listing-visibility.ts` suy ra:
   - `label`
   - `className`
   - `hint`
   - `isPubliclyVisible`
5. Các page seller dùng `sellerActionLocked` để khóa nút sửa/ẩn/xóa.
6. Dashboard seller dùng `canSellerAcceptOrder(...)` để đếm đúng “request cần phản hồi”, thay vì gom tất cả order `pending` vào cùng một nghĩa.

## 4. Vì sao không khóa theo raw `status` nữa?

Vì raw `status` của product hoặc order không đủ chi tiết.

Ví dụ:

- Product `active` không chắc buyer còn thấy ngoài marketplace
- Order `pending` không chắc seller còn phải phản hồi

Sau cập nhật:

- product visibility phải nhìn thêm `lockedForTransaction`
- seller actions phải nhìn thêm `sellerActionLocked`
- seller dashboard phải nhìn `status + fundingStatus` của order

## 5. Helper mới làm gì?

Trong `seller-listing-visibility.ts`, helper ưu tiên xử lý theo thứ tự:

1. Nếu `lockedForTransaction = true`
   - hiện badge kiểu “đã chốt giao dịch”
   - `isPubliclyVisible = false`
2. Nếu `sellerActionLocked = true`
   - hiện badge kiểu “đang có yêu cầu mua chờ phản hồi”
   - `isPubliclyVisible = true`
3. Nếu listing chưa có inspection hợp lệ
   - báo “chưa đủ điều kiện hiển thị công khai”
4. Nếu không rơi vào các case trên
   - mới dùng logic status bình thường

## 6. Ví dụ dễ hiểu

Giả sử listing đang `active` và đã verified.

### Trường hợp A: mới có 2 buyer gửi request

Backend trả:

- `lockedForTransaction = false`
- `sellerActionLocked = true`

FE phải hiểu:

- listing vẫn public
- seller không được sửa/ẩn/xóa
- seller dashboard phải hiện đây là request cần phản hồi

### Trường hợp B: seller đã chấp nhận 1 buyer

Backend trả:

- `lockedForTransaction = true`
- `sellerActionLocked = true`

FE phải hiểu:

- listing không còn public
- seller vẫn không được sửa/ẩn/xóa
- đây không còn là “request mới”, mà là đơn đã chốt đang chờ thanh toán

## 7. File chính của lần sửa này

- [products.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/products.api.ts)
- [product.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/types/product.ts)
- [seller-listing-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/seller-listing-visibility.ts)
- [SellerListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerListingsPage.tsx)
- [SellerListingsSection.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/SellerListingsSection.tsx)
- [SellerDashboardPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerDashboardPage.tsx)

## 8. Hiểu lầm dễ gặp

### Hiểu lầm 1: listing public thì seller chắc chắn vẫn sửa được

Không đúng.

Giai đoạn đang chờ seller chọn buyer là ví dụ ngược lại.

### Hiểu lầm 2: seller dashboard chỉ cần đếm order `pending`

Không đủ.

`pending + unpaid` và `pending + awaiting_payment` là hai ý nghĩa khác nhau.

### Hiểu lầm 3: FE chỉ cần bám raw status là đủ

Không đúng.

FE phải bám cả business flags mà backend tính sẵn.

## 9. Kết luận ngắn

Lần sửa này giúp FE bám đúng nghiệp vụ hơn:

- request mua chưa được chấp nhận vẫn có thể song song
- listing chưa bị ẩn public ngay ở giai đoạn đó
- seller UI vẫn bị khóa thao tác khi cần
- dashboard seller phân biệt rõ “request cần phản hồi” với “đơn đã chốt đang chờ thanh toán”
