# MVP Architektur - Schritt für Schritt erklärt

## 📚 Inhaltsverzeichnis

1. [Was ist MVP? - Die Grundlagen](#was-ist-mvp---die-grundlagen)
2. [Warum brauchen wir MVP?](#warum-brauchen-wir-mvp)
3. [Die drei Komponenten im Detail](#die-drei-komponenten-im-detail)
4. [Praktisches Beispiel aus unserem Projekt](#praktisches-beispiel-aus-unserem-projekt)
5. [Der Datenfluss Schritt für Schritt](#der-datenfluss-schritt-für-schritt)
6. [Zusammenfassung](#zusammenfassung)

---

## Was ist MVP?

**MVP** steht für **Model-View-Presenter**. Das ist ein Architekturmuster, das uns hilft, unseren Code zu organisieren.

### Die Grundidee (ganz einfach):

Stell dir vor, du hast eine Webseite, auf der Benutzer ihre Verträge verwalten können. Ohne ein Muster würdest du vielleicht alles in eine Datei schreiben:

```typescript
// ❌ Alles durcheinander - NICHT GUT!
function VertragSeite() {
  // Datenbank-Logik
  const vertrag = database.find(...);

  // Berechnungen
  const preis = vertrag.preis * 1.19;

  // HTML anzeigen
  return <div>{preis}</div>;

  // Button-Klicks verarbeiten
  onClick = () => { database.save(...) }
}
```

**Problem:** Alles ist vermischt! Schwer zu verstehen, schwer zu testen, schwer zu ändern.

**Lösung mit MVP:** Wir teilen den Code in drei klare Bereiche auf:

```
Model      → Kümmert sich um die Daten
View       → Zeigt die Oberfläche
Presenter  → Verbindet beides und enthält die Logik
```

---

## Warum MVP?

### Vorteile auf einen Blick:

**1. Übersichtlichkeit**

- Jeder Code hat seinen Platz
- Leichter zu finden, was man sucht

**2. Wiederverwendbarkeit**

- Dieselbe View kann mit verschiedenen Presentern arbeiten
- Derselbe Presenter kann mit verschiedenen Views arbeiten

**3. Testbarkeit**

- Jeder Teil kann einzeln getestet werden
- Keine echte Datenbank für Tests nötig

**4. Teamarbeit**

- Eine Person kann an der View arbeiten
- Eine andere an der Geschäftslogik
- Ohne sich gegenseitig zu stören

---

## Die drei Komponenten

### 1️⃣ Model (Die Daten)

**Was macht das Model?**

- Speichert Daten in der Datenbank
- Holt Daten aus der Datenbank
- Definiert, wie Daten aussehen

**Einfaches Beispiel (aus packages/shared-types):**

```typescript
// Das ist ein Vertrag - die Datenstruktur (Model)
export const ContractDTO = z.object({
  contractId: z.string(),
  userId: z.string(),
  name: z.string(),           // z.B. "Kfz-Versicherung"
  price: z.number(),          // z.B. 780
  cycle: CycleSchema,         // MONTHLY, QUARTERLY, ...
  startDate: z.date(),
  isActive: z.boolean(),
  category: CategorySchema,   // INSURANCE, ENERGY, ...
  documents: z.array(...)
});
```

**Backend Service (macht die eigentliche Arbeit):**

```typescript
// apps/backend/src/contract/contract.service.ts
@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  // Alle Verträge eines Benutzers holen
  async getContractsByUserId(userId: string) {
    return this.prisma.contract.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  // Einen neuen Vertrag speichern
  async createContract(contract: Prisma.ContractCreateInput) {
    return this.prisma.contract.create({ data: contract });
  }
}
```

**Wichtig zu verstehen:**

- Das Model kennt keine Buttons oder Formulare
- Es weiß nur: "Wie speichere ich Daten?" und "Wie hole ich Daten?"

---

### 2️⃣ View (Die Oberfläche)

**Was macht die View?**

- Zeigt Dinge auf dem Bildschirm
- Empfängt Benutzer-Eingaben (Klicks, Tippen)
- Gibt Informationen an den Presenter weiter

**Einfaches Beispiel (aus apps/web/components/ContractList.tsx):**

```typescript
// Eine Liste von Verträgen anzeigen
export function ContractList({ contracts, onDeleteContract, onUpdateContract }) {
  // Presenter Hook nutzen
  const { handleEdit, handleDeleteConfirmation } = useContractList(onUpdateContract);

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <Card key={contract.contractId}>
          <div className="p-6">
            {/* Name anzeigen */}
            <h3>{contract.name}</h3>

            {/* Preis anzeigen */}
            <span>{formatCurrency(contract.price)}</span>

            {/* Buttons */}
            <Button onClick={() => handleEdit(contract)}>
              Bearbeiten
            </Button>
            <Button onClick={() => {
              if (handleDeleteConfirmation(contract.name)) {
                onDeleteContract(contract.contractId);
              }
            }}>
              Löschen
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Wichtig zu verstehen:**

- Die View macht KEINE Berechnungen
- Sie fragt NICHT die Datenbank ab
- Sie zeigt nur das, was sie bekommt
- Sie meldet Klicks an den Presenter

---us apps/web/hooks/useContractList.ts):\*\*

```typescript
// useContractList ist unser Presenter
export function useContractList(onUpdateContract) {
  const [editingContract, setEditingContract] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Wenn Benutzer "Bearbeiten" klickt
  const handleEdit = (contract: ContractDTO) => {
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  // Wenn Benutzer "Speichern" klickt
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
      // Sage dem Model: Update den Vertrag
      onUpdateContract(editingContract.contractId, {
        name: editingContract.name,
        price: Number(editingContract.price),
        cycle: editingContract.cycle,
        // ... weitere Felder
      });
      setIsDialogOpen(false);
    }
  };

  // Löschbestätigung
  const handleDeleteConfirmation = (name: string) => {
    return window.confirm(`Vertrag "${name}" wirklich löschen?`);
  };

  // Gib alles zurück, was die View braucht
  return { editingContract, handleEdit, handleUpdate, handleDeleteConfirmation
      // 3. Update die lokalen Daten
      setVertraege(vertraege.filter(v => v.id !== id));
    }
  };

  // Gib alles zurück, was die View braucht
  return {
    vertraege,
    handleLoeschen
  };
}
```

**Wichtig zu verstehen:**

- Der Presenter ist das "Gehirn"
- Er verbindet Model und View
- Er enthält die Logik: "Was passiert, wenn...?"

---

## Wie arbeiten sie zusammen?

### Ein vollständiges Beispiel

Schauen wir uns an, wie alle drei zusammenarbeiten, wenn ein Benutzer einen Vertrag löschen will:

```
Schritt 1: Benutzer klickt "Löschen"-Button
    ↓
Schritt 2: View ruft onLoeschen() auf
    ↓
Schritt 3: Presenter (Hook) führt handleLoeschen() aus
    ↓
Schritt 4: Presenter fragt Benutzer: "Wirklich löschen?"
    ↓
Schritt 5: Presenter sagt dem Model: "Lösche Vertrag ID 123"
    ↓
Schritt 6: Model löscht aus der Datenbank
    ↓
Schritt 7: Presenter aktualisiert die Vertrags-Liste
    ↓
Schritt 8: View zeigt aktualisierte Liste
```

**Als Code:**

````typescript
// ============================================
// VIEW (Was der Benutzer sieht)
// ============================================
function VertragsSeite() {
  // Der Presenter gibt uns alles, was wir brauchen
  const { vertraege, handleLoeschen } = useVertragsListe();

  return (
    <VertragsListe
      vertraege={vertraege}
      onLoeschen={handleLoeschen}
    />
  );
}

// ============================================
// PRESENTER (Die Logik)
// ============================================
function useVertragsListe() {
  const [vertraege, setVertraege] = useState([]);

  const handleLoeschen = async (id: string) => {
    // Benutzer-Interaktion
    if (!confirm('Wirklich löschen?')) return;

    // Mit Model kommunizieren
    await VertragsAPI.loeschen(id);

    // Lokale Daten aktualisieren
    setVertraege(alt => alt.filter(v => v.id !== id));
  };

  return { vertraege, handleLoeschen };
}

// ============================================
// MODEL (Backend API)
// ============================================
class VertragsAPI {
  static async loeschen(id: string) {
    // Spricht mit der Datenbank
    await fetch(`/api/vertraege/${id}`, {
      method: 'DELETE'
    });
  }
} aus apps/web/components/ContractForm.tsx):**
```typescript
export function ContractForm({ onAddContract }) {
  // Presenter Hook nutzen
  const { name, setName, price, setPrice, cycle, setCycle, handleSubmit }
    = useContractForm(onAddContract);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Vertragsname</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Kfz-Versicherung"
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Betrag (€)</Label>
        <Input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <Button type="submit">Vertrag hinzufügen</Button>
    </form>
  );
}
````

**Presenter (aus apps/web/hooks/useContractForm.ts):**

```typescript
export function useContractForm(onAddContract) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cycle, setCycle] = useState('MONTHLY');
  const [category, setCategory] = useState('INSURANCE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (!name || !price) return;

    // Daten zusammenstellen
    onAddContract({
      name,
      price: parseFloat(price),
      cycle,
      category,
      startDate: new Date(),
      isActive: true,
      debitDayOfMonth: 1,
      documents: [],
    });

    // Formular zurücksetzen
    setName('');
    setPrice('');
  };

  return { name, setName, price, setPrice, cycle, setCycle, handleSubmit };
}
```

**Model (aus apps/backend/src/contract/contract.controller.ts):**

```typescript
@Controller('contracts')
export class ContractController {
  @UseGuards(JwtAuthGuard)
  @Post()
  async createContract(@Body() contract: CreateContractDto, @Req() req) {
    const user = req.user as { userId?: string };
    // In Datenbank speichern
    return this.contractService.createContract({
      ...contract,
      user: { connect: { userId: user.userId } }
    });
  }
  return { handleSpeichern };
}
```

**Model (Backend):**

```typescript
// Backend Controller
@Post('/vertraege')
async erstelleVertrag(@Body() vertrag) {
  // In Datenbank speichern
  return this.service.erstellen(vertrag);
}
```

**Zusammenspiel:**

```
Benutzer füllt Formular aus
  → View sammelt Daten
    → Presenter validiert & erweitert Daten
      → Model speichert in Datenbank
```

---

### Beispiel 2: Verträge anzeigen beim Laden der Seite

**Presenter (lädt Daten):**

```typescript
function useVertraege() {
  const [vertraege, setVertraege] = useState([]);
  const [istAmLaden, setIstAmLaden] = useState(true);

  // Beim Start: Daten laden
  useEffect(() => {
    async function datenLaden() {
      setIstAmLaden(true);

      try {
        // Model fragen
        const daten = await VertragsAPI.alle();
        setVertraege(daten);
      } catch (fehler) {
        console.error('Fehler beim Laden:', fehler);
      } finally {
        setIstAmLaden(false);
      }
    }

    datenLaden();
  }, []); // [] = nur einmal beim Start

  return { vertraege, istAmLaden };
}
```

**View (zeigt Daten oder Ladebalken):**

```typescript
function VertragsSeite() {
  const { vertraege, istAmLaden } = useVertraege();

  if (istAmLaden) {
    return <div>Lädt...</div>;
  }

  return (
    <div>
      <h1>Du hast {vertraege.length} Verträge</h1>
      {vertraege.map(v => (
        <div key={v.id}>{v.name}</div>
      ))}
    </div>
  );
}
```

**Model (Backend):**

```typescript
@Get('/vertraege')
async alleVertraege(@Req() request) {
  const benutzerId = request.user.id;

  // Aus Datenbank holen
  return this.service.findeAlleVon(benutzerId);
}
```

---

## Der Datenfluss

### Von Benutzer zu Datenbank (Speichern)

```
┌─────────────┐
│  BENUTZER   │ Klickt "Speichern"
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  VIEW                   │
│  (Formular)             │
│                         │
│  onSpeichern(daten)     │ ← Ruft Callback auf
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  PRESENTER              │
│  (useFormular Hook)     │
│                         │
│  1. Validieren          │ ← Ist alles okay?
│  2. Ergänzen            │ ← Datum hinzufügen
│  3. API aufrufen        │ ← An Backend senden
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  MODEL                  │
│  (Backend Service)      │
│                         │
│  1. In DB speichern     │ ← Datenbank-Operation
│  2. Bestätigung zurück  │
└─────────────────────────┘
```

### Von Datenbank zu Benutzer (Anzeigen)

```
┌─────────────────────────┐
│  MODEL                  │
│  (Backend Service)      │
│                         │
│  Daten aus DB laden     │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  PRESENTER              │
│  (useVertraege Hook)    │
│                         │
│  1. Daten empfangen     │
│  2. State aktualisieren │ ← setVertraege(daten)
└──────┬──────────────────┘
// apps/backend/src/contract/contract.service.ts
@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  // Alle Verträge eines Users
  async getContractsByUserId(userId: string) {
    return this.prisma.contract.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    });
  }

  // Vertrag aktualisieren
  async updateContract(contractId: string, contract: Prisma.ContractUpdateInput) {
    return this.prisma.contract.update({
      where: { contractId },
      data: contract
    });
  }

  // Vertrag löschen
  async deleteContract(contractId: string) {
    return this.prisma.contract.delete({
      where: { contractId }
    });
  }
}
```

### Presenter (Frontend Hooks)

```
apps/web/hooks/
├── useContractList.ts    ← Logik für Vertragsliste
├── useContractForm.ts    ← Logik für Formular
└── useCostCalculations.ts ← Logik für Berechnungen
```

**Beispiel useContractList.ts:**

```typescript
// apps/web/hooks/useContractList.ts
export function useContractList(onUpdateContract) {
  const [editingContract, setEditingContract] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setIsDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContract) {
      onUpdateContract(editingContract.contractId, {
        ...editingContract,
        price: Number(editingContract.price),
      });
      setIsDialogOpen(false);
    }
  };

  return { editingContract, isDialogOpen, handleEdit, handleUpdate };
}
```

### View (Frontend Komponenten)

```
apps/web/components/
├── ContractList.tsx      ← Zeigt Vertragsliste
├── ContractForm.tsx      ← Zeigt Formular
└── CostSummary.tsx       ← Zeigt Kostenübersicht
```

**Beispiel ContractList.tsx:**

```typescript
// apps/web/components/ContractList.tsx
export function ContractList({ contracts, onDeleteContract, onUpdateContract }) {
  // Presenter Hook nutzen
  const { handleEdit, handleDeleteConfirmation } = useContractList(onUpdateContract);

  return (
    <div className="space-y-4">
      {contracts.map(contract => (
        <Card key={contract.contractId}>
          <h3>{contract.name}</h3>
          <span>{formatCurrency(contract.price)}</span>

          <Button onClick={() => handleEdit(contract)}>
            <Edit /> Bearbeiten
          </Button>
          <Button onClick={() => {
            if (handleDeleteConfirmation(contract.name)) {
              onDeleteContract(contract.contractId);
            }
          }}>
            <Trash2 /> Löschen
          </Button>
        </Card
  return { editingContract, handleEdit };
}
```

### View (Frontend Komponenten)

```
apps/web/components/
├── ContractList.tsx      ← Zeigt Vertragsliste
├── ContractForm.tsx      ← Zeigt Formular
└── CostSummary.tsx       ← Zeigt Kostenübersicht
```

**Beispiel ContractList.tsx:**

```typescript
export function ContractList({ contracts, onDelete }) {
  const { handleEdit } = useContractList(); // Presenter

  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.id}>
          <h3>{contract.name}</h3>
          <button onClick={() => handleEdit(contract)}>
            Bearbeiten
          </button>
          <button onClick={() => onDelete(contract.id)}>
            Löschen
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Zusammenfassung für Anfänger

### Die goldene Regel:

```
MODEL   → "Was sind die Daten?"           → Backend
VIEW    → "Wie sieht es aus?"             → React Komponenten
PRESENTER → "Was passiert wenn...?"       → Custom Hooks
```

### Faustregel zum Einordnen:

**Frage dich bei jedem Code:**

- Spreche ich mit der Datenbank? → **Model**
- Zeige ich etwas auf dem Bildschirm? → **View**
- Reagiere ich auf Benutzer-Aktionen? → **Presenter**
- Bereite ich Daten auf? → **Presenter**

### Vorteile nochmal:

✅ **Ordnung:** Jeder Code hat seinen Platz  
✅ **Verständlichkeit:** Leicht zu lesen  
✅ **Testbar:** Jeder Teil isoliert testbar  
✅ **Wartbar:** Änderungen an einem Teil betreffen andere nicht  
✅ **Teamfähig:** Mehrere Entwickler können parallel arbeiten

### Merksatz:

> **"Das Model weiß, die View zeigt, der Presenter denkt"**

Das MVP-Pattern hilft uns, sauberen, wartbaren Code zu schreiben, den auch andere (und unser zukünftiges Ich!) leicht verstehen können.
