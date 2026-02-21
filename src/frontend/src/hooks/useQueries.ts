import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Investment, Transaction, SessionState, ResourcesPageContent, Resource } from '../backend';
import { Principal } from '@dfinity/principal';

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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllInvestments() {
  const { actor, isFetching } = useActor();

  return useQuery<Investment[]>({
    queryKey: ['investments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvestments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetInvestmentList(principal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Investment[]>({
    queryKey: ['investmentList', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getInvestmentList(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateInvestment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      name, 
      description, 
      eProject,
      mode,
      txnIdNat,
      txnIdText
    }: { 
      id: string; 
      name: string; 
      description: string;
      eProject: string | null;
      mode: string;
      txnIdNat: bigint;
      txnIdText?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInvestment(
        id, 
        name, 
        description, 
        eProject, 
        mode, 
        txnIdNat, 
        txnIdText || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investmentList'] });
    },
  });
}

export function useGetInvestmentTransactions(investmentId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['investmentTransactions', investmentId],
    queryFn: async () => {
      if (!actor || !investmentId) return [];
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

export function useCreateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      investment_id,
      amount,
      transaction_type,
      txn_hash,
      sessionId,
      mode,
      txnIdNat,
      txnIdText,
    }: {
      id: string;
      investment_id: string;
      amount: bigint;
      transaction_type: any;
      txn_hash: string;
      sessionId: string;
      mode: string;
      txnIdNat: bigint;
      txnIdText?: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createTransaction(
        id, 
        investment_id, 
        amount, 
        transaction_type, 
        txn_hash, 
        sessionId, 
        mode, 
        txnIdNat, 
        txnIdText || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investmentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['callerTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['sessionTxnHashes'] });
    },
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

export function useGetLatestSessionHashes() {
  const { actor, isFetching } = useActor();

  return useQuery<SessionState | null>({
    queryKey: ['latestSessionHashes'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getLatestSessionHashes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateLatestSessionHashes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionState: SessionState) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateLatestSessionHashes(sessionState);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestSessionHashes'] });
    },
  });
}

export function useGetSessionIdReturn() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['sessionIdReturn'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSessionIdReturn(null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSessionIdReturn() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, nonce }: { id: string; nonce: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setSessionIdReturn(id, nonce);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionIdReturn'] });
    },
  });
}

export function useGetResourcesPageContent() {
  const { actor, isFetching } = useActor();

  return useQuery<ResourcesPageContent>({
    queryKey: ['resourcesPageContent'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getResourcesPageContent();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetResource(id: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Resource | null>({
    queryKey: ['resource', id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getResource(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}
