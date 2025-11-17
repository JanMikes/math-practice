# 📚 Matematický Trenažér pro Prvňáčky

Interaktivní webová aplikace pro procvičování matematiky pro děti v první třídě. Aplikace je kompletně v českém jazyce a obsahuje hravý vzdělávací design s motivem školní tabule.

## ✨ Funkce

- **Výběr operací**: Sčítání (+), Odčítání (-), Násobení (×), Dělení (÷)
- **Nastavitelný rozsah**: Volba minimálního a maximálního čísla (výsledky nepřekročí maximum)
- **Vlastní počet příkladů**: 1-50 příkladů v jednom cvičení
- **Sledování pokroku**: Vizuální progress bar během řešení
- **Výsledky**: Přehled správných/špatných odpovědí s barevným označením
- **Oprava**: Možnost opravit nesprávné odpovědi
- **Opakování**: Možnost procvičit pouze nesprávně vyřešené příklady
- **Persistence**: Uložení výsledků do localStorage prohlížeče

## 🎨 Design

- Vzdělávací téma s motivem školní tabule
- Křídová estetika s texturou
- Přívětivé barvy a velké fonty vhodné pro děti
- Responzivní design

## 🚀 Rychlý start s Dockerem

### Prerekvizity
- Docker
- Docker Compose

### Spuštění aplikace

1. **Stažení/naklonování projektu**
   ```bash
   cd /cesta/k/projektu
   ```

2. **Spuštění pomocí Docker Compose**
   ```bash
   docker compose up
   ```

3. **Otevření v prohlížeči**
   ```
   http://localhost:3000
   ```

Aplikace se automaticky restartuje při změnách souborů díky hot-reload funkci Next.js.

### Zastavení aplikace
```bash
docker compose down
```

## 🛠️ Technologie

- **Next.js 14** - React framework s App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Docker** - Kontejnerizace pro jednoduché nasazení

## 📖 Jak používat

1. **Nastavení cvičení**
   - Zaškrtněte operace, které chcete procvičovat
   - Nastavte rozsah čísel (např. 1-20 pro výsledky do 20)
   - Zvolte počet příkladů
   - Klikněte na "Začít cvičení"

2. **Řešení příkladů**
   - Napište odpověď do pole
   - Stiskněte Enter nebo klikněte na "Další"
   - Sledujte svůj pokrok v progress baru

3. **Výsledky**
   - Prohlédněte si správné/špatné odpovědi
   - Zelené = správně ✓
   - Červené = špatně ✗
   - Možnost opravit nesprávné odpovědi
   - Možnost opakovat pouze nesprávné příklady
   - Začít nové cvičení

## 🧮 Logika generování příkladů

- **Sčítání**: Výsledek nepřekročí nastavené maximum
- **Odčítání**: Výsledek je vždy kladný
- **Násobení**: Rozumné malé násobky vhodné pro prvňáčky
- **Dělení**: Pouze bezzbytkové dělení s malými čísly

## 📝 Poznámky

- Data se ukládají do localStorage prohlížeče
- Aplikace funguje offline po prvním načtení
- Vhodné pro děti 6-8 let
- Doporučená velikost obrazovky: minimálně 768px šířka

## 🐛 Řešení problémů

Pokud aplikace nefunguje správně:

1. Zkontrolujte, že běží Docker
2. Zkuste rebuildit kontejner:
   ```bash
   docker compose down
   docker compose up --build
   ```
3. Vymažte localStorage v prohlížeči (F12 → Application → Local Storage → Clear)

## 🚀 Deployment na GitHub Pages

Aplikace je nakonfigurována pro automatické nasazení na GitHub Pages.

### Nastavení v GitHub repozitáři

1. **Aktivujte GitHub Pages**:
   - Jděte do Settings → Pages
   - V sekci "Build and deployment":
     - Source: GitHub Actions

2. **Push do repozitáře**:
   ```bash
   git add .
   git commit -m "Configure for static export and GitHub Pages"
   git push origin main
   ```

3. **Automatické nasazení**:
   - GitHub Actions workflow se spustí automaticky při push do `main` větve
   - Build zabere ~1-2 minuty
   - Aplikace bude dostupná na: `https://<username>.github.io/<repository>/`
   - Pokud máte CNAME soubor (vlastní doména), bude dostupná na vaší doméně

### Manuální build

Pro lokální testování statického buildu:
```bash
docker compose exec math-app sh -c "NODE_ENV=production npm run build"
```

Statické soubory najdete v adresáři `out/`.

## 📄 Licence

Vytvořeno pro vzdělávací účely.
