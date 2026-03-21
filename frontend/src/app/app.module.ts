import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TokenInterceptor } from './auth/token.interceptor';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from "@angular/material/sidenav";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatButton, MatButtonModule} from "@angular/material/button";
import {GameModule} from "./game/game.module";
import {TutorialModule} from "./tutorial/tutorial.module";
import {MatListModule} from "@angular/material/list";
import {DashboardModule} from "./dashboard/dashboard.module";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {RadicalModule} from "./radical/radical.module";
import {BattleArmourModule} from "./battle-armour/battle-armour.module";
import {DungeonModule} from "./dungeon/dungeon.module";


const materialModules = [
  MatDrawerContainer,
  MatDrawer,
  MatSidenavModule,
  MatButton,
  MatListModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule
]

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ...materialModules,
    GameModule,
    TutorialModule,
    DashboardModule,
    RadicalModule,
    BattleArmourModule,
    DungeonModule,
  ],
  exports: [
    ...materialModules
  ],
  providers: [
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
