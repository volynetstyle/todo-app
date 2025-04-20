import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoadingController, ToastController } from '@ionic/angular';
import { matchValidator } from '../utils/matchValidator';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]], // E.164 format
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, matchValidator('password')]],
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Registering...',
    });
    await loading.present();

    try {
      const { email, password, username, phoneNumber } =
        this.registerForm.value;
      await this.authService.signup(email, password, username, phoneNumber);
      await loading.dismiss();
      this.router.navigate(['/task-list'], { replaceUrl: true });
    } catch (error) {
      await loading.dismiss();
      this.isLoading = false;
      this.registerForm.reset();
      let errorMessage = 'Registration failed. Please try again.';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as { message?: string }).message || errorMessage;
      }
      const toast = await this.toastCtrl.create({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}
