# Bike Detail Report Entrypoint Và Refund Evidence Upload Ở FE: giải thích cho người mới học

## 1. Bối cảnh

Trước bản sửa này, FE có hai khoảng trống dễ gây hiểu lầm:

- user chưa có chỗ bình thường để bấm báo cáo `product` hoặc `seller`
- modal hoàn tiền chỉ gửi được chữ, chưa gửi được ảnh riêng cho refund request

Điều này làm phát sinh một tình huống khá nguy hiểm:

- backend report có thật
- admin report page có thật
- nhưng user không có entry point rõ ràng để gửi report

và:

- admin dispute nhìn thấy ảnh bàn giao/nhận xe
- nhưng không nhìn thấy ảnh buyer gửi riêng cho refund request

## 2. Hai khái niệm quan trọng

### `entry point` là gì?

`Entry point` là nơi người dùng thật sự bắt đầu một luồng trên giao diện.

Ví dụ:

- nút “Báo cáo tin đăng này” trên `BikeDetailPage`
- nút “Yêu cầu hoàn tiền” trong `BuyerOrdersView`

Nếu backend có API nhưng FE không có entry point, người dùng gần như không dùng được feature đó.

### `FormData` là gì?

`FormData` là đối tượng của trình duyệt dùng để gửi:

- text
- file

trong cùng một request.

Khi refund request có ảnh, FE không thể tiếp tục gửi JSON thuần như trước.

## 3. Những gì đã đổi trong FE

Các file chính:

- `src/pages/BikeDetailPage.tsx`
- `src/components/common/ReportModal.tsx`
- `src/components/profile/DisputeModal.tsx`
- `src/components/profile/BuyerOrdersView.tsx`
- `src/api/refunds.api.ts`
- `src/pages/admin/AdminDisputesPage.tsx`
- `src/components/profile/RefundEvidenceSection.tsx`

## 4. Luồng báo cáo mới từ Bike Detail

### Luồng người dùng

```text
User mở BikeDetailPage
-> bấm "Báo cáo tin đăng này" hoặc "Báo cáo người bán"
-> mở ReportModal với targetType tương ứng
-> FE gọi reportsApi.submit(...)
-> backend lưu report
-> FE hiện thông báo đã gửi báo cáo
```

### Vì sao chọn `BikeDetailPage`?

Vì đây là nơi user:

- đang xem sản phẩm thật
- đang nhìn thấy seller thật
- có đủ ngữ cảnh để biết mình muốn báo cáo ai

Nói đơn giản:

- báo cáo `product` thì báo cáo ngay trên trang xe
- báo cáo `user` thì cũng báo cáo ngay tại chỗ đang hiển thị seller

Đây là entry point hợp lý hơn nhiều so với việc để `ReportModal` nằm “mồ côi” trong code.

## 5. Luồng hoàn tiền có ảnh bằng chứng

### Luồng FE

```text
Buyer mở BuyerOrdersView
-> bấm "Yêu cầu hoàn tiền"
-> DisputeModal mở ra
-> buyer chọn lý do, nhập note, chọn file ảnh
-> BuyerOrdersView gọi refundsApi.create(...)
-> refundsApi.create dùng FormData
-> backend tạo refund request
-> FE tải lại order và đóng modal
```

### Vai trò của từng phần

#### `DisputeModal.tsx`

Component này giữ state cục bộ cho:

- `reason`
- `evidenceNote`
- `files`

Khi submit, nó không gọi API trực tiếp. Nó chỉ gom dữ liệu và đưa lên `BuyerOrdersView`.

#### `BuyerOrdersView.tsx`

Page này quyết định:

- order nào đang được hoàn tiền
- số tiền refund lấy theo rule nào
- khi submit xong thì tải lại danh sách order ra sao

Nó là cầu nối giữa UI và API module.

#### `refunds.api.ts`

Đây là nơi chuyển dữ liệu FE thành `FormData` thật:

- `amount`
- `reason`
- `evidenceNote`
- `files`

Điểm này rất quan trọng, vì nếu FE chỉ thêm input file nhưng API vẫn gửi JSON thì backend sẽ không nhận được ảnh.

## 6. Admin dispute giờ thấy gì thêm?

`AdminDisputesPage.tsx` giờ ngoài hai khối cũ:

- ảnh seller bàn giao
- ảnh buyer xác nhận đã nhận

còn có thêm:

- ảnh buyer gửi kèm refund request

Điều này giúp admin phân biệt rõ:

- ảnh của quá trình giao/nhận xe
- ảnh của quá trình khiếu nại hoàn tiền

## 7. Test đã bảo vệ những gì?

Slice này đã thêm hoặc mở rộng test ở:

- `src/api/refunds.api.test.ts`
- `src/pages/BikeDetailPage.test.tsx`
- `src/components/profile/BuyerOrdersView.test.tsx`

Ý nghĩa của chúng:

- kiểm tra refund API helper thật sự gửi `multipart/form-data`
- kiểm tra `BikeDetailPage` thật sự mount được report entry point
- kiểm tra `BuyerOrdersView` thật sự chuyển `files` xuống refund API

Nói cách khác, test không chỉ nhìn UI, mà còn khóa cả contract dữ liệu.

## 8. Những hiểu lầm dễ gặp

### Hiểu lầm 1: “Có modal report là coi như user báo cáo được”

Không đúng.

Phải có page thật mở modal đó lên.

### Hiểu lầm 2: “Chọn file trên FE là đủ”

Không đúng.

Còn phải có:

- API module đổi sang `FormData`
- backend endpoint nhận `multipart`

### Hiểu lầm 3: “Ảnh refund và ảnh order là một”

Không đúng.

Chúng phục vụ hai câu hỏi khác nhau:

- order evidence: giao/nhận xe diễn ra thế nào?
- refund evidence: buyer đang chứng minh điều gì khi xin hoàn tiền?

## 9. Chốt ngắn

Bản sửa này làm FE bớt “nửa vời” ở hai chỗ rất quan trọng:

- report đã có đường đi thật từ `BikeDetailPage`
- refund đã có đường gửi ảnh bằng chứng riêng

Nhờ vậy, luồng dữ liệu trên FE bây giờ rõ hơn:

- user action
- page/component state
- API module
- backend response
- rerender UI

Đó là dấu hiệu của một feature đã được nối đủ vòng, không còn chỉ tồn tại ở mức “có component nhưng chưa ai dùng”.
