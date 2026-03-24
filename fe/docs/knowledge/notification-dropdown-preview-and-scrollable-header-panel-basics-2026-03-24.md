# Notification Dropdown Preview And Scrollable Header Panel Basics

## Mục tiêu

Đổi trải nghiệm xem thông báo từ kiểu "bấm chuông rồi sang trang mới ngay" sang kiểu:

1. bấm chuông ở header
2. mở dropdown nhỏ
3. kéo scrollbar để xem nhanh vài thông báo gần nhất
4. nếu cần mới bấm vào trang `/notifications` để xem đầy đủ

## File chính

- `src/components/notifications/NotificationBellButton.tsx`
- `src/components/notifications/NotificationDropdown.tsx`
- `src/pages/NotificationsPage.tsx`
- `src/lib/notification-time.ts`
- `src/layouts/AppHeader.tsx`
- `src/layouts/AdminLayout.tsx`
- `src/layouts/SellerLayout.tsx`
- `src/layouts/InspectorLayout.tsx`

## Luồng FE sau khi đổi

### 1. User action

Người dùng bấm vào icon chuông trên header hoặc dashboard header.

### 2. Component mở dropdown

`NotificationDropdown.tsx` dùng Radix `DropdownMenu`.

- `NotificationBellButton` chỉ đóng vai trò trigger
- `DropdownMenuContent` là panel sổ xuống

### 3. Fetch dữ liệu

Khi dropdown `open = true`, component gọi:

- `notificationsApi.getMine(0, 8)`

Nghĩa là panel chỉ lấy 8 thông báo gần nhất để preview nhanh.

### 4. Scrollable preview

Danh sách nằm trong:

- `div.max-h-96.overflow-y-auto`

Nên khi danh sách dài hơn chiều cao panel, user kéo scrollbar ngay trong dropdown thay vì bị điều hướng sang trang khác.

### 5. Mark as read

Dropdown cho phép:

- bấm từng item để `markAsRead`
- bấm `Đọc hết` để `markAllAsRead`

Sau khi update, component phát:

- `emitNotificationsUpdated()`

để badge unread ở các layout được refresh đồng bộ.

### 6. Full page fallback

Trang `NotificationsPage.tsx` vẫn giữ lại.

Nó là nơi xem:

- danh sách dài hơn
- phân trang
- lịch sử đầy đủ

Dropdown chỉ là lớp preview nhanh trên header.

## Vì sao cần tách helper thời gian riêng

Trước đó phần format thời gian nằm riêng trong page notifications. Dropdown mới cũng cần logic này, nên code được gom vào:

- `src/lib/notification-time.ts`

Lợi ích:

- không lặp code
- sửa text "vừa xong / phút trước / giờ trước" ở một nơi
- page và dropdown hiển thị cùng một cách

## Ghi chú UX

- Chuông thông báo bây giờ có `aria-label="Mở thông báo"` để dễ test và dễ dùng hơn với screen reader.
- Route `/notifications` không bị xóa; chỉ đổi entry mặc định từ bell icon sang dropdown preview.
