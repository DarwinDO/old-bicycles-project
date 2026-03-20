# Conversation List Filter Và Realtime Banner Basics - 2026-03-18

## Bài toán

Trang `MessagesPage` có 2 hiện tượng gây khó chịu:

1. Danh sách conversation hiện cả những cuộc trò chuyện chưa có tin nhắn nào.
2. Vừa mở trang chat là banner đỏ báo mất kết nối realtime xuất hiện ngay trong vài giây đầu.

## Vì sao conversation rỗng vẫn hiện

Backend `GET /api/conversations/me` đang trả về cả conversation đã được tạo từ trước, kể cả khi chưa có tin nhắn.

Điều này thường xảy ra khi:

- người dùng bấm `Chat mua bán`
- hệ thống tạo hoặc lấy conversation theo `productId`
- nhưng chưa ai gửi tin nhắn thật

Nếu FE render thẳng toàn bộ list đó, người dùng sẽ thấy:

- nhiều seller trông như đã từng chat
- nhưng preview lại là `Chưa có tin nhắn nào.`

UX này gây hiểu nhầm.

## Cách sửa

FE thêm helper:

- `shouldShowConversationInList(conversation, selectedId)`

Rule:

- nếu conversation đã có `lastMessage` thì hiện
- nếu chưa có `lastMessage` thì ẩn khỏi list
- ngoại lệ: nếu đó là conversation đang mở, vẫn cho hiện để người dùng vừa bấm `Chat mua bán` không bị mất mục đang chọn

## Vì sao banner đỏ hiện ngay lúc mới vào

Trong chat realtime có 2 trạng thái khác nhau:

1. `đang kết nối`
2. `đã kết nối xong rồi nhưng bị rớt`

Trước đây FE đang gộp cả 2 trường hợp đó vào một:

- cứ chưa `connected` là hiện lỗi `Kết nối realtime đang gián đoạn...`

Hậu quả:

- vừa vào trang, trong lúc socket đang handshake vài giây đầu
- FE đã hiểu nhầm là realtime bị lỗi
- banner đỏ nhảy lên dù thực ra chưa có lỗi thật

## Cách sửa

`ChatWindow.tsx` giờ dùng 2 mốc:

1. `hasConnectedRealtimeRef`
2. `INITIAL_CONNECTION_WARNING_DELAY_MS = 8000`

Luồng mới:

- lúc mới vào trang: chỉ hiện trạng thái nhỏ `Đang kết nối...`
- nếu kết nối thành công trước 8 giây: không hiện banner đỏ
- nếu đã từng kết nối rồi mà bị rớt: hiện banner đỏ ngay
- nếu chưa từng kết nối được và quá 8 giây vẫn chưa lên: mới hiện banner đỏ

## Luồng file

1. `MessagesPage.tsx`
- giữ `selectedConversation`
- render `ConversationList` và `ChatWindow`

2. `ConversationList.tsx`
- gọi `chatApi.getMine()`
- sort theo `updatedAt`
- lọc bớt conversation rỗng bằng `shouldShowConversationInList`

3. `ChatWindow.tsx`
- gọi REST để lấy lịch sử tin nhắn
- mở STOMP realtime
- chỉ hiện lỗi realtime khi thật sự cần

4. `chat-display.ts`
- chứa các helper thuần như preview, sort, filter

## Thuật ngữ cần nhớ

- `Conversation`: cuộc trò chuyện giữa buyer và seller, gắn với một sản phẩm.
- `lastMessage`: nội dung tin nhắn mới nhất để render preview trong list.
- `realtime`: dữ liệu được đẩy gần như ngay lập tức qua socket, không phải bấm refresh thủ công.
- `handshake`: bước mở đầu khi client và server đang thiết lập kết nối socket.
- `fallback`: đường dự phòng. Ở chat này, fallback là REST refetch khi realtime không đủ chắc.

## Kết luận

Mục tiêu không phải là giấu hoàn toàn conversation rỗng trong mọi trường hợp, mà là:

- đỡ làm danh sách bị nhiễu
- vẫn giữ được conversation đang mở
- và không làm người dùng thấy banner lỗi giả trong vài giây đầu
