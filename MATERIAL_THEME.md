# Angular Material Theme Setup

This project now has a custom Angular Material theme configured using Material 3 design system.

## Files Created/Modified

### 1. `src/theme.scss`
The main theme configuration file that defines:
- **Light theme** (default) with Azure palette
- **Dark theme** (optional) that can be toggled with the `.dark-theme` class
- Typography configuration
- Density settings

### 2. `src/styles.scss`
Global styles that import the custom theme and provide base styles for the application.

### 3. `angular.json`
Updated to remove prebuilt theme imports and use only the custom theme.

## How to Use

### Basic Usage
The theme is automatically applied to all Angular Material components in your app.

### Switching to Dark Theme
To enable dark theme on a specific element or the entire app, add the `dark-theme` class:

```typescript
// In your component
export class AppComponent {
  darkMode = false;
  
  toggleTheme() {
    this.darkMode = !this.darkMode;
  }
}
```

```html
<!-- In your template -->
<div [class.dark-theme]="darkMode">
  <!-- Your content -->
</div>
```

### Customizing Colors

You can customize the theme by editing `src/theme.scss`. Available palettes include:
- `mat.$red-palette`
- `mat.$green-palette`
- `mat.$blue-palette`
- `mat.$azure-palette`
- `mat.$rose-palette`
- `mat.$violet-palette`
- `mat.$cyan-palette`
- `mat.$orange-palette`
- `mat.$chartreuse-palette`
- `mat.$magenta-palette`
- `mat.$yellow-palette`

Example:
```scss
$game-theme: mat.define-theme((
  color: (
    theme-type: light,
    primary: mat.$violet-palette,  // Change primary color
    tertiary: mat.$cyan-palette,   // Change tertiary color
  ),
));
```

### Using Theme Colors in Components

To use theme colors in your component styles:

```scss
@use '@angular/material' as mat;

.my-element {
  // Access theme colors programmatically
  color: var(--mat-sys-primary);
  background-color: var(--mat-sys-surface);
}
```

### Typography

The theme uses Roboto font by default. To customize:

```scss
typography: (
  brand-family: 'Your Custom Font, Roboto',
  plain-family: 'Your Custom Font, Roboto',
),
```

Don't forget to import your custom font in `index.html` or `styles.scss`.

## Material Components Included

The following Material modules are imported in `app.module.ts`:
- MatSidenavModule
- MatButtonModule
- MatListModule
- MatToolbarModule
- MatIconModule

To add more components, install them via:
```bash
ng generate @angular/material:navigation your-component-name
```

Or manually import the modules you need in your feature modules.

## Testing

Run the development server to see the theme in action:
```bash
npm start
```

The theme will be applied to all Material components across your application.

## Troubleshooting

### Theme not applying
1. Make sure `src/styles.scss` is listed in `angular.json` under `styles`
2. Restart the development server after making theme changes
3. Clear browser cache

### Icons not showing
Make sure you have Material Icons loaded. Add this to `index.html`:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### Build errors
If you encounter SCSS compilation errors, make sure your `@angular/material` version matches your Angular version.

