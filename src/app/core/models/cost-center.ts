import { InternalModelBase } from 'mch-authentication-v2-lib';

export class CostCenter extends InternalModelBase {
    costCenterId: string;
    costCenterName: string;
    code: string;
    description: string;
}

export class CostCenterSlim {
    costCenterId: string;
    code: string;
}