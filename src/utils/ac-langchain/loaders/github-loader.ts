import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from "langchain/document_loaders/web/github";

export const githubLoader = async (
  /** https://github.com/hwchase17/langchainjs */
  url: string,
  /** example: { branch: "main", recursive: false, unknown: "warn", ignorePaths: ["*.md"] } */
  options: GithubRepoLoaderParams
) => {
  const loader = new GithubRepoLoader(url, {
    branch: options.branch || "main",
    recursive: options.recursive || false,
    unknown: options.unknown || "warn",
    ignorePaths: options.ignorePaths || [],
  });
  const docs = await loader.load();
  return docs;
};
