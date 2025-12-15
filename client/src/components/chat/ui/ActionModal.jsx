import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActionModal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-gray-900/90 border border-white/10 backdrop-blur-xl rounded-2xl w-11/12 max-w-sm p-5 shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Background decorative blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-white font-semibold text-lg tracking-wide">{title || "Options"}</h3>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-2 relative z-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
