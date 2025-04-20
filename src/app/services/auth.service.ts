import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_ID_KEY = 'userId';

  constructor(private auth: Auth) {}

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      if (userCredential.user?.uid) {
        localStorage.setItem(this.USER_ID_KEY, userCredential.user.uid);
      }
    } catch (error) {
      throw new Error('Login failed: ' + (error as Error).message);
    }
  }

  async signup(email: string, password: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      if (userCredential.user?.uid) {
        localStorage.setItem(this.USER_ID_KEY, userCredential.user.uid);
      }
    } catch (error) {
      throw new Error('Signup failed: ' + (error as Error).message);
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      localStorage.removeItem(this.USER_ID_KEY);
    } catch (error) {
      throw new Error('Logout failed: ' + (error as Error).message);
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  getStoredUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }
}
