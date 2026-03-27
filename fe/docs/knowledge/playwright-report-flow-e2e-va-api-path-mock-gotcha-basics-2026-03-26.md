# Playwright Report Flow E2E Và Bẫy Mock `/api/` Trong Vite: giải thích cho người mới học

## 1. Bối cảnh

Sau khi FE đã có:

- modal báo cáo từ `BikeDetailPage`
- upload ảnh bằng chứng cho report
- `MyReportsPage` hiển thị lại ảnh đã gửi

thì vẫn còn thiếu một lớp kiểm tra quan trọng:

- test trình duyệt thật, chạy qua route thật, component thật, form thật

Test kiểu này thường được gọi là `browser E2E`.

`E2E` là viết tắt của `end-to-end`, nghĩa là kiểm tra một luồng từ đầu đến cuối giống cách người dùng thật thao tác.

## 2. File chính

- `tests/e2e/report-flow.spec.ts`
- `playwright.config.ts`
- `package.json`

## 3. Luồng FE mà test này kiểm tra

```text
Buyer đã đăng nhập
-> mở route /bikes/:id
-> BikeDetailPage render nút "Báo cáo tin đăng này"
-> user mở ReportModal
-> chọn lý do, nhập mô tả, đính kèm ảnh
-> reportsApi.submit(...) gửi multipart/form-data
-> backend mock trả về report mới tạo
-> user mở /my-reports
-> MyReportsPage render lại report và ảnh bằng chứng
```

## 4. Vì sao cần browser E2E khi đã có unit test và page test?

Unit test và component test rất hữu ích, nhưng chúng thường:

- mock component hoặc API theo cách hẹp hơn
- không đi qua router thật
- không kiểm tra request multipart ở mức browser thật

Browser E2E bổ sung đúng phần còn thiếu đó:

- route thật
- localStorage thật
- input file thật của browser
- `FormData` thật
- điều hướng trang thật

## 5. Bẫy đã gặp: mock `**/api/**` bắt nhầm file source

Lúc đầu test bị màn hình trắng.

Nguyên nhân không phải do `BikeDetailPage`, cũng không phải do `ReportModal`.

Nguyên nhân là route mock trong Playwright dùng pattern quá rộng:

```ts
page.route('**/api/**', ...)
```

Trong dự án Vite này, nhiều file source có đường dẫn như:

- `/src/api/auth.api.ts`
- `/src/api/reports.api.ts`

Các đường dẫn đó cũng chứa đoạn `/api/`.

Kết quả là Playwright chặn nhầm cả request tải module JavaScript của Vite, rồi trả response mock 404. Khi file JS không tải được, app không mount, nên trình duyệt chỉ còn:

- `div#root` rỗng
- trang trắng

## 6. Cách sửa đúng

Thay vì chỉ dựa vào pattern URL rộng, test mới route toàn bộ request rồi tự kiểm tra `pathname`.

Ý tưởng là:

- nếu `pathname` không bắt đầu bằng `/api/` thì cho request đi tiếp
- chỉ mock khi request thật sự là API backend

Logic chính:

```ts
await page.route('**/*', async (route) => {
  const pathname = new URL(route.request().url()).pathname

  if (!pathname.startsWith('/api/')) {
    await route.continue()
    return
  }

  // mock backend API here
})
```

Điểm quan trọng là:

- `/api/reports` là API thật của app
- `/src/api/reports.api.ts` là file source của frontend

Hai đường dẫn này nhìn giống nhau, nhưng bản chất hoàn toàn khác.

## 7. Side effect khác: lỗi socket chat trong console

Khi user đã đăng nhập, `AppHeader` sẽ thử kết nối socket chat nền.

Trong browser E2E này, ta không dựng backend websocket thật, nên console có thể báo:

- `ERR_CONNECTION_REFUSED`

Đây không phải lỗi của flow report.

Vì vậy test chỉ bỏ qua đúng lỗi socket nền đó, còn các lỗi console khác vẫn phải fail.

## 8. Test này đang khóa những gì?

- `BikeDetailPage` thật sự render nút báo cáo trong browser
- `ReportModal` thật sự mở và nhận file ảnh
- request gửi đi thật sự là `multipart/form-data`
- payload có `targetId`, `reason`, và file đính kèm
- `MyReportsPage` thật sự render lại bằng chứng đã gửi

## 9. Ví dụ ngắn để dễ hình dung

Buyer vào `/bikes/product-1`.

Buyer bấm `Báo cáo tin đăng này`, chọn lý do `fake`, nhập mô tả, rồi upload file `listing-proof.jpg`.

Test sẽ kiểm tra:

- request submit report có đúng multipart không
- body có `targetId=product-1` không
- body có `reason=fake` không
- body có tên file `listing-proof.jpg` không
- sau đó vào `/my-reports` có thấy lại file đó không

## 10. Chốt ngắn

Slice này không đổi business behavior của sản phẩm. Nó tăng độ chắc của FE bằng cách thêm một browser E2E thật cho luồng report.

Bài học kỹ thuật quan trọng nhất là:

- khi mock API trong Playwright cho app Vite, đừng dùng pattern quá rộng kiểu `**/api/**` rồi nghĩ là chỉ chặn backend
- phải phân biệt rõ `API backend path` và `frontend source path`

Nếu không, test sẽ hỏng theo cách rất khó đoán, vì nhìn bên ngoài chỉ thấy một trang trắng.
