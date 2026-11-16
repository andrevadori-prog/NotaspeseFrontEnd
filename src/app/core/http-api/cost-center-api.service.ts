import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationResult } from 'mch-authentication-v2-lib';

import {
    CostCenter,
    CostCenterSlim
} from '@mch-core/models/cost-center';
import { FilterCostCenter } from '@mch-core/models/filters/filter-cost-center';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CostCenterApiService {
    constructor(private readonly http: HttpClient) { }

    getAllCostCenters(): Observable<CostCenterSlim[]> {
        return this.http.get<CostCenterSlim[]>(
            `${environment.apiUrl}/api/CostCenter`
        );
    }

    getCostCenterById(costCenterId: string): Observable<CostCenter> {
        return this.http.get<CostCenter>(
            `${environment.apiUrl}/api/CostCenter/${costCenterId}`
        );
    }

    searchCostCenters(
        filter: FilterCostCenter,
        page: number,
        pageSize: number
    ): Observable<PaginationResult<CostCenter>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', pageSize.toString());

        return this.http.post<PaginationResult<CostCenter>>(
            `${environment.apiUrl}/api/CostCenter/find`,
            filter,
            { params }
        );
    }

    createOrUpdateCostCenter(costCenter: CostCenter): Observable<CostCenter> {
        return this.http.put<CostCenter>(
            `${environment.apiUrl}/api/CostCenter`,
            costCenter
        );
    }

    deleteCostCenter(costCenterId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/api/CostCenter/${costCenterId}`
        );
    }
}