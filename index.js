const Parser = require('rss-parser');
const fs = require('fs');
const parser = new Parser();

// RSS feed kaynakları (Google News arama sorguları)
const RSS_FEEDS = [
  { url: 'https://news.google.com/rss/search?q="bebek+gelişimi"&hl=tr&gl=TR&ceid=TR:tr', source: 'Google Haberler' },
  { url: 'https://news.google.com/rss/search?q="anne+sütü"&hl=tr&gl=TR&ceid=TR:tr', source: 'Google Haberler' },
  { url: 'https://news.google.com/rss/search?q="bebek+sağlığı"&hl=tr&gl=TR&ceid=TR:tr', source: 'Google Haberler' }
];

// İstenmeyen (adli/kötü) kelimeler filtresi - Ebeveynlerin canını sıkacak haberleri engellemek için
const FORBIDDEN_WORDS = ['ölü', 'kaza', 'cinayet', 'yaralı', 'bulundu', 'kaçırıldı', 'şiddet', 'istismar', 'darp', 'öldü', 'intihar', 'ceset', 'boğuldu'];

function isCleanContent(text) {
  const t = text.toLowerCase();
  return !FORBIDDEN_WORDS.some(word => t.includes(word));
}

// Uygulamanın beklediği kategoriler: saglik, gelisim, beslenme, psikoloji, guncel
const CATEGORIES = ['saglik', 'gelisim', 'beslenme', 'psikoloji', 'guncel'];

// Yapay zeka kullanmadan içeriği kategorize etmek için basit bir kelime eşleştirme
function getCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('beslenme') || t.includes('anne sütü') || t.includes('mama') || t.includes('ek gıda') || t.includes('vitamin')) return 'beslenme';
  if (t.includes('psikoloji') || t.includes('stres') || t.includes('depresyon') || t.includes('uyku') || t.includes('ağlama')) return 'psikoloji';
  if (t.includes('gelişim') || t.includes('beyin') || t.includes('motor') || t.includes('oyun') || t.includes('konuşma')) return 'gelisim';
  if (t.includes('hastalık') || t.includes('aşı') || t.includes('doktor') || t.includes('ateş') || t.includes('enfeksiyon') || t.includes('sağlık')) return 'saglik';
  return 'guncel'; // Varsayılan
}

// Okuma süresi tahmini (kelime sayısına göre)
function getReadTime(text) {
  const wordCount = text.split(' ').length;
  const mins = Math.max(1, Math.ceil(wordCount / 150));
  return `${mins} dk`;
}

// Tarih formatlama
function formatDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('tr-TR', options);
}

async function fetchNews() {
  console.log('Haberler çekiliyor...');
  const result = {
    saglik: [],
    gelisim: [],
    beslenme: [],
    psikoloji: [],
    guncel: []
  };

  let idCounter = 1;

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(encodeURI(feedUrl.url));
      console.log(`${feedUrl.source} kaynağından ${feed.items.length} haber bulundu.`);
      
      // İlk 20 haberi al
      for (const item of feed.items.slice(0, 20)) {
        const title = item.title || '';
        const descText = (item.contentSnippet || item.content || title).replace(/<[^>]*>?/gm, ''); // HTML etiketlerini temizle
        
        // Eğer başlıkta veya özette kötü kelime varsa bu haberi tamamen atla
        if (!isCleanContent(title + ' ' + descText)) continue;

        // Google News RSS'lerinde başlığın sonunda "- Kaynak Adı" yazar. Bunu ayırıp asıl haber sitesini bulalım.
        let cleanTitle = title;
        let finalSource = feedUrl.source;
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          finalSource = parts.pop();
          cleanTitle = parts.join(' - ');
        }

        const category = getCategory(cleanTitle + ' ' + descText);
        
        result[category].push({
          id: idCounter++,
          title: cleanTitle.length > 60 ? cleanTitle.substring(0, 57) + '...' : cleanTitle,
          source: finalSource.trim(),
          date: formatDate(item.pubDate),
          readTime: getReadTime(descText),
          desc: descText.length > 100 ? descText.substring(0, 97) + '...' : descText,
          link: item.link
        });
      }
    } catch (err) {
      console.error(`RSS Hatası (${feedUrl.url}):`, err.message);
    }
  }

  // Eğer kategoriler çok boş kalırsa, uygulamanın çökmemesi için varsayılan örnek veriler ekleyelim
  const fallbackData = {
    id: 999,
    title: 'Bebeklerde Uyku Düzeni Nasıl Sağlanır?',
    source: 'Bebek Rehberi',
    date: formatDate(),
    readTime: '3 dk',
    desc: 'Bebeğinizin uyku düzenini sağlamak için karanlık ve sessiz bir ortam yaratın. Beyaz gürültü kullanmayı deneyebilirsiniz.',
    link: 'https://google.com'
  };

  CATEGORIES.forEach(cat => {
    if (result[cat].length === 0) {
      result[cat].push({ ...fallbackData, id: idCounter++, title: `${cat.toUpperCase()} kategorisinde yeni haberler yakında...` });
    }
  });

  // JSON dosyasına yaz
  fs.writeFileSync('haberler.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('haberler.json dosyası başarıyla güncellendi!');
}

fetchNews();
