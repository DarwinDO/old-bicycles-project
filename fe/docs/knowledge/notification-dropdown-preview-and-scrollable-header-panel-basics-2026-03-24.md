# Notification Dropdown Preview, Scrollable Panel, Và Time Skew Basics

## Mục tiêu

Phần thông báo ở frontend có hai nhiệm vụ khác nhau:

1. Cho người dùng xem nhanh vài thông báo mới nhất ngay trong header.
2. Hiển thị thời gian của từng thông báo theo cách dễ hiểu như `Vừa xong`, `19 phút trước`, `2 ngày trước`.

Bug vừa sửa là một ví dụ rất điển hình: nếu timestamp backend bị lệch múi giờ và rơi vào tương lai, frontend cũ vẫn coi nó là `Vừa xong`. Khi đó người dùng thấy thông báo cũ cứ bám ở đầu danh sách.

## File chính

- `src/components/notifications/NotificationBellButton.tsx`
- `src/components/notifications/NotificationDropdown.tsx`
- `src/pages/NotificationsPage.tsx`
- `src/lib/notification-time.ts`
- `src/layouts/AppHeader.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/layouts/SellerLayout.tsx`
- `src/layouts/InspectorLayout.tsx`

## Luồng FE hiện tại

### 1. User action

Người dùng bấm icon chuông ở header.

### 2. Component mở dropdown

`NotificationDropdown.tsx` dùng Radix `DropdownMenu`.

- `NotificationBellButton` là nút trigger
- `DropdownMenuContent` là panel xổ xuống

### 3. Fetch dữ liệu

Khi dropdown mở, component gọi:

- `notificationsApi.getMine(0, 8)`

Điều này chỉ lấy 8 thông báo gần nhất để preview nhanh.

### 4. Hiển thị thời gian

Cả dropdown và trang `/notifications` đều dùng chung helper:

- `src/lib/notification-time.ts`

Luồng chạy là:

1. component nhận `notification.createdAt`
2. gọi `formatNotificationRelativeTime(createdAt)`
3. helper parse timestamp
4. helper quyết định trả về:
   - `Vừa xong`
   - `x phút trước`
   - `x giờ trước`
   - `x ngày trước`
   - hoặc ngày/giờ tuyệt đối

### 5. Guard cho timestamp tương lai

Đây là phần quan trọng của bug fix.

Nếu `createdAt` nằm trong tương lai hơn hiện tại quá 1 phút, helper **không còn** trả `Vừa xong`.

Thay vào đó, helper trả về ngày giờ tuyệt đối. Cách này giúp:

- không đánh lừa người dùng rằng một bản ghi cũ là “mới xong”
- lộ rõ dấu hiệu lệch múi giờ để dễ debug
- tránh che bug backend bằng một nhãn thời gian sai

## Vì sao bug này làm thông báo cũ chiếm slot đầu

Frontend không tự sort lại danh sách notification preview.

Nó hiển thị theo đúng thứ tự backend trả về. Vì vậy nếu backend lưu `createdAt` lớn hơn thời gian thật, bản ghi đó sẽ:

1. bị sort lên đầu ở backend
2. hiện ở 2 slot đầu của dropdown
3. đồng thời bị formatter cũ gắn nhãn `Vừa xong`

Kết quả là người dùng thấy “thông báo cũ nhưng cứ đứng đầu”.

## Bài học cần nhớ

### `timestamp` và `timezone` không phải là một

Một chuỗi ngày giờ chỉ có ích khi ta biết nó thuộc múi giờ nào.

Ví dụ:

- `2026-03-25 11:54:00` chỉ là giờ tường
- `2026-03-25T11:54:00Z` mới nói rõ đây là UTC

Nếu backend và frontend hiểu khác nhau về múi giờ, giao diện sẽ hiển thị sai ngay.

### Helper hiển thị thời gian nên có fallback an toàn

Đừng giả định mọi timestamp đều hợp lệ và luôn ở quá khứ.

Một helper UI tốt nên xử lý được:

- timestamp hợp lệ
- timestamp lỗi
- timestamp trong tương lai do clock skew hoặc timezone skew

## Ví dụ ngắn

### Trước khi sửa

- backend trả một timestamp bị lệch sang tương lai
- helper thấy `diff < 1 phút`
- UI hiện `Vừa xong`

### Sau khi sửa

- backend vẫn có thể trả timestamp lỗi trong lúc chưa deploy fix
- helper nhận ra timestamp đang ở tương lai
- UI hiện ngày giờ tuyệt đối thay vì `Vừa xong`

## Liên hệ với backend

Bug này chỉ được giải quyết triệt để khi backend lưu notification timestamp theo UTC một cách nhất quán.

Frontend chỉ đóng vai trò:

- không hiển thị sai quá rõ
- giúp người dùng và lập trình viên nhận ra dữ liệu đang lệch

Backend mới là nơi quyết định thứ tự thật của danh sách notification.
