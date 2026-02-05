/**
 * Lightning Address Payment Page
 * Spec: 07-scenario-2-lightning-address.md
 *
 * Demonstrate paying to a Lightning Address without manually creating an invoice.
 * The system fetches LNURL data and handles invoice creation automatically.
 */

import { ScenarioPage } from '@/components/layout/ScenarioPage';
import { LightningAddressDisplay } from './components/LightningAddressDisplay';
import { PayToAddressForm } from './components/PayToAddressForm';
import { useTransactionLog } from '@/hooks/useTransactionLog';
import { useWallet } from '@/hooks';

export default function LightningAddressPage() {
  const { entries, addLog } = useTransactionLog();
  const aliceWallet = useWallet('alice');
  const bobWallet = useWallet('bob');

  return (
    <ScenarioPage
      title="Lightning Address Payment"
      description="Pay to a Lightning Address (like email) without needing an invoice. The system handles invoice creation automatically."
      aliceContent={
        aliceWallet.status === 'connected' && (
          <PayToAddressForm onLog={addLog} />
        )
      }
      bobContent={
        bobWallet.status === 'connected' && (
          <LightningAddressDisplay />
        )
      }
      logs={entries}
    />
  );
}
