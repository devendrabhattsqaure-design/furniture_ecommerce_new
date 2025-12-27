 const db = require('./database');
 exports.createNotification = async (
  
  { org_id,  title, message,due_date, type, ref_id }
) => {
  await db.query(
    `INSERT INTO notifications 
     (org_id,  title, message,due_date, type, ref_id) 
     VALUES (?,?,?,?,?,?)`,
    [org_id,  title, message,due_date, type, ref_id]
  );
};