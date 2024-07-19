import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  noExternal: ['@tamagui/constants'],
});
