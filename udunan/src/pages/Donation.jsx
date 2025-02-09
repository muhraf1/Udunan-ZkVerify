import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from 'react-router-dom';
import { X, MapPin, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
} from "@/components/ui/sheet";
import { useQuery, gql } from '@apollo/client';
import { toast } from 'sonner';
import callGetAllCampaigns from '../lib/callContractFunction';

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
      organizationNameId
      imageSrc
      description
      startDate
      endDate
      userId
      user {
        id
        name
      }
      donations {
        id
        amount
        donor {
          id
          name
        }
        createdAt
      }
    }
  }
`;

const DonationPage = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const [hopeMessage, setHopeMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState(null);
  const navigate = useNavigate();

  const { loading: queryLoading, error: queryError, data } = useQuery(GET_CONTENT_BY_ID, {
    variables: { id },
    skip: !id
  });

  // Smart Contract setup 
    const initializeContract = async () => {
      try {
        console.log('Initializing contract...');
        const campaigns = await callGetAllCampaigns();
        console.log('Retrieved campaigns:', campaigns);
      } catch (error) {
        console.error('Error initializing contract:', error);
        toast.error('Failed to initialize contract');
      }
    };
 

  useEffect(() => {
    setIsOpen(true);
    initializeContract();
  }, []);

 
  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  const handleDonate = async () => {
    try {
      setLoading(true);

      if (!contract) {
        throw new Error('Please connect your wallet first');
      }

      if (!donationAmount || donationAmount <= 0) {
        throw new Error('Please enter a valid donation amount');
      }

      // Convert donation amount to Wei
      const amountInWei = ethers.utils.parseEther(donationAmount.toString());

      // Send transaction
      const tx = await contract.donate({
        value: amountInWei
      });

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      toast.success('Thank you for your donation!');

      // Clear form
      setDonationAmount('');
      setHopeMessage('');
      
      // Close sheet
      handleClose();

    } catch (err) {
      toast.error('Error ',err.message);

    } finally {
      setLoading(false);
    }
  };

  if (queryLoading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;
  if (!data?.content) return <div>No content found</div>;

  const donation = data.content;
  const progressPercentage = Math.min(
    Math.round((donation.currentAmount / donation.targetAmount) * 100),
    100
  );

  return (
    <div className="relative min-h-screen">
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-lg bg-background/80" />
      )}
      
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent 
          side="bottom" 
          className="h-[100dvh] rounded-t-lg  backdrop-blur-md border-0 pt-10 pb-10 "
          style={{ 
            background: 'linear-gradient(to bottom right, #1B4558, #041221)',
          }}
        >
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-6 w-6 text-white" />
            <span className="sr-only">Close</span>
          </button>

          <div className="max-w-xl mx-auto h-full  bg-white/5 p-4 border-white/5 rounded-xl px-10 pt-10">
            <div className="w-full rounded-lg"  style={{
                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
              }}>
              <div className="flex justify-between items-center p-8 gap-6">
                <div className="w-1/2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 pb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-full">{donation.location}</span>
                  </div>
                  
                  <div className="text-lg text-left font-bold text-white truncate">
                    {donation.title}
                  </div>

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

            <div className="grid gap-4 py-4">

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

            <SheetFooter className="px-4">
              <SheetClose className="w-full" asChild>
                <Button 
                  type="submit" 
                  onClick={handleDonate}
                  disabled={loading}
                  className="bg-[#5794D1] text-white py-6 hover:bg-white font-bold text-lg hover:text-black "
                >
                {loading ? 'Processing...' : 'Donate'}
                </Button>
              </SheetClose>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};


export default DonationPage;