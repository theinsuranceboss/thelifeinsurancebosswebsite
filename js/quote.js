document.addEventListener('DOMContentLoaded', () => {
  // Inject the Zapier Interfaces script tag
  if (!document.querySelector('script[src*="zapier-interfaces"]')) {
    const zapScript = document.createElement('script');
    zapScript.type = 'module';
    zapScript.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
    document.head.appendChild(zapScript);
  }

  // Create Modal HTML structure
  const modalHTML = `
    <div id="zapier-quote-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[999999] flex items-center justify-center p-4 opacity-0 pointer-events-none transition-all duration-300">
      <div class="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-4xl w-full p-6 relative shadow-2xl scale-95 transition-transform duration-300 flex flex-col text-neutral-200">
        <!-- Close Button -->
        <button id="zapier-modal-close" class="absolute top-4 right-4 text-neutral-400 hover:text-yellow-400 transition-colors text-3xl font-light focus:outline-none">&times;</button>
        
        <!-- Header -->
        <div class="mb-4">
          <h3 class="text-xl font-bold text-yellow-400">Get a Free Life Insurance Quote</h3>
          <p class="text-xs text-neutral-400">Compare rates from over 20 top carriers instantly.</p>
        </div>

        <!-- Zapier Embed Container -->
        <div class="w-full flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950 p-2" style="min-height: 500px;">
          <zapier-interfaces-page-embed 
            page-id="cmnoyuib00030kmysjkoxg2b2" 
            test-id="cmnoyuib00030kmysjkoxg2b2-zapier-interfaces-page-embed-iframe" 
            no-background="false"  
            style="max-width: 100%; width: 900px; height: 500px;">
          </zapier-interfaces-page-embed>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('zapier-quote-modal');
  const modalContainer = modal.querySelector('div');
  const closeBtn = document.getElementById('zapier-modal-close');

  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.classList.add('opacity-100', 'pointer-events-auto');
    modalContainer.classList.remove('scale-95');
    modalContainer.classList.add('scale-100');
  }

  function closeModal() {
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    modal.classList.add('opacity-0', 'pointer-events-none');
    modalContainer.classList.remove('scale-100');
    modalContainer.classList.add('scale-95');
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Handle ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Attach click listener to all buttons / links that say "Get Quote" or link to get a quote
  function attachQuoteListeners() {
    document.querySelectorAll('a, button').forEach(el => {
      if (el.dataset.quoteListenerAttached) return;

      const href = el.getAttribute('href') || '';
      const text = el.innerText.toLowerCase();
      
      if (
        href.includes('get-a-life-insurance-quote') || 
        text.includes('get quote') || 
        text.includes('get a quote') || 
        text.includes('free quote')
      ) {
        el.addEventListener('click', openModal);
        el.dataset.quoteListenerAttached = "true";
      }
    });
  }

  // Initial attach
  attachQuoteListeners();

  // Re-attach periodically in case of dynamic DOM shifts or visual editing re-renders
  setInterval(attachQuoteListeners, 2000);
});
