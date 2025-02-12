import React, { useState, forwardRef, Suspense } from 'react';
import { useAccount } from '@/context/AccountContext'

const WalletSelect = React.lazy(() => import('@talismn/connect-components').then(mod => ({
    default: mod.WalletSelect
})));

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

    // In the return statement, wrap WalletSelect with Suspense
    return (
        <>
            <button
                onClick={handleWalletConnectOpen}
                className="button"
                style={{
                    backgroundColor: '#4CAF50',
                    ':hover': {
                        backgroundColor: '#3e8e41',
                        color: '#e6ffe6'
                    }
                }}
            >
                {selectedAccount
                    ? `Connected: ${selectedAccount.slice(0, 6)}...${selectedAccount.slice(-4)}`
                    : 'Connect Wallet'}
            </button>
    
            {isWalletSelectOpen && (
                <Suspense fallback={<div>Loading...</div>}>
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
                </Suspense>
            )}
        </>
    );
});

ConnectWalletButton.displayName = 'ConnectWalletButton';
export default ConnectWalletButton;