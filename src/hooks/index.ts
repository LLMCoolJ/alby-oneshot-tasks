/**
 * Hooks Index
 * Spec: 04-wallet-context.md + 05-layout.md
 *
 * Export all hooks from spec 04 and 05
 * NOTE: Later specs will add: useLightningAddressPayment, useNotifications, useZap
 */

export { useWallet } from './useWallet';
export { useWalletActions } from './useWalletActions';
export { useNWCClient } from './useNWCClient';
export { useBalance } from './useBalance';
export { useInvoice } from './useInvoice';
export { usePayment } from './usePayment';
export { useBudget } from './useBudget';
export { useFiatRate } from './useFiatRate';

// Spec 05: Layout hooks
export { useTransactionLog } from './useTransactionLog';

// Spec 07: Lightning Address hooks
export { useLightningAddressPayment } from './useLightningAddressPayment';

// Spec 08: Notification hooks
export { useNotifications } from './useNotifications';
