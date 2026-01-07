# Authentifizierung - Schritt für Schritt erklärt

## 📚 Inhaltsverzeichnis

1. [Was ist Authentifizierung?](#was-ist-authentifizierung)
2. [Wie funktioniert unsere Authentifizierung?](#wie-funktioniert-unsere-authentifizierung)
3. [Schritt 1: Registrierung](#schritt-1-registrierung)
4. [Schritt 2: Login](#schritt-2-login)
5. [Schritt 3: Geschützte Routen](#schritt-3-geschützte-routen)
6. [Sicherheit: Warum bcrypt?](#sicherheit-warum-bcrypt)
7. [Zusammenfassung](#zusammenfassung)

---

## Was ist Authentifizierung?

### Die Idee

**Authentifizierung** bedeutet: **"Beweisen, wer du bist"**

Stell dir ein Haus vor:

- 🏠 **Das Haus** = Unsere App
- 🔑 **Der Schlüssel** = Dein Passwort
- 🆔 **Der Personalausweis** = Dein JWT-Token
- 🚪 **Die Tür** = Login

**Ablauf:**

1. Du zeigst deinen Schlüssel (Passwort)
2. Wenn richtig → bekommst du einen Ausweis (Token)
3. Mit dem Ausweis kommst du ins Haus rein (geschützte Routen)

### Warum brauchen wir das?

Ohne Authentifizierung könnte **jeder**:

- Deine Verträge sehen
- Deine Daten ändern
- Sich als du ausgeben

**Mit Authentifizierung:**

- ✅ Nur du siehst deine Daten
- ✅ Niemand kann sich als du ausgeben
- ✅ Dein Passwort ist sicher gespeichert

---

## Wie funktioniert unsere Authentifizierung?

### Übersicht

```
┌────────────────────────────────────────────────────────┐
│                  Unser System                          │
└────────────────────────────────────────────────────────┘

🔐 bcrypt        → Passwörter verschlüsseln
🎫 JWT           → Token erstellen
🔒 NextAuth.js   → Session verwalten
🛡️ Guards        → Routen schützen
```

### Die drei Schritte

```
1️⃣ REGISTRIERUNG
   → User erstellt Account
   → Passwort wird verschlüsselt (bcrypt)
   → User wird in Datenbank gespeichert

2️⃣ LOGIN
   → User gibt Email + Passwort ein
   → Backend prüft Passwort (bcrypt.compare)
   → Wenn richtig: JWT-Token wird erstellt

3️⃣ GESCHÜTZTE ROUTEN
   → User sendet Token mit jedem Request
   → Backend prüft Token (JwtAuthGuard)
   → Wenn gültig: Zugriff erlaubt
```

---

## Schritt 1: Registrierung

### Der Ablauf

```
BENUTZER              FRONTEND              BACKEND              DATENBANK
   │                     │                     │                     │
   │  Formular          │                     │                     │
   │ ausfüllen          │                     │                     │
   │─────────────────→  │                     │                     │
   │                     │  POST /user        │                     │
   │                     │  { name, email,    │                     │
   │                     │    password }      │                     │
   │                     │───────────────────→│                     │
   │                     │                     │  Passwort          │
   │                     │                     │  verschlüsseln     │
   │                     │                     │  (bcrypt.hash)     │
   │                     │                     │                     │
   │                     │                     │  User speichern    │
   │                     │                     │────────────────────→│
   │                     │                     │                     │
   │                     │  { success }       │                     │
   │                     │←───────────────────│                     │
   │  "Erfolgreich      │                     │                     │
   │  registriert!"     │                     │                     │
   │←─────────────────  │                     │                     │
```

### Code: Frontend

```typescript
// ────────────────────────────────────────
// apps/web/app/register/page.tsx
// ────────────────────────────────────────

async function handleRegister(name: string, email: string, password: string) {
  // Passwort verschlüsseln (bcrypt)
  const hashedPassword = await bcrypt.hash(password, 10);

  // An Backend senden
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      passwordHash: hashedPassword,
    }),
  });

  if (res.ok) {
    alert('Registrierung erfolgreich!');
  }
}
```

**Was passiert hier?**

1. User gibt Name, Email + Passwort ein
2. **WICHTIG**: Passwort wird bereits im **Frontend** verschlüsselt
3. Frontend schickt `POST`-Request an `/api/register`
4. Der **Hash** wird gesendet (nicht das Klartext-Passwort!)

---

### Code: Backend - Controller

```typescript
// ────────────────────────────────────────
// apps/backend/src/user/user.controller.ts
// ────────────────────────────────────────

@Controller('user')
export class UserController {
  @Post()
  async createUser(@Body() user: CreateUserInput) {
    try {
      return await this.userService.createUser({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash, // Schon gehashed!
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Email existiert bereits
        throw new HttpException('User mit dieser Mail existiert bereits.', 400);
      }
      throw error;
    }
  }
}
```

**Was passiert hier?**

1. Controller empfängt Request
2. `@Body()` extrahiert `{ name, email, passwordHash }` aus Request
3. **Wichtig**: `passwordHash` ist bereits verschlüsselt!
4. Leitet an `userService.createUser()` weiter
5. Bei Fehler `P2002` (Unique Constraint) → Email existiert schon

---

### Code: Backend - Service

```typescript
// ────────────────────────────────────────
// apps/backend/src/user/user.service.ts
// ────────────────────────────────────────

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    name: string;
    email: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
      },
    });
  }
}
```

**Was passiert hier?**

1. Service speichert User in Datenbank
2. `passwordHash` wird direkt gespeichert (ist schon verschlüsselt)
3. Original-Passwort wird **niemals** gespeichert

---

### Was ist bcrypt.hash()?

```typescript
bcrypt.hash(password, saltRounds);
```

**Parameter:**

- `password` → Das Passwort im Klartext
- `saltRounds` → Wie oft verschlüsselt wird (10 = sehr sicher)

**Beispiel:**

```typescript
const password = 'MeinPasswort123';
const hash = await bcrypt.hash(password, 10);

console.log(password);
// → "MeinPasswort123"

console.log(hash);
// → "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

**Was macht bcrypt?**

1. Nimmt dein Passwort
2. Fügt "Salz" hinzu (Zufallsdaten)
3. Verschlüsselt es 2^10 = 1024 Mal
4. Gibt einen Hash zurück

**Wichtig:**

- Gleicher Input → **unterschiedliche Hashes** (wegen Salz)
- Hash → **nicht umkehrbar** (kann nicht entschlüsselt werden)

```typescript
// Gleiche Passwörter → unterschiedliche Hashes!
bcrypt.hash("test", 10) → "$2b$10$abc..."
bcrypt.hash("test", 10) → "$2b$10$xyz..."
```

---

## Schritt 2: Login

### Der Ablauf

```
BENUTZER              FRONTEND              BACKEND              DATENBANK
   │                     │                     │                     │
   │  Login-Formular    │                     │                     │
   │─────────────────→  │                     │                     │
   │                     │  POST /user/login  │                     │
   │                     │  { email, pw }     │                     │
   │                     │───────────────────→│                     │
   │                     │                     │  User suchen       │
   │                     │                     │────────────────────→│
   │                     │                     │  { email, hash }   │
   │                     │                     │←────────────────────│
   │                     │                     │                     │
   │                     │                     │  Passwort prüfen   │
   │                     │                     │  bcrypt.compare()  │
   │                     │                     │                     │
   │                     │                     │  JWT erstellen     │
   │                     │                     │                     │
   │                     │  { access_token,   │                     │
   │                     │    user }          │                     │
   │                     │←───────────────────│                     │
   │  ✅ Eingeloggt!    │                     │                     │
   │←─────────────────  │                     │                     │
```

### Code: Backend - Login Controller

```typescript
// ────────────────────────────────────────
// apps/backend/src/user/user.controller.ts
// ────────────────────────────────────────

@Post('login')
async login(@Body() loginData: LoginInput) {
  const { email, password } = loginData;

  // 1. User aus Datenbank holen
  const user = await this.userService.getUser({ email });

  if (!user) {
    throw new HttpException('Invalid credentials', 401);
  }

  // 2. Passwort vergleichen
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new HttpException('Invalid credentials', 401);
  }

  // 3. JWT-Token erstellen
  return this.authService.login(user);
}
```

**Was passiert hier?**

**Schritt 1:** User aus Datenbank holen

- Sucht User anhand Email
- Wenn nicht gefunden → Fehler 401 (Unauthorized)

**Schritt 2:** Passwort vergleichen

```typescript
bcrypt.compare(eingabe, hash);
```

- `eingabe` = Was der User eingibt (`"MeinPasswort123"`)
- `hash` = Was in der DB steht (`"$2b$10$N9q..."`)
- bcrypt verschlüsselt die Eingabe und vergleicht
- Gibt `true` oder `false` zurück

**Schritt 3:** JWT-Token erstellen

- Leitet an `authService.login()` weiter

---

### Code: Backend - Auth Service

```typescript
// ────────────────────────────────────────
// apps/backend/src/auth/auth.service.ts
// ────────────────────────────────────────

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: User) {
    // Payload: Daten, die im Token gespeichert werden
    const payload = {
      email: user.email,
      sub: user.userId, // "sub" = User-ID (JWT-Standard)
      name: user.name,
    };

    // JWT-Token erstellen
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name,
      },
    };
  }
}
```

**Was passiert hier?**

1. Erstellt ein `payload`-Objekt mit User-Daten
2. `jwtService.sign()` erstellt den JWT-Token
3. Gibt Token + User-Daten zurück

---

### Was ist bcrypt.compare()?

```typescript
bcrypt.compare(plaintext, hash);
```

**Wie funktioniert das?**

```typescript
// Beim Registrieren:
const hash = await bcrypt.hash('MeinPasswort123', 10);
// → "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

// Beim Login:
const isValid = await bcrypt.compare('MeinPasswort123', hash);
// → true ✅

const isValid2 = await bcrypt.compare('FalschesPasswort', hash);
// → false ❌
```

**Warum ist das sicher?**

1. bcrypt nimmt das eingegebene Passwort
2. Verschlüsselt es **genauso** wie beim Registrieren
3. Vergleicht die beiden Hashes
4. Original-Passwort wird **nie** entschlüsselt!

---

### Was ist ein JWT-Token?

**JWT** = JSON Web Token

**Aufbau:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAbWFpbC5jb20iLCJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiIsImlhdCI6MTY5NDU1MDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│────────── Header ──────────│────────── Payload ──────────│────────── Signature ──────────│
```

**Drei Teile (getrennt durch `.`):**

1. **Header**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload** (Daten)

```json
{
  "email": "user@mail.com",
  "sub": "123",
  "name": "John",
  "iat": 1694550000
}
```

3. **Signature** (Signatur)

- Verhindert Manipulation
- Kann nur mit Secret-Key erstellt werden

---

### Code: Frontend - Token speichern

```typescript
// ────────────────────────────────────────
// apps/web/lib/auth.tsx
// ────────────────────────────────────────

export function useAccessToken() {
  const session = useSession();

  // Token aus Session holen
  return session?.data?.user?.accessToken;
}
```

**Was passiert hier?**

1. NextAuth.js speichert Session (im Cookie)
2. Session enthält den Token
3. Hook gibt Token zurück

---

## Schritt 3: Geschützte Routen

### Der Ablauf

```
FRONTEND                         BACKEND                    DATENBANK
   │                                │                           │
   │  GET /contracts/me             │                           │
   │  Authorization: Bearer <token> │                           │
   │───────────────────────────────→│                           │
   │                                │  Token prüfen             │
   │                                │  (JwtAuthGuard)           │
   │                                │  JwtStrategy.validate()   │
   │                                │                           │
   │                                │  User-ID aus Token        │
   │                                │  extrahieren              │
   │                                │  req.user = { userId }    │
   │                                │                           │
   │                                │  Verträge laden           │
   │                                │  WHERE userId = <id>      │
   │                                │──────────────────────────→│
   │                                │  [contracts]              │
   │                                │←──────────────────────────│
   │  [contracts]                   │                           │
   │←───────────────────────────────│                           │
```

### Code: Frontend - Request mit Token

```typescript
// ────────────────────────────────────────
// apps/web/app/page.tsx
// ────────────────────────────────────────

export default function Home() {
  const token = useAccessToken();

  useEffect(() => {
    const fetchContracts = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Token mitschicken!
          },
        },
      );

      if (res.ok) {
        const data = await res.json();
        setContracts(data);
      }
    };

    fetchContracts();
  }, [token]);
}
```

**Was passiert hier?**

1. Request an Backend
2. **Header** enthält Token: `Authorization: Bearer <token>`
3. Backend prüft Token mit `JwtAuthGuard`

---

### Code: Backend - Route schützen

```typescript
// ────────────────────────────────────────
// apps/backend/src/contract/contract.controller.ts
// ────────────────────────────────────────

@Controller('contracts')
export class ContractController {
  @UseGuards(JwtAuthGuard) // 🛡️ Nur eingeloggte User!
  @Get('me')
  async getMyContracts(@Request() req) {
    // req.user wurde vom Guard gesetzt
    const userId = req.user.userId;

    return this.contractService.getContractsByUserId(userId);
  }
}
```

**Was passiert hier?**

1. `@UseGuards(JwtAuthGuard)` → Prüft Token
2. Wenn Token gültig → User-Daten in `req.user` gesetzt
3. Controller kann `req.user.userId` nutzen

---

### Code: JWT Strategy (Token prüfen)

```typescript
// ────────────────────────────────────────
// apps/backend/src/auth/jwt.strategy.ts
// ────────────────────────────────────────

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // Wird aufgerufen, wenn Token gültig ist
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
```

**Was passiert hier?**

**Schritt 1:** Token extrahieren

```typescript
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken();
```

- Liest `Authorization: Bearer <token>` Header
- Extrahiert den Token

**Schritt 2:** Token verifizieren

```typescript
secretOrKey: configService.get<string>('JWT_SECRET');
```

- Prüft Signatur des Tokens mit Secret-Key
- Wenn Signatur nicht passt → Fehler (Token ungültig)

**Schritt 3:** Payload extrahieren

```typescript
validate(payload) {
  return {
    userId: payload.sub,
    email: payload.email,
    name: payload.name
  };
}
```

- Wenn Token gültig → `payload` enthält die Daten
- Rückgabe wird in `req.user` gespeichert

---

### Was macht der JwtAuthGuard?

```
1. Request kommt rein
   └→ Authorization: Bearer eyJhbGci...

2. Guard extrahiert Token
   └→ Token = eyJhbGci...

3. Guard verifiziert Token
   └→ Signatur prüfen mit JWT_SECRET
   └→ Signatur stimmt? ✅

4. Guard extrahiert Payload
   └→ { email: "user@mail.com", sub: "123", name: "John" }

5. Guard ruft validate() auf
   └→ return { userId: "123", email: "user@mail.com", name: "John" }

6. Guard setzt req.user
   └→ req.user = { userId: "123", email: "user@mail.com", name: "John" }

7. Controller hat Zugriff
   └→ const userId = req.user.userId;
```

---

## Sicherheit: Warum bcrypt?

### Das Problem: Einfaches Hashing

```typescript
// ❌ UNSICHER: Einfaches Hashing
const hash = crypto.createHash('md5').update(password).digest('hex');
```

**Warum ist das unsicher?**

1. Gleicher Input → immer gleicher Hash
2. Sehr schnell zu berechnen
3. Angreifer können **Rainbow Tables** nutzen

**Rainbow Table:**

```
Passwort        →  MD5-Hash
"123456"        →  "e10adc3949ba59abbe56e057f20f883e"
"password"      →  "5f4dcc3b5aa765d61d8327deb882cf99"
"qwerty"        →  "d8578edf8458ce06fbc5bb76a58c5ca4"
```

Angreifer vergleicht einfach die Hashes!

---

### Die Lösung: bcrypt

```typescript
// ✅ SICHER: bcrypt mit Salz
const hash = await bcrypt.hash(password, 10);
```

**Warum ist das sicher?**

**1. Salz (Salt)**

```typescript
// Gleiches Passwort → unterschiedliche Hashes!
bcrypt.hash("test", 10) → "$2b$10$abc123..."
bcrypt.hash("test", 10) → "$2b$10$xyz789..."
```

- Jeder Hash hat ein zufälliges "Salz"
- Rainbow Tables funktionieren nicht mehr

**2. Langsam (by Design)**

```typescript
saltRounds = 10  →  2^10 = 1024 Iterationen
```

- Für uns: 0.1 Sekunden (OK)
- Für Angreifer: Milliarden Versuche = Jahre

**3. Zukunftssicher**

```typescript
// In 5 Jahren, wenn Computer schneller sind:
saltRounds = 12  →  2^12 = 4096 Iterationen
```

- Wir können `saltRounds` erhöhen
- Alte Hashes bleiben gültig

---

### bcrypt vs. plain text

```
┌──────────────────┬─────────────────┬────────────────────┐
│  Methode         │  Gespeichert    │  Sicherheit        │
├──────────────────┼─────────────────┼────────────────────┤
│  Plain Text      │  "test123"      │  ❌ Katastrophal  │
│  MD5             │  "cc03e..."     │  ❌ Unsicher       │
│  SHA-256         │  "9f86d..."     │  ⚠️  Nicht gut    │
│  bcrypt          │  "$2b$10$..."   │  ✅ Sehr sicher   │
└──────────────────┴─────────────────┴────────────────────┘
```

**Was passiert bei einem Hack?**

| Methode    | Angreifer kann...                    |
| ---------- | ------------------------------------ |
| Plain Text | Sofort alle Passwörter sehen         |
| MD5        | In Sekunden cracken (Rainbow Tables) |
| SHA-256    | In Minuten cracken (GPU-Cluster)     |
| bcrypt     | Jahrelang versuchen (fast unmöglich) |

---

## Zusammenfassung

### Der komplette Ablauf

**1. Registrierung**

```typescript
Frontend  →  POST /user { name, email, password }
             ↓
Frontend  →  bcrypt.hash(password, 10) = hash
             ↓
Backend   →  Speichert { name, email, passwordHash: hash }
```

**2. Login**

```typescript
Frontend  →  POST /user/login { email, password }
             ↓
Backend   →  User aus DB laden
             bcrypt.compare(password, user.passwordHash)
             JWT erstellen mit { sub: userId, email, name }
             ↓
Frontend  →  Token speichern (Session)
```

**3. Geschützte Route**

```typescript
Frontend  →  GET /contracts/me
             Authorization: Bearer <token>
             ↓
Backend   →  JwtAuthGuard prüft Token
             JwtStrategy.validate() extrahiert User-ID
             req.user = { userId, email, name }
             ↓
Backend   →  Daten für diesen User laden
             ↓
Frontend  →  Daten anzeigen
```

---

### Die wichtigsten Funktionen

```typescript
// Passwort verschlüsseln (Frontend beim Registrieren)
const hash = await bcrypt.hash(password, 10);

// Passwort prüfen (Backend beim Login)
const isValid = await bcrypt.compare(password, hash);

// JWT erstellen (Backend nach erfolgreichem Login)
const token = jwtService.sign({ sub: userId, email, name });

// JWT prüfen (automatisch im JwtAuthGuard)
@UseGuards(JwtAuthGuard)
→ req.user = { userId, email, name }
```

---

### Sicherheits-Checkliste

✅ **Passwörter werden mit bcrypt verschlüsselt (saltRounds: 10)**
✅ **Hashing passiert im Frontend (vor dem Senden)**
✅ **bcrypt.compare() zum Validieren (nicht decrypt)**
✅ **JWT-Tokens für Authentifizierung**
✅ **JwtAuthGuard schützt sensible Routen**
✅ **User-ID aus Token extrahieren (nicht vom Frontend)**

---

### Häufige Fehler (Was NICHT tun)

```typescript
// ❌ FALSCH: Passwort als Klartext senden
fetch('/api/register', { body: JSON.stringify({ password }) });

// ✅ RICHTIG: Hash senden
const hash = await bcrypt.hash(password, 10);
fetch('/api/register', { body: JSON.stringify({ passwordHash: hash }) });
```

```typescript
// ❌ FALSCH: Passwort entschlüsseln
const password = bcrypt.decrypt(hash); // Geht NICHT!

// ✅ RICHTIG: Passwort vergleichen
const isValid = await bcrypt.compare(password, hash);
```

```typescript
// ❌ FALSCH: User-ID vom Frontend akzeptieren
@Get('contracts')
getContracts(@Body('userId') userId: string) { }

// ✅ RICHTIG: User-ID aus Token holen
@UseGuards(JwtAuthGuard)
@Get('contracts/me')
getContracts(@Request() req) {
  const userId = req.user.userId;
}
```

---

### Merksätze

> **"Passwörter im Frontend hashen, als Hash senden!"**

> **"bcrypt.compare() vergleicht, decrypt gibt es nicht!"**

> **"User-ID immer aus Token, nie vom Frontend!"**

---

**Fertig!** Du verstehst jetzt Authentifizierung! 🔐
