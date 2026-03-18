# Loading state và empty state ở trang tranh chấp của admin

## 1. Bối cảnh

Trang admin tranh chấp có nhiệm vụ hiển thị danh sách các yêu cầu hoàn tiền.

File chính:

- [AdminDisputesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminDisputesPage.tsx)
- [DataTable.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/dashboard/DataTable.tsx)
- [refunds.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/refunds.api.ts)

Trước khi sửa, lúc API còn đang chạy thì bảng gần như trống, rất dễ tạo cảm giác:

- trang bị lỗi
- API không trả dữ liệu
- hoặc “không có dữ liệu”

Trong thực tế, nhiều lúc dữ liệu vẫn đang tải bình thường.

## 2. `Loading state` là gì?

`Loading state` là trạng thái “đang tải”.

Nó trả lời câu hỏi:

> “Hệ thống đang bận lấy dữ liệu hay thật sự không có dữ liệu?”

Nếu có loading state rõ ràng, người dùng biết:

- trang chưa xong
- chỉ cần chờ thêm

## 3. `Empty state` là gì?

`Empty state` là trạng thái “trống”.

Nó dùng khi:

- API đã chạy xong
- nhưng không có bản ghi nào để hiển thị

Ví dụ:

- chưa có yêu cầu tranh chấp nào
- hoặc có filter tìm kiếm nhưng không khớp kết quả

## 4. Vì sao phải tách 2 trạng thái này?

Nếu không tách, UI sẽ rất khó hiểu.

Ví dụ xấu:

1. user mở trang
2. API đang chạy 2 giây
3. bảng hiện “Không có dữ liệu”
4. 2 giây sau dữ liệu mới hiện ra

Người dùng sẽ tưởng:

- hệ thống chớp lỗi
- dữ liệu nhảy lung tung
- backend không ổn định

## 5. Bản sửa lần này làm gì?

### 5.1. Ở page

Trong [AdminDisputesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminDisputesPage.tsx):

- giữ state:
  - `loading`
  - `error`
  - `refunds`
  - `page`
  - `statusFilter`
  - `searchQuery`
- khi gọi API, page set `loading = true`
- khi API xong, page set `loading = false`

### 5.2. Ở bảng

Trong [DataTable.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/dashboard/DataTable.tsx):

- nếu `loading = true`
  - render nhiều hàng xám giả (`skeleton row`)
- nếu `loading = false` và có dữ liệu
  - render dữ liệu thật
- nếu `loading = false` và danh sách rỗng
  - mới render `emptyMessage`

## 6. Luồng đi của FE trong task này

Luồng runtime đơn giản:

1. User mở route admin tranh chấp
2. [AdminDisputesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminDisputesPage.tsx) được mount
3. `useEffect` chạy
4. page gọi [refunds.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/refunds.api.ts)
5. `refundsApi.getAll(...)` gọi backend `GET /api/admin/refunds`
6. Trong lúc chờ response:
   - `loading = true`
   - [DataTable.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/dashboard/DataTable.tsx) render skeleton
7. Khi response về:
   - page cập nhật `refunds`, `totalPages`, `totalElements`
   - `loading = false`
8. React render lại
9. Bảng hiển thị dữ liệu thật hoặc empty state phù hợp

## 7. Test đã thêm để bảo vệ regression

File test:

- [AdminDisputesPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminDisputesPage.test.tsx)

Ý tưởng của test:

- case 1: promise chưa resolve
  - phải thấy skeleton
  - chưa được hiện row dữ liệu
- case 2: API resolve thành công
  - phải thấy product title
  - phải thấy buyer/seller tương ứng

## 8. Vì sao cách này tốt hơn?

Vì nó tách rõ 3 trạng thái:

- đang tải
- có lỗi
- có dữ liệu hoặc rỗng thật

UI rõ ràng hơn, và người dùng bớt cảm giác “sao trang này cứ chậm/chớp lỗi”.

## 9. Hiểu lầm dễ gặp

### Hiểu lầm 1: “Loading skeleton chỉ là phần trang trí”

Sai.

Nó không chỉ để đẹp, mà còn truyền thông tin trạng thái cho người dùng.

### Hiểu lầm 2: “Có spinner chung toàn trang là đủ”

Không hẳn.

Với màn hình dạng bảng, skeleton theo hàng thường dễ hiểu hơn spinner chung vì nó cho người dùng biết:

- dữ liệu sẽ hiện ở đâu
- cấu trúc bảng sẽ ra sao

### Hiểu lầm 3: “Empty state và loading state đều là chưa có data nên dùng chung được”

Sai.

`Loading` nghĩa là dữ liệu chưa về.

`Empty` nghĩa là dữ liệu đã về nhưng rỗng.

Hai ý nghĩa này khác nhau hoàn toàn.

## 10. Chốt ngắn

Bản sửa FE lần này không đổi business logic của refund.

Nó sửa trải nghiệm hiển thị:

- lúc đang tải thì có skeleton và text loading rõ ràng
- lúc rỗng thật thì mới hiện empty state

Đây là một ví dụ tốt cho người mới học React:

- state không chỉ giữ dữ liệu
- state còn giúp UI nói đúng chuyện gì đang xảy ra với user
