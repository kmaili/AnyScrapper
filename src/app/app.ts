import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from './core/components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'any_scraper_frontend';
}
