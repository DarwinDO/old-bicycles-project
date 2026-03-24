# Size Chart Ở FE: Admin CRUD Và Gợi Ý Size Trên Trang Chi Tiết

## 1. FE thêm gì ở tranche này

Có 2 phần chính:

- admin quản lý size chart
- buyer xem gợi ý size ở bike detail

## 2. Admin quản lý size chart ở đâu

Admin dùng tab `Size chart` trong màn quản lý danh mục kỹ thuật.

Tại đây admin có thể:

- tạo bảng mới cho một category
- thêm nhiều dòng size
- sửa bảng hiện có
- xóa bảng

Mỗi dòng size gồm:

- `frame size`
- `height min`
- `height max`
- `note`

## 3. Vì sao UI admin không cho nhập tự do quá mức

FE giữ form theo dạng hàng/dòng thay vì textarea thô để:

- tránh nhập sai cấu trúc
- dễ validate hơn
- đồng bộ với request DTO của backend

Nghĩa là admin không nhập một cục text dài, mà nhập từng row rõ ràng.

## 4. Buyer thấy gì ở bike detail

Nếu product có:

- `categoryId`
- `frameSize`

và category đó có size chart,

thì bike detail sẽ hiển thị:

- block `Gợi ý chiều cao theo size`
- một dòng highlight đúng `frameSize` của xe
- bảng đầy đủ để buyer xem toàn bộ chart

Ví dụ:

- xe có `frameSize = 54`
- category là Road Bike
- chart có row `54 -> 170-178 cm`

thì FE sẽ nhấn mạnh đúng dòng đó.

## 5. Nếu không có size chart thì sao

FE không ném lỗi cho buyer.

Nó chỉ:

- không hiển thị block size chart

Đây là chủ ý để category nào chưa được admin cấu hình vẫn không làm vỡ trang chi tiết.

## 6. Vì sao chưa làm filter theo chiều cao

Vì đây là bước sau.

Tranche hiện tại chỉ chốt:

- dữ liệu admin nhập được
- buyer đọc được ở bike detail

Sau này nếu muốn filter theo chiều cao người đi thì FE mới map:

- chiều cao người dùng
- sang các `frameSize` phù hợp từ size chart

## 7. Chốt ngắn

FE bây giờ không chỉ hiển thị `frame size` như dữ liệu thô nữa.

Nó đã có thể giải thích thêm cho buyer:

- size đó thường hợp với người cao khoảng nào

Đây là phần tăng chất lượng thông tin, không phải thay đổi luồng giao dịch.
