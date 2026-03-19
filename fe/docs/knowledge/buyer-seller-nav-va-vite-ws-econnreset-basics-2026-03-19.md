# Buyer thấy mục bán xe và lỗi `ECONNRESET` của Vite: giải thích cho người mới học

## 1. Vấn đề là gì?

Trong FE có 2 hiện tượng dễ gây hiểu nhầm:

1. Buyer đã đăng nhập nhưng vẫn thấy:

- `Bán xe`
- `Đăng tin`

2. Ở terminal chạy `localhost:5173`, Vite báo:

```text
[vite] ws proxy error:
Error: read ECONNRESET
```

Nhìn bề ngoài, 2 lỗi này có vẻ không liên quan nhau. Nhưng cả hai đều là lỗi của **luồng FE**, không phải lỗi dữ liệu của business chính.

## 2. Vì sao buyer vẫn thấy `Bán xe` và `Đăng tin`?

Vì trước khi sửa:

- router đã chặn đúng:
  - route `/sell` chỉ cho `seller`
- nhưng header lại render menu theo kiểu cố định

Nói đơn giản:

- **quyền truy cập thật** đã được chặn
- nhưng **UI hiển thị** chưa chặn

Cho nên buyer vẫn nhìn thấy nút seller, dù bấm vào thì cuối cùng không được vào đúng trang đó.

Đây là một lỗi thường gặp trong frontend:

- phần `route guard`
- và phần `navigation UI`

không đồng bộ với nhau.

## 3. Đã sửa như thế nào?

Tôi tách rule hiển thị seller entry ra thành file riêng:

- [app-header-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/app-header-visibility.ts)

Rule mới:

- guest: vẫn thấy `Bán xe` và `Đăng tin`
- seller: thấy `Bán xe` và `Đăng tin`
- buyer/admin/inspector: không thấy 2 mục này

Header áp dụng rule đó ở:

- [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx)

Tức là bây giờ:

- UI và route guard đã khớp nhau hơn

## 4. `ECONNRESET` là gì?

`ECONNRESET` có thể hiểu đơn giản là:

- kết nối mạng đang mở thì bị đầu bên kia đóng ngang

Trong case này, đầu bên kia thường là:

- backend WebSocket/SockJS
- hoặc lớp proxy của Vite

Nó không luôn luôn có nghĩa là:

- backend sập
- app hỏng
- dữ liệu mất

Nhiều khi nó chỉ có nghĩa là:

- socket cũ bị đóng
- client reconnect
- proxy đang giữ một kết nối cũ rồi bị reset

## 5. Vì sao Vite lại hay hiện lỗi này?

Trước khi sửa, chat client dùng:

- `window.location.origin`

để tạo SockJS URL khi chạy local.

Vì FE đang chạy ở:

- `http://localhost:5173`

nên socket sẽ đi qua:

- Vite proxy `/ws`

Luồng lúc đó là:

```text
Browser -> Vite dev server -> proxy /ws -> Spring Boot
```

Khi SockJS reconnect hoặc backend đóng kết nối cũ, Vite thường log ra:

- `ws proxy error`
- `ECONNRESET`

Nghĩa là terminal của FE bị ồn, dù business chat vẫn có thể hoạt động.

## 6. Đã sửa như thế nào?

Tôi sửa file:

- [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts)

Logic mới:

1. nếu có `VITE_WS_BASE_URL` thì dùng nó
2. nếu có `VITE_API_BASE_URL` thì bỏ `/api` để ra base socket
3. nếu đang chạy local dev thì ưu tiên:
   - `VITE_DEV_PROXY_TARGET`
   - nếu không có thì dùng mặc định `http://localhost:8080`

Kết quả là trong môi trường dev, chat socket sẽ ưu tiên đi thẳng tới backend:

```text
Browser -> Spring Boot
```

thay vì:

```text
Browser -> Vite proxy -> Spring Boot
```

Nhờ vậy:

- giảm log `ECONNRESET` ở terminal Vite
- bớt một lớp trung gian

## 7. Luồng file FE của bản sửa này

### Phần menu role-based

1. User login
2. [AuthContext.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/contexts/AuthContext.tsx) giữ thông tin `user.role`
3. [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx) đọc `user.role`
4. [app-header-visibility.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/app-header-visibility.ts) quyết định có hiện menu seller hay không
5. Header render lại đúng theo role

### Phần WebSocket dev

1. User mở header hoặc trang chat
2. [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx) hoặc [ChatWindow.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/messages/ChatWindow.tsx) gọi `createChatSocketClient(...)`
3. [chat.stomp.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.ts) tính `socketBaseUrl`
4. SockJS nối trực tiếp tới backend local nếu đang dev
5. Vite không còn phải proxy `/ws` cho case local đó nữa

## 8. Test đã thêm

Tôi đã thêm regression test:

- [app-header-visibility.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/app-header-visibility.test.ts)
- [chat.stomp.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/sockets/chat.stomp.test.ts)

Ý nghĩa:

- về sau nếu buyer lại nhìn thấy menu seller, test sẽ bắt được
- nếu logic socket base URL dev bị đổi sai, test cũng sẽ bắt được

## 9. Chốt ngắn

- Buyer thấy `Bán xe` trước đó là lỗi UI role-gating, không phải lỗi route guard
- `ECONNRESET` của Vite thường là log của proxy WebSocket bị reset, không nhất thiết là lỗi business
- Bản sửa mới làm:
  - menu seller chỉ hiện đúng role
  - socket dev ưu tiên nối thẳng backend để giảm noise ở terminal
