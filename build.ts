#!/usr/bin/env -S deno run --allow-read --allow-write

import { remark } from "npm:remark@15";
import { visit } from "npm:unist-util-visit@5";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

// Custom plugin to handle !include() syntax
function remarkInclude() {
  const processingFiles = new Set<string>();

  return (tree: any, file: any) => {
    const basePath = dirname(file.path || file.history?.[0] || ".");
    const currentFile = file.path || file.history?.[0] || "";

    visit(tree, "paragraph", (node, index, parent) => {
      // Check if paragraph contains only an include directive
      if (node.children?.length === 1 && node.children[0].type === "text") {
        const text = node.children[0].value.trim();
        const includeMatch = text.match(/^!include\(([^)]+)\)$/);

        if (includeMatch) {
          const includePath = includeMatch[1].trim().replace(/['"]/g, "");
          const fullPath = resolve(basePath, includePath);

          // Check for circular includes
          if (processingFiles.has(fullPath)) {
            console.warn(`Warning: Circular include detected for ${includePath}`);
            return;
          }

          try {
            const content = readFileSync(fullPath, "utf-8");

            // Process included content with same processor (recursive)
            processingFiles.add(fullPath);
            const processor = remark().use(remarkInclude);
            const result = processor.processSync({ value: content, path: fullPath });
            processingFiles.delete(fullPath);

            const parsed = processor.parse(String(result));

            // Replace the paragraph with the parsed content
            if (parent && typeof index === "number") {
              parent.children.splice(index, 1, ...parsed.children);
            }
          } catch (err) {
            processingFiles.delete(fullPath);
            console.warn(`Warning: Could not include ${includePath}: ${err.message}`);
          }
        }
      }
    });
  };
}

async function processMarkdown(inputPath: string, outputPath: string) {
  const processor = remark().use(remarkInclude);

  const input = readFileSync(inputPath, "utf-8");
  const result = await processor.process({ value: input, path: inputPath });

  writeFileSync(outputPath, String(result));
  console.log(`Processed: ${inputPath} → ${outputPath}`);
}

// Process a single file or directory
if (import.meta.main) {
  const [inputPath, outputPath] = Deno.args;

  if (!inputPath || !outputPath) {
    console.log("Usage: deno run --allow-read --allow-write templater.ts input.md output.md");
    Deno.exit(1);
  }

  await processMarkdown(inputPath, outputPath);
}
