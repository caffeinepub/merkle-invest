import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetInvestmentList, useGetSessionTxnHashes, useGetLatestSessionHashes } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import InvestmentCard from './InvestmentCard';
import InvestmentForm from './InvestmentForm';
import { Wallet, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export default function Dashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: investments = [], isLoading: investmentsLoading } = useGetInvestmentList(identity?.getPrincipal() || null);
  const { data: sessionHashes = [] } = useGetSessionTxnHashes();
  const { data: latestSessionState } = useGetLatestSessionHashes();

  const totalInvestments = investments.length;
  const totalTransactions = investments.reduce((sum, inv) => sum + (inv.created_at ? 1 : 0), 0);

  const isInvestor = userProfile?.role === 'INVESTOR';

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, {userProfile?.name || 'User'}</p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2">
          {userProfile?.role || 'USER'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvestments}</div>
            <p className="text-xs text-muted-foreground">Active investment portfolios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Recorded transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Buffer</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionHashes.length}</div>
            <p className="text-xs text-muted-foreground">Pending transaction hashes</p>
          </CardContent>
        </Card>
      </div>

      {isInvestor && (
        <Card>
          <CardHeader>
            <CardTitle>Integrity & Session State</CardTitle>
            <CardDescription>Current session buffer and last saved state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Session Buffer (up to 6 hashes)</h3>
              {sessionHashes.length > 0 ? (
                <div className="space-y-2">
                  {sessionHashes.map((hash, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono text-xs">
                        {index + 1}
                      </Badge>
                      <code className="flex-1 bg-muted px-3 py-1 rounded text-xs break-all">
                        {hash}
                      </code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transaction hashes in buffer</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Last SessionState Record</h3>
              {latestSessionState ? (
                <div className="space-y-2 bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Session ID</p>
                      <code className="text-xs break-all">{latestSessionState.session_id}</code>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Timestamp</p>
                      <code className="text-xs">
                        {new Date(Number(latestSessionState.timestamp) / 1000000).toLocaleString()}
                      </code>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Final Root Hash</p>
                    <code className="text-xs break-all block bg-background p-2 rounded">
                      {latestSessionState.finalRootHash}
                    </code>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No session state saved yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create New Investment</CardTitle>
          <CardDescription>Add a new investment to your portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <InvestmentForm />
        </CardContent>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Investments</h2>
          <button
            onClick={() => navigate({ to: '/investments' })}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </div>

        {investmentsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : investments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No investments yet. Create your first investment above.</p>
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
