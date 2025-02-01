import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/ui/AuthContext';


// import { content } from '@/data/contentfeed'; // Import your content array
import { createSlug } from '@/lib/stringutils'; // Import your slug creation function if needed
import { Separator } from '@/components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MapPin, X, ChevronsRight, Link, ArrowUpRight,
    Calendar, Instagram, Globe, Twitter, Dot,  Github,
   Youtube,
   Send,    Linkedin
    } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress";
import RichTextRenderer from '@/components/ui/richtextrender';


const GET_FUNDRAISE = gql`
    query GetFundraise {
        fundraises {
        id
        title
        description
        fundimg
        createdAt
        updatedAt
        author {
            id
            name
            email
            userimg
             X
      instagram
      linkedin
      telegram
      youtube
      website
        }
        content {
            id
            title
            description
            startDate
            endDate
            location
            donationCount
            dayLeft
            targetAmount
            currentAmount
        }
        }
    }
    `;

const FETCH_USER_PROFILE = gql`
query FetchUserProfile {
  me {
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



const FundraiseDetailPage = () => {
    const { token } = useAuth(); // Destructure the token from the AuthContext
    const { id } = useParams();
    const navigate = useNavigate();


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

    const { loading, error, data } = useQuery(GET_FUNDRAISE, {
        variables: { id }
    });

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

    const navigateToCampaignPage = (campaignId) => {
        navigate(`/detailcampaign/${campaignId}`);
    };

    const navigateToManageFundraise = (fundraiseid) => {
        navigate(`/managefundraise/${fundraiseid}`);
      };

      const navigateToProfilePage = (ProfileId) => {
        navigate(`/${ProfileId}`);
      };


    if (loading || profileLoading) return <div className="text-white p-4">Loading...</div>;
    if (error || profileError) return <div className="text-white p-4">Error: {error.message}</div>;



    const fundraise_ = data?.fundraises || [];
    const currentUser = profileData?.me?.id || [];



    // Find campaign data by ID
    const fundraiseData = fundraise_.find((item) =>
        createSlug(item.id) === id || item.id == id
    );
    console.log(fundraiseData);


    const SocialLinksSection = ({ fundraiseDataData }) => {
        if (!fundraiseData?.author) return null;
      
        const socialLinks = {
          x: fundraiseData.author.X,
          instagram: fundraiseData.author.instagram,
          linkedin: fundraiseData.author.linkedin,
          telegram: fundraiseData.author.telegram,
          youtube: fundraiseData.author.youtube,
          website: fundraiseData.author.website
        };
      
        return <SocialMediaIcons socialLinks={socialLinks} />;
      };

    if (!fundraiseData) {
        return <div className="text-white">Fundraise not found</div>;
    }



    return (
        <div className="max-w-4xl mx-auto p-8 w-full flex pt-10 text-white">

            <div className="w-2/5 pr-8  place-items-center  max-h-[calc(100vh-2rem)] overflow-y-auto ">
                <img
                    src={fundraiseData.fundimg}
                    alt={fundraiseData.title}
                    className="w-[300px] h-[250px] object-cover rounded-lg"
                />

                <div className='w-full'>
                    {/* footer note  */}
                    <div className="w-full mt-4 text-white">
                        <Separator className="bg-[#5C7683] border[0.2]" />
                        {/* manage button */}
                        {fundraiseData.author.id === currentUser && (
                            <div className='w-full flex justify-between font-bold bg-[#FFF7D7]/40 text-[#FFF7D7] text-sm  rounded-sm py-4 text-right px-2'>
                                Manage your Fundraise!
                                <button className='bg-[#FFF7D7] text-[#153749] font-extrabold  rounded-xl text-sm py-0' onClick={() => {
                                    console.log('Manage clicked for organization');
                                    navigateToManageFundraise(fundraiseData.id)

                                }}>
                                    Manage
                                </button>
                            </div>
                        )}

                        <div className="mt-4 flex items-center" onClick={() => navigateToProfilePage(fundraiseData.author.id)}>
                            <Avatar className="h-8 w-8 cursor-pointer">
                                <AvatarImage src= {fundraiseData.author.userimg} />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>

                            <div className="ml-2 text-left">
                                <span className="text-xs font-light block text-white/70">Fundraiser</span>
                                <span className="text-md font-bold">{fundraiseData.author.name}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2 text-white/70">
                        <SocialLinksSection fundraiseDatanData={fundraiseData} />

                        </div>

                        <div className="mt-2 text-left">
                            <span className="text-sm cursor-pointer hover:underline text-white/70">Report Fundraise</span>
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

            {/* right side  */}
            <div className="w-3/5 pl-8  text-left text-white">
                <Badge className={`px-4 py-2 mb-2 items-center gap-2  bg-white/5 text-white hover:bg-gray-600/90`} onClick={() => navigateToCampaignPage(fundraiseData.content.id)}>
                    {fundraiseData.content.title}
                </Badge>

                <div className="text-2xl font-bold mb-4">{fundraiseData.title}</div>


                {/* map & location */}
                <div className="text-white font-semibold text-md  items-center  justify-start gap-2 inline-flex ">

                    <Calendar className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
                    <div className="flex flex-col">
                        <span className="text-md">
                            {new Date(Number(fundraiseData.content.startDate)).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                            {' - '}
                            {new Date(Number(fundraiseData.content.endDate)).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>

                    </div>
                </div>
                <div className="flex items-center gap-2 text-white  mb-2">
                    <MapPin className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
                    <span>{fundraiseData.content.location}</span><ArrowUpRight className="w-4 h-4" />
                </div>

                {/* progress */}
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
                            ${fundraiseData.content.currentAmount.toLocaleString()}
                            <span className="text-gray-400"> / ${fundraiseData.content.targetAmount.toLocaleString()}</span>
                        </span>
                        <span className="text-white bg-[#5794D1] font-semibold px-2 rounded-md">
                            {Math.min(
                                Math.round((fundraiseData.content.currentAmount / fundraiseData.content.targetAmount) * 100),
                                100
                            )}%
                        </span>
                    </div>
                    <Progress
                        value={Math.min(
                            Math.round((fundraiseData.content.currentAmount / fundraiseData.content.targetAmount) * 100),
                            100
                        )}
                        className="w-full mb-2"
                        indicatorClassName="bg-[#5794D1]"
                    />
                    <div className="flex w-full">
                        <div className="flex justify-between w-full items-center">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Heart className="h-5 w-5 text-[#5794D1]" />
                                <span className="font-bold text-md text-white">{fundraiseData.content.donationCount} </span> donations
                            </div>
                            <div className="text-gray-400">
                                {fundraiseData.content.dayLeft} days left
                            </div>
                        </div>
                    </div>
                </div>


                {/* Sticky Footer */}
                <div className="mt-4 p-2 rounded-md" >
                    <div className="flex w-full gap-2  justify-between rounded-lg">
                        <Button

                            className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white"
                        >
                            Donate Now
                        </Button>
                        <Button
                            onClick={() => navigateToCampaignPage(fundraiseData.content.id)}
                            className="w-full bg-[#5794D1]/90 text-white hover:bg-white hover:text-black"
                        >
                            See Campaign
                        </Button>
                    </div>
                </div>

                <div className='flex flex-col'>
                    <div className='text-xl mb-4 mt-2 font-bold '>
                        About
                    </div>
                    <span className='text-sm font-light text-gray-300'> <RichTextRenderer content={fundraiseData.description} />
                    </span>
                </div>



            </div>

        </div>
    );
};

export default FundraiseDetailPage;