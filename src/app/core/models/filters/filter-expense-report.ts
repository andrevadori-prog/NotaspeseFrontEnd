import { Sortable } from 'mch-authentication-v2-lib';

export class FilterExpenseReport {
    peopleId?: string;
    costCenterId?: string;
    month?: number;
    year?: number;
    sort?: Sortable;
}