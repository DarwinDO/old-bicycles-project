# Seller Create Route, Notification Badge, Payout Bank Select Và Chat Layout

## 1. Bối cảnh của tranche này

Trong FE có một nhóm lỗi nhìn nhỏ nhưng làm trải nghiệm bị lệch:

- seller bấm `Đăng tin` ở dashboard lại bị đưa sang form public, trong khi `Chỉnh sửa tin` thì vẫn nằm trong seller dashboard
- badge chuông thông báo hiện số cứng như `3` thay vì số chưa đọc thật
- form `Nhận tiền` bắt người dùng tự nhập `Bank BIN`, trong khi phần lớn người dùng không biết mã này là gì
- ô chat nhìn bị trôi, không giống kiểu chat quen thuộc
- admin mở chi tiết tin từ màn duyệt tin nhưng không có đường quay lại đúng ngữ cảnh

Các lỗi này không phải là lỗi thuật toán phức tạp, nhưng lại thuộc nhóm **flow inconsistency**.

`Flow inconsistency` nghĩa là:

- người dùng đang đi trong một luồng nào đó
- nhưng một nút bấm lại đẩy họ sang luồng khác
- hoặc giao diện ở hai màn có ý nghĩa tương tự nhưng hành vi khác nhau

Loại lỗi này rất dễ làm người dùng thấy “hệ thống không chắc tay”.

---

## 2. `Route` seller tạo tin vì sao phải tách riêng?

### Trước khi sửa

FE có 2 ngữ cảnh:

- ngữ cảnh public ở landing / marketplace
- ngữ cảnh seller dashboard

Nhưng nút `Đăng tin` ở một số chỗ vẫn dẫn về:

- `/sell`

Đây là route public.

Trong khi seller dashboard đã có route riêng:

- `/seller/listings/new`

Điều đó tạo ra cảm giác:

- đang ở dashboard seller
- bấm tạo tin mới
- nhưng lại bị đẩy ra luồng public

### Sau khi sửa

Seller đã đăng nhập và đang đi theo luồng seller sẽ được ưu tiên vào:

- `/seller/listings/new`

Guest hoặc user không phải seller vẫn đi vào:

- `/sell`

### File liên quan

- [routes.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/constants/routes.ts)
- [app-header-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/app-header-visibility.ts)
- [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx)
- [SellerListingsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerListingsPage.tsx)
- [SellerListingsSection.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/SellerListingsSection.tsx)
- [SellBikePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/SellBikePage.tsx)

### Luồng FE

1. User bấm `Đăng tin`
2. FE đọc role hiện tại từ `AuthContext`
3. `app-header-visibility.ts` quyết định route nào phù hợp
4. React Router mở đúng page create listing
5. Nếu là seller dashboard flow, nút quay lại cũng đưa về đúng danh sách seller

---

## 3. Vì sao badge thông báo không nên hiện số cứng?

### Trước khi sửa

Một số layout dùng số cứng như:

- `2`
- `3`

Điều này chỉ phù hợp lúc mock UI.

Khi đã tích hợp API, badge phải phản ánh dữ liệu thật.

### Sau khi sửa

FE dùng hook:

- [use-notification-unread-count.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/use-notification-unread-count.ts)

và component dùng chung:

- [NotificationBellButton.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/notifications/NotificationBellButton.tsx)

Các layout đang dùng chung badge thật:

- [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx)
- [SellerLayout.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/SellerLayout.tsx)
- [AdminLayout.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AdminLayout.tsx)
- [InspectorLayout.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/InspectorLayout.tsx)

### Luồng FE

1. Layout mount
2. Hook `useNotificationUnreadCount()` chạy
3. Hook gọi `notificationsApi.getUnreadCount()`
4. Backend trả về số chưa đọc
5. Hook lưu vào state `unreadCount`
6. Badge rerender với số thật
7. Khi user đọc thông báo ở [NotificationsPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/NotificationsPage.tsx), FE phát event `NOTIFICATIONS_UPDATED_EVENT`
8. Các layout đang mở nghe event đó và refresh count

### Thuật ngữ cần nhớ

`Hook`:

- là hàm đặc biệt của React
- dùng để quản lý state, effect, data flow

`Rerender`:

- là lúc React vẽ lại giao diện sau khi state đổi

---

## 4. Vì sao không nên bắt user nhập `Bank BIN`?

### `Bank BIN` là gì?

`BIN` là một mã số ngắn để nhận diện ngân hàng.

Ví dụ:

- TPBank có BIN riêng
- MB Bank có BIN riêng

Đây là thông tin tốt cho hệ thống xử lý nội bộ, nhưng không thân thiện với user phổ thông.

### Cách tốt hơn

Người dùng nên chỉ cần:

- chọn ngân hàng
- nhập số tài khoản
- nhập tên chủ tài khoản

FE sẽ tự map:

- `bankCode`
- `bankBin`

### File liên quan

- [vietnamese-banks.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/vietnamese-banks.ts)
- [PayoutProfileSection.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/PayoutProfileSection.tsx)

### Luồng FE

1. User mở tab `Nhận tiền`
2. FE gọi `payoutsApi.getMyProfile()`
3. Nếu profile cũ có `bankCode` hoặc `bankBin`, FE dò lại trong danh sách bank nội bộ
4. FE đổ select `Ngân hàng`
5. Khi user chọn ngân hàng, FE tự điền `bankCode` và `bankBin` vào form state
6. Khi bấm lưu, FE vẫn gửi đủ dữ liệu backend cần, nhưng user không phải tự biết BIN

---

## 5. Vì sao chat nhìn “bất thường”?

Trong ảnh lỗi, vùng chat có ít tin nhắn nhưng bong bóng chat lại trôi lơ lửng ở giữa hoặc phía trên, làm phần dưới bị trống nhiều.

### Nguyên nhân

Container chat chưa neo nội dung xuống đáy như các ứng dụng chat quen thuộc.

### Sau khi sửa

Ở [ChatWindow.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/messages/ChatWindow.tsx):

- khi đã có tin nhắn, wrapper của message list dùng `min-h-full` và `justify-end`
- vùng composer vẫn bám cuối màn hình chat

Ở [MessagesPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/messages/MessagesPage.tsx):

- các cột chat được thêm `min-h-0`
- giúp flex layout và scroll area tính chiều cao ổn định hơn

### Luồng FE

1. User mở trang chat
2. `MessagesPage` chia layout thành danh sách conversation và `ChatWindow`
3. `ChatWindow` load message
4. Nếu có tin nhắn, wrapper message list tự căn xuống đáy
5. User thấy cảm giác giống chat app hơn

---

## 6. Admin xem detail tin đăng và quay lại đúng ngữ cảnh

Admin từ màn duyệt tin bấm `Xem chi tiết` nhưng page detail gốc vốn được thiết kế như trang public của buyer.

Nếu không sửa:

- breadcrumb sẽ luôn ghi `Mua xe`
- nút quay lại cũng chỉ quay chung chung

Sau khi sửa ở [BikeDetailPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.tsx):

- nếu user hiện tại là `admin`
- page sẽ đổi breadcrumb sang `Duyệt tin đăng`
- có nút `Quay lại duyệt tin đăng`
- error state cũng quay về đúng `admin listings`

---

## 7. Một điểm rất dễ hiểu nhầm: seller thấy “đang bán” nhưng buyer không thấy ngoài marketplace

Đây không còn là bug đơn giản của market page nữa.

Marketplace public bây giờ chỉ hiển thị khi sản phẩm:

- đủ điều kiện public
- có inspection hợp lệ
- không bị khóa do đang có giao dịch

Trong khi seller vẫn có thể thấy listing của mình trong dashboard với trạng thái nghiệp vụ rộng hơn.

Cho nên một listing có thể:

- seller còn nhìn thấy
- nhưng buyer không thấy ngoài `Mua xe`

Vì vậy FE seller phải hiển thị đúng ý nghĩa:

- `Đang hiển thị công khai`
- `Tạm khóa do đang có giao dịch`
- `Chưa đủ điều kiện hiển thị công khai`

chứ không thể chỉ nhìn `status = active` rồi viết thành `Đang bán`.

File chính:

- [seller-listing-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/seller-listing-visibility.ts)

---

## 8. Chốt ngắn

Tranche này chủ yếu là sửa **tính nhất quán của luồng FE**:

- seller đi seller route thật, không bị quăng sang public route
- notification badge lấy dữ liệu thật
- payout profile không bắt user nhập thông tin kỹ thuật khó hiểu
- chat nhìn đúng cảm giác của app chat hơn
- admin xem detail có đường quay lại đúng ngữ cảnh

Đây là dạng cải tiến không phải “feature lớn”, nhưng rất quan trọng vì nó làm sản phẩm bớt cảm giác chắp vá và đáng tin hơn khi demo hoặc nghiệm thu.
