import path from 'path'

/**
 * Ablage hochgeladener Dateien (Review Architektur). Mit `UPLOADS_DIR` (z. B. /app/uploads, ein Docker-Volume)
 * liegen sie ausserhalb des Containers und überstehen Deployments; ohne bleibt es beim bisherigen Ordner im
 * Projekt (lokale Entwicklung, bestehende Dateien bleiben gültig).
 */
export function uploadDir(name: string, env: Record<string, string | undefined> = process.env): string {
  return env.UPLOADS_DIR ? path.resolve(env.UPLOADS_DIR, name) : name
}
