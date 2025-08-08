import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tables = [
    { name: "T1", capacity: 2, posX: 40, posY: 40 },
    { name: "T2", capacity: 4, posX: 140, posY: 40 },
    { name: "T3", capacity: 2, posX: 240, posY: 40 },
    { name: "T4", capacity: 6, posX: 340, posY: 40 },
  ];

  for (const t of tables) {
    await prisma.table.upsert({
      where: { name: t.name },
      update: {},
      create: t as any,
    });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});


