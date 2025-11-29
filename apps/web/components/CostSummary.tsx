import { useState } from 'react';
import { Card } from './ui/card';
import { TrendingUp, Calendar, Wallet } from 'lucide-react';
import { Expense } from '@web/app/page';

interface CostSummaryProps {
  expenses: Expense[];
}

type TimeFrame = 'monthly' | 'semi-annually' | 'annually';

export function CostSummary({ expenses }: CostSummaryProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('monthly');

  const calculateTotal = (timeFrame: TimeFrame): number => {
    return expenses.reduce((total, expense) => {
      let monthlyAmount = 0;
      
      switch (expense.frequency) {
        case 'monthly':
          monthlyAmount = expense.amount;
          break;
        case 'quarterly':
          monthlyAmount = expense.amount / 3;
          break;
        case 'semi-annually':
          monthlyAmount = expense.amount / 6;
          break;
        case 'annually':
          monthlyAmount = expense.amount / 12;
          break;
      }

      switch (timeFrame) {
        case 'monthly':
          return total + monthlyAmount;
        case 'semi-annually':
          return total + (monthlyAmount * 6);
        case 'annually':
          return total + (monthlyAmount * 12);
      }
    }, 0);
  };

  const monthlyTotal = calculateTotal('monthly');
  const semiAnnualTotal = calculateTotal('semi-annually');
  const annualTotal = calculateTotal('annually');

  const timeFrameData = [
    {
      id: 'monthly' as TimeFrame,
      label: 'Monatlich',
      amount: monthlyTotal,
      icon: Calendar,
      gradient: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      id: 'semi-annually' as TimeFrame,
      label: 'Halbjährlich',
      amount: semiAnnualTotal,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgLight: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      id: 'annually' as TimeFrame,
      label: 'Jährlich',
      amount: annualTotal,
      icon: Wallet,
      gradient: 'from-teal-500 to-cyan-500',
      bgLight: 'bg-teal-50',
      textColor: 'text-teal-600'
    }
  ];

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-white shadow-xl">
      <div className="mb-6">
        <h2 className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          💰 Gesamtkostenübersicht
        </h2>
        <p className="text-slate-600">
          Klicken Sie auf einen Zeitraum, um Details anzuzeigen
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {timeFrameData.map((timeFrame) => {
          const Icon = timeFrame.icon;
          const isSelected = selectedTimeFrame === timeFrame.id;
          
          return (
            <button
              key={timeFrame.id}
              onClick={() => setSelectedTimeFrame(timeFrame.id)}
              className={`
                relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300
                ${isSelected 
                  ? `bg-gradient-to-br ${timeFrame.gradient} text-white shadow-2xl scale-105 transform` 
                  : `${timeFrame.bgLight} hover:shadow-lg border-2 border-transparent hover:border-${timeFrame.gradient}`
                }
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-xl ${isSelected ? 'bg-white/20 backdrop-blur-sm' : 'bg-white shadow-sm'}`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : timeFrame.textColor}`} />
                </div>
                {isSelected && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse delay-75" />
                  </div>
                )}
              </div>
              
              <div className={`text-sm mb-2 ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                {timeFrame.label}
              </div>
              
              <div className={`text-2xl ${isSelected ? 'text-white' : timeFrame.textColor}`}>
                {timeFrame.amount.toFixed(2)} €
              </div>

              {isSelected && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            📊 Detaillierte Aufschlüsselung
          </h3>
          <span className="text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            {selectedTimeFrame === 'monthly' && '📅 Pro Monat'}
            {selectedTimeFrame === 'semi-annually' && '📆 Pro Halbjahr'}
            {selectedTimeFrame === 'annually' && '🗓️ Pro Jahr'}
          </span>
        </div>

        <div className="space-y-3">
          {expenses.map((expense) => {
            let displayAmount = 0;
            let monthlyAmount = 0;
            
            switch (expense.frequency) {
              case 'monthly':
                monthlyAmount = expense.amount;
                break;
              case 'quarterly':
                monthlyAmount = expense.amount / 3;
                break;
              case 'semi-annually':
                monthlyAmount = expense.amount / 6;
                break;
              case 'annually':
                monthlyAmount = expense.amount / 12;
                break;
            }

            switch (selectedTimeFrame) {
              case 'monthly':
                displayAmount = monthlyAmount;
                break;
              case 'semi-annually':
                displayAmount = monthlyAmount * 6;
                break;
              case 'annually':
                displayAmount = monthlyAmount * 12;
                break;
            }

            return (
              <div key={expense.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-emerald-200">
                <div>
                  <div className="text-slate-900">{expense.name}</div>
                  <div className="text-sm text-slate-500">🏷️ {expense.category}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {displayAmount.toFixed(2)} €
                  </div>
                  <div className="text-xs text-slate-500">
                    {expense.frequency === 'monthly' && '📅 Monatlich'}
                    {expense.frequency === 'quarterly' && '📊 Vierteljährlich'}
                    {expense.frequency === 'semi-annually' && '📆 Halbjährlich'}
                    {expense.frequency === 'annually' && '🗓️ Jährlich'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-dashed border-emerald-200">
          <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl">
            <span className="text-slate-700 flex items-center gap-2">
              💵 Monatlich zurücklegen:
            </span>
            <span className="text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {monthlyTotal.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}