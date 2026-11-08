const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const storageKey = "task-manager-tasks";

// localStorage keeps string values in this browser for this site across reloads.
// JSON converts the task objects to a string when saving and back to objects when loading.
function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);
    if (
      !Array.isArray(parsedTasks) ||
      !parsedTasks.every(
        (task) =>
          typeof task.text === "string" &&
          task.text.trim().length > 0 &&
          typeof task.completed === "boolean",
      )
    ) {
      throw new Error("Saved tasks have an invalid format.");
    }

    return parsedTasks;
  } catch (error) {
    console.error("Could not load tasks from localStorage.", error);
    return [];
  }
}

let tasks = loadTasks();

function saveTasks() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks to localStorage.", error);
  }
}

function renderTasks() {
  taskList.replaceChildren();

  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    const taskLabel = document.createElement("label");
    const checkbox = document.createElement("input");
    const taskText = document.createElement("span");
    const deleteButton = document.createElement("button");

    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    taskText.textContent = task.text;
    taskText.style.textDecoration = task.completed ? "line-through" : "none";

    taskLabel.append(checkbox, taskText);
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter((currentTask) => currentTask !== task);
      saveTasks();
      renderTasks();
    });

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      taskText.style.textDecoration = task.completed ? "line-through" : "none";
      saveTasks();
    });

    taskItem.append(taskLabel, deleteButton);
    taskList.append(taskItem);
  });

  emptyState.hidden = tasks.length > 0;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) {
    taskInput.focus();
    return;
  }

  tasks.push({ text: taskText, completed: false });
  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

renderTasks();
