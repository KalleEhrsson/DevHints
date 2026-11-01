import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://devhints.kftech.se',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [starlight({
    title: 'DevHints',
    logo: { light: './src/assets/wordmark-light.svg', dark: './src/assets/wordmark-dark.svg', replacesTitle: true },
    customCss: ['./src/styles/custom.css'],
    social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KalleEhrsson/DevHints' }],
    sidebar: [
      { label: 'Unity', items: [
        { label: 'Overview', slug: 'unity' },
        { label: 'Field Attributes', slug: 'unity/field-attributes' },
        { label: 'Component & Class Attributes', slug: 'unity/component-class-attributes' },
        { label: 'Method & Editor Attributes', slug: 'unity/method-editor-attributes' },
        { label: 'DOTS, Native & Burst', slug: 'unity/dots-native-burst' },
        { label: 'Custom Property Drawers', slug: 'unity/custom-property-drawers' },
      ] },
      { label: 'C#', items: [{ label: 'Language & Interop Attributes', slug: 'csharp/language-interop-attributes' }] },
      { label: 'Blender', items: [{ label: 'Modeling Hotkeys', slug: 'blender/modeling-hotkeys' }, { label: 'Modifiers & Booleans', slug: 'blender/modifiers-booleans' }] },
      { label: 'Tooling', items: [{ label: 'ReSharper Formatter Directives', slug: 'tooling/resharper-formatter-directives' }, { label: 'Visual Studio', slug: 'tooling/visual-studio' }] },
      { label: 'Resources', slug: 'resources' },
    ],
  })],
});
