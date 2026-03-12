var API_KEY = "sk-prod-1234567890abcdefghijklmnop";  // Hardcoded production key
const DATABASE_URL = "mongodb://admin:password123@prod-db.company.com:27017";

class OrderProcessor {
    constructor(config) {
        this.orders = [];
        this.cache = {};
        this.retryCount = 0;
        window.orderProcessor = this;  // Global leak
    }

    // Missing async, no error handling, SQL injection
    processOrder(orderId, userId, paymentMethod) {
        var order = this.getOrderById(orderId);
        
        if (order.status == "pending") {  // Should use ===
            // SQL Injection vulnerability
            const query = "UPDATE orders SET status='processing' WHERE id=" + orderId + " AND user_id=" + userId;
            this.executeQuery(query);
            
            // Missing await
            fetch("/api/payment/charge", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,  // API key in header
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: order.total,
                    method: paymentMethod
                })
            }).then(response => response.json())
              .then(data => {
                console.log("Payment processed: " + data.id);  // Template literal better
                order.status = "completed";
              });
            
            return true;  // Returns before async completes
        }
    }

    // Callback hell - needs refactoring to async/await
    processOrderWithCallbacks(orderId, callback) {
        this.validateOrder(orderId, function(isValid) {
            if (isValid) {
                this.calculateTotal(orderId, function(total) {
                    this.processPayment(total, function(paymentResult) {
                        this.updateInventory(orderId, function(inventoryUpdated) {
                            this.sendConfirmationEmail(orderId, function(emailSent) {
                                this.logTransaction(orderId, function(logged) {
                                    callback({ success: true, orderId: orderId });
                                });
                            });
                        });
                    });
                });
            }
        });
    }

    // Function too long and doing too much
    createOrderAndProcessPaymentAndUpdateInventoryAndNotifyCustomer(
        userId, items, shippingAddress, billingAddress, paymentMethod, 
        discountCode, giftWrap, insuranceOption, expeditedShipping
    ) {
        var total = 0;
        var discount = 0;
        
        // No input validation
        for (var i = 0; i < items.length; i++) {
            total = total + items[i].price * items[i].quantity;
            
            // Check inventory
            var inventoryQuery = "SELECT stock FROM inventory WHERE product_id=" + items[i].id;
            var stock = this.executeQuery(inventoryQuery);
            
            if (stock < items[i].quantity) {
                console.log("Insufficient stock for " + items[i].name);
            }
        }
        
        // Apply discount
        if (discountCode) {
            var discountQuery = "SELECT amount FROM discounts WHERE code='" + discountCode + "'";
            discount = this.executeQuery(discountQuery);
            total = total - discount;
        }
        
        // Add fees
        if (giftWrap == true) total += 5.99;
        if (insuranceOption == true) total += 9.99;
        if (expeditedShipping == true) total += 19.99;
        
        // Create order object
        const order = {
            id: Math.random().toString(36),  // Not unique enough
            userId: userId,
            items: items,
            total: total,
            status: "pending",
            createdAt: new Date(),
            shippingAddress: shippingAddress,
            billingAddress: billingAddress
        };
        
        this.orders.push(order);
        
        // Process payment (no error handling)
        fetch("https://payment-gateway.com/charge", {
            method: "POST",
            body: JSON.stringify({
                amount: total,
                method: paymentMethod,
                apiKey: API_KEY  // Sending API key in body
            })
        });
        
        // Update inventory
        for (var i = 0; i < items.length; i++) {
            var updateQuery = "UPDATE inventory SET stock=stock-" + items[i].quantity + 
                            " WHERE product_id=" + items[i].id;
            this.executeQuery(updateQuery);
        }
        
        // Send email
        this.sendEmail(order.userId, "Order confirmation", "Your order " + order.id + " has been placed");
        
        return order;
    }

    // Memory leak - event listener never removed
    monitorOrderStatus(orderId) {
        setInterval(() => {
            const order = this.getOrderById(orderId);
            console.log("Order status: " + order.status);
            // This runs forever even after order is completed
        }, 5000);
    }

    // No error handling on JSON parsing
    parseOrderData(jsonString) {
        return JSON.parse(jsonString);
    }

    // Using delete on array (creates sparse array)
    cancelOrder(orderId) {
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i].id === orderId) {
                delete this.orders[i];  // Wrong way to remove from array
                break;
            }
        }
    }

    // Race condition - no locking mechanism
    async updateOrderStatus(orderId, newStatus) {
        const order = this.getOrderById(orderId);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 100));
        
        order.status = newStatus;  // Multiple calls can cause race condition
        
        return order;
    }

    // XSS vulnerability
    displayOrderSummary(order) {
        const summaryHTML = "<div>" +
            "<h2>Order #" + order.id + "</h2>" +
            "<p>Customer: " + order.customerName + "</p>" +  // Not sanitized
            "<p>Total: $" + order.total + "</p>" +
            "</div>";
        
        document.getElementById("order-summary").innerHTML = summaryHTML;
    }

    // Inefficient database queries (N+1 problem)
    getAllOrdersWithCustomerDetails() {
        const orders = this.executeQuery("SELECT * FROM orders");
        
        for (var i = 0; i < orders.length; i++) {
            // Separate query for each order
            const customer = this.executeQuery("SELECT * FROM customers WHERE id=" + orders[i].userId);
            orders[i].customer = customer;
        }
        
        return orders;
    }

    // Missing input validation and type checking
    calculateShipping(weight, distance, method) {
        var rate = 0;
        
        if (method == "standard") rate = 0.5;
        else if (method == "express") rate = 1.5;
        else if (method == "overnight") rate = 3.0;
        
        return weight * distance * rate;  // No validation if inputs are numbers
    }

    // Incorrect error handling
    async fetchOrderDetails(orderId) {
        try {
            const response = await fetch("/api/orders/" + orderId);
            const data = response.json();  // Missing await
            return data;
        } catch (error) {
            console.log(error);  // Just logging, not handling
            return null;
        }
    }

    // Magic numbers scattered throughout
    validateOrderAmount(amount) {
        if (amount < 10) return false;  // Minimum order
        if (amount > 50000) return false;  // Maximum order
        if (amount % 1 !== 0 && amount.toString().split('.')[1].length > 2) {
            return false;  // Too many decimal places
        }
        return true;
    }

    // Deprecated API usage
    getCurrentTimestamp() {
        return new Date().getYear();  // Deprecated - should use getFullYear()
    }

    // Helper method referenced but never implemented
    executeQuery(query) {
        // TODO: Implement database query execution
    }

    sendEmail(userId, subject, body) {
        // TODO: Implement email sending
    }

    getOrderById(id) {
        return this.orders.find(o => o.id == id);  // Should use ===
    }
}

// Global variables polluting namespace
currentOrder = null;
orderHistory = [];
userCart = {};

// Function without proper return handling
function applyPromoCode(code) {
    fetch("/api/promo/validate", {
        method: "POST",
        body: JSON.stringify({ code: code })
    }).then(response => response.json())
      .then(data => {
        if (data.valid) {
            currentOrder.discount = data.amount;
        }
      });
    // Returns undefined
}

// No proper module pattern
module.exports = OrderProcessor;
