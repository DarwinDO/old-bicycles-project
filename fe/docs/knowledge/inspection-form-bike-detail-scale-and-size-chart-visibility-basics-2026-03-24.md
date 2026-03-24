# Inspection Form, Bike Detail Scale, and Size Chart Visibility Basics

## What changed

- Inspection form now loads product context through the inspection API instead of the public product detail API.
- Bike detail inspection scores now render on the same `1–5` scale used by the inspection form.
- Bike detail keeps showing the size-chart section when a product has a category:
  - if rows exist, it renders the size chart table
  - if rows do not exist, it renders an explicit empty-state message instead of silently disappearing

## Why

- Public product detail is supposed to hide listings that are not publicly visible yet.
- The detail page was inconsistent with inspection data by labeling sub-scores and overall score as `/10`.
- Users could not tell whether size chart data was missing or the UI had failed to load it.

## Impact

- Inspector flow no longer breaks with `Product not found`.
- Bike detail now matches the inspection scoring model.
- Size-chart visibility is clearer for categories that have not been configured yet.
