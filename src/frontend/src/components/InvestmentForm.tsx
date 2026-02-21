import { useState } from 'react';
import { useCreateInvestment, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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

export default function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [eProject, setEProject] = useState<string>('');
  const createInvestment = useCreateInvestment();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter an investment name');
      return;
    }

    try {
      const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await createInvestment.mutateAsync({
        id,
        name: name.trim(),
        description: description.trim(),
        eProject: eProject || null
      });
      toast.success('Investment created successfully!');
      setName('');
      setDescription('');
      setEProject('');
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
      {isAdmin && !isAdminLoading && (
        <div className="space-y-2">
          <Label htmlFor="e-project">Default Deposits on e-Projects (Admin Only)</Label>
          <Select
            value={eProject}
            onValueChange={setEProject}
            disabled={createInvestment.isPending}
          >
            <SelectTrigger id="e-project">
              <SelectValue placeholder="Select an e-project (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {E_PROJECTS.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button
        type="submit"
        className="w-full"
        disabled={createInvestment.isPending}
      >
        {createInvestment.isPending ? 'Creating...' : 'Create Investment'}
      </Button>
    </form>
  );
}
