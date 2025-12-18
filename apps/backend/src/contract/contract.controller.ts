import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateContractDto } from '@repo/shared-types/contract';
import type { Request } from 'express';
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
    @Body() contract: Partial<CreateContractDto>,
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
        ...(contract.isActive !== undefined && { isActive: contract.isActive }),
        ...(contract.documents !== undefined && {
          documents: contract.documents,
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
}
