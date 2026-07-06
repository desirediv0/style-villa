import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const sections = await prisma.productSection.findMany();
  console.log("Product Sections in DB:", JSON.stringify(sections, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
