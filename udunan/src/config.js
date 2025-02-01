import { cookieStorage, createConfig } from "@account-kit/react";
import { alchemy, sepolia, baseSepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";

// UI Configuration
const uiConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [
      [{ type: "email", emailMode: "otp" }],
    ],
    addPasskeyOnSignup: false,
  },
};

// Provider Configuration
const providerConfig = {
  transport: alchemy({ 
    apiKey: "fIXrkXUidprdr-G3VTuaqZ2jCcWnYDwm"
  }),
  chain: baseSepolia,
  ssr: true,
  policyId: "1d5c6529-3f55-44d9-9888-c886b128f188",
  storage: cookieStorage,
  enablePopupOauth: true,
};

// Create configuration with error handling
export const config = (() => {
  try {
    return createConfig(providerConfig, uiConfig);
  } catch (error) {
    console.error("Error creating config:", error);
    throw error;
  }
})();

// Create query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});