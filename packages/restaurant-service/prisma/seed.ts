import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const restaurants = [
  {
    name: "Mario's Trattoria",
    description: "Authentic Italian pasta and wood-fired pizza in a cozy atmosphere",
    street: "123 Pasta Lane",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    phone: "+1 555-0101",
    email: "mario@trattoria.com",
    cuisineTypes: ["Italian"],
    rating: 4.7,
    totalReviews: 342,
    deliveryFee: 2.99,
    minOrderAmount: 15,
    estimatedDeliveryTime: 35,
    menuItems: [
      { name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil", price: 14.99, category: "Pizza", preparationTime: 20 },
      { name: "Spaghetti Carbonara", description: "Eggs, pecorino romano, guanciale, black pepper", price: 16.99, category: "Pasta", preparationTime: 15 },
      { name: "Fettuccine Alfredo", description: "Creamy parmesan sauce with butter", price: 15.99, category: "Pasta", preparationTime: 15 },
      { name: "Bruschetta", description: "Grilled bread with tomato, garlic, and basil", price: 8.99, category: "Appetizers", preparationTime: 10 },
      { name: "Tiramisu", description: "Espresso-soaked ladyfingers with mascarpone", price: 9.99, category: "Desserts", preparationTime: 5 },
      { name: "Garlic Bread", description: "Toasted baguette with garlic butter and herbs", price: 5.99, category: "Appetizers", preparationTime: 8 },
    ],
  },
  {
    name: "Dragon Palace",
    description: "Traditional Sichuan and Cantonese dishes with bold flavors",
    street: "456 Wok Street",
    city: "Queens",
    state: "NY",
    zipCode: "11354",
    phone: "+1 555-0102",
    email: "dragon@palace.com",
    cuisineTypes: ["Chinese"],
    rating: 4.5,
    totalReviews: 518,
    deliveryFee: 1.99,
    minOrderAmount: 12,
    estimatedDeliveryTime: 30,
    menuItems: [
      { name: "Kung Pao Chicken", description: "Stir-fried chicken with peanuts, vegetables, and chili", price: 13.99, category: "Main Course", preparationTime: 18 },
      { name: "Sweet & Sour Pork", description: "Crispy pork with pineapple and bell peppers", price: 14.99, category: "Main Course", preparationTime: 20 },
      { name: "Vegetable Fried Rice", description: "Wok-fried rice with seasonal vegetables and soy sauce", price: 10.99, category: "Rice & Noodles", preparationTime: 12 },
      { name: "Spring Rolls (4 pcs)", description: "Crispy rolls with cabbage, carrots, and mushrooms", price: 6.99, category: "Appetizers", preparationTime: 10 },
      { name: "Hot & Sour Soup", description: "Tofu, mushrooms, and bamboo shoots in spicy broth", price: 5.99, category: "Soups", preparationTime: 10 },
      { name: "Dan Dan Noodles", description: "Spicy Sichuan noodles with minced pork and sesame", price: 12.99, category: "Rice & Noodles", preparationTime: 15 },
    ],
  },
  {
    name: "El Taqueria Loco",
    description: "Street-style tacos and Mexican classics made with fresh ingredients",
    street: "789 Taco Blvd",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    phone: "+1 555-0103",
    email: "hola@taquerialoco.com",
    cuisineTypes: ["Mexican"],
    rating: 4.6,
    totalReviews: 891,
    deliveryFee: 2.49,
    minOrderAmount: 10,
    estimatedDeliveryTime: 25,
    menuItems: [
      { name: "Carne Asada Tacos (3)", description: "Grilled steak tacos with onion, cilantro, and salsa", price: 11.99, category: "Tacos", preparationTime: 15 },
      { name: "Chicken Quesadilla", description: "Flour tortilla with melted cheese and grilled chicken", price: 10.99, category: "Quesadillas", preparationTime: 12 },
      { name: "Guacamole & Chips", description: "Fresh avocado dip with crispy tortilla chips", price: 7.99, category: "Appetizers", preparationTime: 8 },
      { name: "Burrito Bowl", description: "Rice, beans, protein, salsa, and guacamole", price: 13.99, category: "Bowls", preparationTime: 15 },
      { name: "Churros", description: "Fried dough sticks with cinnamon sugar and chocolate", price: 6.99, category: "Desserts", preparationTime: 10 },
      { name: "Horchata", description: "Cinnamon rice milk beverage", price: 3.99, category: "Drinks", preparationTime: 2 },
    ],
  },
  {
    name: "Curry House",
    description: "Authentic Indian curries, tandoori, and fresh naan bread",
    street: "321 Spice Road",
    city: "Jersey City",
    state: "NJ",
    zipCode: "07302",
    phone: "+1 555-0104",
    email: "namaste@curryhouse.com",
    cuisineTypes: ["Indian"],
    rating: 4.8,
    totalReviews: 267,
    deliveryFee: 3.49,
    minOrderAmount: 18,
    estimatedDeliveryTime: 40,
    menuItems: [
      { name: "Butter Chicken", description: "Tender chicken in creamy tomato sauce with fenugreek", price: 16.99, category: "Curries", preparationTime: 25 },
      { name: "Chicken Tikka Masala", description: "Grilled chicken in spiced tomato cream sauce", price: 16.99, category: "Curries", preparationTime: 25 },
      { name: "Garlic Naan", description: "Freshly baked naan bread with garlic and butter", price: 3.99, category: "Breads", preparationTime: 8 },
      { name: "Vegetable Biryani", description: "Fragrant basmati rice with mixed vegetables and saffron", price: 14.99, category: "Biryani", preparationTime: 30 },
      { name: "Samosas (2 pcs)", description: "Crispy pastries with spiced potato and peas", price: 5.99, category: "Appetizers", preparationTime: 12 },
      { name: "Mango Lassi", description: "Yogurt smoothie with fresh mango and cardamom", price: 4.99, category: "Drinks", preparationTime: 3 },
    ],
  },
  {
    name: "Sakura Sushi Bar",
    description: "Premium sushi and Japanese fusion in an elegant setting",
    street: "567 Sakura Ave",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    phone: "+1 555-0105",
    email: "hello@sakurasushi.com",
    cuisineTypes: ["Japanese"],
    rating: 4.9,
    totalReviews: 623,
    deliveryFee: 4.99,
    minOrderAmount: 25,
    estimatedDeliveryTime: 45,
    menuItems: [
      { name: "Salmon Nigiri (5 pcs)", description: "Fresh Norwegian salmon over seasoned rice", price: 14.99, category: "Sushi", preparationTime: 15 },
      { name: "Spicy Tuna Roll", description: "Tuna, spicy mayo, and cucumber in seaweed", price: 12.99, category: "Rolls", preparationTime: 12 },
      { name: "Dragon Roll", description: "Shrimp tempura and avocado topped with eel", price: 16.99, category: "Rolls", preparationTime: 18 },
      { name: "Miso Soup", description: "Traditional soybean paste soup with tofu and seaweed", price: 3.99, category: "Soups", preparationTime: 5 },
      { name: "Edamame", description: "Steamed soybeans with sea salt", price: 5.99, category: "Appetizers", preparationTime: 8 },
      { name: "Tempura Udon", description: "Thick wheat noodles in dashi with crispy shrimp tempura", price: 15.99, category: "Noodles", preparationTime: 20 },
    ],
  },
  {
    name: "Burger Joint",
    description: "Gourmet burgers, hand-cut fries, and thick milkshakes",
    street: "111 Patty Lane",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    phone: "+1 555-0106",
    email: "grill@burgerjoint.com",
    cuisineTypes: ["American"],
    rating: 4.4,
    totalReviews: 1045,
    deliveryFee: 1.99,
    minOrderAmount: 10,
    estimatedDeliveryTime: 20,
    menuItems: [
      { name: "Classic Cheeseburger", description: "Beef patty, cheddar, lettuce, tomato, onion, special sauce", price: 11.99, category: "Burgers", preparationTime: 15 },
      { name: "Bacon Double Burger", description: "Two beef patties, crispy bacon, american cheese", price: 15.99, category: "Burgers", preparationTime: 18 },
      { name: "Truffle Fries", description: "Hand-cut fries with truffle oil and parmesan", price: 7.99, category: "Sides", preparationTime: 12 },
      { name: "Onion Rings", description: "Beer-battered onion rings with chipotle mayo", price: 6.99, category: "Sides", preparationTime: 12 },
      { name: "Vanilla Milkshake", description: "Thick shake made with real ice cream", price: 5.99, category: "Drinks", preparationTime: 5 },
      { name: "Chicken Tenders", description: "Crispy chicken strips with honey mustard", price: 10.99, category: "Chicken", preparationTime: 15 },
    ],
  },
  {
    name: "Thai Orchid",
    description: "Authentic Thai street food with fresh herbs and spices",
    street: "888 Orchid St",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    phone: "+1 555-0107",
    email: "sawadee@thaiorchid.com",
    cuisineTypes: ["Thai"],
    rating: 4.6,
    totalReviews: 412,
    deliveryFee: 2.99,
    minOrderAmount: 15,
    estimatedDeliveryTime: 35,
    menuItems: [
      { name: "Pad Thai", description: "Stir-fried rice noodles with shrimp, tofu, egg, and peanuts", price: 13.99, category: "Noodles", preparationTime: 15 },
      { name: "Green Curry", description: "Coconut curry with chicken, thai eggplant, and basil", price: 14.99, category: "Curries", preparationTime: 20 },
      { name: "Tom Yum Soup", description: "Hot and sour soup with shrimp, lemongrass, and lime", price: 6.99, category: "Soups", preparationTime: 12 },
      { name: "Spring Rolls (4 pcs)", description: "Fresh rolls with shrimp, herbs, and peanut sauce", price: 7.99, category: "Appetizers", preparationTime: 10 },
      { name: "Mango Sticky Rice", description: "Sweet coconut sticky rice with fresh mango", price: 8.99, category: "Desserts", preparationTime: 5 },
      { name: "Thai Iced Tea", description: "Strong black tea with condensed milk over ice", price: 3.99, category: "Drinks", preparationTime: 3 },
    ],
  },
  {
    name: "Olive & Fig",
    description: "Mediterranean mezze, grilled meats, and fresh salads",
    street: "444 Mediterranean Way",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    phone: "+1 555-0108",
    email: "hello@oliveandfig.com",
    cuisineTypes: ["Mediterranean"],
    rating: 4.7,
    totalReviews: 356,
    deliveryFee: 3.99,
    minOrderAmount: 20,
    estimatedDeliveryTime: 40,
    menuItems: [
      { name: "Chicken Shawarma Wrap", description: "Marinated chicken, tahini, pickles, and veggies in pita", price: 12.99, category: "Wraps", preparationTime: 15 },
      { name: "Falafel Plate", description: "Crispy falafel with hummus, tabbouleh, and pita", price: 13.99, category: "Plates", preparationTime: 15 },
      { name: "Greek Salad", description: "Cucumber, tomato, olives, feta, and olive oil", price: 10.99, category: "Salads", preparationTime: 8 },
      { name: "Hummus & Pita", description: "Creamy chickpea dip with warm pita bread", price: 7.99, category: "Mezze", preparationTime: 5 },
      { name: "Lamb Kebab", description: "Grilled lamb skewers with rice and grilled vegetables", price: 18.99, category: "Grill", preparationTime: 25 },
      { name: "Baklava", description: "Layers of phyllo, pistachios, and honey syrup", price: 6.99, category: "Desserts", preparationTime: 3 },
    ],
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.optionChoice.deleteMany()
  await prisma.menuOption.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.openingHour.deleteMany()
  await prisma.order.deleteMany()
  await prisma.restaurant.deleteMany()

  console.log('Cleared existing data')

  for (const restaurantData of restaurants) {
    const { menuItems, ...restaurantInfo } = restaurantData

    const restaurant = await prisma.restaurant.create({
      data: {
        ...restaurantInfo,
        ownerId: 'owner-' + restaurantInfo.name.toLowerCase().replace(/\s+/g, '-'),
        openingHours: {
          create: [
            { dayOfWeek: 0, openTime: '11:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 3, openTime: '11:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 4, openTime: '11:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', isClosed: false },
            { dayOfWeek: 6, openTime: '11:00', closeTime: '23:00', isClosed: false },
          ],
        },
        menuItems: {
          create: menuItems,
        },
      },
    })

    console.log(`✅ Created: ${restaurant.name} (${menuItems.length} menu items)`)
  }

  const count = await prisma.restaurant.count()
  console.log(`\n🎉 Seeded ${count} restaurants successfully!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
