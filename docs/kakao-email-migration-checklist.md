# Kakao Email Migration Checklist

이 문서는 Kakao 로그인에서 닉네임만 받는 현재 상태를, Kakao 계정 이메일까지 받는 상태로 전환할 때 사용하는 운영 체크리스트입니다.

## 현재 확인 상태

- Kakao Developers app: `SunoFox` (`1483472`)
- Kakao Login `profile_nickname`: `필수 동의`
- Kakao Login `account_email`: `권한 없음`
- Production OAuth status: `kakao.configured=true`, `kakao.emailScopeRequested=false`

`account_email`이 `권한 없음`인 동안에는 `SF_KAKAO_EMAIL_SCOPE=true`를 켜지 마세요.

## 수동 콘솔 작업

Kakao Developers에서 사이트 주인이 직접 확인하고 저장해야 하는 작업입니다.

1. Kakao Developers에서 app `SunoFox` (`1483472`)을 엽니다.
2. 앱 설정 화면에서 `개인 개발자 비즈 앱 전환`을 엽니다.
3. 전환 목적은 `이메일 필수 동의`로 입력합니다.
4. 저장 후 `제품 설정 > 카카오 로그인 > 동의항목`으로 이동합니다.
5. `카카오계정(이메일) account_email`이 더 이상 `권한 없음`이 아닌지 확인합니다.
6. 가능한 경우 `account_email`을 `필수 동의` 또는 `선택 동의`로 설정합니다.

## 사이트 전환 명령

Kakao 콘솔에서 `account_email` 권한이 열린 후에만 실행합니다.

```powershell
npx wrangler pages secret put SF_KAKAO_EMAIL_SCOPE --project-name sf-studio
# value: true

npm run build
npx wrangler pages deploy dist --project-name sf-studio --branch main
```

## 전환 후 검증

```powershell
.\scripts\check-oauth-status.ps1 -ExpectKakaoEmailScope
```

추가 확인:

- `https://sunofox.com/login/`에서 Kakao 로그인 시도
- Kakao 동의 화면에 이메일 항목이 표시되는지 확인
- 로그인 후 `https://sunofox.com/account/`에서 내부 fallback 이메일(`@oauth.sunofox.local`)이 노출되지 않는지 확인
- 기존 Kakao 사용자의 팬 게시글 작성자 정보가 유지되는지 확인

## 롤백

Kakao 이메일 동의 화면이 비정상적으로 보이거나 로그인이 실패하면 사이트 측 scope 요청을 다시 끕니다.

```powershell
npx wrangler pages secret put SF_KAKAO_EMAIL_SCOPE --project-name sf-studio
# value: false

npm run build
npx wrangler pages deploy dist --project-name sf-studio --branch main
.\scripts\check-oauth-status.ps1
```
