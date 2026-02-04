/**
 * Stub page for Hold Invoice scenario
 * Will be implemented in spec 09-scenario-4-hold-invoice.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function HoldInvoice() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Hold Invoice"
      description="Create hold invoices that can be accepted or cancelled after payment."
      logs={entries}
      aliceContent={
        <p className="text-sm text-slate-500">Coming soon...</p>
      }
      bobContent={
        <p className="text-sm text-slate-500">Coming soon...</p>
      }
    />
  );
}
