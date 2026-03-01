export interface SkillInput {
  parameters: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface SkillOutput {
  status: 'success' | 'error' | 'skipped';
  result: unknown;
  summary: string;
}

export interface SkillHandler {
  execute(input: SkillInput): Promise<SkillOutput>;
  getDependencies(): string[];
  getParameters(): ParameterSchema[];
}

export interface ParameterSchema {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  default?: unknown;
}