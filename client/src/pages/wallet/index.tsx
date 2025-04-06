import { WalletLayout } from "@/components/layout/wallet-layout";
import { WalletDashboard } from "@/components/wallet/wallet-dashboard";
import { MetaTags } from "@/components/seo";

export default function WalletIndexPage() {
  return (
    <WalletLayout>
      <MetaTags 
        title="Digital Wallet Dashboard | PaySurity"
        description="Manage your digital wallets, track transactions, and control your finances with PaySurity's secure digital wallet system."
        canonicalUrl="/wallet"
        keywords="digital wallet, financial management, secure payments, transaction tracking, expense management"
      />
      <WalletDashboard />
    </WalletLayout>
  );
}