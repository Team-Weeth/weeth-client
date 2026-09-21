/**
 * 백엔드 MarkdownToTiptapHtmlConverter 의 실제 입출력.
 * `raw` 는 v3 에디터가 저장해 둔 현재 DB 본문, `converted` 는 변환 후 본문이다.
 */
export interface ConversionSample {
  name: string;
  raw: string;
  converted: string;
}

export const conversionSamples: ConversionSample[] = [
  {
    name: '공지사항',
    raw: '# 2026학년도 1학기 정기 세션 안내\n\n안녕하세요, 위드 운영진입니다.\n이번 학기 **정기 세션 일정**을 공지드립니다.\n\n## 세션 일정\n\n- 매주 화요일 오후 7시\n- 장소: 가천대학교 AI공학관 502호\n- 첫 세션: 3월 5일 (화)\n\n### 준비물\n\n1. 노트북\n2. 필기도구\n3. 열정!\n\n> 무단 결석 시 페널티가 부여되니 유의해 주세요.\n\n자세한 내용은 [위드 홈페이지](https://weeth.kr)를 참고해 주세요.\n\n---\n\n문의: 운영진 채널로 남겨주세요.',
    converted:
      '<h1>2026학년도 1학기 정기 세션 안내</h1>\n<p>안녕하세요, 위드 운영진입니다.<br>이번 학기 <strong>정기 세션 일정</strong>을 공지드립니다.</p>\n<h2>세션 일정</h2>\n<ul>\n<li><p>매주 화요일 오후 7시</p></li>\n<li><p>장소: 가천대학교 AI공학관 502호</p></li>\n<li><p>첫 세션: 3월 5일 (화)</p></li>\n</ul>\n<h3>준비물</h3>\n<ol>\n<li><p>노트북</p></li>\n<li><p>필기도구</p></li>\n<li><p>열정!</p></li>\n</ol>\n<blockquote><p>무단 결석 시 페널티가 부여되니 유의해 주세요.</p></blockquote>\n<p>자세한 내용은 <a href="https://weeth.kr">위드 홈페이지</a>를 참고해 주세요.</p>\n<hr>\n<p>문의: 운영진 채널로 남겨주세요.</p>\n',
  },
  {
    name: '스터디 정리 (코드·테이블·체크리스트)',
    raw: '## Spring 트랜잭션 정리\n\n이번 주 스터디에서 다룬 내용입니다.\n\n### 전파 속성\n\n| 속성 | 설명 |\n| --- | --- |\n| REQUIRED | 기존 트랜잭션 참여 |\n| REQUIRES_NEW | 항상 새 트랜잭션 |\n\n### 예제 코드\n\n```kotlin\n@Transactional\nfun createPost(request: CreatePostRequest) {\n    val post = Post.create(request.title, request.content)\n    postRepository.save(post)\n}\n```\n\n`@Transactional`은 ~~메서드~~ 클래스 레벨에도 붙일 수 있습니다.\n\n### 다음 주 할 일\n\n- [x] 전파 속성 정리\n- [ ] 격리 수준 정리\n- [ ] 예제 코드 작성',
    converted:
      '<h2>Spring 트랜잭션 정리</h2>\n<p>이번 주 스터디에서 다룬 내용입니다.</p>\n<h3>전파 속성</h3>\n<table><tbody><tr>\n<th colspan="1" rowspan="1"><p>속성</p></th>\n<th colspan="1" rowspan="1"><p>설명</p></th>\n</tr>\n<tr>\n<td colspan="1" rowspan="1"><p>REQUIRED</p></td>\n<td colspan="1" rowspan="1"><p>기존 트랜잭션 참여</p></td>\n</tr>\n<tr>\n<td colspan="1" rowspan="1"><p>REQUIRES_NEW</p></td>\n<td colspan="1" rowspan="1"><p>항상 새 트랜잭션</p></td>\n</tr>\n</tbody></table>\n<h3>예제 코드</h3>\n<pre><code class="language-kotlin">@Transactional\nfun createPost(request: CreatePostRequest) {\n    val post = Post.create(request.title, request.content)\n    postRepository.save(post)\n}\n</code></pre>\n<p><code>@Transactional</code>은 <s>메서드</s> 클래스 레벨에도 붙일 수 있습니다.</p>\n<h3>다음 주 할 일</h3>\n<ul data-type="taskList">\n<li data-type="taskItem" data-checked="true"><p>전파 속성 정리</p></li>\n<li data-type="taskItem" data-checked="false"><p>격리 수준 정리</p></li>\n<li data-type="taskItem" data-checked="false"><p>예제 코드 작성</p></li>\n</ul>\n',
  },
  {
    name: 'p 한 덩어리로 이관된 데이터',
    raw: '<p>## 스터디 회고<br><br>이번 주는 **JPA 영속성 컨텍스트**를 공부했습니다.<br>- 1차 캐시<br>- 변경 감지<br>- 지연 로딩<br><br>다음 주에 이어서 진행합니다.</p>',
    converted:
      '<h2>스터디 회고</h2>\n<p>이번 주는 <strong>JPA 영속성 컨텍스트</strong>를 공부했습니다.</p>\n<ul>\n<li><p>1차 캐시</p></li>\n<li><p>변경 감지</p></li>\n<li><p>지연 로딩</p></li>\n</ul>\n<p>다음 주에 이어서 진행합니다.</p>\n',
  },
];
