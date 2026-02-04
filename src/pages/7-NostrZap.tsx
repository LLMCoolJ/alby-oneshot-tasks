/**
 * Stub page for Nostr Zap scenario
 * Will be implemented in spec 12-scenario-7-nostr-zap.md
 */

import { useTransactionLog } from '@/hooks';
import { ScenarioPage } from '@/components/layout/ScenarioPage';

export default function NostrZap() {
  const { entries } = useTransactionLog();

  return (
    <ScenarioPage
      title="Nostr Zap"
      description="Send zaps (Lightning tips) to Nostr notes."
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
