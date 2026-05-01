import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TaskService } from '../task';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { TaskForm } from '../task-form/task-form';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-list',
  imports: [TaskForm, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList implements OnInit {
  TaskStatus = TaskStatus;
  private taskService = inject(TaskService);

  tasks = this.taskService.tasks;
  
  filterStatus = signal<TaskStatus | 'all'>('all');
  
  filteredTasks = computed(() => {
    const status = this.filterStatus();
    const allTasks = this.tasks();
    if (status === 'all') return allTasks;
    return allTasks.filter(t => t.status === status);
  });

  isFormVisible = signal(false);
  editingTask = signal<Task | null>(null);

  ngOnInit() {
    this.taskService.loadTasks();
  }

  setFilter(status: TaskStatus | 'all') {
    this.filterStatus.set(status);
  }

  showCreateForm() {
    this.editingTask.set(null);
    this.isFormVisible.set(true);
  }

  showEditForm(task: Task) {
    this.editingTask.set(task);
    this.isFormVisible.set(true);
  }

  hideForm() {
    this.isFormVisible.set(false);
    this.editingTask.set(null);
  }

  onSave(taskData: Partial<Task>) {
    const currentEditTask = this.editingTask();
    if (currentEditTask) {
      this.taskService.updateTask(currentEditTask.id, taskData).subscribe(() => {
        this.hideForm();
      });
    } else {
      this.taskService.createTask(taskData).subscribe(() => {
        this.hideForm();
      });
    }
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe();
    }
  }

  toggleStatus(task: Task) {
    const newStatus = task.status === TaskStatus.Pending ? TaskStatus.Completed : TaskStatus.Pending;
    this.taskService.updateTask(task.id, { status: newStatus }).subscribe();
  }
}
