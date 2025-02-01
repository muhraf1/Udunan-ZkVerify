import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '@/components/ui/AuthContext'; // Import the hook
import { Button } from '@/components/ui/button';
import { useNavigate, Navigate } from 'react-router-dom'; // Added missing import
import { Dot, CircleArrowUp, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import VerticalDashedLine from '@/components/ui/verticalline';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select"
import Heading from '@tiptap/extension-heading';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { toast } from 'sonner';

import { useQuery, gql,useMutation } from '@apollo/client';
import TipTapImage from '@tiptap/extension-image';



const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      name
      email
    }
  }
`;

const GET_CAMPAIGNS = gql`
  query GetCampaigns {
    contents {
      id
      title
      category
      organizationName
    }
  }
`;

const CREATE_FUNDRAISE = gql`
  mutation CreateFundraise(
    $title: String!
    $description: String
    $contentId: String!
    $authorId: String!
    $fundimg: String
  ) {
    createFundraise(
      title: $title
      description: $description
      contentId: $contentId
      authorId: $authorId
      fundimg: $fundimg
    ) {
      id
      title
      author {
        id
        name
      }
      content {
        id
        title
      }
    }
  }
`;



const SocialLinkInput = ({ prefix, value, onChange, placeholder }) => {
    const handleInputChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="flex items-center w-full">
            <div className="bg-white/5 text-white px-3 py-2 rounded-l-md border-r-none text-sm">
                {prefix}
            </div>
            <Input
                type="text"
                value={value}
                onChange={handleInputChange}
                className="rounded-l-none border-white/5 py-4 border-[2px]"
                placeholder={placeholder}
            />
        </div>
    );
};

const CreateFundraise = () => {

    // Inside your CreateFundraise component
const location = useLocation();
const campaignData = location.state;



useEffect(() => {
    if (campaignData) {
      console.log('Setting initial campaign:', campaignData);
      // Convert ID to string since Select expects string values
      handleContentSelect(String(campaignData.contentId));
    }
  }, [campaignData]);

  

  // Update handleContentSelect to handle string IDs
const handleContentSelect = (contentId) => {
    console.log('Selecting content with ID:', contentId);
    // Convert string ID back to number for find operation
    const selectedContent = campaignsData?.contents.find(
        content => content.id === parseInt(contentId)
    );
    console.log('Found selected content:', selectedContent);
    setSelectedContent(selectedContent);
    setFormData(prev => ({
        ...prev,
        campaign: selectedContent?.title || '',
        contentId: contentId // Keep as string for Select component
    }));
};

    const navigate = useNavigate();
    const [selectedContent, setSelectedContent] = useState(null);
    const { isLoggedIn, token } = useAuth();
    const [imagePreview, setImagePreview] = useState(null);
    const [campaign, setCampaign] = useState('');
    const [title, setTitle] = useState('');
    const fileInputRef = useRef(null);
    



  // Fetch current user data
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-and-network",
    context: {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    },
    skip: !token,
    onError: (error) => {
        console.error('Error creating Fundraise:', error);
        toast.error('Failed to create Fundraise.');
    },
});


const currentUSer = userData?.me.id || [];
console.log("user login Id",currentUSer);

    // Fetch available campaigns
    const { loading: campaignsLoading, error: campaignsError, data: campaignsData } = useQuery(GET_CAMPAIGNS);
    // Form state
    const [createFundraise, { loading: createLoading }] = useMutation(CREATE_FUNDRAISE, {
        onCompleted: () => {
            navigate('/');
            toast.success('Fundraise created successfully!');
        },
        onError: (error) => {
            console.error('Error creating fundraise:', error);
            toast.error(`Failed to create fundraise: ${error.message}`);
        }
    });
    const [formData, setFormData] = useState({
        title: '',
        fundraiseUrl: '',
        campaign: '',
        fundimg: null,
        authorId : '',
        contentId: '', // Add contentId to track campaign selection
        description:''

    });
    const [isTyping, setIsTyping] = useState(false);




   

     // Handle form field changes
     const handleFormChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value || ''
        }));   
     };

     // Image processing utility
   

    // rich text session
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

    // Image processing utility
    const processImage = async (imageDataUrl, options = {}) => {
        const {
            maxWidth = 800,
            maxHeight = 600,
            maxSizeInMB = 5,
            quality = 0.8,
            format = 'jpeg'
        } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to desired format
                const result = canvas.toDataURL(`image/${format}`, quality);
                resolve(result);
            };
            img.src = imageDataUrl;
        });
    };


    const addImage = () => {
        const url = prompt('Enter the image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };


   


    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validFormats = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validFormats.includes(file.type)) {
            toast.error('Please upload only JPG, JPEG, or PNG images.');
            return;
        }

        // Validate file size
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > 5) {
            toast.error('Image size is too large. Please upload an image under 5MB.');
            return;
        }

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const processedImage = await processImage(reader.result, {
                        maxWidth: 800,
                        maxHeight: 600,
                        quality: 0.8
                    });

                    setImagePreview(processedImage);
                    setFormData(prev => ({ ...prev, fundimg: processedImage }));
                    toast.success("Image uploaded successfully!");
                } catch (error) {
                    console.error('Error processing image:', error);
                    toast.error('Error processing image. Please try again.');
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error handling image:', error);
            toast.error('Error uploading image. Please try again.');
        }
    };
    // Fallback to a neutral style if category is not found






    const handleSubmit = async () => {
        if (!isLoggedIn || !token) {
            toast.error("Please log in to create a campaign");
            return;
        }
    
        const { title, contentId, fundimg } = formData;
        const description = editor?.getHTML() || '';
    
        // Validate required fields
        if (!title || !contentId || !fundimg || !currentUSer) {
            toast.error("Please fill in all required fields");
            return;
        }
    
        try {
            const result = await createFundraise({
                variables: {
                    title,
                    description,
                    contentId: contentId,
                    fundimg: fundimg,
                    authorId: currentUSer // Add this line

                },
                context: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            });
            
            toast.success("Fundraiser created successfully!");
            navigate('/');
        } catch (err) {
            console.error('Error creating fundraiser:', err);
            toast.error(err.message || "Error creating fundraiser");
        }
    };
//     // Handle form submission
//     const handleSubmit = async () => {
//     if (!isLoggedIn || !token) {
//         toast.error("Please log in to create a campaign");
//         return;
//     }

//     const { title, contentId, imageSrc } = formData;
//     const description = editor?.getHTML() || '';

//     // Validate required fields
//     if (!title || !contentId || !imageSrc) {
//         toast.error("Please fill in all required fields");
//         return;
//     }

//     try {
//         const result = await createFundraise({
//             variables: {
//                 title,
//                 description,
//                 contentId: parseInt(contentId),
//                 fundimg: imageSrc
//             },
//             context: {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             }
//         });
        
//         toast.success("Fundraiser created successfully!");
//         navigate('/');
//     } catch (err) {
//         console.error('Error creating fundraiser:', err);
//         toast.error(err.message || "Error creating fundraiser");
//     }
// };
 


       // Loading and error states for campaigns


         // the end of logic submit
    if (!token) {
        if (!token) {
            return <Navigate to="/" replace />;
        }

    }

  

       if (campaignsLoading || userLoading) return <div>Loading campaigns...</div>;
       if (campaignsError|| userError ) return <div>Error loading campaigns: {campaignsError.message}</div>;
   
    return (
        <div className="min-h-screen text-cemter text-white px-14 py-8 pt-10 mx-auto">
            <div className='flex flex-col'>

                {/* image campaign section */}
                <div className='relative w-full h-full'>
                    <img
                        src={imagePreview || './src/assets/fundraise_campaign.jpg'}
                        alt=""
                        className="w-full h-full object-cover  rounded-lg max-w-[720px] max-h-[268.8px]"
                    />

                    {/* upload button  */}
                    <label
                        htmlFor="picture"
                        className="absolute bottom-2 right-2 h-10 w-10 cursor-pointer"
                    >
                        <CircleArrowUp className="h-full w-full text-black bg-white rounded-3xl" />
                        <Input
                            id="picture"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Fundraise title   */}
                <div className='flex justify-start' >
                    <input 
                     className='mt-8 text-left font-bold text-3xl  w-full bg-transparent' 
                     type="text" 
                     placeholder='Run 5K for donati...'
                     value={formData.title}
                     onChange={(e) => handleFormChange('title', e.target.value)}
                    />
                </div>

                {/* Initial donation & Campaign Category */}
                <div className="bg-white/5 grid grid-cols-2 rounded-lg mt-4 gap-6 p-8">
                <div className="flex flex-col text-left">
                        <label htmlFor="fundraise-url" className="pl-2 text-lg mb-2">
                           Customize link
                        </label>
                        <SocialLinkInput
                            prefix="www.udunan/"
                            value={formData.fundraiseUrl || ''} // Ensure it defaults to an empty string
                            onChange={(value) => handleFormChange('fundraiseUrl', value)}
                            placeholder="0xkeren-lari-untuk-korban-banjir"
                        />
                    </div>

                     {/* Updated Campaign Selection */}
                     <div className="flex flex-col text-left">
                        <label htmlFor="campaign-dropdown" className="pl-2 text-lg mb-2">
                            Select Campaign
                        </label>
                        <Select 
    value={formData.contentId} // Should be string
    onValueChange={handleContentSelect}
>
    <SelectTrigger
        id="campaign-dropdown"
        className="bg-white/5 h-[42px] border-0 rounded-lg pl-2"
    >
        <SelectValue placeholder="Select a Campaign" />
    </SelectTrigger>
    <SelectContent className="bg-black/30 backdrop-blur-lg text-white rounded-sm border-[rgba(255,255,255,0.02)]">
        {campaignsData?.contents?.map((content) => (
            <SelectItem 
                key={content.id} 
                value={String(content.id)} // Convert to string
            >
                <div className="flex flex-col">
                    <span className="font-medium">{content.title}</span>
                    <span className="text-sm text-gray-400">
                        {content.category} - {content.organizationName}
                    </span>
                </div>
            </SelectItem>
        ))}
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
                                    height:'auto',
                                    minHeight: '200px',
                                    maxWidth:'600px', // Minimum height   
                                    overflow: 'auto', // Scroll vertically for overflowing content
                                    whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
                                    wordWrap: 'break-word', // Break long words onto the next line
                                    overflowY: 'auto', // Enable vertical scrolling if content exceeds maxHeight
                                    wordBreak: 'break-word', // Additional safety for word breaking
                                }}
                            >
                                <EditorContent  editor={editor} />
                            </div>
                        </div>
                    </div>
                </div>
                <button className='bg-white text-black mx-20 px-10 mt-8'
                                onClick={handleSubmit}

                > Submit </button>

            </div>
        </div>
    );
}

export default CreateFundraise;
