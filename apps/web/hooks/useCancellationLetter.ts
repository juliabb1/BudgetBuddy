import { ContractDTO } from '@repo/shared-types/contract';
import { useCallback, useMemo, useState } from 'react';

export function useCancellationLetter(
  contract: ContractDTO,
  userName: string | undefined,
  senderEmail: string | undefined,
) {
  const [contractNumber, setContractNumber] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [copied, setCopied] = useState(false);
  const [terminationDate, setTerminationDate] = useState('');

  const today = useMemo(() => {
    return new Date().toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const isToday = (dateString: string): boolean => {
    if (!dateString) return false;
    const inputDate = new Date(dateString);
    const todayDate = new Date();
    return (
      inputDate.getFullYear() === todayDate.getFullYear() &&
      inputDate.getMonth() === todayDate.getMonth() &&
      inputDate.getDate() === todayDate.getDate()
    );
  };

  const getTerminationText = useCallback((): string => {
    if (!terminationDate || isToday(terminationDate)) {
      return 'fristgerecht zum nächstmöglichen Zeitpunkt';
    }

    const formattedDate = new Date(terminationDate).toLocaleDateString(
      'de-DE',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    );

    return `zum ${formattedDate}`;
  }, [terminationDate]);

  const cancellationLetter = useMemo(() => {
    const terminationText = getTerminationText();
    const contractInfo = contractNumber
      ? ` (Vertragsnummer: ${contractNumber})`
      : '';

    return `
${today}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Vertrag '${contract.name}'${contractInfo} ${terminationText}.

Bitte senden Sie mir eine schriftliche Kündigungsbestätigung mit Angabe des Beendigungszeitpunktes zu.

Für eventuell erfolgende Rückfragen bin ich unter der E-Mail '${senderEmail}' erreichbar.


Mit freundlichen Grüßen
${senderName}
`;
  }, [
    contract.name,
    contractNumber,
    senderEmail,
    senderName,
    today,
    getTerminationText,
  ]);

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
    const filename = `Kuendigung_${contract.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = (
    onConfirmCancellation: (contract: ContractDTO) => void,
  ) => {
    if (
      window.confirm(
        `Möchten Sie den Vertrag "${contract.name}" wirklich kündigen?`,
      )
    ) {
      onConfirmCancellation(contract);
      return true;
    }
    return false;
  };

  return {
    contractNumber,
    setContractNumber,
    senderName,
    setSenderName,
    copied,
    terminationDate,
    setTerminationDate,
    today,
    cancellationLetter,
    handleCopy,
    handleDownload,
    handleConfirm,
  };
}
