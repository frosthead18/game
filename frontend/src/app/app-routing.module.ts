import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameComponent } from './game/game-page/game.component';
import { TutorialPageComponent } from './tutorial/tutorial-page/tutorial-page.component';
import { DashboardPageComponent } from './dashboard/dashboard-page/dashboard-page.component';
import { PlanesPageComponent } from './planes/planes-page/planes-page.component';
import { RadicalPageComponent } from './radical/radical-page/radical-page.component';
import { BattleArmourPageComponent } from './battle-armour/battle-armour-page/battle-armour-page.component';
import { DungeonPageComponent } from './dungeon/dungeon-page/dungeon-page.component';
import { AuthGuard } from './auth/auth.guard';

export const routPaths = {
  gamePage: 'game',
  tutorial: 'tutorial',
  planesPage: 'planes',
  radicalPage: 'radical',
  battleArmour: 'battle-armour',
  dungeon: 'dungeon',
  dashboard: 'dashboard',
  auth: 'auth',
  root: '',
};

const routes: Routes = [
  {
    path: routPaths.auth,
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: routPaths.gamePage,
    loadChildren: () => import('./game/game.module').then((m) => m.GameModule),
    pathMatch: 'full',
    component: GameComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.tutorial,
    loadChildren: () => import('./tutorial/tutorial.module').then((m) => m.TutorialModule),
    pathMatch: 'full',
    component: TutorialPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.planesPage,
    loadChildren: () => import('./planes/planes.module').then((m) => m.PlanesModule),
    pathMatch: 'full',
    component: PlanesPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.radicalPage,
    loadChildren: () => import('./radical/radical.module').then((m) => m.RadicalModule),
    pathMatch: 'full',
    component: RadicalPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.battleArmour,
    loadChildren: () => import('./battle-armour/battle-armour.module').then((m) => m.BattleArmourModule),
    pathMatch: 'full',
    component: BattleArmourPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.dungeon,
    loadChildren: () => import('./dungeon/dungeon.module').then((m) => m.DungeonModule),
    pathMatch: 'full',
    component: DungeonPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: routPaths.dashboard,
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    pathMatch: 'full',
    component: DashboardPageComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: routPaths.dashboard,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
