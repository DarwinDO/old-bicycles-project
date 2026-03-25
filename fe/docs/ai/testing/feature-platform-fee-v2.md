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
- [BuyerOrdersView.test.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/components/profile/BuyerOrdersView.test.tsx)
  - verifies buyer payment request breakdown shows `protectedAmount` and `buyerFeeAmount`
  - verifies refund requests use `buyerChargeAmount` instead of legacy `paidAmount`
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
npx eslint src/pages/BikeDetailPage.test.tsx src/components/profile/BuyerOrdersView.test.tsx
npx vitest run src/pages/BikeDetailPage.test.tsx src/components/profile/BuyerOrdersView.test.tsx
npx vitest run src/pages/admin/AdminPayoutsPage.test.tsx src/lib/order-display.test.ts src/lib/platform-fee-preview.test.ts
npx eslint src/pages/BikeDetailPage.tsx src/components/profile/BuyerOrdersView.tsx src/pages/admin/AdminPayoutsPage.tsx src/pages/seller/SellerOrdersPage.tsx src/pages/admin/AdminPayoutsPage.test.tsx src/lib/order-display.ts src/lib/order-display.test.ts src/lib/platform-fee-preview.ts src/lib/platform-fee-preview.test.ts src/types/order.ts src/types/payment.ts src/types/payout.ts
npm run build
```

## Results

- New mocked cross-page buyer-flow integration test: pass
- New page-level tests for buyer flow: pass
- Existing focused helper/admin payout tests: pass
- Targeted ESLint on touched files: pass
- Production build: pass

## Remaining Gaps

- There is still no page-level FE test for the seller order card payout breakdown.
- There is still no browser-level E2E test stack such as Playwright covering the full buyer flow against a running app.
- Full `npm run lint` for the repository still fails because of pre-existing unrelated errors in legacy files outside this slice.
