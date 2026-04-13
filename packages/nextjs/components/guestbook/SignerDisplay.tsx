"use client";

import Link from "next/link";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";

type Props = {
  address: `0x${string}`;
  asLink?: boolean;
};

const truncate = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

export const SignerDisplay = ({ address, asLink = true }: Props) => {
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });
  const label = ensName ?? truncate(address);

  const content = (
    <span className="inline-flex items-center gap-1 font-bold" style={{ color: "#000080" }}>
      {label}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href={`/signer/${address}`} passHref className="win95-link" style={{ textDecoration: "underline" }}>
      {label}
    </Link>
  );
};
