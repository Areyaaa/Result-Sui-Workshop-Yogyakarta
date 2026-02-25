/* eslint-disable @next/next/no-img-element */
"use client";

import { ConnectButton, useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { Wallet, Zap } from "lucide-react";

export function Navbar() {
    const currentAccount = useCurrentAccount();
    const { currentWallet } = useCurrentWallet();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-main border-2 border-border shadow-shadow">
                            <Zap className="h-5 w-5 text-main-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading text-lg leading-tight font-bold text-foreground">
                                SUI Escrow
                            </span>
                            <span className="text-xs text-foreground/50 font-body">
                                Decentralized Exchange
                            </span>
                        </div>
                    </div>

                    {/* Wallet Info + Connect Button */}
                    <div className="flex items-center gap-3">
                        {currentAccount && (
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border">
                                {currentWallet?.icon && (
                                    <img
                                        src={currentWallet.icon}
                                        alt={currentWallet.name}
                                        width={18}
                                        height={18}
                                        className="rounded-sm"
                                    />
                                )}
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-foreground">
                                        {currentWallet?.name}
                                    </span>
                                    <span className="text-xs text-foreground/50 font-mono">
                                        {currentAccount.address.slice(0, 6)}...
                                        {currentAccount.address.slice(-4)}
                                    </span>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            </div>
                        )}
                        {!currentAccount && (
                            <div className="flex items-center gap-2 text-sm text-foreground/60">
                                <Wallet className="h-4 w-4" />
                                <span className="hidden sm:inline">Not connected</span>
                            </div>
                        )}
                        <ConnectButton />
                    </div>
                </div>
            </div>
        </nav>
    );
}
