/**
 * Stub page for Notifications scenario
 * Will be implemented in spec 08-scenario-3-notifications.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function Notifications() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Notifications"
      description="Real-time payment notifications via NWC subscription."
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
