import { useState, useEffect } from 'react';
import { useCreateTransaction, useSetSessionIdReturn } from '../hooks/useQueries';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { TransactionType } from '../backend';

interface TransactionFormProps {
  investmentId: string;
  onSuccess?: () => void;
}

export default function TransactionForm({ investmentId, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.recharge);
  const [sessionId, setSessionId] = useState<string>('');
  const createTransaction = useCreateTransaction();
  const setSessionIdReturn = useSetSessionIdReturn();

  useEffect(() => {
    const initSession = async () => {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setSessionId(newSessionId);
      
      try {
        await setSessionIdReturn.mutateAsync({ id: newSessionId, nonce });
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };
    
    initSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!sessionId) {
      toast.error('Session not initialized');
      return;
    }

    try {
      const txnHash = `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const id = `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      await createTransaction.mutateAsync({
        id,
        investment_id: investmentId,
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        transaction_type: transactionType,
        txn_hash: txnHash,
        sessionId,
      });

      toast.success('Transaction created successfully');
      setAmount('');
      onSuccess?.();
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Transaction Type</Label>
        <Select
          value={transactionType}
          onValueChange={(value) => setTransactionType(value as TransactionType)}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TransactionType.recharge}>Recharge</SelectItem>
            <SelectItem value={TransactionType.invest}>Invest</SelectItem>
            <SelectItem value={TransactionType.returnFunds}>Return Funds</SelectItem>
            <SelectItem value={TransactionType.withdraw}>Withdraw</SelectItem>
            <SelectItem value={TransactionType.payout}>Payout</SelectItem>
            <SelectItem value={TransactionType.instantBuy}>Instant Buy</SelectItem>
            <SelectItem value={TransactionType.instantBuyReturn}>Instant Buy Return</SelectItem>
            <SelectItem value={TransactionType.arbitration}>Arbitration</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={createTransaction.isPending || !sessionId}>
        {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
      </Button>
    </form>
  );
}
