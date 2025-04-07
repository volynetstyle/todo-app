import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskCompletedComponent } from './task-completed.component';

const routes: Routes = [
  {
    path: "",
    component: TaskCompletedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskCompletedRoutingModule { }
