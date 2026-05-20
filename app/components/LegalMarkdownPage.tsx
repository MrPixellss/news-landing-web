import { readFile } from "fs/promises";
import path from "path";
import { BackButton } from "./BackButton";

type LegalMarkdownPageProps = {
  fileName: string;
};

type Block =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function parseMarkdown(markdown: string) {
  const blocks: Block[] = [];
  const lines = markdown.split(/\r?\n/);
  let paragraph: string[] = [];
  let list: string[] = [];

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({
        type: "p",
        text: paragraph.join("\n").replace(/ {2,}\n/g, "\n").trim(),
      });
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length) {
      blocks.push({ type: "ul", items: list });
      list = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: trimmed.slice(4).trim() });
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: trimmed.slice(3).trim() });
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h1", text: trimmed.slice(2).trim() });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      list.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

export async function LegalMarkdownPage({ fileName }: LegalMarkdownPageProps) {
  const filePath = path.join(process.cwd(), "legal-docs-sv", fileName);
  const markdown = await readFile(filePath, "utf8");
  const blocks = parseMarkdown(markdown);

  return (
    <main className="min-h-screen bg-[#07090b] text-zinc-50">
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <BackButton />
        <div className="border border-[#26313d] bg-[#0d1117] p-6 md:p-10">
          {blocks.map((block, index) => {
            if (block.type === "h1") {
              return (
                <h1
                  key={`${block.type}-${index}`}
                  className="text-4xl font-bold tracking-[-0.03em] md:text-6xl"
                >
                  {block.text}
                </h1>
              );
            }

            if (block.type === "h2") {
              return (
                <h2
                  key={`${block.type}-${index}`}
                  className="mt-10 border-t border-[#26313d] pt-8 text-2xl font-bold tracking-[-0.02em]"
                >
                  {block.text}
                </h2>
              );
            }

            if (block.type === "h3") {
              return (
                <h3
                  key={`${block.type}-${index}`}
                  className="mt-7 text-xl font-bold text-emerald-300"
                >
                  {block.text}
                </h3>
              );
            }

            if (block.type === "ul") {
              return (
                <ul
                  key={`${block.type}-${index}`}
                  className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-[#c7d1dd]"
                >
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              );
            }

            return (
              <p
                key={`${block.type}-${index}`}
                className="mt-5 whitespace-pre-line text-base leading-8 text-[#c7d1dd]"
              >
                {block.text}
              </p>
            );
          })}
        </div>
      </article>
    </main>
  );
}
