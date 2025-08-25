// --------------------------- ↓ SETTING UP DEPENDENCIES ↓ --------------------------------
require("dotenv").config();
const express = require("express"); // Enables use of XPathExpression.js
const cors = require("cors"); // Enables Cross origin Resource Sharing
const mongoose = require("mongoose"); // Enables use of MongoDB

// ---------------------------- ↓ INITIAL APP CONFIGURATION ↓ -----------------------------

const port = process.env.PORT || process.env.port || 3000; // Uses port number on device to srve the backed (live)
const app = express(); // Using Express.js to power the app

// -------------------------------- ↓ MIDDLEWARE SETUP ↓ -----------------------------------

app.use(express.json());
app.use(cors("*"));

// ---------------------------------- ↓ DATABASE CONNECTION ↓ --------------------------------------

// connectDatabase();

(async () => {
  try {
    mongoose.set("autoIndex", false);
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL);
    console.log("MongoDB Connected");

    await Task.syncIndexes();
    console.log(" Indexes created");

    app.listen(port, () => {
      console.log(`To Do App is live on port ${port}`);
    });
  } catch (error) {
    console.error("X Startup error:", error);
    process.exit(1); //Shut down the server
  }
})();

// Define the task Schema (data structure)

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  createdOn: { type: Date, default: Date.now, required: true },
  completed: { type: Boolean, required: true, default: false },
});

taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdOn: 1 });

// Create a "Task" model to be used in the database
const Task = mongoose.model("Task", taskSchema);

// ---------------------------------- ↓ API ROUTES ↓ --------------------------------------

//Example
// app.get("/example", async (req, res) => {
//   res.send("Hello! I am a message from the backend");
// });

// -------------------------------------- TASK ROUTES --------------------------------------
// let taskId = 1;
// const tasks = [
//   { id: 1, completed: false, title: "Wash car", description: "My car is filthy and needs to be washed", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 2, completed: false, title: "Clean car", description: "My car is filthy and needs to be cleaned", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 3, completed: false, title: "Dust car", description: "My car is filthy and needs to be dusted", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 4, completed: true, title: "Vacume car", description: "My car is filthy and needs to be vacummed", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 5, completed: true, title: "Oil car", description: "My car is filthy and needs to be oiled", dueDate: "10/05/1025", createdOn: "28/072025" },
//   { id: 6, completed: false, title: "Wipe car", description: "My car is filthy and needs to be wipped", dueDate: "10/05/1025", createdOn: "28/072025" },
// ];

// Get all the task

app.get("/tasks", async (req, res) => {
  try {
    const { sortBy } = req.query; // ?sortBy=duedate or ?sortBy=DateCreated

    let sortOption = {};

    if (sortBy === "dueDate") {
      sortOption = { dueDate: 1 }; //Ascending\
    } else if (sortBy === "dateCreated") {
      sortOption = { dateCreated: 1 };
    }

    const tasks = await Task.find({}).sort(sortOption);
    res.json(tasks);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error grabbing tasks!" });
  }
});

// Create a new task and add it to the array
app.post("/tasks/todo", async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const taskData = { title, description, dueDate }; // grabs data
    const createTask = new Task(taskData); // Creates a new "Task" model with the data grab
    const newTask = await createTask.save();

    res.json({ task: newTask, message: "New task created successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error creating tasks!" });
  }
});

// to complete task
app.patch("/tasks/complete/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    const completedTask = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });

    if (!completedTask) {
      return res.status(404).json({ message: "task not found" });
    }
    res.json({ task: completedTask, message: "task set to complete" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error completing the task!" });
  }
});

// to not complete task
app.patch("/tasks/notComplete/:id", async (req, res) => {
  try {
    const { completed } = req.body;
    const taskId = req.params.id;

    const taskNotComplete = await Task.findByIdAndUpdate(taskId, { completed }, { new: true });

    if (!taskNotComplete) {
      return res.status(404).json({ message: "task not found" });
    }
    res.json({ task: taskNotComplete, message: "task set to 'not complete'" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error setting the task to 'not complete'" });
  }
});

// To Delete the task
app.delete("/tasks/delete/:id", async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task: deletedTask, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error deleting the task!" });
  }
});

// To edit task

app.put("/tasks/update/:id", async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, description, dueDate } = req.body;

    const taskData = { title, description, dueDate };
    console.log(taskData);
    const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ task: updatedTask, message: "Task updated successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error editing the task!" });
  }
});