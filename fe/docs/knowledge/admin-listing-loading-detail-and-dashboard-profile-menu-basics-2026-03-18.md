# Admin loading, chi tiết tin chờ duyệt, và menu profile của seller/inspector

## 1. Bối cảnh

Ở frontend có 4 vấn đề người dùng thấy rất rõ:

- Trang `Duyệt tin đăng` lúc mới vào nhìn như rỗng rồi một lúc sau mới có dữ liệu.
- Admin bấm `Xem chi tiết` tin `pending` thì bị báo `Không thể tải thông tin xe`.
- Seller và inspector bấm avatar hoặc icon profile ở header nhưng không mở gì cả.
- Console bị spam lỗi khi admin cố mở chi tiết một tin chờ duyệt.

Đây không phải 4 lỗi tách rời hoàn toàn. Chúng liên quan đến:

- cách page chọn API
- trạng thái auth bootstrap
- loading UX của bảng
- header layout chỉ có icon nhưng chưa có hành vi thật

## 2. Vì sao admin mở detail tin `pending` lại lỗi?

Trước khi sửa, `AdminListingsPage` điều hướng sang route public:

- `/bikes/:id`

Sau đó `BikeDetailPage` luôn gọi:

- `GET /api/products/{id}`

Nhưng đây là API công khai. Nó không cho xem product đang `pending`.

Nghĩa là:

- route frontend đúng về mặt URL
- nhưng page lại chọn sai API backend

## 3. `Auth bootstrap` là gì?

`Auth bootstrap` là giai đoạn app vừa mở lên và đang tự kiểm tra:

- có token không
- token còn hợp lệ không
- user hiện tại là ai
- role là buyer, seller, inspector hay admin

Nếu page gọi API quá sớm, trước khi biết user là admin hay không, nó có thể bắn nhầm vào public API.

## 4. FE đã sửa như thế nào?

### 4.1. `BikeDetailPage` đợi auth xong rồi mới quyết định gọi API nào

File:

- `src/pages/BikeDetailPage.tsx`

Luồng mới:

1. page đọc `user` và `isLoading` từ `AuthContext`
2. nếu auth còn đang bootstrap thì chưa fetch detail
3. khi auth đã rõ:
   - nếu `user.role === 'admin'` thì gọi `adminProductsApi.getById(id)`
   - nếu không phải admin thì gọi `productsApi.getById(id)`

Nhờ vậy admin không còn vô tình dùng public API khi mở tin `pending`.

### 4.2. `AdminListingsPage` có loading skeleton thật

Files:

- `src/pages/admin/AdminListingsPage.tsx`
- `src/components/dashboard/DataTable.tsx`

Trước khi sửa:

- request đang chạy
- bảng vẫn render như đang trống
- người dùng thấy `Không có dữ liệu` hoặc cảm giác như trang chưa hoạt động

Sau khi sửa:

- `DataTable` nhận prop `loading`
- khi đang tải sẽ hiện các dòng skeleton
- chỉ khi tải xong mà thật sự không có data thì mới hiện empty state

Điểm này không làm backend nhanh hơn, nhưng làm UX trung thực hơn nhiều.

## 5. Vì sao seller và inspector không logout được?

Vì trước khi sửa, topbar của seller và inspector chỉ có:

- icon người dùng
- hoặc avatar

nhưng không có:

- dropdown menu
- handler điều hướng
- handler logout

Nói cách khác, đó chỉ là icon trang trí chứ chưa phải menu profile thật.

## 6. FE đã sửa menu topbar như thế nào?

Files:

- `src/layouts/SellerLayout.tsx`
- `src/layouts/InspectorLayout.tsx`

Sau khi sửa:

- avatar trở thành `DropdownMenuTrigger`
- menu có các mục:
  - `Trang cá nhân`
  - `Về trang mua bán`
  - `Đăng xuất`
- bell notification có thể điều hướng sang `/notifications`

## 7. Luồng FE của bài toán này

### 7.1. Admin mở detail tin chờ duyệt

```text
Người dùng admin
-> click "Xem chi tiết" ở AdminListingsPage
-> React Router mở BikeDetailPage
-> BikeDetailPage đọc AuthContext
-> nếu auth còn đang bootstrap thì chờ
-> nếu role = admin thì gọi adminProductsApi.getById(id)
-> nhận ProductResponse
-> setState(product)
-> component render lại với dữ liệu thật
```

### 7.2. Admin mở trang duyệt tin đăng

```text
Người dùng vào /admin/listings
-> AdminListingsPage mount
-> useEffect gọi adminProductsApi.getAll(...)
-> loading = true
-> DataTable render skeleton
-> API trả về danh sách
-> setProducts(...)
-> loading = false
-> bảng thật render ra
```

### 7.3. Seller hoặc inspector bấm avatar

```text
Người dùng ở SellerLayout / InspectorLayout
-> click avatar
-> Radix DropdownMenu mở
-> chọn Profile / Home / Logout
-> navigate(...) hoặc logout()
-> route hoặc session state được cập nhật
```

## 8. Thuật ngữ cần nhớ

### `Skeleton loading`

`Skeleton` là khung giả màu xám hiện trước khi dữ liệu thật tới.

Nó giúp người dùng hiểu rằng:

- hệ thống đang tải
- chứ không phải trang bị lỗi hoặc không có dữ liệu

### `Dropdown menu`

Đây là menu xổ xuống khi người dùng bấm một điểm kích hoạt như avatar hoặc nút ba chấm.

Trong project này, menu dùng Radix UI qua:

- `DropdownMenu`
- `DropdownMenuTrigger`
- `DropdownMenuContent`

### `AuthContext`

`AuthContext` là nơi frontend giữ trạng thái đăng nhập chung của app.

Nó cho page biết:

- đã đăng nhập chưa
- user hiện tại là ai
- role hiện tại là gì
- còn đang bootstrap hay không

## 9. Những hiểu lầm dễ gặp

### Hiểu lầm 1: "Route đúng thì API nào gọi cũng được"

Không đúng.

Route frontend chỉ là đường dẫn trong app. API backend vẫn có business rule và phân quyền riêng.

### Hiểu lầm 2: "Trang nhìn rỗng vài giây nghĩa là backend lỗi"

Không hẳn.

Nhiều khi backend đang tải bình thường, nhưng frontend render empty state quá sớm nên tạo cảm giác lỗi.

### Hiểu lầm 3: "Có icon là chắc chắn có hành vi"

Không đúng.

Muốn icon hoạt động, phải có event handler, menu, state hoặc điều hướng thật.

## 10. Chốt ngắn

Bản sửa FE này làm 3 việc chính:

- admin mở được detail của tin `pending`
- trang duyệt tin đăng có loading UX rõ ràng hơn
- seller và inspector có menu profile/logout thật

Đây là ví dụ tốt cho người mới học:

- cùng một bug người dùng nhìn thấy
- nhưng có thể cần sửa đồng thời `route`, `context`, `page`, `component`, và `API module`
