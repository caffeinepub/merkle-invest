import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import LoginButton from './LoginButton';
import { TrendingUp, LayoutDashboard, Wallet, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Crowd-AI-Fund</h1>
              {userProfile && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Welcome, {userProfile.name}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {formatRole(userProfile.role)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {identity && userProfile && (
              <nav className="hidden md:flex items-center gap-2">
                <Button
                  variant={currentPath === '/' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: '/' })}
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={currentPath === '/investments' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: '/investments' })}
                  className="gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  Investments
                </Button>
                <Button
                  variant={currentPath === '/transactions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate({ to: '/transactions' })}
                  className="gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Transactions
                </Button>
              </nav>
            )}
            <LoginButton />
          </div>
        </div>
      </div>
    </header>
  );
}
