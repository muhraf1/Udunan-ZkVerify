import React, { useState, useCallback,useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Bell, Heart, Plus, Search, Building2, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from './AuthContext';
import { AuthCard } from "@account-kit/react";
import { toast } from 'sonner';
import { gql, useMutation,useQuery } from '@apollo/client';

import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from "@account-kit/react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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


export function Navbar() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogOpenLogin, setIsDialogOpenLogin] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get auth states from context
  const { isLoggedIn, login, logout, user, signerStatus,token } = useAuth();

  const handleLoginSuccess = async () => {
    try {

        await login(); // Call login from AuthContext
        toast.success('You are now logged in!');
        setIsDialogOpenLogin(false);
    
      console.log("ini apa?",data?.login);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Failed to login. Please try again.');
    }
  };


  const handleSignOut = async () => {
    try {
      await logout();
      console.log("Logout Successful!");
      navigate('/');
    } catch (err) {
      console.error('Logout Failed:', err);
    }
  };


  useEffect(() => {
    if (isLoggedIn && user) {
      setIsDialogOpenLogin(false);
    }
  }, [isLoggedIn, user]);



  // end of auth 
  // check
  console.log("check user",user);
  console.log("check signer",signerStatus);
  console.log("check login", isLoggedIn);


  // For debugging
  useEffect(() => {
    if (user) {
      console.log("Current user data:", {
        email: user.email,
        userId: user.userId,
        orgId: user.orgId,
        address: user.address,
        type: user.type
      });
    }
  }, [user]);


  console.log("User email before login mutation navbar.jsx:", user?.email);


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

  const currentUser = profileData?.usermanage?.id|| [];
  const currentUserPict = profileData?.usermanage?.userimg|| [];


  // Navigation handlers
  const navigateToDashboard = () => navigate('/MyDashboard');
  const navigateToCreateCampaign = () => navigate('/CreateCampaign');
  const navigateToCreateFundraise = () => navigate('/CreateFundraise');
  const navigateToProfile = () => navigate('/MyProfile');

  // Search handlers
  const handleSearchClick = () => {
    if (window.innerWidth > 640) {
      setIsDialogOpen(true);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      setSearchQuery("");
      setIsDialogOpen(false);
      setIsDrawerOpen(false);
    }
  }, [searchQuery]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);





  // Content loading and error handling
  if ( profileLoading) {
    return <div>Loading content...</div>;
  }


  // Profile Error Handling (non-blocking)

  if (profileError) {
    console.warn("Profile data could not be loaded.");
  } else if (profileData && profileData.user) {
    user = profileData.user;
  }
  return (
    <nav className='sticky top-0 z-50'>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="mx-auto max-w-7xl bg-white/20 backdrop-blur-md supports-[backdrop-filter]:bg-white/5 rounded-l-md px-3 py-2 flex items-center border border-[#5C7683]/20">
            <NavigationMenu>
              <NavigationMenuList className="flex items-center gap-2">
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    className="space-x-2 text-white bg-[#071827] rounded-lg"
                    onClick={() => navigate('/')}
                  >
                    <Heart className="h-5 w-5" />
                    <span>Donation</span>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="ghost" className="space-x-2 text-slate-200 bg-[#071827] rounded-lg">
                    <Building2 className="h-5 w-5" />
                    <span>CSR</span>
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="space-x-2 text-slate-200 bg-[#071827] rounded-lg">
                        <Plus className="h-5 w-5" />
                        <span>Create</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-black/30 backdrop-blur-lg text-white rounded-sm border-[rgba(255,255,255,0.02)]"
                      align="start"
                      sideOffset={4}>
                      <DropdownMenuLabel>Create</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                      <DropdownMenuItem className="text-[#BABFC1] font-medium" onClick={navigateToCreateCampaign}>
                        <span>New Campaign</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[#BABFC1] font-medium" onClick={navigateToCreateFundraise}>
                        <span>Start Fundraiser</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="mx-auto max-w-7xl bg-white/20 backdrop-blur-md supports-[backdrop-filter]:bg-white/5 rounded-r-md justify-between px-3 py-2 flex items-center ml-2 sm:ml-2 border border-[#5C7683]/20">
            <div className="flex items-center gap-4 pl-4">
              <button onClick={handleSearchClick} className="bg-transparent p-0">
                <Search className="h-6 w-6 text-white stroke-4" />
              </button>
              <span><Bell className="h-6 w-6 text-white stroke-4" /></span>

              {signerStatus.isInitializing ? (
                <div className="text-white">Loading...</div>
              ) : isLoggedIn && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage src= {currentUserPict} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-black/30 backdrop-blur-lg text-white rounded-sm border-[rgba(255,255,255,0.02)]"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                    <DropdownMenuItem
                      className="text-[#BABFC1] font-medium"
                      onClick={navigateToDashboard}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>My Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-[#BABFC1] font-medium"
                      onClick={navigateToProfile}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
                    <DropdownMenuItem
                      className="text-[#BABFC1] font-medium"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setIsDialogOpenLogin(true)} className="bg-white text-black rounded-lg">
                Sign In
              </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1A1A1A] border-none text-white">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-white">Search</DialogTitle>
            <DialogClose asChild className="bg-red p-2">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Press Enter to search across campaigns, fundraisers, and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-black/30 backdrop-blur-lg text-white border-[#5C7683]/20 placeholder-gray-400"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Drawer for Mobile */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="bg-[#1A1A1A] text-white">
          <DrawerHeader className="flex flex-row items-center justify-between">
            <DrawerTitle className="text-white">Search</DrawerTitle>
            <DrawerClose asChild className="bg-transparent" />
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <Input
              type="text"
              placeholder="Press Enter to search across campaigns, fundraisers, and more"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-black/30 backdrop-blur-lg text-white border-[#5C7683]/20 placeholder-gray-400"
            />
          </div>
        </DrawerContent>
      </Drawer>


       {/* AuthCard in Dialog */}
       <Dialog open={isDialogOpenLogin} onOpenChange={setIsDialogOpenLogin}>
        <DialogContent className="bg-white rounded-lg p-6">
      
            <AuthCard
              onSuccess={handleLoginSuccess}
              onError={(error) => console.error("AuthCard Error:", error)}
            />

        </DialogContent>
      </Dialog>

    </nav>
  );
}

export default Navbar;