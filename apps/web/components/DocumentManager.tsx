import { useState } from 'react';
import { Document } from '@repo/shared-types/contract';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, Upload, Download, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import Image from 'next/image';

interface DocumentManagerProps {
  documents: Document[];
  onAddDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
  token: string;
}

export function DocumentManager({
  documents,
  onAddDocument,
  onDeleteDocument,
  contractId,
  token,
}: DocumentManagerProps & { contractId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximale Größe: 5MB');
      return;
    }

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

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.data, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name; // Use the document name for download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Fehler beim Herunterladen der Datei');
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const response = await fetch(doc.data, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Preview failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      setPreviewUrl(url);
      setPreviewDoc(doc);
    } catch (error) {
      console.error('Preview error:', error);
      alert('Fehler beim Laden der Vorschau');
    }
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

    const file = files[0]; // Only handle first file for now
    if (!file) return;

    await uploadFile(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📁</span> Dokumente & Unterlagen
        </h3>
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Button
            type="button"
            size="sm"
            disabled={isUploading}
            asChild
            className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Lädt...' : 'Hochladen'}
            </span>
          </Button>
        </Label>
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      <div
        className={`transition-all duration-200`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {documents.length === 0 ? (
          <Card
            className={`p-8 text-center border-2 border-dashed transition-all duration-200 gap-2 ${
              isDragOver
                ? 'border-purple-500 bg-purple-100 shadow-lg scale-[102%]'
                : 'border-purple-300 bg-linear-to-br from-purple-50 to-pink-50'
            }`}
          >
            <div
              className={`text-6xl mb-3 transition-transform duration-200 ${
                isDragOver ? 'scale-105' : 'scale-100'
              }`}
            >
              {isDragOver ? '📥' : '📄'}
            </div>
            <p className="text-slate-600 text-sm mb-1">
              {isDragOver
                ? 'Datei hier ablegen'
                : 'Noch keine Dokumente hochgeladen'}
            </p>
            <p className="text-slate-500 text-xs">
              {isDragOver
                ? 'PDF, DOC, DOCX, JPG, PNG (max. 5MB)'
                : 'Ziehe Dateien hierher oder klicke auf "Hochladen"'}
            </p>
            <p className="text-slate-500 text-xs mt-1">
              PDF, DOC, DOCX, JPG, PNG (max. 5MB)
            </p>
          </Card>
        ) : (
          <div
            className={`space-y-2 transition-all duration-200 ${
              isDragOver
                ? 'ring-2 ring-purple-400 ring-opacity-50 rounded-lg p-2 scale-[102%]'
                : ''
            }`}
          >
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all border border-purple-100"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="bg-linear-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-white shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        📅{' '}
                        {new Date(doc.uploadDate).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {doc.type.startsWith('image/') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(doc)}
                        className="hover:bg-blue-50"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="hover:bg-green-50"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteDocument(doc.id)}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!previewDoc}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDoc(null);
            if (previewUrl) {
              window.URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
            }
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && previewUrl && (
            <div className="mt-4">
              <Image
                src={previewUrl}
                alt={previewDoc.name}
                className="w-full h-auto rounded-lg"
                width={800}
                height={600}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
