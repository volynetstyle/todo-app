import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskListRoutingModule } from './task-list-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskListComponent } from './task-list.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskListRoutingModule,
  ],
  declarations: [TaskListComponent],
})
export class TaskListModule { }
