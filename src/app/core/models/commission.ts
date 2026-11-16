import { RecordStatus } from "@mch-core/enums/record-status.enums";
import { InternalModelBase } from "mch-authentication-v2-lib";
import { CommissionType } from "@mch-core/enums/commision-type.enum";

export class Commission extends InternalModelBase {
    commissionId: string;
    code: string;
    description: string;
    status: RecordStatus;
    type: CommissionType;
}

export class CommissionSlim {
    commissionId: string;
    code: string;
}