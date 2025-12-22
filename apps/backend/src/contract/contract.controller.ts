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

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyContracts(@Req() req: Request) {
    const user = req.user as { userId?: string };

    if (!user?.userId) {
      throw new Error('JWT payload does not include userId');
    }

    return this.contractService.getContractsByUserId(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createContract(
    @Body() contract: CreateContractDto,
    @Req() req: Request,
  ) {
    const user = req.user as { userId?: string };

    if (!user?.userId) {
      throw new Error('UserId missing in JWT payload');
    }

    try {
      return this.contractService.createContract({
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
    } catch (error) {
      throw new Error('Error creating contract: ' + (error as Error).message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateContract(
    @Param('id') contractId: string,
    @Body() contract: Partial<Omit<CreateContractDto, 'documents'>>,
  ) {
    try {
      return this.contractService.updateContract(contractId, {
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
      });
    } catch (error) {
      throw new Error('Error updating contract: ' + (error as Error).message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteContract(@Param('id') contractId: string) {
    try {
      return this.contractService.deleteContract(contractId);
    } catch (error) {
      throw new Error('Error deleting contract: ' + (error as Error).message);
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
