import { Component } from '@angular/core';
import {routPaths} from "./app-routing.module";

@Component({
  selector: 'game-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public navigation = [
    {
      link: routPaths.gamePage,
      label: 'Game'
    },
    {
      link: routPaths.tutorial,
      label: 'Tutorial'
    },
    {
      link: routPaths.planesPage,
      label: 'Planes'
    },
    {
      link: routPaths.radicalPage,
      label: 'Radical'
    },
    {
      link: routPaths.battleArmour,
      label: 'Battle Armour'
    }
  ];
}
