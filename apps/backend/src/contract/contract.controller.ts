import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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
}
