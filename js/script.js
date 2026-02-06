let tasks = [];
let currentFilter = 'all';
function init() {
    loadTasks();
    renderTasks();
    setupEventListeners();
}

function setupEventListeners() {
    const taskForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const filterButtons = document.querySelectorAll('.filter-button');

    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });
   
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            renderTasks();
        });
    });
    
    taskInput.addEventListener('input', validateTaskInput);
    dateInput.addEventListener('change', validateDateInput);
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function validateTaskInput() {
    const taskInput = document.getElementById('task-input');
    const value = taskInput.value.trim();
    const error = document.getElementById('task-error');
    
    if (value.length === 0) {
        error.textContent = 'Tugas tidak boleh kosong';
        return false;
    } else {
        error.textContent = '';
        return true;
    }
}

function validateDateInput() {
    const dateInput = document.getElementById('date-input');
    const date = dateInput.value;
    const error = document.getElementById('date-error');
    const today = new Date().toISOString().split('T')[0];
    
    if (!date) {
        error.textContent = 'Pilih tanggal';
        return false;
    } else if (date < today) {
        error.textContent = 'Tanggal tidak valid';
        return false;
    } else {
        error.textContent = '';
        return true;
    }
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const prioritySelect = document.getElementById('priority-select');
    
    const isTaskValid = validateTaskInput();
    const isDateValid = validateDateInput();
    
    if (!isTaskValid || !isDateValid) {
        alert('Harap perbaiki data terlebih dahulu');
        return;
    }

    const title = taskInput.value.trim();
    const date = dateInput.value;
    const priority = prioritySelect.value;
    
    const newTask = {
        id: Date.now(),
        title: title,
        date: date,
        priority: priority,
        done: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();
    
   
    taskInput.value = '';
    const today = new Date().toISOString().split('T')[0];

    showNotification('Tugas ditambahkan');
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    const emptyMessage = document.getElementById('empty-message');
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'todo') {
        filteredTasks = tasks.filter(task => !task.done);
    } else if (currentFilter === 'done') {
        filteredTasks = tasks.filter(task => task.done);
    }
 
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }
    emptyMessage.style.display = 'none';
    filteredTasks.sort((a, b) => {
        if (a.done !== b.done) {
            return a.done ? 1 : -1;
        }
        return new Date(a.date) - new Date(b.date);
    });
    
    taskList.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.done ? 'done' : ''}`;
        taskElement.dataset.id = task.id;
        const date = new Date(task.date);
        const formattedDate = date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short'
        });
        
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-info">
                    <span>${formattedDate}</span>
                    <span>${task.priority === 'important' ? 'Important' : 'Daily'}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-button done-button" onclick="toggleTask(${task.id})">
                    ${task.done ? '↩' : '✓'}
                </button>
                <button class="action-button delete-button" onclick="deleteTask(${task.id})">
                    ×
                </button>
            </div>
        `;
        
        taskList.appendChild(taskElement);
    });
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, done: !task.done };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    
    const task = tasks.find(t => t.id === id);
    showNotification(task.done ? 'Tugas selesai' : 'Tugas dibuka kembali');
}

function deleteTask(id) {
    if (confirm('Hapus tugas ini?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
        showNotification('Tugas dihapus');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #6d4c41;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}