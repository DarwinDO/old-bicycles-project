# FE Assessment - Current State

Date: 2026-03-18  
Scope: `old-bicycles-project/fe` frontend compared against `../../SRS-Old-Bicycles-Marketplace (1).md`

## Executive Summary

Frontend hiện đã vượt qua giai đoạn chỉ có giao diện mock. Các route chính cho guest, buyer, seller, admin, inspector đã có thật; lớp shared `src/api`, `src/types`, `AuthContext`, `ProtectedRoute`, payment/refund flow, chat realtime, admin moderation và admin dispute review cũng đã được nối với backend thật. Tuy vậy, FE vẫn **chưa đủ so với full SRS** vì một số màn mới chỉ có route nhưng chưa có dữ liệu thật, một số luồng vẫn thiếu bề rộng nghiệp vụ, và vài phần `Could/Should` vẫn trắng hoàn toàn.

### Fixed frontend progress assessment: **68%**

Con số này phản ánh mức độ sẵn sàng theo SRS, không phải chỉ là số lượng page.

## Scoring Method

Weighted feature score:

- `Must` = 5
- `Should` = 3
- `Could` = 1
- `Done` = 1.0
- `Partial` = 0.5
- `Missing` = 0.0

Raw feature score from the SRS matrix below: **66%**

Readiness adjustment: **+2 points**

Reason for adjustment:

- FE đã có shared API foundation, auth/session layer cơ bản, role guard, admin/user/report/category pages, payment/refund/admin dispute flow, và chat REST + STOMP thực sự.
- `npm run build` và targeted Vitest slices cho phần mới đều pass.
- Điểm không được cộng cao hơn vì vẫn còn nhiều page chỉ mới “có màn hình” chứ chưa đạt `Done` theo logic SRS.

Final assessed frontend progress: **68%**

## SRS Matrix

| SRS ID | Module | Priority | Status | Current FE | What blocks `Done` |
| --- | --- | --- | --- | --- | --- |
| `F-001` | User Authentication | Must | `Done` | FE đã có login, register, forgot/reset password, profile update, change password, `AuthContext`, session bootstrap, và role-based `ProtectedRoute`. | Social login là gap riêng của `FR-AUTH-003`, nhưng core auth scope của FE đã usable. |
| `F-002` | Bike Listing | Must | `Partial` | Seller có create/edit/list/hide/show/delete listing, form multipart, và seller dashboard/listings pages đã nối API thật. | Chưa có video upload/playback, chưa có seller-side `mark as sold` UI riêng, và moderation loop sau chỉnh sửa vẫn chưa được giải thích rõ trên UI. |
| `F-003` | Search & Filter | Must | `Done` | `BikeListingPage` đã dùng API thật với search, category/brand/condition/price/verified, pagination, grid/list toggle. | Basic search/filter scope đã usable cho buyer. |
| `F-004` | Advanced Filter | Must | `Partial` | FE đã hỗ trợ một phần filter kỹ thuật qua verified, price, brand, category, condition. | Thiếu filter cho `frameSize`, `wheelSize`, `brakeType`, `frameMaterial`, `groupset`, và `hasVideo` như SRS mô tả. |
| `F-005` | Bike Detail View | Must | `Partial` | `BikeDetailPage` đã có gallery, specs, inspection summary/report link, seller info, rating display, wishlist, chat CTA, order CTA. | Chưa có video/media depth, chưa gắn `ReportModal`, và một số copy/trạng thái vẫn cần polish thêm. |
| `F-006` | Messaging System | Must | `Done` | `MessagesPage`, `ConversationList`, `ChatWindow`, unread badge header, STOMP reconnect/resubscribe, REST history + realtime push đều đã nối thật. | Core realtime chat scope đã usable. |
| `F-007` | Wishlist | Should | `Done` | FE đã có wishlist page, toggle từ bike detail, remove item, và sync trạng thái khi đã đăng nhập. | Base wishlist scope đã usable. |
| `F-008` | Deposit & Order | Must | `Partial` | Buyer có thể tạo order từ bike detail, xem đơn mua, tạo payment request, xem QR/instructions, gửi refund. Seller có page quản lý đơn. Admin có page review refund/dispute. | Chưa có transaction log UI, chưa có post-completion dispute, và phần timeline/trạng thái vẫn còn có thể làm rõ hơn. |
| `F-009` | Seller Rating | Must | `Partial` | FE đã hiển thị review của seller trên bike detail. | Chưa có UI cho buyer submit review sau giao dịch và chưa có seller reply review. Tab review trong profile vẫn đang trống. |
| `F-010` | Inspection System | Should | `Partial` | FE đã có seller request inspection, bike detail hiển thị inspection report, inspector form để evaluate. | `InspectionRequestsPage` và `InspectionHistoryPage` vẫn là placeholder, chưa nối API thật. |
| `F-011` | Admin Dashboard | Must | `Partial` | FE đã có admin dashboard, users, listings, reports, categories/reference-data, disputes/refunds. | Chưa có groupset/size chart admin UI, một số admin page vẫn có mojibake từ merge cũ, và analytics depth còn mỏng. |
| `F-012` | Report System | Must | `Partial` | FE đã có `MyReportsPage`, admin reports page, và `ReportModal` component. | `ReportModal` hiện chưa được gắn thật vào bike detail hay user-facing flow, nên report submit chưa hoàn chỉnh end-to-end ở FE. |
| `F-013` | Notification System | Must | `Done` | FE đã có notification center, mark read, mark all read, unread count API, và unread badge trên header. | Core notification center scope đã usable. |
| `F-014` | Chatbot Support | Could | `Missing` | Không có UI module hay route cho chatbot. | Toàn bộ feature còn thiếu. |
| `F-015` | Logistics Integration | Could | `Missing` | Không có UI module hay flow vận chuyển. | Toàn bộ feature còn thiếu. |
| `F-016` | Online Payment | Could | `Partial` | FE đã render payment instructions/QR từ backend và có admin refund review flow. | Chưa có full gateway checkout flow, chưa có transaction history riêng, và chưa có logistics/payment combined UX như scope rộng hơn của SRS. |

## Main Findings

1. FE không còn là “UI mock” nữa. Các cụm auth, public marketplace, seller listing, order/payment/refund, chat realtime, notifications, admin moderation, admin users, và admin disputes đã có route + API thật.
2. Các gap lớn nhất của FE bây giờ không nằm ở chỗ “thiếu route”, mà nằm ở chỗ một số route vẫn còn placeholder hoặc chỉ mới nối được một nửa business flow.
3. Những page còn làm assessment bị hụt rõ nhất là:
   - `InspectionRequestsPage`
   - `InspectionHistoryPage`
   - review/reply flow
   - report submit integration thật
   - groupset / size chart admin UI
4. Một vài file merge từ branch cũ vẫn còn mojibake tiếng Việt. Đây không phải blocker chức năng chính, nhưng là quality gap thật.
5. FE đang bám backend contract khá tốt ở các điểm khó như:
   - order -> payment request -> webhook-driven status change
   - seller complete -> buyer confirm received
   - admin refund review
   - STOMP reconnect/resubscribe

## Readiness Gaps By FE Layer

| Layer | Status | Assessment |
| --- | --- | --- |
| Routing | `Partial` | Route breadth đã khá đầy đủ, nhưng không phải route nào cũng gắn data thật. |
| Shared API layer | `Done` | `src/api`, `src/types`, `http`, auth/session layer, và STOMP wrapper đã có nền dùng chung. |
| State and auth | `Partial` | `AuthContext` và `ProtectedRoute` usable, nhưng social login và một số role-dependent UX vẫn còn thiếu. |
| Admin UX breadth | `Partial` | Đã có dashboard/users/listings/reports/categories/disputes, nhưng chưa đủ full SRS breadth cho master data. |
| Seller / buyer business UX | `Partial` | Order/payment/refund đã usable, nhưng review/reply, mark-sold clarity, và transaction history vẫn thiếu. |
| Inspector UX | `Partial` | Có form evaluate, nhưng requests/history chưa live. |

## Recommended Next FE Tranche

### Milestone 1 - Reach ~71%

- Nối thật `InspectionRequestsPage` và `InspectionHistoryPage`.
- Gắn `ReportModal` vào `BikeDetailPage` và các entry point user-facing phù hợp.
- Dọn mojibake ở các admin pages vừa merge.

### Milestone 2 - Reach ~74%

- Làm buyer submit review UI.
- Làm seller reply review UI.
- Mở rộng advanced filter UI cho `frameSize`, `wheelSize`, `brakeType`, `frameMaterial`, `groupset`.

### Milestone 3 - Reach ~77%

- Thêm groupset / size chart admin UI.
- Nếu product direction cần, mở rộng payment UX và transaction history riêng.
- Làm social login UI khi backend contract được chốt rõ hơn.
