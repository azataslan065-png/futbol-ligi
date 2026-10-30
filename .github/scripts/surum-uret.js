// Her klasördeki index/admin/saha.html içinden APP_BUILD'i okuyup yanına surum.json yazar (uygulamalar yeni sürümü buradan anlar).
const fs = require('fs'), path = require('path');
let degisti = false;
for (const kl of ['test', '.']) {
  const j = {};
  for (const ad of ['index', 'admin', 'saha']) {
    const f = path.join(kl, ad + '.html'); if (!fs.existsSync(f)) continue;
    const m = fs.readFileSync(f, 'utf8').match(/window\.APP_BUILD\s*=\s*'([0-9]{4}-[0-9]{2}-[0-9]{2}-[A-Z]+)'/);
    if (m) j[ad] = m[1];
  }
  const hedef = path.join(kl, 'surum.json'), yeni = JSON.stringify(j, null, 1) + '\n';
  const eski = fs.existsSync(hedef) ? fs.readFileSync(hedef, 'utf8') : '';
  if (eski !== yeni) { fs.writeFileSync(hedef, yeni); degisti = true; console.log(hedef + ': ' + JSON.stringify(j)); }
}
console.log(degisti ? 'surum.json guncellendi' : 'surum.json zaten guncel');
