import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'AnyDoc LLM — Turn any document into LLM-ready Markdown',
    loadComponent: () =>
      import('./features/landing/pages/landing-page/landing-page').then((m) => m.LandingPageComponent),
  },
  {
    path: 'convert',
    title: 'Convert a Document to Markdown — AnyDoc LLM',
    loadComponent: () =>
      import('./features/converter/pages/converter-page/converter-page').then((m) => m.ConverterPageComponent),
  },
  { path: '**', redirectTo: '' },
];
