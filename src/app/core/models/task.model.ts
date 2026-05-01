export enum TaskStatus {
  Pending = 'pending',
  Completed = 'completed'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID of creator
  assignedTo?: string; // User ID of assignee
}
