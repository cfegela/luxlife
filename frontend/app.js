const API_BASE = '/api/todos';

let todos = [];
let editingId = null;

// DOM elements
const todoForm = document.getElementById('todoForm');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const todosList = document.getElementById('todosList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  todoForm.addEventListener('submit', handleAddTodo);
});

// Fetch and display todos
async function loadTodos() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) throw new Error('Failed to fetch todos');

    todos = await response.json();
    renderTodos();
  } catch (error) {
    console.error('Error loading todos:', error);
    todosList.innerHTML = '<p class="error">Failed to load todos. Please try again.</p>';
  }
}

// Render todos list
function renderTodos() {
  if (todos.length === 0) {
    todosList.innerHTML = '<p class="empty">No todos yet. Add one above!</p>';
    return;
  }

  todosList.innerHTML = todos.map(todo => {
    const isEditing = editingId === todo.id;
    const createdDate = new Date(todo.created_at).toLocaleDateString();

    return `
      <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-header">
          <input
            type="checkbox"
            class="todo-checkbox"
            ${todo.completed ? 'checked' : ''}
            onchange="toggleComplete(${todo.id}, this.checked)"
          >
          ${isEditing ? `
            <input
              type="text"
              class="todo-title-input"
              value="${escapeHtml(todo.title)}"
              id="edit-title-${todo.id}"
            >
          ` : `
            <span class="todo-title ${todo.completed ? 'completed' : ''}">
              ${escapeHtml(todo.title)}
            </span>
          `}
        </div>
        ${todo.description ? `
          ${isEditing ? `
            <textarea
              class="todo-description-input"
              rows="3"
              id="edit-description-${todo.id}"
            >${escapeHtml(todo.description)}</textarea>
          ` : `
            <p class="todo-description">${escapeHtml(todo.description)}</p>
          `}
        ` : ''}
        <div class="todo-footer">
          <span>Created: ${createdDate}</span>
          <div class="todo-actions">
            ${isEditing ? `
              <button class="btn btn-save" onclick="saveEdit(${todo.id})">Save</button>
              <button class="btn btn-cancel" onclick="cancelEdit()">Cancel</button>
            ` : `
              <button class="btn btn-edit" onclick="startEdit(${todo.id})">Edit</button>
            `}
            <button class="btn btn-delete" onclick="deleteTodo(${todo.id})">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Handle add todo form submission
async function handleAddTodo(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) return;

  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) throw new Error('Failed to create todo');

    const newTodo = await response.json();
    todos.unshift(newTodo);

    titleInput.value = '';
    descriptionInput.value = '';

    renderTodos();
  } catch (error) {
    console.error('Error creating todo:', error);
    alert('Failed to create todo. Please try again.');
  }
}

// Toggle todo completion
async function toggleComplete(id, completed) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed })
    });

    if (!response.ok) throw new Error('Failed to update todo');

    const updatedTodo = await response.json();
    todos = todos.map(t => t.id === id ? updatedTodo : t);

    renderTodos();
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Failed to update todo. Please try again.');
    loadTodos(); // Reload to revert the checkbox
  }
}

// Start editing a todo
function startEdit(id) {
  editingId = id;
  renderTodos();

  // Focus on title input
  const titleInput = document.getElementById(`edit-title-${id}`);
  if (titleInput) titleInput.focus();
}

// Cancel editing
function cancelEdit() {
  editingId = null;
  renderTodos();
}

// Save edited todo
async function saveEdit(id) {
  const titleInput = document.getElementById(`edit-title-${id}`);
  const descriptionInput = document.getElementById(`edit-description-${id}`);

  const title = titleInput.value.trim();
  const description = descriptionInput ? descriptionInput.value.trim() : null;

  if (!title) {
    alert('Title cannot be empty');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) throw new Error('Failed to update todo');

    const updatedTodo = await response.json();
    todos = todos.map(t => t.id === id ? updatedTodo : t);

    editingId = null;
    renderTodos();
  } catch (error) {
    console.error('Error updating todo:', error);
    alert('Failed to update todo. Please try again.');
  }
}

// Delete a todo
async function deleteTodo(id) {
  if (!confirm('Are you sure you want to delete this todo?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete todo');

    todos = todos.filter(t => t.id !== id);
    renderTodos();
  } catch (error) {
    console.error('Error deleting todo:', error);
    alert('Failed to delete todo. Please try again.');
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
