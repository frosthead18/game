import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DungeonPageComponent } from './dungeon-page/dungeon-page.component';
import { GamePageModule } from '../shared/components/game-page/game-page.module';
import { GameSessionService } from './services/game-session.service';

@NgModule({
  declarations: [
    DungeonPageComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    GamePageModule,
  ],
  providers: [
    GameSessionService,
  ],
})
export class DungeonModule {}
