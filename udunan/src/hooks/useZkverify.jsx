import { useState } from 'react';
import { useAccount } from '@/context/AccountContext';
import { ethers } from 'ethers';

export function useZkVerify() {
    const { selectedAccount, selectedWallet } = useAccount();
    const [status, setStatus] = useState(null);
    const [eventData, setEventData] = useState(null);
    const [transactionResult, setTransactionResult] = useState(null);
    const [error, setError] = useState(null);

    const onVerifyProof = async (proof, publicSignals, vk) => {
        try {
            if (!proof || !publicSignals || !vk) {
                throw new Error('Proof, public signals, or verification key is missing');
            }

            if (!selectedWallet || !selectedAccount) {
                throw new Error('Wallet or account is not selected');
            }

            const proofData = proof;
            const { zkVerifySession } = await import('zkverifyjs');
            const session = await zkVerifySession.start().Testnet().withWallet({
                source: selectedWallet,
                accountAddress: selectedAccount,
            });

            setStatus('verifying');
            setError(null);
            setTransactionResult(null);

            const { events, transactionResult } = await session.verify().risc0().execute({
                proofData: {
                    proof: proofData,
                    publicSignals: publicSignals,
                    vk: vk,
                    version: 'V1_0'
                }
            });

            events.on('includedInBlock', (data) => {
                setStatus('includedInBlock');
                setEventData(data);
            });

            let transactionInfo = null;
            try {
                transactionInfo = await transactionResult;
                setTransactionResult(transactionInfo);
            } catch (error) {
                if (error.message.includes('Rejected by user')) {
                    setError('Transaction Rejected By User.');
                    setStatus('cancelled');
                    return;
                }
                throw new Error(`Transaction failed: ${error.message}`);
            }

            if (transactionInfo && transactionInfo.attestationId) {
                setStatus('verified');
            } else {
                throw new Error("Your proof isn't correct.");
            }
        } catch (error) {
            const errorMessage = error.message;
            setError(errorMessage);
            setStatus('error');
        }
    };

    return { status, eventData, transactionResult, error, onVerifyProof };
}