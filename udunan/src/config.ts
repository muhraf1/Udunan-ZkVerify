import { AlchemyAccountsUIConfig, createConfig } from "@account-kit/react";
import { sepolia, alchemy, arbitrumSepolia } from "@account-kit/infra";
import { QueryClient } from "@tanstack/react-query";
// Remove this import as we'll use arbitrumSepolia from @account-kit/infra
// import { arbitrumSepolia } from "viem/chains";

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [[{"type":"external_wallets","walletConnect":{"projectId":"udunan"}}]],
    addPasskeyOnSignup: false,
  },
};

export const config = createConfig({
  transport: alchemy({ apiKey: "fIXrkXUidprdr-G3VTuaqZ2jCcWnYDwm" }),
  chain: arbitrumSepolia,
  ssr: true,
  enablePopupOauth: true,
}, uiConfig);

export const queryClient = new QueryClient();