import { Editor } from '@tiptap/core';

import { editorExtensions } from '@/components/board/Editor/extensions';

jest.mock('lowlight', () => ({
  common: {},
  createLowlight: () => ({ register: jest.fn(), highlight: jest.fn() }),
}));
jest.mock('@tiptap/extension-code-block-lowlight', () =>
  jest.requireActual('@tiptap/extension-code-block'),
);

it('게시글의 이미지 태그를 미리보기 HTML로 유지한다', () => {
  const editor = new Editor({
    extensions: editorExtensions,
    content: '<p><img src="https://img.example.com/post.png" alt="게시글 이미지"></p>',
  });

  const image = new DOMParser().parseFromString(editor.getHTML(), 'text/html').querySelector('img');
  expect(image).not.toBeNull();
  expect(image?.getAttribute('src')).toBe('https://img.example.com/post.png');
  expect(image?.getAttribute('alt')).toBe('게시글 이미지');

  editor.destroy();
});
