export const PROTOCOL_VERSION = 1;
export const HOST_VERSION = "0.1.0-alpha.17";
/** Public presentation metadata returned by site.branding@1. */
export interface SiteBranding {
  name: string;
  defaultLanguage: "zh-CN" | "en-US";
  accentColor: string;
}
export const PHASES = [
  "Ingress",
  "Identity",
  "Planning",
  "Admission",
  "Execution",
  "Streaming",
  "Finalize",
] as const;
export type Phase = (typeof PHASES)[number];
export type Json =
  null | boolean | number | string | Json[] | { [key: string]: Json };
export interface Manifest {
  schemaVersion: 1;
  id: string;
  name?: string;
  description?: string;
  category?: string;
  codeReload?: "restart" | "parallel";
  version: string;
  host: string;
  runtime: { kind: "native" | "process"; entry: string; args?: string[] };
  provides: string[];
  requires: string[];
  optionalRequires?: string[];
  /** Use capability contracts by default; name an implementation only when necessary. */
  dependencies?: Record<string, string>;
  permissions: string[];
  platforms?: string[];
  configSchema?: Record<string, unknown>;
  configReload?: "restart" | "snapshot";
  ui?: {
    entry: string;
    title: string;
    path: string;
    public?: boolean;
    group?: string;
    order?: number;
    pages?: {
      title: string;
      path: string;
      public?: boolean;
      group?: string;
      order?: number;
    }[];
    slots?: { name: string; entry: string }[];
  };
}
export type PluginState =
  | "Discovered"
  | "Validated"
  | "Installed"
  | "Resolved"
  | "Starting"
  | "Ready"
  | "Active"
  | "Draining"
  | "Stopped"
  | "Failed";
export interface RpcMessage {
  jsonrpc: "2.0";
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}
export interface PluginConfig {
  path: string;
  /** Exact installed implementation version, independent of capability major versions. */
  version?: string;
  integrity?: string;
  enabled?: boolean;
  grants: string[];
  config?: Record<string, unknown>;
  origin?: { registryId: string; version: string; archiveSha256: string };
}
export interface HostConfig {
  schemaVersion: 1;
  dataDir: string;
  drainTimeoutMs?: number;
  bindings?: Record<string, string>;
  /** Local package directories or archives searched for missing required dependencies. */
  pluginSources?: string[];
  pluginRegistries?: {
    id: string;
    name: string;
    url: string;
    enabled?: boolean;
    allowPrivateNetwork?: boolean;
  }[];
  plugins: PluginConfig[];
}
export interface PluginInstallPlan {
  root: string;
  fingerprint: string;
  plugins: {
    id: string;
    name: string;
    version: string;
    sha256: string;
    action: "install" | "keep";
    permissions: string[];
    dependencies: string[];
  }[];
}
export const rpcMethods = [
  "plugin.initialize",
  "capability.invoke",
  "plugin.health",
  "plugin.drain",
  "plugin.stop",
  "host.call",
  "host.secret",
  "host.log",
  "$/cancelRequest",
] as const;
