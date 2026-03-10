import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não definida.");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "hares@estetica.local";
  const hashedPassword = await bcrypt.hash("RaelM040124@", 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Hares",
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name: "Hares",
      email,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Usuário administrador Hares criado/atualizado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
