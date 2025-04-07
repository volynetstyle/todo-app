import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ToastController } from '@ionic/angular';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import {v4 as uuidv4} from "uuid";

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  standalone: false
})
export class TaskEditComponent implements OnInit {
  taskForm: FormGroup;
  taskId: string | null = null;
  isNewTask = true;
  pageTitle = 'New Task';
  maxDate: string = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(); // 5 years ahead
  
  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.taskForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null],
      completed: [false]
    });
  }

  ngOnInit() {
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

  loadTask() {
    if (!this.taskId) return;
    const task = this.taskService.getTaskById(this.taskId);
    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        completed: task.completed
      });
    } else {
      this.showToast('Task not found');
      this.navCtrl.back();
    }
  }

  async saveTask() {
    if (this.taskForm.valid) {
      const formValues = this.taskForm.value;
      const taskData: Task = {
        id: this.isNewTask ? uuidv4() : this.taskId!, // Generate or use existing id
        createdAt: this.isNewTask ? new Date() : this.taskService.getTaskById(this.taskId!)?.createdAt || new Date(),
        title: formValues.title,
        description: formValues.description,
        completed: formValues.completed,
        dueDate: formValues.dueDate ? new Date(formValues.dueDate) : undefined
      };
      if (this.isNewTask) {
        this.taskService.addTask(taskData);
        await this.showToast('Task created successfully');
      } else if (this.taskId) {
        const existingTask = this.taskService.getTaskById(this.taskId);
        if (existingTask) {
          this.taskService.updateTask({ ...existingTask, ...taskData });
          await this.showToast('Task updated successfully');
        }
      }
      this.navCtrl.navigateBack('/tabs/task-list');
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }

  cancel() {
    this.navCtrl.back();
  }
}