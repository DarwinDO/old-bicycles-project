# FE Assessment - Current State

Date: 2026-03-24  
Scope: `old-bicycles-project/fe` frontend compared against `../../SRS-Old-Bicycles-Marketplace (1).md`

## Executive Summary

Frontend hiện không còn là bộ màn hình mock rời rạc. Các cụm guest, buyer, seller, admin, inspector đều đã có route thật, state/auth thật, API thật, và nhiều luồng đã đi qua smoke runtime:

- auth và role guard
- public marketplace + bike detail
- seller listing management
- admin moderation + disputes + master data
- inspector queue/history/form
- order/payment/refund/payout manual
- chat realtime
- buyer review + seller reply
- order evidence
- groupset + size chart UI

Điểm FE vẫn chưa đạt full SRS là video/media depth, chatbot, logistics, payment timeout UX, và một đợt quality polish cuối cho các file legacy còn dính mojibake/copy inconsistency.

### Current frontend readiness: **77%**

Con số này phản ánh mức độ usable theo SRS và runtime hiện tại, không chỉ là số lượng route.

## Assessment Method

Weighted feature score:

- `Must` = 5
- `Should` = 3
- `Could` = 1
- `Done` = 1.0
- `Partial` = 0.5
- `Missing` = 0.0

Estimated raw feature score from the matrix below: **72%**

Readiness adjustment: **+5 points**

Reason for adjustment:

- FE đã có shared API/types/auth foundation ổn định
- nhiều flow đã được live-smoke chứ không còn chỉ pass build/test
- admin/seller/buyer/inspector UIs hiện đã bám backend contract tốt hơn nhiều so với assessment cũ

Final assessed frontend progress: **77%**

## SRS Matrix

| SRS ID | Module | Priority | Status | Current FE | What blocks `Done` |
| --- | --- | --- | --- | --- | --- |
| `F-001` | User Authentication | Must | `Done` | Login, register, forgot/reset password, profile update, change password, role guards, auth bootstrap đều usable. | Core scope đủ. |
| `F-002` | Bike Listing | Must | `Partial` | Seller create/edit/list/hide/show/delete flow đã usable, route giữa landing và seller dashboard đã được làm rõ, groupset select đã nối thật. | Video/media depth chưa có, một số copy/UX legacy còn cần polish. |
| `F-003` | Search & Filter | Must | `Done` | Marketplace search/filter/pagination/grid-list toggle đều dùng API thật. | Core scope đủ. |
| `F-004` | Advanced Filter | Must | `Partial` | FE đã hỗ trợ verified, province, frame size, wheel size, brake/frame material gián tiếp qua data, và groupset filter đã có. | Chưa có full filter UX cho mọi trường kỹ thuật và chưa có `hasVideo`. |
| `F-005` | Bike Detail View | Must | `Partial` | Bike detail đã có gallery, specs, inspection block, rating block, wishlist, chat CTA, order CTA, groupset hiển thị, size guidance theo category. | Video/media/report flow còn thiếu chiều sâu, và còn một ít legacy text cần dọn. |
| `F-006` | Messaging System | Must | `Done` | Conversation list, message history, realtime STOMP, unread badge, reconnect handling đều đã usable. | Core scope đủ. |
| `F-007` | Wishlist | Should | `Done` | Wishlist page và toggle từ bike detail đã usable. | Scope đủ. |
| `F-008` | Deposit & Order | Must | `Partial` | Buyer có create order, payment instructions, refund request, payout profile; seller có order management; admin có dispute/refund review; evidence dialogs đã có. | Chưa có timeout/expiry UX, transaction log riêng, và một số state copy vẫn có thể polish thêm. |
| `F-009` | Seller Rating | Must | `Done` | Buyer submit review dialog và seller reply review UI đã usable; bike detail hiển thị review + reply. | Core scope đủ. |
| `F-010` | Inspection System | Must | `Done` | Inspector requests/history/form đã live, seller nhìn được trạng thái kiểm định đúng business rule, admin send-to-inspection flow đã nối thật. | Core scope đủ cho MVP hiện tại. |
| `F-011` | Admin Dashboard | Must | `Partial` | Admin có dashboard, users, listings, disputes, reports, categories/master data, groupset CRUD, size chart CRUD. | Analytics depth và quality polish cho vài màn legacy vẫn còn thiếu. |
| `F-012` | Report System | Must | `Partial` | Admin reports page và user-side reports page đã có. | User-facing submit/report entry points vẫn chưa được nối đẹp và đủ sâu ở FE. |
| `F-013` | Notification System | Must | `Done` | Notification center, unread count thật, badge sync theo account, mark read/mark all đều usable. | Core scope đủ. |
| `F-014` | Chatbot Support | Could | `Missing` | Chưa có assistant UI hay route. | Toàn bộ feature còn thiếu. |
| `F-015` | Logistics Integration | Could | `Missing` | Chưa có logistics UI. | Toàn bộ feature còn thiếu. |
| `F-016` | Online Payment | Could | `Partial` | FE đã render QR/instructions, admin refund review, payout profile, admin payout list, payment result states. | Chưa có timeout/expiry UX, VA-first path, transaction history riêng, và payout automation UI. |

## Readiness By FE Layer

| Layer | Status | Assessment |
| --- | --- | --- |
| Routing | `Partial` | Route coverage đã rộng và thực hơn trước rất nhiều. Vẫn cần một vòng polish cho vài route legacy và back-navigation consistency. |
| Shared API layer | `Done` | `src/api`, `src/types`, `http`, auth/session, STOMP wrapper đang là nền tảng đủ tốt để tiếp tục mở rộng. |
| State and auth | `Partial` | Auth/role guard ổn, unread count và session bootstrap tốt hơn trước. Chưa có assistant state và vài edge cases payment timeout. |
| Admin UX breadth | `Partial` | Đã có listings, disputes, reports, users, groupset, size chart. Cần polish analytics/depth hơn là thêm breadth. |
| Seller / buyer business UX | `Partial` | Listing/order/payment/refund/review/evidence đều đã usable. Gaps lớn còn lại là timeout UX và quality polish. |
| Inspector UX | `Done` | Requests/history/evaluate/report upload hiện đã usable theo flow mới. |

## Main Findings

1. FE hiện đã có đủ UI để demo marketplace end-to-end thay vì chỉ demo isolated pages.
2. Những gap lớn nhất hiện tại là quality/stabilization, không còn là “thiếu route” như assessment cũ.
3. Review/reply, order evidence, groupset và size chart là bốn phần làm FE tiến rõ nhất so với assessment trước.
4. Notification badge và chat layout đã bớt “demo feel” hơn trước, nhưng vẫn cần một vòng polish cuối ở các file legacy.
5. Payment/refund/payout ở FE đã usable cho manual-audit model; bước tiếp theo hợp lý là timeout/expiry UX chứ không phải mở rộng thêm breadth ngẫu nhiên.

## Recommended Next Milestones

### Milestone 1 - Stabilization

- Refresh assessment docs và dọn remaining mojibake/copy inconsistency.
- Rà lại UX cuối cho payment/order/chat/admin legacy screens.
- Chạy smoke end-to-end cuối cho các flow chính.

### Milestone 2 - Payment Timeout / Expiry UX

- Hiển thị countdown/hạn thanh toán rõ hơn
- Auto-update trạng thái order khi quá hạn
- Thể hiện “đã hết hạn thanh toán” và `late payment/manual review` rõ trên UI

### Milestone 3 - Chatbot Level 2

- Thêm assistant page/widget
- Gửi câu hỏi về Spring Boot assistant API
- Hiển thị câu trả lời có context theo listing/order/inspection/refund/payout

## Deferred From Current MVP

- Video upload/playback/filtering depth
- Logistics integration
- Chatbot beyond level 2
- Payment VA-first path và payout automation thật
