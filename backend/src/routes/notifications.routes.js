const express = require('express')
const router = express.Router()
 const db = require('../config/database');
const { getAllNotifications, deleteNotifications } = require('../controllers/notification.controller');

router.get("/:orgId", getAllNotifications);

// router.put("/read/:id", async (req, res) => {
//   await db.query(
//     `UPDATE notifications SET is_read=1 WHERE id=?`,
//     [req.params.id]
//   );
//   res.json({ success: true });
// });

router.put('/delete/:id',deleteNotifications)

module.exports = router