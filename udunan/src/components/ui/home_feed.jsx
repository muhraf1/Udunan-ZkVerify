"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function HomeFeed({ category, setCategory }) {
  // Define category colors with improved consistency
  const categoryColors = {
    Emergency: "bg-[#D16F57] text-white hover:bg-[#D16F57]/90",
    Education: "bg-[#E7404A] text-white hover:bg-[#E7404A]/90",
    HealthCare: "bg-[#5794D1] text-white hover:bg-[#5794D1]/90",
  };
  
  // Fallback to a neutral style if category is not found
  const selectedColorClass = categoryColors[category] || "bg-gray-600 text-white";

  // Categories array to make mapping and maintenance easier
  const categories = [
    "Emergency",
    "Education", 
    "HealthCare"
  ];

  return (
    <section className="justify-start max-w-7xl px-6 sm:px-6 lg:px-8">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className={`variant-outline flex items-center gap-2 ${selectedColorClass}`}
          >
            {category} 
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-black/30 backdrop-blur-lg text-white rounded-sm border-[rgba(255,255,255,0.02)]"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel>Categories</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.1)]" />
          {categories.map((cat) => (
            <DropdownMenuItem 
              key={cat} 
              onClick={() => setCategory(cat)}
              className="cursor-pointer text-[#BABFC1] font-medium hover:bg-white/10"
            >
              {cat}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </section>
  );
}

export default HomeFeed;