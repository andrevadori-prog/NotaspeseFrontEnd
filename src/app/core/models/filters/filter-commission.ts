import { CommissionType } from '@mch-core/enums/commision-type.enum';
import { Sortable } from 'mch-authentication-v2-lib';

export class FilterCommission {
    code?: string;
    description?: string;
    showObsolete = false;
    type?: CommissionType;
    sort?: Sortable;
}