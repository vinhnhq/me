import { KOFI_URL } from "@/lib/site";

/**
 * The Ko-fi line. A plain link, not Ko-fi's widget: their script would add a
 * third-party request and a floating button to every page.
 */
export function Support() {
  return (
    <p className="support no-print">
      If this was useful, you can{" "}
      <a href={KOFI_URL} target="_blank" rel="noopener noreferrer">
        buy me a coffee on Ko-fi
      </a>
      .
    </p>
  );
}
