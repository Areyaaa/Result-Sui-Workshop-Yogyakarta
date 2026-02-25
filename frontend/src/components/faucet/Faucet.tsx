"use client";

import { Transaction } from "@mysten/sui/transactions";
import {
    useSignAndExecuteTransaction,
    useSuiClient,
    useCurrentAccount,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionDialog } from "@/components/ui/dialog-transaction";
import { useState } from "react";
import { Droplets } from "lucide-react";
import { PACKAGE_ID, FAUCET_ID, FAUCET_COIN_CONFIGS, FaucetCoinType } from "@/constants";

function FaucetTab({ coinType }: { coinType: FaucetCoinType }) {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const queryClient = useQueryClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [txDigest, setTxDigest] = useState("");

    const config = FAUCET_COIN_CONFIGS[coinType];

    const handleClaim = () => {
        if (!account) return;

        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::faucet::claim`,
            typeArguments: [config.typeArg],
            arguments: [tx.object(FAUCET_ID), tx.object("0x6")],
        });

        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: (result) => {
                    console.log(`${config.label} claim successful!`, result);
                    setTxDigest(result.digest);
                    setDialogOpen(true);
                    client.waitForTransaction({ digest: result.digest });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getBalance"] });
                },
                onError: (error) => {
                    console.error(`${config.label} claim failed:`, error);
                },
            }
        );
    };

    return (
        <>
            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                digest={txDigest}
                title={`${config.label} Claimed Successfully!`}
                description={`You have successfully claimed 10,000 ${config.label}.`}
            />
            <div className="space-y-4 pt-4">
                <div className="rounded-lg border border-border bg-surface p-4">
                    <p className="text-sm text-foreground/60">
                        💧 You can claim{" "}
                        <span className="font-bold text-foreground">10,000 {config.label}</span>{" "}
                        every <span className="font-bold text-foreground">1 minute</span>.
                    </p>
                </div>
                <Button onClick={handleClaim} disabled={!account} className="w-full">
                    <Droplets className="mr-2 h-4 w-4" />
                    Claim {config.label}
                </Button>
            </div>
        </>
    );
}

export function Faucet() {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="h-5 w-5" />
                    Faucet
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="mock_coin" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mock_coin" asChild>
                            <Button variant="noShadow">Mock Coin</Button>
                        </TabsTrigger>
                        <TabsTrigger value="mock_tbtc" asChild>
                            <Button variant="noShadow">Mock TBTC</Button>
                        </TabsTrigger>
                        <TabsTrigger value="mock_zsui" asChild>
                            <Button variant="noShadow">Mock zSUI</Button>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mock_coin">
                        <FaucetTab coinType="MOCK_COIN" />
                    </TabsContent>
                    <TabsContent value="mock_tbtc">
                        <FaucetTab coinType="MOCK_TBTC" />
                    </TabsContent>
                    <TabsContent value="mock_zsui">
                        <FaucetTab coinType="MOCK_ZSUI" />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

export default Faucet;
