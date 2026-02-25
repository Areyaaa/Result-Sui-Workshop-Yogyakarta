"use client";

import { Transaction } from "@mysten/sui/transactions";
import {
    useSignAndExecuteTransaction,
    useSuiClient,
    useCurrentAccount,
    useSuiClientQuery,
} from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionDialog } from "@/components/ui/dialog-transaction";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeftRight } from "lucide-react";
import { PACKAGE_ID, COIN_TYPES } from "@/constants";

const coinTypes = COIN_TYPES as unknown as { value: string; label: string }[];

export function EscrowManager() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const queryClient = useQueryClient();
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

    // Create Escrow State
    const [depositCoinId, setDepositCoinId] = useState("");
    const [depositCoinType, setDepositCoinType] = useState(
        `${PACKAGE_ID}::mock_coin::MOCK_COIN`
    );
    const [isCustomDeposit, setIsCustomDeposit] = useState(false);
    const [paymentCoinType, setPaymentCoinType] = useState(
        `${PACKAGE_ID}::mock_zsui::MOCK_ZSUI`
    );
    const [isCustomPayment, setIsCustomPayment] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [requestedAmount, setRequestedAmount] = useState("1");

    // Accept Escrow State
    const [acceptEscrowId, setAcceptEscrowId] = useState("");
    const [acceptPaymentCoinId, setAcceptPaymentCoinId] = useState("");
    const [acceptDepositType, setAcceptDepositType] = useState(
        "mock_coin::MOCK_COIN"
    );
    const [acceptPaymentType, setAcceptPaymentType] = useState(
        "mock_zsui::MOCK_ZSUI"
    );

    // Cancel Escrow State
    const [cancelEscrowId, setCancelEscrowId] = useState("");
    const [cancelDepositType, setCancelDepositType] = useState(
        "mock_coin::MOCK_COIN"
    );
    const [cancelPaymentType, setCancelPaymentType] = useState(
        "mock_zsui::MOCK_ZSUI"
    );

    // Transaction Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [txDigest, setTxDigest] = useState("");
    const [txTitle, setTxTitle] = useState("");
    const [txDescription, setTxDescription] = useState("");

    // Fetch deposit coins for create escrow
    const { data: depositCoins } = useSuiClientQuery(
        "getCoins",
        { owner: account?.address as string, coinType: depositCoinType },
        { enabled: !!account }
    );

    // Fetch payment coins for accept escrow
    const { data: paymentCoins } = useSuiClientQuery(
        "getCoins",
        { owner: account?.address as string, coinType: acceptPaymentType },
        { enabled: !!account && !!acceptPaymentType }
    );

    // Fetch escrow object details for auto-detection
    const { data: escrowObject } = useSuiClientQuery(
        "getObject",
        {
            id: acceptEscrowId,
            options: { showType: true, showContent: true },
        },
        { enabled: !!acceptEscrowId }
    );

    // Fetch escrow object for Cancel tab
    const { data: cancelEscrowObject } = useSuiClientQuery(
        "getObject",
        {
            id: cancelEscrowId,
            options: { showType: true, showContent: true },
        },
        { enabled: !!cancelEscrowId }
    );

    // Auto-detect coin types from escrow object (Accept tab)
    useEffect(() => {
        if (escrowObject?.data?.type) {
            const type = escrowObject.data.type;
            const match = type.match(
                /Escrow<(.+)::(\w+)::(\w+),\s*(.+)::(\w+)::(\w+)>/
            );
            if (match) {
                setAcceptDepositType(`${match[1]}::${match[2]}::${match[3]}`);
                setAcceptPaymentType(`${match[4]}::${match[5]}::${match[6]}`);
            }
        }
    }, [escrowObject]);

    // Auto-detect coin types for Cancel tab
    useEffect(() => {
        if (cancelEscrowObject?.data?.type) {
            const type = cancelEscrowObject.data.type;
            const match = type.match(
                /Escrow<(.+)::(\w+)::(\w+),\s*(.+)::(\w+)::(\w+)>/
            );
            if (match) {
                setCancelDepositType(`${match[1]}::${match[2]}::${match[3]}`);
                setCancelPaymentType(`${match[4]}::${match[5]}::${match[6]}`);
            }
        }
    }, [cancelEscrowObject]);

    const availableDepositCoins = useMemo(
        () => depositCoins?.data || [],
        [depositCoins?.data]
    );
    const availablePaymentCoins = useMemo(
        () => paymentCoins?.data || [],
        [paymentCoins?.data]
    );

    // Auto-select payment coin
    useEffect(() => {
        if (availablePaymentCoins.length > 0 && !acceptPaymentCoinId) {
            setAcceptPaymentCoinId(availablePaymentCoins[0].coinObjectId);
        }
    }, [availablePaymentCoins, acceptPaymentCoinId]);

    // Ensure deposit and payment coin types are different
    useEffect(() => {
        if (depositCoinType === paymentCoinType) {
            const differentCoin = coinTypes.find((c) => c.value !== depositCoinType);
            if (differentCoin) setPaymentCoinType(differentCoin.value);
        }
    }, [depositCoinType, paymentCoinType]);

    const handleCreate = () => {
        if (!account || !depositCoinId) return;
        const tx = new Transaction();
        const requestAmountInSmallestUnit = BigInt(
            Math.floor(Number(requestedAmount) * 1_000_000_000)
        );
        const depositAmountInSmallestUnit = BigInt(
            Math.floor(Number(depositAmount) * 1_000_000_000)
        );
        const [depositCoin] = tx.splitCoins(tx.object(depositCoinId), [
            tx.pure.u64(depositAmountInSmallestUnit),
        ]);
        tx.moveCall({
            target: `${PACKAGE_ID}::simple_escrow::create_escrow`,
            typeArguments: [depositCoinType, paymentCoinType],
            arguments: [depositCoin, tx.pure.u64(requestAmountInSmallestUnit)],
        });
        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: (result) => {
                    setTxDigest(result.digest);
                    setTxTitle("Escrow Created Successfully!");
                    setTxDescription(
                        `Your escrow has been created with ${requestedAmount} ${paymentCoinType.split("::")[1] || "Payment Coin"
                        } requested.`
                    );
                    setDialogOpen(true);
                    client.waitForTransaction({ digest: result.digest });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getBalance"] });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getCoins"] });
                },
                onError: (error) => console.error("Create failed:", error),
            }
        );
    };

    const handleAccept = () => {
        if (!account || !acceptEscrowId || !acceptPaymentCoinId) return;
        const tx = new Transaction();
        if (!escrowObject?.data?.content) return;
        const escrowContent = escrowObject.data.content;
        if (escrowContent.dataType !== "moveObject") return;
        const reqAmount = (escrowContent.fields as Record<string, unknown>)
            .requested_amount as string;
        const [paymentCoin] = tx.splitCoins(tx.object(acceptPaymentCoinId), [
            tx.pure.u64(reqAmount),
        ]);
        tx.moveCall({
            target: `${PACKAGE_ID}::simple_escrow::accept_escrow`,
            typeArguments: [acceptDepositType, acceptPaymentType],
            arguments: [tx.object(acceptEscrowId), paymentCoin],
        });
        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: (result) => {
                    setTxDigest(result.digest);
                    setTxTitle("Escrow Accepted Successfully!");
                    setTxDescription(
                        "You have accepted the escrow. The deposit has been sent to you and the payment to the seller."
                    );
                    setDialogOpen(true);
                    client.waitForTransaction({ digest: result.digest });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getBalance"] });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getCoins"] });
                    setAcceptEscrowId("");
                },
                onError: (error) => console.error("Accept failed:", error),
            }
        );
    };

    const handleCancel = () => {
        if (!account || !cancelEscrowId) return;
        const tx = new Transaction();
        tx.moveCall({
            target: `${PACKAGE_ID}::simple_escrow::cancel_escrow`,
            typeArguments: [cancelDepositType, cancelPaymentType],
            arguments: [tx.object(cancelEscrowId)],
        });
        signAndExecuteTransaction(
            { transaction: tx },
            {
                onSuccess: (result) => {
                    setTxDigest(result.digest);
                    setTxTitle("Escrow Cancelled Successfully!");
                    setTxDescription(
                        "You have cancelled the escrow and received your deposit back."
                    );
                    setDialogOpen(true);
                    client.waitForTransaction({ digest: result.digest });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getBalance"] });
                    queryClient.invalidateQueries({ queryKey: ["sui", "getCoins"] });
                },
                onError: (error) => console.error("Cancel failed:", error),
            }
        );
    };

    return (
        <>
            <TransactionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                digest={txDigest}
                title={txTitle}
                description={txDescription}
            />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ArrowLeftRight className="h-5 w-5" />
                        Escrow Manager
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="create" asChild>
                                <Button variant="noShadow">Create</Button>
                            </TabsTrigger>
                            <TabsTrigger value="accept" asChild>
                                <Button variant="noShadow">Accept</Button>
                            </TabsTrigger>
                            <TabsTrigger value="cancel" asChild>
                                <Button variant="noShadow">Cancel</Button>
                            </TabsTrigger>
                        </TabsList>

                        {/* ─── CREATE TAB ─── */}
                        <TabsContent value="create" className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Deposit Coin Type</label>
                                <select
                                    aria-label="Select deposit coin type"
                                    className="w-full p-2 border border-border rounded-md bg-background mt-1"
                                    value={isCustomDeposit ? "custom" : depositCoinType}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "custom") {
                                            setIsCustomDeposit(true);
                                            setDepositCoinType("");
                                        } else {
                                            setIsCustomDeposit(false);
                                            setDepositCoinType(value);
                                        }
                                        setDepositCoinId("");
                                    }}
                                >
                                    {coinTypes.map((coin) => (
                                        <option key={coin.value} value={coin.value}>
                                            {coin.label}
                                        </option>
                                    ))}
                                </select>
                                {isCustomDeposit && (
                                    <Input
                                        className="mt-2"
                                        placeholder="Enter custom coin type (e.g. 0x...::module::COIN)"
                                        value={depositCoinType}
                                        onChange={(e) => setDepositCoinType(e.target.value)}
                                    />
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Select Coin to Deposit</label>
                                {availableDepositCoins.length > 0 ? (
                                    <select
                                        aria-label="Select coin to deposit"
                                        className="w-full p-2 border border-border rounded-md bg-background mt-1"
                                        value={depositCoinId}
                                        onChange={(e) => {
                                            setDepositCoinId(e.target.value);
                                            const selectedCoin = availableDepositCoins.find(
                                                (c) => c.coinObjectId === e.target.value
                                            );
                                            if (selectedCoin) {
                                                const balance = (
                                                    Number(selectedCoin.balance) / 1_000_000_000
                                                ).toString();
                                                setDepositAmount(balance);
                                                setRequestedAmount(balance);
                                            }
                                        }}
                                    >
                                        <option value="">Select a coin</option>
                                        {availableDepositCoins.map((coin) => (
                                            <option key={coin.coinObjectId} value={coin.coinObjectId}>
                                                {coin.coinObjectId.slice(0, 6)}...
                                                {coin.coinObjectId.slice(-4)} -{" "}
                                                {(Number(coin.balance) / 1_000_000_000).toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-foreground/50 mt-1">
                                        No coins of this type in your wallet
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Deposit Amount</label>
                                <Input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => {
                                        setDepositAmount(e.target.value);
                                        setRequestedAmount(e.target.value);
                                    }}
                                    step="0.000000001"
                                    min="0"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Payment Coin Type (Requested)</label>
                                <select
                                    aria-label="Select payment coin type"
                                    className="w-full p-2 border border-border rounded-md bg-background mt-1"
                                    value={isCustomPayment ? "custom" : paymentCoinType}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "custom") {
                                            setIsCustomPayment(true);
                                            setPaymentCoinType("");
                                        } else {
                                            setIsCustomPayment(false);
                                            setPaymentCoinType(value);
                                        }
                                    }}
                                >
                                    {coinTypes.map((coin) => (
                                        <option
                                            key={coin.value}
                                            value={coin.value}
                                            disabled={
                                                coin.value !== "custom" && coin.value === depositCoinType
                                            }
                                        >
                                            {coin.label}
                                            {coin.value !== "custom" && coin.value === depositCoinType
                                                ? " (same as deposit)"
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                                {isCustomPayment && (
                                    <Input
                                        className="mt-2"
                                        placeholder="Enter custom coin type (e.g. 0x...::module::COIN)"
                                        value={paymentCoinType}
                                        onChange={(e) => setPaymentCoinType(e.target.value)}
                                    />
                                )}
                                {depositCoinType === paymentCoinType && (
                                    <p className="text-sm text-red-500 mt-1">
                                        ⚠️ Deposit and payment coin must be different
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium">Requested Amount (1:1 Match)</label>
                                <Input
                                    type="number"
                                    value={requestedAmount}
                                    readOnly
                                    disabled
                                    className="mt-1 bg-surface cursor-not-allowed"
                                    step="0.000000001"
                                    min="0"
                                />
                            </div>

                            <Button
                                onClick={handleCreate}
                                disabled={
                                    !account || !depositCoinId || depositCoinType === paymentCoinType
                                }
                                className="w-full"
                            >
                                Create Escrow
                            </Button>
                        </TabsContent>

                        {/* ─── ACCEPT TAB ─── */}
                        <TabsContent value="accept" className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Escrow Object ID</label>
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={acceptEscrowId}
                                    onChange={(e) => setAcceptEscrowId(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Deposit Coin Type (What you receive) — Auto-detected
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        coinTypes.find((c) => c.value === acceptDepositType)?.label ||
                                        acceptDepositType
                                    }
                                    disabled
                                    className="mt-1 bg-surface cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Payment Coin Type (What you pay) — Auto-detected
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        coinTypes.find((c) => c.value === acceptPaymentType)?.label ||
                                        acceptPaymentType
                                    }
                                    disabled
                                    className="mt-1 bg-surface cursor-not-allowed"
                                />
                            </div>

                            {escrowObject?.data?.content?.dataType === "moveObject" && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-surface rounded-lg border border-border">
                                    <div>
                                        <label className="text-xs font-medium text-foreground/50 uppercase">
                                            You Will Receive
                                        </label>
                                        <p className="text-lg font-bold text-accent-green mt-1">
                                            {(
                                                Number(
                                                    (
                                                        escrowObject.data.content.fields as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    ).deposit ||
                                                    (
                                                        (
                                                            escrowObject.data.content.fields as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        ).deposit as { fields: { value: string } }
                                                    )?.fields?.value ||
                                                    (
                                                        (
                                                            escrowObject.data.content.fields as Record<
                                                                string,
                                                                unknown
                                                            >
                                                        ).deposit as { fields: { balance: string } }
                                                    )?.fields?.balance ||
                                                    0
                                                ) / 1_000_000_000
                                            ).toFixed(2)}{" "}
                                            {coinTypes.find((c) => c.value === acceptDepositType)?.label ||
                                                "Coins"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-foreground/50 uppercase">
                                            You Will Pay
                                        </label>
                                        <p className="text-lg font-bold text-accent-red mt-1">
                                            {(
                                                Number(
                                                    (
                                                        escrowObject.data.content.fields as Record<
                                                            string,
                                                            unknown
                                                        >
                                                    ).requested_amount || 0
                                                ) / 1_000_000_000
                                            ).toFixed(2)}{" "}
                                            {coinTypes.find((c) => c.value === acceptPaymentType)?.label ||
                                                "Coins"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium">
                                    Selected Payment Coin — Auto-selected
                                </label>
                                {availablePaymentCoins.length > 0 ? (
                                    <Input
                                        type="text"
                                        value={
                                            acceptPaymentCoinId
                                                ? `${acceptPaymentCoinId.slice(0, 6)}...${acceptPaymentCoinId.slice(-4)} - ${(
                                                    Number(
                                                        availablePaymentCoins.find(
                                                            (c) => c.coinObjectId === acceptPaymentCoinId
                                                        )?.balance || 0
                                                    ) / 1_000_000_000
                                                ).toFixed(2)}`
                                                : "No coin selected"
                                        }
                                        disabled
                                        className="mt-1 bg-surface cursor-not-allowed"
                                    />
                                ) : (
                                    <p className="text-sm text-red-500 mt-1">
                                        ⚠️ No payment coins of this type in your wallet
                                    </p>
                                )}
                            </div>

                            {escrowObject?.data?.content?.dataType === "moveObject" &&
                                (escrowObject.data.content.fields as Record<string, unknown>)
                                    .creator === account?.address && (
                                    <p className="text-sm text-yellow-600 font-medium">
                                        ⚠️ Warning: You are the creator of this escrow. Accepting it
                                        means swapping with yourself.
                                    </p>
                                )}

                            <Button
                                onClick={handleAccept}
                                disabled={!account || !acceptEscrowId || !acceptPaymentCoinId}
                                className="w-full"
                            >
                                Accept Escrow
                            </Button>
                        </TabsContent>

                        {/* ─── CANCEL TAB ─── */}
                        <TabsContent value="cancel" className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Escrow Object ID</label>
                                <Input
                                    type="text"
                                    placeholder="0x..."
                                    value={cancelEscrowId}
                                    onChange={(e) => setCancelEscrowId(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Deposit Coin Type — Auto-detected
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        coinTypes.find((c) => c.value === cancelDepositType)?.label ||
                                        cancelDepositType
                                    }
                                    disabled
                                    className="mt-1 bg-surface cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">
                                    Payment Coin Type — Auto-detected
                                </label>
                                <Input
                                    type="text"
                                    value={
                                        coinTypes.find((c) => c.value === cancelPaymentType)?.label ||
                                        cancelPaymentType
                                    }
                                    disabled
                                    className="mt-1 bg-surface cursor-not-allowed"
                                />
                            </div>

                            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    ⚠️ Cancel escrow to get your deposit back. Only works if no
                                    buyer has paid yet.
                                </p>
                            </div>

                            <Button
                                onClick={handleCancel}
                                disabled={!account || !cancelEscrowId}
                                className="w-full"
                            >
                                Cancel Escrow
                            </Button>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </>
    );
}

export default EscrowManager;
