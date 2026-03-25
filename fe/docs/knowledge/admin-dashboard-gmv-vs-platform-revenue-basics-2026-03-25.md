# Admin dashboard: phân biệt GMV và doanh thu sàn ở frontend

## 1. Bối cảnh

Trước khi sửa, trang admin dashboard có 2 vấn đề dễ gây hiểu nhầm:

- `Tổng doanh thu` thực ra đang lấy từ field `totalRevenue`, nhưng backend cũ dùng field này gần giống `GMV`
- phần `Doanh thu tháng này` lại cộng tất cả các tháng trong `monthlyRevenue`, không phải tháng hiện tại

Kết quả là admin có thể nhìn một con số lớn và tưởng đó là doanh thu sàn thật, trong khi thực tế nó chỉ là tổng giá trị giao dịch.

---

## 2. GMV là gì?

`GMV` là `Gross Merchandise Value`.

Hiểu đơn giản:

- đây là tổng giá trị xe của các giao dịch hoàn tất
- nó cho biết quy mô giao dịch trên sàn
- nó không phải khoản tiền nền tảng thật sự được giữ lại làm doanh thu

Trong khi đó, `recognized platform revenue` mới là phần phí sàn đã được ghi nhận là doanh thu thật.

---

## 3. FE đã sửa gì?

File chính:

- `src/pages/admin/AdminDashboardPage.tsx`
- `src/types/dashboard.ts`

Sau khi sửa:

- page đọc cả field mới như `totalGmv`, `pendingPlatformFee`, `recognizedPlatformRevenue`, `reversedPlatformFee`
- page vẫn fallback được về `totalRevenue` và `monthlyRevenue` để tương thích tạm thời
- wording trên UI đổi để admin thấy rõ đâu là `GMV`, đâu là `doanh thu sàn`
- phần "tháng này" chỉ đọc đúng key của tháng hiện tại, không cộng toàn bộ lịch sử nữa

---

## 4. Luồng FE của trang này

```text
Admin mở /admin
-> AdminDashboardPage mount
-> useEffect gọi dashboardApi.getStats()
-> API trả về DashboardStats
-> component tách totalGmv / recognizedPlatformRevenue / monthlyGmv / monthlyRecognizedPlatformRevenue
-> setStats(...)
-> React render lại các StatCard và panel chi tiết
```

### Giải thích từng bước

1. Admin vào route dashboard.
2. `AdminDashboardPage` dùng `useEffect` để gọi API đúng một lần khi page mount.
3. `dashboardApi.getStats()` gọi tới backend endpoint `/api/admin/dashboard/stats`.
4. Backend trả về object `DashboardStats`.
5. FE lấy các field mới nếu có. Nếu backend cũ hơn thì FE fallback về alias cũ.
6. Sau khi state đổi, React render lại giao diện với số liệu đúng nghĩa hơn.

---

## 5. Vì sao fallback vẫn cần giữ?

Vì trong giai đoạn chuyển tiếp:

- backend có thể đã thêm field mới
- nhưng một số chỗ ở FE hoặc môi trường cũ vẫn còn quen với `totalRevenue` và `monthlyRevenue`

Nếu FE chỉ đọc field mới ngay lập tức thì:

- môi trường chưa cập nhật backend đầy đủ có thể bị vỡ UI

Nếu FE chỉ giữ field cũ thì:

- dự án tiếp tục hiểu nhầm `GMV` là `doanh thu sàn`

Cho nên cách an toàn là:

- ưu tiên field mới
- fallback về field cũ
- đồng thời đổi wording trên UI cho đúng

---

## 6. Sửa lỗi "tháng này" như thế nào?

Trước đây code làm gần như thế này:

```text
Object.values(monthlyRevenue).reduce(...)
```

Nghĩa là cộng toàn bộ tháng có trong object.

Sau khi sửa:

- FE tự tạo key tháng hiện tại theo dạng `YYYY-MM`
- rồi chỉ lấy đúng giá trị của tháng đó

Ví dụ:

```text
currentMonthKey = 2026-03
monthlyGmv[currentMonthKey]
monthlyRecognizedPlatformRevenue[currentMonthKey]
monthlyOrders[currentMonthKey]
```

Nhờ vậy, dòng "tháng này" mới thật sự là tháng hiện tại.

---

## 7. Test đã thêm

File test:

- `src/pages/admin/AdminDashboardPage.test.tsx`

Test này kiểm tra:

- page render được `Tổng GMV`
- page render được `Doanh thu sàn đã ghi nhận`
- số liệu tháng hiện tại lấy đúng key tháng đang test
- page không cộng nhầm cả các tháng trước

---

## 8. Điều quan trọng cần nhớ

Khi làm dashboard tài chính, tên field và tên label rất quan trọng.

Nếu backend trả:

- `GMV`

thì FE không nên tự ý đổi thành:

- `Doanh thu`

vì như vậy người đọc sẽ hiểu sai bản chất của dữ liệu.

Nói ngắn gọn:

- backend phải trả đúng nghĩa
- frontend phải hiển thị đúng nghĩa
- chỉ khi hai phía cùng đúng thì dashboard mới đáng tin
