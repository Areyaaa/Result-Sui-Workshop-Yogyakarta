/// Mock Coin — Test token used in the Simple Escrow workshop.
module simple_escrow::mock_coin {
    use sui::coin;

    public struct MOCK_COIN has drop {}

    fun init(witness: MOCK_COIN, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"MOCK",
            b"Mock Coin",
            b"A mock coin for testing the Simple Escrow dApp.",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }
}
