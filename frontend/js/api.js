

// Global Variables (Allowed to be used in Every Function Onwards) --------
const taskForm = document.getElementById("taskForm");
const toDoList = document.getElementById("toDoList");
const completedList = document.getElementById("completedList");
const URL = "http://localhost:3000";

// -------------GENERAL FUNCTIONS-----------------------

function resetTaskForm() {
  taskForm.reset();
}

// -------------GENERAL EVENT LISTENERS -----------------------

const sortButton = document.getElementById("sortSelect");

sortButton.addEventListener("change", () => {
  displayTasks();
  document.dispatchEvent(new Event("tasksUpdated"));

});

window.addEventListener("DOMContentLoaded", () => {
  displayTasks();
  document.dispatchEvent(new Event("tasksUpdated"));
  sortButton.value = "default";
});

// -------------EVENT LISTENERS (TRIGGERS) FOR. TASK-----------------------

//to create a task
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  createNewTask();
});

// To complete the task

toDoList.addEventListener("click", (event) => {
  if (event.target.classList.contains("done")) {
    const taskId = event.target.getAttribute("data-id");
    completeTask(taskId);
  }
});

// To uncomplete the task

completedList.addEventListener("click", (event) => {
  if (event.target.classList.contains("notDone")) {
    const taskId = event.target.getAttribute("data-id");
    taskNotCompleted(taskId);
  }
});

// To delete a task

[toDoList, completedList].forEach((list) => {
  list.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete")) {
      const taskId = event.target.getAttribute("data-id");
      deleteTask(taskId);
    }
  });
});

// To Edit a task

toDoList.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit")) {
    const taskId = event.target.getAttribute("data-id");
    const taskTitle = event.target.getAttribute("data-title");
    const taskDescription = event.target.getAttribute("data-description");
    const taskDueDate = new Date(event.target.getAttribute("data-due-date"));
    console.log(taskDueDate);
    const editTaskName = document.getElementById("editTaskName");
    const editTaskDescription = document.getElementById("editTaskDescription");
    const editDueDate = document.getElementById("editDueDate");
    const saveChangesButton = document.getElementById("saveChangesButton");

    editTaskName.value = taskTitle;
    editTaskDescription.value = taskDescription;

    const formatedDueDate = taskDueDate.toISOString().split("T")[0];
    editDueDate.value = formatedDueDate;
    console.log(formatedDueDate);
    saveChangesButton.addEventListener(
      "click",
      async () => {
        await editTask(taskId);

        const editTaskModal = bootstrap.Modal.getInstance(document.getElementById("editTaskWindow"));
        editTaskModal.hide();
      },
      { once: true }
    );
  }
});

// -------------TASK FUNCTIONS-----------------------

// const tasks = [
//   { id: 1, completed: false, title: "Wash car", description: "My car is filthy and needs to be washed", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 2, completed: false, title: "Clean car", description: "My car is filthy and needs to be cleaned", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 3, completed: false, title: "Dust car", description: "My car is filthy and needs to be dusted", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 4, completed: false, title: "Vacume car", description: "My car is filthy and needs to be vacummed", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 5, completed: false, title: "Oil car", description: "My car is filthy and needs to be oiled", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 6, completed: false, title: "Wipe car", description: "My car is filthy and needs to be wipped", dueDate: "10/05/1025", createdOn: "28/072025" },
// ];

//Event Listeners / Triggers //

// Functions//

async function displayTasks() {
  try {
    {
      const sortSelect = document.getElementById("sortSelect");
      const sortBy = sortSelect.value;

      let query = "";
      if (sortBy !== "default") {
        query = `?sortBy=${sortBy}`;
      }

      const response = await fetch(`${URL}/tasks${query}`);

      if (!response.ok) {
        throw new Error(`Failed to get tasks: ${response.status}`);
      }

      const data = await response.json();

      // const toDoList = document.getElementById("toDoList");
      // const completedList = document.getElementById("completedList");

      function formatTask(task) {
        const li = document.createElement("li");
        li.classList.add("p-3", "shadow-sm", "mt-2", "card");
        li.innerHTML = task.completed
          ? `
            <div class="d-flex justify-content-between align-items-center">
                <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
                <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="close"></button>
            </div>
            <p class="text-decoration-line-through opacity-50">${task.description}</p>
            <p class="text-decoration-line-through opacity-50"><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <button data-id="${task._id}" class="btn btn-secondary shadow-sm notDone" type="button">Not Done</button>
                </div>
                <p class="m-0 text-decoration-line-through opacity-50"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p>
            </div>
            `
          : `<div class="d-flex justify-content-between align-items-center">
            <h4 class="col-11">${task.title}</h4>
            <button data-id="${task._id}" type="button" class="btn-close delete" aria-label="close"></button>
            </div>
            <p>${task.description}</p>
            <p><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <button data-bs-toggle="modal" data-bs-target="#editTaskWindow" data-id="${task._id}" data-title="${task.title}"  data-description="${task.description}" data-due-date="${task.dueDate}" class="btn btn-secondary shadow-sm edit" type="button">Edit</button>
                    <button data-id="${task._id}" class="btn btn-secondary shadow-sm done" type="button">Done</button>
                </div>
                <p class="m-0"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p>
            </div>
            `;
        return li;
      }

      // wipes column data to prevent double ups
      toDoList.innerHTML = "";
      completedList.innerHTML = "";

      const tasks = data;

      tasks.forEach((task) => {
        task.completed ? completedList.appendChild(formatTask(task)) : toDoList.appendChild(formatTask(task));
      });

      // Reset the create ne task form///

      resetTaskForm();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}


async function createNewTask() {
  try {
    const taskDetails = {
      title: document.getElementById("taskName").value.trim(),
      description: document.getElementById("taskDescription").value.trim(),
      dueDate: document.getElementById("dueDate").value,
    };

    const response = await fetch(`${URL}/tasks/todo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskDetails),
    });

    if (!response.ok) {
      throw new Error(`Failed to create new task: ${response.status}`);
    }

    const data = await response.json();

    console.log("New task created:", data);

    displayTasks();
    document.dispatchEvent(new Event("tasksUpdated"));

  } catch (error) {
    console.error("Error:", error);
  }
}

async function completeTask(Id) {
  try {
    const response = await fetch(`${URL}/tasks/complete/${Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: true }),
    });

    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.status}`);
    }

    const data = await response.json();
    console.log("Task completed", data);
    displayTasks();
    document.dispatchEvent(new Event("tasksUpdated"));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function taskNotCompleted(Id) {
  try {
    const response = await fetch(`${URL}/tasks/notComplete/${Id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: false }),
    });

    if (!response.ok) {
      throw new Error(`Failed tt set task 'not complete': ${response.status}`);
    }

    const data = await response.json();
    console.log("Task is not completed", data);
    displayTasks();
    document.dispatchEvent(new Event("tasksUpdated"));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function deleteTask(id) {
  try {
    const response = await fetch(`${URL}/tasks/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task! ${response.status}`);
    }

    const data = await response.json();
    console.log({ message: "Deleted task", task: data });
    displayTasks();
    document.dispatchEvent(new Event("tasksUpdated"));

  } catch (error) {
    console.error("Error:", error);
  }
}

async function editTask(id) {
  try {
    const updatedDetails = {
      title: document.getElementById("editTaskName").value.trim(),
      description: document.getElementById("editTaskDescription").value.trim(),
      dueDate: document.getElementById("editDueDate").value,
    };
    console.log(updatedDetails);
    const response = await fetch(`${URL}/tasks/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedDetails),
    });

    if (!response.ok) {
      throw new Error(`failed to edit task! ${response.status}`);
    }
    const data = await response.json();
    console.log("Editted Task", data);
    displayTasks();
    document.dispatchEvent(new Event("tasksUpdated"));
  } catch (error) {
    console.error("Error:", error);
  }
}

// async function getExample() {
//   const response = await fetch("http://localhost:3000/example");
//   const data = await response.text();

//   alert(data);
// }