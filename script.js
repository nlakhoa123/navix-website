// ==========================================
// NAVIX MARITIME SOLUTIONS - SCRIPT.JS (REFACTORED)
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

// ==========================================
// QUOTE FORM HANDLING - REFACTORED
// ==========================================

const quoteForm = document.getElementById('quoteForm');
const quoteModal = document.getElementById('quoteModal');
const closeModal = document.querySelector('.close-modal');

// Xử lý thay đổi route để cập nhật form fields
if (document.getElementById('route')) {
    document.getElementById('route').addEventListener('change', function() {
        handleRouteChange(this.value);
    });
}

// Xử lý thay đổi cargo type
if (document.getElementById('cargoType')) {
    document.getElementById('cargoType').addEventListener('change', function() {
        const route = document.getElementById('route').value;
        checkQuoteEligibility(route, this.value);
    });
}

function handleRouteChange(route) {
    const weightLabel = document.querySelector('label[for="weight"]');
    const cargoTypeField = document.getElementById('cargoType');
    
    if (route === 'all-in-one') {
        // All-in-One: Chuyển hướng ngay sang contact form
        showContactDirectlyModal('all-in-one');
    } else if (route === 'domestic') {
        // Can Tho → Cai Mep: Đơn vị là TONS
        if (weightLabel) {
            weightLabel.setAttribute('data-i18n', 'quote.weight.tons');
            weightLabel.textContent = currentLang === 'vi' ? 
                'Trọng lượng ước tính (tấn)' : 
                'Estimated Weight (tons)';
        }
        document.getElementById('weight').placeholder = currentLang === 'vi' ? 
            'Nhập trọng lượng (tấn)' : 
            'Enter weight in tons';
            
        // Chỉ cho phép General Goods và Agriculture
        updateCargoOptions(['general', 'agriculture']);
        
    } else if (route === 'international') {
        // Cai Mep → Shenzhen: Đơn vị là TEU
        if (weightLabel) {
            weightLabel.setAttribute('data-i18n', 'quote.weight.teu');
            weightLabel.textContent = currentLang === 'vi' ? 
                'Số lượng container (TEU)' : 
                'Number of Containers (TEU)';
        }
        document.getElementById('weight').placeholder = currentLang === 'vi' ? 
            'Nhập số lượng TEU' : 
            'Enter TEU count';
            
        // Chỉ cho phép General Goods và Agriculture
        updateCargoOptions(['general', 'agriculture']);
    }
}

function updateCargoOptions(allowedTypes) {
    const cargoSelect = document.getElementById('cargoType');
    if (!cargoSelect) return;
    
    // Giữ nguyên options nhưng disable các loại không cho phép
    const options = cargoSelect.querySelectorAll('option');
    options.forEach(option => {
        const value = option.value;
        if (value === '') return; // Skip placeholder
        
        if (allowedTypes.includes(value)) {
            option.disabled = false;
        } else {
            option.disabled = true;
            option.textContent = option.textContent.replace(' (Liên hệ)', '').replace(' (Contact)', '') + 
                (currentLang === 'vi' ? ' (Liên hệ)' : ' (Contact)');
        }
    });
}

function checkQuoteEligibility(route, cargoType) {
    const allowedCargo = ['general', 'agriculture'];
    
    if (!allowedCargo.includes(cargoType)) {
        showContactDirectlyModal('specialized-cargo');
        return false;
    }
    
    return true;
}

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
    const weight = parseFloat(document.getElementById('weight').value);

    // Validation
    if (!route || !cargoType || !weight) {
        alert(currentLang === 'vi' ? 
            'Vui lòng điền đầy đủ thông tin' : 
            'Please fill in all required fields');
        return;
    }

    // All-in-One → Redirect
    if (route === 'all-in-one') {
        showContactDirectlyModal('all-in-one');
        return;
    }

    // Specialized cargo → Redirect
    const allowedCargo = ['general', 'agriculture'];
    if (!allowedCargo.includes(cargoType)) {
        showContactDirectlyModal('specialized-cargo');
        return;
    }

    // Calculate based on route
    if (route === 'domestic') {
        calculateDomesticQuote(cargoType, weight);
    } else if (route === 'international') {
        calculateInternationalQuote(cargoType, weight);
    }
}

function calculateDomesticQuote(cargoType, weight) {
    const basePrice = 280000 * weight; // VND/ton
    const routeText = 'Cần Thơ → Cái Mép';
    const transitTime = currentLang === 'vi' ? '1-2 ngày' : '1-2 days';
    const vessel = 'NaviX Alizé I';
    const unit = currentLang === 'vi' ? 'tấn' : 'tons';

    displayQuoteResult({
        route: routeText,
        cargo: `${weight} ${unit} - ${getCargoTypeName(cargoType)}`,
        vessel: vessel,
        transit: transitTime,
        basePrice: basePrice,
        unit: 'tons'
    });
}

function calculateInternationalQuote(cargoType, weight) {
    const basePrice = 1340000 * weight; // VND/TEU (chỉ 20FT Standard)
    const routeText = 'Cái Mép → Thâm Quyến';
    const transitTime = currentLang === 'vi' ? '3-5 ngày' : '3-5 days';
    const vessel = 'NaviX Aquaterra I';
    const unit = 'TEU';

    displayQuoteResult({
        route: routeText,
        cargo: `${weight} ${unit} - ${getCargoTypeName(cargoType)}`,
        vessel: vessel,
        transit: transitTime,
        basePrice: basePrice,
        unit: 'teu',
        containerNote: currentLang === 'vi' ? 
            '* Giá áp dụng cho container 20FT tiêu chuẩn' : 
            '* Price applies to 20FT Standard Container'
    });
}

function displayQuoteResult(data) {
    // Generate quote reference
    const date = new Date();
    const ref = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`;
    document.getElementById('quoteRef').textContent = ref;

    // Set route info
    document.getElementById('modalRoute').textContent = data.route;
    document.getElementById('modalCargo').textContent = data.cargo;
    document.getElementById('modalVessel').textContent = data.vessel;
    document.getElementById('modalTransit').textContent = data.transit;

    // Calculate additional costs (chỉ cho hàng general/agriculture)
    const reeferCost = 0; // Không tính reefer cho general/agriculture
    const customsCost = Math.round(data.basePrice * 0.08);
    const docCost = Math.round(data.basePrice * 0.05);
    const totalCost = data.basePrice + customsCost + docCost;

    document.getElementById('baseCost').textContent = data.basePrice.toLocaleString('vi-VN') + ' VND';
    document.getElementById('reeferCost').textContent = '0 VND';
    document.getElementById('customsCost').textContent = customsCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('docCost').textContent = docCost.toLocaleString('vi-VN') + ' VND';
    document.getElementById('totalCost').textContent = totalCost.toLocaleString('vi-VN') + ' VND';

    // Add container note if international
    const modalContent = document.querySelector('.quote-result');
    const existingNote = modalContent.querySelector('.container-note');
    if (existingNote) existingNote.remove();
    
    if (data.containerNote) {
        const note = document.createElement('p');
        note.className = 'container-note';
        note.style.cssText = 'color: #ff6b35; font-size: 0.9rem; margin-top: 1rem; font-weight: 600;';
        note.textContent = data.containerNote;
        modalContent.appendChild(note);
    }

    // Set valid date (14 days from now)
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 14);
    document.getElementById('validDate').textContent = validDate.toLocaleDateString(
        currentLang === 'vi' ? 'vi-VN' : 'en-US', 
        { year: 'numeric', month: 'long', day: 'numeric' }
    );

    // Show modal
    quoteModal.style.display = 'block';
}

function showContactDirectlyModal(reason) {
    let title = '';
    let message = '';
    
    if (currentLang === 'vi') {
        if (reason === 'all-in-one') {
            title = 'Dịch vụ All-in-One';
            message = 'Để được tư vấn chi tiết về giải pháp logistics trọn gói từ Cần Thơ đến Thâm Quyến, vui lòng liên hệ trực tiếp với chúng tôi để nhận báo giá tùy chỉnh.';
        } else if (reason === 'specialized-cargo') {
            title = 'Hàng hóa đặc biệt';
            message = 'Loại hàng hóa này yêu cầu xử lý chuyên biệt. Vui lòng liên hệ trực tiếp để được tư vấn chi tiết về giá cước và dịch vụ phù hợp.';
        } else if (reason === 'container-type') {
            title = 'Loại container đặc biệt';
            message = 'Loại container này yêu cầu báo giá riêng. Vui lòng liên hệ trực tiếp để nhận thông tin chi tiết.';
        }
    } else {
        if (reason === 'all-in-one') {
            title = 'All-in-One Service';
            message = 'For detailed consultation on our comprehensive logistics solution from Can Tho to Shenzhen, please contact us directly for a customized quote.';
        } else if (reason === 'specialized-cargo') {
            title = 'Specialized Cargo';
            message = 'This cargo type requires specialized handling. Please contact us directly for detailed pricing and suitable services.';
        } else if (reason === 'container-type') {
            title = 'Special Container Type';
            message = 'This container type requires custom pricing. Please contact us directly for detailed information.';
        }
    }
    
    if (confirm(title + '\n\n' + message + '\n\n' + 
        (currentLang === 'vi' ? 'Chuyển đến trang liên hệ?' : 'Go to contact page?'))) {
        window.location.href = 'contact.html';
    }
}

function getCargoTypeName(type) {
    const names = {
        'general': currentLang === 'vi' ? 'Hàng tổng hợp' : 'General Goods',
        'agriculture': currentLang === 'vi' ? 'Nông sản' : 'Agriculture',
        'refrigerated': currentLang === 'vi' ? 'Hàng lạnh' : 'Refrigerated',
        'fisheries': currentLang === 'vi' ? 'Thủy sản' : 'Fisheries',
        'dangerous': currentLang === 'vi' ? 'Hàng nguy hiểm' : 'Dangerous Goods'
    };
    return names[type] || type;
}

// ==========================================
// SERVICES PAGE TABS
// ==========================================

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// ==========================================
// SCHEDULE PAGE - WIZARD FORM (REFACTORED)
// ==========================================

const wizardSteps = document.querySelectorAll('.wizard-step');
const stepIndicators = document.querySelectorAll('.step');
const nextBtns = document.querySelectorAll('.btn-next');
const backBtns = document.querySelectorAll('.btn-back');
let currentStep = 1;
let selectedRoute = '';

// Xử lý chọn route trong wizard
document.querySelectorAll('input[name="route"]').forEach(radio => {
    radio.addEventListener('change', function() {
        selectedRoute = this.value;
        
        if (selectedRoute === 'all-in-one') {
            // All-in-One: Chuyển hướng ngay
            showContactDirectlyModal('all-in-one');
        }
    });
});

nextBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (selectedRoute === 'all-in-one') {
            showContactDirectlyModal('all-in-one');
            return;
        }
        
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
    wizardSteps.forEach((step, index) => {
        step.classList.remove('active');
        if (index + 1 === currentStep) {
            step.classList.add('active');
        }
    });

    stepIndicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index + 1 <= currentStep) {
            indicator.classList.add('active');
        }
    });
    
    // Update Step 2 fields based on route
    if (currentStep === 2) {
        updateStep2Fields();
    }
}

function updateStep2Fields() {
    const containerTypeField = document.querySelector('#containerTypeGroup');
    const weightLabel = document.querySelector('label[for="wizardWeight"]');
    const weightInput = document.querySelector('#wizardWeight');
    
    if (selectedRoute === 'domestic') {
        // Can Tho → Cai Mep: Ẩn container type, đơn vị tons
        if (containerTypeField) {
            containerTypeField.style.display = 'none';
            document.getElementById('wizardContainerType').removeAttribute('required');
        }
        
        if (weightLabel) {
            weightLabel.textContent = currentLang === 'vi' ? 
                'Trọng lượng (tấn) *' : 
                'Weight (tons) *';
        }
        
        if (weightInput) {
            weightInput.placeholder = currentLang === 'vi' ? 
                'Nhập trọng lượng (tấn)' : 
                'Enter weight in tons';
        }
        
    } else if (selectedRoute === 'international') {
        // Cai Mep → Shenzhen: Hiện container type, đơn vị TEU
        if (containerTypeField) {
            containerTypeField.style.display = 'block';
            document.getElementById('wizardContainerType').setAttribute('required', 'required');
            updateContainerOptions();
        }
        
        if (weightLabel) {
            weightLabel.textContent = currentLang === 'vi' ? 
                'Số lượng container (TEU) *' : 
                'Number of Containers (TEU) *';
        }
        
        if (weightInput) {
            weightInput.placeholder = currentLang === 'vi' ? 
                'Nhập số lượng TEU' : 
                'Enter TEU count';
        }
    }
}

function updateContainerOptions() {
    const containerSelect = document.getElementById('wizardContainerType');
    if (!containerSelect) return;
    
    const options = containerSelect.querySelectorAll('option');
    options.forEach(option => {
        const value = option.value;
        if (value === '' || value === '20ft-standard') {
            option.disabled = false;
        } else {
            option.disabled = true;
            const text = option.textContent;
            if (!text.includes('(Liên hệ)') && !text.includes('(Contact)')) {
                option.textContent = text + (currentLang === 'vi' ? ' (Liên hệ)' : ' (Contact)');
            }
        }
    });
}

function validateStep(step) {
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    if (!currentStepEl) return true;
    
    // For step 1, check radio buttons
    if (step === 1) {
        const routeSelected = document.querySelector('input[name="route"]:checked');
        if (!routeSelected) {
            alert(currentLang === 'vi' ? 
                'Vui lòng chọn tuyến đường' : 
                'Please select a route');
            return false;
        }
        return true;
    }
    
    // For other steps, check required inputs
    const inputs = currentStepEl.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]');
    
    for (let input of inputs) {
        // Skip container type if domestic route
        if (input.id === 'wizardContainerType' && selectedRoute === 'domestic') {
            continue;
        }
        
        if (!input.value) {
            alert(currentLang === 'vi' ? 
                'Vui lòng điền đầy đủ thông tin bắt buộc' : 
                'Please fill in all required fields');
            input.focus();
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
    const route = document.querySelector('input[name="route"]:checked')?.value;
    const cargoType = document.getElementById('wizardCargoType')?.value;
    const weight = parseFloat(document.getElementById('wizardWeight')?.value || 0);
    const containerType = document.getElementById('wizardContainerType')?.value;
    
    // All-in-One check
    if (route === 'all-in-one') {
        showContactDirectlyModal('all-in-one');
        return;
    }
    
    // Container type check for international
    if (route === 'international' && containerType !== '20ft-standard') {
        showContactDirectlyModal('container-type');
        return;
    }
    
    // Cargo type check
    const allowedCargo = ['general', 'agriculture'];
    if (!allowedCargo.includes(cargoType)) {
        showContactDirectlyModal('specialized-cargo');
        return;
    }
    
    // Calculate
    if (route === 'domestic') {
        calculateDomesticQuote(cargoType, weight);
    } else if (route === 'international') {
        calculateInternationalQuote(cargoType, weight);
    }
}

// ==========================================
// RESOURCES PAGE - CATEGORY FILTER
// ==========================================

const filterBtns = document.querySelectorAll('.filter-btn');
const articleCards = document.querySelectorAll('.article-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
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
        alert(currentLang === 'vi' ? 
            `Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin đến ${email}` :
            `Thank you for subscribing! We'll send updates to ${email}`);
        newsletterForm.reset();
    });
}

// ==========================================
// CONTACT PAGE - FAQ ACCORDION
// ==========================================

const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
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
        
        setTimeout(() => {
            alert(currentLang === 'vi' ? 
                'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.' :
                'Thank you for contacting us! We will get back to you within 24 hours.');
            contactForm.reset();
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 2000);
    });
}

// ==========================================
// LANGUAGE TOGGLE
// ==========================================

let currentLang = localStorage.getItem('navix-lang') || 'en';

function translatePage() {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = translations[currentLang][key];
        if (translation) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else if (el.innerHTML.includes('<')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        }
    });
    
    const langToggle = document.querySelector('.lang-toggle');
    if (langToggle) {
        langToggle.textContent = currentLang === 'en' ? 'EN/VI' : 'VI/EN';
    }
    
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'vi';
}

const langToggle = document.querySelector('.lang-toggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'vi' : 'en';
        localStorage.setItem('navix-lang', currentLang);
        translatePage();
    });
}

// ==========================================
// INITIALIZE ON PAGE LOAD
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    translatePage();
    
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
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
    
    // Initialize route change handler
    const routeSelect = document.getElementById('route');
    if (routeSelect && routeSelect.value) {
        handleRouteChange(routeSelect.value);
    }
});
