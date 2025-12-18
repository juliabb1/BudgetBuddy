import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Contract, Prisma } from '@prisma/client';

@Injectable()
export class ContractService {
  constructor(private readonly prisma: PrismaService) {}

  private logger = new Logger('ContractService');

  async getContractsByUserId(userId: string) {
    return this.prisma.contract.findMany({
      where: { userId },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async createContract(
    contract: Prisma.ContractCreateInput,
  ): Promise<Contract> {
    this.logger.log('createContract');

    return this.prisma.contract.create({ data: contract });
  }

  // Optional: weitere Methoden (findAll, findByUser, delete, etc.)
}
