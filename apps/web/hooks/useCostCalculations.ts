import {
  ContractDTO,
  Cycle,
  CYCLE_LABELS,
  CycleSchema,
} from '@repo/shared-types/contract';
import { Calendar, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  calculateMonthlyAmount,
  convertAmount,
  CYCLE_ICONS,
} from '../lib/contractUtils';

export interface TimeFrameData {
  id: ContractDTO['cycle'];
  label: string;
  amount: number;
  icon: typeof Calendar | typeof TrendingUp | typeof Wallet;
  gradient: string;
  bgLight: string;
  textColor: string;
}

export function useCostCalculations(contracts: ContractDTO[]) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<Cycle>(
    CycleSchema.parse('MONTHLY'),
  );

  const calculateTotal = useCallback(
    (timeFrame: ContractDTO['cycle']): number => {
      return contracts.reduce((total, contract) => {
        const price = Number(contract.price) || 0;
        const monthlyAmount = calculateMonthlyAmount(price, contract.cycle);
        return total + convertAmount(monthlyAmount, timeFrame);
      }, 0);
    },
    [contracts],
  );

  const monthlyTotal = useMemo(
    () => calculateTotal('MONTHLY'),
    [calculateTotal],
  );
  const quarterlyTotal = useMemo(
    () => calculateTotal('QUARTERLY'),
    [calculateTotal],
  );
  const halfYearlyTotal = useMemo(
    () => calculateTotal('HALF_YEARLY'),
    [calculateTotal],
  );
  const yearlyTotal = useMemo(() => calculateTotal('YEARLY'), [calculateTotal]);

  const timeFrameData: TimeFrameData[] = useMemo(
    () => [
      {
        id: 'MONTHLY' as ContractDTO['cycle'],
        label: CYCLE_LABELS.MONTHLY,
        amount: monthlyTotal,
        icon: Calendar,
        gradient: 'from-emerald-500 to-teal-500',
        bgLight: 'bg-emerald-50',
        textColor: 'text-emerald-600',
      },
      {
        id: 'QUARTERLY' as ContractDTO['cycle'],
        label: CYCLE_LABELS.QUARTERLY,
        amount: quarterlyTotal,
        icon: TrendingUp,
        gradient: 'from-green-500 to-emerald-500',
        bgLight: 'bg-green-50',
        textColor: 'text-green-600',
      },
      {
        id: 'HALF_YEARLY' as ContractDTO['cycle'],
        label: CYCLE_LABELS.HALF_YEARLY,
        amount: halfYearlyTotal,
        icon: TrendingUp,
        gradient: 'from-green-500 to-emerald-500',
        bgLight: 'bg-green-50',
        textColor: 'text-green-600',
      },
      {
        id: 'YEARLY' as ContractDTO['cycle'],
        label: CYCLE_LABELS.YEARLY,
        amount: yearlyTotal,
        icon: Wallet,
        gradient: 'from-teal-500 to-cyan-500',
        bgLight: 'bg-teal-50',
        textColor: 'text-teal-600',
      },
    ],
    [monthlyTotal, quarterlyTotal, halfYearlyTotal, yearlyTotal],
  );

  const getTimeFrameLabel = (timeFrame: ContractDTO['cycle']): string => {
    const icons: Record<ContractDTO['cycle'], string> = {
      MONTHLY: '📅',
      QUARTERLY: '📆',
      HALF_YEARLY: '📆',
      YEARLY: '🗓️',
    };
    return `${icons[timeFrame]} Pro ${CYCLE_LABELS[timeFrame].replace('lich', '')}`;
  };

  const calculateContractDisplay = (contract: ContractDTO) => {
    const price = Number(contract.price) || 0;
    const monthlyAmount = calculateMonthlyAmount(price, contract.cycle);
    const displayAmount = convertAmount(monthlyAmount, selectedTimeFrame);

    return {
      amount: displayAmount,
      cycle: contract.cycle,
      cycleIcon: CYCLE_ICONS[contract.cycle],
    };
  };

  const getContractKey = (contract: ContractDTO, index: number): string => {
    return contract.contractId || `contract-${index}`;
  };

  return {
    selectedTimeFrame,
    setSelectedTimeFrame,
    timeFrameData,
    monthlyTotal,
    getTimeFrameLabel,
    calculateContractDisplay,
    getContractKey,
  };
}
