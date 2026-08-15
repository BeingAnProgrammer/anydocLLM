import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then((m) => m.LandingPageComponent),
  },
  {
    path: 'convert',
    loadComponent: () =>
      import('./features/converter/pages/converter-page/converter-page').then((m) => m.ConverterPageComponent),
  },
  { path: '**', redirectTo: '' },
];
