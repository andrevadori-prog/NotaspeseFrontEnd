import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeopleComponent } from './people/people.component';
import { CommissionsComponent } from './commissions/commissions.component';
import { CostCentersComponent } from './cost-centers/cost-centers.component';
import { Menu, RoleGuard } from 'mch-authentication-v2-lib';

const routes: Routes = [
  {
    path: 'people',
    component: PeopleComponent,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'menus',
    component: Menu,
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  { path: 'commissions', component: CommissionsComponent },
  { path: 'cost-centers', component: CostCentersComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
