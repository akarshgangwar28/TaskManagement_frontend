import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../user';
import { Auth } from '../../auth/auth';
import { TaskService } from '../../tasks/task';
import { NgIf, NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-user-list',
  imports: [NgIf, NgFor, NgClass],
  templateUrl: './user-list.html'
})
export class UserList implements OnInit {
  userService = inject(UserService);
  taskService = inject(TaskService);
  auth = inject(Auth);

  users = this.userService.users;
  tasks = this.taskService.tasks;

  ngOnInit() {
    this.userService.loadUsers();
    this.taskService.loadTasks();
  }

  assignLead(userId: string, targetLeadId: string) {
    this.userService.assignLead(userId, targetLeadId || null).subscribe();
  }

  getTeamLeads() {
    return this.users().filter(u => u.role === 'Team Lead');
  }

  getEmployees() {
    return this.users().filter(u => u.role === 'Employee');
  }

  getTeamLeadTasks(teamLeadId: string) {
    const teamMembers = this.users().filter(u => u.teamLead === teamLeadId).map(u => u.id);
    const relevantIds = [teamLeadId, ...teamMembers];
    return this.tasks().filter(t => relevantIds.includes(t.createdBy) || relevantIds.includes(t.assignedTo || ""));
  }
}
