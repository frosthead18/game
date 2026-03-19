/**
 * Example: How to Use Angular Material Theme in Your Components
 *
 * This file demonstrates various ways to leverage the Material theme
 * in your Angular components.
 */

// ============================================
// 1. USING THEME COLORS IN COMPONENT SCSS
// ============================================

// Method 1: Using CSS Custom Properties (Recommended)
// In your component.scss:
/*
.my-card {
  background-color: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  border: 1px solid var(--mat-sys-outline);
}

.primary-button {
  background-color: var(--mat-sys-primary);
  color: var(--mat-sys-on-primary);
}

.error-message {
  color: var(--mat-sys-error);
}
*/

// Method 2: Using Material Theme Functions
// In your component.scss:
/*
@use '@angular/material' as mat;

.my-element {
  // Access theme colors
  color: var(--mat-sys-primary);
  background-color: var(--mat-sys-surface-variant);
}
*/

// ============================================
// 2. AVAILABLE CSS CUSTOM PROPERTIES
// ============================================
/*
Color Properties:
- --mat-sys-primary
- --mat-sys-on-primary
- --mat-sys-primary-container
- --mat-sys-on-primary-container
- --mat-sys-secondary
- --mat-sys-on-secondary
- --mat-sys-tertiary
- --mat-sys-on-tertiary
- --mat-sys-error
- --mat-sys-on-error
- --mat-sys-surface
- --mat-sys-on-surface
- --mat-sys-surface-variant
- --mat-sys-outline
- --mat-sys-background
- --mat-sys-on-background
*/

// ============================================
// 3. DARK THEME TOGGLE
// ============================================

// In your component.ts:
/*
import { Component } from '@angular/core';

@Component({
  selector: 'app-my-component',
  templateUrl: './my-component.component.html',
  styleUrls: ['./my-component.component.scss']
})
export class MyComponent {
  isDarkMode = false;

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    // Optionally save to localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  ngOnInit() {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
  }
}
*/

// In your component.html:
/*
<div [class.dark-theme]="isDarkMode">
  <button mat-raised-button color="primary" (click)="toggleTheme()">
    {{ isDarkMode ? 'Light' : 'Dark' }} Mode
  </button>

  <mat-card>
    <mat-card-content>
      Your content here
    </mat-card-content>
  </mat-card>
</div>
*/

// ============================================
// 4. MATERIAL COMPONENTS WITH THEME
// ============================================

/*
// Buttons
<button mat-button>Basic</button>
<button mat-raised-button color="primary">Primary</button>
<button mat-raised-button color="accent">Accent</button>
<button mat-raised-button color="warn">Warn</button>
<button mat-icon-button><mat-icon>favorite</mat-icon></button>
<button mat-fab color="primary"><mat-icon>add</mat-icon></button>

// Cards
<mat-card>
  <mat-card-header>
    <mat-card-title>Card Title</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    Card content
  </mat-card-content>
  <mat-card-actions>
    <button mat-button>ACTION</button>
  </mat-card-actions>
</mat-card>

// Toolbar
<mat-toolbar color="primary">
  <span>My App</span>
</mat-toolbar>

// Lists
<mat-list>
  <mat-list-item>Item 1</mat-list-item>
  <mat-list-item>Item 2</mat-list-item>
</mat-list>
*/

// ============================================
// 5. RESPONSIVE DESIGN WITH THEME
// ============================================

/*
In your component.scss:

@use '@angular/material' as mat;

.container {
  padding: 16px;
  background-color: var(--mat-sys-surface);

  @media (max-width: 599px) {
    padding: 8px;
  }

  @media (min-width: 600px) and (max-width: 959px) {
    padding: 16px;
  }

  @media (min-width: 960px) {
    padding: 24px;
  }
}
*/

// ============================================
// 6. CUSTOM COMPONENT THEMING
// ============================================

/*
If you want to create a component that adapts to the theme:

// In your component.scss:
@use '@angular/material' as mat;

:host {
  .my-custom-element {
    // Use theme colors
    background-color: var(--mat-sys-surface-variant);
    color: var(--mat-sys-on-surface);
    border-radius: 4px;
    padding: 16px;

    &:hover {
      background-color: var(--mat-sys-surface-container-high);
    }
  }

  .highlight {
    background-color: var(--mat-sys-primary-container);
    color: var(--mat-sys-on-primary-container);
  }
}
*/

export {};

