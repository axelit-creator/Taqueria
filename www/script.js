
        // Data structures
        let currentOrder = {
            location: '',
            items: [],
            total: 0
        };

        let savedOrders = [];
        let salesHistory = [];

        // Product catalog
        const products = [
            { id: 1, name: 'Taco Vapor', price: 8 },
            { id: 2, name: 'Taco Bistec', price: 13 },
            { id: 3, name: 'Taco Tripa', price: 17 },
            { id: 4, name: 'Taco Lengua', price: 20 },
            { id: 5, name: 'Agua Natural', price: 10 },
            { id: 6, name: 'Refresco 500ml', price: 20 },
            { id: 7, name: 'Refresco 2 Lts', price: 45 },
            { id: 8, name: 'Vasos', price: 1 }
        ];

        // Initialize application
        function initApp() {
            loadData();
            renderProducts();
            updateOrderDisplay();
            renderOrdersList();
            renderHistory();
        }

        // Data persistence
        function loadData() {
            const saved = localStorage.getItem('tacosPosOrders');
            const history = localStorage.getItem('tacosPosHistory');
            
            if (saved) savedOrders = JSON.parse(saved);
            if (history) salesHistory = JSON.parse(history);
        }

        function saveData() {
            localStorage.setItem('tacosPosOrders', JSON.stringify(savedOrders));
            localStorage.setItem('tacosPosHistory', JSON.stringify(salesHistory));
        }

        // UI Navigation
        function showSection(sectionId) {
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            document.getElementById(sectionId).classList.add('active');
            document.querySelector(`.tab[onclick="showSection('${sectionId}')"]`).classList.add('active');
        }

        // Product Management
        function renderProducts() {
            const grid = document.getElementById('products-grid');
            grid.innerHTML = '';
            
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.onclick = () => addToOrder(product);
                card.innerHTML = `
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                `;
                grid.appendChild(card);
            });
        }

        function addToOrder(product) {
            const existingItem = currentOrder.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                currentOrder.items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            
            updateOrderTotal();
            updateOrderDisplay();
        }

        function updateOrderTotal() {
            currentOrder.total = currentOrder.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }

        function updateOrderDisplay() {
            const itemsContainer = document.getElementById('order-items');
            const totalElement = document.getElementById('order-total');
            const locationElement = document.getElementById('current-location');
            
            locationElement.textContent = currentOrder.location || 'Selecciona ubicación';
            totalElement.textContent = currentOrder.total.toFixed(2);
            
            if (currentOrder.items.length === 0) {
                itemsContainer.innerHTML = '<p class="text-center">Agrega productos a la orden...</p>';
                return;
            }
            
            itemsContainer.innerHTML = '';
            currentOrder.items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-quantity">${item.quantity}x</div>
                    <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                `;
                itemsContainer.appendChild(itemElement);
            });
        }

        function selectLocation(location) {
            currentOrder.location = location;
            document.getElementById('current-location').textContent = location;
            
            // Update button states
            document.querySelectorAll('.location-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }

        // Order Management
        function saveOrder() {
            if (!currentOrder.location) {
                alert('Por favor selecciona una ubicación para la orden');
                return;
            }
            
            if (currentOrder.items.length === 0) {
                alert('La orden debe contener al menos un producto');
                return;
            }
            
            const order = {
                id: Date.now(),
                location: currentOrder.location,
                items: [...currentOrder.items],
                total: currentOrder.total,
                createdAt: new Date().toISOString()
            };
            
            savedOrders.push(order);
            saveData();
            
            // Reset current order
            currentOrder = { location: '', items: [], total: 0 };
            updateOrderDisplay();
            document.querySelectorAll('.location-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            alert('Orden guardada correctamente');
            renderOrdersList();
        }

        function renderOrdersList() {
            const list = document.getElementById('orders-list');
            list.innerHTML = '';
            
            if (savedOrders.length === 0) {
                list.innerHTML = '<p class="text-center">No hay órdenes pendientes</p>';
                return;
            }
            
            savedOrders.forEach(order => {
                const card = document.createElement('div');
                card.className = 'order-card';
                card.innerHTML = `
                    <div class="order-header">
                        <div class="order-title">${order.location}</div>
                        <div class="order-total-small">$${order.total.toFixed(2)}</div>
                    </div>
                    <div class="order-products">
                        ${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="editOrder(${order.id})">Editar</button>
                        <button class="btn btn-primary" onclick="payOrder(${order.id})">Cobrar</button>
                    </div>
                `;
                list.appendChild(card);
            });
        }

        function editOrder(orderId) {
            const order = savedOrders.find(o => o.id === orderId);
            if (!order) return;
            
            currentOrder = {
                location: order.location,
                items: [...order.items],
                total: order.total
            };
            
            // Remove from saved orders
            savedOrders = savedOrders.filter(o => o.id !== orderId);
            saveData();
            
            // Update UI
            updateOrderDisplay();
            renderOrdersList();
            showSection('new-order');
            
            // Select location button
            document.querySelectorAll('.location-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.textContent === currentOrder.location) {
                    btn.classList.add('selected');
                }
            });
        }

        function payOrder(orderId) {
            const order = savedOrders.find(o => o.id === orderId);
            if (!order) return;
            
            // Set up payment modal
            document.getElementById('payment-total').textContent = order.total.toFixed(2);
            document.getElementById('payment-location').textContent = order.location;
            document.getElementById('amount-received').value = '';
            document.getElementById('change-amount').textContent = '0.00';
            document.getElementById('change-suggestion').textContent = '';
            
            // Store current order for payment
            window.currentPaymentOrder = order;
            
            // Show modal
            document.getElementById('payment-modal').classList.add('active');
        }

        // Payment Functions
        function setPaymentAmount(type) {
            const input = document.getElementById('amount-received');
            const total = window.currentPaymentOrder.total;
            
            if (type === 'total') {
                input.value = total.toFixed(2);
            } else if (type === 'total+10') {
                input.value = (total + 10).toFixed(2);
            } else {
                input.value = type;
            }
            
            calculateChange();
        }

        function calculateChange() {
            const received = parseFloat(document.getElementById('amount-received').value) || 0;
            const total = window.currentPaymentOrder.total;
            const change = received - total;
            
            document.getElementById('change-amount').textContent = Math.max(0, change).toFixed(2);
            
            if (change > 0) {
                suggestOptimalChange(change);
            } else {
                document.getElementById('change-suggestion').textContent = '';
            }
        }

        function suggestOptimalChange(change) {
            const denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1, 0.5];
            let remaining = change;
            let suggestion = '';
            
            // Calculate optimal denominations
            const breakdown = {};
            denominations.forEach(denom => {
                if (remaining >= denom) {
                    const count = Math.floor(remaining / denom);
                    if (count > 0) {
                        breakdown[denom] = count;
                        remaining = Math.round((remaining - count * denom) * 100) / 100;
                    }
                }
            });
            
            // Check if we can optimize by asking for coins
            if (remaining > 0) {
                const needed = 1 - remaining;
                if (needed > 0 && needed <= 1) {
                    suggestion = `¿Quieres pedir $${needed.toFixed(2)} para dar $${(change + needed).toFixed(2)} exactos?`;
                }
            }
            
            document.getElementById('change-suggestion').textContent = suggestion;
        }

        function completePayment() {
            const received = parseFloat(document.getElementById('amount-received').value) || 0;
            const total = window.currentPaymentOrder.total;
            
            if (received < total) {
                alert('La cantidad recibida es menor al total de la orden');
                return;
            }
            
            // Add to history
            const historyEntry = {
                ...window.currentPaymentOrder,
                paidAmount: received,
                change: received - total,
                paymentDate: new Date().toISOString()
            };
            
            salesHistory.push(historyEntry);
            
            // Remove from saved orders
            savedOrders = savedOrders.filter(o => o.id !== window.currentPaymentOrder.id);
            
            // Save data and update UI
            saveData();
            renderOrdersList();
            renderHistory();
            closePaymentModal();
            
            alert('Cobro completado exitosamente');
        }

        function closePaymentModal() {
            document.getElementById('payment-modal').classList.remove('active');
            window.currentPaymentOrder = null;
        }

        // History Functions
        function renderHistory() {
            const list = document.getElementById('history-list');
            list.innerHTML = '';
            
            if (salesHistory.length === 0) {
                list.innerHTML = '<p class="text-center">No hay historial de ventas</p>';
                return;
            }
            
            // Sort by date (newest first)
            const sortedHistory = [...salesHistory].sort((a, b) => 
                new Date(b.paymentDate) - new Date(a.paymentDate)
            );
            
            sortedHistory.forEach(entry => {
                const date = new Date(entry.paymentDate);
                const item = document.createElement('div');
                item.className = 'history-item';
                item.innerHTML = `
                    <div class="history-header">
                        <div class="history-date">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
                        <div class="history-total">$${entry.total.toFixed(2)}</div>
                    </div>
                    <div class="history-location"><strong>${entry.location}</strong></div>
                    <div class="history-products">
                        ${entry.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                    <div class="history-payment">
                        Pagado: $${entry.paidAmount.toFixed(2)} | Cambio: $${entry.change.toFixed(2)}
                    </div>
                `;
                list.appendChild(item);
            });
        }

        function exportHistory() {
            const dateFilter = document.getElementById('history-date').value;
            let filteredHistory = salesHistory;
            
            if (dateFilter) {
                filteredHistory = salesHistory.filter(entry => {
                    const entryDate = new Date(entry.paymentDate).toISOString().split('T')[0];
                    return entryDate === dateFilter;
                });
            }
            
            if (filteredHistory.length === 0) {
                alert('No hay datos para exportar en la fecha seleccionada');
                return;
            }
            
            // Create CSV content
            let csv = 'Fecha,Hora,Ubicación,Productos,Total,Pagado,Cambio\n';
            
            filteredHistory.forEach(entry => {
                const date = new Date(entry.paymentDate);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString();
                const productsStr = entry.items.map(item => `${item.quantity}x ${item.name}`).join('; ');
                
                csv += `"${dateStr}","${timeStr}","${entry.location}","${productsStr}",${entry.total},${entry.paidAmount},${entry.change}\n`;
            });
            
            // Create download link
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `historial_tacos_${dateFilter || 'completo'}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('Historial exportado correctamente');
        }

        // Initialize application on load
        window.onload = initApp;
            // Nueva función para el botón "Ir a Cobro"
            function goToPayment() {
                if (!currentOrder.location) {
                    alert('Por favor selecciona una ubicación para la orden');
                    return;
                }
                if (currentOrder.items.length === 0) {
                    alert('La orden debe contener al menos un producto');
                    return;
                }
                // Prepara el modal de pago con la orden actual
                document.getElementById('payment-total').textContent = currentOrder.total.toFixed(2);
                document.getElementById('payment-location').textContent = currentOrder.location;
                document.getElementById('amount-received').value = '';
                document.getElementById('change-amount').textContent = '0.00';
                document.getElementById('change-suggestion').textContent = '';
                window.currentPaymentOrder = {
                    ...currentOrder,
                    id: Date.now(),
                    createdAt: new Date().toISOString()
                };
                document.getElementById('payment-modal').classList.add('active');
            }