import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { FileDown, Copy, Check } from 'lucide-react';
import { Expense } from '@web/app/page';

interface CancellationDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancellation: (expenseId: string) => void;
}

export function CancellationDialog({ 
  expense, 
  open, 
  onOpenChange,
  onConfirmCancellation 
}: CancellationDialogProps) {
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderCity, setSenderCity] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateCancellationLetter = () => {
    return `${senderName}
${senderAddress}
${senderCity}

${expense.name}
[Adresse des Anbieters]

${today}

Kündigung des Vertrages ${contractNumber ? `Nr. ${contractNumber}` : ''}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Vertrag "${expense.name}"${contractNumber ? ` (Vertragsnummer: ${contractNumber})` : ''} fristgerecht zum nächstmöglichen Zeitpunkt.

Bitte senden Sie mir eine schriftliche Kündigungsbestätigung mit Angabe des Beendigungszeitpunktes zu.

Für eventuell erfolgende Rückfragen bin ich unter den oben genannten Kontaktdaten erreichbar.

Mit freundlichen Grüßen

${senderName}

__________________
Unterschrift`;
  };

  const cancellationLetter = generateCancellationLetter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cancellationLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fehler beim Kopieren:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([cancellationLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kuendigung_${expense.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (window.confirm(`Möchten Sie den Vertrag "${expense.name}" wirklich kündigen und aus der Liste entfernen?`)) {
      onConfirmCancellation(expense.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-50">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">✍️</span> Vertrag kündigen: {expense.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-slate-700">
              💡 Füllen Sie die folgenden Felder aus, um ein Kündigungsschreiben zu generieren. 
              Sie können das Schreiben dann kopieren, herunterladen und an den Anbieter senden.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Ihr vollständiger Name *</Label>
              <Input
                id="senderName"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>

            <div>
              <Label htmlFor="contractNumber">Vertragsnummer (optional)</Label>
              <Input
                id="contractNumber"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                placeholder="12345678"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="senderAddress">Straße und Hausnummer *</Label>
            <Input
              id="senderAddress"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
              placeholder="Musterstraße 123"
            />
          </div>

          <div>
            <Label htmlFor="senderCity">PLZ und Ort *</Label>
            <Input
              id="senderCity"
              value={senderCity}
              onChange={(e) => setSenderCity(e.target.value)}
              placeholder="12345 Musterstadt"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center gap-2">
                <span className="text-xl">📄</span> Kündigungsschreiben
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!senderName || !senderAddress || !senderCity}
                  className={copied ? 'border-green-300 bg-green-50' : 'hover:border-purple-300'}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Kopiert
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!senderName || !senderAddress || !senderCity}
                  className="hover:border-blue-300"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Herunterladen
                </Button>
              </div>
            </div>
            <Textarea
              value={cancellationLetter}
              readOnly
              className="font-mono text-sm min-h-[400px] bg-white border-2 border-purple-200"
            />
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
            <p className="text-sm text-slate-700">
              <strong className="text-amber-700">⚠️ Hinweis:</strong> Bitte prüfen Sie die Kündigungsfrist in Ihrem Vertrag 
              und versenden Sie das Kündigungsschreiben rechtzeitig per Einschreiben oder 
              E-Mail mit Lesebestätigung.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-orange-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="hover:border-orange-300"
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={!senderName || !senderAddress || !senderCity}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              🗑️ Vertrag kündigen & entfernen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
