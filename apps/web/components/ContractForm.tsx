import { ContractDTO, CreateContractDto } from '@repo/shared-types/contract';
import { Plus } from 'lucide-react';
import { useContractForm } from '../hooks/useContractForm';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type ContractFormData = CreateContractDto;

interface ContractFormProps {
  onAddContract: (contract: ContractFormData) => void;
}

export function ContractForm({ onAddContract }: ContractFormProps) {
  const {
    open,
    setOpen,
    name,
    setName,
    price,
    setPrice,
    cycle,
    setCycle,
    category,
    setCategory,
    setStartDate,
    formattedStartDate,
    handleSubmit,
  } = useContractForm(onAddContract);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="w-full md:w-auto bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />✨ Neuer Vertrag
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-linear-to-br from-emerald-50 to-teal-50">
        <DialogHeader>
          <DialogTitle className="h-6 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            📝 Neuen Vertrag hinzufügen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Vertragsname</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Kfz-Versicherung"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Betrag (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Zahlungsrhythmus</Label>
            <Select
              value={cycle}
              onValueChange={(value) => setCycle(value as ContractDTO['cycle'])}
            >
              <SelectTrigger id="frequency" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monatlich</SelectItem>
                <SelectItem value="QUARTERLY">Vierteljährlich</SelectItem>
                <SelectItem value="HALF_YEARLY">Halbjährlich</SelectItem>
                <SelectItem value="YEARLY">Jährlich</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as ContractDTO['category'])
              }
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Kategorie auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSURANCE">Versicherung</SelectItem>
                <SelectItem value="ENERGY">Energie</SelectItem>
                <SelectItem value="INTERNET">Internet</SelectItem>
                <SelectItem value="PHONE">Telefon</SelectItem>
                <SelectItem value="STREAMING">Streaming</SelectItem>
                <SelectItem value="FOOD">Lebensmittel</SelectItem>
                <SelectItem value="TRANSPORT">Transport</SelectItem>
                <SelectItem value="HEALTH">Gesundheit</SelectItem>
                <SelectItem value="EDUCATION">Bildung</SelectItem>
                <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
                <SelectItem value="OTHER">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Fälligkeitsdatum (optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formattedStartDate}
              onChange={(e) => setStartDate(new Date(e.target.value))}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="hover:border-emerald-300"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
