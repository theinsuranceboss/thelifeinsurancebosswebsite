document.addEventListener('DOMContentLoaded', () => {
  // Check if admin mode is active; if so, disable chatbot to prevent overlap with the Visual Admin Sidebar
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.has('admin') || window.location.hash === '#admin';
  if (isAdmin) return;

  // Inject Chatbot UI
  const chatbotHTML = `
    <!-- Floating Button -->
    <div id="chatbot-button" class="fixed bottom-6 right-6 z-[9999] cursor-pointer hover:scale-110 transition-transform duration-300 shadow-2xl shadow-yellow-500/30 rounded-full w-16 h-16 bg-neutral-900 border-2 border-yellow-500 flex items-center justify-center overflow-hidden">
      <img src="logo.png" alt="Chat" class="w-10 h-10 object-contain" onerror="this.style.display='none'">
    </div>

    <!-- Chat Window -->
    <div id="chatbot-window" class="fixed bottom-28 right-6 z-[9999] w-80 sm:w-96 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl shadow-black overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right opacity-0 scale-50 pointer-events-none">
      <!-- Header -->
      <div class="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 flex justify-between items-center text-black">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-black rounded-full p-1 flex items-center justify-center">
            <img src="logo.png" alt="Logo" class="w-full h-full object-contain">
          </div>
          <span class="font-bold">Insurance Assistant</span>
        </div>
        <button id="chatbot-close" class="text-black hover:text-neutral-800 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Messages Area -->
      <div id="chatbot-messages" class="flex-1 p-4 h-80 overflow-y-auto space-y-4 bg-neutral-950">
        <!-- Welcome Message -->
        <div class="flex items-start space-x-2">
          <div class="w-8 h-8 bg-neutral-800 rounded-full flex-shrink-0 flex items-center justify-center p-1 border border-neutral-700">
            <img src="logo.png" alt="Bot" class="w-full h-full object-contain">
          </div>
          <div class="bg-neutral-800 text-neutral-200 px-4 py-2 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
            Hello! I'm your Life Insurance Boss assistant. How can I help you today?
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center space-x-2">
        <input type="text" id="chatbot-input" placeholder="Ask about our insurances..." class="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-full text-sm border border-neutral-700 focus:outline-none focus:border-yellow-400 transition-colors">
        <button id="chatbot-send" class="w-10 h-10 bg-yellow-500 text-black rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatbotHTML);

  const button = document.getElementById('chatbot-button');
  const windowEl = document.getElementById('chatbot-window');
  const closeBtn = document.getElementById('chatbot-close');
  const inputEl = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  const messagesEl = document.getElementById('chatbot-messages');

  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    if (isOpen) {
      windowEl.classList.remove('opacity-0', 'scale-50', 'pointer-events-none');
      windowEl.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
      inputEl.focus();
    } else {
      windowEl.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
      windowEl.classList.add('opacity-0', 'scale-50', 'pointer-events-none');
    }
  }

  button.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  function addMessage(text, isUser) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`;
    
    let avatarHTML = '';
    if (!isUser) {
      avatarHTML = `
        <div class="w-8 h-8 bg-neutral-800 rounded-full flex-shrink-0 flex items-center justify-center p-1 border border-neutral-700">
          <img src="logo.png" alt="Bot" class="w-full h-full object-contain">
        </div>
      `;
    }

    const bubbleClass = isUser 
      ? 'bg-yellow-500 text-black rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-[80%]' 
      : 'bg-neutral-800 text-neutral-200 rounded-2xl rounded-tl-none px-4 py-2 text-sm max-w-[80%]';

    msgDiv.innerHTML = `
      ${avatarHTML}
      <div class="${bubbleClass}">${text}</div>
    `;

    messagesEl.appendChild(msgDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function getBotResponse(userMsg) {
    const msg = userMsg.toLowerCase();
    const kbLink = localStorage.getItem('chatbotKnowledgeBase');
    
    // If Admin has set a knowledge base link, we pretend to use it.
    let prefix = '';
    if (kbLink) {
      // In a real app, we'd query the backend parsing the drive doc.
    }

    if (msg.includes('whole life')) {
      return "Whole life insurance provides lifelong coverage and includes a cash value component that grows over time. It's a great option if you want permanent protection and an investment feature.";
    } else if (msg.includes('term life') || msg.includes('term')) {
      return "Term life insurance covers you for a specific period (e.g., 10, 20, or 30 years). It's usually the most affordable way to get maximum coverage when you need it most, like while raising a family.";
    } else if (msg.includes('universal')) {
      return "Universal life insurance is a flexible permanent policy. You can adjust your premiums and death benefits over time, making it adaptable to your changing life circumstances.";
    } else if (msg.includes('mortgage')) {
      return "Mortgage protection insurance is designed to pay off your mortgage if you pass away, ensuring your family won't lose their home. Some policies also cover mortgage payments if you become disabled.";
    } else if (msg.includes('disability')) {
      return "Disability insurance replaces a portion of your income if you become unable to work due to illness or injury. It protects your paycheck when you need it most.";
    } else if (msg.includes('quote') || msg.includes('price') || msg.includes('cost')) {
      return "You can get a free, no-obligation quote right now! Just click the 'Get Quote' button in the menu or give us a call at 732-268-3373.";
    } else if (msg.includes('contact') || msg.includes('phone') || msg.includes('call')) {
      return "You can reach us at 732-268-3373 or click 'Speak With The Boss' in the menu.";
    } else {
      return "I'm your virtual assistant! I can help you understand our insurance types (Term, Whole, Universal, Mortgage, Disability) or guide you on how to get a quote. What would you like to know?";
    }
  }

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    addMessage(text, true);
    inputEl.value = '';

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(text);
      addMessage(response, false);
    }, 600);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
