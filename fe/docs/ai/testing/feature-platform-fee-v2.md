---
phase: testing
title: Platform Fee V2 FE Test Coverage
description: Focused FE test coverage for buyer pricing preview, buyer payment/refund breakdown, admin payout rendering, and fee-aware helpers
---

# Platform Fee V2 FE Test Coverage

## Scope

This testing slice covers the FE behavior introduced by Platform Fee V2:

- buyer order creation preview in `BikeDetailPage`
- buyer payment request and refund amount behavior in `BuyerOrdersView`
- admin payout `gross / fee deduction / net` rendering
- fee-aware helper functions used by FE pages

## Test Files

- [BikeDetailPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/BikeDetailPage.test.tsx)
  - verifies partial-order preview shows Policy V2 fee split
  - verifies the FE blocks partial upfront values below the seller-fee threshold
  - verifies Bike Detail now exposes real report entry points for both product and seller targets
- [reports.api.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/reports.api.test.ts)
  - verifies the report API helper sends multipart form data with target info, description, and evidence files
- [AdminReportsPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminReportsPage.test.tsx)
  - verifies admin report detail renders report evidence images
  - verifies the page still calls admin report listing with the current filters
- [MyReportsPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/MyReportsPage.test.tsx)
  - verifies the reporter can see their own uploaded report evidence images and admin note on the history page
- [report-flow.spec.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/tests/e2e/report-flow.spec.ts)
  - verifies a signed-in buyer can open the product report modal from `BikeDetailPage`
  - verifies the browser sends a real multipart report request with evidence file content
  - verifies the created report appears again in `MyReportsPage`
- [buyer-order-payment-refund-flow.spec.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/tests/e2e/buyer-order-payment-refund-flow.spec.ts)
  - verifies a signed-in buyer can create a partial order from `BikeDetailPage`
  - verifies the buyer can move to `BuyerOrdersView`, request payment instructions, and refresh the order into `held`
  - verifies the browser sends a real multipart refund request with uploaded refund evidence
- [BuyerOrdersView.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.test.tsx)
  - verifies buyer payment request breakdown shows `protectedAmount` and `buyerFeeAmount`
  - verifies refund requests use `buyerChargeAmount` instead of legacy `paidAmount`
  - verifies refund requests forward buyer-uploaded evidence files to the refund API
- [refunds.api.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/api/refunds.api.test.ts)
  - verifies the refund API helper sends multipart form data with amount, reason, note, and evidence files
- [PlatformFeeBuyerFlow.integration.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/tests/PlatformFeeBuyerFlow.integration.test.tsx)
  - verifies the buyer can move from `BikeDetailPage` order creation to `BuyerOrdersView` payment instructions
  - verifies the held-order refund request still uses `buyerChargeAmount` after the order state changes
- [AdminPayoutsPage.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/admin/AdminPayoutsPage.test.tsx)
  - verifies admin payout rows render fee-aware payout breakdown text
  - verifies profile reminder action still works
- [order-display.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/order-display.test.ts)
  - verifies fee-aware order display helpers and refund fallback logic
- [platform-fee-preview.test.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/platform-fee-preview.test.ts)
  - verifies FE preview math matches the current Policy V2 constants

## Commands Run

Focused FE verification:

```bash
npx eslint src/tests/PlatformFeeBuyerFlow.integration.test.tsx
npx vitest run src/tests/PlatformFeeBuyerFlow.integration.test.tsx
npx vitest run src/api/refunds.api.test.ts
npx vitest run src/api/reports.api.test.ts
npx vitest run src/pages/MyReportsPage.test.tsx
npx playwright test tests/e2e/report-flow.spec.ts
npx playwright test tests/e2e/buyer-order-payment-refund-flow.spec.ts
npx playwright test tests/e2e/report-flow.spec.ts tests/e2e/buyer-order-payment-refund-flow.spec.ts
npx eslint src/pages/BikeDetailPage.test.tsx src/components/profile/BuyerOrdersView.test.tsx
npx vitest run src/pages/BikeDetailPage.test.tsx src/components/profile/BuyerOrdersView.test.tsx
npx eslint src/api/reports.api.ts src/api/reports.api.test.ts src/components/common/ReportModal.tsx src/components/common/ReportEvidenceSection.tsx src/pages/admin/AdminReportsPage.tsx src/pages/admin/AdminReportsPage.test.tsx src/pages/MyReportsPage.tsx src/types/report.ts
npx vitest run src/pages/admin/AdminReportsPage.test.tsx
npx vitest run src/pages/admin/AdminPayoutsPage.test.tsx src/lib/order-display.test.ts src/lib/platform-fee-preview.test.ts
npx eslint src/pages/BikeDetailPage.tsx src/components/profile/BuyerOrdersView.tsx src/pages/admin/AdminPayoutsPage.tsx src/pages/seller/SellerOrdersPage.tsx src/pages/admin/AdminPayoutsPage.test.tsx src/lib/order-display.ts src/lib/order-display.test.ts src/lib/platform-fee-preview.ts src/lib/platform-fee-preview.test.ts src/types/order.ts src/types/payment.ts src/types/payout.ts
npm run build
```

## Results

- New mocked cross-page buyer-flow integration test: pass
- New page-level tests for buyer flow: pass
- New refund multipart API helper test: pass
- New report multipart API helper test: pass
- New admin report detail evidence rendering test: pass
- New my-reports evidence rendering test: pass
- New browser-level report flow E2E: pass
- New browser-level buyer order -> payment -> refund flow E2E: pass
- Existing focused helper/admin payout tests: pass
- Targeted ESLint on touched files: pass
- Production build: pass

## Remaining Gaps

- There is still no page-level FE test for the seller order card payout breakdown.
- There is still no browser-level E2E covering the seller payout/admin settlement side of Platform Fee V2.
- Full `npm run lint` for the repository still fails because of pre-existing unrelated errors in legacy files outside this slice.
