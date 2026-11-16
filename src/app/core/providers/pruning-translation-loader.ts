/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * Translation loader that replaces empty strings with nothing.
 *
 * ngx-translate-extract writes empty strings into json files.
 * The problem is that these empty strings don't trigger
 * the MissingTranslationHandler - they are simply empty strings...
 *
 */
export class PruningTranslationLoader implements TranslateLoader {
    constructor(
        private readonly http: HttpClient,
        private readonly prefix: string = '/assets/i18n/',
        private readonly suffix: string = '.json'
    ) { }

    public getTranslation(lang: string): any {
        return this.http.get(`${this.prefix}${lang}${this.suffix}`).pipe(map((res: object) => this.process(res)));
    }

    private process(object: any) {
        const newObject: any = {};

        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                if (typeof object[key] === 'object') {
                    newObject[key] = this.process(object[key]);
                } else if (typeof object[key] === 'string' && object[key] === '') {
                    // do not copy empty strings\
                } else {
                    newObject[key] = object[key];
                }
            }
        }

        return newObject;
    }
}