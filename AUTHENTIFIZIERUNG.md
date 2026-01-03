# Authentifizierung - Einfach erklärt

## 📚 Inhaltsverzeichnis

1. [Was ist Authentifizierung?](#was-ist-authentifizierung)
2. [Wie funktioniert das System?](#wie-funktioniert-das-system)
3. [Schritt für Schritt: Registrierung](#schritt-für-schritt-registrierung)
4. [Schritt für Schritt: Login](#schritt-für-schritt-login)
5. [Geschützte Bereiche](#geschützte-bereiche)
6. [Sicherheit verstehen](#sicherheit-verstehen)

---

## Was ist Authentifizierung?

**Authentifizierung** bedeutet: **"Bist du wirklich, wer du sagst, dass du bist?"**

### Ein alltägliches Beispiel:

Stell dir vor, du willst in dein Haus:

1. Du zeigst deinen **Schlüssel** (= Passwort)
2. Das Schloss prüft: **"Passt der Schlüssel?"**
3. Wenn ja: Tür geht auf (= du bist eingeloggt)
4. Du bekommst einen **Hausausweis** (= Token), den du danach nutzen kannst

### In unserer App:

```
Registrierung → Du bekommst einen Account
Login         → Du beweist, dass du es bist
Token         → Dein "Ausweis" für weitere Aktionen
Logout        → Du gibst den Ausweis zurück
```

---

## Wie funktioniert das System?

Unsere App nutzt **JWT** (JSON Web Token) - das ist wie ein digitaler Ausweis.

### Die Komponenten:

```
┌─────────────────┐
│   FRONTEND      │  Next.js + NextAuth
│   (Browser)     │  → Wo der Benutzer ist
└────────┬────────┘
         │ HTTPS
         │ (verschlüsselt)
         ▼
┌─────────────────┐
│   BACKEND       │  NestJS + JWT
│   (Server)      │  → Wo die Überprüfung passiert
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DATENBANK     │  PostgreSQL
│                 │  → Wo User gespeichert sind
└─────────────────┘
```

### Wichtige Technologien:

| Was             | Wofür                    | Wo       |
| --------------- | ------------------------ | -------- |
| **NextAuth.js** | Login-System verwalten   | Frontend |
| **JWT Token**   | Digitaler Ausweis        | Beide    |
| **bcrypt**      | Passwörter verschlüsseln | Backend  |
| **Passport**    | Ausweise überprüfen      | Backend  |

---

## Schritt für Schritt: Registrierung

### Was passiert, wenn du dich registrierst?

```
Du gibst ein:
  - Email: max@example.com
  - Passwort: MeinGeheimesPasswort123
  - Name: Max Mustermann

Dann passiert folgendes...
```

### Schritt 1: Frontend sammelt Daten

```typescript
// apps/web/app/register/page.tsx
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    // Daten ans Backend senden
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    if (res.ok) {
      router.push('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={name} onChange={(e) => setName(e.target.value)} />
      <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Registrieren</Button>
    </form>
  );
}
```

**Was passiert hier?**

- Benutzer tippt Name, Email und Passwort ein
- Beim Klick auf "Registrieren" werden die Daten validiert
- Die Daten werden ans Backend geschickt

---

### Schritt 2: Backend prüft und verschlüsselt

```typescript
// Backend Controller
@Post('/signup')
async registrieren(@Body() daten) {

  // 1. Gibt es den User schon?
  const existiert = await this.userService.findeUser(daten.email);

  if (existiert) {
    throw new Error('Email bereits vergeben!');
  }

  // 2. Passwort verschlüsseln (hashen)
  const verschluesselt = await bcrypt.hash(daten.passwort, 10);
  //    "MeinPasswort123" → "$2a$10$N9qo8uLO..."

  // 3. User in Datenbank speichern
  const neuerUser = await this.userService.erstellen({
    email: daten.email,
    name: daten.name,
    passwort: verschluesselt  // NUR verschlüsselt!
  });

  // 4. Token erstellen
  const token = this.authService.erstelleToken(neuerUser);

  // 5. Zurück ans Frontend
  return {
    access_token: token,
    user: { id: neuerUser.id, email: neuerUser.email }
  };
}
```

**Was passiert hier?**

1. **Prüfen:** Gibt es die Email schon?
2. **Verschlüsseln:** Passwort wird "gehashed" (nicht mehr lesbar)
3. **Speichern:** User wird in Datenbank gespeichert (nur mit verschlüsseltem Passwort!)
4. **Token erstellen:** Digitaler Ausweis wird ausgestellt
5. **Zurückschicken:** Frontend bekommt Token

---

### Schritt 3: Passwort-Verschlüsselung (bcrypt)

**Warum verschlüsseln wir?**

Stell dir vor, jemand hackt unsere Datenbank. Ohne Verschlüsselung könnte er alle Passwörter lesen!

```
❌ OHNE Verschlüsselung:
Datenbank speichert: "MeinPasswort123"
Hacker sieht: "MeinPasswort123"
→ GEFÄHRLICH!

✅ MIT Verschlüsselung (bcrypt):
Eingabe: "MeinPasswort123"
Datenbank speichert: "$2a$10$N9qo8uLOv..."
Hacker sieht: "$2a$10$N9qo8uLOv..."
→ Kann nichts damit anfangen!
```

**Code-Beispiel:**

```typescript
// Passwort verschlüsseln
const klartext = 'MeinPasswort123';
const verschluesselt = await bcrypt.hash(klartext, 10);

console.log(verschluesselt);
// Ausgabe: "$2a$10$N9qo8uLOv.KvfH3mhZvxDe..."
// → Nicht mehr rückwärts zu entschlüsseln!
```

**Wichtig:**

- Verschlüsselung ist **Einweg** (nicht umkehrbar)
- Jedes Mal ein anderer Hash, selbst bei gleichem Passwort
- Wir können nur **vergleichen**, nicht entschlüsseln

---

### Schritt 4: JWT Token erstellen

**Was ist ein JWT Token?**

Ein Token ist wie ein Ausweis mit drei Teilen:

```
Header.Payload.Signatur
```

**Code-Beispiel:**

```typescript
// Token erstellen
async erstelleToken(user) {
  // Informationen, die im Token stehen
  const payload = {
    sub: user.id,        // User-ID
    email: user.email,   // Email
    name: user.name      // Name
  };

  // Token signieren (unterschreiben)
  const token = this.jwtService.sign(payload);

  return token;
  // Ergebnis: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**Was steht im Token?**

```typescript
// Wenn wir den Token dekodieren:
{
  sub: "user-123",              // User ID
  email: "max@example.com",     // Email
  name: "Max Mustermann",       // Name
  iat: 1704297600,              // Erstellt am (Timestamp)
  exp: 1704384000               // Läuft ab am (Timestamp)
}
```

**Token ist signiert:**

- Niemand kann ihn fälschen
- Server kann prüfen: "Ist der Token echt?"
- Wie eine Unterschrift auf einem Dokument

---

## Schritt für Schritt: Login

### Was passiert beim Login?

```
Du gibst ein:
  - Email: max@example.com
  - Passwort: MeinGeheimesPasswort123

Das System prüft:
  - Gibt es diese Email?
  - Ist das Passwort richtig?

Wenn ja:
  - Du bekommst einen Token (Ausweis)
  - Du bist eingeloggt!
```

### Schritt 1: Frontend sendet Daten

```typescript
// apps/web/app/login/page.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // NextAuth macht hier die Arbeit für uns
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password
    });

    if (res?.error) {
      setError('Ungültige Anmeldedaten');
    } else {
      router.push('/'); // Zur Startseite
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label>E-Mail</Label>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Label>Passwort</Label>
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit">Anmelden</Button>
    </form>
  );
}
```

---

### Schritt 2: Backend prüft Passwort

```typescript
// Backend Login
@Post('/login')
async login(@Body() daten) {

  // 1. User aus Datenbank holen
  const user = await this.userService.findeUserMitEmail(daten.email);

  if (!user) {
    throw new Error('Email nicht gefunden!');
  }

  // 2. Passwort vergleichen
  const passwortKorrekt = await bcrypt.compare(
    daten.passwort,      // Was der User eingegeben hat
    user.passwort        // Was in der DB steht (verschlüsselt)
  );

  if (!passwortKorrekt) {
    throw new Error('Falsches Passwort!');
  }

  // 3. Token erstellen
  const token = this.authService.erstelleToken(user);

  // 4. Token zurückgeben
  return {
    access_token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
}
```

**Was passiert hier?**

1. **Suchen:** Gibt es einen User mit dieser Email?
2. **Vergleichen:** Stimmt das Passwort?
3. **Token:** Wenn alles passt, Token erstellen
4. **Zurück:** Frontend bekommt den Token

---

### Schritt 3: Passwort-Vergleich mit bcrypt

**Wie vergleicht bcrypt?**

```typescript
// Was der User eingibt
const eingabe = 'MeinPasswort123';

// Was in der Datenbank steht (von Registrierung)
const gespeichert = '$2a$10$N9qo8uLOv...';

// Bcrypt vergleicht
const istKorrekt = await bcrypt.compare(eingabe, gespeichert);

if (istKorrekt) {
  console.log('Passwort stimmt! ✅');
} else {
  console.log('Passwort falsch! ❌');
}
```

**Warum im Backend?**

```
❌ FALSCH (im Frontend):
  → Hacker könnte Code manipulieren
  → Unsicher!

✅ RICHTIG (im Backend):
  → Server hat volle Kontrolle
  → Hacker kann nichts manipulieren
  → Sicher!
```

**Der sichere Weg:**

```
Frontend  → Sendet: "MeinPasswort123" (über HTTPS verschlüsselt)
            ↓
Backend   → Vergleicht mit gespeichertem Hash
            ↓
Backend   → Entscheidet: Richtig oder Falsch
            ↓
Frontend  → Bekommt nur Ergebnis: ✅ oder ❌
```

---

### Schritt 4: NextAuth speichert Session

```typescript
// NextAuth Konfiguration
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // Backend fragen
        const antwort = await fetch('/backend/login', {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            passwort: credentials.passwort,
          }),
        });

        if (!antwort.ok) {
          return null; // Login fehlgeschlagen
        }

        const daten = await antwort.json();

        // User-Objekt zurückgeben
        return {
          id: daten.user.id,
          email: daten.user.email,
          accessToken: daten.access_token, // Token speichern!
        };
      },
    }),
  ],

  // Session-Einstellungen
  session: {
    strategy: 'jwt', // Token-basiert
    maxAge: 24 * 60 * 60, // 1 Tag gültig
  },

  callbacks: {
    // Token in Session speichern
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },

    // Token für Frontend verfügbar machen
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
```

**Was passiert hier?**

- NextAuth ruft unser Backend auf
- Wenn Login erfolgreich, speichert es den Token
- Token wird in einem Cookie gespeichert
- Bei jedem Request verfügbar

---

## Geschützte Bereiche

### Wie schützen wir Seiten?

Manche Seiten sollen nur für eingeloggte Benutzer sichtbar sein.

### Frontend: Seite schützen

```typescript
// Geschützte Seite
function MeineVertraege() {
  const { data: session, status } = useSession();

  // Noch am Laden?
  if (status === 'loading') {
    return <div>Lädt...</div>;
  }

  // Nicht eingeloggt?
  if (!session) {
    return <div>Bitte erst einloggen!</div>;
  }

  // Eingeloggt - Seite zeigen
  return (
    <div>
      <h1>Willkommen, {session.user.name}!</h1>
      <VertragsListe />
    </div>
  );
}
```

**Noch einfacher mit Komponente:**

```typescript
// ProtectedComponent Wrapper
function MeineVertraege() {
  return (
    <ProtectedComponent>
      <h1>Meine Verträge</h1>
      <VertragsListe />
    </ProtectedComponent>
  );
}

// ProtectedComponent Definition
function ProtectedComponent({ children }) {
  const { data: session } = useSession();
  const router = useRouter();

  // Nicht eingeloggt? → Zur Login-Seite
  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session]);

  if (!session) {
    return <div>Lädt...</div>;
  }

  return <>{children}</>;
}
```

---

### Backend: API schützen

**Ohne Schutz (unsicher):**

```typescript
@Get('/vertraege')
async alleVertraege() {
  // PROBLEM: Jeder kann diese Route aufrufen!
  return this.service.alle();
}
```

**Mit Schutz (sicher):**

```typescript
@UseGuards(JwtAuthGuard)  // ← Schutz aktivieren
@Get('/vertraege')
async alleVertraege(@Req() request) {
  // Nur erreichbar mit gültigem Token!

  // User-Info aus Token extrahieren
  const userId = request.user.id;

  // Nur Verträge dieses Users holen
  return this.service.alleVon(userId);
}
```

**Was macht `@UseGuards(JwtAuthGuard)`?**

```
1. Request kommt an
   ↓
2. Guard prüft: Ist ein Token im Header?
   ↓
3. Guard prüft: Ist der Token gültig?
   ↓
4. Guard extrahiert User-Info aus Token
   ↓
5. Guard setzt request.user
   ↓
6. Controller-Methode wird ausgeführt

Falls Token fehlt oder ungültig:
→ Fehler 401 (Unauthorized)
→ Controller wird NICHT ausgeführt
```

---

### API-Request mit Token

**Wie sendet das Frontend den Token?**

```typescript
// Token aus Session holen
function useVertraege() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const laden = async () => {
    // Token im Authorization Header senden
    const antwort = await fetch('/api/vertraege', {
      headers: {
        Authorization: `Bearer ${token}`, // ← Hier ist der Token!
      },
    });

    const vertraege = await antwort.json();
    return vertraege;
  };

  return { laden };
}
```

**Format des Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
               ↑      ↑
               |      └─ Der Token
               └─ "Bearer" = Standard-Präfix
```

---

### JWT Strategy (Backend)

**Wie prüft das Backend den Token?**

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Wo finde ich den Token?
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // Ist ein abgelaufener Token okay? Nein!
      ignoreExpiration: false,

      // Geheimer Schlüssel zum Prüfen der Signatur
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // Wird aufgerufen, wenn Token gültig ist
  async validate(payload) {
    // payload = Inhalt des Tokens
    // { sub: "user-123", email: "max@example.com", ... }

    // User-Objekt für Controller bereitstellen
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
```

**Der Ablauf:**

```
1. Request kommt mit Token
   ↓
2. Strategy extrahiert Token aus Header
   ↓
3. Signatur wird geprüft (mit SECRET_KEY)
   ↓
4. Ist Token abgelaufen? → Fehler
   ↓
5. validate() wird mit Token-Inhalt aufgerufen
   ↓
6. validate() gibt User-Objekt zurück
   ↓
7. User-Objekt wird in request.user gespeichert
   ↓
8. Controller kann request.user nutzen
```

---

## Sicherheit verstehen

### 1. Warum HTTPS wichtig ist

```
❌ OHNE HTTPS (HTTP):
Klartext über Internet:
"Passwort: MeinPasswort123"
→ Jeder kann mitlesen!

✅ MIT HTTPS:
Verschlüsselt über Internet:
"X8#mK2@pL9..."
→ Niemand kann mitlesen!
```

### 2. Warum Passwörter gehasht werden

**Was ist Hashing?**

```typescript
// Einweg-Verschlüsselung
const passwort = 'MeinPasswort123';
const hash = await bcrypt.hash(passwort, 10);

console.log(hash);
// "$2a$10$N9qo8uLOv..."

// Du kannst NICHT zurück rechnen:
// hash → ??? ← geht nicht!
```

**Vorteil:**

```
Hacker knackt Datenbank
  ↓
Sieht: "$2a$10$N9qo8uLOv..."
  ↓
Kann Passwort NICHT herausfinden
  ↓
User sind sicher! ✅
```

### 3. Warum Token ablaufen

```typescript
session: {
  maxAge: 24 * 60 * 60,  // 1 Tag = 86400 Sekunden
}
```

**Warum?**

```
Token gestohlen nach 1 Stunde
  ↓
Hacker kann ihn nutzen
  ↓
Aber nur noch 23 Stunden
  ↓
Danach ungültig
  ↓
Schaden begrenzt
```

### 4. Warum Token im Backend geprüft wird

```
❌ FALSCH (Frontend prüft):
Frontend: "Token okay? Ja! → Daten laden"
→ Hacker kann Code ändern
→ Unsicher!

✅ RICHTIG (Backend prüft):
Backend: "Token okay? Erst prüfen!"
→ Hacker kann nichts ändern
→ Sicher!
```

---

## Der komplette Ablauf (Zusammenfassung)

### Registrierung

```
1. Benutzer füllt Formular aus
   → Email, Passwort, Name

2. Frontend sendet an Backend
   → POST /signup

3. Backend prüft:
   → Email schon vergeben?

4. Backend hasht Passwort
   → "Passwort123" → "$2a$10$..."

5. Backend speichert User
   → In Datenbank

6. Backend erstellt Token
   → JWT mit User-Info

7. Frontend bekommt Token
   → Speichert in Session

8. User ist eingeloggt!
```

### Login

```
1. Benutzer gibt Email + Passwort ein

2. Frontend sendet an Backend
   → POST /login

3. Backend sucht User
   → In Datenbank

4. Backend vergleicht Passwort
   → bcrypt.compare()

5. Wenn korrekt: Token erstellen
   → JWT generieren

6. Frontend bekommt Token
   → Speichert in Session

7. User ist eingeloggt!
```

### Geschützter Bereich aufrufen

```
1. Frontend braucht Daten
   → z.B. Verträge laden

2. Frontend holt Token aus Session

3. Frontend sendet Request + Token
   → GET /vertraege
   → Header: Authorization: Bearer <token>

4. Backend prüft Token
   → JwtAuthGuard

5. Wenn gültig: User-Info extrahieren
   → request.user = { id, email, name }

6. Backend lädt Daten
   → Nur für diesen User

7. Frontend bekommt Daten
   → Zeigt sie an
```

### Logout

```
1. Benutzer klickt "Abmelden"

2. Frontend löscht Session
   → signOut()

3. Token wird ungültig
   → Cookie gelöscht

4. Weiterleitung zu Login
   → router.push('/login')
```

---

## Häufige Fragen

### "Wo wird das Passwort gespeichert?"

```
✅ In der Datenbank
✅ Aber NUR als Hash
❌ NIEMALS im Klartext
```

### "Kann jemand meinen Token klauen?"

```
Schwierig, weil:
✅ HTTPS verschlüsselt die Übertragung
✅ Token ist im httpOnly Cookie (JavaScript kann nicht drauf zugreifen)
✅ Token läuft nach 24h ab

Aber trotzdem aufpassen:
❌ Nicht auf fremden Computern einloggen
❌ Immer ausloggen nach der Nutzung
```

### "Warum NextAuth UND JWT?"

```
NextAuth:
→ Vereinfacht Login/Logout im Frontend
→ Verwaltet Sessions
→ Kümmert sich um Cookies

JWT:
→ Das Format des Tokens
→ Wird vom Backend erstellt und geprüft
→ Enthält User-Informationen

Sie arbeiten zusammen!
```

---

## Zusammenfassung für Anfänger

### Die wichtigsten Punkte:

1. **Passwörter werden NIEMALS im Klartext gespeichert**
   - Nur als Hash mit bcrypt

2. **Passwort-Prüfung passiert IMMER im Backend**
   - Frontend ist nicht vertrauenswürdig

3. **JWT Token = Digitaler Ausweis**
   - Beweist, dass du eingeloggt bist
   - Läuft nach 24 Stunden ab

4. **HTTPS ist Pflicht**
   - Schützt Daten auf dem Weg

5. **Geschützte Routen brauchen Token**
   - Backend: @UseGuards(JwtAuthGuard)
   - Frontend: <ProtectedComponent>

### Der Merksatz:

> **"Hash im Backend, Token im Cookie, Prüfung auf dem Server"**

Das Authentifizierungs-System schützt deine Benutzer und ihre Daten. Es folgt bewährten Sicherheits-Standards und ist production-ready!
