---
name: grill-me-teachinghub
description: Interviewt den User Frage für Frage zum Umsetzungsplan von TeachingHub2 (Neubau von teachinghub.unibe.ch), bis alle offenen Entscheidungen geklärt sind, und schreibt die Antworten in docs/entscheidungen.md. Verwenden, wenn der User den Plan stress-testen will, "grill me" sagt oder offene Fragen zu TeachingHub2 klären möchte.
---

# grill-me – TeachingHub2

Interviewe mich unerbittlich zu jedem Aspekt des TeachingHub2-Plans, bis wir ein
gemeinsames Verständnis haben. Gehe jeden Ast des Entscheidungsbaums durch und
löse Abhängigkeiten zwischen Entscheidungen eine nach der anderen auf.

## Regeln

1. **Eine Frage pro Nachricht.** Nie mehrere Fragen bündeln.
2. **Zu jeder Frage eine Empfehlung** mit kurzer Begründung (1–3 Sätze) und
   den realistischen Alternativen.
3. **Erst nachschauen, dann fragen.** Wenn sich eine Frage aus den Dateien
   beantworten lässt (`docs/analyse-*.md`, `docs/umsetzungsplan.md`,
   `docs/entscheidungen.md`, Code), lies dort nach statt zu fragen.
4. **Abhängigkeiten zuerst.** Grundsatzentscheidungen (Zielgruppe, Betrieb,
   Hosting, Stack) vor Detailentscheidungen (Datenmodell, UI, Features).
5. **Protokollieren.** Nach jeder beantworteten Frage den Eintrag in
   `docs/entscheidungen.md` ergänzen: ID, Frage, Entscheidung, Begründung,
   Datum, Status (`entschieden` / `offen` / `vertagt`). Folgefragen, die sich
   aus der Antwort ergeben, als `offen` notieren.
6. **Nicht umsetzen.** Dieser Skill klärt nur – kein Code, keine Installation.
7. **Abschluss.** Wenn alle Äste geklärt sind: Zusammenfassung zeigen und
   `docs/umsetzungsplan.md` auf die neuen Entscheidungen nachführen
   (Versionsnummer erhöhen).

## Entscheidungsbaum (Reihenfolge)

1. **Ziel & Betrieb** – Wer betreibt/hostet? Ersetzt TeachingHub2 die
   heutige ZMS-Site oder läuft es parallel? Zeitrahmen, Budget, Team.
2. **Zielgruppen & Rollen** – Gäste, Dozierende, Redaktion, Admin,
   Übersetzer:innen; was dürfen Gäste ohne Login?
3. **Inhalte & Migration** – Rechte an Inhalten, Erstimport, Delta-Abgleich
   (Änderungen auf der Altsite erkennen und selektiv übernehmen), Medien/PDFs.
4. **Mehrsprachigkeit** – Sprachen (DE/EN/FR?), Fallback, Übersetzungs-Workflow
   (Übersetzer:in im CMS), URL-Schema.
5. **Tech-Stack & Hosting** – Framework, DB, CMS (eingebaut vs. headless),
   Hosting (UniBE/Switch/Cloud), Datenschutz (Schweiz/EU).
6. **Authentifizierung** – lokale Accounts (Registrierung, Passwort-Reset,
   E-Mail-Verifikation), später SWITCH edu-ID (OIDC), Account-Verknüpfung.
7. **Navigation & Seitentypen** – 1:1-Übernahme der heutigen Struktur,
   Journey der Lehre, Methodenkompass (Filter), Suche, News.
8. **Personalisierte Funktionen** – Feedback, Like, Bookmark, Meine Tools,
   Meine Methoden, Share (Link, mit User), Ask-a-question mit eigenen
   KI-Tokens (Provider, Key-Speicherung, Kostenkontrolle, RAG über Inhalte).
9. **Qualität** – Barrierefreiheit (WCAG 2.1 AA), CD der UniBE, SEO/Redirects
   der alten URLs, Tests, Monitoring.
10. **Rollout** – Phasen, Pilotgruppe, Go-live-Kriterien.

## Format jeder Frage

```
**Frage X.Y – <Thema>**
<Frage>

Empfehlung: <Antwort> – <Begründung>
Alternativen: <A> · <B>
```
