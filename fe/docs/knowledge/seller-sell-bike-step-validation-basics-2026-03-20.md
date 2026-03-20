# Seller Sell Bike Step Validation Basics

## 1. Bối cảnh

Trang đăng tin bán xe là một form nhiều bước ở:

- [SellBikePage.tsx](/e:/old-bicycles-project/fe/src/pages/SellBikePage.tsx)

Trước khi sửa, người dùng có thể bấm `Tiếp tục` để sang bước kế tiếp dù chưa điền các trường bắt buộc. Điều này gây ra 2 vấn đề:

- trải nghiệm không rõ ràng vì user tưởng form đã hợp lệ
- lỗi chỉ xuất hiện muộn ở cuối luồng, khó biết đang thiếu mục nào

---

## 2. “Validation theo bước” là gì?

`Validation` nghĩa là kiểm tra dữ liệu có hợp lệ hay chưa.

`Validation theo bước` nghĩa là:

- đang ở bước nào thì kiểm tra các trường bắt buộc của đúng bước đó
- nếu thiếu thì không cho sang bước kế tiếp
- hiện thông báo lỗi ngay cạnh field hoặc nhóm field liên quan

Ví dụ trong form đăng bán:

- bước 1 cần tiêu đề, danh mục, thương hiệu, tình trạng
- bước 3 cần đủ 3 ảnh bắt buộc
- bước 4 cần giá bán và tỉnh/thành phố

---

## 3. File nào xử lý rule mới?

Logic kiểm tra được tách ra thành helper ở:

- [sell-bike-form.ts](/e:/old-bicycles-project/fe/src/lib/sell-bike-form.ts)

File này có 3 phần chính:

- `validateSellBikeStep()`
  Dùng để kiểm tra một bước cụ thể.
- `validateSellBikeForm()`
  Dùng để kiểm tra toàn bộ form trước khi submit.
- `getMissingRequiredImageTypes()`
  Dùng để biết đang thiếu loại ảnh bắt buộc nào.

Việc tách helper ra khỏi page giúp:

- code trong page gọn hơn
- rule validation dễ đọc hơn
- viết test unit dễ hơn

---

## 4. Luồng FE sau khi sửa

### Khi user bấm `Tiếp tục`

1. User đang ở [SellBikePage.tsx](/e:/old-bicycles-project/fe/src/pages/SellBikePage.tsx)
2. Nút `Tiếp tục` gọi `handleNextStep()`
3. `handleNextStep()` gọi `validateSellBikeStep(step, formData)`
4. Nếu có lỗi:
   - state `formErrors` được cập nhật
   - `step` không tăng
   - UI rerender và hiện lỗi ngay tại field liên quan
5. Nếu không có lỗi:
   - `step` tăng lên
   - React render bước kế tiếp

### Khi user bấm `Đăng tin`

1. Nút submit gọi `handleSubmit()`
2. `handleSubmit()` gọi `validateSellBikeForm(formData)`
3. Nếu còn thiếu dữ liệu:
   - FE tìm bước sai đầu tiên
   - tự đưa user quay về bước đó
   - hiện lỗi đúng field
4. Nếu hợp lệ:
   - FE mới tạo `payload`
   - gọi [products.api.ts](/e:/old-bicycles-project/fe/src/api/products.api.ts)
   - gửi request tạo tin

---

## 5. Lỗi được hiển thị ở đâu?

Sau khi sửa:

- input tiêu đề và giá bán có viền đỏ khi sai
- select danh mục và thương hiệu có message lỗi riêng
- nhóm nút chọn tình trạng có message lỗi phía dưới
- phần ảnh bắt buộc có message lỗi khi chưa đủ 3 ảnh
- bộ chọn tỉnh/thành có thể hiện lỗi ngay dưới dropdown

Điều này giúp user không phải đoán “tại sao bấm tiếp tục mà không đi được”.

---

## 6. Test đã thêm

Test unit mới nằm ở:

- [sell-bike-form.test.ts](/e:/old-bicycles-project/fe/src/lib/sell-bike-form.test.ts)

Test này kiểm tra:

- bước 1 có chặn khi thiếu field bắt buộc
- bước 3 có chặn khi thiếu ảnh bắt buộc
- bước 4 có chặn khi thiếu giá hoặc tỉnh/thành
- validate toàn form có trả về bước lỗi đầu tiên hay không

---

## 7. Điểm nên nhớ cho người mới

Khi làm form nhiều bước, đừng chỉ kiểm tra ở nút submit cuối cùng.

Nên kiểm tra:

- theo từng bước để chặn sớm
- theo toàn form trước khi gọi API để tránh lọt lỗi

Như vậy:

- user đỡ rối
- code dễ bảo trì hơn
- bug “đi qua step dù thiếu field bắt buộc” sẽ khó quay lại hơn
