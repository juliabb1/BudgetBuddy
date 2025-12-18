import { Card } from './ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';
import { Button } from './ui/button';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Contract } from '@web/app/page';

interface ContractChartProps {
  contracts: Contract[];
}

export function ContractChart({ contracts }: ContractChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Group contracts by category and calculate monthly amounts
  const categoryData = contracts.reduce((acc, contract) => {
    let monthlyAmount = 0;
    
    switch (contract.cycle) {
      case 'MONTHLY':
        monthlyAmount = contract.price;
        break;
      case 'QUARTERLY':
        monthlyAmount = contract.price / 3;
        break;
      case 'HALF_YEARLY':
        monthlyAmount = contract.price / 6;
        break;
      case 'YEARLY':
        monthlyAmount = contract.price / 12;
        break;
    }

    const existingCategory = acc.find(item => item.category === contract.category);
    if (existingCategory) {
      existingCategory.monthlyAmount += monthlyAmount;
      existingCategory.annualAmount += monthlyAmount * 12;
    } else {
      acc.push({
        category: contract.category,
        monthlyAmount,
        annualAmount: monthlyAmount * 12
      });
    }

    return acc;
  }, [] as { category: string; monthlyAmount: number; annualAmount: number }[]);

  const COLORS = [
    '#10b981', // emerald
    '#14b8a6', // teal
    '#22c55e', // green
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#059669', // emerald-600
    '#0d9488', // teal-600
    '#16a34a'  // green-600
  ];

  if (contracts.length === 0) {
    return (
      <Card className="p-12 text-center bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300">
        <div className="text-6xl mb-4">📊</div>
        <div className="text-slate-600 mb-2">Keine Daten verfügbar</div>
        <p className="text-slate-500 text-sm">
          Fügen Sie Verträge hinzu, um Diagramme anzuzeigen
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/80 backdrop-blur-sm border-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="mb-2 bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              📊 Kostenverteilung nach Kategorie
            </h2>
            <p className="text-slate-600 text-sm">💰 Monatliche Durchschnittskosten</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className={chartType === 'bar' ? 'bg-linear-to-r from-emerald-600 to-teal-600' : 'shadow-sm hover:shadow-md hover:border-emerald-300'}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Balken
            </Button>
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
              className={chartType === 'pie' ? 'bg-linear-to-r from-emerald-600 to-teal-600' : 'shadow-sm hover:shadow-md hover:border-emerald-300'}
            >
              <PieChartIcon className="w-4 h-4 mr-2" />
              Kreis
            </Button>
          </div>
        </div>

        <div className="h-96">
          {chartType === 'bar' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} €`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="monthlyAmount" name="Monatlich" fill="url(#colorMonthly)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="annualAmount" name="Jährlich" fill="url(#colorAnnual)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="colorAnnual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#84cc16" stopOpacity={1}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, monthlyAmount, percent }) => 
                    `${category}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="monthlyAmount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} € / Monat`}
                  contentStyle={{ borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryData.map((category, index) => (
          <Card key={category.category} className="p-5 bg-linear-to-br from-white to-slate-50 hover:shadow-md transition-all border-white">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-3 h-3 rounded-full shadow-md" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="text-sm text-slate-600">🏷️ {category.category}</div>
            </div>
            <div className="text-xl bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {category.monthlyAmount.toFixed(2)} €
            </div>
            <div className="text-xs text-slate-500">💵 pro Monat</div>
          </Card>
        ))}
      </div>
    </div>
  );
}