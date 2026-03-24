# Admin Dispute Detail Dialog Scroll Basics (2026-03-24)

## Vấn đề

Ở trang `AdminDisputesPage`, modal `Chi tiết yêu cầu hoàn tiền` có thể chứa rất nhiều nội dung:

- danh sách field của refund
- ghi chú
- chứng cứ seller bàn giao
- chứng cứ buyer xác nhận đã nhận
- ảnh trong evidence

Khi nội dung cao hơn chiều cao màn hình, nếu `DialogContent` không có scroll dọc thì phần dưới sẽ bị cắt khỏi viewport. Người dùng nhìn thấy card ảnh ở cuối nhưng không thể kéo xuống để xem hết.

## File đã sửa

- `src/pages/admin/AdminDisputesPage.tsx`

## Cách sửa

Đổi modal detail từ:

- `className="max-w-3xl"`

thành:

- `className="max-h-[85vh] max-w-3xl overflow-y-auto"`

## Vì sao cách này đúng

- `max-h-[85vh]` giới hạn chiều cao modal theo viewport
- `overflow-y-auto` cho phép toàn bộ modal cuộn dọc khi nội dung dài

Nhờ vậy:

1. header modal vẫn nằm trong cùng khung
2. phần field chi tiết vẫn xem được
3. phần evidence ở cuối vẫn kéo xuống được để xem ảnh

## Bài học

Khi một dialog không chỉ là form ngắn mà còn chứa:

- timeline
- gallery
- nhiều section stacked

thì cần nghĩ ngay đến:

- giới hạn chiều cao theo viewport
- bật scroll dọc cho chính `DialogContent` hoặc một wrapper bên trong
