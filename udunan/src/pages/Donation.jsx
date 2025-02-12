import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/ui/AuthContext';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate,Navigate  } from 'react-router-dom';
import { X, MapPin, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import SuccessDonation from './Successdonation';


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Sheet,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'sonner';




// zkverify import
// import {useZkVerify} from '../hooks/useZkVerify'
// import proofData from '../proofs/risc0_v1_0.json';

import { donateToCampaign } from '../lib/transfer';

// GraphQL Queries and Mutations
const GET_CONTENT_BY_ID = gql`
  query GetContentById($id: ID!) {
    content(id: $id) {
      id
      title
      isVerified
      currentAmount
      targetAmount
      donationCount
      dayLeft
      category
      location
      address
      organizationName
      imageSrc
    }
  }
`;

const CREATE_DONATE = gql`
  mutation CreateDonate(
    $contentId: String!
    $amount: Float!
    $msg: String
    $tx_hash: String!
    $fromAddress: String!
    $toAddress: String!
    $attestationId: String
  ) {
    createDonate(
      contentId: $contentId
      amount: $amount
      msg: $msg
      tx_hash: $tx_hash
      fromAddress: $fromAddress
      toAddress: $toAddress
      attestationId: $attestationId
    ) {
      id
      amount
      msg
      tx_hash
      attestationId
    }
  }
`;

// Add useAuth import at the top

// import { useZkVerify } from '@/hooks/useZkVerify.jsx';


const DonationPage = () => {
  // Add authentication state
  const { isLoggedIn, token, user } = useAuth();

  //success state
const [showSuccessDialog, setShowSuccessDialog] = useState(false);
const [transactionHash, setTransactionHash] = useState('');
  // State Management
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [hopeMessage, setHopeMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Add zkVerify hook
  // const { status, eventData, transactionResult, error, onVerifyProof } = useZkVerify();
  // const [attestationId, setAttestationId] = useState(null);

  // Event Handlers
  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  // Effects
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // GraphQL Hooks
  const { loading: queryLoading, error: queryError, data } = useQuery(GET_CONTENT_BY_ID, {
    variables: { id },
  });

  // Update mutation to include authentication
  const [createDonate] = useMutation(CREATE_DONATE, {
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
  });

  
  const handleDonate = async (e) => {
    e.preventDefault();
    try {
      // Check authentication first
      if (!isLoggedIn || !token) {
        toast.error("Please log in to make a donation");
        return;
      }
      // Ensure user.address is used correctly
      if (!user?.address) {
        throw new Error('User address is not available');
      }

      setLoading(true);

      if (!donationAmount || donationAmount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      if (!data?.content?.address) {
        throw new Error('Campaign address not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const fromAddress = await signer.getAddress();

      // Process blockchain transaction
      const result = await donateToCampaign(
        data.content.address, 
        donationAmount,
      );

      if (!result) {
        throw new Error('Transaction failed or hash not provided');
      }

      console.log("check result: ", result);
      // Create database record with attestation
      await createDonate({
        variables: {
          contentId: data.content.id,
          amount: parseFloat(donationAmount),
          msg: hopeMessage || "",
          tx_hash: result.hash, // Ensure you are using result.hash here
          fromAddress: fromAddress,
          toAddress: data.content.address,
          attestationId: "" // Optional field
        }
      });

      toast.success('Donation successful');
      setTransactionHash(result.hash); // Ensure you are setting the transaction hash here
      setShowSuccessDialog(true);
      setDonationAmount('');
      setHopeMessage('');

    } catch (err) {
      console.error('Donation error:', err);
      if (err.code === 4001) {
        toast.error('Transaction cancelled');
        handleClose();
      } else {
        toast.error(err.message || 'Failed to process donation');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this effect to handle verification status changes
  // useEffect(() => {
  //   if (error) {
  //     console.error('Verification error:', error);
  //   } else if (status === 'verified') {
  //     console.log('Proof verified successfully');
  //   } else if (status === 'includedInBlock' && eventData) {
  //     console.log('Transaction included in block:', eventData);
  //   }
  // }, [error, status, eventData]);

  // Add authentication redirect
  if (!token) {
    return <Navigate to="/" replace />;
  }


  // Add attestation status display
  // const renderAttestationStatus = () => {
  //   if (status === 'verifying') {
  //     return <div className="text-yellow-400">Verifying donation...</div>;
  //   }
  //   if (status === 'verified') {
  //     return (
  //       <div className="text-green-400">
  //         Donation verified
  //         <div className="text-sm">Attestation ID: {attestationId}</div>
  //       </div>
  //     );
  //   }
  //   if (status === 'error') {
  //     return <div className="text-red-400">Verification failed: {error}</div>;
  //   }
  //   return null;
  // };

  // Loading and Error States
  if (queryLoading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;
  if (!data?.content) return <div>No content found</div>;

  const donation = data.content;
  const progressPercentage = Math.min(
    Math.round((donation.currentAmount / donation.targetAmount) * 100),
    100
  );

  // Render
  return (
    <div className="relative min-h-screen">
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-lg bg-background/80" />
      )}

  
      
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent 
          side="bottom" 
          className="h-[100dvh] rounded-t-lg backdrop-blur-md border-0 pt-10 pb-10"
          style={{ 
            background: 'linear-gradient(to bottom right, #1B4558, #041221)',
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-6 w-6 text-white" />
            <span className="sr-only">Close</span>
          </button>



          <div className="max-w-xl mx-auto h-full bg-white/5 p-4 border-white/5 rounded-xl px-10 pt-10">
            {/* Campaign Info Section */}
            <div className="w-full rounded-lg" style={{
              background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
            }}>
              {/* Campaign Details */}
              <div className="flex justify-between items-center p-8 gap-6">
                {/* Left Column - Campaign Info */}
                <div className="w-1/2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 pb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-full">{donation.location}</span>
                  </div>
                  
                  <div className="text-lg text-left font-bold text-white truncate">
                    {donation.title}
                  </div>

                  {/* Progress Section */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-white font-base pb-2 items-center">
                      <span>{donation.organizationName}</span>
                      <span>
                        <span className="font-bold text-sm">
                          ${donation.currentAmount.toLocaleString()}
                        </span> from ${donation.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    
                    <Progress
                      value={progressPercentage}
                      className="w-full"
                      indicatorClassName="bg-[#5794D1]"
                    />

                    {/* Campaign Stats */}
                    <div className="p-0 mt-2 flex justify-between items-center text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-[#5794D1]" />
                        <span>
                          <span className="text-white font-bold">
                            {donation.donationCount}
                          </span> donations
                        </span>
                      </div>
                      <div>
                        <span className="text-white font-bold">
                          {donation.dayLeft}
                        </span> days left
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Campaign Image */}
                <div className="w-1/2 flex items-center justify-center">
                  <div className="w-full h-32 overflow-hidden rounded-md">
                    <img
                      src={donation.imageSrc}
                      alt={donation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
            

            {/* Donation Form */}
            <div className="grid gap-4 py-4">
              {/* Amount Input */}
              <div className="grid grid-row-2 items-center gap-4 p-4">
                <Label htmlFor="withdrawal-amount" className="text-left text-white">
                  Enter Your Donation
                </Label>
                <div className="flex bg-transparent justify-between gap-2">
                  <div className="flex bg-white/5 items-center w-full rounded-l-lg p-1 justify-center">
                    <Input
                      id="withdrawal-amount"
                      className="text-white border-0 text-right py-6"
                      placeholder="0.01"
                      type="number"
                      step="0.01"
                      min="0"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-white/5 items-center rounded-r-lg p-2 px-3 justify-center">
                    <img
                      className="w-8 h-7 rounded-full"
                      src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040"
                      alt="USDC Logo"
                    />
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="grid grid-row-2 items-center gap-4 p-4">
                <Label htmlFor="name" className="text-left text-white">
                  Hope Message
                </Label>
                <Input 
                  id="hope-message" 
                  value={hopeMessage}
                  onChange={(e) => setHopeMessage(e.target.value)}
                  placeholder="I hope everything will be better, sooner ! ✨" 
                  className="col-span-3 py-8 border-0 bg-white/5 text-white" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <SheetFooter className="px-4">
              <Button 
                type="submit" 
                onClick={handleDonate}
                disabled={loading}
                className="bg-[#5794D1] text-white py-6 hover:bg-white font-bold text-lg hover:text-black w-full"
              >
                {loading ? 'Processing...' : 'Donate'}
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>


        // Add the SuccessDonation component before the closing Sheet component
<SuccessDonation
  isOpen={showSuccessDialog}
  onClose={() => setShowSuccessDialog(false)}
  txHash={transactionHash}
/>
    </Sheet>
    </div>
  );
};

export default DonationPage;