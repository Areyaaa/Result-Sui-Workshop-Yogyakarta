# SUI Escrow Workshop - Yogyakarta 🚀

## Project Description
This project is a **Decentralized Escrow** platform built on the **SUI blockchain**. The application enables users to perform secure, peer-to-peer token swaps using on-chain smart contracts.

Version V2 has been refined by separating the **Frontend** and **Smart Contract** codebases, and implementing a **Wallet Login Gate** that requires users to connect their SUI wallet before accessing the main dashboard.

### Key Features:
- 🔐 **Wallet Gate**: Secure login using SUI Wallets (Suiet, Sui Wallet, etc.).
- 🔄 **Escrow Management**: Seamlessly create, accept, and cancel escrows.
- 💰 **Balance Tracker**: Real-time monitoring of SUI and various Mock Coin balances.
- 💧 **Faucet System**: Integrated system to claim dummy tokens for testing on the Testnet.

---

## Tech Stack
The application is built using a modern technology stack:

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router)
- **Blockchain Integration**: [@mysten/dapp-kit](https://sdk.mystenlabs.com/dapp-kit)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) with a Brutalist design aesthetic
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Smart Contract**: [SUI Move](https://sui.io/)
- **Icons**: Lucide React

---

## Installation Guide
Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/Areyaaa/Result-Sui-Workshop-Yogyakarta.git
cd Result-Sui-Workshop-Yogyakarta
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Build Smart Contracts (Optional)
Ensure you have the [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed.
```bash
cd ../smart-contract
sui move build
```

---

## How to Run
To run the application in development mode:

### Running the Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing Smart Contracts
To run unit tests for the smart contracts:
```bash
cd smart-contract
sui move test
```

Copyright © 2026 - Result SUI Workshop Yogyakarta
