// Contract addresses
export const PACKAGE_ID =
    "0xfe02aaaf954b752272ea188d398e36d1d117d3641f4b90d21b2f0df3dfcf18a2";

export const FAUCET_ID =
    "0x4f5135f2706e1371adf34002e351c76d9c42d0b3a10c0a5dcc32e0f7605d48b0";

// Supported coin types
export const COIN_TYPES = [
    { value: "0x2::sui::SUI", label: "Sui" },
    {
        value: `${PACKAGE_ID}::mock_coin::MOCK_COIN`,
        label: "Mock Coin",
    },
    {
        value: `${PACKAGE_ID}::mock_tbtc::MOCK_TBTC`,
        label: "Mock TBTC",
    },
    {
        value: `${PACKAGE_ID}::mock_zsui::MOCK_ZSUI`,
        label: "Mock zSUI",
    },
    { value: "custom", label: "Custom Coin Type" },
] as const;

// Faucet coin configs
export const FAUCET_COIN_CONFIGS = {
    MOCK_COIN: {
        label: "Mock Coin",
        typeArg: `${PACKAGE_ID}::mock_coin::MOCK_COIN`,
    },
    MOCK_TBTC: {
        label: "Mock TBTC",
        typeArg: `${PACKAGE_ID}::mock_tbtc::MOCK_TBTC`,
    },
    MOCK_ZSUI: {
        label: "Mock zSUI",
        typeArg: `${PACKAGE_ID}::mock_zsui::MOCK_ZSUI`,
    },
} as const;

export type FaucetCoinType = keyof typeof FAUCET_COIN_CONFIGS;
