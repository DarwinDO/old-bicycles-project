# Seller listing hiển thị khác marketplace: giải thích cho người mới

## 1. Vấn đề là gì?

Có những tin trong trang quản lý của seller nhìn như đang bán, nhưng sang trang `Mua xe` thì buyer không thấy.

Điều này dễ gây hiểu nhầm nếu FE chỉ nhìn vào `status` thô của product.

Ví dụ:

- `active`
- `inspected_passed`

Nhìn hai trạng thái này có vẻ đều là “đang bán”, nhưng thực tế chưa chắc đã được hiển thị ngoài marketplace.

## 2. Vì sao lại như vậy?

Backend không chỉ kiểm tra `status`.

Để một tin xuất hiện ở marketplace public, backend còn kiểm tra thêm:

- tin có inspection hợp lệ hay chưa
- inspection có còn hạn hay không
- tin có đang bị khóa vì đã có giao dịch mở hay không

Nói đơn giản:

- `status` chỉ là một phần
- `public visibility` mới là kết quả cuối cùng buyer có thấy hay không

## 3. Hai field quan trọng FE phải nhìn thêm

Backend đã trả thêm các field này trong `ProductResponse`:

- `isVerified`
- `lockedForTransaction`

Ý nghĩa:

- `isVerified = true`
  - tin đã có inspection hợp lệ, đủ điều kiện public
- `lockedForTransaction = true`
  - tin đang có order/giao dịch mở, nên buyer khác không được thấy nữa

## 4. FE sửa theo hướng nào?

Thay vì hiển thị trực tiếp:

- `active -> Đang bán`
- `inspected_passed -> Đã kiểm định đạt`

FE dùng helper để tính lại trạng thái hiển thị cho seller.

File chính:

- `src/pages/seller/SellerListingsPage.tsx`
- `src/pages/seller/seller-listing-visibility.ts`
- `src/components/profile/SellerListingsSection.tsx`
- `src/pages/ProfilePage.tsx`

Helper mới sẽ suy ra:

- `Đang hiển thị công khai`
- `Tạm khóa do đang có giao dịch`
- `Chưa đủ điều kiện hiển thị công khai`
- `Đang chờ inspector kiểm định`
- `Kiểm định không đạt`

Như vậy seller sẽ hiểu vì sao tin của mình không thấy ở marketplace.

## 5. Luồng file trong FE của task này

### Bước 1: page seller hoặc tab profile gọi API

- `SellerListingsPage.tsx`
- hoặc `ProfilePage.tsx`

- `productsApi.getMine(...)`

để lấy danh sách tin của seller.

### Bước 2: dữ liệu product đi vào helper

Mỗi `product` được truyền vào:

- `getSellerListingStatusPresentation(product)`

trong file:

- `seller-listing-visibility.ts`

### Bước 3: helper tính trạng thái hiển thị thật

Helper dựa vào:

- `product.status`
- `product.isVerified`
- `product.lockedForTransaction`

để trả ra:

- `label`
- `className`
- `hint`
- `isPubliclyVisible`

### Bước 4: page render badge và hint đúng nghĩa

- `SellerListingsPage.tsx`
- `SellerListingsSection.tsx`

- hiển thị badge trạng thái
- hiển thị dòng giải thích nhỏ bên dưới
- chỉ hiện nút `Ẩn tin` khi tin đang public thật

## 6. Một hiểu lầm dễ gặp

### Hiểu lầm: `active` nghĩa là buyer chắc chắn thấy

Không đúng.

Sau khi business rule chặt hơn, `active` có thể chỉ là trạng thái thô trong database.

Buyer chỉ thấy khi:

- inspection hợp lệ
- không bị khóa vì giao dịch

## 7. Chốt ngắn

Trong task này, FE được sửa để:

- không còn nói dối seller rằng tin “đang bán công khai” khi thực ra buyer không thấy
- giải thích rõ hơn tình trạng thật của tin đăng
- bám sát rule public visibility của backend hơn
