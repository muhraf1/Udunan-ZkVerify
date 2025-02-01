import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/Separator';
import { useAuth } from '@/components/ui/AuthContext'; // Import the hook
import { Badge } from "@/components/ui/badge"
import { useQuery, gql } from '@apollo/client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Car, TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"



/// start of dummy data

const chartData = [
  { browser: "chrome", visitors: 1, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 0.05, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 0.9, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 2, fill: "var(--color-edge)" },
]

const chartDataBar = [
  { date: "2024-04-01", campaign1: 120, campaign2: 85, campaign3: 150, campaign4: 75 },
  { date: "2024-04-02", campaign1: 200, campaign2: 95, campaign3: 110, campaign4: 60 },
  { date: "2024-04-03", campaign1: 170, campaign2: 120, campaign3: 130, campaign4: 80 },
  { date: "2024-04-04", campaign1: 140, campaign2: 130, campaign3: 120, campaign4: 65 },
  { date: "2024-04-05", campaign1: 160, campaign2: 90, campaign3: 100, campaign4: 55 },
  { date: "2024-04-06", campaign1: 180, campaign2: 105, campaign3: 140, campaign4: 85 },
  { date: "2024-04-07", campaign1: 150, campaign2: 100, campaign3: 130, campaign4: 70 },
  { date: "2024-04-08", campaign1: 190, campaign2: 115, campaign3: 140, campaign4: 80 },
  { date: "2024-04-09", campaign1: 170, campaign2: 110, campaign3: 120, campaign4: 75 },
  { date: "2024-04-10", campaign1: 200, campaign2: 130, campaign3: 150, campaign4: 90 },
  { date: "2024-04-11", campaign1: 210, campaign2: 140, campaign3: 160, campaign4: 100 },
  { date: "2024-04-12", campaign1: 185, campaign2: 120, campaign3: 135, campaign4: 85 },
  { date: "2024-04-13", campaign1: 175, campaign2: 110, campaign3: 125, campaign4: 80 },
  { date: "2024-04-14", campaign1: 165, campaign2: 105, campaign3: 115, campaign4: 75 },
  { date: "2024-04-15", campaign1: 155, campaign2: 95, campaign3: 105, campaign4: 70 },
  { date: "2024-04-16", campaign1: 145, campaign2: 90, campaign3: 100, campaign4: 65 },
  { date: "2024-04-17", campaign1: 205, campaign2: 135, campaign3: 155, campaign4: 95 },
  { date: "2024-04-18", campaign1: 195, campaign2: 125, campaign3: 145, campaign4: 85 },
  { date: "2024-04-19", campaign1: 185, campaign2: 115, campaign3: 135, campaign4: 75 },
  { date: "2024-04-20", campaign1: 175, campaign2: 105, campaign3: 125, campaign4: 65 },
  { date: "2024-04-21", campaign1: 165, campaign2: 95, campaign3: 115, campaign4: 60 },
  { date: "2024-04-22", campaign1: 155, campaign2: 90, campaign3: 105, campaign4: 55 },
  { date: "2024-04-23", campaign1: 200, campaign2: 130, campaign3: 150, campaign4: 90 },
  { date: "2024-04-24", campaign1: 190, campaign2: 125, campaign3: 140, campaign4: 85 },
  { date: "2024-04-25", campaign1: 180, campaign2: 115, campaign3: 130, campaign4: 80 },
  { date: "2024-04-26", campaign1: 170, campaign2: 110, campaign3: 120, campaign4: 75 },
  { date: "2024-04-27", campaign1: 160, campaign2: 100, campaign3: 110, campaign4: 70 },
  { date: "2024-04-28", campaign1: 150, campaign2: 95, campaign3: 105, campaign4: 65 },
  { date: "2024-04-29", campaign1: 140, campaign2: 90, campaign3: 100, campaign4: 60 },
  { date: "2024-04-30", campaign1: 210, campaign2: 145, campaign3: 160, campaign4: 100 },
  { date: "2024-05-01", campaign1: 220, campaign2: 150, campaign3: 170, campaign4: 110 },
  { date: "2024-05-02", campaign1: 230, campaign2: 155, campaign3: 180, campaign4: 120 },
  { date: "2024-05-03", campaign1: 240, campaign2: 160, campaign3: 190, campaign4: 125 },
  { date: "2024-05-04", campaign1: 250, campaign2: 165, campaign3: 200, campaign4: 130 },
  { date: "2024-05-05", campaign1: 260, campaign2: 170, campaign3: 210, campaign4: 135 },
];


const chartDataVer = [
  { browser: "chrome", visitors: 275, fill: "#E76E50" },
  { browser: "safari", visitors: 200, fill: "#2EB88A" },
  { browser: "firefox", visitors: 187, fill: "#E88D30" },
  { browser: "edge", visitors: 173, fill: "#AF56DB" },
  { browser: "other", visitors: 90, fill: "#E23670" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },

}
const chartConfigVer = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
}
const chartConfigbar = {
  Campaign1: {
    label: "Campaign1",
    color: "var(--chart-1)", // Ensure these variables are defined in your CSS
  },
  Campaign2: {
    label: "Campaign2",
    color: "var(--chart-2)", // Ensure these variables are defined in your CSS
  },
  Campaign3: {
    label: "Campaign3",
    color: "var(--chart-3)", // Ensure these variables are defined in your CSS
  },
  Campaign4: {
    label: "Campaign4",
    color: "var(--chart-4)", // Ensure these variables are defined in your CSS
  },
};

// the end of dummy data 


// graphQL  start setup

// Specific query for user's contents
const FETCH_USER_CONTENTS = gql`
query FetchUserContents {
  contentdashbord{
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
    userimg
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
    userimg
  }
}
`;

const FETCH_USER_FUNDRAISE = gql`
query FetchUserFundraise {
  fundraisedashboard{
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

// graphQL end  setup


const MyDashboard = () => {
  const navigate = useNavigate();
  // the start select range date  for chart
  const [timeRange, setTimeRange] = React.useState("90d")
  const filteredDataBar = chartDataBar.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-05-05")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)


    return date >= startDate
  })
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0)
  }, [])

  // the end select range date  for chart




  // the start of authentication
  const { token } = useAuth(); // Destructure the token from the AuthContext

  const {
    data: contentData,
    loading: contentLoading,
    error: contentError,
    refetch: refetchContent
  } = useQuery(FETCH_USER_CONTENTS, {
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


  const {
    data: fundraiseData,
    loading: fundraiseLoading,
    error: fundraiseError,
    refetch: refetchFundraise
  } = useQuery(FETCH_USER_FUNDRAISE, {
    fetchPolicy: "cache-and-network",
    context: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    },
    skip: !token,
    onError: (error) => {
      console.error("Fundraise Query Error:", error);
      handleAuthenticationError(error);
    },
  });

  const handleAuthenticationError = (error) => {
    if (error.message.includes("Not authenticated")) {
      localStorage.removeItem("authToken");
      navigate('/');
    }
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }
  // the end  of authentication









  // start of styline line section nav menu 
  const [lineWidth, setLineWidth] = useState(0);
  const [linePosition, setLinePosition] = useState(0);
  const sectionRefs = useRef([]);
  const [activeSection, setActiveSection] = useState("Overview");
  const sections = [
    "Overview",
    "Donor",
    "Campaign",
    "Fundraise"
  ];

  useEffect(() => {
    const overviewIndex = sections.indexOf("Overview");

    if (sectionRefs.current[overviewIndex]) {
      const overviewElement = sectionRefs.current[overviewIndex];

      setLineWidth(overviewElement.offsetWidth);
      setLinePosition(overviewElement.offsetLeft);
    }

  }, [token]);
  // end of styline line section nav menu 


  // the start of handling error and state

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

  // the end  of handling error and state


  // Extract data safely
  const content = contentData?.contentdashbord || [];
  const userName = profileData?.me?.name || "My";
  const fundraisefeed = fundraiseData?.fundraisedashboard || [];


  //adapter 
  const fundraiseFeedForOverview = fundraisefeed.slice(0, 5); // For CombinedFeed, limit to top 5
  const fundraiseFeedForSection = fundraisefeed; // Use full data for Fundraise section
  const contentDataForOverview = content.slice(0, 5);
  const contentDataForSection = content;

  const navigateToCampaignPage = (campaignId) => {
    navigate(`/detailcampaign/${campaignId}`);
  };
  const navigateToFundraisePage = (fundraiseId) => {
    navigate(`/detailfundraise/${fundraiseId}`);
  };




  // the start of combined feed for overview section
  const CombinedFeed = ({ contentData, fundraiseData, profileData }) => {
    console.log("Received contentData:", contentData);
    console.log("Received fundraiseData:", fundraiseData);
  
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

      const fundraiserItems = (fundraiseData|| []).map(fundraiser => ({
        ...fundraiser,
        type: 'fundraiser',
        date: fundraiser.content?.startDate || fundraiser.createdAt
      }));

      return [...campaignItems, ...fundraiserItems].sort((a, b) => {
        const dateA = new Date(Number(a.date) || a.date).getTime();
        const dateB = new Date(Number(b.date) || b.date).getTime();
        return dateA - dateB;
      });
    }, [contentData, fundraiseData]);

    // Handle card click
    const handleCardClick = (item) => {
      if (item.type === 'campaign') {
        navigateToCampaignPage(item.id);
      } else {
        navigateToFundraisePage(item.id);
      }
    };

    if (!contentData && !fundraiseData) {
      return (
        <div className="flex flex-col mt-10 text-white">
          <div>No campaigns or fundraisers found</div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {sortedFeedItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-start gap-8 items-center bg-transparent mt-8 cursor-pointer p-4 rounded-lg transition-all duration-200 hover:bg-[linear-gradient(to_bottom_right,rgba(73,106,121,0.2),rgba(52,59,70,0.2))] hover:backdrop-blur-md"
            onClick={() => handleCardClick(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(item);
              }
            }}
          >
            {/* Left Side - Image */}
            <div className="rounded-lg">
              <img
                src={
                  item.type === 'campaign'
                    ? item.imageSrc || "https://via.placeholder.com/200"
                    : item.fundimg  || "@/assets/logo_udunan.png"
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
                <Avatar className="h-8 w-8 mr-2 cursor-pointer">
                  <img
                    src={
                      item.type === 'campaign'
                        ? item.user.userimg || "https://via.placeholder.com/200"
                        : item.author.userimg  || "@/assets/logo_udunan.png"
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
              )}

              {/* Badge */}
              <div className="text-lg font-semibold">
                <Badge
                  className={`bg-transparent text-base ${
                    item.type === 'campaign'
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

  // the end  of combined feed for overview section

  // the start of render Section Content for overview section
  const renderSectionContent = () => {
    switch (activeSection) {
      case "Overview":
        return (
          <div className="text-gray-300 w-full">

            <div className="flex justify-between gap-4">
              <div className="bg-white/5 rounded-lg align-middle w-1/3 p-10 py-15 text-white font-bold text-3xl"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}

              >

                <div>3.95 <span className="font-medium text-lg">ETH</span></div>
                <div className="flex justify-center pt-4">
                  <span className="text-sm font-light">Total Campaign</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg align-middle w-1/3 p-10 py-15 text-white font-bold text-3xl"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="flex justify-center">4</div>
                <div className="flex justify-center pt-4">
                  <span className="text-sm font-light">Total Campaign</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg align-middle w-1/3 p-10 py-15 text-white font-bold text-3xl"
                style={{
                  background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div className="flex justify-center">2</div>
                <div className="flex justify-center pt-4">
                  <span className="text-sm font-light">Total Fundraise</span>
                </div>
              </div>
            </div>

            {/* feed content(campaign) & fundraise */}
            <div className="flex flex-col mt-10">

              <div className="flex flex-col text-white font-bold text-xl">
                Running Campaign & Fundraise
                <Separator className="bg-gray-700 mt-2" />
              </div>

              <div >
                <CombinedFeed
                  contentData={contentDataForOverview}
                  fundraiseData={fundraiseFeedForOverview}
                  profileData={profileData}
                />
              </div>


            </div>
          </div>
        );
      case "Donor":
        return (
          <div className="text-gray-300">
            Donation details and options will be displayed here.
          </div>
        );
      case "Campaign":
        return (
          <div className="text-gray-300 w-full">
            <div
              // className="flex justify-between rounded-lg text-white bg-white/5 pt-5 ">
              className="flex justify-between rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
              }}>
              {/* left side */}
              <div className="w-1/2">
                <Card className="flex flex-col bg-transparent border-transparent">
                  <CardHeader className=""></CardHeader>
                  <CardContent className="flex-1 pb-0">
                    <ChartContainer
                      config={chartConfig}
                      className="mx-auto aspect-square max-h-[250px]"
                    >
                      <PieChart>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={chartData}
                          dataKey="visitors"
                          nameKey="browser"
                          innerRadius={60}
                          strokeWidth={5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-white"
                                    fill="white" // Ensure parent <text> class includes `text-white`
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="text-3xl font-bold text-white"
                                      fill="white"
                                    >
                                      {totalVisitors.toLocaleString()}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="font-bold text-white"
                                      fill="white"
                                    >
                                      ETH
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
              {/* right side */}
              <div className="w-1/2 ">
                <Card className="flex flex-col bg-transparent border-transparent">
                  <CardContent className="flex1">
                    <CardHeader className="p-0 py-2 pt-4 text-white">
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                          className="w-[160px] rounded-lg sm:ml-auto"
                          aria-label="Select a value"
                        >
                          <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                          </SelectItem>
                          <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                          </SelectItem>
                          <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <ChartContainer
                      className="mx-auto aspect-square max-h-[250px]"
                      config={chartConfigbar}>
                      <BarChart accessibilityLayer data={filteredDataBar}>
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={8}
                          axisLine={false}
                          minTickGap={32}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }}
                          tick={{ style: { fill: "white" } }} // Correct style structure

                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }}
                              indicator="dot"
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="campaign1"
                          stackId="a"
                          fill="#E76E50"
                          radius={[0, 0, 4, 4]}
                        />
                        <Bar
                          dataKey="campaign2"
                          stackId="a"
                          fill="#E9C469"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="campaign3"
                          stackId="a"
                          fill="#299D90"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="campaign4"
                          stackId="a"
                          fill="#264753"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>

                </Card>
              </div>
            </div>
            {/* feed content(campaign)*/}
  <div className="flex flex-col mt-10">
    <div className="flex flex-col text-white font-bold text-xl">
      Running Campaign
      <Separator className="bg-gray-700 mt-2" />
    </div>

    {/* Render Campaigns */}
    {contentDataForSection.map((campaign) => (
      <div 
        key={campaign.id} 
        className="flex justify-start gap-8 items-center bg-transparent mt-8 cursor-pointer p-4 rounded-lg transition-all duration-200 hover:bg-[linear-gradient(to_bottom_right,rgba(73,106,121,0.2),rgba(52,59,70,0.2))] hover:backdrop-blur-md"
        onClick={() => navigateToCampaignPage(campaign.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            navigateToCampaignPage(campaign.id);
          }
        }}
      >
        {/* Left Side */}
        <div className="rounded-lg">
          <img
            src={campaign.imageSrc}
            alt=""
            width="200"
            height="100"
            className="object-cover rounded-lg"
          />
        </div>

        {/* Right Side */}
        <div className="flex flex-col justify-start gap-1">
          <div className="text-lg font-bold">{campaign.title}</div>
          <div className="font-light text-sm inline-flex">
            <Avatar className="h-6 w-6 mr-2 cursor-pointer">
              <AvatarImage src= {campaign.user.userimg} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span>By {campaign.organizationName || "Unknown"}</span>
          </div>
          <div className="font-light text-sm mb-2">
            <span className="text-md">
              {new Date(Number(campaign.startDate)).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              {' - '}
              {new Date(Number(campaign.endDate)).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="text-lg font-semibold">
            <Badge className="bg-transparent text-base border-red-500">Campaign</Badge>
          </div>
        </div>
      </div>
    ))}
  </div>
          </div>
        );
      case "Fundraise":
        return (
          <div className="text-gray-300">
            <div
              className="flex justify-between rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
              }}>
              {/* left side fundraiser */}
              <div className="w-1/2 grid grid-rows-2 p-4 ">
                {/* header  */}

                <div className='flex justify-between gap-2 py-2'>

                  {/* top-left card */}
                  <div
                    className="w-full text-white font-bold text-md rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity flex justify-center items-center"
                    style={{
                      background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className='flex flex-col items-center gap-2'>
                      100K+
                      <span className='font-medium text-sm'> Impression</span>
                    </div>

                  </div>

                  {/* top-right card */}

                  <div
                    className="w-full text-white font-bold text-md rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity flex justify-center items-center"
                    style={{
                      background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >

                    <div className='flex flex-col items-center gap-2'>
                      2
                      <span className='font-medium text-sm'>Host Fundraise</span>
                    </div>

                  </div>
                </div>
                <div className='flex justify-between gap-2 py-2'>

                  {/* bottom-left card */}
                  <div
                    className="w-full text-white font-bold text-md rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity flex justify-center items-center"
                    style={{
                      background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className='flex flex-col items-center gap-2'>
                      4232
                      <span className='font-medium text-sm'> Donor/Impress</span>
                    </div>

                  </div>
                  {/* bottom-right card */}
                  <div
                    className="w-full text-white font-bold text-md rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity flex justify-center items-center"
                    style={{
                      background: "linear-gradient(to bottom right, rgba(73, 106, 121, 0.2), rgba(52, 59, 70, 0.2))",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <div> 40 <span className='text-white/70'>ETH</span></div>
                      <span className='font-medium text-sm'>Total Raised </span>
                    </div>

                  </div>
                </div>



              </div>
              {/* right side fundraiser */}
              {/* should shown impression chart, remove this comment if it has been done */}
              <div className="w-1/2 ">
                <Card className="flex flex-col bg-transparent border-transparent">
                  <CardContent className="flex1">
                    <CardHeader className="p-0 py-2 pt-4 text-white">
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                          className="w-[160px] rounded-lg sm:ml-auto"
                          aria-label="Select a value"
                        >
                          <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="90d" className="rounded-lg">
                            Last 3 months
                          </SelectItem>
                          <SelectItem value="30d" className="rounded-lg">
                            Last 30 days
                          </SelectItem>
                          <SelectItem value="7d" className="rounded-lg">
                            Last 7 days
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <ChartContainer
                      className="mx-auto aspect-square max-h-[250px]"
                      config={chartConfigbar}>
                      <BarChart accessibilityLayer data={filteredDataBar}>
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          tickMargin={8}
                          axisLine={false}
                          minTickGap={32}
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }}
                          tick={{ style: { fill: "white" } }} // Correct style structure

                        />
                        <ChartTooltip
                          cursor={false}
                          content={
                            <ChartTooltipContent
                              labelFormatter={(value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              }}
                              indicator="dot"
                            />
                          }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="campaign1"
                          stackId="a"
                          fill="#E76E50"
                          radius={[0, 0, 4, 4]}
                        />
                        <Bar
                          dataKey="campaign2"
                          stackId="a"
                          fill="#E9C469"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="campaign3"
                          stackId="a"
                          fill="#299D90"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="campaign4"
                          stackId="a"
                          fill="#264753"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>

                </Card>
              </div>
            </div>
            {/* feed fundraise */}
<div className="flex flex-col mt-10">
  <div className="flex flex-col text-white font-bold text-xl">
    Running Fundraise
    <Separator className="bg-gray-700 mt-2" />
  </div>

  {/* Render Fundraisers */}
  {fundraiseFeedForSection.map((fundraiser) => (
    <div
      key={fundraiser.id}
      className="flex justify-start gap-8 items-center bg-transparent mt-8 cursor-pointer p-4 rounded-lg transition-all duration-200 hover:bg-[linear-gradient(to_bottom_right,rgba(73,106,121,0.2),rgba(52,59,70,0.2))] hover:backdrop-blur-md"
      onClick={() => navigateToFundraisePage(fundraiser.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigateToFundraisePage(fundraiser.id);
        }
      }}
    >
      {/* Left Side - Image */}
      <div className="rounded-lg">
        <img
          src={fundraiser.fundimg}
          alt={fundraiser.title}
          width="200"
          height="100"
          className="object-cover rounded-lg"
        />
      </div>

      {/* Right Side */}
      <div className="flex flex-col justify-start gap-1">
        <div className="text-lg font-bold">{fundraiser.title}</div>
        <div className="font-light text-sm inline-flex">
          <Avatar className="h-6 w-6 mr-2 cursor-pointer">
            <AvatarImage src= {fundraiser.author.userimg} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <span className=''>By {fundraiser.author?.name || "Unknown"}</span>
        </div>

        <div className="text-lg font-semibold">
          <Badge className="bg-transparent text-base border-blue-500">Fundraise</Badge>
        </div>
      </div>
    </div>
  ))}
</div>
          </div>
        );
      default:
        return null;
    }
  };
  // the end of render Section Content for overview section

  // the start of render My Dashboard (main)
  return (

    <div className="min-h-screen text-left text-white px-14 py-8 pt-10 mx-auto">

      <h1 className="text-3xl font-bold mb-4">{userName}'s Dashboard</h1>

      <div className="relative flex justify-start pr-8 text-left pt-4 bt-4">
        {sections.map((section, index) => (
          <button
            key={section}
            ref={(el) => (sectionRefs.current[index] = el)}
            className={`
              text-lg font-medium px-3 py-2 rounded-md transition-all duration-300 relative
        flex-1 # Make buttons equally sized and fill the container

              ${activeSection === section
                ? 'bg-transparent text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white'
                : 'text-gray-400 bg-transparent hover:text-gray-200'}
             before:absolute before:bottom-0 before:left-0 before:w-full before:h-[1px] before:bg-gray-700
                     hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-gray-500


            `}
            onClick={() => {
              setActiveSection(section);

              if (sectionRefs.current[index]) {
                const clickedElement = sectionRefs.current[index];
                setLineWidth(clickedElement.offsetWidth);
                setLinePosition(clickedElement.offsetLeft);
              }
            }}
          >
            {section}
            {activeSection === section && (
              <div
                className="absolute bottom-0 left-0 w-full h-[2px] bg-white transition-all duration-300"
              />
            )}
          </button>
        ))}
      </div>
      <div className="pr-4 mt-10">
        {renderSectionContent()}
      </div>

    </div>
  );
};

// the end of render My Dashboard (main)


export default MyDashboard;
