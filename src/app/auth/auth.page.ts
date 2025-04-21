import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {
  AlertController,
  LoadingController,
  ToastController,
} from '@ionic/angular';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {
  authForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
    });
    await loading.present();

    try {
      const { email, password } = this.authForm.value;
      await this.authService.login(email, password);
      await loading.dismiss();
      this.router.navigate(['/tabs/task-list'], { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      this.isLoading = false;
      this.authForm.reset();
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as any).message
          : 'Login failed. Please try again.';
      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  async forgotPassword() {
    const alert = await this.alertCtrl.create({
      header: 'Reset Password',
      message: 'Enter your email to receive a password reset link.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Enter your email',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Send',
          handler: async (data) => {
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
              const toast = await this.toastCtrl.create({
                message: 'Please enter a valid email address.',
                duration: 3000,
                color: 'danger',
                position: 'bottom',
              });
              await toast.present();
              return false;
            }

            try {
              await this.authService.resetPassword(data.email);
              const toast = await this.toastCtrl.create({
                message: 'Password reset email sent. Check your inbox.',
                duration: 3000,
                color: 'success',
                position: 'bottom',
              });
              await toast.present();
              return true;
            } catch (error) {
              const errorMessage =
                error && typeof error === 'object' && 'message' in error
                  ? (error as any).message
                  : 'Failed to send reset email. Please try again.';
              const toast = await this.toastCtrl.create({
                message: errorMessage,
                duration: 3000,
                color: 'danger',
                position: 'bottom',
              });
              await toast.present();
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
