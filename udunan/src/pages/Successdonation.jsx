import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ZkVerifyPage from '@/pages/zkverifypage';

const SuccessDonation = ({ isOpen, onClose, txHash }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate('/');
  };

  const zkVerifyCustomStyles = {
    container: "w-full flex justify-center",
    main: "w-[600px] flex flex-col items-center"
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] min-h-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <DialogTitle className="text-center text-xl">Donation Successful!</DialogTitle>
          <DialogDescription className="text-center">
            Thank you for your generous donation. Your transaction has been processed successfully.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 items-center justify-center">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Transaction Hash:</p>
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-4)}
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
          
          {/* Added ZkVerifyPage component */}
          <div className="w-full">
            <ZkVerifyPage />
          </div>
          
          <Button onClick={handleClose} className="w-full max-w-[600px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDonation;