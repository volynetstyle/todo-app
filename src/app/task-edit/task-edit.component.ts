import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network, ConnectionStatus } from '@capacitor/network';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  standalone: false,
})
export class TaskEditComponent implements OnInit, OnDestroy {
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
  isOnline: boolean = true;
  isListening: boolean = false;
  voiceTargetField: 'title' | 'description' | null = null;
  isNativePlatform: boolean = false;
  private networkListener: any;

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

  async ngOnInit(): Promise<void> {
    // Check platform
    this.isNativePlatform =
      Capacitor.getPlatform() === 'ios' ||
      Capacitor.getPlatform() === 'android';

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

    // Check speech recognition availability only on native platforms
    if (this.isNativePlatform) {
      try {
        const result = await SpeechRecognition.available();
        if (!result.available) {
          console.warn('Speech recognition not available on this device.');
        }
      } catch (error) {
        console.warn('Speech recognition unavailable:', error);
      }
    } else {
      console.log('Speech recognition not supported on web platform.');
    }

    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId && this.taskId !== 'new') {
      this.isNewTask = false;
      this.pageTitle = 'Edit Task';
      if (this.isOnline) {
        this.loadTask();
      } else {
        this.showOfflineToast();
      }
    }
  }

  ngOnDestroy() {
    // Clean up network listener
    if (this.networkListener) {
      this.networkListener.remove();
    }
    // Stop speech recognition if active
    if (this.isListening && this.isNativePlatform) {
      SpeechRecognition.stop();
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
      await this.showToast('Task not found', 'danger');
      this.navCtrl.back();
    }
  }

  async requestSpeechPermissions() {
    if (!this.isNativePlatform) {
      await this.showToast('Voice input not supported on web', 'danger');
      return false;
    }
    try {
      const permissionStatus = await SpeechRecognition.requestPermissions();
      if (permissionStatus.speechRecognition !== 'granted') {
        await this.showToast('Speech recognition permission denied', 'danger');
        return false;
      }
      return true;
    } catch (error) {
      await this.showToast('Failed to request speech permissions', 'danger');
      return false;
    }
  }

  async startVoiceInput(field: 'title' | 'description') {
    if (!this.isOnline) {
      await this.showOfflineToast();
      return;
    }
    if (!this.isNativePlatform) {
      await this.showToast('Voice input not supported on web', 'danger');
      return;
    }
    if (this.isListening) {
      await SpeechRecognition.stop();
      this.isListening = false;
      this.voiceTargetField = null;
      return;
    }

    const hasPermission = await this.requestSpeechPermissions();
    if (!hasPermission) return;

    try {
      this.isListening = true;
      this.voiceTargetField = field;
      await SpeechRecognition.start({
        language: 'en-US',
        maxResults: 1,
        prompt: `Speak your ${field}`,
        partialResults: true,
        popup: false,
      });

      SpeechRecognition.addListener(
        'partialResults',
        (data: { matches: string[] }) => {
          if (
            data.matches &&
            data.matches.length > 0 &&
            this.voiceTargetField
          ) {
            this.taskForm.patchValue({
              [this.voiceTargetField]: data.matches[0],
            });
          }
        }
      );

      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      this.isListening = false;
      this.voiceTargetField = null;
      await this.showToast('Failed to start voice input', 'danger');
    }
  }

  async takePhoto() {
    if (!this.isOnline) {
      await this.showOfflineToast();
      return;
    }
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        quality: 90,
      });
      this.photoBase64 = photo.base64String || null;
      this.photoUrl = `data:image/jpeg;base64,${photo.base64String}`;
    } catch (error) {
      await this.showToast('Failed to take photo', 'danger');
    }
  }

  async pickPhoto() {
    if (!this.isOnline) {
      await this.showOfflineToast();
      return;
    }
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.Base64,
        source: CameraSource.Photos,
        quality: 90,
      });
      this.photoBase64 = photo.base64String || null;
      this.photoUrl = `data:image/jpeg;base64,${photo.base64String}`;
    } catch (error) {
      await this.showToast('Failed to pick photo', 'danger');
    }
  }

  async saveTask(): Promise<void> {
    if (this.taskForm.invalid || this.saving || !this.isOnline) {
      if (!this.isOnline) {
        await this.showOfflineToast();
      }
      return;
    }

    this.saving = true;
    try {
      const user = this.authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      let photoUrl: string | null = this.photoUrl;
      if (this.photoBase64) {
        const storageRef = ref(
          this.storage,
          `tasks/${user.uid}/${Date.now()}.jpg`
        );
        await uploadString(storageRef, this.photoBase64, 'base64');
        photoUrl = await getDownloadURL(storageRef);
      }

      const formValues = this.taskForm.value;
      const task: Task = {
        title: formValues.title,
        description: formValues.description,
        completed: formValues.completed,
        dueDate: formValues.dueDate ? new Date(formValues.dueDate) : null,
        photoUrl,
        createdAt: new Date(),
        id: '',
      };

      if (this.isNewTask) {
        await this.taskService.addTask(task);
        await Haptics.impact({ style: ImpactStyle.Medium });
        await this.showToast('Task created successfully', 'success');
      } else if (this.taskId) {
        const { id, ...taskWithoutId } = task;
        await this.taskService.updateTask({
          id: this.taskId,
          ...taskWithoutId,
        });
        await this.showToast('Task updated successfully', 'success');
      }

      this.navCtrl.navigateBack('/tabs/task-list');
    } catch (error) {
      await this.showToast('Failed to save task', 'danger');
    } finally {
      this.saving = false;
    }
  }

  async showToast(message: string, color: string = 'danger'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color,
    });
    await toast.present();
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

  cancel(): void {
    this.navCtrl.back();
  }
}
