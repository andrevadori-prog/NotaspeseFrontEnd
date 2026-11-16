import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { PeopleComponent } from './people/people.component';
import { PeopleFilterComponent } from './people/components/people-filter/people-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ModalPeopleComponent } from './people/modals/modal-people/modal-people.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { CommissionsComponent } from './commissions/commissions.component';
import { CommissionsFilterComponent } from './commissions/components/commissions-filter/commissions-filter.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { ModalCommissionsComponent } from './commissions/modals/modal-commissions/modal-commissions.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { CostCentersComponent } from './cost-centers/cost-centers.component';
import { CostCentersFilterComponent } from './cost-centers/components/cost-centers-filter/cost-centers-filter.component';
import { ModalCostCentersComponent } from './cost-centers/modals/modal-cost-centers/modal-cost-centers.component';
import { MchAuthenticationV2LibModule } from 'mch-authentication-v2-lib';



@NgModule({
  declarations: [
    PeopleComponent,
    PeopleFilterComponent,
    ModalPeopleComponent,
    CommissionsComponent,
    CommissionsFilterComponent,
    ModalCommissionsComponent,
    CostCentersComponent,
    CostCentersFilterComponent,
    ModalCostCentersComponent
  ],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    NzTableModule,
    ReactiveFormsModule,
    NzCardModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzModalModule,
    NzFormModule,
    NzCheckboxModule,
    NzDropDownModule,
    MchAuthenticationV2LibModule
  ]
})
export class ConfigurationModule { }
