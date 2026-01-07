import { ContractDTO, CreateContractDto } from '@repo/shared-types/contract';
import { useEffect, useState } from 'react';

/**
 * Custom Hook für Contract-Verwaltung (Presenter)
 * Kapselt die gesamte Logik für CRUD-Operationen
 */
export function useContracts(token: string | undefined) {
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verträge vom Backend laden
  useEffect(() => {
    if (!token) return;

    const fetchContracts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || 'Fehler beim Laden der Verträge');
        }

        const data = await res.json();
        setContracts(data);
      } catch (err) {
        const error = err as { message?: string };
        setError(error.message ?? 'Unbekannter Fehler');
        console.error('Fehler beim Laden der Verträge:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContracts();
  }, [token]);

  // Neuen Vertrag erstellen
  const addContract = async (contract: CreateContractDto) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: contract.name,
            price: contract.price,
            cycle: contract.cycle,
            startDate: contract.startDate,
            debitDayOfMonth: contract.debitDayOfMonth,
            category: contract.category,
            isActive: contract.isActive,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || 'Fehler beim Erstellen des Vertrags');
      }

      // Verträge neu laden nach erfolgreichem Erstellen
      const contractsRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (contractsRes.ok) {
        const updatedContracts = await contractsRes.json();
        setContracts(updatedContracts);
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message ?? 'Unbekannter Fehler');
      console.error('Fehler beim Erstellen des Vertrags:', err);
      throw err;
    }
  };

  // Vertrag löschen
  const deleteContract = async (id: string) => {
    if (!token) return;

    const originalContracts = contracts;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Löschen');
      }

      // Optimistic Update
      setContracts(contracts.filter((contract) => contract.contractId !== id));
    } catch (err) {
      const error = err as { message?: string };
      // Rollback bei Fehler
      setContracts(originalContracts);
      setError(error.message || 'Fehler beim Löschen');
      console.error('Fehler beim Löschen des Vertrags:', err);
      throw err;
    }
  };

  // Vertrag aktualisieren
  const updateContract = async (
    id: string,
    updatedContract: Partial<
      Omit<ContractDTO, 'contractId' | 'userId' | 'documents'>
    >,
  ) => {
    if (!token) return;

    const originalContracts = contracts;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedContract),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Fehler beim Aktualisieren');
      }

      const data = await response.json();

      // Update mit Server-Response
      setContracts(
        contracts.map((contract) =>
          contract.contractId === id ? { ...contract, ...data } : contract,
        ),
      );
    } catch (err) {
      const error = err as { message?: string };
      // Rollback bei Fehler
      setContracts(originalContracts);
      setError(error.message || 'Fehler beim Aktualisieren');
      console.error('Fehler beim Aktualisieren des Vertrags:', err);
      throw err;
    }
  };

  return {
    contracts,
    setContracts,
    isLoading,
    error,
    addContract,
    deleteContract,
    updateContract,
  };
}
