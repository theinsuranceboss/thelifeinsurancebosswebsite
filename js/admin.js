document.addEventListener('DOMContentLoaded', () => {
  // Check if admin mode is active
  const urlParams = new URLSearchParams(window.location.search);
  const isAdminRequest = urlParams.has('admin') || window.location.hash === '#admin';
  let isAdmin = false;

  if (isAdminRequest) {
    if (sessionStorage.getItem('adminAuth') === 'true') {
      isAdmin = true;
    } else {
      const pwd = prompt('Enter Admin Password:');
      if (pwd === 'lifeinsurance') {
        sessionStorage.setItem('adminAuth', 'true');
        isAdmin = true;
      } else {
        alert('Incorrect password. Access denied.');
        window.location.replace(window.location.pathname);
        return;
      }
    }
  }

  // Migrate old localstorage keys to the unified 'adminEdits' namespace if needed
  const migrateOldEdits = () => {
    const adminEdits = JSON.parse(localStorage.getItem('adminEdits') || '{}');
    const legacyKeys = {
      'wholeLifeEdits': 'wholeLifeEdits',
      'universalLifeEdits': 'universalLifeEdits',
      'termLifeEdits': 'termLifeEdits',
      'mortgageProtectionEdits': 'mortgageProtectionEdits',
      'disabilityEdits': 'disabilityEdits'
    };

    let migrated = false;
    for (const [localStorageKey, val] of Object.entries(legacyKeys)) {
      const oldVal = localStorage.getItem(localStorageKey);
      if (oldVal) {
        try {
          const parsed = JSON.parse(oldVal);
          Object.assign(adminEdits, parsed);
          migrated = true;
        } catch (e) {
          console.error('Error parsing old edits:', e);
        }
      }
    }

    if (migrated) {
      localStorage.setItem('adminEdits', JSON.stringify(adminEdits));
    }
    return adminEdits;
  };

  const adminEdits = migrateOldEdits();

  // Find all editable elements
  const editableElements = document.querySelectorAll('[data-admin-key], [data-key], .editable');

  // Apply edits from localStorage
  editableElements.forEach(el => {
    const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
    if (key && adminEdits[key]) {
      if (key === 'social-fb' || key === 'social-ig') {
        el.href = adminEdits[key];
      } else {
        el.innerHTML = adminEdits[key];
      }
    }
  });

  // Apply banner image override from localStorage if present
  const currentPath = window.location.pathname;
  const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1).replace('.html', '') || 'index';
  const pageKey = 'banner_' + pageName;
  if (adminEdits[pageKey]) {
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg) {
      heroBg.style.backgroundImage = `url('${adminEdits[pageKey]}')`;
    }
  }

  if (isAdmin) {
    // Hide legacy admin buttons and panels if they exist
    const legacyBtn = document.querySelector('.admin-btn');
    if (legacyBtn) legacyBtn.style.display = 'none';
    const legacyDashboard = document.getElementById('adminDashboard');
    if (legacyDashboard) legacyDashboard.style.display = 'none';
    const legacyLogin = document.getElementById('adminLogin');
    if (legacyLogin) legacyLogin.style.display = 'none';

    // Inject visual edit CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
      [data-admin-key], [data-key], .editable {
        cursor: text !important;
        transition: all 0.2s ease;
        position: relative;
      }
      [data-admin-key]:hover, [data-key]:hover, .editable:hover {
        outline: 2px dashed #FAC000 !important;
        outline-offset: 4px !important;
        background: rgba(250, 192, 0, 0.1) !important;
      }
      [data-admin-key]:focus, [data-key]:focus, .editable:focus {
        outline: 2px solid #FAC000 !important;
        outline-offset: 4px !important;
        background: rgba(250, 192, 0, 0.15) !important;
      }
      body {
        padding-right: 320px !important;
      }
      @media (max-width: 1024px) {
        body {
          padding-right: 0 !important;
          padding-bottom: 320px !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Make elements contenteditable
    editableElements.forEach(el => {
      const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
      if (key !== 'social-fb' && key !== 'social-ig') {
        el.contentEditable = 'true';
      }
      // Prevent ENTER key on small titles / badge tags
      if (el.tagName !== 'P' && el.tagName !== 'TEXTAREA') {
        el.addEventListener('keypress', e => {
          if (e.key === 'Enter') e.preventDefault();
        });
      }
    });

    // Automatically append ?admin=true to all internal links so the user stays in admin mode
    document.querySelectorAll('a').forEach(a => {
      let href = a.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('tel:') && !href.startsWith('mailto:') && !href.startsWith('#')) {
        try {
          // Normalize to clean URL
          href = href.replace(/\.html$/, '').replace(/\.html\?/, '?').replace(/\.html#/, '#');
          
          if (href.indexOf('?') > -1) {
            a.setAttribute('href', href.replace('?', '?admin=true&'));
          } else if (href.indexOf('#') > -1) {
            const parts = href.split('#');
            a.setAttribute('href', parts[0] + '?admin=true#' + parts[1]);
          } else {
            a.setAttribute('href', href + '?admin=true');
          }
        } catch (e) {
          console.error('Error rewriting link:', e);
        }
      }
    });

    // Create the sidebar HTML
    const sidebar = document.createElement('div');
    sidebar.id = 'visual-admin-sidebar';
    sidebar.className = 'fixed top-0 right-0 w-[320px] h-full bg-neutral-900 border-l border-neutral-800 z-[99999] p-6 shadow-2xl overflow-y-auto flex flex-col text-neutral-200';
    
    // Add mobile responsiveness to sidebar positioning
    const sidebarStyle = document.createElement('style');
    sidebarStyle.innerHTML = `
      @media (max-width: 1024px) {
        #visual-admin-sidebar {
          width: 100% !important;
          height: 320px !important;
          top: auto !important;
          bottom: 0 !important;
          border-l-0 !important;
          border-t: 1px solid #262626 !important;
        }
      }
    `;
    document.head.appendChild(sidebarStyle);

    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index';
    
    const isLanding = pageName === 'index.html' || pageName === 'index' || pageName === '';
    const isWhole = pageName === 'whole-life.html' || pageName === 'whole-life';
    const isUniversal = pageName === 'universal-life.html' || pageName === 'universal-life';
    const isTerm = pageName === 'term-life.html' || pageName === 'term-life';
    const isMortgage = pageName === 'mortgage-protection.html' || pageName === 'mortgage-protection';
    const isDisability = pageName === 'disability-insurance.html' || pageName === 'disability-insurance';

    sidebar.innerHTML = `
      <div class="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 class="text-xl font-bold text-yellow-400 flex items-center space-x-2">
          <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg>
          <span>Visual Admin</span>
        </h2>
        <span class="text-xs bg-neutral-800 text-neutral-400 px-2.5 py-1 rounded-full border border-neutral-700 font-mono">${pageName}</span>
      </div>
      
      <p class="text-xs text-neutral-400 mb-6 leading-relaxed flex-shrink-0">
        Hover and click directly on any dotted text element on the webpage to edit it.
      </p>

      <button id="admin-save-btn" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold mb-6 shadow-lg hover:from-green-400 hover:to-emerald-500 transition-all flex items-center justify-center space-x-2 flex-shrink-0">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span>Save Page Changes</span>
      </button>

      <div class="space-y-5 flex-1 overflow-y-auto pr-1">
        <!-- CHATBOT SETTINGS -->
        <div class="bg-neutral-800/60 p-4 rounded-xl border border-neutral-800">
          <h3 class="text-sm font-semibold text-white mb-2 flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
            <span>Chatbot Configuration</span>
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-neutral-400 mb-1">Google Drive KB Link</label>
              <input type="text" id="admin-drive-link" placeholder="https://drive.google.com/..." class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none transition-colors">
            </div>
            <button id="admin-drive-save" class="w-full bg-neutral-700 text-white py-2 rounded-lg text-xs font-semibold hover:bg-neutral-600 transition-colors">Update Chatbot</button>
          </div>
        </div>

        <!-- BANNER SETTINGS -->
        <div class="bg-neutral-800/60 p-4 rounded-xl border border-neutral-800">
          <h3 class="text-sm font-semibold text-white mb-2 flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            <span>Hero Banner Image</span>
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-neutral-400 mb-1">Image URL / Drive Link</label>
              <input type="text" id="admin-banner-link" placeholder="https://..." class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none transition-colors">
            </div>
            <div>
              <label class="block text-[11px] text-neutral-400 mb-1">Or Upload Local Image</label>
              <input type="file" id="admin-banner-upload" accept="image/*" class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white focus:border-yellow-400 focus:outline-none transition-colors">
            </div>
            <button id="admin-banner-save" class="w-full bg-neutral-700 text-white py-2 rounded-lg text-xs font-semibold hover:bg-neutral-600 transition-colors">Update Banner</button>
          </div>
        </div>

        <!-- SITE MAP / NAVIGATION -->
        <div class="bg-neutral-800/60 p-4 rounded-xl border border-neutral-800">
          <h3 class="text-sm font-semibold text-white mb-3 flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 12l5-2.5M9 7l5-2.5M9 7v12m5-14.5l5.447 2.724A1 1 0 0120 5.618v10.764a1 1 0 01-.553.894L14 20M14 7v12"/></svg>
            <span>Navigate & Edit Subpages</span>
          </h3>
          <div class="flex flex-col space-y-2.5">
            <a href="/?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isLanding ? 'text-yellow-400 font-semibold' : ''}">Landing Page</span>
              <span>&rarr;</span>
            </a>
            <a href="whole-life?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isWhole ? 'text-yellow-400 font-semibold' : ''}">Whole Life</span>
              <span>&rarr;</span>
            </a>
            <a href="universal-life?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isUniversal ? 'text-yellow-400 font-semibold' : ''}">Universal Life</span>
              <span>&rarr;</span>
            </a>
            <a href="term-life?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isTerm ? 'text-yellow-400 font-semibold' : ''}">Term Life</span>
              <span>&rarr;</span>
            </a>
            <a href="mortgage-protection?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isMortgage ? 'text-yellow-400 font-semibold' : ''}">Mortgage Protection</span>
              <span>&rarr;</span>
            </a>
            <a href="disability-insurance?admin=true" class="text-xs text-neutral-300 hover:text-yellow-400 transition-colors flex items-center justify-between p-1.5 rounded hover:bg-neutral-800/40">
              <span class="${isDisability ? 'text-yellow-400 font-semibold' : ''}">Disability Insurance</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>
        <!-- SOCIAL LINKS -->
        <div class="bg-neutral-800/60 p-4 rounded-xl border border-neutral-800">
          <h3 class="text-sm font-semibold text-white mb-3 flex items-center space-x-1.5">
            <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            <span>Social Links</span>
          </h3>
          <div class="space-y-3">
            <div>
              <label class="block text-[11px] text-neutral-400 mb-1">Facebook Link</label>
              <input type="text" id="admin-social-fb" placeholder="https://facebook.com/..." class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none transition-colors">
            </div>
            <div>
              <label class="block text-[11px] text-neutral-400 mb-1">Instagram Link</label>
              <input type="text" id="admin-social-ig" placeholder="https://instagram.com/..." class="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:border-yellow-400 focus:outline-none transition-colors">
            </div>
            <button id="admin-social-save" class="w-full bg-neutral-700 text-white py-2 rounded-lg text-xs font-semibold hover:bg-neutral-600 transition-colors">Update Social Links</button>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-neutral-800 flex-shrink-0">
        <button id="admin-exit-btn" class="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-lg text-xs font-semibold transition-colors">
          Exit Admin Mode
        </button>
      </div>
    `;
    document.body.appendChild(sidebar);

    // Load Social Links
    const fbInput = document.getElementById('admin-social-fb');
    const igInput = document.getElementById('admin-social-ig');
    if (fbInput && igInput) {
      fbInput.value = adminEdits['social-fb'] || '';
      igInput.value = adminEdits['social-ig'] || '';
      
      document.getElementById('admin-social-save').addEventListener('click', () => {
        adminEdits['social-fb'] = fbInput.value.trim();
        adminEdits['social-ig'] = igInput.value.trim();
        localStorage.setItem('adminEdits', JSON.stringify(adminEdits));
        
        document.querySelectorAll('[data-admin-key="social-fb"]').forEach(el => el.href = adminEdits['social-fb'] || '#');
        document.querySelectorAll('[data-admin-key="social-ig"]').forEach(el => el.href = adminEdits['social-ig'] || '#');
        
        const btn = document.getElementById('admin-social-save');
        const orig = btn.innerText;
        btn.innerText = 'Updated!';
        btn.classList.replace('bg-neutral-700', 'bg-green-600');
        setTimeout(() => {
          btn.innerText = orig;
          btn.classList.replace('bg-green-600', 'bg-neutral-700');
        }, 1500);
      });
    }


    // Load Chatbot KB link
    const driveInput = document.getElementById('admin-drive-link');
    if (driveInput) {
      driveInput.value = localStorage.getItem('chatbotKnowledgeBase') || '';
      
      document.getElementById('admin-drive-save').addEventListener('click', () => {
        localStorage.setItem('chatbotKnowledgeBase', driveInput.value);
        const btn = document.getElementById('admin-drive-save');
        const orig = btn.innerText;
        btn.innerText = 'Saved!';
        btn.classList.replace('bg-neutral-700', 'bg-green-600');
        setTimeout(() => {
          btn.innerText = orig;
          btn.classList.replace('bg-green-600', 'bg-neutral-700');
        }, 1500);
      });
    }

    // Load Banner Image settings
    const bannerInput = document.getElementById('admin-banner-link');
    const bannerUpload = document.getElementById('admin-banner-upload');
    const bannerSaveBtn = document.getElementById('admin-banner-save');

    if (bannerInput && bannerSaveBtn) {
      const currentBanner = adminEdits[pageKey] || '';
      if (currentBanner && !currentBanner.startsWith('data:')) {
        bannerInput.value = currentBanner;
      }

      bannerSaveBtn.addEventListener('click', () => {
        const file = bannerUpload.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(e) {
            const dataUrl = e.target.result;
            saveBanner(dataUrl);
          };
          reader.readAsDataURL(file);
        } else {
          let url = bannerInput.value.trim();
          if (url) {
            url = convertDriveUrl(url);
            saveBanner(url);
          } else {
            delete adminEdits[pageKey];
            localStorage.setItem('adminEdits', JSON.stringify(adminEdits));
            location.reload();
          }
        }
      });
    }

    function convertDriveUrl(url) {
      if (url.includes('drive.google.com')) {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]{28,35})/);
        if (match && match[1]) {
          return `https://drive.google.com/uc?export=download&id=${match[1]}`;
        }
        try {
          const idParam = new URL(url).searchParams.get('id');
          if (idParam) {
            return `https://drive.google.com/uc?export=download&id=${idParam}`;
          }
        } catch(e) {
          console.error(e);
        }
      }
      return url;
    }

    function saveBanner(val) {
      adminEdits[pageKey] = val;
      localStorage.setItem('adminEdits', JSON.stringify(adminEdits));
      
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg) {
        heroBg.style.backgroundImage = `url('${val}')`;
      }
      
      const orig = bannerSaveBtn.innerText;
      bannerSaveBtn.innerText = 'Banner Updated!';
      bannerSaveBtn.classList.replace('bg-neutral-700', 'bg-green-600');
      setTimeout(() => {
        bannerSaveBtn.innerText = orig;
        bannerSaveBtn.classList.replace('bg-green-600', 'bg-neutral-700');
      }, 1500);
    }

    // Save Page edits
    document.getElementById('admin-save-btn').addEventListener('click', () => {
      const currentEdits = JSON.parse(localStorage.getItem('adminEdits') || '{}');
      const els = document.querySelectorAll('[data-admin-key], [data-key], .editable');
      
      els.forEach(el => {
        const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
        if (key && key !== 'social-fb' && key !== 'social-ig') {
          currentEdits[key] = el.innerHTML;
        }
      });
      
      localStorage.setItem('adminEdits', JSON.stringify(currentEdits));
      
      const btn = document.getElementById('admin-save-btn');
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg><span>Saved Successfully!</span>';
      btn.classList.replace('from-green-500', 'from-emerald-600');
      
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.replace('from-emerald-600', 'from-green-500');
      }, 1500);
    });

    // Exit Admin Mode
    document.getElementById('admin-exit-btn').addEventListener('click', () => {
      window.location.href = window.location.pathname + window.location.hash;
    });
  }
});
