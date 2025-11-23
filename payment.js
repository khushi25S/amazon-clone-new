let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// ---- Display Order Summary ----
function loadOrderSummary() {
    const box = document.getElementById("orderSummary");

    if (cartItems.length === 0) {
        box.innerHTML = "<h3>Your cart is empty!</h3>";
        return;
    }

    let total = 0, qty = 0;
    let html = "<h3>Order Summary</h3>";

    cartItems.forEach(item => {
        html += `<p>${item.item} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</p>`;
        total += item.price * item.quantity;
        qty += item.quantity;
    });

    html += `<hr><h3>Total Quantity: ${qty}</h3>
             <h3>Total Amount: $${total.toFixed(2)}</h3>`;

    box.innerHTML = html;
}

loadOrderSummary();

// ---- Show payment fields when needed ----
document.querySelectorAll("input[name='pay']").forEach(radio => {
    radio.addEventListener("change", function () {
        const type = this.value;
        const div = document.getElementById("paymentInputs");

        if (type === "upi") {
            div.innerHTML = `
                <h3>Enter UPI ID</h3>
                <input type="text" placeholder="example@upi">
            `;
        } 
        else if (type === "card") {
            div.innerHTML = `
                <h3>Card Details</h3>
                <input type="number" placeholder="Card Number"><br>
                <input type="number" placeholder="Expiry MMYY"><br>
                <input type="number" placeholder="CVV">
            `;
        } 
        else {
            div.innerHTML = "";
        }
    });
});

// ---- Place Order ----
function placeOrder() {
    document.getElementById("paymentPage").style.display = "none";
    document.getElementById("successPage").style.display = "block";

    // clear cart
    localStorage.removeItem("cartItems");
}
