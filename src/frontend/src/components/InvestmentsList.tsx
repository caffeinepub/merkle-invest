import { useGetAllInvestments } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calendar } from 'lucide-react';

export default function InvestmentsList() {
  const { data: investments, isLoading } = useGetAllInvestments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading investments...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">All Investments</h2>
        <p className="text-muted-foreground mt-1">
          Complete list of investments in the platform
        </p>
      </div>

      {!investments || investments.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="pt-6">
            <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No investments found</h3>
            <p className="text-muted-foreground">
              There are no investments in the system yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <Card key={investment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  {investment.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {investment.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Investment ID</p>
                  <p className="text-xs font-mono truncate">{investment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Investor</p>
                  <p className="text-xs font-mono truncate">{investment.investor.toString()}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(investment.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
