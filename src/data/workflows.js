// Central place to configure workflows, their webhooks, and form fields
// You can edit this file to add/remove workflows and customize fields

const workflows = [
  {
    id: 'lead-capture',
    name: 'Lead Capture',
    description:
      'Collect lead information and send it to your CRM via n8n. Includes validation and success feedback.',
    color: 'from-primary-500 to-indigo-600',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_LEAD_CAPTURE || 'https://n8n.example.com/webhook/lead-capture',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Doe' },
      { key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'jane@example.com' },
      { key: 'company', label: 'Company', type: 'text', required: false, placeholder: 'Acme Inc.' },
      { key: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Tell us about your needs...' },
    ],
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket',
    description:
      'Create a support ticket and notify your team. Automatically routes to the correct queue.',
    color: 'from-emerald-500 to-teal-600',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_SUPPORT_TICKET || 'https://n8n.example.com/webhook/support-ticket',
    fields: [
      { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'Issue summary' },
      { key: 'priority', label: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      { key: 'email', label: 'Requester Email', type: 'email', required: true, placeholder: 'you@example.com' },
      { key: 'details', label: 'Details', type: 'textarea', required: true, placeholder: 'Describe the issue in detail' },
    ],
  },
  {
    id: 'feedback',
    name: 'Product Feedback',
    description: 'Collect feedback and send to your product board with sentiment tagging.',
    color: 'from-pink-500 to-rose-600',
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_FEEDBACK || 'https://n8n.example.com/webhook/feedback',
    fields: [
      { key: 'name', label: 'Your Name', type: 'text', required: false },
      { key: 'email', label: 'Email', type: 'email', required: false },
      { key: 'category', label: 'Category', type: 'select', required: true, options: ['Bug', 'Feature', 'UX', 'Other'] },
      { key: 'feedback', label: 'Feedback', type: 'textarea', required: true },
    ],
  },
];

export default workflows;
