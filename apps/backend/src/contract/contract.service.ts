import { Injectable, Logger } from '@nestjs/common';
import { Contract, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

  async updateContract(
    contractId: string,
    contract: Prisma.ContractUpdateInput,
  ): Promise<Contract> {
    this.logger.log('updateContract');

    return this.prisma.contract.update({
      where: { contractId },
      data: contract,
    });
  }

  async deleteContract(contractId: string): Promise<Contract> {
    this.logger.log('deleteContract');
    return this.prisma.contract.delete({
      where: { contractId },
    });
  }
}
