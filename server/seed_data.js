import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Client from './models/Client.js';
import Invoice from './models/Invoice.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Find all users in the system
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please register a user first.');
      process.exit(1);
    }

    for (const user of users) {
      const userId = user._id;
      console.log(`Seeding data for user: ${user.name} (${userId})`);

      // Clear existing sample data for this user to avoid duplicates if re-run
      await Product.deleteMany({ userId });
      await Client.deleteMany({ userId });
      await Invoice.deleteMany({ userId });
      console.log(`Cleared existing data for ${user.name}`);

    // 1. Create Sample Products
    const productsData = [
      { name: 'Whole Milk 1L', category: 'Dairy', price: 60 + Math.floor(Math.random() * 10), stock: 40 + Math.floor(Math.random() * 20), unit: 'L', barcode: '1001', expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { name: 'Brown Bread 400g', category: 'Bakery', price: 45 + Math.floor(Math.random() * 5), stock: 2 + Math.floor(Math.random() * 8), unit: 'pkt', barcode: '1002', expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { name: 'Organic Eggs 6pk', category: 'Dairy', price: 90 + Math.floor(Math.random() * 20), stock: 20 + Math.floor(Math.random() * 30), unit: 'box', barcode: '1003', expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) },
      { name: 'Greek Yogurt 200g', category: 'Dairy', price: 40 + Math.floor(Math.random() * 10), stock: 10 + Math.floor(Math.random() * 20), unit: 'cup', barcode: '1004', expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
      { name: 'Basmati Rice 5kg', category: 'Grains', price: 650 + Math.floor(Math.random() * 100), stock: 5 + Math.floor(Math.random() * 15), unit: 'bag', barcode: '1005' },
      { name: 'Amul Butter 500g', category: 'Dairy', price: 275 + Math.floor(Math.random() * 50), stock: 3 + Math.floor(Math.random() * 7), unit: 'pcs', barcode: '1006', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { name: 'Sunfeast Biscuits', category: 'Snacks', price: 30 + Math.floor(Math.random() * 5), stock: 1 + Math.floor(Math.random() * 10), unit: 'pkt', barcode: '1007' },
      { name: 'Fresh Apples 1kg', category: 'Produce', price: 180 + Math.floor(Math.random() * 40), stock: 10 + Math.floor(Math.random() * 40), unit: 'kg', barcode: '1008' },
    ];

    const createdProducts = await Product.insertMany(productsData.map(p => ({ ...p, userId })));
    console.log(`${createdProducts.length} Products seeded.`);

    // 2. Create Sample Clients
    const clientsData = [
      { name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '9876543210', address: '123, MG Road, Bangalore' },
      { name: 'Priya Sharma', email: 'priya@example.com', phone: '9876543211', address: '456, Park Street, Mumbai' },
      { name: 'Amit Singh', email: 'amit@example.com', phone: '9876543212', address: '789, HSR Layout, Bangalore' },
    ];

    const createdClients = await Client.insertMany(clientsData.map(c => ({ ...c, userId })));
    console.log(`${createdClients.length} Clients seeded.`);

    // 3. Create Sample Invoices over the last 7 days
    const statuses = ['Paid', 'Pending', 'Overdue'];
    for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i % 7)); // Spread over 7 days
        
        const client = createdClients[i % createdClients.length];
        const status = statuses[i % statuses.length];
        
        // Random items
        const numItems = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;
        
        for (let j = 0; j < numItems; j++) {
            const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            const total = product.price * quantity;
            items.push({
                productId: product._id,
                name: product.name,
                quantity,
                price: product.price,
                total
            });
            subtotal += total;
        }

        await Invoice.create({
            userId,
            clientId: client._id,
            invoiceNumber: `INV-2026-${userId.toString().slice(-4)}-${1000 + i}`,
            date: date,
            items: items,
            totalAmount: subtotal,
            status: status,
            createdAt: date // Set createdAt same as date for simplicity in trend
        });
    }

    }

    console.log('Seeding completed successfully for all users!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
