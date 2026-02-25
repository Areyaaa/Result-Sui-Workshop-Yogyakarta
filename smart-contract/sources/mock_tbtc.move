/// Mock tBTC — Test token representing wrapped Bitcoin, used in the Simple Escrow workshop.
module simple_escrow::mock_tbtc {
    use sui::coin;

    public struct MOCK_TBTC has drop {}

    fun init(witness: MOCK_TBTC, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"MOCK_TBTC",
            b"Mock TBTC",
            b"A mock tBTC token for testing the Simple Escrow dApp.",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }
}
