// System Notification Component
import { motion } from 'framer-motion';
import { Terminal, X } from 'lucide-react';

interface SystemNotificationProps {
  message: string;
  onClose: () => void;
}

export function SystemNotification({ message, onClose }: SystemNotificationProps) {
  return (
    <motion.div
      className="fixed top-4 left-4 right-4 z-[900] max-w-md mx-auto"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div 
        className="glass rounded-lg px-4 py-3 flex items-center gap-3"
        style={{
          borderLeft: '3px solid var(--primary)'
        }}
      >
        <Terminal className="w-5 h-5 text-[var(--primary)] flex-shrink-0" />
        
        <p className="text-sm text-[var(--text)] flex-1 font-mono">
          {message}
        </p>
        
        <button 
          onClick={onClose}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </motion.div>
  );
}
