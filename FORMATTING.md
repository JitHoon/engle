# 코드 포맷팅 가이드

이 프로젝트는 일관된 코드 스타일을 유지하기 위해 **Prettier**와 **ESLint**를 사용합니다.

## 📦 설치

먼저 필요한 패키지를 설치하세요:

```bash
npm install
```

## 🎨 포맷팅 설정

### Prettier 설정 (`.prettierrc.json`)

- **semi**: 세미콜론 사용 (`true`)
- **singleQuote**: 작은따옴표 사용 (`true`)
- **printWidth**: 한 줄 최대 길이 (`80`)
- **tabWidth**: 들여쓰기 공백 수 (`2`)
- **trailingComma**: 후행 쉼표 (`es5`)

### EditorConfig 설정 (`.editorconfig`)

모든 에디터에서 일관된 설정을 적용합니다:

- UTF-8 인코딩
- LF 줄바꿈
- 2칸 들여쓰기
- 파일 끝에 빈 줄 추가

## 🚀 사용 방법

### 전체 프로젝트 포맷팅

```bash
# 모든 파일 포맷팅
npm run format

# 포맷팅 확인 (CI/CD에서 사용)
npm run format:check
```

### ESLint 수정

```bash
# ESLint 자동 수정
npm run lint:fix
```

### VS Code에서 자동 포맷팅

VS Code를 사용하는 경우, 저장 시 자동으로 포맷팅됩니다:

- `.vscode/settings.json` 파일이 이미 설정되어 있습니다
- **Prettier** 확장 프로그램을 설치하세요:
  - [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 📝 Git Hooks (선택사항)

커밋 전 자동 포맷팅을 원한다면 `husky`와 `lint-staged`를 설정할 수 있습니다:

```bash
npm install --save-dev husky lint-staged
npx husky init
```

`.husky/pre-commit` 파일에 다음 추가:

```bash
npx lint-staged
```

`package.json`에 추가:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,scss,md}": ["prettier --write", "eslint --fix"]
  }
}
```

## 🔧 설정 파일

- `.prettierrc.json`: Prettier 설정
- `.prettierignore`: Prettier가 무시할 파일/폴더
- `.editorconfig`: 에디터 기본 설정
- `.vscode/settings.json`: VS Code 워크스페이스 설정
- `eslint.config.mjs`: ESLint 설정 (Prettier와 통합)

## ⚙️ 커스터마이징

포맷팅 규칙을 변경하려면 `.prettierrc.json` 파일을 수정하세요.

일반적인 변경 사항:

- `printWidth`: 한 줄 최대 길이 조정
- `tabWidth`: 들여쓰기 공백 수 변경
- `singleQuote`: 큰따옴표 사용으로 변경

변경 후:

```bash
npm run format
```
