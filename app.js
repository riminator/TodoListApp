const taskInput = document.getElementById('task-input');
const categoryInput = document.getElementById('category-input');
const deadlineInput = document.getElementById('deadline-input');
const priorityInput = document.getElementById('priority-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        if (task.completed) li.classList.add('completed');

        // Task Header
        const header = document.createElement('div');
        header.className = 'task-header';

        const textDiv = document.createElement('div');
        textDiv.className = 'task-text';
        textDiv.textContent = task.text + (task.deadline ? ` - ${task.deadline}` : '');
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
        taskList.appendChild(li);
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
        priority: priorityInput.value,
        completed: false
    });

    saveTasks();
    renderTasks();
    taskInput.value = '';
    deadlineInput.value = '';
});

// Add task on Enter
taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') addTaskBtn.click();
});

// Initial render
renderTasks();
