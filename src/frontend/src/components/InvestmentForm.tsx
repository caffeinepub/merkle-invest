import { useState } from 'react';
import { useCreateInvestment } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface InvestmentFormProps {
  onSuccess?: () => void;
}

export default function InvestmentForm({ onSuccess }: InvestmentFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createInvestment = useCreateInvestment();

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
        description: description.trim()
      });
      toast.success('Investment created successfully!');
      setName('');
      setDescription('');
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
