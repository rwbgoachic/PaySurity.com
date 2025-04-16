/**
 * Main JavaScript for PaySurity website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu functionality
  setupMobileMenu();
  
  // Scroll animations
  setupScrollAnimations();
  
  // FAQ accordion
  setupFaqAccordion();
  
  // Handle form submissions
  setupFormHandlers();
  
  console.log('PaySurity website initialized');
});

/**
 * Mobile menu functionality
 */
function setupMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const menuClose = document.querySelector('.mobile-menu-close');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (menuToggle && menuClose && mobileMenu) {
    // Open mobile menu
    menuToggle.addEventListener('click', function() {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    });
    
    // Close mobile menu
    menuClose.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
    });
    
    // Close mobile menu when clicking outside of it
    document.addEventListener('click', function(event) {
      if (mobileMenu.classList.contains('active') && 
          !event.target.closest('.mobile-menu-container') && 
          !event.target.closest('.mobile-menu-toggle')) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Handle escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/**
 * Scroll animations
 */
function setupScrollAnimations() {
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  if (animateElements.length > 0) {
    // Initial check for elements already in viewport on page load
    checkScrollAnimations();
    
    // Check on scroll
    window.addEventListener('scroll', checkScrollAnimations);
    
    // Check on resize (viewport may change)
    window.addEventListener('resize', checkScrollAnimations);
  }
  
  function checkScrollAnimations() {
    animateElements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      // Animate when element is 90% of the way into the viewport
      if (elementTop < windowHeight * 0.9) {
        element.classList.add('visible');
      }
    });
  }
}

/**
 * FAQ accordion functionality
 */
function setupFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (question && answer) {
        question.addEventListener('click', () => {
          // Close all other items
          faqItems.forEach(otherItem => {
            if (otherItem !== item && otherItem.classList.contains('active')) {
              otherItem.classList.remove('active');
              otherItem.setAttribute('aria-expanded', 'false');
            }
          });
          
          // Toggle this item
          item.classList.toggle('active');
          const expanded = item.classList.contains('active');
          item.setAttribute('aria-expanded', expanded);
        });
      }
    });
  }
}

/**
 * Form submission handlers
 */
function setupFormHandlers() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(event) {
      const searchForm = form.id === 'faq-search-form';
      
      // Let FAQ search form use its own handler
      if (searchForm) return;
      
      // For other forms, prevent default and handle with JS
      event.preventDefault();
      
      // Simple form validation
      let valid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('error');
          
          // Add error message if it doesn't exist
          let errorMsg = field.parentNode.querySelector('.error-message');
          if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'This field is required';
            field.parentNode.appendChild(errorMsg);
          }
        } else {
          field.classList.remove('error');
          const errorMsg = field.parentNode.querySelector('.error-message');
          if (errorMsg) {
            errorMsg.remove();
          }
        }
      });
      
      if (valid) {
        // In a real application, you would submit the form with fetch/AJAX here
        console.log('Form submitted:', serializeForm(form));
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Thank you! Your submission has been received.';
        
        // Clear form and append message
        form.reset();
        form.appendChild(successMsg);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
          successMsg.remove();
        }, 3000);
      }
    });
  });
  
  // Helper function to serialize form data
  function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }
}

/**
 * Custom functionality for FAQ search
 */
function searchFaqs(searchTerm) {
  if (!searchTerm || searchTerm.length < 2) return false;
  
  searchTerm = searchTerm.toLowerCase().trim();
  const faqItems = document.querySelectorAll('.faq-item');
  let matchFound = false;
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question').textContent.toLowerCase();
    const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
    
    if (question.includes(searchTerm) || answer.includes(searchTerm)) {
      // Match found, highlight and open this item
      item.classList.add('active', 'highlight');
      item.setAttribute('aria-expanded', 'true');
      
      setTimeout(() => {
        item.classList.remove('highlight');
      }, 2000);
      
      if (!matchFound) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        matchFound = true;
      }
    } else {
      // No match, close this item
      item.classList.remove('active', 'highlight');
      item.setAttribute('aria-expanded', 'false');
    }
  });
  
  return matchFound;
}