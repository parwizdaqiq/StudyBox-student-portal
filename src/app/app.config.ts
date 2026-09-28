import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  // Both the Student Portal (core/student-api.service.ts) and the Admin area
  // (core/admin-api.service.ts) talk to the Spring Boot backend over HttpClient.
  providers: [provideRouter(routes), provideHttpClient()],
};
