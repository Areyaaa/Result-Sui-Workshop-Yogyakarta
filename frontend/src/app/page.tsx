"use client";

import { WalletGate } from "@/components/layout/WalletGate";
import { Balance } from "@/components/wallet/Balance";
import { EscrowManager } from "@/components/escrow/EscrowManager";
import { MyEscrowList } from "@/components/escrow/MyEscrowList";
import { Faucet } from "@/components/faucet/Faucet";

export default function HomePage() {
  return (
    <WalletGate>
      <div className="space-y-6 py-4">
        {/* Page Header */}
        <div className="border-b border-border pb-4">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-foreground/60 mt-1">
            Manage your escrows, check balances, and claim test tokens.
          </p>
        </div>

        {/* Balances */}
        <section>
          <Balance />
        </section>

        {/* Main Content - Escrow + Faucet side by side on large screens */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EscrowManager />
          <Faucet />
        </section>

        {/* My Escrows list full width */}
        <section>
          <MyEscrowList />
        </section>
      </div>
    </WalletGate>
  );
}
