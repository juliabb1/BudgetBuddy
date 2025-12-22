import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateContractDto } from '@repo/shared-types/contract';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractService } from './contract.service';

@ApiTags('Contracts')
@ApiBearerAuth('JWT-auth')
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get all contracts for current user' })
  @ApiResponse({ status: 200, description: 'Returns array of user contracts' })
  @ApiResponse({ status: 400, description: 'Invalid user ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyContracts(@Req() req: Request) {
    const user = req.user as { userId?: string };

    if (!user?.userId) {
      throw new HttpException(
        'Invalid user authentication',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.contractService.getContractsByUserId(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create new contract' })
  @ApiResponse({ status: 201, description: 'Contract created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createContract(
    @Body() contract: CreateContractDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId?: string };

    if (!user?.userId) {
      throw new HttpException(
        'Invalid user authentication',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.contractService.createContract({
        name: contract.name,
        price: contract.price,
        cycle: contract.cycle,
        startDate: contract.startDate,
        endDate: contract.endDate,
        debitDayOfMonth: contract.debitDayOfMonth,
        category: contract.category,
        isActive: contract.isActive,
        user: { connect: { userId: user.userId } },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async updateContract(
    @Param('id') contractId: string,
    @Body() contract: Partial<Omit<CreateContractDto, 'documents'>>,
  ) {
    try {
      return await this.contractService.updateContract(contractId, {
        ...(contract.name !== undefined && { name: contract.name }),
        ...(contract.price !== undefined && { price: contract.price }),
        ...(contract.cycle !== undefined && { cycle: contract.cycle }),
        ...(contract.startDate !== undefined && {
          startDate: contract.startDate,
        }),
        ...(contract.endDate !== undefined && { endDate: contract.endDate }),
        ...(contract.debitDayOfMonth !== undefined && {
          debitDayOfMonth: contract.debitDayOfMonth,
        }),
        ...(contract.category !== undefined && { category: contract.category }),
        ...(contract.isActive !== undefined && {
          isActive: contract.isActive,
        }),
        ...(contract.documents !== undefined && {
          documents: contract.documents,
        }),
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new HttpException('Contract not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Invalid input data', HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete contract by ID' })
  @ApiResponse({ status: 200, description: 'Contract deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async deleteContract(@Param('id') contractId: string) {
    try {
      return await this.contractService.deleteContract(contractId);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new HttpException('Contract not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Error deleting contract',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for contract' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or contract' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadDocument(
    @Param('id') contractId: string,
    @UploadedFile() file: any, // Express.Multer.File
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      throw new HttpException(
        'File too large (max 5MB)',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new HttpException('Invalid file type', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.contractService.addDocument(contractId, file);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error uploading document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('documents/:documentId')
  @ApiOperation({ summary: 'Delete document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('documentId') documentId: string) {
    try {
      return await this.contractService.deleteDocument(documentId);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error deleting document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('documents/:documentId/download')
  @ApiOperation({ summary: 'Download document file' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async downloadDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const { filePath, document } =
        await this.contractService.getDocumentFile(documentId);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${document.originalName}"`,
      );

      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Error downloading document',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
