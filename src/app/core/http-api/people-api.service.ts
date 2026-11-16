import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterPeople } from '@mch-core/models/filters/filter-people';
import { PaginationResult } from 'mch-authentication-v2-lib';

import { People } from '@mch-core/models/people';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PeopleApiService {
    constructor(private readonly http: HttpClient) { }

    getCurrentPeople(): Observable<People> {
        return this.http.get<People>(
            `${environment.apiUrl}/api/People/me`
        );
    }

    getAllPeoples(): Observable<People[]> {
        return this.http.get<People[]>(
            `${environment.apiUrl}/api/People`
        );
    }

    getPeopleById(peopleId: string): Observable<People> {
        return this.http.get<People>(
            `${environment.apiUrl}/api/People/${peopleId}`
        );
    }

    searchPeoples(
        filter: FilterPeople,
        page: number,
        pageSize: number
    ): Observable<PaginationResult<People>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', pageSize.toString());

        return this.http.post<PaginationResult<People>>(
            `${environment.apiUrl}/api/People/find`,
            filter,
            { params }
        );
    }

    createOrUpdatePeople(people: People): Observable<People> {
        return this.http.put<People>(
            `${environment.apiUrl}/api/People`,
            people
        );
    }

    deletePeople(peopleId: string): Observable<void> {
        return this.http.delete<void>(
            `${environment.apiUrl}/api/People/${peopleId}`
        );
    }
}