import type { ReactNode } from "react";
import styles from "./frame.module.css";

/** A captioned, bounded specimen shared by the documentation guides. */
export function DocsExample({ title, description, children, flush = false }: { title: string; description?: string; children: ReactNode; flush?: boolean }) {
  return <figure className={styles.frame} data-docs-example>
    <figcaption className={styles.caption}><strong>{title}</strong>{description && <p>{description}</p>}</figcaption>
    <div className={flush ? styles.flushBody : styles.body}>{children}</div>
  </figure>;
}
