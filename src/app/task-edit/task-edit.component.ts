import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  Storage,
  ref,
  uploadString,
  getDownloadURL,
} from '@angular/fire/storage';
import { AuthService } from '../services/auth.service';
import { Haptics } from '@capacitor/haptics';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  standalone: false,
})
export class TaskEditComponent implements OnInit {
  taskForm: FormGroup;
  taskId: string | null = null;
  isNewTask = true;
  pageTitle = 'New Task';
  maxDate: string = new Date(
    new Date().setFullYear(new Date().getFullYear() + 5)
  ).toISOString();
  saving = false;
  photoUrl: string | null = null;
  photoBase64: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private storage: Storage,
    private authService: AuthService
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null],
      completed: [false],
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId && this.taskId !== 'new') {
      this.isNewTask = false;
      this.pageTitle = 'Edit Task';
      this.loadTask();
    }
  }

  get titleControl(): AbstractControl | null {
    return this.taskForm.get('title');
  }

  async loadTask(): Promise<void> {
    if (!this.taskId) return;
    const task = await this.taskService.getTaskById(this.taskId);
    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        completed: task.completed,
      });
      this.photoUrl = task.photoUrl || null;
    } else {
      await this.showToast('Task not found');
      this.navCtrl.back();
    }
  }

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
      });
      if (photo.base64String) {
        this.photoBase64 = photo.base64String;
        this.photoUrl = `data:image/jpeg;base64,${photo.base64String}`;
      }
    } catch {
      await this.showToast('Failed to take photo');
    }
  }

  async pickPhoto() {
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 90,
      });
      if (photo.base64String) {
        this.photoBase64 = photo.base64String;
        this.photoUrl = `data:image/jpeg;base64,${photo.base64String}`;
      }
    } catch {
      await this.showToast('Failed to pick photo');
    }
  }

  async saveTask(): Promise<void> {
    if (this.taskForm.invalid || this.saving) return;

    this.saving = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let photoUrl: string | null = this.photoUrl;

      if (this.photoBase64) {
        const fileName = `${crypto.randomUUID()}.jpg`;
        const storageRef = ref(this.storage, `tasks/${user.uid}/${fileName}`);
        const fullDataUrl = `data:image/jpeg;base64,${this.photoBase64}`;

        console.log(fileName, storageRef, fullDataUrl);

        await uploadString(storageRef, fullDataUrl, 'data_url');
        photoUrl = await getDownloadURL(storageRef);
      }

      const formValues = this.taskForm.value;
      const task: Task = {
        title: formValues.title,
        description: formValues.description,
        completed: formValues.completed,
        dueDate: formValues.dueDate ? new Date(formValues.dueDate) : null,
        photoUrl,
        id: '',
        createdAt: new Date(),
      };

      if (this.isNewTask) {
        await this.taskService.addTask(task);
        await Haptics.vibrate({ duration: 50 });
        await this.showToast('Task created successfully');
      } else if (this.taskId) {
        const { id, ...taskWithoutId } = task;
        await this.taskService.updateTask({
          id: this.taskId,
          ...taskWithoutId,
        });
        await Haptics.vibrate({ duration: 50 });
        await this.showToast('Task updated successfully');
      }

      this.navCtrl.navigateBack('/task-list');
    } catch (error) {
      console.log(error);
      await this.showToast('Failed to save task');
    } finally {
      this.saving = false;
    }
  }

  async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  }

  cancel(): void {
    this.navCtrl.back();
  }
}
