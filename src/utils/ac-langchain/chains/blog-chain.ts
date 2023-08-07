import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";

const options = {
  apiKey: "MY_API_KEY",
  apiUrl: "http://192.168.4.94:8000/general/v0/general",
};

const loader = new UnstructuredLoader(
  "src/sb-langchain/chains/README.md",
  options
);
loader.load().then((document) => {
  console.log(document);
});
