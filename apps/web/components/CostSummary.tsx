import { Cycle, CycleSchema } from "@repo/shared-types/contract";
import { Contract } from "@web/app/page";
import { Calendar, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";

interface CostSummaryProps {
  contracts: Contract[];
}

type TimeFrame = Contract["cycle"];

export function CostSummary({ contracts }: CostSummaryProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<Cycle>(
    CycleSchema.parse("MONTHLY")
  );

  const calculateTotal = (timeFrame: TimeFrame): number => {
    return contracts.reduce((total, contract) => {
      const price = Number(contract.price) || 0; // <-- ensure number
      let monthlyAmount = 0;

      switch (contract.cycle) {
        case "MONTHLY":
          monthlyAmount = price;
          break;
        case "QUARTERLY":
          monthlyAmount = price / 3;
          break;
        case "HALF_YEARLY":
          monthlyAmount = price / 6;
          break;
        case "YEARLY":
          monthlyAmount = price / 12;
          break;
      }

      switch (timeFrame) {
        case "MONTHLY":
          return total + monthlyAmount;
        case "QUARTERLY":
          return total + monthlyAmount * 3;
        case "HALF_YEARLY":
          return total + monthlyAmount * 6;
        case "YEARLY":
          return total + monthlyAmount * 12;
      }

      return total;
    }, 0);
  };

  const monthlyTotal = calculateTotal("MONTHLY");
  const quarterlyTotal = calculateTotal("QUARTERLY");
  const halfYearlyTotal = calculateTotal("HALF_YEARLY");
  const yearlyTotal = calculateTotal("YEARLY");

  const timeFrameData = [
    {
      id: "MONTHLY" as TimeFrame,
      label: "Monatlich",
      amount: monthlyTotal, // unified field name
      icon: Calendar,
      gradient: "from-emerald-500 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      id: "QUARTERLY" as TimeFrame,
      label: "Vierteljährlich",
      amount: quarterlyTotal,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      id: "HALF_YEARLY" as TimeFrame,
      label: "Halbjährlich",
      amount: halfYearlyTotal,
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      id: "YEARLY" as TimeFrame,
      label: "Jährlich",
      amount: yearlyTotal,
      icon: Wallet,
      gradient: "from-teal-500 to-cyan-500",
      bgLight: "bg-teal-50",
      textColor: "text-teal-600",
    },
  ];

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

      <div className="grid md:grid-cols-3 gap-4 mb-6">
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
                      ? "bg-white/20 backdrop-blur-sm"
                      : "bg-white shadow-sm"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${isSelected ? "text-white" : timeFrame.textColor}`}
                  />
                </div>
              </div>

              <div
                className={`text-sm mb-2 ${isSelected ? "text-white/90" : "text-slate-600"}`}
              >
                {timeFrame.label}
              </div>

              <div
                className={`text-2xl ${isSelected ? "text-white" : timeFrame.textColor}`}
              >
                {Number(timeFrame.amount).toFixed(2)} €
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
            {selectedTimeFrame === "MONTHLY" && "📅 Pro Monat"}
            {selectedTimeFrame === "QUARTERLY" && "📆 Pro Quartal"}
            {selectedTimeFrame === "HALF_YEARLY" && "📆 Pro Halbjahr"}
            {selectedTimeFrame === "YEARLY" && "🗓️ Pro Jahr"}
          </span>
        </div>

        <div className="space-y-3">
          {contracts.map((contract, index) => {
            const key = contract.id ? contract.id : `contract-${index}`;

            const price = Number(contract.price) || 0;
            let monthlyAmount = 0;

            switch (contract.cycle) {
              case "MONTHLY":
                monthlyAmount = price;
                break;
              case "QUARTERLY":
                monthlyAmount = price / 3;
                break;
              case "HALF_YEARLY":
                monthlyAmount = price / 6;
                break;
              case "YEARLY":
                monthlyAmount = price / 12;
                break;
            }

            let displayAmount = 0;
            switch (selectedTimeFrame) {
              case "MONTHLY":
                displayAmount = monthlyAmount;
                break;
              case "QUARTERLY":
                displayAmount = monthlyAmount * 3;
                break;
              case "HALF_YEARLY":
                displayAmount = monthlyAmount * 6;
                break;
              case "YEARLY":
                displayAmount = monthlyAmount * 12;
                break;
            }

            return (
              <div
                key={key}
                className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-100 hover:border-emerald-200"
              >
                <div>
                  <div className="text-slate-900">{contract.name}</div>
                  <div className="text-sm text-slate-500">
                    🏷️ {contract.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {displayAmount.toFixed(2)} €
                  </div>
                  <div className="text-xs text-slate-500">
                    {contract.cycle === "MONTHLY" && "📅 Monatlich"}
                    {contract.cycle === "QUARTERLY" && "📊 Vierteljährlich"}
                    {contract.cycle === "HALF_YEARLY" && "📆 Halbjährlich"}
                    {contract.cycle === "YEARLY" && "🗓️ Jährlich"}
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
              {monthlyTotal.toFixed(2)} €
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
