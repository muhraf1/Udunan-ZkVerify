"use client";

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//rainbow wallets


// UI Components
import { EmblaCarousel } from "./components/ui/EmblaCarousel";
import Layout from "./components/ui/Layout";
import { Toaster } from "sonner";

// Authentication
import { AuthProvider } from "./components/ui/AuthContext";
import ProtectedRoute from "@/routes/protectedroutes";

// Pages
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import DonationPage from "@/pages/Donation";
import FundraiseDetailPage from "@/pages/FundraiseDetailPage";
import MyDashboard from "@/pages/MyDashboard";
import MyProfile from "@/pages/profile";
import MyProfilePublic from "@/pages/profilepublic";
import CreateCampaign from "@/pages/CreateCampaign";
import CreateFundraise from "@/pages/CreateFundraise";
import ManageCampaign from "@/pages/managecampaign";
import ManageFundraise from "@/pages/managefundraise";

// Content Feed
import { ContentFeedHome } from "@/components/ui/content_feed_home";
import { HomeFeed } from "./components/ui/home_feed";

// Account Kit
import { AlchemyAccountProvider } from "@account-kit/react";
import { config, queryClient } from "./config";

// Query Client
import { QueryClientProvider } from "@tanstack/react-query";

// Styles
import "./Embla.css";
import "./App.css";

const OPTIONS = {};

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Emergency");

  return (
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={config} queryClient={queryClient}>
        <Router>
          <AuthProvider>
            <Toaster />
            <Layout>
              <Routes>
                {/* Home Page */}
                <Route
                  path="/"
                  element={
                    <>
                      <div className="flex justify-center pt-4">
                        <EmblaCarousel options={OPTIONS} />
                      </div>
                      <div className="flex justify-start pt-4">
                        <HomeFeed
                          category={selectedCategory}
                          setCategory={setSelectedCategory}
                        />
                      </div>
                      <div className="flex justify-center pt-4">
                        <ContentFeedHome category={selectedCategory} />
                      </div>
                    </>
                  }
                />

                {/* Protected Routes */}
                <Route
                  path="/CreateCampaign"
                  element={
                    <ProtectedRoute>
                      <CreateCampaign />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/CreateFundraise"
                  element={
                    <ProtectedRoute>
                      <CreateFundraise />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/MyDashboard"
                  element={
                    <ProtectedRoute>
                      <MyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/MyProfile"
                  element={
                    <ProtectedRoute>
                      <MyProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/managecampaign/:id"
                  element={
                    <ProtectedRoute>
                      <ManageCampaign />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/managefundraise/:id"
                  element={
                    <ProtectedRoute>
                      <ManageFundraise />
                    </ProtectedRoute>
                  }
                />

                {/* Public Routes */}
                <Route path="/:id" element={<MyProfilePublic />} />
                <Route path="/detailcampaign/:id" element={<CampaignDetailPage />} />
                <Route path="/Donate/:id" element={< DonationPage />} />
                <Route path="/detailfundraise/:id" element={<FundraiseDetailPage />} />
              </Routes>
            </Layout>
          </AuthProvider>
        </Router>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  );
}

export default App;
