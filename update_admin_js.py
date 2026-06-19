import os
import re

filepath = "js/admin.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update the loading of links
# Find:
#   editableElements.forEach(el => {
#     const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
#     if (key && adminEdits[key]) {
#       el.innerHTML = adminEdits[key];
#     }
#   });
old_apply_edits = """  // Apply edits from localStorage
  editableElements.forEach(el => {
    const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
    if (key && adminEdits[key]) {
      el.innerHTML = adminEdits[key];
    }
  });"""
new_apply_edits = """  // Apply edits from localStorage
  editableElements.forEach(el => {
    const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
    if (key && adminEdits[key]) {
      if (key === 'social-fb' || key === 'social-ig') {
        el.href = adminEdits[key];
      } else {
        el.innerHTML = adminEdits[key];
      }
    }
  });"""
content = content.replace(old_apply_edits, new_apply_edits)

# 2. Update contentEditable logic
# Find:
#     // Make elements contenteditable
#     editableElements.forEach(el => {
#       el.contentEditable = 'true';
old_content_editable = """    // Make elements contenteditable
    editableElements.forEach(el => {
      el.contentEditable = 'true';"""
new_content_editable = """    // Make elements contenteditable
    editableElements.forEach(el => {
      const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
      if (key !== 'social-fb' && key !== 'social-ig') {
        el.contentEditable = 'true';
      }"""
content = content.replace(old_content_editable, new_content_editable)


# 3. Add sidebar HTML for Social Links
# Let's inject it right after the SITE MAP / NAVIGATION section
old_sidebar_end = """              <span class="${isDisability ? 'text-yellow-400 font-semibold' : ''}">Disability Insurance</span>
              <span>&rarr;</span>
            </a>
          </div>
        </div>"""
new_sidebar_end = old_sidebar_end + """
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
        </div>"""
content = content.replace(old_sidebar_end, new_sidebar_end)

# 4. Add logic to load/save social links
# Inject right after `document.body.appendChild(sidebar);`
old_append = "    document.body.appendChild(sidebar);"
new_append = old_append + """

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
"""
content = content.replace(old_append, new_append)

# 5. Fix standard "Save Page edits" so it doesn't overwrite social links with innerHTML
old_save = """        const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
        if (key) {
          currentEdits[key] = el.innerHTML;
        }"""
new_save = """        const key = el.getAttribute('data-admin-key') || el.getAttribute('data-key');
        if (key && key !== 'social-fb' && key !== 'social-ig') {
          currentEdits[key] = el.innerHTML;
        }"""
content = content.replace(old_save, new_save)


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated js/admin.js")
