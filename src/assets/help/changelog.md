# 2025-09-02

- Provide option and style to collapse navigation

# 2025-09-01

- Improve Resource ROI calculation performance with parallel executions
- Add key-attribute to MaterialTiles were missing
- Fix cursor and z-index on Material Tiles [#221](https://github.com/PRUNplanner/frontend/issues/221), limit recipe dropdown width [#223](https://github.com/PRUNplanner/frontend/issues/223)
- Uses Exchange Data from IndexedDB instead of Pinia [PR-224](https://github.com/PRUNplanner/frontend/pull/224)


# 2025-08-30

- Rework Empire / FIO Burn loading behavior, full parallel execution, overlay on computation. Replicate visual for ROI and Resource ROI.
- Introduce PProgressBar component to UI.
- Fix wrong material colors in Planet Search environment materials.
- "Cache" calculated plan within empire + exchange, so accessing the result again won't trigger recalculation.

# 2025-08-30

- Rewrite data logics for Buildings and Recipes to use IndexedDB instead of Pinia + localStorage.
- Adds current frontend package version to headline, also adds as global parameter on Posthog events.
- Add SourceMap on build during Preview phase.
- Empire View calculates plans that are in multiple empires only once, add Keys to Empire Material I/O tiles.
- Market Exploration now forces a material preload on mounting the view.

# 2025-08-29

- Fixes ROI Overview calculation by isolating per-item plan state to prevent parallel mutation conflicts.
- Improve HQ upgrade calculator by using using a regular computed expression.
- Adjust paddings and spacing on Plan view and Navigation

# 2025-08-28

- Introduces first parts and core logic to have PRUNplanner use IndexedDB instead of localStorage to persist data. This firstly only involves storing Planets and Materials. You'll notice that some behaviour is different as calculation work will be done asynchronously as well. The goal is to fully replace Pinia for storing Game Data soon and building the foundation for cross-tab syncing via Broadcasts eventually. Learn more about it in the [PR-210](https://github.com/PRUNplanner/frontend/pull/210)
- Refactors greatly to make use of Material data from IndexedDB. Also already stores recipe and building data in tables without yet using it [PR-211](https://github.com/PRUNplanner/frontend/pull/211)

# 2025-08-27

- Implement Exchange Preference updates directly from Plan COGM
- Add charts for empire analysis

# 2025-08-26

- Skip Version frontend version check if user is not logged in, set current version on login [#205](https://github.com/PRUNplanner/frontend/issues/205)
- Disable cross-tab store broadcasting and query store persistance until further testing is done

# 2025-08-25

- Updates to ROI and Resource ROI Overview Help texts (by `lowstrife`)
- Implements the Production Chain Tool [#127](https://github.com/PRUNplanner/frontend/issues/127)
- Reworked cross-tab sync in favor of Web Workers, shifting load to a background thread.

# 2025-08-24

- The backend communication layer has been restructured to be key-based rather than using direct function calls, improving handling and enabling more predictable state management.
- Added functionality to persist Query, Game, and Planning data so that users’ data state is maintained across browser sessions. Additionally, static data is now broadcasted across all open tabs in the same browser.

# 2025-08-23

- Fixes an issue in HQ Upgrade Calculations were the starting level was wrongly part of the material list (by `skiedude`)

# 2025-08-22

- Fixes a bug where Planet Search material results were not sortable. This also identified a potential backend issue where searching for more than 2 materials returns results that actually don't hold the materials searched for. Currently the frontend limits to search for maximum of 2 resources until the API handling of the search query was investigated and potentially fixed.
- Selection dropdowns now close on any outside click and reset their search value on close
- Selection dropdowns now have keyboard navigation and value change
- Removes more unused naive-ui types and components from various views
- Fixes a bug on COGM calculation where the recipe runtime depended on the amount the recipe did run in a building instead of its regular runtime on current efficiency
- Adds Help text to Market Exploration (by `lowstrife`)

# 2025-08-21

- Reenables moduleSideEffect treeshaking to properly have Highcharts render Stockcharts [#190](https://github.com/PRUNplanner/frontend/issues/190)
- Fixes the issue where Exchange information on Material Tiles did not get properly updated in the DOM
- Adds Profile Updating & Password Change [#13](https://github.com/PRUNplanner/frontend/issues/13)

# 2025-08-20

- Improve Vite build and chunking
- Fix zero material elements on XIT Transfer as it breaks the Action [#183](https://github.com/PRUNplanner/frontend/issues/183)
- Introduce a `version.json` in Vite build, notify users on new versions to reload page

# 2025-08-19

- Replaces many `naive-ui` components with an own implementation of UI components mainly to save rendering and calculation times.
- Fixes a bug where spaces in plan names were not working [#175](https://github.com/PRUNplanner/frontend/issues/175)
- Fixes the visual bug on patching CX preferences not being displayed correctly [#135](https://github.com/PRUNplanner/frontend/issues/135)
- Handle 404 / "No results found" on Planet Search [#179](https://github.com/PRUNplanner/frontend/issues/179)
- Populates cached data from list results, e.g. all empire plans, fetching multiple planets to avoid another backend call on accessing individual data. This is experimental, but could lead to faster loading times for plans as their data and planet is already populated from accessing the empire overview.
- Capture additional events with PostHog in order to validate v2 progress and usage

# 2025-08-15

- Fix an issue where XIT actions on Construction and Supply Cart have wrong action names

# 2025-08-14

- Add user preference for XIT "Buy from CX" (by `lilbit-prun`) [#164](https://github.com/PRUNplanner/frontend/pull/164)
- Improve Material Tiles with fixed width/height, text and gradient colors mirroring prun/rprun and text shadow (by `Razenpok`) [#163](https://github.com/PRUNplanner/frontend/pull/163)
- Refactor multiple filter parts of views into separate components
- Adjust text-wrapping and column widths on Empire and Management tables
- Allow filtering of assignment table records on Management

# 2025-08-13

- Fixed an issue where production building recipe selection did not take into account the buildings efficiency on revenue / day and roi metrics (by `lilbit-prun`)
- Add "Buy From CX" option for XIT Actions for FIO Burn (by `lilbit-prun`)
- Implement Resource ROI Overview [#130](https://github.com/PRUNplanner/frontend/issues/130)
- Fix a bug where plan changes would automatically retrigger habitation optimization calls to the backend [#157](https://github.com/PRUNplanner/frontend/issues/157)

# 2025-08-12

- Implement ROI Overview for production buildings and their recipes [#129](https://github.com/PRUNplanner/frontend/issues/129), enhance COGM with total profits and visitation frequency calculations
- Add style for material `HBC`
- Add type checking capability with `tsc` and `tsc:watch` commands using `vue-tsc` [#146](https://github.com/PRUNplanner/frontend/issues/146)
- Fixed an issue where deselecting materials on XIT Burn did not properly affect the calculated total weight and volume [#150](https://github.com/PRUNplanner/frontend/issues/150)
- Small color adjustments and row-wrapping

# 2025-08-11

- Add Help & Changelog page, listing most recent changes
- Implement COGM calculations and modal on plan active recipes, excluding ability to change ticker preferences for now [#27](https://github.com/PRUNplanner/frontend/issues/27)
- Fix Benten manufacturing faction bonus (by `lilbit-prun`) [#142](https://github.com/PRUNplanner/frontend/pull/142)

# 2025-08-10

- Add CX Data popover on material tiles [#140](https://github.com/PRUNplanner/frontend/issues/140)

# 2025-08-08

- Fix an issue where adding a recipe produces a lag due to gamedata wrappers being retriggered on MaterialTiles
- Reduces the usage of `watch` in favor of `computed` [#138](https://github.com/PRUNplanner/frontend/issues/137)

# 2028-08-07

- Implement HQ Upgrade Cost Calculator [#128](https://github.com/PRUNplanner/frontend/issues/128)

