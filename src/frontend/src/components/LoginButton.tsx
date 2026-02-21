import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useUpdateLatestSessionHashes } from '../hooks/useQueries';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const updateSessionHashes = useUpdateLatestSessionHashes();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  const disabled = isLoggingIn || updateSessionHashes.isPending;

  const handleAuth = async () => {
    if (isAuthenticated) {
      try {
        if (userProfile?.role === 'INVESTOR') {
          toast.info('Finalizing session...');
          const sessionId = `session_${Date.now()}`;
          const finalRootHash = `hash_${Date.now()}`;
          
          await updateSessionHashes.mutateAsync({
            user_id: identity.getPrincipal(),
            session_id: sessionId,
            finalRootHash,
            timestamp: BigInt(Date.now() * 1000000),
          });
          
          toast.success('Session finalized');
        }
        
        await clear();
        queryClient.clear();
        toast.success('Logged out successfully');
      } catch (error: any) {
        console.error('Logout error:', error);
        toast.error('Failed to logout: ' + (error.message || 'Unknown error'));
      }
    } else {
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Failed to login: ' + (error.message || 'Unknown error'));
        }
      }
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={disabled}
      variant={isAuthenticated ? 'outline' : 'default'}
      size="default"
    >
      {disabled ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isLoggingIn ? 'Logging in...' : 'Processing...'}
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
