import { Component, OnInit } from '@angular/core';
import { Task } from '../models/task.model';
import { AlertController } from '@ionic/angular';
import { Observable, map } from 'rxjs';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task-completed',
  templateUrl: './task-completed.component.html',
  styleUrls: ['./task-completed.component.scss'],
  standalone: false,
})
export class TaskCompletedComponent  implements OnInit {
  completedTasks$!: Observable<Task[]>;

  constructor(
    private taskService: TaskService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.completedTasks$ = this.taskService.getTasks().pipe(
      map(tasks => tasks.filter(task => task.completed))
    );
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
}
