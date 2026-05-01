import { Component, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm implements OnInit {
  @Input() task: Task | null = null;
  @Output() save = new EventEmitter<Partial<Task>>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  taskForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    status: [TaskStatus.Pending as TaskStatus]
  });

  isEditMode = signal(false);

  ngOnInit() {
    if (this.task) {
      this.isEditMode.set(true);
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        status: this.task.status
      });
    }
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.save.emit(this.taskForm.getRawValue());
  }

  onCancel() {
    this.cancel.emit();
  }
}
