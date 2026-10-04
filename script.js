/* ========================================
   Rinjani Scholars Landing Page
   JavaScript - Interactivity & Core Features
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Google Apps Script Web App Endpoint ---
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyr7HhNcRmlANPtGdKGWmkShhZE--HPEMCBfY-sybRk0UOXTq7ahqW4zCfanT7KSWIh/exec';

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) preloader.classList.add('loaded');
        }, 800);
    });

    // Safety fallback: hide preloader after 3 seconds regardless
    setTimeout(() => {
        if (preloader) preloader.classList.add('loaded');
    }, 3000);

    // --- Navbar Scroll Effect & Back-to-Top ---
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Back to top button
        if (currentScroll > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Mobile Navigation ---
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu on link click
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveNav = () => {
        const scrollPos = window.pageYOffset + 140;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        animateOnScroll.observe(el);
    });

    // --- Counter Animation ---
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('[data-count]');
                counters.forEach(counter => {
                    animateCounter(counter);
                });
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    const impactSection = document.querySelector('.impact');
    if (impactSection) counterObserver.observe(impactSection);

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'), 10);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeProgress * target);

            element.textContent = current.toLocaleString('id-ID');

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('id-ID');
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // --- Dynamic Stats Fetching from Google Spreadsheet ---
    async function fetchLiveStats() {
        if (!GOOGLE_SCRIPT_URL) return;
        try {
            const res = await fetch(GOOGLE_SCRIPT_URL);
            if (!res.ok) return;
            const data = await res.json();

            if (data && typeof data === 'object') {
                const map = {
                    'followers': '#impact-followers .impact-number',
                    'konten': '#impact-content .impact-number',
                    'webinar': '#impact-webinars .impact-number'
                };

                for (const [key, selector] of Object.entries(map)) {
                    if (data[key] !== undefined && !isNaN(data[key])) {
                        const el = document.querySelector(selector);
                        if (el) {
                            const oldVal = parseInt(el.getAttribute('data-count'), 10);
                            const newVal = parseInt(data[key], 10);
                            el.setAttribute('data-count', newVal);
                            if (el.textContent !== '0' && oldVal !== newVal) {
                                animateCounter(el);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            // Silently fallback to static defaults in HTML
            console.log('Using default static stats:', err.message);
        }
    }

    // Trigger stats fetch immediately
    fetchLiveStats();

    // --- Testimonial Slider ---
    const track = document.getElementById('testimonial-track');
    const dotsContainer = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');

    if (track && dotsContainer && prevBtn && nextBtn) {
        const slides = track.querySelectorAll('.testimonial-card');
        let currentSlide = 0;
        const totalSlides = slides.length;

        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('testimonial-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.testimonial-dot');

        function goToSlide(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        prevBtn.addEventListener('click', () => {
            goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
        });

        nextBtn.addEventListener('click', () => {
            goToSlide((currentSlide + 1) % totalSlides);
        });

        // Auto-slide
        let autoSlide = setInterval(() => {
            goToSlide((currentSlide + 1) % totalSlides);
        }, 5500);

        const slider = document.getElementById('testimonial-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => clearInterval(autoSlide));
            slider.addEventListener('mouseleave', () => {
                autoSlide = setInterval(() => {
                    goToSlide((currentSlide + 1) % totalSlides);
                }, 5500);
            });

            // Touch/swipe support
            let touchStartX = 0;
            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            slider.addEventListener('touchend', (e) => {
                const diff = touchStartX - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        goToSlide((currentSlide + 1) % totalSlides);
                    } else {
                        goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
                    }
                }
            }, { passive: true });
        }
    }

    // --- Contact Form Handling with Google Spreadsheet ---
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            let statusDiv = document.getElementById('form-status');

            if (!statusDiv) {
                statusDiv = document.createElement('div');
                statusDiv.id = 'form-status';
                contactForm.appendChild(statusDiv);
            }

            const subjectMap = {
                'beyond-the-horizon': 'Program Beyond The Horizon',
                'info-beasiswa': 'Info & Konsultasi Beasiswa',
                'volunteer': 'Volunteer',
                'rinjani-mengajar': 'Volunteer Rinjani Mengajar',
                'collab': 'Kerjasama & Kolaborasi',
                'other': 'Lainnya'
            };

            const formData = new FormData(contactForm);
            const rawSubject = formData.get('subject') || '';
            const subjectText = subjectMap[rawSubject] || rawSubject || 'Pesan Baru';

            const params = new URLSearchParams();
            params.append('name', formData.get('name') || '');
            params.append('email', formData.get('email') || '');
            params.append('subject', rawSubject);
            params.append('subjectText', subjectText);
            params.append('message', formData.get('message') || '');

            // Set loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="btn-spinner"></span><span>Mengirim Pesan...</span>';
                submitBtn.style.opacity = '0.88';
                submitBtn.style.cursor = 'not-allowed';
            }
            statusDiv.style.display = 'none';

            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    body: params,
                    mode: 'no-cors'
                });

                // Success feedback
                if (submitBtn) {
                    submitBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> <span>Berhasil Terkirim!</span>';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    submitBtn.style.color = '#ffffff';
                }

                statusDiv.className = 'form-status success';
                statusDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span><strong>Terima kasih!</strong> Pesan Anda telah tersimpan ke sistem kami dan akan segera kami respon.</span>';
                statusDiv.style.display = 'flex';

                contactForm.reset();

                setTimeout(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnHTML;
                        submitBtn.style.background = '';
                        submitBtn.style.color = '';
                        submitBtn.style.opacity = '1';
                        submitBtn.style.cursor = 'pointer';
                    }
                }, 4500);

            } catch (error) {
                console.error('Submission error:', error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                }
                statusDiv.className = 'form-status error';
                statusDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>Gagal mengirim pesan. Silakan coba kembali atau hubungi via WhatsApp/Email.</span>';
                statusDiv.style.display = 'flex';
            }
        });
    }

    // --- Smooth Scroll for In-Page Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
