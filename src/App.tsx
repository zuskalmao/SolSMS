import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import NftMessaging from './components/NftMessaging';
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
  const endpoint = "https://ultra.swqos.solanavibestation.com/?api_key=f44bad87d7edfee78233ee056e80f961";
  
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
              <NftMessaging />
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
