# Currency Exchange Rate Dashboard

Angular dashboard for exploring live currency exchange rates, viewing historical conversion trends, and running quick currency conversions.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Run the Application](#run-the-application)
- [Usage Details](#usage-details)
- [Architecture Decisions](#architecture-decisions)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Build](#build)
- [Troubleshooting](#troubleshooting)

## Overview

This app provides:

- Base-currency selection using supported codes from the API.
- Latest exchange rate table for the selected base currency.
- Historical trends visualization.
- Currency conversion calculator.

Data is retrieved from ExchangeRate-API endpoints configured via environment files.

## Tech Stack

- Angular 22 (standalone components and router)
- Angular Material + CDK
- RxJS
- Chart.js (historical trends)
- Vitest (unit tests through Angular test runner)
- Cypress (e2e)

## Prerequisites

- Node.js 22+ (or a version compatible with Angular CLI 22)
- npm 11+

Check versions:

```bash
node -v
npm -v
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Configure API base URL:

- Development config is in `src/environments/environment.development.ts`.
- Default config is in `src/environments/environment.ts`.
- Set `apiUrl` to your ExchangeRate-API base URL.

Example:

```ts
export const environment = {
	apiUrl: 'https://v6.exchangerate-api.com/v6/<your-api-key>'
};
```

3. Start the app:

```bash
npm start
```

Open `http://localhost:4200/`.

## Run the Application

Available scripts:

- `npm start`: start Angular dev server.
- `npm run watch`: continuous development build.
- `npm run build`: production build.

## Usage Details

1. Open the dashboard.
2. Select a base currency from the dropdown (defaults to `MYR` when available).
3. Review latest exchange rates in the table component.
4. Use the historical trends section to inspect changes over time.
5. Use the conversion calculator to convert an amount from one currency to another.

### API Endpoints Used

- Supported codes: `GET {apiUrl}/codes`
- Latest rates: `GET {apiUrl}/latest/{baseCode}`
- Historical rates: `GET {apiUrl}/history/{baseCode}/{year}/{month}/{day}`
- Conversion: `GET {apiUrl}/pair/{from}/{to}/{amount}`

## Architecture Decisions

### 1) Standalone Angular Architecture

- The app uses Angular standalone components instead of NgModules.
- Benefits: lower boilerplate, clearer local dependencies, simpler feature composition.

### 2) Layered Feature Organization

- `core/`: shared models, reusable components, and cross-feature services.
- `features/dashboard/`: dashboard-specific UI, models, and services.
- `layouts/`: route shell and layout-level composition.

This separation keeps feature code cohesive while centralizing reusable primitives.

### 3) Environment-Based API Configuration

- API base URL is injected from environment files.
- Benefits: no hardcoded endpoints in components and easier environment switching.

### 4) Service-Driven Data Access

- API calls are encapsulated in services (`ExchangeRateService`, `DashboardService`).
- Benefits: thin UI components, easier mocking in tests, and single-point API changes.

### 5) Reactive UI State with Signals

- Dashboard component state (dropdown options and selected base currency) uses Angular signals/models.
- Benefits: explicit local reactivity and simpler state updates for component composition.

## Project Structure

```text
src/
	app/
		core/
			components/
			models/
			services/
		features/
			dashboard/
				pages/dashboard/
					components/
				services/
				models/
		layouts/
		app.config.ts
		app.routes.ts
	environments/
```

## Testing

### Unit Tests

Run all unit tests:

```bash
npm test
```

Run once (non-watch mode):

```bash
npm run test -- --watch=false
```

### End-to-End Tests

Run e2e suite headless:

```bash
npm run cypress:run
```

Open Cypress UI:

```bash
npm run cypress:open
```

## Build

Create production build:

```bash
npm run build
```

Output is generated in `dist/`.

Create staging build:

```bash
npm run build:staging
```

## CI/CD

The repository includes a GitHub Actions workflow at `.github/workflows/ci-cd.yml`.

- Pull requests and pushes run `lint`, `test`, and `build:staging`.
- Pushes to `main` also deploy the built app to the `staging` environment over SSH.

Configure these GitHub repository secrets before enabling staging deployment:

- `STAGING_API_URL`: API base URL that should be baked into the staging build.
- `STAGING_HOST`: SSH host for the staging server.
- `STAGING_USERNAME`: SSH user used for deployment.
- `STAGING_SSH_KEY`: private key with write access to the staging target.
- `STAGING_PATH`: remote directory that should receive the built files.

Optional repository variable:

- `STAGING_URL`: public URL shown on the GitHub Actions environment page.

## Troubleshooting

- App loads but no data appears:
	- Verify `apiUrl` and API key in environment configuration.
	- Check browser network responses for API status codes.
- Tests involving charts log canvas warnings in jsdom:
	- This can happen in unit-test environments and may not indicate functional failures.
- CORS or request failures:
	- Confirm your API plan and endpoint accessibility from the browser.
