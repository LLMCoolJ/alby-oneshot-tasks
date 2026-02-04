/**
 * Stub page for Lightning Address scenario
 * Will be implemented in spec 07-scenario-2-lightning-address.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function LightningAddress() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Lightning Address"
      description="Pay to Lightning Address (LNURL-pay) with optional comment."
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
