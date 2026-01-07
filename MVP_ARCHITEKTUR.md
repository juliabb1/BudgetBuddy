# MVP Architektur - Schritt für Schritt erklärt

## 📚 Inhaltsverzeichnis

1. [Was ist MVP? - Die Grundlagen](#was-ist-mvp---die-grundlagen)
2. [Warum brauchen wir MVP?](#warum-brauchen-wir-mvp)
3. [Die drei Komponenten im Detail](#die-drei-komponenten-im-detail)
4. [Praktisches Beispiel aus unserem Projekt](#praktisches-beispiel-aus-unserem-projekt)
5. [Der Datenfluss Schritt für Schritt](#der-datenfluss-schritt-für-schritt)
6. [Zusammenfassung](#zusammenfassung)

---

## Was ist MVP? - Die Grundlagen

### Die Idee hinter MVP

**MVP** steht für **Model-View-Presenter**. Es ist ein Muster, das uns hilft, Code sauber zu organisieren.

Stell dir eine Küche vor:

- **Model** = Der Kühlschrank (speichert Zutaten/Daten)
- **View** = Der gedeckte Tisch (zeigt das fertige Essen)
- **Presenter** = Der Koch (holt Zutaten, bereitet sie zu, serviert sie)

### Das Ziel

```
┌─────────────────────────────────────────┐
│ Wir teilen den Code in 3 Bereiche auf: │
└─────────────────────────────────────────┘

📦 MODEL (Datenbank/Backend)
   → Was sind die Daten?
   → Wie speichere ich sie?

🎨 VIEW (React-Komponenten)
   → Wie sieht es aus?
   → Was sieht der Benutzer?

🧠 PRESENTER (Logik in page.tsx)
   → Was passiert, wenn...?
   → Wie verbinde ich alles?
```

---

## Warum brauchen wir MVP?

### Vorteil 1: Ordnung

Durch Aufteilung in Model, View und Presenter wird der Code übersichtlicher:

- **Model** (Backend) = Datenbank-Logik getrennt
- **View** (Komponenten) = UI-Code wiederverwendbar
- **Presenter** (page.tsx) = Business-Logik zentral

### Vorteil 2: Wiederverwendbarkeit

```typescript
// Die gleichen View-Komponenten können überall genutzt werden
<ContractForm onAddContract={addContract} />
<ContractList contracts={contracts} onDeleteContract={deleteContract} />
```

### Vorteil 3: Testbarkeit

Jeder Teil kann separat getestet werden:

- Model: API-Tests
- View: Component-Tests
- Presenter: Integration-Tests

---

## Die drei Komponenten im Detail

### 1️⃣ MODEL - Die Daten

**Was ist das Model?**
Das Model ist **alles, was mit Daten zu tun hat**:

- Datenbank-Operationen
- API-Endpunkte im Backend
- Datenstrukturen

**In unserem Projekt:**

```typescript
// ────────────────────────────────────────
// packages/shared-types/src/contract.ts
// ────────────────────────────────────────
// Definiert, WIE ein Vertrag aussieht

export const ContractDTO = z.object({
  contractId: z.string(),
  name: z.string(),
  price: z.number(),
  cycle: z.enum(['MONTHLY', 'YEARLY']),
  startDate: z.string(),
  debitDayOfMonth: z.number(),
  category: z.string(),
  isActive: z.boolean(),
  documents: z.array(DocumentDTO).optional(),
});
```

**Was passiert hier?**

- Wir definieren die **Struktur** eines Vertrags
- `z.object()` ist ein Zod-Schema → validiert Daten
- Jedes Feld hat einen Typ (`string`, `number`, etc.)
- Gilt für Frontend UND Backend (shared types!)

---

```typescript
// ────────────────────────────────────────
// apps/backend/src/contract/contract.service.ts
// ────────────────────────────────────────

@Injectable()
export class ContractService {
  constructor(private readonly prisma: PrismaService) {}

  async getContractsByUserId(userId: string) {
    const contracts = await this.prisma.contract.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { startDate: 'desc' },
    });

    return contracts;
  }
}
```

**Was passiert hier?**

- `getContractsByUserId()` ist eine **Model-Funktion**
- Fragt die Datenbank: "Gib mir ALLE Verträge von diesem User"
- `where: { userId }` → Filter
- `include: { documents: true }` → Lade auch Dokumente mit
- `orderBy: { startDate: 'desc' }` → Sortierung (neueste zuerst)

---

```typescript
// Einen Vertrag erstellen
async createContract(data: Prisma.ContractCreateInput) {
  return this.prisma.contract.create({ data });
}

// Einen Vertrag löschen
async deleteContract(contractId: string) {
  return this.prisma.contract.delete({
    where: { contractId }
  });
}
```

**Was passiert hier?**

- `create()` → Fügt einen neuen Vertrag in die Datenbank ein
- `delete()` → Löscht einen Vertrag anhand der ID
- Das Model weiß NUR über Datenbank-Operationen Bescheid

**Wichtig:**

- ✅ Model weiß NUR über Daten Bescheid
- ❌ Model weiß NICHT, wie Buttons aussehen
- ❌ Model weiß NICHT, ob Daten auf Desktop oder Handy angezeigt werden

---

### 2️⃣ VIEW - Die Oberfläche

**Was ist die View?**
Die View ist **alles, was der Benutzer sieht**:

- Buttons
- Formulare
- Listen
- Farben, Abstände

**In unserem Projekt:**

```typescript
// ────────────────────────────────────────
// apps/web/components/ContractForm.tsx
// ────────────────────────────────────────

interface ContractFormProps {
  onAddContract: (contract: CreateContractDto) => void;
}

export function ContractForm({ onAddContract }: ContractFormProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = () => {
    onAddContract({
      name,
      price: parseFloat(price),
      // ... weitere Felder
    });
  };

  return (
    <form>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={price} onChange={(e) => setPrice(e.target.value)} />
      <button onClick={handleSubmit}>Hinzufügen</button>
    </form>
  );
}
```

**Was passiert hier?**

- Die Komponente **bekommt eine Funktion** als Prop: `onAddContract`
- Wenn Formular abgeschickt wird → ruft `onAddContract()` auf
- Die Komponente weiß NICHT, was dann passiert (API-Call, etc.)
- Sie zeigt nur das Formular an

---

```typescript
// ────────────────────────────────────────
// apps/web/components/ContractList.tsx
// ────────────────────────────────────────

interface ContractListProps {
  contracts: ContractDTO[];
  onDeleteContract: (id: string) => void;
  onUpdateContract: (id: string, data: Partial<ContractDTO>) => void;
}

export function ContractList({
  contracts,
  onDeleteContract,
  onUpdateContract
}) {
  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.contractId}>
          <h3>{contract.name}</h3>
          <p>{contract.price} €</p>
          <button onClick={() => onDeleteContract(contract.contractId)}>
            Löschen
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Was passiert hier?**

- Komponente bekommt `contracts` (Daten zum Anzeigen)
- Komponente bekommt `onDeleteContract` (Funktion zum Löschen)
- Zeigt jeden Vertrag als Karte an
- Bei Klick auf "Löschen" → ruft Callback auf

**Wichtig:**

- ✅ View ZEIGT nur, was sie bekommt
- ✅ View MELDET Klicks nach außen (über Callbacks)
- ❌ View macht KEINE Berechnungen
- ❌ View spricht NICHT direkt mit der Datenbank

---

### 3️⃣ PRESENTER - Die Logik

**Was ist der Presenter?**
Der Presenter ist das **Gehirn**:

- Holt Daten vom Model
- Bereitet Daten für die View auf
- Reagiert auf Benutzer-Aktionen
- Koordiniert alles

**In unserem Projekt ist das `page.tsx`!**

```typescript
// ────────────────────────────────────────
// apps/web/app/page.tsx
// ────────────────────────────────────────

export default function Home() {
  // 📊 State: Daten speichern
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const token = useAccessToken();
```

**Was passiert hier?**

- `useState` → Speichert Daten im Presenter
- `contracts` → Die Liste der Verträge
- `token` → Authentifizierungs-Token für API-Calls

---

```typescript
// 🔄 Daten beim Start laden
useEffect(() => {
  if (!token) return;

  const fetchContracts = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
```

**Was passiert hier?**

1. `useEffect` → Wird beim Start ausgeführt
2. Prüft, ob Token vorhanden ist
3. Ruft Backend API auf: `/contracts/me`
4. Backend antwortet mit Liste der Verträge
5. Speichert Verträge in `contracts` State

---

```typescript
// ➕ Vertrag hinzufügen
const addContract = async (contract: CreateContractDto) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(contract),
  });

  if (res.ok) {
    // Liste neu laden
    const contractsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (contractsRes.ok) {
      const updatedContracts = await contractsRes.json();
      setContracts(updatedContracts);
    }
  }
};
```

**Was passiert hier?**

1. Nimmt einen neuen Vertrag entgegen
2. Schickt `POST`-Request an Backend → speichert Vertrag
3. Wenn erfolgreich: Lädt komplette Liste neu
4. Aktualisiert `contracts` State → View zeigt neuen Vertrag

---

```typescript
// 🗑️ Vertrag löschen
const deleteContract = async (id: string) => {
  const originalContracts = contracts;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to delete contract');
    }

    // Aus Liste entfernen
    setContracts(contracts.filter((c) => c.contractId !== id));
  } catch (err) {
    // Bei Fehler: Zurückrollen
    setContracts(originalContracts);
    throw err;
  }
};
```

**Was passiert hier?**

1. **Backup erstellen**: Speichert aktuelle Liste
2. Backend-Call: Löscht Vertrag aus Datenbank
3. Wenn erfolgreich: Entfernt aus Liste (filter)
4. Bei Fehler: Stellt alte Liste wieder her (Rollback)

---

```typescript
  // 📤 View-Komponenten nutzen
  return (
    <ProtectedComponent>
      <div>
        <h1>BudgetBuddy</h1>

        {/* Formular-View */}
        <ContractForm onAddContract={addContract} />

        {/* Listen-View */}
        <ContractList
          contracts={contracts}
          onDeleteContract={deleteContract}
          onUpdateContract={updateContract}
        />

        {/* Chart-View */}
        <ContractChart contracts={contracts} />
      </div>
    </ProtectedComponent>
  );
}
```

**Was passiert hier?**

- Der Presenter (page.tsx) **orchestriert** alles
- Gibt Daten (`contracts`) an Views weiter
- Gibt Funktionen (`addContract`, `deleteContract`) an Views weiter
- Views sind "dumm" - sie zeigen nur an und melden Klicks

**Wichtig:**

- ✅ Presenter HOLT Daten vom Model (Backend)
- ✅ Presenter VERARBEITET Benutzer-Aktionen
- ✅ Presenter GIBT aufbereitete Daten an View
- ❌ Presenter rendert NICHT direkt HTML (nutzt View-Komponenten)

---

## Praktisches Beispiel aus unserem Projekt

Schauen wir uns an, wie **alle drei zusammenarbeiten**, wenn ein Benutzer einen Vertrag löschen will:

### Schritt 1: Die View meldet Klick

```typescript
// ────────────────────────────────────────
// apps/web/components/ContractList.tsx
// ────────────────────────────────────────

export function ContractList({ contracts, onDeleteContract }) {
  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.contractId}>
          <h3>{contract.name}</h3>

          {/* Benutzer klickt hier */}
          <button onClick={() => onDeleteContract(contract.contractId)}>
            Löschen
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Was passiert hier?**

1. View zeigt Button an
2. Benutzer klickt auf "Löschen"
3. Button ruft `onDeleteContract(id)` auf
4. View weiß NICHT, was danach passiert

---

### Schritt 2: Der Presenter verarbeitet

```typescript
// ────────────────────────────────────────
// apps/web/app/page.tsx
// ────────────────────────────────────────

export default function Home() {
  const deleteContract = async (id: string) => {
    const originalContracts = contracts;

    try {
      // 1. Backend-Call (Model)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/contracts/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error('Failed');

      // 2. UI aktualisieren
      setContracts(contracts.filter(c => c.contractId !== id));
    } catch (err) {
      setContracts(originalContracts);
    }
  };

  return (
    <ContractList
      contracts={contracts}
      onDeleteContract={deleteContract}  // Funktion weitergeben
    />
  );
}
```

**Was passiert hier?**

1. Presenter empfängt DELETE-Aufruf
2. Macht Backup der aktuellen Liste
3. Fragt Backend (Model), ob Löschen OK ist
4. Bei Erfolg: Entfernt aus Liste
5. Bei Fehler: Macht Rollback

---

### Schritt 3: Das Model (Backend)

```typescript
// ────────────────────────────────────────
// apps/backend/src/contract/contract.controller.ts
// ────────────────────────────────────────

@Controller('contracts')
export class ContractController {
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteContract(@Param('id') id: string) {
    return this.contractService.deleteContract(id);
  }
}
```

**Was passiert hier?**

1. Controller empfängt DELETE-Request
2. `@UseGuards(JwtAuthGuard)` → Prüft Authentifizierung
3. Leitet an Service weiter

---

```typescript
// ────────────────────────────────────────
// apps/backend/src/contract/contract.service.ts
// ────────────────────────────────────────

async deleteContract(contractId: string) {
  return this.prisma.contract.delete({
    where: { contractId }
  });
}
```

**Was passiert hier?**

1. Service löscht aus Datenbank
2. Gibt Erfolg/Fehler zurück

---

## Der Datenfluss Schritt für Schritt

### Szenario: Benutzer löscht einen Vertrag

```
┌─────────────────────────────────────────────────────────┐
│ 1. BENUTZER klickt "Löschen"-Button                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. VIEW (ContractList.tsx)                             │
│    → Button ruft onDeleteContract(id) auf              │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. PRESENTER (page.tsx)                                │
│    → deleteContract() wird ausgeführt                  │
│    → Backup erstellen                                  │
│    → Backend API aufrufen                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP DELETE /contracts/123
                     │ Authorization: Bearer <token>
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. MODEL (Backend Controller)                          │
│    → @UseGuards prüft Token                            │
│    → Leitet an Service weiter                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. MODEL (Backend Service)                             │
│    → prisma.contract.delete({ where: { contractId } }) │
│    → Datenbank: Vertrag wird gelöscht                  │
└────────────────────┬────────────────────────────────────┘
                     │ Response: 200 OK
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. PRESENTER (page.tsx)                                │
│    → Response empfangen (200 OK)                       │
│    → setContracts(contracts.filter(...))               │
│    → State aktualisiert                                │
└────────────────────┬────────────────────────────────────┘
                     │ State Changed
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. VIEW (ContractList.tsx)                             │
│    → React Re-Render                                   │
│    → Neue contracts-Liste anzeigen                     │
│    → Vertrag ist weg!                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 8. BENUTZER sieht: Vertrag gelöscht ✅                 │
└─────────────────────────────────────────────────────────┘
```

---

### Szenario: Seite wird geladen

```
┌─────────────────────────────────────────────────────────┐
│ 1. BENUTZER öffnet die Seite                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 2. PRESENTER (page.tsx)                                │
│    → useEffect wird ausgeführt                         │
│    → Token vorhanden? Ja!                              │
│    → fetchContracts() aufrufen                         │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP GET /contracts/me
                     │ Authorization: Bearer <token>
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 3. MODEL (Backend Controller)                          │
│    → JwtAuthGuard extrahiert userId aus Token         │
│    → req.user = { userId: "123", ... }                 │
│    → Leitet an Service weiter                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 4. MODEL (Backend Service)                             │
│    → prisma.contract.findMany({ where: { userId } })  │
│    → include: { documents: true }                      │
│    → orderBy: { startDate: 'desc' }                    │
└────────────────────┬────────────────────────────────────┘
                     │ Response: [{ contractId: '1', ... }]
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 5. PRESENTER (page.tsx)                                │
│    → Response empfangen                                │
│    → setContracts(data)                                │
│    → State aktualisiert                                │
└────────────────────┬────────────────────────────────────┘
                     │ State Changed
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 6. VIEW (ContractList.tsx + ContractChart.tsx)        │
│    → Bekommt contracts-Array                           │
│    → React rendert Komponenten                         │
│    → Liste + Chart werden angezeigt                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ 7. BENUTZER sieht: Alle Verträge! 📋                   │
└─────────────────────────────────────────────────────────┘
```

---

## Zusammenfassung

### Die goldene Regel

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│  MODEL     → "Was sind die Daten?"     → Backend      │
│  VIEW      → "Wie sieht es aus?"       → Komponenten  │
│  PRESENTER → "Was passiert wenn...?"   → page.tsx     │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Unser Projekt im Überblick

```
finanzgurufuerarme/
├── apps/backend/          ← MODEL
│   └── src/contract/
│       ├── contract.service.ts      (Datenbank-Logik)
│       └── contract.controller.ts   (API-Endpunkte)
│
├── apps/web/
│   ├── components/        ← VIEW
│   │   ├── ContractForm.tsx         (UI für Formular)
│   │   ├── ContractList.tsx         (UI für Liste)
│   │   ├── ContractChart.tsx        (UI für Diagramm)
│   │   └── CostSummary.tsx          (UI für Kosten)
│   │
│   └── app/
│       └── page.tsx                 ← PRESENTER
│           - fetchContracts()        (Daten laden)
│           - addContract()           (Vertrag erstellen)
│           - deleteContract()        (Vertrag löschen)
│           - updateContract()        (Vertrag bearbeiten)
│
└── packages/shared-types/ ← MODEL (Datenstrukturen)
    └── src/contract.ts              (TypeScript-Typen)
```

### Faustregel zum Einordnen

| Frage                              | Antwort | Kategorie     |
| ---------------------------------- | ------- | ------------- |
| Spreche ich mit der Datenbank?     | Ja →    | **Model**     |
| Zeige ich Buttons/Farben/Layout?   | Ja →    | **View**      |
| Verarbeite ich Klicks/Laden/Logik? | Ja →    | **Presenter** |

### Vorteile

✅ **Ordnung:** Backend/Frontend klar getrennt  
✅ **Wiederverwendbar:** View-Komponenten an mehreren Stellen nutzbar  
✅ **Wartbar:** Änderungen am UI beeinflussen Backend nicht  
✅ **Testbar:** Jeder Teil kann separat getestet werden  
✅ **Verständlich:** Klare Struktur, leicht zu verstehen

### Merksatz

> **"Das Model weiß, die View zeigt, der Presenter denkt"**

---

**Fertig!** Du verstehst jetzt MVP! 🎉
