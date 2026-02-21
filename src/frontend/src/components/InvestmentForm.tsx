import { useState } from 'react';
import { useCreateInvestment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Info, MessageCircle } from 'lucide-react';

interface InvestmentFormProps {
  onSuccess?: () => void;
}

const E_PROJECTS = [
  "e-contract-lwf",
  "e-contracts-bqe",
  "etutorial-lgc",
  "etutorials-cso",
  "evolved-ai-o6e",
  "forms-sxn",
  "geo-map-w9s",
  "golden-sec-vri",
  "ia-niqaw-947",
  "icp-cloud-storage-hvk",
  "infi-loop-1au",
  "infytask-mia",
  "ipfs-lrm",
  "key-unlock-5hx",
  "map-56b",
  "moap-app-6ag",
  "multi-apps-unify-app-hbc",
  "n8n-tasks-c2i",
  "n8n-workflows-6sy",
  "networth-htm",
  "op-hotels-rests-ae0",
  "pvt-projects-7wo",
  "sec-build-0bj",
  "sec-epay-am0",
  "sec-jewelry-j03",
  "secoin-ep6",
  "sitemap-hub-fe2",
  "sitemap-hub-sy0",
  "sitemap-nya",
  "sitemap-subs-app-j3h",
  "sitemaps-fwh",
  "sudeep-hotels-eu8",
  "terror-uproot-97d",
  "trends-63c",
  "trends-d1l",
  "voice-invoice-au1",
  "xcaller-0aw",
  "yo-data-app-o7u"
];

const PAYMENT_MODES = ["GPay", "Crypto", "CBDC", "Wallets"];

export default function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eProject, setEProject] = useState<string>('');
  const [mode, setMode] = useState<string>('');
  const [txnIdNat, setTxnIdNat] = useState<string>('');
  const [txnIdText, setTxnIdText] = useState<string>('');
  const createInvestment = useCreateInvestment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identity) {
      toast.error('Please log in to create investments');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter an investment name');
      return;
    }

    if (!eProject) {
      toast.error('Please select an e-project');
      return;
    }

    if (!mode) {
      toast.error('Please select a payment mode');
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

    try {
      const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await createInvestment.mutateAsync({
        id,
        name: name.trim(),
        description: description.trim(),
        eProject: eProject,
        mode: mode,
        txnIdNat: BigInt(txnIdNatValue),
        txnIdText: txnIdText.trim() || null
      });
      toast.success('Investment created successfully!');
      setName('');
      setDescription('');
      setEProject('');
      setMode('');
      setTxnIdNat('');
      setTxnIdText('');
      onSuccess?.();
    } catch (error) {
      console.error('Investment creation error:', error);
      toast.error('Failed to create investment. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="investment-name">Investment Name</Label>
        <Input
          id="investment-name"
          type="text"
          placeholder="e.g., Tech Stocks, Real Estate"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={createInvestment.isPending}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="investment-description">Description</Label>
        <Textarea
          id="investment-description"
          placeholder="Describe your investment..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={createInvestment.isPending}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="e-project">E-Project <span className="text-destructive">*</span></Label>
        <Select
          value={eProject}
          onValueChange={setEProject}
          disabled={createInvestment.isPending}
          required
        >
          <SelectTrigger id="e-project">
            <SelectValue placeholder="Select an e-project" />
          </SelectTrigger>
          <SelectContent>
            {E_PROJECTS.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mode">Mode <span className="text-destructive">*</span></Label>
        <Select
          value={mode}
          onValueChange={setMode}
          disabled={createInvestment.isPending}
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
        <Label htmlFor="txn-id-nat">Transaction ID (Nat) <span className="text-destructive">*</span></Label>
        <Input
          id="txn-id-nat"
          type="number"
          min="0"
          step="1"
          placeholder="Enter numeric transaction ID"
          value={txnIdNat}
          onChange={(e) => setTxnIdNat(e.target.value)}
          disabled={createInvestment.isPending}
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
          disabled={createInvestment.isPending}
        />
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">Payment Information</p>
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
        disabled={createInvestment.isPending || !identity}
      >
        {createInvestment.isPending ? 'Creating...' : 'Create Investment'}
      </Button>
    </form>
  );
}
