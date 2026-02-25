// ===== Main JavaScript File =====

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', async () => {
    console.log('دار الماهر - الموقع جاهز');
    
    // تهيئة القائمة المتنقلة
    initMobileMenu();
    
    // تهيئة التمرير السلس للروابط
    initSmoothScroll();
    
    // تهيئة مراقب التمرير للأنيميشن
    initScrollObserver();
    
    // جلب الإحصائيات
    await loadStats();
    
    // جلب آية اليوم
    await loadAyahOfDay();
    
    // جلب البرامج
    await loadPrograms();
    
    // تهيئة نماذج الإدخال
    initForms();
});

// ===== تهيئة القائمة المتنقلة =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // إغلاق القائمة عند الضغط على رابط
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// ===== تهيئة التمرير السلس =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== مراقب التمرير للأنيميشن =====
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ===== جلب الإحصائيات =====
async function loadStats() {
    const statsContainer = document.getElementById('hero-stats');
    if (!statsContainer) return;
    
    try {
        const count = await api.fetchStudentCount();
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-number">${count}+</span>
                <span class="stat-label">طالب وطالبة</span>
            </div>
            <div class="stat-item">
                <span class="span-number">15+</span>
                <span class="stat-label">معلم مجاز</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">30+</span>
                <span class="stat-label">حافظ كامل</span>
            </div>
        `;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===== جلب آية اليوم =====
async function loadAyahOfDay() {
    const ayahContainer = document.getElementById('ayah-of-day');
    if (!ayahContainer) return;
    
    try {
        // استخدام API عام للقرآن
        const response = await fetch('https://api.alquran.cloud/v1/random/ayah');
        const data = await response.json();
        
        ayahContainer.innerHTML = `
            <i class="fas fa-quote-right"></i>
            "${data.data.text}"
            <i class="fas fa-quote-left"></i>
            <div style="margin-top: 10px; font-size: 1rem;">
                - سورة ${data.data.surah.name} -
            </div>
        `;
    } catch (error) {
        console.error('Error fetching ayah:', error);
        ayahContainer.innerHTML = `
            <i class="fas fa-quote-right"></i>
            "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ"
            <i class="fas fa-quote-left"></i>
            <div style="margin-top: 10px; font-size: 1rem;">
                - سورة الإسراء -
            </div>
        `;
    }
}

// ===== جلب البرامج =====
// ===== جلب البرامج للصفحة الرئيسية 
async function loadPrograms() {
    const programsGrid = document.getElementById('programs-grid');
    if (!programsGrid) return;
    
    // مصفوفة البرامج (يمكنك جلبها من API لاحقاً)
    const programs = [
       
    ];
    
    let html = '';
    programs.forEach((program, index) => {
        html += `
            <div class="program-card" data-aos="flip-right" data-aos-delay="${index * 100}">
                <div class="program-icon">
                    <i class="${program.icon}"></i>
                </div>
                <h3>${program.title}</h3>
                <p>${program.desc}</p>
                <ul class="program-features">
                    ${program.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                </ul>
                <a href="pages/register.html" class="btn-card">سجل الآن</a>
            </div>
        `;
    });
    
    programsGrid.innerHTML = html;
}

// ===== تهيئة النماذج =====
function initForms() {
    // نموذج الاتصال
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const contactData = {
                name: document.getElementById('contactName').value,
                email: document.getElementById('contactEmail').value,
                phone: document.getElementById('contactPhone')?.value || '',
                message: document.getElementById('contactMessage').value
            };
            
            const result = await api.sendContactMessage(contactData);
            if (result.success) {
                contactForm.reset();
            }
        });
    }
    
    // نموذج النشرة البريدية
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value;
            const result = await api.subscribeNewsletter(email);
            
            if (result.success) {
                newsletterForm.reset();
            }
        });
    }
}

// ===== تحديد الرابط النشط في القائمة =====
function setActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// تشغيل تحديد الرابط النشط إذا كنا في الصفحة الرئيسية
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    setActiveNavLink();
}