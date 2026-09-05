import type { VlakComponent } from "./schema";

/** Native input behaviors and compound field patterns. */
export const inputAdditions: VlakComponent[] = [
  {
    "name": "number-field",
    "title": "Number field",
    "description": "Edits a numeric value with native validation, units, and bounded 44px increase and decrease actions.",
    "category": "forms",
    "classes": [
      "rs-number-field",
      "rs-number-field-label",
      "rs-number-field-row",
      "rs-number-field-input",
      "rs-number-field-unit",
      "rs-number-field-action",
      "rs-number-field-controls",
      "rs-number-field-controls-stacked"
    ],
    "registryDependencies": [
      "input",
      "button"
    ],
    "snippet": "<div class=\"rs-number-field\"><label class=\"rs-number-field-label\" for=\"cabin-temperature\">Cabin temperature</label><div class=\"rs-number-field-row\"><input class=\"rs-input rs-number-field-input\" id=\"cabin-temperature\" type=\"number\" min=\"16\" max=\"28\" value=\"20\" aria-describedby=\"cabin-unit\" /><span class=\"rs-number-field-unit\" id=\"cabin-unit\">°C</span><div class=\"rs-number-field-controls\"><button class=\"rs-btn-ghost rs-number-field-action\" type=\"button\" aria-label=\"Decrease value\">−</button><button class=\"rs-btn-ghost rs-number-field-action\" type=\"button\" aria-label=\"Increase value\">+</button></div></div></div>",
    "example": "import { NumberField } from \"@noorddev/vlak-react\";\n\n<NumberField label=\"Cabin temperature\" name=\"temperature\" defaultValue={20} min={16} max={28} step={0.5} unit=\"°C\" controlsPlacement=\"stacked\" />",
    "usage": {
      "use": [
        "Numeric quantities that need visible stepping, native bounds, or a unit.",
        "Stacked controls when increase belongs above decrease at the end of a reading."
      ],
      "avoid": [
        "A continuous interval with two endpoints; use RangeSlider.",
        "Codes and identifiers, which may have leading zeroes; use Input."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between the number field and available step actions."
      },
      {
        "keys": "Arrow up, Arrow down",
        "does": "Uses the browser's native numeric stepping while the input is focused."
      },
      {
        "keys": "Enter, Space",
        "does": "Activates a focused increase or decrease button."
      }
    ],
    "a11y": [
      "The forwarded ref reaches the native number input; label, native form attributes, and name reach that input.",
      "min, max, and step use native validity. The buttons clamp at bounds; typed values retain native validation feedback.",
      "A cleared field reports null. value/defaultValue/onValueChange support controlled and uncontrolled use; form reset restores uncontrolled defaults.",
      "The unit is linked as a description. Each step action has a name and a 44px target."
    ],
    "aliases": [
      "NumberField",
      "Number input",
      "Numeric stepper",
      "Quantity field"
    ],
    "css": [
      "components/number-field.css"
    ],
    "react": "components/number-field.tsx"
  },
  {
    "name": "range-slider",
    "title": "Range slider",
    "description": "Sets an ordered numeric interval with two named native range controls and visible endpoint values.",
    "category": "forms",
    "classes": [
      "rs-range-slider",
      "rs-range-slider-legend",
      "rs-range-slider-row",
      "rs-range-slider-label",
      "rs-range-slider-input",
      "rs-range-slider-output"
    ],
    "registryDependencies": [
      "field"
    ],
    "snippet": "<fieldset class=\"rs-range-slider\"><legend class=\"rs-range-slider-legend\">Budget</legend><div class=\"rs-range-slider-row\"><label class=\"rs-range-slider-label\" for=\"budget-from\">From</label><input class=\"rs-range-slider-input\" id=\"budget-from\" type=\"range\" min=\"0\" max=\"800\" value=\"120\" /><output class=\"rs-range-slider-output\" for=\"budget-from\">120</output></div><div class=\"rs-range-slider-row\"><label class=\"rs-range-slider-label\" for=\"budget-to\">To</label><input class=\"rs-range-slider-input\" id=\"budget-to\" type=\"range\" min=\"120\" max=\"800\" value=\"420\" /><output class=\"rs-range-slider-output\" for=\"budget-to\">420</output></div></fieldset>",
    "example": "import { RangeSlider } from \"@noorddev/vlak-react\";\n\n<RangeSlider label=\"Budget\" name=\"budget\" defaultValue={[120, 420]} min={0} max={800} step={20} formatValue={(value) => `€${value}`} />",
    "usage": {
      "use": [
        "A numeric lower and upper bound such as budget or duration.",
        "Separate labeled tracks when each endpoint needs clear keyboard and touch access."
      ],
      "avoid": [
        "A single setting; use Slider.",
        "Time-based seeking with buffered media; use MediaScrubber."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves between the lower and upper native range inputs."
      },
      {
        "keys": "Arrow keys, Home, End",
        "does": "Uses the browser's native range stepping within the other endpoint's bounds."
      }
    ],
    "a11y": [
      "Uses a fieldset and legend with a separate label and visible output for each endpoint; each input has a 44px-high target.",
      "Each endpoint's native min/max prevents crossing. formatValue also supplies aria-valuetext.",
      "With name, native form values are submitted as name[0] and name[1]. Uncontrolled values reset with the form.",
      "The ref reaches the fieldset; Field hint and error descriptions reach the group."
    ],
    "aliases": [
      "RangeSlider",
      "Interval selector",
      "Min max slider",
      "Dual range"
    ],
    "css": [
      "components/range-slider.css"
    ],
    "react": "components/range-slider.tsx"
  },
  {
    "name": "multi-select",
    "title": "Multi-select",
    "description": "Selects multiple predefined options from a searchable native disclosure with named checkboxes.",
    "category": "forms",
    "classes": [
      "rs-multi-select",
      "rs-multi-select-legend",
      "rs-multi-select-trigger",
      "rs-multi-select-panel",
      "rs-multi-select-options",
      "rs-multi-select-option",
      "rs-multi-select-selected",
      "rs-multi-select-empty",
      "rs-multi-select-clear"
    ],
    "registryDependencies": [
      "input",
      "button",
      "checkbox",
      "icons",
      "field"
    ],
    "snippet": "<fieldset class=\"rs-multi-select\"><legend class=\"rs-multi-select-legend\">Cities</legend><details><summary class=\"rs-multi-select-trigger\">Select options</summary><div class=\"rs-multi-select-panel\"><label class=\"rs-multi-select-option\"><input type=\"checkbox\" name=\"cities\" value=\"alkmaar\" /> Alkmaar</label><label class=\"rs-multi-select-option\"><input type=\"checkbox\" name=\"cities\" value=\"bergen\" /> Bergen</label></div></details></fieldset>",
    "example": "import { MultiSelect } from \"@noorddev/vlak-react\";\n\n<MultiSelect label=\"Cities\" name=\"cities\" options={[{ value: \"alkmaar\", label: \"Alkmaar\" }, { value: \"bergen\", label: \"Bergen\" }, { value: \"castricum\", label: \"Castricum\" }]} defaultValue={[\"alkmaar\"]} />",
    "usage": {
      "use": [
        "Multiple values from a known option set.",
        "A compact summary that expands to filterable checkbox choices."
      ],
      "avoid": [
        "Freeform values; use TagInput.",
        "One option only; use Select or NativeSelect."
      ]
    },
    "keyboard": [
      {
        "keys": "Enter, Space",
        "does": "Opens or closes the native summary, or toggles the focused checkbox."
      },
      {
        "keys": "Tab",
        "does": "Moves through search, available checkboxes, and clear selection."
      },
      {
        "keys": "Escape",
        "does": "Closes the disclosure and returns focus to its summary."
      }
    ],
    "a11y": [
      "Uses native details and checkboxes instead of exposing an incomplete listbox interaction.",
      "The legend names the field; each checkbox has its own visible name. Selected rows change fill across the full surface.",
      "Disabled options cannot change; clear preserves disabled selections. Empty search results are announced politely.",
      "With name, selected values are submitted as repeated fields. The ref reaches the fieldset; uncontrolled selections reset with the form."
    ],
    "aliases": [
      "MultiSelect",
      "Multiple select",
      "Checkbox picker"
    ],
    "css": [
      "components/multi-select.css"
    ],
    "react": "components/multi-select.tsx"
  },
  {
    "name": "tag-input",
    "title": "Tag input",
    "description": "Creates and removes freeform text tokens with paste splitting, duplicate prevention, and validation.",
    "category": "forms",
    "classes": [
      "rs-tag-input",
      "rs-tag-input-label",
      "rs-tag-input-list",
      "rs-tag-input-tag",
      "rs-tag-input-remove",
      "rs-tag-input-row",
      "rs-tag-input-input",
      "rs-tag-input-add",
      "rs-tag-input-feedback"
    ],
    "registryDependencies": [
      "input",
      "button",
      "icons",
      "field"
    ],
    "snippet": "<div class=\"rs-tag-input\"><label class=\"rs-tag-input-label\" for=\"project-tags\">Project tags</label><ul class=\"rs-tag-input-list\" aria-label=\"Current tags\"><li class=\"rs-tag-input-tag\">Design<button class=\"rs-btn-ghost rs-tag-input-remove\" type=\"button\" aria-label=\"Remove Design\">×</button></li></ul><div class=\"rs-tag-input-row\"><input class=\"rs-input rs-tag-input-input\" id=\"project-tags\" placeholder=\"Add a tag\" /><button class=\"rs-btn-ghost rs-tag-input-add\" type=\"button\">Add</button></div></div>",
    "example": "import { TagInput } from \"@noorddev/vlak-react\";\n\n<TagInput label=\"Project tags\" name=\"tags\" defaultValue={[\"Research\", \"Design\"]} maxTags={5} validate={(tag) => tag.length > 24 ? \"Use 24 characters or fewer\" : undefined} />",
    "usage": {
      "use": [
        "Short freeform labels, recipients, or keywords.",
        "Comma-separated or newline-separated pasted values that should become distinct tokens."
      ],
      "avoid": [
        "A fixed vocabulary; use MultiSelect.",
        "Long prose; use Textarea."
      ]
    },
    "keyboard": [
      {
        "keys": "Enter, comma",
        "does": "Commits a trimmed draft as a tag without submitting the form."
      },
      {
        "keys": "Backspace in an empty input",
        "does": "Focuses the last tag's remove button."
      },
      {
        "keys": "Escape",
        "does": "Clears the current draft and its error."
      },
      {
        "keys": "Tab, Enter, Space",
        "does": "Reaches and activates named Add and Remove buttons."
      }
    ],
    "a11y": [
      "The forwarded ref reaches the text input. Each 44px remove target is named with its tag.",
      "Exact duplicate tags are ignored; validate and maxTags reject an addition while preserving the draft and exposing an alert.",
      "Hidden fields submit each tag under name. Form reset restores uncontrolled tags and clears the draft.",
      "Keyboard composition is respected; Enter does not commit while an input method is composing text."
    ],
    "aliases": [
      "TagInput",
      "Token input",
      "Chips input",
      "Freeform tags"
    ],
    "css": [
      "components/tag-input.css"
    ],
    "react": "components/tag-input.tsx"
  },
  {
    "name": "date-range-picker",
    "title": "Date range picker",
    "description": "Collects start and end dates with two native date editors, shared constraints, and 44px controls.",
    "category": "forms",
    "classes": [
      "rs-date-range-picker",
      "rs-date-range-picker-legend",
      "rs-date-range-picker-fields",
      "rs-date-range-picker-input"
    ],
    "registryDependencies": [
      "input",
      "field"
    ],
    "snippet": "<fieldset class=\"rs-date-range-picker\"><legend class=\"rs-date-range-picker-legend\">Stay</legend><div class=\"rs-date-range-picker-fields\"><label>Start date<input class=\"rs-input rs-date-range-picker-input\" type=\"date\" name=\"stay[start]\" value=\"2026-09-08\" /></label><label>End date<input class=\"rs-input rs-date-range-picker-input\" type=\"date\" name=\"stay[end]\" min=\"2026-09-08\" value=\"2026-09-12\" /></label></div></fieldset>",
    "example": "import { DateRangePicker } from \"@noorddev/vlak-react\";\n\n<DateRangePicker label=\"Stay\" name=\"stay\" defaultValue={{ start: \"2026-09-08\", end: \"2026-09-12\" }} min=\"2026-09-01\" required />",
    "usage": {
      "use": [
        "A start/end date range that should use the platform's date editor and calendar picker.",
        "Forms that submit ISO calendar dates without time-zone conversion."
      ],
      "avoid": [
        "A single date; use DatePicker or Calendar.",
        "Time-of-day selection; use TimeField."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Moves through the two native date editors and their platform picker controls."
      },
      {
        "keys": "Arrow keys",
        "does": "Edits the active date segment according to the browser's native behavior."
      }
    ],
    "a11y": [
      "Uses a fieldset/legend and a separately labeled native date input for each endpoint. The browser owns each date popup.",
      "Values use year-month-day strings, for example 2026-09-06. A new start after the old end clears the end; end's minimum follows the start.",
      "min, max, and required use native constraint validation. A supplied inverted controlled range is marked invalid.",
      "With name, form fields are name[start] and name[end]. The ref reaches the fieldset; uncontrolled values reset with the form."
    ],
    "aliases": [
      "DateRangePicker",
      "Date interval",
      "Start and end dates"
    ],
    "css": [
      "components/date-range-picker.css"
    ],
    "react": "components/date-range-picker.tsx"
  },
  {
    "name": "time-field",
    "title": "Time field",
    "description": "Edits a time using the platform's localized time control with native bounds and second-based steps.",
    "category": "forms",
    "classes": [
      "rs-time-field"
    ],
    "registryDependencies": [
      "input"
    ],
    "snippet": "<label>Start time<input class=\"rs-input rs-time-field\" type=\"time\" name=\"start-time\" value=\"09:30\" min=\"09:00\" max=\"18:00\" step=\"900\" /></label>",
    "example": "import { TimeField } from \"@noorddev/vlak-react\";\n\n<TimeField label=\"Start time\" name=\"start-time\" defaultValue=\"09:30\" min=\"09:00\" max=\"18:00\" step={900} hint=\"Appointments start every 15 minutes\" />",
    "usage": {
      "use": [
        "A time of day with browser-native locale and keyboard behavior.",
        "Minutes or seconds, with the native step measured in seconds."
      ],
      "avoid": [
        "An elapsed duration; use NumberField with units.",
        "A calendar date; use DatePicker."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, arrow keys",
        "does": "Uses the browser's time segment navigation and native stepping."
      },
      {
        "keys": "Typing",
        "does": "Edits the active hour, minute, or second segment according to the platform."
      }
    ],
    "a11y": [
      "Wraps Input, preserving label, hint, error, native form attributes, disabled/readOnly and the forwarded input ref.",
      "Values use HH:mm or HH:mm:ss; the visible editor follows the browser's locale and 12/24-hour preference.",
      "No date or time-zone conversion is performed. Controlled/uncontrolled state and form reset are supported."
    ],
    "aliases": [
      "TimeField",
      "Time input",
      "Time picker"
    ],
    "css": [
      "components/time-field.css"
    ],
    "react": "components/time-field.tsx"
  },
  {
    "name": "file-upload",
    "title": "File upload",
    "description": "Collects validated files through browse or drop, with optional upload progress, cancellation, and retry.",
    "category": "forms",
    "classes": [
      "rs-file-upload",
      "rs-file-upload-drop",
      "rs-file-upload-drag",
      "rs-file-upload-input",
      "rs-file-upload-title",
      "rs-file-upload-description",
      "rs-file-upload-list",
      "rs-file-upload-item",
      "rs-file-upload-row",
      "rs-file-upload-name",
      "rs-file-upload-actions",
      "rs-file-upload-action",
      "rs-file-upload-status"
    ],
    "registryDependencies": [
      "button",
      "progress"
    ],
    "snippet": "<div class=\"rs-file-upload\"><div class=\"rs-file-upload-drop\"><span class=\"rs-file-upload-title\">Choose files</span><span class=\"rs-file-upload-description\" id=\"files-hint\">Drop files here or browse</span><input class=\"rs-file-upload-input\" type=\"file\" multiple aria-label=\"Choose files\" aria-describedby=\"files-hint\" /></div></div>",
    "example": "import { FileUpload } from \"@noorddev/vlak-react\";\n\n<FileUpload label=\"Project files\" name=\"attachments\" accept=\".pdf,.txt\" maxFiles={5} maxSize={10 * 1024 * 1024} description=\"PDF or text, up to 10 MB each\" />",
    "usage": {
      "use": [
        "Validated attachment queues with native file browsing and drag-and-drop.",
        "Provide onUpload when the app has a transport; it receives an AbortSignal and progress callback."
      ],
      "avoid": [
        "Assuming files upload automatically; without onUpload this only collects selected files.",
        "Client checks as security enforcement; validate uploaded files again on the server."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Enter, Space",
        "does": "Reaches the native file picker and labeled Remove, Cancel, and Retry actions."
      }
    ],
    "a11y": [
      "The native file input covers the drop target, remains keyboard-focusable, and receives the forwarded ref.",
      "Rejected types, sizes and counts produce readable errors. Upload status is announced; progress bars are named with the file.",
      "The app supplies onUpload(file, { signal, onProgress }). Cancel aborts the signal; errors retain the file and expose Retry.",
      "With name, the browser's formdata event appends the accepted queue to native FormData. Use multipart/form-data for native file submission. Disabled queues are omitted.",
      "Form reset restores uncontrolled files, clears errors and aborts active uploads. Unmount aborts outstanding transports."
    ],
    "aliases": [
      "FileUpload",
      "Drop zone",
      "Attachment upload",
      "File input"
    ],
    "css": [
      "components/file-upload.css"
    ],
    "react": "components/file-upload.tsx"
  },
  {
    "name": "transfer-list",
    "title": "Transfer list",
    "description": "Assigns options between available and selected lists using native checkboxes and explicit move actions.",
    "category": "forms",
    "classes": [
      "rs-transfer-list",
      "rs-transfer-list-legend",
      "rs-transfer-list-columns",
      "rs-transfer-list-panel",
      "rs-transfer-list-heading",
      "rs-transfer-list-options",
      "rs-transfer-list-item",
      "rs-transfer-list-actions",
      "rs-transfer-list-action",
      "rs-transfer-list-empty",
      "rs-transfer-list-status"
    ],
    "registryDependencies": [
      "checkbox",
      "button"
    ],
    "snippet": "<fieldset class=\"rs-transfer-list\"><legend class=\"rs-transfer-list-legend\">Assign cities</legend><div class=\"rs-transfer-list-columns\"><fieldset class=\"rs-transfer-list-panel\"><legend class=\"rs-transfer-list-heading\">Available</legend><label class=\"rs-transfer-list-item\"><input type=\"checkbox\" /> Alkmaar</label></fieldset><div class=\"rs-transfer-list-actions\"><button class=\"rs-btn-ghost\" type=\"button\">Add selected</button><button class=\"rs-btn-ghost\" type=\"button\">Remove selected</button></div><fieldset class=\"rs-transfer-list-panel\"><legend class=\"rs-transfer-list-heading\">Selected</legend><p class=\"rs-transfer-list-empty\">No options</p></fieldset></div></fieldset>",
    "example": "import { TransferList } from \"@noorddev/vlak-react\";\n\n<TransferList label=\"Coverage areas\" name=\"areas\" options={[{ value: \"alkmaar\", label: \"Alkmaar\" }, { value: \"bergen\", label: \"Bergen\" }, { value: \"castricum\", label: \"Castricum\" }]} defaultValue={[\"alkmaar\"]} />",
    "usage": {
      "use": [
        "Assigning a visible subset from a manageable option list.",
        "Work where available and assigned options should stay visible together."
      ],
      "avoid": [
        "Very large lists; use searchable MultiSelect.",
        "Ordering selected records; use SortableList."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab, Space",
        "does": "Moves through and marks native checkbox options."
      },
      {
        "keys": "Enter, Space on a move action",
        "does": "Adds or removes the marked options; marked state clears after the move."
      }
    ],
    "a11y": [
      "A top-level fieldset names the task; available and selected lists have distinct legends and counts.",
      "Every option and move action has a 44px target. Disabled options stay fixed; unavailable moves are disabled.",
      "The selected count is a polite status. Hidden fields submit each selected value under name.",
      "The ref reaches the fieldset. Form reset restores uncontrolled values and clears marked options."
    ],
    "aliases": [
      "TransferList",
      "Dual listbox",
      "Assignment lists"
    ],
    "css": [
      "components/transfer-list.css"
    ],
    "react": "components/transfer-list.tsx"
  },
  {
    "name": "inline-edit",
    "title": "Inline edit",
    "description": "Switches a text value into an editor with explicit save and cancel, validation, and optional async persistence.",
    "category": "forms",
    "classes": [
      "rs-inline-edit",
      "rs-inline-edit-row",
      "rs-inline-edit-label",
      "rs-inline-edit-value",
      "rs-inline-edit-input",
      "rs-inline-edit-action",
      "rs-inline-edit-error"
    ],
    "registryDependencies": [
      "input",
      "button"
    ],
    "snippet": "<div class=\"rs-inline-edit\"><span class=\"rs-inline-edit-label\">Project name</span><div class=\"rs-inline-edit-row\"><span class=\"rs-inline-edit-value\">Field study</span><button class=\"rs-btn-ghost rs-inline-edit-action\" type=\"button\" aria-label=\"Edit Project name\">Edit</button></div></div>",
    "example": "import { InlineEdit } from \"@noorddev/vlak-react\";\n\n<InlineEdit label=\"Project name\" name=\"project\" defaultValue=\"Field study\" validate={(value) => value.trim() ? undefined : \"Enter a project name\"} />",
    "usage": {
      "use": [
        "A short text value edited in its reading context.",
        "Provide onSave to await persistence before committing a new value."
      ],
      "avoid": [
        "Long-form writing; use Textarea.",
        "Implicit save-on-blur flows; this requires an explicit save."
      ]
    },
    "keyboard": [
      {
        "keys": "Enter, Space on Edit",
        "does": "Opens the editor, focuses the input and selects its text."
      },
      {
        "keys": "Enter in the editor",
        "does": "Validates and saves without submitting the enclosing form."
      },
      {
        "keys": "Escape in the editor",
        "does": "Discards the draft and returns focus to Edit."
      }
    ],
    "a11y": [
      "The input is named by the visible label. Save errors preserve the draft and appear as alerts.",
      "Successful save and cancel return focus to Edit. Pending saves disable duplicate actions and expose aria-busy.",
      "Hidden name submits only the committed value. Form reset restores uncontrolled defaults and discards drafts; late pending responses do not reapply them.",
      "The forwarded ref reaches the root div. No nested form is introduced."
    ],
    "aliases": [
      "InlineEdit",
      "Editable text",
      "Click to edit"
    ],
    "css": [
      "components/inline-edit.css"
    ],
    "react": "components/inline-edit.tsx"
  },
  {
    "name": "rating",
    "title": "Rating",
    "description": "Collects a discrete numeric score with 44px native radio choices and an optional clear action.",
    "category": "forms",
    "classes": [
      "rs-rating",
      "rs-rating-legend",
      "rs-rating-choices",
      "rs-rating-choice",
      "rs-rating-selected",
      "rs-rating-input",
      "rs-rating-clear"
    ],
    "registryDependencies": [
      "button"
    ],
    "snippet": "<fieldset class=\"rs-rating\"><legend class=\"rs-rating-legend\">Usefulness</legend><div class=\"rs-rating-choices\"><label class=\"rs-rating-choice\">1<input class=\"rs-rating-input\" type=\"radio\" name=\"usefulness\" value=\"1\" aria-label=\"1 of 3\" /></label><label class=\"rs-rating-choice rs-rating-selected\">2<input class=\"rs-rating-input\" type=\"radio\" name=\"usefulness\" value=\"2\" aria-label=\"2 of 3\" checked /></label><label class=\"rs-rating-choice\">3<input class=\"rs-rating-input\" type=\"radio\" name=\"usefulness\" value=\"3\" aria-label=\"3 of 3\" /></label></div></fieldset>",
    "example": "import { Rating } from \"@noorddev/vlak-react\";\n\n<Rating label=\"How useful was this?\" name=\"usefulness\" max={5} defaultValue={4} getLabel={(value, max) => `${value} out of ${max}`} />",
    "usage": {
      "use": [
        "An explicit score on a short, ordered scale.",
        "Clearable feedback where no rating is distinct from the lowest score."
      ],
      "avoid": [
        "Unordered choices; use Radio.",
        "Large or continuous numeric ranges; use Slider or NumberField."
      ]
    },
    "keyboard": [
      {
        "keys": "Tab",
        "does": "Enters the native radio group at its current choice and reaches Clear."
      },
      {
        "keys": "Arrow keys",
        "does": "Moves and selects among the native radio choices."
      },
      {
        "keys": "Space",
        "does": "Selects a focused radio or activates Clear."
      }
    ],
    "a11y": [
      "The fieldset legend names the score; getLabel gives each choice a complete name such as 3 of 5.",
      "Selection changes the full choice surface. Each choice is 44px with a 4px corner and a visible focus outline.",
      "Zero means no rating. max is limited to 1–10 whole choices. required uses native radio-group validation.",
      "name submits the selected score. The ref reaches the fieldset; uncontrolled values reset with the form."
    ],
    "aliases": [
      "Rating",
      "Score input",
      "Rating group"
    ],
    "css": [
      "components/rating.css"
    ],
    "react": "components/rating.tsx"
  }
];
