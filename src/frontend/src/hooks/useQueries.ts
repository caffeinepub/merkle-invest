import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile, Investment, Transaction, TransactionType } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Investment Queries
export function useGetAllInvestments() {
  const { actor, isFetching } = useActor();

  return useQuery<Investment[]>({
    queryKey: ['allInvestments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvestments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvestment(id, name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allInvestments'] });
    },
  });
}

// Transaction Queries
export function useGetInvestmentTransactions(investmentId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['transactions', investmentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInvestmentTransactions(investmentId);
    },
    enabled: !!actor && !isFetching && !!investmentId,
  });
}

export function useGetCallerTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['callerTransactions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCallerTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSessionTxnHashes() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['sessionTxnHashes'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionTxnHashes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      investmentId, 
      amount, 
      transactionType, 
      txnHash,
    }: { 
      id: string; 
      investmentId: string; 
      amount: bigint;
      transactionType: TransactionType;
      txnHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend automatically generates nonce and session_seq
      // txnHash should be computed by backend but currently needs to be passed
      return actor.createTransaction(id, investmentId, amount, transactionType, txnHash);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.investmentId] });
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['allInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['sessionTxnHashes'] });
    },
  });
}
