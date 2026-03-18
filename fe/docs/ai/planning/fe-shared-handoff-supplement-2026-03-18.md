---
phase: planning
title: FE Shared Handoff Supplement
description: Supplementary handoff note for shared unread badge logic and cross-dev safety after Dev 1 follow-up
---

# FE Shared Handoff Supplement - 2026-03-18

## Shared layer mới được thêm

Lead đã thêm 2 phần shared mới:

- [AppHeader.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/layouts/AppHeader.tsx)
- [chat-unread.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/chat-unread.ts)

Mục tiêu:

- hiện unread badge chat toàn cục ở header
- không buộc backend phải đổi contract ngay
- không để Dev 2 và Dev 3 tự viết nhiều cơ chế unread khác nhau

## Rule làm việc cho Dev 2 và Dev 3

1. Không tự tạo unread badge chat khác ở layout khác.
2. Nếu đụng `AppHeader.tsx`, phải giữ logic clear badge khi vào `/messages`.
3. Nếu đụng `BikeDetailPage`, phải giữ query `?productId=...`.
4. Nếu đụng `ProfilePage`, phải giữ query `?tab=orders`.
5. Nếu render trạng thái order, phải hiểu:
   - `awaiting_buyer_confirmation`
   - `completed`

## Tại sao phần này được xem là shared?

Vì nó nằm ở:

- layout toàn cục
- storage helper dùng chung
- semantics điều hướng giữa nhiều page

Nên Dev 2 và Dev 3 chỉ nên dùng lại, không nên tự viết phiên bản khác.
