// Add submitted tasks to the list without interpreting user text as HTML.
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) {
    taskInput.focus();
    return;
  }

  const taskItem = document.createElement("li");
  taskItem.textContent = taskText;
  taskList.append(taskItem);
  emptyState.hidden = true;

  taskForm.reset();
  taskInput.focus();
});