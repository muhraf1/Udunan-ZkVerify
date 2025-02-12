import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import UpdateSection from './UpdateSection';
import { gql, useQuery } from '@apollo/client';
import { Heart, MapPin, X, ChevronsRight, Link, ArrowUpRight,
   Calendar, Instagram, Globe, Twitter, Dot,  Github,
  Youtube,
  Send,    Linkedin,Copy
   } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge"
import RichTextRenderer from '@/components/ui/richtextrender';

import DonateSection from './donatesection';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/Separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSlug } from "@/lib/stringutils";
import { useAuth } from './AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const GET_WITHDRAWALS = gql`
  query GetWithdrawalsByContent($contentId: ID!) {
    withdrawalsByContent(contentId: $contentId) {
      id
      tx_hash
      amount
      title
      description
      fromAddress
      toAddress
      createdAt
      updatedAt
    }
  }
`;

const GET_CONTENTS = gql`
  query GetContents {
    contents {
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
        userimg
         X
      instagram
      linkedin
      telegram
      youtube
      website
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
      withdrawals {
        id
        amount
        createdAt
      }
      fundraises {
        id
        title
        description
        author {
          id
          name
          userimg
        }
        createdAt
      }
      createdAt
      updatedAt
    }
  }
`;


const FETCH_USER_PROFILE = gql`
query FetchUserProfile {
  usermanage {
    id
    email
    name
  }
}
`;


const SOCIAL_ICONS = {
  // X/Twitter variations
  x: Twitter,
  X: Twitter,
  twitter: Twitter,
  // Other social platforms
  instagram: Instagram,
  Instagram: Instagram,
  linkedin: Linkedin,
  Linkedin: Linkedin,
  github: Github,
  Github: Github,
  youtube: Youtube,
  Youtube: Youtube,
  telegram: Send,
  Telegram: Send,
  website: Globe,
  Website: Globe
};


export function ContentFeedHome({ category }) {
  const { token } = useAuth(); // Destructure the token from the AuthContext
  const location = useLocation();
  const navigate = useNavigate();
  const { category: urlCategory, urlId } = useParams();  // State to manage the selected donation and sheet visibility


 
  // State to manage selected donation
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [previousRoute, setPreviousRoute] = useState(null);

  const SocialMediaIcons = ({ socialLinks }) => {
    // Early return if no social links provided
    if (!socialLinks) return null;

    // Filter and normalize social links
    const filteredSocialLinks = Object.entries(socialLinks)
        .filter(([_, link]) => {
            // Check if link exists, isn't empty, and isn't localhost
            return link && 
                   typeof link === 'string' && 
                   link.trim() !== '' && 
                   !link.includes('localhost');
        })
        .map(([platform, link]) => ({
            platform: platform.toLowerCase(),
            link: link.trim()
        }));

    if (filteredSocialLinks.length === 0) {
        return null;
    }



    return (
        <div className="flex space-x-4 items-center">
            {filteredSocialLinks.map(({ platform, link }) => {
                // Get the appropriate icon component, fallback to Globe if not found
                const IconComponent = SOCIAL_ICONS[platform] || Globe;

                // Ensure link has protocol
                const href = link.startsWith('http') ? link : `https://${link}`;

                // Capitalize first letter of platform name for title
                const platformTitle = platform.charAt(0).toUpperCase() + platform.slice(1);

                return (
                    <a
                        key={platform}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#BEC6CA] hover:text-white transition-colors mt-2 duration-200"
                        title={platformTitle}
                    >
                        <IconComponent 
                            className="w-6 h-6" 
                            strokeWidth={1}
                            aria-label={`${platformTitle} link`}
                        />
                    </a>
                );
            })}
        </div>
    );
};

  const {
    data: contentData,
    loading: contentLoading,
    error: contentError,
    refetch: refetchcontent
  } = useQuery(GET_CONTENTS);


  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
    refetch: refetchprofile
  } = useQuery(FETCH_USER_PROFILE, {
    fetchPolicy: "cache-and-network",
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
    skip: !token,
    onError: (error) => {
      console.error("User Profile Query Error:", error);
    },
  });
  

  // error handling 
  const ErrorDisplay = ({ message, onRetry }) => (
    <div>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );



  const content = contentData?.contents || [];
  const currentUser = profileData?.usermanage?.id|| [];

  

  console.log("check content", content);
  console.log("check user",currentUser);
  console.log("check token", token);


  console.log(contentData);
  console.log(profileData);

  const filteredContent = content.filter(
    (donation) => donation.category === category
  );


  // Effects to manage selected donation and route changes
  useEffect(() => {
    if (urlId && urlCategory) {
      const donation = content.find(
        (d) => `${d.id}` === urlId && d.category === urlCategory
      );

      if (donation) {
        setSelectedDonation(donation);
      }
    }

    if (!urlId) {
      setPreviousRoute(location.pathname);
    }
  }, [urlId, urlCategory, content, location.pathname]);



  const copyAddress = () => {
  
    const url = `${selectedDonation.address}`; // Append selectedDonation.id as suffix
    navigator.clipboard.writeText(url)
        .then(() => {
            alert("Link copied to clipboard!"); // Notify the user
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy the link. Please try again.");
        });
};

  
  // Only configure links if we have user data

  const SocialLinksSection = ({ selectedDonation }) => {
    if (!selectedDonation?.user) return null;
  
    const socialLinks = {
      x: selectedDonation.user.X,
      instagram: selectedDonation.user.instagram,
      linkedin: selectedDonation.user.linkedin,
      telegram: selectedDonation.user.telegram,
      youtube: selectedDonation.user.youtube,
      website: selectedDonation.user.website
    };
  
    return <SocialMediaIcons socialLinks={socialLinks} />;
  };

  const WithdrawalsList = ({ contentId }) => {
    const { loading, error, data } = useQuery(GET_WITHDRAWALS, {
      variables: { contentId },
      skip: !contentId,
      onError: (error) => {
        console.error("Withdrawal Query Error:", error);
      }
    });

    console.log("ContentId in WithdrawalsList:", contentId);
    console.log("Withdrawal Data:", data);
  
    if (loading) return <p>Loading withdrawals...</p>;
    if (error) return <p>Error loading withdrawals: {error.message}</p>;
    if (!data?.withdrawalsByContent?.length) return null;
  
    return (
      <div className="w-full mt-4 space-y-4">
        {data.withdrawalsByContent.map((withdrawal, index) => (
          <div key={`${withdrawal.id}-${index}`} className="flex flex-col gap-4 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white">{withdrawal.amount} ETH</span>
              <span className="font-medium text-sm">{withdrawal.title}</span>
              <Dot className="w-4 h-4" />
              <span className="font-light text-xs">
                {(() => {
                  const withdrawalDate = new Date(Number(withdrawal.createdAt));
                  const now = new Date();
                  const diffTime = Math.abs(now - withdrawalDate);
                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                  
                  if (diffDays === 0) {
                    return 'Today';
                  } else if (diffDays === 1) {
                    return 'Yesterday';
                  } else {
                    return `${diffDays} days ago`;
                  }
                })()}
              </span>
            </div>
            <div className="flex-1 flex flex-col bg-white/5 p-4 rounded-lg border border-[#5C7683]/20">
            <p className="font-semibold text-xs whitespace-pre-wrap">
              {withdrawal.description || "No description provided"}
            </p>
              <button 
                className="pt-1 flex items-center gap-1 text-xs bg-transparent text-blue-400 hover:text-blue-300"
                onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${withdrawal.tx_hash}`, '_blank')}
              >
                <span>View Transaction</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
    


  
  // console.log("check fundraise", selectedDonation.fundraise)

  //routing
  const navigateToManageCampaign = (campaignid) => {
    navigate(`/managecampaign/${campaignid}`);
  };

  const navigateToDonate = (campaignid) => {
    navigate(`/Donate/${campaignid}`);
  };

  const navigateToCampaignPage = (campaignId) => {
    navigate(`/detailcampaign/${campaignId}`);
  };

  const navigateToFundraisePage = (fundraiseId) => {
    navigate(`/detailfundraise/${fundraiseId}`);
  };

  const navigateToProfilePage = (ProfileId) => {
    navigate(`/${ProfileId}`);
  };


  const copyToClipboard = () => {
    if (!selectedDonation || !selectedDonation.id) {
      alert("No donation selected to copy the link.");
      return;
    }
    const url = `${window.location.href}detailcampaign/${selectedDonation.id}`; // Append selectedDonation.id as suffix
    navigator.clipboard.writeText(url)
      .then(() => {
        alert("Link copied to clipboard!"); // Notify the user
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy the link. Please try again.");
      });
  };


  {/* Description */ }
  // State for managing active section
  const [activeSection, setActiveSection] = useState("About");

  // Sections array
  const sections = [
    "About",
    "Updates",
    "Hope",
    "Fundraise",
    "Donate"
  ];

  //change color badge 
  const categoryColors = {
    Emergency: "bg-[#D16F57] text-white hover:bg-[#D16F57]/90",
    Education: "bg-[#E7404A] text-white hover:bg-[#E7404A]/90",
    HealthCare: "bg-[#5794D1] text-white hover:bg-[#5794D1]/90",
  };

  // Fallback to a neutral style if category is not found
  const selectedColorClass = categoryColors[category] || "bg-gray-600 text-white";

  // Categories array to make mapping and maintenance easier
  const categories = [
    "Emergency",
    "Education",
    "HealthCare"
  ];


  const handleCloseSheet = () => {
    setSelectedDonation(null);

  };

  // Handle card click to navigate and set selected donation
  const handleCardClick = (donation) => {
    // const urlId = createSlug(donation.id); 
    setSelectedDonation(donation);
  };


  // the start update dummy data
//   const updateData =[
// { id:"#sxabydg6x",amount:"$ 1000", title:"for food and cloths", createdAt: "2024-12-17",description:"We have withdrawn funds specifically to provide essential food and clothing to families affected by the recent floods and landslides in Bosnia, ensuring prompt and transparent relief efforts."},
// { id:"sd#@ddncbeaj",amount:"$ 2000", title:"for Medicine and babies", createdAt: "2024-12-16",description:"We have withdrawn funds specifically to provide essential food and clothing to families affected by the recent floods and landslides in Bosnia, ensuring prompt and transparent relief efforts."}
// ];

 // table block explorer section
 const txData = [
  { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },
  { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },
  { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },

];

// dummy data donations
const donationsData = [
  {
    id: 1,
    name: "Rajib Kumar",
    amount: "$2,500",
    img: "./src/assets/no1.png"  },
  {
    id: 2,
    name: "Marsya Jennah",
    amount: "$1,800",
    img: "./src/assets/no2.png"  },
  {
    id: 3,
    name: "Hans Weber",
    amount: "$1,500",
    img: "./src/assets/no3.png"  },
  {
    id: 4,
    name: "Phoebe Chen",
    amount: "$1,200",
    img: "./src/assets/no4.png"  },
  {
    id: 5,
    name: "Alex Smith",
    amount: "$1,000",
    img: "./src/assets/no5.png"  },
  {
    id: 6,
    name: "Sarah Johnson",
    amount: "$950",
    img: "./src/assets/no6.png"  },
  {
    id: 7,
    name: "Michael Chang",
    amount: "$875",
    img: "./src/assets/no7.png"  },
  {
    id: 8,
    name: "Emma Wilson",
    amount: "$800",
    img: "./src/assets/no8.png"  },
  {
    id: 9,
    name: "David Park",
    amount: "$750",
    img: "./src/assets/no9.png"  },
  {
    id: 10,
    name: "Lisa Torres",
    amount: "$700",
    img: "./src/assets/no10.png"  }
];

  // table fund allocation Section |
  const fundData = [
    { category: 'Total Fund', amount: '$ 8,500' },
    { category: 'Gas Fee', amount: '$ 0.2' },
    { category: 'Platform Fee', amount: '$ 50' },
    { category: 'Disbursed Fund', amount: '$ 6,000' },
    { category: 'Unclaim Fund', amount: '$ 1,500' }
  ];

  // the end update dummy data

  // the start hope dummy data 

  // profile pict 
  // Define profile pictures array correctly
  const profile_pict_ava = [
    { pict: "./src/assets/comment1.png" },
    { pict: "./src/assets/comment2.png" },
    { pict: "./src/assets/comment3.png" },
    { pict: "./src/assets/comment4.png" },
    { pict: "./src/assets/comment5.png" }
  ];



  // Comment data array with properly formatted dates
  const commentData = [
    {
      user_id: "c#1ssjack332d",
      name: "Rajib Kumar",
      profile_pict: profile_pict_ava[4].pict,
      createdAt: "2024-12-16", // Changed date format
      comment: "The flood is very severe; my brother lost his home and car.pray for all  🤲🏻"
    },
    {
      user_id: "c#1ssjack332d",
      name: "Marsya",
      profile_pict: profile_pict_ava[3].pict,
      createdAt: "2024-12-15",
      comment: "I hope everything will be better, sooner ! ✨"
    },
    {
      user_id: "c#1ssjack332d",
      name: "xaxaxaxa",
      profile_pict: profile_pict_ava[2].pict,
      createdAt: "2024-12-14",
      comment: "The flood is very severe; my brother lost his home and car.pray for all  🤲🏻"
    },
    {
      user_id: "c#1ssjack332d",
      name: "Phoebe",
      profile_pict: profile_pict_ava[1].pict,
      createdAt: "2024-12-13",
      comment: "Standing in solidarity with Bosnia as floods and landslides wreak havoc on communities. Let's come together to support those in dire need. 🤝❤️"
    },
    {
      user_id: "c#1ssjack332d",
      name: "Hans",
      profile_pict: profile_pict_ava[0].pict,
      createdAt: "2024-12-12",
      comment: "Please keep the victims in your thoughts and prayers during this challenging time. 💔🕊️"
    }
  ];

  const getTimeDifference = (createdAt) => {
    const now = new Date();
    // Parse the date string properly
    const [year, month, day] = createdAt.split('-').map(num => parseInt(num));
    const commentDate = new Date(year, month - 1, day); // month is 0-based in JS Date

    const diffInMilliseconds = now - commentDate;
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 0) {
      return 'Future date'; // For dates that haven't occurred yet
    } else {
      return `${diffInDays}d ago`;
    }
  };

  // the end of hope dummy data 


  const renderSectionContent = () => {
    switch (activeSection) {
      case "About":
        return (
          <div className="text-gray-300">
          <RichTextRenderer content={selectedDonation.description} />
          {/* footer note  */}
            <div className=" w-full justify-start mt-4">
              <Separator className=" bg-[#5C7683]" />

              <div className="mt-4 inline-flex items-center" onClick={() => navigateToProfilePage(selectedDonation?.user.id)}>
                <Avatar className="h-8 w-8 mx-2 cursor-pointer">
                  <AvatarImage src={selectedDonation?.user.userimg} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col pl-2 text-md font-bold text-white">
                  <span className="text-xs font-light text-white"> Campaign Organizer</span>
                  {selectedDonation.organizationName}
                </div>
              </div>
              <div className="flex justify-start gap-2 pl-2 text-xs mt-1">
              <SocialLinksSection selectedDonation={selectedDonation} />
              </div>
              <div className="flex justify-start gap-2 pl-2 text-sm mt-2">
                Report campaign
              </div>
              <div className="w-full rounded-lg p-4 text-xs mt-2 font-light"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}>
                <span className="text-white font-bolds">Disclaimer :</span> All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
              </div>
            </div>
          </div>

        );
      case "Updates":
        return (
          <div className="text-gray-300">
           {selectedDonation && (
        <>
          {console.log("Selected Donation ID:", selectedDonation.id)}
          {selectedDonation.id ? (
            <WithdrawalsList contentId={selectedDonation.id} />
          ) : (
            <p>No withdrawal data available</p>
          )}
          <UpdateSection 
            address={selectedDonation.address} 
            getTimeDifference={getTimeDifference}
          />
        </>
      )}
       
     
          

       


        

            {/* footer note  */}
            <div className=" w-full justify-start mt-4">
              <Separator className=" bg-[#5C7683]" />

              <div className="mt-4 inline-flex items-center" onClick={() => navigateToProfilePage(selectedDonation?.user.id)}>
                <Avatar className="h-8 w-8 mx-2 cursor-pointer">
                <AvatarImage src={selectedDonation?.user.userimg} />
                <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col pl-2 text-md font-bold text-white">
                  <span className="text-xs font-light text-white"> Campaign Organizer</span>
                  {selectedDonation.organizationName}
                </div>
              </div>
              <div className="flex justify-start gap-2 pl-2 text-xs mt-1">
              <SocialLinksSection selectedDonation={selectedDonation} />

              </div>
              <div className="flex justify-start gap-2 pl-2 text-sm mt-2">
                Report campaign
              </div>
              <div className="w-full rounded-lg p-4 text-xs mt-2 font-light"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}>
                <span className="text-white font-bolds">Disclaimer :</span> All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
              </div>
            </div>
          </div>
        );
      case "Hope":
        return (
          <div className="text-gray-300">
            {selectedDonation.hope || "Share the hope behind this campaign."}
            {/* Comments Section */}
            <div className="w-full mt-4 space-y-4">
              {commentData.map((comment, index) => (
                <div key={`${comment.user_id}-${index}`} className="flex gap-4  rounded-lg">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <img
                      src={comment.profile_pict}
                      alt={`${comment.name}'s profile`}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 flex flex-col bg-white/5 p-4 rounded-lg border border-[#5C7683]/20">
                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm">{comment.name}</span>
                      <Dot className="w-4 h-4" />
                      <span className="font-light text-sm">
                        {getTimeDifference(comment.createdAt)}
                      </span>
                    </div>

                    {/* Comment Text */}
                    <p className="font-semibold text-xs">{comment.comment}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* footer note  */}
            <div className=" w-full justify-start mt-4">
              <Separator className=" bg-[#5C7683]" />

              <div className="mt-4 inline-flex items-center" onClick={() => navigateToProfilePage(selectedDonation?.user.id)}>
                <Avatar className="h-8 w-8 mx-2 cursor-pointer">
                <AvatarImage src={selectedDonation?.user.userimg} />
                <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col pl-2 text-md font-bold text-white">
                  <span className="text-xs font-light text-white"> Campaign Organizer</span>
                  {selectedDonation.organizationName}
                </div>
              </div>
              <div className="flex justify-start gap-2 pl-2 text-xs mt-1">
              <SocialLinksSection selectedDonation={selectedDonation} />

              </div>
              <div className="flex justify-start gap-2 pl-2 text-sm mt-2">
                Report campaign
              </div>
              <div className="w-full rounded-lg p-4 text-xs mt-2 font-light"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}>
                <span className="text-white font-bolds">Disclaimer :</span> All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
              </div>
            </div>
          </div>
        );
      case "Fundraise":
        return (
          <div className="text-gray-300" >
            <div className="mt-4 p-4 rounded-md" >                
            <div className="flex gap-4  px-10 rounded-lg">
                <Button
                  className="w-full bg-[#D16F57] text-white hover:bg-[#FAF4D7] hover:text-[#D16F57]"
                  onClick={() => {
                    navigate(`/CreateFundraise`, {
                      state: {
                        contentId: selectedDonation.id,
                        campaign: selectedDonation.title,
                        organizationName: selectedDonation.organizationName
                      }
                    });
                  }}
                >
                  Start Fundraise
                </Button>
                </div>
              </div>
            {selectedDonation.fundraise || "Learn how you can help fundraise for this campaign."}
            <div>

              {selectedDonation.fundraises?.length > 0 ? (
                <ul>
                  {selectedDonation.fundraises.map((fundraise) => (
                    <li
                      key={fundraise.id}
                      className="mb-4 mt-4 p-4  text-[#5794D1] rounded-lg "
                      style={{
                        background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(8px)",
                      }}
                      onClick={() => navigateToFundraisePage(fundraise.id)}
                    >
                      {/* column */}
                      <div className=' grid grid-cols-4'>
                        <div className='p-2'>
                          <Avatar className="h-15 w-15 ">
                            <AvatarImage src= {fundraise?.author.userimg} />
                            <AvatarFallback>A1</AvatarFallback>
                          </Avatar>

                        </div>

                        <div className='col-span-3'>


                          <h2 className="text-md font-bold text-[#5794D1] mb-1">
                            {fundraise.title}
                          </h2>

                          <div className="text-sm text-gray-400">
                            <div className=' flex flex-row gap-2 items-center'>
                              <p className='font-bold'>{fundraise.author.name}<span className='text-white/50 font-light'> ⋅ 90+ People Participate </span> </p>

                              <div className='flex -space-x-2'>
                                <Avatar className="h-6 w-6 ">
                                  <AvatarImage src="./src/assets/profile_default_2.png" />
                                  <AvatarFallback>A1</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-6 w-6 ">
                                  <AvatarImage src="./src/assets/profile_default_4.png" />
                                  <AvatarFallback>A2</AvatarFallback>
                                </Avatar>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src="./src/assets/profile_default_3.png" />
                                  <AvatarFallback>A3</AvatarFallback>
                                </Avatar>
                              </div>{/* Last avatar taking full remaining space */}

                            </div>
                            <p className='text-white text-lg font-bold'>$3,000</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No Profile found.
                </p>
              )}
            </div>
            {/* footer note  */}
            <div className=" w-full justify-start mt-4">
              <Separator className=" bg-[#5C7683]" />

              <div className="mt-4 inline-flex items-center"  onClick={() => navigateToProfilePage(selectedDonation?.user.id)}>
                <Avatar className="h-8 w-8 mx-2 cursor-pointer">
                <AvatarImage src={selectedDonation?.user.userimg} />
                <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col pl-2 text-md font-bold text-white">
                  <span className="text-xs font-light text-white"> Campaign Organizer</span>
                  {selectedDonation.organizationName}
                </div>
              </div>
              <div className="flex justify-start gap-2 pl-2 text-xs mt-1">
              <SocialLinksSection selectedDonation={selectedDonation} />

              </div>
              <div className="flex justify-start gap-2 pl-2 text-sm mt-2">
                Report campaign
              </div>
              <div className="w-full rounded-lg p-4 text-xs mt-2 font-light"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}>
                <span className="text-white font-bolds">Disclaimer :</span> All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
              </div>
            </div>
          </div>
        );
      case "Donate":
        return (
          <div className="text-gray-300">
            Donation details and options will be displayed here.
          
            <DonateSection address={selectedDonation.address} />






            {/* footer note  */}
            <div className=" w-full justify-start mt-4">
              <Separator className=" bg-[#5C7683]" />

              <div className="mt-4 inline-flex items-center" onClick={() => navigateToProfilePage(selectedDonation?.user.id)} >
                <Avatar className="h-8 w-8 mx-2 cursor-pointer">
                  <AvatarImage src={selectedDonation?.user.userimg} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <div className="flex flex-col pl-2 text-md font-bold text-white">
                  <span className="text-xs font-light text-white"> Campaign Organizer</span>
                  {selectedDonation.organizationName}
                </div>
              </div>
              <div className="flex justify-start gap-2 pl-2 text-xs mt-1">
                <SocialLinksSection selectedDonation={selectedDonation} />

              </div>
              <div className="flex justify-start gap-2 pl-2 text-sm mt-2">
                Report campaign
              </div>
              <div className="w-full rounded-lg p-4 text-xs mt-2 font-light"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}>
                <span className="text-white font-bolds">Disclaimer :</span> All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };


  // Content loading and error handling
  if (contentLoading || profileLoading) {
    return <div>Loading content...</div>;
  }

  if (contentError) {
    return (
      null
    //   <ErrorDisplay
    //   message="Failed to load dashboard data"
    //   onRetry={() => {
    //     refetchcontent();
    //     refetchprofile();
    //   }}
    // />
    );
  }

  // Profile Error Handling (non-blocking)
  let user = null;
  if (profileError) {
    console.warn("Profile data could not be loaded.");
  } else if (profileData && profileData.user) {
    user = profileData.user;
  }




  return (
    <div className="max-w-4xl mx-auto px-4 w-full">
      <div className="flex flex-col gap-6 w-full">
        {filteredContent.map((donation, index) => {
          // Calculate progress percentage
          const progressPercentage = Math.min(
            Math.round((donation.currentAmount / donation.targetAmount) * 100),
            100
          );

          return (
            <div
              key={index}
              className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
              }}
              onClick={() => handleCardClick(donation)}
            >
              <div className="flex justify-between items-center p-8 gap-6">
                {/* Left Side: Content */}
                <div className="w-1/2">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 pb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate max-w-full">{donation.location}</span>
                  </div>
                  {/* Title */}
                  <div>
                    <div className="text-lg text-left font-bold text-white truncate">
                      {donation.title}

                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-white font-base pb-2 items-center">
                      <span>{donation.organizationName}</span>
                      <span>
                        <span className="font-bold text-sm">${donation.currentAmount.toLocaleString()}</span> from ${donation.targetAmount.toLocaleString()}
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
                          <span className="text-white font-bold">{donation.donationCount}</span> donations
                        </span>
                      </div>
                      <div>
                      <span className="text-white font-bold">
  {donation.dayLeft !== null ? donation.dayLeft : 'N/A'}
</span> days left                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Image */}
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
          );
        })}
      </div>

      <Sheet open={!!selectedDonation} onOpenChange={handleCloseSheet}>

        {/* <Sheet open={!!selectedDonation}> */}

        <SheetContent
          className="bg-[#153749] text-white rounded-lg border-none m-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
          style={{
            width: "35vw", // Set width to 40% of the viewport width (2/5 of the screen)
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}
        >
          {selectedDonation && (
            <div className="h-full flex flex-col">
              {/* Sticky Header */}
              <SheetHeader
                className="bg-[#132E3F] text-black flex justify-start gap-2 sticky top-0 z-10 px-4 py-2"
              >
                <span className="inline-flex gap-2">
                  <ChevronsRight className="h-8 w-8 text-[#B8C0C5]" onClick={handleCloseSheet} />
                  <button className="p-2  px-2 text-xs bg-[#0D2333] text-[#B6BDC2] inline-flex items-center  gap-1" onClick={copyToClipboard}> <Link className="w-4 h-4" /> <span> Copy Link</span></button>
                  <button className="p-2  px-2 text-xs bg-[#0D2333] text-[#B6BDC2] inline-flex items-center  gap-1"
                    onClick={() => navigateToCampaignPage(selectedDonation.id)}
                  > <span> Campaign Page </span><ArrowUpRight className="w-4 h-4" /> </button>
                </span>

              </SheetHeader>
              {/* manage button */}
              {selectedDonation.organizationNameId === currentUser && (
                <div className='w-full flex justify-between font-bold bg-[#FFF7D7]/40 text-[#FFF7D7] py-4 text-right px-2'>
                  Manage your Campaign!
                  <button className='bg-[#FFF7D7] text-[#153749] font-extrabold  rounded-xl text-md py-0' onClick={() => {
                    console.log('Manage clicked for organization');
                    navigateToManageCampaign(selectedDonation.id)

                  }}>
                    Manage
                  </button>
                </div>
              )}

              {/* Donation Details */}
              <div className="px-8 mt-6 flex-grow overflow-y-auto">


                {/* add logic at this part if  {selectedDonation.oraganizationNameID == user.id render the component } */}
                <div className="mb-6">
                  <img
                    src={selectedDonation.imageSrc}
                    alt={selectedDonation.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <Badge className={`px-4 py-2 mb-2 items-center gap-2 ${categoryColors[selectedDonation.category] ||
                    "bg-gray-600 text-white hover:bg-gray-600/90"
                    }`}>
                    {selectedDonation.category}
                  </Badge>

                  <div className="text-xl font-bold">
                    {selectedDonation.title}
                  </div>
                  <div className="text-sm font-light ">{selectedDonation.address} <button className='bg-[#173C4F] rounded-2xl p-2 ' onClick={copyAddress}><Copy className='w-4 h-4' /></button></div>

                  <div className=" flex justify-start py-2 gap-3 items-center mb-2" onClick={() => navigateToProfilePage(selectedDonation?.user.id)}>
                    <Avatar className="h-7 w-7 mx-2 cursor-pointer">
                    <AvatarImage src={selectedDonation?.user.userimg} />
                    <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className="font-light">{selectedDonation.organizationName}</span>
                  </div>

                  <div className="text-white font-semibold text-md  items-center   justify-start gap-2 inline-flex ">

                    <Calendar className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
                    <div className="flex flex-col">
                      {/* <span className="text-md">
                        {new Date(selectedDonation.startDate)
                        .toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        } - {new Date(selectedDonation.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span> */}
                      <span className="text-md">
                        {new Date(Number(selectedDonation.startDate)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                        {' - '}
                        {new Date(Number(selectedDonation.endDate)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>



                    </div>
                  </div>


                  <div className="flex items-center gap-2 text-white ">
                    <MapPin className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
                    <span>{selectedDonation.location}</span><ArrowUpRight className="w-4 h-4" />
                  </div>




                  {/* Progress Details */}
                  <div className="mt-4 p-4 rounded-md" style={{
                    background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(8px)",
                  }}>
                    <div>
                      <span>Raised</span>
                    </div>
                    <div className="flex justify-between text-white mb-2">

                      <span className="font-bold">
                        ${selectedDonation.currentAmount.toLocaleString()}
                        <span className="text-gray-400"> / ${selectedDonation.targetAmount.toLocaleString()}</span>
                      </span>
                      <span className="text-white bg-[#5794D1] font-semibold px-2 rounded-md">
                        {Math.min(
                          Math.round((selectedDonation.currentAmount / selectedDonation.targetAmount) * 100),
                          100
                        )}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        Math.round((selectedDonation.currentAmount / selectedDonation.targetAmount) * 100),
                        100
                      )}
                      className="w-full mb-2"
                      indicatorClassName="bg-[#5794D1]"
                    />
                    <div className="flex w-full">
                      <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Heart className="h-5 w-5 text-[#5794D1]" />
                          <span className="font-bold text-md text-white">{selectedDonation.donationCount} </span> donations
                        </div>
                        <div className="text-gray-400">
                          {selectedDonation.dayLeft} days left
                        </div>
                      </div>
                    </div>
                  </div>



                  {/* Section Bar Menu */}
                  <div className="flex justify-between px-1 py-4 relative">
                    {sections.map((section, index) => (
                      <button
                        key={section}
                        className={`
        text-sm font-medium px-3 py-2 rounded-md transition-all duration-300 relative
        flex-1 # Make buttons equally sized and fill the container
        ${activeSection === section
                            ? 'bg-transparent text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white'
                            : 'text-gray-400 bg-transparent hover:text-gray-200'}
        
        # Styling for the bottom placeholder line
        before:absolute before:bottom-0 before:left-0 before:w-full before:h-[1px] before:bg-gray-700
        
        # Hover effect
        hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-500
        
        # Remove right border for all but the last button to create a connected look
        ${index < sections.length - 1 ? 'border-r-0' : ''}
      `}
                        onClick={() => setActiveSection(section)}
                      >
                        {section}
                      </button>
                    ))}
                  </div>
                  {/* Section Content */}
                  <div className="px-4 mt-2 flex-grow overflow-y-auto">
                    <div className="mb-6">
                      {/* ... (previous image and details code remains the same) */}

                      {/* Dynamic Section Content */}
                      <div className="mt-2">
                        <h3 className="text-xl font-semibold mb-3">{activeSection}</h3>
                        {renderSectionContent()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>

              </div>
              {/* Sticky Footer */}
              <div className="sticky bottom-0 z-10 bg-[#132E3F] backdrop-blur-md px-4 py-4 border-t border-[#255C77]">
                <div className="flex gap-4  px-20 rounded-lg">
                  <Button
                    onClick={() => {
             
                    navigateToDonate(selectedDonation.id);
                  }}
                    className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white">
                    Donate Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default ContentFeedHome;