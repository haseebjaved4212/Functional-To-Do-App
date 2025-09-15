// --- THEME TOGGLE LOGIC ---
const themeToggleBtn = document.getElementById('themeToggle');
const root = document.documentElement;
// Set theme based on localStorage or system
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function getPreferredTheme() {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
});
// Initialize theme on load
setTheme(getPreferredTheme());

// --- Data to simulate our backend ---
// This array will act as our "database"
let tasks = [];

// --- DOM Elements ---
const addTaskForm = document.getElementById('addTaskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const loadingStatus = document.getElementById('loading-status');
const addTaskBtn = document.getElementById('addTaskBtn');

// --- Helper Function to render tasks ---
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between p-4 bg-gray-100 rounded-lg task-anim';
        li.setAttribute('data-task-id', task.id);
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    data-task-id="${task.id}" 
                    class="toggle-complete h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    ${task.completed ? 'checked' : ''}
                >
                <span class="${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}">
                    ${task.title}
                </span>
            </div>
            <div class="flex gap-2">
                <!-- Edit button for a simulated PUT request -->
                <button 
                    data-task-id="${task.id}" 
                    class="edit-btn text-blue-500 hover:text-blue-700 transition-colors duration-200 font-bold"
                >
                    Edit
                </button>
                <!-- Delete button for a simulated DELETE request -->
                <button 
                    data-task-id="${task.id}" 
                    class="delete-btn text-red-500 hover:text-red-700 transition-colors duration-200 font-bold"
                >
                    &times;
                </button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// --- Simulated API Calls ---

/**
 * Simulates a GET request to fetch all tasks. (Solution to Practice #3)
 */
function getTasks() {
    return new Promise(resolve => {
        setTimeout(() => {
            // This is our hardcoded "backend" data
            const fetchedTasks = [
                { id: 1, title: 'Learn Fetch API', completed: false },
                { id: 2, title: 'Build a To-Do List', completed: false }
            ];
            tasks = fetchedTasks;
            resolve();
        }, 500);
    });
}

/**
 * Simulates a POST request to add a new task to the server.
 * @param {string} title - The title of the new task.
 */
function postTask(title) {
    return new Promise(resolve => {
        setTimeout(() => {
            const newTask = {
                id: Date.now(),
                title: title,
                completed: false
            };
            tasks.push(newTask);
            resolve();
        }, 1000);
    });
}

/**
 * Simulates a PUT request to update an existing task. (Solution to Practice #1 & #2)
 * @param {number} taskId - The ID of the task to update.
 * @param {object} updatedTask - The updated task object.
 */
function putTask(taskId, updatedTask) {
    return new Promise(resolve => {
        setTimeout(() => {
            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                // Merge the existing task with the updated properties
                tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
            }
            resolve();
        }, 1000);
    });
}

/**
 * Simulates a DELETE request to remove a task from the server.
 * @param {number} taskId - The ID of the task to delete.
 */
function deleteTask(taskId) {
    return new Promise(resolve => {
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            resolve();
        }, 1000);
    });
}

// --- Event Handlers ---

/**
 * Handles the form submission to add a new task.
 */
async function handleAddTask(event) {
    event.preventDefault();
    const taskTitle = taskInput.value.trim();

    if (taskTitle) {
        loadingStatus.classList.remove('hidden');
        addTaskBtn.disabled = true;
        await postTask(taskTitle);
        loadingStatus.classList.add('hidden');
        addTaskBtn.disabled = false;
        taskInput.value = '';
        renderTasks();
        // Animate the last task
        const lastTask = taskList.lastElementChild;
        if (lastTask) {
            lastTask.classList.remove('task-anim');
            void lastTask.offsetWidth; // trigger reflow
            lastTask.classList.add('task-anim');
        }
    }
}

/**
 * Handles the click on a delete or edit button, or a change on the checkbox.
 */
async function handleTaskAction(event) {
    const target = event.target;
    const taskId = parseInt(target.dataset.taskId);
    
    if (target.classList.contains('delete-btn')) {
        // Animate task removal
        const li = target.closest('li');
        if (li) {
            li.classList.add('task-leave');
            li.addEventListener('animationend', async () => {
                loadingStatus.classList.remove('hidden');
                document.querySelectorAll('button').forEach(btn => btn.disabled = true);
                await deleteTask(taskId);
                loadingStatus.classList.add('hidden');
                document.querySelectorAll('button').forEach(btn => btn.disabled = false);
                renderTasks();
            }, { once: true });
        } else {
            // fallback
            loadingStatus.classList.remove('hidden');
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);
            await deleteTask(taskId);
            loadingStatus.classList.add('hidden');
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
            renderTasks();
        }
    } else if (target.classList.contains('toggle-complete')) {
        // Handle Toggle Complete (simulated PUT request)
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            loadingStatus.classList.remove('hidden');
            document.querySelectorAll('button, input[type="checkbox"]').forEach(el => el.disabled = true);

            await putTask(taskId, { completed: !task.completed });

            loadingStatus.classList.add('hidden');
            document.querySelectorAll('button, input[type="checkbox"]').forEach(el => el.disabled = false);
            renderTasks();
        }
    } else if (target.classList.contains('edit-btn')) {
        // Handle Edit (simulated PUT request)
        const task = tasks.find(t => t.id === taskId);
        const newTitle = prompt('Enter new task title:', task.title);

        if (newTitle && newTitle.trim() !== task.title) {
            loadingStatus.classList.remove('hidden');
            document.querySelectorAll('button').forEach(btn => btn.disabled = true);

            await putTask(taskId, { title: newTitle.trim() });

            loadingStatus.classList.add('hidden');
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
            renderTasks();
        }
    }
}

// --- Event Listeners ---
addTaskForm.addEventListener('submit', handleAddTask);
taskList.addEventListener('click', handleTaskAction);
taskList.addEventListener('change', handleTaskAction);

// --- Initial Call ---
// Simulates a GET request to fetch initial tasks on page load.
async function init() {
    loadingStatus.classList.remove('hidden');
    await getTasks();
    loadingStatus.classList.add('hidden');
    renderTasks();
}

init();
