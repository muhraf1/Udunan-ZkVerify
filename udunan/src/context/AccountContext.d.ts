declare module '@/context/AccountContext' {
    export function useAccount(): {
        selectedAccount: string | null;
        setSelectedAccount: (account: string | null) => void;
        selectedWallet: string | null;
        setSelectedWallet: (wallet: string | null) => void;
    };
}