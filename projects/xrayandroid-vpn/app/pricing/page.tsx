import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import PricingClient from "./PricingClient";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28">
        <div className="chip">Pricing</div>
        <h1 className="mt-6 text-4xl font-semibold text-white">Flexible plans for every route.</h1>
        <p className="mt-4 max-w-2xl text-base text-white/70">
          Compare Free, Premium, and Ultimate tiers. Mock checkout flows let you test
          billing, upgrades, and cancelation without leaving localhost.
        </p>
        <PricingClient />
      </main>
      <SiteFooter />
    </div>
  );
}
