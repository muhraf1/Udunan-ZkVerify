import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { gql, useQuery, useMutation } from '@apollo/client';
import { createSlug } from '@/lib/stringutils';
import { Pencil, Heart, MapPin, X, ChevronsRight, Link, ArrowUpRight, CalendarDays, Instagram, Globe, Twitter, TrendingUp } from "lucide-react";
import { Separator } from '@/components/ui/Separator';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Sankey, Tooltip } from 'recharts';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from '@/components/ui/calendar';
import debounce from 'lodash/debounce';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapImage from '@tiptap/extension-image';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';


//auth 

// Add useAuth import at the top
import { useAuth } from '@/components/ui/AuthContext';

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

//connect smart contract
import { withdrawFromCampaign } from '../lib/withdraw';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


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

//dumy dataa
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





const UPDATE_CONTENT = gql`
        mutation UpdateContent(
            $id: ID!
            $title: String
            $targetAmount: Float
            $category: CategoryStatus
            $location: String
            $organizationName: String
            $description: String
            $startDate: String
            $endDate: String
        ) {
            updateContent(
                id: $id
                title: $title
                targetAmount: $targetAmount
                category: $category
                location: $location
                organizationName: $organizationName
                description: $description
                startDate: $startDate
                endDate: $endDate
            ) {
                id
                title
                targetAmount
                category
                location
                organizationName
                description
                startDate
                endDate
            }
        }
    `;

const CREATE_WITHDRAWAL = gql`
  mutation createWithdraw(
    $contentId: String!
    $amount: Float!
    $title: String!
    $description: String!
    $tx_hash: String!
    $fromAddress: String!
    $toAddress: String!
  ) {
    createWithdraw(
      contentId: $contentId
      amount: $amount
      title: $title
      description: $description
      tx_hash: $tx_hash
      fromAddress: $fromAddress
      toAddress: $toAddress
    ) {
      id
      amount
      description
      title
      tx_hash
    }
  }
`;


const GET_CONTENTS = gql`
    query GetContents {
        contents {
        id
        title
        address
        targetAmount
        category
        location
        organizationName
        description
        startDate
        endDate
        }
    }
    `;


const ManageCampaign = () => {
    const { id } = useParams();
    const sectionRefs = useRef([]);
    const { isLoggedIn, token } = useAuth();
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);
    const [showSheet, setShowSheet] = useState(false); // Define the state for showing the sheet
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        targetAmount: '',
        category: '',
        location: '',
        organizationName: '',
        description: '',
        startDate: '',
        endDate: ''
    });
    const [initialData, setInitialData] = useState({}); // Added initialData state


    // Add these state variables inside the ManageCampaign component
    // const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalPurpose, setWithdrawalPurpose] = useState('');
    const [withdrawalDescription, setWithdrawalDescription] = useState('');
    const [withdrawalLoading, setWithdrawalLoading] = useState(false);




    // Add the mutation hook
    const [createWithdrawal] = useMutation(CREATE_WITHDRAWAL, {
        context: {
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        },
    });

    // Add this function inside the ManageCampaign component
    const handleWithdraw = async () => {
        try {
            // Check authentication first
            if (!isLoggedIn || !token) {
                toast.error("Please log in to withdraw funds");
                return;
            }

            setWithdrawalLoading(true);

         

            if (!withdrawalPurpose) {
                throw new Error('Please enter a withdrawal purpose');
            }

            if (!campaignData?.address) {
                throw new Error('Campaign address not found');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const fromAddress = await signer.getAddress();

            // Process blockchain transaction
            const { hash, amount } = await withdrawFromCampaign(campaignData.address);

            // Create database record
            await createWithdrawal({
                variables: {
                  contentId: campaignData.id,
                  amount: parseFloat(amount), // Use the amount from the withdrawal event
                  title: withdrawalPurpose,
                  description: withdrawalDescription || "No description provided",
                  tx_hash: hash,
                  fromAddress: campaignData.address,
                  toAddress: fromAddress
                }
              });

            toast.success('Withdrawal successful!');

            setWithdrawalPurpose('');
            setWithdrawalDescription('');
            setShowSheet(false);

        } catch (err) {
            console.error('Withdrawal error:', err);
            if (err.code === 4001) {
                toast.error('Transaction cancelled');
            } else {
                toast.error(err.message || 'Failed to process withdrawal');
            }
        } finally {
            setWithdrawalLoading(false);
        }
    };


    // Add update mutation
    const [updateContent, { loading: updateLoading }] = useMutation(UPDATE_CONTENT, {
        onCompleted: () => {

            toast.success('Campaign updated successfully!');

            setIsSheetOpen(false);
            refetchcontent();
        },
        onError: (error) => {

            toast.error(`Failed to update campaign: ${error.message}`);

            console.log(error.message);

        }
    });


    // table fund allocation Section |
    const fundData = [
        { category: 'Total Fund', amount: '$ 8,500' },
        { category: 'Gas Fee', amount: '$ 0.2' },
        { category: 'Platform Fee', amount: '$ 50' },
        { category: 'Disbursed Fund', amount: '$ 6,000' },
        { category: 'Unclaim Fund', amount: '$ 1,500' }
    ];

    // table block explorer section
    const txData = [
        { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },
        { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },
        { TransactionHash: '0x04776f87b4faf8fd32162f62cb07b90e5efa7b533636f198424017a5790fa08c', Method: 'Withdraw', Block: "111231", Age: " 56 ", From: "donation Wallet", to: "'0x87sda23de776f87b4faf8fd321", amount: "0.9" },

    ];

    // sankey diagram 
    const COLOR_PALETTE = [
        '#3498DB',   // Bright Blue
        '#2ECC71',   // Emerald Green
        '#E74C3C',   // Vibrant Red
        '#F39C12',   // Orange
        '#1ABC9C',   // Turquoise
        '#9B59B6'    // Lavender
    ];

    const sampleData = {
        nodes: [
            { name: 'Donation', color: COLOR_PALETTE[0] },
            { name: 'Search &  Rescue Cost', color: COLOR_PALETTE[1] },
            { name: 'Operation Cost', color: COLOR_PALETTE[2] },
            { name: 'Unclaimed Fund', color: COLOR_PALETTE[3] }

        ],
        links: [
            { source: 0, target: 2, value: 7000 },
            { source: 0, target: 3, value: 500 },
            { source: 2, target: 1, value: 7000 }

        ]
    };


    const {
        data: contentData,
        loading: contentLoading,
        error: contentError,
        refetch: refetchcontent
    } = useQuery(GET_CONTENTS);




    const [activeSection, setActiveSection] = useState("Overview");


    // Modified to handle timestamps consistently
    const formatDate = (timestamp) => {
        if (!timestamp) return 'Select Date';

        // Convert to number if it's a string
        const dateNum = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
        const date = new Date(dateNum);

        return !isNaN(date.getTime())
            ? date.toLocaleDateString("en-US", {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            })
            : 'Invalid Date';
    };

    // Modified to convert Date objects to timestamps
    const handleDateSelect = (field, date) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
            const timestamp = date.getTime();
            console.log(`Setting ${field} to timestamp:`, timestamp);

            setFormData(prev => ({
                ...prev,
                [field]: timestamp
            }));
        }
    };
    // Convert timestamp to Date object for Calendar
    const getDateFromTimestamp = (timestamp) => {
        if (!timestamp) return undefined;
        const dateNum = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
        const date = new Date(dateNum);
        return !isNaN(date.getTime()) ? date : undefined;
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Modified handleFormChange to properly format dates
    const handleFormChange = (field, value) => {
        if (value instanceof Date && !isNaN(value.getTime())) {
            // Ensure we're storing dates in a consistent ISO format
            setFormData((prev) => ({
                ...prev,
                [field]: value,  // Store full ISO string
            }));
        }
    };


    // Updated to handle timestamps properly
    const parseDate = (timestamp) => {
        if (!timestamp) return undefined;

        // Convert string timestamp to number if needed
        const parsed = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
        const date = new Date(parsed);
        return !isNaN(date.getTime()) ? date : undefined;
    };


    //   descripton

    // Initialize Tiptap Editor
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


    const addImage = () => {
        const url = prompt('Enter the image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    useEffect(() => {
        if (editor && formData.description !== editor.getHTML()) {
            editor.commands.setContent(formData.description || '');
        }
    }, [editor, formData.description]);


    console.log(" before pick Start Date:", formData.startDate);
    console.log(" before pick End Date:", formData.endDate);

    console.log('Editor Content:', editor?.getHTML());


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Debug logs to check the incoming values
            console.log('Form startDate:', formData.startDate);
            console.log('Form endDate:', formData.endDate);
            console.log('Initial startDate:', initialData.startDate);
            console.log('Initial endDate:', initialData.endDate);


            // Helper function to safely convert dates
            const convertToISOString = (timestamp) => {
                if (!timestamp) return null;

                const dateNum = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
                if (isNaN(dateNum)) {
                    console.error('Invalid timestamp:', timestamp);
                    return null;
                }

                const date = new Date(dateNum);
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', date);
                    return null;
                }

                return date.toISOString();
            };

            const updatedData = {
                id,
                title: formData.title || initialData.title,
                targetAmount: formData.targetAmount
                    ? parseInt(formData.targetAmount)
                    : initialData.targetAmount,
                category: formData.category || initialData.category,
                location: formData.location || initialData.location,
                organizationName: formData.organizationName || initialData.organizationName,
                description: editor?.getHTML() || initialData.description,
                startDate: convertToISOString(formData.startDate) || convertToISOString(initialData.startDate),
                endDate: convertToISOString(formData.endDate) || convertToISOString(initialData.endDate),
            };

            // Log the final data being sent
            console.log('Final Updated Data:', updatedData);

            await updateContent({
                variables: updatedData,
            });

            toast.success('Campaign updated successfully!');
        } catch (error) {
            console.error('Error updating campaign:', error);
            // More detailed error message
            toast.error(`Failed to update campaign: ${error.message}`);
        }
    };

    console.log("Start Date:", formData.startDate);
    console.log("End Date:", formData.endDate);

    console.log("Start Date initial:", initialData.startDate);
    console.log("End Date initial:", initialData.endDate);









    // console.log('Converted Start Date:', new Date(formData.startDate).toISOString());
    // console.log('Converted End Date:', new Date(formData.endDate).toISOString());





    // Sections array
    const sections = [
        "Overview",
        "Withdrawal"
    ];


    // Campaign Data Validation AFTER Hooks
    const content = contentData?.contents || [];
    const campaignData = content.find((item) => createSlug(item.id) === id || item.id == id);

    useEffect(() => {
        if (campaignData) {
            setFormData(campaignData);
            setInitialData(campaignData);
        }
    }, [campaignData]);

    if (!campaignData) {
        return <div className="text-white">Campaign not found</div>;
    }

    const renderSectionContent = () => {
        switch (activeSection) {
            case "Overview":
                return (
                    <div className="text-gray-300 flex-col ">
                        <div className=' text-white text-md font-semibold  flex flex-col'>
                            Campaign Recap
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
                                <span>Edit Campaign</span>
                                <button className='bg-transparent p-0' onClick={() => setIsSheetOpen(true)}>
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-white font-semibold text-md  items-center   justify-start gap-2 inline-flex mb-2">

                                <CalendarDays className="text-[#BAC1C5] w-10 h-10 border-[#5C7683]/10 rounded-md p-2" style={{ border: "1px solid rgba(255, 255, 255, 0.1)", }} />
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
            case "Withdrawal":
                return (
                    <div className="text-gray-300 flex flex-col">
                        {/*  title & description */}
                        < div className=' text-white text-md font-semibold  flex flex-col'>
                            Fund Recap
                            <span className='text-gray-300 text-sm font-normal mt-2'>Thank you! Here’s a summary of your campaign funds.</span>
                        </div>
                        {/*  fund distribution of sankey chart  */}
                        <div className='rounded lg mt-4 '
                            style={{
                                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                backdropFilter: "blur(8px)",
                            }}>
                            <div className="p-4">
                                <div className="flex justify-center">
                                    <Sankey
                                        width={500}
                                        height={200}
                                        data={sampleData}
                                        node={{ fill: '#F5F1D6' }}
                                        link={{
                                            stroke: '#A0AEC0',
                                            strokeOpacity: 0.5,
                                            fill: 'gradient'
                                        }}
                                    >
                                        <Tooltip
                                            content={({ payload }) => {
                                                if (!payload || payload.length === 0) return null;
                                                const { name, value, color } = payload[0];
                                                return (
                                                    <div
                                                        className="bg-white shadow-lg rounded-lg p-3 border border-gray-200"
                                                        style={{ borderLeftColor: color, borderLeftWidth: 4 }}
                                                    >
                                                        <p className="font-bold" style={{ color }}>{name}</p>
                                                        <p>Value: {value.toLocaleString()}</p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    </Sankey>
                                </div>
                            </div>
                        </div>


                        {/* table fund */}
                        <div className=' mt-4 '>
                            <Table className="rounded-lg">
                                <TableHeader className="bg-white/10">
                                    <TableRow className="border-white/5 p-2">
                                        <TableHead className="font-bold border-white/1 rounded-tl-lg text-white">Fund Allocation</TableHead>
                                        <TableHead className="font-bold border-white/1  rounded-tr-lg text-white">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fundData.map((item, index) => (
                                        <TableRow key={index} className="bg-white/5 border-white/5">
                                            <TableCell className="font-medium text-white">{item.category}</TableCell>
                                            <TableCell className="font-medium text-white">{item.amount}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>


                        {/* Explorer */}
                        <div className="overflow-x-auto max-w-[612px] mt-4 rounded-t-lg">
                            <Table className="rounded-lg">
                                <TableHeader className="bg-white/10 ">
                                    <TableRow className="border-white/5 p-2 rounded-lg">
                                        <TableHead className="font-bold border-white/1 text-white  truncate max-w-[10px]">Transaction Hash</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">Method</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">Block</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">Age</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">From</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">To</TableHead>
                                        <TableHead className="font-bold border-white/1 text-white">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {txData.map((item, index) => (
                                        <TableRow key={index} className="bg-white/5 border-white/5">
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.TransactionHash}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.Method}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.Block}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.Age}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.From}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.to}
                                            </TableCell>
                                            <TableCell className="font-medium text-white whitespace-nowrap">
                                                {item.amount}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/*  button withdraw */}
                        <div className='flex justify-center px-20 sticky bottom-0 mt-4' style={{
                            background: "#11283899",
                            border: "1px solid #263E4D",
                            color: "#263E4D",
                            backdropFilter: "blur(20px)",
                        }}>
                            <button className='bg-white w-full text-black font-bold my-4' onClick={() => setShowSheet(true)}>withdraw</button>
                        </div>


                        {/* Withdrawal Sheet */}

                    </div>
                );
            default:
                return null;
        }
    };

    if (contentLoading) {
        return <div> loading..</div>;
    }

    // Error handling
    if (contentError) {
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
        <div className="min-h-screen text-left text-white px-14 py-8 pt-10 mx-auto">
            <div className="flex flex-col">
                {/* title */}
                <div className="text-white font-bold text-3xl">
                    {campaignData.title}
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
            {/* Sheet Edit Campaign */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent
                    className="bg-[#153749] text-white rounded-lg border-none m-4 max-h-[calc(100vh-2rem)] overflow-y-auto "
                    style={{
                        width: "35vw",
                        border: "1px solid rgba(255, 255, 255, 0.1)"
                    }}
                >
                    <div className="h-full flex flex-col">
                        <SheetHeader className="bg-[#132E3F] text-black flex flex-row items-center sticky top-0 z-10 px-4 py-2">
                            <SheetClose className="bg-transparent justify-center">
                                <ChevronsRight className="h-6 w-6 text-[#B8C0C5] cursor-pointer" />
                            </SheetClose>
                            <SheetTitle className="text-white mt-0">Update Campaign</SheetTitle>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 mt-4 px-8 text-gray-300">
                            {/* Other form fields */}
                            {['title', 'targetAmount', 'location', 'description'].map((field) => (
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

                            {/* Category Dropdown */}
                            <div className="space-y-2">
                                <label className="text-white text-sm">Category</label>
                                <select
                                    name="category"
                                    value={formData.category ?? initialData.category ?? ''}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/20 rounded-md p-2 text-white"
                                >
                                    <option value="" disabled>Select Category</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="HealthCare">HealthCare</option>
                                    <option value="Education">Education</option>
                                </select>
                            </div>

                            {/* Start Date Picker */}
                            <div className="space-y-2 relative z-50">
                                <label className="text-white text-sm">Start Date</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setStartDateOpen(!startDateOpen)}
                                        className="flex items-center justify-between bg-white/5 rounded-lg py-2 pr-4 pl-4 text-right text-white cursor-pointer w-full"
                                    >
                                        <span>
                                            {formatDate(formData.startDate)}
                                        </span>
                                        <CalendarDays className="w-5 h-5 text-gray-400" />
                                    </button>
                                    {startDateOpen && (
                                        <div className="absolute top-full mt-2 bg-[#1a1a1a] rounded-md shadow-lg border border-gray-600 z-50">
                                            <Calendar
                                                mode="single"
                                                selected={getDateFromTimestamp(formData.startDate)}
                                                onSelect={(date) => {
                                                    handleDateSelect("startDate", date);
                                                    setStartDateOpen(false);
                                                }}
                                                className="rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 relative z-50">
                                <label className="text-white text-sm">End Date</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setEndDateOpen(!endDateOpen)}
                                        className="flex items-center justify-between bg-white/5 rounded-lg py-2 pr-4 pl-4 text-right text-white cursor-pointer w-full"
                                    >
                                        <span>
                                            {formatDate(formData.endDate)}
                                        </span>
                                        <CalendarDays className="w-5 h-5 text-gray-400" />
                                    </button>
                                    {endDateOpen && (
                                        <div className="absolute top-full mt-2 bg-[#1a1a1a] rounded-md shadow-lg border border-gray-600 z-50">
                                            <Calendar
                                                mode="single"
                                                selected={getDateFromTimestamp(formData.endDate)}
                                                onSelect={(date) => {
                                                    handleDateSelect("endDate", date);
                                                    setEndDateOpen(false);
                                                }}
                                                className="rounded-md"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>



                            {/* Submit Button */}
                            <div className="sticky bottom-0 z-10 bg-[#132E3F] backdrop-blur-md px-4 py-4 border-t border-[#255C77]">
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white"
                                >
                                    {updateLoading ? 'Updating...' : 'Update Campaign'}
                                </button>
                            </div>
                        </form>
                    </div>
                </SheetContent>
            </Sheet>



            {/* sheet withdrawals */}
            <Sheet open={showSheet} onOpenChange={setShowSheet}>
                <SheetContent
                    className="bg-[#153749] text-white rounded-lg border-none m-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
                    style={{
                        width: "35vw", // Set width to 40% of the viewport width
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
                            <SheetTitle className="text-white mt-0">Withdraw Funds</SheetTitle>
                        </SheetHeader>

                        {/* Body Content */}
                        <div className="flex flex-col px-8">
                            {/* Withdrawal Amount */}
                            {/* <div className="flex flex-col text-left my-2">
                                <label htmlFor="withdrawal-amount" className="pl-2 text-lg font-semibold">
                                    Enter Withdrawal Amount
                                </label>

                                <div className="flex items-center bg-transparent  p-2 rounded-l-lg  justify-between gap-2">
                                    <div className=" flex bg-white/5 items-center   w-full rounded-l-lg p-1 justify-center">

                                        <Input
                                            id="withdrawal-amount"
                                            className="text-white border-0 text-right"
                                            placeholder="1,200"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={withdrawalAmount}
                                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className=" flex bg-white/5 items-center  rounded-r-lg p-2 px-3 justify-center">
                                        <img
                                            className="w-8 h-7 rounded-full"
                                            src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=040"
                                        />
                                    </div>
                                </div>
                                <span className="text-gray-400 font-semibold text-right w-full mt-1">
                                    Balance: 8,500 USDC
                                </span>
                            </div> */}

                            {/* Purpose */}
                            <div className="flex flex-col text-left my-2">
                                <label htmlFor="withdrawal-purpose" className="pl-2 text-lg font-semibold">
                                    Withdrawal Purpose
                                </label>

                                <Input
                                    id="withdrawal-purpose"
                                    className="bg-white/5 py-3 border-0 rounded-lg pl-2 mt-2 text-left"
                                    placeholder="Clothes & babies"
                                    value={withdrawalPurpose}
                                    onChange={(e) => setWithdrawalPurpose(e.target.value)}
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col text-left my-2">
                                <label htmlFor="withdrawal-description" className="pl-2 text-lg font-semibold">
                                    Add Description
                                </label>

                                <Input
                                    id="withdrawal-description"
                                    className="bg-white/5 py-3 border-0 rounded-lg pl-2 mt-2 text-left"
                                    placeholder="Amazon River is a habitat for 2500+ species..."
                                    value={withdrawalDescription}
                                    onChange={(e) => setWithdrawalDescription(e.target.value)}
                                />
                            </div>

                            {/* Summary Section */}
                            <Separator className="bg-white/10 my-4" />
                            {/* <div className="bg-white/5 p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span>Amount</span>
                                    <span>1,200 USDC</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Network Fee</span>
                                    <span>0.0001 USDC</span>
                                </div>
                                <Separator className="bg-white/10 my-4" />
                                <div className="flex justify-between font-bold">
                                    <span>Total Amount</span>
                                    <span>1,200.0001 USDC</span>
                                </div>
                            </div> */}
                        </div>

                        {/* Sticky Footer */}
                        <div className="sticky bottom-0 z-10 bg-[#132E3F] backdrop-blur-md px-4 py-4 border-t mt-4 border-[#255C77]">
                            <div className="flex gap-4">

                                <Button
                                    className="w-full bg-white text-black hover:bg-[#5794D1]/90 hover:text-white"
                                    onClick={handleWithdraw}
                                    disabled={withdrawalLoading}
                                >
                                    {withdrawalLoading ? 'Processing...' : 'Confirm Withdrawal'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>




        </div>

    );
};

export default ManageCampaign;
