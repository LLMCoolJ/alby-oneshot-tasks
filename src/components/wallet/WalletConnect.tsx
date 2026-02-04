/**
 * WalletConnect - Connection form for NWC wallet
 * Spec: 04-wallet-context.md
 */

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useWallet, useWalletActions } from '@/hooks';
import { isValidNwcUrl } from '@/types';
import type { WalletId } from '@/types';

interface WalletConnectProps {
  walletId: WalletId;
}

export function WalletConnect({ walletId }: WalletConnectProps) {
  const wallet = useWallet(walletId);
  const { connect } = useWalletActions(walletId);
  const [nwcUrl, setNwcUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!isValidNwcUrl(nwcUrl)) {
      setValidationError('Invalid NWC URL. Must start with nostr+walletconnect://');
      return;
    }

    setValidationError(null);
    try {
      await connect(nwcUrl);
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <div className="space-y-4" data-testid={`wallet-connect-${walletId}`}>
      <Input
        label="NWC Connection String"
        placeholder="nostr+walletconnect://..."
        value={nwcUrl}
        onChange={(e) => setNwcUrl(e.target.value)}
        error={validationError || wallet.error || undefined}
        hint="Paste your Nostr Wallet Connect URL"
        data-testid={`nwc-url-input-${walletId}`}
      />
      <Button
        onClick={handleConnect}
        loading={wallet.status === 'connecting'}
        disabled={!nwcUrl}
        data-testid={`connect-button-${walletId}`}
      >
        Connect Wallet
      </Button>
    </div>
  );
}
