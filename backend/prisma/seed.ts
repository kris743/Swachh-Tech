import { PrismaClient } from '@prisma/client';
import { UserRole, ShiftType, ComplaintType, ComplaintStatus, WasteType, CollectionStatus, TruckStatus, RouteStatus, RewardLevel, NotificationType, MediaType } from '../src/common/prisma-enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Hash default password
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const commonPassword = await bcrypt.hash('Password@123', 12);

  // 2. Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@swachhtech.ai' },
    update: {},
    create: {
      email: 'admin@swachhtech.ai',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      isVerified: true,
      phone: '+919999999999',
    },
  });
  console.log('Admin created.');

  // 3. Wards
  const wards = ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Jayanagar', 'Malleswaram', 'Bellandur', 'Marathahalli', 'BTM Layout', 'JP Nagar'];

  // 4. Sample Citizen
  const citizenUser = await prisma.user.upsert({
    where: { email: 'citizen@swachhtech.ai' },
    update: {},
    create: {
      email: 'citizen@swachhtech.ai',
      passwordHash: await bcrypt.hash('Citizen@123', 12),
      firstName: 'Rahul',
      lastName: 'Sharma',
      role: UserRole.CITIZEN,
      isVerified: true,
      phone: '+919876543210',
      citizenProfile: {
        create: {
          address: '123 Main St, Block 4',
          ward: 'Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560034',
        }
      }
    },
    include: {
      citizenProfile: true,
    },
  });
  
  // Create Household and QR for Citizen
  let household = await prisma.household.findFirst({ where: { address: '123 Main St, Block 4' } });
  if (!household) {
    household = await prisma.household.create({
      data: {
        address: '123 Main St, Block 4',
        ward: 'Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
        memberCount: 4,
        latitude: 12.9352,
        longitude: 77.6245,
        citizens: {
          connect: { id: citizenUser.citizenProfile?.id }
        },
        qrCode: {
          create: {
            code: 'QR-KOR-1001'
          }
        }
      }
    });
  }
  console.log('Citizen & Household created.');

  // 5. Sample Worker
  const workerUser = await prisma.user.upsert({
    where: { email: 'worker@swachhtech.ai' },
    update: {},
    create: {
      email: 'worker@swachhtech.ai',
      passwordHash: await bcrypt.hash('Worker@123', 12),
      firstName: 'Ramesh',
      lastName: 'Kumar',
      role: UserRole.WORKER,
      isVerified: true,
      phone: '+919876543211',
      workerProfile: {
        create: {
          employeeId: 'EMP-W-001',
          assignedWard: 'Koramangala',
          shift: ShiftType.MORNING,
        }
      }
    },
  });
  console.log('Worker created.');

  // 6. Sample Driver & Truck
  let truck = await prisma.truck.findUnique({ where: { registrationNumber: 'KA-01-AB-1234' } });
  if (!truck) {
    truck = await prisma.truck.create({
      data: {
        registrationNumber: 'KA-01-AB-1234',
        capacity: 5000,
        status: TruckStatus.ACTIVE,
      }
    });
  }

  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@swachhtech.ai' },
    update: {},
    create: {
      email: 'driver@swachhtech.ai',
      passwordHash: await bcrypt.hash('Driver@123', 12),
      firstName: 'Suresh',
      lastName: 'Singh',
      role: UserRole.DRIVER,
      isVerified: true,
      phone: '+919876543212',
      driverProfile: {
        create: {
          licenseNumber: 'DL-KA-2024-001',
          assignedTruckId: truck.id,
        }
      }
    },
    include: {
      driverProfile: true,
    },
  });
  console.log('Driver & Truck created.');

  // 7. Route
  const routePoints = JSON.stringify([
    { lat: 12.9352, lng: 77.6245, name: 'Start - Koramangala Depot' },
    { lat: 12.9360, lng: 77.6250, name: 'Stop 1' },
    { lat: 12.9370, lng: 77.6260, name: 'Stop 2' },
  ]);

  let route = await prisma.route.findFirst({ where: { name: 'Koramangala Morning Route A' } });
  if (!route) {
    route = await prisma.route.create({
      data: {
        name: 'Koramangala Morning Route A',
        ward: 'Koramangala',
        waypoints: routePoints,
        estimatedDuration: 180,
        distance: 15.5,
      }
    });
  }
  
  // Assign Route
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let routeAssignment = await prisma.routeAssignment.findFirst({
    where: { routeId: route.id, date: today }
  });
  
  if (!routeAssignment && driverUser.driverProfile && truck) {
    routeAssignment = await prisma.routeAssignment.create({
      data: {
        routeId: route.id,
        driverId: driverUser.driverProfile.id,
        truckId: truck.id,
        date: today,
        status: RouteStatus.PENDING,
      }
    });
  }
  console.log('Route assigned.');

  // 8. Sample Complaint
  if (citizenUser.citizenProfile) {
    const complaint = await prisma.complaint.findFirst({ where: { citizenId: citizenUser.citizenProfile.id } });
    if (!complaint) {
      await prisma.complaint.create({
        data: {
          citizenId: citizenUser.citizenProfile.id,
          type: ComplaintType.GARBAGE_DUMP,
          description: 'Large garbage dump near the park entrance.',
          status: ComplaintStatus.PENDING,
          gpsLatitude: 12.9355,
          gpsLongitude: 77.6248,
          address: 'Koramangala 4th Block Park',
        }
      });
      console.log('Complaint created.');
    }
  }

  // 9. Analytics Snapshots
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const snapshot = await prisma.analyticsSnapshot.findFirst({ where: { date: yesterday, ward: 'Koramangala' } });
  
  if (!snapshot) {
    await prisma.analyticsSnapshot.create({
      data: {
        ward: 'Koramangala',
        date: yesterday,
        wasteCollected: 4500.5,
        complaintsReceived: 12,
        complaintsResolved: 10,
        recyclingRate: 65.4,
        activeCitizens: 1200,
        activeWorkers: 45,
        trucksUtilized: 8,
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
