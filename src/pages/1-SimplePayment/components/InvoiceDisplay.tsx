import { QRCode, Button, CopyButton } from '@/components/ui';
import { CONSTANTS } from '@/types';
import type { Nip47Transaction } from '@getalby/sdk/nwc';

interface InvoiceDisplayProps {
  invoice: Nip47Transaction;
  onReset: () => void;
}

export function InvoiceDisplay({ invoice, onReset }: InvoiceDisplayProps) {
  const amountSats = Math.floor(invoice.amount / CONSTANTS.MILLISATS_PER_SAT);

  return (
    <div className="space-y-4" data-testid="invoice-display">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-2">Invoice for</p>
        <p className="text-2xl font-bold text-slate-900" data-testid="invoice-amount">
          {amountSats.toLocaleString()} sats
        </p>
        {invoice.description && (
          <p className="text-sm text-slate-600 mt-1" data-testid="invoice-description">{invoice.description}</p>
        )}
      </div>

      <div className="flex justify-center">
        <QRCode
          value={invoice.invoice}
          size={200}
          label="Scan to pay"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={invoice.invoice}
            readOnly
            className="input-field font-mono text-xs flex-1"
            data-testid="invoice-string"
          />
          <CopyButton value={invoice.invoice} />
        </div>
      </div>

      <div className="pt-2">
        <Button variant="secondary" onClick={onReset} className="w-full" data-testid="reset-button">
          Create New Invoice
        </Button>
      </div>
    </div>
  );
}
