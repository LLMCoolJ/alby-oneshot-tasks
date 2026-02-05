/**
 * InvoiceCreator Component
 * Spec: 10-scenario-5-proof-of-payment.md
 *
 * Form for Bob to create an invoice with amount
 */

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useInvoice } from '@/hooks';
import { CONSTANTS } from '@/types';
import type { Nip47Transaction } from '@getalby/sdk/nwc';

interface InvoiceCreatorProps {
  onInvoiceCreated: (invoice: Nip47Transaction) => void;
  onLog: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export function InvoiceCreator({ onInvoiceCreated, onLog }: InvoiceCreatorProps) {
  const [amount, setAmount] = useState('1000');
  const { createInvoice, loading, error } = useInvoice('bob');

  const handleCreate = async () => {
    const amountSats = parseInt(amount, 10);
    if (isNaN(amountSats) || amountSats < 1) {
      onLog('Invalid amount', 'error');
      return;
    }

    onLog('Creating invoice...', 'info');
    try {
      const inv = await createInvoice({
        amount: amountSats * CONSTANTS.MILLISATS_PER_SAT,
        description: 'Proof of Payment Demo',
      });
      onLog(`Invoice created with payment_hash: ${inv.payment_hash.slice(0, 16)}...`, 'success');
      onInvoiceCreated(inv);
    } catch (err) {
      onLog(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="space-y-4" data-testid="invoice-creator">
      <Input
        label="Amount (sats)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min={1}
        data-testid="invoice-amount-input"
      />
      {error && <p className="text-sm text-red-600" data-testid="invoice-error">{error}</p>}
      <Button
        onClick={handleCreate}
        loading={loading}
        className="w-full"
        data-testid="create-invoice-button"
      >
        Create Invoice
      </Button>
    </div>
  );
}
