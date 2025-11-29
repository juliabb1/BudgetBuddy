"use client";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { signOut } from "next-auth/react";
import { CostSummary } from "@web/components/CostSummary";
import { ExpenseList } from "@web/components/ExpenseList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@web/components/ui/tabs";
import { ExpenseChart } from "@web/components/ExpenseChart";
import { LogOut } from "lucide-react";
import { ExpenseForm } from "@web/components/ExpenseForm";
import { ProtectedComponent, useAccessToken } from "@web/lib/auth";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  category: string;
  dueDate?: string;
  documents: Document[];
  uploadDate?: string;
}

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(useAccessToken());

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      name: 'Kfz-Versicherung',
      amount: 780,
      frequency: 'annually',
      category: 'Versicherung',
      dueDate: '2025-03-15',
      documents: []
    },
    {
      id: '2',
      name: 'Kfz-Steuer',
      amount: 156,
      frequency: 'annually',
      category: 'Steuern',
      dueDate: '2025-05-01',
      documents: []
    },
    {
      id: '3',
      name: 'Netflix',
      amount: 17.99,
      frequency: 'monthly',
      category: 'Unterhaltung',
      dueDate: '2025-10-25',
      documents: []
    }
  ]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses([...expenses, newExpense]);
  };

    const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const updateExpense = (id: string, updatedExpense: Omit<Expense, 'id'>) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...updatedExpense, id } : exp
    ));
  };

  return (
    <ProtectedComponent>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-transform">
                <Image src="/window.svg" alt="BudgetBuddy Logo" className="w-16 h-16" width={200} height={200} />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  BudgetBuddy
                </h1>
                <p className="text-slate-700">✨ Verwalten Sie Ihre wiederkehrenden Kosten spielend leicht</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="text-right hidden md:block">
                  <p className="text-slate-700">Willkommen zurück,</p>
                  <p className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{currentUser.name}</p>
                </div>
              )}
              <Button
                onClick={() => signOut}
                variant="outline"
                className="border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>

          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white">
              <div>
                <p className="text-slate-700">
                  🎯 Behalten Sie alle wiederkehrenden Ausgaben im Blick
                </p>
              </div>
              <ExpenseForm onAddExpense={addExpense} />
            </div>
            
            <CostSummary expenses={expenses} />
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/60 backdrop-blur-sm p-1 border border-white shadow-lg">
              <TabsTrigger value="list" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
                📋 Vertragsliste
              </TabsTrigger>
              <TabsTrigger value="chart" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">
                📊 Diagramm
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-6">
              <ExpenseList 
                expenses={expenses} 
                onDeleteExpense={deleteExpense}
                onUpdateExpense={updateExpense}
              />
            </TabsContent>
            
            <TabsContent value="chart" className="mt-6">
              <ExpenseChart expenses={expenses} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedComponent>
  );
}
