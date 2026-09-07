export type GuideCategory = "Foundations" | "Components" | "Patterns";
export type GuideSection = { id: string; title: string; paragraphs: string[]; points?: string[] };
export type Guide = { id: string; title: string; description: string; category: GuideCategory; date: string; readTime: string; lead: string; sections: GuideSection[] };

export const guides: Guide[] = [
  {
    id: "reading-order", title: "Start with the reading order", category: "Foundations", date: "7 September 2026", readTime: "4 min",
    description: "Before arranging a page, decide what someone needs to understand first, what comes next, and what can wait.",
    lead: "A useful page answers questions in a useful order. Its layout makes that order visible without asking the reader to study the layout itself.",
    sections: [
      { id: "the-first-question", title: "The first question", paragraphs: ["Begin with the situation that brings someone to the page. A person opening a delivery record needs to know whether the delivery happened. A person editing that record needs to know which parts can change. These are different beginnings, even when both pages use the same information.", "Write a short sequence of questions before drawing containers. Put the answer to the first question near the page title. Let the remaining answers follow in the order someone can act on them."] },
      { id: "make-the-order-visible", title: "Make the order visible", paragraphs: ["Use the document structure to establish the sequence. Headings name sections; paragraphs explain them; lists collect things that belong together. A visual arrangement should reinforce this structure so the keyboard and a screen reader encounter the same story.", "Reserve stronger type for information that changes a decision. A page with five equally prominent numbers leaves the reader to invent a hierarchy that the product should already understand."], points: ["Name the record before showing its controls.", "Place a status beside the thing it describes.", "Keep a consequential action beside its explanation."] },
      { id: "let-secondary-things-wait", title: "Let secondary things wait", paragraphs: ["Supporting details still need a home. A narrow metadata column, a labeled disclosure, or the end of a section can keep them available without making them compete with the main answer.", "This is a decision about sequence, not permission to remove information. Check that a person can still find the history, the units, the source and the exceptions when those details become relevant."] },
      { id: "read-it-without-the-layout", title: "Read it without the layout", paragraphs: ["Read the page from top to bottom as plain text. Then move through its controls using only the keyboard. If either journey changes the meaning, revise the structure before refining spacing.", "The final check is simple: ask another person what they can do next. Their answer should follow from the page, without an explanation from its designer."] },
    ],
  },
  {
    id: "one-source", title: "One value, one source", category: "Components", date: "3 September 2026", readTime: "3 min",
    description: "Keep the value someone is editing separate from the value a service has accepted. Make both names and transitions explicit.",
    lead: "A number in a field is a proposal until the system that owns the record accepts it. Components should make that distinction easy to preserve.",
    sections: [
      { id: "decide-who-owns-it", title: "Decide who owns it", paragraphs: ["Write down which part of the application owns the record. A reusable field may hold a draft, but it should not quietly become a second database. Let the owner supply the current value and decide whether a proposed change can be accepted.", "This is especially useful when several views show the same record. They can each present a different arrangement while agreeing about the value they report."] },
      { id: "give-the-draft-a-name", title: "Give the draft a name", paragraphs: ["Keep draft and confirmed values separate when a person needs to compare them. A temperature target can be 21 degrees while the measured cabin remains at 18. Neither value is wrong; they answer different questions.", "Use the label to explain the distinction. Draft, requested, measured and confirmed are short words that prevent a large amount of ambiguity."] },
      { id: "handle-the-response", title: "Handle the response", paragraphs: ["Keep the action pending while the owner processes it. If it succeeds, show the value returned by that owner. If it fails, keep the draft available and explain what happened near the action.", "A timeout is not a confirmation. Preserve uncertainty until there is evidence that the record changed."], points: ["Show pending work where it began.", "Preserve the person's input after a failure.", "Announce confirmation only after it arrives."] },
      { id: "test-the-disagreement", title: "Test the disagreement", paragraphs: ["Test a response that differs from the draft. A service might return a normalized value, reject a change, or report that another person edited the record first.", "These cases reveal whether the interface follows the real record or only repeats its own last input."] },
    ],
  },
  {
    id: "small-screen", title: "Make a small screen complete", category: "Patterns", date: "28 August 2026", readTime: "3 min",
    description: "A phone needs a complete task at a readable scale. Give the list, the detail and the action their own places.",
    lead: "A smaller screen changes the order of work. It should not require a smaller version of the person using it.",
    sections: [
      { id: "choose-the-task", title: "Choose the task", paragraphs: ["Identify what someone needs to do in the current state. On a wide screen, a list and an inspector can sit together. On a phone, selecting a record can open a focused detail view with a clear way back.", "Keep the record selected when the layout changes. Resizing a window should not discard a draft or turn a detail view into an unrelated starting screen."] },
      { id: "keep-actions-reachable", title: "Keep actions reachable", paragraphs: ["Separate the primary action from long scrolling content. A person reading a case history should not have to find the bottom of that history before they can return to the list.", "Give controls enough space to reach without precision. Let labels wrap when they need to; cutting off an action's meaning is rarely a useful way to save a line."] },
      { id: "remember-the-return", title: "Remember the return", paragraphs: ["Back should return to the place the person left. Preserve the list's scroll position and move keyboard focus to the selected record. A return that starts at the top turns every inspection into repeated navigation.", "Use the same principle for a reading interface. A table of contents is useful when a reader can jump to a section and still return to the index they were exploring."] },
      { id: "test-the-container", title: "Test the container", paragraphs: ["A narrow panel can appear inside a wide browser window. Let the space the interface actually receives determine its composition.", "Test a short phone screen as well as a narrow one. An action can fit horizontally and still be unreachable below a fixed footer."] },
    ],
  },
  {
    id: "action-ending", title: "Give actions an honest ending", category: "Patterns", date: "20 August 2026", readTime: "3 min",
    description: "An action needs more than a click response. Explain what changed, what remains pending, and where someone can recover.",
    lead: "Feedback closes the gap between a person's intention and the record that the interface can actually confirm.",
    sections: [
      { id: "say-what-will-happen", title: "Say what will happen", paragraphs: ["Use an action label that describes its result. Save a note, request a review and publish a page make different commitments. The control should make that difference visible before someone uses it.", "When the result matters, place the relevant scope nearby. A clear destination or affected-record count can be more useful than a general confirmation dialog."] },
      { id: "show-the-work", title: "Show the work", paragraphs: ["Respond immediately to the input, then represent the work for as long as it is pending. Keep that state near the control so the person knows which action it belongs to.", "Prevent duplicate submissions when they would create duplicate records. If another action can continue independently, leave it available."] },
      { id: "name-the-result", title: "Name the result", paragraphs: ["Report the result with enough detail to connect it to the original intention. A saved note can show its text and its place in the history. A requested review can stay labeled requested until a reviewer responds.", "Avoid success language for a local draft that has not left the browser. The person needs to know where the record exists."] },
      { id: "leave-a-way-forward", title: "Leave a way forward", paragraphs: ["A failure should preserve useful work. Keep the draft, identify the affected action, and offer a retry when retrying can help.", "Check the recovery path with the same care as the successful path. It is part of the product's ordinary behavior."] },
    ],
  },
  {
    id: "quiet-grid", title: "Keep the grid in the background", category: "Foundations", date: "12 August 2026", readTime: "3 min",
    description: "A shared module gives pages a familiar rhythm. Use it to align meaning, then let the content carry the page.",
    lead: "A grid earns its place by making different pages feel related. It does not need to become the most visible thing on any of them.",
    sections: [
      { id: "choose-a-rhythm", title: "Choose a rhythm", paragraphs: ["A repeated column and gutter provide useful starting points for a rail, a reading measure and a metadata track. They let a new page inherit decisions that have already been made.", "In this reading study the 204-pixel module contains a 184-pixel column and a 20-pixel gutter. Three columns and two gutters make the 592-pixel reading measure."] },
      { id: "align-related-things", title: "Align related things", paragraphs: ["Align a label with the content it introduces. Let metadata occupy a consistent secondary track. These relationships help a reader predict where to look as the content changes.", "A divider belongs to the region it separates. Extend it to that region's edges, then inset the content rather than placing padding around the line."] },
      { id: "allow-an-exception", title: "Allow an exception", paragraphs: ["A diagram or illustration sometimes needs more room than a paragraph. It can extend into an adjacent column while keeping a clear relationship to the reading measure.", "An exception is easier to understand when the surrounding layout is consistent. The grid provides that context without dictating every edge."] },
      { id: "turn-the-lines-off", title: "Turn the lines off", paragraphs: ["Hide the construction lines and read the page again. The hierarchy should survive through spacing, type and sequence.", "Visible guides are useful for learning and inspection. The content should remain complete when a reader chooses a quieter page."] },
    ],
  },
  {
    id: "known-state", title: "Write the state you know", category: "Components", date: "5 August 2026", readTime: "3 min",
    description: "Zero, missing, not recorded and unavailable are different states. Give the application room to say which one it has.",
    lead: "A blank value does not tell a person why information is absent. A component can preserve that uncertainty without making the interface vague.",
    sections: [
      { id: "separate-zero-from-missing", title: "Separate zero from missing", paragraphs: ["Zero can be a valid measurement or a confirmed count. Missing means the value was not supplied. Replacing one with the other changes the record's meaning.", "Check this distinction in rendering and in form submission. A visible empty field should not silently submit a number that the person never entered."] },
      { id: "use-the-supplied-status", title: "Use the supplied status", paragraphs: ["Let the host application supply labels such as not recorded or temporarily unavailable. A generic component rarely knows enough about the record to choose between them.", "Keep the status near the value so the relationship remains clear when the layout becomes a single column."] },
      { id: "avoid-an-invented-conclusion", title: "Avoid an invented conclusion", paragraphs: ["An absent entry does not establish that an event never happened. An old timestamp does not always establish that a task is overdue. Those conclusions belong to the rules and evidence of the application.", "The interface can present the supplied facts and offer a useful next step without resolving uncertainty on its own."] },
      { id: "include-the-empty-case", title: "Include the empty case", paragraphs: ["Put an empty record in the example alongside a complete one. Check that its labels remain understandable and that unavailable actions explain why they cannot run.", "A good empty state is still a real state of the product. It deserves the same deliberate structure as the populated view."] },
    ],
  },
];
