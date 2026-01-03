import { useState } from 'react';
import { Document } from '../components/DocumentManager';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useDocumentManager(
  onAddDocument: (document: Omit<Document, 'id' | 'uploadDate'>) => void,
) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      alert('Datei ist zu groß. Maximale Größe: 5MB');
      return false;
    }
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFileSize(file)) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      onAddDocument({
        name: file.name,
        data: data,
        type: file.type,
      });
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDownload = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  const handlePreview = (doc: Document) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  const isImageFile = (type: string): boolean => {
    return type.startsWith('image/');
  };

  return {
    isUploading,
    previewDoc,
    handleFileUpload,
    handleDownload,
    handlePreview,
    closePreview,
    isImageFile,
  };
}
