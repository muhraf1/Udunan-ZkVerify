import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate, Navigate,useParams } from 'react-router-dom';
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/components/ui/AuthContext';
import { createSlug } from '@/lib/stringutils';
import { toast } from 'sonner';

import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar, Copy, CircleArrowUp,
    Twitter , // Renaming Twitter to X for consistency with SOCIAL_ICONS
    Instagram,
    Linkedin,
    Github,
    Youtube,
    Send,
    Globe
} from 'lucide-react';
import { Separator } from '@/components/ui/Separator';

//graphQL
import { useQuery, gql, useMutation } from '@apollo/client';


// Social Icons Component view 
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




//  fetching data content (campaign)
const FETCH_USER_CONTENTS = gql`
query FetchUserContents {
  contents{
    id
    title
    isVerified
    currentAmount
    targetAmount
    donationCount
    dayLeft
    category
    location
    organizationName
    imageSrc
    description
    startDate
    endDate
    user {
    id
    name
    userimg
    userId
    }
  }
}
`;

// fetch data profile
const FETCH_USER_PROFILE = gql`
  query FetchUserProfile($id: ID!) {
    userprofile(id: $id) {
      id
      email
      userimg
      name
      bio
      address
      createdContents {
        id
      }
      fundraises {
        id
      }
      donations {
        id
      }
      X
      instagram
      linkedin
      telegram
      youtube
      website
      createdAt
      updatedAt
    }
  }
`;

// fetch data fundraise 
const FETCH_USER_FUNDRAISE = gql`
query FetchUserFundraise {
  fundraises{
    id
    title
    description
    fundimg 
    authorId
    author {
      id
      name
      email
      userimg
    }
    content {
      id
      startDate
      endDate
      imageSrc
      targetAmount
      currentAmount
      organizationName
    }
  }
}
`;


// edit profile

   




// Dummy User Data
const DUMMY_USER = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    joinedDate: "April 2024",
    walletAddress: "0x08c03cf4edbb9a8ec2f5629bd0e1549b636d0080",
    socialLinks: {
        website: "hahah,com",
        facebook: "https://facebook.com/johndoe",
        youtube: "https://instagram.com/johndoe",
       



    },
    stats: {
        donations: 6,
        campaigns: 2,
        fundraisers: 1
    }
};


const MyProfilePublic = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { token } = useAuth();
 

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

   


    //fetch user contents
    const {
        data: contentData,
        loading: contentLoading,
        error: contentError,
        refetch: refetchContent
    } = useQuery(FETCH_USER_CONTENTS);


  // fetch profile 
  const {
    data: profileData,
    loading: profileLoading,
    error: profileError,
} = useQuery(FETCH_USER_PROFILE, {
    variables: { id },
    fetchPolicy: "cache-and-network",
    onError: (error) => {
        console.error("Profile Query Error:", error);
    },
});
    // fetch funraise 
    const {
        data: fundraiseData,
        loading: fundraiseLoading,
        error: fundraiseError,
        refetch: refetchFundraise
    } = useQuery(FETCH_USER_FUNDRAISE);

    const handleAuthenticationError = (error) => {
        if (error.message.includes(error.message)) {

        }
    };


    // Calculate stats from the query results


   

    // Extract data safely
    const content = (contentData?.contents || []).filter(item => item.user?.id === id);
    const fundraisefeed = (fundraiseData?.fundraises || []).filter(item => item.authorId === id);
    const userprof = profileData?.userprofile || [];
 

    // const fundraisefeed = fundraiseData?.fundraises || [];
    // console.log("check token ", token); 
    console.log('Check user profile', userprof);
    console.log('Check user content', userprof);
    console.log('Check user fundraise', userprof);


    const stats = {
        donations: userprof.donations?.length || 0,
        campaigns: userprof.createdContents?.length || 0,
        fundraisers: userprof.fundraises?.length || 0
    };


    //adapter 
    const fundraiseFeedForOverview = fundraisefeed.slice(0, 5); // For CombinedFeed, limit to top 5
    const fundraiseFeedForSection = fundraisefeed; // Use full data for Fundraise section
    const contentDataForOverview = content.slice(0, 5);
    const contentDataForSection = content;


    // Section Navigation State
    const [activeSection, setActiveSection] = useState("view");
    const sectionRefs = useRef([]);
    const sections = ["view", "settings"];
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        userimg: null,
        X: '',
        instagram: '',
        linkedin: '',
        telegram: '',
        youtube: '',
        website: ''
    });

    
    // const userprof = userprof.find((item) =>
    //     createSlug(item.id) === id || item.id == id
    // );
    // console.log("check profile",userprof);
    // console.log("check profile 2",userprof); 


    const SocialLinksSection = ({ userprof }) => {
        if (!userprof) return null;
      
        const socialLinks = {
          x: userprof.X,
          instagram: userprof.instagram,
          linkedin: userprof.linkedin,
          telegram: userprof.telegram,
          youtube: userprof.youtube,
          website: userprof.website
        };
      
        return <SocialMediaIcons socialLinks={socialLinks} />;
      };

    if (!userprof) {
        return <div className="text-white">Profile not found</div>;
    }

      
    // useEffect(() => {
    //     if (userprof) {
    //         setInitialData(userprof);

    //     }
    // }, [userprof]);



    const [initialData, setInitialData] = useState({}); // Added initialData state


   


    if (!userprof) {
        return <div className="text-white">Campaign not found</div>;
    }

    const navigateToCampaignPage = (campaignId) => {
        navigate(`/detailcampaign/${campaignId}`);
    };
    const navigateToFundraisePage = (fundraiseId) => {
        navigate(`/detailfundraise/${fundraiseId}`);
    };


    const handleCardClick = (item) => {
        if (item.type === 'campaign') {
            navigateToCampaignPage(item.id);
        } else {
            navigateToFundraisePage(item.id);
        }
    };




    // formatdate 
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Select Date';


        // Convert to number if it's a string
        const dateNum = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
        const date = new Date(dateNum);

        return !isNaN(date.getTime())
            ? date.toLocaleDateString("en-US", {
                //   weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            : 'Invalid Date';
    };



    // Render Section Content
    const renderSectionContent = () => {
        const user = DUMMY_USER;

        // the start of combined feed for overview section
        const CombinedFeed = ({ contentData, fundraiseData, profileData }) => {
            console.log("Received contentData:", contentData); // Should now be an array of campaigns
            console.log("Received fundraiseData:", fundraiseData); // Should now be an array of fundraisers


            if (!contentData || !fundraiseData || !profileData) {
                return <div>No data available</div>;
            }
            // Combine and sort feed items
            const sortedFeedItems = useMemo(() => {
                const campaignItems = (contentData || []).map(campaign => ({
                    ...campaign,
                    type: 'campaign',
                    date: campaign.startDate
                }));

                const fundraiserItems = (fundraiseData || []).map(fundraiser => ({
                    ...fundraiser,
                    type: 'fundraiser',
                    // Use content's start date for sorting
                    date: fundraiser.content?.startDate || fundraiser.createdAt
                }));

                return [...campaignItems, ...fundraiserItems].sort((a, b) => {
                    // Ensure we're parsing a number (timestamp)
                    const dateA = new Date(Number(a.date) || a.date).getTime();
                    const dateB = new Date(Number(b.date) || b.date).getTime();
                    return dateA - dateB;
                });
            }, [contentData, fundraiseData]);

            // Render loading or empty state
            if (!contentData && !fundraiseData) {
                return (
                    <div className="flex flex-col mt-10 text-white">
                        <div>No campaigns or fundraisers found</div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col ">
                    {sortedFeedItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleCardClick(item)}
                            role="button"
                            className="flex justify-start gap-8 items-center bg-transparent mt-8 cursor-pointer p-4 rounded-lg transition-all duration-200 hover:bg-[linear-gradient(to_bottom_right,rgba(73,106,121,0.2),rgba(52,59,70,0.2))] hover:backdrop-blur-md"
                        >
                            {/* Left Side - Image */}
                            <div className="rounded-lg">
                                <img
                                    src={

                                        item.type === 'campaign'
                                            ? item.imageSrc || "https://via.placeholder.com/200"
                                            : item.fundimg || "@/assets/logo_udunan.png"
                                    }
                                    alt={item.title}
                                    width="200"
                                    height="100"
                                    className="object-cover rounded-lg"
                                />
                            </div>

                            {/* Right Side */}
                            <div className="flex flex-col justify-start gap-1">
                                <div className="text-lg font-bold">{item.title}</div>

                                {/* Organization/Author */}
                                <div className="font-light text-sm inline-flex items-center">
                                    <Avatar className="h-6 w-6 mr-2 cursor-pointer">
                                        <img
                                            src={

                                                item.type === 'campaign'
                                                    ? item.user.userimg || "https://via.placeholder.com/200"
                                                    : item.author.userimg || "@/assets/logo_udunan.png"
                                            }
                                            alt="Profile"
                                            className="rounded-full"
                                        />
                                    </Avatar>
                                    <span>
                                        {item.type === 'campaign'
                                            ? `By ${item.organizationName || "Unknown"}`
                                            : `By ${item.author?.name || "Unknown"}`}
                                    </span>
                                </div>

                                {/* Campaign Specific Details */}
                                {item.type === 'campaign' && (
                                    <>
                                        <div className="font-light text-sm mb-2">
                                            <span className="text-md">
                                                {new Date(Number(item.startDate)).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {' - '}
                                                {new Date(Number(item.endDate)).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                    </>
                                )}



                                {/* Badge */}
                                <div className="text-lg font-semibold">
                                    <Badge
                                        className={`bg-transparent text-base ${item.type === 'campaign'
                                            ? 'border-red-500 text-white'
                                            : 'border-blue-500 text-white'
                                            }`}
                                    >
                                        {item.type === 'campaign' ? 'Campaign' : 'Fundraise'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        };


        // logic copy link button 
        const copyToClipboard = () => {
            if (!user || !userprof.address) {
                alert("No wallet selected to copy the link.");
                return;
            }
            const url = `${userprof.address}`; // Append selectedDonation.id as suffix
            navigator.clipboard.writeText(url)
                .then(() => {
                    alert("Link copied to clipboard!"); // Notify the user
                })
                .catch((err) => {
                    console.error("Failed to copy: ", err);
                    alert("Failed to copy the link. Please try again.");
                });
        };


        // ✅ Handle input changes
        // Handle input changes for all form fields
        const handleInputChange = (e) => {
            const { name, value } = e.target;

            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            } else {
                // Handle regular inputs
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        };

        // const handleImageChange = (e) => {
        //     const file = e.target.files?.[0];
        //     if (file) {
        //         const reader = new FileReader();
        //         reader.onloadend = () => {
        //             const base64String = reader.result;
        //             setImagePreview(base64String);
        //             setFormData(prev => ({
        //                 ...prev,
        //                 userimg: base64String
        //             }));
        //         };
        //         reader.readAsDataURL(file);
        //     }
        // };


        const processImage = async (imageDataUrl, options = {}) => {
            const { maxWidth = 1200, maxHeight = 800, maxSizeInMB = 5, quality = 0.8, format = 'jpeg' } = options;
        
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                let [newWidth, newHeight] = [img.width, img.height];
                const aspectRatio = img.width / img.height;
        
                if (newWidth > maxWidth) {
                  newWidth = maxWidth;
                  newHeight = Math.round(maxWidth / aspectRatio);
                }
                if (newHeight > maxHeight) {
                  newHeight = maxHeight;
                  newWidth = Math.round(maxHeight * aspectRatio);
                }
        
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
                let currentQuality = quality;
                let result = canvas.toDataURL(`image/${format}`, currentQuality);
        
                while (result.length > maxSizeInMB * 1024 * 1024 && currentQuality > 0.1) {
                  currentQuality -= 0.1;
                  result = canvas.toDataURL(`image/${format}`, currentQuality);
                }
        
                const finalSizeInMB = result.length / (1024 * 1024);
                if (finalSizeInMB > maxSizeInMB) {
                  reject(new Error(`Image size ${finalSizeInMB.toFixed(2)}MB exceeds maximum size ${maxSizeInMB}MB`));
                  return;
                }
                resolve(result);
              };
        
              img.onerror = () => reject(new Error('Failed to load image.'));
              img.src = imageDataUrl;
            });
          };

        const handleImageChange = async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
    
            const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validFormats.includes(file.type)) {
                toast.error('Please upload JPG, JPEG, or PNG images.');
                return;
            }
    
            const fileSizeInMB = file.size / (1024 * 1024);
            if (fileSizeInMB > 5) {
                toast.error('Image size exceeds 5MB. Please upload a smaller image.');
                return;
            }
    
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const processedImage = await processImage(reader.result, {
                        maxSizeInMB: 5,
                        quality: 0.7,
                        format: file.type.includes('png') ? 'png' : 'jpeg',
                    });
    
                    setImagePreview(processedImage);
                    setFormData((prev) => ({ ...prev, userimg: processedImage }));
                    toast.success('Image uploaded successfully!');
                };
    
                reader.onerror = () => toast.error('Failed to read the image file.');
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Image processing error:', error);
                toast.error(error.message || 'Failed to process the image.');
            }
        };




        // ✅ Handle form submission
        



        switch (activeSection) {
            case "view":
                return (
                    <div className=' flex flex-col'>
                        <div className='flex justify-start text-[#356686]'>
                            {/* Left side profile picture */}
                            <div>
                                <Avatar className="w-40 h-40 cursor-pointer">
                                    <AvatarImage src={userprof.userimg} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Right side profile details */}
                            <div className='flex flex-col justify-start ml-4'>
                                <span className='text-4xl font-bold text-white'>{userprof.name}</span>
                                <span className='text-white/70'>{userprof.bio}</span>
                                <div className='flex flex-row items-center gap-2'>
                                    <Calendar className='w-4 h-4' />
                                    <span className='text-lg font-semibold'>
                                        Joined {formatDate(userprof.createdAt)}
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    {userprof.address}
                                    <button className='bg-[#173C4F] rounded-2xl p-2 ' onClick={copyToClipboard}><Copy className='w-4 h-4' /></button>
                                </div>
                                <div className='flex flex-row gap-4 my-1'>
                                    <div className='text-white font-bold text-xl'>{stats.donations} <span className='text-[#356686] font-normal text-base '> Donations</span></div>
                                    <div className='text-white font-bold text-xl' >{stats.campaigns} <span className='text-[#356686] font-normal text-base '> Campaigns</span></div>
                                    <div className='text-white font-bold text-xl'>{stats.fundraisers} <span className='text-[#356686] font-normal text-base '> Fundraise</span></div>
                                </div>
                                <Separator className="bg-white/10" />
                                <SocialLinksSection userprof={userprof} />
                                </div>

                            <div >
                            </div>

                        </div>
                        {/* profile label  */}
                        <div className="flex flex-col text-white mt-10 font-bold text-xl">
                            Running Campaign & Fundraise
                            <Separator className="bg-gray-700 mt-2" />
                        </div>
                        {/* combined feeds  */}
                        <div>
                            <CombinedFeed
                                contentData={contentDataForOverview}
                                fundraiseData={fundraiseFeedForOverview}
                                profileData={profileData}
                            />
                        </div>
                    </div>
                );
           
                return null;
        }
    };


    // Loading state
    if (contentLoading || fundraiseLoading || profileLoading) {
        return <div> loading..</div>;
    }

    // Error handling
    if (contentError || fundraiseError || profileError) {
        return (
            <ErrorDisplay
                message="Failed to load dashboard data"
                onRetry={() => {
                    refetchContent();
                    refetchFundraise();
                    refetchprofile();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen text-left text-white px-14 py-4 pt-0 mx-auto">
            <div className="relative flex justify-start px-40 mx-20 text-left pt-4 bt-4">
                {/* {sections.map((section, index) => (
                    <button
                        key={section}
                        ref={(el) => (sectionRefs.current[index] = el)}
                        className={`
                            text-lg font-lg px-3 py-2 rounded-md transition-all duration-300 relative
                            flex-1
                            ${activeSection === section
                                ? 'bg-transparent text-white after:absolute after:bottom-0 after:left-0 after:w-1/3 after:h-[2px] after:bg-white'
                                : 'text-gray-400 bg-transparent hover:text-gray-200'}
                            before:absolute before:bottom-0 before:left-0 before:w-full before:h-[1px] before:bg-gray-700
                            hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-500
                        `}
                        onClick={() => {
                            setActiveSection(section);
                        }}
                    >
                        {section}
                        {activeSection === section && (
                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white transition-all duration-300" />
                        )}
                    </button>
                ))} */}
            </div>
            <div className="pr-4 mt-10">
                {renderSectionContent()}
            </div>

            
        </div>
    );
}

export default MyProfilePublic;