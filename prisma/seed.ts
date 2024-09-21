import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Seed Departments
  const itDept = await prisma.department.create({
    data: { name: "IT", status: true },
  });
  const hrDept = await prisma.department.create({
    data: { name: "HR", status: true },
  });
  const customerServiceDept = await prisma.department.create({
    data: { name: "Customer Service", status: true },
  });
  const trainingDept = await prisma.department.create({
    data: { name: "Training", status: true },
  });
  const cyberSecurityDept = await prisma.department.create({
    data: { name: "Cyber Security", status: true },
  });

  // Seed Employees and link to departments
  await prisma.employee.create({
    data: {
      email: "hradmin@test.com",
      password: "TestPass1234",
      firstName: "SUPER",
      lastName: "USER",
      telephone: "000 000 0000",
      role: 0,
      status: true,
    },
  });

  const bob = await prisma.employee.create({
    data: {
      email: "bob@gmail.com",
      password: "Password123#",
      firstName: "Bob",
      lastName: "Ross",
      telephone: "123 455 7891",
      role: 1,
      status: true,
      departments: {
        connect: [
          { id: itDept.id },
          { id: cyberSecurityDept.id },
          { id: trainingDept.id },
        ],
      },
    },
  });

  const steveJobs = await prisma.employee.create({
    data: {
      email: "steveJobs@apple.com",
      password: "Password123#",
      firstName: "Steve",
      lastName: "Jobs",
      telephone: "678 567 7394",
      role: 1,
      status: true,
      departments: {
        connect: [{ id: hrDept.id }, { id: customerServiceDept.id }],
      },
    },
  });

  const danny = await prisma.employee.create({
    data: {
      email: "danny@gmail.com",
      password: "Password123#",
      firstName: "Danny",
      lastName: "Danniel",
      telephone: "123 455 9341",
      role: 2,
      status: true,
      managerId: bob.id,
      departments: {
        connect: [{ id: itDept.id }],
      },
    },
  });

  const bruceBanner = await prisma.employee.create({
    data: {
      email: "banner@yahoo.com",
      password: "Password123#",
      firstName: "Bruce",
      lastName: "Banner",
      telephone: "739 834 8392",
      role: 2,
      status: true,
      managerId: bob.id,
      departments: {
        connect: [{ id: itDept.id }, { id: cyberSecurityDept.id }],
      },
    },
  });

  const steveRodgers = await prisma.employee.create({
    data: {
      email: "rodgers@gamil.com",
      password: "Password123#",
      firstName: "Steve",
      lastName: "Rodgers",
      telephone: "123 894 7891",
      role: 2,
      status: true,
      managerId: steveJobs.id,
      departments: {
        connect: [{ id: hrDept.id }, { id: customerServiceDept.id }],
      },
    },
  });

  const damian = await prisma.employee.create({
    data: {
      email: "damian@yahoo.com",
      password: "Password123#",
      firstName: "Damian",
      lastName: "Wayne",
      telephone: "278 273 2784",
      role: 2,
      status: true,
      managerId: bob.id,
      departments: {
        connect: [{ id: trainingDept.id }],
      },
    },
  });

  const barryAllen = await prisma.employee.create({
    data: {
      email: "Barry@gmail.com",
      password: "Password123#",
      firstName: "Barry",
      lastName: "Allen",
      telephone: "903 455 7891",
      role: 2,
      status: true,
      managerId: steveJobs.id,
      departments: {
        connect: [{ id: customerServiceDept.id }],
      },
    },
  });

  await prisma.employee.create({
    data: {
      email: "tony@gmail.com",
      password: "Password123#",
      firstName: "Tony",
      lastName: "Stark",
      telephone: "273 743 9038",
      role: 2,
      status: true,
      managerId: steveJobs.id,
      departments: {
        connect: [{ id: hrDept.id }],
      },
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
