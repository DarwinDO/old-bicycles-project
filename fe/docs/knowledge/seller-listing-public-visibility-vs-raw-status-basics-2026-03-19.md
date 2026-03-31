# Seller Listing Public Visibility Vs Raw Status Basics - 2026-04-01

## 1. Vấn đề là gì?

Trong dự án này, một tin đăng có thể vẫn mang raw status là `active`, nhưng buyer ngoài marketplace vẫn không nhìn thấy.

Điều này xảy ra vì FE không được phép chỉ nhìn mỗi `product.status`. FE còn phải nhìn thêm:

- `isVerified`
- `lockedForTransaction`
- `sellerActionLocked`
- `inspection.validUntil`
- `expiresAt`

Nếu không tách các ý này ra rõ ràng, seller và admin sẽ rất dễ hiểu nhầm:

- thấy badge `Hoạt động` rồi tưởng buyer vẫn đang thấy tin
- không biết kiểm định đã hết hạn lúc nào
- không biết tin đăng còn hạn hiển thị đến lúc nào

## 2. Các khái niệm quan trọng

### `product.status`

Đây là trạng thái thô của tin đăng, ví dụ:

- `pending`
- `active`
- `hidden`
- `pending_inspection`
- `sold`

Trạng thái này cho biết tin đang nằm ở nhánh nghiệp vụ nào, nhưng chưa đủ để kết luận buyer có đang thấy ngoài marketplace hay không.

### `isVerified`

Đây là cờ FE nhận từ backend để biết tin có còn đủ điều kiện hiển thị công khai hay không.

Một tin có thể:

- `status = active`
- nhưng `isVerified = false`

Lúc đó seller/admin vẫn thấy tin trong màn quản lý, nhưng buyer bên ngoài không thấy nữa.

### `inspection.validUntil`

Đây là thời điểm hết hiệu lực của kết quả kiểm định.

Nếu thời gian này đã qua, thì kết quả kiểm định cũ không còn dùng để cho buyer xem tin công khai nữa.

### `expiresAt`

Đây là hạn hiển thị của tin đăng.

Seller và admin cần nhìn thấy mốc này để hiểu vòng đời của listing, thay vì chỉ nhìn một badge chung chung.

## 3. Luồng dữ liệu FE đi như thế nào?

### Seller listings

1. Seller mở route `/seller/listings`.
2. FE page [SellerListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerListingsPage.tsx) gọi [products.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/products.api.ts) với `GET /api/products/my`.
3. API trả về danh sách `Product`, trong đó đã có:
   - `status`
   - `isVerified`
   - `inspection.validUntil`
   - `expiresAt`
4. FE dùng [product-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/product-visibility.ts) để suy ra:
   - hạn kiểm định
   - hạn tin
   - lý do vì sao buyer không còn thấy tin
5. FE dùng [seller-listing-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/seller-listing-visibility.ts) để đổi những dữ liệu đó thành:
   - `label`
   - `className`
   - `hint`
   - `isPubliclyVisible`
6. Page render badge, hint và timeline ngay trên từng row.

### Admin listings

1. Admin mở route `/admin/listings`.
2. FE page [AdminListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminListingsPage.tsx) gọi [admin-products.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/admin-products.api.ts) với `GET /api/admin/products`.
3. FE dùng lại [product-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/product-visibility.ts).
4. Nếu product đang bị khóa bởi giao dịch mở (`lockedForTransaction = true`), FE ưu tiên badge `Đang bị khóa bởi giao dịch mở`.
5. Nếu không bị khóa giao dịch nhưng raw status vẫn thuộc nhóm public cũ và `isVerified = false`, FE đổi badge sang kiểu:
   - `Hết hạn kiểm định`
   - hoặc `Chưa đủ điều kiện public`
6. FE vẫn đồng thời hiển thị dưới tên product:
   - `Kiểm định hết hạn: ...`
   - `Hạn tin: ...`
7. Nghĩa là badge chính trả lời câu hỏi “admin có thao tác được không”, còn dòng timeline trả lời câu hỏi “inspection và hạn tin đang ra sao”.

## 4. Helper mới làm gì?

Helper chính nằm ở [product-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/product-visibility.ts).

### `hasExpiredInspection(product)`

Hàm này đọc `product.inspection?.validUntil`.

- Nếu không có dữ liệu, trả về `false`
- Nếu có nhưng đã nhỏ hơn thời điểm hiện tại, trả về `true`

Nói dễ hiểu: hàm này chỉ trả lời câu hỏi “kiểm định này đã hết hạn chưa?”.

### `getProductTimelineEntries(product)`

Hàm này gom các mốc thời gian mà UI cần hiển thị.

Hiện tại nó trả ra tối đa 2 mốc:

- `Kiểm định hết hạn` hoặc `Hạn kiểm định`
- `Hạn tin`

Mỗi mốc có:

- `label`
- `value`
- `tone`

`tone = warning` được dùng cho trường hợp inspection đã hết hạn, để UI nhấn mạnh bằng màu cảnh báo.

### `getPublicVisibilityHint(product)`

Hàm này sinh ra câu giải thích dễ hiểu cho seller/admin.

Ví dụ:

- `Buyer không còn thấy tin này ngoài marketplace vì kiểm định đã hết hạn lúc ...`
- hoặc `Buyer chưa thấy tin này ngoài marketplace vì tin chưa có kiểm định hợp lệ.`

### `getAdminListingStatusPresentation(product)`

Hàm này dành riêng cho màn admin.

Nếu product đang có `lockedForTransaction = true`, hàm sẽ trả về:

- `labelOverride = Đang bị khóa bởi giao dịch mở`
- `hint = null`

Nếu không bị khóa giao dịch nhưng product vẫn thuộc nhóm public cũ và `isVerified = false`, hàm sẽ trả về:

- `labelOverride`
- `className` cảnh báo
- `hint`

Nhờ vậy admin không còn bị lừa bởi raw status `active`, đồng thời vẫn nhìn đúng ưu tiên vận hành hiện tại.

## 5. Ví dụ rất dễ hiểu

Giả sử có một product như sau:

```ts
{
  status: 'active',
  isVerified: false,
  inspection: {
    validUntil: '2026-03-30T08:00:00Z',
  },
  expiresAt: '2026-04-25T08:00:00Z',
}
```

### Nếu nhìn kiểu cũ

FE chỉ thấy:

- `status = active`

và render:

- badge `Hoạt động`

Điều này làm người xem tưởng buyer vẫn còn thấy tin.

### Nếu nhìn kiểu mới

FE thấy thêm:

- `isVerified = false`
- `inspection.validUntil` đã qua

nên render:

- badge `Hết hạn kiểm định`
- `Kiểm định hết hạn: ...`
- `Hạn tin: ...`
- câu giải thích vì sao buyer không còn thấy tin

### Nếu tin còn đang bị khóa giao dịch

FE sẽ ưu tiên:

- badge `Đang bị khóa bởi giao dịch mở`

nhưng vẫn giữ:

- `Kiểm định hết hạn: ...`
- `Hạn tin: ...`

Lý do là hai ý này khác nhau:

- badge chính nói vì sao admin chưa xử lý được ngay
- dòng timeline nói inspection đã hết hạn và listing còn hạn tới đâu

## 6. Tại sao cách mới đúng hơn?

Vì nó tách rõ 2 lớp ý nghĩa:

### Lớp 1: trạng thái nghiệp vụ thô

Ví dụ:

- `active`
- `hidden`
- `pending_inspection`

### Lớp 2: khả năng hiển thị công khai thật

Buyer có còn thấy ngoài marketplace hay không còn phụ thuộc vào:

- kiểm định còn hiệu lực không
- listing có đang bị khóa giao dịch không
- listing có còn đủ điều kiện public không

Nếu chỉ hiển thị lớp 1 mà bỏ qua lớp 2, UI sẽ gây hiểu lầm.

## 7. Những file chính của lần sửa này

- [product-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/product-visibility.ts)
- [AdminListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminListingsPage.tsx)
- [SellerListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerListingsPage.tsx)
- [seller-listing-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/seller-listing-visibility.ts)
- [AdminListingsPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminListingsPage.test.tsx)
- [SellerListingsPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerListingsPage.test.tsx)
- [seller-listing-visibility.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/seller-listing-visibility.test.ts)

## 8. Hiểu lầm dễ gặp

### Hiểu lầm 1: `active` là chắc chắn public

Sai.

`active` chỉ là raw status. Buyer có còn thấy hay không còn phụ thuộc vào `isVerified` và inspection còn hạn hay không.

### Hiểu lầm 2: seller chỉ cần biết mỗi badge trạng thái

Sai.

Seller còn cần biết:

- kiểm định hết hạn lúc nào
- tin hết hạn lúc nào
- vì sao buyer không còn thấy tin

### Hiểu lầm 3: admin badge raw status là đủ

Sai.

Với admin, hiển thị raw status mà không nói `public thật hay không` là rất dễ dẫn đến xử lý nhầm.

### Hiểu lầm 4: nếu đã có `Đang bị khóa bởi giao dịch mở` thì không cần hiện `Kiểm định hết hạn`

Sai.

Hai thông tin này bổ sung cho nhau, không thay thế nhau.

- `Đang bị khóa bởi giao dịch mở` là trạng thái vận hành trước mắt
- `Kiểm định hết hạn` là trạng thái chất lượng/hiệu lực kiểm định

## 9. Kết luận ngắn

Lần sửa này không đổi business rule ở backend.

Nó sửa cách FE giải thích rule đó cho đúng hơn:

- admin thấy đúng tình trạng `active nhưng không còn public`
- seller thấy rõ hạn kiểm định và hạn tin
- UI không còn gây hiểu nhầm rằng `Hoạt động` luôn đồng nghĩa với `buyer vẫn đang thấy`
