import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const SECRET_PATH = path.join(DATA_DIR, 'session-secret.txt');

await fs.mkdir(DATA_DIR, { recursive: true });

async function ensureSecret() {
  try { return (await fs.readFile(SECRET_PATH, 'utf8')).trim(); }
  catch {
    const secret = crypto.randomBytes(48).toString('hex');
    await fs.writeFile(SECRET_PATH, secret, 'utf8');
    return secret;
  }
}
const SESSION_SECRET = process.env.SESSION_SECRET || await ensureSecret();

const seed = {
  users: [],
  products: [
    { id: nanoid(), name: 'VEOX 자판기봇 BASIC', tier: 'BASIC', category: '자판기봇', price: 19000, badge: '입문추천', description: '디스코드에서 바로 주문을 받을 수 있는 기본 판매 봇 구성입니다.', features: ['상품 버튼 주문 UI', '주문 접수 및 로그 기록', '관리자 확인 후 지급 안내', '기본 고객 응대 메시지', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEOX 자판기봇 PRO', tier: 'PRO', category: '자판기봇', price: 39000, badge: '인기', description: '상품 관리, 주문 흐름, 스태프 운영까지 확장한 실전 판매용 봇입니다.', features: ['BASIC 전체 기능 포함', '상품 추가·수정·삭제 관리', '주문 상태 관리 패널', '구매자 역할 부여 지원', '상세 주문 로그 채널', '스태프 권한 분리', ] },
    { id: nanoid(), name: 'VEOX 디스코드 서버 템플릿', category: '서버 템플릿', price: 19000, badge: '빠른시작', description: '판매, 문의, 티켓, 인증 채널이 정리된 바로 사용 가능한 서버 템플릿입니다.', features: ['INFORMATION / STORE / ORDER / SUPPORT / COMMUNITY 구조', 'OWNER·ADMIN·STAFF·CUSTOMER·MEMBER 역할', '공지·가격표·구매인증 채널', '문의·1대1 티켓용 채널', '관리자 전용 STAFF 카테고리', '서버 템플릿 링크 제공', '기본 세팅 가이드'] },
    { id: nanoid(), name: 'VEOX 서버 템플릿 PRO', category: '서버 템플릿', price: 34000, badge: 'BEST', description: '고급 권한, 티켓 운영, 후기 동선까지 포함한 프리미엄 서버 구조입니다.', features: ['기본 템플릿 전체 포함', '세분화된 권한 구조', '티켓 봇 연동 가이드', '주문·고객·상품 관리 채널 분리', '후기·파트너 채널 구성', '자판기봇 배치 위치 안내', '상세 세팅 설명서'] },
    { id: nanoid(), name: 'VEOX 자동화 패키지', category: '자동화', price: 49000, badge: '업무절약', description: '반복 공지, 역할, 주문 알림을 줄여 운영 시간을 아끼는 자동화 구성입니다.', features: ['환영·역할 자동 부여 지원', '반복 공지/안내 자동화', '주문 알림 연동 구성', '스태프 업무 보조 기능', '기본 자판기 흐름 포함', '세팅 가이드 제공'] },
    { id: nanoid(), name: 'VEOX 커스텀 봇 제작', category: '개발', price: 89000, badge: '상담필수', description: '원하는 기능을 기준으로 제작하는 맞춤형 디스코드 봇입니다.', features: ['요구사항 상담 후 제작', '슬래시/버튼 커맨드 지원', '서버 맞춤 기능 구현', '소스 또는 실행 파일 제공', '기본 설치 지원', '수정 범위 협의 가능'] },
    { id: nanoid(), name: 'VEOX STORE 올인원', category: '패키지', price: 99000, badge: '목표추천', description: '서버 템플릿, 자판기봇, 기본 자동화를 한 번에 맞추는 수익형 패키지입니다.', features: ['서버 템플릿 PRO급 구조', '자판기봇 BASIC 또는 협의 버전', '자동화 기본 구성', '통합 세팅 가이드', '한 번에 판매 서버 구축', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEOX 런칭 풀세팅', category: '패키지', price: 149000, badge: '프리미엄', description: '처음 판매 서버를 여는 사람을 위한 서버 구축, 봇 연결, 운영 동선 세팅 상품입니다.', features: ['올인원 구성 포함', '판매 채널 문구 기본 작성', '후기·구매인증 동선 세팅', '운영 체크리스트 제공', '오픈 전 점검 1회', '주문 후 디스코드 티켓에서 범위 확정'] },
    { id: nanoid(), name: '봇 설치 가이드', category: '가이드', price: 6000, badge: 'NEW', description: '디스코드 봇을 처음 설치·실행하는 방법을 단계별로 정리한 가이드입니다.', features: ['봇 계정 생성 방법', '토큰 발급·보관', '로컬 실행 방법', '필수 권한 설정', '자주 하는 오류 해결', '문서 형태로 제공'] },
    { id: nanoid(), name: '호스팅 가이드', category: '가이드', price: 7000, badge: '', description: '봇을 24시간 켜 두기 위한 호스팅 선택·세팅 가이드입니다.', features: ['무료/유료 호스팅 비교', 'VPS 기본 세팅', '프로세스 유지(PM2 등)', '재시작·로그 확인', '초보자용 체크리스트'] },
    { id: nanoid(), name: '서버 세팅 가이드', category: '가이드', price: 7000, badge: '', description: '판매용 디스코드 서버 채널·역할·권한을 구성하는 방법입니다.', features: ['역할 계층 설계', '카테고리/채널 구성', '권한 충돌 방지', '티켓·문의 채널 세팅', '구매 인증 채널 운영'] },
    { id: nanoid(), name: '자판기봇 운영 가이드', category: '가이드', price: 9000, badge: 'HOT', description: '자판기봇으로 실제 판매할 때 필요한 운영 흐름을 정리한 가이드입니다.', features: ['상품 등록 예시', '입금 확인 체크 포인트', '지급 전 확인 사항', '분쟁 예방 팁', '후기·인증 채널 활용'] },
    { id: nanoid(), name: '올인원 세팅 가이드', category: '가이드', price: 19000, badge: 'BEST', description: '봇 설치, 호스팅, 서버 세팅, 운영까지 한 번에 담은 통합 가이드입니다.', features: ['설치·호스팅·서버 세팅 통합', '판매 시작 체크리스트', '문제 해결 FAQ', '추천 운영 순서', '개별 가이드 묶음보다 저렴'] }
  ],
  orders: [],
  inquiries: [],
  announcements: [],
  settings: {
    siteName: 'VEOXHUB',
    notice: '',
    onlineLabel: '현재 접속자',
    discordInvite: process.env.DISCORD_INVITE_URL || '',
    bankInfo: process.env.BANK_INFO || '디스코드 티켓에서 입금 계좌를 안내받아 주세요.',
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
    goalAmount: 500000,
    targetMonth: '2026-10'
  }
};

let db;
try {
  db = JSON.parse(await fs.readFile(DB_PATH, 'utf8'));
} catch {
  db = seed;
}
if (!Array.isArray(db.users)) db.users = [];
if (!Array.isArray(db.products) || db.products.length === 0) db.products = seed.products;
if (!Array.isArray(db.orders)) db.orders = [];
if (!Array.isArray(db.inquiries)) db.inquiries = [];
if (!Array.isArray(db.announcements)) db.announcements = [];
if (!Array.isArray(db.coupons)) db.coupons = [];
if (!Array.isArray(db.purchaseLogs)) db.purchaseLogs = [];

// VEOX 5.1 permanent seller-operation products requested by the store owner.
// Deliberately exclude the previously discussed #2 security, #3/4 customer-management items.
// NOTE: this used to run only on first boot (inside the JSON-parse catch block), so it never
// reached a store that already had a db.json. It now always runs, same as every other product
// migration block below, so these 3 products reliably appear on existing deployments too.
const VEOX_51_PRODUCTS = [
  { id:'vexo-digital-auto-delivery', name:'VEOX 디지털 자동지급팩', category:'봇 옵션', price:19900, badge:'DELIVERY PRO', description:'구매 완료 후 디지털 상품을 빠르게 전달할 수 있도록 자동 지급 흐름을 확장하는 영구 기능팩입니다.', features:['디지털 상품 자동 지급 흐름','다운로드 횟수 제한 옵션','재다운로드 지원','지급 이력 기록','지급 완료 처리 연동','1회 구매 후 영구 적용'] },
  { id:'vexo-alert-automation', name:'VEOX 알림 자동화팩', category:'봇 옵션', price:9900, badge:'ALERT', description:'주문·입금확인·문의·지급 완료 같은 운영 이벤트를 한눈에 확인하고 빠르게 알릴 수 있는 영구 알림 확장팩입니다.', features:['새 주문 알림','입금 확인 요청 알림','문의 도착 알림','지급 완료 알림','Discord 웹훅 알림 연동','1회 구매 후 영구 적용'] },
  { id:'vexo-seller-dashboard', name:'VEOX SELLER DASHBOARD', category:'패키지', price:29900, badge:'DASHBOARD', description:'판매자가 주문·매출·상품 성과를 한 화면에서 확인할 수 있도록 운영 대시보드를 강화하는 영구 패키지입니다.', features:['실시간 주문 현황','일/월 매출 요약','상품별 판매량·매출','진행 단계별 주문 분석','최근 운영 활동 위젯','CSV 운영 데이터 내보내기','1회 구매 후 영구 적용'] }
];
const existing51 = new Set(db.products.map(p => p.id));
for (const p of VEOX_51_PRODUCTS) {
  const existing = db.products.find(item => item.id === p.id);
  if (existing) {
    existing.price = p.price;
    existing.badge = p.badge;
    existing.description = p.description;
    existing.features = p.features;
  } else if (!existing51.has(p.id)) {
    db.products.push(p);
  }
}
for (const o of db.orders) { if (o.status === '접수') o.status = '주문접수'; if (o.paymentRequested === undefined) o.paymentRequested = false; if (o.deliveryLink === undefined) o.deliveryLink = ''; if (o.payerName === undefined) o.payerName = ''; if (!Array.isArray(o.messages)) o.messages = []; if (!o.updatedAt) o.updatedAt = o.createdAt || new Date().toISOString(); }
if (!db.settings) db.settings = seed.settings;
if (db.settings.siteName === 'VEOX STORE') { db.settings.siteName = 'VEOXHUB'; }
if (db.settings.discordInvite === undefined) db.settings.discordInvite = process.env.DISCORD_INVITE_URL || '';
if (db.settings.bankInfo === undefined) db.settings.bankInfo = process.env.BANK_INFO || '관리자에게 입금 계좌를 안내받아 주세요.';
if (db.settings.webhookUrl === undefined) db.settings.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
if (db.settings.goalAmount === undefined) db.settings.goalAmount = 500000;
if (db.settings.targetMonth === undefined) db.settings.targetMonth = '2026-10';
// Older installations may still have stock fields / legacy category names. Stocks are intentionally unlimited now.
for (const p of db.products) { delete p.stock; if (p.category === '서버') p.category = '서버 템플릿'; }
// Retire discontinued items from older deployments.
db.products = db.products.filter(p => !['VEOX 멀티서버 관리팩','VEOX UPDATE PASS 1개월','VEOX UPDATE PASS 6개월','VEOX 봇 설치 & 기본 세팅'].includes(p.name));
// Remove any legacy game-only SKUs from older deployments. VEOXHUB sells Discord bots, templates and seller tools.
const LEGACY_GAME_TERMS = ['냥코','battle cats','555 패키지','999 패키지','81주년','광복절'];
db.products = db.products.filter(p => !LEGACY_GAME_TERMS.some(term => String(p.name||'').toLowerCase().includes(term.toLowerCase())));

// VEOX design / feature add-ons. These are separate from existing BOT/TEMPLATE/GUIDE products.
// VEOX BOT SERIES metadata is shown as currently selling.
// Premium tiers are presented without inventing a price; the website routes buyers to Discord for final purchase details.
const VEOX_PREMIUM_PRODUCTS = [
  { id:'vexo-bot-basic-premium', name:'VEOX 자판기봇 BASIC PREMIUM', category:'자판기봇', price:29000, badge:'PREMIUM', description:'BASIC의 핵심 판매 기능에 Discord에서 구현 가능한 고급 자판기·주문·티켓 UI와 VEOX 브랜딩을 더한 프리미엄형입니다.', features:['BASIC 전체 기능 포함','고급 자판기 패널','상품 상세·선택 UI 강화','주문 티켓 UI 강화','지급 완료·구매 감사 로그 디자인','VEOX 브랜딩 구성'] },
  { id:'vexo-bot-pro-premium', name:'VEOX 자판기봇 PRO PREMIUM', category:'자판기봇', price:59000, badge:'인기 ULTIMATE', description:'PRO의 상품·재고·수량·통계 기능에 고급 주문 UI, 관리자 편의, 완료 로그와 브랜딩을 결합한 상위형입니다.', features:['PRO 전체 기능 포함','페이지형 카테고리·상품 탐색','재고·수량·통계 운영','고급 주문 티켓 UI','지급 완료·구매 감사 로그','관리자 운영 편의 강화','VEOX 프리미엄 브랜딩'] }
];
// id(이름은 폴백) 기준으로 매번 배지/가격/설명을 동기화합니다. 예전처럼 "이미 있으면 skip"만
// 하면 이미 운영 중인 스토어의 db.json에는 새 배지가 절대 반영되지 않습니다.
for (const p of VEOX_PREMIUM_PRODUCTS) {
  const existing = db.products.find(item => item.id === p.id) || db.products.find(item => item.name === p.name);
  if (existing) {
    existing.badge = p.badge;
    existing.price = p.price;
    existing.description = p.description;
    existing.features = p.features;
  } else {
    db.products.push(p);
  }
}

const VEOX_BOT_SERIES = [
  { key:'basic', name:'BASIC', productName:'VEOX 자판기봇 BASIC', status:'판매중', subtitle:'가볍게 시작하는 기본 자판기봇' },
  { key:'basic-premium', name:'BASIC PREMIUM', productName:'VEOX 자판기봇 BASIC PREMIUM', status:'판매중', price:29000, subtitle:'기본 기능 + Discord에서 구현 가능한 프리미엄 UI/브랜딩' },
  { key:'pro', name:'PRO', productName:'VEOX 자판기봇 PRO', status:'판매중', subtitle:'판매 서버 운영을 위한 확장형' },
  { key:'pro-premium', name:'PRO PREMIUM', productName:'VEOX 자판기봇 PRO PREMIUM', status:'판매중', price:59000, subtitle:'PRO 전체 + 고급 주문/관리 UI 및 브랜딩' }
];

const VEOX_ADDON_PRODUCTS = [
  { id: 'vexo-addon-embed-design', name: 'VEOX 임베드 디자인팩', category: '디자인', price: 9900, badge: 'DESIGN', description: '판매봇에 필요한 핵심 임베드를 VEOX 스타일로 통일하는 디자인팩입니다.', features: ['주문 접수 임베드', '입금 안내 임베드', '처리중·완료 임베드', '문의 접수 임베드', '후기 임베드', '다크 퍼플 글로우 테마'] },
  { id: 'vexo-addon-panel-design', name: 'VEOX 버튼 & 패널 디자인팩', category: '디자인', price: 12900, badge: 'UI', description: '버튼·셀렉트·패널을 하나의 브랜드 UI처럼 보이게 만드는 디자인팩입니다.', features: ['메인 판매 패널', '카테고리 선택 UI', '상품 선택 UI', '문의 패널', '후기 패널', '버튼 라벨·이모지 가이드'] },
  { id: 'vexo-addon-bot-skin', name: 'VEOX 봇 UI 스킨팩', category: '디자인', price: 14900, badge: 'HOT', description: '봇 전체의 색감·문구·임베드 스타일을 VEOX 전용 테마로 바꾸는 스킨팩입니다.', features: ['Purple Glow 테마', '임베드 타이포그래피 정리', '상태 메시지 디자인', '주문 티켓 디자인', '관리자 알림 디자인', '공통 푸터·브랜딩'] },
  { id: 'vexo-addon-ticket-ui', name: 'VEOX 티켓 UI 커스텀', category: '디자인', price: 7900, badge: 'TICKET', description: '주문·문의 티켓을 한눈에 읽기 쉬운 화면으로 재구성합니다.', features: ['주문 요약 카드', '결제 안내 영역', '상태 표시 디자인', '관리자 처리 버튼 정리', '닫기·후기 버튼 디자인'] },
  { id: 'vexo-addon-order-ui', name: 'VEOX 주문 UI 업그레이드', category: '봇 옵션', price: 10900, badge: 'ORDER', description: '주문 티켓의 상품·수량·금액·상태 정보를 더 고급스럽게 표현합니다.', features: ['상품 상세 요약', '수량·단가·총액 강조', '주문 상태 타임라인', '결제 안내 강조', '완료 메시지 디자인'] },
  { id: 'vexo-addon-feature-pack', name: 'VEOX 봇 기능 확장팩', category: '봇 옵션', price: 14900, badge: 'FEATURE', description: '기존 봇에 적용할 수 있는 소형 기능 옵션을 묶은 추가 기능팩입니다.', features: ['자동 응답 문구 옵션', '추가 관리자 버튼', '주문 알림 옵션', '간단한 운영 보조 기능', '기능별 적용 범위 안내'] },
  { id: 'vexo-addon-brand-kit', name: 'VEOX 봇 브랜딩팩', category: '디자인', price: 6900, badge: 'BRAND', description: '봇에 표시되는 이름·푸터·상태 문구를 한 브랜드처럼 통일합니다.', features: ['봇 이름 표기 가이드', '임베드 푸터 문구', '버튼 문구 세트', '상태/알림 문구 세트'] }
];
const existingIds = new Set(db.products.map(p => p.id));
for (const p of VEOX_ADDON_PRODUCTS) if (!existingIds.has(p.id)) db.products.push(p);
for (const p of db.products) {
  if (!p.features) p.features = [];
  // Keep installation guides separate from bot/template purchases.
  if (p.category !== '가이드') p.features = p.features.filter(f => !/설치[·ㆍ]?세팅 가이드|설치.*가이드/i.test(String(f)));
}



// VEOX permanent revenue products: no subscription / no maintenance period.
// Retire the earlier setup and UPDATE PASS SKUs so they disappear from the catalog on upgrade.
const RETIRED_VEOX_PRODUCT_IDS = new Set([
  'vexo-service-bot-setup',
  'vexo-service-server-premium-setup',
  'vexo-maintenance-pass-1m',
  'vexo-maintenance-pass-6m'
]);
db.products = db.products.filter(p => !RETIRED_VEOX_PRODUCT_IDS.has(String(p.id)));
db.products = db.products.filter(p => String(p.id) !== 'vexo-multiserver' && String(p.name) !== 'VEOX 멀티서버 관리팩');

const VEOX_UPGRADE_PRODUCTS = [
  { id:'vexo-feature-ticket-automation', name:'VEOX 티켓 자동화 확장팩', category:'봇 옵션', price:9900, badge:'TICKET', description:'주문·문의 티켓의 반복 작업을 줄이고 처리 흐름을 더 빠르게 만드는 영구 기능 확장팩입니다.', features:['티켓 자동 제목·안내 문구 옵션','처리 상태 안내 개선','자동 닫기/정리 옵션','주문자 접근 보호','1회 구매 후 영구 적용'] },
  { id:'vexo-feature-payment-automation', name:'VEOX 결제 자동화 확장팩', category:'봇 옵션', price:14900, badge:'PAYMENT', description:'입금확인 요청과 결제 상태 전달을 더 체계적으로 관리하는 영구 기능 확장팩입니다.', features:['입금확인 요청 상태 관리','관리자 결제 알림 강화','결제 상태 임베드 개선','미처리 주문 확인 보조','1회 구매 후 영구 적용'] },
  { id:'vexo-feature-operations-automation', name:'VEOX 운영 자동화 확장팩', category:'봇 옵션', price:19900, badge:'AUTO', description:'반복 운영 업무를 줄이는 실전형 자동화 기능을 묶은 영구 확장팩입니다.', features:['주문 상태 자동화 보조','운영 알림 강화','자동 만료·정리 옵션','주기적 데이터 백업 보조','1회 구매 후 영구 적용'] },
  { id:'vexo-feature-security', name:'VEOX 보안 강화팩', category:'봇 옵션', price:14900, badge:'SECURITY', description:'권한 분리와 운영 영역 보호를 강화하는 영구 보안 옵션입니다.', features:['관리 기능 접근 보호','위험 권한 차단 보조','스태프 영역 보호','주요 작업 감사 로그 강화','1회 구매 후 영구 적용'] },
  { id:'vexo-feature-statistics', name:'VEOX 통계 대시보드팩', category:'봇 옵션', price:12900, badge:'STATS', description:'판매·주문·매출을 한눈에 확인할 수 있도록 운영 통계를 확장하는 영구 옵션입니다.', features:['주문량 통계','완료 매출 통계','평균 주문액','진행중 주문 현황','1회 구매 후 영구 적용'] },
  { id:'vexo-custom-lite', name:'VEOX 간단 커스텀 옵션', category:'커스텀', price:19900, badge:'LITE', description:'기존 VEOX 봇의 작은 UI·문구·버튼·동작 변경을 위한 1회성 커스텀 상품입니다.', features:['문구 변경','버튼/임베드 수정','소규모 UI 변경','기존 기능 내 간단 동작 수정','주문 전 범위 확인'] },
  { id:'vexo-custom-standard', name:'VEOX 중급 커스텀 옵션', category:'커스텀', price:34900, badge:'STANDARD', description:'기존 기능을 조합하거나 소규모 신규 자동화를 추가하는 1회성 커스텀 상품입니다.', features:['기능 조합/확장','소규모 신규 자동화','관리자 버튼·패널 추가','기존 데이터 구조 연동','주문 전 범위 확정'] },
  { id:'vexo-custom-large', name:'VEOX 대형 커스텀 옵션', category:'커스텀', price:69900, badge:'LARGE', description:'기존 VEOX 시스템에 비교적 큰 신규 기능을 제작하는 1회성 커스텀 상품입니다.', features:['대형 기능 추가','복수 기능 연동','고급 관리자 흐름','별도 테스트·검수','주문 전 상세 견적 및 범위 확정'] },
  { id:'vexo-major-upgrade', name:'VEOX 메이저 버전 업그레이드', category:'업그레이드', price:19900, badge:'VERSION', description:'VEOX의 새로운 메이저 버전이 출시될 때 기존 구매자가 해당 버전으로 업그레이드하는 영구 업그레이드 상품입니다.', features:['메이저 버전 1회 업그레이드','출시 버전별 적용 범위 공지','기존 구매 정보 확인','업그레이드 안내 제공','기간 제한 없음'] },
  { id:'vexo-seller-pack', name:'VEOX SELLER PACK', category:'패키지', price:44900, badge:'SELLER', description:'디스코드에서 실제 판매를 운영하는 데 필요한 핵심 기능을 한 번에 묶은 영구 패키지입니다.', features:['티켓 자동화 확장팩','결제 자동화 확장팩','통계 대시보드팩','운영 보조 기능','판매 운영용 관리자 구성','1회 구매 후 영구 적용'] },
  { id:'vexo-seller-pro', name:'VEOX SELLER PRO', category:'패키지', price:69900, badge:'PRO SELLER', description:'SELLER PACK에 고급 디자인과 보안·운영 옵션을 더한 상위 영구 패키지입니다.', features:['SELLER PACK 구성 포함','보안 강화팩','VEOX DESIGN BUNDLE','고급 운영 UI 구성','브랜딩 일괄 적용','1회 구매 후 영구 적용'] },
  { id:'vexo-white-label', name:'VEOX 화이트라벨 패키지', category:'개발', price:79900, badge:'WHITE LABEL', description:'VEOX 브랜드 대신 고객의 자체 브랜드로 봇 UI와 표기를 구성하는 영구 화이트라벨 상품입니다.', features:['봇 표시명 브랜딩','임베드·푸터 문구 변경','버튼·패널 브랜딩','기본 색상·문구 일괄 적용','브랜드 기준 맞춤 안내','1회 구매 후 영구 적용'] },
  { id:'vexo-growth-bundle', name:'VEOX GROWTH BUNDLE', category:'패키지', price:49900, badge:'BUNDLE', description:'티켓·결제·운영·통계를 한 번에 확장하는 실전형 영구 기능 번들입니다.', features:['티켓 자동화 확장팩','결제 자동화 확장팩','운영 자동화 확장팩','통계 대시보드팩','개별 구매 대비 묶음가','1회 구매 후 영구 적용'] }
];
const upgradeIds = new Set(db.products.map(p => p.id));
for (const p of VEOX_UPGRADE_PRODUCTS) {
  const existing = db.products.find(item => item.id === p.id);
  if (existing) {
    existing.price = p.price;
  } else {
    db.products.push(p);
  }
}
for (const p of db.products) {
  if (!p.features) p.features = [];
  // Keep installation guides separate from bot/template purchases.
  if (p.category !== '가이드') p.features = p.features.filter(f => !/설치[·ㆍ]?세팅 가이드|설치.*가이드/i.test(String(f)));
}

// VEOX 3.3 permanent add-ons: focused seller-operation upgrades, one-time purchase.
const VEOX_33_PRODUCTS = [
  { id:'vexo-customer-management', name:'VEOX 고객관리 확장팩', category:'봇 옵션', price:19900, badge:'CRM', description:'구매자·주문·후속 응대를 더 편하게 관리하기 위한 영구 고객관리 확장팩입니다.', features:['구매자별 주문 이력 확인','고객 메모/응대 정보 정리','주문 상태별 고객 검색 보조','재구매 고객 확인 보조','1회 구매 후 영구 적용'] },
  { id:'vexo-backup-restore', name:'VEOX 백업·복구 강화팩', category:'봇 옵션', price:12900, badge:'BACKUP', description:'판매 데이터와 운영 기록을 더 안전하게 보관하고 복구하기 위한 영구 백업 강화팩입니다.', features:['주기적 데이터 백업 강화','백업 파일 보존 관리','복구 절차 안내','운영 기록 보호 보조','1회 구매 후 영구 적용'] },
];
const existing33 = new Set(db.products.map(p => p.id));
for (const p of VEOX_33_PRODUCTS) {
  if (!existing33.has(p.id)) db.products.push(p);
}

// VEOX 3.5 permanent store-operation products. These are one-time add-ons.
const VEOX_35_PRODUCTS = [
  { id:'vexo-coupon-promo', name:'VEOX 쿠폰 & 프로모션 팩', category:'봇 옵션', price:14900, badge:'COUPON', description:'할인 코드와 프로모션 운영을 편하게 만드는 영구 상점 운영 확장팩입니다.', features:['퍼센트/정액 쿠폰 운영','사용기간·사용횟수 제한','최소주문금액 설정','관리자 쿠폰 발급·회수','1회 구매 후 영구 적용'] },
  { id:'vexo-sales-analytics', name:'VEOX 주문·매출 분석팩', category:'봇 옵션', price:19900, badge:'ANALYTICS', description:'주문·매출·상품 판매 흐름을 한눈에 볼 수 있도록 운영 통계를 확장하는 영구 옵션입니다.', features:['일/월 매출 분석','완료 주문 통계','상품별 판매량','평균 객단가','1회 구매 후 영구 적용'] },
  { id:'vexo-advanced-ticket', name:'VEOX 고급 티켓팩', category:'봇 옵션', price:19900, badge:'TICKET PRO', description:'주문 티켓을 더 깔끔하고 빠르게 운영할 수 있도록 고급 티켓 UI와 처리 흐름을 추가하는 영구 옵션입니다.', features:['고급 주문 요약 카드','처리 상태 타임라인','담당자/상태 표시','처리 버튼 정리','완료 화면 강화','1회 구매 후 영구 적용'] }
];
const existing35 = new Set(db.products.map(p => p.id));
for (const product of VEOX_35_PRODUCTS) {
  const existing = db.products.find(item => item.id === product.id);
  if (existing) existing.price = product.price;
  else if (!existing35.has(product.id)) db.products.push(product);
}
await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');

// Optional first-admin bootstrap. Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD
// once on the server; the account is created only when no admin currently exists.
if (!db.users.some(u => u.role === 'admin')) {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const username = String(process.env.ADMIN_USERNAME).trim();
    const email = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD);
    const credErr = validateCredentials(username, email, password);
    if (credErr) {
      console.log(`[VEOX] admin bootstrap skipped: ${credErr}`);
    } else {
      const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email);
      if (!exists) {
        db.users.push({ id: nanoid(), username, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', createdAt: new Date().toISOString() });
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        console.log(`[VEOX] admin account created: ${username}`);
      } else {
        // Promote existing matching user to admin on first bootstrap
        const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email);
        if (user && user.role !== 'admin') {
          user.role = 'admin';
          user.passwordHash = await bcrypt.hash(password, 12);
          await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
          console.log(`[VEOX] existing user promoted to admin: ${username}`);
        }
      }
    }
  } else {
    console.log('[VEOX] No admin account. Set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD once then restart to create admin.');
  }
}

let saveTimer = null;
let saving = Promise.resolve();
function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saving = saving.then(() => fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8')).catch(console.error);
  }, 75);
}

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const online = new Map(); // key -> timestamp; one key per browser session
setInterval(() => {
  const cutoff = Date.now() - 45_000;
  for (const [key, ts] of online) if (ts < cutoff) online.delete(key);
}, 10_000).unref();

function makeToken(userId, role) {
  return jwt.sign({ sub: userId, role }, SESSION_SECRET, { expiresIn: '30d' });
}
function getUser(req) {
  const token = req.cookies.vexo_session;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    return db.users.find(u => u.id === payload.sub) || null;
  } catch { return null; }
}
function safeUser(user) {
  if (!user) return null;
  return { id: user.id, username: user.username, email: user.email, role: user.role, createdAt: user.createdAt };
}
function requireAuth(req, res, next) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
  req.user = user;
  next();
}
function requireAdmin(req, res, next) {
  const user = getUser(req);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
  req.user = user;
  next();
}
function siteSettingsFor(req) {
  const settings = { ...db.settings };
  const user = getUser(req);
  if (!user || user.role !== 'admin') delete settings.webhookUrl;
  return settings;
}
function getWebhookUrl() {
  return String(db.settings.webhookUrl || process.env.DISCORD_WEBHOOK_URL || '').trim();
}
function normalizeFeatures(value) {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean).slice(0, 12);
  return String(value || '').split(/\r?\n|,/).map(v => v.trim()).filter(Boolean).slice(0, 12);
}
function validateCredentials(username, email, password) {
  if (!/^[a-zA-Z0-9_가-힣]{2,20}$/.test(username)) return '아이디는 2~20자의 한글/영문/숫자/_만 사용할 수 있습니다.';
  if (!/^\S+@\S+\.\S+$/.test(email)) return '이메일 형식이 올바르지 않습니다.';
  if (typeof password !== 'string' || password.length < 6 || password.length > 72) return '비밀번호는 6~72자로 입력해 주세요.';
  return null;
}

app.get('/api/site', (req, res) => {
  res.json({ settings: siteSettingsFor(req), online: online.size });
});

app.post('/api/heartbeat', (req, res) => {
  const visitor = req.cookies.vexo_visitor || nanoid(18);
  res.cookie('vexo_visitor', visitor, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 365 });
  online.set(visitor, Date.now());
  res.json({ online: online.size });
});

app.get('/api/revenue-ladder', (req, res) => {
  const names = [
    'VEOX 티켓 자동화 확장팩',
    'VEOX 결제 자동화 확장팩',
    'VEOX 운영 자동화 확장팩',
    'VEOX 보안 강화팩',
    'VEOX 통계 대시보드팩',
    'VEOX 간단 커스텀 옵션',
    'VEOX 중급 커스텀 옵션',
    'VEOX 대형 커스텀 옵션',
    'VEOX 메이저 버전 업그레이드',
    'VEOX SELLER PACK',
    'VEOX SELLER PRO',
    'VEOX 화이트라벨 패키지',
    'VEOX GROWTH BUNDLE',
    'VEOX DESIGN BUNDLE',
    'VEOX 고객관리 확장팩',
    'VEOX 백업·복구 강화팩',
    'VEOX 쿠폰 & 프로모션 팩',
    'VEOX 주문·매출 분석팩',
    'VEOX 고급 티켓팩'
  ];
  res.json({ products: names.map(name => db.products.find(p => p.name === name)).filter(Boolean) });
});

app.get('/api/bot-series', (req, res) => {
  const items = VEOX_BOT_SERIES.map(series => ({
    ...series,
    product: series.productName ? db.products.find(p => p.name === series.productName) || null : null
  }));
  res.json({ series: items });
});

app.get('/api/products', (req, res) => {
  const category = String(req.query.category || 'all');
  const products = category === 'all' ? db.products : db.products.filter(p => p.category === category);
  res.json({ products });
});

app.get('/api/me', (req, res) => res.json({ user: safeUser(getUser(req)) }));

app.post('/api/auth/register', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const err = validateCredentials(username, email, password);
  if (err) return res.status(400).json({ error: err });
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
  // Public signup can never create an admin account.
  const user = { id: nanoid(16), username, email, passwordHash: await bcrypt.hash(password, 12), role: 'user', createdAt: new Date().toISOString() };
  db.users.push(user);
  saveDb();
  res.cookie('vexo_session', makeToken(user.id, user.role), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.status(201).json({ user: safeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const password = String(req.body.password || '');
  const user = db.users.find(u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: '아이디(또는 이메일)와 비밀번호를 확인해 주세요.' });
  res.cookie('vexo_session', makeToken(user.id, user.role), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.json({ user: safeUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('vexo_session');
  res.json({ ok: true });
});

function normalizeCouponCode(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, '').slice(0, 32);
}
function isCouponActive(coupon) {
  if (!coupon) return false;
  if (coupon.disabledAt || coupon.usedOrderId) return false;
  if (coupon.expiresAt && Date.parse(coupon.expiresAt) <= Date.now()) return false;
  const limit = Number(coupon.usageLimit || 0);
  if (limit > 0 && Number(coupon.usedCount || 0) >= limit) return false;
  return true;
}
function findCouponForUser(code, userId) {
  const normalized = normalizeCouponCode(code);
  if (!normalized) return null;
  return db.coupons.find(c => normalizeCouponCode(c.code) === normalized && (!c.ownerId || c.ownerId === userId) && isCouponActive(c)) || null;
}

app.get('/api/me/benefits', requireAuth, (req, res) => {
  const now = Date.now();
  const coupons = db.coupons.filter(c => (!c.ownerId || c.ownerId === req.user.id) && !c.disabledAt && (!c.expiresAt || Date.parse(c.expiresAt) > now) && (!c.usageLimit || Number(c.usedCount || 0) < Number(c.usageLimit))).map(c => ({
    id:c.id, code:c.code, label:c.label || (c.type === 'fixed' ? `${Number(c.value||0).toLocaleString('ko-KR')}원 할인` : `${Number(c.value||0)}% 할인`), type:c.type, value:Number(c.value||0), maxDiscount:Number(c.maxDiscount||0), minOrder:Number(c.minOrder||0), expiresAt:c.expiresAt || null, global:!c.ownerId
  }));
  res.json({ coupons });
});

app.post('/api/coupons/validate', requireAuth, (req, res) => {
  const product = db.products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).json({ error:'상품을 찾을 수 없습니다.' });
  const quantity = Math.max(1, Math.min(20, Number.parseInt(req.body.quantity || 1, 10)));
  const coupon = findCouponForUser(req.body.couponCode, req.user.id);
  if (!coupon) return res.status(400).json({ error:'사용 가능한 쿠폰을 찾지 못했습니다.' });
  const subtotal = Number(product.price) * quantity;
  const discount = coupon.ownerId && coupon.ownerId !== req.user.id ? 0 : (Number(coupon.minOrder || 0) > subtotal ? 0 : Math.max(0, Math.min(subtotal, coupon.type === 'fixed' ? Number(coupon.value||0) : Math.floor(subtotal * (Number(coupon.value||0)/100)) > 0 ? Math.floor(subtotal * (Number(coupon.value||0)/100)) : 0)));
  const capped = Math.min(discount, Number(coupon.maxDiscount || discount));
  if (capped <= 0) return res.status(400).json({ error: `이 쿠폰은 ${Number(coupon.minOrder||0).toLocaleString('ko-KR')}원 이상 주문에 사용할 수 있습니다.` });
  res.json({ ok:true, coupon:{ code:coupon.code, label:coupon.label || '', discount:capped, finalTotal:Math.max(0, subtotal-capped) } });
});

app.post('/api/orders', requireAuth, async (req, res) => {
  const product = db.products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  const quantity = Number.parseInt(req.body.quantity || 1, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ error: '수량은 1~20개 사이로 입력해 주세요.' });
  const activeOrder = db.orders.find(o => { normalizeOrder(o); return String(o.userId) === String(req.user.id) && ORDER_ACTIVE_STATUSES.has(o.status); });
  if (activeOrder) return res.status(409).json({ error: `이미 진행 중인 주문이 있습니다. 주문번호: ${activeOrder.id}` });
  const discordTag = String(req.body.discordTag || '').trim().slice(0, 60);
  const payerName = String(req.body.payerName || '').trim().slice(0, 40);
  const memo = String(req.body.memo || '').trim().slice(0, 500);
  if (!discordTag) return res.status(400).json({ error: '디스코드 닉네임 또는 아이디를 입력해 주세요.' });
  if (!payerName) return res.status(400).json({ error: '입금자명을 입력해 주세요.' });
  if (payerName.length < 2) return res.status(400).json({ error: '입금자명은 2자 이상 입력해 주세요.' });
  const invite = String(db.settings.discordInvite || process.env.DISCORD_INVITE_URL || '').trim();
  const subtotal = Number(product.price) * quantity;
  const coupon = findCouponForUser(req.body.couponCode, req.user.id);
  let discountAmount = 0;
  if (coupon) {
    if (Number(coupon.minOrder || 0) > subtotal) return res.status(400).json({ error: `이 쿠폰은 ${Number(coupon.minOrder||0).toLocaleString('ko-KR')}원 이상 주문에 사용할 수 있습니다.` });
    discountAmount = coupon.type === 'fixed' ? Number(coupon.value || 0) : Math.floor(subtotal * (Number(coupon.value || 0) / 100));
    if (Number(coupon.maxDiscount || 0) > 0) discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));
  }
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const order = {
    id: 'VX-' + nanoid(9).toUpperCase(),
    userId: req.user.id,
    username: req.user.username,
    email: req.user.email,
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    subtotal,
    discountAmount,
    couponCode: coupon?.code || '',
    total: finalTotal,
    status: '주문접수',
    paymentRequested: false,
    deliveryLink: invite,
    discordTag,
    payerName,
    memo,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  db.orders.unshift(order);
  if (coupon) {
    coupon.usedCount = Number(coupon.usedCount || 0) + 1;
    coupon.lastUsedAt = new Date().toISOString();
    coupon.lastUsedBy = req.user.id;
    if (coupon.ownerId || coupon.singleUse) {
      coupon.usedOrderId = order.id;
      coupon.usedAt = new Date().toISOString();
    }
  }
  saveDb();
  await sendDiscordOrderNotice(order).catch(() => {});
  res.status(201).json({ order, discordInvite: invite, bankInfo: db.settings.bankInfo || '' });
});

function won(n) { return `${Number(n || 0).toLocaleString('ko-KR')}원`; }

// Shared embed builder for every webhook notice, so order/payment/completion
// alerts all look like one consistent VEOXHUB notification feed in Discord.
function buildOrderEmbed(order, { emoji, title, color, extraFields = [], footer } = {}) {
  const fields = [
    { name: '🧾 주문번호', value: `\`${order.id}\``, inline: true },
    { name: '👤 구매자', value: order.username || '-', inline: true },
    { name: '💬 디스코드', value: order.discordTag || '-', inline: true },
    { name: '📦 상품', value: `${order.productName} × ${order.quantity}`, inline: false },
    { name: '💰 결제 금액', value: `**${won(order.total)}**`, inline: true },
  ];
  if (order.discountAmount) fields.push({ name: '🏷️ 쿠폰 할인', value: `-${won(order.discountAmount)}`, inline: true });
  if (order.payerName) fields.push({ name: '🏦 입금자명', value: order.payerName, inline: true });
  if (order.memo) fields.push({ name: '📝 요청사항', value: order.memo.slice(0, 500), inline: false });
  fields.push(...extraFields);
  return {
    username: 'VEOXHUB 알림',
    embeds: [{
      title: `${emoji} ${title}`,
      color,
      fields,
      footer: { text: footer || 'VEOXHUB · 웹사이트 자동 알림' },
      timestamp: new Date().toISOString(),
    }],
  };
}

async function postWebhook(payload) {
  const url = getWebhookUrl();
  if (!url) return;
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
}

async function sendDiscordOrderNotice(order) {
  await postWebhook(buildOrderEmbed(order, {
    emoji: '🛒',
    title: '새 주문이 접수되었습니다',
    color: 0x8b5cf6,
    footer: '구매자가 입금 후 확인 요청을 보내면 다시 알려드려요.',
  }));
}

const ORDER_ACTIVE_STATUSES = new Set(['주문접수','입금확인요청','처리중']);
const ORDER_TERMINAL_STATUSES = new Set(['지급완료','취소']);
const ORDER_TRANSITIONS = {
  '주문접수': new Set(['입금확인요청','취소']),
  '입금확인요청': new Set(['처리중','취소']),
  '처리중': new Set(['지급완료','취소']),
  '지급완료': new Set(),
  '취소': new Set()
};

function normalizeOrder(order) {
  if (!Array.isArray(order.messages)) order.messages = [];
  const legacy = { '접수':'주문접수', '입금확인완료':'처리중', '완료':'지급완료', '마감':'취소' };
  order.status = legacy[String(order.status || '')] || String(order.status || '주문접수');
  if (!ORDER_ACTIVE_STATUSES.has(order.status) && !ORDER_TERMINAL_STATUSES.has(order.status)) order.status = '주문접수';
  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
  if (!order.updatedAt) order.updatedAt = order.createdAt || new Date().toISOString();
  return order;
}

function appendSystemMessage(order, text, now = new Date().toISOString()) {
  const message = { id:'SYS-' + nanoid(10).toUpperCase(), senderId:'system', senderName:'VEOXHUB', senderRole:'system', text, attachment:null, createdAt:now };
  order.messages.push(message);
  return message;
}

function transitionOrder(order, target, actorId, actorName = 'VEOXHUB') {
  normalizeOrder(order);
  const current = order.status;
  const allowed = ORDER_TRANSITIONS[current] || new Set();
  if (!allowed.has(target)) return { ok:false, error:`현재 상태 \`${current}\`에서는 \`${target}\`로 변경할 수 없습니다.` };
  const now = new Date().toISOString();
  order.status = target;
  order.updatedAt = now;
  order.statusHistory.push({ from:current, to:target, actorId, actorName, createdAt:now });
  if (target === '입금확인요청') order.paymentRequested = true;
  if (target === '처리중') { order.paymentApprovedAt = now; order.processedAt = now; }
  if (target === '지급완료') { order.completedAt = now; order.purchaseLogCreatedAt = now; }
  if (target === '취소') order.cancelledAt = now;
  return { ok:true, now, current };
}

function createPurchaseLog(order) {
  if (order.status !== '지급완료') return null;
  if (db.purchaseLogs.some(log => String(log.orderId) === String(order.id))) return null;
  const log = {
    id:'PL-' + nanoid(12).toUpperCase(), orderId:order.id, userId:order.userId,
    username:order.username, email:order.email, productId:order.productId,
    productName:order.productName, quantity:order.quantity, total:order.total,
    createdAt:new Date().toISOString()
  };
  db.purchaseLogs.unshift(log);
  return log;
}

function orderAccess(req) {
  const id = String(req.params.id || '');
  const order = db.orders.find(o => o.id === id);
  if (!order) return { order: null, allowed: false };
  normalizeOrder(order);
  return { order, allowed: req.user?.role === 'admin' || order.userId === req.user?.id };
}

function cleanFileName(name) {
  const clean = path.basename(String(name || 'attachment')).replace(/[^a-zA-Z0-9._()\-가-힣 ]/g, '_').trim();
  return (clean || 'attachment').slice(0, 120);
}

const MAX_ATTACHMENT_BYTES = 7 * 1024 * 1024;
const ATTACHMENT_DIR = path.join(DATA_DIR, 'uploads');
await fs.mkdir(ATTACHMENT_DIR, { recursive: true });
const INLINE_IMAGE_TYPES = new Set(['image/jpeg','image/png','image/gif','image/webp']);

async function saveAttachment(input) {
  if (!input || typeof input !== 'object') return null;
  const raw = String(input.dataBase64 || '');
  if (!raw) return null;
  const comma = raw.indexOf(',');
  const b64 = comma >= 0 ? raw.slice(comma + 1) : raw;
  let buffer;
  try { buffer = Buffer.from(b64, 'base64'); } catch { throw new Error('첨부 파일을 읽지 못했습니다.'); }
  if (!buffer.length) throw new Error('빈 파일은 첨부할 수 없습니다.');
  if (buffer.length > MAX_ATTACHMENT_BYTES) throw new Error('파일은 7MB 이하만 첨부할 수 있습니다.');
  const id = 'att_' + crypto.randomBytes(12).toString('hex');
  const name = cleanFileName(input.name);
  const ext = path.extname(name).slice(0, 10);
  const storedName = id + (ext || '');
  await fs.writeFile(path.join(ATTACHMENT_DIR, storedName), buffer);
  return { id, name, mime: String(input.mime || 'application/octet-stream').slice(0, 120), size: buffer.length, storedName };
}

app.post('/api/orders/:id/payment-request', requireAuth, async (req, res) => {
  const { order, allowed } = orderAccess(req);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  if (!allowed || req.user.role === 'admin') return res.status(403).json({ error: '구매자만 입금 확인 요청을 할 수 있습니다.' });
  if (order.status === '입금확인요청' && order.paymentRequested) return res.json({ order, alreadyRequested: true });
  const result = transitionOrder(order, '입금확인요청', req.user.id, req.user.username);
  if (!result.ok) return res.status(400).json({ error: result.error });
  appendSystemMessage(order, '💳 구매자가 입금 확인을 요청했습니다. 관리자 확인을 기다려 주세요.', result.now);
  saveDb();
  await sendDiscordPaymentNotice(order).catch(() => {});
  res.json({ order });
});

app.get('/api/orders/:id/room', requireAuth, (req, res) => {
  const { order, allowed } = orderAccess(req);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  if (!allowed) return res.status(403).json({ error: '이 주문실을 볼 권한이 없습니다.' });
  res.json({ order });
});

app.post('/api/orders/:id/messages', requireAuth, async (req, res) => {
  const { order, allowed } = orderAccess(req);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  if (!allowed) return res.status(403).json({ error: '이 주문실에 메시지를 보낼 권한이 없습니다.' });
  if (order.status === '취소') return res.status(400).json({ error: '취소된 주문에는 메시지를 보낼 수 없습니다.' });
  const text = String(req.body.text || '').trim().slice(0, 2000);
  let attachment = null;
  try { attachment = await saveAttachment(req.body.attachment); } catch (e) { return res.status(400).json({ error: e.message || '첨부 파일을 저장하지 못했습니다.' }); }
  if (!text && !attachment) return res.status(400).json({ error: '메시지 또는 파일을 입력해 주세요.' });
  const now = new Date().toISOString();
  const message = { id:'MSG-' + nanoid(10).toUpperCase(), senderId:req.user.id, senderName:req.user.username, senderRole:req.user.role, text, attachment, createdAt:now };
  order.messages.push(message);
  order.updatedAt = now;
  saveDb();
  res.status(201).json({ message, order });
});

app.get('/api/attachments/:id', requireAuth, async (req, res) => {
  const id = String(req.params.id || '');
  let parent = db.orders.find(o => Array.isArray(o.messages) && o.messages.some(m => m.attachment?.id === id));
  let parentType = 'order';
  if (!parent) {
    parent = db.inquiries.find(i => Array.isArray(i.messages) && i.messages.some(m => m.attachment?.id === id));
    parentType = 'inquiry';
  }
  if (!parent) return res.status(404).send('첨부 파일을 찾을 수 없습니다.');
  if (req.user.role !== 'admin' && parent.userId !== req.user.id) return res.status(403).send('권한이 없습니다.');
  const message = parent.messages.find(m => m.attachment?.id === id);
  const file = message?.attachment;
  if (!file?.storedName) return res.status(404).send('첨부 파일을 찾을 수 없습니다.');
  const filePath = path.join(ATTACHMENT_DIR, file.storedName);
  try {
    await fs.access(filePath);
    res.setHeader('Content-Type', file.mime || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    const disposition = INLINE_IMAGE_TYPES.has(file.mime) ? 'inline' : 'attachment';
    res.setHeader('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(file.name || 'attachment')}`);
    res.sendFile(filePath);
  } catch { res.status(404).send('첨부 파일이 없습니다.'); }
});

async function sendDiscordPaymentNotice(order) {
  // Amber + a direct "action needed" cue: this is the notice that should make the seller
  // stop what they're doing and check the bank app, since it's the moment buyers churn on.
  await postWebhook(buildOrderEmbed(order, {
    emoji: '💳',
    title: '입금 확인 요청이 도착했습니다',
    color: 0xf59e0b,
    extraFields: [{ name: '⏳ 처리 안내', value: '웹 관리자 페이지에서 입금 확인 후 **구매확정** 처리해 주세요.', inline: false }],
    footer: '빠른 확인일수록 구매 취소율이 낮아져요.',
  }));
}

async function sendDiscordCompletionNotice(order) {
  // Fires when an order reaches 지급완료, so completed sales show up in the same
  // Discord feed in real time — handy for tracking progress toward a revenue goal.
  await postWebhook(buildOrderEmbed(order, {
    emoji: '✅',
    title: '지급 완료 · 매출이 확정되었습니다',
    color: 0x22c55e,
    footer: 'VEOXHUB · 지급완료 매출은 관리자 대시보드 통계에도 반영됩니다.',
  }));
}

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ orders });
});

app.get('/api/inquiries', requireAuth, (req, res) => {
  const inquiries = db.inquiries.filter(i => req.user.role === 'admin' || i.userId === req.user.id);
  res.json({ inquiries });
});

app.get('/api/inquiries/:id', requireAuth, (req, res) => {
  const inquiry = db.inquiries.find(i => i.id === req.params.id);
  if (!inquiry) return res.status(404).json({ error: '문의 내용을 찾을 수 없습니다.' });
  if (req.user.role !== 'admin' && inquiry.userId !== req.user.id) return res.status(403).json({ error: '이 문의를 볼 권한이 없습니다.' });
  res.json({ inquiry });
});

app.post('/api/inquiries', requireAuth, async (req, res) => {
  const subject = String(req.body.subject || '').trim().slice(0, 120);
  const category = String(req.body.category || '일반 문의').trim().slice(0, 40);
  const text = String(req.body.text || '').trim().slice(0, 2000);
  if (!subject || subject.length < 2) return res.status(400).json({ error: '문의 제목을 입력해 주세요.' });
  if (!text) return res.status(400).json({ error: '문의 내용을 입력해 주세요.' });
  const now = new Date().toISOString();
  const inquiry = {
    id:'INQ-' + nanoid(9).toUpperCase(),
    userId:req.user.id,
    username:req.user.username,
    email:req.user.email,
    category,
    subject,
    status:'답변대기',
    createdAt:now,
    updatedAt:now,
    messages:[{ id:'MSG-' + nanoid(10).toUpperCase(), senderId:req.user.id, senderName:req.user.username, senderRole:'user', text, attachment:null, createdAt:now }]
  };
  db.inquiries.unshift(inquiry);
  saveDb();
  res.status(201).json({ inquiry });
});

app.post('/api/inquiries/:id/messages', requireAuth, async (req, res) => {
  const inquiry = db.inquiries.find(i => i.id === req.params.id);
  if (!inquiry) return res.status(404).json({ error: '문의 내용을 찾을 수 없습니다.' });
  if (req.user.role !== 'admin' && inquiry.userId !== req.user.id) return res.status(403).json({ error: '이 문의에 메시지를 보낼 권한이 없습니다.' });
  if (inquiry.status === '종료') return res.status(400).json({ error: '종료된 문의입니다.' });
  const text = String(req.body.text || '').trim().slice(0, 2000);
  let attachment = null;
  try { attachment = await saveAttachment(req.body.attachment); } catch (e) { return res.status(400).json({ error: e.message || '첨부 파일을 저장하지 못했습니다.' }); }
  if (!text && !attachment) return res.status(400).json({ error: '메시지 또는 파일을 입력해 주세요.' });
  const now = new Date().toISOString();
  inquiry.messages.push({ id:'MSG-' + nanoid(10).toUpperCase(), senderId:req.user.id, senderName:req.user.username, senderRole:req.user.role, text, attachment, createdAt:now });
  inquiry.updatedAt = now;
  inquiry.status = req.user.role === 'admin' ? '답변완료' : '답변대기';
  saveDb();
  res.status(201).json({ inquiry });
});

app.patch('/api/inquiries/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error:'관리자 권한이 필요합니다.' });
  const inquiry = db.inquiries.find(i => i.id === req.params.id);
  if (!inquiry) return res.status(404).json({ error:'문의 내용을 찾을 수 없습니다.' });
  const status = String(req.body.status || '').trim();
  if (!['답변대기','답변완료','종료'].includes(status)) return res.status(400).json({ error:'문의 상태가 올바르지 않습니다.' });
  inquiry.status = status;
  inquiry.updatedAt = new Date().toISOString();
  saveDb();
  res.json({ inquiry });
});

app.get('/api/announcements', (req, res) => res.json({ announcements: db.announcements.slice(0, 12) }));

app.get('/api/admin/announcements', requireAdmin, (req, res) => res.json({ announcements: db.announcements }));
app.post('/api/admin/announcements', requireAdmin, (req, res) => {
  const title = String(req.body.title || '').trim().slice(0, 120);
  const text = String(req.body.text || '').trim().slice(0, 1200);
  if (!title || !text) return res.status(400).json({ error:'공지 제목과 내용을 입력해 주세요.' });
  const announcement = { id:'ANN-' + nanoid(9).toUpperCase(), title, text, createdAt:new Date().toISOString(), authorId:req.user.id, authorName:req.user.username };
  db.announcements.unshift(announcement);
  db.announcements = db.announcements.slice(0, 50);
  saveDb();
  res.status(201).json({ announcement });
});

app.delete('/api/admin/announcements/:id', requireAdmin, (req, res) => {
  db.announcements = db.announcements.filter(a => a.id !== req.params.id);
  saveDb();
  res.json({ ok:true });
});


app.get('/api/admin/notifications', requireAdmin, (req, res) => {
  const cutoff = Date.now() - (1000 * 60 * 60 * 24 * 7);
  const orders = db.orders
    .filter(o => Date.parse(o.createdAt || 0) >= cutoff && !['지급완료','취소'].includes(String(o.status || '')))
    .slice(0, 20)
    .map(o => ({ type:'order', id:o.id, title:'새 주문 또는 진행중 주문', text:`${o.username || '-'} · ${o.productName || '-'} · ${Number(o.total||0).toLocaleString('ko-KR')}원`, createdAt:o.createdAt, target:o.id }));
  const inquiries = db.inquiries
    .filter(i => Date.parse(i.updatedAt || i.createdAt || 0) >= cutoff && String(i.status || '') !== '종료')
    .slice(0, 20)
    .map(i => ({ type:'inquiry', id:i.id, title:'고객 문의', text:`${i.username || '-'} · ${i.subject || '문의'}`, createdAt:i.updatedAt || i.createdAt, target:i.id }));
  const items = [...orders, ...inquiries].sort((a,b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30);
  res.json({ notifications: items, count: items.length });
});

app.get('/api/admin/summary', requireAdmin, (req, res) => {
  const paidOrders = db.orders.filter(o => o.status === '지급완료');
  const revenue = paidOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const targetMonth = String(db.settings.targetMonth || '').trim();
  const monthOrders = targetMonth ? paidOrders.filter(o => String(o.createdAt || '').startsWith(targetMonth)) : paidOrders;
  const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);
  const goalAmount = Math.max(0, Number(db.settings.goalAmount || 0));
  const averageOrderValue = paidOrders.length ? Math.round(revenue / paidOrders.length) : 0;
  res.json({
    users: db.users.filter(u => u.role !== 'admin').length,
    products: db.products.length,
    orders: db.orders.length,
    revenue,
    monthRevenue,
    goalAmount,
    targetMonth,
    remainingGoal: Math.max(0, goalAmount - monthRevenue),
    goalProgress: goalAmount ? Math.min(100, Math.round((monthRevenue / goalAmount) * 100)) : 0,
    averageOrderValue,
    online: online.size,
    admin: safeUser(req.user)
  });
});

app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  const completed = db.orders.filter(o => o.status === '지급완료');
  const now = new Date();
  const day = now.toISOString().slice(0,10);
  const month = now.toISOString().slice(0,7);
  const todayOrders = completed.filter(o => String(o.completedAt || o.createdAt || '').startsWith(day));
  const monthOrders = completed.filter(o => String(o.completedAt || o.createdAt || '').startsWith(month));
  const byProduct = new Map();
  for (const o of completed) {
    const key = String(o.productName || '상품 없음');
    const row = byProduct.get(key) || { name:key, units:0, revenue:0 };
    row.units += Number(o.quantity || 0);
    row.revenue += Number(o.total || 0);
    byProduct.set(key, row);
  }
  const topProducts = [...byProduct.values()].sort((a,b)=>b.revenue-a.revenue).slice(0,8);
  const sum = arr => arr.reduce((n,o)=>n+Number(o.total||0),0);
  res.json({ todayRevenue:sum(todayOrders), monthRevenue:sum(monthOrders), todayOrders:todayOrders.length, monthOrders:monthOrders.length, topProducts });
});

app.get('/api/admin/coupons', requireAdmin, (req, res) => {
  res.json({ coupons: db.coupons });
});
app.post('/api/admin/coupons', requireAdmin, (req, res) => {
  const code = normalizeCouponCode(req.body.code);
  const type = String(req.body.type || 'percent') === 'fixed' ? 'fixed' : 'percent';
  const value = Number(req.body.value);
  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !Number.isFinite(value) || value <= 0) return res.status(400).json({ error:'쿠폰 코드/할인값을 확인해 주세요.' });
  if (db.coupons.some(c => normalizeCouponCode(c.code) === code)) return res.status(409).json({ error:'이미 존재하는 쿠폰 코드입니다.' });
  if (type === 'percent' && value > 100) return res.status(400).json({ error:'퍼센트 할인은 100 이하로 입력해 주세요.' });
  const coupon = { id:nanoid(12), code, label:String(req.body.label||'').trim().slice(0,60), type, value:Math.round(value), maxDiscount:Math.max(0,Math.round(Number(req.body.maxDiscount||0))), minOrder:Math.max(0,Math.round(Number(req.body.minOrder||0))), expiresAt:req.body.expiresAt ? new Date(req.body.expiresAt).toISOString() : null, usageLimit:Math.max(0,Math.round(Number(req.body.usageLimit||0))), usedCount:0, ownerId:String(req.body.ownerId||'').trim() || null, singleUse:Boolean(req.body.singleUse), createdAt:new Date().toISOString() };
  db.coupons.unshift(coupon); saveDb(); res.status(201).json({ coupon });
});
app.delete('/api/admin/coupons/:id', requireAdmin, (req, res) => { db.coupons = db.coupons.filter(c => c.id !== req.params.id); saveDb(); res.json({ ok:true }); });

app.get('/api/admin/orders', requireAdmin, (req, res) => res.json({ orders: db.orders }));
app.get('/api/admin/users', requireAdmin, (req, res) => res.json({ users: db.users.map(safeUser) }));
app.get('/api/admin/customers', requireAdmin, (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  const map = new Map();
  for (const order of db.orders) {
    const key = String(order.userId || '');
    if (!key) continue;
    const current = map.get(key) || { userId:key, username:order.username || '-', email:order.email || '-', discordTag:order.discordTag || '-', orders:0, completed:0, totalSpent:0, lastOrderAt:order.createdAt || '' };
    current.orders += 1;
    if (order.status === '지급완료') { current.completed += 1; current.totalSpent += Number(order.total || 0); }
    if (String(order.createdAt || '') > String(current.lastOrderAt || '')) current.lastOrderAt = order.createdAt || '';
    if (order.discordTag) current.discordTag = order.discordTag;
    map.set(key, current);
  }
  let customers = [...map.values()];
  if (q) customers = customers.filter(c => [c.username,c.email,c.discordTag,c.userId].some(v => String(v || '').toLowerCase().includes(q)));
  customers.sort((a,b) => String(b.lastOrderAt).localeCompare(String(a.lastOrderAt)));
  res.json({ customers });
});
app.get('/api/admin/orders.csv', requireAdmin, (req, res) => {
  const escCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [
    ['주문번호','회원','이메일','디스코드','입금자명','상품','수량','금액','상태','요청사항','주문일'],
    ...db.orders.map(o => [o.id, o.username, o.email, o.discordTag || '', o.payerName || '', o.productName, o.quantity, o.total, o.status, o.memo || '', o.createdAt])
  ];
  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment('vexo-orders.csv');
  res.send('\uFEFF' + rows.map(row => row.map(escCsv).join(',')).join('\n'));
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const { name, category, price, badge, description } = req.body;
  const numericPrice = Number(price);
  if (!name || !category || !Number.isFinite(numericPrice) || numericPrice < 0) return res.status(400).json({ error: '상품 정보를 확인해 주세요.' });
  const product = {
    id: nanoid(16),
    name: String(name).trim(),
    category: String(category).trim(),
    price: Math.round(numericPrice),
    badge: String(badge || '').trim(),
    description: String(description || '').trim(),
    features: normalizeFeatures(req.body.features)
  };
  db.products.unshift(product);
  saveDb();
  res.status(201).json({ product });
});

app.patch('/api/admin/products/:id', requireAdmin, (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  for (const k of ['name','category','badge','description']) if (req.body[k] !== undefined) product[k] = String(req.body[k]);
  if (req.body.price !== undefined) {
    const price = Number(req.body.price);
    if (!Number.isFinite(price) || price < 0) return res.status(400).json({ error: '가격을 확인해 주세요.' });
    product.price = Math.round(price);
  }
  if (req.body.features !== undefined) product.features = normalizeFeatures(req.body.features);

  saveDb();
  res.json({ product });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  db.products = db.products.filter(p => p.id !== req.params.id);
  saveDb();
  res.json({ ok: true });
});

app.patch('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  normalizeOrder(order);
  const status = String(req.body.status || '');
  if (![...ORDER_ACTIVE_STATUSES, ...ORDER_TERMINAL_STATUSES].includes(status)) return res.status(400).json({ error: '상태값이 올바르지 않습니다.' });
  const result = transitionOrder(order, status, req.user.id, req.user.username);
  if (!result.ok) return res.status(400).json({ error: result.error });
  appendSystemMessage(order, `주문 상태가 \`${status}\`(으)로 변경되었습니다.`, result.now);
  let rewardCoupon = null;
  if (status === '지급완료') {
    // Was missing here before: the quick status-dropdown path never called issueCompletionCoupon,
    // so orders completed this way (as opposed to via /complete or /deliver) silently got no coupon.
    rewardCoupon = issueCompletionCoupon(order);
    if (rewardCoupon) { order.rewardCouponCode = rewardCoupon.code; appendSystemMessage(order, rewardCouponMessage(rewardCoupon), result.now); }
    createPurchaseLog(order);
    await sendDiscordCompletionNotice(order).catch(() => {});
  }
  saveDb();
  res.json({ order, rewardCoupon });
});

app.post('/api/admin/orders/:id/approve', requireAdmin, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  const result = transitionOrder(order, '처리중', req.user.id, req.user.username);
  if (!result.ok) return res.status(400).json({ error: result.error });
  appendSystemMessage(order, '✅ 입금이 확인되었습니다. 상품 지급을 준비해 주세요.', result.now);
  saveDb();
  res.json({ order });
});

function issueCompletionCoupon(order) {
  if (Number(order.total || 0) < 50000) return null;
  const already = db.coupons.some(c => c.sourceOrderId === order.id);
  if (already) return null;
  const coupon = {
    id:nanoid(12),
    code:'VEOX-' + nanoid(7).toUpperCase(),
    label:'구매 완료 감사 5% 할인',
    type:'percent', value:5, maxDiscount:5000, minOrder:50000,
    expiresAt:new Date(Date.now()+30*24*60*60*1000).toISOString(),
    usageLimit:1, usedCount:0, ownerId:order.userId, singleUse:true,
    sourceOrderId:order.id, createdAt:new Date().toISOString()
  };
  db.coupons.unshift(coupon);
  return coupon;
}

// Surfaces the reward coupon in the order room itself (not just the quiet "쿠폰·혜택"
// page the buyer may never open) and asks for a review in the same breath, since
// completion is the moment they're most likely to notice and act on it.
function rewardCouponMessage(coupon) {
  const expires = coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('ko-KR') : '';
  return `🎁 구매해 주셔서 감사합니다! 후기를 남겨주시면 큰 힘이 됩니다 :) 다음 구매에 바로 쓰실 수 있는 5% 할인 쿠폰도 이미 발급해 드렸어요 → 쿠폰 코드 \`${coupon.code}\`${expires ? ` (${expires}까지)` : ''} · 상단 "쿠폰·혜택" 메뉴에서도 확인하실 수 있어요.`;
}

app.post('/api/admin/orders/:id/complete', requireAdmin, async (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  const result = transitionOrder(order, '지급완료', req.user.id, req.user.username);
  if (!result.ok) return res.status(400).json({ error: result.error });
  appendSystemMessage(order, '✅ 상품 지급이 완료되었습니다. 아래 주문실의 파일·사진·링크를 확인해 주세요.', result.now);
  const rewardCoupon = issueCompletionCoupon(order);
  if (rewardCoupon) { order.rewardCouponCode = rewardCoupon.code; appendSystemMessage(order, rewardCouponMessage(rewardCoupon), result.now); }
  createPurchaseLog(order);
  saveDb();
  await sendDiscordCompletionNotice(order).catch(() => {});
  res.json({ order, rewardCoupon });
});

// Fast seller workflow: send a delivery message (optionally with a link/file) and optionally complete the order.
app.post('/api/admin/orders/:id/deliver', requireAdmin, async (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  normalizeOrder(order);
  if (order.status !== '처리중') return res.status(400).json({ error: '먼저 입금 확인 요청을 처리해 `처리중`으로 변경해 주세요.' });

  const text = String(req.body.text || '').trim().slice(0, 2000);
  const link = String(req.body.link || '').trim().slice(0, 1000);
  let attachment = null;
  try { attachment = await saveAttachment(req.body.attachment); } catch (e) { return res.status(400).json({ error: e.message || '지급 파일을 저장하지 못했습니다.' }); }
  if (!text && !link && !attachment) return res.status(400).json({ error: '지급 안내, 링크 또는 파일을 입력해 주세요.' });

  const now = new Date().toISOString();
  const parts = ['📦 상품 지급 안내'];
  if (text) parts.push(text);
  if (link) parts.push(`🔗 지급 링크: ${link}`);
  const message = {
    id:'MSG-' + nanoid(10).toUpperCase(),
    senderId:req.user.id,
    senderName:req.user.username,
    senderRole:'admin',
    text:parts.join('\n'),
    attachment,
    createdAt:now
  };
  order.messages.push(message);
  order.deliveryMessageId = message.id;
  order.deliveryAt = now;
  order.updatedAt = now;

  let rewardCoupon = null;
  const shouldComplete = req.body.complete !== false;
  if (shouldComplete) {
    const result = transitionOrder(order, '지급완료', req.user.id, req.user.username);
    if (!result.ok) return res.status(400).json({ error: result.error });
    rewardCoupon = issueCompletionCoupon(order);
    if (rewardCoupon) order.rewardCouponCode = rewardCoupon.code;
    createPurchaseLog(order);
    order.messages.push({
      id:'SYS-' + nanoid(10).toUpperCase(),
      senderId:'system',
      senderName:'VEOXHUB',
      senderRole:'system',
      text:'✅ 상품 지급이 완료되었습니다.',
      attachment:null,
      createdAt:now
    });
    if (rewardCoupon) appendSystemMessage(order, rewardCouponMessage(rewardCoupon), now);
  }
  saveDb();
  if (shouldComplete) await sendDiscordCompletionNotice(order).catch(() => {});
  res.json({ order, message, rewardCoupon });
});

app.patch('/api/admin/settings' , requireAdmin, (req, res) => {
  if (req.body.siteName !== undefined) db.settings.siteName = String(req.body.siteName).slice(0, 60);
  if (req.body.notice !== undefined) db.settings.notice = String(req.body.notice).slice(0, 180);
  if (req.body.discordInvite !== undefined) db.settings.discordInvite = String(req.body.discordInvite).slice(0, 300);
  if (req.body.bankInfo !== undefined) db.settings.bankInfo = String(req.body.bankInfo).slice(0, 300);
  if (req.body.webhookUrl !== undefined) db.settings.webhookUrl = String(req.body.webhookUrl).slice(0, 500);
  if (req.body.goalAmount !== undefined) db.settings.goalAmount = Math.max(0, Math.round(Number(req.body.goalAmount || 0)));
  if (req.body.targetMonth !== undefined) db.settings.targetMonth = String(req.body.targetMonth).slice(0, 7);
  saveDb();
  res.json({ settings: siteSettingsFor(req) });
});

function fallbackSvg(res, label = 'VEOXHUB') {
  const safe = String(label).replace(/[<>&"']/g, ' ').trim().slice(0, 28) || 'VEOXHUB';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset="0.55" stop-color="#8b5cf6"/><stop offset="1" stop-color="#c084fc"/></linearGradient><radialGradient id="r" cx="70%" cy="20%"><stop offset="0" stop-color="#f5eefe" stop-opacity=".55"/><stop offset="1" stop-color="#f5eefe" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="700" fill="#160d24"/><rect width="1200" height="700" fill="url(#g)" opacity=".88"/><circle cx="920" cy="100" r="300" fill="url(#r)"/><circle cx="170" cy="580" r="240" fill="#4c1d95" opacity=".42"/><rect x="85" y="92" width="1030" height="516" rx="42" fill="#120b1b" fill-opacity=".32" stroke="#f5eefe" stroke-opacity=".2"/><text x="100" y="255" fill="#fff" font-family="Arial, sans-serif" font-size="78" font-weight="800">VEOXHUB</text><text x="104" y="325" fill="#efe4ff" font-family="Arial, sans-serif" font-size="28" font-weight="700">DISCORD SELLER AUTOMATION</text><text x="104" y="405" fill="#eadcff" font-family="Arial, sans-serif" font-size="22">${safe}</text><circle cx="1030" cy="500" r="54" fill="#fff" fill-opacity=".12"/><path d="M1005 500h50M1030 475v50" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`;
  res.type('svg').send(svg);
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use('/assets', express.static(path.join(__dirname, 'assets'), { index: false, fallthrough: true, maxAge: '1h' }));
app.get('/assets/:file', (req, res) => fallbackSvg(res, req.params.file));
app.use('/public', express.static(path.join(__dirname, 'public'), { index: false, fallthrough: true, maxAge: '1h' }));
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`VEOXHUB running on http://localhost:${PORT}`));
