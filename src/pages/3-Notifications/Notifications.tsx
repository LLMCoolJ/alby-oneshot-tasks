/**
 * NotificationsPage - Real-time Payment Notifications
 * Spec: 08-scenario-3-notifications.md
 *
 * Demonstrates subscribing to payment notifications and receiving
 * real-time updates when payments are sent or received.
 */

import { ScenarioPage } from '@/components/layout/ScenarioPage';
import { NotificationSubscriber } from './components/NotificationSubscriber';
import { QuickPayButtons } from './components/QuickPayButtons';
import { useTransactionLog } from '@/hooks/useTransactionLog';
import { useWallet } from '@/hooks';

export default function NotificationsPage() {
  const { entries, addLog } = useTransactionLog();
  const aliceWallet = useWallet('alice');
  const bobWallet = useWallet('bob');

  return (
    <ScenarioPage
      title="Real-time Payment Notifications"
      description="Bob subscribes to notifications and sees incoming payments in real-time as Alice sends them."
      aliceContent={
        aliceWallet.status === 'connected' && (
          <QuickPayButtons
            recipientAddress={bobWallet.info?.lud16}
            onLog={addLog}
          />
        )
      }
      bobContent={
        bobWallet.status === 'connected' && (
          <NotificationSubscriber onLog={addLog} />
        )
      }
      logs={entries}
    />
  );
}
