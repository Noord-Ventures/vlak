import type { VlakComponent } from "./schema";

/** Civic records and application-owned public service workflows. */
export const civicComponents: VlakComponent[] = [
  {
    "name": "identity-document",
    "title": "Identity document",
    "description": "Displays a supplied credential, masked identifier, issuer, dates, and verification status without exposing a raw identifier.",
    "category": "civic",
    "classes": [
      "rs-identity-document",
      "rs-identity-document-header",
      "rs-identity-document-title",
      "rs-identity-document-status",
      "rs-identity-document-holder",
      "rs-identity-document-fields",
      "rs-identity-document-field",
      "rs-identity-document-label",
      "rs-identity-document-value",
      "rs-identity-document-detail",
      "rs-identity-document-actions"
    ],
    "css": [
      "components/identity-document.css"
    ],
    "react": "components/identity-document.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-identity-document\" role=\"group\" aria-label=\"Residence document\"><div class=\"rs-identity-document-header\"><p class=\"rs-identity-document-title\">Residence document</p><span class=\"rs-identity-document-status\">Verification pending</span></div><p class=\"rs-identity-document-holder\">Robin Ellis</p><dl class=\"rs-identity-document-fields\"><div class=\"rs-identity-document-field\"><dt class=\"rs-identity-document-label\">Document number</dt><dd class=\"rs-identity-document-value\">•••• 2048</dd></div></dl></div>",
    "example": "import { IdentityDocument } from \"@noorddev/vlak-react\";\n\n<IdentityDocument documentTitle=\"Residence document\" holderName=\"Robin Ellis\" maskedIdentifier=\"•••• 2048\" issuer=\"Example civic office\" issuedLabel=\"12 June 2025\" expiresLabel=\"12 June 2030\" status=\"Verification pending\" statusDetail=\"Status supplied by the example record service\" />",
    "usage": {
      "use": [
        "Identity documents, professional credentials, and permit records using an already-masked display identifier.",
        "Supply verification status and date labels from the host; add real links or actions as children."
      ],
      "avoid": [
        "Passing a full identifier and expecting this component to redact it. It renders maskedIdentifier exactly as supplied.",
        "Inferring validity from an expiry date, or providing a cosmetic reveal button without an authorized source."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Supplied native links and buttons keep their keyboard behavior. The document adds no tab stop."
      }
    ],
    "a11y": [
      "A named group and description list preserve document fields in reading order.",
      "Missing identifier, issuer, and dates are explicitly labelled as not supplied. Status is visible text.",
      "Root attributes, className, style, and the div ref pass through. Supply child controls with at least 44px targets."
    ],
    "aliases": [
      "IdentityDocument",
      "Credential record",
      "Identity card",
      "Residence permit",
      "Identity verification",
      "Document summary"
    ]
  },
  {
    "name": "tax-summary",
    "title": "Tax summary",
    "description": "Separates supplied assessment line items from authoritative totals in a semantic two-column table.",
    "category": "civic",
    "classes": [
      "rs-tax-summary",
      "rs-tax-summary-header",
      "rs-tax-summary-status",
      "rs-tax-summary-reference",
      "rs-tax-summary-table",
      "rs-tax-summary-caption",
      "rs-tax-summary-period",
      "rs-tax-summary-column",
      "rs-tax-summary-row-label",
      "rs-tax-summary-amount",
      "rs-tax-summary-detail",
      "rs-tax-summary-total",
      "rs-tax-summary-footer",
      "rs-tax-summary-note",
      "rs-tax-summary-actions"
    ],
    "css": [
      "components/tax-summary.css"
    ],
    "react": "components/tax-summary.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-tax-summary\" role=\"group\" aria-label=\"Annual assessment\"><div class=\"rs-tax-summary-header\"><span class=\"rs-tax-summary-status\">Provisional</span><span class=\"rs-tax-summary-reference\">Example 204</span></div><table class=\"rs-tax-summary-table\"><caption class=\"rs-tax-summary-caption\">Annual assessment<span class=\"rs-tax-summary-period\">2025</span></caption><thead><tr><th scope=\"col\" class=\"rs-tax-summary-column\">Item</th><th scope=\"col\" class=\"rs-tax-summary-amount\">Amount</th></tr></thead><tbody><tr><th scope=\"row\" class=\"rs-tax-summary-row-label\">Assessed amount</th><td class=\"rs-tax-summary-amount\">€ 240.00</td></tr></tbody><tfoot><tr class=\"rs-tax-summary-total\"><th scope=\"row\" class=\"rs-tax-summary-row-label\">Amount payable</th><td class=\"rs-tax-summary-amount\">€ 240.00</td></tr></tfoot></table></div>",
    "example": "import { TaxSummary } from \"@noorddev/vlak-react\";\n\n<TaxSummary label=\"Annual assessment\" periodLabel=\"2025\" reference=\"Example 204\" status=\"Provisional\" items={[{ id: \"assessment\", label: \"Assessed amount\", amount: \"€ 240.00\", detail: \"Supplied by the example authority\" }]} totals={[{ id: \"payable\", label: \"Amount payable\", amount: \"€ 240.00\" }]} dueLabel=\"Payment date not supplied\" note=\"Fictional amounts; no tax calculation is performed\" />",
    "usage": {
      "use": [
        "Tax assessments, municipal charges, and other supplied statements with separate line items and totals.",
        "Pass fully formatted amounts, signs, currencies, period, payment timing, and status from the authoritative source."
      ],
      "avoid": [
        "Computing taxes, estimating refunds, summing amounts, or assuming a missing total is zero.",
        "Generating a payment action or deadline without an application-owned destination or supplied terms."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Only supplied child controls enter the tab order and retain native keyboard behavior."
      }
    ],
    "a11y": [
      "A caption names the table; scope attributes associate row and column headers with amount cells.",
      "Line items use tbody and supplied totals use tfoot. Amounts remain literal readable text.",
      "Missing line items, totals, reference, and timing have explicit text. No numeric or financial status is inferred.",
      "Native div attributes and refs pass through; child action targets should be at least 44px."
    ],
    "aliases": [
      "TaxSummary",
      "Tax assessment",
      "Assessment statement",
      "Municipal charges",
      "Tax bill",
      "Refund statement"
    ]
  },
  {
    "name": "benefit-program",
    "title": "Benefit program",
    "description": "Keeps programme availability, supplied eligibility, award terms, and criterion assessments separate.",
    "category": "civic",
    "classes": [
      "rs-benefit-program",
      "rs-benefit-program-header",
      "rs-benefit-program-name",
      "rs-benefit-program-status",
      "rs-benefit-program-detail",
      "rs-benefit-program-facts",
      "rs-benefit-program-field",
      "rs-benefit-program-label",
      "rs-benefit-program-value",
      "rs-benefit-program-criteria",
      "rs-benefit-program-criterion",
      "rs-benefit-program-criterion-head",
      "rs-benefit-program-actions"
    ],
    "css": [
      "components/benefit-program.css"
    ],
    "react": "components/benefit-program.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-benefit-program\" role=\"group\" aria-label=\"Community project grant\"><div class=\"rs-benefit-program-header\"><p class=\"rs-benefit-program-name\">Community project grant</p><span class=\"rs-benefit-program-status\">Applications open</span></div><dl class=\"rs-benefit-program-facts\"><div class=\"rs-benefit-program-field\"><dt class=\"rs-benefit-program-label\">Your eligibility</dt><dd class=\"rs-benefit-program-value\">Not assessed</dd></div><div class=\"rs-benefit-program-field\"><dt class=\"rs-benefit-program-label\">Award</dt><dd class=\"rs-benefit-program-value\">Award amount not supplied</dd></div></dl><ul class=\"rs-benefit-program-criteria\" aria-label=\"Eligibility criteria\"><li class=\"rs-benefit-program-criterion\"><div class=\"rs-benefit-program-criterion-head\"><strong>Project location</strong><span>Not reviewed</span></div></li></ul></div>",
    "example": "import { BenefitProgram } from \"@noorddev/vlak-react\";\n\n<BenefitProgram programName=\"Community project grant\" provider=\"Example council\" status=\"Applications open\" eligibility=\"Not assessed\" awardLabel=\"Award amount not supplied\" deadlineLabel=\"30 September 2026, as supplied\" criteria={[{ id: \"location\", label: \"Project location\", status: \"Not reviewed\", description: \"Location evidence is reviewed by the provider\" }]} />",
    "usage": {
      "use": [
        "Public benefits, grants, subsidies, and funding opportunities with source-owned eligibility assessments.",
        "Display programme availability separately from an applicant’s eligibility and the programme’s award terms."
      ],
      "avoid": [
        "Deciding eligibility from criteria, personal data, income, or a model-generated recommendation.",
        "Implying an award is approved because applications are open or some criteria are satisfied."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Supplied action links and buttons use native keyboard behavior. Criteria are static readable items."
      }
    ],
    "a11y": [
      "Programme name labels a group; programme facts use a description list and criteria use a named list.",
      "Eligibility, criterion status, and programme availability are visible text rather than color-only indicators.",
      "Missing provider, award, deadline, or criteria are explicitly described. Native root attributes and div refs pass through.",
      "Provide working child controls with at least 44px targets when an application or information action is available."
    ],
    "aliases": [
      "BenefitProgram",
      "Grant programme",
      "Subsidy card",
      "Public benefit",
      "Funding opportunity",
      "Eligibility summary"
    ]
  },
  {
    "name": "application-status",
    "title": "Application status",
    "description": "Shows a supplied case reference, status, update time, milestones, and next step without estimating progress.",
    "category": "civic",
    "classes": [
      "rs-application-status",
      "rs-application-status-header",
      "rs-application-status-title",
      "rs-application-status-reference",
      "rs-application-status-overview",
      "rs-application-status-status",
      "rs-application-status-detail",
      "rs-application-status-milestones",
      "rs-application-status-milestone",
      "rs-application-status-current",
      "rs-application-status-milestone-label",
      "rs-application-status-milestone-meta",
      "rs-application-status-next",
      "rs-application-status-next-label",
      "rs-application-status-actions"
    ],
    "css": [
      "components/application-status.css"
    ],
    "react": "components/application-status.tsx",
    "registryDependencies": [],
    "snippet": "<div class=\"rs-application-status\" role=\"group\" aria-label=\"Community grant application\"><div class=\"rs-application-status-header\"><p class=\"rs-application-status-title\">Community grant application</p><span class=\"rs-application-status-reference\">Example 204</span></div><div class=\"rs-application-status-overview\"><p class=\"rs-application-status-status\">Under review</p><p class=\"rs-application-status-detail\">Updated 14 September, as supplied</p></div><ol class=\"rs-application-status-milestones\" aria-label=\"Application milestones\"><li class=\"rs-application-status-milestone rs-application-status-current\" aria-current=\"step\"><span class=\"rs-application-status-milestone-label\">Evidence review</span><span class=\"rs-application-status-milestone-meta\">In progress</span></li></ol><div class=\"rs-application-status-next\"><p class=\"rs-application-status-next-label\">Next step</p><div>Wait for the review update</div></div></div>",
    "example": "import { ApplicationStatus } from \"@noorddev/vlak-react\";\n\n<ApplicationStatus applicationTitle=\"Community grant application\" reference=\"Example 204\" status=\"Under review\" updatedLabel=\"Updated 14 September, as supplied\" milestones={[{ id: \"received\", label: \"Application received\", status: \"Recorded\", dateLabel: \"12 September\" }, { id: \"review\", label: \"Evidence review\", status: \"In progress\", current: true }]} nextStep=\"Wait for the review update\" />",
    "usage": {
      "use": [
        "Permit, benefits, tax, and grant cases with supplied status and milestones.",
        "Supply the current milestone explicitly, preserve source milestone order, and use nextStep for the authority’s actual instruction."
      ],
      "avoid": [
        "Predicting approval, calculating completion percentages, or choosing the current step from dates.",
        "Presenting estimated service times as confirmed decision dates."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Any supplied child links or buttons keep their native keyboard behavior. Milestones are not interactive."
      }
    ],
    "a11y": [
      "An ordered, named list preserves milestone order. Explicit current milestones use aria-current=step and a full-surface fill.",
      "Status and dates are readable text. Optional machine-readable milestone dates are passed through without conversion.",
      "Missing reference, update time, milestone dates, milestones, and next step have explicit descriptions.",
      "The root forwards native div attributes and its ref. Use at least 44px targets for supplied actions."
    ],
    "aliases": [
      "ApplicationStatus",
      "Case status",
      "Application tracker",
      "Permit status",
      "Claim progress",
      "Case timeline"
    ]
  },
  {
    "name": "evidence-checklist",
    "title": "Evidence checklist",
    "description": "Lists evidence requirements, file records, and supplied verification status with controlled 44px action buttons.",
    "category": "civic",
    "classes": [
      "rs-evidence-checklist",
      "rs-evidence-checklist-heading",
      "rs-evidence-checklist-summary",
      "rs-evidence-checklist-list",
      "rs-evidence-checklist-item",
      "rs-evidence-checklist-head",
      "rs-evidence-checklist-label",
      "rs-evidence-checklist-requirement",
      "rs-evidence-checklist-detail",
      "rs-evidence-checklist-record",
      "rs-evidence-checklist-status",
      "rs-evidence-checklist-actions",
      "rs-evidence-checklist-action",
      "rs-evidence-checklist-empty"
    ],
    "css": [
      "components/evidence-checklist.css"
    ],
    "react": "components/evidence-checklist.tsx",
    "registryDependencies": [
      "button"
    ],
    "snippet": "<div class=\"rs-evidence-checklist\" role=\"group\" aria-label=\"Application evidence\"><p class=\"rs-evidence-checklist-heading\">Application evidence</p><ul class=\"rs-evidence-checklist-list\"><li class=\"rs-evidence-checklist-item\"><div class=\"rs-evidence-checklist-head\"><p class=\"rs-evidence-checklist-label\">Proof of address</p><span class=\"rs-evidence-checklist-requirement\">Required by the provider</span></div><div class=\"rs-evidence-checklist-record\">Example-address.pdf</div><div class=\"rs-evidence-checklist-status\" role=\"status\">Awaiting review</div></li></ul></div>",
    "example": "import { EvidenceChecklist } from \"@noorddev/vlak-react\";\n\n<EvidenceChecklist label=\"Application evidence\" items={[{ id: \"address\", label: \"Proof of address\", requirement: \"Required by the provider\", fileName: \"Example-address.pdf\", status: \"Awaiting review\" }]} />\n\n// To enable actions, supply item.actions and onAction(itemId, actionId).\n// The host performs uploads or changes and supplies pending and updated status.",
    "usage": {
      "use": [
        "Evidence requirements for permits, grants, benefits, and identity checks.",
        "Provide explicit actions for working uploads, downloads, replacements, or record changes through the host callback."
      ],
      "avoid": [
        "Marking evidence accepted from a filename or a button click, or inferring requirements from missing values.",
        "Treating uploads as submitted before the host confirms them, or rendering dead action buttons without a callback."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between enabled evidence action buttons when onAction and item actions are supplied."
      },
      {
        "keys": "Enter, Space",
        "does": "Requests the focused item action without mutating the displayed record. Pending or disabled actions cannot be activated."
      }
    ],
    "a11y": [
      "Action names contain the visible label and evidence name; descriptions include requirement, file record, and supplied status.",
      "Record status uses a polite atomic status region. Pending text remains visible and actionable controls are disabled without hiding the existing status.",
      "No checkboxes or completion percentage are invented from verification status. Missing requirements or file details are explicitly labelled.",
      "Buttons have at least 44px targets. Native root attributes, className, style, and div refs pass through."
    ],
    "aliases": [
      "EvidenceChecklist",
      "Document checklist",
      "Supporting documents",
      "Evidence requirements",
      "Application documents",
      "Verification checklist"
    ]
  }
];

