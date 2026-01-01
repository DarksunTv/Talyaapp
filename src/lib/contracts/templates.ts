// Contract Template System
export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
}

export interface ContractVariables {
  customer_name: string;
  customer_address: string;
  customer_phone: string;
  customer_email: string;
  project_address: string;
  project_name: string;
  estimate_total: string;
  estimate_date: string;
  company_name: string;
  company_phone: string;
  today_date: string;
  line_items_table: string;
}

/**
 * Default roofing contract template
 */
export const DEFAULT_CONTRACT_TEMPLATE = 
`ROOFING CONTRACT AGREEMENT

This Agreement is made on ` + '{{today_date}}' + ` between:

CONTRACTOR: ` + '{{company_name}}' + `
Phone: ` + '{{company_phone}}' + `

CUSTOMER: ` + '{{customer_name}}' + `
Address: ` + '{{customer_address}}' + `
Phone: ` + '{{customer_phone}}' + `
Email: ` + '{{customer_email}}' + `

PROJECT ADDRESS: ` + '{{project_address}}' + `
Project Name: ` + '{{project_name}}' + `

SCOPE OF WORK:
` + '{{line_items_table}}' + `

TOTAL CONTRACT PRICE: $` + '{{estimate_total}}' + `

PAYMENT TERMS:
- 50% deposit due upon signing
- 50% balance due upon completion

TIMELINE:
Work will commence within 5 business days of deposit receipt and will be completed within a reasonable timeframe based on weather conditions and material availability.

WARRANTY:
All work is guaranteed for a period of 5 years from the date of completion. This warranty covers workmanship defects but does not cover damage from acts of nature, accidents, or normal wear and tear.

INSURANCE:
Contractor maintains general liability insurance and workers' compensation insurance for all employees.

PERMITS:
Contractor will obtain all necessary permits for the work described above.

CHANGE ORDERS:
Any changes to the scope of work must be agreed upon in writing and may result in additional charges.

CANCELLATION:
Either party may cancel this agreement with 48 hours written notice. If Customer cancels after work has begun, Customer agrees to pay for all work completed and materials purchased.

ACCEPTANCE:
By signing below, both parties agree to the terms and conditions outlined in this contract.

CONTRACTOR SIGNATURE: _____________________________  DATE: __________

CUSTOMER SIGNATURE: _____________________________  DATE: __________

Generated on ` + '{{today_date}}';

/**
 * Render contract template with variables
 */
export function renderContractTemplate(
  template: string,
  variables: ContractVariables
): string {
  let rendered = template;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
  });

  return rendered;
}

/**
 * Generate line items table for contract
 */
export function generateLineItemsTable(lineItems: any[]): string {
  let table = '\n';
  table += 'ITEM                                    QTY    UNIT      PRICE      TOTAL\n';
  table += '─'.repeat(75) + '\n';

  lineItems.forEach((item) => {
    const desc = item.description.padEnd(35);
    const qty = String(item.quantity).padStart(6);
    const unit = item.unit.padEnd(8);
    const price = `$${item.unitPrice.toFixed(2)}`.padStart(10);
    const total = `$${item.total.toFixed(2)}`.padStart(10);
    table += `${desc} ${qty} ${unit} ${price} ${total}\n`;
  });

  table += '─'.repeat(75) + '\n';

  return table;
}

/**
 * Get all contract templates
 */
export function getContractTemplates(): ContractTemplate[] {
  return [
    {
      id: 'default',
      name: 'Standard Roofing Contract',
      content: DEFAULT_CONTRACT_TEMPLATE,
    },
  ];
}

/**
 * Get template by ID
 */
export function getContractTemplate(templateId: string): ContractTemplate | null {
  const templates = getContractTemplates();
  return templates.find((t) => t.id === templateId) || null;
}
