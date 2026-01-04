// Taste Ceylon - Shared JavaScript

// ============================================
// Cart & Wishlist Management with localStorage
// ============================================

const TasteCeylon = {
    // Initialize cart from localStorage
    getCart: function() {
        try {
            const cart = localStorage.getItem('tasteCeylonCart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            return [];
        }
    },
    
    // Save cart to localStorage
    saveCart: function(cart) {
        try {
            localStorage.setItem('tasteCeylonCart', JSON.stringify(cart));
        } catch (e) {
            console.error('Could not save cart');
        }
    },
    
    // Add item to cart
    addToCart: function(product) {
        const cart = this.getCart();
        const existingIndex = cart.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity += product.quantity || 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                emoji: product.emoji,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart(cart);
        this.updateCartCount();
        return cart;
    },
    
    // Get cart count
    getCartCount: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },
    
    // Update cart count display
    updateCartCount: function() {
        const count = this.getCartCount();
        document.querySelectorAll('.cart-count').forEach(el => {
            el.textContent = count;
        });
    },
    
    // Initialize wishlist from localStorage
    getWishlist: function() {
        try {
            const wishlist = localStorage.getItem('tasteCeylonWishlist');
            return wishlist ? JSON.parse(wishlist) : [];
        } catch (e) {
            return [];
        }
    },
    
    // Save wishlist to localStorage
    saveWishlist: function(wishlist) {
        try {
            localStorage.setItem('tasteCeylonWishlist', JSON.stringify(wishlist));
        } catch (e) {
            console.error('Could not save wishlist');
        }
    },
    
    // Toggle wishlist item
    toggleWishlist: function(product) {
        const wishlist = this.getWishlist();
        const existingIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            return false; // Removed
        } else {
            wishlist.push({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                emoji: product.emoji
            });
            return true; // Added
        }
    },
    
    // Check if item is in wishlist
    isInWishlist: function(productId) {
        const wishlist = this.getWishlist();
        return wishlist.some(item => item.id === productId);
    },
    
    // Escape HTML for safe display
    escapeHtml: function(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function(m) {
            return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
        });
    }
};

// ============================================
// DOM Ready Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on page load
    TasteCeylon.updateCartCount();
});

// ============================================
// Header scroll effect
// ============================================
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============================================
// Mobile menu toggle
// ============================================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mobileNav = document.querySelector('.mobile-nav');
const mobileNavClose = document.querySelector('.mobile-nav-close');

if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (mobileNavClose && mobileNav) {
    mobileNavClose.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close mobile nav when clicking a link
if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(e) {
    if (mobileNav && mobileNav.classList.contains('active')) {
        if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ============================================
// Smooth scroll for navigation links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ============================================
// Add to cart functionality
// ============================================
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Get product info from parent card
        const card = this.closest('.product-card');
        if (card) {
            const nameEl = card.querySelector('.product-name');
            const categoryEl = card.querySelector('.product-category');
            const priceEl = card.querySelector('.price');
            const imageEl = card.querySelector('.product-image');
            
            const product = {
                id: nameEl ? nameEl.textContent.toLowerCase().replace(/\s+/g, '-') : Date.now().toString(),
                name: nameEl ? nameEl.textContent : 'Product',
                category: categoryEl ? categoryEl.textContent : 'General',
                price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0,
                emoji: imageEl ? imageEl.textContent.trim().charAt(0) : '📦',
                quantity: 1
            };
            
            TasteCeylon.addToCart(product);
            
            // Animation feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
            }, 100);
            
            // Show notification
            showNotification('Added to cart!', 'success');
        }
    });
});

// ============================================
// Wishlist functionality
// ============================================
document.querySelectorAll('.product-action-btn[aria-label="Add to wishlist"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = this.closest('.product-card');
        if (card) {
            const nameEl = card.querySelector('.product-name');
            const categoryEl = card.querySelector('.product-category');
            const priceEl = card.querySelector('.price');
            const imageEl = card.querySelector('.product-image');
            
            const product = {
                id: nameEl ? nameEl.textContent.toLowerCase().replace(/\s+/g, '-') : Date.now().toString(),
                name: nameEl ? nameEl.textContent : 'Product',
                category: categoryEl ? categoryEl.textContent : 'General',
                price: priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) : 0,
                emoji: imageEl ? imageEl.textContent.trim().charAt(0) : '📦'
            };
            
            const added = TasteCeylon.toggleWishlist(product);
            TasteCeylon.saveWishlist(TasteCeylon.getWishlist().concat(added ? [] : []).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i));
            
            // Toggle visual state
            const svg = this.querySelector('svg');
            if (svg) {
                if (added) {
                    svg.style.fill = 'var(--burgundy)';
                    svg.style.stroke = 'var(--burgundy)';
                    showNotification('Added to wishlist!', 'success');
                } else {
                    svg.style.fill = 'none';
                    svg.style.stroke = '';
                    showNotification('Removed from wishlist', 'info');
                }
            }
        }
    });
});

// ============================================
// Quick view functionality
// ============================================
document.querySelectorAll('.product-action-btn[aria-label="Quick view"]').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Navigate to product page
        window.location.href = 'product.html';
    });
});

// ============================================
// Product card click to navigate
// ============================================
document.querySelectorAll('.product-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        // Don't navigate if clicking on action buttons
        if (e.target.closest('.product-actions') || e.target.closest('.add-to-cart')) {
            return;
        }
        window.location.href = 'product.html';
    });
});

// ============================================
// Notification system
// ============================================
function showNotification(message, type = 'info') {
    // Remove any existing notification
    const existing = document.querySelector('.tc-notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'tc-notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--forest-green)' : type === 'error' ? 'var(--burgundy)' : 'var(--cinnamon-brown)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-family: 'Lato', sans-serif;
        font-size: 0.95rem;
    `;
    notification.textContent = message;
    
    // Add animation keyframes if not already added
    if (!document.getElementById('tc-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'tc-notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// FAQ Accordion
// ============================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const faqItem = this.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ============================================
// Form submission handling
// ============================================
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check form type and handle accordingly
        if (this.classList.contains('newsletter-form')) {
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.validity.valid) {
                const email = TasteCeylon.escapeHtml(emailInput.value);
                showNotification('Thank you for subscribing!', 'success');
            }
        } else if (this.classList.contains('contact-form')) {
            showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        } else if (this.classList.contains('track-order-form')) {
            const trackResult = document.querySelector('.track-result');
            if (trackResult) {
                trackResult.classList.add('active');
            }
        }
        
        this.reset();
    });
});

// ============================================
// Intersection Observer for scroll animations
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.animate-on-scroll, .card, .product-card, .blog-card, .value-card, .team-card, .info-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ============================================
// Filter tabs functionality
// ============================================
document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Filter products
        const filter = this.textContent.toLowerCase().trim();
        document.querySelectorAll('.product-card').forEach(card => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            
            if (filter === 'all') {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            } else {
                const categoryEl = card.querySelector('.product-category');
                const category = categoryEl ? categoryEl.textContent.toLowerCase() : '';
                
                // Match filter terms
                let matches = false;
                if (filter === 'cinnamon sticks' && category.includes('cinnamon sticks')) {
                    matches = true;
                } else if (filter === 'ground' && category.includes('ground')) {
                    matches = true;
                } else if (filter === 'collections' && (category.includes('collection') || category.includes('spice'))) {
                    matches = true;
                } else if (filter === 'gift packs' && category.includes('gift')) {
                    matches = true;
                } else if (category.includes(filter)) {
                    matches = true;
                }
                
                if (matches) {
                    card.style.display = 'block';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        if (!card.closest('.filter-tab')?.classList.contains('active')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            }
        });
    });
});

// ============================================
// Sort select functionality
// ============================================
const sortSelect = document.querySelector('.sort-select');
if (sortSelect) {
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;
        
        const products = Array.from(productsGrid.querySelectorAll('.product-card'));
        
        products.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.price')?.textContent.replace(/[^0-9.]/g, '') || 0);
            const priceB = parseFloat(b.querySelector('.price')?.textContent.replace(/[^0-9.]/g, '') || 0);
            
            if (sortBy.includes('Low to High')) {
                return priceA - priceB;
            } else if (sortBy.includes('High to Low')) {
                return priceB - priceA;
            }
            return 0; // Keep original order for other options
        });
        
        // Re-append sorted products
        products.forEach(product => productsGrid.appendChild(product));
    });
}

// ============================================
// Blog filter functionality
// ============================================
document.querySelectorAll('.blog-card').forEach(card => {
    const categoryEl = card.querySelector('.blog-category');
    if (categoryEl) {
        card.dataset.category = categoryEl.textContent.toLowerCase();
    }
});

// ============================================
// Category card navigation
// ============================================
document.querySelectorAll('.category-card, .category-link').forEach(el => {
    el.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'shop.html';
    });
});
