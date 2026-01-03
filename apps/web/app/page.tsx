'use client';
import { ContractsPage } from '@web/components/ContractsPage';
import { useContracts } from '@web/hooks/useContracts';
import {
  ProtectedComponent,
  useAccessToken,
  useCurrentUser,
} from '@web/lib/auth';

/**
 * Home Page - Orchestriert Presenter und View
 *
 * - Model: Backend API (über useContracts Hook)
 * - View: ContractsPage Komponente
 * - Presenter: useContracts Hook
 */
export default function Home() {
  // Auth-Informationen
  const token = useAccessToken();
  const currentUser = useCurrentUser();

  // Presenter Hook - Enthält die gesamte Logik
  const {
    contracts,
    isLoading,
    error,
    addContract,
    deleteContract,
    updateContract,
  } = useContracts(token);

  return (
    <ProtectedComponent>
      <ContractsPage
        contracts={contracts}
        currentUserName={currentUser?.name}
        isLoading={isLoading}
        onAddContract={addContract}
        onDeleteContract={deleteContract}
        onUpdateContract={updateContract}
      />
    </ProtectedComponent>
  );
}
