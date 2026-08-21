/**
 * NP News Metro - Core Theme JavaScript
 * Lightweight, Vanilla JS, Zero jQuery dependencies
 *
 * @package NP_News_Metro
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ==========================================================================
       1. Mobile Navigation Drawer
       ========================================================================== */
    var menuTrigger = document.getElementById('np-menu-trigger');
    var drawer = document.getElementById('np-mobile-drawer');
    var drawerPanel = document.getElementById('np-drawer-panel');
    var drawerBackdrop = document.getElementById('np-drawer-backdrop');
    var drawerClose = document.getElementById('np-drawer-close');

    function openDrawer() {
        if (!drawer || !drawerPanel) return;
        drawer.classList.remove('opacity-0', 'pointer-events-none');
        drawer.classList.add('opacity-100', 'pointer-events-auto');
        drawerPanel.classList.remove('-translate-x-full');
        drawerPanel.classList.add('translate-x-0');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!drawer || !drawerPanel) return;
        drawer.classList.add('opacity-0', 'pointer-events-none');
        drawer.classList.remove('opacity-100', 'pointer-events-auto');
        drawerPanel.classList.add('-translate-x-full');
        drawerPanel.classList.remove('translate-x-0');
        document.body.style.overflow = '';
    }

    if (menuTrigger) menuTrigger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    /* ==========================================================================
       2. Instant Search Modal & Keyboard Shortcuts (Cmd+K / Ctrl+K)
       ========================================================================== */
    var searchTrigger = document.getElementById('np-search-trigger');
    var searchModal = document.getElementById('np-search-modal');
    var searchBackdrop = document.getElementById('np-search-backdrop');
    var searchClose = document.getElementById('np-search-close');
    var searchInput = document.getElementById('np-search-input');

    function openSearchModal() {
        if (!searchModal) return;
        searchModal.classList.remove('opacity-0', 'pointer-events-none');
        searchModal.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
        if (searchInput) {
            setTimeout(function () {
                searchInput.focus();
            }, 100);
        }
    }

    function closeSearchModal() {
        if (!searchModal) return;
        searchModal.classList.add('opacity-0', 'pointer-events-none');
        searchModal.classList.remove('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = '';
    }

    if (searchTrigger) searchTrigger.addEventListener('click', openSearchModal);
    if (searchClose) searchClose.addEventListener('click', closeSearchModal);
    if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearchModal);

    // Global Keydown Handler (Cmd+K / Ctrl+K / Escape)
    document.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (searchModal && searchModal.classList.contains('opacity-100')) {
                closeSearchModal();
            } else {
                openSearchModal();
            }
        }
        if (e.key === 'Escape') {
            closeDrawer();
            closeSearchModal();
            closeAllModals();
        }
    });

    /* ==========================================================================
       3. Generic Modals (e.g. Newsletter)
       ========================================================================== */
    var modalTriggers = document.querySelectorAll('[data-modal-target]');
    
    function openModalById(id) {
        var modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('opacity-0', 'pointer-events-none');
        modal.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
    }

    function closeAllModals() {
        var openModals = document.querySelectorAll('[id$="-modal"]');
        openModals.forEach(function (m) {
            m.classList.add('opacity-0', 'pointer-events-none');
            m.classList.remove('opacity-100', 'pointer-events-auto');
        });
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = btn.getAttribute('data-modal-target');
            if (targetId) openModalById(targetId);
        });
    });

    var closeButtons = document.querySelectorAll('.modal-close-btn, .modal-backdrop');
    closeButtons.forEach(function (btn) {
        btn.addEventListener('click', closeAllModals);
    });

    /* ==========================================================================
       4. Social Copy Link Button
       ========================================================================== */
    var copyButtons = document.querySelectorAll('.np-copy-link-btn');
    copyButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var url = btn.getAttribute('data-url') || window.location.href;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(function () {
                    var originalHtml = btn.innerHTML;
                    btn.innerHTML = '<span class="text-[10px] font-bold text-emerald-700">✓ Copied</span>';
                    setTimeout(function () {
                        btn.innerHTML = originalHtml;
                    }, 2000);
                });
            }
        });
    });

});
