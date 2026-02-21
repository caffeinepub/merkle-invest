import { useState, useEffect } from 'react';
import { useCreateTransaction, useSetSessionIdReturn } from '../hooks/useQueries';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner';
import { TransactionType } from '../backend';
import { Info, ExternalLink } from 'lucide-react';

interface TransactionFormProps {
  investmentId: string;
  onSuccess?: () => void;
}

export default function TransactionForm({ investmentId, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.recharge);
  const [mode, setMode] = useState<string>('');
  const [txnIdNat, setTxnIdNat] = useState<string>('');
  const [txnIdText, setTxnIdText] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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

    if (!mode) {
      toast.error('Please select a payment mode');
      return;
    }

    if (!txnIdNat || parseInt(txnIdNat) < 0) {
      toast.error('Please enter a valid transaction ID (numeric)');
      return;
    }

    if (!sessionId) {
      toast.error('Session not initialized');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
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
        mode,
        txnIdNat: BigInt(txnIdNat),
        txnIdText: txnIdText.trim() || null,
      });

      toast.success('Transaction created successfully');
      setAmount('');
      setMode('');
      setTxnIdNat('');
      setTxnIdText('');
      setShowConfirmDialog(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Transaction creation error:', error);
      toast.error('Failed to create transaction: ' + (error.message || 'Unknown error'));
      setShowConfirmDialog(false);
    }
  };

  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <>
      <Alert className="mb-4 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertDescription className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
          <p className="font-semibold">Payment Verification Notice:</p>
          <p>
            After successful Deposit to Our UPI A/c: <span className="font-mono font-bold">secoin@uboi</span>, 
            Pl. verify the Trn ID by submitting details here & Send a Copy by Chat to{' '}
            <a 
              href="https://wa.me/919620058644" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline font-semibold"
            >
              WhatsApp <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <p>
            Include Crypto Deposits receipts as Txn ID after sending Ethereum on ERC20 Mainnet to Our Eth ID:{' '}
            <span className="font-mono font-bold break-all">0x4a100E184ac1f17491Fbbcf549CeBfB676694eF7</span>
          </p>
          <p className="font-semibold text-amber-800 dark:text-amber-300">
            Pl. Recheck & Verify if Details to be Submitted is Correct.
          </p>
        </AlertDescription>
      </Alert>

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
          <Label htmlFor="mode">Mode <span className="text-destructive">*</span></Label>
          <Select
            value={mode}
            onValueChange={setMode}
            required
          >
            <SelectTrigger id="mode">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GPay">GPay</SelectItem>
              <SelectItem value="Crypto">Crypto</SelectItem>
              <SelectItem value="CBDC">CBDC</SelectItem>
              <SelectItem value="Wallets">Wallets</SelectItem>
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

        <div className="space-y-2">
          <Label htmlFor="txnIdNat">Txn ID (Numeric) <span className="text-destructive">*</span></Label>
          <Input
            id="txnIdNat"
            type="number"
            min="0"
            step="1"
            placeholder="Enter numeric transaction ID"
            value={txnIdNat}
            onChange={(e) => setTxnIdNat(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="txnIdText">Txn ID (Text) <span className="text-muted-foreground text-xs">(Optional)</span></Label>
          <Input
            id="txnIdText"
            type="text"
            placeholder="Enter text transaction ID (optional)"
            value={txnIdText}
            onChange={(e) => setTxnIdText(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={createTransaction.isPending || !sessionId}>
          {createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
        </Button>
      </form>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Transaction Details</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="font-semibold text-foreground">Please verify all details before submitting:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Type:</span>
                  <span className="font-semibold text-foreground">{formatTransactionType(transactionType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <span className="font-semibold text-foreground">{mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold text-foreground">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Txn ID (Numeric):</span>
                  <span className="font-mono font-semibold text-foreground">{txnIdNat}</span>
                </div>
                {txnIdText && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Txn ID (Text):</span>
                    <span className="font-mono font-semibold text-foreground break-all">{txnIdText}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-semibold pt-2">
                Please ensure all information is correct before confirming.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={createTransaction.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={createTransaction.isPending}>
              {createTransaction.isPending ? 'Confirming...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
