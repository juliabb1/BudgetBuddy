import { Document } from '@repo/shared-types/contract';
import { useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function useDocumentManager(
  contractId: string,
  token: string,
  onAddDocument: (document: Document) => void,
  documents: Document[],
) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const hasDocuments = documents.length > 0;

  const getUploadButtonText = () => (isUploading ? 'Lädt...' : 'Hochladen');

  const getEmptyCardClass = () =>
    `p-8 text-center border-2 border-dashed transition-all duration-200 gap-2 ${
      isDragOver
        ? 'border-purple-500 bg-purple-100 shadow-lg scale-[102%]'
        : 'border-purple-300 bg-linear-to-br from-purple-50 to-pink-50'
    }`;

  const getEmptyIconClass = () =>
    `text-6xl mb-3 transition-transform duration-200 ${
      isDragOver ? 'scale-105' : 'scale-100'
    }`;

  const getEmptyIcon = () => (isDragOver ? '📥' : '📄');

  const getEmptyMainText = () =>
    isDragOver ? 'Datei hier ablegen' : 'Noch keine Dokumente hochgeladen';

  const getEmptySubText = () =>
    isDragOver
      ? 'PDF, DOC, DOCX, JPG, PNG (max. 5MB)'
      : 'Ziehe Dateien hierher oder klicke auf "Hochladen"';

  const getDocumentListClass = () =>
    `space-y-2 transition-all duration-200 ${
      isDragOver
        ? 'ring-2 ring-purple-400 ring-opacity-50 rounded-lg p-2 scale-[102%]'
        : ''
    }`;

  const isImageDocument = (doc: Document) => doc.type.startsWith('image/');

  const isPdfDocument = (doc: Document) => doc.type === 'application/pdf';

  const canPreview = (doc: Document) =>
    isImageDocument(doc) || isPdfDocument(doc);

  const formatUploadDate = (date: string) =>
    new Date(date).toLocaleDateString('de-DE');

  const getPreviewType = (doc: Document | null): 'image' | 'pdf' | 'none' => {
    if (!doc) return 'none';
    if (isImageDocument(doc)) return 'image';
    if (isPdfDocument(doc)) return 'pdf';
    return 'none';
  };

  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      alert('Datei ist zu groß. Maximale Größe: 5MB');
      return false;
    }
    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFileSize(file)) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${contractId}/documents`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const newDocument = await response.json();
      onAddDocument(newDocument);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen der Datei');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!file) return;

    await uploadFile(file);
  };

  const isImageFile = (type: string): boolean => {
    return type.startsWith('image/');
  };

  return {
    isUploading,
    previewDoc,
    isDragOver,
    hasDocuments,
    handleFileUpload,
    handleDownload,
    handlePreview,
    closePreview,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    isImageFile,
    // UI helpers
    getUploadButtonText,
    getEmptyCardClass,
    getEmptyIconClass,
    getEmptyIcon,
    getEmptyMainText,
    getEmptySubText,
    getDocumentListClass,
    isImageDocument,
    isPdfDocument,
    canPreview,
    formatUploadDate,
    getPreviewType,
  };
}
