/* ============================================================
   Screen: List
   Filterable/paginated table with search, column sorting
   ============================================================ */

App.registerScreen('list', {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;background:var(--color-bg);">' +
                // Header
                '<div class="nav-bar">' +
                    '<button class="nav-back" id="list-back">&#x2190; ' + App.t('app.back') + '</button>' +
                    '<div class="nav-title">' + App.t('list.title') + '</div>' +
                '</div>' +

                // Search bar
                '<div style="padding:var(--space-sm) var(--space-md);">' +
                    '<input type="text" id="list-search" class="input-field" placeholder="' + App.t('list.searchPlaceholder') + '" style="padding-left:40px;background-image:url(\'data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"%236E7681\\" stroke-width=\\"2\\" stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\"><circle cx=\\"11\\" cy=\\"11\\" r=\\"8\\"/><line x1=\\"21\\" y1=\\"21\\" x2=\\"16.65\\" y2=\\"16.65\\"/></svg>\');background-repeat:no-repeat;background-position:12px center;" />' +
                '</div>' +

                // Item count & sort
                '<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-xs) var(--space-md);">' +
                    '<span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);" id="list-total-count">' + App.t('list.totalItems', {count: 0}) + '</span>' +
                    '<div style="display:flex;gap:8px;">' +
                        '<select id="list-sort" class="input-field" style="width:auto;padding:6px 12px;font-size:var(--font-size-footnote);">' +
                            '<option value="createdAt">Date</option>' +
                            '<option value="name">Name</option>' +
                            '<option value="email">Email</option>' +
                        '</select>' +
                        '<button id="list-sort-dir" style="width:36px;height:36px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-bg-input);cursor:pointer;font-size:16px;">&#x2191;</button>' +
                    '</div>' +
                '</div>' +

                // List content
                '<div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;" id="list-content">' +
                    '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">' + App.t('app.loading') + '</div>' +
                '</div>' +

                // Pagination
                '<div class="pagination" id="list-pagination">' +
                    '<button id="list-prev" disabled>&#x2190;</button>' +
                    '<span style="font-size:var(--font-size-footnote);color:var(--color-text-secondary);" id="list-page-info">' + App.t('list.pageOf', {current: 1, total: 1}) + '</span>' +
                    '<button id="list-next" disabled>&#x2192;</button>' +
                '</div>' +

                // FAB
                '<button class="fab" id="list-add-fab">+</button>' +
            '</div>';
    },
    init: function(params) {
        var allItems = [];
        var filteredItems = [];
        var currentPage = 1;
        var perPage = 10;
        var sortAsc = true;
        var sortField = 'createdAt';
        var searchQuery = '';

        var content = document.getElementById('list-content');
        var searchInput = document.getElementById('list-search');
        var sortSelect = document.getElementById('list-sort');
        var sortDir = document.getElementById('list-sort-dir');
        var prevBtn = document.getElementById('list-prev');
        var nextBtn = document.getElementById('list-next');
        var pageInfo = document.getElementById('list-page-info');
        var totalCount = document.getElementById('list-total-count');
        var addFab = document.getElementById('list-add-fab');

        // Back
        var backBtn = document.getElementById('list-back');
        if (backBtn) backBtn.addEventListener('click', function() { App.goBack(); });

        // Load data
        function loadItems() {
            if (typeof DB === 'undefined') {
                if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">Database not available</div>';
                return;
            }

            DB.getDocs('items', { orderBy: sortField, orderByDesc: !sortAsc })
                .then(function(result) {
                    allItems = result.items || [];
                    applyFilters();
                })
                .catch(function(err) {
                    if (content) content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-error);">Error loading: ' + err.message + '</div>';
                });
        }

        function applyFilters() {
            // Search filter
            if (searchQuery) {
                filteredItems = DB.searchItems(allItems, searchQuery, ['name', 'email', 'description', 'title']);
            } else {
                filteredItems = allItems.slice();
            }

            // Sort
            filteredItems.sort(function(a, b) {
                var aVal = a[sortField] || '';
                var bVal = b[sortField] || '';
                if (typeof aVal === 'string') {
                    var cmp = aVal.localeCompare(bVal);
                    return sortAsc ? cmp : -cmp;
                }
                return sortAsc ? (aVal - bVal) : (bVal - aVal);
            });

            currentPage = 1;
            renderList();
        }

        function renderList() {
            var paged = DB.paginate(filteredItems, currentPage, perPage);
            var page = (currentPage > paged.totalPages) ? 1 : currentPage;
            if (currentPage !== page) {
                currentPage = page;
                paged = DB.paginate(filteredItems, currentPage, perPage);
            }

            if (!content) return;

            if (paged.items.length === 0) {
                content.innerHTML = '<div style="padding:var(--space-xl);text-align:center;color:var(--color-text-medium);">' + App.t('list.noItems') + '</div>';
            } else {
                var html = '';
                paged.items.forEach(function(item) {
                    var title = item.name || item.title || item.email || item.id;
                    var subtitle = item.description || Utils.formatDate(item.createdAt, 'relative') || '';
                    var dateStr = item.createdAt ? Utils.formatDate(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt, 'date') : '';
                    html += '' +
                        '<div class="list-item" data-id="' + item.id + '">' +
                            '<div style="width:40px;height:40px;border-radius:50%;background:var(--color-primary-light);display:flex;align-items:center;justify-content:center;margin-right:12px;color:var(--color-primary);font-weight:600;">' + (title ? title.charAt(0).toUpperCase() : '?') + '</div>' +
                            '<div class="item-content">' +
                                '<div class="item-title">' + Utils.escapeHtml ? Utils.escapeHtml(title) : title + '</div>' +
                                '<div class="item-subtitle">' + dateStr + '</div>' +
                            '</div>' +
                            '<span style="color:var(--color-text-medium);font-size:20px;">&#x203A;</span>' +
                        '</div>';
                });
                content.innerHTML = html;

                // Click handlers
                content.querySelectorAll('.list-item').forEach(function(el) {
                    el.addEventListener('click', function() {
                        var id = el.getAttribute('data-id');
                        App.showScreen('detail', { id: id });
                    });
                });
            }

            // Pagination
            var totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
            if (prevBtn) prevBtn.disabled = currentPage <= 1;
            if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
            if (pageInfo) pageInfo.textContent = App.t('list.pageOf', {current: currentPage, total: totalPages});
            if (totalCount) totalCount.textContent = App.t('list.totalItems', {count: filteredItems.length});
        }

        // Search
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(function() {
                searchQuery = searchInput.value.trim();
                applyFilters();
            }, 300));
        }

        // Sort
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                sortField = sortSelect.value;
                applyFilters();
            });
        }

        if (sortDir) {
            sortDir.addEventListener('click', function() {
                sortAsc = !sortAsc;
                sortDir.innerHTML = sortAsc ? '&#x2191;' : '&#x2193;';
                applyFilters();
            });
        }

        // Pagination
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) { currentPage--; renderList(); }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                var totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage));
                if (currentPage < totalPages) { currentPage++; renderList(); }
            });
        }

        // FAB
        if (addFab) addFab.addEventListener('click', function() { App.showScreen('form'); });

        loadItems();
    },
    destroy: function() {}
});
