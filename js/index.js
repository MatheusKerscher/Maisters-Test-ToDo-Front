const URL = "http://localhost:8080/task";

const modalError = new bootstrap.Modal(
  document.getElementById("modalErrorMessage")
);

const modalSuccess = new bootstrap.Modal(
  document.getElementById("modalSuccessMessage")
);

const modalTaskSave = new bootstrap.Modal(
  document.getElementById("modalTaskSave")
);

const modalTaskDelete = new bootstrap.Modal(
  document.getElementById("modalTaskDelete")
);

const taskId = document.getElementById("taskId");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDescription");

const modalTaskSaveTitle = document.getElementById("modalTaskSaveTitle");

let idToDelete = null;

async function findAllTasks() {
  try {
    const response = await fetch(URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const tasks = document.getElementById("tasks");

    if (response.ok) {
      const data = await response.json();

      tasks.innerHTML = "";

      data.forEach((item) => {
        tasks.innerHTML += `
        <div class="card-task">
            <div class="d-flex justify-content-between">
                <p>${formatDateTime(item.createDate)}</p>
                <p class="task-status">
                <small>${formatterTaskStatus(item.status)}</small>
                </p>
            </div>

            <h3 class="task-title">${item.title}</h3>
            
            <p class="task-desc">${item.description}</p>

            <div class="task-action">
                ${
                  item.status === "PENDING"
                    ? `
                <button class="task-button task-delete" onclick="deleteTask(${item.id})">
                    <i class="fa-regular fa-trash-can"></i>
                </button>`
                    : ""
                }

                ${
                  item.status === "PENDING"
                    ? `
                <button class="task-button task-doing" onclick="editTask(${item.id})">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>`
                    : ""
                }

                ${
                  item.status !== "COMPLETED" && item.status !== "IN_PROGRESS"
                    ? `
                <button class="task-button task-doing" onclick="updateTaskStatus(${item.id}, 'IN_PROGRESS')">
                <i class="fa-solid fa-play"></i>
                </button>`
                    : ""
                }

                ${
                  item.status !== "COMPLETED"
                    ? `
                <button class="task-button task-done" onclick="updateTaskStatus(${item.id}, 'COMPLETED')">
                <i class="fa-solid fa-check"></i>
                </button>`
                    : ""
                }
            </div>
        </div>
        `;
      });
    } else {
      openModalErrorMessage("No tasks were found.");
    }
  } catch (error) {
    openModalErrorMessage(
      "Unable to search for tasks now, please try again later."
    );
  }
}

async function findTaskByIdToEdit(id) {
  try {
    const response = await fetch(`${URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();

      taskId.value = data.id;
      taskTitle.value = data.title;
      taskDesc.value = data.description;

      openModalEditTask();
    } else {
      openModalErrorMessage("No task was found.");
    }
  } catch (error) {
    openModalErrorMessage(
      "Unable to search for this task now, please try again later."
    );
  }
}

async function createTask(data) {
  closeModal(modalTaskSave);

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();

      openModalSuccessMessage(`Task ${data.title} created successfully`);
      findAllTasks();
    } else {
      openModalErrorMessage("Tasks can only be created on weekdays.");
    }
  } catch (error) {
    openModalErrorMessage("Unable to create task now, please try again later.");
  }
}

async function updateTask(id, data) {
  closeModal(modalTaskSave);
  try {
    const response = await fetch(`${URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const data = await response.json();

      openModalSuccessMessage(`Task ${data.title} edited successfully`);
      findAllTasks();
    } else {
      openModalErrorMessage("Tasks can only be updated with pending status.");
    }
  } catch (error) {
    openModalErrorMessage("Unable to edit task now, please try again later.");
  }
}

async function updateTaskStatus(id, status) {
  try {
    const response = await fetch(`${URL}/status/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(status),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.id) {
        openModalSuccessMessage(`${data.title} task status updated`);
        findAllTasks();
      } else {
        openModalErrorMessage("Error updating task status.");
      }
    } else {
      openModalErrorMessage("Error updating task status.");
    }
  } catch (error) {
    openModalErrorMessage(
      "Unable to update task status, please try again later."
    );
  }
}

async function removeTask() {
  closeModal(modalTaskDelete);

  try {
    const response = await fetch(`${URL}/${idToDelete}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      idToDelete = null;
      openModalSuccessMessage(`Task deleted`);
      findAllTasks();
    } else {
      openModalErrorMessage(
        "Error deleting task. They can only be deleted with pending status and after five days of their creation."
      );
    }
  } catch (error) {
    openModalErrorMessage("Unable to delete task. Try again later.");
  }
}

findAllTasks();

function formatterTaskStatus(status) {
  if (status === "PENDING") {
    return "Pending";
  } else if (status === "IN_PROGRESS") {
    return "In progress";
  } else {
    return "Completed";
  }
}

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);

  const day = String(dateTime.getDate()).padStart(2, "0");
  const month = String(dateTime.getMonth() + 1).padStart(2, "0");
  const year = dateTime.getFullYear();
  const hours = String(dateTime.getHours()).padStart(2, "0");
  const minutes = String(dateTime.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

document.getElementById("buttonSaveTask").addEventListener("click", (ev) => {
  ev.preventDefault();

  const titleErrorMessage = document.getElementById("titleErrorMessage");
  const descriptionErrorMessage = document.getElementById(
    "descriptionErrorMessage"
  );

  titleErrorMessage.innerText = "";
  descriptionErrorMessage.innerText = "";

  if (taskTitle.value == "" || taskTitle.value == null) {
    titleErrorMessage.innerText = "The title is required";
  }

  if (taskDesc.value == "" || taskDesc.value == null) {
    descriptionErrorMessage.innerText = "The description is required";
  }

  if (taskTitle.value && taskDesc.value) {
    const data = {
      title: taskTitle.value,
      description: taskDesc.value,
    };

    if (taskId.value) {
      updateTask(taskId.value, data);
    } else {
      createTask(data);
    }

    taskId.value = "";
    taskTitle.value = "";
    taskDesc.value = "";
  }
});

function openModalErrorMessage(error) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.innerText = error;

  modalError.show();
}

function openModalSuccessMessage(message) {
  const successMessage = document.getElementById("successMessage");
  successMessage.innerText = message;

  modalSuccess.show();
}

function openModalCreateTask() {
  modalTaskSaveTitle.innerHTML = `<i class="fa-solid fa-plus"></i> Create Task`;

  modalTaskSave.show();
}

function openModalEditTask() {
  modalTaskSaveTitle.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Edit Task`;

  modalTaskSave.show();
}

function closeModal(modal) {
  modal.hide();
}

function editTask(id) {
  findTaskByIdToEdit(id);
}

function deleteTask(id) {
  idToDelete = id;
  modalTaskDelete.show();
}

document
  .getElementById("buttonCreateTask")
  .addEventListener("click", openModalCreateTask);
