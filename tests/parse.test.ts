import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { LlamaParse } from "../src";

describe("LlamaParse", () => {
    config();

    test.skipIf(!process.env.LLAMA_CLOUD_API_KEY)(
        "should parse PDF file",
        async () => {
            const parser = new LlamaParse({ apiKey: process.env.LLAMA_CLOUD_API_KEY! });

            // Read the test PDF file
            const pdfPath = "tests/fixtures/test.pdf";
            const pdfFile = new Blob([await readFile(pdfPath)]);

            // Upload and get job ID
            const jobId = await parser.uploadFile(pdfFile);
            expect(jobId).toBeTruthy();

            // Check status until completed
            let status;
            do {
                status = await parser.checkStatus(jobId);
                await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between checks
            } while (status.status === "PENDING");

            expect(status.status).toBe("SUCCESS");

            // Get markdown result
            const { markdown } = await parser.getMarkdownResult(jobId);
            expect(markdown).includes("End of Document");
        },
        60_000,
    );
});
