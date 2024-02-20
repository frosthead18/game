import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
    AppRoutingModule,
    ...materialModules,
    GameModule,
    TutorialModule,
    DashboardModule
  ],
  exports: [
    ...materialModules
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
