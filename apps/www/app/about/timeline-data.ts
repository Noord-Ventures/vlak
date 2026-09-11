export type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  description: string;
  source: { label: string; url: string };
};
export type TimelineEra = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  kind: "grid" | "screen" | "publishing" | "desktop" | "touch" | "agents";
  events: readonly TimelineEvent[];
};

// Sources verified 2026-09-11.
export const timelineEras: readonly TimelineEra[] = [
  {
    id: "modernist-grid",
    period: "1917–1958",
    title: "Modernist grid",
    subtitle: "Geometry gives information a structure",
    kind: "grid",
    events: [
      {
        id: "de-stijl",
        year: "1917",
        title: "De Stijl",
        description: "Theo van Doesburg founded De Stijl as both a magazine and a platform for geometric art. Its disciplined lines, planes, and primary forms gave artists and designers a shared visual method.",
        source: {
          label: "Kunstmuseum Den Haag",
          url: "https://www.kunstmuseum.nl/nl/tentoonstellingen/mondriaan-en-de-stijl",
        },
      },
      {
        id: "bauhaus-opens",
        year: "1919",
        title: "Bauhaus",
        description: "The school joined fine art, craft, architecture, and design in one educational model. Workshops made applied practice part of a broader visual discipline.",
        source: {
          label: "Getty Research Institute",
          url: "https://www.getty.edu/research/exhibitions_events/exhibitions/bauhaus/new_artist/history/",
        },
      },
      {
        id: "vienna-method",
        year: "1925",
        title: "Vienna Method / Isotype",
        description: "Otto Neurath's Social and Economic Museum used pictograms and repeated symbols to explain social data to a broad public. The Vienna Method later took the name Isotype and travelled as a visual language.",
        source: {
          label: "Wien Museum",
          url: "https://www.wienmuseum.at/wissen_fuer_alle",
        },
      },
      {
        id: "futura",
        year: "1927",
        title: "Futura",
        description: "Paul Renner built Futura from circles, squares, and triangles for a machine-age form of printing. Its early specimens showed geometric letterforms working in both display and text sizes.",
        source: {
          label: "Letterform Archive",
          url: "https://exhibitions.letterformarchive.org/bauhaus/walkthroughs/futura-type-specimen-no-1",
        },
      },
      {
        id: "new-typography",
        year: "1928",
        title: "The New Typography",
        description: "Jan Tschichold codified modernist typography around asymmetry and deliberate arrangements of type and image. The book made wider Bauhaus and Soviet currents usable in everyday print work.",
        source: {
          label: "MoMA",
          url: "https://www.moma.org/calendar/exhibitions/1013",
        },
      },
      {
        id: "hfg-ulm",
        year: "1953",
        title: "Ulm School of Design",
        description: "Inge Scholl, Otl Aicher, and Max Bill founded the school to connect modern design with a democratic society. Its curriculum combined practical design work with scientific and social study.",
        source: {
          label: "HfG-Archiv Ulm",
          url: "https://hfg-archiv.museumulm.de/",
        },
      },
      {
        id: "helvetica",
        year: "1956–57",
        title: "Helvetica",
        description: "Max Miedinger and Edouard Hoffmann developed Helvetica at the Haas Type Foundry. The surviving 36-point lead type records a modernist design as a repeatable physical system.",
        source: {
          label: "MoMA collection",
          url: "https://www.moma.org/collection/works/106768",
        },
      },
      {
        id: "univers",
        year: "1957",
        title: "Univers",
        description: "Adrian Frutiger designed Univers as a coordinated family of widths and weights. A numerical classification made the family legible as a system rather than a loose list of styles.",
        source: {
          label: "Potsdam University of Applied Sciences",
          url: "https://uclab.fh-potsdam.de/arete/en/artefacts/univers",
        },
      },
      {
        id: "neue-grafik",
        year: "1958",
        title: "Neue Grafik",
        description: "Josef Müller-Brockmann, Richard Paul Lohse, Hans Neuburg, and Carlo Vivarelli began a trilingual journal for graphic design. Its grid-led pages carried Swiss constructive practice into an international design discussion.",
        source: {
          label: "Lars Müller Publishers",
          url: "https://www.lars-mueller-publishers.com/neue-grafiknew-graphic-designgraphisme-actuel-1958-1965",
        },
      },
    ],
  },
  {
    id: "direct-manipulation",
    period: "1963–1984",
    title: "Direct manipulation",
    subtitle: "Commands and visible objects share the screen",
    kind: "screen",
    events: [
      {
        id: "sketchpad",
        year: "1963",
        title: "Sketchpad",
        description: "Ivan Sutherland's Sketchpad let a person create and manipulate graphical figures with a light pen. Geometry became something to point at and change directly on screen.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/tdih/january/7/",
        },
      },
      {
        id: "nls-demo",
        year: "1968",
        title: "NLS demonstration",
        description: "Douglas Engelbart's team demonstrated a mouse, linked text, live editing, multiple windows, shared screens, and video collaboration as parts of one working system.",
        source: {
          label: "SRI International",
          url: "https://www.sri.com/hoi/computer-mouse-and-interactive-computing/",
        },
      },
      {
        id: "unix-shell",
        year: "1971",
        title: "Unix shell",
        description: "The first edition Unix manual documented sh alongside a compact set of commands. The shell made a text interface programmable through command sequences and scripts.",
        source: {
          label: "Nokia Bell Labs",
          url: "https://www.nokia.com/bell-labs/about/dennis-m-ritchie/1stEdman.html",
        },
      },
      {
        id: "xerox-alto",
        year: "1973",
        title: "Xerox PARC / Alto",
        description: "The Xerox PARC research system combined a page-oriented display, mouse, networking, windows, icons, and screen-to-print correspondence. It made documents and commands visible objects on screen.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/revolution/story/347",
        },
      },
      {
        id: "visicalc",
        year: "1979",
        title: "VisiCalc",
        description: "Dan Bricklin and Bob Frankston made spreadsheet values recalculate automatically on the Apple II. People could change assumptions and immediately see their effect on a working financial model.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/timeline/1979/",
        },
      },
      {
        id: "xerox-star",
        year: "Apr 1981",
        title: "Xerox 8010 Star",
        description: "Xerox announced an office system organized around documents, icons, generic commands, and a mouse. Consistent actions such as copy, move, and show properties reduced the number of commands people had to remember.",
        source: {
          label: "Computer History Museum",
          url: "https://bitsavers.computerhistory.org/pdf/xerox/sdd/OSD-R8203_Xerox_Office_Systems_Technology_Nov82.pdf",
        },
      },
      {
        id: "ibm-pc-dos",
        year: "1981",
        title: "MS-DOS & IBM PC",
        description: "IBM introduced the 5150 with Microsoft PC DOS 1.0. The underlying Microsoft work also became MS-DOS, which was licensed for the wider compatible-PC market.",
        source: {
          label: "Microsoft",
          url: "https://blogs.microsoft.com/blog/2014/03/25/microsoft-makes-source-code-for-ms-dos-and-word-for-windows-available-to-public/",
        },
      },
      {
        id: "apple-lisa",
        year: "1983",
        title: "Apple Lisa",
        description: "Apple introduced Lisa with a graphical interface and mouse. Its high price limited sales, while its visible desktop and document model continued into later Apple systems.",
        source: {
          label: "Computer History Museum",
          url: "https://computerhistory.org/apple-timeline/",
        },
      },
      {
        id: "macintosh",
        year: "1984",
        title: "Macintosh / System\u00a01",
        description: "The original Macintosh paired a mouse-driven desktop with System Software 1.0, part of the lineage later called classic Mac OS. Its lower price brought menus, windows, and direct manipulation to more users.",
        source: {
          label: "Computer History Museum",
          url: "https://computerhistory.org/apple-timeline/",
        },
      },
    ],
  },
  {
    id: "desktop-publishing",
    period: "1985–1993",
    title: "Desktop tools",
    subtitle: "Personal software puts a studio on screen",
    kind: "publishing",
    events: [
      {
        id: "desktop-publishing-stack",
        year: "1985",
        title: "PageMaker & PostScript",
        description: "PageMaker, Macintosh, LaserWriter, and PostScript aligned composition on screen with reproduction in print. The useful change came from this stack working together.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/revolution/personal-computers/17/306",
        },
      },
      {
        id: "windows-1",
        year: "1985",
        title: "Windows 1.0",
        description: "Microsoft shipped retail Windows as an operating environment extending MS-DOS. Command-based PC workflows gained a graphical layer within the same software family.",
        source: {
          label: "Microsoft",
          url: "https://learn.microsoft.com/en-us/shows/history/history-of-microsoft-1985",
        },
      },
      {
        id: "adobe-illustrator",
        year: "1987",
        title: "Adobe Illustrator",
        description: "Adobe released Illustrator for Macintosh as a direct drawing tool for scalable vector artwork. Designers could shape precise paths that stayed crisp across output sizes.",
        source: {
          label: "Adobe",
          url: "https://blog.adobe.com/en/publish/2015/03/23/adobe-explains-it-all-illustrator",
        },
      },
      {
        id: "quarkxpress",
        year: "1987",
        title: "QuarkXPress",
        description: "Quark released QuarkXPress for Macintosh with precise page-layout and color controls aimed at professional publishing. Desktop composition moved further into daily newsroom and production work.",
        source: {
          label: "Quark",
          url: "https://www.quark.com/about/blog/40th-anniversary-quark-part-one",
        },
      },
      {
        id: "hypercard",
        year: "1987",
        title: "HyperCard",
        description: "Bill Atkinson's HyperCard let people assemble cards, controls, scripts, and hypertext links into personal applications. Apple distributed it with Macintosh computers.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/timeline/1987/",
        },
      },
      {
        id: "coreldraw",
        year: "1989",
        title: "CorelDRAW",
        description: "CorelDRAW 1 brought full-color vector illustration and page layout to Windows PCs. A mouse-driven drawing environment expanded professional graphics beyond the Macintosh publishing stack.",
        source: {
          label: "Corel",
          url: "https://www.corel.com/content/pdf/corporate/History_of_Corel.pdf",
        },
      },
      {
        id: "adobe-photoshop",
        year: "1990",
        title: "Adobe Photoshop",
        description: "Photoshop brought detailed tools for editing and enhancing scanned images to personal computers. Photographic material joined type and vector art in digital production workflows.",
        source: {
          label: "Adobe",
          url: "https://blog.adobe.com/en/publish/2025/02/19/celebrating-35-years-of-creativity-community-innovation-with-adobe-photoshop",
        },
      },
      {
        id: "world-wide-web",
        year: "1990",
        title: "WorldWideWeb",
        description: "Tim Berners-Lee's WorldWideWeb application was both a browser and an editor, paired with a web server and website at CERN. Documents became linked and addressable across machines.",
        source: {
          label: "CERN",
          url: "https://web30.web.cern.ch/web-history.html",
        },
      },
      {
        id: "ncsa-mosaic",
        year: "1993",
        title: "NCSA Mosaic",
        description: "NCSA released Mosaic as a graphical browser for the growing web. Its approachable presentation helped linked documents reach beyond specialist computing environments.",
        source: {
          label: "NCSA",
          url: "https://www.ncsa.illinois.edu/about/history/",
        },
      },
    ],
  },
  {
    id: "personal-systems",
    period: "1995–2001",
    title: "Personal systems",
    subtitle: "Desktop conventions settle and branch",
    kind: "desktop",
    events: [
      {
        id: "windows-95",
        year: "1995",
        title: "Windows 95",
        description: "Start, the taskbar, recycle bin, desktop shortcuts, long filenames, and plug-and-play hardware formed a widely used set of PC conventions.",
        source: {
          label: "Microsoft",
          url: "https://news.microsoft.com/announcement/launch-of-windows-95/",
        },
      },
      {
        id: "beos",
        year: "1995",
        title: "BeOS & BeBox",
        description: "Be paired its own operating system with the dual-processor BeBox. Its small but persistent following records an alternative personal-computing platform alongside larger desktop systems.",
        source: {
          label: "Computer History Museum",
          url: "https://www.computerhistory.org/timeline/1995/",
        },
      },
      {
        id: "javascript",
        year: "Dec 1995",
        title: "JavaScript",
        description: "Netscape developed JavaScript as a scripting language for web pages and shipped it in Navigator. Web documents could respond to people and run application logic inside the browser.",
        source: {
          label: "Mozilla",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/JavaScript",
        },
      },
      {
        id: "kde",
        year: "Oct 1996",
        title: "KDE",
        description: "Matthias Ettrich announced KDE as a consistent graphical desktop for free Unix systems. The project set out to join applications, a desktop, and shared interface conventions for everyday users.",
        source: {
          label: "KDE",
          url: "https://kde.org/announcements/announcement/",
        },
      },
      {
        id: "css1",
        year: "Dec 1996",
        title: "CSS1",
        description: "The W3C published CSS1 so authors and readers could attach reusable presentation rules to structured web documents. Fonts, color, spacing, and margins became a separate, cascading layer.",
        source: {
          label: "W3C",
          url: "https://www.w3.org/press-releases/1996/css1-rec/",
        },
      },
      {
        id: "mac-os-8",
        year: "1997",
        title: "Mac OS 8",
        description: "Mac OS 8 shipped on Apple's new Power Macintosh line with a revised system experience and closer multimedia and internet integration. It remained part of the classic Macintosh system family.",
        source: {
          label: "Apple archive",
          url: "https://www.apple.com/ca/fr/press/1997/08/Fastestmacs.html",
        },
      },
      {
        id: "gnome-1",
        year: "Mar 1999",
        title: "GNOME 1.0",
        description: "GNOME 1.0 delivered an integrated graphical desktop for Linux and other Unix-like systems. Configurability, internationalization, drag and drop, and shared application services were part of the release.",
        source: {
          label: "GNOME Foundation",
          url: "https://foundation.gnome.org/1999/03/03/gnome-1-0-released/",
        },
      },
      {
        id: "adobe-indesign",
        year: "1999",
        title: "Adobe InDesign",
        description: "Adobe introduced InDesign for professional page composition. Early releases brought advanced typography, transparency, and optical margin controls into a modern publishing application.",
        source: {
          label: "Adobe",
          url: "https://blog.adobe.com/en/publish/2019/08/26/20-years-of-adobe-indesign",
        },
      },
      {
        id: "mac-os-x",
        year: "2001",
        title: "Mac OS X",
        description: "Mac OS X joined the Aqua interface and PDF-based Quartz graphics to a Darwin foundation. It replaced classic Mac OS with a new visual and technical system.",
        source: {
          label: "Apple",
          url: "https://www.apple.com/newsroom/2001/01/09Apples-Mac-OS-X-to-Ship-on-March-24/",
        },
      },
    ],
  },
  {
    id: "touch-adaptation",
    period: "2007–2017",
    title: "Touch & adaptation",
    subtitle: "Interfaces and their tools adapt to changing screens",
    kind: "touch",
    events: [
      {
        id: "iphone",
        year: "2007",
        title: "iPhone",
        description: "The iPhone brought a large multi-touch display, software keyboard, gestures, and rotation-aware layouts into one handheld interface. Fingers replaced the mouse for its main interactions.",
        source: {
          label: "Apple",
          url: "https://www.apple.com/newsroom/2007/01/09Apple-Reinvents-the-Phone-with-iPhone/",
        },
      },
      {
        id: "android",
        year: "2008",
        title: "Android",
        description: "Android 1.0 launched on the T-Mobile G1 alongside Android Market. Pull-down notifications, cross-application sharing, and multitasking established a distinct touch system and application ecosystem.",
        source: {
          label: "Google",
          url: "https://blog.google/products-and-platforms/platforms/android/celebrating-sweet-decade-android/",
        },
      },
      {
        id: "ipad",
        year: "Jan 2010",
        title: "iPad",
        description: "Apple introduced iPad with a 9.7-inch multi-touch display and applications designed for both portrait and landscape. Touch interaction moved from a phone-sized surface into reading, media, and productivity work.",
        source: {
          label: "Apple",
          url: "https://www.apple.com/newsroom/2010/01/27Apple-Launches-iPad/",
        },
      },
      {
        id: "responsive-web-design",
        year: "May 2010",
        title: "Responsive web design",
        description: "Ethan Marcotte described fluid grids, flexible images, and media queries as one practice. A single page could adapt its composition to different viewport conditions.",
        source: {
          label: "A List Apart",
          url: "https://alistapart.com/article/responsive-web-design/",
        },
      },
      {
        id: "sketch",
        year: "Sep 2010",
        title: "Sketch",
        description: "Sketch arrived as a Mac application centered on UI and UX work. Its vector canvas and focused toolset gave screen designers an alternative to general graphics software.",
        source: {
          label: "Sketch",
          url: "https://www.sketch.com/blog/from-one-to-one-million/",
        },
      },
      {
        id: "ios-4-2",
        year: "Nov 2010",
        title: "iOS 4.2",
        description: "iOS 4.2 brought multitasking, folders, unified inboxes, and other iOS 4 features to iPad while updating iPhone and iPod touch. One interaction platform now covered several screen sizes.",
        source: {
          label: "Apple",
          url: "https://www.apple.com/newsroom/2010/11/22Apples-iOS-4-2-Available-Today-for-iPad-iPhone-iPod-touch/",
        },
      },
      {
        id: "material-design",
        year: "2014",
        title: "Material Design",
        description: "Google developed a shared language for desktop and mobile around surfaces, elevation, motion, iconography, and component rules. Physical paper studies helped the system define consistent digital behavior.",
        source: {
          label: "Google Design",
          url: "https://design.google/library/material-design-launch-2014",
        },
      },
      {
        id: "figma",
        year: "Sep 2016",
        title: "Figma",
        description: "Figma's public release put a professional interface-design tool in the browser. Shared URLs and simultaneous editing made the design file a place for team collaboration.",
        source: {
          label: "Figma",
          url: "https://www.figma.com/blog/figma-year-in-review-2018/",
        },
      },
      {
        id: "inter-typeface",
        year: "2017",
        title: "Inter",
        description: "Rasmus Andersson published Inter as an open-source typeface crafted for computer interfaces. Its tall x-height and screen-oriented details support dense text at small sizes.",
        source: {
          label: "Rasmus Andersson",
          url: "https://rsms.me/inter/",
        },
      },
    ],
  },
  {
    id: "delegated-work",
    period: "2022–2026",
    title: "Delegated work",
    subtitle: "People direct, connect, and supervise agents",
    kind: "agents",
    events: [
      {
        id: "chatgpt",
        year: "Nov 2022",
        title: "ChatGPT",
        description: "The research preview made follow-up questions, corrections, challenges, and refusals parts of an ongoing conversation with a language model.",
        source: {
          label: "OpenAI",
          url: "https://openai.com/index/chatgpt/",
        },
      },
      {
        id: "claude",
        year: "Mar 2023",
        title: "Claude",
        description: "Anthropic made Claude available through a chat interface and API. Conversation and text processing could be directed by task, tone, and behavior.",
        source: {
          label: "Anthropic",
          url: "https://www.anthropic.com/news/introducing-claude",
        },
      },
      {
        id: "autogen",
        year: "Sep 2023",
        title: "Microsoft AutoGen",
        description: "Microsoft Research released AutoGen for workflows built from conversations among multiple agents. Agents could combine models, tools, and human participation around a shared task.",
        source: {
          label: "Microsoft Research",
          url: "https://www.microsoft.com/en-us/research/blog/autogen-enabling-next-generation-large-language-model-applications/",
        },
      },
      {
        id: "gemini",
        year: "Dec 2023",
        title: "Google Gemini",
        description: "Google introduced Gemini as a model designed to work across text, images, audio, video, and code. Assistant interaction expanded beyond a text-only exchange into mixed media.",
        source: {
          label: "Google",
          url: "https://blog.google/innovation-and-ai/technology/ai/google-gemini-ai/",
        },
      },
      {
        id: "claude-artifacts",
        year: "Jun 2024",
        title: "Claude Artifacts",
        description: "Artifacts placed generated documents, code, and interface designs in a dedicated window beside the conversation. The result became a visible work surface that people could inspect and revise.",
        source: {
          label: "Anthropic",
          url: "https://www.anthropic.com/news/claude-3-5-sonnet",
        },
      },
      {
        id: "mcp",
        year: "Nov 2024",
        title: "Model Context Protocol",
        description: "Anthropic released the Model Context Protocol as an open client-server standard for connecting assistants to repositories, business tools, and development environments.",
        source: {
          label: "Anthropic",
          url: "https://www.anthropic.com/news/model-context-protocol",
        },
      },
      {
        id: "agents-sdk",
        year: "Mar 2025",
        title: "Agents SDK",
        description: "OpenAI paired built-in web, file, and computer tools with an Agents SDK for handoffs, guardrails, tracing, and single- or multi-agent orchestration.",
        source: {
          label: "OpenAI",
          url: "https://openai.com/index/new-tools-for-building-agents/",
        },
      },
      {
        id: "a2a",
        year: "Apr 2025",
        title: "Agent2Agent protocol",
        description: "Google introduced A2A as an open protocol for agents built with different frameworks or vendors. Agents gained a shared way to exchange information and coordinate actions.",
        source: {
          label: "Google Developers",
          url: "https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/",
        },
      },
      {
        id: "codex-app",
        year: "Feb 2026",
        title: "Multi-agent workspaces",
        description: "The Codex app placed parallel agent tasks, project threads, isolated worktrees, progress, diffs, and human review in one desktop interface.",
        source: {
          label: "OpenAI",
          url: "https://openai.com/index/introducing-the-codex-app/",
        },
      },
    ],
  },
];
