import { useSuiClientQuery, useCurrentAccount } from "@mysten/dapp-kit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";
import { PACKAGE_ID } from "@/constants";

export function Balance() {
    const account = useCurrentAccount();

    // Native SUI balance
    const { data: suiData } = useSuiClientQuery(
        "getBalance",
        { owner: account?.address as string },
        { enabled: !!account }
    );

    // Mock Coin balance
    const { data: mockCoinData } = useSuiClientQuery(
        "getBalance",
        {
            owner: account?.address as string,
            coinType: `${PACKAGE_ID}::mock_coin::MOCK_COIN`,
        },
        { enabled: !!account }
    );

    // Mock TBTC balance
    const { data: mockTbtcData } = useSuiClientQuery(
        "getBalance",
        {
            owner: account?.address as string,
            coinType: `${PACKAGE_ID}::mock_tbtc::MOCK_TBTC`,
        },
        { enabled: !!account }
    );

    // Mock zSUI balance
    const { data: mockZsuiData } = useSuiClientQuery(
        "getBalance",
        {
            owner: account?.address as string,
            coinType: `${PACKAGE_ID}::mock_zsui::MOCK_ZSUI`,
        },
        { enabled: !!account }
    );

    const balances = [
        {
            label: "SUI",
            value: Number(suiData?.totalBalance ?? 0) / 1_000_000_000,
            color: "text-accent-cyan",
            bg: "bg-accent-cyan/10",
        },
        {
            label: "Mock Coin",
            value: Number(mockCoinData?.totalBalance ?? 0) / 1_000_000_000,
            color: "text-accent-pink",
            bg: "bg-accent-pink/10",
        },
        {
            label: "Mock TBTC",
            value: Number(mockTbtcData?.totalBalance ?? 0) / 1_000_000_000,
            color: "text-accent-orange",
            bg: "bg-accent-orange/10",
        },
        {
            label: "Mock zSUI",
            value: Number(mockZsuiData?.totalBalance ?? 0) / 1_000_000_000,
            color: "text-accent-green",
            bg: "bg-accent-green/10",
        },
    ];

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Coins className="h-5 w-5" />
                    My Balances
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {balances.map(({ label, value, color, bg }) => (
                        <div
                            key={label}
                            className={`rounded-lg border border-border p-3 ${bg}`}
                        >
                            <p className="text-xs font-medium text-foreground/60">{label}</p>
                            <p className={`text-lg font-bold mt-1 ${color}`}>
                                {value.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default Balance;
