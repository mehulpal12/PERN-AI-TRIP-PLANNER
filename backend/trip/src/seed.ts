import prisma from "./config/db.js";


async function main() {
  console.log("Emptying existing trips...");
  await prisma.trip.deleteMany();

  console.log("Seeding dummy trips...");

  const dummyTrips = [
    {
      title: "Solo Trek to Kedarkantha",
      description: "A beautiful winter trek starting from Sankri.",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-01-20"),
      budget: 15000.0,
      createdBy: "user_12345",
    },
    {
      title: "Family Trip to Goa",
      description: "Relaxing on the beaches of South Goa.",
      startDate: new Date("2026-11-10"),
      endDate: new Date("2026-11-17"),
      budget: 45000.5,
      createdBy: "user_67890",
    },
  ];

  for (const trip of dummyTrips) {
    const created = await prisma.trip.create({
      data: trip,
    });
    console.log(`Created trip: ${created.title} (ID: ${created.id})`);
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });