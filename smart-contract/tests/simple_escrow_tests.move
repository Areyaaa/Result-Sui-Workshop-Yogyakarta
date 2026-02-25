/// Tests for simple_escrow module
#[test_only]
module simple_escrow::simple_escrow_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::test_utils::assert_eq;
    use simple_escrow::simple_escrow::{Self, Escrow};

    // ─── Dummy coin types for testing ────────────────────────────────────────

    public struct COIN_A has drop {}
    public struct COIN_B has drop {}

    // ─── Helpers ─────────────────────────────────────────────────────────────

    fun mint_coin<T: drop>(
        witness: T,
        amount: u64,
        scenario: &mut Scenario,
    ): Coin<T> {
        let ctx = ts::ctx(scenario);
        coin::mint_for_testing<T>(amount, ctx)
    }

    // ─── Tests ────────────────────────────────────────────────────────────────

    #[test]
    fun test_create_escrow() {
        let seller = @0xA;
        let mut scenario = ts::begin(seller);

        {
            let deposit = mint_coin(COIN_A {}, 1_000_000_000, &mut scenario);
            simple_escrow::create_escrow<COIN_A, COIN_B>(
                deposit,
                500_000_000,
                ts::ctx(&mut scenario),
            );
        };

        ts::next_tx(&mut scenario, seller);
        {
            let escrow = ts::take_shared<Escrow<COIN_A, COIN_B>>(&scenario);
            assert_eq(simple_escrow::requested_amount(&escrow), 500_000_000);
            assert_eq(simple_escrow::creator(&escrow), seller);
            assert_eq(simple_escrow::deposit_value(&escrow), 1_000_000_000);
            ts::return_shared(escrow);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_accept_escrow() {
        let seller = @0xA;
        let buyer  = @0xB;
        let mut scenario = ts::begin(seller);

        // Seller creates escrow
        {
            let deposit = mint_coin(COIN_A {}, 1_000_000_000, &mut scenario);
            simple_escrow::create_escrow<COIN_A, COIN_B>(
                deposit,
                500_000_000,
                ts::ctx(&mut scenario),
            );
        };

        // Buyer accepts escrow
        ts::next_tx(&mut scenario, buyer);
        {
            let escrow = ts::take_shared<Escrow<COIN_A, COIN_B>>(&scenario);
            let payment = mint_coin(COIN_B {}, 500_000_000, &mut scenario);
            simple_escrow::accept_escrow(escrow, payment, ts::ctx(&mut scenario));
        };

        // Buyer should now have COIN_A
        ts::next_tx(&mut scenario, buyer);
        {
            let received = ts::take_from_sender<Coin<COIN_A>>(&scenario);
            assert_eq(coin::value(&received), 1_000_000_000);
            ts::return_to_sender(&scenario, received);
        };

        // Seller should now have COIN_B
        ts::next_tx(&mut scenario, seller);
        {
            let payment = ts::take_from_sender<Coin<COIN_B>>(&scenario);
            assert_eq(coin::value(&payment), 500_000_000);
            ts::return_to_sender(&scenario, payment);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_escrow() {
        let seller = @0xA;
        let mut scenario = ts::begin(seller);

        // Seller creates escrow
        {
            let deposit = mint_coin(COIN_A {}, 1_000_000_000, &mut scenario);
            simple_escrow::create_escrow<COIN_A, COIN_B>(
                deposit,
                500_000_000,
                ts::ctx(&mut scenario),
            );
        };

        // Seller cancels escrow
        ts::next_tx(&mut scenario, seller);
        {
            let escrow = ts::take_shared<Escrow<COIN_A, COIN_B>>(&scenario);
            simple_escrow::cancel_escrow(escrow, ts::ctx(&mut scenario));
        };

        // Seller should get deposit back
        ts::next_tx(&mut scenario, seller);
        {
            let returned = ts::take_from_sender<Coin<COIN_A>>(&scenario);
            assert_eq(coin::value(&returned), 1_000_000_000);
            ts::return_to_sender(&scenario, returned);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = simple_escrow::simple_escrow::ENotCreator)]
    fun test_cancel_escrow_not_creator_fails() {
        let seller  = @0xA;
        let attacker = @0xC;
        let mut scenario = ts::begin(seller);

        // Seller creates escrow
        {
            let deposit = mint_coin(COIN_A {}, 1_000_000_000, &mut scenario);
            simple_escrow::create_escrow<COIN_A, COIN_B>(
                deposit,
                500_000_000,
                ts::ctx(&mut scenario),
            );
        };

        // Attacker tries to cancel — should fail
        ts::next_tx(&mut scenario, attacker);
        {
            let escrow = ts::take_shared<Escrow<COIN_A, COIN_B>>(&scenario);
            simple_escrow::cancel_escrow(escrow, ts::ctx(&mut scenario));
        };

        ts::end(scenario);
    }
}
