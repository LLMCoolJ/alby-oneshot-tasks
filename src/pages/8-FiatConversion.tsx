/**
 * Stub page for Fiat Conversion scenario
 * Will be implemented in spec 13-scenario-8-fiat-conversion.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function FiatConversion() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Fiat Conversion"
      description="Convert between satoshis and fiat currencies with live exchange rates."
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
