import { ContractDTO, CreateContractDto } from '@repo/shared-types/contract';
import { useState } from 'react';

export function useContractForm(
  onAddContract: (contract: CreateContractDto) => void,
) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycleState, setCycleState] = useState<ContractDTO['cycle']>('MONTHLY');
  const [categoryState, setCategoryState] =
    useState<ContractDTO['category']>('INSURANCE');
  const [startDate, setStartDate] = useState<Date>(new Date());

  const setCycle = (value: string) => {
    setCycleState(value as ContractDTO['cycle']);
  };

  const setCategory = (value: string) => {
    setCategoryState(value as ContractDTO['category']);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setCycleState('MONTHLY');
    setCategoryState('INSURANCE');
    setStartDate(new Date());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !categoryState) {
      return;
    }

    onAddContract({
      name,
      price: parseFloat(price),
      cycle: cycleState,
      startDate,
      category: categoryState,
      debitDayOfMonth: 1,
      isActive: true,
    });

    resetForm();
    setOpen(false);
  };

  const formattedStartDate = startDate.toISOString().split('T')[0];

  const handleStartDateChange = (value: string) => {
    setStartDate(new Date(value));
  };

  return {
    open,
    setOpen,
    name,
    setName,
    price,
    setPrice,
    cycle: cycleState,
    setCycle,
    category: categoryState,
    setCategory,
    startDate,
    setStartDate,
    formattedStartDate,
    handleStartDateChange,
    handleSubmit,
  };
}
