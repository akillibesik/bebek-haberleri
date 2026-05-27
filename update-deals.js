const fs = require('fs');

// Geniş ve gerçekçi bebek ürünleri havuzu
const PRODUCT_POOL = [
  {
    name: 'Sleepy Bio Natural Bebek Bezi',
    category: 'bebek bezi',
    icon: '🍼',
    basePriceMin: 220,
    basePriceMax: 350,
    stores: ['e-bebek', 'Trendyol', 'Hepsiburada', 'Amazon'],
    imageUrl: 'https://cdn.dsmcdn.com/ty953/product/media/images/20230620/15/384729104/850192834_1_org_zoom.jpg'
  },
  {
    name: 'Prima Aktif Bebek Bezi Fırsat Paketi',
    category: 'bebek bezi',
    icon: '🍼',
    basePriceMin: 380,
    basePriceMax: 550,
    stores: ['e-bebek', 'Trendyol', 'Joker', 'Hepsiburada'],
    imageUrl: 'https://cdn.dsmcdn.com/ty900/product/media/images/20230520/12/350192039_1_org_zoom.jpg'
  },
  {
    name: 'Sleepy Natural Islak Mendil 12\'li',
    category: 'ıslak mendil',
    icon: '🧻',
    basePriceMin: 140,
    basePriceMax: 220,
    stores: ['e-bebek', 'Trendyol', 'Civil', 'Hepsiburada'],
    imageUrl: 'https://cdn.dsmcdn.com/ty940/product/media/images/20230610/18/370192839_1_org_zoom.jpg'
  },
  {
    name: 'Uni Baby Aktif Islak Mendil 3\'lü',
    category: 'ıslak mendil',
    icon: '🧻',
    basePriceMin: 85,
    basePriceMax: 130,
    stores: ['e-bebek', 'Joker', 'Civil', 'Amazon'],
    imageUrl: ''
  },
  {
    name: 'Kraft Berlin Bebek Arabası Grey',
    category: 'bebek arabası',
    icon: '🛒',
    basePriceMin: 5500,
    basePriceMax: 7800,
    stores: ['Joker', 'Trendyol', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Chicco Lite Way Baston Bebek Arabası',
    category: 'bebek arabası',
    icon: '🛒',
    basePriceMin: 3900,
    basePriceMax: 5200,
    stores: ['e-bebek', 'Joker', 'Trendyol', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Yenidoğan 5\'li Pamuklu Zıbın Seti',
    category: 'zıbın',
    icon: '👕',
    basePriceMin: 180,
    basePriceMax: 320,
    stores: ['Civil', 'Trendyol', 'e-bebek'],
    imageUrl: ''
  },
  {
    name: 'Carter\'s Organik Pamuk Tulum',
    category: 'tulum',
    icon: '👶',
    basePriceMin: 350,
    basePriceMax: 600,
    stores: ['Trendyol', 'Joker', 'Amazon'],
    imageUrl: ''
  },
  {
    name: 'Philips Avent Antikolik Biberon 260ml',
    category: 'biberon',
    icon: '🍼',
    basePriceMin: 280,
    basePriceMax: 420,
    stores: ['e-bebek', 'Joker', 'Trendyol', 'Amazon'],
    imageUrl: ''
  },
  {
    name: 'Lansinoh Manuel Göğüs Pompası',
    category: 'göğüs pompası',
    icon: '🤱',
    basePriceMin: 450,
    basePriceMax: 680,
    stores: ['e-bebek', 'Trendyol', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Chicco Temassız Kızılötesi Ateş Ölçer',
    category: 'ateş ölçer',
    icon: '🌡️',
    basePriceMin: 850,
    basePriceMax: 1400,
    stores: ['e-bebek', 'Joker', 'Trendyol', 'Amazon'],
    imageUrl: ''
  },
  {
    name: 'Wee Baby Burun Aspiratörü',
    category: 'burun aspiratörü',
    icon: '👃',
    basePriceMin: 90,
    basePriceMax: 150,
    stores: ['e-bebek', 'Civil', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Fisher-Price Eğitici Köpekçik (Yumuşak)',
    category: 'oyuncak',
    icon: '🧸',
    basePriceMin: 490,
    basePriceMax: 750,
    stores: ['Trendyol', 'Joker', 'Amazon', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Pilsan Pratik Mama Sandalyesi',
    category: 'mama sandalyesi',
    icon: '🪑',
    basePriceMin: 350,
    basePriceMax: 550,
    stores: ['e-bebek', 'Joker', 'Civil', 'Hepsiburada'],
    imageUrl: ''
  },
  {
    name: 'Bebedor Silikon Damaklı Emzik 2\'li',
    category: 'emzik',
    icon: '🍼',
    basePriceMin: 70,
    basePriceMax: 110,
    stores: ['e-bebek', 'Civil', 'Amazon'],
    imageUrl: ''
  }
];

const DISCOUNT_BADGES = [
  'Günün Fırsatı',
  'Sepette %15',
  'Kaçırılmayacak Fiyat',
  'Sepette %20',
  'Flaş İndirim',
  'En Ucuz Fiyat',
  '%30 İndirim',
  'Süper Fiyat'
];

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getRandomElements(arr, num) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function generateDeals() {
  console.log('Dinamik Alışveriş Fırsatları üretiliyor...');

  // Her gün rastgele 4 veya 5 fırsat seçelim
  const count = Math.random() > 0.5 ? 5 : 4;
  const selectedProducts = getRandomElements(PRODUCT_POOL, count);

  const firsatlar = selectedProducts.map(prod => {
    // Rastgele mağaza seç
    const store = prod.stores[Math.floor(Math.random() * prod.stores.length)];
    
    // Fiyat belirleme
    const rawPrice = Math.floor(prod.basePriceMin + Math.random() * (prod.basePriceMax - prod.basePriceMin));
    
    // Rastgele indirim rozeti seç
    const badge = DISCOUNT_BADGES[Math.floor(Math.random() * DISCOUNT_BADGES.length)];

    // Satın alma / arama linki (Uygulamadaki deep link mekanizması bunu ezerek mağaza içi arama yapacaktır)
    const buyUrl = `https://www.${store.toLowerCase().replace('-', '')}.com`;

    return {
      id: generateId(),
      name: prod.name,
      store: store,
      price: `${rawPrice} TL`,
      discountBadge: badge,
      icon: prod.icon,
      imageUrl: prod.imageUrl || undefined,
      buyUrl: buyUrl
    };
  });

  const output = {
    firsatlar: firsatlar
  };

  // alisveris.json dosyasına yaz
  fs.writeFileSync('alisveris.json', JSON.stringify(output, null, 4), 'utf-8');
  console.log('alisveris.json başarıyla güncellendi!');
  console.log(firsatlar);
}

generateDeals();
