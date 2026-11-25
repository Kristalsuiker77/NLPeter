# NLPeter

NLPeter helpt mensen een shift in mindset te maken. Je vertelt hardop waar je vastloopt; de app zet je spraak om naar tekst en analyseert hoe je praat: VAK-predicaten, metamodel-patronen, metaprogramma's, waarden, belemmerende overtuigingen en logische niveaus uit NLP, verandertaal en gereedheid voor verandering uit motiverende gespreksvoering, en denkfouten uit cognitieve gedragstherapie. Daarna geeft Peter advies van de huidige naar de gewenste situatie.

NLPeter is een coachingshulpmiddel, geen therapie of diagnose.

## Opbouw

| Map | Wat |
| --- | --- |
| `app/` | Mobiele app (Expo, React Native, TypeScript, Expo Router) voor iOS en Android |
| `server/` | Kleine API (Node, Hono) die de analyse via de Claude API doet en de API-sleutel buiten de app houdt |

De stroom: spraak wordt op het toestel omgezet naar tekst (`expo-speech-recognition`, op het toestel zelf waar dat kan), de tekst gaat naar `POST /analyse`, de server vraagt Claude om een analyse in een vast JSON-formaat, en de app toont die en bewaart de sessie lokaal.

## Lokaal draaien

### Server

```bash
cd server
npm install
cp .env.example .env           # zet je ANTHROPIC_API_KEY in .env
npm run dev                    # luistert op http://localhost:8787
```

`.env` staat in `.gitignore` en komt dus nooit in de repo.

### App

Spraakherkenning is een native module, dus Expo Go werkt niet; je hebt een development build nodig.

```bash
cd app
npm install
echo "EXPO_PUBLIC_API_URL=http://<ip-van-je-computer>:8787" > .env
npx expo run:ios       # of: npx expo run:android
```

Gebruik het IP-adres van je computer in je lokale netwerk, niet `localhost`, als je op een echte telefoon test. Telefoon en computer moeten op hetzelfde wifi zitten. Op iOS vraagt de app de eerste keer toestemming voor het lokale netwerk; zonder die toestemming bereikt de app de server niet.

Op een iPhone met een gratis Apple ID: zet Ontwikkelaarsmodus aan (Instellingen > Privacy en beveiliging), en vertrouw na installatie je Apple ID via Instellingen > Algemeen > VPN en apparaatbeheer. De app werkt dan 7 dagen; daarna opnieuw installeren met `npx expo run:ios --device`.

## Online zetten (Render)

`render.yaml` beschrijft de server voor [Render](https://render.com): gratis plan, regio Frankfurt, automatisch opnieuw uitrollen bij elke commit op `main`. De gratis server slaapt na 15 minuten zonder verkeer en heeft daarna ongeveer een minuut nodig om op te starten. De app maakt hem daarom al wakker zodra je hem opent.

De server eist online een app-sleutel (`APP_TOKEN`), zodat niet iedereen die het adres vindt analyses kan laten draaien op jouw Claude-rekening. De app stuurt dezelfde sleutel mee (`EXPO_PUBLIC_APP_TOKEN`). Die sleutel zit in de app zelf: een slot tegen toevallige bezoekers, geen echt geheim. Zet daarom ook een uitgavelimiet in de Claude Console.

1. Maak op de Mac een app-sleutel en zet hem in `app/.env`. Het adres vul je in zodra Render het heeft gegeven:

   ```bash
   cd app
   TOKEN=$(openssl rand -hex 32)
   printf 'EXPO_PUBLIC_API_URL=https://nlpeter-api.onrender.com\nEXPO_PUBLIC_APP_TOKEN=%s\n' "$TOKEN" > .env
   printf %s "$TOKEN" | pbcopy   # de sleutel staat nu op het klembord
   ```

2. In Render: **New > Blueprint**, kies deze repo en vul in:
   - `ANTHROPIC_API_KEY`: een aparte sleutel uit de Claude Console, bijvoorbeeld "NLPeter Render"
   - `APP_TOKEN`: plakken van het klembord
3. Controleer `https://<jouw-adres>.onrender.com/health`; dat geeft `{"ok":true}`.
4. Bouw de app als Release, zodat hij zonder Mac werkt:

   ```bash
   npx expo run:ios --device --configuration Release
   ```

## Privacy en veiligheid

- Spraak wordt waar mogelijk op het toestel omgezet (`requiresOnDeviceRecognition`). Op toestellen zonder on-device herkenning gebruikt het besturingssysteem de spraakdienst van Apple of Google.
- Alleen tekst gaat naar de server. De server logt geen transcripten en bewaart niets. Online draait de server bij Render in Frankfurt (EU).
- Sessies staan alleen op het toestel (AsyncStorage) en zijn te wissen in de app.
- Bij signalen van een crisis toont de app 113 Zelfmoordpreventie (0800-0113) en 112.
- Voor productie nog nodig: verwerkersovereenkomst met Anthropic en eventuele hostingpartij, privacyverklaring, en een duurzame rate limit in plaats van de limiet in het geheugen.

## Controleren

```bash
cd app && npx tsc --noEmit && npx expo-doctor
cd server && npm run typecheck
```
