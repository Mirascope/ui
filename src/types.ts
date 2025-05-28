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
  type: "registry:ui" | "registry:block" | "registry:lib";
  dependencies?: string[];
  registryDependencies?: string[];
  files: Array<{
    path: string;
    content: string;
    type: "registry:ui" | "registry:block" | "registry:lib";
    target?: string;
  }>;
}
