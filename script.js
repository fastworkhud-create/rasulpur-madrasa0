/* ============================================================
   রসুলপুর ইসলাম নিসা মহিলা মাদ্রাসা
   Main Script - script.js
   Author: Senior Full-Stack Engineer
   Version: 1.0.0
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════
   FIREBASE CONFIGURATION & INITIALIZATION
══════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyAxjoCkMIGukH3jV8wbhxXDxcT4YGl9L2A",
  authDomain: "rasulpur-madrasa.firebaseapp.com",
  projectId: "rasulpur-madrasa",
  storageBucket: "rasulpur-madrasa.firebasestorage.app",
  messagingSenderId: "778934188368",
  appId: "1:778934188368:web:5cb2ec111a4dde331b5455",
  measurementId: "G-BTMYN9PXFK"
};

/* Initialize Firebase */
const app        = initializeApp(firebaseConfig);
const auth       = getAuth(app);
const db         = getFirestore(app);
const provider   = new GoogleAuthProvider();

/* ══════════════════════════════════════════
   APP STATE
══════════════════════════════════════════ */
const State = {
  currentUser:    null,
  currentPage:    'dashboard',
  sidebarCollapsed: false,
  students:       [],
  teachers:       [],
  routines:       [],
  editingId:      null,
  deleteTarget:   { collection: null, id: null, name: '' },
  studentPage:    1,
  teacherPage:    1,
  itemsPerPage:   10,
  searchQuery:    '',
  unsubscribers:  []
};

/* ══════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════ */
const DOM = {
  /* Screens */
  loadingScreen:  () => document.getElementById('loading-screen'),
  authPage:       () => document.getElementById('auth-page'),
  appPage:        () => document.getElementById('app-page'),

  /* Auth */
  loginTab:       () => document.getElementById('login-tab'),
  emailTab:       () => document.getElementById('email-tab'),
  adminForm:      () => document.getElementById('admin-login-form'),
  emailForm:      () => document.getElementById('email-login-form'),
  authAlert:      () => document.getElementById('auth-alert'),
  authAlertMsg:   () => document.getElementById('auth-alert-msg'),

  /* Admin Login */
  adminEmail:     () => document.getElementById('admin-email'),
  adminPass:      () => document.getElementById('admin-password'),
  adminLoginBtn:  () => document.getElementById('admin-login-btn'),

  /* Email Login */
  userEmail:      () => document.getElementById('user-email'),
  userPass:       () => document.getElementById('user-password'),
  emailLoginBtn:  () => document.getElementById('email-login-btn'),

  /* Google */
  googleBtn:      () => document.getElementById('google-login-btn'),
  googleBtn2:     () => document.getElementById('google-login-btn2'),

  /* Sidebar */
  sidebar:        () => document.getElementById('sidebar'),
  sidebarOverlay: () => document.getElementById('sidebar-overlay'),
  sidebarToggle:  () => document.getElementById('sidebar-toggle'),
  navItems:       () => document.querySelectorAll('.nav-item[data-page]'),

  /* User Info */
  userAvatar:     () => document.getElementById('user-avatar'),
  userName:       () => document.getElementById('user-name'),
  userRole:       () => document.getElementById('user-role'),
  headerAvatar:   () => document.getElementById('header-avatar'),

  /* Header */
  headerSearch:   () => document.getElementById('header-search'),
  pageTitle:      () => document.getElementById('page-title'),

  /* Pages */
  pageSections:   () => document.querySelectorAll('.page-section'),

  /* Dashboard */
  statStudents:   () => document.getElementById('stat-students'),
  statTeachers:   () => document.getElementById('stat-teachers'),
  statClasses:    () => document.getElementById('stat-classes'),
  statRoutines:   () => document.getElementById('stat-routines'),
  recentActivity: () => document.getElementById('recent-activity'),

  /* Student */
  studentSearch:  () => document.getElementById('student-search'),
  studentClass:   () => document.getElementById('student-class-filter'),
  studentTableBody:() => document.getElementById('student-table-body'),
  studentCount:   () => document.getElementById('student-count'),
  studentInfo:    () => document.getElementById('student-info'),
  studentPagination:() => document.getElementById('student-pagination'),
  addStudentBtn:  () => document.getElementById('add-student-btn'),

  /* Teacher */
  teacherSearch:  () => document.getElementById('teacher-search'),
  teacherDept:    () => document.getElementById('teacher-dept-filter'),
  teacherTableBody:() => document.getElementById('teacher-table-body'),
  teacherCount:   () => document.getElementById('teacher-count'),
  teacherInfo:    () => document.getElementById('teacher-info'),
  teacherPagination:() => document.getElementById('teacher-pagination'),
  addTeacherBtn:  () => document.getElementById('add-teacher-btn'),

  /* Routine */
  routineClass:   () => document.getElementById('routine-class-filter'),
  routineDay:     () => document.getElementById('routine-day-filter'),
  routineTableBody:() => document.getElementById('routine-table-body'),
  addRoutineBtn:  () => document.getElementById('add-routine-btn'),

  /* Search Page */
  searchInput:    () => document.getElementById('search-input'),
  searchBtn:      () => document.getElementById('search-btn'),
  searchResults:  () => document.getElementById('search-results'),

  /* Modals */
  studentModal:   () => document.getElementById('student-modal'),
  teacherModal:   () => document.getElementById('teacher-modal'),
  routineModal:   () => document.getElementById('routine-modal'),
  viewModal:      () => document.getElementById('view-modal'),
  confirmModal:   () => document.getElementById('confirm-modal'),

  /* Student Modal Form */
  studentModalTitle: () => document.getElementById('student-modal-title'),
  sName:          () => document.getElementById('s-name'),
  sId:            () => document.getElementById('s-id'),
  sClass:         () => document.getElementById('s-class'),
  sSection:       () => document.getElementById('s-section'),
  sRoll:          () => document.getElementById('s-roll'),
  sPhone:         () => document.getElementById('s-phone'),
  sGuardian:      () => document.getElementById('s-guardian'),
  sAddress:       () => document.getElementById('s-address'),
  sStatus:        () => document.getElementById('s-status'),
  studentSaveBtn: () => document.getElementById('student-save-btn'),

  /* Teacher Modal Form */
  teacherModalTitle: () => document.getElementById('teacher-modal-title'),
  tName:          () => document.getElementById('t-name'),
  tDesignation:   () => document.getElementById('t-designation'),
  tDept:          () => document.getElementById('t-dept'),
  tPhone:         () => document.getElementById('t-phone'),
  tEmail:         () => document.getElementById('t-email'),
  tSubject:       () => document.getElementById('t-subject'),
  tJoining:       () => document.getElementById('t-joining'),
  tStatus:        () => document.getElementById('t-status'),
  teacherSaveBtn: () => document.getElementById('teacher-save-btn'),

  /* Routine Modal Form */
  routineModalTitle: () => document.getElementById('routine-modal-title'),
  rClass:         () => document.getElementById('r-class'),
  rDay:           () => document.getElementById('r-day'),
  rPeriod:        () => document.getElementById('r-period'),
  rSubject:       () => document.getElementById('r-subject'),
  rTeacher:       () => document.getElementById('r-teacher'),
  rTime:          () => document.getElementById('r-time'),
  routineSaveBtn: () => document.getElementById('routine-save-btn'),

  /* View Modal */
  viewModalTitle: () => document.getElementById('view-modal-title'),
  viewContent:    () => document.getElementById('view-content'),

  /* Confirm Modal */
  confirmName:    () => document.getElementById('confirm-name'),
  confirmYesBtn:  () => document.getElementById('confirm-yes-btn'),

  /* Logout */
  logoutBtn:      () => document.getElementById('logout-btn'),

  /* Toast */
  toastContainer: () => document.getElementById('toast-container'),
};

/* ══════════════════════════════════════════
   UTILITY FUNCTIONS
══════════════════════════════════════════ */

/**
 * বাংলা অক্ষরে তারিখ ফরম্যাট
 */
function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

/**
 * নামের প্রথম অক্ষর থেকে Avatar তৈরি
 */
function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

/**
 * Badge HTML তৈরি
 */
function badgeHTML(status) {
  const map = {
    'active':   ['badge-green',  '✅ সক্রিয়'],
    'inactive': ['badge-red',    '❌ নিষ্ক্রিয়'],
    'on-leave': ['badge-amber',  '⏸ ছুটিতে'],
    'passed':   ['badge-blue',   '🎓 পাস'],
    'dropped':  ['badge-gray',   '🚫 বাদ'],
  };
  const [cls, label] = map[status] || ['badge-gray', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

/**
 * Page Title Map
 */
const pageTitles = {
  dashboard:  '📊 ড্যাশবোর্ড',
  students:   '👩‍🎓 শিক্ষার্থী ব্যবস্থাপনা',
  teachers:   '👩‍🏫 শিক্ষক ব্যবস্থাপনা',
  routine:    '📅 রুটিন ব্যবস্থাপনা',
  search:     '🔍 সার্চ সিস্টেম',
};

/* ══════════════════════════════════════════
   TOAST NOTIFICATION SYSTEM
══════════════════════════════════════════ */
function showToast(message, type = 'success', duration = 3500) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-msg">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  DOM.toastContainer().appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ══════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════ */
function hideLoading() {
  const el = DOM.loadingScreen();
  if (el) {
    el.classList.add('fade-out');
    setTimeout(() => el.style.display = 'none', 500);
  }
}

function showLoading() {
  const el = DOM.loadingScreen();
  if (el) {
    el.style.display = 'flex';
    el.classList.remove('fade-out');
  }
}

/* ══════════════════════════════════════════
   AUTH SYSTEM
══════════════════════════════════════════ */

/* Auth Tab Switching */
function initAuthTabs() {
  const loginTab = DOM.loginTab();
  const emailTab = DOM.emailTab();
  const adminForm = DOM.adminForm();
  const emailForm = DOM.emailForm();

  if (!loginTab || !emailTab) return;

  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    emailTab.classList.remove('active');
    adminForm.classList.remove('hidden');
    emailForm.classList.add('hidden');
    clearAuthAlert();
  });

  emailTab.addEventListener('click', () => {
    emailTab.classList.add('active');
    loginTab.classList.remove('active');
    emailForm.classList.remove('hidden');
    adminForm.classList.add('hidden');
    clearAuthAlert();
  });
}

/* Show Auth Error */
function showAuthAlert(message) {
  const alert = DOM.authAlert();
  const msg   = DOM.authAlertMsg();
  if (alert && msg) {
    msg.textContent = message;
    alert.classList.remove('hidden');
  }
}

function clearAuthAlert() {
  const alert = DOM.authAlert();
  if (alert) alert.classList.add('hidden');
}

/* Password Toggle */
function initPasswordToggles() {
  document.querySelectorAll('.input-toggle[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.textContent = isPass ? '🙈' : '👁️';
    });
  });
}

/* Admin (Email/Password) Login */
async function handleAdminLogin(e) {
  e.preventDefault();
  clearAuthAlert();

  const email    = DOM.adminEmail()?.value?.trim();
  const password = DOM.adminPass()?.value;
  const btn      = DOM.adminLoginBtn();

  if (!email || !password) {
    showAuthAlert('ইমেইল ও পাসওয়ার্ড দিন।');
    return;
  }

  setButtonLoading(btn, true, 'লগইন হচ্ছে...');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    /* onAuthStateChanged handles the rest */
  } catch (err) {
    setButtonLoading(btn, false, '🔐 অ্যাডমিন লগইন');
    showAuthAlert(getAuthError(err.code));
  }
}

/* Email Login */
async function handleEmailLogin(e) {
  e.preventDefault();
  clearAuthAlert();

  const email    = DOM.userEmail()?.value?.trim();
  const password = DOM.userPass()?.value;
  const btn      = DOM.emailLoginBtn();

  if (!email || !password) {
    showAuthAlert('ইমেইল ও পাসওয়ার্ড দিন।');
    return;
  }

  setButtonLoading(btn, true, 'লগইন হচ্ছে...');

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    setButtonLoading(btn, false, '📧 ইমেইল লগইন');
    showAuthAlert(getAuthError(err.code));
  }
}

/* Google Login */
async function handleGoogleLogin() {
  clearAuthAlert();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      showAuthAlert(getAuthError(err.code));
    }
  }
}

/* Logout */
async function handleLogout() {
  try {
    /* Unsubscribe all Firestore listeners */
    State.unsubscribers.forEach(fn => fn());
    State.unsubscribers = [];
    await signOut(auth);
    showToast('সফলভাবে লগআউট হয়েছে।', 'info');
  } catch (err) {
    showToast('লগআউট ব্যর্থ হয়েছে।', 'error');
  }
}

/* Firebase Auth Error Messages in Bengali */
function getAuthError(code) {
  const errors = {
    'auth/invalid-email':          'ইমেইল ঠিকানা সঠিক নয়।',
    'auth/user-disabled':          'এই অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।',
    'auth/user-not-found':         'ব্যবহারকারী পাওয়া যায়নি।',
    'auth/wrong-password':         'পাসওয়ার্ড সঠিক নয়।',
    'auth/invalid-credential':     'ইমেইল বা পাসওয়ার্ড ভুল।',
    'auth/too-many-requests':      'অনেক বার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।',
    'auth/network-request-failed': 'নেটওয়ার্ক সমস্যা। ইন্টারনেট সংযোগ চেক করুন।',
    'auth/popup-blocked':          'Popup ব্লক হয়েছে। Browser সেটিং চেক করুন।',
    'auth/cancelled-popup-request':'Google লগইন বাতিল হয়েছে।',
  };
  return errors[code] || `লগইন ব্যর্থ হয়েছে। (${code})`;
}

/* Button Loading State */
function setButtonLoading(btn, loading, originalText) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn.dataset.original = btn.textContent;
    btn.innerHTML = `<span class="loading-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;"></span> ${originalText || 'অপেক্ষা করুন...'}`;
  } else {
    btn.disabled = false;
    btn.textContent = originalText || btn.dataset.original || 'Submit';
  }
}

/* Auth State Observer */
function initAuthObserver() {
  onAuthStateChanged(auth, (user) => {
    hideLoading();
    if (user) {
      State.currentUser = user;
      showApp(user);
    } else {
      State.currentUser = null;
      showAuth();
    }
  });
}

/* Show Auth Page */
function showAuth() {
  DOM.authPage()?.classList.remove('hidden');
  DOM.appPage()?.classList.add('hidden');
  /* Reset forms */
  DOM.adminForm()?.reset();
  DOM.emailForm()?.reset();
  clearAuthAlert();
}

/* Show App */
function showApp(user) {
  DOM.authPage()?.classList.add('hidden');
  DOM.appPage()?.classList.remove('hidden');
  updateUserUI(user);
  loadPage('dashboard');
  initRealtimeListeners();
}

/* Update User Info in UI */
function updateUserUI(user) {
  const name   = user.displayName || user.email?.split('@')[0] || 'Admin';
  const initials = getInitials(name);

  /* Sidebar */
  const nameEl = DOM.userName();
  const roleEl = DOM.userRole();
  if (nameEl) nameEl.textContent = name;
  if (roleEl) roleEl.textContent = 'অ্যাডমিন';

  /* Avatar */
  [DOM.userAvatar(), DOM.headerAvatar()].forEach(el => {
    if (!el) return;
    if (user.photoURL) {
      el.innerHTML = `<img src="${user.photoURL}" alt="${name}">`;
    } else {
      el.textContent = initials;
    }
  });
}

/* ══════════════════════════════════════════
   SIDEBAR & NAVIGATION
══════════════════════════════════════════ */
function initSidebar() {
  const sidebar  = DOM.sidebar();
  const overlay  = DOM.sidebarOverlay();
  const toggle   = DOM.sidebarToggle();
  const main     = document.querySelector('.main-content');

  if (!sidebar || !toggle) return;

  toggle.addEventListener('click', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      sidebar.classList.toggle('mobile-open');
      overlay?.classList.toggle('show');
    } else {
      State.sidebarCollapsed = !State.sidebarCollapsed;
      sidebar.classList.toggle('collapsed', State.sidebarCollapsed);
      main?.classList.toggle('expanded', State.sidebarCollapsed);
    }
  });

  overlay?.addEventListener('click', closeMobileSidebar);

  /* Nav Items */
  DOM.navItems().forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) {
        loadPage(page);
        if (window.innerWidth <= 768) closeMobileSidebar();
      }
    });
  });

  /* Quick Links in Dashboard */
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', () => loadPage(el.dataset.goto));
  });

  /* Logout */
  DOM.logoutBtn()?.addEventListener('click', handleLogout);
}

function closeMobileSidebar() {
  DOM.sidebar()?.classList.remove('mobile-open');
  DOM.sidebarOverlay()?.classList.remove('show');
}

/* Load Page */
function loadPage(page) {
  State.currentPage = page;

  /* Update nav active state */
  DOM.navItems().forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  /* Update page title */
  const titleEl = DOM.pageTitle();
  if (titleEl) titleEl.textContent = pageTitles[page] || page;

  /* Show/hide sections */
  DOM.pageSections().forEach(section => {
    section.classList.toggle('active', section.id === `page-${page}`);
  });

  /* Page-specific loading */
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'students':  renderStudents();  break;
    case 'teachers':  renderTeachers();  break;
    case 'routine':   renderRoutine();   break;
    case 'search':    /* search is interactive */ break;
  }
}

/* ══════════════════════════════════════════
   FIRESTORE REALTIME LISTENERS
══════════════════════════════════════════ */
function initRealtimeListeners() {
  /* Students listener */
  const studentUnsub = onSnapshot(
    query(collection(db, 'students'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      State.students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (State.currentPage === 'students')  renderStudents();
      if (State.currentPage === 'dashboard') renderDashboard();
      updateNavBadge('students', State.students.filter(s => s.status === 'active').length);
    },
    (err) => console.error('Students listener error:', err)
  );

  /* Teachers listener */
  const teacherUnsub = onSnapshot(
    query(collection(db, 'teachers'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      State.teachers = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (State.currentPage === 'teachers')  renderTeachers();
      if (State.currentPage === 'dashboard') renderDashboard();
      updateNavBadge('teachers', State.teachers.filter(t => t.status === 'active').length);
      updateRoutineTeacherOptions();
    },
    (err) => console.error('Teachers listener error:', err)
  );

  /* Routines listener */
  const routineUnsub = onSnapshot(
    query(collection(db, 'routines'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      State.routines = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (State.currentPage === 'routine')   renderRoutine();
      if (State.currentPage === 'dashboard') renderDashboard();
    },
    (err) => console.error('Routines listener error:', err)
  );

  State.unsubscribers.push(studentUnsub, teacherUnsub, routineUnsub);
}

/* Update nav badge count */
function updateNavBadge(page, count) {
  const navItem = document.querySelector(`.nav-item[data-page="${page}"] .nav-badge`);
  if (navItem) navItem.textContent = count;
}

/* ══════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════ */
function renderDashboard() {
  const activeStudents = State.students.filter(s => s.status === 'active').length;
  const activeTeachers = State.teachers.filter(t => t.status === 'active').length;
  const classes        = [...new Set(State.students.map(s => s.class))].filter(Boolean).length;
  const routineCount   = State.routines.length;

  /* Stats */
  animateCounter(DOM.statStudents(), activeStudents);
  animateCounter(DOM.statTeachers(), activeTeachers);
  animateCounter(DOM.statClasses(),  classes);
  animateCounter(DOM.statRoutines(), routineCount);

  /* Recent Activity */
  renderRecentActivity();
}

/* Animated number counter */
function animateCounter(el, target) {
  if (!el) return;
  const start    = parseInt(el.textContent) || 0;
  const duration = 600;
  const step     = (target - start) / (duration / 16);
  let current    = start;

  const timer = setInterval(() => {
    current += step;
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

/* Recent Activity Feed */
function renderRecentActivity() {
  const el = DOM.recentActivity();
  if (!el) return;

  const recent = [
    ...State.students.slice(0, 3).map(s => ({
      text: `নতুন শিক্ষার্থী যুক্ত: ${s.name}`,
      time: s.createdAt ? formatDate(s.createdAt) : 'সম্প্রতি',
      dot:  'green'
    })),
    ...State.teachers.slice(0, 2).map(t => ({
      text: `নতুন শিক্ষক যুক্ত: ${t.name}`,
      time: t.createdAt ? formatDate(t.createdAt) : 'সম্প্রতি',
      dot:  'blue'
    })),
  ];

  if (recent.length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:24px;">
      <div class="empty-icon">📋</div>
      <p class="empty-desc">কোনো কার্যক্রম নেই</p>
    </div>`;
    return;
  }

  el.innerHTML = recent.map(a => `
    <div class="activity-item">
      <div class="activity-dot ${a.dot}"></div>
      <div class="activity-text">${a.text}</div>
      <div class="activity-time">${a.time}</div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   STUDENT MANAGEMENT
══════════════════════════════════════════ */

/* Render Student Table */
function renderStudents() {
  const search  = DOM.studentSearch()?.value?.toLowerCase() || '';
  const cls     = DOM.studentClass()?.value || '';

  let filtered = State.students.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search) ||
      s.studentId?.toLowerCase().includes(search) ||
      s.phone?.includes(search);
    const matchClass = !cls || s.class === cls;
    return matchSearch && matchClass;
  });

  const total      = filtered.length;
  const totalPages = Math.ceil(total / State.itemsPerPage);
  if (State.studentPage > totalPages) State.studentPage = 1;

  const start  = (State.studentPage - 1) * State.itemsPerPage;
  const paged  = filtered.slice(start, start + State.itemsPerPage);

  /* Count */
  const countEl = DOM.studentCount();
  if (countEl) countEl.textContent = total;

  /* Info */
  const infoEl = DOM.studentInfo();
  if (infoEl) {
    infoEl.textContent = total > 0
      ? `${start + 1}-${Math.min(start + State.itemsPerPage, total)} / মোট ${total} জন`
      : 'কোনো শিক্ষার্থী নেই';
  }

  /* Table */
  const tbody = DOM.studentTableBody();
  if (!tbody) return;

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">👩‍🎓</div>
        <div class="empty-title">কোনো শিক্ষার্থী পাওয়া যায়নি</div>
        <div class="empty-desc">নতুন শিক্ষার্থী যোগ করুন অথবা ফিল্টার পরিবর্তন করুন</div>
      </div>
    </td></tr>`;
  } else {
    tbody.innerHTML = paged.map((s, i) => `
      <tr>
        <td>${start + i + 1}</td>
        <td>
          <div class="cell-avatar">
            <div class="mini-avatar">${getInitials(s.name)}</div>
            <div>
              <div class="cell-name">${s.name || ''}</div>
              <div class="cell-sub">${s.studentId || ''}</div>
            </div>
          </div>
        </td>
        <td>${s.class || ''} ${s.section || ''}</td>
        <td>${s.roll || '-'}</td>
        <td>${s.phone || '-'}</td>
        <td>${badgeHTML(s.status)}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" title="দেখুন" onclick="viewStudent('${s.id}')">👁️</button>
            <button class="action-btn edit" title="সম্পাদনা" onclick="editStudent('${s.id}')">✏️</button>
            <button class="action-btn del"  title="মুছুন"    onclick="confirmDelete('students','${s.id}','${s.name}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  /* Pagination */
  renderPagination(DOM.studentPagination(), totalPages, State.studentPage, (p) => {
    State.studentPage = p;
    renderStudents();
  });
}

/* View Student */
function viewStudent(id) {
  const s = State.students.find(x => x.id === id);
  if (!s) return;

  const titleEl   = DOM.viewModalTitle();
  const contentEl = DOM.viewContent();
  if (titleEl)   titleEl.textContent = '👩‍🎓 শিক্ষার্থীর বিবরণ';
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar-lg">${getInitials(s.name)}</div>
        <div>
          <div class="profile-name">${s.name || ''}</div>
          <div class="profile-meta">${s.class || ''} ${s.section || ''} • রোল: ${s.roll || 'N/A'}</div>
          <div style="margin-top:8px;">${badgeHTML(s.status)}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">শিক্ষার্থী আইডি</div><div class="detail-value">${s.studentId || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">শ্রেণি</div><div class="detail-value">${s.class || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">শাখা</div><div class="detail-value">${s.section || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">রোল নম্বর</div><div class="detail-value">${s.roll || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">মোবাইল নম্বর</div><div class="detail-value">${s.phone || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">অভিভাবক</div><div class="detail-value">${s.guardian || 'N/A'}</div></div>
        <div class="detail-item detail-full"><div class="detail-label">ঠিকানা</div><div class="detail-value">${s.address || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">যোগদানের তারিখ</div><div class="detail-value">${formatDate(s.createdAt)}</div></div>
      </div>
    `;
  }
  openModal('view-modal');
}

/* Edit Student */
function editStudent(id) {
  const s = State.students.find(x => x.id === id);
  if (!s) return;

  State.editingId = id;
  const titleEl = DOM.studentModalTitle();
  if (titleEl) titleEl.textContent = '✏️ শিক্ষার্থী সম্পাদনা';

  setStudentForm(s);
  openModal('student-modal');
}

/* Set Student Form Values */
function setStudentForm(s = {}) {
  const fields = {
    's-name':    s.name     || '',
    's-id':      s.studentId|| '',
    's-class':   s.class    || '',
    's-section': s.section  || '',
    's-roll':    s.roll     || '',
    's-phone':   s.phone    || '',
    's-guardian':s.guardian || '',
    's-address': s.address  || '',
    's-status':  s.status   || 'active',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

/* Save Student (Add / Edit) */
async function saveStudent() {
  const name     = DOM.sName()?.value?.trim();
  const studentId= DOM.sId()?.value?.trim();
  const cls      = DOM.sClass()?.value;
  const section  = DOM.sSection()?.value?.trim();
  const roll     = DOM.sRoll()?.value?.trim();
  const phone    = DOM.sPhone()?.value?.trim();
  const guardian = DOM.sGuardian()?.value?.trim();
  const address  = DOM.sAddress()?.value?.trim();
  const status   = DOM.sStatus()?.value;

  if (!name) { showToast('শিক্ষার্থীর নাম লিখুন।', 'warning'); return; }
  if (!cls)  { showToast('শ্রেণি নির্বাচন করুন।', 'warning');  return; }

  const btn = DOM.studentSaveBtn();
  setButtonLoading(btn, true, 'সংরক্ষণ হচ্ছে...');

  const data = { name, studentId, class: cls, section, roll, phone, guardian, address, status };

  try {
    if (State.editingId) {
      await updateDoc(doc(db, 'students', State.editingId), {
        ...data, updatedAt: serverTimestamp()
      });
      showToast('শিক্ষার্থীর তথ্য আপডেট হয়েছে।', 'success');
    } else {
      await addDoc(collection(db, 'students'), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      showToast('নতুন শিক্ষার্থী যোগ করা হয়েছে।', 'success');
    }
    closeModal('student-modal');
  } catch (err) {
    console.error(err);
    showToast('সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
  } finally {
    setButtonLoading(btn, false, '💾 সংরক্ষণ করুন');
  }
}

/* ══════════════════════════════════════════
   TEACHER MANAGEMENT
══════════════════════════════════════════ */

/* Render Teacher Table */
function renderTeachers() {
  const search = DOM.teacherSearch()?.value?.toLowerCase() || '';
  const dept   = DOM.teacherDept()?.value || '';

  let filtered = State.teachers.filter(t => {
    const matchSearch = !search ||
      t.name?.toLowerCase().includes(search) ||
      t.phone?.includes(search) ||
      t.designation?.toLowerCase().includes(search);
    const matchDept = !dept || t.department === dept;
    return matchSearch && matchDept;
  });

  const total      = filtered.length;
  const totalPages = Math.ceil(total / State.itemsPerPage);
  if (State.teacherPage > totalPages) State.teacherPage = 1;

  const start = (State.teacherPage - 1) * State.itemsPerPage;
  const paged = filtered.slice(start, start + State.itemsPerPage);

  /* Count */
  const countEl = DOM.teacherCount();
  if (countEl) countEl.textContent = total;

  const infoEl = DOM.teacherInfo();
  if (infoEl) {
    infoEl.textContent = total > 0
      ? `${start + 1}-${Math.min(start + State.itemsPerPage, total)} / মোট ${total} জন`
      : 'কোনো শিক্ষক নেই';
  }

  const tbody = DOM.teacherTableBody();
  if (!tbody) return;

  if (paged.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">👩‍🏫</div>
        <div class="empty-title">কোনো শিক্ষক পাওয়া যায়নি</div>
        <div class="empty-desc">নতুন শিক্ষক যোগ করুন</div>
      </div>
    </td></tr>`;
  } else {
    tbody.innerHTML = paged.map((t, i) => `
      <tr>
        <td>${start + i + 1}</td>
        <td>
          <div class="cell-avatar">
            <div class="mini-avatar" style="background:linear-gradient(135deg,#3b82f6,#1d4ed8)">${getInitials(t.name)}</div>
            <div>
              <div class="cell-name">${t.name || ''}</div>
              <div class="cell-sub">${t.designation || ''}</div>
            </div>
          </div>
        </td>
        <td>${t.department || '-'}</td>
        <td>${t.subject || '-'}</td>
        <td>${t.phone || '-'}</td>
        <td>${badgeHTML(t.status)}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" title="দেখুন" onclick="viewTeacher('${t.id}')">👁️</button>
            <button class="action-btn edit" title="সম্পাদনা" onclick="editTeacher('${t.id}')">✏️</button>
            <button class="action-btn del"  title="মুছুন"    onclick="confirmDelete('teachers','${t.id}','${t.name}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderPagination(DOM.teacherPagination(), totalPages, State.teacherPage, (p) => {
    State.teacherPage = p;
    renderTeachers();
  });
}

/* View Teacher */
function viewTeacher(id) {
  const t = State.teachers.find(x => x.id === id);
  if (!t) return;

  const titleEl   = DOM.viewModalTitle();
  const contentEl = DOM.viewContent();
  if (titleEl)   titleEl.textContent = '👩‍🏫 শিক্ষকের বিবরণ';
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar-lg" style="background:rgba(59,130,246,0.2)">${getInitials(t.name)}</div>
        <div>
          <div class="profile-name">${t.name || ''}</div>
          <div class="profile-meta">${t.designation || ''} • ${t.department || ''}</div>
          <div style="margin-top:8px;">${badgeHTML(t.status)}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">বিভাগ</div><div class="detail-value">${t.department || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">বিষয়</div><div class="detail-value">${t.subject || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">মোবাইল</div><div class="detail-value">${t.phone || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">ইমেইল</div><div class="detail-value">${t.email || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">যোগদান</div><div class="detail-value">${t.joiningDate || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">পদবি</div><div class="detail-value">${t.designation || 'N/A'}</div></div>
        <div class="detail-item"><div class="detail-label">যোগদানের তারিখ (DB)</div><div class="detail-value">${formatDate(t.createdAt)}</div></div>
      </div>
    `;
  }
  openModal('view-modal');
}

/* Edit Teacher */
function editTeacher(id) {
  const t = State.teachers.find(x => x.id === id);
  if (!t) return;

  State.editingId = id;
  const titleEl = DOM.teacherModalTitle();
  if (titleEl) titleEl.textContent = '✏️ শিক্ষক সম্পাদনা';

  setTeacherForm(t);
  openModal('teacher-modal');
}

/* Set Teacher Form Values */
function setTeacherForm(t = {}) {
  const fields = {
    't-name':        t.name        || '',
    't-designation': t.designation || '',
    't-dept':        t.department  || '',
    't-phone':       t.phone       || '',
    't-email':       t.email       || '',
    't-subject':     t.subject     || '',
    't-joining':     t.joiningDate || '',
    't-status':      t.status      || 'active',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

/* Save Teacher */
async function saveTeacher() {
  const name        = DOM.tName()?.value?.trim();
  const designation = DOM.tDesignation()?.value?.trim();
  const department  = DOM.tDept()?.value;
  const phone       = DOM.tPhone()?.value?.trim();
  const email       = DOM.tEmail()?.value?.trim();
  const subject     = DOM.tSubject()?.value?.trim();
  const joiningDate = DOM.tJoining()?.value;
  const status      = DOM.tStatus()?.value;

  if (!name) { showToast('শিক্ষকের নাম লিখুন।', 'warning'); return; }

  const btn = DOM.teacherSaveBtn();
  setButtonLoading(btn, true, 'সংরক্ষণ হচ্ছে...');

  const data = { name, designation, department, phone, email, subject, joiningDate, status };

  try {
    if (State.editingId) {
      await updateDoc(doc(db, 'teachers', State.editingId), {
        ...data, updatedAt: serverTimestamp()
      });
      showToast('শিক্ষকের তথ্য আপডেট হয়েছে।', 'success');
    } else {
      await addDoc(collection(db, 'teachers'), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      showToast('নতুন শিক্ষক যোগ করা হয়েছে।', 'success');
    }
    closeModal('teacher-modal');
  } catch (err) {
    console.error(err);
    showToast('সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
  } finally {
    setButtonLoading(btn, false, '💾 সংরক্ষণ করুন');
  }
}

/* Update Teacher options in Routine Modal */
function updateRoutineTeacherOptions() {
  const sel = DOM.rTeacher();
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">-- শিক্ষক নির্বাচন করুন --</option>` +
    State.teachers
      .filter(t => t.status === 'active')
      .map(t => `<option value="${t.name}">${t.name} (${t.subject || t.department || ''})</option>`)
      .join('');
  sel.value = current;
}

/* ══════════════════════════════════════════
   ROUTINE MANAGEMENT
══════════════════════════════════════════ */

/* Render Routine Table */
function renderRoutine() {
  const cls = DOM.routineClass()?.value || '';
  const day = DOM.routineDay()?.value  || '';

  const days = ['শনিবার','রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার'];
  const periods = ['১ম পিরিয়ড','২য় পিরিয়ড','৩য় পিরিয়ড','৪র্থ পিরিয়ড','৫ম পিরিয়ড','৬ষ্ঠ পিরিয়ড'];

  let filtered = State.routines.filter(r => {
    return (!cls || r.class === cls) && (!day || r.day === day);
  });

  const tbody = DOM.routineTableBody();
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${days.length + 1}">
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <div class="empty-title">কোনো রুটিন পাওয়া যায়নি</div>
        <div class="empty-desc">নতুন রুটিন যোগ করুন</div>
      </div>
    </td></tr>`;
    return;
  }

  /* Build a map: period → day → routine */
  const routineMap = {};
  filtered.forEach(r => {
    if (!routineMap[r.period]) routineMap[r.period] = {};
    routineMap[r.period][r.day] = r;
  });

  const filteredDays = day ? [day] : days;

  tbody.innerHTML = periods.map(period => `
    <tr>
      <td><strong>${period}</strong></td>
      ${filteredDays.map(d => {
        const r = routineMap[period]?.[d];
        if (!r) return `<td><span style="color:var(--text-muted);font-size:12px;">—</span></td>`;
        return `<td>
          <div class="routine-cell">
            <div class="rc-subject">${r.subject || ''}</div>
            <div class="rc-teacher">${r.teacher || ''}</div>
            <div class="rc-teacher" style="font-size:10px;">${r.time || ''}</div>
            <div style="margin-top:4px;display:flex;gap:4px;justify-content:flex-end;">
              <button class="action-btn edit" style="width:24px;height:24px;font-size:11px;" onclick="editRoutine('${r.id}')">✏️</button>
              <button class="action-btn del"  style="width:24px;height:24px;font-size:11px;" onclick="confirmDelete('routines','${r.id}','${r.subject}')">🗑️</button>
            </div>
          </div>
        </td>`;
      }).join('')}
    </tr>
  `).join('');
}

/* Edit Routine */
function editRoutine(id) {
  const r = State.routines.find(x => x.id === id);
  if (!r) return;

  State.editingId = id;
  const titleEl = DOM.routineModalTitle();
  if (titleEl) titleEl.textContent = '✏️ রুটিন সম্পাদনা';

  setRoutineForm(r);
  openModal('routine-modal');
}

/* Set Routine Form */
function setRoutineForm(r = {}) {
  const fields = {
    'r-class':   r.class   || '',
    'r-day':     r.day     || '',
    'r-period':  r.period  || '',
    'r-subject': r.subject || '',
    'r-teacher': r.teacher || '',
    'r-time':    r.time    || '',
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
}

/* Save Routine */
async function saveRoutine() {
  const cls     = DOM.rClass()?.value;
  const day     = DOM.rDay()?.value;
  const period  = DOM.rPeriod()?.value;
  const subject = DOM.rSubject()?.value?.trim();
  const teacher = DOM.rTeacher()?.value;
  const time    = DOM.rTime()?.value?.trim();

  if (!cls)     { showToast('শ্রেণি নির্বাচন করুন।', 'warning');  return; }
  if (!day)     { showToast('দিন নির্বাচন করুন।', 'warning');     return; }
  if (!period)  { showToast('পিরিয়ড নির্বাচন করুন।', 'warning'); return; }
  if (!subject) { showToast('বিষয়ের নাম লিখুন।', 'warning');     return; }

  const btn = DOM.routineSaveBtn();
  setButtonLoading(btn, true, 'সংরক্ষণ হচ্ছে...');

  const data = { class: cls, day, period, subject, teacher, time };

  try {
    if (State.editingId) {
      await updateDoc(doc(db, 'routines', State.editingId), {
        ...data, updatedAt: serverTimestamp()
      });
      showToast('রুটিন আপডেট হয়েছে।', 'success');
    } else {
      await addDoc(collection(db, 'routines'), {
        ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      showToast('নতুন রুটিন যোগ করা হয়েছে।', 'success');
    }
    closeModal('routine-modal');
  } catch (err) {
    console.error(err);
    showToast('সংরক্ষণ ব্যর্থ হয়েছে।', 'error');
  } finally {
    setButtonLoading(btn, false, '💾 সংরক্ষণ করুন');
  }
}

/* ══════════════════════════════════════════
   DELETE SYSTEM
══════════════════════════════════════════ */
function confirmDelete(collectionName, id, name) {
  State.deleteTarget = { collection: collectionName, id, name };
  const nameEl = DOM.confirmName();
  if (nameEl) nameEl.textContent = name;
  openModal('confirm-modal');
}

async function executeDelete() {
  const { collection: col, id, name } = State.deleteTarget;
  if (!col || !id) return;

  const btn = DOM.confirmYesBtn();
  setButtonLoading(btn, true, 'মুছছে...');

  try {
    await deleteDoc(doc(db, col, id));
    showToast(`"${name}" সফলভাবে মুছে ফেলা হয়েছে।`, 'success');
    closeModal('confirm-modal');
  } catch (err) {
    console.error(err);
    showToast('মুছতে ব্যর্থ হয়েছে।', 'error');
  } finally {
    setButtonLoading(btn, false, '🗑️ হ্যাঁ, মুছুন');
    State.deleteTarget = { collection: null, id: null, name: '' };
  }
}

/* ══════════════════════════════════════════
   SEARCH SYSTEM
══════════════════════════════════════════ */
function performSearch(query) {
  const q   = query.toLowerCase().trim();
  const el  = DOM.searchResults();
  if (!el) return;

  if (!q) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-title">কিছু খুঁজুন</div>
      <div class="empty-desc">শিক্ষার্থী, শিক্ষক বা বিষয়ের নাম লিখুন</div>
    </div>`;
    return;
  }

  const studentResults = State.students.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.studentId?.toLowerCase().includes(q) ||
    s.class?.toLowerCase().includes(q) ||
    s.phone?.includes(q)
  ).map(s => ({ ...s, _type: 'student', _typeLabel: '👩‍🎓 শিক্ষার্থী', _typeClass: 'badge-green' }));

  const teacherResults = State.teachers.filter(t =>
    t.name?.toLowerCase().includes(q) ||
    t.subject?.toLowerCase().includes(q) ||
    t.department?.toLowerCase().includes(q) ||
    t.phone?.includes(q)
  ).map(t => ({ ...t, _type: 'teacher', _typeLabel: '👩‍🏫 শিক্ষক', _typeClass: 'badge-blue' }));

  const all = [...studentResults, ...teacherResults];

  if (all.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-icon">😕</div>
      <div class="empty-title">কিছু পাওয়া যায়নি</div>
      <div class="empty-desc">"${query}" এর জন্য কোনো ফলাফল নেই</div>
    </div>`;
    return;
  }

  el.innerHTML = `
    <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-bottom:12px;">
      "${query}" এর জন্য ${all.length}টি ফলাফল পাওয়া গেছে
    </p>
    ${all.map(item => `
      <div class="search-result-item" onclick="${item._type === 'student' ? `viewStudent('${item.id}')` : `viewTeacher('${item.id}')`}">
        <div class="mini-avatar"
          style="${item._type === 'teacher' ? 'background:linear-gradient(135deg,#3b82f6,#1d4ed8)' : ''}">
          ${getInitials(item.name)}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;">${item.name || ''}</div>
          <div style="font-size:var(--font-size-xs);color:var(--text-muted);">
            ${item._type === 'student'
              ? `${item.class || ''} ${item.section || ''} • রোল: ${item.roll || 'N/A'}`
              : `${item.designation || ''} • ${item.subject || item.department || ''}`
            }
          </div>
        </div>
        <span class="badge ${item._typeClass}">${item._typeLabel}</span>
        <span class="badge badge-gray" style="font-size:10px;">${item.phone || ''}</span>
      </div>
    `).join('')}
  `;
}

/* ══════════════════════════════════════════
   MODAL SYSTEM
══════════════════════════════════════════ */
function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  /* Reset editing state */
  State.editingId = null;
}

function initModals() {
  /* Close on overlay click */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  /* Close buttons */
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  /* ESC key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
  });

  /* Add Student */
  DOM.addStudentBtn()?.addEventListener('click', () => {
    State.editingId = null;
    const titleEl = DOM.studentModalTitle();
    if (titleEl) titleEl.textContent = '➕ নতুন শিক্ষার্থী';
    setStudentForm();
    openModal('student-modal');
  });

  /* Add Teacher */
  DOM.addTeacherBtn()?.addEventListener('click', () => {
    State.editingId = null;
    const titleEl = DOM.teacherModalTitle();
    if (titleEl) titleEl.textContent = '➕ নতুন শিক্ষক';
    setTeacherForm();
    openModal('teacher-modal');
  });

  /* Add Routine */
  DOM.addRoutineBtn()?.addEventListener('click', () => {
    State.editingId = null;
    const titleEl = DOM.routineModalTitle();
    if (titleEl) titleEl.textContent = '➕ নতুন রুটিন';
    setRoutineForm();
    updateRoutineTeacherOptions();
    openModal('routine-modal');
  });

  /* Save Buttons */
  DOM.studentSaveBtn()?.addEventListener('click', saveStudent);
  DOM.teacherSaveBtn()?.addEventListener('click', saveTeacher);
  DOM.routineSaveBtn()?.addEventListener('click', saveRoutine);
  DOM.confirmYesBtn()?.addEventListener('click', executeDelete);
}

/* ══════════════════════════════════════════
   PAGINATION RENDERER
══════════════════════════════════════════ */
function renderPagination(container, totalPages, currentPage, onPageChange) {
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = `
    <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''}
      onclick="(${onPageChange.toString()})(${currentPage - 1})">◀</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      html += `<button class="page-btn ${i === currentPage ? 'active' : ''}"
        onclick="(${onPageChange.toString()})(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span class="page-btn" style="border:none;cursor:default;">…</span>`;
    }
  }

  html += `
    <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}
      onclick="(${onPageChange.toString()})(${currentPage + 1})">▶</button>
  `;

  container.innerHTML = html;
}

/* ══════════════════════════════════════════
   FILTER & SEARCH EVENTS
══════════════════════════════════════════ */
function initFilters() {
  /* Student filters */
  DOM.studentSearch()?.addEventListener('input', debounce(() => {
    State.studentPage = 1;
    renderStudents();
  }, 300));

  DOM.studentClass()?.addEventListener('change', () => {
    State.studentPage = 1;
    renderStudents();
  });

  /* Teacher filters */
  DOM.teacherSearch()?.addEventListener('input', debounce(() => {
    State.teacherPage = 1;
    renderTeachers();
  }, 300));

  DOM.teacherDept()?.addEventListener('change', () => {
    State.teacherPage = 1;
    renderTeachers();
  });

  /* Routine filters */
  DOM.routineClass()?.addEventListener('change', renderRoutine);
  DOM.routineDay()?.addEventListener('change',   renderRoutine);

  /* Header search */
  DOM.headerSearch()?.addEventListener('input', debounce((e) => {
    const q = e.target.value.trim();
    if (q.length > 1) {
      loadPage('search');
      const searchInput = DOM.searchInput();
      if (searchInput) searchInput.value = q;
      performSearch(q);
    }
  }, 400));

  /* Search Page */
  DOM.searchBtn()?.addEventListener('click', () => {
    performSearch(DOM.searchInput()?.value || '');
  });

  DOM.searchInput()?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch(e.target.value);
  });
}

/* Debounce utility */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* ══════════════════════════════════════════
   GLOBAL EXPOSE (for onclick in HTML)
══════════════════════════════════════════ */
window.viewStudent    = viewStudent;
window.editStudent    = editStudent;
window.viewTeacher    = viewTeacher;
window.editTeacher    = editTeacher;
window.editRoutine    = editRoutine;
window.confirmDelete  = confirmDelete;
window.closeModal     = closeModal;
window.openModal      = openModal;

/* ══════════════════════════════════════════
   AUTH FORM EVENTS
══════════════════════════════════════════ */
function initAuthEvents() {
  DOM.adminForm()?.addEventListener('submit',  handleAdminLogin);
  DOM.emailForm()?.addEventListener('submit',  handleEmailLogin);
  DOM.googleBtn()?.addEventListener('click',   handleGoogleLogin);
  DOM.googleBtn2()?.addEventListener('click',  handleGoogleLogin);
}

/* ══════════════════════════════════════════
   APP INITIALIZATION
══════════════════════════════════════════ */
function init() {
  initAuthTabs();
  initPasswordToggles();
  initAuthEvents();
  initSidebar();
  initModals();
  initFilters();
  initAuthObserver(); /* This triggers loading screen hide */
}

/* DOM Ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
