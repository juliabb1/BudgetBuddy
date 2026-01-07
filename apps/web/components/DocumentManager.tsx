import { Document } from '@repo/shared-types/contract';
import { Download, Eye, FileText, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface DocumentManagerProps {
  documents: Document[];
  onAddDocument: (document: Document) => void;
  onDeleteDocument: (id: string) => void;
  contractId: string;
  token: string;
}

export function DocumentManager({
  documents,
  onAddDocument,
  onDeleteDocument,
  contractId,
  token,
}: DocumentManagerProps) {
  const {
    isUploading,
    previewDoc,
    hasDocuments,
    handleFileUpload,
    handleDownload,
    handlePreview,
    closePreview,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    getUploadButtonText,
    getEmptyCardClass,
    getEmptyIconClass,
    getEmptyIcon,
    getEmptyMainText,
    getEmptySubText,
    getDocumentListClass,
    canPreview,
    formatUploadDate,
    getPreviewType,
  } = useDocumentManager(contractId, token, onAddDocument, documents);

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
              {getUploadButtonText()}
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
        {!hasDocuments ? (
          <Card className={getEmptyCardClass()}>
            <div className={getEmptyIconClass()}>{getEmptyIcon()}</div>
            <p className="text-slate-600 text-sm mb-1">{getEmptyMainText()}</p>
            <p className="text-slate-500 text-xs">{getEmptySubText()}</p>
            <p className="text-slate-500 text-xs mt-1">
              PDF, DOC, DOCX, JPG, PNG (max. 5MB)
            </p>
          </Card>
        ) : (
          <div className={getDocumentListClass()}>
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
                        📅 {formatUploadDate(doc.uploadDate)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-2">
                    {canPreview(doc) && (
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

      <Dialog open={!!previewDoc} onOpenChange={closePreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-4">
              {getPreviewType(previewDoc) === 'image' && (
                <Image
                  src={previewDoc.data}
                  alt={previewDoc.name}
                  width={800}
                  height={600}
                  className="w-full h-auto rounded-lg"
                />
              )}
              {getPreviewType(previewDoc) === 'pdf' && (
                <iframe
                  src={previewDoc.data}
                  className="w-full h-[600px] rounded-lg border"
                  title={previewDoc.name}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
