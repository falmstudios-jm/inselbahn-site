'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export function LoginScreen() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/staff')
      .then((res) => res.json())
      .then((data) => {
        setStaff(data.staff || []);
        setLoadingStaff(false);
      })
      .catch(() => {
        // Fallback staff list
        setStaff([
          { id: 'fallback-1', name: 'Tomek', role: 'seller' },
          { id: 'fallback-2', name: 'Klaus R', role: 'driver' },
          { id: 'fallback-3', name: 'Klaus A', role: 'driver' },
          { id: 'fallback-4', name: 'Michael W', role: 'admin' },
        ]);
        setLoadingStaff(false);
      });
  }, []);

  const handleLogin = async () => {
    if (!selectedStaff || !pin) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staff_id: selectedStaff.id, pin }),
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen');
        setPin('');
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'driver': return 'Fahrer';
      case 'seller': return 'Verkauf';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-dark">Inselbahn Dashboard</h1>
          <p className="text-gray-500 mt-1">Mitarbeiter-Anmeldung</p>
        </div>

        {!selectedStaff ? (
          <div className="space-y-3">
            <p className="text-center text-gray-600 font-medium mb-4">
              Wer bist du?
            </p>
            {loadingStaff ? (
              <div className="text-center text-gray-400 py-8">Laden...</div>
            ) : (
              staff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(s)}
                  className="w-full bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div className="text-left">
                    <div className="text-lg font-semibold text-dark">
                      {s.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {roleLabel(s.role)}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {s.name.charAt(0)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <button
              onClick={() => {
                setSelectedStaff(null);
                setPin('');
                setError('');
              }}
              className="text-sm text-gray-500 mb-4 flex items-center gap-1"
            >
              &larr; Zurück
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-primary">
                  {selectedStaff.name.charAt(0)}
                </span>
              </div>
              <div className="text-lg font-semibold text-dark">
                {selectedStaff.name}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  PIN eingeben
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLogin();
                  }}
                  placeholder="8-stelliger PIN"
                  className="w-full text-center text-2xl tracking-[0.5em] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={pin.length < 4 || loading}
                className="w-full bg-primary text-white font-semibold py-4 rounded-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
