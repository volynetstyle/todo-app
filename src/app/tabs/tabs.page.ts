import { Component } from '@angular/core';
import { AnimationController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  user$: any;

  constructor(
    private authService: AuthService,
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController,
    private router: Router
  ) {
    this.user$ = authService.getCurrentUser();
  }

  async logout() {
    try {
      await this.authService.logout();
      const toast = await this.toastCtrl.create({
        message: 'Logged out successfully.',
        duration: 2000,
        color: 'success',
        position: 'bottom',
      });
      await toast.present();
      this.router.navigate(['/auth'], { replaceUrl: true });
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Logout failed.',
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  getTabAnimation(baseEl: HTMLElement) {
    return this.animationCtrl
      .create()
      .addElement(
        (baseEl.querySelector('ion-router-outlet') as HTMLElement) ||
          document.createElement('div')
      )
      .duration(300)
      .fromTo('opacity', '0.2', '1')
      .fromTo('transform', 'translateY(40px)', 'translateY(0px)');
  }
}
