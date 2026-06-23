import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Meal from '../models/Meal.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrilens';

const FIRST_NAMES = ['John', 'Jane', 'Michael', 'Emily', 'Chris', 'Jessica', 'David', 'Sarah', 'James', 'Ashley', 'Robert', 'Megan', 'Daniel', 'Amanda', 'Matthew', 'Elizabeth', 'Andrew', 'Sophia', 'Joshua', 'Olivia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const GENDERS = ['male', 'female', 'other'];
const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

const MEAL_POOL = {
  breakfast: [
    { foodItems: ['Oatmeal', 'Banana', 'Almond Milk'], calories: 350, protein: 10, carbs: 60, fats: 8, fiber: 9 },
    { foodItems: ['Scrambled Eggs', 'Whole Wheat Toast', 'Avocado'], calories: 420, protein: 22, carbs: 28, fats: 24, fiber: 7 },
    { foodItems: ['Greek Yogurt', 'Mixed Berries', 'Honey', 'Granola'], calories: 310, protein: 18, carbs: 45, fats: 6, fiber: 5 },
    { foodItems: ['Protein Pancakes', 'Maple Syrup', 'Blueberries'], calories: 450, protein: 25, carbs: 65, fats: 10, fiber: 6 }
  ],
  lunch: [
    { foodItems: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli'], calories: 520, protein: 42, carbs: 55, fats: 10, fiber: 8 },
    { foodItems: ['Turkey Avocado Wrap', 'Mixed Greens Salad'], calories: 480, protein: 32, carbs: 38, fats: 18, fiber: 6 },
    { foodItems: ['Quinoa Salad bowl', 'Garbanzo Beans', 'Cucumber', 'Feta Cheese'], calories: 450, protein: 15, carbs: 65, fats: 12, fiber: 10 },
    { foodItems: ['Tuna Melt Sandwich', 'Baked Carrot Chips'], calories: 470, protein: 30, carbs: 44, fats: 15, fiber: 5 }
  ],
  dinner: [
    { foodItems: ['Baked Salmon Fillet', 'Sweet Potato', 'Grilled Asparagus'], calories: 580, protein: 38, carbs: 48, fats: 22, fiber: 7 },
    { foodItems: ['Sirloin Steak', 'Roasted Red Potatoes', 'Green Beans'], calories: 650, protein: 45, carbs: 40, fats: 28, fiber: 6 },
    { foodItems: ['Lentil Pasta', 'Tomato Marinara Sauce', 'Lean Turkey Meatballs'], calories: 540, protein: 35, carbs: 70, fats: 12, fiber: 11 },
    { foodItems: ['Tofu Teriyaki Stir Fry', 'Jasmine Rice', 'Bell Peppers', 'Broccoli'], calories: 490, protein: 20, carbs: 75, fats: 10, fiber: 8 }
  ],
  snack: [
    { foodItems: ['Apple slices', 'Creamy Peanut Butter'], calories: 250, protein: 7, carbs: 30, fats: 16, fiber: 6 },
    { foodItems: ['Mixed Almonds & Cashews', 'Dark Chocolate Squares'], calories: 280, protein: 6, carbs: 18, fats: 22, fiber: 4 },
    { foodItems: ['Hummus dip', 'Baby Carrots', 'Pita Crackers'], calories: 220, protein: 5, carbs: 28, fats: 8, fiber: 3 },
    { foodItems: ['Low Fat Cottage Cheese', 'Pineapple chunks'], calories: 190, protein: 14, carbs: 20, fats: 4, fiber: 2 }
  ]
};

const IMAGE_POOL = {
  breakfast: [
    'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop'
  ],
  lunch: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop'
  ],
  dinner: [
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop'
  ],
  snack: [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop'
  ]
};

const seedDatabase = async () => {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('🟢 Connected. Clearing database...');

    await User.deleteMany({});
    await Meal.deleteMany({});
    console.log('🧹 Database cleared.');

    console.log('👥 Generating test account...');
    const testUser = await User.create({
      name: 'Test Account',
      email: 'test@nutrilens.com',
      password: 'Password123!',
      profile: {
        age: 28,
        gender: 'male',
        height: 178,
        weight: 75,
        activityLevel: 'moderate'
      },
      goals: {
        calories: 2200,
        protein: 150,
        carbohydrate: 240,
        fat: 70,
        fiber: 30
      }
    });

    console.log('🍛 Generating 120 meals for the last 30 days (4 meals per day)...');
    const meals = [];
    const now = new Date();
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const currentDate = new Date();
      currentDate.setDate(now.getDate() - dayOffset);

      // Create each of the 4 meal types for the day
      mealTypes.forEach((mealType, typeIndex) => {
        const mealDate = new Date(currentDate.getTime());

        // Set realistic meal times
        let hour = 12;
        let minute = Math.floor(Math.random() * 15); // e.g. 0 to 14 minutes offset
        
        if (mealType === 'breakfast') hour = 8;
        if (mealType === 'lunch') hour = 13;
        if (mealType === 'snack') hour = 16;
        if (mealType === 'dinner') hour = 19;
        
        mealDate.setHours(hour, minute, 0, 0);

        // Pick a template from the pool sequentially to ensure nutrient variation
        const templateList = MEAL_POOL[mealType];
        const templateIndex = dayOffset % templateList.length;
        const template = templateList[templateIndex];

        // Pick an image sequentially
        const imageList = IMAGE_POOL[mealType];
        const imageIndex = dayOffset % imageList.length;
        const imageUrl = imageList[imageIndex];

        meals.push({
          user: testUser._id,
          mealType,
          date: mealDate,
          image: {
            url: imageUrl,
            publicId: `nutrilens/seed/sample_${dayOffset}_${mealType}`
          },
          nutrition: {
            foodItems: template.foodItems,
            calories: template.calories,
            protein: template.protein,
            carbs: template.carbs,
            fats: template.fats,
            fiber: template.fiber,
            analysisStatus: 'success'
          },
          notes: `Healthy ${mealType} generated for testing.`
        });
      });
    }

    const insertedMeals = await Meal.insertMany(meals);
    console.log(`✅ Seeded ${insertedMeals.length} meals for user "${testUser.email}".`);
    
    console.log('🚀 Seeding complete! Database is ready.');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

seedDatabase();
