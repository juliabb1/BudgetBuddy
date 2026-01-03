import { CATEGORY_LABELS, ContractDTO } from '@repo/shared-types/contract';
import { Calendar, Clipboard, Edit, FileText, Trash2 } from 'lucide-react';
import { useContractList } from '../hooks/useContractList';
import {
  CARD_COLORS,
  CYCLE_COLORS,
  CYCLE_LABELS,
  formatCurrency,
  formatDate,
} from '../lib/contractUtils';
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
    contract: Omit<ContractDTO, 'contractId'>,
  ) => void;
}

export function ContractList({
  contracts,
  onDeleteContract,
  onUpdateContract,
}: ContractListProps) {
  const {
    editingContract,
    isDialogOpen,
    setIsDialogOpen,
    cancellingContract,
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
  } = useContractList(onUpdateContract);

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
        const key = getContractKey(contract, index);
        const cardColor = CARD_COLORS[index % CARD_COLORS.length];

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
                      className={`${CYCLE_COLORS[contract.cycle]} shadow-sm`}
                    >
                      {CYCLE_LABELS[contract.cycle]}
                    </Badge>
                    {!contract.isActive && (
                      <Badge className="bg-linear-to-r from-red-500 to-red-500 text-white shadow-sm">
                        {contract.isActive ? '' : 'Gekündigt'}
                      </Badge>
                    )}
                    {getDocumentCount(contract) > 0 && (
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
                        {formatCurrency(Number(contract.price))}
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
                          {formatDate(contract.startDate)}
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
                    onClick={() => {
                      if (handleDeleteConfirmation(contract.name)) {
                        onDeleteContract(contract.contractId);
                      }
                    }}
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
                    {getDocumentCount(contract) > 0 && (
                      <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                        {getDocumentCount(contract)}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 bg-white/30 rounded-b-2xl">
                  <DocumentManager
                    documents={contract.documents ?? []}
                    onAddDocument={(doc) =>
                      handleAddDocument(contracts, contract.contractId, doc)
                    }
                    onDeleteDocument={(docId) =>
                      handleDeleteDocument(
                        contracts,
                        contract.contractId,
                        docId,
                      )
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
                    updateEditingContract({ name: e.target.value })
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
                    updateEditingContract({ price: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cycle">Zahlungsrhythmus</Label>
                <Select
                  value={editingContract.cycle}
                  onValueChange={(value) =>
                    updateEditingContract({
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
                    updateEditingContract({
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
                  value={getFormattedEditStartDate()}
                  onChange={(e) =>
                    updateEditingContract({
                      startDate: new Date(e.target.value),
                    })
                  }
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
                    onClick={() => updateEditingContract({ isActive: true })}
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
