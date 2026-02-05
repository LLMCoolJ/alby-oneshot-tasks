/**
 * HoldInvoiceStatus - Display hold invoice status and actions
 * Spec: 09-scenario-4-hold-invoice.md
 */

import { useEffect } from 'react';
import { Button, Badge, QRCode, CopyButton } from '@/components/ui';
import { useHoldInvoice } from '@/hooks/useHoldInvoice';
import { useNotifications } from '@/hooks/useNotifications';
import { CONSTANTS } from '@/types';
import type { HoldInvoice, HoldInvoiceState } from '@/types';

interface HoldInvoiceStatusProps {
  holdInvoice: HoldInvoice;
  onStateChange: (state: HoldInvoiceState) => void;
  onReset: () => void;
  onLog: (message: string, type?: 'info' | 'success' | 'error') => void;
}

const STATE_CONFIG: Record<HoldInvoiceState, {
  badge: { variant: 'info' | 'warning' | 'success' | 'error'; label: string };
  icon: string;
}> = {
  created: { badge: { variant: 'info', label: 'Created' }, icon: '' },
  accepted: { badge: { variant: 'warning', label: 'Held' }, icon: '' },
  settled: { badge: { variant: 'success', label: 'Settled' }, icon: '' },
  cancelled: { badge: { variant: 'error', label: 'Cancelled' }, icon: '' },
};

export function HoldInvoiceStatus({
  holdInvoice,
  onStateChange,
  onReset,
  onLog,
}: HoldInvoiceStatusProps) {
  const { settleHoldInvoice, cancelHoldInvoice, loading, error } = useHoldInvoice('bob');
  const amountSats = Math.floor(holdInvoice.amount / CONSTANTS.MILLISATS_PER_SAT);
  const config = STATE_CONFIG[holdInvoice.state];

  // Subscribe to hold_invoice_accepted notifications
  const { subscribe, unsubscribe, isSubscribed } = useNotifications('bob', {
    onNotification: (event) => {
      if (event.type === 'hold_invoice_accepted' &&
          event.transaction.paymentHash === holdInvoice.paymentHash) {
        onStateChange('accepted');
        onLog('Payment received and held!', 'success');
      }
    },
    notificationTypes: ['hold_invoice_accepted'],
  });

  // Auto-subscribe when component mounts
  useEffect(() => {
    if (holdInvoice.state === 'created') {
      subscribe();
    }
    return () => unsubscribe();
  }, [holdInvoice.state, subscribe, unsubscribe]);

  const handleSettle = async () => {
    onLog('Settling hold invoice (revealing preimage)...', 'info');
    try {
      await settleHoldInvoice(holdInvoice.preimage);
      onStateChange('settled');
      onLog('Invoice settled! Funds received.', 'success');
    } catch (err) {
      onLog(`Settle failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  const handleCancel = async () => {
    onLog('Cancelling hold invoice (refunding payer)...', 'info');
    try {
      await cancelHoldInvoice(holdInvoice.paymentHash);
      onStateChange('cancelled');
      onLog('Invoice cancelled! Payer refunded.', 'success');
    } catch (err) {
      onLog(`Cancel failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="space-y-4" data-testid="hold-invoice-status">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">{config.icon}</span>
          <Badge variant={config.badge.variant} data-testid="hold-invoice-state-badge">
            {config.badge.label}
          </Badge>
        </div>
        <span className="text-lg font-bold" data-testid="hold-invoice-amount">
          {amountSats.toLocaleString()} sats
        </span>
      </div>

      {/* QR Code for created state */}
      {holdInvoice.state === 'created' && (
        <div className="space-y-3">
          <div className="flex justify-center">
            <QRCode value={holdInvoice.invoice} size={180} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={holdInvoice.invoice}
              readOnly
              className="input-field font-mono text-xs flex-1"
              aria-label="Hold invoice string"
              data-testid="hold-invoice-string"
            />
            <CopyButton value={holdInvoice.invoice} />
          </div>
          <p className="text-sm text-slate-500 text-center">
            Waiting for payment... {isSubscribed && '(Listening)'}
          </p>
        </div>
      )}

      {/* Action buttons for accepted state */}
      {holdInvoice.state === 'accepted' && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Payment is held. Choose an action:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleSettle}
              loading={loading}
              className="w-full"
              data-testid="settle-hold-invoice-button"
            >
              Settle (Receive)
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              loading={loading}
              className="w-full"
              data-testid="cancel-hold-invoice-button"
            >
              Cancel (Refund)
            </Button>
          </div>
        </div>
      )}

      {/* Final states */}
      {(holdInvoice.state === 'settled' || holdInvoice.state === 'cancelled') && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {holdInvoice.state === 'settled'
              ? 'Funds have been received successfully.'
              : 'Payment has been refunded to the payer.'}
          </p>
          <Button
            variant="secondary"
            onClick={onReset}
            className="w-full"
            data-testid="reset-hold-invoice-button"
          >
            Create New Hold Invoice
          </Button>
        </div>
      )}

      {/* Debug info */}
      <details className="text-xs">
        <summary className="text-slate-500 cursor-pointer">Technical Details</summary>
        <div className="mt-2 p-2 bg-slate-50 rounded font-mono space-y-1">
          <div>Payment Hash: {holdInvoice.paymentHash.slice(0, 32)}...</div>
          <div>Preimage: {holdInvoice.preimage.slice(0, 32)}...</div>
        </div>
      </details>

      {error && (
        <p className="text-sm text-red-600" data-testid="hold-invoice-status-error">{error}</p>
      )}
    </div>
  );
}
