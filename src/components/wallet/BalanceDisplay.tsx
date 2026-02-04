/**
 * BalanceDisplay - Display wallet balance with fiat conversion
 * Spec: 04-wallet-context.md
 */

import { Spinner } from '@/components/ui';
import { useFiatRate } from '@/hooks';

interface BalanceDisplayProps {
  sats: number | null;
  loading?: boolean;
  showFiat?: boolean;
  currency?: string;
}

export function BalanceDisplay({
  sats,
  loading = false,
  showFiat = true,
  currency = 'USD',
}: BalanceDisplayProps) {
  const { formattedFiat } = useFiatRate(sats ?? 0, currency);

  if (loading) {
    return (
      <div className="flex items-center gap-2" data-testid="balance-loading">
        <Spinner size="sm" />
        <span className="text-slate-500">Loading balance...</span>
      </div>
    );
  }

  if (sats === null) {
    return <span className="text-slate-500" data-testid="balance-empty">--</span>;
  }

  const formattedSats = sats.toLocaleString();

  return (
    <div className="space-y-1" data-testid="balance-display">
      <div className="text-2xl font-bold text-slate-900" data-testid="balance-sats">
        {formattedSats} <span className="text-lg font-normal text-slate-500">sats</span>
      </div>
      {showFiat && formattedFiat && (
        <div className="text-sm text-slate-500" data-testid="balance-fiat">
          {formattedFiat}
        </div>
      )}
    </div>
  );
}
