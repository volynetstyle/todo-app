import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  addDoc,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(private firestore: Firestore, private authService: AuthService) {}

  private getUserTasksCollection() {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');
    return collection(this.firestore, `users/${userId}/tasks`);
  }

  private getUserTaskDoc(id: string) {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');
    return doc(this.firestore, `users/${userId}/tasks`, id);
  }

  getTasks(): Observable<Task[]> {
    try {
      const tasksCollection = this.getUserTasksCollection();
      return (
        collectionData(tasksCollection, { idField: 'id' }) as Observable<Task[]>
      ).pipe(catchError(() => of([])));
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return of([]);
    }
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    try {
      if (!id) return undefined;
      const taskRef = this.getUserTaskDoc(id);
      const snapshot = await getDoc(taskRef);
      if (!snapshot.exists()) return undefined;

      const data = snapshot.data();
      return {
        id: snapshot.id,
        title: data['title'] || '',
        description: data['description'] || '',
        completed: data['completed'] || false,
        createdAt: (data['createdAt'] as Timestamp)?.toDate() || new Date(),
        dueDate: data['dueDate']
          ? (data['dueDate'] as Timestamp)?.toDate()
          : null,
        photoUrl: data['photoUrl'] || null,
      };
    } catch (error) {
      console.error('Failed to get task:', error);
      return undefined;
    }
  }

  async addTask(task: Omit<Task, 'id'>): Promise<void> {
    try {
      const tasksCollection = this.getUserTasksCollection();
      await addDoc(tasksCollection, {
        ...task,
        title: task.title || 'Untitled',
        description: task.description || '',
        completed: task.completed || false,
        createdAt: Timestamp.now(),
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        photoUrl: task.photoUrl || null,
      });
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      if (!task.id) return;
      const taskRef = this.getUserTaskDoc(task.id);
      await setDoc(
        taskRef,
        {
          title: task.title || 'Untitled',
          description: task.description || '',
          completed: task.completed || false,
          createdAt: task.createdAt
            ? Timestamp.fromDate(task.createdAt)
            : Timestamp.now(),
          dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
          photoUrl: task.photoUrl || null,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      if (!id) return;
      const taskRef = this.getUserTaskDoc(id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }

  async toggleTaskCompletion(id: string): Promise<void> {
    try {
      if (!id) return;
      const taskRef = this.getUserTaskDoc(id);
      const snapshot = await getDoc(taskRef);
      if (!snapshot.exists()) return;

      await updateDoc(taskRef, { completed: !snapshot.data()['completed'] });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
      throw error;
    }
  }

  convertTimestamp(task: any): Task {
    return {
      ...task,
      dueDate:
        task.dueDate instanceof Timestamp
          ? task.dueDate.toDate()
          : task.dueDate,
    };
  }
}
