// routes/equipment.routes.js

const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipment.controller");
const { authenticate, checkRole } = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for image uploads

/**
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Equipment management
 */

/**
 * @swagger
 * /:
 *   post:
 *     summary: Create Equipment
 *     description: Create a new equipment entry. Requires admin or super role.
 *     security:
 *       - bearerAuth: []
 *     tags: [Equipment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Camera"
 *               description:
 *                 type: string
 *                 example: "A high-resolution camera."
 *               category:
 *                 type: string
 *                 example: "Photography"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["photography", "camera", "equipment"]
 *               useCases:
 *                 type: string
 *                 example: "Used for capturing high-quality images."
 *     responses:
 *       '201':
 *         description: Equipment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       '500':
 *         description: Internal server error.
 */
router.post(
  "/",
  authenticate,
  checkRole(["admin", "super"]),
  upload.array("images"),
  equipmentController.createEquipment
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get All Equipment
 *     description: Retrieve a list of all equipment. No authentication required.
 *     tags: [Equipment]
 *     responses:
 *       '200':
 *         description: A list of equipment.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Equipment'
 *       '500':
 *         description: Internal server error.
 */
router.get("/", equipmentController.getAllEquipment);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Get Equipment by ID
 *     description: Retrieve a single equipment entry by ID. No authentication required.
 *     tags: [Equipment]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the equipment to retrieve.
 *     responses:
 *       '200':
 *         description: Equipment retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       '404':
 *         description: Equipment not found.
 *       '500':
 *         description: Internal server error.
 */
router.get("/:id", equipmentController.getEquipmentById);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Update Equipment
 *     description: Update an existing equipment entry. Requires admin or super role.
 *     security:
 *       - bearerAuth: []
 *     tags: [Equipment]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the equipment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Camera"
 *               description:
 *                 type: string
 *                 example: "An updated high-resolution camera."
 *               category:
 *                 type: string
 *                 example: "Photography"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["photography", "camera", "updated"]
 *               useCases:
 *                 type: string
 *                 example: "Updated use cases for the equipment."
 *     responses:
 *       '200':
 *         description: Equipment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Equipment'
 *       '404':
 *         description: Equipment not found.
 *       '500':
 *         description: Internal server error.
 */
router.put(
  "/:id",
  authenticate,
  checkRole(["admin", "super"]),
  upload.array("images"),
  equipmentController.updateEquipment
);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Delete Equipment
 *     description: Delete an existing equipment entry. Requires admin or super role.
 *     security:
 *       - bearerAuth: []
 *     tags: [Equipment]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the equipment to delete.
 *     responses:
 *       '204':
 *         description: Equipment deleted successfully.
 *       '404':
 *         description: Equipment not found.
 *       '500':
 *         description: Internal server error.
 */
router.delete(
  "/:id",
  authenticate,
  checkRole(["admin", "super"]),
  equipmentController.deleteEquipment
);

module.exports = router;
