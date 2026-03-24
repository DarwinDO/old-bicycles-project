# Home image fallback, notification unread, và chat width: giải thích cho người mới

## 1. Vì sao landing page trông như đang dùng mock data?

Ở FE này, landing page và marketplace đã gọi API thật từ backend:

- `HomePage.tsx` gọi `productsApi.search(...)`
- `BikeListingPage.tsx` gọi `productsApi.search(...)`

Nhưng trước bản sửa này, khi product không có ảnh thật, UI lại fallback sang ảnh stock từ bên ngoài. Điều đó làm người xem có cảm giác:

- card giống dữ liệu mẫu
- ảnh và dữ liệu thật không khớp nhau

Sau bản sửa:

- nếu product chưa có ảnh, UI hiện placeholder trung tính
- không dùng ảnh stock để “lấp chỗ trống” nữa

Điều này giúp người dùng hiểu đúng hơn:

- dữ liệu đang là dữ liệu thật
- chỉ là listing đó chưa có ảnh hợp lệ

## 2. Vì sao badge thông báo có thể hiện sai số khi đổi account?

Hook `useNotificationUnreadCount()` có nhiệm vụ:

- lấy số thông báo chưa đọc
- poll định kỳ
- refresh khi focus lại cửa sổ

Vấn đề trước bản sửa là dependency của effect chưa bám theo `user.id`.

Hậu quả:

- nếu cùng một browser session đổi từ account A sang account B
- badge unread có thể giữ tạm số cũ của account A

Sau bản sửa:

- effect reset count về `0` ngay khi user thay đổi
- rồi fetch lại unread count cho đúng account mới

Vì vậy badge không còn dễ bị “dính số cũ” giữa các account nữa.

## 3. Vì sao khung chat nhìn quá rộng và rỗng?

Trang chat có 2 cột:

- danh sách conversation
- khung hội thoại đang mở

Trước bản sửa, vùng header product, message list, và composer có chiều rộng khá lớn. Khi số message ít, phần giữa nhìn bị:

- trống nhiều
- bubble nằm quá xa nhau
- input ở đáy nhìn dài bất thường

Sau bản sửa:

- phần nội dung chat được giới hạn trong `max-w-3xl`
- product header, message list, và composer dùng cùng chiều rộng logic
- bubble message cũng giảm `max-width`

Kết quả:

- layout cân hơn
- hội thoại ít tin nhắn vẫn nhìn “đầy” hơn
- input và bubble không còn bị kéo ngang quá mức

## 4. Những file chính liên quan

- `src/pages/HomePage.tsx`
- `src/pages/BikeListingPage.tsx`
- `src/lib/use-notification-unread-count.ts`
- `src/lib/use-notification-unread-count.test.ts`
- `src/components/messages/ChatWindow.tsx`

## 5. Chốt ngắn

Slice này không đổi business rule hay API contract.

Nó chủ yếu sửa 3 cảm giác sai ở FE:

- dữ liệu thật nhưng nhìn giống mock
- badge unread dễ giữ số cũ khi đổi account
- khung chat quá rộng nên nhìn bất thường
