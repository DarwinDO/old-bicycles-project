# FE `.env` ở đâu, vì sao không thấy, và liên quan gì tới lỗi login

## 1. Bối cảnh

Nhiều bạn nhìn vào FE repo và thắc mắc:

- "Sao không thấy `.env`?"
- "Nếu không có `.env` thì FE gọi API bằng cách nào?"
- "Vì sao console lại báo lỗi ở `http.ts`?"

Trong project này, FE có thể chạy **mà không cần commit sẵn một file `.env`**.

## 2. Vì sao FE vẫn chạy dù không có `.env`?

Trong:

- [http.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/http.ts)

FE lấy base URL như sau:

```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''
```

Nghĩa là:

- nếu có `VITE_API_BASE_URL` thì dùng nó
- nếu không có thì dùng chuỗi rỗng `''`

Khi base URL là `''`, request sẽ đi theo dạng tương đối:

- `/api/auth/login`
- `/api/products`

## 3. Vậy request đi đâu?

Trong:

- [vite.config.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/vite.config.ts)

Vite có proxy:

- `/api`
- `/ws`

về backend target.

Mặc định target hiện tại là:

- `http://localhost:8080`

Nên local dev flow bình thường là:

```text
Browser -> localhost:5173 -> Vite proxy -> localhost:8080
```

## 4. `.env` của FE hiện giờ ở đâu?

Trước đó repo FE **không có sẵn file `.env.example`**, nên dễ gây hiểu nhầm.

Bây giờ đã thêm:

- [`.env.example`](/e:/Old_bicycle_system/old-bicycles-project/fe/.env.example)

File này chỉ ra các biến có thể dùng:

- `VITE_API_BASE_URL`
- `VITE_WS_BASE_URL`
- `VITE_DEV_PROXY_TARGET`

## 5. Khi nào FE thật sự cần `.env`?

Chỉ cần khi bạn muốn đổi mặc định.

Ví dụ:

- backend không chạy ở `localhost:8080`
- bạn muốn FE gọi thẳng API domain khác
- bạn muốn chat socket đi thẳng sang một host khác

Nếu local setup chuẩn là:

- backend ở `localhost:8080`
- frontend ở `localhost:5173`

thì không có `.env` vẫn chạy được.

## 6. Vì sao lỗi xuất hiện ở `http.ts` nhưng nguyên nhân có thể nằm ở backend?

`http.ts` là chỗ axios gửi request.

Nên khi backend trả lỗi, console thường highlight ngay file này.

Nhưng điều đó **không có nghĩa `http.ts` là nguyên nhân gốc**.

Ví dụ:

- login sai mật khẩu
- tài khoản bị `unactive`
- backend ném lỗi auth

thì FE vẫn báo ở `http.ts` vì request được gửi từ đó.

## 7. Luồng đi của login trong FE

```text
User nhập email/password
-> LoginPage.tsx submit form
-> AuthContext.login(...)
-> authService.login(...)
-> authApi.login(...)
-> postResult(...) trong http.ts
-> axios gửi POST /api/auth/login
-> Vite proxy chuyển sang backend
-> backend trả response
-> FE set session hoặc hiển thị lỗi
```

Các file chính:

- [LoginPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/LoginPage.tsx)
- [AuthContext.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/contexts/AuthContext.tsx)
- [authService.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/services/authService.ts)
- [auth.api.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/auth.api.ts)
- [http.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/http.ts)
- [vite.config.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/vite.config.ts)

## 8. Điều nên nhớ

- FE không thấy `.env` không có nghĩa là bị thiếu cấu hình bắt buộc
- trong repo này, mặc định local đang dựa vào **Vite proxy**
- lỗi xuất hiện ở `http.ts` thường chỉ là **điểm phát request**, không nhất thiết là gốc lỗi
- nếu backend đang restart hoặc trả lỗi, FE rất dễ hiện stack ở `http.ts`
