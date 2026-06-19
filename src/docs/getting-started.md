# Getting Started

This guide walks you through setting up StepFi for development and contributing to the project.

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **Freighter Wallet** browser extension
- **Git**

## Clone the Repository

```bash
git clone https://github.com/StepFi-app/StepFi-Web.git
cd StepFi-Web
```

## Install Dependencies

```bash
npm install
```

## Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default values point to the StepFi testnet API:

```env
VITE_API_BASE_URL=https://stepfi-api.onrender.com/api/v1
VITE_STELLAR_NETWORK=TESTNET
```

## Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Build for Production

```bash
npm run build
```

This runs the TypeScript compiler followed by Vite bundling. Output goes to `dist/`.

## Project Structure

```text
src/
├── components/       # Reusable UI components
│   ├── layout/       # Navbar, Footer, Layout
│   └── ui/           # Button, Card, Badge, Spinner, Toast
├── pages/            # Route page components
├── hooks/            # Custom React hooks
├── services/         # API service modules
├── stores/           # Zustand state stores
├── types/            # TypeScript type definitions
├── constants/        # Config, contract IDs, colors
└── router/           # React Router config
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + Vite build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm run test:a11y` | Run axe-core accessibility scan |

## Connect Your Wallet

1. Install the [Freighter Wallet](https://freighter.app) browser extension
2. Create a new wallet or import an existing one
3. Switch to **Testnet** in Freighter settings
4. Fund your wallet using the [Stellar Lab](https://lab.stellar.org/account/fund)

```typescript
// Example: Connecting with Freighter
import { isConnected, requestAccess } from '@stellar/freighter-api'

async function connect() {
  const { isConnected: connected } = await isConnected()
  if (!connected) {
    const { error } = await requestAccess()
    if (error) throw new Error(error.message)
  }
}
```
