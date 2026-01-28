// ==========================================
// NAVIX MARITIME SOLUTIONS - SCRIPT.JS
// ==========================================

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            if (navLinks) {
                navLinks.classList.remove('active');
            }
        }
    });
});

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Header Scroll Effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.padding = '0.5rem 5%';
    } else {
        header.style.padding = '1rem 5%';
    }

    lastScroll = currentScroll;
});

// Quote Form Handling (Homepage)
const quoteForm = document.getElementById('quoteForm');
const quoteModal = document.getElementById('quoteModal');
const closeModal = document.querySelector('.close-modal');

if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateQuote();
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        quoteModal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === quoteModal) {
        quoteModal.style.display = 'none';
    }
});

function calculateQuote() {
    const route = document.getElementById('route').value;
    const cargoType = document.getElementById('cargoType').value;
    const weight = document.getElementById('weight').value;

    // Generate quote reference
    const date = new Date();
    const ref = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;
    document.getElementById('quoteRef').textContent = ref;

    // Set route info
    let routeText = '';
    let transitTime = '';
    let basePrice = 0;
    let vessel = '';

    if (route === 'domestic') {
        routeText = 'Can Tho → Cai Mep';
        transitTime = '1-2 days';
        basePrice = 280000 * weight;
        vessel = 'NaviX Alizé I';
    } else if (route === 'international') {
        routeText = 'Cai Mep → Shenzhen';
        transitTime = '3-5 days';
        basePrice = 1340000 * weight;
        vessel = 'NaviX Aquaterra I';
    } else {
        routeText = 'Can Tho → Shenzhen (All-in-One)';
        transitTime = '4-7 days';
        basePrice = (280000 + 1340000) * weight;
        vessel = 'Alizé I + Aquaterra I';
    }

    document.getElementById('modalRoute').textContent = routeText;
    document.getElementById('modalCargo').textContent = `${weight} ${route === 'international' ? 'TEU' : 'tons'} - ${cargoType.charAt(0).toUpperCase() + cargoType.slice(1)}`;
    document.getElementById('modalVessel').textContent = vessel;
    document.getElementById('modalTransit').textContent = transitTime;

    // Calculate costs
    const reeferCost = Math.round(basePrice * 0.15);
    const customsCost = Math.round(basePrice * 0.08);
    const docCost = Math.round(basePrice * 0.05);
    const totalCost = basePrice + reeferCost + customsCost + docCost;

    document.getElementById('baseCost').textContent = basePrice.toLocaleString('vi-VN') + ' VND';
    document.getElementById('reeferCost').textContent = reeferCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('customsCost').textContent = customsCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('docCost').textContent = docCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('totalCost').textContent = totalCost.toLocaleString('vi-VN') + ' VND';

    // Set valid date (14 days from now)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 14);
    document.getElementById('validDate').textContent = validDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Show modal
    quoteModal.style.display = 'block';
}

// Services Page Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Schedule Page - Wizard Form
const wizardSteps = document.querySelectorAll('.wizard-step');
const stepIndicators = document.querySelectorAll('.step');
const nextBtns = document.querySelectorAll('.btn-next');
const backBtns = document.querySelectorAll('.btn-back');
let currentStep = 1;

nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateWizard();
        }
    });
});

backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentStep--;
        updateWizard();
    });
});

function updateWizard() {
    // Update steps
    wizardSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });

    // Update indicators
    stepIndicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index + 1 <= currentStep) {
            indicator.classList.add('active');
        }
    });
}

function validateStep(step) {
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
    
    for (let input of inputs) {
        if (!input.value) {
            alert('Please fill in all required fields');
            return false;
        }
    }
    
    return true;
}

// Quote Wizard Submit
const quoteWizard = document.getElementById('quoteWizard');
if (quoteWizard) {
    quoteWizard.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateWizardQuote();
    });
}

function calculateWizardQuote() {
    const route = document.querySelector('input[name="route"]:checked').value;
    const cargoType = document.getElementById('cargoType').value;
    const weight = document.getElementById('weight').value;
    
    // Generate quote reference
    const date = new Date();
    const ref = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;
    document.getElementById('quoteRef').textContent = ref;

    // Set route info
    let routeText = '';
    let transitTime = '';
    let basePrice = 0;
    let vessel = '';

    if (route === 'domestic') {
        routeText = 'Can Tho → Cai Mep';
        transitTime = '1-2 days';
        basePrice = 280000 * weight;
        vessel = 'NaviX Alizé I';
    } else if (route === 'international') {
        routeText = 'Cai Mep → Shenzhen';
        transitTime = '3-5 days';
        basePrice = 1340000 * weight;
        vessel = 'NaviX Aquaterra I';
    } else {
        routeText = 'Can Tho → Shenzhen (All-in-One)';
        transitTime = '4-7 days';
        basePrice = (280000 + 1340000) * weight;
        vessel = 'Alizé I + Aquaterra I';
    }

    document.getElementById('modalRoute').textContent = routeText;
    document.getElementById('modalCargo').textContent = `${weight} ${route === 'international' ? 'TEU' : 'tons'} - ${cargoType.charAt(0).toUpperCase() + cargoType.slice(1)}`;
    document.getElementById('modalVessel').textContent = vessel;
    document.getElementById('modalTransit').textContent = transitTime;

    // Calculate additional costs based on selected services
    let reeferCost = 0;
    let customsCost = 0;
    let docCost = 0;
    
    if (document.querySelector('input[name="reefer"]:checked')) {
        reeferCost = Math.round(basePrice * 0.15);
    }
    
    if (document.querySelector('input[name="customs"]:checked')) {
        customsCost = Math.round(basePrice * 0.08);
    }
    
    if (document.querySelector('input[name="documentation"]:checked')) {
        docCost = Math.round(basePrice * 0.05);
    }
    
    const totalCost = basePrice + reeferCost + customsCost + docCost;

    document.getElementById('baseCost').textContent = basePrice.toLocaleString('vi-VN') + ' VND';
    document.getElementById('reeferCost').textContent = reeferCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('customsCost').textContent = customsCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('docCost').textContent = docCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('totalCost').textContent = totalCost.toLocaleString('vi-VN') + ' VND';

    // Set valid date (14 days from now)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 14);
    document.getElementById('validDate').textContent = validDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Show modal
    quoteModal.style.display = 'block';
}

// Resources Page - Category Filter
const filterBtns = document.querySelectorAll('.filter-btn');
const articleCards = document.querySelectorAll('.article-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        
        // Remove active from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Filter articles
        articleCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Newsletter Form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;
        alert(`Thank you for subscribing! We'll send updates to ${email}`);
        newsletterForm.reset();
    });
}

// Contact Page - FAQ Accordion
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked FAQ if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Contact Form Submit
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('.submit-btn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            alert('Thank you for contacting us! We will get back to you within 24 hours.');
            contactForm.reset();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Language Toggle - Real Translation
let currentLang = localStorage.getItem('navix-lang') || 'en';

function translatePage() {
    console.log('Translating to:', currentLang);
    const elements = document.querySelectorAll('[data-i18n]');
    console.log('Found elements:', elements.length);
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[currentLang][key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else if (el.innerHTML.includes('<')) {
                // Giữ nguyên HTML tags
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        } else {
            console.warn('Missing translation for key:', key);
        }
    });
    
    // Update lang toggle button
    const langToggle = document.querySelector('.lang-toggle');
    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'EN/VI' : 'VI/EN';
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'vi';
}

// Setup language toggle
const langToggle = document.querySelector('.lang-toggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'vi' : 'en';
        localStorage.setItem('navix-lang', currentLang);
        translatePage();
    });
}

// Translate page on load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, translating...');
    translatePage();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const footerYear = document.querySelector('.footer-bottom p');
    if (footerYear) {
        footerYear.innerHTML = footerYear.innerHTML.replace('2025', new Date().getFullYear());
    }
    
    // Check URL hash for direct navigation
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
});
