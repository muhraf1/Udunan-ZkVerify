import React, { useState, forwardRef } from 'react';
import { useAccount } from '@/context/AccountContext';
import dynamic from 'next/dynamic';
import styles from './ConnectWalletButton.module.css';

const WalletSelect = dynamic(() =>
        import('@talismn/connect-components').then((mod) => mod.WalletSelect), {
        ssr: false,
    }
);

const ConnectWalletButton = forwardRef((props, ref) => {
    const { selectedAccount, setSelectedAccount, selectedWallet, setSelectedWallet } = useAccount();
    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);

    const handleWalletConnectOpen = () => setIsWalletSelectOpen(true);
    const handleWalletConnectClose = () => setIsWalletSelectOpen(false);

    const handleWalletSelected = (wallet) => {
        setSelectedWallet(wallet.extensionName);
    };

    const handleUpdatedAccounts = (accounts) => {
        if (accounts && accounts.length > 0) {
            setSelectedAccount(accounts[0].address);
        } else {
            setSelectedAccount(null);
        }
    };

    const handleAccountSelected = (account) => {
        setSelectedAccount(account.address);
    };

    return (
        <>
            <button
                onClick={handleWalletConnectOpen}
                className={`button ${styles.walletButton}`}
            >
                {selectedAccount
                    ? `Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`
                    : 'Connect Wallet'}
            </button>

            {isWalletSelectOpen && (
                <WalletSelect
                    dappName="zkVerify"
                    open={isWalletSelectOpen}
                    onWalletConnectOpen={handleWalletConnectOpen}
                    onWalletConnectClose={handleWalletConnectClose}
                    onWalletSelected={handleWalletSelected}
                    onUpdatedAccounts={handleUpdatedAccounts}
                    onAccountSelected={handleAccountSelected}
                    showAccountsList
                />
            )}
        </>
    );
});

ConnectWalletButton.displayName = 'ConnectWalletButton';
export default ConnectWalletButton;
