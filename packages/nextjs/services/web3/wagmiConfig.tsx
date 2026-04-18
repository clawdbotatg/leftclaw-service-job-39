import { wagmiConnectors } from "./wagmiConnectors";
import { Chain, createClient, fallback, http } from "viem";
import { hardhat, mainnet } from "viem/chains";
import { createConfig } from "wagmi";
import scaffoldConfig, { DEFAULT_ALCHEMY_API_KEY, ScaffoldConfig } from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
export const enabledChains = targetNetworks.find((network: Chain) => network.id === 1)
  ? targetNetworks
  : ([...targetNetworks, mainnet] as const);

export const wagmiConfig = createConfig({
  chains: enabledChains,
  connectors: wagmiConnectors(),
  ssr: true,
  // NEXT_PUBLIC_ALCHEMY_API_KEY is REQUIRED for production. Next.js inlines NEXT_PUBLIC_* at build time,
  // so it must be set in the build shell (not just at runtime). When a non-default key is configured,
  // Alchemy becomes the primary transport (position 0); the bare http() falls back to the chain's
  // public RPC only if Alchemy errors. Without the key, the bare http() fallback precedes Alchemy.
  client: ({ chain }) => {
    const mainnetFallbackWithDefaultRPC = [http("https://mainnet.rpc.buidlguidl.com")];
    const isUsingDefaultKey = scaffoldConfig.alchemyApiKey === DEFAULT_ALCHEMY_API_KEY;
    // When an Alchemy key is configured, drop the bare http() public fallback to avoid rate-limited public RPCs.
    // Keep it only as a last-resort fallback when running with the default (shared) key.
    let rpcFallbacks = [
      ...(chain.id === mainnet.id ? mainnetFallbackWithDefaultRPC : []),
      ...(isUsingDefaultKey ? [http()] : []),
    ];
    const rpcOverrideUrl = (scaffoldConfig.rpcOverrides as ScaffoldConfig["rpcOverrides"])?.[chain.id];
    if (rpcOverrideUrl) {
      rpcFallbacks = [http(rpcOverrideUrl), ...rpcFallbacks];
    } else {
      const alchemyHttpUrl = getAlchemyHttpUrl(chain.id);
      if (alchemyHttpUrl) {
        rpcFallbacks = isUsingDefaultKey
          ? [...rpcFallbacks, http(alchemyHttpUrl)]
          : [http(alchemyHttpUrl), ...rpcFallbacks];
      }
    }
    return createClient({
      chain,
      transport: fallback(rpcFallbacks),
      ...(chain.id !== (hardhat as Chain).id ? { pollingInterval: scaffoldConfig.pollingInterval } : {}),
    });
  },
});
