import { Component } from '@angular/core';

@Component({
  selector: 'game-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public navigation = [
    {
      link: 'game-page',
      label: 'Game'
    },
    {
      link: 'tutorial-page',
      label: 'Tutorial'
    },
    {
      link: 'planes-page',
      label: 'Planes'
    }
  ];
}
