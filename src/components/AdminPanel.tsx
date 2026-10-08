import React, { useState, useEffect } from 'react';
import { Download, Database, Check, Copy, RefreshCw, Key, Shield, ArrowLeft, Lock, Search } from 'lucide-react';
import { LeadRecord } from '../types.ts';
import {
  getLocalLeads,
  exportLeadsToCSV,
  getSavedWebhookUrl,
  saveWebhookUrl,
  submitLeadToGoogleSheet,
} from '../utils/googleSheets.ts';
import { sound } from '../utils/sound.ts';

interface AdminPanelProps {
  onBackToGame: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToGame }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('fabsi_admin_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLeads(getLocalLeads());
      setWebhookUrl(getSavedWebhookUrl());
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    // Default admin passcode: fabsi2026 or admin
    if (passcode.trim() === 'fabsi2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('fabsi_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect admin passcode');
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playTap();
    saveWebhookUrl(webhookUrl);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDownloadCSV = () => {
    sound.playTap();
    const csvContent = exportLeadsToCSV(leads);
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `fabsi_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestSync = async () => {
    sound.playTap();
    setTestStatus('Sending test record to Google Sheet...');
    try {
      const res = await submitLeadToGoogleSheet('Test User', '01700000000', {
        finalScore: 1000,
        levelsCompleted: 100,
      });
      setTestStatus(res.message);
      setLeads(getLocalLeads());
      setTimeout(() => setTestStatus(null), 3000);
    } catch {
      setTestStatus('Failed. Check Webhook URL.');
    }
  };

  const googleAppsScriptSample = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.name,
      data.phone || data.mobile,
      data.source || 'fabsi',
      data.finalScore || 0,
      data.levelsCompleted || 0
    ]);
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const copyScriptCode = () => {
    sound.playTap();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(googleAppsScriptSample);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Passcode verification screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-100 flex items-center justify-center text-black">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight font-['Plus_Jakarta_Sans']">
              fabsi Admin Portal
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Enter passcode to manage leads & Google Sheet
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Passcode (default: fabsi2026)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
            >
              Unlock Admin Panel
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToGame}
              className="text-xs text-zinc-500 hover:text-black flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-black tracking-tight uppercase">
              fabsi
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              disabled={leads.length === 0}
              className="py-2 px-3.5 bg-black hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onBackToGame}
              className="py-2 px-3.5 border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Game</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Total Captured Leads
            </span>
            <span className="text-3xl font-black text-black font-mono mt-1 block">
              {leads.length}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Google Sheet Status
            </span>
            <span className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {webhookUrl ? 'Connected' : 'Offline / Local Ready'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
              Vercel Deployment
            </span>
            <span className="text-xs text-zinc-600 mt-1 block font-mono">
              VITE_GOOGLE_SHEET_WEBHOOK_URL
            </span>
          </div>
        </div>

        {/* Webhook Configuration Section */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" />
                Google Apps Script Webhook URL
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                New player submissions are posted to this Google Sheet endpoint.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> URL Saved
              </span>
            )}
          </div>

          <form onSubmit={handleSaveWebhook} className="space-y-3">
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfyc.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-black"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="py-2 px-4 bg-black text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Save URL
              </button>
              <button
                type="button"
                onClick={handleTestSync}
                className="py-2 px-4 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Send Test Lead
              </button>
            </div>
          </form>

          {testStatus && (
            <div className="p-3 rounded-xl bg-zinc-100 text-xs font-mono text-zinc-800">
              {testStatus}
            </div>
          )}

          {/* Apps script code helper */}
          <details className="mt-2 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs">
            <summary className="font-bold text-zinc-800 cursor-pointer select-none">
              How to setup Google Sheet Webhook (Code snippet)
            </summary>
            <div className="mt-2 space-y-2">
              <p className="text-zinc-600">
                1. Open your Google Sheet &gt; Extensions &gt; Apps Script.
              </p>
              <p className="text-zinc-600">
                2. Paste this code and deploy as Web App (Access: Anyone):
              </p>
              <div className="relative bg-zinc-900 text-zinc-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                <pre>{googleAppsScriptSample}</pre>
                <button
                  onClick={copyScriptCode}
                  className="absolute top-2 right-2 p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-black text-sm uppercase tracking-wider">
                Captured Leads List ({filteredLeads.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <button
                onClick={() => setLeads(getLocalLeads())}
                className="p-2 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
                title="Refresh leads list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 text-xs">
              No leads captured yet. Play the game to generate leads!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500 uppercase text-[10px] tracking-wider border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Mobile</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Levels</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredLeads.map((lead, idx) => (
                    <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4 text-zinc-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-zinc-900">{lead.name}</td>
                      <td className="py-3 px-4 font-mono text-zinc-700">{lead.phone}</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">
                        {lead.finalScore || 0} pts
                      </td>
                      <td className="py-3 px-4 font-mono">{lead.levelsCompleted || 0} / 100</td>
                      <td className="py-3 px-4 text-zinc-500">
                        {new Date(lead.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
