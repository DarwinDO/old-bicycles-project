---
title: Dev merge platform fee UI fix message error basics
date: 2026-03-27
---

# Dev merge platform fee UI fix message error basics

## Bối cảnh

Trong lần này, nhánh `dev` của FE cần nhận ba nhánh:

- `feat/platform-fee-impl`
- `UI-fix`
- `fix/message_error`

Đây là một bài toán merge branch, tức là ghép lịch sử commit của nhiều nhánh vào cùng một nhánh đích.

Nếu merge theo thứ tự không hợp lý, conflict có thể xuất hiện ở nhiều file hơn mức cần thiết.

## Phạm vi từng nhánh

### 1. `feat/platform-fee-impl`

Nhánh này chứa phần lớn thay đổi mới hơn:

- platform fee v2
- refund/report evidence upload
- admin dashboard/report updates
- draw.io sync
- test và Playwright E2E

### 2. `UI-fix`

Nhánh này tập trung vào chỉnh UI ở các màn cũ hơn như:

- seller profile
- seller listings
- inspector form
- validation số tiền

### 3. `fix/message_error`

Nhánh này chủ yếu chỉnh một số màn giao diện và thông điệp:

- `HomePage`
- `BikeListingPage`
- `RegisterPage`
- vài màn auth liên quan

## Vì sao cần chọn thứ tự merge

Khi nhiều nhánh cùng chạm vào file giống nhau, Git phải cố ghép nội dung.

Nếu hai nhánh cùng sửa một đoạn mà Git không chắc nên giữ phần nào, conflict sẽ xuất hiện.

Vì vậy, thứ tự merge hợp lý sẽ giúp:

- giảm số conflict
- giảm số file phải sửa tay
- dễ kiểm tra sau merge hơn

## Thứ tự merge đã dùng

FE được merge theo thứ tự:

1. `origin/UI-fix`
2. `origin/fix/message_error`
3. `feat/platform-fee-impl`

Lý do:

- `UI-fix` và `fix/message_error` đều là các nhánh cũ hơn
- chúng chủ yếu chạm vào UI nền
- `feat/platform-fee-impl` chứa các thay đổi lớn hơn và mới hơn, nên để sau cùng giúp gom conflict về ít chỗ hơn

## Conflict thực tế đã xảy ra ở đâu

Conflict FE chỉ xảy ra ở:

- `src/pages/BikeDetailPage.tsx`

Điểm conflict không nằm ở logic order hay JSX lớn, mà nằm ở phần import đầu file.

Một phía giữ helper định dạng giá từ UI fix:

- `formatPriceDisplay`

Phía còn lại thêm helper preview platform fee:

- `calculatePlatformFeePreview`

## Cách resolve conflict

Cách xử lý đúng là không chọn một phía và bỏ phía còn lại.

Thay vào đó, file sau merge cần giữ cả hai ý:

- vẫn dùng helper định dạng giá của nhánh UI
- vẫn dùng helper tính preview platform fee của nhánh mới

Nói đơn giản:

- giữ `formatCurrencyInput`
- giữ `parseCurrencyInput`
- giữ `formatPriceDisplay`
- giữ `calculatePlatformFeePreview`

Sau khi sửa import xong, phần body của `BikeDetailPage` đã được Git ghép đúng nên không cần viết lại lớn.

## Kiểm tra sau merge

Sau khi resolve conflict, FE đã được kiểm tra bằng:

- `npm run build`
- `npx vitest run src/pages/BikeDetailPage.test.tsx src/components/profile/BuyerOrdersView.test.tsx src/pages/admin/AdminDashboardPage.test.tsx src/pages/admin/AdminReportsPage.test.tsx src/pages/MyReportsPage.test.tsx`

Các kiểm tra này pass.

## Trạng thái cuối

Sau lần merge này:

- `dev` của FE đã nhận đủ ba nhánh yêu cầu
- conflict đã được xử lý
- nhánh `dev` build được
- các test quan trọng quanh phần conflict và admin/report vẫn pass

## Ý nghĩa cho người mới

Nếu bạn mới học Git:

- `merge` là ghép lịch sử commit của một nhánh vào nhánh khác
- `conflict` là lúc Git không thể tự quyết định nên giữ phần nào
- `resolve conflict` là sửa tay để giữ nội dung đúng nhất

Trong dự án này, bài học quan trọng là:

- không phải conflict nào cũng là lỗi lớn
- nhiều conflict chỉ là do hai nhánh cùng sửa import hoặc cùng chạm một file
- điều quan trọng là hiểu file đó đang cần giữ hành vi nào sau khi merge
