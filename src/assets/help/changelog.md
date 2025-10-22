# 2025-10-22 - v 0.20.4

- Add Profit/Area calculation for all recipes in selector dropdown based on an optimal setup, also adds metric to plans overview [[PR-290]](https://github.com/PRUNplanner/frontend/pull/290)
- Updated materials and system lists to latest ingame version [[PR-292]](https://github.com/PRUNplanner/frontend/pull/292)
- Small UI / responsiveness improvements

# 2025-09-25 - v. 0.20.3

- Fix a Bug where Infrastructures or Experts could not be set to 0 [[#277]](https://github.com/PRUNplanner/frontend/pull/277)
- Remove Output Profit from ROI Overview Table [[PR-280]](https://github.com/PRUNplanner/frontend/pull/280)
- Replace more Naive UI with own componenents: Table [[#273]](https://github.com/PRUNplanner/frontend/pull/273), Icons [[#275]](https://github.com/PRUNplanner/frontend/pull/275)
- Add appreciations for PostHog and Highcharts to Homepage [[#274]](https://github.com/PRUNplanner/frontend/pull/274)


# 2025-09-22 - v. 0.20.2

- Separate app and database versioning to improve behavior during new releases [[#263]](https://github.com/PRUNplanner/frontend/issues/263)
- Enhanced construction cart: materials are now listed separately and FIO storage is displayed [[#252]](https://github.com/PRUNplanner/frontend/issues/252)
- Prevent invalid COGC from populating plan data on creation [[#261]](https://github.com/PRUNplanner/frontend/issues/261)
- Repair Analysis now also shows plan materials for the selected day [[#269]](https://github.com/PRUNplanner/frontend/issues/269)
- Added a notice to the Supply Cart when FIO is enabled [[PR-#271]](https://github.com/PRUNplanner/frontend/pull/271)
- Improved data sanitization in Market Exploration Charts [[#193]](https://github.com/PRUNplanner/frontend/issues/193)
- Resource / Recipe ROI: added Profit per Area metric and increased parallelism to 64 [[#207]](https://github.com/PRUNplanner/frontend/issues/207)


# 2025-09-15 - v. 0.20.1

- UI Tweaks on Buttons, Checkbox and XIT Transfer Action
- Skip unknown recipes gracefully
- Skip amount precision on Material Tiles
- Add 500/500 starter ship to XIT Burn Cargo Matching
- Reduce PostHog API Call tracking
- Sort Plan Recipe options alphabetically by output tickers
