import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_ID_KEY = 'userId';

  constructor(private auth: Auth, private firestore: Firestore) {}

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

  async signup(
    email: string,
    password: string,
    username: string,
    phoneNumber?: string
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const uid = userCredential.user?.uid;
      if (uid) {
        localStorage.setItem(this.USER_ID_KEY, uid);
        await setDoc(doc(this.firestore, 'users', uid), {
          email,
          username,
          phoneNumber: phoneNumber || null,
          createdAt: new Date(),
        });
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
