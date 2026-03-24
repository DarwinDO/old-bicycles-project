# Dọn Mojibake Ở Các Màn Groupset: giải thích cho người mới học

## 1. Mojibake là gì?

`Mojibake` là hiện tượng chữ bị vỡ mã hóa.

Ví dụ:

- đúng: `Chọn groupset`
- bị vỡ: chuỗi chữ hiện ra thành các ký tự lạ

Điều này thường xảy ra khi:

- file thật đang là `UTF-8`
- nhưng một công cụ nào đó đọc hoặc ghi nó theo encoding khác

## 2. Slice này bị ở đâu?

Trong tranche `groupset`, logic code vẫn đúng nhưng một vài label tiếng Việt bị vỡ ở các màn:

- `Đăng tin bán xe`
- `Chỉnh sửa tin đăng`
- `Mua xe`

Cụ thể là các chuỗi liên quan tới filter/select `groupset`.

## 3. Đã sửa như thế nào?

Chỉ sửa text hiển thị, không đổi business logic:

- `SellBikePage.tsx`
- `SellerEditProductPage.tsx`
- `BikeListingPage.tsx`

Các chuỗi đã được rewrite lại thành UTF-8 chuẩn:

- `Chọn groupset`
- `Tất cả groupset`

## 4. Vì sao không sửa cả file hàng loạt?

Trong FE repo này đã có rule:

- nếu file chỉ vỡ ở block đang chạm tới, thì chỉ sửa block đó

Lý do:

- giảm rủi ro vô tình đổi logic
- diff nhỏ hơn, dễ review hơn
- không tạo noise ở những phần không liên quan

## 5. Cách kiểm tra nhanh sau khi sửa

1. mở lại file trong VS Code với `UTF-8`
2. kiểm tra các label tiếng Việt có còn bị vỡ nữa hay không
3. chạy lại test/build để chắc việc đổi text không làm hỏng màn hình

Trong slice này đã verify bằng:

- `npm run test:run -- src/pages/admin/AdminCategoriesPage.test.tsx`
- `npm run build`

## 6. Chốt ngắn

Đây là lỗi hiển thị do encoding, không phải lỗi nghiệp vụ `groupset`.

Logic filter/create/edit vẫn giữ nguyên, chỉ dọn lại text để UI hiển thị đúng tiếng Việt.
