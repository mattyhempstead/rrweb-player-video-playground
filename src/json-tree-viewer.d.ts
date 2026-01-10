declare module "json-tree-viewer" {
  interface JsonTree {
    expand: (filterFunc?: (node: unknown) => boolean) => void;
    collapse: () => void;
    loadData: (jsonObj: unknown) => void;
    appendTo: (domEl: HTMLElement) => void;
    toSourceJSON: (isPrettyPrinted?: boolean) => string;
    findAndHandle: (
      matcher: (node: unknown) => boolean,
      handler: (node: unknown) => void
    ) => void;
    unmarkAll: () => void;
  }

  const jsonTree: {
    create: (jsonObj: unknown, domEl: HTMLElement) => JsonTree;
  };

  export default jsonTree;
}
