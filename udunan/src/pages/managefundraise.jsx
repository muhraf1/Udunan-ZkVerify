import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { createSlug } from '@/lib/stringutils';
import { Pencil, Heart, MapPin, X, ChevronsRight, Link, ArrowUpRight, Calendar, Instagram, Globe, Twitter, TrendingUp } from "lucide-react";
import { Separator } from '@/components/ui/Separator';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import RichTextRenderer from '@/components/ui/richtextrender';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import debounce from 'lodash/debounce';
import { toast } from 'sonner';




import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"



//dumy data 
const chartData = [
    { month: "M", desktop: 186, mobile: 80 },
    { month: "T", desktop: 305, mobile: 200 },
    { month: "W", desktop: 237, mobile: 120 },
    { month: "T", desktop: 73, mobile: 190 },
    { month: "F", desktop: 209, mobile: 130 },
    { month: "S", desktop: 214, mobile: 140 },
]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
    mobile: {
        label: "Mobile",
        color: "hsl(var(--chart-2))",
    },
}


const UPDATE_FUNDRAISE = gql`
  mutation UpdateFundraise(
    $id: ID!
    $title: String
    $description: String
    $fundimg: String
  ) {
    updateFundraise(
      id: $id
      title: $title
      description: $description
      fundimg: $fundimg
    ) {
      id
      title
      description
      fundimg
    }
  }
`;

// Updated query to match schema structure
const GET_FUNDRAISE = gql`
  query GetFundraise($id: ID!) {
    fundraise(id: $id) {
      id
      title
      description
      authorId
      fundimg
      createdAt
      content {
        id
        title
        isVerified
        startDate
        endDate
        location
        currentAmount
        targetAmount
      }
      author {
        id
        name
        email
      }
    }
  }
`;

const ManageFundraise = () => {
    const { id } = useParams(); // Get fundraise ID from the URL
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const sectionRefs = useRef([]);
    const [activeSection, setActiveSection] = useState("Overview");
      // Sections array
    const sections = [ "Overview",];
    const [formData, setFormData] = useState({
        title: '',
        description: '',
       
    });

    const [initialData, setInitialData] = useState({}); // Added initialData state

    const editor = useEditor({
        extensions: [
            StarterKit,
            Bold,
            Italic,
            Heading.configure({ levels: [1, 2] }),
            TipTapImage.extend({
                addOptions() {
                    return {
                        ...this.parent?.(),
                        HTMLAttributes: {
                            style: 'width: 300px; height: 200px; border-radius:5px;',
                        },
                    };
                },
            }),
            Placeholder.configure({
                placeholder: 'Add your description here...',
            }),
        ],
        content: formData.description || '', // Initialize content
        onUpdate: debounce(({ editor }) => {
            setFormData((prev) => ({
                ...prev,
                description: editor.getHTML(),
            }));
        }, 300), // Debounced to reduce excessive updates
    });





    const { data, loading, error, refetch: refetchfundraise } = useQuery(GET_FUNDRAISE, {
        variables: { id },
        onError: (error) => {
            console.error('GraphQL Error:', error);
        }
    });

  

    const fundraise = data?.fundraise;
    const content = data?.fundraise?.content;


    console.log("Fundraise Data:", fundraise);
    console.log("Content Data:", content);


   // Add update mutation
   const [updateContent, { loading: updateLoading }] = useMutation(UPDATE_FUNDRAISE, {
    onCompleted: () => {

        toast.success('Fundraise updated successfully!');

        setIsSheetOpen(false);
        refetchfundraise();
    },
    onError: (error) => {

        toast.error(`Failed to update Fundraise: ${error.message}`);

        console.log(error.message);

    }
});




    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };
 // Initialize Tiptap Editor
 


const addImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
        editor.chain().focus().setImage({ src: url }).run();
    }
};


useEffect(() => {
    if (fundraise) {
        setFormData(fundraise);
        setInitialData(fundraise);
    }
}, [fundraise]);

useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
        editor.commands.setContent(formData.description || '');
    }
}, [editor, formData.description]);
    // form,
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
    
            const updatedData = {
                id,
                title: formData.title || initialData.title,
                description: editor?.getHTML()  || initialData.description,
            };
            
            // Log the final data being sent
            console.log('Final Updated Data:', updatedData);
            
            await updateContent({
                variables: updatedData,
            });
            
            toast.success('Fundraise updated successfully!');
        } catch (error) {
            console.error('Error updating campaign:', error);
            // More detailed error message
            toast.error(`Failed to update campaign: ${error.message}`);
        }
    };




 


    const renderSectionContent = () => {
        switch (activeSection) {
            case "Overview":
                return (
                    <div className="text-gray-300 flex-col ">
                        <div className=' text-white text-md font-semibold  flex flex-col'>
                            Fundraise Recap
                            <span className='text-gray-300 text-sm font-normal mt-2'>Thank you for partnering with us. We hope your event is a success!</span>
                        </div>
                        {/* card  */}
                        <div className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity mt-4 flex flex-col p-4"
                            style={{
                                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(8px)",
                            }}>
                            <div className='flex justify-between mb-4 '>
                                <span>Edit Fundraise</span>
                                <button className='bg-transparent p-0' onClick={() => setIsSheetOpen(true)}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>

                           {/* fundrais edescription */}
                           <RichTextRenderer content={fundraise.description} />
                            
                        </div>
                        {/* separator  */}
                        <Separator className="bg-white/10 mt-6 mb-4" />

                        {/* desc */}
                        <div className=' text-white text-md font-semibold  flex flex-col'>
                            Insight
                            <span className='text-gray-300 text-sm font-normal mt-2'>All about your campaign analytics  </span>
                        </div>
                        <div className='flex justify-between gap-4' >
                            {/* chart left */}
                            <div className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity mt-4 flex flex-col "
                                style={{
                                    background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(8px)",
                                }}>

                                <Card className='bg-transparent border-none p-0'>
                                    <CardHeader className=" px-2 pl-3">
                                        <CardTitle className="text-white text-sm px-0  flex flex-row items-center"> <Heart className='w-4 h-4 mr-2 text-[#5794D1]' />Donation Vol for last 7 Days</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 ">
                                        <ChartContainer config={chartConfig}>
                                            <AreaChart

                                                accessibilityLayer
                                                data={chartData}

                                                margin={{
                                                    left: 12,
                                                    right: 12,
                                                }}
                                            >

                                                <XAxis
                                                    dataKey="month"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={(value) => value.slice(0, 3)}
                                                    tick={{ fill: 'white' }} // Ensure the text color is white
                                                />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent indicator="dot" />}
                                                />
                                                <Area
                                                    dataKey="mobile"
                                                    type="natural"
                                                    fill="var(--color-mobile)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-mobile)"
                                                    stackId="a"
                                                />
                                                <Area
                                                    dataKey="desktop"
                                                    type="natural"
                                                    fill="var(--color-desktop)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-desktop)"
                                                    stackId="a"

                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>

                                </Card>
                            </div>

                            {/* right chaart */}

                            <div className="w-full rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity mt-4 flex flex-col "
                                style={{
                                    background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    backdropFilter: "blur(8px)",
                                }}>

                                <Card className='bg-transparent border-none p-0'>
                                    <CardHeader className=" px-2 pl-3">
                                        <CardTitle className="text-white text-sm px-0  flex flex-row items-center"> <Heart className='w-4 h-4 mr-2 text-[#5794D1]' />Donation Vol for last 7 Days</CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-3 ">
                                        <ChartContainer config={chartConfig}>
                                            <AreaChart

                                                accessibilityLayer
                                                data={chartData}

                                                margin={{
                                                    left: 12,
                                                    right: 12,
                                                }}
                                            >

                                                <XAxis
                                                    dataKey="month"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={(value) => value.slice(0, 3)}
                                                    tick={{ fill: 'white' }} // Ensure the text color is white
                                                />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={<ChartTooltipContent indicator="dot" />}
                                                />
                                                <Area
                                                    dataKey="mobile"
                                                    type="natural"
                                                    fill="var(--color-mobile)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-mobile)"
                                                    stackId="a"
                                                />
                                                <Area
                                                    dataKey="desktop"
                                                    type="natural"
                                                    fill="var(--color-desktop)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-desktop)"
                                                    stackId="a"

                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>

                                </Card>
                            </div>
                        </div>
                    </div>

                );
            
            default:
                return null;
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <ErrorDisplay
                message="Failed to load data"
                onRetry={() => {
                    refetchfundraise();
                
                }}
            />
        );
    }

    if (!fundraise) {
        return <div className="text-white">Fundraise not found</div>;

    }

    return (
        <div className="min-h-screen text-left text-white px-14 py-8 pt-10 mx-auto">
            <div className="flex flex-col">
                {/* title */}
                <div className="text-white font-bold text-3xl">
                {fundraise.title}
                </div>
                {/* section overview and withdrawal */}
                <div className="relative flex items-start pr-60 mr-10 text-left pt-4 bt-4">
                    {sections.map((section, index) => (
                        <button
                            key={section}
                            ref={(el) => (sectionRefs.current[index] = el)}
                            className={`
                            text-lg font-lg pr-3 py-2 rounded-md transition-all  text-left p-0 pb-2duration-300 relative
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
                    ))}
                </div>
                <div className="pr-4 mt-10">
                    {renderSectionContent()}
                </div>

            </div>


            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>

                {/* <Sheet open={!!selectedDonation}> */}
                <SheetContent
                    className="bg-[#153749] text-white rounded-lg border-none m-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
                    style={{
                        width: "35vw", // Set width to 40% of the viewport width (2/5 of the screen)
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                >
                    <div className="h-full flex flex-col">
                        {/* Sticky Header */}
                        <SheetHeader
                            className="bg-[#132E3F] text-black flex flex-row items-center sticky top-0 z-10 px-4 py-2"
                        >

                            <SheetClose className="bg-transparent justify-center">
                                <ChevronsRight className="h-6 w-6 text-[#B8C0C5] cursor-pointer" />
                            </SheetClose>
                            <SheetTitle className="text-white mt-0">Edit Fundraise</SheetTitle>

                        </SheetHeader>


                        {/* body of content */}
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-8 text-gray-300">
                            {/* Other form fields */}
                            {['title', 'description'].map((field) => (
                                <div key={field} className="space-y-2">
                                <label className="text-white text-sm capitalize">
                                        {field === 'targetAmount'
                                            ? 'Goals'
                                            : field.replace(/([A-Z])/g, ' $1')}
                                    </label>
                                    {field === 'description' ? (
                                        <div className="space-y-2">
                                            <div className="bg-white/5 flex w-full rounded-lg mt-2 p-4 border border-white/20">
                                            <div className="flex flex-col text-left w-full overflow-auto">
                                                {/* Toolbar */}
                                                <div className="flex gap-2 mb-3 border-b pb-2 border-white/10">
                                                    <button
                                                        className="px-3 py-1 bg-transparent rounded hover:bg-[#5794D1]"
                                                        onClick={() => editor?.chain().focus().toggleBold().run()}
                                                        type="button"
                                                    >
                                                        Bold
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-transparent rounded hover:bg-[#5794D1]"
                                                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                                                        type="button"
                                                    >
                                                        Italic
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-transparent rounded hover:bg-[#5794D1]"
                                                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                                        type="button"
                                                    >
                                                        H1
                                                    </button>
                                                    <button
                                                        className="px-3 py-1 bg-transparent rounded hover:bg-[#5794D1]"
                                                        onClick={addImage}
                                                        type="button"
                                                    >
                                                        Add Image
                                                    </button>
                                                </div>
                        
                                                {/* TipTap Editor */}
                                                <div className="rounded p-3 border-0 min-h-[200px]">
                                                {editor && <EditorContent editor={editor} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    ) : (
                                        <input
                                            type={field === 'targetAmount' ? 'number' : 'text'}
                                            name={field}
                                            value={formData[field] ?? ''}
                                            onChange={handleInputChange}
                                            placeholder={initialData[field] || `Enter ${field}`}
                                            className="w-full bg-white/5 border border-white/20 rounded-md p-2 text-white"
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Submit Button */}
                            <div className="sticky bottom-0 z-10 bg-[#132E3F] backdrop-blur-md px-4 py-4 border-t border-[#255C77]">
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white"
                                >
                                    {updateLoading ? 'Updating...' : 'Update Fundraise'}
                                </button>
                            </div>
                        </form>
                        </div>

                </SheetContent>
            </Sheet>

        </div>

    );
};

export default ManageFundraise;
