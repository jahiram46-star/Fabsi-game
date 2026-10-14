import React, { useState } from 'react';
import { X, User, Phone, Trophy, Gift, CheckCircle2, MapPin, Send, LogOut, Award } from 'lucide-react';
import { UserProfile } from '../types.ts';
import { sound } from '../utils/sound.ts';
import { submitLeadToGoogleSheet } from '../utils/googleSheets.ts';
import { saveProfileToIndexedDB } from '../utils/indexedDB.ts';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onLogout,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  if (!isOpen || !profile) return null;

  const totalCompleted = profile.completedLevels.length;
  const isEligibleForGift = totalCompleted >= 100 || profile.totalScore >= 1000;
  const progressPercent = Math.min(100, Math.round((totalCompleted / 100) * 100));

  const handleClaimGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    sound.playTap();
    setSubmitting(true);

    const fullAddress = `${address.trim()}${city.trim() ? `, ${city.trim()}` : ''}${note.trim() ? ` (Note: ${note.trim()})` : ''}`;

    const updatedProfile: UserProfile = {
      ...profile,
      giftClaimed: true,
      deliveryAddress: fullAddress,
    };

    await saveProfileToIndexedDB(updatedProfile);
    onProfileUpdated(updatedProfile);

    // Also sync to Google Sheet with gift details
    await submitLeadToGoogleSheet(profile.name, profile.phone, {
      finalScore: profile.totalScore,
      levelsCompleted: profile.completedLevels.length,
      giftClaimed: true,
      deliveryAddress: fullAddress,
    });

    setSubmitting(false);
    setClaimSuccess(true);
    setIsClaiming(false);
    sound.playSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl text-zinc-900 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-zinc-100">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-xl uppercase font-mono shadow-sm">
            {profile.name.charAt(0) || 'U'}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Player Profile (IndexedDB)
            </span>
            <h3 className="text-lg font-bold text-black">{profile.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mt-0.5">
              <Phone className="w-3 h-3 text-zinc-400" />
              <span>{profile.phone}</span>
            </div>
          </div>
        </div>

        {/* Score & Progress Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Total Score
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-black text-black font-mono">
                {profile.totalScore}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ 1000</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              10 pts per puzzle
            </span>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              Puzzles Solved
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-zinc-700" />
              <span className="text-2xl font-black text-black font-mono">
                {totalCompleted}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ 100</span>
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar towards 1000 pts / 100 puzzles */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-700 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-500" />
              Physical Gift Milestone
            </span>
            <span className="font-mono font-bold text-zinc-900">
              {totalCompleted} / 100
            </span>
          </div>
          <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-black h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500 leading-tight">
            {isEligibleForGift
              ? '🎉 Congratulations! You have completed all 100 puzzles and earned your physical gift!'
              : `Solve ${100 - totalCompleted} more puzzles (+10 pts each) to claim your exclusive physical gift from fabsi.`}
          </p>
        </div>

        {/* Physical Gift Section */}
        {isEligibleForGift && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Physical Gift Reward</span>
            </div>

            {profile.giftClaimed || claimSuccess ? (
              <div className="space-y-1.5 text-xs text-amber-900 bg-white/80 p-3 rounded-xl border border-amber-200">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Gift Claimed Successfully!</span>
                </div>
                <p className="text-[11px] text-zinc-600">
                  Delivery Address: {profile.deliveryAddress || 'On file'}
                </p>
                <p className="text-[10px] text-zinc-400">
                  Our team will contact you at {profile.phone} to deliver your physical gift.
                </p>
              </div>
            ) : isClaiming ? (
              <form onSubmit={handleClaimGift} className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-700 uppercase mb-1">
                    Delivery Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Street, Area, City, Postcode"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Address'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsClaiming(false)}
                    className="py-2 px-3 border border-zinc-200 bg-white rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsClaiming(true)}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Gift className="w-4 h-4" />
                <span>Claim Your Physical Gift Now</span>
              </button>
            )}
          </div>
        )}

        {/* Account actions */}
        <div className="pt-2">
          <button
            onClick={() => {
              sound.playTap();
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            <span>Switch / Logout Player</span>
          </button>
        </div>
      </div>
    </div>
  );
};
