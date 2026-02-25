"use client";

import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PACKAGE_ID } from "@/constants";

interface MoveCallCommand {
    MoveCall: {
        package: string;
        module: string;
        function: string;
        type_arguments: string[];
        arguments: Array<
            | { Input: number }
            | { Result: number }
            | { NestedResult: [number, number] }
        >;
    };
}

interface EscrowFields {
    requested_amount: string;
    [key: string]: unknown;
}

export function MyEscrowList() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const { data: escrows, isLoading } = useQuery({
        queryKey: ["my-escrows", account?.address],
        queryFn: async () => {
            if (!account?.address) return [];

            const txs = await client.queryTransactionBlocks({
                filter: { FromAddress: account.address },
                options: {
                    showInput: true,
                    showEffects: true,
                    showObjectChanges: true,
                },
            });

            const createdEscrows = txs.data.flatMap((tx) => {
                const transaction = tx.transaction?.data.transaction;
                if (transaction?.kind !== "ProgrammableTransaction") return [];

                return transaction.transactions.flatMap((cmd: unknown) => {
                    const moveCall = (cmd as MoveCallCommand).MoveCall;
                    if (
                        moveCall &&
                        moveCall.package === PACKAGE_ID &&
                        moveCall.module === "simple_escrow" &&
                        moveCall.function === "create_escrow"
                    ) {
                        const createdObject = tx.objectChanges?.find(
                            (change) =>
                                change.type === "created" &&
                                change.objectType.startsWith(
                                    `${PACKAGE_ID}::simple_escrow::Escrow`
                                )
                        );
                        if (!createdObject || createdObject.type !== "created") return [];

                        const arg1 = moveCall.arguments[1];
                        const inputIndex = "Input" in arg1 ? arg1.Input : undefined;

                        return {
                            id: createdObject.objectId,
                            digest: tx.digest,
                            depositType: moveCall.type_arguments[0],
                            paymentType: moveCall.type_arguments[1],
                            requestedAmountInputIndex: inputIndex,
                            inputs: transaction.inputs,
                        };
                    }
                    return [];
                });
            });

            const objectIds = createdEscrows.map((e) => e.id);
            if (objectIds.length === 0) return [];

            const objects = await client.multiGetObjects({
                ids: objectIds,
                options: { showContent: true },
            });

            return createdEscrows.map((escrow) => {
                const obj = objects.find((o) => o.data?.objectId === escrow.id);
                const isClosed = !obj?.data;

                let requestedAmount = "Unknown";
                if (typeof escrow.requestedAmountInputIndex === "number") {
                    const input = escrow.inputs[escrow.requestedAmountInputIndex];
                    if (input.type === "pure") {
                        requestedAmount = input.value as string;
                    }
                }

                if (!isClosed && obj?.data?.content?.dataType === "moveObject") {
                    const fields = obj.data.content.fields as unknown as EscrowFields;
                    requestedAmount = fields.requested_amount;
                }

                return {
                    id: escrow.id,
                    depositType: escrow.depositType,
                    paymentType: escrow.paymentType,
                    requestedAmount: (Number(requestedAmount) / 1_000_000_000).toString(),
                    status: isClosed ? "Closed" : "Open",
                    digest: escrow.digest,
                };
            });
        },
        enabled: !!account,
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <List className="h-5 w-5" />
                    My Escrows
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
                        <span className="ml-3 text-sm text-foreground/60">Loading escrows...</span>
                    </div>
                ) : escrows?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <List className="h-10 w-10 text-foreground/20 mb-3" />
                        <p className="text-sm text-foreground/50">No escrows found yet.</p>
                        <p className="text-xs text-foreground/30 mt-1">
                            Create your first escrow using the manager above.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {escrows?.map((escrow) => (
                            <div
                                key={escrow.id}
                                className="rounded-lg border border-border bg-surface p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm font-medium text-foreground">
                                            {escrow.id.slice(0, 8)}...{escrow.id.slice(-6)}
                                        </span>
                                        <Button
                                            variant="neutral"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => {
                                                navigator.clipboard.writeText(escrow.id);
                                                setCopiedId(escrow.id);
                                                setTimeout(() => setCopiedId(null), 2000);
                                            }}
                                            title="Copy Object ID"
                                        >
                                            {copiedId === escrow.id ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                    </div>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${escrow.status === "Open"
                                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                                                : "bg-surface-2 text-foreground/50 border-border"
                                            }`}
                                    >
                                        {escrow.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-xs text-foreground/40 uppercase font-medium">Deposit</p>
                                        <p className="font-medium text-foreground">
                                            {escrow.depositType.split("::").pop()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground/40 uppercase font-medium">Request</p>
                                        <p className="font-medium text-foreground">
                                            {escrow.requestedAmount}{" "}
                                            <span className="text-foreground/60">
                                                {escrow.paymentType.split("::").pop()}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default MyEscrowList;
