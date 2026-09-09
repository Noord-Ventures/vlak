interface ReplySequence {
  text: string;
  widgetCount?: number;
  onText: (text: string) => void;
  onWidget: (visibleCount: number) => void;
  onComplete: () => void;
}

/** One cancellable sequence for the recorded text and its structured results. */
export function playReply({ text, widgetCount = 0, onText, onWidget, onComplete }: ReplySequence) {
  let cancelled = false;
  let length = 0;
  let timer: ReturnType<typeof setTimeout>;
  const schedule = (step: () => void, delay: number) => {
    timer = setTimeout(() => { if (!cancelled) step(); }, delay);
  };
  const reveal = (count: number) => {
    onWidget(count);
    if (count < widgetCount) schedule(() => reveal(count + 1), 700);
    else onComplete();
  };
  const write = () => {
    length = Math.min(length + 12, text.length);
    onText(text.slice(0, length));
    if (length < text.length) schedule(write, 65);
    else if (widgetCount > 0) schedule(() => reveal(1), 250);
    else onComplete();
  };
  schedule(write, 65);
  return () => { cancelled = true; clearTimeout(timer); };
}
