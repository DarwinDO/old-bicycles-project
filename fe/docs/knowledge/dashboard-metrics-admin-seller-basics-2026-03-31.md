# Dashboard metrics admin và seller được tính như thế nào?

## 1. Bài toán

Khi nhìn vào dashboard, người dùng thường thấy nhiều con số như:

- tổng đơn hàng
- doanh thu
- GMV
- seller đã thực nhận
- tiền chờ giải ngân

Nếu chỉ nhìn giao diện thì rất dễ hiểu nhầm rằng tất cả các số này đều giống nhau. Thực tế thì không phải vậy. Mỗi số được lấy từ một nguồn khác nhau và có ý nghĩa nghiệp vụ khác nhau.

---

## 2. Khái niệm cơ bản

### GMV là gì?

`GMV` là viết tắt của `Gross Merchandise Value`.

Hiểu rất đơn giản:

- đây là tổng giá trị hàng hóa đã giao dịch
- trong dự án này là tổng `giá trị xe` của các đơn đã hoàn thành

Nó không phải là lợi nhuận của seller.
Nó cũng không phải là doanh thu thật của sàn.

### Doanh thu sàn là gì?

Đây là phần `phí sàn` mà hệ thống thực sự được ghi nhận.

Ví dụ:

- một đơn hoàn thành có phí sàn 1.000.000 đ
- nhưng nếu phí đó vẫn đang treo, chưa settled, thì chưa được tính là doanh thu sàn đã ghi nhận

### Seller đã thực nhận là gì?

Đây là số tiền seller thực sự đã nhận được sau khi:

- trừ phần phí seller chịu
- và admin đã giải ngân xong

### Chờ giải ngân là gì?

Đây là số tiền seller đáng lẽ sẽ nhận, nhưng hệ thống vẫn đang giữ ở trạng thái `seller_payout_pending`.

---

## 3. Luồng số liệu ở dashboard admin

### 3.1. FE gọi API nào?

Trang admin dashboard nằm ở:

- `src/pages/admin/AdminDashboardPage.tsx`

Khi trang mở ra, FE gọi:

- `dashboardApi.getStats()` trong `src/api/dashboard.api.ts`

API này gọi tới:

- `GET /api/admin/dashboard/stats`

### 3.2. Backend nhận request ở đâu?

Controller:

- `src/main/java/com/backend/old_bicycle_project/controller/DashboardController.java`

Controller chỉ làm nhiệm vụ nhận request và chuyển tiếp xuống service:

```java
DashboardStatsDTO stats = dashboardService.getDashboardStats();
```

### 3.3. Service tính số liệu ở đâu?

Service chính:

- `src/main/java/com/backend/old_bicycle_project/service/impl/DashboardServiceImpl.java`

Ở đây hệ thống tính từng nhóm số.

#### Tổng người dùng

```java
long totalUsers = userRepository.count();
```

Nghĩa là đếm toàn bộ user trong bảng `users`.

#### Tổng sản phẩm

```java
long totalProducts = productRepository.count();
```

Đây là tổng số bản ghi product.

#### Tổng đơn hàng

```java
long totalOrders = orderRepository.count();
```

Đây là tổng số bản ghi order.

#### Tổng GMV

```java
BigDecimal totalGmv = defaultZero(orderRepository.sumTotalAmountByStatus(OrderStatus.completed));
```

Nghĩa là:

- chỉ lấy các đơn có `status = completed`
- cộng cột `total_amount`

Query nằm ở `OrderRepository.java`:

```java
@Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
BigDecimal sumTotalAmountByStatus(@Param("status") OrderStatus status);
```

#### Phí sàn chờ ghi nhận

```java
BigDecimal pendingPlatformFee = defaultZero(
    orderRepository.sumPlatformFeeTotalByPlatformFeeStatus(PlatformFeeStatus.pending)
);
```

Nghĩa là cộng `platformFeeTotal` của các đơn có `platformFeeStatus = pending`.

#### Doanh thu sàn đã ghi nhận

```java
BigDecimal recognizedPlatformRevenue = defaultZero(
    orderRepository.sumPlatformFeeTotalByPlatformFeeStatus(PlatformFeeStatus.recognized)
);
```

Nghĩa là cộng `platformFeeTotal` của các đơn có `platformFeeStatus = recognized`.

#### Phí sàn bị reverse

```java
BigDecimal reversedPlatformFee = defaultZero(
    orderRepository.sumPlatformFeeTotalByPlatformFeeStatus(PlatformFeeStatus.reversed)
);
```

Nghĩa là cộng `platformFeeTotal` của các đơn có `platformFeeStatus = reversed`.

#### Kiểm định xe

```java
long totalInspections = inspectionRepository.count();
long passedInspections = productRepository.countByStatus(ProductStatus.inspected_passed);
long failedInspections = productRepository.countByStatus(ProductStatus.inspected_failed);
```

Ý nghĩa:

- `totalInspections`: đếm tổng bản ghi inspection
- `passedInspections`: đếm product đang ở trạng thái kiểm định đạt
- `failedInspections`: đếm product đang ở trạng thái kiểm định không đạt

#### Số liệu theo tháng

Dashboard admin còn có số liệu theo tháng:

- `monthlyGmv`
- `monthlyRecognizedPlatformRevenue`
- `monthlyOrders`

Các số này lấy từ query nhóm theo `YYYY-MM` trong `OrderRepository.java`.

Ví dụ GMV theo tháng:

```sql
SELECT TO_CHAR(COALESCE(platform_fee_recognized_at, updated_at, created_at), 'YYYY-MM') AS month,
       SUM(total_amount) AS gmv
FROM orders
WHERE status = 'completed'
GROUP BY TO_CHAR(COALESCE(platform_fee_recognized_at, updated_at, created_at), 'YYYY-MM')
```

Nghĩa là:

- chỉ lấy đơn hoàn thành
- gom nhóm theo tháng
- cộng tổng tiền xe của từng tháng

### 3.4. FE render số ra sao?

Trong `AdminDashboardPage.tsx`, FE lấy dữ liệu từ API rồi map ra card:

- `totalUsers`
- `totalProducts`
- `totalOrders`
- `totalGmv`
- `pendingPlatformFee`
- `recognizedPlatformRevenue`

Các số theo tháng được lấy bằng `currentMonthKey`:

```ts
const currentMonthlyGmv = monthlyGmv[currentMonthKey] ?? 0
const currentMonthlyPlatformRevenue =
  monthlyRecognizedPlatformRevenue[currentMonthKey] ?? 0
const currentMonthlyOrders = stats?.monthlyOrders?.[currentMonthKey] ?? 0
```

Nghĩa là FE chỉ lấy đúng tháng hiện tại từ map mà backend trả về.

---

## 4. Luồng số liệu ở dashboard seller

Dashboard seller khác admin ở một điểm rất quan trọng:

- admin có API thống kê riêng từ backend
- seller dashboard hiện đang tự tổng hợp số liệu ngay ở FE từ danh sách `products` và `orders`

### 4.1. FE gọi dữ liệu nào?

Trang seller dashboard nằm ở:

- `src/pages/seller/SellerDashboardPage.tsx`

Khi trang mở ra, FE gọi song song:

```ts
Promise.all([productsApi.getMine(0, 50), ordersApi.getMine()])
```

Tức là:

- lấy danh sách product của seller
- lấy danh sách order mà user hiện tại có liên quan

### 4.2. Backend trả dữ liệu product ở đâu?

FE gọi:

- `GET /api/products/my`

Controller:

- `ProductController.java`

Service:

- `ProductService.getMyProducts(...)`

Service này gọi:

```java
productRepository.findBySellerIdAndDeletedAtIsNull(currentUser.getId(), pageable)
```

Nghĩa là chỉ lấy product thuộc seller đang đăng nhập và chưa bị soft delete.

### 4.3. Backend trả dữ liệu order ở đâu?

FE gọi:

- `GET /api/orders/me`

Controller:

- `OrderController.java`

Service:

- `OrderServiceImpl.getMyOrders(...)`

Ở đây logic là:

- nếu là admin thì lấy toàn bộ
- nếu là user bình thường thì lấy các order mà user là buyer hoặc seller

Code:

```java
orderRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(currentUser.getId(), currentUser.getId());
```

Sau đó backend map entity sang `OrderResponseDTO` ở:

- `OrderViewSupport.java`

Chính ở đây các field như:

- `totalAmount`
- `buyerChargeAmount`
- `sellerNetPayoutAmount`
- `status`
- `fundingStatus`

được đưa ra cho FE dùng tiếp.

### 4.4. FE lọc riêng order của seller như thế nào?

Sau khi nhận `ordersApi.getMine()`, FE còn lọc lại:

```ts
setOrders(allOrders.filter((order) => order.sellerId === sellerId))
```

Nghĩa là seller dashboard chỉ giữ những order mà current user là seller thật.

---

## 5. Từng con số ở seller dashboard được tính ra sao

### Yêu cầu cần phản hồi

Code:

```ts
const incomingRequests = orders.filter((order) => canSellerAcceptOrder(order))
```

Hàm `canSellerAcceptOrder(...)` nằm ở:

- `src/lib/order-display.ts`

Rule:

```ts
return order.status === 'pending' && order.fundingStatus === 'unpaid'
```

Nghĩa là:

- buyer đã tạo yêu cầu mua
- seller chưa chốt buyer
- buyer cũng chưa phải bước thanh toán

Đây là những order seller cần phản hồi ngay.

### Tin đăng bật

Code:

```ts
const activeListings = products.filter(
  (product) => getSellerListingStatusPresentation(product).isPubliclyVisible
).length
```

FE không đếm đơn giản theo `status === active`.
Thay vào đó, nó gọi helper:

- `getSellerListingStatusPresentation(...)`
- file `src/pages/seller/seller-listing-visibility.ts`

Lý do:

- có product `inspected_passed` cũng được xem là đang hiển thị
- có product `active` nhưng bị khóa giao dịch thì không public
- có product có sellerActionLocked thì vẫn public nhưng seller bị khóa một số thao tác

Nghĩa là số `Tin đăng bật` là số listing thật sự đang hiển thị công khai theo rule nghiệp vụ, không phải chỉ nhìn raw status.

### Đơn hoàn thành

Code:

```ts
const completedOrders = orders.filter((order) => order.status === 'completed')
```

Chỉ những order hoàn thành mới được tính vào card này.

### Doanh thu

Code:

```ts
const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
```

Đây là tổng `giá trị xe` của các đơn hoàn thành.

Nó chưa phải lợi nhuận seller.

### Seller đã thực nhận

Code:

```ts
const releasedProfit = completedOrders
  .filter((order) => order.fundingStatus === 'released')
  .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)
```

Ý nghĩa:

- chỉ lấy đơn hoàn thành
- chỉ lấy đơn có `fundingStatus = released`
- cộng `sellerNetPayoutAmount`

`sellerNetPayoutAmount` là số tiền seller còn lại sau phần fee seller chịu.
Muốn lên card này thì còn cần thêm điều kiện tiền đã thực sự được giải ngân.

### Chờ giải ngân

Code:

```ts
const pendingPayoutAmount = completedOrders
  .filter((order) => order.fundingStatus === 'seller_payout_pending')
  .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)
```

Nghĩa là:

- đơn đã hoàn thành
- nhưng tiền vẫn đang ở trạng thái `seller_payout_pending`
- hệ thống cộng `sellerNetPayoutAmount` để biết seller còn bao nhiêu tiền chưa được admin chuyển khoản

Card này còn có thêm:

```ts
const pendingPayoutOrders = completedOrders.filter(
  (order) => order.fundingStatus === 'seller_payout_pending'
).length
```

để hiển thị mô tả kiểu:

- `1 đơn đang chờ admin chuyển khoản`

---

## 6. Tóm tắt luồng từ FE tới BE

### Admin dashboard

```text
Admin mở trang
-> AdminDashboardPage.tsx
-> dashboardApi.getStats()
-> GET /api/admin/dashboard/stats
-> DashboardController
-> DashboardServiceImpl
-> UserRepository / ProductRepository / OrderRepository / InspectionRepository
-> PostgreSQL
-> trả DashboardStatsDTO
-> FE format và render card
```

### Seller dashboard

```text
Seller mở trang
-> SellerDashboardPage.tsx
-> productsApi.getMine() + ordersApi.getMine()
-> GET /api/products/my + GET /api/orders/me
-> ProductController / OrderController
-> ProductService / OrderServiceImpl
-> ProductRepository / OrderRepository
-> PostgreSQL
-> FE lọc tiếp theo sellerId và fundingStatus
-> FE tự cộng số để render card
```

---

## 7. Điều dễ hiểu nhầm

### Nhầm 1: Doanh thu seller và doanh thu sàn là một

Sai.

- `Doanh thu` ở seller dashboard là tổng giá trị xe của các đơn completed
- `Doanh thu sàn đã ghi nhận` ở admin dashboard là phần phí sàn đã recognized

Hai số này khác bản chất.

### Nhầm 2: Hoàn thành đơn là seller đã nhận tiền

Sai.

Một đơn có thể:

- `status = completed`
- nhưng `fundingStatus = seller_payout_pending`

Tức là giao dịch xong rồi nhưng admin chưa giải ngân.

### Nhầm 3: Product active là chắc chắn đang public

Không hẳn.

Seller dashboard không nhìn raw status đơn giản.
Nó dùng helper `getSellerListingStatusPresentation(...)` để quyết định listing có đang public thật không.

---

## 8. Kết luận ngắn

- Dashboard admin lấy số liệu tổng hợp trực tiếp từ backend qua `DashboardServiceImpl`.
- Dashboard seller hiện đang lấy danh sách raw từ backend rồi FE tự tính tiếp.
- `GMV`, `doanh thu sàn`, `seller đã thực nhận`, `chờ giải ngân` là 4 khái niệm khác nhau.
- Muốn giải thích tốt với giảng viên, phải nói rõ mỗi số được lấy từ `field nào`, `lọc theo status nào`, và `tính ở BE hay FE`.
