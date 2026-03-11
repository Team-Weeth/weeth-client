#!/usr/bin/env node
/**
 * Claude 테스트 자동 생성 스크립트
 *
 * 사용법:
 *   pnpm generate:tests src/components/ui/Button.tsx
 *   pnpm generate:tests src/hooks/useAutoScrollIntoView.ts
 *
 * 환경 변수:
 *   ANTHROPIC_API_KEY — .env.local 또는 환경변수로 설정
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MODEL = 'claude-sonnet-4-6';

function resolveOutputPath(inputPath: string): string {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath);
  const ext = path.extname(base);
  const stem = path.basename(base, ext);

  if (dir.endsWith('__tests__')) {
    throw new Error('입력 파일이 이미 __tests__/ 안에 있습니다. 소스 파일을 전달하세요.');
  }

  const testExt = ext === '.tsx' ? '.test.tsx' : '.test.ts';
  return path.join(dir, '__tests__', stem + testExt);
}

function buildSystemPrompt(): string {
  return `You are an expert React and TypeScript test engineer.
Generate tests using Jest and React Testing Library (RTL) for a Next.js 16 App Router project.

## Project conventions
- React 19, TypeScript 5 strict mode
- Tailwind CSS v4 with design tokens — DO NOT assert on CSS class names
- jest-environment-jsdom, @testing-library/react, @testing-library/user-event
- @testing-library/jest-dom matchers are available globally (no need to import)

## Rules
1. Import from '@testing-library/react' and '@testing-library/user-event'
2. Use userEvent.setup() — NOT userEvent.click() directly
3. Query priority: getByRole > getByLabelText > getByText > getByTestId
4. Test behavior, NOT implementation details
5. DO NOT assert on Tailwind class names
6. 'use client' components: render normally, no special handling
7. forwardRef components: test rendered output and interactions
8. cva variants: test that different variant props produce different visible behavior
9. next/image and next/navigation are already mocked in jest.setup.ts — DO NOT mock them again
10. Each test file must include at minimum:
    - Smoke test (renders without crashing)
    - Prop/variant behavior tests
    - User interaction tests (if applicable)
    - Accessibility checks (role, label) where relevant

## Output format
Return ONLY the raw TypeScript test file content.
No markdown, no explanation, no code fences. Raw TypeScript only.`;
}

function buildUserPrompt(
  filePath: string,
  source: string,
  outputPath: string,
  existingTest: string | null,
): string {
  const relativePath = path.relative(process.cwd(), filePath);
  const relativeOutput = path.relative(process.cwd(), outputPath);

  const existingSection = existingTest
    ? `\n\n## 기존 테스트 파일 (기존 통과 테스트는 유지하고 증분 추가)\n\`\`\`tsx\n${existingTest}\n\`\`\``
    : '';

  return `Generate a comprehensive Jest + RTL test file for this component.

## Source file: ${relativePath}
\`\`\`tsx
${source}
\`\`\`${existingSection}

Output path: ${relativeOutput}

Return the complete test file. Raw TypeScript only, no markdown.`;
}

async function main() {
  const inputArg = process.argv[2];

  if (!inputArg) {
    console.error('사용법: pnpm generate:tests <컴포넌트-파일-경로>');
    console.error('예시: pnpm generate:tests src/components/ui/Button.tsx');
    process.exit(1);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('오류: ANTHROPIC_API_KEY가 설정되지 않았습니다.');
    console.error('.env.local 파일에 추가하거나 환경변수로 export하세요.');
    process.exit(1);
  }

  const absoluteInput = path.resolve(process.cwd(), inputArg);

  if (!fs.existsSync(absoluteInput)) {
    console.error(`오류: 파일을 찾을 수 없습니다: ${absoluteInput}`);
    process.exit(1);
  }

  const outputPath = resolveOutputPath(absoluteInput);
  const source = fs.readFileSync(absoluteInput, 'utf-8');
  const existingTest = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf-8') : null;

  console.log(`\n대상 파일: ${inputArg}`);
  console.log(`출력 위치: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`모델:      ${MODEL}`);
  if (existingTest) {
    console.log('기존 테스트 파일 발견 — 증분 업데이트 모드');
  }
  console.log('─'.repeat(60));

  const client = new Anthropic({ apiKey });
  let generatedContent = '';

  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(absoluteInput, source, outputPath, existingTest),
      },
    ],
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      process.stdout.write(chunk.delta.text);
      generatedContent += chunk.delta.text;
    }
  }

  const finalMessage = await stream.finalMessage();
  console.log('\n' + '─'.repeat(60));
  console.log(
    `\n토큰 사용량: ${finalMessage.usage.input_tokens} 입력 / ${finalMessage.usage.output_tokens} 출력`,
  );

  const testDir = path.dirname(outputPath);
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const cleanedContent =
    generatedContent
      .replace(/^```(?:tsx?|typescript)?\n?/m, '')
      .replace(/\n?```\s*$/m, '')
      .trim() + '\n';

  fs.writeFileSync(outputPath, cleanedContent, 'utf-8');
  console.log(`\n테스트 파일 저장: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((err) => {
  console.error('\n오류:', err);
  process.exit(1);
});
