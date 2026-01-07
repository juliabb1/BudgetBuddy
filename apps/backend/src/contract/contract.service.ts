import { Injectable, Logger } from '@nestjs/common';
import { Contract, Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

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
        data: doc.data
          ? `data:${doc.mimeType};base64,${Buffer.from(doc.data).toString('base64')}`
          : `${process.env.BACKEND_URL || 'http://localhost:3001'}/contracts/documents/${doc.documentId}/download`,
        uploadedAt: doc.uploadedAt,
        id: doc.documentId,
        name: doc.originalName,
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

  async addDocument(contractId: string, file: MulterFile) {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    const filePath = path.join(this.uploadsDir, fileName);

    // Save file to disk (backup)
    fs.writeFileSync(filePath, file.buffer);

    // Save document with binary data to database
    const document = await this.prisma.document.create({
      data: {
        contractId,
        originalName: file.originalname,
        fileName,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        data: Buffer.from(file.buffer), // Store binary data
      },
    });

    // Return in frontend-compatible format with base64 data
    return {
      documentId: document.documentId,
      contractId: document.contractId,
      originalName: document.originalName,
      fileName: document.fileName,
      filePath: document.filePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      data: `data:${document.mimeType};base64,${Buffer.from(document.data).toString('base64')}`,
      uploadedAt: document.uploadedAt,
      id: document.documentId,
      name: document.originalName,
      type: document.mimeType,
      uploadDate: document.uploadedAt.toISOString(),
    };
  }

  async deleteDocument(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from disk (backup file)
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

  async getDocumentFile(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Return data from database or read from file
    if (document.data) {
      return {
        data: Buffer.from(document.data),
        mimeType: document.mimeType,
        originalName: document.originalName,
      };
    } else {
      // Fallback to file system if data not in DB
      if (!fs.existsSync(document.filePath)) {
        throw new Error('File not found');
      }
      return {
        data: fs.readFileSync(document.filePath),
        mimeType: document.mimeType,
        originalName: document.originalName,
      };
    }
  }
}
