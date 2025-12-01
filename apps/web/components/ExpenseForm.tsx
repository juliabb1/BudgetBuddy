import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus } from 'lucide-react';
import { Expense } from '@web/app/page';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseForm({ onAddExpense }: ExpenseFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Expense['frequency']>('monthly');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount || !category) {
      return;
    }

    onAddExpense({
      name,
      amount: parseFloat(amount),
      frequency,
      category,
      dueDate: dueDate || undefined,
      documents: []
    });

    // Reset form
    setName('');
    setAmount('');
    setFrequency('monthly');
    setCategory('');
    setDueDate('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full md:w-auto bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow-md transition-all">
          <Plus className="w-5 h-5 mr-2" />
          ✨ Neuer Vertrag
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-linear-to-br from-emerald-50 to-teal-50">
        <DialogHeader>
          <DialogTitle className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            📝 Neuen Vertrag hinzufügen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Vertragsname</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Kfz-Versicherung"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Betrag (€)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="frequency">Zahlungsrhythmus</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as Expense['frequency'])}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                <SelectItem value="semi-annually">Halbjährlich</SelectItem>
                <SelectItem value="annually">Jährlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="z.B. Versicherung"
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Fälligkeitsdatum (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="hover:border-emerald-300">
              Abbrechen
            </Button>
            <Button type="submit" className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}