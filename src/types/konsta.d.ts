declare module 'konsta/config' {
  import type { Config } from 'tailwindcss';
  export default function konstaConfig(config: Config & { konsta?: Record<string, unknown> }): Config;
}
