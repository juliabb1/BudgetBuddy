import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Trash2, Edit, Calendar, FileText, X, Clipboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DocumentManager, Document } from './DocumentManager';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Expense } from '@web/app/page';
import { CancellationDialog } from './CancellationDialog';

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onUpdateExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
}

export function ExpenseList({ expenses, onDeleteExpense, onUpdateExpense }: ExpenseListProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cancellingExpense, setCancellingExpense] = useState<Expense | null>(null);
  const [isCancellationDialogOpen, setIsCancellationDialogOpen] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      onUpdateExpense(editingExpense.id, {
        name: editingExpense.name,
        amount: editingExpense.amount,
        frequency: editingExpense.frequency,
        category: editingExpense.category,
        dueDate: editingExpense.dueDate,
        documents: editingExpense.documents
      });
      setIsDialogOpen(false);
      setEditingExpense(null);
    }
  };

  const handleCancelContract = (expense: Expense) => {
    setCancellingExpense(expense);
    setIsCancellationDialogOpen(true);
  };

  const handleConfirmCancellation = (expenseId: string) => {
    onDeleteExpense(expenseId);
  };

  const handleAddDocument = (expenseId: string, document: Omit<Document, 'id' | 'uploadDate'>) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      const newDocument: Document = {
        ...document,
        id: Date.now().toString(),
        uploadDate: new Date().toISOString()
      };
      onUpdateExpense(expenseId, {
        ...expense,
        documents: [...expense.documents, newDocument]
      });
    }
  };

  const handleDeleteDocument = (expenseId: string, documentId: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense) {
      onUpdateExpense(expenseId, {
        ...expense,
        documents: expense.documents.filter(d => d.id !== documentId)
      });
    }
  };

  const getFrequencyLabel = (frequency: Expense['frequency']) => {
    switch (frequency) {
      case 'monthly':
        return 'Monatlich';
      case 'quarterly':
        return 'Vierteljährlich';
      case 'semi-annually':
        return 'Halbjährlich';
      case 'annually':
        return 'Jährlich';
    }
  };

  const getFrequencyColor = (frequency: Expense['frequency']) => {
    switch (frequency) {
      case 'monthly':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white';
      case 'quarterly':
        return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
      case 'semi-annually':
        return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white';
      case 'annually':
        return 'bg-gradient-to-r from-lime-500 to-green-500 text-white';
    }
  };

  if (expenses.length === 0) {
    return (
      <Card className="p-12 text-center bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300">
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
      {expenses.map((expense, index) => {
        const cardColors = [
          'from-emerald-50 to-teal-50',
          'from-green-50 to-emerald-50',
          'from-teal-50 to-cyan-50',
          'from-lime-50 to-green-50',
          'from-cyan-50 to-sky-50',
          'from-emerald-50 to-green-50'
        ];
        const cardColor = cardColors[index % cardColors.length];
        
        return (
        <Card key={expense.id} className={`hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${cardColor} border-white`}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3>{expense.name}</h3>
                  <Badge className={`${getFrequencyColor(expense.frequency)} shadow-md`}>
                    {getFrequencyLabel(expense.frequency)}
                  </Badge>
                  {expense.documents.length > 0 && (
                    <Badge variant="outline" className="gap-1 bg-white/80 backdrop-blur-sm">
                      <FileText className="w-3 h-3" />
                      {expense.documents.length}
                    </Badge>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">💰 Betrag</div>
                    <div className="text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {expense.amount.toFixed(2)} €
                    </div>
                  </div>
                  
                  <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                    <div className="text-sm text-slate-600 mb-1">🏷️ Kategorie</div>
                    <div className="text-slate-900">{expense.category}</div>
                  </div>
                  
                  {expense.dueDate && (
                    <div className="bg-white/60 backdrop-blur-sm p-3 rounded-xl">
                      <div className="text-sm text-slate-600 mb-1">📅 Fälligkeitsdatum</div>
                      <div className="flex items-center gap-1 text-slate-900">
                        <Calendar className="w-4 h-4" />
                        {new Date(expense.dueDate).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(expense)}
                  className="bg-white/80 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                >
                  <Edit className="w-4 h-4 text-emerald-600" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelContract(expense)}
                  className="bg-white/80 hover:bg-orange-50 hover:border-orange-300 transition-all"
                >
                  <Clipboard className="w-4 h-4 text-orange-600" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteExpense(expense.id)}
                  className="bg-white/80 hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="border-t border-white/50">
            <AccordionItem value="documents" className="border-0">
              <AccordionTrigger className="px-6 py-3 hover:bg-white/40 transition-all rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>📎 Dokumente & Unterlagen</span>
                  {expense.documents.length > 0 && (
                    <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {expense.documents.length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 bg-white/30 rounded-b-2xl">
                <DocumentManager
                  documents={expense.documents}
                  onAddDocument={(doc) => handleAddDocument(expense.id, doc)}
                  onDeleteDocument={(docId) => handleDeleteDocument(expense.id, docId)}
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
          
          {editingExpense && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Vertragsname</Label>
                <Input
                  id="edit-name"
                  value={editingExpense.name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-amount">Betrag (€)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-frequency">Zahlungsrhythmus</Label>
                <Select 
                  value={editingExpense.frequency} 
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, frequency: value as Expense['frequency'] })}
                >
                  <SelectTrigger id="edit-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                    <SelectItem value="semi-annually">Halbjährlich</SelectItem>
                    <SelectItem value="annually">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-category">Kategorie</Label>
                <Input
                  id="edit-category"
                  value={editingExpense.category}
                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-dueDate">Fälligkeitsdatum</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editingExpense.dueDate || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, dueDate: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit">
                  Speichern
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {cancellingExpense && (
        <CancellationDialog
          expense={cancellingExpense}
          open={isCancellationDialogOpen}
          onOpenChange={setIsCancellationDialogOpen}
          onConfirmCancellation={handleConfirmCancellation}
        />
      )}
    </div>
  );
}