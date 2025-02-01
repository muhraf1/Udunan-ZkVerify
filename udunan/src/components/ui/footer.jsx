"use client";

import React from "react";
import { Mail, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
export function CustomFooter() {
  return (
    <footer className="bg-transparent text-gray-300 pt-4">
        <Separator className="bg-white/10 mb-4"/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="h-8 w-8 rounded-full  flex items-center justify-center">
            {/* Placeholder for Logo */}
            <img src="./src/assets/logo_udunan.png" alt="" />
          </div>
          {/* Links */}
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About us
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Help
            </a>
          </div>
        </div>

       

        {/* Right Section */}
        <div className="flex gap-4">
          <a
            href="#"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <Mail className="h-5 w-5" />
          </a>
         
          <a
            href="#"
            className="text-gray-300 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
                 {/* Center Section */}
        <div className="text-sm">
          <a
            href="#"
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#FFF7D7] via-[#5794D1] to-[#CF6E57] font-semibold hover:underline flex items-center"
          >
            Start a Campaign
            <span className="ml-1">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default CustomFooter;
