// controllers/equipment.controller.js
const { Op } = require("sequelize");
const Equipment = require("../models/equipment.model");
const SavedEquipment = require("../models/savedequipment.model");
const User = require("../models/user.model");
const { uploadImages } = require("../utils/firebaseService"); // Make sure to implement this utility

// Create Equipment
exports.createEquipment = async (req, res) => {
  const { name, description, category, tags, useCases } = req.body;
  const userId = req.user.id; // Extract userId from the authenticated user

  try {
    // Upload images to Firebase and get URLs
    const imageUrls = await uploadImages(req.files);

    const equipment = await Equipment.create({
      name,
      description,
      category,
      images: imageUrls,
      tags,
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

exports.createSavedEquipment = async (req, res) => {
  const userId = req.user.id;

  try {
    const savedequipment = await SavedEquipment.upsert({
      userId: userId,
      equipmentIds: []
    })

    res.status(201).json(savedequipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPopularEquipments = async (req, res) => {
  try {
    const equipments = await Post.findAll({
      order: sequelize.literal('max(popularity) DESC'),
      limit: 10
    });
    res.json(equipments)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.getSavedEquipment = async (req, res) => {
  try {
    const savedEquipmentList = await SavedEquipment.findOne({
      where: { userId: req.user.id },
    })

    if(!savedEquipmentList){
      return ;
    }
    const equipmentIds = savedEquipmentList.equipmentIds

    const equipmentDetails = await Equipment.findAll({
      where: {
        id: {
          [Op.in]: equipmentIds
        }
      }
    });
    res.status(200).json(equipmentDetails);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
}

exports.saveEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const savedEquipment = await SavedEquipment.findOne({
      where: { userId: req.user.id}
    })
    savedEquipment.equipmentIds.push(id);
    await savedEquipment.save();

    res.status(200).json({message: "equipment added"});
  } catch (err) {
    res.status(500).json({error: err.message });
  }
}

exports.filterEquipments = async (req, res) => {
    const { name, category } = req.query;
    try {
      const filters = {}

      if(name){
        filters.name = { [Op.iLike]: `%${name}%`};
      }

      if (category) {
        filters.category = { [Op.eq]: category };
      }

      const equipmentList = await Equipment.findAll({
        where: filters
      });
  
      res.json(equipmentList);
    } catch (err) {
      res.status(500).json({error: err.message})
    }
}

exports.searchEquipments = async (req, res) => {
  const { searchTerm } = req.query;

  try {
    
    const filters = {};

    if (searchTerm) {
      filters[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },  
        { category: { [Op.iLike]: `%${searchTerm}%` } }
      ];
    }

    const equipmentList = await Equipment.findAll({
      where: filters
    });

    res.status(200).json(equipmentList);
  } catch (error) {
    res.status(500).json({error: err.message})
  }
};