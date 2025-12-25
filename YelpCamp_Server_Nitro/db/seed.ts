import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { campgrounds, comments, users, accounts } from './schema'

const connectionString = process.env.DATABASE_URL!

async function seed() {
  const client = postgres(connectionString)
  const db = drizzle(client)

  console.log('Seeding database...')

  // Clear existing data
  await db.delete(comments)
  await db.delete(campgrounds)
  await db.delete(accounts)
  await db.delete(users)

  console.log('Cleared existing data')

  // Create a demo user
  const demoUserId = 'demo-user-' + Date.now()
  await db.insert(users).values({
    id: demoUserId,
    username: 'demo',
    email: 'demo@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  })

  console.log('Created demo user')

  // Seed campgrounds
  const seedCampgrounds = [
    {
      name: 'Cloud\'s Rest',
      price: '9.00',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      location: 'Yosemite National Park, California',
      description: `Experience the breathtaking beauty of Cloud's Rest, a premier camping destination nestled high in the mountains. This campground offers stunning panoramic views of the surrounding peaks and valleys.`,
      authorId: demoUserId
    },
    {
      name: 'Desert Mesa',
      price: '12.00',
      image: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=800',
      location: 'Moab, Utah',
      description: `Desert Mesa offers a unique camping experience in the heart of red rock country. The dramatic landscape features towering sandstone formations and spectacular sunsets.`,
      authorId: demoUserId
    },
    {
      name: 'Canyon Floor',
      price: '15.00',
      image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      location: 'Grand Canyon, Arizona',
      description: `Nestled at the bottom of a magnificent canyon, Canyon Floor campground provides a unique perspective on geological time with towering walls displaying millions of years of Earth's history.`,
      authorId: demoUserId
    },
    {
      name: 'Whispering Pines',
      price: '18.00',
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
      location: 'Lake Tahoe, California',
      description: `Set within an ancient pine forest, Whispering Pines campground offers the quintessential woodland camping experience with towering trees and abundant wildlife.`,
      authorId: null
    },
    {
      name: 'Coastal Bluffs',
      price: '22.00',
      image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
      location: 'Big Sur, California',
      description: `Perched on dramatic coastal bluffs overlooking the Pacific Ocean, this campground offers front-row seats to migrating whales, sea otters, and stunning sunrises.`,
      authorId: demoUserId
    }
  ]

  const insertedCampgrounds = await db.insert(campgrounds).values(seedCampgrounds).returning()
  console.log(`Inserted ${insertedCampgrounds.length} campgrounds`)

  // Seed comments
  const seedComments = [
    {
      text: 'This place is great, but I wish there was internet!',
      campgroundId: insertedCampgrounds[0].id,
      authorId: demoUserId
    },
    {
      text: 'Absolutely stunning views! We saw a shooting star on our first night.',
      campgroundId: insertedCampgrounds[0].id,
      authorId: demoUserId
    },
    {
      text: 'Perfect for a weekend getaway. The desert sunsets are unforgettable.',
      campgroundId: insertedCampgrounds[1].id,
      authorId: demoUserId
    }
  ]

  const insertedComments = await db.insert(comments).values(seedComments).returning()
  console.log(`Inserted ${insertedComments.length} comments`)

  console.log('Seeding complete!')
  await client.end()
  process.exit(0)
}

seed().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
