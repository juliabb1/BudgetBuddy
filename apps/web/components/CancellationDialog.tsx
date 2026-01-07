import { ContractDTO } from '@repo/shared-types/contract';
import { useCurrentUser } from '@web/lib/auth';
import { Check, Copy, FileDown } from 'lucide-react';
import { useCancellationLetter } from '../hooks/useCancellationLetter';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface CancellationDialogProps {
  contract: ContractDTO;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancellation: (contract: ContractDTO) => void;
}

export function CancellationDialog({
  contract,
  open,
  onOpenChange,
  onConfirmCancellation,
}: CancellationDialogProps) {
  const userName = useCurrentUser()?.name;
  const senderEmail = useCurrentUser()?.email ?? '';

  const {
    contractNumber,
    setContractNumber,
    senderName,
    setSenderName,
    copied,
    terminationDate,
    setTerminationDate,
    cancellationLetter,
    handleCopy,
    handleDownload,
    handleConfirm,
  } = useCancellationLetter(contract, userName ?? undefined, senderEmail);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-linear-to-br from-orange-50 to-amber-50">
        <DialogHeader>
          <DialogTitle className="bg-linear-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">✍️</span> Vertrag kündigen:{' '}
            {contract.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="bg-linear-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
            <p className="text-sm text-slate-700">
              💡 Füllen Sie die folgenden Felder aus, um ein Kündigungsschreiben
              zu generieren. Sie können das Schreiben dann kopieren,
              herunterladen und an den Anbieter senden.
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
            <Label htmlFor="terminationDate">Kündigungsdatum (optional)</Label>
            <Input
              id="terminationDate"
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              placeholder="TT.MM.JJJJ"
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
                  disabled={!senderName || !senderEmail}
                  className={
                    copied
                      ? 'border-green-300 bg-green-50'
                      : 'hover:border-purple-300'
                  }
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
                  disabled={!senderName}
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

          <div className="bg-linear-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
            <p className="text-sm text-slate-700">
              <strong className="text-amber-700">⚠️ Hinweis:</strong> Bitte
              prüfen Sie die Kündigungsfrist in Ihrem Vertrag und versenden Sie
              das Kündigungsschreiben rechtzeitig per Einschreiben oder E-Mail
              mit Lesebestätigung.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-orange-200">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (handleConfirm(onConfirmCancellation)) {
                  onOpenChange(false);
                }
              }}
              disabled={!senderName}
              className="bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
            >
              🗑️ Vertrag kündigen & entfernen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
