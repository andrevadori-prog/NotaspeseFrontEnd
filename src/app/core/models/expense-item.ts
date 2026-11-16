import { InternalModelBase } from 'mch-authentication-v2-lib';
import { ExpenseItemDetail } from '@mch-core/models/expense-item-detail';

export class ExpenseItem extends InternalModelBase {
    expenseItemId: string;
    expenseReportId: string;
    commissionId: string | null = null;

    dayOfMonth: number;
    description: string;
    category: string;

    currencyCode: string;
    foreignAmount: number | null = null;
    amountEur: number;

    expenseItemDetails: ExpenseItemDetail[] = [];
}

export class ExpenseItemSlim {
    expenseItemId: string;
    category: string;
    amountEur: number;
}