/*JS TOTALSPORTPLUS*/

document.addEventListener('DOMContentLoaded', function() {

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        setCookie(name, '', -1);
    }

    /*COUNTDOWN OLYMPICS*/
    function startCountdown() {
        const targetDate = new Date("Feb 6, 2026 00:00:00").getTime();
        const countdownElement = document.getElementById('countdown');

        if (!countdownElement) return;

        countdownElement.innerHTML = "Time remaining: <span class='text-danger'>Calculating...</span>";

        const interval = setInterval(function() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownElement.innerHTML = `<span class="text-success">THE GAMES ARE UNDERWAY!</span>`;
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.innerHTML = 
                `Time remaining: <span class="text-danger">${days}d ${hours}h ${minutes}m ${seconds}s</span>`;
        }, 1000);
    }
    
    startCountdown();

    
    /*GDPR COMPLIANT COOKIE CONSENT MANAGEMENT*/

    const consentBanner = document.getElementById('cookie-consent');
    const acceptButton = document.getElementById('accept-cookies');
    const rejectButton = document.getElementById('reject-cookies');
    const cookieSettingsLink = document.getElementById('cookie-settings-link');

    function initializeProfilingCookies() {
        
        /* NON-VISIBLE COOKIE: GEOLOCATION*/
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const locationString = `Lat:${lat.toFixed(2)},Lon:${lon.toFixed(2)}`;
                    setCookie('non_vis_location', locationString, 90);
                }, 
                function(error) {
                    console.warn('Geolocation error:', error.message);
                    setCookie('non_vis_location', 'denied', 90);
                }
            );
        }

        /* NON-VISIBLE COOKIE: DEMOGRAPHIC DATA */
        if (!getCookie('non_vis_age')) {
            const randomAge = Math.floor(Math.random() * 40) + 18; 
            setCookie('non_vis_age', randomAge, 365);
        }
    }

    function removeProfilingCookies() {
        deleteCookie('non_vis_location');
        deleteCookie('non_vis_age');
        deleteCookie('pref_sport');
        deleteCookie('fav_team');
    }

    function showError(message) {
        const errorElement = document.getElementById('preference-error');
        const errorText = document.getElementById('error-text');
        if (errorElement && errorText) {
            errorText.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    function checkConsent() {
        const consent = getCookie('consent_given');
        
        if (consent === null) {
            consentBanner.style.display = 'block';
        } else if (consent === 'full') {
            initializeProfilingCookies();
        }
    }
    
    checkConsent();

    /*IF ACCEPT ALL*/
    if (acceptButton) {
        acceptButton.addEventListener('click', function() {
            setCookie('consent_given', 'full', 365);
            consentBanner.style.display = 'none';
            initializeProfilingCookies();
        });
    }

    /*IF ONLY NECESSARY*/
    if (rejectButton) {
        rejectButton.addEventListener('click', function() {
            setCookie('consent_given', 'necessary', 365);
            consentBanner.style.display = 'none';
            removeProfilingCookies();
        });
    }

    if (cookieSettingsLink) {
        cookieSettingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            deleteCookie('consent_given');
            consentBanner.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    
    /*USER PREFERENCES FORM (VISIBLE COOKIES)*/
    
    const cookieForm = document.getElementById('cookie-form');
    
    if (cookieForm) {

        const consent = getCookie('consent_given');
        if (consent === 'full') {
            const prefSport = getCookie('pref_sport');
            const favTeam = getCookie('fav_team');
            
            if (prefSport) document.getElementById('pref-sport').value = prefSport;
            if (favTeam) document.getElementById('fav-team').value = favTeam;
        }

        cookieForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            /*VALIDATION*/
            cookieForm.classList.add('was-validated');
            if (!cookieForm.checkValidity()) {
                showError('Please fill in all required fields correctly.');
                return;
            }

            const sport = document.getElementById('pref-sport').value;
            const team = document.getElementById('fav-team').value;
            
            if (!sport || !team) {
                showError('Please fill in all fields.');
                return;
            }

            if (team.length < 2 || team.length > 50) {
                showError('Team/athlete name must be between 2 and 50 characters.');
                return;
            }

            /* CHECK IF THE USER HAS GIVEN CONSENT*/
            const consent = getCookie('consent_given');
            if (consent !== 'full') {
                showError('Please accept cookies to save your preferences.');
                
                consentBanner.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            setCookie('pref_sport', sport, 30);
            setCookie('fav_team', team, 30);
            
            const msg = document.getElementById('preference-message');
            msg.style.display = 'block';
            
            setTimeout(() => {
                msg.style.display = 'none';
            }, 5000);
        });

        /*FEEDBACK FOR VALIDATION*/
        const inputs = cookieForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (cookieForm.classList.contains('was-validated')) {
                    if (!this.checkValidity()) {
                        this.classList.add('is-invalid');
                    } else {
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    }
                }
            });
        });
    }

    
    /* LAZY LOADING FOR IMAGES */
     
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

});