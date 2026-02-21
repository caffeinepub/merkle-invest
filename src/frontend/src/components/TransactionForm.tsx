import { useState } from 'react';
import { useCreateTransaction, useSetSessionIdReturn } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Info, MessageCircle } from 'lucide-react';

interface TransactionFormProps {
  investmentId: string;
  onSuccess?: () => void;
}

const TRANSACTION_TYPES = [
  { value: 'recharge', label: 'Recharge' },
  { value: 'invest', label: 'Invest' },
  { value: 'returnFunds', label: 'Return Funds' },
  { value: 'withdraw', label: 'Withdraw' },
  { value: 'payout', label: 'Payout' },
  { value: 'instantBuy', label: 'Instant Buy' },
  { value: 'instantBuyReturn', label: 'Instant Buy Return' },
  { value: 'arbitration', label: 'Arbitration' },
];

const PAYMENT_MODES = [
  "GPay", "PhonePe", "Paytm", "UPI", "Bank Transfer", 
  "Credit Card", "Debit Card", "Net Banking", "Crypto", 
  "CBDC", "Wallets", "Cash", "Cheque", "NEFT", "RTGS", 
  "IMPS", "PayPal", "Stripe", "Razorpay", "Other"
];

export default function TransactionForm({ investmentId, onSuccess }: TransactionFormProps) {
  const { identity } = useInternetIdentity();
  const [transactionType, setTransactionType] = useState('');
  const [mode, setMode] = useState('');
  const [amount, setAmount] = useState('');
  const [txnIdNat, setTxnIdNat] = useState('');
  const [txnIdText, setTxnIdText] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const createTransaction = useCreateTransaction();
  const setSessionIdReturn = useSetSessionIdReturn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create transactions');
      return;
    }

    if (!transactionType) {
      toast.error('Please select a transaction type');
      return;
    }

    if (!mode) {
      toast.error('Please select a payment mode');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!txnIdNat.trim()) {
      toast.error('Please enter a transaction ID (Nat)');
      return;
    }

    const txnIdNatValue = parseInt(txnIdNat, 10);
    if (isNaN(txnIdNatValue) || txnIdNatValue < 0) {
      toast.error('Transaction ID (Nat) must be a valid positive number');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    try {
      const id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionId = `session_${Date.now()}`;
      const nonce = `nonce_${Math.random().toString(36).substr(2, 16)}`;
      const txn_hash = `hash_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;

      await setSessionIdReturn.mutateAsync({ id: sessionId, nonce });

      await createTransaction.mutateAsync({
        id,
        investment_id: investmentId,
        amount: BigInt(Math.floor(parseFloat(amount) * 100)),
        transaction_type: transactionType,
        txn_hash,
        sessionId,
        mode,
        txnIdNat: BigInt(parseInt(txnIdNat, 10)),
        txnIdText: txnIdText.trim() || null,
      });

      toast.success('Transaction created successfully!');
      setTransactionType('');
      setMode('');
      setAmount('');
      setTxnIdNat('');
      setTxnIdText('');
      setShowConfirmDialog(false);
      onSuccess?.();
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction. Please try again.');
      setShowConfirmDialog(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-type">Transaction Type</Label>
          <Select
            value={transactionType}
            onValueChange={setTransactionType}
            disabled={createTransaction.isPending}
            required
          >
            <SelectTrigger id="transaction-type">
              <SelectValue placeholder="Select transaction type" />
            </SelectTrigger>
            <SelectContent>
              {TRANSACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mode">Payment Mode <span className="text-destructive">*</span></Label>
          <Select
            value={mode}
            onValueChange={setMode}
            disabled={createTransaction.isPending}
            required
          >
            <SelectTrigger id="mode">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((paymentMode) => (
                <SelectItem key={paymentMode} value={paymentMode}>
                  {paymentMode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={createTransaction.isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="txn-id-nat">Transaction ID (Nat) <span className="text-destructive">*</span></Label>
          <Input
            id="txn-id-nat"
            type="number"
            min="0"
            step="1"
            placeholder="Enter numeric transaction ID"
            value={txnIdNat}
            onChange={(e) => setTxnIdNat(e.target.value)}
            disabled={createTransaction.isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="txn-id-text">Transaction ID (String) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <Input
            id="txn-id-text"
            type="text"
            placeholder="Enter text transaction ID (optional)"
            value={txnIdText}
            onChange={(e) => setTxnIdText(e.target.value)}
            disabled={createTransaction.isPending}
          />
        </div>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">Payment Verification Notice</p>
                <div className="space-y-1 text-blue-800 dark:text-blue-200">
                  <p><span className="font-medium">UPI ID:</span> secoin@uboi</p>
                  <p className="flex items-center gap-2">
                    <span className="font-medium">WhatsApp:</span>
                    <a 
                      href="https://wa.me/919620058644" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />
                      +91 96200 58644
                    </a>
                  </p>
                  <p><span className="font-medium">Ethereum:</span> 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={createTransaction.isPending || !identity}
        >
          Create Transaction
        </Button>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction Details</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>Please review your transaction details before confirming:</p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span>{TRANSACTION_TYPES.find(t => t.value === transactionType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Mode:</span>
                    <span>{mode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Txn ID (Nat):</span>
                    <span>{txnIdNat}</span>
                  </div>
                  {txnIdText && (
                    <div className="flex justify-between">
                      <span className="font-medium">Txn ID (Text):</span>
                      <span className="truncate ml-2">{txnIdText}</span>
                    </div>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createTransaction.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
