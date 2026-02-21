import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import InvestmentsList from './components/InvestmentsList';
import TransactionsList from './components/TransactionsList';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginButton from './components/LoginButton';
import { Toaster } from '@/components/ui/sonner';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <h1 className="text-4xl font-bold mb-4">Crowd-AI-Fund</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Secure investment tracking and management on the Internet Computer
      </p>
      <LoginButton />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
});

const investmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/investments',
  component: InvestmentsList,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsList,
});

const routeTree = rootRoute.addChildren([indexRoute, investmentsRoute, transactionsRoute]);

const router = createRouter({ routeTree });

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <LoginScreen />
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <ProfileSetup />
        </main>
        <Footer />
        <Toaster />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
