import type { CollectionConfig } from 'payload'

import { editorsOnly } from '@/access/roles'
import { asMailLocale, hubUrl, suggestionDecisionEmail } from '@/hub/mail'
import { l } from '@/lib/admin'
import { C } from '@/lib/slugs'

import { feedbackGroup } from './Feedback'

const deny = () => false

export const SUGGESTION_STATES = ['neu', 'in_pruefung', 'angenommen', 'abgelehnt'] as const

/**
 * Vorschlags-Inbox (Entscheidung 2.3): Mitglieder schlagen Einträge aus „Meine Methoden/Tools“ vor;
 * angenommene Vorschläge übernimmt die Redaktion als reguläre Inhalte. Entscheid geht per Mail an die Person.
 */
export const Suggestions: CollectionConfig = {
  slug: 'suggestions',
  labels: {
    singular: l('Vorschlag', 'Suggestion', 'Proposition'),
    plural: l('Vorschlags-Inbox', 'Suggestion inbox', 'Boîte de propositions'),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'suggestionStatus', 'memberEmail', 'createdAt'],
    group: feedbackGroup,
    listSearchableFields: ['title', 'text', 'memberEmail'],
  },
  defaultSort: '-createdAt',
  access: { read: editorsOnly, create: deny, update: editorsOnly, delete: editorsOnly },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== 'update' || !doc.memberEmail) return doc
        const decided =
          doc.suggestionStatus === 'angenommen' || doc.suggestionStatus === 'abgelehnt'
        if (!decided || doc.suggestionStatus === previousDoc?.suggestionStatus) return doc
        const locale = asMailLocale(doc.mailLocale)
        // Mailfehler dürfen das Speichern des Entscheids nicht verhindern
        try {
          await req.payload.sendEmail({
            to: doc.memberEmail,
            ...suggestionDecisionEmail(locale, {
              title: doc.title,
              accepted: doc.suggestionStatus === 'angenommen',
              note: doc.editorNote ?? '',
              url: hubUrl(locale, '#vorschlaege'),
            }),
          })
        } catch (error) {
          req.payload.logger.error({ err: error, msg: `Entscheid-Mail zu Vorschlag ${doc.id} nicht versendet` })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'suggestionStatus',
          type: 'select',
          label: l('Status', 'Status', 'Statut'),
          required: true,
          defaultValue: 'neu',
          options: [
            { value: 'neu', label: l('neu', 'new', 'nouveau') },
            { value: 'in_pruefung', label: l('in Prüfung', 'in review', 'en examen') },
            { value: 'angenommen', label: l('angenommen', 'accepted', 'acceptée') },
            { value: 'abgelehnt', label: l('abgelehnt', 'declined', 'refusée') },
          ],
        },
        {
          name: 'kind',
          type: 'select',
          label: l('Art', 'Type', 'Type'),
          required: true,
          options: [
            { value: 'methods', label: l('Methode', 'Method', 'Méthode') },
            { value: 'tools', label: l('Tool', 'Tool', 'Outil') },
          ],
          access: { update: deny },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: l('Titel', 'Title', 'Titre'),
      required: true,
      access: { update: deny },
    },
    {
      name: 'text',
      type: 'textarea',
      label: l('Beschreibung / Variante', 'Description / variant', 'Description / variante'),
      access: { update: deny },
    },
    {
      name: 'basedOn',
      type: 'relationship',
      relationTo: [C.methods, C.tools],
      label: l('Bezieht sich auf', 'Based on', 'Se rapporte à'),
      access: { update: deny },
    },
    {
      name: 'editorNote',
      type: 'textarea',
      label: l('Bemerkung an die Person', 'Note to the member', 'Remarque à la personne'),
      admin: {
        description: l(
          'Wird beim Entscheid (angenommen/abgelehnt) per Mail verschickt.',
          'Sent by email with the decision.',
          'Envoyée par e-mail avec la décision.',
        ),
      },
    },
    {
      name: 'memberEmail',
      type: 'email',
      label: l('Mitglied', 'Member', 'Membre'),
      admin: { readOnly: true, position: 'sidebar' },
      // Nur beim Anlegen gesetzt: sonst liessen sich Antwort-Mails an fremde Adressen umleiten
      access: { update: deny },
    },
    {
      name: 'memberName',
      type: 'text',
      label: l('Name', 'Name', 'Nom'),
      admin: { readOnly: true, position: 'sidebar' },
      // Nur beim Anlegen gesetzt: sonst liessen sich Antwort-Mails an fremde Adressen umleiten
      access: { update: deny },
    },
    { name: 'memberId', type: 'text', index: true, admin: { hidden: true }, access: { update: deny } },
    { name: 'mailLocale', type: 'text', admin: { hidden: true }, access: { update: deny } },
  ],
}
