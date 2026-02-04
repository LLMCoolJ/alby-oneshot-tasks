/**
 * Hooks Index
 * Spec: 04-wallet-context.md
 *
 * Export all hooks from spec 04
 * NOTE: Only export hooks that exist in spec 04
 * Later specs will add: useTransactionLog, useLightningAddressPayment, useNotifications, useZap
 */

export { useWallet } from './useWallet';
export { useWalletActions } from './useWalletActions';
export { useNWCClient } from './useNWCClient';
export { useBalance } from './useBalance';
export { useInvoice } from './useInvoice';
export { usePayment } from './usePayment';
export { useBudget } from './useBudget';
export { useFiatRate } from './useFiatRate';
