/// Simple Escrow — Peer-to-peer token swap using on-chain escrow.
///
/// Flow:
///   1. Seller calls `create_escrow` — deposits Coin<D> and specifies how much Coin<P> they want.
///   2. Buyer calls `accept_escrow`  — pays Coin<P>, receives Coin<D>. Seller receives Coin<P>.
///   3. Seller calls `cancel_escrow` — gets their Coin<D> back (only if not yet accepted).
///
/// Deployed on: SUI Testnet
/// Package ID : 0xfe02aaaf954b752272ea188d398e36d1d117d3641f4b90d21b2f0df3dfcf18a2
module simple_escrow::simple_escrow {

    use sui::coin::{Self, Coin};

    // ─── Errors ───────────────────────────────────────────────────────────────

    const ENotCreator: u64 = 0;

    // ─── Structs ──────────────────────────────────────────────────────────────

    /// An on-chain escrow object.
    /// Holds a Coin<D> (deposit) and records how much Coin<P> (payment) is requested.
    public struct Escrow<phantom D, phantom P> has key, store {
        id: UID,
        /// Address of the escrow creator (seller).
        creator: address,
        /// The deposited coin that the buyer will receive.
        deposit: Coin<D>,
        /// The amount of Coin<P> the seller wants in return.
        requested_amount: u64,
    }

    // ─── Public Functions ─────────────────────────────────────────────────────

    /// Create a new escrow.
    ///
    /// # Arguments
    /// * `deposit`          — Coin<D> to lock in the escrow.
    /// * `requested_amount` — Amount of Coin<P> the creator wants in return.
    public fun create_escrow<D, P>(
        deposit: Coin<D>,
        requested_amount: u64,
        ctx: &mut TxContext,
    ) {
        let escrow = Escrow<D, P> {
            id: object::new(ctx),
            creator: ctx.sender(),
            deposit,
            requested_amount,
        };
        transfer::share_object(escrow);
    }

    /// Accept an existing escrow.
    /// The caller pays `escrow.requested_amount` of Coin<P> and receives Coin<D>.
    /// The creator receives Coin<P>.
    ///
    /// # Arguments
    /// * `escrow`       — The shared escrow object.
    /// * `payment_coin` — Coin<P> split to exactly `requested_amount`.
    public fun accept_escrow<D, P>(
        escrow: Escrow<D, P>,
        payment_coin: Coin<P>,
        ctx: &mut TxContext,
    ) {
        let Escrow { id, creator, deposit, requested_amount: _ } = escrow;
        object::delete(id);

        // Transfer deposit (Coin<D>) to the buyer (caller)
        transfer::public_transfer(deposit, ctx.sender());

        // Transfer payment (Coin<P>) to the seller (original creator)
        transfer::public_transfer(payment_coin, creator);
    }

    /// Cancel an escrow and return the deposit to the creator.
    /// Only the original creator can cancel.
    ///
    /// # Arguments
    /// * `escrow` — The shared escrow object to cancel.
    public fun cancel_escrow<D, P>(
        escrow: Escrow<D, P>,
        ctx: &mut TxContext,
    ) {
        assert!(escrow.creator == ctx.sender(), ENotCreator);

        let Escrow { id, creator, deposit, requested_amount: _ } = escrow;
        object::delete(id);

        // Return deposit to the creator
        transfer::public_transfer(deposit, creator);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /// Returns the creator address of the escrow.
    public fun creator<D, P>(escrow: &Escrow<D, P>): address {
        escrow.creator
    }

    /// Returns the requested payment amount.
    public fun requested_amount<D, P>(escrow: &Escrow<D, P>): u64 {
        escrow.requested_amount
    }

    /// Returns the balance of the deposited coin.
    public fun deposit_value<D, P>(escrow: &Escrow<D, P>): u64 {
        coin::value(&escrow.deposit)
    }
}
