# AI 에이전트 기반 IT 프로젝트 수행 전략 및 워크플로우

본 문서는 실제 IT 프로젝트 수행 시 투입되는 인력(Human)의 역할과 업무 패턴을 AI 에이전트 시스템에 투영하여, 고객의 요구사항을 접수받아 결과물을 완성하기까지의 전략과 실행 절차를 정의합니다.

---

## 1. 기본 원칙 (Core Principles)

1.  **Human-Like Collaboration:** 각 에이전트는 전문화된 역할(PM, PL, Dev, QA)을 수행하며, 사람처럼 소통하고 협업합니다.
2.  **Step-by-Step Execution:** 모든 업무는 논리적인 순서로 분해되어 단계별로 검증(Review)을 거쳐 진행됩니다.
3.  **Iterative Refinement:** 초기에 완벽한 계획을 세우기보다, 요구사항 정의 단계를 통해 불확실성을 제거해 나가는 전략을 취합니다.

---

## 2. 프로젝트 진행 단계 (Process Overview)

전체 프로세스는 **[의뢰 접수] -> [요구사항 구체화] -> [계획 및 전략 수립] -> [실행 및 협업] -> [최종 인도]** 의 5단계로 구성됩니다.

### Phase 1. 의뢰 접수 (Project Initiation)
고객(User)으로부터 프로젝트나 Task에 대한 최초 요청을 받는 단계입니다.
*   **Input:** 자연어 형태의 대략적인 요청 사항 (예: "사내 공지사항 게시판을 만들어줘", "쇼핑몰 앱을 만들고 싶어")
*   **Agent Role:** Account Manager (Initial Contact)

### Phase 2. 요구사항 구체화 (Requirements Gathering)
불명확한 의뢰 내용을 바탕으로, **'무엇을', '왜', '어떻게'** 만들 것인지 명확히 정의하는 가장 중요한 단계입니다. AI는 고객에게 능동적으로 질문하여 요구사항을 구체화해야 합니다.

#### 📝 필수 확인 전략 (Checklist Strategy)
AI PM 에이전트는 다음 카테고리의 질문을 통해 정보를 수집합니다.

1.  **비즈니스 목표 및 범위 (Scope & Goal)**
    *   "이 프로젝트의 최종 목적은 무엇인가요? (예: 비용 절감, 신규 수익 창출)"
    *   "핵심 타겟 유저는 누구인가요?"
    *   "필수적으로 포함되어야 할 핵심 기능 3가지는 무엇인가요?"
    *   "프로젝트의 완료 기준(Definition of Done)은 무엇인가요?"

2.  **기술적 제약 사항 (Technical Constraints)**
    *   "선호하는 기술 스택이 있나요? (예: React, Python, Java, AWS 등)"
    *   "연동해야 할 기존 레거시 시스템이나 외부 API가 있나요?"
    *   "보안 규정이나 컴플라이언스 요건이 있나요?"

3.  **디자인 및 사용자 경험 (Design & UX)**
    *   "참고할 만한 레퍼런스 사이트나 경쟁 서비스가 있나요?"
    *   "브랜드 컬러나 디자인 가이드라인이 존재하나요?"

4.  **일정 및 자원 (Timeline & Resources)**
    *   "예상되는 마감 기한은 언제인가요?"
    *   "가용 가능한 예산 범위나 클라우드 리소스 제한이 있나요?"

*   **Output:** **요구사항 정의서 (PRD - Project Requirements Document)**

### Phase 3. 계획 및 전략 수립 (Planning & Strategy)
확정된 요구사항을 바탕으로 실제 업무를 수행하기 위한 설계를 진행하고 상세 업무 리스트를 작성합니다.

*   **Agent Role:** Project Manager(PM) & System Architect
*   **Workflows:**
    1.  **아키텍처 설계:** 요구사항에 맞는 시스템 구조, DB 스키마, API 명세 설계.
    2.  **WBS(Work Breakdown Structure) 생성:** 전체 프로젝트를 관리 가능한 단위(Epic -> Story -> Task)로 쪼갭니다.
    3.  **우선순위 선정:** 의존성과 중요도를 기반으로 작업 순서를 결정합니다.
*   **Output:** **구현 계획서 (Implementation Plan), 상세 Task List**

### Phase 4. 실행 및 협업 (Execution & Collaboration Modeling)
이 단계에서는 실제 개발팀(AI Agents)이 투입되어 업무를 수행합니다. 사람의 업무 패턴인 **[할당 - 수행 - 리뷰 - 수정]** 루틴을 따릅니다.

#### 🔄 에이전트 간 협업 워크플로우 (Agent Interaction Loop)

1.  **Task Assignment (PM -> Dev)**
    *   PM 에이전트는 'Task List'에서 작업 하나를 꺼내 적절한 'Developer Agent'에게 할당합니다.
    *   입력값: Ticket 정보 (작업 내용, 관련 파일, 제약 사항)

2.  **Implementation (Dev)**
    *   Dev 에이전트는 코드를 작성하거나 수정합니다.
    *   필요 시 'Search Tool' 등을 사용하여 기술 정보를 검색합니다.
    *   작업 완료 후 'Pull Request' 형태의 결과물을 제출합니다.

3.  **Code Review (Dev -> Reviewer/Architect)**
    *   Reviewer 에이전트(또는 PL)는 제출된 코드를 검토합니다.
    *   **Check Point:**
        *   요구사항을 충족했는가?
        *   코딩 컨벤션을 준수했는가?
        *   기존 코드에 부작용(Side-effect)은 없는가?
    *   **Pass:** 다음 단계(Test/Merge)로 진행.
    *   **Fail:** 피드백과 함께 Dev 에이전트에게 반려 (-> Step 2로 복귀).

4.  **Testing (QA Agent)**
    *   QA 에이전트는 구현된 기능에 대해 테스트 케이스를 생성하고 검증합니다.
    *   버그 발견 시 버그 리포트를 생성하여 PM에게 전달합니다.

### Phase 5. 프로젝트 종료 및 인도 (Closure)
모든 Task가 완료되면 최종 결과물을 합치고 사용자에게 전달합니다.

*   **Final Review:** 사용자가 직접 결과물을 확인하고 피드백을 줄 수 있도록 시연(Demo) 혹은 배포를 수행합니다.
*   **Document:** 최종 완료 보고서, API 문서, 매뉴얼 등을 생성합니다.

---

## 3. 요약: AI 에이전트의 역할 매핑 표

| Role | Human Responsibilities | AI Agent Responsibilities & Tools |
| :--- | :--- | :--- |
| **PM (Manager)** | 일정 관리, 업무 분배, 이슈 해결 | 사용자 의도 파악, Plan 생성, Task 상태 추적, 에이전트 조율 |
| **Architect** | 기술 표준 수립, 구조 설계 | 기술 스택 선정, 디렉토리 구조 생성, 핵심 인터페이스 정의 |
| **Developer** | 코딩, 단위 테스트, 구현 | 코드 생성(Coding), 디버깅, API 연동 구현 |
| **Code Reviewer** | 품질 관리, 코드 리뷰 | 정적 분석, 로직 검증, 보안 취약점 점검, 개선안 제안 |
| **QA / Tester** | 테스트 계획, 결함 리포팅 | 테스트 케이스 자동 생성, 단위/통합 테스트 실행, 오류 로그 분석 |

이 전략 문서는 AI 에이전트가 단독으로 동작하는 것이 아니라, **'조직된 팀'** 처럼 유기적으로 움직이며 복잡한 문제를 해결하는 것을 목표로 합니다.
