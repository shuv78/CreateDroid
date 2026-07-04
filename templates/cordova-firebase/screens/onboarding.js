/* ============================================================
   Screen: Onboarding
   Swipeable intro with 3 slides (branding, features, get started)
   ============================================================ */

App.registerScreen('onboarding', {
    render: function() {
        return '' +
            '<div class="screen-onboarding" style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                '<div style="flex:1;display:flex;flex-direction:column;overflow:hidden;position:relative;" id="onboarding-container">' +
                    '<div style="flex:1;display:flex;transition:transform 0.3s ease-out;" id="onboarding-slides">' +
                        // Slide 1
                        '<div class="onboarding-slide" style="min-width:100%;">' +
                            '<div class="slide-icon">&#x1F310;</div>' +
                            '<h2 class="slide-title">Welcome to MyApp</h2>' +
                            '<p class="slide-desc">A modern mobile application with all the features you need, built with Cordova and Firebase.</p>' +
                        '</div>' +
                        // Slide 2
                        '<div class="onboarding-slide" style="min-width:100%;">' +
                            '<div class="slide-icon">&#x2699;&#xFE0F;</div>' +
                            '<h2 class="slide-title">Powerful Features</h2>' +
                            '<p class="slide-desc">Real-time chat, maps, payments, camera, scanner, and much more at your fingertips.</p>' +
                        '</div>' +
                        // Slide 3
                        '<div class="onboarding-slide" style="min-width:100%;">' +
                            '<div class="slide-icon">&#x1F680;</div>' +
                            '<h2 class="slide-title">Let\'s Get Started</h2>' +
                            '<p class="slide-desc">Create an account or sign in to begin your journey with MyApp.</p>' +
                        '</div>' +
                    '</div>' +
                    // Page dots
                    '<div class="page-dots">' +
                        '<div class="dot active" data-index="0"></div>' +
                        '<div class="dot" data-index="1"></div>' +
                        '<div class="dot" data-index="2"></div>' +
                    '</div>' +
                '</div>' +
                // Bottom buttons
                '<div style="padding:var(--space-md);padding-bottom:calc(var(--space-md) + env(safe-area-inset-bottom, 0));">' +
                    '<button class="btn btn-primary" style="width:100%;margin-bottom:12px;" id="onboarding-get-started">Get Started</button>' +
                    '<button class="btn btn-secondary" style="width:100%;" id="onboarding-skip">Skip</button>' +
                '</div>' +
            '</div>';
    },
    init: function() {
        var currentSlide = 0;
        var slides = document.getElementById('onboarding-slides');
        var dots = document.querySelectorAll('.page-dots .dot');
        var getStarted = document.getElementById('onboarding-get-started');
        var skipBtn = document.getElementById('onboarding-skip');

        if (!slides) return;

        function goToSlide(index) {
            if (index < 0) index = 0;
            if (index > 2) index = 2;
            currentSlide = index;
            slides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

            dots.forEach(function(d, i) {
                d.classList.toggle('active', i === currentSlide);
            });

            // Update button text
            if (getStarted) {
                getStarted.textContent = (currentSlide === 2) ? 'Get Started' : 'Next';
            }
        }

        // Touch/swipe support
        var startX = 0;
        var isDragging = false;
        var container = document.getElementById('onboarding-container');

        container.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            isDragging = true;
            slides.style.transition = 'none';
        }, { passive: true });

        container.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            var diff = e.touches[0].clientX - startX;
            var offset = -currentSlide * window.innerWidth + diff;
            slides.style.transform = 'translateX(' + offset + 'px)';
        }, { passive: true });

        container.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            slides.style.transition = 'transform 0.3s ease-out';

            var diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 60) {
                if (diff < 0 && currentSlide < 2) {
                    goToSlide(currentSlide + 1);
                } else if (diff > 0 && currentSlide > 0) {
                    goToSlide(currentSlide - 1);
                } else {
                    goToSlide(currentSlide);
                }
            } else {
                goToSlide(currentSlide);
            }
        }, { passive: true });

        // Dot clicks
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = parseInt(dot.getAttribute('data-index'));
                goToSlide(index);
            });
        });

        // Get Started / Next button
        if (getStarted) {
            getStarted.addEventListener('click', function() {
                if (currentSlide < 2) {
                    goToSlide(currentSlide + 1);
                } else {
                    Utils.setStorage('onboarding_done', true);
                    App.showScreen('login');
                }
            });
        }

        // Skip button
        if (skipBtn) {
            skipBtn.addEventListener('click', function() {
                Utils.setStorage('onboarding_done', true);
                App.showScreen('login');
            });
        }

        // Keyboard support
        var keyHandler = function(e) {
            if (App.getCurrentScreen() !== 'onboarding') {
                document.removeEventListener('keydown', keyHandler);
                return;
            }
            if (e.key === 'ArrowRight' && currentSlide < 2) goToSlide(currentSlide + 1);
            if (e.key === 'ArrowLeft' && currentSlide > 0) goToSlide(currentSlide - 1);
            if (e.key === 'Enter') {
                if (currentSlide < 2) goToSlide(currentSlide + 1);
                else {
                    Utils.setStorage('onboarding_done', true);
                    App.showScreen('login');
                }
            }
        };
        document.addEventListener('keydown', keyHandler);
    },
    destroy: function() {
        // Cleanup if needed
    }
});
