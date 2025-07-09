import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskCardComponent } from '../../ui/task-card/task-card';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TaskCardComponent],
  templateUrl: './task-list-page.html',
  styleUrls: ['./task-list-page.css']
})
export class TaskListPageComponent implements OnInit {
  tasks: Task[] = [
    {
      id: '1',
      name: 'E-commerce Price Tracker',
      url: 'https://example.com/products',
      schedule: 'Daily',
      status: 'Active',
      lastRun: new Date('2025-07-04T10:00:00Z')
    },
    {
      id: '2',
      name: 'News Headlines Scraper',
      url: 'https://news.example.com',
      schedule: 'Weekly',
      status: 'Paused'
    },
    {
      id: '3',
      name: 'Competitor Blog Monitor',
      url: 'https://competitor.example.com/blog',
      schedule: 'Monthly',
      status: 'Failed',
      lastRun: new Date('2025-07-01T15:30:00Z')
    }
  ];

  ngOnInit() {
    // In a real app, this would fetch tasks from a service (e.g., TaskListService)
    // this.taskListService.getTasks().subscribe(tasks => this.tasks = tasks);
  }

  onEditTask(task: Task) {
    console.log(`Edit task: ${task.id}`);
    // Navigate to edit page, e.g., this.router.navigate(['/task-creation/edit', task.id]);
  }

  onDeleteTask(task: Task) {
    console.log(`Delete task: ${task.id}`);
    // Call service to delete task and update tasks array
    this.tasks = this.tasks.filter(t => t.id !== task.id);
  }

  onViewResults(task: Task) {
    console.log(`View results for task: ${task.id}`);
    // Navigate to results page, e.g., this.router.navigate(['/results-viewer', task.id]);
  }
}