import { Component, Input } from '@angular/core';

import { CommissionSlim } from '@mch-core/models/commission';
import { CostCenterSlim } from '@mch-core/models/cost-center';
import { ExpenseItem } from '@mch-core/models/expense-item';
import { ExpenseReport } from '@mch-core/models/expense-report';
import { People } from '@mch-core/models/people';

type CostCenterTotal = {
  costCenterId: string;
  code: string;
  amountEur: number;
};

@Component({
  selector: 'app-modal-expense-summary',
  standalone: false,
  templateUrl: './modal-expense-summary.component.html',
  styleUrl: './modal-expense-summary.component.scss'
})
export class ModalExpenseSummaryComponent {
  @Input() report?: ExpenseReport;
  @Input() peoples: People[] = [];
  @Input() costCenters: CostCenterSlim[] = [];
  @Input() commissions: CommissionSlim[] = [];

  readonly months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile',
    'Maggio', 'Giugno', 'Luglio', 'Agosto',
    'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  get personName(): string {
    const person = this.peoples.find(
      current => current.peopleId === this.report?.peopleId
    );

    return person
      ? `${person.name} ${person.surname}`
      : 'Dipendente non disponibile';
  }

  get monthName(): string {
    const month = this.report?.month ?? 0;

    return this.months[month - 1] ?? '';
  }

  get otherExpenses(): ExpenseItem[] {
    return (this.report?.expenseItems ?? []).filter(
      item => item.category?.trim().toLowerCase() !== 'auto'
    );
  }

  get autoExpenses(): ExpenseItem[] {
    return (this.report?.expenseItems ?? []).filter(
      item => item.category?.trim().toLowerCase() === 'auto'
    );
  }

  getTotal(items: readonly ExpenseItem[]): number {
    const totalCents = items.reduce(
      (total, item) => total + Math.round(item.amountEur * 100),
      0
    );

    return totalCents / 100;
  }

  getCommissionCode(commissionId: string | null): string {
    if (!commissionId) {
      return '—';
    }

    return this.commissions.find(
      commission => commission.commissionId === commissionId
    )?.code ?? '—';
  }

  getCostCenterCode(costCenterId: string): string {
    return this.costCenters.find(
      costCenter => costCenter.costCenterId === costCenterId
    )?.code ?? 'Centro non disponibile';
  }

  getCostCenterTotals(): CostCenterTotal[] {
    if (!this.report) {
      return [];
    }

    const totals = new Map<string, number>();

    const addAmount = (costCenterId: string, cents: number): void => {
      totals.set(
        costCenterId,
        (totals.get(costCenterId) ?? 0) + cents
      );
    };

    for (const item of this.report.expenseItems ?? []) {
      const itemCents = Math.round(item.amountEur * 100);

      let allocatedCents = 0;

      for (const detail of item.expenseItemDetails ?? []) {
        const detailCents = Math.round(
          itemCents * detail.perCent / 100
        );

        addAmount(detail.costCenterId, detailCents);
        allocatedCents += detailCents;
      }

      const defaultCostCenterCents = itemCents - allocatedCents;

      if (defaultCostCenterCents !== 0) {
        addAmount(this.report.costCenterId, defaultCostCenterCents);
      }
    }

    return [...totals.entries()]
      .map(([costCenterId, amountCents]) => ({
        costCenterId,
        code: this.getCostCenterCode(costCenterId),
        amountEur: amountCents / 100
      }))
      .sort((first, second) =>
        first.code.localeCompare(second.code)
      );
  }

  onPrint(): void {
    const printableContent = document.querySelector(
      '.expense-summary'
    )?.outerHTML;

    if (!printableContent) {
      return;
    }

    const printWindow = window.open(
      '',
      'nota-spese-print',
      'width=900,height=900'
    );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!doctype html>
      <html lang="it">
        <head>
          <meta charset="utf-8">
          <title>Riepilogo nota spese</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              color: #262626;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
            }

            h3 {
              margin: 0 0 20px;
              font-size: 22px;
            }

            h4 {
              margin: 28px 0 12px;
              font-size: 16px;
            }

            .summary-actions {
              display: none;
            }

            .summary-information {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              margin-bottom: 24px;
            }

            .summary-information p {
              margin: 0;
              padding: 12px;
              border: 1px solid #d9d9d9;
              border-radius: 4px;
            }

            nz-table {
              display: block;
              margin-bottom: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              padding: 8px;
              border-bottom: 1px solid #d9d9d9;
              text-align: left;
            }

            th {
              background: #f5f5f5;
              font-weight: 700;
            }

            th:last-child,
            td:last-child {
              text-align: right;
            }

            tfoot td {
              font-weight: 700;
            }

            .summary-total {
              display: flex;
              justify-content: space-between;
              margin-top: 24px;
              padding: 14px;
              font-size: 16px;
              border: 1px solid #91d5ff;
            }
          </style>
        </head>

        <body>
          ${printableContent}
        </body>
      </html>
    `);

    printWindow.document.close();

    window.setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  }
}