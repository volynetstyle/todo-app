import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  NavController,
  AnimationController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular';
import { Observable, map, shareReplay } from 'rxjs';
import { TaskService } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { Task } from '../models/task.model';
import { Timestamp } from '@angular/fire/firestore';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ActionSheetButton } from '@ionic/core';
import { Network, ConnectionStatus } from '@capacitor/network';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: false,
})
export class TaskListComponent implements OnInit, OnDestroy {
  activeTasks$!: Observable<Task[]>;
  completedTasks$!: Observable<Task[]>;
  currentDate: Date = new Date();
  isAuthenticated: boolean = false;
  isOnline: boolean = true;

  private networkListener: any;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private actionSheetCtrl: ActionSheetController,
    private navCtrl: NavController,
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.isAuthenticated = !!this.authService.getCurrentUser();
    if (!this.isAuthenticated) {
      this.navCtrl.navigateRoot('/auth');
      return;
    }

    // Check initial network status
    const status = await Network.getStatus();
    this.isOnline = status.connected;

    // Listen for network changes
    this.networkListener = Network.addListener(
      'networkStatusChange',
      (status: ConnectionStatus) => {
        this.isOnline = status.connected;
        if (!this.isOnline) {
          this.showOfflineToast();
        }
      }
    );

    if (this.isOnline) {
      this.loadTasks();
    }
  }

  ngOnDestroy() {
    // Clean up network listener
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }

  loadTasks() {
    const tasks$ = this.taskService.getTasks().pipe(
      map((tasks) => tasks.map((task) => this.convertTimestamp(task))),
      shareReplay(1)
    );

    this.activeTasks$ = tasks$.pipe(
      map((tasks) => tasks.filter((task) => !task.completed))
    );

    this.completedTasks$ = tasks$.pipe(
      map((tasks) => tasks.filter((task) => task.completed))
    );
  }

  convertTimestamp(task: Task): Task {
    return {
      ...task,
      createdAt:
        task.createdAt instanceof Timestamp
          ? task.createdAt.toDate()
          : task.createdAt || new Date(),
      dueDate:
        task.dueDate instanceof Timestamp
          ? task.dueDate.toDate()
          : task.dueDate || null,
    };
  }

  async addTask() {
    if (!this.isOnline) {
      await this.showOfflineToast();
      return;
    }
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
      this.navCtrl.navigateForward('/task-edit/new');
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }

  editTask(taskId: string) {
    if (!this.isOnline) {
      this.showOfflineToast();
      return;
    }
    // this.navCtrl.navigateForward(`/tabs/task-edit/${taskId}`);
  }

  async confirmDelete(taskId: string, slidingItem?: any) {
    if (!this.isOnline) {
      await this.showOfflineToast();
      if (slidingItem) slidingItem.close();
      return;
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Delete Task',
      subHeader: 'Are you sure you want to delete this task?',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: async () => {
            try {
              await this.animateDeletion(taskId);
              await this.taskService.deleteTask(taskId);
              if (slidingItem) slidingItem.close();
            } catch (error) {
              const toast = await this.toastCtrl.create({
                message: 'Failed to delete task.',
                duration: 3000,
                color: 'danger',
              });
              await toast.present();
            }
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close',
          handler: () => {
            if (slidingItem) slidingItem.close();
          },
        },
      ] as ActionSheetButton[],
    });

    await actionSheet.present();
  }

  async toggleTaskCompletion(id: string) {
    if (!this.isOnline) {
      await this.showOfflineToast();
      return;
    }
    try {
      await this.taskService.toggleTaskCompletion(id);
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Failed to update task.',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  private async showOfflineToast() {
    const toast = await this.toastCtrl.create({
      message: 'No internet connection. Please connect to continue.',
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
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
