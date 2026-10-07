const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.station.findMany({orderBy: {sortOrder: 'asc'}, take: 10}).then(s => { console.log(s); process.exit(0); });
