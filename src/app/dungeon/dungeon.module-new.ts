import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DungeonPageComponent } from './dungeon-page/dungeon-page.component';
import { GamePageModule } from '../shared/components/game-page/game-page.module';

@NgModule({
  declarations: [
    DungeonPageComponent
  ],
  imports: [
    CommonModule,
    GamePageModule
  ]
})
export class DungeonModule { }

