# 🏥 MediChain - Blockchain Medicine Tracking System

A decentralized application for tracking pharmaceutical supply chains on Ethereum blockchain, combating counterfeit medicines through transparent and immutable record-keeping.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://medichain-dapp.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://sepolia.etherscan.io/)

[Live Demo](https://medichain-dapp.vercel.app/) • [Smart Contract](https://sepolia.etherscan.io/address/0x573C0D90761D099d2bb71813BEe1610A66D063a6) • [Report Bug](https://github.com/anshujain0/medichain/issues)

---

## ✨ Features

- 🔐 Create and register medicines on blockchain with unique batch numbers
- 🔄 Transfer ownership across the supply chain with complete traceability
- ✅ Confirm delivery and update medicine status in real-time
- 🔍 Verify medicine authenticity instantly
- 📊 Immutable audit trail for complete transparency
- 🌐 Decentralized and tamper-proof record system

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Lucide React  
**Blockchain:** Ethereum (Sepolia Testnet), Solidity, Web3.js  
**Deployment:** Vercel, GitHub

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH ([Get from faucet](https://sepoliafaucet.com))

### Installation
```bash
# Clone the repository
git clone https://github.com/anshujain0/medichain.git

# Navigate to project directory
cd medichain-app

# Install dependencies
npm install

# Install Tailwind CSS and related packages
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize Tailwind CSS
npx tailwindcss init -p

# Install Web3.js for blockchain interaction
npm install web3

# Install Lucide React for icons
npm install lucide-react

# Single Command Installation
npm install && npm install -D tailwindcss@3 postcss autoprefixer && npm install web3 lucide-react && npx tailwindcss init -p

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Tailwind CSS Configuration

After running `npx tailwindcss init -p`, update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Web3.js Configuration

Add Web3.js CDN to `index.html` (before closing `</body>` tag):
```html
<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
```

### Smart Contract Configuration

Update the contract address in `src/App.jsx`:
```javascript
const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
```

---

## 📁 Project Structure
```
medichain-app/
├── contracts/
│   └── MedicineSupplyChain.sol     # Smart contract source code                
├── public/
│   └── logo.svg                    # Application logo
├── src/
│   ├── App.jsx                     # Main application component
│   ├── index.css                   # Global styles & Tailwind imports
│   └── main.jsx                    # Application entry point
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML template with Web3 CDN
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite configuration
└── README.md                       # Project documentation
```

---

## 🔐 Smart Contract

### Deployment Information

- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** `0xYourContractAddress`
- **Compiler:** Solidity ^0.8.0
- **View on Etherscan:** [Link](https://sepolia.etherscan.io/address/0x573C0D90761D099d2bb71813BEe1610A66D063a6)

### Contract Source Code

Located in `contracts/MedicineSupplyChain.sol`:

### Deploy Your Own Contract

**Using Remix IDE:**

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `MedicineSupplyChain.sol`
3. Copy contract code from `contracts/MedicineSupplyChain.sol`
4. Compile with Solidity ^0.8.0
5. Deploy using "Injected Provider - MetaMask" on Sepolia testnet
6. Copy deployed contract address
7. Update `CONTRACT_ADDRESS` in `src/App.jsx`

**Get Sepolia ETH:**
- [Sepolia Faucet](https://sepoliafaucet.com)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

---

## 💻 Usage

### For Manufacturers

1. Connect MetaMask wallet to Sepolia network
2. Navigate to **Create** tab
3. Enter medicine details (name, batch number, manufacturer)
4. Click "Create on Blockchain" and confirm transaction
5. Medicine is now registered on blockchain

### For Supply Chain Partners

1. Navigate to **Transfer** tab
2. Enter batch number and new holder's Ethereum address
3. Click "Transfer Ownership" and confirm transaction
4. Ownership is transferred with immutable record

### For End Users (Patients)

1. Navigate to **Verify** tab
2. Enter batch number from medicine packaging
3. Click "Verify"
4. View complete medicine information and authenticity status

---

## 🔧 Troubleshooting

### Common Issues

**1. Tailwind styles not working:**
```bash
# Ensure Tailwind is properly installed
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# Check tailwind.config.js content paths
# Check src/index.css has @tailwind directives
```

**2. Web3 not defined:**
```html
<!-- Ensure this is in index.html before </body> -->
<script src="https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js"></script>
```

**3. Icons not displaying:**
```bash
# Reinstall lucide-react
npm install lucide-react
```

**4. MetaMask connection fails:**
- Ensure MetaMask is installed
- Switch to Sepolia testnet
- Refresh page and try again

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Your Name**  
Anshu Jain

- GitHub: [@anshujain0](https://github.com/anshujain0)
- Email: jainanshu814@gmail.com
- LinkedIn: [Anshu Jain](https://linkedin.com/in/anshu-jain-639aj)

---

## 🙏 Acknowledgments

- [Ethereum](https://ethereum.org/) - Blockchain platform
- [OpenZeppelin](https://openzeppelin.com/) - Smart contract standards
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Web3.js](https://web3js.org/) - Ethereum JavaScript API

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for fighting counterfeit medicines

</div>
