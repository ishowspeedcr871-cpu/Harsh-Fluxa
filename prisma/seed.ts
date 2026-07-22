import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const fluxaMain = await prisma.organization.upsert({
    where: { slug: "fluxa-main" },
    update: {},
    create: {
      name: "FLUXA Hub",
      slug: "fluxa-main",
      status: "ACTIVE",
      settings: {
        create: {
          displayName: "FLUXA Hub Main",
          supportEmail: "support@fluxa.com",
        },
      },
    },
  });

  console.log({ fluxaMain });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
