import { InternalModelBase } from 'mch-authentication-v2-lib';
import { ExpenseItem } from '@mch-core/models/expense-item';

export class ExpenseReport extends InternalModelBase {
    expenseReportId: string;
    peopleId: string;
    costCenterId: string;

    day: number;
    month: number;
    year: number;

    description: string;

    expenseItems: ExpenseItem[] = [];
}

export class ExpenseReportSlim {
    expenseReportId: string;
    peopleId: string;
    costCenterId: string;

    day: number;
    month: number;
    year: number;
}