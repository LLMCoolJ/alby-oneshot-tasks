/**
 * PreimageVerifier Component
 * Spec: 10-scenario-5-proof-of-payment.md
 *
 * Auto-verifies when invoice and preimage are both available.
 * Uses Invoice class from @getalby/lightning-tools/bolt11 for validatePreimage.
 */

import { useState, useEffect } from 'react';
import { Button, Input, Badge } from '@/components/ui';
import { Invoice } from '@getalby/lightning-tools/bolt11';
import type { Nip47Transaction } from '@getalby/sdk/nwc';

interface PreimageVerifierProps {
  invoice: Nip47Transaction | null;
  preimage: string | null;
  onLog: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export function PreimageVerifier({ invoice, preimage, onLog }: PreimageVerifierProps) {
  const [manualInvoice, setManualInvoice] = useState('');
  const [manualPreimage, setManualPreimage] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    paymentHash: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-verify when both values are available from payment flow
  useEffect(() => {
    if (invoice && preimage) {
      handleVerify(invoice.invoice, preimage);
    }
  }, [invoice, preimage]);

  const handleVerify = (paymentRequest: string, preimageToVerify: string) => {
    setIsVerifying(true);
    onLog('Verifying preimage...', 'info');

    try {
      // Use the SDK's Invoice class for verification - don't roll your own crypto!
      const inv = new Invoice({ pr: paymentRequest });
      const valid = inv.validatePreimage(preimageToVerify);

      setVerificationResult({
        valid,
        paymentHash: inv.paymentHash,
      });

      if (valid) {
        onLog('Verification successful! Preimage matches payment hash.', 'success');
      } else {
        onLog('Verification failed! Preimage does not match.', 'error');
      }
    } catch (err) {
      onLog(`Verification error: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = () => {
    if (!manualInvoice || !manualPreimage) {
      onLog('Please enter both invoice and preimage', 'error');
      return;
    }

    handleVerify(manualInvoice, manualPreimage);
  };

  return (
    <div className="card mt-6" data-testid="preimage-verifier">
      <h3 className="text-lg font-semibold mb-4">Preimage Verification</h3>

      {/* Auto-verification result */}
      {verificationResult && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            verificationResult.valid
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
          data-testid="verification-result"
        >
          <div className="flex items-center gap-2 mb-3">
            {verificationResult.valid ? (
              <>
                <span className="text-2xl" aria-hidden="true">&#10003;</span>
                <Badge variant="success" data-testid="verified-badge">Verified</Badge>
                <span className="text-green-800 font-medium">Payment Proven!</span>
              </>
            ) : (
              <>
                <span className="text-2xl" aria-hidden="true">&#10007;</span>
                <Badge variant="error" data-testid="invalid-badge">Invalid</Badge>
                <span className="text-red-800 font-medium">Preimage does not match</span>
              </>
            )}
          </div>

          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-slate-600">Payment Hash:</span>
              <div className="bg-white p-2 rounded mt-1 break-all text-xs" data-testid="payment-hash-display">
                {verificationResult.paymentHash}
              </div>
            </div>
            <div className="pt-2 text-center">
              {verificationResult.valid ? (
                <span className="text-green-700">
                  SHA256(preimage) matches payment hash. Payment is proven!
                </span>
              ) : (
                <span className="text-red-700">
                  SHA256(preimage) does not match payment hash.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual verification form */}
      <details className="mt-4" data-testid="manual-verification">
        <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-800">
          Verify manually with any invoice/preimage
        </summary>
        <div className="mt-4 space-y-4 p-4 bg-slate-50 rounded-lg">
          <Input
            label="BOLT-11 Invoice"
            value={manualInvoice}
            onChange={(e) => setManualInvoice(e.target.value)}
            placeholder="lnbc..."
            data-testid="manual-invoice-input"
          />
          <Input
            label="Preimage (hex)"
            value={manualPreimage}
            onChange={(e) => setManualPreimage(e.target.value)}
            placeholder="64-character hex string"
            data-testid="manual-preimage-input"
          />
          <Button
            onClick={handleManualVerify}
            loading={isVerifying}
            variant="secondary"
            className="w-full"
            data-testid="manual-verify-button"
          >
            Verify Preimage
          </Button>
        </div>
      </details>

      {/* Educational content */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg" data-testid="educational-content">
        <h4 className="font-medium text-slate-900 mb-2">Why This Matters</h4>
        <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
          <li>The preimage is revealed only when payment succeeds</li>
          <li>It's cryptographically impossible to guess the preimage</li>
          <li>Anyone can verify the proof without trusting Alice or Bob</li>
          <li>Used in atomic swaps, escrow, and dispute resolution</li>
        </ul>
      </div>
    </div>
  );
}
