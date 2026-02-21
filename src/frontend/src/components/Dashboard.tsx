import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetAllInvestments, useGetCallerTransactions, useGetSessionTxnHashes } from '../hooks/useQueries';
import InvestmentCard from './InvestmentCard';
import InvestmentForm from './InvestmentForm';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Wallet, Receipt, User, Hash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: investments, isLoading: investmentsLoading } = useGetAllInvestments();
  const { data: transactions, isLoading: transactionsLoading } = useGetCallerTransactions();
  const { data: sessionHashes, isLoading: sessionHashesLoading } = useGetSessionTxnHashes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (investmentsLoading || transactionsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalInvestments = investments?.length || 0;
  const totalTransactions = transactions?.length || 0;
  const totalAmount = transactions?.reduce((sum, txn) => sum + Number(txn.amount), 0) || 0;

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Overview of your investment portfolio
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Investment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Investment</DialogTitle>
            </DialogHeader>
            <InvestmentForm onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {userProfile && (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{userProfile.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold">{userProfile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-semibold">{formatRole(userProfile.role)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/investments' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Wallet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalInvestments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view all investments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate({ to: '/transactions' })}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Click to view all transactions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all transactions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Session Transaction Hashes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionHashesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !sessionHashes || sessionHashes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transaction hashes in current session</p>
              <p className="text-sm mt-1">Create transactions to see them appear here (last 6)</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {sessionHashes.map((hash, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <code className="flex-1 text-xs font-mono break-all">{hash}</code>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Showing up to 6 most recent transaction hashes from your current session (oldest to newest)
          </p>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-2xl font-bold mb-4">Recent Investments</h3>
        {!investments || investments.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="pt-6">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No investments yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first investment to start tracking your portfolio
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Investment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Investment</DialogTitle>
                  </DialogHeader>
                  <InvestmentForm onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {investments.slice(0, 6).map((investment) => (
              <InvestmentCard key={investment.id} investment={investment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
