'use client';

import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function QRCodeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user } = useAuth();
  
  // Real dynamic household/citizen data from DB
  const qrData = JSON.stringify({ 
    userId: user?.id, 
    name: `${user?.firstName} ${user?.lastName}`,
    role: user?.role
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass-panel rounded-3xl border border-border shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" /> My QR Code
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 flex flex-col items-center bg-muted/50">
              <div className="bg-white p-4 rounded-2xl shadow-xl shadow-primary/10">
                <QRCodeSVG value={qrData} size={200} level="H" includeMargin={false} />
              </div>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Show this QR code to the sanitation worker during waste collection to earn green points.
              </p>
              <div className="mt-4 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-sm font-bold tracking-widest truncate max-w-full">
                {user?.firstName} | {user?.id?.substring(0, 8)}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

