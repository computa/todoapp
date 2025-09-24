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

console.log('cwd:', process.cwd());
console.log('Mongo-like env keys I see:',
  Object.keys(process.env).filter(k => /MONGO|DATABASE_URL/i.test(k))
);

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

// connectDatabase();

(async () => {
  try {
    mongoose.set("autoIndex", false);
    await mongoose.connect(
      process.env.MONGO_URI
    );
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

// ---------------------------------- ↓ API ROUTES ↓ --------------------------------------

// Root route
// app.get("/", (req, res) => {
//   res.send("Todo API is running. Try GET /tasks");
// });

// // Health check
// app.get("/healthz", (req, res) => res.send("ok"));

// -------------------------------------- TASK ROUTES --------------------------------------

// Get all the task
app.get("/tasks", async (req, res) => {
  try {
    const { sortBy } = req.query; // ?sortBy=dueDate or ?sortBy=createdOn

    let sortOption = {};

    if (sortBy === "dueDate") {
      sortOption = { dueDate: 1 }; //Ascending
    } else if (sortBy === "createdOn") {
      sortOption = { createdOn: 1 };
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
