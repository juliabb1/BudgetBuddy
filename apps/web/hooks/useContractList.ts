import { ContractDTO, Document } from '@repo/shared-types/contract';
import { useState } from 'react';

export function useContractList(
  onUpdateContract: (
    contractId: string,
    contract: Partial<Omit<ContractDTO, 'contractId' | 'userId' | 'documents'>>,
  ) => void,
  onUpdateContracts: (contracts: ContractDTO[]) => void,
  contracts: ContractDTO[],
  token: string,
) {
  const [editingContract, setEditingContract] = useState<ContractDTO | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancellingContract, setCancellingContract] =
    useState<ContractDTO | null>(null);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] =
    useState(false);

  const handleEdit = (contract: ContractDTO) => {
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
      onUpdateContract(editingContract.contractId, {
        name: editingContract.name,
        price: Number(editingContract.price),
        cycle: editingContract.cycle,
        startDate: editingContract.startDate,
        isActive: editingContract.isActive,
        debitDayOfMonth: 1,
        category: editingContract.category,
      });
      setIsDialogOpen(false);
      setEditingContract(null);
    }
  };

  const handleCancelContract = (contract: ContractDTO) => {
    setCancellingContract(contract);
    setIsCancellationDialogOpen(true);
  };

  const handleConfirmCancellation = (contract: ContractDTO) => {
    onUpdateContract(contract.contractId, {
      isActive: false,
    });
    setIsCancellationDialogOpen(false);
  };

  const handleDeleteConfirmation = (contractName: string): boolean => {
    return window.confirm(
      `Möchten Sie den Vertrag "${contractName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`,
    );
  };

  const handleAddDocument = async (contractId: string, document: Document) => {
    // Update local state immediately for better UX
    const updatedContracts = contracts.map((c) =>
      c.contractId === contractId
        ? { ...c, documents: [...(c.documents ?? []), document] }
        : c,
    );
    onUpdateContracts(updatedContracts);
  };

  const handleDeleteDocument = async (
    contractId: string,
    documentId: string,
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        // Update local state
        const updatedContracts = contracts.map((c) =>
          c.contractId === contractId
            ? {
                ...c,
                documents: (c.documents ?? []).filter(
                  (d) => d.id !== documentId,
                ),
              }
            : c,
        );
        onUpdateContracts(updatedContracts);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const getCycleColor = (cycle: ContractDTO['cycle']) => {
    switch (cycle) {
      case 'MONTHLY':
        return 'bg-linear-to-r from-emerald-500 to-teal-500 text-white';
      case 'QUARTERLY':
        return 'bg-linear-to-r from-green-500 to-emerald-500 text-white';
      case 'HALF_YEARLY':
        return 'bg-linear-to-r from-teal-500 to-cyan-500 text-white';
      case 'YEARLY':
        return 'bg-linear-to-r from-lime-500 to-green-500 text-white';
    }
  };

  const updateEditingContract = (updates: Partial<ContractDTO>) => {
    if (editingContract) {
      setEditingContract({ ...editingContract, ...updates });
    }
  };

  const getFormattedEditStartDate = (): string => {
    if (!editingContract?.startDate) return '';
    const startDate = editingContract.startDate;
    try {
      if (typeof startDate === 'string') {
        return new Date(startDate).toISOString().split('T')[0] || '';
      }
      if (startDate instanceof Date) {
        return startDate.toISOString().split('T')[0] || '';
      }
    } catch {
      return '';
    }
    return '';
  };

  const getContractKey = (contract: ContractDTO, index: number): string => {
    return contract.contractId ? contract.contractId : `contract-${index}`;
  };

  const getDocumentCount = (contract: ContractDTO): number => {
    return (contract.documents ?? []).length;
  };

  const formatPrice = (price: number): string => {
    return Number(price).toFixed(2);
  };

  const formatStartDate = (startDate: Date | string | undefined): string => {
    if (!startDate) return '';
    try {
      return new Date(startDate).toLocaleDateString('de-DE');
    } catch {
      return '';
    }
  };

  const updateEditingPrice = (value: string) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        price: parseFloat(value),
      });
    }
  };

  const updateEditingStartDate = (value: string) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        startDate: new Date(value),
      });
    }
  };

  const updateEditingCycle = (value: string) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        cycle: value as ContractDTO['cycle'],
      });
    }
  };

  const updateEditingCategory = (value: string) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        category: value as ContractDTO['category'],
      });
    }
  };

  const updateEditingIsActive = (isActive: boolean) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        isActive,
      });
    }
  };

  const updateEditingName = (value: string) => {
    if (editingContract) {
      setEditingContract({
        ...editingContract,
        name: value,
      });
    }
  };

  return {
    editingContract,
    setEditingContract,
    isDialogOpen,
    setIsDialogOpen,
    cancellingContract,
    setCancellingContract,
    isCancellationDialogOpen,
    setIsCancellationDialogOpen,
    handleEdit,
    handleUpdate,
    handleCancelContract,
    handleConfirmCancellation,
    handleAddDocument,
    handleDeleteDocument,
    handleDeleteConfirmation,
    getCycleColor,
    updateEditingContract,
    getFormattedEditStartDate,
    getContractKey,
    getDocumentCount,
    formatPrice,
    formatStartDate,
    updateEditingPrice,
    updateEditingStartDate,
    updateEditingCycle,
    updateEditingCategory,
    updateEditingIsActive,
    updateEditingName,
  };
}
