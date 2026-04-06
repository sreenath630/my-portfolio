// Enhanced To-Do List - Complete Version

let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

// Theme colors
const themes = {
    purple: { primary: '#667eea', secondary: '#764ba2' },
    blue: { primary: '#4facfe', secondary: '#00f2fe' },
    green: { primary: '#43e97b', secondary: '#38f9d7' },
    pink: { primary: '#fa709a', secondary: '#fee140' },
    orange: { primary: '#ff9a56', secondary: '#ff6a88' }
};

let currentTheme = 'purple';

// Sound effects
function playSound(type) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'add') {
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        } else if (type === 'complete') {
            oscillator.frequency.value = 600;
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        } else if (type === 'delete') {
            oscillator.frequency.value = 300;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch(e) {
        console.log('Sound not available');
    }
}

// Load data from localStorage
function loadData() {
    const savedTasks = localStorage.getItem('tasks');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedTheme && themes[savedTheme]) {
        currentTheme = savedTheme;
    }
    
    console.log('Loaded', tasks.length, 'tasks');
}

// Save tasks
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Apply theme
function applyTheme(themeName) {
    if (!themes[themeName]) {
        console.error('Unknown theme:', themeName);
        return;
    }
    
    const colors = themes[themeName];
    
    // Update background directly
    document.body.style.background = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`;
    
    // Update h1 color
    document.querySelector('h1').style.color = colors.primary;
    
    currentTheme = themeName;
    localStorage.setItem('theme', themeName);
    
    // Update active button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === themeName) {
            btn.classList.add('active');
            btn.style.borderColor = colors.primary;
            btn.style.boxShadow = `0 0 20px ${colors.primary}80`;
        } else {
            btn.classList.remove('active');
            btn.style.borderColor = 'transparent';
            btn.style.boxShadow = 'none';
        }
    });
    
    console.log('Theme changed to:', themeName);
}

// Check if date is overdue
function isOverdue(dueDate) {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    return due < today;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Add task
function addTask() {
    const input = document.getElementById('taskInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const dueDateInput = document.getElementById('dueDateInput');
    
    const taskText = input.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: prioritySelect.value,
        dueDate: dueDateInput.value || null,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    playSound('add');
    saveTasks();
    renderTasks();
    
    // Reset inputs
    input.value = '';
    prioritySelect.value = 'medium';
    dueDateInput.value = '';
    input.focus();
}

// Render tasks
function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = tasks.filter(task => task.priority === 'high');
    }
    
    // Sort by priority and due date
    filteredTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0;
    });
    
    if (filteredTasks.length === 0) {
        const emptyMsg = currentFilter === 'completed' ? 'No completed tasks yet' : 
                        currentFilter === 'high' ? 'No high priority tasks' : 
                        'No tasks yet. Add one above!';
        
        taskList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                </svg>
                <p>${emptyMsg}</p>
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item priority-' + task.priority;
            
            if (task.completed) {
                li.classList.add('completed');
            }
            
            if (isOverdue(task.dueDate) && !task.completed) {
                li.classList.add('overdue');
            }
            
            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.onclick = function() { toggleTask(task.id); };
            
            // Task content
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            
            const taskText = document.createElement('span');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            
            const taskMeta = document.createElement('div');
            taskMeta.className = 'task-meta';
            
            // Priority badge
            const priorityBadge = document.createElement('span');
            priorityBadge.className = 'priority-badge priority-' + task.priority;
            priorityBadge.textContent = task.priority.toUpperCase();
            taskMeta.appendChild(priorityBadge);
            
            // Due date
            if (task.dueDate) {
                const dueDateSpan = document.createElement('span');
                dueDateSpan.className = 'due-date';
                if (isOverdue(task.dueDate) && !task.completed) {
                    dueDateSpan.classList.add('overdue');
                    dueDateSpan.textContent = '⚠️ ' + formatDate(task.dueDate);
                } else {
                    dueDateSpan.textContent = '📅 ' + formatDate(task.dueDate);
                }
                taskMeta.appendChild(dueDateSpan);
            }
            
            taskContent.appendChild(taskText);
            taskContent.appendChild(taskMeta);
            
            // Buttons
            const taskButtons = document.createElement('div');
            taskButtons.className = 'task-buttons';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.textContent = '✏️ Edit';
            editBtn.onclick = function() { openEditModal(task.id); };
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '🗑️';
            deleteBtn.onclick = function() { deleteTask(task.id); };
            
            taskButtons.appendChild(editBtn);
            taskButtons.appendChild(deleteBtn);
            
            // Append all
            li.appendChild(checkbox);
            li.appendChild(taskContent);
            li.appendChild(taskButtons);
            taskList.appendChild(li);
        });
    }
    
    updateStats();
}

// Toggle task
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
            if (task.completed) {
                playSound('complete');
            }
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Delete task
function deleteTask(id) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        playSound('delete');
        saveTasks();
        renderTasks();
    }
}

// Open edit modal
function openEditModal(id) {
    editingTaskId = id;
    const task = tasks.find(t => t.id === id);
    
    if (!task) return;
    
    document.getElementById('editTaskInput').value = task.text;
    document.getElementById('editPrioritySelect').value = task.priority;
    document.getElementById('editDueDateInput').value = task.dueDate || '';
    
    document.getElementById('editModal').classList.add('show');
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingTaskId = null;
}

// Save edit
function saveEdit() {
    const editText = document.getElementById('editTaskInput').value.trim();
    const editPriority = document.getElementById('editPrioritySelect').value;
    const editDueDate = document.getElementById('editDueDateInput').value;
    
    if (editText === '') {
        alert('Task cannot be empty!');
        return;
    }
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return {
                ...task,
                text: editText,
                priority: editPriority,
                dueDate: editDueDate || null
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    closeEditModal();
}

// Update stats
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const highPriority = tasks.filter(task => task.priority === 'high' && !task.completed).length;
    
    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('highPriorityTasks').textContent = highPriority;
}

// Initialize
window.onload = function() {
    console.log('To-Do List loading...');
    
    loadData();
    applyTheme(currentTheme);
    renderTasks();
    
    // Add button
    document.getElementById('addBtn').onclick = addTask;
    
    // Enter key
    document.getElementById('taskInput').onkeypress = function(e) {
        if (e.key === 'Enter') addTask();
    };
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks();
        };
    });
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.onclick = function() {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
        };
    });
    
    // Modal buttons
    document.getElementById('saveEditBtn').onclick = saveEdit;
    document.getElementById('cancelEditBtn').onclick = closeEditModal;
    
    // Close modal on outside click
    document.getElementById('editModal').onclick = function(e) {
        if (e.target === this) closeEditModal();
    };
    
    // Enter in edit modal
    document.getElementById('editTaskInput').onkeypress = function(e) {
        if (e.key === 'Enter') saveEdit();
    };
    
    console.log('To-Do List ready!');
};
              
