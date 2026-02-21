import { useState } from 'react';
import { Investment } from '../backend';
import { useGetInvestmentTransactions } from '../hooks/useQueries';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wallet, Calendar } from 'lucide-react';

interface InvestmentCardProps {
  investment: Investment;
}

export default function InvestmentCard({ investment }: InvestmentCardProps) {
  const { data: transactions, isLoading } = useGetInvestmentTransactions(investment.id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const transactionTotal = transactions?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{investment.name}</span>
          <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
        </CardTitle>
        {investment.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {investment.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">${transactionTotal.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(investment.created_at)}</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2" variant="outline">
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Transaction for {investment.name}</DialogTitle>
                </DialogHeader>
                <TransactionForm
                  investmentId={investment.id}
                  onSuccess={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <TransactionList transactions={transactions || []} investmentName={investment.name} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
