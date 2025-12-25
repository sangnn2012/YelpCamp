import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { Scrypt } from 'oslo/password'
import {
  users,
  accounts,
  sessions,
  campgrounds,
  comments
} from './schema'

// ============================================================================
// Configuration
// ============================================================================

const connectionString = process.env.DATABASE_URL!

// ============================================================================
// Password Hashing (Better Auth compatible - uses oslo/password Scrypt)
// ============================================================================

const scrypt = new Scrypt()

async function hashPassword(password: string): Promise<string> {
  return await scrypt.hash(password)
}

// ============================================================================
// Test Users
// ============================================================================

interface TestUser {
  id: string
  username: string
  email: string
  password: string
  name: string
}

const TEST_USERS: TestUser[] = [
  {
    id: 'user-john-camper',
    username: 'john_camper',
    email: 'john@example.com',
    password: 'password123',
    name: 'John Camper'
  },
  {
    id: 'user-jane-hiker',
    username: 'jane_hiker',
    email: 'jane@example.com',
    password: 'password123',
    name: 'Jane Hiker'
  },
  {
    id: 'user-demo',
    username: 'demo',
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User'
  }
]

// ============================================================================
// Campground Data
// ============================================================================

const CAMPGROUNDS = [
  {
    name: "Cloud's Rest",
    price: '9.00',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    location: 'Yosemite National Park, California',
    description: `Experience the breathtaking beauty of Cloud's Rest, a premier camping destination nestled high in the mountains. This campground offers stunning panoramic views of the surrounding peaks and valleys. Wake up above the clouds and watch the sunrise paint the sky in brilliant oranges and pinks.

The site features well-maintained tent pads, fire rings, and access to pristine hiking trails. Wildlife is abundant - keep an eye out for deer, eagles, and the occasional mountain lion from a safe distance. The night skies here are phenomenal for stargazing, far from any light pollution.

Facilities include vault toilets and a seasonal water spigot. Pack in what you need and be prepared for cooler temperatures at this elevation. This is truly a place where you can disconnect and reconnect with nature.`
  },
  {
    name: 'Desert Mesa',
    price: '12.00',
    image: 'https://images.unsplash.com/photo-1533873984035-25970ab07461?w=800',
    location: 'Moab, Utah',
    description: `Desert Mesa offers a unique camping experience in the heart of red rock country. The dramatic landscape features towering sandstone formations, ancient petroglyphs, and some of the most spectacular sunsets you'll ever witness.

The campground is situated on a flat mesa with unobstructed 360-degree views. Spring and fall are the ideal seasons to visit when temperatures are mild. Summer visitors should prepare for intense heat during the day and surprisingly cool nights.

Each campsite is spacious with excellent privacy between neighbors. The dark sky preserve status makes this location perfect for astrophotography and meteor shower viewing. Don't miss the chance to explore the nearby slot canyons and natural arches.`
  },
  {
    name: 'Canyon Floor',
    price: '15.00',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    location: 'Grand Canyon, Arizona',
    description: `Nestled at the bottom of a magnificent canyon, Canyon Floor campground provides a unique perspective on geological time. Towering walls rise hundreds of feet on either side, displaying millions of years of Earth's history in colorful stratified layers.

A crystal-clear stream runs through the campground, providing a refreshing swimming hole and excellent fishing opportunities. The canyon walls create natural shade for most of the day, making this an excellent summer destination.

Hiking trails lead to ancient cliff dwellings, hidden waterfalls, and scenic overlooks. The acoustics of the canyon make for memorable evenings around the campfire, with sounds echoing off the ancient walls. This is a place that inspires wonder and reflection.`
  },
  {
    name: 'Whispering Pines',
    price: '18.00',
    image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800',
    location: 'Lake Tahoe, California',
    description: `Set within an ancient pine forest, Whispering Pines campground offers the quintessential woodland camping experience. The towering trees create a natural cathedral, with sunlight filtering through the canopy in golden shafts.

The forest floor is carpeted with soft pine needles, making for comfortable camping. The air is fresh and fragrant with the scent of pine. Wildlife is abundant, including deer, squirrels, and a variety of songbirds that create a natural symphony at dawn.

The campground features well-spaced sites connected by quiet forest trails. A small lake is within walking distance, perfect for kayaking, fishing, or simply enjoying the peaceful ambiance. Evening campfires are magical as the stars appear through gaps in the tree cover.`
  },
  {
    name: 'Coastal Bluffs',
    price: '22.00',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
    location: 'Big Sur, California',
    description: `Perched on dramatic coastal bluffs overlooking the Pacific Ocean, this campground offers front-row seats to some of nature's most spectacular shows. Watch migrating whales, playful sea otters, and colorful tide pools teeming with life.

Fall asleep to the rhythmic sound of waves crashing against the rocks below. Wake up to stunning sunrises over the water. The marine layer often rolls in during the evening, creating an ethereal misty atmosphere.

Trails wind along the clifftops and down to secluded beaches accessible only at low tide. The fishing here is excellent, and the nearby town offers fresh seafood restaurants and local artisan shops. This is coastal camping at its finest.`
  },
  {
    name: 'Mountain Meadow',
    price: '14.00',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
    location: 'Rocky Mountain National Park, Colorado',
    description: `Mountain Meadow campground sits in a pristine alpine meadow surrounded by towering peaks. Wildflowers blanket the landscape in summer, creating a colorful paradise for photographers and nature lovers alike.

The crisp mountain air and peaceful surroundings make this an ideal retreat from the hustle of daily life. Elk and mule deer are frequent visitors to the meadow, especially at dawn and dusk.

Nearby trails lead to alpine lakes, cascading waterfalls, and panoramic summit viewpoints. The campground offers both tent sites and RV hookups with modern restroom facilities.`
  },
  {
    name: 'Redwood Haven',
    price: '25.00',
    image: 'https://images.unsplash.com/photo-1542202229-7d93c33f5d07?w=800',
    location: 'Redwood National Park, California',
    description: `Camp among the giants at Redwood Haven, where ancient redwood trees tower hundreds of feet overhead. These magnificent trees, some over 2,000 years old, create an atmosphere of timeless wonder.

The forest floor is a lush carpet of ferns and sorrel, dappled with filtered sunlight. Morning fog drifts through the trees, adding to the mystical ambiance. Banana slugs, Roosevelt elk, and countless bird species call this forest home.

Well-maintained trails wind through the old-growth forest, connecting to the larger park trail system. The campground features rustic charm with modern amenities.`
  },
  {
    name: 'Lakeside Retreat',
    price: '20.00',
    image: 'https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800',
    location: 'Glacier National Park, Montana',
    description: `Lakeside Retreat offers premium waterfront camping on the shores of a pristine glacial lake. The crystal-clear waters reflect the surrounding peaks like a mirror, creating postcard-perfect views.

Kayaking, canoeing, and fishing are popular activities. The lake is stocked with trout, and the fishing is excellent. Swimming is refreshing but brisk - these are glacier-fed waters after all!

Bear-proof food storage is provided at each site. The Going-to-the-Sun Road is nearby, offering access to some of the most spectacular mountain scenery in North America.`
  },
  {
    name: 'Desert Oasis',
    price: '16.00',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
    location: 'Joshua Tree, California',
    description: `Desert Oasis is a hidden gem in the Mojave Desert, featuring the iconic Joshua trees that give the park its name. These otherworldly plants create a surreal landscape that feels like another planet.

The campground is situated near fascinating rock formations popular with climbers. Sunrise and sunset paint the desert in spectacular colors, and the night sky here is among the darkest in Southern California.

Spring brings a stunning wildflower bloom when conditions are right. The campground offers spacious sites with excellent privacy and stunning desert views.`
  },
  {
    name: 'Cascade Falls',
    price: '19.00',
    image: 'https://images.unsplash.com/photo-1455496231601-e6195da1f841?w=800',
    location: 'Olympic National Park, Washington',
    description: `Cascade Falls campground is named for the magnificent waterfall just a short hike from camp. The temperate rainforest setting is lush and green, with moss-covered trees and fern-lined trails.

The constant mist from the falls keeps everything fresh and green. Rainbow trout inhabit the streams, and the fishing is excellent. Roosevelt elk roam the valleys, and black bears occasionally pass through.

The campground offers both primitive and developed sites. Hot showers are available at the main facility. The nearby coast offers tide pooling and beach walking opportunities.`
  },
  {
    name: 'Alpine Vista',
    price: '17.00',
    image: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=800',
    location: 'North Cascades, Washington',
    description: `Alpine Vista sits at the edge of the tree line, offering commanding views of jagged peaks and pristine wilderness. This is backcountry camping at its finest, with minimal development and maximum natural beauty.

The campground serves as a basecamp for mountaineering expeditions and day hikes into the alpine zone. Mountain goats are frequently spotted on the nearby cliffs, and marmots whistle warnings from the rocky slopes.

Facilities are limited - pack in everything you need. The reward is solitude and scenery that few ever experience. Clear nights offer unparalleled stargazing opportunities.`
  },
  {
    name: 'Riverstone',
    price: '13.00',
    image: 'https://images.unsplash.com/photo-1414016642750-7fdd78dc33d9?w=800',
    location: 'Zion National Park, Utah',
    description: `Riverstone campground lies along the banks of the Virgin River, with stunning views of Zion's famous red rock cliffs. The river provides a refreshing respite from the desert heat and excellent opportunities for wading and swimming.

The iconic Angels Landing and The Narrows are accessible from camp. The shuttle system makes exploring the park easy and car-free. Sunset on the canyon walls is a daily spectacle not to be missed.

Cottonwood trees provide welcome shade during the hot summer months. The campground fills early during peak season, so reservations are strongly recommended.`
  },
  {
    name: 'Pinecone Ridge',
    price: '11.00',
    image: 'https://images.unsplash.com/photo-1496545672447-f699b503d270?w=800',
    location: 'Sequoia National Park, California',
    description: `Pinecone Ridge offers camping in the shadow of the world's largest trees. The giant sequoias here are truly humbling - some are over 3,000 years old and 300 feet tall.

The General Sherman Tree, the largest living thing on Earth by volume, is a short drive away. Hiking trails connect to groves of these magnificent giants throughout the park.

The campground sits at 6,500 feet elevation, providing relief from summer valley heat. Black bears are common - proper food storage is required. The mountain air is fresh and invigorating.`
  },
  {
    name: 'Sunrise Point',
    price: '21.00',
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800',
    location: 'Bryce Canyon, Utah',
    description: `Sunrise Point campground offers front-row seats to one of nature's most bizarre and beautiful landscapes. The hoodoos - tall, thin rock spires - glow orange and red in the early morning light.

The rim trail passes directly by the campground, offering easy access to multiple viewpoints. Below the rim, a maze of trails winds through the hoodoo formations, offering endless exploration opportunities.

At 8,000 feet, nights are cool even in summer. The dark skies here are exceptional - Bryce is an International Dark Sky Park. Astronomy programs are offered regularly by park rangers.`
  },
  {
    name: 'Hidden Valley',
    price: '15.00',
    image: 'https://images.unsplash.com/photo-1532339142463-fd0a8979791a?w=800',
    location: 'Death Valley, California',
    description: `Hidden Valley campground offers a unique desert camping experience in one of Earth's most extreme environments. Despite its harsh reputation, Death Valley teems with life adapted to survive here.

Spring wildflower blooms can be spectacular when winter rains cooperate. The salt flats, sand dunes, and colorful badlands offer incredible photography opportunities. Sunrise at Zabriskie Point is unforgettable.

Winter and spring are the ideal seasons to visit - summer temperatures can exceed 120°F. The star-filled night sky is remarkable, and the silence of the desert is profound.`
  },
  {
    name: 'Evergreen Grove',
    price: '18.00',
    image: 'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=800',
    location: 'Great Smoky Mountains, Tennessee',
    description: `Evergreen Grove nestles in a quiet hollow surrounded by the ancient Appalachian forest. These mountains are among the oldest on Earth, worn smooth by millions of years of weather.

The biodiversity here is astounding - more tree species exist in this park than in all of Europe. Synchronous fireflies create magical displays in early summer. Black bears, white-tailed deer, and wild turkeys are common.

The campground features well-appointed sites along a babbling brook. Historic cabins and churches dot the landscape, remnants of the communities that once called these hollows home.`
  }
]

// ============================================================================
// Sample Comments
// ============================================================================

const SAMPLE_COMMENTS = [
  'This place is amazing! The views are absolutely breathtaking.',
  'Great campground, but bring warm clothes - it gets cold at night!',
  'Perfect weekend getaway. Will definitely come back.',
  'The hiking trails nearby are fantastic. Saw lots of wildlife.',
  'Beautiful location but the facilities could use some updates.',
  'Best stargazing I have ever experienced. Bring a telescope!',
  'The kids loved it here. Very family-friendly campground.',
  'Peaceful and quiet. Exactly what I needed to recharge.',
  'A bit crowded during peak season but still worth the visit.',
  'The sunrise here is unforgettable. Wake up early!',
  'Clean facilities and friendly staff. Highly recommend.',
  'Nature at its finest. Disconnect from the world here.',
  'Watch out for bears! Store your food properly.',
  'The river nearby is perfect for a refreshing swim.',
  'Bring bug spray - the mosquitoes can be relentless!',
  'One of the best campgrounds I have visited. 10/10!'
]

// ============================================================================
// Seed Function
// ============================================================================

async function seed() {
  const client = postgres(connectionString)
  const db = drizzle(client)

  console.log('🌱 Starting database seed...\n')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await db.delete(comments)
  await db.delete(campgrounds)
  await db.delete(sessions)
  await db.delete(accounts)
  await db.delete(users)
  console.log('   ✓ Cleared all tables\n')

  // Create test users
  console.log('👤 Creating test users...')
  const createdUsers: { id: string; username: string }[] = []

  for (const user of TEST_USERS) {
    const hashedPassword = await hashPassword(user.password)

    await db.insert(users).values({
      id: user.id,
      username: user.username,
      displayUsername: user.username,
      email: user.email,
      name: user.name,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await db.insert(accounts).values({
      id: `account-${user.id}`,
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    createdUsers.push({ id: user.id, username: user.username })
    console.log(`   ✓ Created user: ${user.username} (${user.email})`)
  }
  console.log('')

  // Create campgrounds
  console.log('🏕️  Creating campgrounds...')
  const createdCampgrounds: { id: number; name: string }[] = []

  for (let i = 0; i < CAMPGROUNDS.length; i++) {
    const camp = CAMPGROUNDS[i]
    // Distribute campgrounds among users
    const authorId = createdUsers[i % createdUsers.length].id

    const [inserted] = await db.insert(campgrounds).values({
      name: camp.name,
      price: camp.price,
      image: camp.image,
      location: camp.location,
      description: camp.description,
      authorId,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning()

    createdCampgrounds.push({ id: inserted.id, name: inserted.name })
    console.log(`   ✓ Created: ${camp.name}`)
  }
  console.log('')

  // Create comments
  console.log('💬 Creating comments...')
  let commentCount = 0

  for (const camp of createdCampgrounds) {
    // Add 2-4 random comments per campground
    const numComments = 2 + Math.floor(Math.random() * 3)

    for (let i = 0; i < numComments; i++) {
      const randomComment = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)]
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)]

      await db.insert(comments).values({
        text: randomComment,
        campgroundId: camp.id,
        authorId: randomUser.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        updatedAt: new Date()
      })

      commentCount++
    }
  }
  console.log(`   ✓ Created ${commentCount} comments\n`)

  // Summary
  console.log('═══════════════════════════════════════════════════════')
  console.log('                    SEED COMPLETE')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Users:       ${createdUsers.length}`)
  console.log(`  Campgrounds: ${createdCampgrounds.length}`)
  console.log(`  Comments:    ${commentCount}`)
  console.log('═══════════════════════════════════════════════════════\n')

  console.log('📋 TEST CREDENTIALS:')
  console.log('───────────────────────────────────────────────────────')
  for (const user of TEST_USERS) {
    console.log(`  ${user.name}`)
    console.log(`    Email:    ${user.email}`)
    console.log(`    Password: ${user.password}`)
    console.log('')
  }
  console.log('═══════════════════════════════════════════════════════\n')

  await client.end()
  process.exit(0)
}

// Run seed
seed().catch((error) => {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
})
