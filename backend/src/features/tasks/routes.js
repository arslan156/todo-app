const router = require("express").Router();
const { ensureSelfParam } = require("../auth/requireAuth");
const mongoose = require("mongoose");
const User = require("../auth/user");
const List = require("./list");

const taskFields = [
  "title",
  "description",
  "assignee",
  "tag",
  "priority",
  "dueDate",
  "done",
  "starred",
  "trashed",
];

const taskData = (body) =>
  taskFields.reduce((task, field) => {
    if (body[field] !== undefined) {
      task[field] = body[field];
    }
    return task;
  }, {});

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePositiveInteger = (value, fallback, maximum) => {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) return null;

  const parsed = Number(value);
  return parsed > 0 && parsed <= maximum ? parsed : null;
};

const buildTaskQuery = ({ userId, filter, tag, priority, search }) => {
  const query = { user: userId };

  if (filter === "trash") {
    query.trashed = true;
  } else {
    query.trashed = { $ne: true };

    if (filter === "done") query.done = true;
    if (filter === "important") query.starred = true;
    if (filter === "due") {
      query.done = { $ne: true };
      query.dueDate = { $exists: true, $nin: ["", null] };
    }
  }

  if (tag) query.tag = tag;
  if (priority) query.priority = priority;

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { assignee: searchRegex },
      { tag: searchRegex },
      { priority: searchRegex },
      { dueDate: searchRegex },
    ];
  }

  return query;
};

// A userId in the URL must be the signed-in user.
router.param("userId", ensureSelfParam);

router.post("/addTask", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.id;
    const data = taskData(req.body);

    if (!isValidId(userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    if (!data.title?.trim()) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const task = await List.create({
      ...data,
      user: [user._id],
    });

    user.list.push(task._id);
    await user.save();

    return res.status(201).json({ task });
  } catch (error) {
    console.error("Task creation failed:", error.message);
    return res.status(500).json({ message: "Unable to create task." });
  }
});

router.put("/updateTask/:id", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.id;
    if (!isValidId(userId) || !isValidId(req.params.id)) {
      return res.status(400).json({ message: "Valid user and task IDs are required." });
    }

    const task = await List.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: taskData(req.body) },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    return res.status(200).json({ task });
  } catch (error) {
    console.error("Task update failed:", error.message);
    return res.status(500).json({ message: "Unable to update task." });
  }
});

router.delete("/deleteTask/:id", async (req, res) => {
  try {
    const userId = req.body.userId || req.body.id;
    if (!isValidId(userId) || !isValidId(req.params.id)) {
      return res.status(400).json({ message: "Valid user and task IDs are required." });
    }

    const task = await List.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { list: task._id },
    });

    return res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    console.error("Task deletion failed:", error.message);
    return res.status(500).json({ message: "Unable to delete task." });
  }
});

router.get("/getTasks/:userId", async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    const paginated = ["page", "limit", "search", "filter", "tag", "priority"].some((key) =>
      Object.prototype.hasOwnProperty.call(req.query, key)
    );

    if (paginated) {
      if (
        ["page", "limit", "search", "filter", "tag", "priority"].some(
          (key) =>
            req.query[key] !== undefined &&
            typeof req.query[key] !== "string"
        )
      ) {
        return res.status(400).json({ message: "Task query parameters must be text." });
      }

      const page = parsePositiveInteger(req.query.page, 1, 1000000);
      const limit = parsePositiveInteger(req.query.limit, 10, 100);
      const allowedFilters = ["inbox", "done", "important", "due", "trash"];
      const allowedPriorities = ["high", "medium", "low"];

      if (!page || !limit) {
        return res.status(400).json({
          message: "Page and limit must be positive integers; limit cannot exceed 100.",
        });
      }
      if (req.query.filter && !allowedFilters.includes(req.query.filter)) {
        return res.status(400).json({ message: "Invalid task filter." });
      }
      if (req.query.priority && !allowedPriorities.includes(req.query.priority)) {
        return res.status(400).json({ message: "Invalid task priority." });
      }
      if ((req.query.search || "").length > 200) {
        return res.status(400).json({ message: "Search cannot exceed 200 characters." });
      }
      const userId = new mongoose.Types.ObjectId(req.params.userId);
      const query = buildTaskQuery({
        userId,
        filter: req.query.filter || "inbox",
        tag: req.query.tag || "",
        priority: req.query.priority || "",
        search: (req.query.search || "").trim(),
      });
      const totalItems = await List.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(totalItems / limit));
      const currentPage = Math.min(page, totalPages);
      const sortStages =
        req.query.filter === "due"
          ? [{ $sort: { dueDate: 1, createdAt: -1 } }]
          : [
              {
                $addFields: {
                  taskPriorityOrder: {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$priority", "high"] }, then: 0 },
                        { case: { $eq: ["$priority", "medium"] }, then: 1 },
                        { case: { $eq: ["$priority", "low"] }, then: 2 },
                      ],
                      default: 3,
                    },
                  },
                },
              },
              { $sort: { taskPriorityOrder: 1, createdAt: -1 } },
              { $project: { taskPriorityOrder: 0 } },
            ];
      const tasks = await List.aggregate([
        { $match: query },
        ...sortStages,
        { $skip: (currentPage - 1) * limit },
        { $limit: limit },
      ]);

      return res.status(200).json({
        tasks,
        pagination: {
          page: currentPage,
          limit,
          totalItems,
          totalPages,
        },
      });
    }

    const tasks = await List.find({ user: req.params.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ list: tasks });
  } catch (error) {
    console.error("Task loading failed:", error.message);
    return res.status(500).json({ message: "Unable to load tasks." });
  }
});

module.exports = router;
