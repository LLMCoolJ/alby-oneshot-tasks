/**
 * Stub page for Simple Payment scenario
 * Will be implemented in spec 06-scenario-1-simple-payment.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function SimplePayment() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Simple Payment"
      description="Basic invoice creation and payment flow between Alice and Bob."
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
