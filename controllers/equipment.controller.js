// controllers/equipment.controller.js

const Equipment = require("../models/equipment.model");
const User = require("../models/user.model");
const { uploadImages } = require("../utils/firebaseService"); // Make sure to implement this utility

// Create Equipment
exports.createEquipment = async (req, res) => {
  const { name, description, category, tags, useCases } = req.body;
  const userId = req.user.id; // Extract userId from the authenticated user

  try {
    // Upload images to Firebase and get URLs
    const imageUrls = await uploadImages(req.files);
    let parsedTags = [];
    if (typeof tags === 'string') {
      parsedTags = JSON.parse(tags);
    }

    const equipment = await Equipment.create({
      name,
      description,
      category,
      images: imageUrls,
      tags: parsedTags,
      useCases,
      userId,
    });

    res.status(201).json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all Equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.findAll({
      include: User, // Include user info if needed
    });
    res.json(equipmentList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single Equipment
exports.getEquipmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const equipment = await Equipment.findByPk(id, { include: User });
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Equipment
exports.updateEquipment = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, tags, useCases } = req.body;

  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    // Update images if provided
    let imageUrls;
    if (req.files) {
      imageUrls = await uploadImages(req.files);
    }

    await equipment.update({
      name,
      description,
      category,
      images: imageUrls || equipment.images, // Use existing images if not updated
      tags,
      useCases,
    });

    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Equipment
exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: "Equipment not found" });
    }

    await equipment.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
