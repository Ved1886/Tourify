const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

async function clearCollection(name) {
    const snap = await db.collection(name).get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    if (!snap.empty) await batch.commit();
}

async function seedCollection(name, items) {
    const batch = db.batch();
    items.forEach(item => {
        const ref = db.collection(name).doc();
        batch.set(ref, { ...item, createdAt: new Date().toISOString() });
    });
    await batch.commit();
}

router.post('/', async (req, res) => {
    try {
        await Promise.all([
            clearCollection('destinations'),
            clearCollection('sanctuaries'),
            clearCollection('alerts'),
            clearCollection('testimonials'),
            clearCollection('wildlife')
        ]);

        await seedCollection('destinations', [
            { name: 'Amazon Rainforest', country: 'Brazil', tag: 'Biodiversity Hotspot', rating: 4.9, price: '$1,299', gradient: 'linear-gradient(135deg, #0a5c36, #0de381)' },
            { name: 'Mount Fuji', country: 'Japan', tag: 'Sacred Peak', rating: 4.8, price: '$899', gradient: 'linear-gradient(135deg, #1a1a4e, #6366f1)' },
            { name: 'Banff National Park', country: 'Canada', tag: 'Alpine Wonder', rating: 4.9, price: '$1,099', gradient: 'linear-gradient(135deg, #0c4a6e, #22d3ee)' },
            { name: 'Serengeti Plains', country: 'Tanzania', tag: 'Wildlife Safari', rating: 5.0, price: '$2,499', gradient: 'linear-gradient(135deg, #78350f, #f59e0b)' },
            { name: 'Norwegian Fjords', country: 'Norway', tag: 'Arctic Escape', rating: 4.7, price: '$1,599', gradient: 'linear-gradient(135deg, #164e63, #67e8f9)' },
            { name: 'Galápagos Islands', country: 'Ecuador', tag: 'Eco Paradise', rating: 4.9, price: '$3,199', gradient: 'linear-gradient(135deg, #065f46, #34d399)' },
            { name: 'Swiss Alps', country: 'Switzerland', tag: 'Mountain Bliss', rating: 4.8, price: '$1,899', gradient: 'linear-gradient(135deg, #1e3a5f, #38bdf8)' },
            { name: 'Great Barrier Reef', country: 'Australia', tag: 'Underwater World', rating: 4.9, price: '$2,199', gradient: 'linear-gradient(135deg, #0e4e73, #06b6d4)' },
            { name: 'Patagonia', country: 'Argentina', tag: 'Wild Frontier', rating: 4.8, price: '$1,799', gradient: 'linear-gradient(135deg, #3b0764, #a855f7)' }
        ]);

        await seedCollection('sanctuaries', [
            { name: 'Hidden Cenote of Yucatán', location: 'Mexico', type: 'Underground Pool', visitors: '~50/year', difficulty: 'Moderate', description: 'A secret cenote beneath the jungle canopy, accessible only through a narrow limestone passage.', gradient: 'linear-gradient(135deg, #065f46, #34d399)' },
            { name: 'Skeleton Coast Shipwrecks', location: 'Namibia', type: 'Desert Coast', visitors: '~200/year', difficulty: 'Advanced', description: 'Where the desert meets the Atlantic. Rusted shipwrecks dot the foggy coastline.', gradient: 'linear-gradient(135deg, #78350f, #fbbf24)' },
            { name: 'Hang Sơn Đoòng Cave', location: 'Vietnam', type: 'Cave System', visitors: '~1000/year', difficulty: 'Expert', description: 'The world\'s largest cave, with its own weather system and underground forests.', gradient: 'linear-gradient(135deg, #1e3a5f, #38bdf8)' },
            { name: 'Socotra Dragon Trees', location: 'Yemen', type: 'Island', visitors: '~300/year', difficulty: 'Moderate', description: 'An alien landscape of dragon blood trees found nowhere else on Earth.', gradient: 'linear-gradient(135deg, #581c87, #c084fc)' },
            { name: 'Bioluminescent Bay', location: 'Puerto Rico', type: 'Coastal', visitors: '~5000/year', difficulty: 'Easy', description: 'Waters that glow electric blue at night from microscopic organisms.', gradient: 'linear-gradient(135deg, #0c4a6e, #22d3ee)' },
            { name: 'Dallol Hot Springs', location: 'Ethiopia', type: 'Geothermal', visitors: '~100/year', difficulty: 'Expert', description: 'The hottest inhabited place on Earth. Neon-colored acid pools create an otherworldly landscape.', gradient: 'linear-gradient(135deg, #92400e, #f97316)' }
        ]);

        await seedCollection('alerts', [
            { title: 'Protected Nesting Zone', location: 'Amazon Basin, Sector 7', description: 'Sea turtle nesting season active. Restricted access from 6PM–6AM.', level: 'high' },
            { title: 'Reforestation Area', location: 'Borneo Rainforest, Zone C', description: 'Active reforestation in progress. Alternate trails recommended.', level: 'medium' },
            { title: 'Water Quality Advisory', location: 'Lake Baikal, North Shore', description: 'Water quality excellent. Safe for swimming.', level: 'low' },
            { title: 'Weather Warning', location: 'Patagonia Trail 12', description: 'High winds expected this weekend (60-80 km/h).', level: 'medium' },
            { title: 'Endangered Habitat', location: 'Madagascar, Andasibe Reserve', description: 'Indri lemur breeding season. Noise restrictions in effect.', level: 'high' },
            { title: 'Trail Maintenance', location: 'Swiss Alps, Eiger North', description: 'Scheduled maintenance on bridge crossing. Temporary detour adds 1.2km.', level: 'low' }
        ]);

        await seedCollection('testimonials', [
            { name: 'Sarah Chen', role: 'Adventure Photographer', text: 'Tourify found me a hidden waterfall in Costa Rica that no guidebook mentions.', rating: 5, trips: 47 },
            { name: 'Marcus Rivera', role: 'Wildlife Researcher', text: 'The Nature Guard feature alerted me to an endangered species sighting.', rating: 5, trips: 32 },
            { name: 'Aiko Tanaka', role: 'Solo Traveler', text: 'I\'ve traveled to 30+ countries and Tourify truly understands sustainable travel.', rating: 5, trips: 63 },
            { name: 'João Silva', role: 'Marine Biologist', text: 'Used Tourify to plan a coral reef expedition. The wildlife tracker was amazing.', rating: 5, trips: 28 },
            { name: 'Elena Volkov', role: 'Mountain Guide', text: 'I recommend Tourify to all my clients. AI routes avoid fragile ecosystems.', rating: 5, trips: 89 },
            { name: 'David Park', role: 'Nature Filmmaker', text: 'The Sanctuary Finder led me to a bioluminescent bay. Best footage ever!', rating: 5, trips: 51 }
        ]);

        await seedCollection('wildlife', [
            { species: 'Bengal Tiger', location: 'Sundarbans, India', status: 'Endangered', sightings: 12, lastSeen: new Date(Date.now() - 2 * 3600000).toISOString() },
            { species: 'Blue Whale', location: 'Sri Lanka Coast', status: 'Endangered', sightings: 3, lastSeen: new Date(Date.now() - 5 * 3600000).toISOString() },
            { species: 'Snow Leopard', location: 'Himalayas, Nepal', status: 'Vulnerable', sightings: 7, lastSeen: new Date(Date.now() - 24 * 3600000).toISOString() },
            { species: 'Resplendent Quetzal', location: 'Cloud Forest, Costa Rica', status: 'Near Threatened', sightings: 45, lastSeen: new Date(Date.now() - 1800000).toISOString() },
            { species: 'Giant Panda', location: 'Sichuan, China', status: 'Vulnerable', sightings: 22, lastSeen: new Date(Date.now() - 3 * 3600000).toISOString() },
            { species: 'Hawksbill Sea Turtle', location: 'Great Barrier Reef', status: 'Critically Endangered', sightings: 18, lastSeen: new Date(Date.now() - 3600000).toISOString() },
            { species: 'Orangutan', location: 'Borneo, Malaysia', status: 'Critically Endangered', sightings: 9, lastSeen: new Date(Date.now() - 4 * 3600000).toISOString() },
            { species: 'Emperor Penguin', location: 'Antarctica', status: 'Near Threatened', sightings: 156, lastSeen: new Date(Date.now() - 6 * 3600000).toISOString() },
            { species: 'Red Panda', location: 'Eastern Himalayas', status: 'Endangered', sightings: 5, lastSeen: new Date(Date.now() - 48 * 3600000).toISOString() }
        ]);

        res.json({ message: 'Database seeded with all data!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
