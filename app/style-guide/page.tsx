import type { Metadata } from 'next';

import ThemeProviderWrapper from '@/src/components/ThemeProviderWrapper';
import ThemeToggle from '@/src/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Style Guide',
  description: 'Design system documentation',
};

export default function StyleGuide(): React.ReactElement {
  return (
    <ThemeProviderWrapper>
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">AI Kiz Design System</h1>
          <ThemeToggle />
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorCard name="Primary" value="#3B82F6 / #60A5FA" />
            <ColorCard name="Secondary" value="#10B981 / #34D399" />
            <ColorCard name="Background" value="#ffffff / #0a0a0a" />
            <ColorCard name="Foreground" value="#171717 / #ededed" />
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Typography</h2>
          <div className="space-y-2">
            <TypographySample size="text-sm">Small text</TypographySample>
            <TypographySample size="text-base">Base text</TypographySample>
            <TypographySample size="text-lg">Large text</TypographySample>
            <TypographySample size="text-xl">Extra large text</TypographySample>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Spacing</h2>
          <div className="grid grid-cols-4 gap-4">
            <SpacingSample size="1">0.25rem</SpacingSample>
            <SpacingSample size="2">0.5rem</SpacingSample>
            <SpacingSample size="4">1rem</SpacingSample>
            <SpacingSample size="8">2rem</SpacingSample>
          </div>
        </section>
      </div>
    </ThemeProviderWrapper>
  );
}

function ColorCard({ name, value }: Readonly<{ name: string; value: string }>): React.ReactElement {
  return (
    <div className="border rounded-lg p-4">
      <div className="h-12 w-full rounded mb-2" style={{ backgroundColor: value.split(' / ')[0] }}></div>
      <h3 className="font-medium">{name}</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{value}</p>
    </div>
  );
}

function TypographySample({ size, children }: Readonly<{ size: string; children: React.ReactNode }>): React.ReactElement {
  return (
    <div className="border rounded p-4">
      <p className={`${size} font-medium`}>{children}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{size}</p>
    </div>
  );
}

function SpacingSample({ size, children }: Readonly<{ size: string; children: React.ReactNode }>): React.ReactElement {
  return (
    <div className="border rounded p-4">
      <div className="h-12 w-full rounded mb-2" style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
      <p className="font-medium">Spacing {size}</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{children}</p>
    </div>
  );
}
