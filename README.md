# PRUNplanner Frontend

Welcome to the next major version of PRUNplanner, now open-sourced and community-driven! After years of developing PRUNplanner—the empire and base management tool for Prosperous Universe—on my own, I've decided to make the frontend rework public. This new version leverages the already public [PRUNplanner API](https://api.prunplanner.org/docs) to create an enhanced user experience.

## Preview

[![Netlify Status](https://api.netlify.com/api/v1/badges/1a2b21d7-e057-4d2c-8533-425bdb5f2429/deploy-status)](http://preview.prunplanner.org/)

Development previews are powered by Netlify: [http://preview.prunplanner.org/](http://preview.prunplanner.org/)

Please Note, v2 uses the production backend. Changes made in the preview will be persisted to the database as if you would work with prunplanner.org. It is currently not served with HTTPS.

## Stack

- [Vue3](https://vuejs.org/)
- [Vite](https://vite.dev/)
- Typescript
- [Axios](https://axios-http.com/) for backend calls
- [Zod](https://zod.dev/) for data validation
- [Vitest](https://vitest.dev/) as testing framework

# Development

Install dependencies with `pnpm install` and run the vite development:

```shell
pnpm run dev
```

## Testing and Coverage

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/23225951d9584a80b51256487975453b)](https://app.codacy.com/gh/PRUNplanner/frontend/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)

PRUNplanners frontend currently lacks proper and full-scope testing of its non-visual features and data validation. One aim of this rewrite is to reach full test coverage and `zod` validation.

Backend calls can be mocked easily with [axios-mock-adapter](https://github.com/ctimmerm/axios-mock-adapter).

```shell
# Run tests
pnpm run test

# Or use vitest-ui
pnpm run test:ui
```

## .env

| Key                               | Type   | Default Value                    |
| --------------------------------- | ------ | -------------------------------- |
| VITE_APP_VERSION                  | string | "0.xx"                           |
| VITE_API_BASE_URL                 | string | "https://api.prunplanner.org"    |
| VITE_SHARE_BASE_URL               | string | "https://prunplanner.org/shared" |
| VITE_GAME_DATA_STALE_MINUTES_BUILDINGS | int    | 1440                             |
| VITE_GAME_DATA_STALE_MINUTES_RECIPES   | int    | 1440                             |
| VITE_GAME_DATA_STALE_MINUTES_MATERIALS | int    | 1440                             |
| VITE_GAME_DATA_STALE_MINUTES_EXCHANGES | int    | 30                               |
| VITE_GAME_DATA_STALE_MINUTES_PLANETS   | int    | 180                              |


## Highcharts

PRUNplanner is allowed to use [Highcharts](https://www.highcharts.com/) as it got a license certificate granted for its `Core` and `Stock` libraries. If you want to use this repository outside of local development, please ensure to follow the Highcharts license terms and conditions that might apply.
