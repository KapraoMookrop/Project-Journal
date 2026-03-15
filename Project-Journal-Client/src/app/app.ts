import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { UserRole, UserStatus } from './types/Enum';
import { AppStateService } from './core/AppStateService';
import { AuthService } from './core/AuthService';
import { filter } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Navbar } from './component/navbar/navber';
import { FormsModule } from '@angular/forms';
import { UserClientData } from './types/UserClientData';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Base-Angular-Client');
  token?: string;

  constructor(public authService: AuthService, public stateService: AppStateService, public router: Router) { }

  showNavbarRoutes = ['/home', '/chat', '/tracking', '/profile'];

  shouldShowNavbar() {
    return this.showNavbarRoutes.includes(this.router.url);
  }

  ngOnInit() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: any) => {
      const url = event.urlAfterRedirects;

      if (url.startsWith('/verify-email')) {
        return;
      }

      this.authService.LoadUserFromToken();
      
    });
  }
}