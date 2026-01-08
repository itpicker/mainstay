# Google Sheets API 연동 가이드

Python 환경에서 Google Spreadsheet를 [gspread](https://docs.gspread.org/) 라이브러리를 통해 제어하기 위한 설정 방법입니다.

## 1. Google Cloud Platform (GCP) 설정

1. **[Google Cloud Console](https://console.cloud.google.com/)**에 접속하여 로그인합니다.
2. 상단 네비게이션 바에서 프로젝트 선택 드롭다운을 클릭하고 **[새 프로젝트]**를 생성합니다 (예: `My Sheets Project`).
3. 프로젝트가 생성되면 해당 프로젝트를 선택합니다.

## 2. API 활성화

1. 좌측 메뉴에서 **[API 및 서비스] > [라이브러리]**로 이동합니다.
2. 검색창에 `Google Sheets API`를 검색하고 클릭한 뒤, **[사용]** 버튼을 누릅니다.
3. 동일한 방식으로 `Google Drive API`도 검색하여 **[사용]** 설정을 합니다. (스프레드시트 접근 권한 제어를 위해 필요할 수 있습니다).

## 3. 서비스 계정(Service Account) 생성 및 키 발급

1. 좌측 메뉴에서 **[API 및 서비스] > [사용자 인증 정보]**로 이동합니다.
2. 상단의 **[+ 사용자 인증 정보 만들기]** 버튼을 클릭하고 **[서비스 계정]**을 선택합니다.
3. **서비스 계정 이름**을 입력합니다 (예: `sheets-bot`).
4. **[만들기 및 계속]**을 클릭합니다.
5. (선택사항) 역할은 '편집자' 또는 '소유자'로 선택할 수 있으나, 단순 시트 접근용이라면 **[계속]**을 눌러 넘어가도 됩니다. (Sheet 공유 시 권한을 부여받기 때문)
6. **[완료]**를 클릭합니다.
7. 생성된 서비스 계정 목록에서 방금 만든 계정(이메일 형태)을 클릭합니다.
8. 상단 탭 중 **[키]** 탭으로 이동합니다.
9. **[키 추가] > [새 키 만들기]**를 선택합니다.
10. 키 유형으로 **JSON**을 선택하고 **[만들기]**를 클릭합니다.
11. 자동으로 다운로드되는 `.json` 파일을 프로젝트 폴더로 이동시키고 이름을 알기 쉽게 변경합니다 (예: `service_account.json`).

> **⚠️ 주의:** 이 JSON 파일에는 민감한 인증 정보가 담겨 있습니다. **Github 등의 공개된 저장소에 절대 업로드하지 마세요.** `.gitignore`에 추가하는 것을 권장합니다.

## 4. 스프레드시트 공유 설정

1. 편집하려는 **Google Spreadsheet**를 엽니다.
2. 우측 상단의 **[공유]** 버튼을 클릭합니다.
3. 공유 대상 입력창에 **3번 단계에서 생성된 서비스 계정의 이메일 주소** (예: `sheets-bot@project-id.iam.gserviceaccount.com`)를 입력합니다.
4. 권한을 **[편집자(Editor)]**로 설정하고 **[전송]**합니다.

## 5. Python 환경 설정 및 테스트

### 라이브러리 설치

```bash
pip install gspread oauth2client
```

### 테스트 코드 (example.py)

```python
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 1. 인증 설정
scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('service_account.json', scope)
client = gspread.authorize(creds)

# 2. 스프레드시트 열기 (공유한 시트의 이름 또는 URL 키 사용)
# 방법 A: 시트 제목으로 열기
sheet = client.open("공유한_스프레드시트_제목").sheet1

# 방법 B: 시트 Url로 열기
# sheet = client.open_by_url("https://docs.google.com/spreadsheets/d/...").sheet1

# 3. 데이터 읽기/쓰기 테스트
print("현재 데이터:", sheet.get_all_records())

# A1 셀 업데이트
sheet.update_acell('A1', 'Hello World!')
print("A1 셀 업데이트 완료")
```

이제 설정이 완료되었습니다. 위 코드를 실행하여 정상적으로 시트가 수정되는지 확인해 보세요.
