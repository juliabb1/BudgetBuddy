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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateContractDto } from '@repo/shared-types/contract';
import type { Request } from 'express';
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
    @Body() contract: Partial<CreateContractDto>,
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
}
