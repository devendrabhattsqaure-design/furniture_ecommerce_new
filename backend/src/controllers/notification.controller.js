const db  = require('../config/database');
const { createNotification } = require('../config/notification');

exports.getAllNotifications = async(req,res)=>{
     const { orgId } = req.params;

     const [lessProducts] = await db.query(`SELECT *  FROM products  WHERE org_id=${orgId} AND stock_quantity <= ? `,[10])
   for (const product of lessProducts) {
  await db.query(
    `INSERT INTO notifications (org_id, ref_id, type, title, message, created_at)
     SELECT ?, ?, ?, ?, ?, NOW()
     FROM DUAL
     WHERE NOT EXISTS (
       SELECT 1 FROM notifications 
       WHERE org_id = ? 
         AND ref_id = ?
         AND type = 'STOCK'
     )`,
    [
      orgId,
      product.product_id,
      'STOCK',
      'Low Stock Alert',
      `${product.product_name} stock is low (${product.stock_quantity})`,
      orgId,
      product.product_id
    ]
  );
}

  
  const [data] = await db.query(
  `SELECT * FROM notifications
   WHERE org_id = ? AND is_read=0
     AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 2 DAY)
   ORDER BY created_at DESC`,
  [orgId]
);

  res.status(200).json({
    success:true,
    data
  });
}


exports.deleteNotifications = async(req,res)=>{
    const {id} = req.params
     const [data] = await db.query(
    `SELECT * FROM notifications 
     WHERE id=? 
     `,
    [id]
  );
  if(data.length===0){
    return res.status(404).json({
      message:"No Notification found",
      success:false
    })
  }
  await db.query(`UPDATE  notifications SET is_read=? where id=${id}
   
    `,[1])
  // await db.query(`DELETE FROM notifications where id=${id}`)
  return res.status(200).json({
      message:"Notification deleted successfully",
      success:true
    })
}

exports.stockNotification = async(req,res)=>{

}