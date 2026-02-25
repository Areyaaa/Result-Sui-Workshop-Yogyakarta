/// Faucet — Allows users to claim test tokens once per minute.
///
/// Faucet Object ID: 0x4f5135f2706e1371adf34002e351c76d9c42d0b3a10c0a5dcc32e0f7605d48b0
module simple_escrow::faucet {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};

    // ─── Constants ────────────────────────────────────────────────────────────

    /// Amount to mint per claim: 10,000 tokens (9 decimals)
    const CLAIM_AMOUNT: u64 = 10_000_000_000_000;

    /// Cooldown period: 60 seconds in milliseconds
    const COOLDOWN_MS: u64 = 60_000;

    // ─── Errors ───────────────────────────────────────────────────────────────

    const ECooldownNotOver: u64 = 0;

    // ─── Structs ──────────────────────────────────────────────────────────────

    /// Shared faucet object that holds the treasury cap and tracks claim timestamps.
    public struct Faucet<phantom T> has key {
        id: UID,
        /// Last claim timestamps per address.
        last_claimed: Table<address, u64>,
    }

    // ─── Admin Functions ──────────────────────────────────────────────────────

    /// Initialize the faucet. Called once during deployment.
    public fun create<T>(ctx: &mut TxContext) {
        let faucet = Faucet<T> {
            id: object::new(ctx),
            last_claimed: table::new(ctx),
        };
        transfer::share_object(faucet);
    }

    // ─── Public Functions ─────────────────────────────────────────────────────

    /// Claim tokens from the faucet.
    /// Can only be called once per `COOLDOWN_MS` milliseconds per address.
    ///
    /// # Arguments
    /// * `faucet`   — The shared faucet object.
    /// * `treasury` — The treasury cap for minting.
    /// * `clock`    — SUI system clock (object ID: 0x6).
    public fun claim<T>(
        faucet: &mut Faucet<T>,
        treasury: &mut TreasuryCap<T>,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let sender = ctx.sender();
        let now = clock::timestamp_ms(clock);

        if (table::contains(&faucet.last_claimed, sender)) {
            let last = *table::borrow(&faucet.last_claimed, sender);
            assert!(now - last >= COOLDOWN_MS, ECooldownNotOver);
            *table::borrow_mut(&mut faucet.last_claimed, sender) = now;
        } else {
            table::add(&mut faucet.last_claimed, sender, now);
        };

        let minted: Coin<T> = coin::mint(treasury, CLAIM_AMOUNT, ctx);
        transfer::public_transfer(minted, sender);
    }
}
