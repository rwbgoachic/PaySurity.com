import { formatCurrency } from "@/hooks/use-wallet";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  CreditCard, 
  Wallet, 
  Landmark, 
  PiggyBank, 
  Heart,
  Users
} from "lucide-react";

interface Wallet {
  id: number;
  userId: number;
  balance: string;
  walletType: string;
  isMain: boolean;
  createdAt: string;
}

interface WalletSelectorProps {
  wallets: Wallet[];
  selectedWalletId: number | null;
  onSelectWallet: (walletId: number) => void;
}

export function WalletSelector({ 
  wallets, 
  selectedWalletId, 
  onSelectWallet 
}: WalletSelectorProps) {
  // Function to get appropriate icon based on wallet type
  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'main':
        return <CreditCard className="h-5 w-5" />;
      case 'expense':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'hsa':
        return <Heart className="h-5 w-5" />;
      case 'retirement':
        return <Landmark className="h-5 w-5" />;
      case 'child':
        return <Users className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex space-x-4 py-2">
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className={`flex-shrink-0 w-64 cursor-pointer transition-all hover:shadow-md ${
              selectedWalletId === wallet.id 
                ? 'border-primary ring-1 ring-primary' 
                : 'border-border'
            }`}
            onClick={() => onSelectWallet(wallet.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className={`mr-3 flex items-center justify-center rounded-full w-8 h-8 ${
                    wallet.isMain ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {getWalletIcon(wallet.walletType)}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm capitalize">
                      {wallet.isMain ? 'Main ' : ''}
                      {wallet.walletType.replace('_', ' ')} Wallet
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(wallet.balance)}
                    </p>
                  </div>
                </div>
                {wallet.isMain && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    Main
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}