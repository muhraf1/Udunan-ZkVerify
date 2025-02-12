'use client'
import React, { createContext, useContext, useState } from 'react';

export const AccountContext = createContext(undefined);

export const AccountProvider = ({ children }) => {
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);

    return (
        <AccountContext.Provider value={{ 
            selectedAccount, 
            setSelectedAccount, 
            selectedWallet, 
            setSelectedWallet 
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