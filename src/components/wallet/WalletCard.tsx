/**
 * WalletCard - Display card for wallet with connection state
 * Spec: 04-wallet-context.md
 */

import { Card, Badge } from '@/components/ui';
import { useWallet, useBalance } from '@/hooks';
import { WalletConnect } from './WalletConnect';
import { BalanceDisplay } from './BalanceDisplay';
import type { WalletId } from '@/types';

interface WalletCardProps {
  walletId: WalletId;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function WalletCard({ walletId, title, className, children }: WalletCardProps) {
  const wallet = useWallet(walletId);
  const { sats, loading } = useBalance(walletId);

  const displayTitle = title ?? (walletId === 'alice' ? 'Alice' : 'Bob');

  const statusBadge = {
    disconnected: <Badge variant="default">Disconnected</Badge>,
    connecting: <Badge variant="info">Connecting...</Badge>,
    connected: <Badge variant="success">Connected</Badge>,
    error: <Badge variant="error">Error</Badge>,
  }[wallet.status];

  return (
    <Card
      title={displayTitle}
      subtitle={wallet.info?.alias}
      headerAction={statusBadge}
      className={className}
      data-testid={`wallet-card-${walletId}`}
    >
      {wallet.status === 'connected' ? (
        <>
          <BalanceDisplay sats={sats} loading={loading} />
          {children}
        </>
      ) : (
        <WalletConnect walletId={walletId} />
      )}
    </Card>
  );
}
