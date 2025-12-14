import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
    console.log('--- Starting Database Seeder ---');

    console.log('1. Cleaning up existing data...');

    await prisma.bookTag.deleteMany();
    await prisma.loan.deleteMany(); 

    await prisma.book.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Cleanup complete.');

    const adminPassword = await bcrypt.hash('admin123', saltRounds);
    const regularPassword = await bcrypt.hash('user123', saltRounds);
    console.log('Passwords hashed.');

    console.log('2. Creating Users...');
    
    const adminUser = await prisma.user.create({
        data: {
            name: 'Super Admin',
            email: 'admin@library.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });

    const regularUsers = [
        { name: 'John Doe', email: 'john.doe@test.com', password: regularPassword, role: 'USER' },
        { name: 'Jane Smith', email: 'jane.smith@test.com', password: regularPassword, role: 'USER' },
        { name: 'Tech Reviewer', email: 'tech.review@test.com', password: regularPassword, role: 'USER' },
        { name: 'Finance Staff', email: 'finance.staff@test.com', password: regularPassword, role: 'USER' },
        { name: 'Guest User', email: 'guest@test.com', password: regularPassword, role: 'USER' },
    ];

    await prisma.user.createMany({
        data: regularUsers,
    });
    console.log('5 Regular Users and 1 Admin created.');

    const userIds = (await prisma.user.findMany({ where: { role: 'USER' }, select: { id: true } })).map(u => u.id);
    const creatorId = adminUser.id; 

    console.log('3. Creating Tags...');
    const tagsData = await prisma.tag.createManyAndReturn({
        data: [
            { name: 'FICTION' },
            { name: 'SCIENCE' },
            { name: 'TECHNOLOGY' },
            { name: 'FINANCE' },
            { name: 'BIOGRAPHY' },
        ],
    });
    
    const [tagFiction, tagScience, tagTech, tagFinance, tagBio] = tagsData.map(t => t.id);
    console.log('5 Tags created.');


    console.log('4. Creating Members...');
    const membersData = [
        { name: 'Alice Johnson', email: 'alice@member.com', phone: '0811111111' },
        { name: 'Bob Williams', email: 'bob@member.com', phone: '0822222222' },
        { name: 'Charlie Brown', email: 'charlie@member.com', phone: '0833333333' },
        { name: 'Diana Prince', email: 'diana@member.com', phone: '0844444444' },
        { name: 'Ethan Hunt', email: 'ethan@member.com', phone: '0855555555' },
    ];
    await prisma.member.createMany({ data: membersData });
    const memberIds = (await prisma.member.findMany({ select: { id: true } })).map(m => m.id);
    const [member1, member2, member3] = memberIds;
    console.log('5 Members created.');


    console.log('5. Creating Books and BookTags...');
    
    const book1 = await prisma.book.create({
        data: {
            title: 'The Great Code', author: 'A. Hacker', publisher: 'TechPubs', year: 2023, stock: 5, isbn: '978-0131101633', createdById: creatorId,
            bookTags: { create: [{ tagId: tagTech }, { tagId: tagScience }] }
        }
    });

    const book2 = await prisma.book.create({
        data: {
            title: 'Dune: House of Atreides', author: 'B. Herbert', publisher: 'SciFi Press', year: 1999, stock: 0, isbn: '978-0441172719', createdById: creatorId,
            bookTags: { create: [{ tagId: tagFiction }] }
        }
    });

    const book3 = await prisma.book.create({
        data: {
            title: 'Atomic Habits', author: 'James Clear', publisher: 'Penguin', year: 2018, stock: 2, isbn: '978-0735211292', createdById: userIds[0],
            bookTags: { create: [{ tagId: tagBio }] }
        }
    });
    
    const book4 = await prisma.book.create({
        data: {
            title: 'The Wealthy Barber', author: 'David Chilton', publisher: 'Financial Group', year: 2000, stock: 1, isbn: '978-0968369324', createdById: userIds[1],
            bookTags: { create: [{ tagId: tagFinance }] }
        }
    });

    const book5 = await prisma.book.create({
        data: {
            title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Harari', publisher: 'Harper', year: 2011, stock: 3, isbn: '978-0062316097', createdById: creatorId,
            bookTags: { create: [{ tagId: tagScience }, { tagId: tagBio }] }
        }
    });
    console.log('5 Books created and tagged.');


    console.log('6. Creating Loans...');
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 7); 

    await prisma.loan.create({
        data: {
            bookId: book1.id, 
            memberId: member1, 
            borrowDate: today,
            dueDate: dueDate,
            isReturned: false,
        }
    });

    const lateBorrowDate = new Date();
    lateBorrowDate.setDate(today.getDate() - 17); 
    const lateDueDate = new Date(lateBorrowDate);
    lateDueDate.setDate(lateBorrowDate.getDate() + 7); 

    await prisma.loan.create({
        data: {
            bookId: book3.id, 
            memberId: member2, 
            borrowDate: lateBorrowDate,
            dueDate: lateDueDate,
            isReturned: false,
        }
    });

    const returnedBorrowDate = new Date();
    returnedBorrowDate.setDate(today.getDate() - 20); 
    const returnedDueDate = new Date(returnedBorrowDate);
    returnedDueDate.setDate(returnedBorrowDate.getDate() + 7); 
    const returnDate = new Date(returnedBorrowDate);
    returnDate.setDate(returnedBorrowDate.getDate() + 8); 

    await prisma.loan.create({
        data: {
            bookId: book5.id, 
            memberId: member3,
            borrowDate: returnedBorrowDate,
            dueDate: returnedDueDate,
            returnDate: returnDate,
            isReturned: true,
            fineAmount: 0,
        }
    });
    console.log('3 Loan records created (Active, Late, Returned).');

    console.log('--- Database Seeder Finished Successfully! ---');

}

main()
    .catch(e => {
        console.error('Seeder failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });