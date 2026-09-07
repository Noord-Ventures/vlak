export const scienceStudies = [
  {
    slug: "microbiology", title: "Microbiology notebook",
    voice: "Keep each observation attached to its sample.",
    law: "A culture collection with plate records, colony inspection, and a local review notebook.",
    story: "A sample-first laboratory notebook. The collection leads into a recorded plate, where supplied colony markers stay connected to their source records. A deeper inspector keeps notes and review decisions beside the selected culture.",
    what: "Microbiology notebook", type: "Culture collection, plate records, observation notebook", module: "Grid system",
    ink: "Paper fields, dark selected records, and a precise circular plate diagram.",
    use: "Choose a culture → inspect a colony → save a note or review",
    field: "A specimen collection beside a plate and a contextual notebook.",
    note: "All cultures, samples, and observations are fictional. Notes and reviews last for this browser session; no laboratory system is connected. Colony positions and recorded counts are supplied data, with no image detection or culture recommendations.",
    components: ["Button", "Card", "Icon", "Input", "Textarea", "Toggle group", "Colony plate", "Culture log"],
    modifications: [
      "Colony plate supplies its diagram, exact source counts, and keyboard-accessible record list. Selecting a marker opens the matching local notebook without changing the source count.",
      "Culture log receives chronological source observations and locally saved notes. Input, Textarea, and Button compose the notebook form, while Toggle group switches plate and history views.",
      "Card provides the collection summary inside a flush bordered workspace. The list and inspector are custom compositions using Vlak controls and local state.",
    ],
  },
  {
    slug: "genome", title: "Genome mapping workspace",
    voice: "Inspect the evidence at one reference position.",
    law: "A bounded reference browser with region selection, coverage, aligned reads, and local annotations.",
    story: "A reference browser that keeps coordinates explicit. Select one of two fictional contigs, choose a region, and inspect the supplied depth and aligned reads. A selected position anchors a local annotation that can be exported with its reference and coordinate convention.",
    what: "Genome mapping workspace", type: "Reference regions, coverage, aligned reads, annotations", module: "Grid system",
    ink: "A quiet coordinate grid, monochrome coverage, and full-surface base selection.",
    use: "Open a reference region → inspect a locus → annotate and export",
    field: "Region navigation above a bounded evidence canvas and annotation inspector.",
    note: "The short sequences and read records are fictional interface fixtures. Region selection, annotations, and JSON download work locally. The workspace performs no mapping, alignment, variant calling, or clinical interpretation.",
    components: ["Button", "Card", "Icon", "Textarea", "Toggle group", "Genomic region field", "Coverage inspector", "Sequence alignment"],
    modifications: [
      "Genomic region field validates a one-based inclusive region before the evidence window changes. Its contig and numeric controls retain Vlak's keyboard and native form behavior.",
      "Coverage inspector and Sequence alignment share the selected reference position. The workspace slices already supplied records; it does not compute an alignment or fill missing depths.",
      "Textarea and Button record annotations tied to the selected locus. Export downloads the actual local records with their coordinate convention and fictional reference identity.",
    ],
  },
  {
    slug: "protein", title: "Protein sequence workbench",
    voice: "Make a sequence edit and inspect exactly what changed.",
    law: "A local sequence editor with residue inspection, saved variants, and explicit constraint review.",
    story: "A workbench for discussing sequence editing with a deliberately nonfunctional toy sequence. Inspect a residue, edit the sequence, and save a local variant. Comparison shows exact substitutions, additions, and removals; constraint review reports only the stated length and character rules.",
    what: "Protein sequence workbench", type: "Residue inspection, draft editing, variant comparison", module: "Grid system",
    ink: "An illustrative ribbon above a precise, typographic residue grid.",
    use: "Inspect a residue → edit and save a variant → compare and review",
    field: "A sequence canvas paired with a local variant shelf and focused editor.",
    note: "The short repeated sequence is a fictional, nonfunctional teaching fixture. The ribbon is illustrative and does not represent a calculated structure. Edits and review records are local; no folding model, scientific scoring, synthesis, or design service is connected.",
    components: ["Button", "Card", "Icon", "Input", "Textarea", "Select", "Toggle group"],
    modifications: [
      "Select, Input, and Textarea provide residue replacement, variant naming, and direct sequence editing. Button saves local drafts and review notes with truthful feedback.",
      "A bespoke residue grid uses native 44px buttons and arrow-key navigation. The accompanying ribbon is a labelled static illustration, with no claim that edits predict a new structure.",
      "Card and Toggle group organize saved variants, exact sequence differences, and explicit rules. Narrow layouts give the sequence, variant shelf, and editor separate focused screens.",
    ],
  },
] as const;

export const scienceMobilePatterns = {
  microbiology: "Below a 640px specimen width, Cultures, Plate, and Notebook become separate screens. Choosing a culture opens its plate; a colony opens a focused notebook with a pinned Save note action. Back retains the selected record and returns focus to its opening control.",
  genome: "Below a 640px specimen width, Region, Evidence, and Notes have separate screens. Applying a valid region opens evidence; coverage and alignment remain reachable through a view picker. Notes keep their selected locus and a pinned save action, with export available from the region screen.",
  protein: "Below a 640px specimen width, Sequence, Variants, and Edit become separate destinations. Residue controls stay 44px, the editor scrolls independently from its save action, and a saved variant opens the comparison screen. Back retains the current sequence and returns focus to the selected residue.",
} as const;
