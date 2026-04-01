'use client';

import { useState, useCallback } from 'react';

export interface GiftCardResult {
  valid: boolean;
  remaining_value?: number;
  expires_at?: string;
  error?: string;
}

export interface DiscountResult {
  valid: boolean;
  type?: 'percentage' | 'fixed';
  value?: number;
  description?: string;
  error?: string;
}

export interface AppliedDiscount {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
}

export interface AppliedGiftCard {
  code: string;
  remaining_value: number;
}

interface DiscountGiftSectionProps {
  onGiftCardApplied?: (giftCard: AppliedGiftCard | null) => void;
  onDiscountApplied?: (discount: AppliedDiscount | null) => void;
}

export default function DiscountGiftSection({
  onGiftCardApplied,
  onDiscountApplied,
}: DiscountGiftSectionProps) {
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);

  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

  const redeemGiftCard = useCallback(async () => {
    if (!giftCardCode.trim()) return;

    setGiftCardLoading(true);
    setGiftCardError(null);

    try {
      const res = await fetch(`/api/gift-card/${encodeURIComponent(giftCardCode.trim())}`);
      const data: GiftCardResult = await res.json();

      if (data.valid && data.remaining_value) {
        const card: AppliedGiftCard = {
          code: giftCardCode.trim().toUpperCase(),
          remaining_value: data.remaining_value,
        };
        setAppliedGiftCard(card);
        onGiftCardApplied?.(card);
      } else {
        setGiftCardError(data.error || 'Ungültiger Gutscheincode');
      }
    } catch {
      setGiftCardError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setGiftCardLoading(false);
    }
  }, [giftCardCode, onGiftCardApplied]);

  const removeGiftCard = useCallback(() => {
    setAppliedGiftCard(null);
    setGiftCardCode('');
    setGiftCardError(null);
    onGiftCardApplied?.(null);
  }, [onGiftCardApplied]);

  const redeemDiscount = useCallback(async () => {
    if (!discountCode.trim()) return;

    setDiscountLoading(true);
    setDiscountError(null);

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim() }),
      });
      const data: DiscountResult = await res.json();

      if (data.valid && data.type && data.value !== undefined) {
        const disc: AppliedDiscount = {
          code: discountCode.trim().toUpperCase(),
          type: data.type,
          value: data.value,
          description: data.description,
        };
        setAppliedDiscount(disc);
        onDiscountApplied?.(disc);
      } else {
        setDiscountError(data.error || 'Ungültiger Rabattcode');
      }
    } catch {
      setDiscountError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setDiscountLoading(false);
    }
  }, [discountCode, onDiscountApplied]);

  const removeDiscount = useCallback(() => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError(null);
    onDiscountApplied?.(null);
  }, [onDiscountApplied]);

  return (
    <div className="space-y-4">
      {/* Gift Card Input */}
      <div>
        <label className="block text-sm font-medium text-dark/70 mb-1.5">
          Gutscheincode
        </label>
        {appliedGiftCard ? (
          <div className="flex items-center justify-between bg-green/5 border border-green/20 rounded-lg px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-green">
                {appliedGiftCard.code}
              </span>
              <span className="text-sm text-dark/60 ml-2">
                (Guthaben: {appliedGiftCard.remaining_value.toFixed(2).replace('.', ',')}&nbsp;&euro;)
              </span>
            </div>
            <button
              type="button"
              onClick={removeGiftCard}
              className="text-dark/40 hover:text-dark/70 transition-colors"
              aria-label="Gutschein entfernen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="IB-GS-XXXX-XXXX"
              value={giftCardCode}
              onChange={(e) => {
                setGiftCardCode(e.target.value.toUpperCase());
                setGiftCardError(null);
              }}
              className="flex-1 py-2.5 px-3 rounded-lg border border-gray-200 text-sm text-dark placeholder-dark/30 outline-none focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={redeemGiftCard}
              disabled={giftCardLoading || !giftCardCode.trim()}
              className="px-4 py-2.5 rounded-lg bg-dark text-white text-sm font-medium hover:bg-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {giftCardLoading ? '\u2026' : 'Einl\u00F6sen'}
            </button>
          </div>
        )}
        {giftCardError && (
          <p className="text-red-500 text-xs mt-1.5">{giftCardError}</p>
        )}
      </div>

      {/* Discount Code Input */}
      <div>
        <label className="block text-sm font-medium text-dark/70 mb-1.5">
          Rabattcode
        </label>
        {appliedDiscount ? (
          <div className="flex items-center justify-between bg-green/5 border border-green/20 rounded-lg px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-green">
                {appliedDiscount.code}
              </span>
              <span className="text-sm text-dark/60 ml-2">
                ({appliedDiscount.type === 'percentage'
                  ? `${appliedDiscount.value}% Rabatt`
                  : `${appliedDiscount.value.toFixed(2).replace('.', ',')}\u00A0\u20AC Rabatt`}
                )
              </span>
              {appliedDiscount.description && (
                <span className="text-xs text-dark/40 ml-1">
                  &mdash; {appliedDiscount.description}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-dark/40 hover:text-dark/70 transition-colors"
              aria-label="Rabattcode entfernen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Rabattcode eingeben"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value.toUpperCase());
                setDiscountError(null);
              }}
              className="flex-1 py-2.5 px-3 rounded-lg border border-gray-200 text-sm text-dark placeholder-dark/30 outline-none focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={redeemDiscount}
              disabled={discountLoading || !discountCode.trim()}
              className="px-4 py-2.5 rounded-lg bg-dark text-white text-sm font-medium hover:bg-dark/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              {discountLoading ? '\u2026' : 'Einl\u00F6sen'}
            </button>
          </div>
        )}
        {discountError && (
          <p className="text-red-500 text-xs mt-1.5">{discountError}</p>
        )}
      </div>
    </div>
  );
}
