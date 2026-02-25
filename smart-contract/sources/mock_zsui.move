/// Mock zSUI — Test token representing a staked SUI derivative, used in the Simple Escrow workshop.
module simple_escrow::mock_zsui {
    use sui::coin;

    public struct MOCK_ZSUI has drop {}

    fun init(witness: MOCK_ZSUI, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"MOCK_ZSUI",
            b"Mock zSUI",
            b"A mock zSUI token for testing the Simple Escrow dApp.",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }
}
