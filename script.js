document.addEventListener('DOMContentLoaded', function() {
    // Animation for sections
    const sections = document.querySelectorAll('.section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // TPS Counter Animation
    const tpsElement = document.getElementById('tps-counter');
    if (tpsElement) {
        let count = 0;
        const targetTPS = 50000;
        const duration = 2000; // 2 seconds
        const interval = 20; // update every 20ms
        const steps = duration / interval;
        const increment = targetTPS / steps;
        
        const tpsCounter = setInterval(() => {
            count += increment;
            if (count >= targetTPS) {
                count = targetTPS;
                clearInterval(tpsCounter);
            }
            tpsElement.textContent = Math.floor(count).toLocaleString();
        }, interval);
    }
    
    // Toggle sections
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent.classList.contains('open')) {
                targetContent.classList.remove('open');
                this.textContent = '詳細を表示';
            } else {
                targetContent.classList.add('open');
                this.textContent = '閉じる';
            }
        });
    });
    
    // Notification bar close button
    const notificationBar = document.querySelector('.notification-bar');
    const closeButton = document.querySelector('.notification-close');
    
    if (closeButton && notificationBar) {
        closeButton.addEventListener('click', function() {
            notificationBar.style.display = 'none';
        });
    }
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only apply to same-page links
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Sticky header effect
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
    
    // Add transition to header
    header.style.transition = 'transform 0.3s ease';
});