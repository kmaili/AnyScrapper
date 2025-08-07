/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'zone.js';

// Import the Lara theme
import { definePreset } from '@primeuix/styled';
import Lara from '@primeuix/themes/lara';

// Define the theme preset
definePreset(Lara);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
