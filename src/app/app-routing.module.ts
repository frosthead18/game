import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GameComponent} from "./game/game-page/game.component";

const routes: Routes = [
  {
    path: 'game-page',
    loadChildren: () => import('./game/game.module').then(m => m.GameModule),
    pathMatch: 'full',
    component: GameComponent
  },
  {
    path: '',
    redirectTo: 'game-page',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
