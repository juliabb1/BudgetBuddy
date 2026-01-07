import { Injectable, Logger } from '@nestjs/common';
import { Contract, Document, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContractService {
  constructor(private readonly prisma: PrismaService) {}

  private logger = new Logger('ContractService');
  private uploadsDir = path.join(process.cwd(), 'uploads');

  async getContractsByUserId(userId: string) {
    const contracts = await this.prisma.contract.findMany({
      where: { userId },
      include: {
        documents: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    // Transform documents to frontend-compatible format
    return contracts.map((contract) => ({
      ...contract,
      documents: contract.documents.map((doc) => ({
        documentId: doc.documentId,
        contractId: doc.contractId,
        originalName: doc.originalName,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: doc.uploadedAt,
        id: doc.documentId,
        name: doc.originalName,
        data: `${process.env.BACKEND_URL || 'http://localhost:3001'}/contracts/documents/${doc.documentId}/download`,
        type: doc.mimeType,
        uploadDate: doc.uploadedAt.toISOString(),
      })),
    }));
  }

  async createContract(
    contract: Prisma.ContractCreateInput,
  ): Promise<Contract> {
    this.logger.log('createContract');

    return this.prisma.contract.create({
      data: contract,
      include: {
        documents: true,
      },
    });
  }

  async updateContract(
    contractId: string,
    contract: Prisma.ContractUpdateInput,
  ): Promise<Contract> {
    this.logger.log('updateContract');

    return this.prisma.contract.update({
      where: { contractId },
      data: contract,
      include: {
        documents: true,
      },
    });
  }

  async deleteContract(contractId: string): Promise<Contract> {
    this.logger.log('deleteContract');

    // Delete associated files
    const documents = await this.prisma.document.findMany({
      where: { contractId },
    });

    for (const doc of documents) {
      try {
        if (fs.existsSync(doc.filePath)) {
          fs.unlinkSync(doc.filePath);
        }
      } catch (error) {
        this.logger.error(`Failed to delete file ${doc.filePath}`, error);
      }
    }

    return this.prisma.contract.delete({
      where: { contractId },
    });
  }

  async addDocument(
    contractId: string,
    file: any, // Express.Multer.File
  ): Promise<any> {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadsDir, fileName);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Save document metadata to database
    const document = await this.prisma.document.create({
      data: {
        contractId,
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    // Return in frontend-compatible format
    return {
      documentId: document.documentId,
      contractId: document.contractId,
      originalName: document.originalName,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      uploadedAt: document.uploadedAt,
      id: document.documentId,
      name: document.originalName,
      data: `${process.env.BACKEND_URL || 'http://localhost:3001'}/contracts/documents/${document.documentId}/download`,
      type: document.mimeType,
      uploadDate: document.uploadedAt.toISOString(),
    };
  }

  async deleteDocument(documentId: string): Promise<Document> {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk
    try {
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${document.filePath}`, error);
    }

    // Delete from database
    return this.prisma.document.delete({
      where: { documentId },
    });
  }

  async getDocumentFile(
    documentId: string,
  ): Promise<{ filePath: string; document: Document }> {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new Error('File not found on disk');
    }

    return { filePath: document.filePath, document };
  }
}
