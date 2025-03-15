import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import GamblingPage from './pages/GamblingPage';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorTrail, setCursorTrail] = useState<{ x: number; y: number; opacity: number; id: number }[]>([]);
  const [isPointerOverClickable, setIsPointerOverClickable] = useState(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const cursorTrailIdRef = useRef(0);

  // Enhanced cursor effect with continuous trail animation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setCursorPosition({ x: clientX, y: clientY });
      lastPositionRef.current = { x: clientX, y: clientY };

      // Add new position to trail with full opacity and unique ID
      setCursorTrail(prev => {
        const newId = cursorTrailIdRef.current++;
        const newTrail = [{ x: clientX, y: clientY, opacity: 1, id: newId }, ...prev.slice(0, 15)];
        
        // Update opacity of older trail items
        return newTrail.map((point, index) => ({
          ...point,
          opacity: Math.max(0, 1 - index * 0.07)
        }));
      });
      
      // Check if mouse is over clickable element
      const element = document.elementFromPoint(clientX, clientY);
      const isClickable = element?.closest('a, button, [role="button"], .cursor-pointer') !== null;
      setIsPointerOverClickable(isClickable);
    };

    // Continuous animation for cursor trail when not moving
    const animateTrailInterval = setInterval(() => {
      setCursorTrail(prev => {
        if (prev.length === 0) return prev;
        
        return prev.map((point, index) => {
          // Gradually move points toward cursor position
          let newX = point.x;
          let newY = point.y;
          
          // For points that aren't the cursor position itself
          if (index > 0) {
            // Move toward the next point in the trail (which is closer to the cursor)
            const targetPoint = prev[index - 1];
            const speed = 0.05 + (index * 0.01); // Higher index = faster movement
            
            newX = point.x + (targetPoint.x - point.x) * speed;
            newY = point.y + (targetPoint.y - point.y) * speed;
          } else if (index === 0 && prev.length === 1) {
            // If only one point, make it pulse/move slightly
            const angle = Date.now() * 0.002;
            newX = lastPositionRef.current.x + Math.sin(angle) * 3;
            newY = lastPositionRef.current.y + Math.cos(angle) * 3;
          }
          
          // Gradually reduce opacity for all points
          const newOpacity = Math.max(0, point.opacity - 0.01);
          
          return {
            ...point,
            x: newX,
            y: newY,
            opacity: newOpacity
          };
        }).filter(point => point.opacity > 0.03); // Remove nearly invisible points
      });
    }, 20); // Update at 50fps

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(animateTrailInterval);
    };
  }, []);

  return (
    <div className="relative bg-background text-white overflow-hidden">
      {/* Enhanced custom cursor with trail effect */}
      <div 
        className={`cursor-dot fixed w-6 h-6 rounded-full backdrop-blur-sm z-[9999] pointer-events-none mix-blend-screen hidden md:block ${
          isPointerOverClickable ? 'bg-primary scale-125' : 'bg-primary/50'
        }`}
        style={{ 
          left: `${cursorPosition.x}px`, 
          top: `${cursorPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 20px 5px rgba(138, 43, 226, 0.4)',
          transition: 'background-color 0.2s, transform 0.2s'
        }}
      >
        <div className="absolute inset-0 rounded-full border border-white/40 animate-ping"></div>
      </div>
      
      {/* Continuously animated cursor trail */}
      {cursorTrail.map((point) => (
        <div 
          key={point.id}
          className="fixed rounded-full pointer-events-none hidden md:block"
          style={{ 
            left: `${point.x}px`, 
            top: `${point.y}px`,
            width: `${Math.max(5, 20 - cursorTrail.indexOf(point) * 1.3)}px`,
            height: `${Math.max(5, 20 - cursorTrail.indexOf(point) * 1.3)}px`,
            opacity: point.opacity * 0.6,
            backgroundColor: point.id % 2 ? 'rgba(138, 43, 226, 0.4)' : 'rgba(255, 105, 180, 0.4)',
            transform: 'translate(-50%, -50%)',
            transition: 'width 0.2s, height 0.2s',
            zIndex: 9000 - cursorTrail.indexOf(point)
          }}
        />
      ))}
      
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content with padding for fixed header      {/* Main Content with padding for fixed header */}
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
