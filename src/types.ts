export type RegistryItem =
  | "registry:lib"
  | "registry:block"
  | "registry:component"
  | "registry:ui"
  | "registry:hook"
  | "registry:theme"
  | "registry:page"
  | "registry:file"
  | "registry:style";

export interface ComponentManifest {
  version: string;
  lastSync: string;
  files: string[];
}

export interface Manifest {
  registryUrl: string;
  components: Record<string, ComponentManifest>;
  lastFullSync: string;
}

export interface RegistryComponent {
  name: string;
  type: RegistryItem;
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    content: string;
    type: RegistryItem;
    target?: string;
  }>;
}
