import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatDrawer, MatDrawerContainer, MatSidenavModule} from "@angular/material/sidenav";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {MatButton} from "@angular/material/button";
import {GameModule} from "./game/game.module";
import { TutorialComponent } from './tutorial/tutorial/tutorial.component';


const materialModules = [
  MatDrawerContainer,
  MatDrawer,
  MatSidenavModule,
  MatButton
]

@NgModule({
  declarations: [
    AppComponent,
    TutorialComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    ...materialModules,
    GameModule
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
