import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import TokenMessaging from './components/NftMessaging';
import Tokenomics from './components/Tokenomics';
import Community from './components/Community';
import Footer from './components/Footer';
import ParticleEffect from './components/animations/ParticleEffect';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  // Set up Solana network and wallet
  const network = WalletAdapterNetwork.Mainnet;
  
  // Using custom RPC endpoint instead of default endpoint
  // Changed to HTTPS to avoid mixed content errors
  const endpoint = "https://mainnet.helius-rpc.com/?api-key=6cff9786-2818-4559-9def-e02867a6fa47";
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App min-h-screen flex flex-col bg-dark">
            <ParticleEffect />
            <Header />
            <main>
              <Hero />
              <Features />
              <TokenMessaging />
              <Tokenomics />
              <Community />
            </main>
            <Footer />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
