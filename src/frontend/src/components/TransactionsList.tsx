import { useGetCallerTransactions } from '../hooks/useQueries';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TransactionsList() {
  const { data: transactions, isLoading } = useGetCallerTransactions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTransactionIcon = (type: string) => {
    const depositTypes = ['recharge', 'invest', 'payout'];
    if (depositTypes.includes(type)) {
      return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
    }
    return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">All Transactions</h2>
        <p className="text-muted-foreground mt-1">
          Complete list of your transactions with detailed information
        </p>
      </div>

      {!transactions || transactions.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="pt-6">
            <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
            <p className="text-muted-foreground">
              You haven't created any transactions yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Investment ID</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Txn Hash</TableHead>
                    <TableHead>Nonce</TableHead>
                    <TableHead className="text-right">Session Seq</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          <Badge variant="outline">
                            {formatTransactionType(transaction.transaction_type)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[150px] truncate">
                        {transaction.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[150px] truncate">
                        {transaction.investment_id}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${Number(transaction.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(transaction.timestamp)}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">
                        {transaction.txn_hash || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate">
                        {transaction.nonce || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(transaction.session_seq)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
