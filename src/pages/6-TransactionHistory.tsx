/**
 * Stub page for Transaction History scenario
 * Will be implemented in spec 11-scenario-6-transaction-history.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function TransactionHistory() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Transaction History"
      description="View and filter past transactions with pagination."
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
