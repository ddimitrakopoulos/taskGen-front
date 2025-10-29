import React, { useEffect, useState } from 'react';

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

const TaskApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [savedTasks, setSavedTasks] = useState<Task[]>([]); // ✅ snapshot of last saved state
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>(TaskStatus.NotStarted);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  // 🧩 detect "dirty" (unsaved) state by comparing local vs saved tasks
  const isDirty = JSON.stringify(tasks) !== JSON.stringify(savedTasks);

  // 🔹 Load tasks on mount
  useEffect(() => {
    if (token) loadTasks();
  }, []);

  // 🔹 Add a new task locally
  const addTask = () => {
    if (!newName.trim()) return;
    setTasks([...tasks, { id: Date.now(), name: newName, status: newStatus }]);
    setNewName('');
    setNewStatus(TaskStatus.NotStarted);
  };

  // 🔹 Delete a task locally
  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // 🔹 Update a task locally
  const updateTask = (id: number, name: string, status: TaskStatus) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, name, status } : task)));
  };

  // 🔹 Load tasks from backend
  const loadTasks = async () => {
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load tasks');

      const loadedTasks: Task[] = data.tasks.map((t: any, idx: number) => ({
        id: idx + 1,
        name: t.name,
        status: t.status as TaskStatus,
      }));

      setTasks(loadedTasks);
      setSavedTasks(loadedTasks); // ✅ mark as clean
      setMessage(`✅ Loaded ${loadedTasks.length} tasks for ${data.username}`);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Save tasks to backend
  const saveTasks = async () => {
    if (!token) return;
    if (!isDirty) return; // no changes, no need to save

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tasks: tasks.map(t => ({
            name: t.name,
            status: t.status,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save tasks');

      setSavedTasks(tasks); // ✅ mark as clean after successful save
      setMessage(`✅ Tasks saved successfully for ${data.username}`);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 20 }}>
      <h2>Tasks for {username}</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Task name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <select
          value={newStatus}
          onChange={e => setNewStatus(e.target.value as TaskStatus)}
          style={{ marginRight: 10 }}
        >
          {Object.values(TaskStatus).map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button onClick={addTask} disabled={loading}>
          Add Task
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={loadTasks} disabled={loading} style={{ marginRight: 10 }}>
          Load
        </button>
        <button
          onClick={saveTasks}
          disabled={loading || !isDirty}
          style={{
            backgroundColor: isDirty ? '#007bff' : '#aaa',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: 4,
            cursor: isDirty ? 'pointer' : 'not-allowed',
          }}
        >
          {isDirty ? 'Save' : 'Saved ✓'}
        </button>
      </div>

      {message && (
        <div
          style={{
            marginBottom: 10,
            color: message.startsWith('❌') ? 'red' : 'green',
          }}
        >
          {message}
        </div>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tasks.map(task => (
          <li
            key={task.id}
            style={{
              marginBottom: 10,
              border: '1px solid #eee',
              borderRadius: 6,
              padding: 10,
            }}
          >
            <input
              type="text"
              value={task.name}
              onChange={e => updateTask(task.id, e.target.value, task.status)}
              style={{ marginRight: 10 }}
            />
            <select
              value={task.status}
              onChange={e => updateTask(task.id, task.name, e.target.value as TaskStatus)}
              style={{ marginRight: 10 }}
            >
              {Object.values(TaskStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
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
