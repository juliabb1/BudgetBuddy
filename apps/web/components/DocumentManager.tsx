import { Download, Eye, FileText, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { formatDate } from '../lib/contractUtils';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

export interface Document {
  id: string;
  name: string;
  data: string;
  type: string;
  uploadDate: string;
}

interface DocumentManagerProps {
  documents: Document[];
  onAddDocument: (document: Omit<Document, 'id' | 'uploadDate'>) => void;
  onDeleteDocument: (id: string) => void;
}

export function DocumentManager({
  documents,
  onAddDocument,
  onDeleteDocument,
}: DocumentManagerProps) {
  const {
    isUploading,
    previewDoc,
    handleFileUpload,
    handleDownload,
    handlePreview,
    closePreview,
    isImageFile,
  } = useDocumentManager(onAddDocument);

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

      {documents.length === 0 ? (
        <Card className="p-8 text-center border-2 border-dashed border-purple-300 bg-linear-to-br from-purple-50 to-pink-50">
          <div className="text-6xl mb-3">📄</div>
          <p className="text-slate-600 text-sm mb-1">
            Noch keine Dokumente hochgeladen
          </p>
          <p className="text-slate-500 text-xs">
            PDF, DOC, DOCX, JPG, PNG (max. 5MB)
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
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
                      📅 {formatDate(doc.uploadDate)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-2">
                  {isImageFile(doc.type) && (
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

      <Dialog open={!!previewDoc} onOpenChange={closePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-4">
              <Image
                src={previewDoc.data}
                alt={previewDoc.name}
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
