'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const AccountContext = createContext(undefined);

export const AccountProvider = ({ children }) => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [chainId, setChainId] = useState(null);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                const network = await provider.getNetwork();
                
                setSelectedAccount(address);
                setSelectedWallet('metamask');
                setIsConnected(true);
                setChainId(network.chainId);
            } else {
                throw new Error("Please install MetaMask");
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        if (selectedAccount) {
            setIsConnected(true);
        }
    }, [selectedAccount]);

    return (
        <AccountContext.Provider value={{ 
            selectedAccount, 
            setSelectedAccount, 
            selectedWallet, 
            setSelectedWallet,
            isConnected,
            chainId,
            connectWallet
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