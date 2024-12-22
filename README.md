# llama-parse

A zero-dependency TypeScript client for LlamaIndex PDF parsing API. Convert PDF documents to markdown with ease.

## Installation

```bash
pnpm install llama-parse
```

## Usage

```typescript
import { LlamaParse } from 'llama-parse';

// Initialize the client
const parser = new LlamaParse({
    apiKey: 'your-api-key'
});

// Parse a PDF file
const file = new File(['...'], 'document.pdf', { type: 'application/pdf' });
const result = await parser.parseFile(file);
console.log(result.markdown);
```

## API Reference

### `LlamaParse`

#### Constructor Options

```typescript
interface LlamaParseConfig {
    apiKey: string;        // Required: Your LlamaIndex API key
    baseUrl?: string;      // Optional: Custom API endpoint
    headers?: HeadersInit; // Optional: Additional headers
}
```

#### Methods

- `parseFile(file: File | Blob): Promise<MarkdownResult>`
  - Converts a PDF file to markdown
  - Returns the markdown content and job metadata

- `uploadFile(file: File | Blob): Promise<string>`
  - Uploads a PDF file and returns a job ID

- `checkStatus(jobId: string): Promise<JobStatus>`
  - Checks the status of a parsing job

- `getMarkdownResult(jobId: string): Promise<MarkdownResult>`
  - Retrieves the markdown result for a completed job

### Response Types

```typescript
interface MarkdownResult {
    markdown: string;
    job_metadata: {
        credits_used: number;
        job_credits_usage: number;
        job_pages: number;
        job_auto_mode_triggered_pages: number;
        job_is_cache_hit: boolean;
        credits_max: number;
    };
}
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
