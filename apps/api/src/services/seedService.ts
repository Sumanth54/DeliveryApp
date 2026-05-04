import { env } from "../config/env.js";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { slugify } from "../utils/slugify.js";

const seedProducts = [
  ["Nandini Toned Milk", "Dairy", 28, 32, "500 ml", "Farm-fresh milk for tea, coffee, and daily use.", "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", "Daily essential"],
  ["Curd Cup", "Dairy", 35, 40, "400 g", "Thick set curd from a local cold chain partner.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80", ""],
  ["Farm Eggs", "Dairy", 72, 80, "6 pcs", "Fresh eggs sourced from nearby poultry farms.", "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=80", "Protein pick"],
  ["Idli Dosa Batter", "Breakfast", 45, 52, "1 kg", "Ready-to-cook batter for soft idlis and crisp dosas.", "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=80", "Top seller"],
  ["Banana Yelakki", "Fruits", 54, 60, "500 g", "Sweet Karnataka bananas ideal for breakfast or snacks.", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=80", ""],
  ["Pomegranate", "Fruits", 128, 140, "1 kg", "Juicy pomegranates with ruby-red seeds.", "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=900&q=80", ""],
  ["Watermelon", "Fruits", 69, 79, "1 pc", "Summer watermelon chilled and ready for slicing.", "https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=900&q=80", ""],
  ["Tomato Hybrid", "Vegetables", 32, 40, "500 g", "Bright red tomatoes for curries, rasam, and salads.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80", ""],
  ["Onion", "Vegetables", 34, 42, "1 kg", "Kitchen staple onions with steady stock.", "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=900&q=80", ""],
  ["Potato", "Vegetables", 31, 38, "1 kg", "Cleaned potatoes perfect for fries, palya, and curries.", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=900&q=80", ""],
  ["Beans", "Vegetables", 42, 48, "250 g", "Fresh beans for quick stir fries and sambars.", "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?auto=format&fit=crop&w=900&q=80", ""],
  ["Coriander Leaves", "Vegetables", 12, 15, "1 bunch", "Fresh garnish for chutneys and curries.", "https://images.unsplash.com/photo-1622205313162-be1d5712a43d?auto=format&fit=crop&w=900&q=80", ""],
  ["Aashirvaad Atta", "Staples", 299, 320, "5 kg", "Whole wheat atta for rotis and chapatis.", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=80", ""],
  ["India Gate Rice", "Staples", 79, 88, "1 kg", "Everyday rice for lunch boxes and family meals.", "https://images.unsplash.com/photo-1586201375761-83865001e31d?auto=format&fit=crop&w=900&q=80", ""],
  ["Toor Dal", "Staples", 149, 162, "1 kg", "Classic dal for sambars and dal tadka.", "https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=900&q=80", "Karnataka staple"],
  ["Groundnut Oil", "Staples", 178, 189, "1 L", "Filtered cooking oil for daily use.", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80", ""],
  ["MTR Sambar Powder", "Staples", 48, 55, "200 g", "A pantry must-have for quick Karnataka-style sambar.", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80", ""],
  ["Good Day Biscuits", "Snacks", 30, 35, "200 g", "Tea-time biscuits for easy snacking.", "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=900&q=80", ""],
  ["Lays Magic Masala", "Snacks", 20, 20, "52 g", "Popular crunch with a masala kick.", "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=900&q=80", ""],
  ["Peanut Chikki", "Snacks", 25, 30, "100 g", "Jaggery peanut bar from a local sweets partner.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=80", ""],
  ["Bread Classic", "Bakery", 40, 45, "400 g", "Soft sandwich bread for breakfast and tiffin.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", ""],
  ["Paneer Fresh", "Dairy", 95, 105, "200 g", "Soft paneer cubes for curries and snacks.", "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=900&q=80", ""],
  ["Tender Coconut", "Fruits", 55, 60, "1 pc", "Hydrating tender coconut for hot afternoons.", "https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?auto=format&fit=crop&w=900&q=80", ""],
  ["Filter Coffee Powder", "Beverages", 149, 165, "500 g", "Strong South Indian filter coffee blend.", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80", "Local favorite"]
] as const;

export async function ensureSeedData(force = false) {
  if (force) {
    await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);
  }

  const existingProducts = await Product.countDocuments();

  if (existingProducts === 0) {
    await Product.insertMany(
      seedProducts.map(([name, category, price, mrp, unit, description, imageUrl, badge], index) => ({
        name,
        slug: slugify(name),
        category,
        price,
        mrp,
        unit,
        description,
        imageUrl,
        badge: badge || undefined,
        stockQty: 20 + index,
        inStock: true,
        featured: index < 6
      }))
    );
  }

  const admin = await User.findOne({ phone: env.adminPhone });

  if (!admin) {
    await User.create({
      name: "Kirana Admin",
      phone: env.adminPhone,
      role: "admin",
      lastOtpCode: "123456",
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }
}
