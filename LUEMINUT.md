# Dobble — yksinpeli ja moninpeli

Kansiossa on koko sovellus. Se ei lataa mitään ulkopuolelta: ei kirjastoja,
ei fontteja, ei seurantaa.

```
index.html              koko peli (121 kt)
config.js               moninpelin asetus
manifest.json           asennustiedot
sw.js                   offline-välimuisti
icon-*.png              kuvakkeet kotinäytölle
```

---

## Kaksi pelitapaa

Pelitapaa vaihdetaan yläreunan painikkeilla tai **pyyhkäisemällä sivulle**.

**Yksinpeli** toimii heti, myös ilman verkkoyhteyttä. Valitset kuvien määrän
kortilla (3–98) ja korttien määrän, ja pelaat kelloa vastaan.

**Moninpeli** tarvitsee tietokannan (kohta 2). Kaikki sivulla olevat näkevät
saman kortin, ja kun joku painaa oikeaa kuvaa, kortti vaihtuu **kaikilla**
yhtä aikaa ja ruudulle ilmestyy kuka sai pisteen.

### Aulat

Moninpeli koostuu **auloista**, joilla on nelikirjaiminen koodi. Voit luoda
oman aulan tai liittyä listalla näkyvään. Aulan osoite päättyy koodiin
(esim. `…/#KARI`), joten linkin voi lähettää suoraan kaverille.

Aulanäkymässä on **QR-koodi**, jonka skannaamalla pääsee suoraan samaan
aulaan. Koodi on osoitteen lopussa (`…/#KARI`), joten linkin voi myös
kopioida ja lähettää. QR-koodi muodostetaan sovelluksen sisällä eikä vaadi
verkkopalvelua.

Aulassa on myös **viestikenttä**, jossa voi jutella ennen matsin alkua.
Vanhat viestit karsiutuvat itsestään.

Omassa aulassa olet aina isäntä. Jos jokin aula jää jumiin, luo uusi.

Tyhjät aulat siivoutuvat itsestään kahden minuutin kuluttua.

### Kuka sai pisteen

Kun kaksi painaa lähes yhtä aikaa, ratkaisu tehdään palvelimen aikaleimasta:
jokainen kirjaa vaatimuksen, ja isäntä valitsee pienimmän leiman. Simuloin
tämän — verkkoviive tuo tasaväkisten pelaajien välille vain noin kahden
prosentin vinouman, eli taito ratkaisee. Painaja näkee oikean kuvan korostuvan heti, koska vastaus on tarkistettu jo
hänen laitteellaan. Seuraava kortti sen sijaan **herää kaikilla täsmälleen
samalla hetkellä**: isäntä kirjaa jokaiselle jaolle palvelinajassa lasketun
aktivoitumishetken, ja laitteet suhteuttavat kellonsa siihen. Nopea yhteys ei
siis anna etumatkaa, eikä painaja itsekään näe seuraavaa korttia muita ennen.

Matsin ensimmäinen kortti on peitettynä 1,6 sekuntia, jotta kaikki ehtivät
mukaan. Laskuri näyttää jäljellä olevan ajan.

---

## 1. Vie verkkoon (GitHub Pages, ilmainen)

1. Luo uusi julkinen repository GitHubissa
2. **Add file → Upload files** → raahaa **kaikki** tämän kansion tiedostot
3. **Commit changes**
4. **Settings → Pages → Source: main → Save**
5. Minuutin päästä osoite on `https://kayttajanimi.github.io/reponimi/`

---

## 2. Moninpeli (~5 min)

Yhteinen tila vaatii tietokannan. Firebasen ilmaisversio riittää:

1. `https://console.firebase.google.com` → luo projekti
   (Google Analytics ei tarvita)
2. Vasemmalta **Build → Realtime Database → Create Database**
3. Sijainniksi *europe-west1*, ja **Start in test mode**
4. Kopioi kannan osoite yläreunasta:
   `https://projekti-default-rtdb.europe-west1.firebasedatabase.app`
5. Avaa `config.js`, poista rivin alusta `//` ja liitä osoite tilalle
6. Lataa `config.js` uudestaan GitHubiin

Testitila **vanhenee 30 päivässä**. Pysyvästi aseta **Rules**-välilehdellä:

```json
{
  "rules": {
    "room": {
      ".read": true,
      ".write": true,
      ".validate": "newData.hasChildren()"
    }
  }
}
```

Tämä on avoin kaikille, mikä sopii peliin jossa kuka tahansa saa liittyä.
Jos haluat rajata pääsyn, pidä osoite yksityisenä — sitä ei voi piilottaa
selaimelta.

Huom: en ole voinut testata yhteyttä oikeaa Firebase-kantaa vasten, koska
ympäristöni verkko on rajattu. Peli on kirjoitettu niin, että yhteyskatko ei
kaada sitä: pallo nimimerkin vieressä kertoo tilan, ja yksinpeli toimii
joka tapauksessa.

### Versiot

Versionumero on tallennettu koodiin ja kirjautuu tietokantaan itsestään heti
kun joku avaa uudemman version. Sovellus **kuuntelee rajaa jatkuvasti**, joten
vanhemmalla versiolla pelaava saa ilmoituksen ja päivityspainikkeen samalla
sekunnilla — ei vasta seuraavalla tarkistuskierroksella. Vanhemmalla versiolla
ei voi pelata, koska eri versiot eivät toimisi yhdessä oikein.

Jos peli ilmoittaa vanhasta versiosta, paina **Päivitä nyt**. Aulalistalla
näkyvät myös eri versiolla luodut aulat, mutta niihin ei voi liittyä.

Pakka- ja Rakenne-välilehdet toimivat versiosta riippumatta, koska ne eivät
ole yhteispeliä.

### Jos yhteys ei toimi

Aulalistan alalaidassa näkyy sovelluksen versio ja yhteyden tila. Siinä on
myös **päivitä sovellus** -painike, joka poistaa palvelutyöntekijän ja
välimuistit ja lataa sovelluksen puhtaana. Sitä kannattaa painaa, jos selain
näyttää jostain syystä vanhaa versiota — selaimen tietoja ei tarvitse
tyhjentää käsin.

Nimimerkin vieressä olevaa palloa napauttamalla voi yhdistää uudelleen:
vihreä tarkoittaa toimivaa yhteyttä, keltainen vilkkuva yhdistämistä ja
punainen katkosta.

---

## 3. Asenna kotinäytölle

**Android (Chrome):** avaa osoite → valikko (⋮) → *Asenna sovellus*

**iPhone (Safari):** avaa osoite → jakonappi → *Lisää Koti-valikkoon*

Peli avautuu omana sovelluksenaan ilman osoitepalkkia.

---

## 4. Jos haluat APK-tiedoston

Kun sivu on verkossa, **PWABuilder** kääntää siitä allekirjoitetun APK:n
ilmaiseksi:

1. `https://www.pwabuilder.com` → liitä sivusi osoite → **Start**
2. **Package for stores → Android → Generate**
3. Paketti sisältää `app-release-signed.apk`

---

## Mikä peli on

Pakka on äärellinen projektiivinen taso PG(2, q): kuvat ovat tason pisteitä
ja kortit suoria. Kaksi suoraa leikkaa aina täsmälleen yhdessä pisteessä,
ja juuri siksi millä tahansa kahdella kortilla on tasan yksi yhteinen kuva.

Kortilla on aina q + 1 kuvaa, ja pakassa q² + q + 1 kuvaa ja korttia.
Tämä onnistuu vain kun q on alkuluvun potenssi. **Pakka**- ja **Rakenne**-
välilehdillä voi tutkia kaikkia kokoja 3:sta 98:aan, mukaan lukien kolme
askelmaa joita ei voi valita:

| Kuvaa kortilla | q | Tilanne |
|---|---|---|
| 7 | 6 | mahdoton — Tarry 1901 |
| 11 | 10 | mahdoton — Lam, Thiel & Swiercz 1989 |
| 13 | 12 | **avoin** — kukaan ei tiedä |
| 100 | 99 | **avoin** — 99 = 9 · 11, mutta Bruck–Ryser ei päde |

Kuvina käytetään **emojeita** aina kun niitä riittää koko pakkaan: valikoimassa
on 1102 kappaletta, mikä kattaa kaikki koot **32 kuvaan kortilla** asti
(993 kuvaa pakassa). Sitä isommissa pakoissa kuvat piirretään ohjelmallisesti
yhdistelminä: 18 muotoa × 16 sävyä × 4 täyttöä × 9 sisämerkkiä = 10 368
erottuvaa kuvaa, mikä riittää suurimman pakan 9507 kuvaan.
