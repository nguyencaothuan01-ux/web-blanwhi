declare module "@vercel/blob" {
  export function put(
    pathname: string,
    body: string | Buffer | Blob | ArrayBuffer | ReadableStream,
    options: {
      access: "public" | "private";
      contentType?: string;
      addRandomSuffix?: boolean;
      allowOverwrite?: boolean;
      cacheControlMaxAge?: number;
    }
  ): Promise<{ url: string; pathname: string }>;

  export function get(
    pathname: string,
    options: {
      access: "public" | "private";
      useCache?: boolean;
    }
  ): Promise<{
    statusCode: 200;
    stream: ReadableStream<Uint8Array>;
  } | {
    statusCode: 304;
    stream: null;
  } | null>;

  export function list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{
    blobs: Array<{
      pathname: string;
      uploadedAt: Date;
    }>;
    cursor?: string;
    hasMore: boolean;
  }>;
}
