import { useState } from 'react';
import { useCreateTransaction } from '../hooks/useQueries';
import { TransactionType } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface TransactionFormProps {
  investmentId: string;
  onSuccess?: () => void;
}

export default function TransactionForm({ investmentId, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.invest);
  const createTransaction = useCreateTransaction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      // Backend will generate nonce, session_seq, and should compute txn_hash
      // For now, we pass a placeholder hash until backend implements SHA-256
      const txnHash = 'PENDING_HASH';
      
      await createTransaction.mutateAsync({
        id,
        investmentId,
        amount: BigInt(Math.floor(amountNum)),
        transactionType,
        txnHash,
      });
      toast.success('Transaction created successfully!');
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transaction-type">Transaction Type</Label>
        <Select 
          value={transactionType} 
          onValueChange={(value) => setTransactionType(value as TransactionType)}
          disabled={createTransaction.isPending}
        >
          <SelectTrigger id="transaction-type">
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
        <Label htmlFor="transaction-amount">Amount ($)</Label>
        <Input
          id="transaction-amount"
          type="number"
          placeholder="e.g., 5000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={createTransaction.isPending}
          min="0"
          step="0.01"
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={createTransaction.isPending}
      >
        {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
      </Button>
    </form>
  );
}
