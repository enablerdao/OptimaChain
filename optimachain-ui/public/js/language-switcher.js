/**
 * OptimaChain Language Switcher
 * Handles language switching functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
});

function initLanguageSwitcher() {
  const languageSwitcher = document.querySelector('.language-switcher');
  if (!languageSwitcher) return;
  
  const languageOptions = languageSwitcher.querySelectorAll('.language-option');
  
  languageOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the language code
      const lang = option.getAttribute('data-lang');
      
      // Update active class
      languageOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      // In a real implementation, this would switch the language
      console.log(`Switching language to: ${lang}`);
      
      // Store the language preference
      localStorage.setItem('preferred-language', lang);
    });
  });
  
  // Set initial active language based on stored preference or default
  const storedLang = localStorage.getItem('preferred-language') || 'ja';
  const activeOption = languageSwitcher.querySelector(`[data-lang="${storedLang}"]`);
  if (activeOption) {
    activeOption.classList.add('active');
  }
}
