import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { addDoc, Timestamp } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'tasks';

  constructor(private firestore: Firestore) {}

  getTasks(): Observable<Task[]> {
    const tasksCollection = collection(this.firestore, this.STORAGE_KEY);
    return (
      collectionData(tasksCollection, { idField: 'id' }) as Observable<Task[]>
    ).pipe(catchError(() => of([])));
  }

  async getTaskById(id: string): Promise<Task | undefined> {
    try {
      if (!id) return undefined;
      const taskRef = doc(this.firestore, this.STORAGE_KEY, id);
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
          : undefined,
      };
    } catch {
      return undefined;
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<void> {
    try {
      const tasksCollection = collection(this.firestore, this.STORAGE_KEY);
      await addDoc(tasksCollection, {
        ...task,
        title: task.title || 'Untitled',
        description: task.description || '',
        completed: false,
        createdAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  }

  async updateTask(task: Task): Promise<void> {
    try {
      if (!task.id) return;
      const taskRef = doc(this.firestore, this.STORAGE_KEY, task.id);
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
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      if (!id) return;
      const taskRef = doc(this.firestore, this.STORAGE_KEY, id);
      await deleteDoc(taskRef);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }

  async toggleTaskCompletion(id: string): Promise<void> {
    try {
      if (!id) return;
      const taskRef = doc(this.firestore, this.STORAGE_KEY, id);
      const snapshot = await getDoc(taskRef);
      if (!snapshot.exists()) return;

      await updateDoc(taskRef, { completed: !snapshot.data()['completed'] });
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    }
  }
}
