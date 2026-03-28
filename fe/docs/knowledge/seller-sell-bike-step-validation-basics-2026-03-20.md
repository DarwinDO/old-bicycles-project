# Seller Sell Bike Step Validation Basics

## 1. Bối cảnh

Seller đang có 2 luồng form nhiều bước liên quan đến tin đăng:

- [SellBikePage.tsx](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/pages/SellBikePage.tsx)
- [SellerEditProductPage.tsx](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/pages/seller/SellerEditProductPage.tsx)

`Validation` nghĩa là kiểm tra dữ liệu người dùng nhập có hợp lệ hay chưa.

`Validation theo bước` nghĩa là:

- đang ở bước nào thì kiểm tra đúng các field bắt buộc của bước đó
- nếu bước hiện tại còn thiếu dữ liệu thì không cho sang bước tiếp theo
- lỗi được hiển thị ngay trên field hoặc nhóm field liên quan

Mục tiêu là giúp user biết thiếu gì ngay lúc đó, thay vì đi đến cuối form mới thấy lỗi.

## 2. Rule hiện tại của từng luồng

### Luồng đăng tin mới

- Bước 1 cần: tiêu đề, danh mục, thương hiệu, tình trạng
- Bước 2 cần: size khung, kích thước bánh, loại phanh, chất liệu khung, bộ truyền động
- Bước 3 cần đủ 3 ảnh bắt buộc:
  toàn thân xe, bộ truyền động, số khung
- Bước 4 cần: giá bán hợp lệ và tỉnh/thành phố

### Luồng chỉnh sửa tin đăng

- Bước 1 cần: tiêu đề, danh mục, thương hiệu, tình trạng
- Bước 2 cần: size khung, kích thước bánh, loại phanh, chất liệu khung, bộ truyền động
- Bước 3 cần: còn ít nhất 1 ảnh để tin đăng không bị rỗng ảnh
- Bước 4 cần: giá bán hợp lệ và tỉnh/thành phố

Điểm khác nhau quan trọng:

- form tạo mới bắt buộc đủ bộ ảnh kiểm định ban đầu
- form chỉnh sửa chỉ bắt buộc còn ít nhất 1 ảnh, vì dữ liệu cũ có thể là ảnh đã tồn tại từ trước

## 3. File xử lý validation chung

Logic kiểm tra được đặt ở:

- [sell-bike-form.ts](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/lib/sell-bike-form.ts)

File này có 3 phần chính:

- `validateSellBikeStep()`
  kiểm tra một bước cụ thể
- `validateSellBikeForm()`
  kiểm tra toàn form trước khi submit
- `getMissingRequiredImageTypes()`
  tìm loại ảnh bắt buộc còn thiếu của luồng tạo mới

Ngoài ra file này có thêm `SellBikeValidationOptions` để cùng một helper có thể phục vụ cả:

- `typedRequiredSet`: dùng cho form tạo mới
- `atLeastOne`: dùng cho form chỉnh sửa

Nhờ vậy rule vẫn tập trung ở một chỗ, dễ đọc và dễ test hơn.

## 4. Luồng FE khi user bấm `Tiếp tục`

### A. Trang đăng tin mới

1. User đang ở [SellBikePage.tsx](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/pages/SellBikePage.tsx)
2. Nút `Tiếp tục` gọi `handleNextStep()`
3. `handleNextStep()` gọi `validateSellBikeStep(step, formData)`
4. Nếu có lỗi:
   `formErrors` được cập nhật
5. React render lại UI và hiển thị lỗi ngay dưới field tương ứng
6. `step` không tăng nên user không thể đi tiếp

### B. Trang chỉnh sửa tin đăng

1. User đang ở [SellerEditProductPage.tsx](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/pages/seller/SellerEditProductPage.tsx)
2. Nút `Tiếp tục` gọi `handleNextStep()`
3. Page map dữ liệu hiện tại sang `toValidationState(formData)`
4. Sau đó gọi `validateSellBikeStep(..., { imageRequirement: 'atLeastOne' })`
5. Nếu còn thiếu field bắt buộc hoặc xóa hết ảnh:
   lỗi được lưu vào `formErrors`
6. UI rerender và chặn luôn việc sang bước tiếp theo

## 5. Luồng FE khi user bấm submit

### A. Tạo tin

1. `handleSubmit()` gọi `validateSellBikeForm(formData)`
2. Nếu sai:
   FE tìm ra bước lỗi đầu tiên
3. `step` bị đưa về bước đó
4. User sửa xong mới được đăng tin

### B. Chỉnh sửa tin

1. `handleSubmit()` gọi `validateSellBikeForm(toValidationState(formData), { imageRequirement: 'atLeastOne' })`
2. Nếu sai:
   FE đưa user về đúng bước đang lỗi
3. Message lỗi tổng quát hiển thị ở bước cuối, còn lỗi chi tiết hiển thị cạnh field
4. Chỉ khi hợp lệ thì FE mới tạo `payload`
5. FE gọi [products.api.ts](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/api/products.api.ts) để cập nhật tin

## 6. Những chỗ user sẽ thấy lỗi

Sau thay đổi này, cả form tạo và form sửa đều hiển thị lỗi rõ hơn ở:

- input tiêu đề
- select danh mục
- select thương hiệu
- nhóm nút tình trạng
- vùng ảnh ở bước 3
- input giá bán
- input giá gốc nếu vượt giới hạn
- bộ chọn tỉnh/thành phố

Điều này làm giảm tình trạng:

- bấm `Tiếp tục` nhưng không hiểu vì sao không qua bước sau
- bấm `Lưu thay đổi` mới phát hiện thiếu dữ liệu từ bước trước

## 7. Test đã có

Test helper nằm ở:

- [sell-bike-form.test.ts](/c:/Users/Admin/Desktop/test%20dev/old-bicycles-project/fe/src/lib/sell-bike-form.test.ts)

Các test chính đang kiểm tra:

- step 1 chặn khi thiếu field bắt buộc
- step 2 chặn khi thiếu thông số kỹ thuật bắt buộc
- step 3 của form tạo mới chặn khi thiếu bộ ảnh bắt buộc
- step 3 của form chỉnh sửa chặn khi không còn ảnh nào
- step 4 chặn khi giá hoặc tỉnh/thành chưa hợp lệ
- validate toàn form trả đúng bước lỗi đầu tiên

## 8. Điểm nên nhớ cho người mới

Khi làm form nhiều bước, đừng chỉ kiểm tra ở nút submit cuối cùng.

Nên kiểm tra ở 2 tầng:

- tầng 1: chặn theo từng bước để user sửa sớm
- tầng 2: kiểm tra toàn form trước khi gọi API để tránh lọt lỗi

Với seller listing của dự án này, cách nghĩ đơn giản là:

- user thao tác ở page
- page cập nhật `formData`
- validator đọc `formData`
- validator trả `formErrors`
- React render lại giao diện
- chỉ khi không còn lỗi thì page mới cho tăng `step` hoặc gọi API
