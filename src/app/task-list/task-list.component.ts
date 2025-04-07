import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController, AnimationController } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: false, // Note: This is not standalone now
})
export class TaskListComponent implements OnInit {
  activeTasks$!: Observable<Task[]>;
  currentDate: Date = new Date(); // Added currentDate

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
    this.activeTasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => !task.completed))
    );
  }

  addTask() {
    this.router.navigate(['/task-edit', 'new']);
  }

  editTask(taskId: string) {
    this.router.navigate(['/task-edit', taskId]);
  }

  async confirmDelete(taskId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.taskService.deleteTask(taskId);
          }
        }
      ]
    });

    await alert.present();
  }

  toggleTaskCompletion(id: string) {
    this.taskService.toggleTaskCompletion(id);
  }

  animateItem(item: HTMLElement): import('@ionic/angular').Animation {
    return this.animationCtrl
      .create()
      .addElement(item)
      .duration(200)
      .easing('ease-out')
      .fromTo('transform', 'translateX(100%)', 'translateX(0)');
  }
}