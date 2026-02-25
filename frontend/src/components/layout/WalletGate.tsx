"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { ReactNode } from "react";
import { Wallet, Lock, ArrowRight, ShieldCheck, Zap, Coins } from "lucide-react";

interface WalletGateProps {
    children: ReactNode;
}

export function WalletGate({ children }: WalletGateProps) {
    const currentAccount = useCurrentAccount();

    if (currentAccount) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                {/* Hero Card */}
                <div className="brutal bg-secondary-background p-8 text-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-main border-2 border-border shadow-shadow mx-auto">
                                <Lock className="h-12 w-12 text-main-foreground" />
                            </div>
                            <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan border-2 border-border">
                                <ShieldCheck className="h-4 w-4 text-main-foreground" />
                            </div>
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2">
                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            Connect Your Wallet
                        </h1>
                        <p className="text-foreground/60 text-sm leading-relaxed">
                            To access the SUI Escrow platform, you need to connect your SUI wallet first.
                            Your wallet acts as your identity on the blockchain.
                        </p>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap justify-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-foreground">
                            <Wallet className="h-3.5 w-3.5 text-accent-blue" />
                            Secure & Non-Custodial
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-foreground">
                            <Zap className="h-3.5 w-3.5 text-accent-yellow" />
                            Instant Connection
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-foreground">
                            <Coins className="h-3.5 w-3.5 text-accent-green" />
                            SUI Testnet
                        </div>
                    </div>

                    {/* Connect Button */}
                    <div className="flex flex-col items-center gap-3">
                        <ConnectButton />
                        <p className="text-xs text-foreground/40">
                            Supports Suiet, Sui Wallet, and other SUI-compatible wallets
                        </p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-foreground/40 pt-2 border-t border-border">
                        <span>Connect wallet to unlock</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="font-semibold text-foreground/60">Escrow • Faucet • Dashboard</span>
                    </div>
                </div>

                {/* Steps below */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                        { step: "1", label: "Connect Wallet", icon: Wallet, color: "bg-accent-cyan" },
                        { step: "2", label: "Get Test Coins", icon: Coins, color: "bg-accent-yellow" },
                        { step: "3", label: "Create Escrow", icon: Zap, color: "bg-accent-pink" },
                    ].map(({ step, label, icon: Icon, color }) => (
                        <div
                            key={step}
                            className="brutal p-3 text-center space-y-2"
                        >
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border mx-auto ${color}`}
                            >
                                <Icon className="h-4 w-4 text-main-foreground" />
                            </div>
                            <div className="text-xs font-semibold text-foreground/60">
                                Step {step}
                            </div>
                            <div className="text-xs font-bold text-foreground">{label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
