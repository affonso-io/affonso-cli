[PRD]
# PRD: Affonso Customer API, SDK und CLI vollstaendig synchronisieren

## 1. Ueberblick

Die `affonso-api` ist die verbindliche Customer-API von Affonso. Das TypeScript-SDK `@affonso/sdk` und die CLI `@affonso/cli` wurden seit April 2026 nicht vollstaendig mit dieser API synchronisiert. Dadurch fehlen Kunden neue Funktionen, und einige bestehende CLI-Befehle senden veraltete oder falsche Felder.

Dieses Projekt stellt eine belastbare Kette her:

`affonso-api origin/main` -> OpenAPI-Vertrag -> `@affonso/sdk` -> `@affonso/cli` -> npm-Release -> Kunden-Smoke-Test

Das Ergebnis muss fuer Kunden installierbar, dokumentiert und gegen erneuten Drift abgesichert sein. Eine reine Code-Aktualisierung ohne veroeffentlichtes und getestetes npm-Paket gilt nicht als abgeschlossen.

## 2. Ausgangslage

- Die Customer-API unterstuetzt mehr Endpunkte als SDK und CLI, darunter serverseitige Signups, Portal-Tokens, Onboarding-Formulare und -Antworten, Conversions und Refunds, Events, Sources sowie Tracking-Templates.
- Mehrere Program-Settings-Vertraege im SDK und in der CLI sind veraltet. Betroffen sind mindestens Payment Terms, Tracking, Restrictions, Fraud Rules, Portal, Notifications, Groups und Creatives.
- Der aktuelle Embed-Token-Befehl entspricht nicht dem Request-Vertrag der API.
- `@affonso/sdk@0.2.0` verweist im npm-Manifest auf `dist/index.cjs` und `dist/index.d.cts`, obwohl diese Dateien im veroeffentlichten Tarball fehlen.
- Der vollstaendige CLI-Lint ist derzeit nicht gruen. Diese Baseline muss vor den fachlichen Aenderungen bereinigt werden.
- Die CLI wurde auf dem aktuellen Arbeitsbranch bereits auf SDK `0.2.0` angehoben und bundelt das SDK als temporaeren Schutz gegen dessen fehlerhaften CommonJS-Export. Dies ersetzt keinen korrigierten SDK-Release.

## 3. Ziele

- Jeder fuer Kunden bestimmte Endpunkt aus `affonso-api origin/main` ist im SDK korrekt typisiert und aufrufbar.
- Jede kundenrelevante SDK-Funktion ist ueber einen nachvollziehbaren CLI-Befehl nutzbar oder explizit und begruendet als SDK-only klassifiziert.
- Alle bestehenden CLI-Befehle verwenden exakt die aktuellen Query-, Body- und Response-Vertraege der API.
- SDK und CLI funktionieren unter Node.js 18, 20 und 22 mit ESM und CommonJS, soweit vom jeweiligen Paket angeboten.
- SDK und CLI werden als neue Versionen auf npm veroeffentlicht und danach aus dem npm-Registry-Tarball getestet.
- Eine automatische CI-Pruefung erkennt kuenftige Abweichungen zwischen API, SDK und CLI vor einem Release.
- Kundendokumentation, CLI-Hilfe und der Affonso-Agent-Skill beschreiben denselben aktuellen Funktionsumfang.

## 4. Definition Of Done

Das Gesamtprojekt ist erst fertig, wenn alle folgenden Punkte erfuellt sind:

- Der Endpoint-Inventarbericht weist fuer jeden API-Endpunkt einen Status aus: `SDK + CLI`, `SDK-only mit Begruendung` oder `nicht oeffentlich`.
- Es gibt keine unbegruendeten Luecken fuer oeffentliche Customer-API-Endpunkte.
- Alle Quality Gates sind gruen.
- Staging-End-to-End-Tests mit einem isolierten Testprogramm sind gruen.
- `npm pack`-Tarballs von SDK und CLI wurden in sauberen temporaeren Projekten installiert und ausgefuehrt.
- Neue SDK- und CLI-Versionen wurden nach Senior-Freigabe auf npm veroeffentlicht.
- `npm install @affonso/sdk@latest` und `npx @affonso/cli@latest --version` liefern die neuen Versionen.
- Ein dokumentierter Release- und Drift-Check ist in CI aktiv.
- Kein offener P0- oder P1-Fehler bleibt bestehen.

## 5. Quality Gates

Diese Befehle muessen fuer jede Story in allen von ihr geaenderten Repositories erfolgreich sein.

### `affonso-api`

- `bun run typecheck`
- `bun run lint`
- `bun test`
- `bun run build`

### `@affonso/sdk`

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm pack --dry-run`

### `@affonso/cli`

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm pack --dry-run`
- `npm audit --omit=dev`

Zusaetzlich gilt:

- Neue oder geaenderte API-Funktionen benoetigen automatisierte Success-, Validation-, Auth- und Not-Found-Tests, soweit der Status fuer den Endpunkt relevant ist.
- Neue CLI-Befehle benoetigen Tests, die den exakten SDK-Aufruf und dessen Parameter pruefen.
- Es duerfen keine echten API-Keys, OAuth-Tokens, Signing-Secrets oder Kundendaten in Logs, Fixtures, Snapshots oder Git landen.
- Vor Abschluss einer Story muss `git diff --check` erfolgreich sein.

## 6. Arbeitsregeln Fuer Den Junior Dev

- `affonso-api origin/main` und der dort implementierte Runtime-Vertrag sind die einzige fachliche Wahrheit.
- Nicht von bestehenden SDK-Typen, CLI-Flags oder README-Beispielen auf den API-Vertrag schliessen.
- Vor jeder Ressource zuerst Route, Zod-Schema, Response-Transform und OpenAPI-Eintrag gemeinsam pruefen.
- Keine direkten HTTP-Sonderwege in der CLI bauen, um fehlende SDK-Funktionen zu umgehen. Zuerst das SDK vervollstaendigen, veroeffentlichen und danach die CLI darauf aktualisieren.
- Bestehende Kunden-Flags nicht still entfernen. Wenn ein Flag ersetzt wird, mindestens einen Release-Zyklus mit Deprecation-Hinweis unterstuetzen, sofern es nicht nachweislich nie funktioniert hat oder ein Sicherheitsrisiko darstellt.
- Geldwerte niemals implizit runden oder zwischen Major- und Minor-Units umrechnen. Die Semantik muss aus dem API-Vertrag uebernommen und getestet werden.
- Destruktive CLI-Befehle benoetigen eine Bestaetigung oder ein explizites `--yes` fuer Automation.
- Der Junior Dev darf keine npm- oder Production-Veroeffentlichung ohne Senior-Review und ausdrueckliche Freigabe durchfuehren.
- Authentifizierung, Request-Signaturen, Loeschoperationen und Release-Konfiguration benoetigen immer Senior-Review.

## 7. User Stories

### US-001: Gruene Entwicklungs-Baseline herstellen

**Beschreibung:** Als Entwickler moechte ich eine komplett gruene Baseline, damit neue Fehler eindeutig den Synchronisierungsarbeiten zugeordnet werden koennen.

**Akzeptanzkriterien:**

- [ ] Alle bestehenden CLI-Typecheck-, Test-, Lint- und Build-Fehler sind behoben, ohne Regeln global abzuschalten.
- [ ] Bestehende Tests wurden nicht geloescht oder abgeschwaecht, nur um die Pipeline gruen zu machen.
- [ ] Die CLI-Version stammt aus `package.json` und stimmt im gebauten Binary mit der Paketversion ueberein.
- [ ] Der aktuelle CLI-Tarball laesst sich in einem sauberen temporaeren Projekt installieren und `affonso --help` sowie `affonso --version` lassen sich ausfuehren.
- [ ] Die bekannten Ausgangsprobleme werden in einem kurzen Audit-Dokument festgehalten.

### US-002: Verbindliches API-Endpoint-Inventar erstellen

**Beschreibung:** Als Produktverantwortlicher moechte ich jeden Customer-API-Endpunkt und seinen Abdeckungsstatus sehen, damit keine Funktion unbemerkt fehlt.

**Akzeptanzkriterien:**

- [ ] Eine versionierte Tabelle listet fuer jede gemountete Route HTTP-Methode, Pfad, Auth-Art, Permission, Request-Schema, Response-Schema, SDK-Methode und CLI-Befehl.
- [ ] Das Inventar umfasst mindestens Affiliates, Referrals, Clicks, Signups, Commissions, Conversions, Coupons, Payouts, Events, Embed, Marketplace, Program Settings, Onboarding und Sources.
- [ ] Oeffentliche Tracking-Routen und interne/nicht fuer Kunden bestimmte Routen sind eindeutig markiert.
- [ ] Jede fehlende oder inkompatible SDK-/CLI-Abdeckung ist als konkrete Folgeaufgabe referenziert.
- [ ] Das Inventar wird direkt aus `affonso-api origin/main` verifiziert und enthaelt den verglichenen API-Commit-SHA.

### US-003: OpenAPI-Vertrag vervollstaendigen und pruefbar exportieren

**Beschreibung:** Als SDK-Entwickler moechte ich einen vollstaendigen maschinenlesbaren API-Vertrag, damit SDK und CLI nicht mehr manuell von der API wegdriften.

**Akzeptanzkriterien:**

- [ ] Jeder oeffentliche, gemountete Customer-API-Endpunkt ist in `src/lib/openapi.ts` dokumentiert.
- [ ] Pfade, Methoden, Auth, Permissions, Query-Parameter, Request-Bodies, Responses und Fehlercodes entsprechen Route und Zod-Schema.
- [ ] Ein automatisierter Test vergleicht gemountete oeffentliche Routen mit OpenAPI-Pfaden und schlaegt bei fehlenden Eintraegen fehl.
- [ ] Die OpenAPI-Spezifikation kann deterministisch als JSON-Artefakt erzeugt werden.
- [ ] Das Artefakt enthaelt API-Version und Git-Commit-SHA.
- [ ] Eine CI-Pruefung erkennt unbeabsichtigte OpenAPI-Aenderungen.

### US-004: SDK-Paketierung und Modulkompatibilitaet reparieren

**Beschreibung:** Als Node.js-Kunde moechte ich das SDK in unterstuetzten Modulsystemen importieren koennen, damit meine Anwendung nicht bereits beim Start fehlschlaegt.

**Akzeptanzkriterien:**

- [ ] Alle unter `main`, `module`, `types` und `exports` referenzierten Dateien existieren im `npm pack`-Tarball.
- [ ] Ein CommonJS-Smoke-Test kann `require("@affonso/sdk")` aus einem sauberen temporaeren Projekt ausfuehren.
- [ ] Ein ESM-Smoke-Test kann `import { Affonso } from "@affonso/sdk"` aus einem sauberen temporaeren Projekt ausfuehren.
- [ ] TypeScript kann die Typen in beiden Testprojekten aufloesen.
- [ ] Die Tests laufen unter Node.js 18, 20 und 22 in CI.
- [ ] Der SDK-Build enthaelt keine falsche oder hartcodierte alte Versionsnummer im User-Agent.

### US-005: Bestehende SDK-Kernressourcen mit der API synchronisieren

**Beschreibung:** Als API-Kunde moechte ich die etablierten Ressourcen mit allen aktuellen Feldern nutzen koennen, damit ich keine Raw-HTTP-Workarounds brauche.

**Akzeptanzkriterien:**

- [ ] Affiliates stimmen inklusive Filtern, Expands, Onboarding-Status, Payout-Methode/-Details, External User ID und Metadata mit der API ueberein.
- [ ] Referrals stimmen inklusive Cursor-Pagination, External-User-Filter, Includes, Metadata und aktuellem Status-Enum mit der API ueberein.
- [ ] Clicks stimmen inklusive Zeitstempel und unterstuetzten Attribution-IDs mit der API ueberein; nicht unterstuetzte Felder werden entfernt oder als deprecated behandelt.
- [ ] Commissions stimmen inklusive Status-Enums, Betragsfeldern, Currency, Hold Period und Backdating mit der API ueberein.
- [ ] Coupons stimmen inklusive Provider-Daten, Product IDs, Duration-Regeln und Expands mit der API ueberein.
- [ ] Payouts, Marketplace und bestehende Pagination-Wrapper entsprechen dem aktuellen Response-Format.
- [ ] Fuer jede Ressource pruefen Tests exakten Pfad, Methode, Query und JSON-Body.

### US-006: Program-Settings-SDK vollstaendig korrigieren

**Beschreibung:** Als Programmbetreiber moechte ich alle Programmeinstellungen ueber das SDK korrekt verwalten koennen.

**Akzeptanzkriterien:**

- [ ] Program Info verwendet aktuelle Felder und Enums, insbesondere `access_mode` und `affiliate_links_enabled`.
- [ ] Payment Terms verwendet die aktuellen Commission Types, Durations, Limits, Hold Days, Frequencies, Payment Methods und Invoice-/Owner-Felder.
- [ ] Tracking unterstuetzt die aktuellen Referral-, Email-, Name-, Postback-, Affonso-ID- und Tracking-Template-Felder.
- [ ] Tracking-Templates sind als strukturierter Typ modelliert und gegen alle von der API erlaubten Macros getestet.
- [ ] Restrictions verwendet ausschliesslich die aktuellen API-Felder.
- [ ] Fraud Rules verwendet aktuelle `*_mode`- und Config-Felder.
- [ ] Portal, Notifications, Groups und Creatives verwenden aktuelle Request- und Response-Felder.
- [ ] Nullable-Felder koennen bewusst auf `null` gesetzt werden und werden nicht als `undefined` verworfen.
- [ ] Alle Subressourcen besitzen Success- und Validation-Tests.

### US-007: Embed- und Portal-Token-SDK aktualisieren

**Beschreibung:** Als SaaS-Kunde moechte ich eingebettete Partner-Dashboards und Portal-Autologin sicher erzeugen koennen.

**Akzeptanzkriterien:**

- [ ] Embed-Token-Requests verwenden den aktuellen Vertrag mit Program, Partner, optionaler Group, External User ID und Metadata.
- [ ] Embed-Token-Responses sind vollstaendig typisiert.
- [ ] `POST /affiliates/{id}/portal-token` ist als eigene SDK-Methode verfuegbar.
- [ ] Token-Werte werden in SDK-Fehlern und Debug-Ausgaben niemals geloggt.
- [ ] Tests decken fehlende Pflichtfelder, falsche E-Mail, nicht gefundenen Affiliate und erfolgreiche Token-Erstellung ab.

### US-008: Onboarding-SDK implementieren

**Beschreibung:** Als Programmbetreiber moechte ich Onboarding-Fragen und Partnerantworten ueber das SDK verwalten koennen.

**Akzeptanzkriterien:**

- [ ] Get, Create, Update und Delete fuer `/onboarding-form` sind implementiert.
- [ ] Question Types, Options, Reihenfolge und Pflichtfeld-Semantik sind exakt typisiert.
- [ ] Get und Submit fuer `/affiliates/{id}/onboarding-responses` sind implementiert.
- [ ] `mark_complete` und leere finale Antwortlisten folgen exakt dem API-Vertrag.
- [ ] Doppelte Question IDs und falsche Answer-Typen werden durch API-Tests abgedeckt.
- [ ] SDK-Tests pruefen alle Pfade, Methoden und Bodies.

### US-009: Signup-, Conversion-, Refund- und Event-SDK implementieren

**Beschreibung:** Als API-Kunde moechte ich Leads, Conversions, Refunds und Milestones serverseitig erfassen koennen.

**Akzeptanzkriterien:**

- [ ] Authenticated Signups unterstuetzen `click_id`, E-Mail, External User ID und Name gemaess Cross-Field-Validierung.
- [ ] Conversions unterstuetzen alle aktuellen Identifikatoren, Geld-, Produkt-, Subscription-, Metadata- und Idempotency-Felder.
- [ ] Teil- und Voll-Refunds verwenden den aktuellen Request- und Response-Vertrag.
- [ ] Generic Events und unterstuetzte Source-Adapter sind typisiert und dokumentiert.
- [ ] Idempotency/Replays sind als moegliches erfolgreiches Ergebnis dokumentiert und getestet.
- [ ] Signaturbildung verwendet exakt Raw Body, Timestamp und Endpoint-Pfad gemaess API-Vertrag.
- [ ] Signing-Secrets werden nur ueber explizite SDK-Konfiguration uebergeben und niemals persistiert oder geloggt.
- [ ] Falls die sichere Ausgabe von Customer-Signing-Secrets im Produkt noch nicht existiert, wird die Story vor Signaturimplementierung an einen Senior eskaliert; es wird kein eigener Secret-Verteilungsweg erfunden.

### US-010: Bestehende CLI-Befehle korrigieren und vervollstaendigen

**Beschreibung:** Als CLI-Kunde moechte ich bestehende Befehle mit aktuellen Feldern verwenden koennen, ohne dass Flags still ignoriert werden.

**Akzeptanzkriterien:**

- [ ] Affiliates, Referrals, Clicks, Commissions, Coupons, Payouts, Marketplace und Embed Tokens bieten alle kundenrelevanten aktuellen SDK-Parameter an.
- [ ] Alle Program-Settings-Unterbefehle entsprechen den in US-006 korrigierten SDK-Typen.
- [ ] Nicht mehr gueltige Flags werden entfernt oder mit klarer Deprecation-Warnung versehen.
- [ ] CLI-Hilfetexte nennen erlaubte Enum-Werte und Pflichtkombinationen.
- [ ] JSON-Eingaben wie Metadata, Configs, Tags, Dimensions und Onboarding-Antworten koennen ueber eine dokumentierte `--*-json`-Option oder eine JSON-Datei sicher uebergeben werden.
- [ ] Ungueltiges JSON erzeugt vor dem Netzwerkaufruf einen verstaendlichen Fehler und Exit-Code ungleich null.
- [ ] Jeder Command-Test prueft den exakten SDK-Aufruf inklusive konvertierter Zahlen, Booleans, Arrays und Nullable-Werte.

### US-011: Neue CLI-Befehle fuer neue Customer-API-Ressourcen hinzufuegen

**Beschreibung:** Als CLI-Kunde moechte ich neue Customer-API-Funktionen ohne eigenes Skript ausfuehren koennen.

**Akzeptanzkriterien:**

- [ ] CLI-Befehle existieren fuer Portal Tokens, Onboarding Forms, Onboarding Responses und Signups.
- [ ] CLI-Befehle existieren fuer Conversions, Refunds und Events, sofern der Signing-Secret-Produktvertrag aus US-009 freigegeben ist.
- [ ] Source-Adapter erhalten entweder explizite Befehle oder werden im Endpoint-Inventar begruendet als SDK-only klassifiziert.
- [ ] Schreibende Befehle unterstuetzen `--json`-Ausgabe mit stabiler Success-/Error-Struktur.
- [ ] Destruktive Befehle fragen interaktiv nach Bestaetigung; Automation erfordert `--yes`.
- [ ] In nicht-interaktiven Sessions ohne `--yes` brechen destruktive Befehle sicher ab.
- [ ] Secrets erscheinen weder in Hilfeausgaben noch in Fehlermeldungen oder gespeicherter CLI-Konfiguration.

### US-012: Authentifizierte Staging-End-to-End-Tests aufbauen

**Beschreibung:** Als Release-Verantwortlicher moechte ich reale Kunden-Workflows vor dem Release testen, damit Mocks keine Vertragsfehler verdecken.

**Akzeptanzkriterien:**

- [ ] Ein isoliertes Staging-Team mit eigenem Testprogramm und minimal berechtigtem API-Key ist dokumentiert.
- [ ] CI-Secrets werden nur in geschuetzten Environments bereitgestellt und nicht fuer Fork-PRs ausgegeben.
- [ ] Der Test erstellt und liest mindestens einen Affiliate, Referral und eine weitere Ressource, aktualisiert sie und raeumt alle Fixtures wieder auf.
- [ ] Program-Settings-Tests sichern vorherige Werte und stellen sie im `finally`-Pfad wieder her.
- [ ] Onboarding-, Embed-/Portal-Token- und Signup-Workflows werden real gegen Staging getestet.
- [ ] Conversion/Event-Tests laufen nur nach Freigabe des Signing-Vertrags und verwenden eindeutige Idempotency IDs.
- [ ] Ein Testfehler hinterlaesst keine Kundendaten und gibt keine Secrets aus.
- [ ] Production wird niemals als automatisches Testziel verwendet.

### US-013: Dokumentation und Agent-Skill synchronisieren

**Beschreibung:** Als Kunde moechte ich korrekte Beispiele und Hilfetexte sehen, damit ich die neuen Funktionen ohne Quellcodeanalyse verwenden kann.

**Akzeptanzkriterien:**

- [ ] SDK-README dokumentiert Installation, Auth, Konfiguration, Pagination, Fehler und jede Ressourcengruppe.
- [ ] CLI-README und `--help` dokumentieren alle Commands und globalen Optionen konsistent.
- [ ] Beispiele wurden gegen Staging oder einen HTTP-Mock mit aktuellem Vertrag verifiziert.
- [ ] Der Affonso-CLI-Agent-Skill und seine Command Reference werden auf den neuen Command-Umfang aktualisiert.
- [ ] Destruktive Beispiele enthalten Bestaetigungshinweise.
- [ ] Signing-Secrets werden nur als Platzhalter gezeigt und niemals als CLI-Konfigurationswert empfohlen.
- [ ] Changelogs nennen Breaking Changes, Deprecations und Migrationsbeispiele.

### US-014: Drift-Erkennung in CI automatisieren

**Beschreibung:** Als Produktteam moechte ich bei jeder API-Aenderung automatisch erfahren, ob SDK und CLI angepasst werden muessen.

**Akzeptanzkriterien:**

- [ ] Die API-CI erzeugt bei relevanten Aenderungen deterministisch das OpenAPI-Artefakt.
- [ ] Die SDK-CI vergleicht ihre Operationen und Typen mit der aktuellen freigegebenen OpenAPI-Version.
- [ ] Fehlende Pfade oder Methoden blockieren den SDK-Release.
- [ ] Entfernte oder inkompatibel geaenderte Felder werden als potenziell breaking gemeldet.
- [ ] Die CLI besitzt ein versioniertes Mapping von kundenrelevanten SDK-Operationen zu Commands.
- [ ] Fehlende CLI-Abdeckung blockiert den CLI-Release, sofern keine genehmigte SDK-only-Begruendung existiert.
- [ ] Der CI-Fehler nennt konkrete Pfade, Methoden oder Felder und verlinkt den Wartungsprozess.
- [ ] Ein woechentlicher Scheduled Run prueft zusaetzlich die aktuell auf npm veroeffentlichten Pakete gegen den freigegebenen Stand.

### US-015: SDK und CLI kontrolliert veroeffentlichen

**Beschreibung:** Als Kunde moechte ich eine installierbare, versionierte und nachvollziehbare Release-Version erhalten.

**Akzeptanzkriterien:**

- [ ] Zuerst wird das SDK mit korrekter semantischer Version veroeffentlicht.
- [ ] Die CLI verwendet anschliessend die veroeffentlichte SDK-Version und keine Git-, File- oder Workspace-Abhaengigkeit.
- [ ] SDK- und CLI-Tarballs werden vor dem Publish aus `npm pack` in sauberen Projekten getestet.
- [ ] Senior-Review bestaetigt Auth, Signaturen, Deletes, Package Exports und Release-Konfiguration.
- [ ] Nach ausdruecklicher Freigabe werden SDK und CLI auf npm veroeffentlicht.
- [ ] ESM-, CommonJS- und CLI-Smoke-Tests laufen erneut gegen `@latest` aus der npm Registry.
- [ ] Das npm-Dist-Tag `latest`, Git-Tag, Changelog und Paketversion stimmen ueberein.
- [ ] Ein Rollback-Plan auf die vorherige funktionierende Version ist dokumentiert.

## 8. Funktionale Anforderungen

- FR-1: Die Customer-API auf `origin/main` muss als einzige fachliche Quelle verwendet werden.
- FR-2: Jeder oeffentliche API-Endpunkt muss im OpenAPI-Inventar erfasst sein.
- FR-3: Jeder oeffentliche Endpunkt muss im SDK typisiert sein, sofern er nicht dokumentiert als nicht fuer Kunden bestimmt ist.
- FR-4: Jeder kundenrelevante SDK-Workflow muss ueber die CLI nutzbar sein oder eine genehmigte SDK-only-Begruendung besitzen.
- FR-5: Request-Pfade, HTTP-Methoden, Query-Namen und JSON-Felder muessen exakt der API entsprechen.
- FR-6: SDK und CLI muessen API-Fehler mit Status, Code, Message, Field und Details erhalten.
- FR-7: Pagination muss Cursor- und Page-basierte Endpunkte korrekt unterscheiden.
- FR-8: CLI-Ausgabe muss fuer Menschen und mit `--json` fuer Automation nutzbar sein.
- FR-9: CLI-Befehle muessen bei lokalen Validierungsfehlern vor dem Netzwerkaufruf abbrechen.
- FR-10: Destruktive CLI-Aktionen muessen bestaetigt werden.
- FR-11: API-Keys, OAuth-Tokens und Signing-Secrets duerfen nicht in Logs oder Repository-Dateien erscheinen.
- FR-12: SDK- und CLI-Releases muessen aus dem echten npm-Tarball getestet werden.
- FR-13: Eine API-Vertragsaenderung muss vor dem naechsten Release automatisch als Drift erkennbar sein.
- FR-14: Neue API-Endpunkte muessen einen Owner fuer API, SDK, CLI und Dokumentation erhalten.

## 9. Nicht-Ziele

- Kein Redesign der Affonso-Web-App oder des Affiliate-Portals.
- Keine Aenderung fachlicher Provisions-, Fraud- oder Payout-Regeln, ausser sie ist fuer Vertragskonsistenz zwingend und separat freigegeben.
- Keine neue Authentifizierungsmethode erfinden.
- Keine automatische Migration oder Veraenderung echter Kundendaten.
- Keine vollautomatische npm- oder Production-Veroeffentlichung ohne menschliche Freigabe.
- Keine Unterdrueckung von Lint-, Typecheck- oder Testfehlern durch globale Regelabschaltung.
- Kein dauerhafter Raw-HTTP-Client in der CLI als Ersatz fuer ein vollstaendiges SDK.

## 10. Technische Leitentscheidungen

- Reihenfolge: API/OpenAPI -> SDK -> SDK-Release -> CLI -> CLI-Release -> Kundendokumentation.
- SDK-Ressourcen bleiben nach fachlichen Domains getrennt; keine einzelne untypisierte `request()`-API als primaere Kundenschnittstelle.
- OpenAPI ist der maschinenlesbare Vertrag, Runtime-Routen und Zod-Schemas bleiben die letzte Quelle bei Widerspruechen. Widersprueche muessen in der API behoben werden.
- CLI-Flags verwenden Kebab Case; das Mapping auf API-Felder liegt ausschliesslich im jeweiligen Command-Modul und wird getestet.
- JSON-Komplexitaet wird ueber sichere JSON-Strings oder Dateien geloest, nicht ueber dynamische Code-Auswertung.
- Releases folgen Semantic Versioning. Inkompatible oeffentliche SDK- oder CLI-Aenderungen benoetigen eine Major-Version oder eine dokumentierte Deprecation-Phase.
- Die temporaere SDK-Buendelung in der CLI darf erst entfernt werden, wenn der korrigierte SDK-Tarball in CommonJS und ESM nachweislich funktioniert. Danach ist zu entscheiden, ob Bundling aus Distributionsgruenden beibehalten wird.

## 11. Abhaengigkeiten Und Risiken

- Die S2S-Signatur kann nur kundentauglich umgesetzt werden, wenn ein sicherer Produktprozess fuer Customer-Signing-Secrets existiert.
- OpenAPI und Runtime koennen aktuell voneinander abweichen; das Endpoint-Inventar muss diese Unterschiede zuerst sichtbar machen.
- Einige bestehende CLI-Flags koennen bislang still ignoriert worden sein. Ihre Korrektur kann Verhalten aendern und benoetigt Release Notes.
- Staging-Tests fuer Geld- und Payout-Flows muessen strikt isoliert sein und duerfen keine echten Auszahlungen ausloesen.
- OAuth- und API-Key-Permissions koennen unterschiedliche Endpunktabdeckung besitzen; beide muessen gezielt getestet werden.
- Ein SDK-Release muss vor dem CLI-Release verfuegbar sein, damit die CLI keine unveroeffentlichten Abhaengigkeiten verwendet.

## 12. Erfolgsmetriken

- 100 Prozent der oeffentlichen Customer-API-Operationen sind inventarisiert.
- 100 Prozent der als kundenrelevant klassifizierten Operationen sind im SDK implementiert.
- 100 Prozent der als CLI-relevant klassifizierten SDK-Operationen besitzen getestete Commands.
- Null fehlende Dateien in npm Package Exports.
- Null P0/P1-Fehler im Staging-End-to-End-Test.
- Alle Quality Gates sind auf dem Release-Commit gruen.
- Ein absichtlich hinzugefuegter Test-Endpunkt ohne SDK-Mapping laesst die Drift-CI nachweislich fehlschlagen.
- Installation und Smoke-Test von SDK und CLI gegen npm `@latest` sind erfolgreich.

## 13. Release-Freigabecheckliste

- [ ] Endpoint-Inventar von einem Senior gegen `affonso-api origin/main` geprueft.
- [ ] OpenAPI-Vertrag vollstaendig und CI gruen.
- [ ] SDK-Vertrag und Package Exports geprueft.
- [ ] SDK-Tarball unter Node.js 18, 20 und 22 getestet.
- [ ] CLI-Commands und Destructive-Action-Schutz geprueft.
- [ ] CLI-Tarball unter Node.js 18, 20 und 22 getestet.
- [ ] Staging-E2E gruen und Fixtures bereinigt.
- [ ] Security-Review fuer Keys, OAuth, Tokens und Signaturen abgeschlossen.
- [ ] Dokumentation und Changelogs aktualisiert.
- [ ] Senior-Freigabe fuer npm Publish dokumentiert.
- [ ] Post-Publish-Smoke-Test gegen npm `@latest` gruen.

## 14. Offene Punkte Fuer Senior-/Produktentscheidung

- Wie erhalten Kunden das Secret fuer signierte Conversion-, Refund-, Event- und Source-Requests?
- Welche Source-Adapter sollen neben dem SDK auch einen expliziten CLI-Befehl erhalten?
- Wie lange sollen nachweislich verwendete alte CLI-Flags als deprecated unterstuetzt werden?
- Welches isolierte Staging-Team darf fuer automatisierte CRUD- und Program-Settings-Tests verwendet werden?

Diese offenen Punkte blockieren nicht US-001 bis US-008. US-009, US-011 fuer signierte Endpunkte und der finale Release benoetigen jedoch eine dokumentierte Entscheidung.
[/PRD]
