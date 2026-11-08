const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const priorityInput = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll("[data-filter]");
const taskStorageKey = "task-manager-tasks";
const themeStorageKey = "task-manager-theme";
const validPriorities = ["low", "medium", "high"];
let activeFilter = "all";

// localStorage keeps string values in this browser for this site across reloads.
// JSON converts the task objects to a string when saving and back to objects when loading.
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(taskStorageKey);
    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);
    if (
      !Array.isArray(parsedTasks) ||
      !parsedTasks.every(
        (task) =>
          task !== null &&
          typeof task === "object" &&
          typeof task.text === "string" &&
          task.text.trim().length > 0 &&
          typeof task.completed === "boolean" &&
          (task.priority === undefined || validPriorities.includes(task.priority)),
      )
    ) {
      throw new Error("Saved tasks have an invalid format.");
    }

    return parsedTasks.map((task) => ({
      text: task.text,
      completed: task.completed,
      priority: task.priority ?? "medium",
    }));
  } catch (error) {
    console.error("Could not load tasks from localStorage.", error);
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to localStorage.", error);
  }
}

function getVisibleTasks() {
  if (activeFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }
  if (activeFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
}

function beginTaskEdit(task, taskText) {
  const editInput = document.createElement("input");
  editInput.className = "task-edit-input";
  editInput.type = "text";
  editInput.value = task.text;
  editInput.setAttribute("aria-label", "Edit task");
  taskText.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  let finished = false;
  const finishEdit = (save) => {
    if (finished) {
      return;
    }
    finished = true;

    const updatedText = editInput.value.trim();
    if (save && updatedText) {
      task.text = updatedText;
      saveTasks();
    }
    renderTasks();
  };

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finishEdit(true);
    } else if (event.key === "Escape") {
      finishEdit(false);
    }
  });
  editInput.addEventListener("blur", () => finishEdit(true));
}

function renderTasks() {
  taskList.replaceChildren();

  getVisibleTasks().forEach((task) => {
    const taskItem = document.createElement("li");
    const taskLabel = document.createElement("div");
    const checkbox = document.createElement("input");
    const taskText = document.createElement("span");
    const deleteButton = document.createElement("button");

    taskItem.className = "task-item";
    taskLabel.className = "task-checkbox";
    taskItem.dataset.priority = task.priority;
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Mark "${task.text}" complete`);
    taskText.textContent = task.text;
    taskText.style.textDecoration = task.completed ? "line-through" : "none";
    taskText.addEventListener("dblclick", () => beginTaskEdit(task, taskText));

    taskLabel.append(checkbox);
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete "${task.text}"`);
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask !== task);
      saveTasks();
      renderTasks();
    });

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    taskItem.append(taskLabel, taskText, deleteButton);
    taskList.append(taskItem);
  });

  emptyState.hidden = getVisibleTasks().length > 0;
  emptyState.textContent =
    tasks.length === 0
      ? "Your list is clear. Add a task to get started."
      : "No tasks match this filter.";

  filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    renderTasks();
  });
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) {
    taskInput.focus();
    return;
  }

  tasks.push({
    text: taskText,
    completed: false,
    priority: priorityInput.value,
  });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

// The saved theme string is read on startup so the selected color scheme survives reloads.
function loadTheme() {
  try {
    return localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
  } catch (error) {
    console.error("Could not load the saved theme from localStorage.", error);
    return "light";
  }
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

setTheme(loadTheme());
themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme);
  try {
    localStorage.setItem(themeStorageKey, nextTheme);
  } catch (error) {
    console.error("Could not save the selected theme to localStorage.", error);
  }
});

renderTasks();
