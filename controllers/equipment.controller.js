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
    console.log("files received: ", req.files);
    
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
//exports.getAllEquipment = async (req, res) => {
 // const { name, category, searchTerm } = req.query;
 //  try {
 //    const filters = {}

 //    if(name){
 //      filters.name = { [Op.iLike]: `%${name}%`};
 //    }

 //    if (category) {
 //      filters.category = { [Op.eq]: category };
 //    }

 //    if (searchTerm) {
    //   filters[Op.or] = [
    //     { name: { [Op.iLike]: `%${searchTerm}%` } },  
    //     { category: { [Op.iLike]: `%${searchTerm}%` } }
    //   ];
    // }

 //    const equipmentList = await Equipment.findAll({
 //      where: filters,
 //      include: User
    //});
exports.getAllEquipment = async (req, res) => {
  const { name, category, keyword, searchTerm, page } = req.query;
  const pageSize = 20
  try {
    const filters = {}

    if(name){
      filters.name = { [Op.iLike]: `%${name}%`};
    }

    if (category && !searchTerm) {
      filters.category = { [Op.iLike]: category };
    }

    if(keyword){
      filters.keyword = { [Op.iContains]: keyword}
    }
    if (searchTerm) {
      filters[Op.or] = [
        { name: { [Op.iLike]: `%${searchTerm}%` } },  
        { category: { [Op.iLike]: `%${category && category != 'all' ? category : searchTerm}%` } }
        // { keyword: { [Op.iContains]: `%${searchTerm}%` } }
      ];
    }
    // let currentPage = page || 1
    const { rows, count } = await Equipment.findAndCountAll({
      limit: pageSize,                    
      offset: ((page || 1) - 1) * pageSize,      
      order: [['createdAt', 'DESC']], 
      where: filters,
      include: User
    });
    res.json({
      data: rows,
      currentPage: page || 1,
      totalPages: Math.ceil(count / pageSize),
      totalRecords: count,
    });
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
    
    if(savedEquipment){
      let equipmentIds = savedEquipment.equipmentIds || []
      if (!equipmentIds.includes(id)) {
        equipmentIds.push(id);
        
        // Update the record and save to the database
        savedEquipment.equipmentIds = equipmentIds;
        await savedEquipment.save();
      } else {
        console.log("Equipment ID already added.");
      }
    }else {
        await SavedEquipment.create({
          userId: req.user.id,
          equipmentIds: [id]
        });
    }

    res.status(200).json({message: "equipment added"});
  } catch (err) {
    res.status(500).json({error: err.message });
  }
};

exports.filterEquipment = async (req, res) => {
  const { name, category, tags } = req.query; // Extract query parameters

  try {
    // Build a dynamic filter object
    const filter = {};

    if (name) {
      // Use case-insensitive regex for name filtering
      filter.name = { $regex: name, $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (tags) {
      // If tags are passed, search for any matches in the tags array
      const tagsArray = tags.split(","); // Allow comma-separated tags
      filter.tags = { $in: tagsArray };
    }

    // Query the database with the filter
    const equipment = await Equipment.find(filter);

    res.status(200).json(equipment);
  } catch (err) {
    console.error("Error in filterEquipment:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPaginatedEquipment = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default values: page 1, 10 items per page

  try {
    // Convert query parameters to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Validate the inputs
    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      return res.status(400).json({ message: "Invalid pagination parameters." });
    }

    // Calculate the number of items to skip
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination metadata
    const totalCount = await Equipment.countDocuments();

    // Fetch paginated data
    const equipment = await Equipment.find()
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }); // Sort by creation date (most recent first)

    // Response with pagination metadata and data
    res.status(200).json({
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalItems: totalCount,
      data: equipment,
    });
  } catch (err) {
    console.error("Error in getPaginatedEquipment:", err);
    res.status(500).json({ error: err.message });
  }
};
