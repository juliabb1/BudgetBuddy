import { CATEGORY_LABELS, ContractDTO } from '@repo/shared-types/contract';
import { useCostCalculations } from '../hooks/useCostCalculations';
import { CYCLE_LABELS, formatCurrency } from '../lib/contractUtils';
import { Card } from './ui/card';

interface CostSummaryProps {
  contracts: ContractDTO[];
}

export function CostSummary({ contracts }: CostSummaryProps) {
  const {
    selectedTimeFrame,
    setSelectedTimeFrame,
    timeFrameData,
    monthlyTotal,
    getTimeFrameLabel,
    calculateContractDisplay,
  } = useCostCalculations(contracts);

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-white shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          💰 Gesamtkostenübersicht
        </h2>
        <p className="text-slate-600">
          Klicken Sie auf einen Zeitraum, um Details anzuzeigen
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {timeFrameData.map((timeFrame) => {
          const Icon = timeFrame.icon;
          const isSelected = selectedTimeFrame === timeFrame.id;

          return (
            <button
              key={timeFrame.id}
              onClick={() => setSelectedTimeFrame(timeFrame.id)}
              className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                isSelected
                  ? `bg-linear-to-br ${timeFrame.gradient} text-white shadow-xl scale-105 transform`
                  : `${timeFrame.bgLight} hover:shadow-lg border-2 border-transparent hover:border-${timeFrame.gradient}`
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-3 rounded-xl ${
                    isSelected
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-white shadow-sm'
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isSelected ? 'text-white' : timeFrame.textColor}`}
                  />
                </div>
              </div>

              <div
                className={`text-sm mb-2 ${isSelected ? 'text-white/90' : 'text-slate-600'}`}
              >
                {timeFrame.label}
              </div>

              <div
                className={`text-2xl ${isSelected ? 'text-white' : timeFrame.textColor}`}
              >
                {formatCurrency(timeFrame.amount)}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-linear-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2">
            📊 Detaillierte Aufschlüsselung
          </h3>
          <span className="text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
            {getTimeFrameLabel(selectedTimeFrame)}
          </span>
        </div>

        <div className="space-y-3">
          {contracts.map((contract, index) => {
            const key = contract.contractId || `contract-${index}`;
            const { amount, cycleIcon } = calculateContractDisplay(contract);

            return (
              <div
                key={key}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-emerald-200"
              >
                <div>
                  <div className="text-slate-900">{contract.name}</div>
                  <div className="text-sm text-slate-500">
                    🏷️ {CATEGORY_LABELS[contract.category]}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {formatCurrency(amount)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {cycleIcon} {CYCLE_LABELS[contract.cycle]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t-2 border-dashed border-emerald-200">
          <div className="flex items-center justify-between bg-linear-to-r from-emerald-50 to-teal-50 p-4 rounded-xl">
            <span className="text-slate-700 flex items-center gap-2">
              💵 Monatlich zurücklegen:
            </span>
            <span className="text-2xl bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatCurrency(monthlyTotal)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
