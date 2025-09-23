// Central place to configure workflows, their webhooks, and form fields
// You can edit this file to add/remove workflows and customize fields

const workflows = [
  {
    id: 'strategy-generator',
    name: 'Strategy Generator',
    description:
      'Generate trading strategies based on market conditions.',
    color: 'from-primary-500 to-indigo-600',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_STRATEGY_GENERATOR || 'https://n8n.example.com/webhook/strategy-generator',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'jane@example.com' },
      { key: 'projectTitle', label: 'Project Title', type: 'text', required: true, placeholder: 'National Day Social Campaign' },
      { key: 'objectives', label: 'Objectives', type: 'textarea', required: true, placeholder: 'Awareness, engagement, conversion...' },
      { key: 'audience', label: 'Audience', type: 'textarea', required: true, placeholder: 'Saudi youth, families, public sector stakeholders' },
      { key: 'deliverables', label: 'Deliverables', type: 'textarea', required: true, placeholder: 'Social captions, 15s scripts, idea deck' },
      { key: 'projectGoals', label: 'Project Goals', type: 'textarea', required: true, placeholder: 'Drive engagement with respectful national tone' },
      { key: 'channels', label: 'Channels', type: 'text', required: false, placeholder: 'X, Instagram, YouTube' },
      { key: 'deadline', label: 'Deadline', type: 'date', required: false, placeholder: 'YYYY-MM-DD' },
      // { key: 'attachments', label: 'Attachments / Links', type: 'text', required: false, placeholder: 'https://drive.google.com/…' },
      { key: 'internalNotes', label: 'Internal Notes (PM/CTL)', type: 'textarea', required: false, placeholder: 'Notes, constraints, must-include items' },
      { key: 'category', label: 'Category (optional)', type: 'select', options: ['campaign','script','captions','presentation','other'], required: false },
    ],
  }
];

export default workflows;
