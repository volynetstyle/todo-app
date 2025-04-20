import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  AlertController,
  NavController,
  AnimationController,
} from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: false,
})
export class TaskListComponent implements OnInit {
  activeTasks$!: Observable<Task[]>;
  completedTasks$!: Observable<Task[]>;
  currentDate: Date = new Date();

  constructor(
    private taskService: TaskService,
    private alertController: AlertController,
    private router: Router,
    private navCtrl: NavController,
    private animationCtrl: AnimationController
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    const tasks$ = this.taskService.getTasks().pipe(shareReplay(1));

    this.activeTasks$ = tasks$.pipe(
      map((tasks) => tasks.filter((task) => !task.completed))
    );

    this.completedTasks$ = tasks$.pipe(
      map((tasks) => tasks.filter((task) => task.completed))
    );
  }

  addTask() {
    this.router.navigate(['/task-edit']);
  }

  editTask(taskId: string) {
    this.router.navigate(['/task-edit', taskId]);
  }

  async confirmDelete(taskId: string, slidingItem?: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            if (slidingItem) slidingItem.close();
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            await this.animateDeletion(taskId);
            await this.taskService.deleteTask(taskId);
            if (slidingItem) slidingItem.close();
          },
        },
      ],
    });

    await alert.present();
  }

  toggleTaskCompletion(id: string) {
    this.taskService.toggleTaskCompletion(id);
  }

  private async animateDeletion(taskId: string): Promise<void> {
    const item = document.querySelector(
      `ion-item-sliding[task-id="${taskId}"]`
    );
    if (!item) return;

    const animation = this.animationCtrl
      .create()
      .addElement(item)
      .duration(300)
      .easing('ease-out')
      .fromTo('transform', 'translateX(0)', 'translateX(100%)')
      .fromTo('opacity', '1', '0');

    await animation.play();
  }
}
