'use client';
import { ContractChart } from '@web/components/ContractChart';
import { ContractForm } from '@web/components/ContractForm';
import { ContractList } from '@web/components/ContractList';
import { CostSummary } from '@web/components/CostSummary';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@web/components/ui/tabs';
import { useContracts } from '@web/hooks/useContracts';
import {
  ProtectedComponent,
  useAccessToken,
  useCurrentUser,
} from '@web/lib/auth';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '../components/ui/button';

export default function Home() {
  // Authentication
  const token = useAccessToken();
  const currentUser = useCurrentUser();

  // Presenter: All business logic in custom hook
  const {
    contracts,
    setContracts,
    addContract,
    deleteContract,
    updateContract,
  } = useContracts(token);

  // VIEW: Pure UI rendering below
  return (
    <ProtectedComponent>
      <div className="min-h-screen bg-linear-to-br from-emerald-50 via-green-50 to-teal-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm transform hover:scale-105 transition-transform">
                <Image
                  src="/window.svg"
                  alt="BudgetBuddy Logo"
                  className="w-16 h-16"
                  width={200}
                  height={200}
                />
              </div>
              <div>
                <h1 className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  BudgetBuddy
                </h1>
                <p className="text-slate-700">
                  ✨ Verwalten Sie Ihre wiederkehrenden Kosten spielend leicht
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="text-right hidden md:block">
                  <p className="text-slate-700">Willkommen zurück,</p>
                  <p className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {currentUser.name}
                  </p>
                </div>
              )}
              <Button
                onClick={() => signOut()}
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
              <ContractForm onAddContract={addContract} />
            </div>

            <CostSummary contracts={contracts} />
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/60 backdrop-blur-sm p-1 border border-white shadow-sm">
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                📋 Vertragsliste
              </TabsTrigger>
              <TabsTrigger
                value="chart"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white"
              >
                📊 Diagramm
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <ContractList
                contracts={contracts}
                onDeleteContract={deleteContract}
                onUpdateContract={updateContract}
                onUpdateContracts={setContracts}
                token={token || ''}
              />
            </TabsContent>

            <TabsContent value="chart" className="mt-6">
              <ContractChart contracts={contracts} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedComponent>
  );
}
