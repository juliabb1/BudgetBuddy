import { Calendar, Clipboard, Edit, FileText, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CancellationDialog } from './CancellationDialog';
import { Document, DocumentManager } from './DocumentManager';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ContractDTO } from '@repo/shared-types/contract';

interface ContractListProps {
  contracts: ContractDTO[];
  onDeleteContract: (id: string) => void;
  onUpdateContract: (
    contractId: string,
    contract: Omit<ContractDTO, 'contractId'>,
  ) => void;
}

export function ContractList({
  contracts,
  onDeleteContract,
  onUpdateContract,
}: ContractListProps) {
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
        documents: editingContract.documents ?? [],
      });
      setIsDialogOpen(false);
      setEditingContract(null);
    }
  };

  const handleCancelContract = (contract: ContractDTO) => {
    setCancellingContract(contract);
    setIsCancellationDialogOpen(true);
  };

  const handleConfirmCancellation = (contractId: string) => {
    onDeleteContract(contractId);
    setIsCancellationDialogOpen(false);
  };

  const handleAddDocument = (
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

  const handleDeleteDocument = (contractId: string, documentId: string) => {
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

  const getCycleLabel = (cycle: ContractDTO['cycle']) => {
    switch (cycle) {
      case 'MONTHLY':
        return 'Monatlich';
      case 'QUARTERLY':
        return 'Vierteljährlich';
      case 'HALF_YEARLY':
        return 'Halbjährlich';
      case 'YEARLY':
        return 'Jährlich';
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

  if (contracts.length === 0) {
    return (
      <Card className="p-12 text-center bg-linear-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300">
        <div className="text-6xl mb-4">📋</div>
        <div className="text-slate-600 mb-2">Keine Verträge vorhanden</div>
        <p className="text-slate-500 text-sm">
          Fügen Sie Ihren ersten Vertrag hinzu, um zu beginnen
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract, index) => {
        const key = contract.contractId
          ? contract.contractId
          : `contract-${index}`;
        const cardColors = [
          'from-emerald-50 to-teal-50',
          'from-green-50 to-emerald-50',
          'from-teal-50 to-cyan-50',
          'from-lime-50 to-green-50',
          'from-cyan-50 to-sky-50',
          'from-emerald-50 to-green-50',
        ];
        const cardColor = cardColors[index % cardColors.length];

        return (
          <Card
            key={key}
            className={`shadow-sm hover:shadow-md transition-all duration-300 bg-linear-to-br ${cardColor} border-white`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3>{contract.name}</h3>
                    <Badge
                      className={`${getCycleColor(contract.cycle)} shadow-sm`}
                    >
                      {getCycleLabel(contract.cycle)}
                    </Badge>
                    {(contract.documents ?? []).length > 0 && (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-white/80 backdrop-blur-sm"
                      >
                        <FileText className="w-3 h-3" />
                        {(contract.documents ?? []).length}
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        💰 Betrag
                      </div>
                      <div className="text-lg bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {Number(contract.price).toFixed(2)} €
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        🏷️ Kategorie
                      </div>
                      <div className="text-slate-900">{contract.category}</div>
                    </div>

                    {contract.startDate && (
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                        <div className="text-sm text-slate-600 mb-1">
                          📅 Fälligkeitsdatum
                        </div>
                        <div className="flex items-center gap-1 text-slate-900">
                          <Calendar className="w-4 h-4" />
                          {new Date(contract.startDate).toLocaleDateString(
                            'de-DE',
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contract)}
                    className="bg-white/80 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                  >
                    <Edit className="w-4 h-4 text-emerald-600" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancelContract(contract)}
                    className="bg-white/80 hover:bg-orange-50 hover:border-orange-300 transition-all"
                  >
                    <Clipboard className="w-4 h-4 text-orange-600" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteContract(contract.contractId)}
                    className="bg-white/80 hover:bg-red-50 hover:border-red-300 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>

            <Accordion
              type="single"
              collapsible
              className="border-t border-white/50"
            >
              <AccordionItem value="documents" className="border-0">
                <AccordionTrigger className="px-6 py-3 hover:bg-white/40 transition-all rounded-b-2xl">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>📎 Dokumente & Unterlagen</span>
                    {(contract.documents ?? []).length > 0 && (
                      <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {(contract.documents ?? []).length}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 bg-white/30 rounded-b-2xl">
                  <DocumentManager
                    documents={contract.documents ?? []}
                    onAddDocument={(doc) =>
                      handleAddDocument(contract.contractId, doc)
                    }
                    onDeleteDocument={(docId) =>
                      handleDeleteDocument(contract.contractId, docId)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        );
      })}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vertrag bearbeiten</DialogTitle>
          </DialogHeader>

          {editingContract && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Vertragsname</Label>
                <Input
                  id="edit-name"
                  value={editingContract.name}
                  onChange={(e) =>
                    setEditingContract({
                      ...editingContract,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Betrag (€)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingContract.price}
                  onChange={(e) =>
                    setEditingContract({
                      ...editingContract,
                      price: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cycle">Zahlungsrhythmus</Label>
                <Select
                  value={editingContract.cycle}
                  onValueChange={(value) =>
                    setEditingContract({
                      ...editingContract,
                      cycle: value as ContractDTO['cycle'],
                    })
                  }
                >
                  <SelectTrigger id="edit-cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monatlich</SelectItem>
                    <SelectItem value="QUARTERLY">Vierteljährlich</SelectItem>
                    <SelectItem value="HALF_YEARLY">Halbjährlich</SelectItem>
                    <SelectItem value="YEARLY">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategorie</Label>
                <Select
                  value={editingContract.category}
                  onValueChange={(value) =>
                    setEditingContract({
                      ...editingContract,
                      category: value as ContractDTO['category'],
                    })
                  }
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INSURANCE">Versicherung</SelectItem>
                    <SelectItem value="ENERGY">Energie</SelectItem>
                    <SelectItem value="INTERNET">Internet</SelectItem>
                    <SelectItem value="PHONE">Telefon</SelectItem>
                    <SelectItem value="STREAMING">Streaming</SelectItem>
                    <SelectItem value="FOOD">Lebensmittel</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="HEALTH">Gesundheit</SelectItem>
                    <SelectItem value="EDUCATION">Bildung</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Abonnement</SelectItem>
                    <SelectItem value="OTHER">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Fälligkeitsdatum</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={
                    editingContract.startDate
                      ? new Date(editingContract.startDate)
                          .toISOString()
                          .split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setEditingContract({
                      ...editingContract,
                      startDate: new Date(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button type="submit">Speichern</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {cancellingContract && (
        <CancellationDialog
          contract={cancellingContract}
          open={isCancellationDialogOpen}
          onOpenChange={setIsCancellationDialogOpen}
          onConfirmCancellation={handleConfirmCancellation}
        />
      )}
    </div>
  );
}
