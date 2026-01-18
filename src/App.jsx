import React, { useState, useEffect } from 'react';
import { Shield, Plus, Send, Search, CheckCircle, Package, Wallet, Loader, X, LogOut } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  
  const [medicineName, setMedicineName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [transferBatch, setTransferBatch] = useState('');
  const [newHolder, setNewHolder] = useState('');
  const [deliveryBatch, setDeliveryBatch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundMedicine, setFoundMedicine] = useState(null);

  const CONTRACT_ADDRESS = "0x573C0D90761D099d2bb71813BEe1610A66D063a6"; //Your Deployed Contract Address
  const SEPOLIA_CHAIN_ID = '0xaa36a7';

  const CONTRACT_ABI = [
    {"inputs": [{"internalType": "string", "name": "_name", "type": "string"},{"internalType": "uint256", "name": "_batchNumber", "type": "uint256"},{"internalType": "string", "name": "_manufacturer", "type": "string"}],"name": "createMedicine","outputs": [],"stateMutability": "nonpayable","type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_batchNumber", "type": "uint256"},{"internalType": "address", "name": "_newHolder", "type": "address"}],"name": "transferMedicine","outputs": [],"stateMutability": "nonpayable","type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_batchNumber", "type": "uint256"}],"name": "confirmDelivery","outputs": [],"stateMutability": "nonpayable","type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "_batchNumber", "type": "uint256"}],"name": "getMedicine","outputs": [{"internalType": "string", "name": "name", "type": "string"},{"internalType": "string", "name": "manufacturer", "type": "string"},{"internalType": "address", "name": "currentHolder", "type": "address"},{"internalType": "bool", "name": "isDelivered", "type": "bool"}],"stateMutability": "view","type": "function"}
  ];

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 7000);
  };

  const checkNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === SEPOLIA_CHAIN_ID;
    } catch (error) {
      return false;
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
          return true;
        } catch (addError) {
          showToast('Failed to add Sepolia network', 'error');
          return false;
        }
      }
      showToast('Failed to switch network', 'error');
      return false;
    }
  };

  const initializeContract = async (userAccount) => {
    try {
      const Web3 = window.Web3;
      const web3 = new Web3(window.ethereum);
      const contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setContract(contractInstance);
      setAccount(userAccount);
    } catch (error) {
      showToast('Failed to initialize contract', 'error');
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('🦊 MetaMask Not Detected!\n\nPlease install MetaMask extension to use this application.\n\nVisit: https://metamask.io/download/');
      return;
    }
    
    try {
      setLoading(true);
      
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        const switched = await switchToSepolia();
        if (!switched) {
          setLoading(false);
          return;
        }
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeContract(accounts[0]);
      showToast('Wallet connected successfully!', 'success');
    } catch (error) {
      if (error.code === 4001) {
        showToast('Connection rejected', 'error');
      } else {
        showToast('Failed to connect wallet', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount('');
    setContract(null);
    setShowAccountMenu(false);
    showToast('Wallet disconnected', 'success');
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (account) {
          initializeContract(accounts[0]);
          showToast('Account changed', 'success');
        }
      };

      const handleChainChanged = async () => {
        const isCorrectNetwork = await checkNetwork();
        if (!isCorrectNetwork && account) {
          showToast('Please switch to Sepolia network', 'error');
          setContract(null);
        } else if (isCorrectNetwork && account) {
          initializeContract(account);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const createMedicine = async () => {
    if (!contract) return showToast('Please connect wallet first', 'error');
    if (!medicineName || !batchNumber || !manufacturer) {
      return showToast('Please fill all fields', 'error');
    }
    
    try {
      setLoading(true);
      await contract.methods.createMedicine(medicineName, batchNumber, manufacturer).send({ from: account });
      showToast(`Medicine created! Batch: ${batchNumber}`, 'success');
      setMedicineName('');
      setBatchNumber('');
      setManufacturer('');
    } catch (error) {
      showToast(error.code === 4001 ? 'Transaction cancelled' : 'Transaction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const transferMedicine = async () => {
    if (!contract) return showToast('Please connect wallet first', 'error');
    if (!transferBatch || !newHolder) {
      return showToast('Please fill all fields', 'error');
    }
    
    try {
      setLoading(true);
      await contract.methods.transferMedicine(transferBatch, newHolder).send({ from: account });
      showToast('Medicine transferred successfully!', 'success');
      setTransferBatch('');
      setNewHolder('');
    } catch (error) {
      showToast(error.code === 4001 ? 'Transaction cancelled' : 'Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!contract) return showToast('Please connect wallet first', 'error');
    if (!deliveryBatch) {
      return showToast('Please enter batch number', 'error');
    }
    
    try {
      setLoading(true);
      await contract.methods.confirmDelivery(deliveryBatch).send({ from: account });
      showToast('Delivery confirmed successfully!', 'success');
      setDeliveryBatch('');
    } catch (error) {
      showToast(error.code === 4001 ? 'Transaction cancelled' : 'Confirmation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyMedicine = async () => {
    if (!contract) return showToast('Please connect wallet first', 'error');
    if (!searchQuery) {
      return showToast('Please enter batch number', 'error');
    }
    
    try {
      setLoading(true);
      const result = await contract.methods.getMedicine(searchQuery).call();
      setFoundMedicine({
        batchNumber: searchQuery,
        name: result[0],
        manufacturer: result[1],
        currentHolder: result[2],
        isDelivered: result[3]
      });
      showToast('Medicine verified successfully!', 'success');
    } catch (error) {
      showToast('Medicine not found or invalid batch number', 'error');
      setFoundMedicine(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAccountMenu && !e.target.closest('.account-menu')) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showAccountMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] animate-slide-in`}>
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1 font-medium">{toast.message}</p>
          <button onClick={() => setToast(null)} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-timer" />
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes timer {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-timer { animation: timer 7s linear; }
      `}</style>

      <header className="bg-white/80 backdrop-blur-xl shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">MediChain</h1>
                <p className="text-sm text-slate-600">Blockchain Medicine Tracking</p>
              </div>
            </div>
            
            {account ? (
              <div className="relative account-menu">
                <button 
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {account.slice(0,6)}...{account.slice(-4)}
                </button>
                
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500 mb-1">Connected Account</p>
                      <p className="text-sm font-mono text-slate-800 break-all">{account}</p>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full px-4 py-2 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                disabled={loading} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="bg-white/60 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3">
            {[
              { id: 'home', label: 'Home', icon: Package },
              { id: 'create', label: 'Create', icon: Plus },
              { id: 'transfer', label: 'Transfer', icon: Send },
              { id: 'verify', label: 'Verify', icon: Search }
            ].map(({ id, label, icon: Icon }) => (
              <button 
                key={id} 
                onClick={() => setActiveTab(id)} 
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'home' && (
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold text-slate-800">Welcome to MediChain</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">Secure, transparent medicine supply chain powered by Ethereum blockchain</p>
              <p className="text-lg text-slate-500 max-w-3xl mx-auto">Fighting counterfeit drugs through decentralized verification and immutable tracking</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: '10-30%', desc: 'of medicines in developing countries are counterfeit' },
                { title: '$200B+', desc: 'annual global loss from fake medicines' },
                { title: '1M+', desc: 'deaths annually from counterfeit drugs' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-slate-200">
                  <h3 className="text-4xl font-bold text-blue-600 mb-2">{stat.title}</h3>
                  <p className="text-slate-600">{stat.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Create Medicine', desc: 'Register medicines on blockchain with immutable records', icon: Plus, action: 'create' },
                { title: 'Transfer Ownership', desc: 'Secure transfers tracked at every step', icon: Send, action: 'transfer' },
                { title: 'Verify Authenticity', desc: 'Instant verification for patients and providers', icon: Search, action: 'verify' }
              ].map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(item.action)} 
                  className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl hover:scale-105 transition-all border border-slate-200"
                >
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 border border-slate-200">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-8">The Counterfeit Medicine Crisis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: '⚠️', title: 'The Problem', desc: 'Counterfeit medicines contain wrong ingredients, no active ingredients, or insufficient amounts, leading to treatment failure and death.' },
                  { icon: '🔗', title: 'Our Solution', desc: 'Blockchain creates an unalterable record of every medicine from manufacturer to patient, making counterfeiting virtually impossible.' },
                  { icon: '✅', title: 'The Impact', desc: 'Complete transparency, real-time tracking, and instant verification protect patients and restore trust in the pharmaceutical supply chain.' }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-5xl mb-4">{item.icon}</div>
                    <h4 className="text-xl font-bold text-blue-600 mb-3">{item.title}</h4>
                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 border border-slate-200">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-12">How MediChain Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { num: '1', title: 'Manufacture', desc: 'Pharmaceutical companies register medicines with unique batch numbers' },
                  { num: '2', title: 'Distribution', desc: 'Every transfer is recorded with timestamps and signatures' },
                  { num: '3', title: 'Verification', desc: 'Patients scan QR codes to verify authenticity instantly' },
                  { num: '4', title: 'Safety', desc: 'Complete visibility ensures only genuine medicines reach patients' }
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">{step.num}</div>
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h4>
                    <p className="text-slate-600 text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 border border-slate-200">
              <h3 className="text-3xl font-bold text-slate-800 text-center mb-8">Why Choose MediChain?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Shield, title: 'Immutable Records', desc: 'Data cannot be altered or tampered with' },
                  { icon: CheckCircle, title: 'Real-time Tracking', desc: 'Monitor medicine throughout supply chain' },
                  { icon: Package, title: 'Complete Transparency', desc: 'All stakeholders access verified data' },
                  { icon: Search, title: 'Instant Verification', desc: 'Patients verify authenticity in seconds' }
                ].map((item, i) => (
                  <div key={i} className="text-center p-4">
                    <item.icon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h4 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h4>
                    <p className="text-slate-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {!account && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-10 text-center">
                <h3 className="text-3xl font-bold mb-4">Ready to Secure Your Supply Chain?</h3>
                <p className="text-lg mb-6 opacity-90">Connect your wallet and start protecting patients from counterfeit medicines</p>
                <button 
                  onClick={connectWallet} 
                  className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:shadow-2xl transition-all inline-flex items-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Wallet to Get Started
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-3xl font-bold mb-6 text-slate-800">Create New Medicine</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Medicine Name</label>
                  <input 
                    type="text" 
                    value={medicineName} 
                    onChange={(e) => setMedicineName(e.target.value)} 
                    placeholder="e.g., Paracetamol 500mg" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch Number</label>
                  <input 
                    type="number" 
                    value={batchNumber} 
                    onChange={(e) => setBatchNumber(e.target.value)} 
                    placeholder="e.g., 123456" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Manufacturer</label>
                  <input 
                    type="text" 
                    value={manufacturer} 
                    onChange={(e) => setManufacturer(e.target.value)} 
                    placeholder="e.g., PharmaCorp Ltd" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <button 
                  onClick={createMedicine} 
                  disabled={loading || !account} 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> 
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create on Blockchain
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-3xl font-bold mb-6 text-slate-800">Transfer Medicine</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch Number</label>
                  <input 
                    type="number" 
                    value={transferBatch} 
                    onChange={(e) => setTransferBatch(e.target.value)} 
                    placeholder="Enter batch number" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Holder Address</label>
                  <input 
                    type="text" 
                    value={newHolder} 
                    onChange={(e) => setNewHolder(e.target.value)} 
                    placeholder="0x..." 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-mono text-sm transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <button 
                  onClick={transferMedicine} 
                  disabled={loading || !account} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Transfer Ownership
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Confirm Delivery</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Batch Number</label>
                  <input 
                    type="number" 
                    value={deliveryBatch} 
                    onChange={(e) => setDeliveryBatch(e.target.value)} 
                    placeholder="Enter batch number" 
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                    disabled={loading} 
                  />
                </div>
                <button 
                  onClick={confirmDelivery} 
                  disabled={loading || !account} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Delivery
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-slate-200">
              <h2 className="text-3xl font-bold mb-6 text-slate-800">Verify Medicine Authenticity</h2>
              <div className="flex gap-4 mb-8">
                <input 
                  type="number" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Enter batch number..." 
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" 
                  disabled={loading} 
                />
                <button 
                  onClick={verifyMedicine} 
                  disabled={loading || !account} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> 
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" /> 
                      Verify
                    </>
                  )}
                </button>
              </div>

              {foundMedicine && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 flex items-center gap-4">
                    <CheckCircle className="w-12 h-12 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-900">Medicine Verified!</h3>
                      <p className="text-emerald-700">Authentic medicine found on blockchain</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { label: 'Batch Number', value: foundMedicine.batchNumber },
                      { label: 'Medicine Name', value: foundMedicine.name },
                      { label: 'Manufacturer', value: foundMedicine.manufacturer },
                      { label: 'Current Holder', value: `${foundMedicine.currentHolder.slice(0,10)}...${foundMedicine.currentHolder.slice(-8)}` }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-700">Delivery Status</span>
                      <span className={`px-4 py-2 rounded-xl font-semibold ${foundMedicine.isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {foundMedicine.isDelivered ? '✓ Delivered' : '⏳ In Transit'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white/60 backdrop-blur-lg border-t border-slate-200 mt-16 py-6">
        <p className="text-center text-slate-600">© 2026 MediChain - Made with ❤️ by <i>Anshu</i> for secure healthcare </p>
      </footer>
    </div>
  );
}

export default App;