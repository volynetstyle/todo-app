import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'task-list',
        loadChildren: () =>
          import('../task-list/task-list.module').then((m) => m.TaskListModule),
      },
      {
        path: 'task-edit',
        loadChildren: () =>
          import('../task-edit/task-edit.module').then((m) => m.TaskEditModule),
      },
      {
        path: 'task-completed',
        loadChildren: () =>
          import('../task-completed/task-completed.module').then(
            (m) => m.TaskCompletedModule
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/task-list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/task-list',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
