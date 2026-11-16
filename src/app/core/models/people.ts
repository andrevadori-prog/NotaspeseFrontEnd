import { ConfigEnableMode, InternalModelBase } from "mch-authentication-v2-lib";

export class People extends InternalModelBase {
    peopleId: string;
    name: string;
    surname: string;
    badge: string | null;
    userId: string | null;
    active: ConfigEnableMode;
}