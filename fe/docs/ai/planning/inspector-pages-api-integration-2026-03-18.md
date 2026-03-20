# Inspector Pages API Integration - 2026-03-18

## Scope

Hoàn tất phần FE cho inspector:

- dashboard
- requests
- history
- inspection form

## Đã làm

- Mở rộng `src/types/inspection.ts`
- Mở rộng `src/api/inspections.api.ts`
- Nối API thật cho:
  - `InspectorDashboardPage`
  - `InspectionRequestsPage`
  - `InspectionHistoryPage`
  - `InspectionFormPage`
- Rewrite lại 4 page inspector sang UTF-8 sạch để tránh UI tiếng Việt bị vỡ dấu

## API sử dụng

- `GET /api/inspections/dashboard`
- `GET /api/inspections/requests`
- `GET /api/inspections/history`
- `GET /api/inspections/product/{id}`
- `GET /api/products/{id}`
- `POST /api/inspections/evaluate/{id}`

## Verify

```powershell
npm run test:run -- src/pages/inspector/InspectorDashboardPage.test.tsx src/pages/inspector/InspectionRequestsPage.test.tsx
npm run build
```

Kết quả:

- pass

## Ghi chú

- `InspectionFormPage` đang dùng thang điểm 1..5, đồng bộ với backend mới
- build vẫn còn warning CSS cũ về `@import` không đứng đầu file và cảnh báo chunk lớn, nhưng không fail build
