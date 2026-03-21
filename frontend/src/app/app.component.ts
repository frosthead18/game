import { Component, OnInit } from '@angular/core';
import { routPaths } from './app-routing.module';
import { AuthService } from './auth/auth.service';

@Component({
    selector: 'game-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    standalone: false
})
export class AppComponent implements OnInit {
  public isDarkTheme = false;

  constructor(private readonly authService: AuthService) {}

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
    },
    {
      link: routPaths.dungeon,
      label: 'Dungeon'
    }
  ];

  ngOnInit() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  logout(): void {
    void this.authService.signOut();
  }
}
