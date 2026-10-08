const router = require("express").Router();
const { ensureSelfParam } = require("../auth/requireAuth");
const mongoose = require("mongoose");
const User = require("../auth/user");
const Note = require("./note");

const noteFields = ["title", "body", "tag", "favourite", "color"];

const noteData = (body = {}) => {
  const source = body && typeof body === "object" ? body : {};
  return noteFields.reduce((note, field) => {
    if (source[field] !== undefined) {
      note[field] = source[field];
    }
    return note;
  }, {});
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const validOwner = async (userId) => {
  if (!isValidId(userId)) return false;
  return Boolean(await User.exists({ _id: userId }));
};

// A userId in the URL must be the signed-in user.
router.param("userId", ensureSelfParam);

router.get("/getNotes/:userId", async (req, res) => {
  try {
    if (!(await validOwner(req.params.userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    const notes = await Note.find({ owner: req.params.userId }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    return res.status(200).json({ notes });
  } catch (error) {
    console.error("Note loading failed:", error.message);
    return res.status(500).json({ message: "Unable to load notes." });
  }
});

router.post("/addNote", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!(await validOwner(userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }

    const data = noteData(req.body);
    if (typeof data.title !== "string" || !data.title.trim()) {
      return res.status(400).json({ message: "Note title is required." });
    }

    const note = await Note.create({ ...data, owner: userId });
    return res.status(201).json({ note });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Note creation failed:", error.message);
    return res.status(500).json({ message: "Unable to create note." });
  }
});

router.post("/importNotes", async (req, res) => {
  try {
    const userId = req.body.userId;
    const sourceNotes = req.body.notes;

    if (!(await validOwner(userId))) {
      return res.status(400).json({ message: "A valid user ID is required." });
    }
    if (!Array.isArray(sourceNotes)) {
      return res.status(400).json({ message: "Notes must be an array." });
    }

    const existingNotes = await Note.find({ owner: userId }).sort({
      updatedAt: -1,
      createdAt: -1,
    });
    if (existingNotes.length) {
      return res.status(200).json({ notes: existingNotes, imported: false });
    }

    const data = sourceNotes.map((sourceNote) => noteData(sourceNote));
    if (
      data.some(
        (note) => typeof note.title !== "string" || !note.title.trim()
      )
    ) {
      return res.status(400).json({ message: "Every imported note needs a title." });
    }

    const importedNotes = data.length
      ? await Note.insertMany(
          data.map((note) => ({ ...note, owner: userId })),
          { ordered: true }
        )
      : [];

    return res.status(201).json({ notes: importedNotes, imported: true });
  } catch (error) {
    if (
      error.name === "ValidationError" ||
      error.name === "BulkWriteError" ||
      error.name === "MongooseBulkWriteError"
    ) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Note import failed:", error.message);
    return res.status(500).json({ message: "Unable to import notes." });
  }
});

router.put("/updateNote/:id", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!isValidId(userId) || !isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid user and note IDs are required." });
    }

    const data = noteData(req.body);
    if (
      data.title !== undefined &&
      (typeof data.title !== "string" || !data.title.trim())
    ) {
      return res.status(400).json({ message: "Note title is required." });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, owner: userId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    return res.status(200).json({ note });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Note update failed:", error.message);
    return res.status(500).json({ message: "Unable to update note." });
  }
});

router.delete("/deleteNote/:id", async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!isValidId(userId) || !isValidId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Valid user and note IDs are required." });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      owner: userId,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    return res.status(200).json({ message: "Note deleted." });
  } catch (error) {
    console.error("Note deletion failed:", error.message);
    return res.status(500).json({ message: "Unable to delete note." });
  }
});

module.exports = router;
