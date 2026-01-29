const taskInput = document.getElementById('task-input');
const timeInput = document.getElementById("time-input");
const categoryInput = document.getElementById('category-input');
const deadlineInput = document.getElementById('deadline-input');
const priorityInput = document.getElementById('priority-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

// Request notification permission
if ("Notification" in window) {
    Notification.requestPermission();
}

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

tasks = tasks.map(task => ({ ...task, notified: task.notified || false }));

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatTime(time) {
    if (!time) return '';
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });
}

function checkNotifications() {
    const now = new Date();
    console.log("=== Checking notifications at", now.toLocaleTimeString(), "===");

    tasks.forEach(task => {
        if (!task.deadline || !task.time) {
            console.log("Skipping task (missing date/time):", task.text);
            return;
        }

        const [year, month, day] = task.deadline.split("-");
        const [hour, minute] = task.time.split(":");
        const taskTime = new Date(year, month - 1, day, hour, minute);

        // Only check if task is not completed
        if (!task.completed && now >= taskTime) {
            console.log("Firing notification for:", task.text);

            // Add timestamp to body so Chrome treats it as new
            new Notification("Task Reminder", {
                body: `${task.text} — ${now.toLocaleTimeString()}`
            });
        } else {
            console.log("Not time yet for:", task.text);
        }
    });
}


function renderTasks() {
    taskList.innerHTML = `
        <h3>Today</h3>
        <ul id="today"></ul>
        <h3>Upcoming</h3>
        <ul id="upcoming"></ul>
        <h3>Overdue</h3>
        <ul id="overdue"></ul>
    `;


    tasks.sort((a, b) => {
        const aDate = new Date(`${a.deadline || '9999-12-31'} ${a.time || '23:59'}`);
        const bDate = new Date(`${b.deadline || '9999-12-31'} ${b.time || '23:59'}`);
        return aDate - bDate;
    });


    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        if (task.completed) li.classList.add('completed');

        // Task Header
        const header = document.createElement('div');
        header.className = 'task-header';

        const textDiv = document.createElement('div');
        textDiv.className = 'task-text';
        let meta = [];

        if (task.deadline) meta.push(formatDate(task.deadline));
        if (task.time) meta.push(formatTime(task.time));

        textDiv.textContent = task.text + (meta.length ? ` — ${meta.join(' ')}` : '');

        textDiv.addEventListener('click', () => {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        });

        // Badges
        const badgesDiv = document.createElement('div');
        badgesDiv.className = 'badges';

        const catBadge = document.createElement('span');
        catBadge.className = 'badge category';
        catBadge.textContent = task.category;

        const prioBadge = document.createElement('span');
        prioBadge.className = `badge ${task.priority.toLowerCase()}`;
        prioBadge.textContent = task.priority;

        badgesDiv.appendChild(catBadge);
        badgesDiv.appendChild(prioBadge);

        header.appendChild(textDiv);
        header.appendChild(badgesDiv);
        li.appendChild(header);

        // Actions (Move Up/Down + Delete)
        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const upBtn = document.createElement('button');
        upBtn.textContent = '↑';
        upBtn.className = 'priority-btn';
        upBtn.addEventListener('click', () => {
            if (index === 0) return;
            [tasks[index-1], tasks[index]] = [tasks[index], tasks[index-1]];
            saveTasks();
            renderTasks();
        });

        const downBtn = document.createElement('button');
        downBtn.textContent = '↓';
        downBtn.className = 'priority-btn';
        downBtn.addEventListener('click', () => {
            if (index === tasks.length - 1) return;
            [tasks[index+1], tasks[index]] = [tasks[index], tasks[index+1]];
            saveTasks();
            renderTasks();
        });

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'delete-btn';
        delBtn.addEventListener('click', () => {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        });

        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(delBtn);

        li.appendChild(actions);
        
        const now = new Date();
        const [year, month, day] = (task.deadline || "9999-12-31").split("-");
        const [hour, minute] = (task.time || "23:59").split(":");
        const taskDate = new Date(year, month - 1, day, hour, minute);


        let section = document.getElementById("upcoming");

        if (task.deadline) {
            if (taskDate.toDateString() === now.toDateString()) {
                section = document.getElementById("today");
            } else if (taskDate < now && !task.completed) {
                section = document.getElementById("overdue");
            }
        }

        section.appendChild(li);

    });
}

// Add Task
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) return;

    tasks.push({
        text,
        category: categoryInput.value,
        deadline: deadlineInput.value,
        time: timeInput.value,
        priority: priorityInput.value,
        completed: false,
        notified: false
    });


    saveTasks();
    renderTasks();
    taskInput.value = '';
    deadlineInput.value = '';
    timeInput.value = '';
});

// Add task on Enter
taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTaskBtn.click();
});

// Initial render
renderTasks();

setInterval(checkNotifications, 5000); // check every minute

