import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from "./game/game-page/game.component";
import {TutorialPageComponent} from "./tutorial/tutorial-page/tutorial-page.component";
import {DashboardPageComponent} from "./dashboard/dashboard-page/dashboard-page.component";

const routes: Routes = [
  {
    path: 'game-page',
    loadChildren: () => import('./game/game.module').then(m => m.GameModule),
    pathMatch: 'full',
    component: GameComponent
  },
  {
    path: 'tutorial-page',
    loadChildren: () => import('./tutorial/tutorial.module').then(m => m.TutorialModule),
    pathMatch: 'full',
    component: TutorialPageComponent
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    pathMatch: 'full',
    component: DashboardPageComponent
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
