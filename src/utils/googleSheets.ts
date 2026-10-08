import { LeadRecord } from '../types.ts';

const STORAGE_KEY = 'fabsi_leads_data';
const WEBHOOK_KEY = 'fabsi_google_sheet_webhook';

export function getSavedWebhookUrl(): string {
  if (typeof window === 'undefined') return '';
  // Check Vite env var first (ideal for Vercel / GitHub deployment)
  const envUrl = import.meta.env?.VITE_GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim();
  }
  return localStorage.getItem(WEBHOOK_KEY) || '';
}

export function saveWebhookUrl(url: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEBHOOK_KEY, url.trim());
}

export function getLocalLeads(): LeadRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLeadToStorage(lead: LeadRecord) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalLeads();
    const index = existing.findIndex((l) => l.phone === lead.phone);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...lead };
    } else {
      existing.unshift(lead);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to save lead locally:', err);
  }
}

export async function submitLeadToGoogleSheet(
  name: string,
  phone: string,
  meta?: { finalScore?: number; levelsCompleted?: number }
): Promise<{ success: boolean; message: string; method: 'webhook' | 'local' }> {
  const leadId = 'lead_' + Date.now();
  const timestamp = new Date().toISOString();

  const record: LeadRecord = {
    id: leadId,
    name: name.trim(),
    phone: phone.trim(),
    submittedAt: timestamp,
    finalScore: meta?.finalScore ?? 0,
    levelsCompleted: meta?.levelsCompleted ?? 0,
    status: 'pending',
  };

  saveLeadToStorage(record);

  const webhookUrl = getSavedWebhookUrl();

  if (!webhookUrl) {
    record.status = 'local_only';
    saveLeadToStorage(record);
    return {
      success: true,
      message: 'Saved locally',
      method: 'local',
    };
  }

  try {
    const payload = {
      name: name.trim(),
      mobile: phone.trim(),
      phone: phone.trim(),
      source: 'fabsi',
      submittedAt: new Date().toISOString(),
      finalScore: meta?.finalScore ?? 0,
      levelsCompleted: meta?.levelsCompleted ?? 0,
    };

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'no-cors',
      body: JSON.stringify(payload),
    });

    record.status = 'synced';
    saveLeadToStorage(record);

    return {
      success: true,
      message: 'Sent to Google Sheet',
      method: 'webhook',
    };
  } catch (error) {
    console.warn('Webhook transmission error:', error);
    record.status = 'local_only';
    saveLeadToStorage(record);
    return {
      success: true,
      message: 'Saved locally',
      method: 'local',
    };
  }
}

export function exportLeadsToCSV(leads: LeadRecord[]): string {
  const headers = ['#', 'Name', 'Phone', 'Date', 'Score', 'Levels Completed', 'Status'];
  const rows = leads.map((l, idx) => [
    idx + 1,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${new Date(l.submittedAt).toLocaleString()}"`,
    l.finalScore ?? 0,
    l.levelsCompleted ?? 0,
    l.status,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
