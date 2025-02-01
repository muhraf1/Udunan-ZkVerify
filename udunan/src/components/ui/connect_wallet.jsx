import React from 'react';
import { Button } from "@/components/ui/button"
import { useConnectModal } from '@rainbow-me/rainbowkit';

export default function ConnectWalletButton() {
  const { openConnectModal } = useConnectModal();

  return (
    <Button 
      onClick={openConnectModal} 
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      Connect Wallet
    </Button>
  );
}