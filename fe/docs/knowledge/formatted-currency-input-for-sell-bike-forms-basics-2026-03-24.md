# Formatted Currency Input for Sell Bike Forms Basics

## What changed

- Added shared helper [currency-input.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/currency-input.ts) for:
  - stripping non-digit characters
  - formatting values with Vietnamese thousand separators
  - parsing formatted input back into numbers for API payloads
- Updated [SellBikePage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/SellBikePage.tsx) to:
  - format `price` and `originalPrice` while typing
  - submit numeric values after parsing the formatted string
  - show a short helper note under the selling price field
- Updated [SellerEditProductPage.tsx](/e:/Old_bicycle_system/old-bicycles-project/fe/src/pages/seller/SellerEditProductPage.tsx) to:
  - preload existing prices in formatted form
  - keep the same formatted-input behavior during editing
- Updated [sell-bike-form.ts](/e:/Old_bicycle_system/old-bicycles-project/fe/src/lib/sell-bike-form.ts) to validate formatted price strings correctly.

## FE flow

1. User types a price in the sell-bike form.
2. `handlePriceChange(...)` normalizes and formats the input immediately, for example `2500000` becomes `2.500.000`.
3. The formatted string stays in local React state, so the UI is easier to read.
4. When the user submits, `parseCurrencyInput(...)` converts the formatted string back into a plain number for the backend payload.
5. Validation uses the same parser, so formatted values still pass the existing sell-bike checks.

## Why

- Raw values like `2500000` are harder to read quickly, especially in marketplace pricing forms.
- Users need visual separation of large numbers without changing the backend contract.
