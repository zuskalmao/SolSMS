import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import GamblingPage from './pages/GamblingPage';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  
  return (
    <div className="relative bg-background text-white overflow-hidden">
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content with padding for fixed header */}
      <div className="pt-32">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/arena" element={<GamblingPage />} />
          </Routes>
        </AnimatePresence>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
