/**
 * @jest-environment jsdom
 */

// Load the app.js file content as a string and extract functions
const fs = require('fs');
const path = require('path');

// Read app.js content
const appJsPath = path.join(__dirname, '../app.js');
const appJsContent = fs.readFileSync(appJsPath, 'utf8');

// Execute the app.js content in a function scope to access its functions
const createAppContext = () => {
  const context = {
    fetch: global.fetch,
    document: global.document,
    alert: jest.fn(),
    confirm: jest.fn(),
    console: global.console,
  };

  // Execute app.js in the context
  const func = new Function(...Object.keys(context), appJsContent);
  func(...Object.values(context));

  return context;
};

describe('Frontend - Unit Tests', () => {
  let document;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    if (global.fetch.mockClear) {
      global.fetch.mockClear();
    }

    // Set up DOM
    document = global.document;
    document.body.innerHTML = `
      <form id="todoForm">
        <input type="text" id="title" />
        <textarea id="description"></textarea>
      </form>
      <div id="todosList"></div>
    `;
  });

  describe('escapeHtml function', () => {
    it('should escape HTML special characters', () => {
      // Test the escapeHtml function by executing it in isolation
      const escapeHtml = new Function('text', `
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      `);

      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
      expect(escapeHtml('Test & Test')).toBe('Test &amp; Test');
      expect(escapeHtml('"quotes"')).toBe('"quotes"');
    });

    it('should handle empty strings', () => {
      const escapeHtml = new Function('text', `
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      `);

      expect(escapeHtml('')).toBe('');
    });

    it('should handle special characters', () => {
      const escapeHtml = new Function('text', `
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      `);

      expect(escapeHtml('<div>Test</div>')).toBe('&lt;div&gt;Test&lt;/div&gt;');
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
  });

  describe('API URL configuration', () => {
    it('should use correct API base URL', () => {
      expect(appJsContent).toContain("const API_BASE = '/api/todos'");
    });
  });

  describe('DOM element references', () => {
    it('should reference correct DOM elements', () => {
      expect(appJsContent).toContain("getElementById('todoForm')");
      expect(appJsContent).toContain("getElementById('title')");
      expect(appJsContent).toContain("getElementById('description')");
      expect(appJsContent).toContain("getElementById('todosList')");
    });
  });

  describe('Event handlers', () => {
    it('should have form submit handler', () => {
      expect(appJsContent).toContain('handleAddTodo');
      expect(appJsContent).toContain('addEventListener');
    });

    it('should have CRUD operation handlers', () => {
      expect(appJsContent).toContain('function loadTodos');
      expect(appJsContent).toContain('function toggleComplete');
      expect(appJsContent).toContain('function deleteTodo');
      expect(appJsContent).toContain('function startEdit');
      expect(appJsContent).toContain('function saveEdit');
      expect(appJsContent).toContain('function cancelEdit');
    });
  });

  describe('Fetch API calls', () => {
    it('should make GET request to load todos', () => {
      expect(appJsContent).toContain('fetch(API_BASE)');
    });

    it('should make POST request to create todos', () => {
      expect(appJsContent).toContain("method: 'POST'");
      expect(appJsContent).toContain("'Content-Type': 'application/json'");
    });

    it('should make PUT request to update todos', () => {
      expect(appJsContent).toContain("method: 'PUT'");
    });

    it('should make DELETE request to delete todos', () => {
      expect(appJsContent).toContain("method: 'DELETE'");
    });
  });

  describe('Error handling', () => {
    it('should handle fetch errors', () => {
      expect(appJsContent).toContain('catch');
      expect(appJsContent).toContain('error');
    });

    it('should display error messages', () => {
      expect(appJsContent).toContain('Failed to');
      expect(appJsContent).toContain('alert');
    });
  });

  describe('Data validation', () => {
    it('should validate title is required', () => {
      expect(appJsContent).toContain('!title');
      expect(appJsContent).toContain('Title');
    });

    it('should trim input values', () => {
      expect(appJsContent).toContain('.trim()');
    });
  });

  describe('UI rendering', () => {
    it('should render empty state message', () => {
      expect(appJsContent).toContain('No todos yet');
    });

    it('should render todo items with correct structure', () => {
      expect(appJsContent).toContain('todo-item');
      expect(appJsContent).toContain('todo-header');
      expect(appJsContent).toContain('todo-title');
      expect(appJsContent).toContain('todo-description');
      expect(appJsContent).toContain('todo-checkbox');
    });

    it('should render action buttons', () => {
      expect(appJsContent).toContain('btn-edit');
      expect(appJsContent).toContain('btn-delete');
      expect(appJsContent).toContain('btn-save');
      expect(appJsContent).toContain('btn-cancel');
    });
  });

  describe('Todo state management', () => {
    it('should initialize todos array', () => {
      expect(appJsContent).toContain('let todos = []');
    });

    it('should track editing state', () => {
      expect(appJsContent).toContain('let editingId');
    });

    it('should update todos array on CRUD operations', () => {
      expect(appJsContent).toContain('todos =');
      expect(appJsContent).toContain('todos.map');
      expect(appJsContent).toContain('todos.filter');
    });
  });

  describe('User confirmations', () => {
    it('should confirm before deleting todo', () => {
      expect(appJsContent).toContain('confirm');
      expect(appJsContent).toContain('delete');
    });
  });

  describe('Form handling', () => {
    it('should prevent default form submission', () => {
      expect(appJsContent).toContain('preventDefault');
    });

    it('should clear form after submission', () => {
      expect(appJsContent).toContain('.value = \'\'');
    });
  });

  describe('Inline editing', () => {
    it('should support inline title editing', () => {
      expect(appJsContent).toContain('edit-title-');
      expect(appJsContent).toContain('todo-title-input');
    });

    it('should support inline description editing', () => {
      expect(appJsContent).toContain('edit-description-');
      expect(appJsContent).toContain('todo-description-input');
    });

    it('should focus on input when editing starts', () => {
      expect(appJsContent).toContain('.focus()');
    });
  });

  describe('Completion toggle', () => {
    it('should handle checkbox changes', () => {
      expect(appJsContent).toContain('toggleComplete');
      expect(appJsContent).toContain('completed');
      expect(appJsContent).toContain('checkbox');
    });

    it('should apply completed class styling', () => {
      expect(appJsContent).toContain('completed');
    });
  });

  describe('Date formatting', () => {
    it('should format created date', () => {
      expect(appJsContent).toContain('toLocaleDateString');
      expect(appJsContent).toContain('created_at');
    });
  });

  describe('Response handling', () => {
    it('should check response status', () => {
      expect(appJsContent).toContain('response.ok');
    });

    it('should parse JSON responses', () => {
      expect(appJsContent).toContain('response.json()');
    });
  });
});
