'use client';

import { motion } from 'framer-motion';

interface CaptureButtonProps {
  onCapture?: () => void;
  disabled?: boolean;
}

export const CaptureButton = ({ onCapture, disabled = false }: CaptureButtonProps) => {
  return (
    <motion.button
      className={`
        relative w-20 h-20 rounded-full border-4 border-white
        bg-gradient-to-br from-blue-400 to-blue-600
        shadow-2xl flex items-center justify-center
        focus:outline-none focus:ring-4 focus:ring-blue-300
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
      onClick={disabled ? undefined : onCapture}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(59, 130, 246, 0.7)',
          '0 0 0 10px rgba(59, 130, 246, 0)',
          '0 0 0 0 rgba(59, 130, 246, 0)',
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      disabled={disabled}
    >
      {/* 内圆 */}
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700"
          whileHover={disabled ? {} : { scale: 1.1 }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {/* 外圈光晕效果 */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-white/30"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
};
