import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzHelper, Pagination, Sortable, ConfigEnableMode, UserApi, UserSlim } from 'mch-authentication-v2-lib';

import { PeopleApiService } from '@mch-core/http-api/people-api.service';
import { People } from '@mch-core/models/people';
import { FilterPeople } from '@mch-core/models/filters/filter-people';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalPeopleComponent } from './modals/modal-people/modal-people.component';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-people',
  standalone: false,
  templateUrl: './people.component.html',
  styleUrl: './people.component.scss'
})
export class PeopleComponent implements OnInit {
  userList: UserSlim[] = [];
  peoples: People[] = [];
  readonly ConfigEnableMode = ConfigEnableMode;
  pagination = new Pagination(50);
  filterPeople = new FilterPeople();
  sortPeople?: Sortable;
  nzHelper = new NzHelper();
  errore = '';

  constructor(
    private readonly userApi: UserApi,
    private readonly peopleApi: PeopleApiService,
    private readonly modal: NzModalService,
    private readonly notification: NzNotificationService
  ) { }

  ngOnInit(): void {
    this.userApi.getAllUsers().subscribe({
      next: (users) => {
        this.userList = users;
      },
      error: () => {
        this.notification.error(
          'Persone',
          'Impossibile caricare gli account utente.'
        );
      }
    });
  }

  onDelete(persona: People): void {
    this.modal.confirm({
      nzTitle: 'Eliminare la persona selezionata?',
      nzContent: 'La cancellazione è definitiva.',
      nzOkText: 'Elimina',
      nzOkDanger: true,
      nzCancelText: 'Annulla',

      nzOnOk: () => new Promise<boolean>((resolve) => {
        this.peopleApi.deletePeople(persona.peopleId).subscribe({
          next: () => {
            this.notification.success(
              'Persone',
              'Persona eliminata correttamente.'
            );

            this.pagination.currentPage = 1;
            this.findPeoples();
            resolve(true);
          },

          error: (err) => {
            const message = err?.error?.Message;

            const messaggio =
              message === 'common.used-relation'
                ? 'La persona è collegata a note spese e non può essere eliminata.'
                : 'Impossibile eliminare la persona. Riprova.';

            this.notification.error('Persone', messaggio);
            resolve(false);
          }
        });
      })
    });
  }

  onView(persona: People): void {
    this.errore = '';

    this.peopleApi.getPeopleById(persona.peopleId).subscribe({
      next: (people) => {
        this.onOpen(people, true);
      },
      error: () => {
        this.notification.error(
          'Persone',
          'Impossibile caricare la persona.'
        );
      }
    });
  }

  onEdit(persona: People): void {
    this.errore = '';

    this.peopleApi.getPeopleById(persona.peopleId).subscribe({
      next: (people) => {
        this.onOpen(people);
      },
      error: () => {
        this.notification.error(
          'Persone',
          'Impossibile caricare la persona.'
        );
      }
    });
  }

  onOpen(people?: People, solaLettura = false): void {
    const modalRef = this.modal.create({
      nzTitle: solaLettura
        ? 'Dettagli persona'
        : people ? 'Modifica persona' : 'Nuova persona',
      nzContent: ModalPeopleComponent,
      nzWidth: 600,
      nzFooter: null,
      nzOnCancel: (instance: ModalPeopleComponent) =>
        instance.salvataggio ? false : undefined
    });

    const component = modalRef.componentInstance!;
    component.userList = this.userList;
    component.people = people;
    component.readOnly = solaLettura;

    component.cancel.subscribe(() => {
      if (!component.salvataggio) {
        modalRef.close();
      }
    });

    component.save.subscribe((people: People) => {
      if (component.salvataggio) {
        return;
      }

      component.salvataggio = true;
      component.peopleForm.disable();
      component.errore = '';

      this.peopleApi.createOrUpdatePeople(people).subscribe({
        next: () => {
          modalRef.close();

          this.notification.success(
            'Persone',
            'Persona salvata correttamente.'
          );

          this.findPeoples();
        },
        error: () => {
          component.salvataggio = false;
          component.peopleForm.enable();

          this.notification.error(
            'Persone',
            'Salvataggio non riuscito. Controlla i dati e riprova.'
          );
        }
      });
    });
  }
  onFilterChange(filter: FilterPeople): void {
    this.filterPeople = filter;
    this.pagination.currentPage = 1;
    this.findPeoples();
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pagination.currentPage = params.pageIndex;
    this.pagination.pageSize = params.pageSize;

    const currentSort = params.sort.find(item => item.value !== null);

    this.sortPeople = currentSort
      ? new Sortable().setValuesFromNz(
        currentSort.key,
        currentSort.value
      )
      : undefined;

    this.findPeoples();
  }

  private findPeoples(): void {
    this.nzHelper.loading = true;
    this.errore = '';
    this.filterPeople.sort = this.sortPeople;
    this.peopleApi.searchPeoples(
      this.filterPeople,
      this.pagination.currentPage,
      this.pagination.pageSize
    ).subscribe({
      next: (res) => {
        this.peoples = res.result;
        this.pagination.setCollectionSize(res.collectionSize);
        this.nzHelper.loading = false;
      },
      error: () => {
        this.nzHelper.loading = false;

        this.notification.error(
          'Persone',
          'Impossibile caricare le persone.'
        );
      }
    });
  }
}