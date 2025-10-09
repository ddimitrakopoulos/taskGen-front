import React, { useState } from 'react';

export enum TaskStatus {
  NotStarted = 'Not Started',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Task {
  id: number;
  name: string;
  status: TaskStatus;
}

const initialTasks: Task[] = [];

const TaskApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>(TaskStatus.NotStarted);

  const addTask = () => {
    if (!newName.trim()) return;
    setTasks([...tasks, { id: Date.now(), name: newName, status: newStatus }]);
    setNewName('');
    setNewStatus(TaskStatus.NotStarted);
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id: number, name: string, status: TaskStatus) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, name, status } : task));
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20 }}>
      <h2>Tasks</h2>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Task name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <select value={newStatus} onChange={e => setNewStatus(e.target.value as TaskStatus)} style={{ marginRight: 10 }}>
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button onClick={addTask}>Add Task</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: 10, border: '1px solid #eee', borderRadius: 6, padding: 10 }}>
            <input
              type="text"
              value={task.name}
              onChange={e => updateTask(task.id, e.target.value, task.status)}
              style={{ marginRight: 10 }}
            />
            <select value={task.status} onChange={e => updateTask(task.id, task.name, e.target.value as TaskStatus)} style={{ marginRight: 10 }}>
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskApp;
