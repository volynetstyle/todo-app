import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly STORAGE_KEY = 'tasks';
  private tasksSubject: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  public tasks$: Observable<Task[]> = this.tasksSubject.asObservable();

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    const storedTasks = localStorage.getItem(this.STORAGE_KEY);
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks);
      // Convert string dates back to Date objects
      tasks.forEach((task: { createdAt: string | number | Date; dueDate: string | number | Date; }) => {
        task.createdAt = new Date(task.createdAt);
        if (task.dueDate) {
          task.dueDate = new Date(task.dueDate);
        }
      });
      this.tasksSubject.next(tasks);
    }
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  getTaskById(id: string): Task | undefined {
    return this.tasksSubject.value.find(task => task.id === id);
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date()
    };
    
    const tasks = [...this.tasksSubject.value, newTask];
    this.saveTasks(tasks);
  }

  updateTask(task: Task): void {
    const tasks = this.tasksSubject.value.map(t => 
      t.id === task.id ? task : t
    );
    this.saveTasks(tasks);
  }

  deleteTask(id: string): void {
    const tasks = this.tasksSubject.value.filter(task => task.id !== id);
    this.saveTasks(tasks);
  }

  toggleTaskCompletion(id: string): void {
    const tasks = this.tasksSubject.value.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    this.saveTasks(tasks);
  }
}