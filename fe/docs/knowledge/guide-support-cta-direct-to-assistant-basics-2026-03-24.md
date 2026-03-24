# Guide support CTA direct to assistant basics - 2026-03-24

## Bối cảnh

Trang hướng dẫn trước đó có một nút `Chat với hỗ trợ`.

Nhưng ở phạm vi sản phẩm hiện tại, hướng hỗ trợ chính cho người dùng đã đăng nhập là `Trợ lý BikeExchange` tại route `/assistant`. Nếu vẫn để CTA cũ, người dùng sẽ nghĩ hệ thống có một kênh support chat riêng biệt, trong khi thực tế hướng hỗ trợ đang được gom về trợ lý AI mức 2.

## Thay đổi đã làm

- Đổi CTA cuối trang từ `Chat với hỗ trợ` sang `Mở Trợ lý`
- Nút mới điều hướng thẳng tới [ROUTES.ASSISTANT](/e:/Old_bicycle_system/old-bicycles-project/fe/src/constants/routes.ts)
- Cập nhật nội dung FAQ liên hệ hỗ trợ để giải thích đúng flow mới
- Rewrite sạch [GuidePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/GuidePage.tsx) vì file cũ có nhiều mojibake

## Luồng FE sau khi đổi

1. Người dùng mở route `/guide`
2. FE render `GuidePage`
3. Ở block cuối trang, người dùng bấm `Mở Trợ lý`
4. `Link` điều hướng tới `/assistant`
5. Router render `AssistantPage`
6. Từ đó người dùng có thể hỏi về order, listing, inspection, refund hoặc payout theo context thật của tài khoản đang đăng nhập

## Vì sao thay đổi này hợp lý

Thay đổi này giúp giao diện phản ánh đúng khả năng thật của hệ thống:

- không hứa một kênh support chat riêng nếu chưa có
- gom luồng hỗ trợ về đúng tính năng đã triển khai
- giảm nhầm lẫn giữa `chat người mua/người bán` và `trợ lý AI`

## Test đã thêm

[GuidePage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/GuidePage.test.tsx) kiểm tra:

- CTA hỗ trợ trỏ tới `/assistant`
- không còn text hành động cũ `Chat với hỗ trợ`
