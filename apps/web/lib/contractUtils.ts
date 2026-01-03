import { ContractDTO } from '@repo/shared-types/contract';

export const CYCLE_LABELS: Record<ContractDTO['cycle'], string> = {
  MONTHLY: 'Monatlich',
  QUARTERLY: 'Vierteljährlich',
  HALF_YEARLY: 'Halbjährlich',
  YEARLY: 'Jährlich',
};

export const CYCLE_COLORS: Record<ContractDTO['cycle'], string> = {
  MONTHLY: 'bg-linear-to-r from-emerald-500 to-teal-500 text-white',
  QUARTERLY: 'bg-linear-to-r from-green-500 to-emerald-500 text-white',
  HALF_YEARLY: 'bg-linear-to-r from-teal-500 to-cyan-500 text-white',
  YEARLY: 'bg-linear-to-r from-lime-500 to-green-500 text-white',
};

export const CYCLE_ICONS: Record<ContractDTO['cycle'], string> = {
  MONTHLY: '📅',
  QUARTERLY: '📊',
  HALF_YEARLY: '📆',
  YEARLY: '🗓️',
};

export const CHART_COLORS = [
  '#10b981', // emerald
  '#14b8a6', // teal
  '#22c55e', // green
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#059669', // emerald-600
  '#0d9488', // teal-600
  '#16a34a', // green-600
];

export const CARD_COLORS = [
  'from-emerald-50 to-teal-50',
  'from-green-50 to-emerald-50',
  'from-teal-50 to-cyan-50',
  'from-lime-50 to-green-50',
  'from-cyan-50 to-sky-50',
  'from-emerald-50 to-green-50',
];

export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('de-DE');
}

export function calculateMonthlyAmount(
  price: number,
  cycle: ContractDTO['cycle'],
): number {
  switch (cycle) {
    case 'MONTHLY':
      return price;
    case 'QUARTERLY':
      return price / 3;
    case 'HALF_YEARLY':
      return price / 6;
    case 'YEARLY':
      return price / 12;
  }
}

export function convertAmount(
  monthlyAmount: number,
  targetCycle: ContractDTO['cycle'],
): number {
  switch (targetCycle) {
    case 'MONTHLY':
      return monthlyAmount;
    case 'QUARTERLY':
      return monthlyAmount * 3;
    case 'HALF_YEARLY':
      return monthlyAmount * 6;
    case 'YEARLY':
      return monthlyAmount * 12;
  }
}
