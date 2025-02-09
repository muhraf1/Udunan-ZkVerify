import React, { useState, useRef } from 'react';
import { useAuth } from '@/components/ui/AuthContext'; // Import the hook
import { createCampaign } from '@/lib/createCampaign';
import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom'; // Added missing import
import { useQuery, gql } from '@apollo/client';
import { toast } from 'sonner';

//smart contract setup 

// import { CampaignFactoryModule} from '../../hardhat/ignition/modules/CampaignFactory';
import { Input } from '@/components/ui/input';
import TipTapImage from '@tiptap/extension-image';
import { useMutation } from '@apollo/client';
import { Textarea } from "@/components/ui/textarea"
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import Heading from '@tiptap/extension-heading';
import { CalendarDays, Dot, CircleArrowUp, MapPin } from "lucide-react"; // Assuming you're using Lucide icons

    
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";



// GraphQL setup
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      name
    }
  }
`;

const CREATE_CONTENT_MUTATION = gql`
  mutation CreateContent(
    $title: String!
    $category: CategoryStatus!
    $location: String
    $address: String
    $organizationName: String
    $organizationNameId: String!
    $isVerified: Boolean
    $imageSrc: String
    $description: String
    $startDate: String!
    $endDate: String!
    $targetAmount: Float!
  ) {
    createContent(
      title: $title
      category: $category
      location: $location
      address: $address
      organizationName: $organizationName
      organizationNameId: $organizationNameId
      isVerified: $isVerified
      imageSrc: $imageSrc
      description: $description
      startDate: $startDate
      endDate: $endDate
      targetAmount: $targetAmount
    ) {
      id
      title
      category
    }
  }
`;




const CreateCampaign = () => {
    // Authentication

    const { isLoggedIn, token} = useAuth();
    const [isTyping, setIsTyping] = useState(false);
    console.log("Token:", token);

    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch current user data
    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER, {
        fetchPolicy: "cache-and-network",
        context: {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        },
        skip: !token,
    });
    

    const currentUSer = userData?.me?.id || [];
     const userName = userData?.me?.name || "My";
    console.log("Current User Create:", userData);
    console.log("Current User ID:", userData);
    console.log("Current User Name:", userName);

    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        location: '',
        isVerified: false,
        address: '', // Added this required field
        organizationName: 'Test',
        network: 'Ethereum',
        targetAmount: '',
        category: '',
        imageSrc: null,
    });

    const [createContent, { loading: createLoading }] = useMutation(CREATE_CONTENT_MUTATION, {
        onCompleted: () => {
            navigate('/');
            toast.success('Campaign created successfully!');
        },
        onError: (error) => {
            console.error('Error creating campaign:', error);
            toast.error(`Failed to create campaign: ${error.message}`);
        }
    });

    // State Management
   
    const [imagePreview, setImagePreview] = useState(null);


    // color category
    const categoryColors = { Emergency: "bg-[#D16F57] text-white hover:bg-[#D16F57]/90", Education: "bg-[#E7404A] text-white hover:bg-[#E7404A]/90", HealthCare: "bg-[#5794D1] text-white hover:bg-[#5794D1]/90", };
    const categories = ["Emergency", "Healthcare", "Education", "Animal", "Others"];

    // Initialize Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit, // Basic editor functionality
            Bold, // Bold text formatting
            Italic, // Italic text formatting
            Heading.configure({ levels: [1, 2] }), // Allows H1 and H2 headings
            TipTapImage.extend({
                addOptions() {
                    return {
                        ...this.parent?.(),
                        HTMLAttributes: {
                            style: 'width: 300px; height: 200px; border-radius:5px;', // Set fixed size for all images
                        },
                    };
                },
            }),
        ],

        content: '<p>Add your description here...</p>',
        onUpdate: () => setIsTyping(true), // Detect typing activity
        onBlur: () => setIsTyping(false), // Stop detecting when editor is blurred
        editorProps: {
            handlePaste(view, event) {
                const items = event.clipboardData?.items;

                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith('image/')) {
                            const file = item.getAsFile();
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const src = reader.result;
                                    view.dispatch(
                                        view.state.tr.replaceSelectionWith(
                                            view.state.schema.nodes.image.create({
                                                src,
                                                style: 'width: 200px; height: 100px;',
                                            })
                                        )
                                    );
                                };
                                reader.readAsDataURL(file);
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
        }, // Initial content
    });

    const addImage = () => {
        const url = prompt('Enter the image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };


    const fileInputRef = useRef(null);
    // Usage example:
     // 📂 **Handle Image Change**
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
                    maxWidth: 800,
                    maxHeight: 600,
                    maxSizeInMB: 5,
                    quality: 0.7,
                    format: file.type.includes('png') ? 'png' : 'jpeg',
                });

                setImagePreview(processedImage);
                setFormData((prev) => ({ ...prev, imageSrc: processedImage }));
                toast.success('Image uploaded successfully!');
            };

            reader.onerror = () => toast.error('Failed to read the image file.');
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Image processing error:', error);
            toast.error(error.message || 'Failed to process the image.');
        }
    };

    if (!editor) return null;


    const handleFormChange = (field, value) => {
 
        setFormData(prev => ({ ...prev, [field]: value }));
    };


    // 🖼️ **Image Processing Logic**
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
    

//    the end of handling image 

//create smart contract 
const createCampaignOnBlockchain = async (title, description, targetAmount) => {
    try {
        // Create campaign using the imported function
        const campaignAddress = await createCampaign(title, description, targetAmount);
        
        if (!campaignAddress) {
            throw new Error("Failed to get campaign address");
        }

        // Store the campaign address in formData
        setFormData(prev => ({
            ...prev,
            address: campaignAddress
        }));

        return campaignAddress;
    } catch (error) {
        console.error("Blockchain error:", error);
        throw new Error(error.message || "Failed to create campaign on blockchain");
    }
};


    // the start of logic submit 
    const handleSubmit = async () => {
        if (!isLoggedIn || !token) {
            toast.error("Please log in to create a campaign");
            return;
        }
    
        const { 
            title, 
            startDate, 
            endDate, 
            location, 
            address,  // Include address
            targetAmount, 
            category, 
            imageSrc,
            isVerified
        } = formData;
        const description = editor?.getHTML() || '';
    
        if (!title || !startDate || !endDate || !targetAmount || !category || !imageSrc || !address) {
            toast.error("Please fill in all required fields");
            return;
        }
    
        try {
            // Create campaign on blockchain
            toast.info("Creating campaign on blockchain...");
            const campaignAddress = await createCampaignOnBlockchain(title, description, targetAmount);

            toast.success("Campaign created on blockchain!");
    
            // Save the campaign details to the backend
            await createContent({
                variables: {
                    title,
                    category,
                    location,
                    address: campaignAddress,
                    isVerified,
                    imageSrc,
                    description,
                    startDate: new Date(startDate).toISOString(),
                    endDate: new Date(endDate).toISOString(),
                    targetAmount: parseFloat(targetAmount),
                    organizationName: userData?.me?.name, 
                    organizationNameId: userData?.me?.id,
                },
                context: {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            });
    
            toast.success("Campaign created successfully!");
            navigate('/');
    
        } catch (err) {
            console.error('Error submitting campaign:', err);
            toast.error(err.message || "Error creating campaign");
        }
    };


    // the end of logic submit
    if (!token) {
        if (!token) {
            return <Navigate to="/" replace />;
        }

    }

    // Content loading and error handling
    if (userLoading) {
        return <div>Loading content...</div>;
    }

    if (userError) {
        return (
            <ErrorDisplay
                message="Failed to load content data"
                onRetry={refetchContent}
            />
        );
    }

    return (
        <div className="min-h-screen text-center text-white px-14 py-8 pt-10 mx-auto">
            <div className="flex flex-col">
                {/* Image campaign section */}
                <div className="relative w-full h-full">
                    <img
                        src={imagePreview || './src/assets/campaign_placeholder.png'}
                        alt=""
                        className="w-full h-full object-cover  rounded-lg max-w-[720px] max-h-[268.8px]"
                    />
                    {/* Upload Image button */}
                    <label
                        htmlFor="picture"
                        className="absolute bottom-2 right-2 h-10 w-10 cursor-pointer"
                    >
                        <CircleArrowUp className="h-full w-full text-black bg-white rounded-3xl" />
                        <Input
                            id="picture"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"

                        />
                    </label>

                </div>

                {/* Campaign title */}
                <div className="flex justify-start">
                    <input
                        className="mt-8 text-left font-bold text-3xl bg-transparent"
                        type="text"
                        placeholder="Campaign Name..."
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                </div>

                {/* Campaign date and location */}
                <div className="bg-white/5 grid grid-cols-4 rounded-lg mt-4">
                    {/*  */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center ">
                            <Dot className="w-20 h-20 text-gray-400 p-0 m-0" />
                            <span className="text-white font-medium">Start</span>
                        </div>
                        <div className="flex items-center ">
                            <Dot className="w-20 h-20 text-gray-400 p-0 m-0" />
                            <span className="text-white font-medium">End</span>
                        </div>
                    </div>
                    {/*  */}
                    <div className="flex flex-col col-start-2 col-span-2 gap-3 py-8 px-8 text-white font-bold text-lg">
                        {/* Start Date Picker */}
                        <Popover>
                            <PopoverTrigger className="flex items-center justify-between bg-white/5 rounded-lg py-2 pr-4 pl-4 text-right text-white cursor-pointer">
                                <span>
                                    {formData.startDate
                                        ? formData.startDate.toLocaleDateString("en-US", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                                        : "Select Start Date"}
                                </span>
                                <CalendarDays className="w-5 h-5 text-gray-400" />
                            </PopoverTrigger>
                            <PopoverContent
        className="p-0 rounded-md border bg-white shadow-md z-[9999]"
        align="start"
        side="bottom"
        sideOffset={4}
    >                                <Calendar
                                    mode="single"
                                    selected={formData.startDate}
                                    onSelect={(date) => handleFormChange('startDate', date)}
                                    className="rounded-md border"
                                />
                            </PopoverContent>
                        </Popover>

                        {/* End Date Picker */}
                        <Popover>
                            <PopoverTrigger className="flex items-center justify-between bg-white/5 rounded-lg py-2 pr-4 pl-4 text-right text-white cursor-pointer">
                                <span>
                                    {formData.endDate
                                        ? formData.endDate.toLocaleDateString("en-US", { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
                                        : "Select End Date"}
                                </span>
                                <CalendarDays className="w-5 h-5 text-gray-400" />
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={formData.endDate}
                                    onSelect={(date) => handleFormChange('endDate', date)}
                                    className="rounded-md border"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-col items-middle justify-center rounded-lg text-left">
                        <MapPin />
                        Location
                        <input
                            type="text"
                            placeholder="Your location..."
                            className="bg-transparent"
                            value={formData.location}
                            onChange={(e) => handleFormChange('location', e.target.value)}
                        />
                    </div>
                </div>



                {/* Wallet and Network */}
                <div className="bg-white/5 grid grid-cols-2 rounded-lg mt-4 gap-6 p-8">
                    <div className="flex flex-col text-left">
                        <label htmlFor="" className="pl-2">
                            Wallet Address
                        </label>
                        <input
                            type="text"
                            className="bg-white/5 py-3 rounded-lg pl-2 mt-2"
                            placeholder="0x816ahc7a2..."
                            value={formData.address}
                            onChange={(e) => handleFormChange('address', e.target.value)}
                          />
                    </div>
                    <div className="flex flex-col text-left">
                        <label htmlFor="" className="pl-2">
                            Network
                        </label>
                        <input
                            type="text"
                            className="bg-white/5 py-3 rounded-lg pl-2 mt-2"
                            placeholder="Ethereum"
                            value={formData.network}
                            disabled />
                    </div>
                </div>

                {/* Goals and Category */}
                <div className="bg-white/5 grid grid-cols-2 rounded-lg mt-4 gap-6 p-8">
                    <div className="flex flex-col text-left bg-transparent">
                        <label htmlFor="withdrawal-amount" className="pl-2 text-lg mb-2">
                            Goals
                        </label>
                        <div className="flex bg-transparent justify-between gap-2">
                            <div className="flex bg-white/5 items-center w-full rounded-l-lg p-1 justify-center">
                                <Input
                                    id="withdrawal-amount"
                                    className="text-white border-0 text-right"
                                    placeholder="1,200"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.targetAmount}
                                    onChange={(e) => handleFormChange('targetAmount', e.target.value)}
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

                    {/* Category */}
                    <div className="flex flex-col text-left">
                        <label htmlFor="network-dropdown" className="pl-2 text-lg mb-2">
                            Category
                        </label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) => handleFormChange('category', value)}
                        >
                            <SelectTrigger
                                id="network-dropdown"
                                className="bg-white/5 h-[42px] border-0 rounded-lg pl-2"
                            >
                                <SelectValue placeholder="Select a Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-black/30 backdrop-blur-lg text-white rounded-sm border-[rgba(255,255,255,0.02)]">
                                <SelectItem value="Emergency">Emergency</SelectItem>
                                <SelectItem value="HealthCare">HealthCare</SelectItem>
                                <SelectItem value="Education">Education</SelectItem>
                                <SelectItem value="Animal">Animal</SelectItem>
                                <SelectItem value="Others">Others</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Add description */}
                <div className="bg-white/5 flex w-full rounded-lg mt-4 p-8">
                    <div className="flex flex-col text-left w-full overflow-auto border-white/5">
                        <label htmlFor="description" className="pl-2">
                            Add Description
                        </label>
                        <div className="bg-white/5 py-3 rounded-lg mt-2 border border-white/5">
                            {/* Toolbar */}
                            <div className="flex gap-2 mb-3 border-b pb-2 border-white/10">
                                <button
                                    className="px-3 py-1 bg-transparent rounded hover:bg-[#5794D1]"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                >
                                    Bold
                                </button>
                                <button
                                    className="px-3 py-1  bg-transparent rounded hover:bg-[#5794D1]"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                >
                                    Italic
                                </button>
                                <button
                                    className="px-3 py-1  bg-transparent rounded hover:bg-[#5794D1]"
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                >
                                    H1
                                </button>
                                <button
                                    className="px-3 py-1  bg-transparent rounded hover:bg-[#5794D1]"
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                >
                                    H2
                                </button>
                                <button
                                    className="px-3 py-1  bg-transparent rounded hover:bg-[#5794D1]"
                                    onClick={addImage}
                                >
                                    Add Image
                                </button>
                            </div>
                            {/* Rich Text Editor */}
                            <div
                                className="justify-center items-center rounded p-3 "
                                style={{
                                    width: 'auto', // Default width behavior
                                    height: 'auto',
                                    minHeight: '200px',
                                    maxWidth: '600px', // Minimum height   
                                    overflow: 'auto', // Scroll vertically for overflowing content
                                    whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
                                    wordWrap: 'break-word', // Break long words onto the next line
                                    overflowY: 'auto', // Enable vertical scrolling if content exceeds maxHeight
                                    wordBreak: 'break-word', // Additional safety for word breaking
                                }}
                            >
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    className="bg-white text-black mx-20 px-10 mt-8"
                    onClick={handleSubmit}
                    disabled={createLoading || !userData?.me?.id}
                >
                    {createLoading ? 'Creating Campaign...' : 'Create Campaign'}
                </button>
                {error && (
                    <p className="text-red-500 mt-4 text-center">
                        Error: {error.message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CreateCampaign;
