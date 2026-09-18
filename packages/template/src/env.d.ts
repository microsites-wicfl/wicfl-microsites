declare const process: {
  env: Record<string, string | undefined>;
};

declare module "node:url" {
  export function pathToFileURL(path: string): URL;
}
