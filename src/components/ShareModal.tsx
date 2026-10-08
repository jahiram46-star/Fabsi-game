import React, { useState } from 'react';
import { X, Share2, Check, MessageCircle, Copy, Sparkles } from 'lucide-react';
import {
  ShareDataPayload,
  generateShareText,
  shareToWhatsApp,
  shareToFacebook,
  shareToTwitter,
  shareViaWebShare,
  copyShareText,
} from '../utils/socialShare.ts';
import { sound } from '../utils/sound.ts';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: ShareDataPayload;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    sound.playTap();
    const success = await copyShareText(payload);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    sound.playTap();
    const supported = await shareViaWebShare(payload);
    if (!supported) {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl text-zinc-900">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-zinc-100 flex items-center justify-center text-black">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-black tracking-tight">
            Share Score
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Post your score to social media
          </p>
        </div>

        {/* Score Badge */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-center mb-5">
          <div className="text-2xl font-black text-black font-mono">
            {payload.score} <span className="text-xs font-sans text-zinc-500 font-normal">pts</span>
          </div>
          <div className="text-xs text-zinc-600 font-medium mt-0.5">
            {payload.isGameComplete ? '100 Levels Complete' : `Level ${payload.levelId}`} · {payload.playerName}
          </div>
        </div>

        {/* Share buttons */}
        <div className="space-y-2">
          {/* Native Web Share */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mobile Share Sheet</span>
          </button>

          {/* WhatsApp */}
          <button
            onClick={() => {
              sound.playTap();
              shareToWhatsApp(payload);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() => {
              sound.playTap();
              shareToFacebook(payload);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={() => {
              sound.playTap();
              shareToTwitter(payload);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="font-mono font-bold text-xs">𝕏</span>
            <span>Post on X</span>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500" />
                <span>Copy Link & Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
