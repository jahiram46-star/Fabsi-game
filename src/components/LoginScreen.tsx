import React, { useState } from 'react';
import { User, Phone, Play, AlertCircle, Gift, Sparkles } from 'lucide-react';
import { submitLeadToGoogleSheet } from '../utils/googleSheets.ts';
import { saveProfileToIndexedDB } from '../utils/indexedDB.ts';
import { sound } from '../utils/sound.ts';
import { LEVELS } from '../data/levels.ts';
import { UserProfile } from '../types.ts';

interface LoginScreenProps {
  onStartGame: (profile: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onStartGame }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Please enter your name');
      return;
    }

    const phoneDigits = cleanPhone.replace(/[\s\-\+]/g, '');
    if (!phoneDigits || phoneDigits.length < 8) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);
    sound.playTap();

    try {
      // 1. Create or initialize profile for IndexedDB
      const newProfile: UserProfile = {
        id: 'current_user',
        name: cleanName,
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
        totalScore: 0,
        completedLevels: [],
        unlockedLevel: 1,
      };

      await saveProfileToIndexedDB(newProfile);

      // 2. Submit lead record to Google Sheet
      await submitLeadToGoogleSheet(cleanName, cleanPhone, {
        finalScore: 0,
        levelsCompleted: 0,
      });

      setTimeout(() => {
        sound.playSuccess();
        onStartGame(newProfile);
      }, 300);
    } catch {
      const fallbackProfile: UserProfile = {
        id: 'current_user',
        name: cleanName,
        phone: cleanPhone,
        createdAt: new Date().toISOString(),
        totalScore: 0,
        completedLevels: [],
        unlockedLevel: 1,
      };
      setTimeout(() => {
        onStartGame(fallbackProfile);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-md mx-auto">
        {/* Visual garment showcase (minimal teaser) */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {LEVELS.slice(0, 4).map((lvl) => (
            <div key={lvl.id} className="aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100">
              <img
                src={lvl.imageUrl}
                alt={lvl.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Minimal Login Card */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="text-center mb-5">
            <img
              src="https://pub-fbe8955756a94853a0bd118c51f515ea.r2.dev/IMG_20260928_111259.png"
              alt="fabsi"
              className="h-12 sm:h-14 w-auto max-w-[200px] mx-auto mb-2 object-contain select-none"
            />
            <p className="text-xs text-zinc-500">
              100 Levels Apparel Puzzle
            </p>
          </div>

          {/* Gift Announcement Pill Banner */}
          <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-left">
            <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug text-amber-950">
              <span className="font-bold block">Physical Gift Challenge:</span>
              Complete all 100 puzzles (+10 pts each, 1000 pts total) to receive a special physical gift from fabsi!
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="player-name" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="player-name"
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="player-phone" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  id="player-phone"
                  type="tel"
                  required
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Start Game</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
