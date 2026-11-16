import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationResult } from 'mch-authentication-v2-lib';

import {
    ExpenseReport,
    ExpenseReportSlim
} from '@mch-core/models/expense-report';
import { FilterExpenseReport } from '@mch-core/models/filters/filter-expense-report';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ExpenseReportApiService {
    constructor(private readonly http: HttpClient) { }

    getAllExpenseReports(): Observable<ExpenseReportSlim[]> {
        return this.http.get<ExpenseReportSlim[]>(
            `${environment.apiUrl}/api/ExpenseReport`
        );
    }

    getExpenseReportById(expenseReportId: string): Observable<ExpenseReport> {
        return this.http.get<ExpenseReport>(
            `${environment.apiUrl}/api/ExpenseReport/${expenseReportId}`
        );
    }

    getExpenseReportTotal(expenseReportId: string): Observable<number> {
        return this.http.get<number>(
            `${environment.apiUrl}/api/ExpenseReport/${expenseReportId}/total`
        );
    }

    searchExpenseReports(
        filter: FilterExpenseReport,
        page: number,
        pageSize: number
    ): Observable<PaginationResult<ExpenseReport>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', pageSize.toString());

        return this.http.post<PaginationResult<ExpenseReport>>(
            `${environment.apiUrl}/api/ExpenseReport/find`,
            filter,
            { params }
        );
    }

    createOrUpdateExpenseReport(report: ExpenseReport): Observable<ExpenseReport> {
        return this.http.put<ExpenseReport>(
            `${environment.apiUrl}/api/ExpenseReport`,
            report
        );
    }

    deleteExpenseReport(expenseReportId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/api/ExpenseReport/${expenseReportId}`
        );
    }
}