# 2025-09-15 - v. 0.20.1

- UI Tweaks on Buttons, Checkbox and XIT Transfer Action
- Skip unknown recipes gracefully
- Skip amount precision on Material Tiles
- Add 500/500 starter ship to XIT Burn Cargo Matching
- Reduce PostHog API Call tracking
- Sort Plan Recipe options alphabetically by output tickers

# 2025-09-12

- Upgrade versioning to 0.20 to match current PRUNplanner versioning

# 2025-09-11

- FIO Burn XIT Action now allows to easily match set ship sizes to maximes days based on cargo availability [#235](https://github.com/PRUNplanner/frontend/issues/235)


# 2025-09-10

- Authenticated users are able to clone shared plans
- Layout adjustments on views for non-authenticated users
- Dockerize PostHog setup for official frontend Docker builds
- Dependency updates / security updates
- Remove getPrice internal caching
- POPR Button shows "No POPR" if no report is available [#244](https://github.com/PRUNplanner/frontend/issues/244)
- Resource ROI: streamline environment parameters, add infrastructures and active COGC [#249](https://github.com/PRUNplanner/frontend/issues/249)

# 2025-09-08

- Implements password reset functions
- Streamline navigation: Market and FIO don't have sub-links but are displayed directly
- Adds Browser Storage overview and size estimation to profile view

# 2025-09-07

- Introduces measure to know if user is active, is user has gone inactive delay auto refetching for up to 3 hours [#237](https://github.com/PRUNplanner/frontend/issues/237)
- Remove NSpin in favor of own spinner component PSpin
- Fixes issue with PriceAverages being null on markets where no trading happened
- Displays Age of FIO Data in views and mouseover of "FIO Active" tag [#240](https://github.com/PRUNplanner/frontend/issues/240)

# 2025-09-05

- Rework Login component
- Add Registration component [#6](https://github.com/PRUNplanner/frontend/issues/6)
- Expand Homepage, add screenshots and slight text changes

# 2025-09-04

- Fix icon-only button alignments [#232](https://github.com/PRUNplanner/frontend/issues/232)
- Add tooltip to "Corp. HQ" checkbox in plans [#227](https://github.com/PRUNplanner/frontend/issues/227)
- Add building ticker to plans planet materials [#233](https://github.com/PRUNplanner/frontend/issues/233)
- Add Help View contents
