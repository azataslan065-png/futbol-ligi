/* ═══ ORTAK MODÜL (2026-10-26-E, onaylanan öneri 21) ══════════════════════════════════════════════════════════════════
   Puan Tablosu (index.html), admin paneli (admin.html) ve SAHA (saha.html) bu dosyayı paylaşır. Önceden aynı parçalar üç dosyada
   ayrı kopyalar halindeydi; bir düzeltme birinde yapılıp diğerinde unutulunca uygulamalar farklı davranıyordu.
   İÇERİK: (1) Renk arama motoru - Türkçe/İngilizce renk sözlüğü, renk adı / hex / rgb çözümleme, Premium ton, kategoriler,
   görselden baskın renk çıkarma. (2) formaSvg - forma + şort çizimi (desenli). (3) ortakKitAlanlari - kullanıcının SAHA'da
   tasarladığı formanın lig takımı forma alanlarına çevrilmesi. Sayfalar bu dosyayı ?v=<sürüm> ile yükler. */
(function(){ 'use strict'; })();
var COLOR_DICTIONARY={
  'kırmızı':'#e11d48','red':'#e11d48','kirmizi':'#e11d48','mavi':'#2563eb','blue':'#2563eb',
  'yeşil':'#16a34a','green':'#16a34a','yesil':'#16a34a','sarı':'#eab308','yellow':'#eab308','sari':'#eab308',
  'turuncu':'#f97316','orange':'#f97316','mor':'#7c3aed','purple':'#7c3aed','violet':'#7c3aed',
  'menekşe':'#8b5cf6','menekse':'#8b5cf6','pembe':'#ec4899','pink':'#ec4899','siyah':'#0a0a0a','black':'#0a0a0a',
  'beyaz':'#ffffff','white':'#ffffff','gri':'#6b7280','gray':'#6b7280','grey':'#6b7280',
  'kahverengi':'#92400e','brown':'#92400e','kahve':'#78350f','lacivert':'#1e3a8a','navy':'#1e3a8a',
  'turkuaz':'#06b6d4','turquoise':'#06b6d4','teal':'#0d9488','altın':'#d4af37','gold':'#d4af37','altin':'#d4af37','golden':'#d4af37',
  'gümüş':'#c0c0c0','silver':'#c0c0c0','gumus':'#c0c0c0','bronz':'#cd7f32','bronze':'#cd7f32',
  'bordo':'#7f1d1d','maroon':'#7f1d1d','vişne':'#881337','visne':'#881337','krem':'#faf3e0','cream':'#faf3e0',
  'bej':'#e8d5b7','beige':'#e8d5b7','lila':'#c4b5fd','lilac':'#c4b5fd','eflatun':'#a78bfa',
  'fuşya':'#d946ef','fusya':'#d946ef','fuchsia':'#d946ef','magenta':'#d946ef','indigo':'#4f46e5','çivit':'#4f46e5','civit':'#4f46e5',
  'zümrüt':'#059669','zumrut':'#059669','emerald':'#059669','yakut':'#e0115f','ruby':'#e0115f',
  'safir':'#0f52ba','sapphire':'#0f52ba','ametist':'#9966cc','amethyst':'#9966cc','mercan':'#ff7f50','coral':'#ff7f50',
  'somon':'#fa8072','salmon':'#fa8072','hardal':'#d4a017','mustard':'#d4a017','haki':'#bdb76b','khaki':'#bdb76b',
  'zeytin':'#808000','olive':'#808000','nane':'#98ff98','mint':'#98ff98','çimen':'#7cba3d','cimen':'#7cba3d',
  'gökyüzü':'#87ceeb','gokyuzu':'#87ceeb','sky':'#87ceeb','skyblue':'#87ceeb','gökmavisi':'#38bdf8','gokmavisi':'#38bdf8',
  'okyanus':'#0e7490','ocean':'#0e7490','petrol':'#005f6a','limon':'#fff44f','lemon':'#fff44f',
  'amber':'#ffbf00','kehribar':'#ffbf00','şeftali':'#ffcba4','seftali':'#ffcba4','peach':'#ffcba4',
  'kayısı':'#fbceb1','kayisi':'#fbceb1','apricot':'#fbceb1','tuğla':'#b22222','tugla':'#b22222','brick':'#b22222','kiremit':'#b22222',
  'şarap':'#722f37','sarap':'#722f37','wine':'#722f37','gül':'#ff66cc','gul':'#ff66cc','rose':'#ff007f',
  'gül kurusu':'#b76e79','gul kurusu':'#b76e79','lavanta':'#b57edc','lavender':'#b57edc','leylak':'#c8a2c8',
  'antrasit':'#293133','füme':'#4a4a4a','fume':'#4a4a4a','kömür':'#36454f','komur':'#36454f','charcoal':'#36454f',
  'fildişi':'#fffff0','fildisi':'#fffff0','ivory':'#fffff0','kum':'#c2b280','sand':'#c2b280',
  'toprak':'#8b5a2b','çikolata':'#7b3f00','cikolata':'#7b3f00','chocolate':'#7b3f00','kestane':'#954535','chestnut':'#954535',
  'bakır':'#b87333','bakir':'#b87333','copper':'#b87333','platin':'#e5e4e2','platinum':'#e5e4e2',
  'inci':'#eae0c8','pearl':'#eae0c8','şampanya':'#f7e7ce','sampanya':'#f7e7ce','champagne':'#f7e7ce',
  'obsidyen':'#0b1215','obsidian':'#0b1215','gece mavisi':'#191970','gece':'#191970','midnight':'#191970',
  'kraliyet mavisi':'#4169e1','royal':'#4169e1','royalblue':'#4169e1','kobalt':'#0047ab','cobalt':'#0047ab',
  'çelik mavisi':'#4682b4','celik mavisi':'#4682b4','steel':'#4682b4','steelblue':'#4682b4',
  'deniz yeşili':'#2e8b57','deniz yesili':'#2e8b57','seagreen':'#2e8b57','orman yeşili':'#228b22','orman yesili':'#228b22','forest':'#228b22',
  'çam yeşili':'#01796f','cam yesili':'#01796f','pine':'#01796f','ateş':'#ff4500','ates':'#ff4500','fire':'#ff4500','alev':'#ff4500',
  'kan kırmızısı':'#8a0303','kan':'#8a0303','çilek':'#fc5a8d','cilek':'#fc5a8d','strawberry':'#fc5a8d',
  'üzüm':'#6f2da8','uzum':'#6f2da8','grape':'#6f2da8','patlıcan':'#614051','patlican':'#614051','eggplant':'#614051','fıstık':'#9acd32','fistik':'#9acd32'
};
var CSS_NAMED_COLORS={aliceblue:'#f0f8ff',antiquewhite:'#faebd7',aqua:'#00ffff',aquamarine:'#7fffd4',azure:'#f0ffff',bisque:'#ffe4c4',blanchedalmond:'#ffebcd',blueviolet:'#8a2be2',burlywood:'#deb887',cadetblue:'#5f9ea0',chartreuse:'#7fff00',cornflowerblue:'#6495ed',cornsilk:'#fff8dc',crimson:'#dc143c',cyan:'#00ffff',darkblue:'#00008b',darkcyan:'#008b8b',darkgoldenrod:'#b8860b',darkgray:'#a9a9a9',darkgreen:'#006400',darkkhaki:'#bdb76b',darkmagenta:'#8b008b',darkolivegreen:'#556b2f',darkorange:'#ff8c00',darkorchid:'#9932cc',darkred:'#8b0000',darksalmon:'#e9967a',darkseagreen:'#8fbc8f',darkslateblue:'#483d8b',darkslategray:'#2f4f4f',darkturquoise:'#00ced1',darkviolet:'#9400d3',deeppink:'#ff1493',deepskyblue:'#00bfff',dimgray:'#696969',dodgerblue:'#1e90ff',firebrick:'#b22222',floralwhite:'#fffaf0',forestgreen:'#228b22',gainsboro:'#dcdcdc',ghostwhite:'#f8f8ff',goldenrod:'#daa520',greenyellow:'#adff2f',honeydew:'#f0fff0',hotpink:'#ff69b4',indianred:'#cd5c5c',indigo:'#4b0082',ivory:'#fffff0',khaki:'#f0e68c',lavender:'#e6e6fa',lawngreen:'#7cfc00',lemonchiffon:'#fffacd',lightblue:'#add8e6',lightcoral:'#f08080',lightcyan:'#e0ffff',lightgreen:'#90ee90',lightpink:'#ffb6c1',lightsalmon:'#ffa07a',lightseagreen:'#20b2aa',lightskyblue:'#87cefa',lightsteelblue:'#b0c4de',lightyellow:'#ffffe0',lime:'#00ff00',limegreen:'#32cd32',linen:'#faf0e6',mediumaquamarine:'#66cdaa',mediumblue:'#0000cd',mediumorchid:'#ba55d3',mediumpurple:'#9370db',mediumseagreen:'#3cb371',mediumslateblue:'#7b68ee',mediumspringgreen:'#00fa9a',mediumturquoise:'#48d1cc',mediumvioletred:'#c71585',mintcream:'#f5fffa',mistyrose:'#ffe4e1',moccasin:'#ffe4b5',navajowhite:'#ffdead',oldlace:'#fdf5e6',olivedrab:'#6b8e23',orangered:'#ff4500',orchid:'#da70d6',palegoldenrod:'#eee8aa',palegreen:'#98fb98',paleturquoise:'#afeeee',palevioletred:'#db7093',papayawhip:'#ffefd5',peachpuff:'#ffdab9',peru:'#cd853f',plum:'#dda0dd',powderblue:'#b0e0e6',rosybrown:'#bc8f8f',royalblue:'#4169e1',saddlebrown:'#8b4513',salmon:'#fa8072',sandybrown:'#f4a460',seagreen:'#2e8b57',seashell:'#fff5ee',sienna:'#a0522d',slateblue:'#6a5acd',slategray:'#708090',snow:'#fffafa',springgreen:'#00ff7f',steelblue:'#4682b4',tan:'#d2b48c',thistle:'#d8bfd8',tomato:'#ff6347',turquoise:'#40e0d0',wheat:'#f5deb3',whitesmoke:'#f5f5f5',yellowgreen:'#9acd32'};
(function(){for(var k in CSS_NAMED_COLORS){if(!COLOR_DICTIONARY[k])COLOR_DICTIONARY[k]=CSS_NAMED_COLORS[k];}})();
// ═══ GENİŞLETİLMİŞ RENK SÖZLÜĞÜ (kullanıcı talebi: "süt beyazı gibi spesifik isimler dahil
// bilinen bütün renkler bulunsun") - yüzlerce Türkçe + İngilizce isimli renk. Ağ olmadan
// (çevrimdışı) çalışır. Bulunamayan "sıfat + temel renk" kombinasyonları ayrıca isim-eki
// motoruyla (aşağıda) çözülür. ═══
var COLOR_DICTIONARY_EXT={
  // BEYAZ tonları
  'süt beyazı':'#fdfff5','süt':'#fdfff5','sut beyazi':'#fdfff5','milk white':'#fdfff5',
  'kar beyazı':'#fffafa','kar':'#fffafa','snow white':'#fffafa',
  'kırık beyaz':'#f5f0e8','kirik beyaz':'#f5f0e8','off white':'#f5f0e8','offwhite':'#f5f0e8',
  'fildişi':'#fffff0','fildisi':'#fffff0','ivory':'#fffff0','fil dişi':'#fffff0',
  'inci beyazı':'#f8f6f0','inci':'#eae0c8','pearl':'#eae0c8','pearl white':'#f8f6f0',
  'krem':'#fffdd0','cream':'#fffdd0','krem beyazı':'#fffdd0',
  'bej':'#f5f5dc','beige':'#f5f5dc','bej beyazı':'#f5f5dc',
  'yumurta kabuğu':'#fdf1d6','egg shell':'#fdf1d6','eggshell':'#fdf1d6',
  'buz beyazı':'#f0ffff','buz':'#e0f7fa','ice white':'#f0ffff',
  'tebeşir':'#f4f4f0','chalk':'#f4f4f0','tebesir':'#f4f4f0',
  'kemik':'#e3dac9','bone':'#e3dac9','kemik beyazı':'#e3dac9',
  'kum beji':'#e8dcc4','sand beige':'#e8dcc4',
  'vanilya':'#f3e5ab','vanilla':'#f3e5ab','vanilya kremi':'#f3e5ab',
  'sedef':'#f4f0ec','nacre':'#f4f0ec',
  'porselen':'#f7f4f2','porcelain':'#f7f4f2',
  'kaymak':'#f6f1e7','clotted cream':'#f6f1e7',
  // SİYAH / GRİ tonları
  'kömür':'#1a1a1a','komur':'#1a1a1a','coal':'#1a1a1a','kömür siyahı':'#0d0d0d',
  'abanoz':'#0b0b0b','ebony':'#0b0b0b',
  'gece siyahı':'#0a0a12','jet black':'#0a0a0a','jet':'#0a0a0a',
  'antrasit':'#2b2f33','anthracite':'#2b2f33','antrasit gri':'#3a3f44',
  'füme':'#4a4a52','fume':'#4a4a52','smoke':'#4a4a52','duman':'#4a4a52',
  'kurşun':'#5a5f66','kursun':'#5a5f66','lead':'#5a5f66','kurşuni':'#6a6f76',
  'gri':'#808080','gray':'#808080','grey':'#808080',
  'açık gri':'#d3d3d3','acik gri':'#d3d3d3','light gray':'#d3d3d3',
  'koyu gri':'#4d4d4d','koyu gri̇':'#4d4d4d','dark gray':'#4d4d4d',
  'gümüş gri':'#c0c0c8','silver gray':'#c0c0c8',
  'sis grisi':'#b8bcc0','fog gray':'#b8bcc0','sis':'#b8bcc0',
  'taş grisi':'#8d8d86','stone gray':'#8d8d86','taş':'#8d8d86','tas':'#8d8d86',
  'beton':'#95999c','concrete':'#95999c',
  'grafit':'#383838','graphite':'#383838',
  'arduvaz':'#4b5259','slate':'#4b5259','arduaz':'#4b5259',
  'vizon':'#8b7d6b','mink':'#8b7d6b','vizon grisi':'#8b7d6b',
  'gümüş':'#c0c0c0','silver':'#c0c0c0','gumus':'#c0c0c0',
  'platin':'#e5e4e2','platinum':'#e5e4e2',
  // KIRMIZI tonları
  'kırmızı':'#e11d2c','kirmizi':'#e11d2c','red':'#e11d2c',
  'kan kırmızısı':'#8b0000','kan':'#8b0000','blood red':'#8b0000',
  'bordo':'#7b1e2b','bordeaux':'#7b1e2b','maroon':'#7b1e2b',
  'vişne':'#8a1538','visne':'#8a1538','cherry':'#8a1538','vişne çürüğü':'#5c1a2b',
  'nar':'#c72c48','pomegranate':'#c72c48','nar kırmızısı':'#b02040',
  'ateş kırmızısı':'#ff2400','ates':'#ff2400','fire red':'#ff2400',
  'kiremit':'#b34733','tile red':'#b34733','kiremit kırmızısı':'#a94434',
  'tuğla':'#b04a39','tugla':'#b04a39','brick':'#b04a39','tuğla kırmızısı':'#a03e2f',
  'mercan':'#ff6f61','coral':'#ff6f61','mercan kırmızısı':'#ff6f61',
  'gül kurusu':'#b76e79','gul kurusu':'#b76e79','dusty rose':'#b76e79',
  'şarap':'#722f37','sarap':'#722f37','wine':'#722f37','şarap kırmızısı':'#6e2635',
  'yakut':'#e0115f','ruby':'#e0115f','yakut kırmızısı':'#cc0e55',
  'karmen':'#960018','carmine':'#960018','karmın':'#960018',
  'kızıl':'#c1440e','kizil':'#c1440e','rust red':'#c1440e',
  'fuşya kırmızısı':'#c2185b','crimson':'#dc143c',
  'domates':'#ff6347','tomato':'#ff6347','domates kırmızısı':'#e2492d',
  'çilek':'#d53149','cilek':'#d53149','strawberry':'#d53149',
  // PEMBE tonları
  'pembe':'#ff70a6','pink':'#ff70a6',
  'toz pembe':'#f7cad0','toz pembesi':'#f7cad0','powder pink':'#f7cad0','dusty pink':'#e8b4bc',
  'bebek pembesi':'#f4c2c2','baby pink':'#f4c2c2',
  'somon':'#fa8072','salmon':'#fa8072','somon pembesi':'#ff9186',
  'fuşya':'#ff00a0','fusya':'#ff00a0','fuchsia':'#ff00ff','fuşya pembesi':'#ff2d95',
  'magenta':'#ff00ff','macenta':'#ff00ff',
  'gül':'#ff66b2','gul':'#ff66b2','rose':'#ff007f','gül pembesi':'#ff6eb4',
  'şeker pembesi':'#f7a8c4','seker pembesi':'#f7a8c4','candy pink':'#f7a8c4',
  'flamingo':'#fc8eac','flamingo pembesi':'#fc8eac',
  'orkide':'#da70d6','orchid':'#da70d6',
  'lila':'#c8a2c8','lilac':'#c8a2c8','leylak':'#b57edc','lavanta':'#b57edc',
  'çingene pembesi':'#e91e63','hot pink':'#ff69b4',
  // TURUNCU tonları
  'turuncu':'#ff8c00','orange':'#ff8c00',
  'mandalina':'#ff8f4d','tangerine':'#f28500','mandalina turuncusu':'#ff8f4d',
  'kavun içi':'#ffb26b','kavun ici':'#ffb26b','cantaloupe':'#ffb26b',
  'şeftali':'#ffcba4','seftali':'#ffcba4','peach':'#ffcba4','şeftali rengi':'#ffcba4',
  'kayısı':'#fbb45c','kayisi':'#fbb45c','apricot':'#fbb45c',
  'balkabağı':'#ff7518','balkabagi':'#ff7518','pumpkin':'#ff7518','bal kabağı':'#ff7518',
  'havuç':'#ed9121','havuc':'#ed9121','carrot':'#ed9121',
  'amber':'#ffbf00','kehribar':'#ffbf00','amber turuncusu':'#ffbf00',
  'portakal':'#ff9f00','portakal turuncusu':'#ff9f00',
  'bakır turuncusu':'#c96a3b','koral':'#ff7f50',
  'terracotta':'#e2725b','teracota':'#e2725b','tarçın':'#d2691e','tarcin':'#d2691e','cinnamon':'#d2691e',
  // SARI tonları
  'sarı':'#ffd60a','sari':'#ffd60a','yellow':'#ffd60a',
  'limon':'#fff44f','lemon':'#fff44f','limon sarısı':'#fff44f','limon küfü':'#f0f04a',
  'altın':'#d4af37','altin':'#d4af37','gold':'#d4af37','altın sarısı':'#f0c420',
  'hardal':'#d4a017','mustard':'#d4a017','hardal sarısı':'#c9a227',
  'kanarya':'#ffef00','canary':'#ffef00','kanarya sarısı':'#ffef00',
  'buğday':'#f5deb3','bugday':'#f5deb3','wheat':'#f5deb3',
  'saman':'#e4d96f','straw':'#e4d96f','saman sarısı':'#e4d96f',
  'safran':'#f4c430','saffron':'#f4c430',
  'kükürt':'#e8e337','sulfur':'#e8e337','kukurt':'#e8e337',
  'krom sarısı':'#ffa700','chrome yellow':'#ffa700',
  'bal':'#eba937','honey':'#eba937','bal rengi':'#eba937',
  'civciv sarısı':'#fce205','chick yellow':'#fce205',
  // YEŞİL tonları
  'yeşil':'#2ecc40','yesil':'#2ecc40','green':'#2ecc40',
  'çimen':'#7cba3d','cimen':'#7cba3d','grass green':'#7cba3d','çimen yeşili':'#7cba3d',
  'zümrüt':'#009b77','zumrut':'#009b77','emerald':'#009b77','zümrüt yeşili':'#009b77',
  'çam yeşili':'#01796f','cam yesili':'#01796f','pine green':'#01796f',
  'orman yeşili':'#228b22','orman yesili':'#228b22','forest green':'#228b22',
  'zeytin':'#808000','olive':'#808000','zeytin yeşili':'#6b8e23','olive green':'#6b8e23',
  'haki':'#78866b','khaki':'#78866b','asker yeşili':'#4b5320','army green':'#4b5320',
  'nane':'#3eb489','mint':'#3eb489','nane yeşili':'#98ff98','mint green':'#98ff98',
  'fıstık':'#9acd32','fistik':'#9acd32','pistachio':'#93c572','fıstık yeşili':'#93c572',
  'petrol yeşili':'#004d4d','petrol':'#005f6a','teal':'#008080','deniz yeşili':'#2e8b57',
  'su yeşili':'#7fdbb6','sea green':'#2e8b57','aqua green':'#7fdbb6',
  'yosun':'#8a9a5b','moss':'#8a9a5b','yosun yeşili':'#8a9a5b','moss green':'#8a9a5b',
  'çağla':'#a3c585','cagla':'#a3c585','çağla yeşili':'#a3c585',
  'avokado':'#568203','avocado':'#568203',
  'limon yeşili':'#bfff00','lime':'#bfff00','lime green':'#32cd32','misket limonu':'#bfff00',
  'neon yeşil':'#39ff14','neon green':'#39ff14',
  'köknar':'#014421','fir':'#014421','çam':'#014421',
  'bataklık yeşili':'#5a6f42','swamp green':'#5a6f42',
  'jade':'#00a86b','yeşim':'#00a86b','yesim':'#00a86b',
  'defne':'#556b2f','laurel':'#556b2f',
  // MAVİ tonları
  'mavi':'#0074d9','blue':'#0074d9',
  'lacivert':'#1e3a8a','navy':'#1e3a8a','navy blue':'#1e3a8a','gece mavisi':'#191970','midnight blue':'#191970',
  'gök mavisi':'#4da6ff','gok mavisi':'#4da6ff','sky blue':'#87ceeb','gökyüzü':'#87ceeb',
  'bebek mavisi':'#89cff0','baby blue':'#89cff0',
  'buz mavisi':'#a5f2f3','ice blue':'#a5f2f3',
  'turkuaz':'#40e0d0','turquoise':'#40e0d0','turkuaz mavisi':'#30d5c8',
  'petrol mavisi':'#005f6a','petrol blue':'#005f6a',
  'kobalt':'#0047ab','cobalt':'#0047ab','kobalt mavisi':'#0047ab',
  'safir':'#0f52ba','sapphire':'#0f52ba','safir mavisi':'#0f52ba',
  'kraliyet mavisi':'#4169e1','royal blue':'#4169e1','royal':'#4169e1',
  'çelik mavisi':'#4682b4','celik mavisi':'#4682b4','steel blue':'#4682b4',
  'denim':'#1560bd','denim mavisi':'#1560bd','kot':'#1560bd',
  'okyanus':'#0077be','ocean':'#0077be','okyanus mavisi':'#0077be',
  'deniz mavisi':'#006994','sea blue':'#006994',
  'gökkuşağı mavisi':'#3f8fd2','indigo':'#4b0082','çivit':'#4b0082','civit':'#4b0082',
  'menekşe mavisi':'#7b68ee','periwinkle':'#ccccff','çuha çiçeği':'#ccccff',
  'elektrik mavisi':'#7df9ff','electric blue':'#7df9ff',
  'gece yarısı':'#0c1445','midnight':'#0c1445',
  'aqua':'#00ffff','camgöbeği':'#00ffff','camgobegi':'#00ffff','cyan':'#00ffff',
  'teal mavisi':'#008080','deniz yeşili mavi':'#20b2aa',
  'prusya mavisi':'#003153','prussian blue':'#003153',
  'ördek başı':'#00494d','ordek basi':'#00494d','teal koyu':'#00494d',
  // MOR tonları
  'mor':'#8b3dd8','purple':'#8b3dd8','violet':'#8b00ff','menekşe':'#8b00ff','menekse':'#8b00ff',
  'eflatun':'#a050c0','koyu mor':'#4b0082','patlıcan':'#614051','patlican':'#614051','eggplant':'#614051','aubergine':'#614051',
  'ametist':'#9966cc','amethyst':'#9966cc','ametist moru':'#9966cc',
  'lavanta moru':'#967bb6','lavender':'#e6e6fa',
  'erik':'#8e4585','plum':'#8e4585','erik moru':'#8e4585',
  'üzüm':'#6f2da8','uzum':'#6f2da8','grape':'#6f2da8','üzüm moru':'#6f2da8',
  'mürdüm':'#5d3954','murdum':'#5d3954','mürdüm eriği':'#5d3954',
  'orkide moru':'#af69ef','magenta moru':'#c154c1',
  'lila moru':'#b666d2','çivit moru':'#4b0082',
  'bordo mor':'#5e2750','byzantium':'#702963','bizans moru':'#702963',
  // KAHVE tonları
  'kahverengi':'#7b4b27','kahve':'#6f4e37','brown':'#7b4b27','coffee':'#6f4e37',
  'çikolata':'#5c3317','cikolata':'#5c3317','chocolate':'#5c3317','çikolata kahvesi':'#5c3317',
  'kestane':'#8b4513','chestnut':'#954535','kestane rengi':'#954535',
  'tarçın kahvesi':'#7b3f00','cinnamon brown':'#7b3f00',
  'bakır':'#b87333','bakir':'#b87333','copper':'#b87333','bakır rengi':'#b87333',
  'bronz':'#8c6c46','bronze':'#8c6c46','bronz rengi':'#8c6c46',
  'karamel':'#c68e17','caramel':'#c68e17','karamel kahvesi':'#c68e17',
  'kahve sütlü':'#a67b5b','latte':'#a67b5b','sütlü kahve':'#a67b5b','cafe au lait':'#a67b5b',
  'toprak':'#8b5a2b','earth':'#8b5a2b','toprak rengi':'#8b5a2b','sienna':'#a0522d',
  'kum':'#c2b280','sand':'#c2b280','kum rengi':'#c2b280',
  'deve tüyü':'#c19a6b','deve tuyu':'#c19a6b','camel':'#c19a6b','deve':'#c19a6b',
  'taba':'#a0522d','tan':'#d2b48c','ten rengi':'#e0ac69',
  'fındık':'#8b6f47','findik':'#8b6f47','hazelnut':'#8b6f47','fındık kabuğu':'#8b6f47',
  'ceviz':'#5c4033','walnut':'#5c4033','ceviz kahvesi':'#5c4033',
  'maun':'#4a0100','mahogany':'#4a0100','maun rengi':'#4a0100',
  'kahve köpüğü':'#c8a27a','coffee foam':'#c8a27a',
  'muz kabuğu':'#7c5c34','çamur':'#70543e','camur':'#70543e','mud':'#70543e',
  'khaki kahve':'#a89060','tütün':'#715022','tutun':'#715022','tobacco':'#715022'
};

(function(){for(var k in COLOR_DICTIONARY_EXT){COLOR_DICTIONARY[k]=COLOR_DICTIONARY_EXT[k];}})();

function _normColorQuery(q){return String(q||'').toLowerCase().trim().replace(/ı/g,'i').replace(/ş/g,'s').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ö/g,'o').replace(/ç/g,'c');}
var _COLOR_MODIFIERS={koyu:-0.35,dark:-0.35,acik:0.35,light:0.35,parlak:0.2,bright:0.2,soluk:-0.15,pale:0.3,pastel:0.4,derin:-0.25,deep:-0.25};
function _hexToRgb(h){h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};}
function _rgbToHex(r,g,b){var c=function(x){x=Math.max(0,Math.min(255,Math.round(x)));var s=x.toString(16);return s.length===1?'0'+s:s;};return '#'+c(r)+c(g)+c(b);}
function _adjustLightness(hex,amount){var rgb=_hexToRgb(hex);if(amount>=0){return _rgbToHex(rgb.r+(255-rgb.r)*amount,rgb.g+(255-rgb.g)*amount,rgb.b+(255-rgb.b)*amount);}return _rgbToHex(rgb.r*(1+amount),rgb.g*(1+amount),rgb.b*(1+amount));}
function searchColor(query){
  var raw=String(query||'').trim();if(!raw)return null;
  var hexMatch=raw.match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if(hexMatch){return '#'+(hexMatch[1].length===3?hexMatch[1].split('').map(function(c){return c+c;}).join(''):hexMatch[1]).toLowerCase();}
  var rgbMatch=raw.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if(rgbMatch){return _rgbToHex(+rgbMatch[1],+rgbMatch[2],+rgbMatch[3]);}
  var q=_normColorQuery(raw),modifier=0,baseQuery=q,words=q.split(/\s+/);
  if(words.length>1){var modKey=_normColorQuery(words[0]);if(_COLOR_MODIFIERS[modKey]!==undefined){modifier=_COLOR_MODIFIERS[modKey];baseQuery=words.slice(1).join(' ');}}
  var normDict={};for(var k in COLOR_DICTIONARY){normDict[_normColorQuery(k)]=COLOR_DICTIONARY[k];}
  var hit=normDict[baseQuery]||normDict[q];
  // KULLANICI TALEBİ: "süt beyazı gibi spesifik isimler dahil bilinen bütün renkler bulunsun."
  // İSİM-EKİ MOTORU: "X beyazı/mavisi/yeşili" gibi bir kombinasyon doğrudan bulunamazsa, iki
  // parça olarak çözülür: (1) temel renk (beyaz/mavi/...) sözlükten alınır, (2) niteleyen
  // sözcük (süt/gece/...) kendi rengi sözlükte varsa, o iki renk HARMANLANIR - böylece
  // "süt beyazı" = beyaz'a doğru çekilmiş süt tonu olarak üretilir.
  if(!hit){
    var toned=_resolveCompoundColor(q,normDict);
    if(toned)return modifier!==0?_adjustLightness(toned,modifier):toned;
  }
  if(!hit){var bestKey=null,bestLen=0;for(var nk in normDict){if((baseQuery.indexOf(nk)>-1||nk.indexOf(baseQuery)>-1)&&nk.length>bestLen){bestKey=nk;bestLen=nk.length;}}if(bestKey)hit=normDict[bestKey];}
  if(!hit)return null;
  if(modifier!==0)hit=_adjustLightness(hit,modifier);
  return hit;
}
// "sıfat + temel renk" kombinasyonunu çözer. Örn "süt beyazı", "gece mavisi", "petrol yeşili".
// Temel renk son ekleri (beyazı→beyaz, mavisi→mavi, yeşili→yeşil) normalleştirilir; niteleyen
// sözcüğün kendi rengi varsa iki renk harmanlanıp temel renge doğru çekilir.
function _resolveCompoundColor(normQuery,normDict){
  var words=normQuery.split(/\s+/);
  if(words.length<2)return null;
  // Türkçe iyelik eklerini temel renk adından temizle (beyazi->beyaz, mavisi->mavi, yesili->yesil, moru->mor)
  function stripSuffix(w){
    return w.replace(/(sonu|ligi)$/,'')
            .replace(/(beyazi|beyaz)$/,'beyaz').replace(/(mavisi|mavi)$/,'mavi')
            .replace(/(yesili|yesil)$/,'yesil').replace(/(kirmizisi|kirmizi)$/,'kirmizi')
            .replace(/(moru|mor)$/,'mor').replace(/(sarisi|sari)$/,'sari')
            .replace(/(pembesi|pembe)$/,'pembe').replace(/(grisi|gri)$/,'gri')
            .replace(/(turuncusu|turuncu)$/,'turuncu').replace(/(kahvesi|kahve)$/,'kahve')
            .replace(/(rengi|tonu)$/,'');
  }
  var last=stripSuffix(words[words.length-1]);
  var baseHex=normDict[last]||normDict[words[words.length-1]];
  if(!baseHex)return null;
  // Niteleyen sözcük(ler): kendi renkleri varsa harmanla.
  var qualifier=words.slice(0,words.length-1).join(' ');
  var qHex=normDict[qualifier]||normDict[_normColorQuery(qualifier)];
  if(qHex){
    // Temel renge %65, niteleyene %35 ağırlık - temel renk baskın kalır ama niteleyen etkiler.
    return _mixHex(baseHex,qHex,0.35);
  }
  // Niteleyenin rengi yoksa ama temel renk bulunduysa, en azından temel rengi döndür.
  return baseHex;
}
function _mixHex(a,b,ratio){
  var ra=_hexToRgb(a),rb=_hexToRgb(b);
  return _rgbToHex(ra.r+(rb.r-ra.r)*ratio,ra.g+(rb.g-ra.g)*ratio,ra.b+(rb.b-ra.b)*ratio);
}
function premiumizeColor(hex){if(!hex)return hex;var rgb=_hexToRgb(hex);var avg=(rgb.r+rgb.g+rgb.b)/3,boost=1.25;var r=avg+(rgb.r-avg)*boost,g=avg+(rgb.g-avg)*boost,b=avg+(rgb.b-avg)*boost;r+=12;g+=6;return _rgbToHex(r,g,b);}
var COLOR_CATEGORIES=[
  {id:'all',label:'Tümü',icon:''},
  {id:'red',label:'Kırmızı',icon:'',samples:['kırmızı','bordo','vişne','mercan','tuğla','kan kırmızısı','somon','nar']},
  {id:'pink',label:'Pembe',icon:'',samples:['pembe','toz pembe','fuşya','gül kurusu','şeker pembesi','flamingo','somon pembesi']},
  {id:'orange',label:'Turuncu',icon:'',samples:['turuncu','balkabağı','şeftali','kayısı','mandalina','havuç','amber','tarçın']},
  {id:'yellow',label:'Sarı',icon:'',samples:['sarı','altın','limon','hardal','bal','safran','buğday','kanarya']},
  {id:'green',label:'Yeşil',icon:'',samples:['yeşil','zümrüt','çimen','nane','fıstık','zeytin','orman yeşili','petrol yeşili','avokado']},
  {id:'blue',label:'Mavi',icon:'',samples:['mavi','lacivert','gök mavisi','turkuaz','kobalt','safir','bebek mavisi','petrol mavisi','denim']},
  {id:'purple',label:'Mor',icon:'',samples:['mor','eflatun','ametist','lila','erik','üzüm','mürdüm','patlıcan','lavanta moru']},
  {id:'brown',label:'Kahve',icon:'',samples:['kahverengi','çikolata','karamel','bakır','bronz','kestane','deve tüyü','fındık','toprak']},
  {id:'neutral',label:'Nötr',icon:'',samples:['beyaz','süt beyazı','fildişi','krem','bej','gri','antrasit','füme','vizon','siyah','kömür']}
];

function extractPaletteFromImage(img,count){
  count=count||1;
  var cv=document.createElement('canvas');
  var scale=Math.min(1,80/Math.max(img.width||80,img.height||80));
  cv.width=Math.max(1,Math.round((img.width||80)*scale));
  cv.height=Math.max(1,Math.round((img.height||80)*scale));
  var ctx=cv.getContext('2d');
  ctx.drawImage(img,0,0,cv.width,cv.height);
  var data;try{data=ctx.getImageData(0,0,cv.width,cv.height).data;}catch(e){return [];}
  // Renkleri kabaca kovalara indir (her kanal 5 bit) ve say. Çok koyu/çok açık pikselleri
  // ağırlıklandırmadan bırakmıyoruz ama baskınlığı korur.
  var buckets={};
  for(var i=0;i<data.length;i+=4){
    var a=data[i+3];if(a<125)continue;
    var r=data[i],g=data[i+1],b=data[i+2];
    var key=(r>>3)+'|'+(g>>3)+'|'+(b>>3);
    if(!buckets[key])buckets[key]={r:0,g:0,b:0,n:0};
    var bk=buckets[key];bk.r+=r;bk.g+=g;bk.b+=b;bk.n++;
  }
  var arr=[];for(var k in buckets){var bk=buckets[k];arr.push({r:bk.r/bk.n,g:bk.g/bk.n,b:bk.b/bk.n,n:bk.n});}
  arr.sort(function(a,b){return b.n-a.n;});
  // Birbirine çok yakın renkleri ele (çeşitlilik için).
  var picked=[];
  for(var j=0;j<arr.length&&picked.length<count;j++){
    var c=arr[j];var tooClose=false;
    for(var p=0;p<picked.length;p++){
      var pc=picked[p];
      if(Math.abs(pc.r-c.r)+Math.abs(pc.g-c.g)+Math.abs(pc.b-c.b)<60){tooClose=true;break;}
    }
    if(!tooClose)picked.push(c);
  }
  // Yeterli çeşitlilik yoksa kalanları da ekle.
  for(var j2=0;j2<arr.length&&picked.length<count;j2++){if(picked.indexOf(arr[j2])===-1)picked.push(arr[j2]);}
  return picked.map(function(c){return _rgbToHex(c.r,c.g,c.b);});
}


// SVG forma (önizleme ve listeler için) - desen: duz | dikey | yatay | yarim | bant | capraz
function formaSvg(a, b, desen, sortR, boy){
  boy = boy || 72; a = a || '#d8443a'; b = b || '#ffffff';
  var id = 'fm' + Math.random().toString(36).slice(2, 8), d = '';
  if(desen === 'dikey') for(var i = 0; i < 8; i++){ if(i % 2) d += '<rect x="' + (8 + i * 6) + '" y="0" width="6" height="64" fill="' + b + '"/>'; }
  else if(desen === 'yatay') for(var j = 0; j < 9; j++){ if(j % 2) d += '<rect x="0" y="' + (10 + j * 5.4) + '" width="64" height="5.4" fill="' + b + '"/>'; }
  else if(desen === 'yarim') d = '<rect x="32" y="0" width="32" height="64" fill="' + b + '"/>';
  else if(desen === 'bant') d = '<rect x="0" y="22" width="64" height="9" fill="' + b + '"/>';
  else if(desen === 'capraz') d = '<path d="M14 64 L22 64 L58 10 L50 10 Z" fill="' + b + '"/>';
  return '<svg viewBox="0 0 64 64" width="' + boy + '" height="' + boy + '" aria-hidden="true"><defs><clipPath id="' + id + '"><path d="M20 6 L8 14 L4 28 L14 30 L14 50 L50 50 L50 30 L60 28 L56 14 L44 6 L38 10 L26 10 Z"/></clipPath></defs>'
    + '<g clip-path="url(#' + id + ')"><rect width="64" height="64" fill="' + a + '"/>' + d + '</g>'
    + '<path d="M20 6 L8 14 L4 28 L14 30 L14 50 L50 50 L50 30 L60 28 L56 14 L44 6 L38 10 L26 10 Z" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>'
    + '<path d="M26 10 Q32 15 38 10" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.2"/>'
    + '<path d="M15 51 L49 51 L48 62 L34 62 L32 56 L30 62 L16 62 Z" fill="' + (sortR || '#24242a') + '" stroke="rgba(0,0,0,.35)" stroke-width="1"/></svg>';
}

// Kullanıcı tasarımı (sahaFormalar/{takım}) → lig takımı forma alanları. f yoksa takım olduğu gibi döner.
function ortakKitAlanlari(tk, f){
  tk = tk || {};
  if(!f || !f.ic) return tk;
  var o = Object.assign({}, tk);
  o.kitHome1 = f.ic.a || o.kitHome1; o.kitHome2 = f.ic.b || o.kitHome2; o.kitDesen = f.ic.desen || 'duz';
  if(f.dep){ o.kitAway1 = f.dep.a || o.kitAway1; o.kitAway2 = f.dep.b || o.kitAway2; o.kitAwayDesen = f.dep.desen || 'duz'; }
  o.kitShortsHome = f.ic.sort || f.sort || null; o.kitShortsAway = (f.dep && f.dep.sort) || f.sort || null;
  if(o.kitShortsHome) o.kitShorts = o.kitShortsHome;
  return o;
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   SAHA KİMLİK (2026-10-26-H · V1.4.0 yol haritası 1. hafta)
   Sorun: giriş anonimdi, kimlik addan türetiliyordu (v_azat_aslan) ve şifreler veritabanında
   düz metin duruyordu (userProfiles/{id}/password) - siteyi açan herkes okuyabiliyordu.
   Çözüm: her profile Firebase E-posta/Şifre hesabı bağlanır. Kullanıcı yine yalnızca ad ve
   şifre yazar; e-posta gizlidir ve profilden türetilir. Şifre Firebase'de saklanır, veritabanında
   tutulmaz. Eski hesaplar ilk girişte eski şifreyle bir kez doğrulanıp taşınır.
   Veri:  userProfiles/{profil}/authEposta · authSurum · authUid · authTs   (düz şifre silinir)
          kimlik/{authUid} = { p: profil, ts }                                (kurallar için bağ)
   Test ve kök ayrı hesaplar kullanır (e-posta ortamı da içerir) - test şifresi kökü etkilemez.
   Yönetici oturumu korunur: aynı tarayıcıda admin girişi varsa kullanıcı işlemleri ikincil bir
   Firebase uygulamasında yapılır; admin paneli oturumunu kaybetmez.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */
var SahaKimlik = (function(){
  var ALAN = 'saha-lig.app';
  // Küçük, bağımlılıksız SHA-256 (tüm cihazlarda aynı sonucu vermesi için tarayıcı API'sine bağlı değil).
  function sha256(ascii){
    function rr(v, n){ return (v >>> n) | (v << (32 - n)); }
    var K = [], H = [], i, j, isPrime = {}, c = 0, n;
    for(n = 2; c < 64; n++){ if(!isPrime[n]){ for(i = 0; i < 313; i += n) isPrime[i] = n; H[c] = (Math.pow(n, .5) * 4294967296) | 0; K[c++] = (Math.pow(n, 1/3) * 4294967296) | 0; } }
    H = H.slice(0, 8);
    var bytes = unescape(encodeURIComponent(ascii)), L = bytes.length * 8, words = [];
    bytes += '\x80'; while(bytes.length % 64 - 56) bytes += '\x00';
    for(i = 0; i < bytes.length; i++){ j = bytes.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = (L / 4294967296) | 0; words[words.length] = L;
    for(j = 0; j < words.length;){
      var w = words.slice(j, j += 16), old = H.slice(0);
      for(i = 0; i < 64; i++){
        var w15 = w[i - 15], w2 = w[i - 2], a = H[0], e = H[4];
        var t1 = H[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & H[5]) ^ (~e & H[6])) + K[i]
          + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
        H = [(t1 + t2) | 0].concat(H); H[4] = (H[4] + t1) | 0; H.length = 8;
      }
      for(i = 0; i < 8; i++) H[i] = (H[i] + old[i]) | 0;
    }
    var out = ''; for(i = 0; i < 8; i++) for(j = 3; j + 1; j--){ var b = (H[i] >> (j * 8)) & 255; out += (b < 16 ? '0' : '') + b.toString(16); }
    return out;
  }
  function ortam(){ try{ return (location.pathname.indexOf('/test/') !== -1 || window._sahaTestKopya) ? 'test' : 'kok'; }catch(e){ return 'kok'; } }
  function eposta(profil, surum){ return 'u' + sha256(ortam() + '|' + profil + '|' + (Number(surum) || 0)).slice(0, 32) + '@' + ALAN; }
  function sifre(pw){ return 'SAHA·' + String(pw == null ? '' : pw); }   // Firebase en az 6 karakter ister; eski 4 haneli şifreler de geçerli kalır
  function sentetikMi(u){ return !!(u && u.email && /@saha-lig\.app$/i.test(u.email)); }
  function varsayilan(){ try{ return firebase.auth(); }catch(e){ return null; } }
  function adminOturumuMu(){ var a = varsayilan(), u = a && a.currentUser; return !!(u && !u.isAnonymous && !sentetikMi(u)); }
  var _ik = null;
  function ikincil(){
    if(_ik) return _ik;
    var app; try{ app = firebase.app('sahaKimlik'); }catch(e){ app = firebase.initializeApp(firebase.app().options, 'sahaKimlik'); }
    _ik = app.auth();
    try{ _ik.setPersistence(firebase.auth.Auth.Persistence.NONE); }catch(e){}
    return _ik;
  }
  // Kullanıcı işlemlerinin yapılacağı kimlik nesnesi: normalde varsayılan uygulama (veritabanı da bu
  // kimlikle çalışır); aynı tarayıcıda yönetici oturumu varsa ikincil uygulama.
  function hedef(){ return adminOturumuMu() ? ikincil() : varsayilan(); }
  function hataKodu(e){ return String((e && e.code) || (e && e.message) || 'bilinmeyen'); }
  function agHatasi(e){ return /network|timeout|unavailable|too-many/i.test(hataKodu(e)); }
  function sure(p, ms){ return Promise.race([p, new Promise(function(_, r){ setTimeout(function(){ r({ code:'auth/timeout' }); }, ms || 15000); })]); }
  function bagla(ref, profil, uid, eposta0, surum){
    var simdi = Date.now();
    // SIRA ÖNEMLİ (2. hafta kuralları): kimlik bağı yalnızca profilde bu hesabın e-postası yazılıysa kabul edilir;
    // önce profil, sonra bağ yazılır.
    return ref('userProfiles/' + profil).update({ authEposta:eposta0, authSurum:Number(surum) || 0, authUid:uid, authTs:simdi, password:null })
      .then(function(){ return ref('kimlik/' + uid).set({ p:profil, ts:simdi }); });
  }
  // Mevcut (taşınmış) hesapla giriş. Sonuç: {durum:'ok'|'hatali'|'ag', uid}
  function giris(ref, profil, pw, kayit){
    var a = hedef(), e0 = kayit && kayit.authEposta;
    if(!a || !e0) return Promise.resolve({ durum:'hatali' });
    return sure(a.signInWithEmailAndPassword(e0, sifre(pw))).then(function(c){
      var uid = c && c.user && c.user.uid;
      // kimlik bağı her girişte tazelenir (başka cihazda silinmiş/kopyalanmış olabilir)
      // Sıra: önce bağ (profildeki e-postayla doğrulanır), sonra profildeki authUid (sahiplik bağdan okunur).
      return ref('kimlik/' + uid).set({ p:profil, ts:Date.now() })
        .then(function(){ if(!(kayit && kayit.authUid === uid)) return ref('userProfiles/' + profil + '/authUid').set(uid); })
        .then(function(){ return { durum:'ok', uid:uid, sifreYenile:!!(kayit && kayit.sifreYenile) }; }, function(){ return { durum:'ok', uid:uid, sifreYenile:!!(kayit && kayit.sifreYenile) }; });
    }, function(e){ return { durum: agHatasi(e) ? 'ag' : 'hatali', kod:hataKodu(e) }; });
  }
  // Yeni hesap aç (eski şifreden taşıma, ilk şifre ya da geçici şifre sonrası yeni şifre).
  // E-posta kullanılıyorsa önce aynı şifreyle giriş denenir (başka cihazda açılmış olabilir), olmazsa sürüm artırılır.
  function olustur(ref, profil, pw, kayit, ilkSurum){
    var a = hedef(); if(!a) return Promise.reject({ code:'auth/sdk-yok' });
    var surum = Math.max(Number(ilkSurum) || 0, Number(kayit && kayit.authSurum) || 0);
    function dene(s, kalan){
      var e0 = eposta(profil, s);
      return sure(a.createUserWithEmailAndPassword(e0, sifre(pw))).then(function(c){ return { c:c, e0:e0, s:s }; }, function(e){
        if(hataKodu(e).indexOf('email-already-in-use') === -1 || kalan <= 0) throw e;
        return sure(a.signInWithEmailAndPassword(e0, sifre(pw))).then(function(c){ return { c:c, e0:e0, s:s }; }, function(e2){
          if(agHatasi(e2)) throw e2;
          return dene(s + 1, kalan - 1);
        });
      });
    }
    return dene(surum, 6).then(function(r){
      var uid = r.c && r.c.user && r.c.user.uid;
      return bagla(ref, profil, uid, r.e0, r.s).then(function(){ return { durum:'ok', uid:uid, eposta:r.e0, surum:r.s }; });
    });
  }
  // YÖNETİCİ SIFIRLAMASI (2. hafta): şifresini unutan taşınmış kullanıcı için yönetici geçici şifreyle YENİ bir hesap açar
  // (ikincil uygulamada - yönetici oturumu değişmez), profili ve bağı ona çevirir, eski bağı siler. Kullanıcı geçici şifreyle
  // normal girer; profilde sifreYenile işareti olduğu için hemen yeni şifresini belirler. Kurallar yalnızca yöneticiye izin verir.
  function yoneticiSifirla(ref, profil, geciciPw, kayit){
    var a = ikincil(), eskiUid = kayit && kayit.authUid, surum = (Number(kayit && kayit.authSurum) || 0) + 1;
    function dene(s, kalan){
      var e0 = eposta(profil, s);
      return sure(a.createUserWithEmailAndPassword(e0, sifre(geciciPw))).then(function(c){ return { c:c, e0:e0, s:s }; }, function(e){
        if(hataKodu(e).indexOf('email-already-in-use') === -1 || kalan <= 0) throw e;
        return dene(s + 1, kalan - 1);
      });
    }
    return dene(surum, 6).then(function(r){
      var uid = r.c.user.uid, simdi = Date.now();
      try{ a.signOut(); }catch(e){}
      return ref('userProfiles/' + profil).update({ authEposta:r.e0, authSurum:r.s, authUid:uid, authTs:simdi, sifreYenile:true, tempPassword:geciciPw, password:null })
        .then(function(){ return ref('kimlik/' + uid).set({ p:profil, ts:simdi }); })
        .then(function(){ if(eskiUid && eskiUid !== uid) return ref('kimlik/' + eskiUid).remove(); })
        .then(function(){ return { uid:uid, eposta:r.e0, surum:r.s }; });
    });
  }
  // Geçici şifreyle girdikten sonra yeni şifre (oturum bu hesapta açık).
  function yeniSifreBelirle(ref, profil, geciciPw, yeniPw, kayit){
    return sifreDegistir(ref, profil, geciciPw, yeniPw, kayit).then(function(){ return ref('userProfiles/' + profil).update({ sifreYenile:null }); });
  }
  // Oturum açıkken şifre değiştir (mevcut şifre ile yeniden doğrulanır).
  function sifreDegistir(ref, profil, eskiPw, yeniPw, kayit){
    var a = hedef(), e0 = kayit && kayit.authEposta;
    if(!a || !e0) return Promise.reject({ code:'auth/tasinmamis' });
    return sure(a.signInWithEmailAndPassword(e0, sifre(eskiPw))).then(function(c){
      return c.user.updatePassword(sifre(yeniPw));
    }).then(function(){ return ref('userProfiles/' + profil).update({ authTs:Date.now(), password:null, tempPassword:null }); });
  }
  // Bu tarayıcıdaki oturum bu profile mi ait? (SAHA'da "beni hatırla" şifresiz giriş)
  function oturumBuProfil(kayit){ var a = varsayilan(), u = a && a.currentUser; return !!(u && kayit && kayit.authEposta && sentetikMi(u) && u.email === kayit.authEposta); }
  // Çıkış: kullanıcı hesabı kapatılır, veritabanı bağlantısı için anonim oturuma dönülür. Yönetici oturumuna dokunulmaz.
  function cikis(){
    var a = varsayilan(), u = a && a.currentUser;
    try{ if(_ik && _ik.currentUser) _ik.signOut(); }catch(e){}
    if(!u || !sentetikMi(u)) return Promise.resolve();
    return a.signOut().then(function(){ return a.signInAnonymously(); }).catch(function(){});
  }
  return { eposta:eposta, sifre:sifre, sha256:sha256, ortam:ortam, sentetikMi:sentetikMi, adminOturumuMu:adminOturumuMu,
           giris:giris, olustur:olustur, sifreDegistir:sifreDegistir, yoneticiSifirla:yoneticiSifirla, yeniSifreBelirle:yeniSifreBelirle, oturumBuProfil:oturumBuProfil, cikis:cikis };
})();
/* ═══ ZORUNLU GÜNCELLEME (2026-10-30-A, V1.4.0) ══════════════════════════════════════════════════════════════════
   Yönetici admin panelinden globalConfig/minSurum = { build:'YYYY-AA-GG-H', mesaj, ts } yazar. Yüklü sürümü (APP_BUILD) bundan
   eski olan Puan Tablosu, SAHA ve admin ekranı "Güncelle" ekranı gösterir. Güncelle: medya dışındaki önbellekleri siler, servis
   çalışanını yeniler, sayfayı ağdan zorla çekip yeniden yükler. secenek.ertele() true döndükçe (ör. SAHA'da maç sürerken) ekran
   açılmaz, 5 sn'de bir yeniden bakılır. secenek.gecilebilir: "Şimdilik geç" düğmesi (yalnızca yönetici paneli). */
var SahaGuncelleme = (function(){
  function parca(b){ var m = /^(\d{4}-\d{2}-\d{2})-([A-Z]+)$/.exec(String(b || '').trim()); return m ? { t:m[1], h:m[2] } : null; }
  // -1: a eski, 0: aynı ya da okunamadı, 1: a yeni. Harfler A..Z, sonra AA, AB ... (uzun olan yenidir).
  function karsilastir(a, b){
    var x = parca(a), y = parca(b); if(!x || !y) return 0;
    if(x.t !== y.t) return x.t < y.t ? -1 : 1;
    if(x.h.length !== y.h.length) return x.h.length < y.h.length ? -1 : 1;
    return x.h < y.h ? -1 : (x.h > y.h ? 1 : 0);
  }
  var _minYonetici = null, _sunucu = null, _min = null, _ov = null, _gecildi = null, _bekZ = 0, _o = {};
  /* SUNUCUDAKİ SÜRÜM (2026-10-30-C, kullanıcı: "az önce yüklediğin dosya için hiçbir uygulama güncelleme istemedi"). KÖK SEBEP:
     ekran yalnızca yönetici admin panelinden "en düşük sürüm" yazınca açılıyordu; dosya yüklemek tek başına hiçbir şeyi
     tetiklemiyordu. ŞİMDİ: her uygulama, yanındaki surum.json dosyasına (GitHub her yüklemede dosyaların içindeki
     APP_BUILD'den kendiliğinden üretir) açılışta, 10 dakikada bir ve uygulamaya geri dönüldüğünde bakar; sunucudaki
     sürümü kendisininkinden yeniyse aynı güncelleme ekranını gösterir. Yöneticinin elle yazdığı en düşük sürüm de geçerli.
     Önbellek eski dosyayı verirse sonsuz döngü olmasın diye aynı hedef için güncelleme 3 dakikada bir denenir. */
  function hedefHesapla(){
    var a = _minYonetici, b = _sunucu ? { build:_sunucu, mesaj:'' } : null;
    _min = !a ? b : (!b ? a : (karsilastir(a.build, b.build) >= 0 ? a : b));
  }
  function sunucuIzle(dosya){
    if(!dosya || !window.fetch) return;
    var bak = function(){
      try{
        if(document.hidden) return;
        fetch(new URL('surum.json?t=' + Date.now(), location.href).href, { cache:'no-store' })
          .then(function(r){ return r.ok ? r.json() : null; })
          .then(function(j){
            var b = j && j[dosya]; if(!b || karsilastir(window.APP_BUILD, b) >= 0){ if(_sunucu){ _sunucu = null; hedefHesapla(); goster(); } return; }
            var son = 0; try{ son = Number(sessionStorage.getItem('sg-denendi-' + b)) || 0; }catch(e){}
            if(Date.now() - son < 180000) return;       // az önce bu sürüme güncellendi ama önbellek eskiyi verdi: biraz bekle
            _sunucu = String(b); hedefHesapla(); goster();
          }).catch(function(){});
      }catch(e){}
    };
    setTimeout(bak, 1200); setInterval(bak, 600000);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) bak(); });
  }
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function guncelle(){
    try{ var b = document.getElementById('sgGuncelleDug'); if(b){ b.disabled = true; b.textContent = 'Güncelleniyor…'; } }catch(e){}
    try{ if(_min) sessionStorage.setItem('sg-denendi-' + _min.build, String(Date.now())); }catch(e){}
    var isler = [];
    try{ if(window.caches) isler.push(caches.keys().then(function(ad){ return Promise.all(ad.filter(function(k){ return k.indexOf('saha-medya-') !== 0; }).map(function(k){ return caches.delete(k); })); })); }catch(e){}
    try{ if(navigator.serviceWorker) isler.push(navigator.serviceWorker.getRegistrations().then(function(r){ return Promise.all(r.map(function(x){ return x.update().catch(function(){}); })); })); }catch(e){}
    try{ isler.push(fetch(location.href, { cache:'reload', credentials:'same-origin' }).catch(function(){})); }catch(e){}
    var bitti = false, git = function(){ if(bitti) return; bitti = true; try{ location.reload(); }catch(e){} };
    Promise.all(isler.map(function(p){ return Promise.resolve(p).catch(function(){}); })).then(git, git);
    setTimeout(git, 6000);
  }
  function kaldir(){ if(_ov){ try{ _ov.remove(); }catch(e){} _ov = null; } }
  /* GİRİŞ EKRANI BANDI (2026-10-30-E, kullanıcı: "yeni güncelleme mevcut olduğunda kullanıcı SAHA'da, Puan Tablosu'nda ve admin
     panelinde isim ve şifre girmeden önce giriş ekranında bunu görmeli ve indirebilmelidir"). Giriş ekranı açıkken (secenek.giris()
     true) tam ekran yerine üstte bir bant çıkar: yeni sürüm ve "Güncelle" düğmesi. Giriş yapılınca bant kalkar, güncelleme ekranı gelir. */
  var _bant = null, _bantZ = 0;
  function bantKaldir(){ if(_bant){ try{ _bant.remove(); }catch(e){} _bant = null; } }
  function bantGoster(){
    if(!_bant){ _bant = document.createElement('div'); _bant.id = 'sahaGuncelleBant'; document.body.appendChild(_bant); }
    _bant.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:2147483500;display:flex;align-items:center;gap:10px;flex-wrap:wrap;'
      + 'padding:calc(10px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) 10px max(14px,env(safe-area-inset-left,0px));'
      + 'background:#14301d;color:#eef2ee;border-bottom:1px solid rgba(255,255,255,.14);box-shadow:0 6px 20px rgba(0,0,0,.35);font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif';
    _bant.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#7ee0a0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex:none"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>'
      + '<div style="flex:1;min-width:160px"><b style="display:block;font-size:14.5px">Yeni sürüm mevcut</b><span style="font-size:12.5px;opacity:.75">' + esc(_min.build) + (_min.mesaj ? ' · ' + esc(_min.mesaj) : ' · giriş yapmadan önce güncelleyebilirsin') + '</span></div>'
      + '<button id="sgBantDug" type="button" style="min-height:40px;padding:0 18px;border:0;border-radius:999px;background:#3f8a45;color:#fff;font-weight:800;font-size:14px;cursor:pointer">Güncelle</button>';
    _bant.querySelector('#sgBantDug').onclick = function(){ this.disabled = true; this.textContent = 'Güncelleniyor…'; guncelle(); };
    // Üstte sabit bir şerit (ör. test ortamı uyarısı) varsa bant onun altına iner.
    try{ var ust = 0; [].forEach.call(document.body.children, function(e){ if(e === _bant) return; var cs = getComputedStyle(e);
      if((cs.position === 'fixed' || cs.position === 'sticky') && cs.display !== 'none'){ var r = e.getBoundingClientRect(); if(r.top <= 1 && r.height > 0 && r.height < 60 && r.width > innerWidth * 0.8) ust = Math.max(ust, r.bottom); } });
      if(ust) _bant.style.top = ust + 'px'; }catch(e){}
  }
  function goster(){
    if(!_min || karsilastir(window.APP_BUILD, _min.build) >= 0 || _gecildi === _min.build){ kaldir(); bantKaldir(); return; }
    var giriste = false; try{ giriste = !!(_o.giris && _o.giris()); }catch(e){}
    if(!_bantZ) _bantZ = setInterval(function(){ if(_min) goster(); }, 1500);   // giriş durumu değişince bant ↔ ekran
    if(giriste){ kaldir(); if(!_bant || _bant._hedef !== _min.build){ bantGoster(); _bant._hedef = _min.build; } return; }
    bantKaldir();
    if(_ov && _ov._hedef === _min.build) return;                                 // ekran zaten açık (yeniden çizilmez)
    try{ if(_o.ertele && _o.ertele()){ if(!_bekZ) _bekZ = setTimeout(function(){ _bekZ = 0; goster(); }, 5000); return; } }catch(e){}
    if(!_ov){ _ov = document.createElement('div'); _ov.id = 'sahaGuncelleEkran'; document.body.appendChild(_ov); }
    _ov._hedef = _min.build;
    _ov.style.cssText = 'position:fixed;inset:0;z-index:2147483600;display:flex;align-items:center;justify-content:center;padding:20px;'
      + 'background:rgba(6,12,9,.94);color:#eef2ee;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center';
    _ov.innerHTML = '<div style="max-width:380px;width:100%">'
      + '<div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:#3f8a45;display:flex;align-items:center;justify-content:center">'
      + '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg></div>'
      + '<div style="font-size:21px;font-weight:900;margin-bottom:8px">Yeni sürüm yayında</div>'
      + '<div style="font-size:14px;line-height:1.55;opacity:.85;margin-bottom:6px">' + (_min.mesaj ? esc(_min.mesaj) : 'Uygulamanın yeni sürümü yüklendi. Devam etmek için güncelle; birkaç saniye sürer.') + '</div>'
      + '<div style="font-size:12px;opacity:.6;margin-bottom:18px">Yüklü: ' + esc(window.APP_BUILD || '?') + ' · Gerekli: ' + esc(_min.build) + '</div>'
      + '<button id="sgGuncelleDug" type="button" style="width:100%;min-height:48px;border:0;border-radius:14px;background:#3f8a45;color:#fff;font-size:16px;font-weight:800;cursor:pointer">Şimdi güncelle</button>'
      + (_o.gecilebilir ? '<button id="sgGecDug" type="button" style="width:100%;min-height:44px;margin-top:10px;border:1px solid rgba(255,255,255,.25);border-radius:14px;background:transparent;color:#eef2ee;font-size:14px;font-weight:700;cursor:pointer">Şimdilik geç (yönetici)</button>' : '')
      + '<div style="font-size:11.5px;opacity:.55;margin-top:14px;line-height:1.5">Güncelleme birkaç saniye sürer; hesabın ve takımın etkilenmez.</div></div>';
    _ov.querySelector('#sgGuncelleDug').onclick = guncelle;
    var g = _ov.querySelector('#sgGecDug'); if(g) g.onclick = function(){ _gecildi = _min.build; kaldir(); };
  }
  // refFn: uygulamanın kendi (test/ önekini ekleyen) ref işlevi. Oturum açılmadan okuma reddedilirse yeniden denenir.
  function baslat(refFn, secenek){
    _o = secenek || {}; var deneme = 0;
    var kur = function(){
      try{
        refFn('globalConfig/minSurum').on('value', function(sn){
          var v = sn.val(); var b = v ? (typeof v === 'string' ? v : v.build) : null;
          _minYonetici = b ? { build:String(b), mesaj:(v && v.mesaj) || '' } : null; hedefHesapla(); goster();
        }, function(){ deneme++; if(deneme <= 40) setTimeout(kur, Math.min(15000, 1500 * deneme)); });
      }catch(e){ deneme++; if(deneme <= 40) setTimeout(kur, Math.min(15000, 1500 * deneme)); }
    };
    kur();
    try{ sunucuIzle(_o.dosya); }catch(e){}
  }
  return { karsilastir:karsilastir, baslat:baslat, guncelle:guncelle, durum:function(){ return _min; } };
})();
/* ═══ DOSYA YÜKLEME (2026-10-30-B) ═════════════════════════════════════════════════════════════════════════════
   SAHA geri bildirimine fotoğraf/video eklemek için (Puan Tablosu'ndaki uploadImageToSupabase/uploadVideoToSupabase ile
   aynı Supabase deposu ve aynı yol: videos/feedback/...). Ham XMLHttpRequest: gerçek yükleme yüzdesi okunur. Fotoğraf
   tuvalle küçültülüp JPEG'e çevrilir (sonuç sınırı aşarsa kalite düşürülerek yeniden denenir). Hepsi Promise döndürür. */
var SahaYukleme = (function(){
  var URLK = 'https://oasyhelzshbehnpyrssw.supabase.co', ANAHTAR = 'sb_publishable_DxSYVhhxvfVw_yAA7xkS6A_s1Usv41C', KOVA = 'videos';
  function yolAdi(klasor, uzanti){ return (klasor || 'genel') + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + uzanti; }
  function gonder(blob, yol, tur, ilerleme){
    return new Promise(function(coz, red){
      var x = new XMLHttpRequest(), acik = URLK + '/storage/v1/object/public/' + KOVA + '/' + yol, bitti = false;
      var son = function(e, u){ if(bitti) return; bitti = true; clearTimeout(z); e ? red(e) : coz(u); };
      var z = setTimeout(function(){ try{ x.abort(); }catch(e){} son(new Error('sunucu yanıt vermedi, tekrar dene')); }, 240000);
      x.open('POST', URLK + '/storage/v1/object/' + KOVA + '/' + yol, true);
      x.setRequestHeader('Authorization', 'Bearer ' + ANAHTAR); x.setRequestHeader('apikey', ANAHTAR);
      x.setRequestHeader('Content-Type', tur); x.setRequestHeader('x-upsert', 'false');
      if(x.upload && ilerleme){
        x.upload.onprogress = function(e){ if(e.lengthComputable) try{ ilerleme(e.loaded / e.total); }catch(_e){} };
        x.upload.onloadend = function(){ try{ ilerleme(1); }catch(_e){}
          // Yanıt kaybolursa (mobil ağ) dosya sunucuda mı diye bakılır; oradaysa başarılı sayılır.
          setTimeout(function dene(){ if(bitti) return; fetch(acik, { method:'HEAD', cache:'no-store' }).then(function(r){ if(r.ok){ try{ x.abort(); }catch(e){} son(null, acik); } else setTimeout(dene, 15000); }, function(){ setTimeout(dene, 15000); }); }, 45000); };
      }
      x.onload = function(){ if(x.status >= 200 && x.status < 300) son(null, acik);
        else { var m = 'Yükleme başarısız (HTTP ' + x.status + ')'; try{ var j = JSON.parse(x.responseText); if(j && j.message) m = j.message; }catch(e){} son(new Error(m)); } };
      x.onerror = function(){ son(new Error('bağlantı hatası, internetini kontrol et')); };
      x.onabort = function(){ son(new Error('yükleme iptal edildi')); };
      x.send(blob);
    });
  }
  // HEIC/HEIF (iPhone): tarayıcı açamazsa Puan Tablosu'ndaki aynı dönüştürücü (heic2any) yüklenip JPEG'e çevrilir.
  var _heicBek = null;
  function heicKutuphane(){
    if(window.heic2any) return Promise.resolve();
    if(_heicBek) return _heicBek;
    return (_heicBek = new Promise(function(coz, red){
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
      s.onload = function(){ window.heic2any ? coz() : red(new Error('dönüştürücü yüklenemedi')); };
      s.onerror = function(){ _heicBek = null; red(new Error('dönüştürücü indirilemedi (internetini kontrol et)')); };
      document.head.appendChild(s);
    }));
  }
  function heicCevir(dosya){
    return heicKutuphane().then(function(){ return window.heic2any({ blob:dosya, toType:'image/jpeg', quality:.9 }); })
      .then(function(c){ return Array.isArray(c) ? c[0] : c; });
  }
  function resim(dosya, klasor, o){
    o = o || {};
    if(dosya && (/\.(heic|heif)$/i.test(dosya.name || '') || /image\/hei[cf]/i.test(dosya.type || '')) && !o._cevrildi){
      return heicCevir(dosya).then(function(b){ return resim(b, klasor, Object.assign({}, o, { _cevrildi:true })); },
        function(){ return resim(dosya, klasor, Object.assign({}, o, { _cevrildi:true })); });   // dönüştürücü yoksa tarayıcı denensin
    }
    return new Promise(function(coz, red){
      if(!dosya) return red(new Error('Dosya seçilmedi'));
      if(!(dosya.type || '').match(/^image\//) && !/\.(jpe?g|png|gif|webp|bmp|heic|heif|avif)$/i.test(dosya.name || '')) return red(new Error((dosya.name || 'Dosya') + ' bir resim değil'));
      if(dosya.size > 60 * 1048576) return red(new Error('Fotoğraf çok büyük (en fazla 60 MB)'));
      var u = URL.createObjectURL(dosya), img = new Image();
      img.onload = function(){
        URL.revokeObjectURL(u);
        var en = o.maxDim || 900, k = Math.min(1, en / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var sinir = (o.maxMB || 15) * 1048576;
        var kodla = function(q, n){ c.toBlob(function(b){
          if(!b) return red(new Error('Fotoğraf işlenemedi'));
          if(b.size > sinir && n < 3) return kodla(Math.max(.4, q - .18), n + 1);
          if(b.size > sinir) return red(new Error('Fotoğraf küçültüldükten sonra bile çok büyük'));
          gonder(b, yolAdi(klasor, 'jpg'), 'image/jpeg', o.ilerleme).then(coz, red);
        }, 'image/jpeg', q); };
        kodla(o.quality || .78, 0);
      };
      img.onerror = function(){ URL.revokeObjectURL(u); red(new Error((dosya.name || 'Fotoğraf') + ' açılamadı; JPEG ya da PNG dene')); };
      img.src = u;
    });
  }
  function video(dosya, klasor, o){
    o = o || {};
    return new Promise(function(coz, red){
      if(!dosya || !(dosya.type || '').match(/^video\//)) return red(new Error('Geçerli bir video seçilmedi'));
      var mb = o.maxMB || 50; if(dosya.size > mb * 1048576) return red(new Error('Video en fazla ' + mb + ' MB olabilir'));
      var uz = ((dosya.name || '').split('.').pop() || 'mp4').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6) || 'mp4';
      var yukle = function(){ gonder(dosya, yolAdi(klasor, uz), dosya.type, o.ilerleme).then(coz, red); };
      if(!o.maxSn) return yukle();
      var v = document.createElement('video'); v.preload = 'metadata';
      v.onloadedmetadata = function(){ URL.revokeObjectURL(v.src); if(v.duration > o.maxSn) return red(new Error('Video en fazla ' + o.maxSn + ' saniye olabilir')); yukle(); };
      v.onerror = function(){ red(new Error('Video okunamadı, başka bir video dene')); };
      v.src = URL.createObjectURL(dosya);
    });
  }
  return { resim:resim, video:video };
})();
/* ═══ YENİLİKLER + GERİ BİLDİRİM (2026-10-30-E, kullanıcı: "Puan Tablosu ve SAHA'daki yenilikler, geri bildirim sistemi ve
   ikonlar tamamen aynı olmalı; ikon olarak sahadakiler kullanılabilir"). İki uygulama da bu tek bileşeni çağırır: aynı pencere,
   aynı düzen, aynı SAHA ikonları (SahaIkon yazı tipi, U+E9xx). Veri kaynağı ve yazılacak yol uygulamadan gelir:
   SahaDestek.yenilikler({ surumler:[{v,date,notes}], yuklu:'V1.4.0 (…)', geriBildirim:fn, ek:html, acildi:fn })
   SahaDestek.geriBildirim({ gonder:function(veri){→Promise}, gecmis:function(){→Promise<[...]>}, klasor:'feedback/…', aciklama }) */
var SahaDestek = (function(){
  var IK = { yeni:'', gb:'', hata:'', oneri:'', diger:'', tasarim:'', iyi:'', foto:'', video:'', gonder:'', bos:'' };
  function esc(t){ return String(t == null ? '' : t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function stil(){
    if(document.getElementById('sahaDestekStil')) return;
    var st = document.createElement('style'); st.id = 'sahaDestekStil';
    st.textContent = '.sd-ort{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(4,9,6,.72);backdrop-filter:blur(3px)}'
      + '.sd-kart{width:100%;max-width:460px;max-height:min(88vh,760px);display:flex;flex-direction:column;overflow:hidden;background:#111a15;color:#eef2ee;border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.5);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:left}'
      + '.sd-bas{display:flex;align-items:center;gap:10px;padding:13px 14px 13px 16px;border-bottom:1px solid rgba(255,255,255,.1)}'
      + '.sd-ik{width:36px;height:36px;border-radius:11px;flex:none;display:flex;align-items:center;justify-content:center;font-size:19px;background:linear-gradient(150deg,#3f8a45,#2c6e33);color:#fff}'
      + '.sd-bas b{flex:1;font-size:17px;font-weight:900}'
      + '.sd-kapat{width:40px;height:40px;border-radius:50%;border:0;background:rgba(255,255,255,.08);color:inherit;font-size:22px;cursor:pointer}'
      + '.sd-gov{padding:14px 16px 18px;overflow:auto}'
      + '.sd-aciklama{font-size:13px;opacity:.75;line-height:1.55;margin-bottom:12px}'
      + '.sd-et{font-size:12px;font-weight:800;opacity:.6;text-transform:uppercase;letter-spacing:.06em;margin:12px 0 6px}'
      + '.sd-bosk{text-align:center;opacity:.65;padding:18px 8px;font-size:13px;line-height:1.7}'
      + '.sd-satir{width:100%;display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 12px;margin-bottom:6px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:inherit;font:inherit;cursor:pointer;text-align:left}'
      + '.sd-v{background:linear-gradient(135deg,#3f8a45,#2c6e33);color:#fff;border-radius:8px;padding:3px 9px;font-size:13px;font-weight:800;flex:none}'
      + '.sd-ad{flex:1;font-weight:700}.sd-ok{opacity:.5;font-size:18px}'
      + '.sd-ust{display:flex;align-items:center;gap:10px;margin-bottom:8px}.sd-t{font-size:12px;opacity:.6}'
      + '.sd-liste{list-style:none;padding:0;margin:0}.sd-liste li{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.08);line-height:1.5}'
      + '.sd-kat{flex:none;width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;background:rgba(255,255,255,.06)}'
      + '.sd-kat-et{display:block;font-size:11px;font-weight:800;letter-spacing:.03em;margin-bottom:1px}'
      + '.sd-dug{width:100%;min-height:46px;margin-top:12px;border:0;border-radius:12px;background:#3f8a45;color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}'
      + '.sd-dug.ikincil{background:rgba(255,255,255,.08);color:inherit;border:1px solid rgba(255,255,255,.16)}'
      + '.sd-surum{text-align:center;font-size:12px;opacity:.6;margin-top:12px}'
      + '.sd-turler{display:flex;gap:6px}.sd-cip{flex:1;min-height:40px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;color:inherit;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px}'
      + '.sd-cip.on{background:#3f8a45;border-color:transparent;color:#fff}'
      + '.sd-metin{width:100%;box-sizing:border-box;border-radius:12px;padding:10px;font:inherit;font-size:14px;background:rgba(255,255,255,.06);color:inherit;border:1px solid rgba(255,255,255,.18);resize:vertical}'
      + '.sd-ekle{display:flex;gap:8px;margin:10px 0 6px}.sd-ekle .sd-dug{margin:0;flex:1;min-height:42px;font-size:14px}'
      + '.sd-gizli{position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none}'
      + '.sd-medya{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px}'
      + '.sd-med{position:relative;width:76px;height:76px;border-radius:10px;overflow:hidden;background:#000}.sd-med img,.sd-med video{width:100%;height:100%;object-fit:cover}'
      + '.sd-med button{position:absolute;top:3px;right:3px;width:26px;height:26px;border-radius:50%;border:0;background:rgba(0,0,0,.65);color:#fff;font-size:16px;cursor:pointer}'
      + '.sd-ilerle{width:100%;display:grid;grid-template-columns:1fr auto;gap:4px 8px;font-size:12px;background:rgba(255,255,255,.06);border-radius:10px;padding:8px 10px}'
      + '.sd-ilerle i{grid-column:1/3;height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden}.sd-ilerle b{display:block;height:100%;background:#3f8a45}.sd-ilerle em{font-style:normal;opacity:.7}'
      + '.sd-gecmis{background:rgba(255,255,255,.05);border-radius:12px;padding:10px 12px;margin-bottom:8px;font-size:13px;line-height:1.5}'
      + '.sd-g-ust{display:flex;align-items:center;gap:8px}.sd-g-ust span{flex:1;opacity:.55;font-size:12px}'
      + '.sd-g-ust em{font-style:normal;font-size:11px;font-weight:800;padding:2px 8px;border-radius:999px;background:rgba(245,194,107,.18);color:#f5c26b}'
      + '.sd-g-ust em.inc{background:rgba(96,165,250,.18);color:#93c5fd}.sd-g-ust em.yan{background:rgba(74,222,128,.18);color:#86efac}'
      + '.sd-g-metin{margin-top:4px;overflow-wrap:anywhere}.sd-g-ek{font-size:12px;opacity:.6;margin-top:3px}'
      + '.sd-g-yanit{margin-top:6px;padding:8px 10px;border-radius:10px;background:rgba(74,222,128,.1);border-left:3px solid #4ade80}'
      + '.sd-dug:focus-visible,.sd-cip:focus-visible,.sd-satir:focus-visible,.sd-kapat:focus-visible{outline:2px solid #7ee0a0;outline-offset:2px}';
    document.head.appendChild(st);
  }
  function pencere(id, ik, baslik, icerik){
    stil();
    var el = document.getElementById(id);
    if(!el){ el = document.createElement('div'); el.id = id; document.body.appendChild(el); }
    el.className = 'sd-ort'; el.style.display = 'flex';
    el.innerHTML = '<div class="sd-kart" role="dialog" aria-modal="true"><div class="sd-bas"><span class="sd-ik">' + ik + '</span><b>' + esc(baslik) + '</b>'
      + '<button type="button" class="sd-kapat" aria-label="Kapat">×</button></div><div class="sd-gov">' + icerik + '</div></div>';
    var kapat = function(){ el.style.display = 'none'; el.innerHTML = ''; };
    el.querySelector('.sd-kapat').onclick = kapat;
    el.onclick = function(ev){ if(ev.target === el) kapat(); };
    el._kapat = kapat;
    return el;
  }
  function kategori(n){
    var t = String(n || '').toLocaleLowerCase('tr');
    if(/düzeltildi|hata|sorun|bozuk|çalışmıyor|kaybol/.test(t)) return { ik:IK.hata, ad:'Hata Düzeltmesi', r:'#f87171' };
    if(/tasarım|görünüm|renk|stil|ikon/.test(t)) return { ik:IK.tasarim, ad:'Tasarım', r:'#a78bfa' };
    if(/eklendi|sistemi|özelliği/.test(t)) return { ik:IK.yeni, ad:'Yeni Özellik', r:'#4ade80' };
    return { ik:IK.iyi, ad:'İyileştirme', r:'#60a5fa' };
  }
  var _Y = null;
  function detay(i){
    var o = _Y || {}, V = o.surumler || [], x = V[i]; if(!x) return;
    var g = '<div class="sd-ust"><span class="sd-v">' + esc(x.v) + '</span><span class="sd-t">' + esc(x.date || '') + (i === 0 ? ' · güncel sürüm' : '') + '</span></div>'
      + '<ul class="sd-liste">' + (x.notes || []).map(function(n){ var k = kategori(n);
        return '<li><span class="sd-kat" style="color:' + k.r + '">' + k.ik + '</span><span><span class="sd-kat-et" style="color:' + k.r + '">' + k.ad + '</span>' + esc(n) + '</span></li>'; }).join('') + '</ul>'
      + (V.length > 1 ? '<button type="button" class="sd-dug ikincil" data-sd="liste">Bütün sürümler</button>' : '');
    var el = pencere('sahaDestekYenilik', IK.yeni, 'Yenilikler', g);
    var b = el.querySelector('[data-sd="liste"]'); if(b) b.onclick = function(){ yenilikler(o); };
  }
  function yenilikler(o){
    _Y = o = o || {};
    var V = o.surumler || [];
    var g = V.length ? '<div class="sd-aciklama">Bir sürüme dokunarak güncelleme notlarını gör.</div>' + V.map(function(x, i){
        return '<button type="button" class="sd-satir" data-i="' + i + '"><span class="sd-v">' + esc(x.v) + '</span><span class="sd-ad">'
          + (i === 0 ? 'En son sürüm' : esc((x.date || '') + ' sürümü')) + '</span><span class="sd-ok">›</span></button>'; }).join('')
      : '<div class="sd-bosk">' + IK.bos + ' Henüz sürüm notu eklenmemiş.<br><small>Yeni özellikler ve düzeltmeler burada listelenecek.</small></div>';
    if(o.geriBildirim) g += '<button type="button" class="sd-dug" data-sd="gb">' + IK.gb + ' Geri Bildirim Gönder</button>';
    g += (o.ek || '') + (o.yuklu ? '<div class="sd-surum">Yüklü sürüm: <b>' + esc(o.yuklu) + '</b></div>' : '');
    var el = pencere('sahaDestekYenilik', IK.yeni, 'Yenilikler', g);
    el.querySelectorAll('.sd-satir[data-i]').forEach(function(b){ b.onclick = function(){ detay(+b.getAttribute('data-i')); }; });
    var gb = el.querySelector('[data-sd="gb"]'); if(gb) gb.onclick = function(){ el._kapat(); o.geriBildirim(); };
    try{ if(o.acildi) o.acildi(el); }catch(e){}
    return el;
  }
  var GB = { foto:null, video:null, yuk:0, tur:'bug', o:null };
  function medyaCiz(){
    var k = document.getElementById('sdMedya'); if(!k) return;
    k.querySelectorAll('.sd-med').forEach(function(x){ x.remove(); });
    var h = '';
    if(GB.foto) h += '<div class="sd-med"><img src="' + esc(GB.foto) + '" alt=""><button type="button" data-sil="foto" aria-label="Kaldır">×</button></div>';
    if(GB.video) h += '<div class="sd-med"><video src="' + esc(GB.video) + '" muted playsinline></video><button type="button" data-sil="video" aria-label="Kaldır">×</button></div>';
    k.insertAdjacentHTML('afterbegin', h);
    k.querySelectorAll('[data-sil]').forEach(function(b){ b.onclick = function(){ GB[b.getAttribute('data-sil')] = null; medyaCiz(); }; });
  }
  function yukle(input, tur){
    var f = input.files && input.files[0]; input.value = ''; if(!f) return;
    var k = document.getElementById('sdMedya'); if(!k || !window.SahaYukleme) return;
    var sid = 'sdy' + Date.now();
    k.insertAdjacentHTML('beforeend', '<div class="sd-ilerle" id="' + sid + '"><span>' + esc((f.name || (tur === 'foto' ? 'Fotoğraf' : 'Video')).slice(0, 34)) + '</span><i><b style="width:0%"></b></i><em>%0</em></div>');
    var cub = function(o){ var e = document.getElementById(sid); if(!e) return; var y = Math.round(o * 100); e.querySelector('b').style.width = y + '%'; e.querySelector('em').textContent = o >= 1 ? 'kaydediliyor…' : '%' + y; };
    GB.yuk++;
    var is = tur === 'foto' ? SahaYukleme.resim(f, GB.o.klasor, { maxDim:900, quality:.78, maxMB:15, ilerleme:cub }) : SahaYukleme.video(f, GB.o.klasor, { maxMB:50, maxSn:180, ilerleme:cub });
    is.then(function(u){ GB[tur] = u; }).catch(function(e){ bildir((tur === 'foto' ? 'Fotoğraf' : 'Video') + ' yüklenemedi: ' + ((e && e.message) || 'hata')); })
      .then(function(){ GB.yuk--; var e = document.getElementById(sid); if(e) e.remove(); medyaCiz(); });
  }
  function bildir(m){ try{ (GB.o && GB.o.bildir) ? GB.o.bildir(m) : alert(m); }catch(e){} }
  function gecmisHtml(L){
    L = L || [];
    if(!L.length) return '<div class="sd-bosk" style="padding:10px">Henüz geri bildirim göndermedin.</div>';
    var ad = { bug:'Hata', suggestion:'Öneri', other:'Diğer' }, ik = { bug:IK.hata, suggestion:IK.oneri, other:IK.diger };
    return L.slice(0, 20).map(function(x){
      var t = x.ts ? new Date(x.ts).toLocaleString('tr-TR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '';
      return '<div class="sd-gecmis"><div class="sd-g-ust"><b>' + (ik[x.type] || IK.diger) + ' ' + (ad[x.type] || 'Diğer') + '</b><span>' + t + '</span>'
        + '<em class="' + (x.adminReply ? 'yan' : (x.status === 'reviewed' ? 'inc' : '')) + '">' + (x.adminReply ? 'Yanıtlandı' : (x.status === 'reviewed' ? 'İncelendi' : 'Bekliyor')) + '</em></div>'
        + (x.text ? '<div class="sd-g-metin">' + esc(x.text) + '</div>' : '')
        + ((x.photo || x.video) ? '<div class="sd-g-ek">' + (x.photo ? IK.foto + ' Fotoğraf' : '') + (x.photo && x.video ? ' · ' : '') + (x.video ? IK.video + ' Video' : '') + '</div>' : '')
        + (x.adminReply ? '<div class="sd-g-yanit"><b>Yönetici:</b> ' + esc(x.adminReply.text || '') + '</div>' : '') + '</div>';
    }).join('');
  }
  function geriBildirim(o){
    GB.o = o = o || {}; GB.foto = null; GB.video = null; GB.tur = 'bug';
    var g = '<div class="sd-aciklama">' + esc(o.aciklama || 'Bir hata mı buldun, yoksa bir öneri mi var? Yaz; istersen fotoğraf ya da video (en fazla 50 MB, 3 dakika) ekle. Yönetici gönderdiğini görüp inceler, yanıtı burada görünür.') + '</div>'
      + '<div class="sd-et">Konu</div><div class="sd-turler" id="sdTur">'
      + [['bug','Hata',IK.hata],['suggestion','Öneri',IK.oneri],['other','Diğer',IK.diger]].map(function(x, i){ return '<button type="button" class="sd-cip' + (i ? '' : ' on') + '" data-t="' + x[0] + '">' + x[2] + ' ' + x[1] + '</button>'; }).join('') + '</div>'
      + '<div class="sd-et">Mesajın</div><textarea id="sdMetin" class="sd-metin" rows="5" maxlength="1500" placeholder="Ne oldu, ne görmek istersin..."></textarea>'
      + '<div class="sd-ekle"><button type="button" class="sd-dug ikincil" data-sd="foto">' + IK.foto + ' Fotoğraf ekle</button><button type="button" class="sd-dug ikincil" data-sd="video">' + IK.video + ' Video ekle</button></div>'
      + '<input type="file" id="sdFotoInp" accept="image/*,.heic,.heif" class="sd-gizli"><input type="file" id="sdVideoInp" accept="video/*" class="sd-gizli">'
      + '<div id="sdMedya" class="sd-medya"></div>'
      + '<button type="button" class="sd-dug" id="sdGonder">' + IK.gonder + ' Gönder</button>'
      + '<div class="sd-et" style="margin-top:16px">Geri bildirimlerim</div><div id="sdGecmis"><div class="sd-bosk" style="padding:10px">Yükleniyor…</div></div>';
    var el = pencere('sahaDestekGb', IK.gb, 'Geri Bildirim Gönder', g);
    var tr = el.querySelector('#sdTur');
    tr.onclick = function(ev){ var b = ev.target.closest('button[data-t]'); if(!b) return; GB.tur = b.getAttribute('data-t'); tr.querySelectorAll('button').forEach(function(x){ x.classList.toggle('on', x === b); }); };
    el.querySelector('[data-sd="foto"]').onclick = function(){ el.querySelector('#sdFotoInp').click(); };
    el.querySelector('[data-sd="video"]').onclick = function(){ el.querySelector('#sdVideoInp').click(); };
    el.querySelector('#sdFotoInp').onchange = function(){ yukle(this, 'foto'); };
    el.querySelector('#sdVideoInp').onchange = function(){ yukle(this, 'video'); };
    var gon = el.querySelector('#sdGonder');
    gon.onclick = function(){
      var metin = String(el.querySelector('#sdMetin').value || '').trim();
      if(GB.yuk > 0) return bildir('Dosya yükleniyor, bitince gönder.');
      if(!metin && !GB.foto && !GB.video) return bildir('Bir mesaj yaz ya da fotoğraf/video ekle.');
      gon.disabled = true; gon.textContent = 'Gönderiliyor…';
      var v = { type:GB.tur, text:metin, ts:Date.now(), status:'pending' }; if(GB.foto) v.photo = GB.foto; if(GB.video) v.video = GB.video;
      Promise.resolve().then(function(){ return o.gonder(v); })
        .then(function(){ bildir('Geri bildirimin gönderildi, teşekkürler!'); el._kapat(); })
        .catch(function(e){ gon.disabled = false; gon.innerHTML = IK.gonder + ' Gönder'; bildir('Gönderilemedi: ' + ((e && e.message) || 'bilinmeyen hata')); });
    };
    gecmisYenile();
    return el;
  }
  function gecmisYenile(L){
    var k = document.getElementById('sdGecmis'); if(!k) return;
    if(L){ k.innerHTML = gecmisHtml(L); return; }
    try{ Promise.resolve(GB.o && GB.o.gecmis ? GB.o.gecmis() : []).then(function(x){ var kk = document.getElementById('sdGecmis'); if(kk) kk.innerHTML = gecmisHtml(x || []); },
      function(){ var kk = document.getElementById('sdGecmis'); if(kk) kk.innerHTML = gecmisHtml([]); }); }catch(e){}
  }
  return { yenilikler:yenilikler, detay:detay, geriBildirim:geriBildirim, gecmisYenile:gecmisYenile, pencere:pencere, ikon:IK, acikMi:function(id){ var e = document.getElementById(id); return !!(e && e.style.display !== 'none'); } };
})();
/* ═══ DOĞAL SPİKER SESİ (2026-10-31-A, kullanıcı: "hem insan sesi sunan hem de pozisyonu doğru okuyacak bir sistem geliştir").
   Anlatım metni oyundaki olaydan kurulur (pozisyon doğru), cihazın robot sesi yerine Piper sinir ağı sesiyle (Türkçe, insan sesine
   yakın) seslendirilir. Ses her cihazda aynıdır; sentez ayrı iş parçacığında yapılır (bkz. ortak/ses/ses-isci.js). Model bir kez
   indirilir (ses başına ~14 MB, önbellekte kalır). Hazır olana kadar ya da desteklenmeyen cihazda cihaz sesi kullanılır.
   SahaSes.cal(metin, rol, {duzey}) → Promise (bitince) · SahaSes.tampon(metin, rol) → Promise<AudioBuffer> · SahaSes.hazirla(rol) */
var SahaSes = (function(){
  var SESLER = { fahrettin:'Fahrettin', dfki:'Deniz', fettah:'Fettah' };
  var ROL = { spiker:'fahrettin', yorumcu:'dfki' }, HIZ = { spiker:1.08, yorumcu:0.94, anons:1 };
  var isci = null, hazir = {}, yuk = {}, bek = {}, n = 0, ctx = null, yuzde = {}, hata = '', dinleyici = [], calan = null, disBaglam = null, indir = 0;
  var ON = {}, ONS = [];   // üretilmiş sesler (aynı cümle tekrar üretilmez: özet, gol videosu, tekrar)
  function kok(){ try{ return new URL('ortak/ses/', location.href).href; }catch(e){ return 'ortak/ses/'; } }
  function destek(){ try{ return !!(window.Worker && window.WebAssembly && window.caches && typeof BigInt64Array !== 'undefined'); }catch(e){ return false; } }
  function haber(){ dinleyici.forEach(function(f){ try{ f(); }catch(e){} }); }
  function baslat(){
    if(isci || !destek()) return !!isci;
    try{
      isci = new Worker(kok() + 'ses-isci.js?v=2');
      isci.onmessage = function(e){ var v = e.data || {};
        if(v.tip === 'ilerleme'){ yuzde[v.ses] = v.yuzde; haber(); return; }
        if(v.tip === 'hazir'){ hazir[v.ses] = true; yuzde[v.ses] = 100; indir = Math.max(0, indir - 1); var b = bek['y' + v.ses]; if(b){ delete bek['y' + v.ses]; b.c(); } haber(); return; }
        if(v.tip === 'hata' && v.ses && !v.id){ hata = v.mesaj; indir = Math.max(0, indir - 1); var b2 = bek['y' + v.ses]; if(b2){ delete bek['y' + v.ses]; b2.r(new Error(v.mesaj)); } yuk[v.ses] = null; haber(); return; }
        var w = bek[v.id]; if(!w) return; delete bek[v.id];
        if(v.tip === 'ses') w.c({ pcm:v.pcm, hz:v.hz }); else w.r(new Error(v.mesaj || 'ses üretilemedi'));
      };
      isci.onerror = function(e){ hata = (e && e.message) || 'ses işçisi çalışmadı'; haber(); };
    }catch(e){ isci = null; hata = e.message; }
    return !!isci;
  }
  function sesAdi(rol){ return ROL[rol] || ROL.spiker; }
  function hazirla(rol){
    var s = sesAdi(rol);
    if(hazir[s]) return Promise.resolve();
    if(!baslat()) return Promise.reject(new Error('Bu cihaz doğal sesi desteklemiyor'));
    if(!yuk[s]){ indir++; yuk[s] = new Promise(function(c, r){ bek['y' + s] = { c:c, r:r }; isci.postMessage({ tip:'yukle', ses:s }); }); }
    return yuk[s];
  }
  function hazirMi(rol){ return !!hazir[sesAdi(rol)]; }
  /* HEYECAN (2026-10-31-B, kullanıcı: "gol, kırmızı kart gibi anlarda daha gerçekçi bağırmalı, pozisyonları normal insanlar gibi
     heyecanlı anlatmalı"). KÖK SEBEP: her cümle aynı sakin ayarla (aynı hız, aynı ton, aynı düzey) üretiliyordu; "Gol!" ile
     "Taç atışı" aynı tonda okunuyordu. ŞİMDİ üç düzey: 0 sakin anlatım, 1 heyecanlı pozisyon (şut, kafa, kurtarış, direk, tehlike),
     2 bağırış (gol, kırmızı kart, penaltı kararı). Düzey yükseldikçe: konuşma hızlanır, ses modeli daha değişken (dalgalı) vurgu
     üretir, ses tonu yükselir, ses gücü artar, "basınçlı" bağırma tınısı (orta tiz yükseltme + hafif doyma) eklenir, sıkıştırıcı
     bağırışı patlatmadan öne çıkarır. Gol çığlığı uzatılır ("Gooooool!"). Düzey verilmezse cümleden anlaşılır. */
  var HEY = [ { hiz:1, gr:1, gw:1, oran:1, kaz:1, tiz:0, doy:0 },
              { hiz:1.07, gr:1.12, gw:1.12, oran:1.04, kaz:1.18, tiz:3, doy:0 },
              { hiz:1.10, gr:1.25, gw:1.25, oran:1.085, kaz:1.45, tiz:6, doy:1.6 } ];
  function heyecanBul(metin, rol){
    var m = String(metin || ''), k = m.toLocaleLowerCase('tr-TR');
    if(rol !== 'yorumcu' && /(^|[^a-zçğıöşü])(go+l+(?![a-zçğıöşü])|golü (buldu|attı)|ağlar|file havaland|kırmızı|penaltı!|penaltı kararı|beyaz noktayı gösterdi|kendi kalesine gol|maç sona eriyor|son düdük)/.test(k)) return 2;
    if(/!/.test(m) || /(şut|kafa|direk|kurtar|tehlike|çalım|ceza sahas|kaçtı|son anda|inanılmaz|müthiş|penaltı|nefes)/.test(k)) return 1;
    return 0;
  }
  function metniHazirla(metin, h){
    var m = String(metin || '');
    if(h >= 2){
      m = m.replace(/\b(Go+l+|GO+L+)!/g, 'Gooooool!').replace(/\bGol gol gol!/gi, 'Gol! Gol! Gooooool!').replace(/^Ve gol!/, 'Ve gooool!')
           .replace(/^İşte gol!/, 'İşte gooool!').replace(/^Kırmızı kart!/, 'Kırmızı kart! Kırmızı!');
    }
    if(h >= 1) m = m.replace(/\.\s*$/, '!');
    return m;
  }
  function uret(metin, rol, h){
    h = h == null ? heyecanBul(metin, rol) : Math.max(0, Math.min(2, h | 0));
    var s = sesAdi(rol), H = HEY[h], hz = (HIZ[rol] || 1) * H.hiz, mt = metniHazirla(metin, h), an = s + '|' + h + '|' + mt;
    if(ON[an]) return ON[an];
    var id = 'u' + (++n);
    var p = hazirla(rol).then(function(){ return new Promise(function(c, r){ bek[id] = { c:c, r:r }; isci.postMessage({ tip:'soyle', id:id, metin:mt, ses:s, hiz:hz, gurultu:H.gr, gw:H.gw });
      setTimeout(function(){ if(bek[id]){ delete bek[id]; r(new Error('ses zamanında üretilemedi')); } }, 20000); }); })
      .then(function(x){ x.h = h; return x; });
    ON[an] = p; ONS.push(an); if(ONS.length > 60) delete ON[ONS.shift()];
    p.catch(function(){ delete ON[an]; });
    return p;
  }
  function tampon(metin, rol, h){
    return uret(metin, rol, h).then(function(x){
      // Ses düzeyi eşitlenir: sesler (Fahrettin, Deniz…) farklı yükseklikte kaydedilmiş; yorumcu spikerin yarısı kadar kısık duyuluyordu.
      var d = x.pcm, t = 0, pk = 0, i; if(!x.esit){ for(i = 0; i < d.length; i++){ var a = d[i]; t += a * a; if(a > pk) pk = a; else if(-a > pk) pk = -a; }
        var rms = Math.sqrt(t / Math.max(1, d.length)), k = rms > 1e-4 ? Math.min(0.11 / rms, 0.95 / Math.max(pk, 1e-4)) : 1; if(Math.abs(k - 1) > 0.02) for(i = 0; i < d.length; i++) d[i] *= k; x.esit = true; }
      var b = new AudioBuffer({ length:Math.max(1, d.length), sampleRate:x.hz, numberOfChannels:1 });
      b.copyToChannel(d, 0); b._h = x.h; return b;
    });
  }
  /* TEK SES MOTORU (2026-10-31-B, kullanıcı: "saha uygulamasında arka plan müziği ve yeni eklenen spiker çalışmıyor"). KÖK SEBEP: doğal ses
     kendi ses motorunu (AudioContext) açıyordu - üstelik sayfadaki İLK dokunuşta, spiker hiç konuşmadan. Uygulamanın müzik ve maç
     motorlarının yanında üçüncü/dördüncü motor oluyordu; telefonlarda (özellikle iPhone) aynı anda açık motorlar ses oturumunu
     birbirinden alabiliyor, arka plandan dönünce bu motoru kimse uyandırmadığı için de "askıda" kalıp spiker SESSİZ çalıyordu.
     ŞİMDİ: sayfa kendi motorunu verir (SahaSes.baglamVer); motor yalnızca gerçekten konuşulacağı an istenir; motor çalışmıyorsa
     ses sessizce "çalınmış" sayılmaz, hata verilir ve cihaz sesine geçilir. */
  function baglam(){
    try{ if(disBaglam){ var d = disBaglam(); if(d && d.state !== 'closed') return d; } }catch(e){}
    if(!ctx){ var C = window.AudioContext || window.webkitAudioContext; if(!C) return null; ctx = new C(); }
    if(ctx.state !== 'running'){ try{ ctx.resume(); }catch(e){} }
    return ctx;
  }
  // Dokunuş: tarayıcı sesi yalnızca dokunuşla açar. Kendi motoru ancak doğal ses kullanılmaya başladıysa (indiriliyor/hazır) ve sayfa motor vermiyorsa kurulur.
  try{ document.addEventListener('pointerdown', function(){ try{
    if(ctx){ if(ctx.state !== 'running') ctx.resume(); return; }
    if(!disBaglam && (indir > 0 || Object.keys(hazir).length)){ var C = window.AudioContext || window.webkitAudioContext; if(C){ ctx = new C(); } }
  }catch(e){} }, { capture:true, passive:true }); }catch(e){}
  function calisir(c){
    if(c.state === 'running') return Promise.resolve(c);
    try{ c.resume(); }catch(e){}
    return new Promise(function(coz, red){ var t0 = Date.now(), b = function(){ if(c.state === 'running') return coz(c); if(Date.now() - t0 > 600) return red(new Error('ses motoru askıda')); setTimeout(b, 60); }; b(); });
  }
  var _egri = null;
  function egri(){ if(_egri) return _egri; var N = 1024, a = new Float32Array(N); for(var i = 0; i < N; i++){ var x = i / (N - 1) * 2 - 1; a[i] = Math.tanh(1.6 * x) / Math.tanh(1.6); } return (_egri = a); }
  function cal(metin, rol, o){
    o = o || {};
    return tampon(metin, rol, o.heyecan).then(function(b){
      var c0 = baglam(); if(!c0) throw new Error('ses çalınamıyor');
      return calisir(c0).then(function(c){ return new Promise(function(coz){
        var H = HEY[b._h || 0], k = c.createBufferSource(), son0 = c.createGain();
        k.buffer = b; k.playbackRate.value = H.oran;
        var uc = k;
        if(H.tiz){ var eq = c.createBiquadFilter(); eq.type = 'peaking'; eq.frequency.value = 2600; eq.Q.value = 0.9; eq.gain.value = H.tiz; uc.connect(eq); uc = eq;
          var alt = c.createBiquadFilter(); alt.type = 'highpass'; alt.frequency.value = 140; uc.connect(alt); uc = alt; }
        if(H.doy){ var ws = c.createWaveShaper(); ws.curve = egri(); ws.oversample = '2x'; uc.connect(ws); uc = ws; }
        // Güç önce verilir, sıkıştırıcı en sonda sınırlayıcıdır: bağırış öne çıkar ama cızırtı (kırpılma) olmaz.
        var cmp = c.createDynamicsCompressor(); cmp.threshold.value = -14; cmp.knee.value = 8; cmp.ratio.value = 8; cmp.attack.value = 0.003; cmp.release.value = 0.15;
        son0.gain.value = Math.min(2.2, (o.duzey == null ? 1 : o.duzey) * H.kaz);
        uc.connect(son0); son0.connect(cmp); cmp.connect(o.hedef || c.destination);
        var bitti = false, son = function(){ if(bitti) return; bitti = true; if(calan === k) calan = null; try{ cmp.disconnect(); }catch(e){} coz(); };
        k.onended = son; setTimeout(son, b.duration / H.oran * 1000 + 1500);
        calan = k; k.start();
      }); });
    });
  }
  function sustur(){ try{ if(calan){ var k = calan; calan = null; k.stop(); } }catch(e){} }
  function ayarla(v){ v = v || {}; if(v.spiker && SESLER[v.spiker]) ROL.spiker = v.spiker; if(v.yorumcu && SESLER[v.yorumcu]) ROL.yorumcu = v.yorumcu; haber(); }
  return { destek:destek, hazirla:hazirla, hazirMi:hazirMi, cal:cal, tampon:tampon, sustur:sustur, ayarla:ayarla, sesler:SESLER,
    rolSesi:function(r){ return sesAdi(r); }, yuzde:function(r){ return yuzde[sesAdi(r)] || 0; }, hata:function(){ return hata; },
    dinle:function(f){ dinleyici.push(f); }, baglam:baglam, baglamVer:function(f){ disBaglam = typeof f === 'function' ? f : null; },
    heyecan:heyecanBul, heyecanAyar:function(h){ return HEY[Math.max(0, Math.min(2, h | 0))]; }, indiriyor:function(){ return indir > 0; } };
})();
