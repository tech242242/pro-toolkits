import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed/in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
      console.log('PWA prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsStandalone(true);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ 
          y: 0, 
          opacity: 1, 
          scale: 1,
          transition: { type: "spring", damping: 15, stiffness: 300 }
        }}
        exit={{ y: 100, opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstall}
        className="fixed bottom-28 md:bottom-12 right-4 md:right-8 z-[100] flex items-center gap-3 bg-gradient-to-tr from-[#7C3AED]/90 via-[#8B5CF6]/90 to-[#6366F1]/90 backdrop-blur-xl text-white px-6 py-4 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.3)] border border-white/30 overflow-hidden group min-w-[180px]"
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Floating Particles/Sparkles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-60">
          <motion.div 
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5], opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full blur-[0.5px]"
          />
          <motion.div 
            animate={{ y: [12, -12, 12], x: [8, -8, 8], opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute bottom-3 right-10 w-1.5 h-1.5 bg-cyan-300 rounded-full blur-[1px]"
          />
        </div>

        {/* Shine Sweep */}
        <motion.div 
          animate={{ x: ['-250%', '500%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12"
        />

        {/* Pulse Aura */}
        <motion.div 
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20"
        />

        <div className="bg-white/30 backdrop-blur-md p-2.5 rounded-2xl relative z-10 border border-white/40 shadow-xl group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-300">
          <Download size={22} className="stroke-[3.5px] drop-shadow-md text-white" />
        </div>
        
        <div className="flex flex-col items-start leading-tight relative z-10 select-none">
          <span className="font-black text-xs md:text-base uppercase tracking-[0.1em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">INSTALL APP</span>
          <div className="flex items-center gap-2">
             <span className="text-[9px] md:text-[11px] opacity-90 font-black uppercase tracking-[0.2em] mt-0.5 text-cyan-200">OFFICIAL PRO</span>
             <motion.div 
               animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="text-[10px] md:text-sm text-yellow-300 font-bold"
             >✨</motion.div>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
