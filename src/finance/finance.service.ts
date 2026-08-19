import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async getFinancialOverview() {
    const [overview] = await this.tenantModel.aggregate([
      // Separa os projetos para calcularmos os valores individuais por ecossistema
      { $unwind: '$projects' },
      {
        $facet: {
          // 1. MRR (Receita Mensal Recorrente): Soma das mensalidades de clientes ATIVOS
          mrr: [
            { $match: { status: 'ACTIVE' } },
            { $group: { _id: null, total: { $sum: '$projects.monthlyFee' } } },
          ],
          
          // 2. Setup Fees: Dinheiro feito em taxas de adesão
          setupTotal: [
            { $match: { status: { $ne: 'CANCELED' } } },
            { $group: { _id: null, total: { $sum: '$projects.setupFee' } } },
          ],

          // 3. Risco Financeiro: Valor retido em clientes inadimplentes
          overdue: [
            { $match: { status: 'IN_DEFAULT' } },
            { $group: { _id: null, total: { $sum: '$projects.monthlyFee' } } },
          ],

          // 4. Previsão de Caixa (Fluxo por Vencimento): Agrupa os valores pelos dias do mês
          billingCycle: [
            { $match: { status: 'ACTIVE' } },
            {
              $group: {
                _id: '$projects.billingDay',
                expectedRevenue: { $sum: '$projects.monthlyFee' },
                clientCount: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } }, // Ordena do dia 1 ao 31
          ],

          // 5. Clientes na Zona de Atenção (Inadimplentes e Suspensos)
          attentionRequired: [
            { $match: { status: { $in: ['IN_DEFAULT', 'SUSPENDED'] } } },
            {
              $project: {
                _id: 1,
                tradeName: 1,
                status: 1,
                projectName: '$projects.projectName',
                monthlyFee: '$projects.monthlyFee',
                billingDay: '$projects.billingDay',
              },
            },
            { $sort: { billingDay: 1 } }
          ],
        },
      },
    ]);

    // Formatando o retorno para o Angular consumir de forma limpa
    return {
      mrr: overview.mrr[0]?.total || 0,
      setupTotal: overview.setupTotal[0]?.total || 0,
      overdue: overview.overdue[0]?.total || 0,
      billingCycle: overview.billingCycle.map((cycle: any) => ({
        day: cycle._id,
        expectedRevenue: cycle.expectedRevenue,
        clientCount: cycle.clientCount,
      })),
      attentionRequired: overview.attentionRequired,
    };
  }
}