/**
 * About facts. Every string is already known, or written from known facts.
 * Do not invent a bio, a client list, a headcount, or a product.
 *
 * Register: workhorse, specific, facts before poetry. Lead with what
 * Vlak is and who it is for. History (Crouwel, Müller-Brockmann) sits
 * after the specimen. Credits stay in the colophon.
 *
 * Sources:
 *   packages/core/src/tokens.ts          type.foundry, meta.url, grid.module
 *   packages/core/css/fonts/inter/OFL.txt
 *   README.md                            typeface, packages, 204 module
 *   LICENSE                              copyright line
 *   apps/www/app/specimen.ts             word, door, host, command
 *   package.json                         homepage, repository
 */

import { COMMAND, DOOR, LAW, WORD } from "../specimen";
import { vlakTokens } from "@noorddev/vlak";

export const word = WORD;
export const law = LAW;

const foundry = vlakTokens.type.foundry;
const grid = vlakTokens.grid;

export const era = {
  heading: WORD,
  kicker: LAW,
};

export const lead = {
  kicker: "What it is",
  what: "Vlak is a minimal design system for product exploration. Its name is Dutch for plane or surface: the field where type, controls, and content take shape.",
  who: "It is built for the dense, ordinary work of software: forms, tables, settings, navigation, and states. A 204px module sets the structure. Inter carries the hierarchy. Hairlines make relationships visible without turning every element into a box.",
};

export const usage = {
  kicker: "Usage",
  intro: "Choose how much of the system you want to own. Import precompiled React components, vendor the StyleX source with the CLI, or use vlak.css and stable rs-* classes in plain HTML.",
  commandWhere: "Terminal",
  command: COMMAND,
  htmlWhere: "Head",
  html: `<link rel="stylesheet" href="styles/vlak.css" />`,
  controlWhere: "Body",
  control: `<button class="rs-btn-primary">Save</button>`,
  landing:
    "index.html is a working specimen of the system: type, the 204px grid, controls, and the ten principles.",
  files:
    "The CLI writes styles/vlak.css, Inter, and vlak.json into your project. It works offline and makes no runtime request.",
  after: "For the dark scheme, set data-theme=\"dark\" on the root element.",
};

export const license = {
  kicker: "Open source",
  body: "Vlak is MIT-licensed. Use it, modify it, and ship it in commercial or personal work.",
  type: `${foundry.typeface} is ${foundry.license}, designed by ${foundry.designer}.`,
};

export const specimen = {
  kicker: "The system",
  body: "Vlak treats an interface as a field, not a stack of cards. A 204px module gives pages a repeatable measure: one cell for a control, two for a form, several for a working surface. Content stays flush to the gridline.",
  mid: "Body text is 15px at weight 500. Headings and labels are 600. Small text keeps Inter’s tall x-height; display sizes tighten their tracking. Sentence case and a short type scale keep the hierarchy explicit.",
  long: "Paper, ink, and the grays between them carry the palette. Hairlines separate related regions. Concentric radii align nested controls. Motion lasts 0.12 to 0.18 seconds and answers an action; color and opacity change before layout does. Controls are 40px tall on desktop and 44px on a phone.",
};

export const history = {
  kicker: "Design lineage",
  body: "Swiss International Typographic Style gives Vlak its grid, sans serif type, asymmetric composition, and hierarchy built from scale, weight, and space.",
  dutch: "From Dutch modernism: a more elastic field, type used as structure, direct construction, and tension between strict systems and lively composition. The result is neither a poster theme nor a historical reproduction.",
  now: "Vlak translates those principles into product constraints: tokens, native elements, stable classes, visible focus, predictable spacing, and components that can be inspected as data.",
};

export const featured = [
  {
    id: "jmb",
    name: "Josef Müller-Brockmann",
    years: "1914–1996",
    place: "Zurich",
    mark: "Grid Systems in Graphic Design. Neue Grafik, 1958.",
    work: {
      src: "/about/mueller-brockmann-grid-systems.webp",
      alt: "Cover of Grid Systems in Graphic Design",
    },
  },
  {
    id: "wc",
    name: "Wim Crouwel",
    years: "1928–2019",
    place: "Amsterdam",
    mark: "Stedelijk posters. New Alphabet, 1967. Total Design, 1963.",
    work: {
      src: "/about/crouwel-new-alphabet.webp",
      alt: "New Alphabet type specimen",
    },
  },
] as const;

export const field = [
  {
    name: "Richard Paul Lohse",
    years: "1902–1988",
    place: "Zurich",
    mark: "100 Jahre Eisenbeton. Kunstgewerbemuseum Zürich, 1950.",
    work: {
      src: "/about/lohse-100-jahre-eisenbeton.webp",
      alt: "100 Jahre Eisenbeton, Kunstgewerbemuseum Zürich, 1950",
    },
  },
  {
    name: "Hans Neuburg",
    years: "1904–1983",
    place: "Zurich",
    mark: "Konstruktive Grafik. Kunstgewerbemuseum Zürich, 1958.",
    work: {
      src: "/about/neuburg-konstruktive-grafik.webp",
      alt: "Konstruktive Grafik, Kunstgewerbemuseum Zürich, 1958",
    },
  },
  {
    name: "Carlo Vivarelli",
    years: "1919–1986",
    place: "Zurich",
    mark: "Für das Alter. Per la vecchiaia, 1949.",
    work: {
      src: "/about/vivarelli-fur-das-alter.webp",
      alt: "Für das Alter. Per la vecchiaia, 1949",
    },
  },
  {
    name: "Max Bill",
    years: "1908–1994",
    place: "Zurich · Ulm",
    mark: "HfG Ulm. Concrete art.",
    work: {
      src: "/about/bill-hfg-ulm.webp",
      alt: "HfG Ulm, architecture by Max Bill, 1955",
    },
  },
  {
    name: "Karl Gerstner",
    years: "1930–2017",
    place: "Basel",
    mark: "Designing Programmes, 1964.",
    work: {
      src: "/about/gerstner-designing-programmes.webp",
      alt: "Cover of Designing Programmes",
    },
  },
  {
    name: "Thérèse Moll",
    years: "1934–1961",
    place: "Basel · Cambridge",
    mark: "Micorène, c. 1958. Gerstner atelier. Modular type at MIT.",
    work: {
      src: "/about/moll-micorene.webp",
      alt: "Micorène, c. 1958",
    },
  },
  {
    name: "Emil Ruder",
    years: "1914–1970",
    place: "Basel",
    mark: "Typographie.",
    work: {
      src: "/about/ruder-typographie.webp",
      alt: "Cover of Typographie",
    },
  },
  {
    name: "Armin Hofmann",
    years: "1920–2020",
    place: "Basel",
    mark: "Graphic Design Manual.",
    work: {
      src: "/about/hofmann-form-farbe.webp",
      alt: "Form Farbe poster, Gewerbemuseum Winterthur, 1951",
    },
  },
  {
    name: "Nelly Rudin",
    years: "1928–2013",
    place: "Basel · Zurich",
    mark: "Saffa 1958 Zürich, 1958. Geigy. Müller-Brockmann studio.",
    work: {
      src: "/about/rudin-saffa-1958.webp",
      alt: "Saffa 1958 Zürich, 1958",
    },
  },
  {
    name: "Rosmarie Tissi",
    years: "1937",
    place: "Zurich",
    mark: "20 CHF Gertrud Kurz, 1992. Odermatt & Tissi.",
    work: {
      src: "/about/tissi-gertrud-kurz.webp",
      alt: "Münzkabinett Berlin. GERTRUD KURZ, 1890/1972.",
    },
  },
  {
    name: "Shizuko Yoshikawa",
    years: "1934–2019",
    place: "Ulm · Zurich",
    mark: "Japanische Plakate heute, 1979. Müller-Brockmann studio.",
    work: {
      src: "/about/yoshikawa-japanische-plakate-heute.webp",
      alt: "Japanische Plakate heute, 1979",
    },
  },
  {
    name: "Piet Zwart",
    years: "1885–1977",
    place: "Rotterdam",
    mark: "Bruynzeel kitchen, 1938. Typotekt.",
    work: {
      src: "/about/zwart-bruynzeel.webp",
      alt: "Bruynzeel kitchen, 1938",
    },
  },
  {
    name: "Paul Schuitema",
    years: "1897–1973",
    place: "Rotterdam",
    mark: "Chair no. 35, 1934. Photomontage. Constructivism.",
    work: {
      src: "/about/schuitema-chair-35.webp",
      alt: "Chair no. 35, 1934",
    },
  },
  {
    name: "Fré Cohen",
    years: "1903–1943",
    place: "Amsterdam",
    mark: "SDAP. Stadsdrukkerij Amsterdam.",
    work: {
      src: "/about/cohen-sdap-nvv.webp",
      alt: "SDAP / NVV poster, 1926",
    },
  },
  {
    name: "Otto Treumann",
    years: "1919–2001",
    place: "Amsterdam",
    mark: "Memorial plaque, Station Vught, 1984.",
    work: {
      src: "/about/treumann-vught.webp",
      alt: "Memorial plaque at Station Vught, 1984",
    },
  },
  {
    name: "Willem Sandberg",
    years: "1897–1984",
    place: "Amsterdam",
    mark: "Stedelijk Museum enamel sign. Torn paper, 1954.",
    work: {
      src: "/about/sandberg-stedelijk-email-1954.webp",
      alt: "Stedelijk Museum enamel sign, 1954",
    },
  },
  {
    name: "Jurriaan Schrofer",
    years: "1926–1990",
    place: "The Hague",
    mark: "De letter op straat. Meijer, 1956.",
    work: {
      src: "/about/schrofer-de-letter-op-straat.webp",
      alt: "De letter op straat, 1956",
    },
  },
  {
    name: "Total Design",
    years: "1971",
    place: "Amsterdam",
    mark: "Stedelijk, co westerik, 24 sep–7 nov 1971.",
    work: {
      src: "/about/total-design-westerik-1971.webp",
      alt: "Total Design / Crouwel, co westerik, Stedelijk 24 sep–7 nov 1971",
    },
  },
  {
    name: "Benno Wissing",
    years: "1923–2008",
    place: "Rotterdam · Amsterdam",
    mark: "Schiphol signage. Total Design, 1967.",
    work: {
      src: "/about/wissing-schiphol-signposting.webp",
      alt: "Schiphol signage, Total Design, 1967",
    },
  },
  {
    name: "International Typographic Style",
    years: "1950s",
    place: "Switzerland",
    mark: "International Typographic Style. Objective. Modular.",
    work: {
      src: "/about/neue-grafik.webp",
      alt: "Neue Grafik, July 1963",
    },
  },
] as const;

export const program = {
  module: {
    kicker: "Grid system",
    law: `${grid.column}px content + ${grid.gutter}px gutter. One repeatable field.`,
  },
  hairline: {
    kicker: "Hairlines",
    law: "A 1px rule marks a relationship. It does not turn every region into a card.",
  },
  flush: {
    kicker: "Flush",
    law: "Content edges meet the gridline. Alignment carries the composition.",
  },
  grotesque: {
    kicker: "Grotesque",
    law: "One face. Size, weight, measure, and space establish hierarchy.",
    mark: "Ag",
  },
} as const;

export const notes = [
  {
    q: "How do I install Vlak?",
    a: "npm install @noorddev/vlak-react, then import @noorddev/vlak-react/css once and the components where you use them. For CSS only, install @noorddev/vlak and link vlak.css. For vendored source, npx @noorddev/vlak-cli add <name>, or npx shadcn add vlak.dev/r/<name>.json.",
  },
  {
    q: "How do I add a component?",
    a: "Import it from @noorddev/vlak-react, or copy its StyleX source into components/vlak/ with npx @noorddev/vlak-cli add <name>. The classes are already in vlak.css, so CSS-only pages need no file. The registry is at vlak.dev/r/<name>.json.",
  },
  {
    q: "How do I use Vlak with Next.js or Vercel?",
    a: "Import @noorddev/vlak-react/css in the root layout and use the components; stateful ones already carry \"use client\". Static export works; this site is one. Set data-theme=\"dark\" on the html element for the dark scheme.",
  },
  {
    q: "Does Vlak use Radix or Tailwind?",
    a: "No. Components are StyleX leaves on native elements. No Radix, no Tailwind. Every component also carries stable rs- classes.",
  },
  {
    q: "What does the React package depend on?",
    a: "React and @stylexjs/stylex. Behaviour otherwise comes from platform features including details, dialog, the Popover API, scroll snap, and native inputs.",
  },
  {
    q: "Do I need React?",
    a: "No. vlak.css is generated from the same StyleX leaves and paints every component through rs- classes on plain markup. React is one of three ways in.",
  },
  {
    q: "How do I switch to the dark scheme?",
    a: "Set data-theme=\"dark\" on the root element. Tokens flip paper and ink. The module grid stays.",
  },
  {
    q: "Why Inter?",
    a: "Inter keeps interface text legible at small sizes and provides the weights Vlak needs in one variable face. Latin and latin-ext files ship beside the CSS; system sans is the fallback.",
  },
  {
    q: "What is the module?",
    a: `204 pixels: ${grid.column} column + ${grid.gutter} gutter. Content boxes span whole modules. On a phone the field is one column; at 481 it pairs; at 816 it is four; at 1224 it is six.`,
  },
  {
    q: "What is the International Typographic Style here?",
    a: "A method for ordering information: modular grids, sans serif type, asymmetric composition, and hierarchy made with scale, weight, and space. Vlak combines it with the more elastic fields and direct construction found in Dutch modernism.",
  },
  {
    q: "What is Noord?",
    a: "Noord is an applied design lab in Alkmaar, the Netherlands. Vlak was designed and built there.",
  },
  {
    q: "What are the ten principles?",
    a: "Platform first, one source of paint, accessible by default, paper and ink, a grid system, native elements, React or CSS, stable classes, agent-readable, MIT licensed.",
  },
  {
    q: "Where do I report a problem?",
    a: "github.com/Noord-Ventures/vlak. Issues and pull requests. The packages are @noorddev/vlak, @noorddev/vlak-react, and @noorddev/vlak-cli.",
  },
] as const;

export const typeface = {
  heading: "Typeface",
  name: foundry.typeface,
  designer: foundry.designer,
  license: foundry.license,
  url: foundry.url,
  ofl: "Copyright 2016 The Inter Project Authors",
  why: "One face. Weight and size do the work.",
};

export const noord = {
  heading: "Noord Applied Design Lab",
  url: "https://noord.dev/",
  span: "Alkmaar",
  built: "Design and development:",
  door: DOOR,
  host: vlakTokens.meta.url,
  packages: ["@noorddev/vlak", "@noorddev/vlak-react", "@noorddev/vlak-cli"] as const,
  command: COMMAND,
};

export const person = {
  heading: "Renato Valdés Olmos",
  url: "https://www.renatovaldes.com/",
  copyright: "MIT © Noord / Renato Valdés-Olmos",
  year: "2026",
  repo: "https://github.com/Noord-Ventures/vlak",
};
