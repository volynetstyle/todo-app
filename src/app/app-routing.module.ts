import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('./tabs/tabs.module').then((m) => m.TabsPageModule),
        },
      ],
      { preloadingStrategy: PreloadAllModules }
    ),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
