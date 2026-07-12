declare module "@vercel/blob" {
  export function put(
    pathname: string,
    body: Buffer | Blob | ArrayBuffer | ReadableStream,
    options: {
      access: "public" | "private";
      contentType?: string;
      addRandomSuffix?: boolean;
    }
  ): Promise<{ url: string; pathname: string }>;
}
