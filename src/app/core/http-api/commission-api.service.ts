import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationResult } from 'mch-authentication-v2-lib';

import {
    Commission,
    CommissionSlim
} from '@mch-core/models/commission';
import { FilterCommission } from '@mch-core/models/filters/filter-commission';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CommissionApiService {
    constructor(private readonly http: HttpClient) { }

    getAllCommissions(): Observable<CommissionSlim[]> {
        return this.http.get<CommissionSlim[]>(
            `${environment.apiUrl}/api/Commission`
        );
    }

    getCommissionById(commissionId: string): Observable<Commission> {
        return this.http.get<Commission>(
            `${environment.apiUrl}/api/Commission/${commissionId}`
        );
    }

    searchCommissions(
        filter: FilterCommission,
        page: number,
        pageSize: number
    ): Observable<PaginationResult<Commission>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', pageSize.toString());

        return this.http.post<PaginationResult<Commission>>(
            `${environment.apiUrl}/api/Commission/find`,
            filter,
            { params }
        );
    }

    createOrUpdateCommission(commission: Commission): Observable<void> {
        return this.http.put<void>(
            `${environment.apiUrl}/api/Commission`,
            commission
        );
    }

    deleteCommission(commissionId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/api/Commission/${commissionId}`
        );
    }
}