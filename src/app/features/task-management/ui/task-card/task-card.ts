import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.html',
  styleUrls: ['./task-card.css']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<Task>();
  @Output() viewResults = new EventEmitter<Task>();

  onEditTask() {
    this.editTask.emit(this.task);
  }

  onDeleteTask() {
    this.deleteTask.emit(this.task);
  }

  onViewResults() {
    this.viewResults.emit(this.task);
  }
}