import { ContractDTO, CreateContractDto } from '@repo/shared-types/contract';
import { useState } from 'react';

export function useContractForm(
  onAddContract: (contract: CreateContractDto) => void,
) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState<ContractDTO['cycle']>('MONTHLY');
  const [category, setCategory] =
    useState<ContractDTO['category']>('INSURANCE');
  const [startDate, setStartDate] = useState<Date>(new Date());

  const resetForm = () => {
    setName('');
    setPrice('');
    setCycle('MONTHLY');
    setCategory('INSURANCE');
    setStartDate(new Date());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !category) {
      return;
    }

    onAddContract({
      name,
      price: parseFloat(price),
      cycle,
      startDate,
      category,
      debitDayOfMonth: 1,
      isActive: true,
      documents: [],
    });

    resetForm();
    setOpen(false);
  };

  const formattedStartDate = startDate.toISOString().split('T')[0];

  return {
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
    startDate,
    setStartDate,
    formattedStartDate,
    handleSubmit,
  };
}
