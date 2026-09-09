import * as React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Attachment, Attachments, useFileAttachments } from "../src/components/attachments";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Attachments", () => {
  it("renders mixed media, native controls, safe file links, metadata, and refs", async () => {
    const ref = React.createRef<HTMLUListElement>();
    const itemRef = React.createRef<HTMLLIElement>();
    const { container } = render(<Attachments ref={ref} className="custom" data-files="saved">
      <Attachment ref={itemRef} data={{ id: "image", name: "Sketch.png", mediaType: "image/png", url: "https://example.com/sketch.png", size: 123 }} />
      <Attachment data={{ id: "audio", name: "Notes.mp3", mediaType: "audio/mpeg", url: "https://example.com/notes.mp3" }} />
      <Attachment data={{ id: "video", name: "Review.mp4", mediaType: "video/mp4", url: "https://example.com/review.mp4" }} />
      <Attachment data={{ id: "unsafe", name: "Unknown", url: "javascript:alert(1)" }} />
    </Attachments>);
    expect(ref.current).toBe(screen.getByRole("list", { name: "Attachments" }));
    expect(ref.current?.dataset.files).toBe("saved");
    expect(itemRef.current?.tagName).toBe("LI");
    expect(container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/sketch.png");
    expect(container.querySelector("audio")?.controls).toBe(true);
    expect(container.querySelector("audio")?.preload).toBe("none");
    expect(container.querySelector("video")?.controls).toBe(true);
    expect(screen.queryByRole("link", { name: "Unknown" })).toBeNull();
    const results = await axe(container, { rules: { "color-contrast": { enabled: false } } });
    (expect(results) as unknown as { toHaveNoViolations(): void }).toHaveNoViolations();
  });

  it("offers keyboard removal and retry with application-owned error and progress state", async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    const remove = vi.fn();
    const { rerender } = render(<Attachments><Attachment data={{ id: "file", name: "Brief.pdf", status: "error", error: "Upload interrupted" }} onRetry={retry} onRemove={remove} /></Attachments>);
    expect(screen.getByRole("alert").textContent).toBe("Upload interrupted");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(retry).toHaveBeenCalledOnce();
    await user.tab();
    await user.keyboard(" ");
    expect(remove).toHaveBeenCalledOnce();
    rerender(<Attachments><Attachment data={{ id: "file", name: "Brief.pdf", status: "uploading", progress: 40 }} onRemove={remove} /></Attachments>);
    expect((screen.getByRole("progressbar", { name: "Uploading Brief.pdf" }) as HTMLProgressElement).value).toBe(40);
    expect(screen.getByRole("status").textContent).toBe("Uploading…");
  });

  it("downloads local HTML and SVG files while preserving media previews and remote navigation", async () => {
    const create = vi.fn()
      .mockReturnValueOnce("blob:https://example.com/html")
      .mockReturnValueOnce("blob:https://example.com/svg");
    vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = vi.fn(); });
    const files = [new File(["<script>alert(1)</script>"], "page.html", { type: "text/html" }), new File(["<svg />"], "drawing.svg", { type: "image/svg+xml" })];
    function Preview() {
      const items = useFileAttachments(files);
      return <Attachments>
        {items.map(data => <Attachment key={data.id} data={data} />)}
        <Attachment data={{ id: "audio", name: "Notes.mp3", mediaType: "audio/mpeg", url: "blob:https://example.com/audio" }} />
        <Attachment data={{ id: "video", name: "Review.mp4", mediaType: "video/mp4", url: "blob:https://example.com/video" }} />
        <Attachment data={{ id: "remote", name: "Remote brief", url: "https://files.example.com/brief.html" }} />
      </Attachments>;
    }
    const { container } = render(<Preview />);
    await waitFor(() => expect(screen.getByRole("link", { name: "page.html" }).getAttribute("href")).toBe("blob:https://example.com/html"));
    for (const name of ["page.html", "drawing.svg", "Notes.mp3", "Review.mp4"]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("download")).toBe(name);
      expect(link.hasAttribute("target")).toBe(false);
    }
    expect(container.querySelector("img")?.getAttribute("src")).toBe("blob:https://example.com/svg");
    expect(container.querySelector("audio")?.getAttribute("src")).toBe("blob:https://example.com/audio");
    expect(container.querySelector("video")?.getAttribute("src")).toBe("blob:https://example.com/video");
    const remote = screen.getByRole("link", { name: "Remote brief" });
    expect(remote.hasAttribute("download")).toBe(false);
    expect(remote.getAttribute("target")).toBe("_blank");
    expect(remote.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("inherits grid, inline, and list layouts while preserving item overrides and removal", async () => {
    const user = userEvent.setup();
    const remove = vi.fn();
    const data = { id: "file", name: "Brief.txt", size: 12 };
    const { rerender } = render(<Attachments variant="inline"><Attachment data={data} onRemove={remove} /><Attachment data={{ ...data, id: "other", name: "Other.txt" }} variant="list" /></Attachments>);
    expect(screen.getByRole("list").classList.contains("rs-attachments-inline")).toBe(true);
    expect(screen.getAllByRole("listitem")[0]!.classList.contains("rs-attachment-inline")).toBe(true);
    expect(screen.getAllByRole("listitem")[1]!.classList.contains("rs-attachment-list")).toBe(true);
    await user.tab(); await user.keyboard("{Enter}"); expect(remove).toHaveBeenCalledOnce();
    rerender(<Attachments variant="list"><Attachment data={data} /></Attachments>);
    expect(screen.getByRole("listitem").classList.contains("rs-attachment-list")).toBe(true);
    rerender(<Attachments><Attachment data={data} /></Attachments>);
    expect(screen.getByRole("list").classList.contains("rs-attachments-grid")).toBe(true);
    expect(screen.getByRole("listitem").classList.contains("rs-attachment-inline")).toBe(false);
  });

  it("keeps preview identity stable and revokes every owned object URL on removal or unmount", async () => {
    const create = vi.fn().mockReturnValueOnce("blob:first").mockReturnValueOnce("blob:second");
    const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL = create; static revokeObjectURL = revoke; });
    const first = new File(["one"], "first.txt");
    const second = new File(["two"], "second.txt");
    function Preview({ files }: { files: File[] }) { const items = useFileAttachments(files); return <Attachments>{items.map((data) => <Attachment key={data.id} data={data} />)}</Attachments>; }
    const { rerender, unmount } = render(<Preview files={[first, second]} />);
    await waitFor(() => expect(screen.getByRole("link", { name: "first.txt" }).getAttribute("href")).toBe("blob:first"));
    rerender(<Preview files={[second]} />);
    expect(revoke).toHaveBeenCalledWith("blob:first");
    expect(create).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("link", { name: "second.txt" }).getAttribute("href")).toBe("blob:second");
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:second");
  });
});
