const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const lines = await prisma.line.findMany();
  const stations = await prisma.station.findMany();
  
  let sql = `-- ۱. اضافه کردن ستون جدید به جدول ایستگاه‌ها (در صورتی که اضافه نشده باشد)\n`;
  sql += `ALTER TABLE "stations" ADD COLUMN IF NOT EXISTS "lineOrders" TEXT NOT NULL DEFAULT '{}';\n\n`;
  
  sql += `-- ۲. آپدیت کردن خطوط\n`;
  for (const l of lines) {
    const id = l.id.replace(/'/g, "''");
    const name = l.name.replace(/'/g, "''");
    const mode = l.mode.replace(/'/g, "''");
    const color = l.color ? `'${l.color.replace(/'/g, "''")}'` : 'NULL';
    
    sql += `INSERT INTO "lines" ("id", "name", "mode", "color") VALUES ('${id}', '${name}', '${mode}', ${color}) `
    sql += `ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "mode" = EXCLUDED."mode", "color" = EXCLUDED."color";\n`
  }
  
  sql += `\n-- ۳. آپدیت کردن ایستگاه‌ها\n`;
  for (const s of stations) {
    const id = s.id.replace(/'/g, "''");
    const name = s.name.replace(/'/g, "''");
    const linesStr = s.lines.replace(/'/g, "''");
    const lat = s.lat === null ? 'NULL' : s.lat;
    const lng = s.lng === null ? 'NULL' : s.lng;
    const isInt = s.isInterchange ? 'true' : 'false';
    const sortOrder = s.sortOrder;
    const lineOrders = s.lineOrders.replace(/'/g, "''");
    
    sql += `INSERT INTO "stations" ("id", "name", "lines", "lat", "lng", "isInterchange", "sortOrder", "lineOrders") `
    sql += `VALUES ('${id}', '${name}', '${linesStr}', ${lat}, ${lng}, ${isInt}, ${sortOrder}, '${lineOrders}') `
    sql += `ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "lines" = EXCLUDED."lines", "lat" = EXCLUDED."lat", "lng" = EXCLUDED."lng", "isInterchange" = EXCLUDED."isInterchange", "sortOrder" = EXCLUDED."sortOrder", "lineOrders" = EXCLUDED."lineOrders";\n`
  }
  
  fs.writeFileSync('update_db.sql', sql);
  console.log('Generated update_db.sql');
}
main().catch(console.error).finally(() => prisma.$disconnect());
