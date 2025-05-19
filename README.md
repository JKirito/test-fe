# Einstein - Knowledge Management Platform

Einstein is a modern web application designed to transform organizational knowledge into actionable insights. It provides a comprehensive suite of tools for project management, methodology standardization, and data visualization.

## Features

- **Curiosity** - AI-powered insights and recommendations for projects and pitches
- **Methods** - Standardized processes, templates, and best practice examples
- **Maps** - Geospatial visualization of projects and benchmarking analytics
- **Galileo** - Advanced project analytics and benchmarking tools
- **Micro View** - Detailed project-specific analysis and timeline visualization

## Technology Stack

### Frontend

- React 19 with TypeScript
- State Management: Redux Toolkit
- Data Fetching: TanStack Query (React Query)
- Routing: React Router DOM
- Styling: Tailwind CSS
- Charts: D3.js
- Maps: OpenLayers & Google Maps API
- Authentication: Azure MSAL

### Development Tools

- Build Tool: Craco (Create React App Configuration Override)
- Code Quality: ESLint, Prettier
- Testing: Jest
- Package Manager: npm/yarn

## Project Structure

```bash
src/
├── components/ # React components
│ ├── admin/ # Admin-related components
│ ├── benchmark/ # Analytics and benchmarking
│ ├── common/ # Shared components
│ ├── map/ # Map visualization
│ └── methodologies/ # Methodology management
├── lib/ # Core utilities
│ ├── config/ # Configuration files
│ └── store/ # Redux store setup
└── types/ # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js (LTS version)
- npm

### Installation

1. Clone the repository

```bash
git clone https://TBHDigitech@dev.azure.com/TBHDigitech/Einstein/_git/einstein-fe
cd einstein
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

```bash
cp .env.example .env
```

4. Start the development server

```bash
npm start
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run lint` - Runs ESLint
- `npm run format` - Formats code with Prettier

## End-to-End Testing

The project uses **Playwright** for e2e tests. Before running the tests, install
the Playwright browsers:

```bash
npx playwright install
```

Authentication is disabled during tests via the `REACT_APP_ENABLE_AUTH=false`
environment variable. Run the test suite with:

```bash
npm run test:e2e
```

This starts the dev server with auth disabled and executes the Playwright test
suite.

## Architecture

The application follows a modern React architecture with:

- Component-based structure
- Custom hooks for shared logic
- Context API for state management
- Responsive design principles
- TypeScript for type safety
