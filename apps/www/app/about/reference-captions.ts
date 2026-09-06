import { featured, field } from "./facts";

export interface ReferenceCaption {
  name: string;
  years: string;
  place: string;
  mark: string;
}

export const referenceCaptions: Record<string, ReferenceCaption> = Object.fromEntries(
  [...featured, ...field].map(({ work, name, years, place, mark }) => [
    work.src,
    { name, years, place, mark },
  ]),
);
