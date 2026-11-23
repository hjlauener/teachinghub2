import type { CollectionConfig } from 'payload'

import { editorsOnly } from '@/access/roles'
import { asMailLocale, feedbackReplyEmail, hubUrl } from '@/hub/mail'
import { l } from '@/lib/admin'

export { FEEDBACK_KINDS } from '@/hub/rules'

const deny = () => false

export const feedbackGroup = l('Rückmeldungen', 'Feedback', 'Retours')

export const FEEDBACK_STATES = ['neu', 'in_arbeit', 'erledigt'] as const

/**
 * Feedback-Inbox der Redaktion (Entscheidungen 8.2/8.2a): nur von angemeldeten Mitgliedern über `/api/hub/feedback`
 * angelegt. Eine Antwort der Redaktion geht per Mail an die Person (einmal pro geänderter Antwort).
 */
export const Feedback: CollectionConfig = {
  slug: 'feedback',
  labels: {
    singular: l('Feedback', 'Feedback', 'Feedback'),
    plural: l('Feedback-Inbox', 'Feedback inbox', 'Boîte de feedback'),
  },
  admin: {
    useAsTitle: 'place',
    defaultColumns: ['place', 'kind', 'feedbackStatus', 'memberEmail', 'createdAt'],
    group: feedbackGroup,
    listSearchableFields: ['place', 'message', 'memberEmail'],
  },
  defaultSort: '-createdAt',
  access: { read: editorsOnly, create: deny, update: editorsOnly, delete: editorsOnly },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation, context }) => {
        if (operation !== 'update' || context.skipReplyMail) return doc
        const reply = (doc.reply ?? '').trim()
        if (!reply || reply === (previousDoc?.reply ?? '').trim() || !doc.memberEmail) return doc
        const locale = asMailLocale(doc.mailLocale)
        await req.payload.sendEmail({
          to: doc.memberEmail,
          ...feedbackReplyEmail(locale, {
            place: doc.place,
            reply,
            message: doc.message,
            url: hubUrl(locale, '#feedback'),
          }),
        })
        const repliedAt = new Date().toISOString()
        await req.payload.update({
          collection: 'feedback',
          id: doc.id,
          data: { repliedAt },
          req,
          context: { skipReplyMail: true },
        })
        return { ...doc, repliedAt }
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'feedbackStatus',
          type: 'select',
          label: l('Status', 'Status', 'Statut'),
          required: true,
          defaultValue: 'neu',
          options: [
            { value: 'neu', label: l('neu', 'new', 'nouveau') },
            { value: 'in_arbeit', label: l('in Arbeit', 'in progress', 'en cours') },
            { value: 'erledigt', label: l('erledigt', 'done', 'traité') },
          ],
        },
        {
          name: 'kind',
          type: 'select',
          label: l('Art', 'Type', 'Type'),
          required: true,
          options: [
            { value: 'fehler', label: l('Fehler', 'Bug', 'Erreur') },
            { value: 'verbesserung', label: l('Verbesserung', 'Improvement', 'Amélioration') },
            { value: 'idee', label: l('Idee', 'Idea', 'Idée') },
            { value: 'frage', label: l('Frage', 'Question', 'Question') },
          ],
          access: { update: deny },
        },
      ],
    },
    {
      name: 'place',
      type: 'text',
      label: l('Stelle', 'Location', 'Endroit'),
      required: true,
      access: { update: deny },
    },
    { name: 'pageUrl', type: 'text', label: l('Seite', 'Page', 'Page'), access: { update: deny } },
    {
      name: 'message',
      type: 'textarea',
      label: l('Rückmeldung', 'Message', 'Message'),
      required: true,
      access: { update: deny },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'feedback-images',
      label: l('Bild', 'Image', 'Image'),
      access: { update: deny },
    },
    {
      name: 'reply',
      type: 'textarea',
      label: l('Antwort an die Person', 'Reply to the member', 'Réponse à la personne'),
      admin: {
        description: l(
          'Wird beim Speichern per Mail verschickt und in „Mein Hub“ angezeigt.',
          'Sent by email on save and shown in “My Hub”.',
          'Envoyée par e-mail à l’enregistrement et affichée dans « Mon Hub ».',
        ),
      },
    },
    {
      name: 'repliedAt',
      type: 'date',
      label: l('Antwort verschickt', 'Reply sent', 'Réponse envoyée'),
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'memberEmail',
      type: 'email',
      label: l('Mitglied', 'Member', 'Membre'),
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'memberName',
      type: 'text',
      label: l('Name', 'Name', 'Nom'),
      admin: { readOnly: true, position: 'sidebar' },
    },
    { name: 'memberId', type: 'text', index: true, admin: { hidden: true } },
    { name: 'mailLocale', type: 'text', admin: { hidden: true } },
  ],
}

/** Bilder zum Feedback: nur für die Redaktion lesbar (können Personendaten zeigen, Entscheidung 8.2a). */
export const FeedbackImages: CollectionConfig = {
  slug: 'feedback-images',
  labels: {
    singular: l('Feedback-Bild', 'Feedback image', 'Image de feedback'),
    plural: l('Feedback-Bilder', 'Feedback images', 'Images de feedback'),
  },
  admin: { group: feedbackGroup, hidden: true },
  access: { read: editorsOnly, create: deny, update: deny, delete: editorsOnly },
  fields: [{ name: 'memberId', type: 'text', index: true, admin: { hidden: true } }],
  upload: { mimeTypes: ['image/png', 'image/jpeg', 'image/webp'], staticDir: 'feedback-images' },
}
