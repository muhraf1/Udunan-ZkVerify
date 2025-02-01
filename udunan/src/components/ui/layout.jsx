import React from "react";
import { Navbar } from "@/components/ui/navbar";
import { CustomFooter } from "@/components/ui/footer";

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col w-full">
      <div className="grid justify-items-stretch p-4">
        <div className="flex items-center justify-between w-full">
          {/* Navbar Section */}
          <div className="flex-1 flex justify-center">
            <Navbar />
          </div>

          
        </div>
      </div>

      <main className="flex-grow">
        {children}
      </main>

      <div>
        <CustomFooter />
      </div>
    </div>
  );
};

export default Layout;