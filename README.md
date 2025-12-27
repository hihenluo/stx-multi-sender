# 🚀 STX Multi-Sender Airdrop

![Stacks](https://img.shields.io/badge/Chain-Stacks-5546FF?style=for-the-badge&logo=stacks&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Styling-Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**STX Multi-Sender** is a professional dApp designed to distribute native **STX tokens** to multiple wallet addresses in a single transaction.  
Built for **Stacks Mainnet**, leveraging a custom **Clarity smart contract** for efficiency and security.

---

## ✨ Features

- **Bulk Distribution** — Send STX to up to **50 addresses** in one transaction  
- **Batch Protection** — Minimum **5 recipients** to prevent spam  
- **Native Wallet Support** — Works with **Xverse**, **Leather**, and other Stacks wallets via `@stacks/connect`  
- **Real-time Validation** — Automatic address validation (SP prefix)  
- **Transparent Execution** — Direct transaction links to **Stacks Explorer**

---

## 🛠️ Tech Stack

| Component | Technology |
|--------|------------|
| **Blockchain** | Stacks (Bitcoin L2) |
| **Smart Contract** | Clarity |
| **Frontend** | React + Vite |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Wallet Connection** | `@stacks/connect`, Reown AppKit |

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/hihenluo/stx-multi-sender.git
cd stx-multi-sender
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_PROJECT_ID=your_reown_project_id
```

### 4️⃣ Run Development Server
```bash
npm run dev
```

---

## 📜 Smart Contract Details

- **Network**: Stacks Mainnet  
- **Contract Address**:
```
SP32YN03PMDGXQA9HYEZS2WBAT32AZKDJTBAPF4T
```
- **Contract Name**: `stx-multi-send`
- **Function**: `airdrop-stx`

### Logic Constraints
- **Minimum Recipients**: 5  
- **Maximum Recipients**: 50  
- **Unit**: micro-STX (10⁶)

---

## 🤝 Contributing

1. Fork the project  
2. Create your feature branch  
   ```bash
   git checkout -b feature/CoolFeature
   ```
3. Commit your changes  
   ```bash
   git commit -m "feat: add cool feature"
   ```
4. Push to the branch  
   ```bash
   git push origin feature/CoolFeature
   ```
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**.

<p align="center">
  Built with 🧡 for the Stacks Ecosystem
</p>
