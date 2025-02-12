'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';

export const AccountContext = createContext(undefined);

export const AccountProvider = ({ children }) => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [network, setNetwork] = useState('zkverify_testnet');

    // Effect to handle network-specific logic
    useEffect(() => {
        const initializeWallet = async () => {
            if (selectedWallet && window[selectedWallet]) {
                try {
                    // Request account access for zkVerify testnet
                    const accounts = await window[selectedWallet].enable('zkverify_testnet');
                    if (accounts && accounts.length > 0) {
                        setSelectedAccount(accounts[0]);
                    }
                } catch (error) {
                    console.error('Error connecting to zkVerify testnet:', error);
                }
            }
        };

        initializeWallet();
    }, [selectedWallet]);

    const connectToZkVerify = async () => {
        if (selectedWallet && window[selectedWallet]) {
            try {
                // Switch to zkVerify testnet
                await window[selectedWallet].enable('zkverify_testnet');
                console.log('Connected to zkVerify testnet');
            } catch (error) {
                console.error('Error switching to zkVerify testnet:', error);
            }
        }
    };

    return (
        <AccountContext.Provider value={{ 
            selectedAccount, 
            setSelectedAccount, 
            selectedWallet, 
            setSelectedWallet,
            network,
            connectToZkVerify
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) throw new Error('useAccount must be used within an AccountProvider');
    return context;
};