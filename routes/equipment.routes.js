// routes/equipment.routes.js

const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipment.controller");
const { authenticate, checkRole } = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image uploads

// Create equipment (admin and super roles only)
router.post(
  "/",
  authenticate,
  checkRole(["admin", "super"]),
  upload.array("images"), // Assuming images are sent as an array
  equipmentController.createEquipment
);

// Get all equipment (no authentication required)
router.get("/", equipmentController.getAllEquipment);

// Get single equipment by ID (no authentication required)
router.get("/:id", equipmentController.getEquipmentById);

// Update equipment (admin and super roles only)
router.put(
  "/:id",
  authenticate,
  checkRole(["admin", "super"]),
  upload.array("images"),
  equipmentController.updateEquipment
);

// Delete equipment (admin and super roles only)
router.delete(
  "/:id",
  authenticate,
  checkRole(["admin", "super"]),
  equipmentController.deleteEquipment
);

module.exports = router;
