import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpensesRoutingModule } from './expenses-routing.module';
import { ExpenseReportsComponent } from './expense-reports/expense-reports.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ExpenseReportsFilterComponent } from './expense-reports/components/expense-reports-filter/expense-reports-filter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { ModalExpenseReportsComponent } from './expense-reports/modals/modal-expense-reports/modal-expense-reports.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ModalExpenseItemsComponent } from './expense-reports/modals/modal-expense-items/modal-expense-items.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { ModalExpenseSummaryComponent } from './expense-reports/modals/modal-expense-summary/modal-expense-summary.component';



@NgModule({
  declarations: [
    ExpenseReportsComponent,
    ExpenseReportsFilterComponent,
    ModalExpenseReportsComponent,
    ModalExpenseItemsComponent,
    ModalExpenseSummaryComponent
  ],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    NzTableModule,
    NzButtonModule,
    ReactiveFormsModule,
    NzCardModule,
    NzSelectModule,
    NzInputNumberModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDropDownModule
  ]
})
export class ExpensesModule { }
