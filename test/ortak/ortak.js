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
    return Promise.all([
      ref('userProfiles/' + profil).update({ authEposta:eposta0, authSurum:Number(surum) || 0, authUid:uid, authTs:simdi, password:null }),
      ref('kimlik/' + uid).set({ p:profil, ts:simdi })
    ]);
  }
  // Mevcut (taşınmış) hesapla giriş. Sonuç: {durum:'ok'|'hatali'|'ag', uid}
  function giris(ref, profil, pw, kayit){
    var a = hedef(), e0 = kayit && kayit.authEposta;
    if(!a || !e0) return Promise.resolve({ durum:'hatali' });
    return sure(a.signInWithEmailAndPassword(e0, sifre(pw))).then(function(c){
      var uid = c && c.user && c.user.uid;
      // kimlik bağı her girişte tazelenir (başka cihazda silinmiş/kopyalanmış olabilir)
      return ref('kimlik/' + uid).set({ p:profil, ts:Date.now() }).then(function(){ return { durum:'ok', uid:uid }; }, function(){ return { durum:'ok', uid:uid }; });
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
           giris:giris, olustur:olustur, sifreDegistir:sifreDegistir, oturumBuProfil:oturumBuProfil, cikis:cikis };
})();
