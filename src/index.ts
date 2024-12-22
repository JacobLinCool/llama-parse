export interface UploadResponse {
    id: string;
    status: "PENDING" | "SUCCESS" | "FAILED";
}

export interface JobStatus {
    status: "PENDING" | "SUCCESS" | "FAILED";
    error?: string;
}

export interface MarkdownResult {
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

export interface LlamaParseConfig {
    /** API key for authentication */
    apiKey: string;
    /** Base URL for the API (defaults to https://api.cloud.llamaindex.ai/api/parsing) */
    baseUrl?: string;
    /** Additional headers to include in requests */
    headers?: HeadersInit;
}

/**
 * LlamaParse client for converting PDF documents to markdown
 * @example
 * ```typescript
 * const parser = new LlamaParse({ apiKey: 'your-api-key' });
 * const result = await parser.parseFile(file);
 * console.log(result.markdown);
 * ```
 */
export class LlamaParse {
    private baseUrl: string;
    private headers: HeadersInit;

    /**
     * Create a new LlamaParse instance
     * @param config Configuration options for LlamaParse
     * @throws {Error} If API key is not provided
     */
    constructor(config: LlamaParseConfig) {
        if (!config.apiKey) throw new Error("API key is required");

        this.baseUrl = config.baseUrl || "https://api.cloud.llamaindex.ai/api/parsing";
        this.headers = {
            Authorization: `Bearer ${config.apiKey}`,
            accept: "application/json",
            ...config.headers,
        };
    }

    /**
     * Parse a PDF file and convert it to markdown
     * @param file File or Blob to parse
     * @returns Promise containing the markdown result and metadata
     */
    public async parseFile(file: File | Blob): Promise<MarkdownResult> {
        const jobId = await this.uploadFile(file);

        let status;
        do {
            status = await this.checkStatus(jobId);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (status.status === "PENDING");

        if (status.status !== "SUCCESS") {
            throw new Error(`Parsing failed: ${status.error}`);
        }

        return this.getMarkdownResult(jobId);
    }

    /**
     * Upload a PDF file to start the parsing process
     * @param file File or Blob to upload
     * @returns Promise containing the job ID
     * @throws {Error} If upload fails
     */
    public async uploadFile(file: File | Blob): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: "POST",
            headers: this.headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = (await response.json()) as UploadResponse;
        return data.id;
    }

    /**
     * Check the status of a parsing job
     * @param jobId ID of the job to check
     * @returns Promise containing the job status
     * @throws {Error} If status check fails
     */
    public async checkStatus(jobId: string): Promise<JobStatus> {
        const response = await fetch(`${this.baseUrl}/job/${jobId}`, {
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Status check failed: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get the markdown result for a completed job
     * @param jobId ID of the completed job
     * @returns Promise containing the markdown result
     * @throws {Error} If retrieval fails
     */
    public async getMarkdownResult(jobId: string): Promise<MarkdownResult> {
        const response = await fetch(`${this.baseUrl}/job/${jobId}/result/markdown`, {
            headers: this.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to get results: ${response.statusText}`);
        }

        return response.json();
    }
}
