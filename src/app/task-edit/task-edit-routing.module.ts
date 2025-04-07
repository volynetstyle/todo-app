import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskEditComponent } from './task-edit.component';

const routes: Routes = [
  {
    path: "",
    component: TaskEditComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskEditRoutingModule { }
