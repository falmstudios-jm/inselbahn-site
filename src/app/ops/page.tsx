'use client';

import { useState, useEffect, useCallback } from 'react';

interface OpsResult {
  summary: string;
  actions: string[];
  error?: string;
}

interface LogEntry {
  id: string;
  command: string;
  result: string;
  executed_by: string;
  actions_taken: string[];
  created_at: string;
}

const EXAMPLE_COMMANDS = [
  'Alle Premium-Touren morgen absagen',
  'Preis der Unterland-Tour auf 12€ ändern',
  'Neue Abfahrt um 15:30 für Premium hinzufügen',
  'Umsatz diese Woche anzeigen',
  'Buchungen für heute anzeigen',
  'Rabattcode SOMMER25 mit 10% erstellen',
];

export default function OpsPage() {
  const [authed, setAuthed] = useState(false);
  const [staffList, setStaffList] = useState<
    { id: string; name: string; role: string }[]
  >([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OpsResult | null>(null);
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);

  // Check existing session on mount
  useEffect(() => {
    fetch('/api/auth/pin', { method: 'GET' })
      .then((r) => {
        if (r.ok) return r.json();
        throw new Error();
      })
      .then((data) => {
        if (data.role === 'admin') {
          setAuthed(true);
        }
      })
      .catch(() => {
        // Not authed yet
      });
  }, []);

  // Load staff list for login
  useEffect(() => {
    if (!authed) {
      fetch('/api/dashboard/staff')
        .then((r) => r.json())
        .then((data) => {
          const admins = (data.staff || []).filter(
            (s: { role: string }) => s.role === 'admin'
          );
          setStaffList(admins);
          if (admins.length > 0) setSelectedStaff(admins[0].id);
        })
        .catch(() => {});
    }
  }, [authed]);

  const loadHistory = useCallback(() => {
    fetch('/api/ops/history')
      .then((r) => {
        if (r.ok) return r.json();
        return { logs: [] };
      })
      .then((data) => setHistory(data.logs || []))
      .catch(() => {});
  }, []);

  // Load history on mount
  useEffect(() => {
    if (authed) loadHistory();
  }, [authed, loadHistory]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: selectedStaff, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Anmeldung fehlgeschlagen');
        return;
      }
      if (data.role !== 'admin') {
        setAuthError('Nur Administratoren haben Zugriff.');
        return;
      }
      setAuthed(true);
    } catch {
      setAuthError('Verbindungsfehler');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!command.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/ops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, messages: conversation }),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ summary: '', actions: [], error: data.error });
      } else {
        setResult(data);
        // Add to conversation history for context
        setConversation(prev => [
          ...prev,
          { role: 'user', content: command },
          { role: 'assistant', content: data.summary || '' },
        ]);
        setCommand('');
        loadHistory();
      }
    } catch {
      setResult({
        summary: '',
        actions: [],
        error: 'Verbindungsfehler. Bitte erneut versuchen.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-1 text-center">
            Inselbahn Operations
          </h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            Admin-Zugang erforderlich
          </p>

          {staffList.length > 0 && (
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN eingeben"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 text-center text-2xl tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          {authError && (
            <p className="text-red-500 text-sm text-center mb-3">
              {authError}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={authLoading || !pin}
            className="w-full bg-primary text-white font-semibold rounded-lg py-3 hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {authLoading ? 'Wird geprüft...' : 'Anmelden'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main ops interface ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-1">
          Inselbahn Operations
        </h1>
        <p className="text-gray-500 mb-8">
          KI-gestützte Verwaltung — gib Anweisungen in natürlicher Sprache.
        </p>

        {/* Command input */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label
            htmlFor="ops-command"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Was möchten Sie tun?
          </label>
          <textarea
            id="ops-command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExecute();
              }
            }}
            placeholder="z.B. Alle Premium-Touren morgen absagen"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />

          {/* Example chips */}
          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            {EXAMPLE_COMMANDS.map((ex) => (
              <button
                key={ex}
                onClick={() => setCommand(ex)}
                className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 hover:bg-gray-200 transition"
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            onClick={handleExecute}
            disabled={loading || !command.trim()}
            className="w-full bg-primary text-white font-semibold rounded-xl py-3 text-lg hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Wird ausgeführt...
              </>
            ) : (
              'Ausführen'
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div
            className={`rounded-2xl shadow-sm border p-6 mb-6 ${
              result.error
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <h2
              className={`text-sm font-semibold mb-2 ${
                result.error ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {result.error ? 'Fehler' : 'Ergebnis'}
            </h2>
            <p
              className={`whitespace-pre-wrap text-sm ${
                result.error ? 'text-red-600' : 'text-green-800'
              }`}
            >
              {result.error || result.summary}
            </p>
            {result.actions && result.actions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-xs font-medium text-green-600 mb-1">
                  Ausgeführte Aktionen:
                </p>
                <ul className="text-xs text-green-700 space-y-1">
                  {result.actions.map((a, i) => (
                    <li key={i} className="font-mono">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Letzte Befehle
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {entry.command}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap line-clamp-3">
                        {entry.result}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(entry.created_at).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-400">
                        {entry.executed_by}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
