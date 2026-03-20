# FE Low-Risk Merge Playbook - 2026-03-18

## Mục tiêu

Gộp các nhánh FE của Dev 2 và Dev 3 vào `dev` theo cách ít rủi ro nhất, tránh đè mất phần Dev 1 đã làm cho:

- order / payment / refund
- chat
- admin listings

## Kết quả cuối cùng

Đã merge xong vào `dev`:

- `origin/feature-admin`
- `origin/feature/public-marketplace`
- `origin/feature/social-and-inspection`

Không merge lại:

- `origin/feature-authen`
  Vì nhánh này đã được merge từ trước.
- `origin/feature/seller-product`
  Vì nhánh này đã nằm bên trong `origin/feature/social-and-inspection` theo kiểu stacked branch.

Các commit merge mới:

- `94e9e58` - `merge: integrate feature-admin into dev`
- `56bff42` - `merge: integrate feature/public-marketplace into dev`
- `61118e4` - `merge: integrate feature/social-and-inspection into dev`

## Khái niệm Git cần nhớ

### `merge`

`merge` là hành động gộp lịch sử và code từ một nhánh khác vào nhánh hiện tại.

Ví dụ:

```powershell
git merge origin/feature-admin
```

Nghĩa là: đang đứng ở nhánh hiện tại, lấy code từ `origin/feature-admin` gộp vào.

### `conflict`

`conflict` xảy ra khi Git thấy hai nhánh cùng sửa một vùng code và Git không thể tự quyết định nên giữ bên nào.

Lúc đó người làm merge phải tự quyết định:

- giữ code của nhánh hiện tại
- giữ code của nhánh đang merge vào
- hoặc trộn cả hai lại

### `ours`

`ours` nghĩa là giữ phiên bản file ở nhánh hiện tại, tức là nhánh bạn đang đứng để merge.

Ví dụ:

```powershell
git checkout --ours src/pages/seller/SellerOrdersPage.tsx
```

Nghĩa là giữ file `SellerOrdersPage.tsx` của `dev`, bỏ phần xung đột từ nhánh đang merge.

### `theirs`

`theirs` là ngược lại, giữ file từ nhánh đang merge vào.

Ví dụ:

```powershell
git checkout --theirs src/router/index.tsx
```

Nghĩa là lấy nguyên file của branch đang merge vào.

### `--no-ff`

`--no-ff` buộc Git tạo ra một merge commit riêng, kể cả khi có thể fast-forward.

Lý do dùng ở đây:

- lịch sử dễ đọc hơn
- biết chính xác branch nào đã được merge
- rollback dễ hơn

### `--no-commit`

`--no-commit` bảo Git merge trước nhưng chưa commit ngay.

Rất hữu ích khi:

- muốn kiểm tra kỹ thay đổi
- muốn xử lý conflict trước
- muốn kiểm soát chính xác nội dung merge commit

## Thứ tự merge ít rủi ro đã dùng

### 1. Merge `feature-admin` trước

Lý do:

- xung đột ít nhất
- chỉ conflict 1 file
- dễ chốt nhanh

Lệnh đã dùng:

```powershell
git fetch --all --prune
git status --short --branch
git merge --no-ff --no-commit origin/feature-admin
```

Giải thích:

- `git fetch --all --prune`
  Cập nhật toàn bộ branch remote và dọn remote-tracking branch cũ.
- `git status --short --branch`
  Kiểm tra nhánh hiện tại có sạch không trước khi merge.
- `git merge --no-ff --no-commit origin/feature-admin`
  Merge branch `feature-admin` vào `dev`, nhưng chưa commit ngay để có thể xử lý conflict.

### Conflict của `feature-admin`

Conflict xảy ra ở:

- [StatusBadge.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/dashboard/StatusBadge.tsx)

Nguyên nhân:

- `dev` đã có các trạng thái cho product moderation và Dev 1
- `feature-admin` thêm các trạng thái cho report/admin

Cách xử lý:

- không chọn nguyên `ours` hay `theirs`
- viết lại file sạch
- giữ đủ cả hai nhóm status
- sửa luôn tiếng Việt có dấu cho gọn và dễ đọc

Sau khi resolve:

```powershell
git add src/components/dashboard/StatusBadge.tsx
git commit -m "merge: integrate feature-admin into dev"
```

Giải thích:

- `git add ...`
  Đánh dấu conflict đã được giải quyết.
- `git commit -m "..."`
  Tạo merge commit chính thức.

## 2. Merge `feature/public-marketplace`

Lý do:

- không phải branch stacked
- rủi ro thấp hơn `social-and-inspection`
- cần merge trước để nền marketplace ổn định

Lệnh đã dùng:

```powershell
git merge --no-ff origin/feature/public-marketplace -m "merge: integrate feature/public-marketplace into dev"
```

Conflict thực tế:

- [index.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/router/index.tsx)

Nguyên nhân:

- `dev` có route:
  - notifications
  - my-reports
- `public-marketplace` thêm route:
  - wishlist

Đây là conflict kiểu "cùng thêm route ở một đoạn".

Cách xử lý:

- giữ tất cả route cần thiết
- không bỏ route cũ của `dev`
- không lấy nguyên file của bất kỳ bên nào

Sau khi resolve:

```powershell
git add src/router/index.tsx
git commit -m "merge: integrate feature/public-marketplace into dev"
```

## 3. Merge `feature/social-and-inspection`

Lý do:

- đây là branch stacked, đã bao gồm phần `seller-product`
- merge một lần sẽ gọn hơn merge từng branch nhỏ rồi tự đụng nhau nhiều vòng

Lệnh đã dùng:

```powershell
git merge --no-ff --no-commit origin/feature/social-and-inspection
```

Conflict thực tế:

- [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)
- [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx)

Nguyên nhân:

- branch stacked vẫn chứa phiên bản cũ của flow order
- `dev` hiện tại đã có flow mới của Dev 1:
  - payment / refund thật
  - buyer confirm received
  - semantics order mới hơn

Cách xử lý:

Ở đây chọn `ours`, vì mục tiêu là:

- giữ bản đúng hơn, mới hơn trên `dev`
- tránh đè mất business flow Dev 1

Lệnh đã dùng:

```powershell
git checkout --ours src/components/profile/BuyerOrdersView.tsx src/pages/seller/SellerOrdersPage.tsx
git add src/components/profile/BuyerOrdersView.tsx src/pages/seller/SellerOrdersPage.tsx
git commit -m "merge: integrate feature/social-and-inspection into dev"
```

Giải thích:

- `git checkout --ours ...`
  Khôi phục file về bản của `dev` trong lúc đang merge conflict.
- `git add ...`
  Báo cho Git biết conflict đã được xử lý.
- `git commit -m "..."`
  Chốt merge commit.

## Vì sao không merge `feature/seller-product` riêng

Vì branch:

- `origin/feature/social-and-inspection`

đã bao gồm phần của:

- `origin/feature/seller-product`

Nếu merge cả hai riêng lẻ thì rủi ro là:

- trùng code
- conflict lặp lại
- lịch sử merge rối hơn

## Vì sao không merge `feature-authen`

Vì `feature-authen` đã được merge trước đó vào `dev`.

Dấu hiệu:

- lịch sử `git log` đã có merge cũ của nhánh này
- merge lại sẽ không tạo thêm giá trị, chỉ tăng rủi ro nhầm

## Kiểm tra sau merge

Sau khi merge xong, tôi đã chạy:

```powershell
npm run build
```

Mục đích:

- chắc chắn TypeScript compile được
- router, imports, types, page integration chưa bị gãy

Và chạy test trọng tâm:

```powershell
npm run test:run -- src/components/dashboard/StatusBadge.test.tsx src/pages/admin/AdminListingsPage.test.tsx src/lib/chat-display.test.ts src/lib/order-display.test.ts
```

Mục đích:

- kiểm tra lại các phần dễ bị ảnh hưởng bởi merge:
  - admin listings
  - status badge
  - chat helpers
  - order helpers

## Nếu merge lần sau bị conflict thì làm theo quy trình nào

### Trường hợp 1: Chưa chắc bên nào đúng hơn

Làm như sau:

1. `git status`
2. mở file conflict
3. đọc 2 phía
4. hiểu business meaning
5. tự viết lại file sạch
6. `git add <file>`
7. `git commit`

### Trường hợp 2: Biết chắc phải giữ nhánh hiện tại

Ví dụ file ở `dev` đang mới hơn, đúng hơn:

```powershell
git checkout --ours <file>
git add <file>
```

### Trường hợp 3: Biết chắc phải lấy nhánh đang merge

```powershell
git checkout --theirs <file>
git add <file>
```

### Trường hợp 4: Muốn hủy merge

```powershell
git merge --abort
```

Lệnh này đưa repo quay về trạng thái trước khi bắt đầu merge.

## Dấu hiệu cho thấy nên chọn `ours`

Nên nghiêng về `ours` khi:

- file trên `dev` vừa được sửa gần đây
- flow business mới hơn đang nằm ở `dev`
- branch đang merge là branch cũ hoặc stacked branch
- nếu lấy `theirs` sẽ đè mất API flow quan trọng

## Dấu hiệu cho thấy nên tự trộn hai bên

Nên tự merge tay khi:

- mỗi bên thêm một phần khác nhau đều có giá trị
- ví dụ route mới, badge mới, enum mới, UI label mới
- nếu chọn hẳn `ours` hoặc `theirs` thì sẽ làm mất tính năng

## Tóm tắt quyết định thực tế của lần merge này

- `feature-admin`
  - conflict ít
  - tự viết lại [StatusBadge.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/dashboard/StatusBadge.tsx)
- `feature/public-marketplace`
  - conflict ở router
  - giữ cả route cũ lẫn route mới trong [index.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/router/index.tsx)
- `feature/social-and-inspection`
  - conflict vào flow order mới
  - giữ bản `dev` cho:
    - [BuyerOrdersView.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.tsx)
    - [SellerOrdersPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerOrdersPage.tsx)

## Kết luận

Đây là một lượt merge theo hướng ít rủi ro, vì:

- merge branch nhỏ và ít conflict trước
- branch stacked được xử lý sau cùng
- những file nhạy cảm của Dev 1 được bảo vệ
- build và test trọng tâm đều pass sau merge

Nếu sau này cần merge thêm branch khác, hãy giữ nguyên tư duy:

- đọc branch graph trước
- tìm branch nào đã stacked
- merge branch ít conflict trước
- với file business-critical, luôn xác định rõ nên giữ `ours`, `theirs`, hay tự viết lại
