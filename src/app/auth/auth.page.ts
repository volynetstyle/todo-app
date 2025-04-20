import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';

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
    private toastCtrl: ToastController
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

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
