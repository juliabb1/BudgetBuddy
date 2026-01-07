import { CATEGORY_LABELS, ContractDTO } from '@repo/shared-types/contract';
import { useMemo, useState } from 'react';
import { calculateMonthlyAmount } from '../lib/contractUtils';

export interface CategoryData {
  category: string;
  monthlyAmount: number;
  annualAmount: number;
  [key: string]: string | number;
}

type FilterType = 'all' | 'active' | 'inactive';

export function useContractChart(contracts: ContractDTO[]) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      if (filter === 'active') return contract.isActive;
      if (filter === 'inactive') return !contract.isActive;
      return true;
    });
  }, [contracts, filter]);

  const categoryData = useMemo(() => {
    return filteredContracts.reduce((acc, contract) => {
      const monthlyAmount = calculateMonthlyAmount(
        Number(contract.price),
        contract.cycle,
      );

      const label = CATEGORY_LABELS[contract.category] || contract.category;

      const existingCategory = acc.find((item) => item.category === label);
      if (existingCategory) {
        existingCategory.monthlyAmount += monthlyAmount;
        existingCategory.annualAmount += monthlyAmount * 12;
      } else {
        acc.push({
          category: label,
          monthlyAmount,
          annualAmount: monthlyAmount * 12,
        });
      }

      return acc;
    }, [] as CategoryData[]);
  }, [filteredContracts]);

  const formatTooltipValue = (value: number): string => {
    return `${value.toFixed(2)} €`;
  };

  const formatPieLabel = (payload: CategoryData, percent: number): string => {
    return `${payload.category}: ${(percent * 100).toFixed(0)}%`;
  };

  const formatPieTooltip = (value: number): string => {
    return `${value.toFixed(2)} € / Monat`;
  };

  return {
    chartType,
    setChartType,
    filter,
    setFilter,
    filteredContracts,
    categoryData,
    formatTooltipValue,
    formatPieLabel,
    formatPieTooltip,
  };
}
