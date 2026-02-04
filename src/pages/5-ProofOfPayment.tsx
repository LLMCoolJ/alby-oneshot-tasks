/**
 * Stub page for Proof of Payment scenario
 * Will be implemented in spec 10-scenario-5-proof-of-payment.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function ProofOfPayment() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Proof of Payment"
      description="Verify payment preimage as cryptographic proof of payment."
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
