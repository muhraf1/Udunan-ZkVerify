'use client';
import { useState, useRef, useEffect } from 'react';
import { useAccount } from '@/context/AccountContext';
import ConnectWalletButton from '@/components/ui/ConnectWalletButton';
import { useZkVerify } from '@/hooks/useZkVerify';
import styles from './zkverifypage.module.css';
import proofData from '../proofs/risc0_v1_0.json';
import zkVerifyLogo from '../assets/zk_Verify_logo_full_black.png';

export default function ZkVerifyPage({ customStyles }) {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [blockHash, setBlockHash] = useState(null);
  const walletButtonRef = useRef(null);
  const { selectedAccount, selectedWallet } = useAccount();
  const { onVerifyProof, status, eventData, transactionResult, error } = useZkVerify();

  const handleSubmit = async () => {
    if (!selectedAccount || !selectedWallet) {
      setVerificationResult('Please connect a wallet and select an account.');
      return;
    }

    setLoading(true);
    setVerificationResult(null);
    setBlockHash(null);

    const { vk, publicSignals, proof } = proofData;

    try {
      await onVerifyProof(proof, publicSignals, vk);
    } catch (error) {
      setVerificationResult(`Error: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      setVerificationResult(error);
    } else if (status === 'verified') {
      setVerificationResult('Proof verified successfully!');
      if (eventData?.blockHash) {
        setBlockHash(eventData.blockHash);
      }
    } else if (status === 'includedInBlock' && eventData) {
      setVerificationResult('Transaction Included In Block');
    } else if (status === 'cancelled') {
      setVerificationResult('Transaction Rejected By User.');
    }
  }, [error, status, eventData]);

  const blockExplorerUrl = blockHash
      ? `https://testnet-explorer.zkverify.io/v0/block/${blockHash}`
      : null;

  return (
    <div className={`${styles.page} ${customStyles?.container || ''}`}>
      <div className={`${styles.main} ${customStyles?.main || ''}`}>
        <img
          src={zkVerifyLogo}
          alt="zkVerify Logo"
          style={{
            width: '150px',
            height: '40px',
            objectFit: 'contain',
            marginBottom: '0.5rem'
          }}
        />

        <div className="space-y-2 w-2/3">
          <ConnectWalletButton ref={walletButtonRef} onWalletConnected={() => {}} />

          <button
            onClick={handleSubmit}
            className={`button ${styles.verifyButton} w-full mt-2`}
            disabled={!selectedAccount || !selectedWallet || loading}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <span>Submitting...</span>
                <div className="spinner"></div>
              </div>
            ) : (
              'Submit Proof'
            )}
          </button>
        </div>

        <div className={`${styles.resultContainer} mt-3 w-full text-sm`}>
          {verificationResult && (
            <p
              className={`${
                verificationResult.includes('failed') ||
                verificationResult.includes('Error') ||
                verificationResult.includes('Rejected')
                  ? styles.resultError
                  : styles.resultSuccess
              } py-1`}
            >
              {verificationResult}
            </p>
          )}

          {eventData && status === 'includedInBlock' && (
            <div className={`${styles.resultSection} py-1`}>
              <p>Block Hash: {eventData.blockHash || 'N/A'}</p>
            </div>
          )}

          {blockExplorerUrl && (
            <div className={`${styles.resultLink} py-1`}>
              <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
                View Transaction on Explorer
              </a>
            </div>
          )}

          {transactionResult && (
            <div className={`${styles.transactionDetails} space-y-1 py-1`}>
              <p>Transaction Hash: {transactionResult.txHash || 'N/A'}</p>
              <p>Proof Type: {transactionResult.proofType || 'N/A'}</p>
              <p>Attestation ID: {transactionResult.attestationId || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
