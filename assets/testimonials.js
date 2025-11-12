// Testimonials Page JavaScript - Interactive Reviews and Rating System
document.addEventListener('DOMContentLoaded', function() {
    initializeTestimonialAnimations();
    initializeStarRating();
    initializeReviewForm();
    initializeTestimonialFilters();
});

// Initialize testimonial animations
function initializeTestimonialAnimations() {
    // Animate testimonial cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 100); // Stagger animation
            }
        });
    }, observerOptions);

    // Observe all testimonial cards
    document.querySelectorAll('.testimonial-card, .testimonial-card-horizontal, .mini-review').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Add hover effects
    addTestimonialHoverEffects();
}

// Add hover effects to testimonial cards
function addTestimonialHoverEffects() {
    document.querySelectorAll('.testimonial-card, .testimonial-card-horizontal').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '';
        });
    });

    // Video testimonial hover effects
    document.querySelectorAll('.video-testimonial-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const playIcon = this.querySelector('.fa-play-circle');
            if (playIcon) {
                playIcon.style.transform = 'scale(1.2)';
            }
        });

        card.addEventListener('mouseleave', function() {
            const playIcon = this.querySelector('.fa-play-circle');
            if (playIcon) {
                playIcon.style.transform = 'scale(1)';
            }
        });
    });
}

// Initialize star rating system
function initializeStarRating() {
    const starsContainer = document.querySelector('.stars-input');
    const ratingInput = document.getElementById('rating');

    if (starsContainer && ratingInput) {
        const stars = starsContainer.querySelectorAll('.fas.fa-star');

        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-value'));
                setRating(rating);
                ratingInput.value = rating;
            });

            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-value'));
                highlightStars(rating);
            });
        });

        starsContainer.addEventListener('mouseleave', function() {
            const currentRating = parseInt(ratingInput.value) || 0;
            highlightStars(currentRating);
        });
    }

    function highlightStars(rating) {
        const stars = document.querySelectorAll('.stars-input .fas.fa-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = '#dee2e6';
            }
        });
    }

    function setRating(rating) {
        const starsContainer = document.querySelector('.stars-input');
        starsContainer.setAttribute('data-rating', rating);
        highlightStars(rating);
    }
}

// Initialize review form
function initializeReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReviewSubmission(this);
    });

    // Real-time character count for review text
    const reviewText = document.getElementById('reviewText');
    if (reviewText) {
        const maxLength = 500;
        const charCounter = document.createElement('small');
        charCounter.className = 'text-muted';
        charCounter.textContent = `0/${maxLength} characters`;
        reviewText.parentNode.appendChild(charCounter);

        reviewText.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCounter.textContent = `${currentLength}/${maxLength} characters`;
            
            if (currentLength > maxLength * 0.9) {
                charCounter.classList.add('text-warning');
            } else {
                charCounter.classList.remove('text-warning');
            }
        });
    }
}

// Handle review form submission
function handleReviewSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting Review...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = new FormData(form);
    const reviewData = Object.fromEntries(formData);
    
    // Add rating from star system
    reviewData.rating = document.getElementById('rating').value;

    // Validate rating
    if (!reviewData.rating || reviewData.rating < 1) {
        showAlert('warning', 'Please provide a star rating for your review.');
        resetSubmitButton(submitBtn, originalText);
        return;
    }

    // Simulate API call
    setTimeout(() => {
        // Reset form
        form.reset();
        document.querySelector('.stars-input').setAttribute('data-rating', '0');
        document.querySelectorAll('.stars-input .fas.fa-star').forEach(star => {
            star.style.color = '#dee2e6';
        });

        // Show success message
        showAlert('success', 'Thank you for your review! It will be published after moderation.');

        // Reset button
        resetSubmitButton(submitBtn, originalText);

        // Log review data (in production, this would be sent to server)
        console.log('Review submitted:', reviewData);

        // Show thank you modal
        showThankYouModal(reviewData);

    }, 2000);
}

function resetSubmitButton(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

// Show thank you modal
function showThankYouModal(reviewData) {
    const modalHtml = `
        <div class="modal fade" id="thankYouModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fas fa-check-circle me-2"></i>Review Submitted!
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <i class="fas fa-star text-warning fa-3x mb-3"></i>
                        <h4>Thank You, ${reviewData.reviewerName || 'Valued Customer'}!</h4>
                        <p class="mb-3">Your ${reviewData.rating}-star review has been received and will be published after our quality review process.</p>
                        <div class="bg-light p-3 rounded mb-3">
                            <strong>Review Title:</strong> ${reviewData.reviewTitle}<br>
                            <strong>Service:</strong> ${getServiceDisplayName(reviewData.serviceUsed)}
                        </div>
                        <p class="text-muted small">We appreciate your feedback and will use it to continue improving our services.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Continue</button>
                        <a href="order.html" class="btn btn-outline-primary">Place Another Order</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('thankYouModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add new modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('thankYouModal'));
    modal.show();

    // Remove modal from DOM after it's hidden
    document.getElementById('thankYouModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Get service display name
function getServiceDisplayName(serviceCode) {
    const serviceNames = {
        'wash-fold': 'Wash & Fold',
        'dry-clean': 'Dry Cleaning',
        'ironing': 'Ironing Service',
        'express': 'Express Service',
        'multiple': 'Multiple Services'
    };
    return serviceNames[serviceCode] || serviceCode;
}

// Initialize testimonial filters
function initializeTestimonialFilters() {
    // Add search functionality
    addTestimonialSearch();
    
    // Add rating filter
    addRatingFilter();
    
    // Add service filter
    addServiceFilter();
}

// Add testimonial search functionality
function addTestimonialSearch() {
    const searchContainer = document.querySelector('.featured-testimonials .container');
    if (!searchContainer) return;

    const searchHtml = `
        <div class="row mb-4">
            <div class="col-lg-6 mx-auto">
                <div class="search-box">
                    <input type="text" id="testimonialSearch" class="form-control" placeholder="Search testimonials...">
                    <i class="fas fa-search search-icon"></i>
                </div>
            </div>
        </div>
    `;

    const titleSection = searchContainer.querySelector('.text-center.mb-5');
    titleSection.insertAdjacentHTML('afterend', searchHtml);

    // Add search functionality
    const searchInput = document.getElementById('testimonialSearch');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTestimonials(searchTerm);
    });
}

// Filter testimonials based on search term
function filterTestimonials(searchTerm) {
    const testimonials = document.querySelectorAll('.testimonial-card, .testimonial-card-horizontal, .mini-review');
    
    testimonials.forEach(testimonial => {
        const text = testimonial.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            testimonial.style.display = '';
            testimonial.parentElement.style.display = '';
        } else {
            testimonial.style.display = 'none';
            // Hide parent column if it becomes empty
            const parentCol = testimonial.parentElement;
            const visibleSiblings = Array.from(parentCol.parentElement.children).filter(col => 
                col.style.display !== 'none'
            );
            if (visibleSiblings.length === 0) {
                parentCol.style.display = 'none';
            }
        }
    });
}

// Add rating filter
function addRatingFilter() {
    // This can be implemented based on specific requirements
    console.log('Rating filter functionality can be added here');
}

// Add service filter
function addServiceFilter() {
    // This can be implemented based on specific requirements
    console.log('Service filter functionality can be added here');
}

// Testimonial sharing functionality
function shareTestimonial(testimonialElement) {
    if (navigator.share) {
        navigator.share({
            title: 'Fresh Clean Laundry Review',
            text: testimonialElement.querySelector('p').textContent,
            url: window.location.href
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        copyToClipboard(testimonialElement.querySelector('p').textContent);
        showAlert('success', 'Testimonial copied to clipboard!');
    }
}

// Copy to clipboard utility
function copyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

// Show alert utility
function showAlert(type, message) {
    // Remove existing alerts
    document.querySelectorAll('.alert.position-fixed').forEach(alert => {
        alert.remove();
    });

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Load more testimonials functionality
function loadMoreTestimonials() {
    // This would typically make an API call to load more testimonials
    showAlert('info', 'Loading more testimonials...');
    
    setTimeout(() => {
        showAlert('success', 'More testimonials loaded!');
        // Add new testimonials to the DOM here
    }, 1500);
}

// Video testimonial play functionality
function playVideoTestimonial(videoElement) {
    // This would typically initialize a video player
    console.log('Play video testimonial:', videoElement);
    showAlert('info', 'Video testimonial would play here in the full implementation.');
}

// Add click handlers for video testimonials
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.video-testimonial-card').forEach(card => {
        card.addEventListener('click', function() {
            playVideoTestimonial(this);
        });
    });
});

// Testimonial analytics tracking
function trackTestimonialInteraction(action, testimonialId = null) {
    // This would send analytics data to your tracking service
    console.log('Testimonial interaction:', { action, testimonialId, timestamp: new Date() });
}

// Add interaction tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track testimonial views
    document.querySelectorAll('.testimonial-card, .testimonial-card-horizontal').forEach((testimonial, index) => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackTestimonialInteraction('view', `testimonial-${index}`);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(testimonial);
    });

    // Track review form interactions
    document.getElementById('reviewForm')?.addEventListener('focusin', function() {
        trackTestimonialInteraction('review_form_start');
    }, { once: true });
});

// Export functions for global use
window.shareTestimonial = shareTestimonial;
window.loadMoreTestimonials = loadMoreTestimonials;
window.playVideoTestimonial = playVideoTestimonial;