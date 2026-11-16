import { InternalModelBase } from 'mch-authentication-v2-lib';

export class ExpenseItemDetail extends InternalModelBase {
    expenseItemDetailId: string;
    expenseItemId: string;
    costCenterId: string;
    perCent: number;
}