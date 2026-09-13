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
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, 'data');
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
    { id: nanoid(), name: 'VEXO 자판기봇 BASIC', category: '자판기봇', price: 9900, badge: '입문추천', description: '디스코드에서 바로 주문을 받을 수 있는 기본 판매 봇 구성입니다.', features: ['상품 버튼 주문 UI', '주문 접수 및 로그 기록', '입금 확인 후 지급 안내', '기본 고객 응대 메시지', '설치·세팅 가이드 포함', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEXO 자판기봇 PRO', category: '자판기봇', price: 19900, badge: 'BEST', description: '상품 관리, 주문 흐름, 스태프 운영까지 확장한 실전 판매용 봇입니다.', features: ['BASIC 전체 기능 포함', '상품 추가·수정·삭제 관리', '주문 상태 관리 패널', '구매자 역할 부여 지원', '상세 주문 로그 채널', '스태프 권한 분리', '설치·세팅 가이드 포함'] },
    { id: nanoid(), name: 'VEXO 디스코드 서버 템플릿', category: '서버 템플릿', price: 9900, badge: '빠른시작', description: '판매, 문의, 티켓, 인증 채널이 정리된 바로 사용 가능한 서버 템플릿입니다.', features: ['INFORMATION / STORE / ORDER / SUPPORT / COMMUNITY 구조', 'OWNER·ADMIN·STAFF·CUSTOMER·MEMBER 역할', '공지·가격표·구매인증 채널', '문의·1대1 티켓용 채널', '관리자 전용 STAFF 카테고리', '서버 템플릿 링크 제공', '기본 세팅 가이드'] },
    { id: nanoid(), name: 'VEXO 서버 템플릿 PRO', category: '서버 템플릿', price: 19900, badge: '추천', description: '고급 권한, 티켓 운영, 후기 동선까지 포함한 프리미엄 서버 구조입니다.', features: ['기본 템플릿 전체 포함', '세분화된 권한 구조', '티켓 봇 연동 가이드', '주문·고객·상품 관리 채널 분리', '후기·파트너 채널 구성', '자판기봇 배치 위치 안내', '상세 세팅 설명서'] },
    { id: nanoid(), name: 'VEXO 자동화 패키지', category: '자동화', price: 29900, badge: '매출형', description: '반복 공지, 역할, 주문 알림을 줄여 운영 시간을 아끼는 자동화 구성입니다.', features: ['환영·역할 자동 부여 지원', '반복 공지/안내 자동화', '주문 알림 연동 구성', '스태프 업무 보조 기능', '기본 자판기 흐름 포함', '세팅 가이드 제공'] },
    { id: nanoid(), name: 'VEXO 커스텀 봇 제작', category: '개발', price: 49900, badge: '맞춤제작', description: '원하는 기능을 기준으로 제작하는 맞춤형 디스코드 봇입니다.', features: ['요구사항 상담 후 제작', '슬래시/버튼 커맨드 지원', '서버 맞춤 기능 구현', '소스 또는 실행 파일 제공', '기본 설치 지원', '수정 범위 협의 가능'] },
    { id: nanoid(), name: 'VEXO HUB 올인원', category: '패키지', price: 59900, badge: 'BEST', description: '서버 템플릿, 자판기봇, 기본 자동화를 한 번에 맞추는 수익형 패키지입니다.', features: ['서버 템플릿 PRO급 구조', '자판기봇 BASIC 또는 협의 버전', '자동화 기본 구성', '통합 세팅 가이드', '한 번에 판매 서버 구축', '계좌입금 확인·상품 지급은 티켓에서 수동 진행'] },
    { id: nanoid(), name: 'VEXO 런칭 풀세팅', category: '패키지', price: 79900, badge: 'PREMIUM', description: '처음 판매 서버를 여는 사람을 위한 서버 구축, 봇 연결, 운영 동선 세팅 상품입니다.', features: ['올인원 구성 포함', '판매 채널 문구 기본 작성', '후기·구매인증 동선 세팅', '운영 체크리스트 제공', '오픈 전 점검 1회', '주문 후 디스코드 티켓에서 범위 확정'] },
    { id: nanoid(), name: '봇 설치 가이드', category: '가이드', price: 2900, badge: '입문추천', description: '디스코드 봇을 처음 설치·실행하는 방법을 단계별로 정리한 가이드입니다.', features: ['봇 계정 생성 방법', '토큰 발급·보관', '로컬 실행 방법', '필수 권한 설정', '자주 하는 오류 해결', '문서 형태로 제공'] },
    { id: nanoid(), name: '호스팅 가이드', category: '가이드', price: 3900, badge: '', description: '봇을 24시간 켜 두기 위한 호스팅 선택·세팅 가이드입니다.', features: ['무료/유료 호스팅 비교', 'VPS 기본 세팅', '프로세스 유지(PM2 등)', '재시작·로그 확인', '초보자용 체크리스트'] },
    { id: nanoid(), name: '서버 세팅 가이드', category: '가이드', price: 3900, badge: '', description: '판매용 디스코드 서버 채널·역할·권한을 구성하는 방법입니다.', features: ['역할 계층 설계', '카테고리/채널 구성', '권한 충돌 방지', '티켓·문의 채널 세팅', '구매 인증 채널 운영'] },
    { id: nanoid(), name: '자판기봇 운영 가이드', category: '가이드', price: 5900, badge: 'HOT', description: '자판기봇으로 실제 판매할 때 필요한 운영 흐름을 정리한 가이드입니다.', features: ['상품 등록 예시', '입금 확인 체크 포인트', '지급 전 확인 사항', '분쟁 예방 팁', '후기·인증 채널 활용'] },
    { id: nanoid(), name: '올인원 세팅 가이드', category: '가이드', price: 8900, badge: 'BEST', description: '봇 설치, 호스팅, 서버 세팅, 운영까지 한 번에 담은 통합 가이드입니다.', features: ['설치·호스팅·서버 세팅 통합', '판매 시작 체크리스트', '문제 해결 FAQ', '추천 운영 순서', '개별 가이드 묶음보다 저렴'] }
  ],
  orders: [],
  emailVerifications: {},
  settings: {
    siteName: 'VEXO HUB',
    notice: '원하는 상품을 선택하고 주문을 완료한 뒤, 디스코드 티켓에서 입금 확인 및 상품 수령을 진행합니다.',
    onlineLabel: '현재 접속자',
    discordInvite: process.env.DISCORD_INVITE_URL || 'https://discord.gg/kq9K7HjSXv',
    bankInfo: process.env.BANK_INFO || '디스코드 티켓에서 입금 계좌를 안내받아 주세요.',
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
        pricePlanVersion: 5,
    firstPurchasePromo: { enabled: true, minSpend: 50000, percent: 10, maxDiscount: 10000 }
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
for (const u of db.users) if (u.promoClaimedAt === undefined) u.promoClaimedAt = '';
if (!Array.isArray(db.products) || db.products.length === 0) db.products = seed.products;
if (!Array.isArray(db.orders)) db.orders = [];
if (!db.emailVerifications || typeof db.emailVerifications !== 'object' || Array.isArray(db.emailVerifications)) db.emailVerifications = {};
for (const o of db.orders) { if (o.status === '접수') o.status = '주문접수'; if (o.paymentRequested === undefined) o.paymentRequested = false; if (o.deliveryLink === undefined) o.deliveryLink = ''; }
if (!db.settings) db.settings = seed.settings;
if (db.settings.discordInvite === undefined) db.settings.discordInvite = process.env.DISCORD_INVITE_URL || '';
if (db.settings.bankInfo === undefined) db.settings.bankInfo = process.env.BANK_INFO || '디스코드 티켓에서 입금 계좌를 안내받아 주세요.';
if (!String(db.settings.discordInvite || '').trim()) db.settings.discordInvite = process.env.DISCORD_INVITE_URL || 'https://discord.gg/kq9K7HjSXv';
if (db.settings.pricePlanVersion === undefined) db.settings.pricePlanVersion = 1;
if (db.settings.siteName === 'VEXO STORE') db.settings.siteName = 'VEXO HUB';
if (!db.settings.firstPurchasePromo) db.settings.firstPurchasePromo = { ...seed.settings.firstPurchasePromo };
// Rename legacy brand labels in existing JSON data without touching order history.
for (const product of db.products) {
  if (product.name === 'VEXO STORE 올인원') product.name = 'VEXO HUB 올인원';
}
const PRICE_PLAN_VERSION = 5;
if (Number(db.settings?.pricePlanVersion || 1) < PRICE_PLAN_VERSION) {
  const priceUpdates = new Map([
    ['VEXO 자판기봇 BASIC', 9900],
    ['VEXO 자판기봇 PRO', 19900],
    ['VEXO 디스코드 서버 템플릿', 9900],
    ['VEXO 서버 템플릿 PRO', 19900],
    ['VEXO 자동화 패키지', 24900],
    ['VEXO 커스텀 봇 제작', 44900],
    ['VEXO HUB 올인원', 54900],
    ['VEXO STORE 올인원', 54900],
    ['VEXO 런칭 풀세팅', 69900],
    ['봇 설치 가이드', 2900],
    ['호스팅 가이드', 3900],
    ['서버 세팅 가이드', 3900],
    ['자판기봇 운영 가이드', 5900],
    ['올인원 세팅 가이드', 8900],
  ]);  for (const product of db.products) {
    if (priceUpdates.has(product.name)) product.price = priceUpdates.get(product.name);
    if (product.name === 'VEXO 자판기봇 PRO') product.badge = product.badge === '인기' ? 'BEST' : product.badge;
    if (product.name === 'VEXO HUB 올인원') product.badge = product.badge === '목표추천' ? 'BEST' : product.badge;
    if (product.name === 'VEXO 런칭 풀세팅') product.badge = product.badge === '프리미엄' ? 'PREMIUM' : product.badge;
    if (product.downloadFile === undefined) product.downloadFile = '';
  }
  db.settings.pricePlanVersion = PRICE_PLAN_VERSION;
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}
delete db.settings.goalAmount;
delete db.settings.targetMonth;
// Older installations may still have stock fields / legacy category names. Stocks are intentionally unlimited now.
for (const p of db.products) { delete p.stock; if (p.category === '서버') p.category = '서버 템플릿'; if (p.downloadFile === undefined) p.downloadFile = ''; }
for (const o of db.orders) {
  if (o.receiptNo === undefined) o.receiptNo = 'RC-' + String(o.id || '').replace(/^VX-/, '');
  if (o.licenseKey === undefined) o.licenseKey = '';
  if (o.licenseActivatedBy === undefined) o.licenseActivatedBy = '';
  if (o.licenseActivatedAt === undefined) o.licenseActivatedAt = '';
  if (o.downloadTokenHash === undefined) o.downloadTokenHash = '';
  if (o.downloadTokenExpiresAt === undefined) o.downloadTokenExpiresAt = '';
  if (o.downloadUsedAt === undefined) o.downloadUsedAt = '';
  if (o.downloadCount === undefined) o.downloadCount = 0;
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

function makeToken(userId) {
  return jwt.sign({ sub: userId }, SESSION_SECRET, { expiresIn: '30d' });
}
function getSession(req) {
  const token = req.cookies.vexo_session;
  if (!token) return null;
  try { return jwt.verify(token, SESSION_SECRET); } catch { return null; }
}
function getUser(req) {
  const payload = getSession(req);
  if (!payload) return null;
  return db.users.find(u => u.id === payload.sub) || null;
}
function safeUser(user) {
  if (!user) return null;
  return { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt };
}
function requireAuth(req, res, next) {
  const user = getUser(req);
  if (!user) return res.status(401).json({ error: '로그인이 필요합니다.' });
  req.user = user;
  next();
}
function siteSettingsFor() {
  const settings = { ...db.settings };
  delete settings.webhookUrl;
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

app.get('/healthz', (req, res) => res.json({ ok: true, service: 'vexo-store', time: new Date().toISOString() }));

app.get('/api/site', (req, res) => {
  res.json({ settings: siteSettingsFor(req), online: online.size });
});

app.post('/api/heartbeat', (req, res) => {
  const visitor = req.cookies.vexo_visitor || nanoid(18);
  res.cookie('vexo_visitor', visitor, { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 365 });
  online.set(visitor, Date.now());
  res.json({ online: online.size });
});

app.get('/api/products', (req, res) => {
  const category = String(req.query.category || 'all');
  const products = category === 'all' ? db.products : db.products.filter(p => p.category === category);
  res.json({ products });
});

app.get('/api/me', (req, res) => {
  res.json({ user: safeUser(getUser(req)) });
});

function verificationHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}
function makeVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}
function maskEmail(email) {
  const [local, domain] = String(email).split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0] || '*'}*@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}
async function sendVerificationEmail(email, code) {
  const apiKey = String(process.env.RESEND_API_KEY || '').trim();
  const from = String(process.env.RESEND_FROM || 'VEXO HUB <onboarding@resend.dev>').trim();
  if (!apiKey) throw new Error('이메일 인증 기능이 아직 설정되지 않았습니다. RESEND_API_KEY를 Render 환경변수에 등록해 주세요.');
  const html = `<!doctype html><html><body style="margin:0;background:#070811;color:#eef0ff;font-family:Arial,sans-serif"><div style="max-width:560px;margin:0 auto;padding:38px 18px"><div style="border:1px solid #302058;border-radius:22px;background:#10101c;padding:28px"><div style="font-size:13px;letter-spacing:3px;color:#b48cff;font-weight:800">VEXO HUB</div><h1 style="margin:12px 0 8px;font-size:28px">이메일 인증번호</h1><p style="color:#aeb0c8;line-height:1.7">회원가입을 완료하려면 아래 인증번호를 입력해 주세요.</p><div style="margin:24px 0;padding:20px;border-radius:18px;background:linear-gradient(135deg,#24124b,#17152a);text-align:center"><div style="font-size:13px;color:#aaa8c8;margin-bottom:8px">인증번호</div><div style="font-size:36px;letter-spacing:10px;font-weight:900;color:#fff">${code}</div></div><p style="font-size:13px;color:#8f91a8;line-height:1.7">인증번호는 10분간 유효합니다. 본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p></div></div></body></html>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [email], subject: '[VEXO HUB] 회원가입 인증번호', html, text: `VEXO HUB 회원가입 인증번호: ${code}\n\n10분간 유효합니다.` })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Resend error:', data);
    throw new Error(data?.message || '인증 이메일을 보내지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  return data;
}

app.post('/api/auth/send-code', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: '올바른 이메일 주소를 입력해 주세요.' });
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: '이미 가입된 이메일입니다. 로그인해 주세요.' });
  const existing = db.emailVerifications[email];
  const now = Date.now();
  if (existing?.lastSentAt && now - existing.lastSentAt < 60_000) {
    const remain = Math.ceil((60_000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({ error: `인증번호는 ${remain}초 후 다시 요청할 수 있습니다.` });
  }
  const code = makeVerificationCode();
  const verificationId = nanoid(18);
  db.emailVerifications[email] = {
    codeHash: verificationHash(`${verificationId}:${code}`),
    verificationId,
    expiresAt: new Date(now + 10 * 60_000).toISOString(),
    lastSentAt: now,
    attempts: 0,
    verified: false,
    verificationTokenHash: ''
  };
  try {
    await sendVerificationEmail(email, code);
    saveDb();
    res.json({ ok: true, email: maskEmail(email), expiresIn: 600 });
  } catch (error) {
    delete db.emailVerifications[email];
    res.status(502).json({ error: error.message || '인증 이메일 발송에 실패했습니다.' });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ error: '6자리 인증번호를 입력해 주세요.' });
  const record = db.emailVerifications[email];
  if (!record) return res.status(400).json({ error: '인증번호를 먼저 요청해 주세요.' });
  if (record.verified && record.verificationTokenHash) return res.json({ ok: true, verified: true });
  if (Date.now() > new Date(record.expiresAt).getTime()) {
    delete db.emailVerifications[email];
    saveDb();
    return res.status(410).json({ error: '인증번호가 만료되었습니다. 새 인증번호를 요청해 주세요.' });
  }
  if (record.attempts >= 5) return res.status(429).json({ error: '인증번호 입력 횟수를 초과했습니다. 새 인증번호를 요청해 주세요.' });
  record.attempts += 1;
  if (verificationHash(`${record.verificationId}:${code}`) !== record.codeHash) {
    saveDb();
    return res.status(400).json({ error: `인증번호가 올바르지 않습니다. (${record.attempts}/5)` });
  }
  const verificationToken = crypto.randomBytes(24).toString('hex');
  record.verified = true;
  record.verificationTokenHash = verificationHash(verificationToken);
  record.verifiedAt = new Date().toISOString();
  saveDb();
  res.json({ ok: true, verified: true, verificationToken });
});

app.post('/api/auth/register', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const verificationToken = String(req.body.verificationToken || '').trim();
  const err = validateCredentials(username, email, password);
  if (err) return res.status(400).json({ error: err });
  if (!verificationToken) return res.status(400).json({ error: '이메일 인증을 먼저 완료해 주세요.' });
  const verification = db.emailVerifications[email];
  if (verification?.expiresAt && Date.now() > new Date(verification.expiresAt).getTime()) {
    delete db.emailVerifications[email];
    saveDb();
    return res.status(410).json({ error: '이메일 인증이 만료되었습니다. 새 인증번호를 요청해 주세요.' });
  }
  if (!verification?.verified || !verification.verificationTokenHash || verificationHash(verificationToken) !== verification.verificationTokenHash) {
    return res.status(403).json({ error: '이메일 인증이 확인되지 않았습니다. 인증번호를 다시 확인해 주세요.' });
  }
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(409).json({ error: '이미 사용 중인 아이디입니다.' });
  if (db.users.some(u => u.email === email)) return res.status(409).json({ error: '이미 가입된 이메일입니다.' });
  const user = { id: nanoid(16), username, email, passwordHash: await bcrypt.hash(password, 12), role: 'user', createdAt: new Date().toISOString(), emailVerifiedAt: new Date().toISOString() };
  db.users.push(user);
  delete db.emailVerifications[email];
  saveDb();
  res.cookie('vexo_session', makeToken(user.id, user.role, false), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.status(201).json({ user: safeUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const identifier = String(req.body.identifier || '').trim();
  const password = String(req.body.password || '');
  const user = db.users.find(u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: '아이디(또는 이메일)와 비밀번호를 확인해 주세요.' });
  res.cookie('vexo_session', makeToken(user.id, user.role, false), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 30 });
  res.json({ user: safeUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('vexo_session');
  res.json({ ok: true });
});

app.get('/api/me/benefit', requireAuth, (req, res) => {
  const promo = db.settings.firstPurchasePromo || { enabled: true, minSpend: 50000, percent: 10, maxDiscount: 10000 };
  const eligible = Boolean(promo.enabled && !req.user.promoClaimedAt);
  res.json({ eligible, promo });
});

app.post('/api/orders', requireAuth, async (req, res) => {
  const product = db.products.find(p => p.id === req.body.productId);
  if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
  const quantity = Number.parseInt(req.body.quantity || 1, 10);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return res.status(400).json({ error: '수량은 1~20개 사이로 입력해 주세요.' });
  const discordTag = String(req.body.discordTag || '').trim().slice(0, 60);
  const memo = String(req.body.memo || '').trim().slice(0, 500);
  if (!discordTag) return res.status(400).json({ error: '디스코드 닉네임 또는 아이디를 입력해 주세요.' });
  const invite = String(db.settings.discordInvite || process.env.DISCORD_INVITE_URL || 'https://discord.gg/kq9K7HjSXv').trim();
  const subtotal = product.price * quantity;
  const promo = db.settings.firstPurchasePromo || { enabled: true, minSpend: 50000, percent: 10, maxDiscount: 10000 };
  let discountAmount = 0;
  let discountLabel = '';
  const user = db.users.find(u => u.id === req.user.id);
  if (promo.enabled && user && !user.promoClaimedAt && subtotal >= Number(promo.minSpend || 0) && Number(promo.percent || 0) > 0) {
    discountAmount = Math.min(subtotal, Math.round(subtotal * Number(promo.percent) / 100), Number(promo.maxDiscount || subtotal));
    if (discountAmount > 0) {
      discountLabel = `첫 구매 ${promo.percent}% 할인`;
      user.promoClaimedAt = new Date().toISOString();
    }
  }
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
    discountLabel,
    total: Math.max(0, subtotal - discountAmount),
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

async function postWebhook(url, payload){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try{
    const response = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
    if(!response.ok) throw new Error(`Webhook HTTP ${response.status}`);
    return true;
  }finally{clearTimeout(timer)}
}

async function sendDiscordOrderNotice(order) {
  const url = getWebhookUrl();
  if (!url) return;
  const memoLine = order.memo ? `\n요청사항: ${order.memo}` : '';
  const payload = { content: `🛒 **VEXO HUB 주문 접수**\n주문번호: ${order.id}\n구매자: ${order.username}\n디스코드: ${order.discordTag}\n상품: ${order.productName} × ${order.quantity}\n금액: ${order.total.toLocaleString('ko-KR')}원${order.discountAmount ? `\n할인: -${order.discountAmount.toLocaleString('ko-KR')}원 (${order.discountLabel})` : ''}${memoLine}\n\n고객이 디스코드 티켓으로 입금·수령 진행합니다. 서버에서 티켓을 확인해 주세요.` };
  await postWebhook(url, payload);
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
  const payload = { content: `💳 **입금확인 요청**\n주문번호: ${order.id}\n구매자: ${order.username}\n디스코드: ${order.discordTag || '-'}\n상품: ${order.productName} × ${order.quantity}\n금액: ${order.total.toLocaleString('ko-KR')}원\n\n디스코드 티켓에서 입금 확인 후 상품 지급 절차를 진행해 주세요.` };
  await postWebhook(url, payload);
}

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id);
  res.json({ orders });
});


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use('/assets', express.static(path.join(__dirname, 'assets'), { index: false, immutable: true, maxAge: '7d' }));
app.use('/public', express.static(path.join(__dirname, 'public'), { index: false }));
app.use((req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`VEXO HUB running on 0.0.0.0:${PORT}`));
