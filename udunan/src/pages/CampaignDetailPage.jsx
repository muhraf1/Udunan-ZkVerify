import React, { useState, useEffect } from 'react';
import { toast } from 'sonner'

import DonateSection from '@/components/ui/donatesection';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { useAuth } from '@/components/ui/AuthContext';


import { Button } from "@/components/ui/button";
import RichTextRenderer from '@/components/ui/richtextrender';

// import { content } from '@/data/contentfeed'; // Import your content array
import { createSlug } from '@/lib/stringutils'; // Import your slug creation function if needed
import { Separator } from '@/components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, X, ChevronsRight, Link, ArrowUpRight,
  Calendar, Instagram, Globe, Twitter, Dot,  Github,
 Youtube,
 Send,    Linkedin,Copy
  } from "lucide-react";
  import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress";
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

const GET_DONATIONS_BY_CONTENT = gql`
  query GetDonationsByContent($contentId: ID!) {
    donationsByContent(contentId: $contentId) {
      id
      amount
      msg
      createdAt
      donor {
        id
        name
        userimg
      }
      fromAddress
      tx_hash
    }
  }
`;

const GET_CONTENTS = gql`
  query GetContents {
    contents {
      id
      title
      isVerified
      address
      currentAmount
      targetAmount
      donationCount
      dayLeft
      category
      userId
      location
      organizationName
      organizationNameId
      imageSrc
      description
      startDate
      endDate
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
    }
  }
`;

const FETCH_USER_PROFILE = gql`
query FetchUserProfile {
  usermanage {
    id
    email
    name
    userimg
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

const CampaignDetailPage = () => {
  const { token } = useAuth(); // Destructure the token from the AuthContext
  const navigate = useNavigate();

  const WithdrawalsList = ({ contentId }) => {
    const { loading, error, data } = useQuery(GET_WITHDRAWALS, {
      variables: { contentId },
      skip: !contentId
    });
  
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
                  
                  if (diffDays === 0) return 'Today';
                  if (diffDays === 1) return 'Yesterday';
                  return `${diffDays} days ago`;
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
  
  const DonationComments = ({ contentId }) => {
    const { loading, error, data } = useQuery(GET_DONATIONS_BY_CONTENT, {
      variables: { contentId },
      skip: !contentId
    });
  
    if (loading) return <p>Loading comments...</p>;
    if (error) return <p>Error loading comments: {error.message}</p>;
    if (!data?.donationsByContent?.length) return <p>No donations yet.</p>;
  
    return (
      <div className="w-full mt-4 space-y-4">
        {data.donationsByContent.map((donation, index) => (
          <div key={`${donation.id}-${index}`} className="flex gap-4 rounded-lg">
            <div className="flex-shrink-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={donation.donor.userimg} />
                <AvatarFallback>{donation.donor.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
  
            <div className="flex-1 flex flex-col bg-white/5 p-4 rounded-lg border border-[#5C7683]/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-sm">
                  {donation.donor.name.length > 10 
                    ? `${donation.donor.name.slice(0, 10)}...` 
                    : donation.donor.name}
                </span>
                <Dot className="w-4 h-4" />
                <span className="font-light text-sm">
                  {(() => {
                    const donationDate = new Date(Number(donation.createdAt));
                    const now = new Date();
                    const diffTime = Math.abs(now - donationDate);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 0) return 'Today';
                    if (diffDays === 1) return 'Yesterday';
                    return `${diffDays} days ago`;
                  })()}
                </span>
              </div>
              <p className="font-semibold text-xs">
                {donation.msg || "Made a donation"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  

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
      console.error("Content Query Error:", error);
      handleAuthenticationError(error);
    },
  });



  const content = contentData?.contents || [];
  const currentUser= profileData?.usermanage?.id|| [];
  const currentUserPict= profileData?.usermanage?.userimg|| [];





  console.log("id user",currentUser);

  const { id } = useParams();

  const [activeSection, setActiveSection] = useState("About");

  // Sections array
  const sections = [
    "About",
    "Updates",
    "Hope",
    "Fundraise",
    "Donate"
  ];


  const navigateToDonate = (campaignid) => {
    navigate(`/Donate/${campaignid}`);
  };
  
  const navigateToManageCampaign = (campaignid) => {
    navigate(`/managecampaign/${campaignid}`);
  };

  const navigateToFundraisePage = (fundraiseId) => {
    navigate(`/detailfundraise/${fundraiseId}`);
  };

  const navigateToProfilePage = (ProfileId) => {
    navigate(`/${ProfileId}`);
  };

  // Find campaign data by ID
  const campaignData = content.find((item) =>
    createSlug(item.id) === id || item.id == id
  );

  const copyToClipboard = () => {
  
    const url = `${campaignData.address}`; // Append selectedDonation.id as suffix
    navigator.clipboard.writeText(url)
        .then(() => {
            alert("Link copied to clipboard!"); // Notify the user
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy the link. Please try again.");
        });
};



  const SocialLinksSection = ({ campaignData }) => {
    if (!campaignData?.user) return null;
  
    const socialLinks = {
      x: campaignData.user.X,
      instagram: campaignData.user.instagram,
      linkedin: campaignData.user.linkedin,
      telegram: campaignData.user.telegram,
      youtube: campaignData.user.youtube,
      website: campaignData.user.website
    };
  
    return <SocialMediaIcons socialLinks={socialLinks} />;
  };

  if (!campaignData) {
    return <div className="text-white">Campaign not found</div>;
  }

  console.log(campaignData.organizationNameId);
  //change color badge 
  const categoryColors = {
    Emergency: "bg-[#D16F57] text-white hover:bg-[#D16F57]/90",
    Education: "bg-[#E7404A] text-white hover:bg-[#E7404A]/90",
    HealthCare: "bg-[#5794D1] text-white hover:bg-[#5794D1]/90",
  };
  const selectedColorClass = categoryColors[campaignData.category] || "bg-gray-600 text-white";

  const categories = [
    "Emergency",
    "Education",
    "HealthCare"
  ];


  // the start update dummy data
  const updateData =[
    { id:"#sxabydg6x",amount:"$ 1000", title:"for food and cloths", createdAt: "2024-12-17",description:"We have withdrawn funds specifically to provide essential food and clothing to families affected by the recent floods and landslides in Bosnia, ensuring prompt and transparent relief efforts."},
    { id:"sd#@ddncbeaj",amount:"$ 2000", title:"for Medicine and babies", createdAt: "2024-12-16",description:"We have withdrawn funds specifically to provide essential food and clothing to families affected by the recent floods and landslides in Bosnia, ensuring prompt and transparent relief efforts."}
    ];
    
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
        img: "../src/assets/no1.png"  },
      {
        id: 2,
        name: "Marsya Jennah",
        amount: "$1,800",
        img: "../src/assets/no2.png"  },
      {
        id: 3,
        name: "Hans Weber",
        amount: "$1,500",
        img: "../src/assets/no3.png"  },
      {
        id: 4,
        name: "Phoebe Chen",
        amount: "$1,200",
        img: "../src/assets/no4.png"  },
      {
        id: 5,
        name: "Alex Smith",
        amount: "$1,000",
        img: "../src/assets/no5.png"  },
      {
        id: 6,
        name: "Sarah Johnson",
        amount: "$950",
        img: "../src/assets/no6.png"  },
      {
        id: 7,
        name: "Michael Chang",
        amount: "$875",
        img: "../src/assets/no7.png"  },
      {
        id: 8,
        name: "Emma Wilson",
        amount: "$800",
        img: "../src/assets/no8.png"  },
      {
        id: 9,
        name: "David Park",
        amount: "$750",
        img: "../src/assets/no9.png"  },
      {
        id: 10,
        name: "Lisa Torres",
        amount: "$700",
        img: "../src/assets/no10.png"  }
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
        { pict: "../src/assets/comment1.png" },
        { pict: "../src/assets/comment2.png" },
        { pict: "../src/assets/comment3.png" },
        { pict: "../src/assets/comment4.png" },
        { pict: "../src/assets/comment5.png" }
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
          <RichTextRenderer content={campaignData.description} />
         
              </div>
    
            );
          case "Updates":
            return (
              <div className="text-gray-300">
               {campaignData && (
        <>
          <WithdrawalsList contentId={campaignData.id} />
          {/* ... rest of your existing Updates content ... */}
        </>
      )}
              </div>
            );
          case "Hope":
            return (
              <div className="text-gray-300">
                {campaignData && (
        <DonationComments contentId={campaignData.id} />
      )}
                
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
                          contentId: campaignData.id,
                          campaign: campaignData.title,
                          organizationName: campaignData.organizationName
                        }
                      });
                    }}
                  >
                    Start Fundraise
                  </Button>
                </div>
              </div>
                {campaignData.fundraise || "Learn how you can help fundraise for this campaign."}
                <div>
    
                  {campaignData.fundraises?.length > 0 ? (
                    <ul>
                      {campaignData.fundraises.map((fundraise) => (
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
                            <div className='p-2' >
                              <Avatar className="h-15 w-15 ">
                                <AvatarImage src={fundraise.author.userimg} />
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
                                      <AvatarImage src="../src/assets/profile_default_2.png" />
                                      <AvatarFallback>A1</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-6 w-6 ">
                                      <AvatarImage src="../src/assets/profile_default_4.png" />
                                      <AvatarFallback>A2</AvatarFallback>
                                    </Avatar>
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src="../src/assets/profile_default_3.png" />
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
                      No fundraises found for this campaign.
                    </p>
                  )}
                </div>
            
                
              </div>
            );
          case "Donate":
            return (
              <div className="text-gray-300">
              {campaignData && (
        <DonateSection 
          address={campaignData.address}
          selectedDonation={campaignData}
          navigateToProfilePage={navigateToProfilePage}
        />
      )}
    
    
    
    
    
                {/* footer note  */}
                
              </div>
            );
          default:
            return null;
        }
      };

  if (contentLoading || profileLoading) {
    return <div> loading..</div>;
  }

  // Error handling
  if (contentError || profileError) {
    return (
      <ErrorDisplay
        message="Failed to load dashboard data"
        onRetry={() => {
          refetchcontent();
          refetchprofile();
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 w-full flex pt-10">
      {/* Left Column - Image */}
      <div className="w-2/5 pr-8  place-items-center  max-h-[calc(100vh-2rem)] overflow-y-auto ">
        <img
          src={campaignData.imageSrc}
          alt={campaignData.title}
          className="w-[300px] h-[250px] object-cover rounded-lg"
        />


        <div className='w-full'>
          {/* footer note  */}
          <div className="w-full mt-4 text-white">
            <Separator className="bg-[#5C7683] border[0.2] mb-2" />
              {/* manage button */}
            { campaignData.organizationNameId === currentUser && (
                  <div className='w-full flex justify-between font-bold bg-[#FFF7D7]/40 text-[#FFF7D7] text-sm  rounded-sm py-4 text-right px-2'>
                    Manage your Campaign!
            <button className='bg-[#FFF7D7] text-[#153749] font-extrabold  rounded-xl text-sm py-0' onClick={() => {
              console.log('Manage clicked for organization');
              navigateToManageCampaign(campaignData.id)
              
            }}>
              Manage
            </button>
            </div>
          )}

            <div className="mt-4 flex items-center" onClick={() => navigateToProfilePage(campaignData?.user?.id)}>
              <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src= {campaignData?.user?.userimg} />
              <AvatarFallback>CN</AvatarFallback>
              </Avatar>

              <div className="ml-2 text-left">
                <span className="text-xs font-light block text-white/70">Campaign Organizer</span>
                <span className="text-md font-bold">{campaignData.organizationName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-white/70">
            <SocialLinksSection campaignData={campaignData} />

            </div>

            <div className="mt-2 text-left">
              <span className="text-sm cursor-pointer hover:underline text-white/70">Report campaign</span>
            </div>

            <div
              className="w-full rounded-lg p-4 text-xs mt-2 font-light text-left text-white/70  text-[10px]"
              style={{
                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="text-white text-xs font-bold block mb-1 text-left">Disclaimer:</span>
              All information, opinions, and photos on this Campaign page are owned and managed by the Organizer. If you encounter any issues or have suspicions
            </div>
          </div>
        </div>

      </div>

      {/* Right Column - Campaign Details */}
      <div className="w-3/5 pl-8  text-left text-white">

        <Badge className={`px-4 py-2 mb-2 items-center gap-2 ${categoryColors[campaignData.category] ||
          "bg-gray-600 text-white hover:bg-gray-600/90"
          }`}>
          {campaignData.category}
        </Badge>
         {/* manage button */}
         
        <div className="text-2xl font-bold mb-4">{campaignData.title}</div>
        <div className="text-sm font-light ">{campaignData.address} <button className='bg-[#173C4F] rounded-2xl p-2 ' onClick={copyToClipboard}><Copy className='w-4 h-4' /></button></div>
      
        <div className="text-white font-semibold text-md  items-center   justify-start gap-2 inline-flex ">

          <Calendar className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
          <div className="flex flex-col">
          <span className="text-md">
  {new Date(Number(campaignData.startDate)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}
  {' - '}
  {new Date(Number(campaignData.endDate)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}
</span>

          </div>
        </div>


        <div className="flex items-center gap-2 text-white  mb-2">
          <MapPin className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
          <span>{campaignData.location}</span><ArrowUpRight className="w-4 h-4" />
        </div>


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
              ${campaignData.currentAmount.toLocaleString()}
              <span className="text-gray-400"> / ${campaignData.targetAmount.toLocaleString()}</span>
            </span>
            <span className="text-white bg-[#5794D1] font-semibold px-2 rounded-md">
              {Math.min(
                Math.round((campaignData.currentAmount / campaignData.targetAmount) * 100),
                100
              )}%
            </span>
          </div>
          <Progress
            value={Math.min(
              Math.round((campaignData.currentAmount / campaignData.targetAmount) * 100),
              100
            )}
            className="w-full mb-2"
            indicatorClassName="bg-[#5794D1]"
          />
          <div className="flex w-full">
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center gap-2 text-gray-400">
                <Heart className="h-5 w-5 text-[#5794D1]" />
                <span className="font-bold text-md text-white">{campaignData.donationCount} </span> donations
              </div>
              <div className="text-gray-400">
                {campaignData.dayLeft} days left
              </div>
            </div>
          </div>
        </div>

           {/* Sticky Footer */}
           <div className="mt-4 p-4 rounded-md" >                
            <div className="flex gap-4  px-20 rounded-lg">
                  <Button
                   onClick={() => {
             
                    navigateToDonate(campaignData.id);
                  }}
                    className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white"
                    
                  >
                    Donate Now
                  </Button>
                </div>
              </div>

        {/* menu navbar  */}
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
  );
};

export default CampaignDetailPage;