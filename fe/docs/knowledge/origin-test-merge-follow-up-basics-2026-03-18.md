# Origin Test Merge Follow-up Basics - 2026-03-18

## Tình huống

Branch `origin/test` được merge vào `dev` mà không phát sinh conflict Git.

Tuy nhiên, không có conflict không có nghĩa là mọi logic mới đều còn đúng.

Sau merge, cần kiểm tra lại các file bị chạm để xem branch cũ có vô tình kéo lùi hành vi mới hay không.

## Vấn đề phát hiện sau merge

`SellerListingsPage.tsx` bị kéo lại rule cũ cho nút edit:

- rule cũ: chỉ cho edit khi `status === active || status === hidden`
- rule đúng hiện tại: cho edit với mọi trạng thái trừ `sold`

Nếu giữ rule cũ, seller sẽ lại không sửa được tin `pending`.

## Vì sao chuyện này xảy ra

Git merge tự động dựa trên cấu trúc dòng code.

Nếu hai nhánh sửa các vùng khác nhau hoặc Git cho rằng có thể ghép được,
nó sẽ tạo merge commit mà không hỏi tay.

Nhưng về mặt nghiệp vụ, code mới hơn ở `dev` vẫn có thể bị kéo lùi ở một nhánh cũ hơn.

Đây gọi là:

- `semantic regression`

Tức là:

- cú pháp vẫn đúng
- build vẫn chạy
- nhưng hành vi nghiệp vụ bị quay về bản cũ

## Cách xử lý đúng

Sau merge:

1. xem branch nào là source mới hơn về nghiệp vụ
2. rà các file bị branch kia chạm
3. giữ lại logic đúng hơn, không chỉ nhìn việc Git có conflict hay không

Trong case này:

- `origin/test` là branch cũ hơn
- `dev` đã có fix mới cho seller edit flow
- nên sau merge phải sửa lại `SellerListingsPage.tsx`

## Luồng file liên quan

1. `SellerListingsPage.tsx`
- render list tin đăng của seller
- quyết định có hiện nút edit hay không

2. `productsApi.getMineById(productId)`
- FE gọi API riêng cho seller

3. `GET /api/products/my/{id}`
- backend trả cả product `pending`, không chỉ product public

4. `SellerEditProductPage.tsx`
- load data của chính seller để edit

Nếu step 1 chặn nút edit sai, thì dù step 2-4 đã đúng, người dùng vẫn tưởng hệ thống không hỗ trợ sửa tin chờ duyệt.

## Kết luận

Sau mỗi lần merge một branch cũ vào `dev`, cần kiểm tra:

- conflict kỹ thuật
- và cả regression nghiệp vụ

Không có conflict chỉ mới chứng minh:

- Git ghép được code

Chưa chứng minh:

- hành vi của app vẫn đúng như mong muốn
