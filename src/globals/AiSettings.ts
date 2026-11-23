import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { groups, l } from '@/lib/admin'

/**
 * KI-Einstellungen (Entscheidung 8.5): kurze, vom Admin gepflegte Modellliste pro Anbieter.
 * Ist für einen Anbieter kein Modell eingetragen, geben Mitglieder den Modellnamen selbst ein
 * (immer so beim „OpenAI-kompatiblen“ Anbieter).
 */
export const AiSettings: GlobalConfig = {
  slug: 'ai-settings',
  label: l('KI-Einstellungen', 'AI settings', 'Paramètres IA'),
  admin: { group: groups.admin },
  access: { read: () => true, update: ({ req }) => isAdmin(req.user) },
  fields: [
    {
      name: 'models',
      type: 'array',
      label: l('Modelle für Ask-a-question', 'Models for Ask-a-question', 'Modèles pour Ask-a-question'),
      admin: {
        description: l(
          'Pro Anbieter höchstens wenige aktuelle Modelle. Der erste Eintrag eines Anbieters ist die Voreinstellung.',
          'A few current models per provider. The first entry of a provider is the default.',
          'Quelques modèles actuels par fournisseur. La première entrée est la valeur par défaut.',
        ),
      },
      defaultValue: [
        { provider: 'anthropic', model: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
        { provider: 'anthropic', model: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
      ],
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'provider',
              type: 'select',
              required: true,
              label: l('Anbieter', 'Provider', 'Fournisseur'),
              options: [
                { value: 'anthropic', label: 'Anthropic' },
                { value: 'openai', label: 'OpenAI' },
              ],
            },
            { name: 'model', type: 'text', required: true, label: l('Modell-ID', 'Model ID', 'ID du modèle') },
            { name: 'label', type: 'text', required: true, label: l('Anzeigename', 'Display name', 'Nom affiché') },
          ],
        },
      ],
    },
  ],
}
