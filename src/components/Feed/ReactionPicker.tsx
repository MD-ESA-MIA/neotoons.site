import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ReactionType } from '../../socialTypes';

interface ReactionPickerProps {
  onReact: (type: ReactionType) => void;
  onClose: () => void;
}

const reactions: { type: ReactionType; label: string; emoji: string; color: string }[] = [
  { type: 'like', label: 'Like', emoji: '👍', color: 'text-blue-400' },
  { type: 'love', label: 'Love', emoji: '❤️', color: 'text-red-400' },
  { type: 'haha', label: 'Haha', emoji: '😆', color: 'text-yellow-400' },
  { type: 'wow', label: 'Wow', emoji: '😮', color: 'text-yellow-400' },
  { type: 'sad', label: 'Sad', emoji: '😢', color: 'text-yellow-400' },
  { type: 'angry', label: 'Angry', emoji: '😡', color: 'text-orange-400' },
];

const ReactionPicker: React.FC<ReactionPickerProps> = ({ onReact, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      className="absolute bottom-full left-0 mb-2 p-1 bg-[#1a1030] border border-white/10 rounded-full shadow-2xl flex items-center gap-1 z-50"
      onMouseLeave={onClose}
    >
      {reactions.map((reaction, index) => (
        <motion.button
          key={reaction.type}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.3 }}
          onClick={() => {
            onReact(reaction.type);
            onClose();
          }}
          className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/5 rounded-full transition-colors relative group"
        >
          <span>{reaction.emoji}</span>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {reaction.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default ReactionPicker;
