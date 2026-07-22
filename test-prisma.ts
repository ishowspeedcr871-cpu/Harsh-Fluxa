import { prisma } from "./database/client";
async function main() {
  console.log("Listing roles and permissions...");
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    console.log("Roles:", JSON.stringify(roles, null, 2));

    const permissions = await prisma.permission.findMany();
    console.log("Permissions:", JSON.stringify(permissions, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}
main();
