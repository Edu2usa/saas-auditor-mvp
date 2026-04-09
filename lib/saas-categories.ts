export interface VendorInfo {
  category: string;
  displayName: string;
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Productivity': '#3b82f6',
  'Development': '#8b5cf6',
  'Marketing': '#ec4899',
  'Design': '#f97316',
  'Finance': '#10b981',
  'HR & Payroll': '#06b6d4',
  'Security': '#ef4444',
  'Communication': '#f59e0b',
  'Analytics': '#84cc16',
  'Storage & Backup': '#64748b',
  'CRM & Sales': '#e11d48',
  'Customer Support': '#7c3aed',
  'Infrastructure': '#0ea5e9',
  'Legal & Compliance': '#78716c',
  'Other': '#9ca3af',
};

const VENDOR_MAP: Record<string, VendorInfo> = {
  // Productivity
  'notion': { category: 'Productivity', displayName: 'Notion' },
  'asana': { category: 'Productivity', displayName: 'Asana' },
  'monday': { category: 'Productivity', displayName: 'Monday.com' },
  'monday.com': { category: 'Productivity', displayName: 'Monday.com' },
  'trello': { category: 'Productivity', displayName: 'Trello' },
  'clickup': { category: 'Productivity', displayName: 'ClickUp' },
  'basecamp': { category: 'Productivity', displayName: 'Basecamp' },
  'todoist': { category: 'Productivity', displayName: 'Todoist' },
  'evernote': { category: 'Productivity', displayName: 'Evernote' },
  'airtable': { category: 'Productivity', displayName: 'Airtable' },
  'microsoft 365': { category: 'Productivity', displayName: 'Microsoft 365' },
  'microsoft365': { category: 'Productivity', displayName: 'Microsoft 365' },
  'office 365': { category: 'Productivity', displayName: 'Microsoft 365' },
  'google workspace': { category: 'Productivity', displayName: 'Google Workspace' },
  'gsuite': { category: 'Productivity', displayName: 'Google Workspace' },
  'g suite': { category: 'Productivity', displayName: 'Google Workspace' },

  // Communication
  'slack': { category: 'Communication', displayName: 'Slack' },
  'zoom': { category: 'Communication', displayName: 'Zoom' },
  'microsoft teams': { category: 'Communication', displayName: 'Microsoft Teams' },
  'teams': { category: 'Communication', displayName: 'Microsoft Teams' },
  'webex': { category: 'Communication', displayName: 'Webex' },
  'discord': { category: 'Communication', displayName: 'Discord' },
  'loom': { category: 'Communication', displayName: 'Loom' },
  'calendly': { category: 'Communication', displayName: 'Calendly' },
  'hubspot meetings': { category: 'Communication', displayName: 'HubSpot Meetings' },
  'whereby': { category: 'Communication', displayName: 'Whereby' },
  'gotomeeting': { category: 'Communication', displayName: 'GoToMeeting' },

  // Development
  'github': { category: 'Development', displayName: 'GitHub' },
  'gitlab': { category: 'Development', displayName: 'GitLab' },
  'bitbucket': { category: 'Development', displayName: 'Bitbucket' },
  'jira': { category: 'Development', displayName: 'Jira' },
  'linear': { category: 'Development', displayName: 'Linear' },
  'vercel': { category: 'Development', displayName: 'Vercel' },
  'netlify': { category: 'Development', displayName: 'Netlify' },
  'heroku': { category: 'Development', displayName: 'Heroku' },
  'aws': { category: 'Development', displayName: 'AWS' },
  'amazon web services': { category: 'Development', displayName: 'AWS' },
  'google cloud': { category: 'Development', displayName: 'Google Cloud' },
  'gcp': { category: 'Development', displayName: 'Google Cloud' },
  'azure': { category: 'Development', displayName: 'Microsoft Azure' },
  'digitalocean': { category: 'Development', displayName: 'DigitalOcean' },
  'sentry': { category: 'Development', displayName: 'Sentry' },
  'datadog': { category: 'Development', displayName: 'Datadog' },
  'new relic': { category: 'Development', displayName: 'New Relic' },
  'postman': { category: 'Development', displayName: 'Postman' },
  'figma': { category: 'Design', displayName: 'Figma' },

  // Design
  'canva': { category: 'Design', displayName: 'Canva' },
  'adobe': { category: 'Design', displayName: 'Adobe Creative Cloud' },
  'adobe creative cloud': { category: 'Design', displayName: 'Adobe Creative Cloud' },
  'sketch': { category: 'Design', displayName: 'Sketch' },
  'invision': { category: 'Design', displayName: 'InVision' },
  'zeplin': { category: 'Design', displayName: 'Zeplin' },
  'miro': { category: 'Design', displayName: 'Miro' },
  'lucidchart': { category: 'Design', displayName: 'Lucidchart' },

  // Marketing
  'hubspot': { category: 'Marketing', displayName: 'HubSpot' },
  'mailchimp': { category: 'Marketing', displayName: 'Mailchimp' },
  'klaviyo': { category: 'Marketing', displayName: 'Klaviyo' },
  'activecampaign': { category: 'Marketing', displayName: 'ActiveCampaign' },
  'constant contact': { category: 'Marketing', displayName: 'Constant Contact' },
  'buffer': { category: 'Marketing', displayName: 'Buffer' },
  'hootsuite': { category: 'Marketing', displayName: 'Hootsuite' },
  'sprout social': { category: 'Marketing', displayName: 'Sprout Social' },
  'semrush': { category: 'Marketing', displayName: 'SEMrush' },
  'ahrefs': { category: 'Marketing', displayName: 'Ahrefs' },
  'google ads': { category: 'Marketing', displayName: 'Google Ads' },

  // CRM & Sales
  'salesforce': { category: 'CRM & Sales', displayName: 'Salesforce' },
  'pipedrive': { category: 'CRM & Sales', displayName: 'Pipedrive' },
  'zoho': { category: 'CRM & Sales', displayName: 'Zoho CRM' },
  'freshsales': { category: 'CRM & Sales', displayName: 'Freshsales' },
  'close': { category: 'CRM & Sales', displayName: 'Close CRM' },
  'apollo': { category: 'CRM & Sales', displayName: 'Apollo.io' },
  'outreach': { category: 'CRM & Sales', displayName: 'Outreach' },

  // Finance
  'quickbooks': { category: 'Finance', displayName: 'QuickBooks' },
  'xero': { category: 'Finance', displayName: 'Xero' },
  'freshbooks': { category: 'Finance', displayName: 'FreshBooks' },
  'wave': { category: 'Finance', displayName: 'Wave' },
  'stripe': { category: 'Finance', displayName: 'Stripe' },
  'bill.com': { category: 'Finance', displayName: 'Bill.com' },
  'expensify': { category: 'Finance', displayName: 'Expensify' },
  'brex': { category: 'Finance', displayName: 'Brex' },
  'ramp': { category: 'Finance', displayName: 'Ramp' },

  // HR & Payroll
  'gusto': { category: 'HR & Payroll', displayName: 'Gusto' },
  'bamboohr': { category: 'HR & Payroll', displayName: 'BambooHR' },
  'workday': { category: 'HR & Payroll', displayName: 'Workday' },
  'adp': { category: 'HR & Payroll', displayName: 'ADP' },
  'rippling': { category: 'HR & Payroll', displayName: 'Rippling' },
  'lattice': { category: 'HR & Payroll', displayName: 'Lattice' },
  'greenhouse': { category: 'HR & Payroll', displayName: 'Greenhouse' },
  'lever': { category: 'HR & Payroll', displayName: 'Lever' },
  'indeed': { category: 'HR & Payroll', displayName: 'Indeed' },
  'linkedin': { category: 'HR & Payroll', displayName: 'LinkedIn Recruiter' },

  // Security
  '1password': { category: 'Security', displayName: '1Password' },
  'lastpass': { category: 'Security', displayName: 'LastPass' },
  'okta': { category: 'Security', displayName: 'Okta' },
  'cloudflare': { category: 'Security', displayName: 'Cloudflare' },
  'norton': { category: 'Security', displayName: 'Norton' },
  'crowdstrike': { category: 'Security', displayName: 'CrowdStrike' },
  'duo': { category: 'Security', displayName: 'Duo Security' },

  // Analytics
  'mixpanel': { category: 'Analytics', displayName: 'Mixpanel' },
  'amplitude': { category: 'Analytics', displayName: 'Amplitude' },
  'segment': { category: 'Analytics', displayName: 'Segment' },
  'hotjar': { category: 'Analytics', displayName: 'Hotjar' },
  'fullstory': { category: 'Analytics', displayName: 'FullStory' },
  'google analytics': { category: 'Analytics', displayName: 'Google Analytics' },
  'tableau': { category: 'Analytics', displayName: 'Tableau' },
  'looker': { category: 'Analytics', displayName: 'Looker' },
  'powerbi': { category: 'Analytics', displayName: 'Power BI' },

  // Storage & Backup
  'dropbox': { category: 'Storage & Backup', displayName: 'Dropbox' },
  'box': { category: 'Storage & Backup', displayName: 'Box' },
  'google drive': { category: 'Storage & Backup', displayName: 'Google Drive' },
  'onedrive': { category: 'Storage & Backup', displayName: 'OneDrive' },
  'backblaze': { category: 'Storage & Backup', displayName: 'Backblaze' },

  // Customer Support
  'zendesk': { category: 'Customer Support', displayName: 'Zendesk' },
  'intercom': { category: 'Customer Support', displayName: 'Intercom' },
  'freshdesk': { category: 'Customer Support', displayName: 'Freshdesk' },
  'helpscout': { category: 'Customer Support', displayName: 'Help Scout' },
  'drift': { category: 'Customer Support', displayName: 'Drift' },
  'crisp': { category: 'Customer Support', displayName: 'Crisp' },

  // Infrastructure
  'twilio': { category: 'Infrastructure', displayName: 'Twilio' },
  'sendgrid': { category: 'Infrastructure', displayName: 'SendGrid' },
  'mailgun': { category: 'Infrastructure', displayName: 'Mailgun' },
  'cloudinary': { category: 'Infrastructure', displayName: 'Cloudinary' },
  'fastly': { category: 'Infrastructure', displayName: 'Fastly' },
  'supabase': { category: 'Infrastructure', displayName: 'Supabase' },
  'firebase': { category: 'Infrastructure', displayName: 'Firebase' },
  'mongodb': { category: 'Infrastructure', displayName: 'MongoDB Atlas' },
  'planetscale': { category: 'Infrastructure', displayName: 'PlanetScale' },
  'neon': { category: 'Infrastructure', displayName: 'Neon' },
};

export function detectVendorInfo(vendorName: string): VendorInfo {
  const normalized = vendorName.toLowerCase().trim();

  // Exact match first
  if (VENDOR_MAP[normalized]) return VENDOR_MAP[normalized];

  // Partial match
  for (const [key, info] of Object.entries(VENDOR_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return info;
    }
  }

  // Heuristic keyword detection
  if (/pay(roll)?|paycheck|gusto|adp|wage/i.test(normalized)) return { category: 'HR & Payroll', displayName: vendorName };
  if (/secur|password|vpn|firewall|antivir/i.test(normalized)) return { category: 'Security', displayName: vendorName };
  if (/analytics|metric|insight|dashboard|track/i.test(normalized)) return { category: 'Analytics', displayName: vendorName };
  if (/crm|sales|lead|pipeline|prospect/i.test(normalized)) return { category: 'CRM & Sales', displayName: vendorName };
  if (/market|email|campaign|seo|social/i.test(normalized)) return { category: 'Marketing', displayName: vendorName };
  if (/design|creative|graphic|video|photo/i.test(normalized)) return { category: 'Design', displayName: vendorName };
  if (/cloud|host|server|infra|deploy|devops/i.test(normalized)) return { category: 'Infrastructure', displayName: vendorName };
  if (/accounting|invoice|billing|expense|book/i.test(normalized)) return { category: 'Finance', displayName: vendorName };
  if (/support|helpdesk|ticket|chat|customer/i.test(normalized)) return { category: 'Customer Support', displayName: vendorName };
  if (/hr|human|recruit|hire|talent|employ/i.test(normalized)) return { category: 'HR & Payroll', displayName: vendorName };
  if (/storage|backup|drive|file|sync/i.test(normalized)) return { category: 'Storage & Backup', displayName: vendorName };
  if (/dev|code|git|repo|ci|cd|test|deploy/i.test(normalized)) return { category: 'Development', displayName: vendorName };
  if (/communicate|meet|video|call|message|chat/i.test(normalized)) return { category: 'Communication', displayName: vendorName };
  if (/manage|project|task|plan|board|work/i.test(normalized)) return { category: 'Productivity', displayName: vendorName };

  return { category: 'Other', displayName: vendorName };
}

export function buildCategoryBreakdown(
  subscriptions: Array<{ category: string; monthly_cost: number; annual_cost: number }>
): Array<{ category: string; monthly_cost: number; annual_cost: number; vendor_count: number; color: string }> {
  const map = new Map<string, { monthly_cost: number; annual_cost: number; vendor_count: number }>();

  for (const sub of subscriptions) {
    const existing = map.get(sub.category) ?? { monthly_cost: 0, annual_cost: 0, vendor_count: 0 };
    map.set(sub.category, {
      monthly_cost: existing.monthly_cost + sub.monthly_cost,
      annual_cost: existing.annual_cost + sub.annual_cost,
      vendor_count: existing.vendor_count + 1,
    });
  }

  return Array.from(map.entries())
    .map(([category, data]) => ({
      category,
      ...data,
      color: CATEGORY_COLORS[category] ?? CATEGORY_COLORS['Other'],
    }))
    .sort((a, b) => b.monthly_cost - a.monthly_cost);
}
