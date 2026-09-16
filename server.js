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
    { id: nanoid(), name: 'VEXO 자판기봇 BASIC', tier: 'BASIC', category: '자판기봇', price: 19000, badge: '입문추천', description: '디스코드에서 바로 주문을 받을 수 있는 기본 판매 봇 구성입니다.', features: ['상품 버튼 주문 UI', '주문 접수 및 로그 기록', '관리자 확인 후 지급 안내', '기본 고객 응대 메시지', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEXO 자판기봇 PRO', tier: 'PRO', category: '자판기봇', price: 39000, badge: '인기', description: '상품 관리, 주문 흐름, 스태프 운영까지 확장한 실전 판매용 봇입니다.', features: ['BASIC 전체 기능 포함', '상품 추가·수정·삭제 관리', '주문 상태 관리 패널', '구매자 역할 부여 지원', '상세 주문 로그 채널', '스태프 권한 분리', ] },
    { id: nanoid(), name: 'VEXO 디스코드 서버 템플릿', category: '서버 템플릿', price: 19000, badge: '빠른시작', description: '판매, 문의, 티켓, 인증 채널이 정리된 바로 사용 가능한 서버 템플릿입니다.', features: ['INFORMATION / STORE / ORDER / SUPPORT / COMMUNITY 구조', 'OWNER·ADMIN·STAFF·CUSTOMER·MEMBER 역할', '공지·가격표·구매인증 채널', '문의·1대1 티켓용 채널', '관리자 전용 STAFF 카테고리', '서버 템플릿 링크 제공', '기본 세팅 가이드'] },
    { id: nanoid(), name: 'VEXO 서버 템플릿 PRO', category: '서버 템플릿', price: 34000, badge: 'BEST', description: '고급 권한, 티켓 운영, 후기 동선까지 포함한 프리미엄 서버 구조입니다.', features: ['기본 템플릿 전체 포함', '세분화된 권한 구조', '티켓 봇 연동 가이드', '주문·고객·상품 관리 채널 분리', '후기·파트너 채널 구성', '자판기봇 배치 위치 안내', '상세 세팅 설명서'] },
    { id: nanoid(), name: 'VEXO 자동화 패키지', category: '자동화', price: 49000, badge: '업무절약', description: '반복 공지, 역할, 주문 알림을 줄여 운영 시간을 아끼는 자동화 구성입니다.', features: ['환영·역할 자동 부여 지원', '반복 공지/안내 자동화', '주문 알림 연동 구성', '스태프 업무 보조 기능', '기본 자판기 흐름 포함', '세팅 가이드 제공'] },
    { id: nanoid(), name: 'VEXO 커스텀 봇 제작', category: '개발', price: 89000, badge: '상담필수', description: '원하는 기능을 기준으로 제작하는 맞춤형 디스코드 봇입니다.', features: ['요구사항 상담 후 제작', '슬래시/버튼 커맨드 지원', '서버 맞춤 기능 구현', '소스 또는 실행 파일 제공', '기본 설치 지원', '수정 범위 협의 가능'] },
    { id: nanoid(), name: 'VEXO STORE 올인원', category: '패키지', price: 99000, badge: '목표추천', description: '서버 템플릿, 자판기봇, 기본 자동화를 한 번에 맞추는 수익형 패키지입니다.', features: ['서버 템플릿 PRO급 구조', '자판기봇 BASIC 또는 협의 버전', '자동화 기본 구성', '통합 세팅 가이드', '한 번에 판매 서버 구축', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEXO 런칭 풀세팅', category: '패키지', price: 149000, badge: '프리미엄', description: '처음 판매 서버를 여는 사람을 위한 서버 구축, 봇 연결, 운영 동선 세팅 상품입니다.', features: ['올인원 구성 포함', '판매 채널 문구 기본 작성', '후기·구매인증 동선 세팅', '운영 체크리스트 제공', '오픈 전 점검 1회', '주문 후 디스코드 티켓에서 범위 확정'] },
    { id: nanoid(), name: '봇 설치 가이드', category: '가이드', price: 6000, badge: 'NEW', description: '디스코드 봇을 처음 설치·실행하는 방법을 단계별로 정리한 가이드입니다.', features: ['봇 계정 생성 방법', '토큰 발급·보관', '로컬 실행 방법', '필수 권한 설정', '자주 하는 오류 해결', '문서 형태로 제공'] },
    { id: nanoid(), name: '호스팅 가이드', category: '가이드', price: 7000, badge: '', description: '봇을 24시간 켜 두기 위한 호스팅 선택·세팅 가이드입니다.', features: ['무료/유료 호스팅 비교', 'VPS 기본 세팅', '프로세스 유지(PM2 등)', '재시작·로그 확인', '초보자용 체크리스트'] },
    { id: nanoid(), name: '서버 세팅 가이드', category: '가이드', price: 7000, badge: '', description: '판매용 디스코드 서버 채널·역할·권한을 구성하는 방법입니다.', features: ['역할 계층 설계', '카테고리/채널 구성', '권한 충돌 방지', '티켓·문의 채널 세팅', '구매 인증 채널 운영'] },
    { id: nanoid(), name: '자판기봇 운영 가이드', category: '가이드', price: 9000, badge: 'HOT', description: '자판기봇으로 실제 판매할 때 필요한 운영 흐름을 정리한 가이드입니다.', features: ['상품 등록 예시', '입금 확인 체크 포인트', '지급 전 확인 사항', '분쟁 예방 팁', '후기·인증 채널 활용'] },
    { id: nanoid(), name: '올인원 세팅 가이드', category: '가이드', price: 19000, badge: 'BEST', description: '봇 설치, 호스팅, 서버 세팅, 운영까지 한 번에 담은 통합 가이드입니다.', features: ['설치·호스팅·서버 세팅 통합', '판매 시작 체크리스트', '문제 해결 FAQ', '추천 운영 순서', '개별 가이드 묶음보다 저렴'] }
  ],
  orders: [],
  settings: {
    siteName: 'VEXO STORE',
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
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
if (!Array.isArray(db.users)) db.users = [];
if (!Array.isArray(db.products) || db.products.length === 0) db.products = seed.products;
if (!Array.isArray(db.orders)) db.orders = [];
for (const o of db.orders) { if (o.status === '접수') o.status = '주문접수'; if (o.paymentRequested === undefined) o.paymentRequested = false; if (o.deliveryLink === undefined) o.deliveryLink = ''; }
if (!db.settings) db.settings = seed.settings;
if (db.settings.discordInvite === undefined) db.settings.discordInvite = process.env.DISCORD_INVITE_URL || '';
if (db.settings.bankInfo === undefined) db.settings.bankInfo = process.env.BANK_INFO || '관리자에게 입금 계좌를 안내받아 주세요.';
if (db.settings.webhookUrl === undefined) db.settings.webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';
if (db.settings.goalAmount === undefined) db.settings.goalAmount = 500000;
if (db.settings.targetMonth === undefined) db.settings.targetMonth = '2026-10';
// Older installations may still have stock fields / legacy category names. Stocks are intentionally unlimited now.
for (const p of db.products) { delete p.stock; if (p.category === '서버') p.category = '서버 템플릿'; }

// VEXO design / feature add-ons. These are separate from existing BOT/TEMPLATE/GUIDE products.
// VEXO BOT SERIES metadata is shown as currently selling.
// Premium tiers are presented without inventing a price; the website routes buyers to Discord for final purchase details.
const VEXO_PREMIUM_PRODUCTS = [
  { id:'vexo-bot-basic-premium', name:'VEXO 자판기봇 BASIC PREMIUM', category:'자판기봇', price:29000, badge:'PREMIUM', description:'BASIC의 핵심 판매 기능에 Discord에서 구현 가능한 고급 자판기·주문·티켓 UI와 VEXO 브랜딩을 더한 프리미엄형입니다.', features:['BASIC 전체 기능 포함','고급 자판기 패널','상품 상세·선택 UI 강화','주문 티켓 UI 강화','지급 완료·구매 감사 로그 디자인','VEXO 브랜딩 구성'] },
  { id:'vexo-bot-pro-premium', name:'VEXO 자판기봇 PRO PREMIUM', category:'자판기봇', price:59000, badge:'ULTIMATE', description:'PRO의 상품·재고·수량·통계 기능에 고급 주문 UI, 관리자 편의, 완료 로그와 브랜딩을 결합한 상위형입니다.', features:['PRO 전체 기능 포함','페이지형 카테고리·상품 탐색','재고·수량·통계 운영','고급 주문 티켓 UI','지급 완료·구매 감사 로그','관리자 운영 편의 강화','VEXO 프리미엄 브랜딩'] }
];
const premiumExisting = new Set(db.products.map(p => p.name));
for (const p of VEXO_PREMIUM_PRODUCTS) if (!premiumExisting.has(p.name)) db.products.push(p);

const VEXO_BOT_SERIES = [
  { key:'basic', name:'BASIC', productName:'VEXO 자판기봇 BASIC', status:'판매중', subtitle:'가볍게 시작하는 기본 자판기봇' },
  { key:'basic-premium', name:'BASIC PREMIUM', productName:'VEXO 자판기봇 BASIC PREMIUM', status:'판매중', price:29000, subtitle:'기본 기능 + Discord에서 구현 가능한 프리미엄 UI/브랜딩' },
  { key:'pro', name:'PRO', productName:'VEXO 자판기봇 PRO', status:'판매중', subtitle:'판매 서버 운영을 위한 확장형' },
  { key:'pro-premium', name:'PRO PREMIUM', productName:'VEXO 자판기봇 PRO PREMIUM', status:'판매중', price:59000, subtitle:'PRO 전체 + 고급 주문/관리 UI 및 브랜딩' }
];

const VEXO_ADDON_PRODUCTS = [
  { id: 'vexo-addon-embed-design', name: 'VEXO 임베드 디자인팩', category: '디자인', price: 9900, badge: 'DESIGN', description: '판매봇에 필요한 핵심 임베드를 VEXO 스타일로 통일하는 디자인팩입니다.', features: ['주문 접수 임베드', '입금 안내 임베드', '처리중·완료 임베드', '문의 접수 임베드', '후기 임베드', '다크 퍼플 글로우 테마'] },
  { id: 'vexo-addon-panel-design', name: 'VEXO 버튼 & 패널 디자인팩', category: '디자인', price: 12900, badge: 'UI', description: '버튼·셀렉트·패널을 하나의 브랜드 UI처럼 보이게 만드는 디자인팩입니다.', features: ['메인 판매 패널', '카테고리 선택 UI', '상품 선택 UI', '문의 패널', '후기 패널', '버튼 라벨·이모지 가이드'] },
  { id: 'vexo-addon-bot-skin', name: 'VEXO 봇 UI 스킨팩', category: '디자인', price: 14900, badge: 'HOT', description: '봇 전체의 색감·문구·임베드 스타일을 VEXO 전용 테마로 바꾸는 스킨팩입니다.', features: ['Purple Glow 테마', '임베드 타이포그래피 정리', '상태 메시지 디자인', '주문 티켓 디자인', '관리자 알림 디자인', '공통 푸터·브랜딩'] },
  { id: 'vexo-addon-ticket-ui', name: 'VEXO 티켓 UI 커스텀', category: '디자인', price: 7900, badge: 'TICKET', description: '주문·문의 티켓을 한눈에 읽기 쉬운 화면으로 재구성합니다.', features: ['주문 요약 카드', '결제 안내 영역', '상태 표시 디자인', '관리자 처리 버튼 정리', '닫기·후기 버튼 디자인'] },
  { id: 'vexo-addon-order-ui', name: 'VEXO 주문 UI 업그레이드', category: '봇 옵션', price: 10900, badge: 'ORDER', description: '주문 티켓의 상품·수량·금액·상태 정보를 더 고급스럽게 표현합니다.', features: ['상품 상세 요약', '수량·단가·총액 강조', '주문 상태 타임라인', '결제 안내 강조', '완료 메시지 디자인'] },
  { id: 'vexo-addon-feature-pack', name: 'VEXO 봇 기능 확장팩', category: '봇 옵션', price: 14900, badge: 'FEATURE', description: '기존 봇에 적용할 수 있는 소형 기능 옵션을 묶은 추가 기능팩입니다.', features: ['자동 응답 문구 옵션', '추가 관리자 버튼', '주문 알림 옵션', '간단한 운영 보조 기능', '기능별 적용 범위 안내'] },
  { id: 'vexo-addon-brand-kit', name: 'VEXO 봇 브랜딩팩', category: '디자인', price: 6900, badge: 'BRAND', description: '봇에 표시되는 이름·푸터·상태 문구를 한 브랜드처럼 통일합니다.', features: ['봇 이름 표기 가이드', '임베드 푸터 문구', '버튼 문구 세트', '상태/알림 문구 세트'] }
];
const existingIds = new Set(db.products.map(p => p.id));
for (const p of VEXO_ADDON_PRODUCTS) if (!existingIds.has(p.id)) db.products.push(p);
for (const p of db.products) {
  if (!p.features) p.features = [];
  // Keep installation guides separate from bot/template purchases.
  if (p.category !== '가이드') p.features = p.features.filter(f => !/설치[·ㆍ]?세팅 가이드|설치.*가이드/i.test(String(f)));
}


// Optional first-admin bootstrap. Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD
// once on the server; the account is created only when no admin currently exists.
if (!db.users.some(u => u.role === 'admin')) {
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const username = String(process.env.ADMIN_USERNAME).trim();
    const email = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD);
    const credErr = validateCredentials(username, email, password);
    if (credErr) {
      console.log(`[VEXO] admin bootstrap skipped: ${credErr}`);
    } else {
      const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email);
      if (!exists) {
        db.users.push({ id: nanoid(), username, email, passwordHash: await bcrypt.hash(password, 12), role: 'admin', createdAt: new Date().toISOString() });
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
        console.log(`[VEXO] admin account created: ${username}`);
      } else {
        // Promote existing matching user to admin on first bootstrap
        const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email);
        if (user && user.role !== 'admin') {
          user.role = 'admin';
          user.passwordHash = await bcrypt.hash(password, 12);
          await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
          console.log(`[VEXO] existing user promoted to admin: ${username}`);
        }
      }
    }
  } else {
    console.log('[VEXO] No admin account. Set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD once then restart to create admin.');
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
app.use(express.json({ limit: '1mb' }));
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

app.get('/api/bot-series', (req, res) => {
  const items = VEXO_BOT_SERIES.map(series => ({
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

app.post('/api/orders', requireAuth, async (req, res) => {
  const product = db.products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  const quantity = Number.parseInt(req.body.quantity || 1, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ error: '수량은 1~20개 사이로 입력해 주세요.' });
  const discordTag = String(req.body.discordTag || '').trim().slice(0, 60);
  const memo = String(req.body.memo || '').trim().slice(0, 500);
  if (!discordTag) return res.status(400).json({ error: '디스코드 닉네임 또는 아이디를 입력해 주세요.' });
  const invite = String(db.settings.discordInvite || process.env.DISCORD_INVITE_URL || '').trim();
  const order = {
    id: 'VX-' + nanoid(9).toUpperCase(),
    userId: req.user.id,
    username: req.user.username,
    email: req.user.email,
    productId: product.id,
    productName: product.name,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity,
    status: '주문접수',
    paymentRequested: false,
    deliveryLink: invite,
    discordTag,
    memo,
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(order);
  saveDb();
  await sendDiscordOrderNotice(order).catch(() => {});
  res.status(201).json({ order, discordInvite: invite, bankInfo: db.settings.bankInfo || '' });
});

async function sendDiscordOrderNotice(order) {
  const url = getWebhookUrl();
  if (!url) return;
  const memoLine = order.memo ? `\n요청사항: ${order.memo}` : '';
  const payload = { content: `🛒 **VEXO STORE 주문 접수**\n주문번호: ${order.id}\n구매자: ${order.username}\n디스코드: ${order.discordTag}\n상품: ${order.productName} × ${order.quantity}\n금액: ${order.total.toLocaleString('ko-KR')}원${memoLine}\n\n고객이 디스코드 티켓으로 입금·수령 진행합니다. 서버에서 티켓을 확인해 주세요.` };
  await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
}

app.post('/api/orders/:id/payment-request', requireAuth, async (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  order.paymentRequested = true;
  order.status = '입금확인요청';
  order.paymentRequestedAt = new Date().toISOString();
  saveDb();
  await sendDiscordPaymentNotice(order).catch(() => {});
  res.json({ order });
});

async function sendDiscordPaymentNotice(order) {
  const url = getWebhookUrl();
  if (!url) return;
  const payload = { content: `💳 **입금확인 요청**\n주문번호: ${order.id}\n구매자: ${order.username}\n디스코드: ${order.discordTag || '-'}\n상품: ${order.productName} × ${order.quantity}\n금액: ${order.total.toLocaleString('ko-KR')}원\n\n웹 관리자에서 입금 확인 후 **구매확정** 처리해 주세요.` };
  await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
}

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ orders });
});

app.get('/api/admin/summary', requireAdmin, (req, res) => {
  const revenue = db.orders.filter(o => o.status !== '취소').reduce((s, o) => s + o.total, 0);
  const targetMonth = String(db.settings.targetMonth || '').trim();
  const paidOrders = db.orders.filter(o => o.status !== '취소');
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

app.get('/api/admin/orders', requireAdmin, (req, res) => res.json({ orders: db.orders }));
app.get('/api/admin/users', requireAdmin, (req, res) => res.json({ users: db.users.map(safeUser) }));
app.get('/api/admin/orders.csv', requireAdmin, (req, res) => {
  const escCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [
    ['주문번호','회원','이메일','디스코드','상품','수량','금액','상태','요청사항','주문일'],
    ...db.orders.map(o => [o.id, o.username, o.email, o.discordTag || '', o.productName, o.quantity, o.total, o.status, o.memo || '', o.createdAt])
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

app.patch('/api/admin/orders/:id', requireAdmin, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  const status = String(req.body.status || '');
  if (!['주문접수','입금확인요청','입금확인완료','처리중','완료','취소'].includes(status)) return res.status(400).json({ error: '상태값이 올바르지 않습니다.' });
  order.status = status;
  order.updatedAt = new Date().toISOString();
  saveDb();
  res.json({ order });
});

app.post('/api/admin/orders/:id/approve', requireAdmin, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
  const link = String(req.body.deliveryLink || db.settings.discordInvite || '').trim();
  if (!link) return res.status(400).json({ error: '구매자에게 전달할 디스코드 초대 링크가 필요합니다.' });
  order.status = '입금확인완료';
  order.deliveryLink = link;
  order.approvedAt = new Date().toISOString();
  order.receiptText = `${order.username}님, ${new Date(order.createdAt).toLocaleDateString('ko-KR')} ${order.productName} 구매가 확인되었습니다.`;
  saveDb();
  res.json({ order });
});

app.patch('/api/admin/settings', requireAdmin, (req, res) => {
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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use('/public', express.static(path.join(__dirname, 'public'), { index: false }));
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`VEXO STORE running on http://localhost:${PORT}`));
