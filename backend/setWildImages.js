const { db } = require('./config/firebase');

async function updateWildlifeImages() {
    const wildlifeImages = {
        'Bengal Tiger': 'url("https://images.unsplash.com/photo-1590680388916-253c5cd8c805?auto=format&fit=crop&q=80&w=800") center/cover',
        'Blue Whale': 'url("https://images.unsplash.com/photo-1568430462989-44163eb1752f?auto=format&fit=crop&q=80&w=800") center/cover',
        'Snow Leopard': 'url("https://images.unsplash.com/photo-1618288330752-6bfb2ec4efab?auto=format&fit=crop&q=80&w=800") center/cover',
        'Resplendent Quetzal': 'url("https://images.unsplash.com/photo-1617462153545-2f16b9d628d0?auto=format&fit=crop&q=80&w=800") center/cover',
        'Giant Panda': 'url("https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&q=80&w=800") center/cover',
        'Hawksbill Sea Turtle': 'url("https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&q=80&w=800") center/cover',
        'Orangutan': 'url("https://images.unsplash.com/photo-1548689816-c399f954f3dd?auto=format&fit=crop&q=80&w=800") center/cover',
        'Emperor Penguin': 'url("https://images.unsplash.com/photo-1588653205166-7d63e9f4ebcf?auto=format&fit=crop&q=80&w=800") center/cover',
        'Red Panda': 'url("https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=800") center/cover',
        'Mountain Gorilla': 'url("https://images.unsplash.com/photo-1504910606771-46ced9754fdf?auto=format&fit=crop&q=80&w=800") center/cover',
        'Sumatran Elephant': 'url("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800") center/cover',
        'African Wild Dog': 'url("https://images.unsplash.com/photo-1574880537827-c1d0f507b5a8?auto=format&fit=crop&q=80&w=800") center/cover',
        'Komodo Dragon': 'url("https://images.unsplash.com/photo-1549729215-6ad1fac965c4?auto=format&fit=crop&q=80&w=800") center/cover',
        'Arctic Fox': 'url("https://images.unsplash.com/photo-1521798579930-1b77addffed?auto=format&fit=crop&q=80&w=800") center/cover',
        'Jaguar': 'url("https://images.unsplash.com/photo-1563811807661-75df691ee9eb?auto=format&fit=crop&q=80&w=800") center/cover'
    };

    try {
        const wildSnap = await db.collection('wildlife').get();
        const wildBatch = db.batch();
        wildSnap.docs.forEach(doc => {
            const img = wildlifeImages[doc.data().species];
            if (img) wildBatch.update(doc.ref, { gradient: img });
        });
        await wildBatch.commit();
        console.log('Wildlife updated with images');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateWildlifeImages();
