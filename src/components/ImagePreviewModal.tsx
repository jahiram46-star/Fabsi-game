import React from 'react';
import { X } from 'lucide-react';
import { LevelConfig } from '../types.ts';

interface ImagePreviewModalProps {
  level: LevelConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  level,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative aspect-square w-full bg-zinc-100">
          <img
            src={level.imageUrl}
            alt={level.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 bg-white text-zinc-900">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">
            Level {level.id}
          </span>
          <h4 className="text-base font-bold text-black">{level.name}</h4>
          <span className="text-xs text-zinc-500">{level.category}</span>
        </div>
      </div>
    </div>
  );
};
