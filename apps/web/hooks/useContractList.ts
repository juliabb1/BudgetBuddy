import { ContractDTO } from '@repo/shared-types/contract';
import { useState } from 'react';
import { Document } from '../components/DocumentManager';

export function useContractList(
  onUpdateContract: (
    contractId: string,
    contract: Omit<ContractDTO, 'contractId'>,
  ) => void,
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
        userId: editingContract.userId,
        name: editingContract.name,
        price: Number(editingContract.price),
        cycle: editingContract.cycle,
        startDate: editingContract.startDate,
        isActive: editingContract.isActive,
        debitDayOfMonth: 1,
        category: editingContract.category,
        documents: editingContract.documents,
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
      name: contract.name,
      price: Number(contract.price),
      cycle: contract.cycle,
      category: contract.category,
      startDate: contract.startDate,
      debitDayOfMonth: contract.debitDayOfMonth ?? 1,
      documents: contract.documents,
      userId: contract.userId,
      isActive: false,
    });
    setIsCancellationDialogOpen(false);
  };

  const handleAddDocument = (
    contracts: ContractDTO[],
    contractId: string,
    document: Omit<Document, 'id' | 'uploadDate'>,
  ) => {
    const contract = contracts.find((e) => e.contractId === contractId);
    if (contract) {
      const newDocument: Document = {
        ...document,
        id: Date.now().toString(),
        uploadDate: new Date().toISOString(),
      };
      onUpdateContract(contractId, {
        ...contract,
        documents: [...(contract.documents ?? []), newDocument],
      });
    }
  };

  const handleDeleteDocument = (
    contracts: ContractDTO[],
    contractId: string,
    documentId: string,
  ) => {
    const contract = contracts.find((e) => e.contractId === contractId);
    if (contract) {
      onUpdateContract(contractId, {
        ...contract,
        documents: (contract.documents ?? []).filter(
          (d) => d.id !== documentId,
        ),
      });
    }
  };

  const handleDeleteConfirmation = (contractName: string): boolean => {
    return window.confirm(
      `Möchten Sie den Vertrag "${contractName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.`,
    );
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
    updateEditingContract,
    getFormattedEditStartDate,
    getContractKey,
    getDocumentCount,
  };
}
