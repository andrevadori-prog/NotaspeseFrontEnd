import { Component, inject } from '@angular/core';
import { AuthApi, ModalLogin } from 'mch-authentication-v2-lib';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { TranslateService } from '@ngx-translate/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { takeUntil } from 'rxjs';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NzMenuModule,
    NzLayoutModule,
    NzButtonModule,
    NzDropDownModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly modal = inject(NzModalService);
  private loginModal?: NzModalRef<ModalLogin>;

  isCollapsed = false;
  uscitaInCorso = false;

  constructor() {
    this.translate.use('it');
  }

  openLoginModal(): void {
    if (this.loginModal || this.authApi.isAuthenticated()) {
      return;
    }

    const modalRef = this.modal.create<ModalLogin>({
      nzContent: ModalLogin,
      nzWidth: 620,
      nzFooter: null,
      nzClosable: true,
      nzMaskClosable: false
    });

    this.loginModal = modalRef;

    const component = modalRef.componentInstance!;
    component.showAutoLogin = false;

    component.close
      .pipe(takeUntil(modalRef.afterClose))
      .subscribe(() => {
        modalRef.close();
      });

    modalRef.afterClose.subscribe(() => {
      this.loginModal = undefined;

      if (this.authApi.isAuthenticated()) {
        void this.router.navigateByUrl('/expenses/reports');
      }
    });
  }

  esci(): void {
    if (this.uscitaInCorso) {
      return;
    }

    this.uscitaInCorso = true;

    const completaUscita = () => {
      this.uscitaInCorso = false;
      void this.router.navigateByUrl('/home');
    };

    this.authApi.logout().subscribe({
      next: completaUscita,
      error: completaUscita
    });
  }
}