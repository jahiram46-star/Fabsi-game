export interface ShareDataPayload {
  title: string;
  text?: string;
  url?: string;
  score?: number;
  levelId?: number;
  levelName?: string;
  playerName?: string;
  isGameComplete?: boolean;
}

export function generateShareText(payload: ShareDataPayload): string {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://fabsi.fashion';
  
  if (payload.isGameComplete) {
    return `🏆 I completed all 100 levels on fabsi Fashion Puzzle!\n✨ Player: ${payload.playerName}\n🎯 Score: ${payload.score} pts\nPlay now: ${currentUrl}`;
  }

  return `✨ fabsi Fashion Puzzle:\n👗 Level ${payload.levelId || 1}: ${payload.levelName || 'Apparel'}\n🎯 Score: ${payload.score} pts\n👤 Player: ${payload.playerName}\nPlay now: ${currentUrl}`;
}

export async function shareViaWebShare(payload: ShareDataPayload): Promise<boolean> {
  const text = generateShareText(payload);
  const shareData = {
    title: 'fabsi Fashion Puzzle',
    text: text,
    url: typeof window !== 'undefined' ? window.location.href : '',
  };

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function shareToWhatsApp(payload: ShareDataPayload) {
  const text = encodeURIComponent(generateShareText(payload));
  const url = `https://api.whatsapp.com/send?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function shareToFacebook(payload: ShareDataPayload) {
  const currentUrl = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : 'https://fabsi.fashion');
  const quote = encodeURIComponent(generateShareText(payload));
  const url = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${quote}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export function shareToTwitter(payload: ShareDataPayload) {
  const text = encodeURIComponent(generateShareText(payload));
  const url = `https://twitter.com/intent/tweet?text=${text}`;
  window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
}

export async function copyShareText(payload: ShareDataPayload): Promise<boolean> {
  const text = generateShareText(payload);
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
