import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskCompletedRoutingModule } from './task-completed-routing.module';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskCompletedComponent } from './task-completed.component';


@NgModule({
  declarations: [TaskCompletedComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TaskCompletedRoutingModule
  ]
})
export class TaskCompletedModule { }
