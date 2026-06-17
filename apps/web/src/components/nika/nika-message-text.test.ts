import { describe, expect, it } from "vitest";

import { NikaMessageText } from "@/components/nika/nika-message-text";
import { renderToStaticMarkup } from "react-dom/server";

describe("NikaMessageText", () => {
  it("renders markdown links as anchors", () => {
    const html = renderToStaticMarkup(
      NikaMessageText({
        text: "Visit [oet.com](https://oet.com) for samples.",
      }),
    );
    expect(html).toContain('href="https://oet.com/"');
    expect(html).toContain(">oet.com<");
    expect(html).not.toContain("[oet.com]");
  });

  it("renders bold markdown", () => {
    const html = renderToStaticMarkup(
      NikaMessageText({ text: "Focus on **Listening** today." }),
    );
    expect(html).toContain("<strong");
    expect(html).toContain("Listening");
  });

  it("renders bare domains as clickable links", () => {
    const html = renderToStaticMarkup(
      NikaMessageText({
        text: "See pharmacyregulation.org and oet.com/ready for details.",
      }),
    );
    expect(html).toContain('href="https://pharmacyregulation.org/"');
    expect(html).toContain('href="https://oet.com/ready"');
    expect(html).toContain("pharmacyregulation.org");
  });

  it("does not render javascript: markdown links as anchors", () => {
    const html = renderToStaticMarkup(
      NikaMessageText({
        text: "Do not [click me](javascript:alert(1)) here.",
      }),
    );
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("<a ");
    expect(html).toContain("click me");
  });
});
