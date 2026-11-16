import { ConfigEnableMode, Sortable } from "mch-authentication-v2-lib";

export class FilterPeople {
    name?: string;
    surname?: string;
    statuses: ConfigEnableMode[] = [];
    sort?: Sortable;
}


