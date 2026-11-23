'use client'

import { useLocale, useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { authClient } from '@/auth/client'
import { useRouter } from '@/i18n/navigation'
import { FEEDBACK_KINDS, type FeedbackKind, feedbackPlace, IMAGE_MAX_BYTES } from '@/hub/rules'

type Stroke = { width: number; points: { x: number; y: number }[] }
const WIDTHS = [3, 6, 12] as const
const IGNORE = 'data-feedback-ignore'

/** Abschnittsüberschrift, die zuletzt oberhalb der Bildschirmmitte beginnt (Entscheidung 8.2b). */
function currentPlace(): string {
  const title = document.querySelector('main h1')?.textContent ?? document.title
  const middle = window.innerHeight / 2
  let heading: string | null = null
  for (const h of Array.from(document.querySelectorAll('main h2'))) {
    if (h.closest(`[${IGNORE}]`)) continue
    if (h.getBoundingClientRect().top <= middle) heading = h.textContent
    else break
  }
  return feedbackPlace(title, heading)
}

/** Screenshot der aktuellen Ansicht (ohne Feedback-Elemente); null, wenn der Browser es nicht schafft. */
async function captureViewport(): Promise<HTMLImageElement | null> {
  try {
    const { toPng } = await import('html-to-image')
    const { innerWidth: width, innerHeight: height, scrollX, scrollY } = window
    const url = await toPng(document.body, {
      width,
      height,
      pixelRatio: 1,
      cacheBust: false,
      skipFonts: true,
      backgroundColor: '#ffffff',
      imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
      style: { transform: `translate(${-scrollX}px, ${-scrollY}px)`, transformOrigin: 'top left' },
      filter: (node) => !(node instanceof Element && node.hasAttribute(IGNORE)),
    })
    return await loadImage(url)
  } catch {
    return null
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

const QUESTION_KEY: Record<FeedbackKind, string> = {
  fehler: 'questionFehler',
  verbesserung: 'questionVerbesserung',
  idee: 'questionIdee',
  frage: 'questionFrage',
}
const KIND_ICON: Record<FeedbackKind, string> = {
  fehler: '⚠',
  verbesserung: '✎',
  idee: '💡',
  frage: '?',
}

/**
 * Feedback-Dialog (Entscheidungen 8.2, 8.2a, 8.2b; Vorlage docs/referenz/feedback-dialog.png).
 * Globaler Knopf; Gäste gehen über die Anmeldung und landen mit `?feedback=<Stelle>` wieder hier.
 * Zeichnen ist optional – alles ist auch per Tastatur ohne Zeichnung bedienbar.
 */
export function FeedbackLauncher() {
  const t = useTranslations('Feedback')
  const locale = useLocale()
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [place, setPlace] = useState('')
  const [editPlace, setEditPlace] = useState(false)
  const [kind, setKind] = useState<FeedbackKind>('verbesserung')
  const [message, setMessage] = useState('')
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [withImage, setWithImage] = useState(true)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [width, setWidth] = useState<number>(WIDTHS[1])
  const [large, setLarge] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const drawing = useRef<Stroke | null>(null)

  const start = useCallback(async (initialPlace?: string) => {
    setBusy(true)
    const shot = await captureViewport()
    setPlace(initialPlace || currentPlace())
    setImage(shot)
    setWithImage(Boolean(shot))
    setStrokes([])
    setMessage('')
    setKind('verbesserung')
    setError(null)
    setDone(false)
    setLarge(false)
    setEditPlace(false)
    setOpen(true)
    setBusy(false)
  }, [])

  // Rückkehr nach der Anmeldung: ?feedback=<Stelle> öffnet den Dialog mit der ursprünglichen Stelle
  useEffect(() => {
    if (!session) return
    const url = new URL(window.location.href)
    const pending = url.searchParams.get('feedback')
    if (pending === null) return
    url.searchParams.delete('feedback')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    const timer = setTimeout(() => void start(pending.slice(0, 300)), 0)
    return () => clearTimeout(timer)
  }, [session, start])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Zeichnung neu aufbauen (Bild + Striche)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(image, 0, 0)
    ctx.strokeStyle =
      getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim() || 'red'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of strokes) {
      ctx.lineWidth = stroke.width
      ctx.beginPath()
      stroke.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
      if (stroke.points.length === 1) ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y)
      ctx.stroke()
    }
  }, [image, strokes, open, large])

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  async function loadFile(file: File | null | undefined) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type))
      return setError(t('imageType'))
    if (file.size > IMAGE_MAX_BYTES) return setError(t('imageTooLarge'))
    const url = URL.createObjectURL(file)
    try {
      setImage(await loadImage(url))
      setStrokes([])
      setWithImage(true)
      setError(null)
    } catch {
      setError(t('imageType'))
    }
  }

  function onPaste(event: React.ClipboardEvent) {
    const file = Array.from(event.clipboardData.files).find((f) => f.type.startsWith('image/'))
    if (file) {
      event.preventDefault()
      void loadFile(file)
    }
  }

  async function imageBlob(): Promise<Blob | null> {
    const canvas = canvasRef.current
    if (!canvas || !image || !withImage) return null
    const png = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'))
    if (png && png.size <= IMAGE_MAX_BYTES) return png
    return new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!message.trim()) return setError(t('messageRequired'))
    setBusy(true)
    setError(null)
    const form = new FormData()
    form.set('kind', kind)
    form.set('place', place)
    form.set('message', message)
    form.set('pageUrl', `${window.location.pathname}${window.location.search}`)
    form.set('locale', locale)
    const blob = await imageBlob()
    if (blob) form.set('image', blob, blob.type === 'image/png' ? 'feedback.png' : 'feedback.jpg')
    const response = await fetch('/api/hub/feedback', {
      method: 'POST',
      body: form,
      credentials: 'same-origin',
    }).catch(() => null)
    setBusy(false)
    if (!response?.ok) return setError(response?.status === 413 ? t('imageTooLarge') : t('error'))
    setDone(true)
  }

  function onLaunch() {
    if (session) return void start()
    // Gäste: Anmeldung, danach öffnet sich der Dialog mit derselben Stelle (Entscheidung 8.2a)
    const back = new URL(window.location.href)
    back.searchParams.set('feedback', currentPlace())
    router.push({ pathname: '/anmelden', query: { zurueck: `${back.pathname}${back.search}` } })
  }

  const placeId = 'feedback-place'
  return (
    <div data-feedback-ignore="">
      <button
        type="button"
        className="feedback-launcher"
        onClick={onLaunch}
        disabled={busy}
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">✉</span> {t('button')}
      </button>
      <dialog
        ref={dialogRef}
        className={`feedback-dialog${large ? ' feedback-dialog--large' : ''}`}
        aria-labelledby="feedback-heading"
        onClose={() => setOpen(false)}
        onPaste={onPaste}
      >
        {open && done ? (
          <div className="feedback-dialog__done" role="status">
            <h2 id="feedback-heading">{t('thanksHeading')}</h2>
            <p>{t('thanks')}</p>
            <button
              type="button"
              className="button button--primary"
              onClick={() => setOpen(false)}
              autoFocus
            >
              {t('close')}
            </button>
          </div>
        ) : open ? (
          <form className="feedback-dialog__grid" onSubmit={submit}>
            <div className="feedback-dialog__image">
              {image ? (
                <>
                  <div className="feedback-dialog__toolbar">
                    <p className="meta">{t('drawHint')}</p>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setStrokes((s) => s.slice(0, -1))}
                      disabled={!strokes.length}
                    >
                      ↶ {t('undo')}
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => setStrokes([])}
                      disabled={!strokes.length}
                    >
                      ⌫ {t('clear')}
                    </button>
                    <button
                      type="button"
                      className="link-button"
                      aria-pressed={large}
                      onClick={() => setLarge((v) => !v)}
                    >
                      ✎ {t('large')}
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    className="feedback-dialog__canvas"
                    role="img"
                    aria-label={t('canvasLabel')}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId)
                      drawing.current = { width, points: [point(e)] }
                      setStrokes((s) => [...s, drawing.current as Stroke])
                    }}
                    onPointerMove={(e) => {
                      if (!drawing.current) return
                      drawing.current.points.push(point(e))
                      setStrokes((s) => [...s.slice(0, -1), { ...(drawing.current as Stroke) }])
                    }}
                    onPointerUp={() => (drawing.current = null)}
                    onPointerCancel={() => (drawing.current = null)}
                  />
                  <div className="feedback-dialog__options">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={withImage}
                        onChange={(e) => setWithImage(e.target.checked)}
                      />{' '}
                      {t('includeImage')}
                    </label>
                    <fieldset className="feedback-dialog__widths">
                      <legend className="visually-hidden">{t('strokeWidth')}</legend>
                      {WIDTHS.map((w, i) => (
                        <label key={w} className="feedback-dialog__width" title={t(`width${i}`)}>
                          <input
                            type="radio"
                            name="width"
                            className="visually-hidden"
                            checked={width === w}
                            onChange={() => setWidth(w)}
                          />
                          <span aria-hidden="true" style={{ width: w + 4, height: w + 4 }} />
                          <span className="visually-hidden">{t(`width${i}`)}</span>
                        </label>
                      ))}
                    </fieldset>
                  </div>
                </>
              ) : (
                <p className="meta">{t('noScreenshot')}</p>
              )}
            </div>

            <div className="feedback-dialog__form">
              <h2 id="feedback-heading">{t('heading')}</h2>
              {editPlace ? (
                <p>
                  <label htmlFor={placeId}>{t('placeLabel')}</label>
                  <input
                    id={placeId}
                    type="text"
                    value={place}
                    maxLength={300}
                    required
                    onChange={(e) => setPlace(e.target.value)}
                  />
                </p>
              ) : (
                <p className="meta">
                  {t('place', { place })}{' '}
                  <button type="button" className="link-button" onClick={() => setEditPlace(true)}>
                    {t('changePlace')}
                  </button>
                </p>
              )}
              <fieldset className="feedback-dialog__kinds">
                <legend>{t('kind')}</legend>
                {FEEDBACK_KINDS.map((k) => (
                  <label
                    key={k}
                    className={`feedback-kind${kind === k ? ' feedback-kind--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="kind"
                      className="visually-hidden"
                      value={k}
                      checked={kind === k}
                      onChange={() => setKind(k)}
                    />
                    <span aria-hidden="true">{KIND_ICON[k]}</span> {t(`kind_${k}`)}
                  </label>
                ))}
              </fieldset>
              <label htmlFor="feedback-message">{t(QUESTION_KEY[kind])}</label>
              <textarea
                id="feedback-message"
                value={message}
                maxLength={5000}
                rows={6}
                required
                onChange={(e) => setMessage(e.target.value)}
              />
              <p>
                <label className="button button--secondary feedback-dialog__file">
                  🖼 {t('otherImage')}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="visually-hidden"
                    onChange={(e) => void loadFile(e.target.files?.[0])}
                  />
                </label>
                <br />
                <span className="meta">{t('pasteHint')}</span>
              </p>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <div className="feedback-dialog__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => setOpen(false)}
                >
                  {t('cancel')}
                </button>
                <button type="submit" className="button button--primary" disabled={busy}>
                  ➤ {t('send')}
                </button>
              </div>
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  )
}
