import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskEditRoutingModule } from './task-edit-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TaskEditComponent } from './task-edit.component';


@NgModule({
  declarations: [TaskEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TaskEditRoutingModule
  ],
})
export class TaskEditModule { }
