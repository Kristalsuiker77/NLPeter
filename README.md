# NLPeter

NLPeter helpt mensen een shift in mindset te maken. Je vertelt hardop waar je vastloopt; de app zet je spraak om naar tekst en analyseert hoe je praat met NLP: VAK-predicaten, metamodel-patronen, metaprogramma's, waarden, belemmerende overtuigingen en logische niveaus. Daarna geeft Peter advies van de huidige naar de gewenste situatie.

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
export ANTHROPIC_API_KEY=...   # of: ant auth login
npm run dev                    # luistert op http://localhost:8787
```

### App

Spraakherkenning is een native module, dus Expo Go werkt niet; je hebt een development build nodig.

```bash
cd app
npm install
echo "EXPO_PUBLIC_API_URL=http://<ip-van-je-computer>:8787" > .env
npx expo run:ios       # of: npx expo run:android
```

Gebruik het IP-adres van je computer in je lokale netwerk, niet `localhost`, als je op een echte telefoon test.

## Privacy en veiligheid

- Spraak wordt waar mogelijk op het toestel omgezet (`requiresOnDeviceRecognition`). Op toestellen zonder on-device herkenning gebruikt het besturingssysteem de spraakdienst van Apple of Google.
- Alleen tekst gaat naar de server. De server logt geen transcripten en bewaart niets.
- Sessies staan alleen op het toestel (AsyncStorage) en zijn te wissen in de app.
- Bij signalen van een crisis toont de app 113 Zelfmoordpreventie (0800-0113) en 112.
- Voor productie nog nodig: verwerkersovereenkomst met Anthropic en eventuele hostingpartij, privacyverklaring, en een duurzame rate limit in plaats van de limiet in het geheugen.

## Controleren

```bash
cd app && npx tsc --noEmit && npx expo-doctor
cd server && npm run typecheck
```
