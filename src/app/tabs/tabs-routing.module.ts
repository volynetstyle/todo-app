import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthRedirectGuard } from './auth-redirect.guard';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'auth',
        canActivate: [AuthRedirectGuard],
        loadChildren: () =>
          import('../auth/auth.module').then((m) => m.AuthPageModule),
      },
      {
        path: 'register',
        canActivate: [AuthRedirectGuard],
        loadChildren: () =>
          import('../register/register.module').then(
            (m) => m.RegisterPageModule
          ),
      },
      {
        path: 'task-list',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../task-list/task-list.module').then((m) => m.TaskListModule),
      },
      {
        path: 'task-edit',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../task-edit/task-edit.module').then((m) => m.TaskEditModule),
      },
      {
        path: 'task-completed',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('../task-completed/task-completed.module').then(
            (m) => m.TaskCompletedModule
          ),
      },
      {
        path: '',
        redirectTo: 'task-list',
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
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
