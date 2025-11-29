import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { FileText, Upload, Download, Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

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

export function DocumentManager({ documents, onAddDocument, onDeleteDocument }: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei ist zu groß. Maximale Größe: 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      onAddDocument({
        name: file.name,
        data: data,
        type: file.type
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📁</span> Dokumente & Unterlagen
        </h3>
        <Label htmlFor="file-upload" className="cursor-pointer">
          <Button type="button" size="sm" disabled={isUploading} asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
        <Card className="p-8 text-center border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="text-6xl mb-3">📄</div>
          <p className="text-slate-600 text-sm mb-1">Noch keine Dokumente hochgeladen</p>
          <p className="text-slate-500 text-xs">
            PDF, DOC, DOCX, JPG, PNG (max. 5MB)
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all border border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white flex-shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-900 truncate">{doc.name}</div>
                    <div className="text-xs text-slate-500">
                      📅 {new Date(doc.uploadDate).toLocaleDateString('de-DE')}
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

      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="mt-4">
              <img 
                src={previewDoc.data} 
                alt={previewDoc.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}