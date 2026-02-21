import { Transaction } from '../backend';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TransactionListProps {
  transactions: Transaction[];
  investmentName: string;
}

export default function TransactionList({ transactions, investmentName }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No transactions yet</p>
        <p className="text-sm mt-1">Add your first transaction to get started</p>
      </div>
    );
  }

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTransactionIcon = (type: string) => {
    const depositTypes = ['recharge', 'invest', 'payout'];
    if (depositTypes.includes(type)) {
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    }
    return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const amount = Number(transaction.amount);
          
          return (
            <div
              key={transaction.id}
              className="p-3 bg-muted/50 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type)}
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {formatTransactionType(transaction.transaction_type)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.id.substring(0, 20)}...
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-lg">
                  ${amount.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Nonce:</span>
                  <p className="font-mono truncate">{transaction.nonce || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Session Seq:</span>
                  <p className="font-mono">{Number(transaction.session_seq)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
