import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

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
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

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
    <button
      onClick={handleInstall}
      className="fixed bottom-28 md:bottom-12 right-6 z-[70] flex items-center gap-3 bg-gradient-to-tr from-purple-600 to-blue-600 text-white px-5 py-3.5 rounded-2xl shadow-[0_15px_30px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all border border-white/20 animate-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-white/20 p-1.5 rounded-lg">
        <Download size={18} />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="font-black text-sm uppercase tracking-wider">Install App</span>
        <span className="text-[9px] opacity-70 font-bold uppercase tracking-widest mt-1">Free Download</span>
      </div>
    </button>
  );
}
