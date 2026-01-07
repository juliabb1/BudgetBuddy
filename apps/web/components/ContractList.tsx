import {
  CATEGORY_LABELS,
  ContractDTO,
  CYCLE_LABELS,
  getCategoryOptions,
  getCycleOptions,
} from '@repo/shared-types/contract';
import { Calendar, Clipboard, Edit, FileText, Trash2 } from 'lucide-react';
import { useContractList } from '../hooks/useContractList';
import { CancellationDialog } from './CancellationDialog';
import { DocumentManager } from './DocumentManager';
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

interface ContractListProps {
  contracts: ContractDTO[];
  onDeleteContract: (id: string) => void;
  onUpdateContract: (
    contractId: string,
    contract: Partial<Omit<ContractDTO, 'contractId' | 'userId' | 'documents'>>,
  ) => void;
  onUpdateContracts: (contracts: ContractDTO[]) => void;
  token: string;
}

export function ContractList({
  contracts,
  onDeleteContract,
  onUpdateContract,
  onUpdateContracts,
  token,
}: ContractListProps) {
  const {
    editingContract,
    setEditingContract,
    isDialogOpen,
    setIsDialogOpen,
    cancellingContract,
    isCancellationDialogOpen,
    setIsCancellationDialogOpen,
    handleEdit,
    handleUpdate,
    handleCancelContract,
    handleDeleteContract,
    handleConfirmCancellation,
    getCycleColor,
    getCycleBadgeClass,
    isContractCancelled,
    getCancelledBadgeText,
    handleDeleteDocument,
    handleAddDocument,
    getFormattedEditStartDate,
    getContractKey,
    getDocumentCount,
    hasDocuments,
    getDocumentBadgeClass,
    formatPrice,
    formatStartDate,
    updateEditingPrice,
    updateEditingStartDate,
    updateEditingCycle,
    updateEditingCategory,
    updateEditingIsActive,
    updateEditingName,
  } = useContractList(
    onUpdateContract,
    onUpdateContracts,
    contracts,
    token,
    onDeleteContract,
  );

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
                    <Badge className={getCycleBadgeClass(contract.cycle)}>
                      {CYCLE_LABELS[contract.cycle]}
                    </Badge>
                    {isContractCancelled(contract) && (
                      <Badge className="bg-linear-to-r from-red-500 to-red-500 text-white shadow-sm">
                        {getCancelledBadgeText()}
                      </Badge>
                    )}
                    {hasDocuments(contract) && (
                      <Badge
                        variant="outline"
                        className="gap-1 bg-white/80 backdrop-blur-sm"
                      >
                        <FileText className="w-3 h-3" />
                        {getDocumentCount(contract)}
                      </Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        💰 Betrag
                      </div>
                      <div className="text-lg bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {formatPrice(contract.price)} €
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">
                        🏷️ Kategorie
                      </div>
                      <div className="text-slate-900">
                        {CATEGORY_LABELS[contract.category]}
                      </div>
                    </div>

                    {contract.startDate && (
                      <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                        <div className="text-sm text-slate-600 mb-1">
                          📅 Fälligkeitsdatum
                        </div>
                        <div className="flex items-center gap-1 text-slate-900">
                          <Calendar className="w-4 h-4" />
                          {formatStartDate(contract.startDate)}
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

                  {contract.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelContract(contract)}
                      className="bg-white/80 hover:bg-orange-50 hover:border-orange-300 transition-all"
                    >
                      <Clipboard className="w-4 h-4 text-orange-600" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteContract(contract)}
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
                    <span className={getDocumentBadgeClass(contract)}>
                      {getDocumentCount(contract)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 bg-white/30 rounded-b-2xl">
                  <DocumentManager
                    documents={contract.documents ?? []}
                    contractId={contract.contractId}
                    token={token}
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
                  onChange={(e) => updateEditingName(e.target.value)}
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
                  onChange={(e) => updateEditingPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cycle">Zahlungsrhythmus</Label>
                <Select
                  value={editingContract.cycle}
                  onValueChange={updateEditingCycle}
                >
                  <SelectTrigger id="edit-cycle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getCycleOptions().map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategorie</Label>
                <Select
                  value={editingContract.category}
                  onValueChange={updateEditingCategory}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoryOptions().map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Fälligkeitsdatum</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={getFormattedEditStartDate()}
                  onChange={(e) => updateEditingStartDate(e.target.value)}
                />
              </div>

              {!editingContract.isActive && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
                  <p className="text-red-700 mb-2 font-medium">
                    Dieser Vertrag ist derzeit gekündigt.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => updateEditingIsActive(true)}
                    className="bg-linear-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600"
                  >
                    Vertrag reaktivieren
                  </Button>
                </div>
              )}

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
