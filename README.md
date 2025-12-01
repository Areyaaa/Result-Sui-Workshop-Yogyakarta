# 🚀 SUI Workshop – Complete dApp Solution

A complete decentralized application (dApp) built on the **SUI Blockchain**, combining smart contracts and a modern web frontend. Features include wallet connection, faucet, dashboard, and escrow system.

---

## 🎨 Front End  
**Folder:** `Front End/`  
Built with **Next.js**, **TypeScript**, **TailwindCSS**, **Radix UI**, and **@mysten/dapp-kit**.

**Features**
- 🔐 Wallet Connection  
- 📊 Dashboard  
- 💧 Faucet (Claim test tokens)  
- 🔒 Escrow System  
- 📋 Escrow List  
- 🎨 Dark Theme & Responsive UI  

---

## 🔐 Smart Contract  
**Folder:** `Smarct Contract/Simple_escrow/`  
Written in **Move Language** and powered by the **Sui Framework**.

**Modules**
- `simple_escrow.move` – Escrow logic  
- `mock_tbtc.move` – Mock TBTC token  
- `mock_zsui.move` – Mock zSUI token  

**Capabilities**
- Create / hold / release escrow  
- Multi-token support  
- Event logging  

---

# 🚀 How to Run

  ### 1. Start the Frontend
    ```bash
    cd "Result Dapps on SUI/Front End"
    npm install
    npm run dev

  2. Deploy Smart Contract (Optional)
    cd "Result Dapps on SUI/Smarct Contract/Simple_escrow"
    sui move build
    sui move test
    sui client publish

  3. Configure Frontend With Deployed Contract

    Update contract address in:
    src/components/transaction/Escrow.tsx
    src/components/transaction/Faucet.tsx

📋 User Flow

Connect Wallet
View Dashboard
Claim Test Tokens
Create Escrow
Manage Escrows