// -----------------------------
// Unified script.js (UPDATED for Wishlist page)
// -----------------------------

document.addEventListener("DOMContentLoaded", function () {
    // ---------- state ----------
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    let isDark = JSON.parse(localStorage.getItem("isDark")) || false;

    // ---------- DOM references ----------
    const cartIcon = document.querySelector(".nav-cart");
    const cartCount = document.createElement("span");
    cartCount.classList.add("cart-count");
    cartIcon.appendChild(cartCount);

    // wishlist badge
    const wishBadge = document.createElement("span");
    wishBadge.classList.add("wish-count");
    wishBadge.style.marginLeft = "8px";
    cartIcon.appendChild(wishBadge);

    updateCartCount();
    updateWishCount();
    applyDarkMode(true);
    updateSignedInText();

    // ---------- Add To Cart ----------
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = btn.dataset.item;
            const price = parseFloat(btn.dataset.price);
            addToCart(item, price);
        });
    });

    function addToCart(item, price) {
        const existing = cartItems.find(i => i.item === item);
        if (existing) existing.quantity++;
        else cartItems.push({ item, price, quantity: 1 });
        saveCart();
        updateCartCount();
        showToast(`${item} added to cart`);
    }

    function saveCart() {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }

    function updateCartCount() {
        const count = cartItems.reduce((t, i) => t + i.quantity, 0);
        cartCount.innerText = count || "";
    }

    // ---------- Cart Popup / Open cart page ----------
    cartIcon.addEventListener("click", () => {
        showCartPopup();
    });

    function showCartPopup() {
        const popup = document.createElement("div");
        popup.classList.add("cart-popup");
        if (cartItems.length === 0) {
            popup.innerHTML = `<h3>Your Cart is Empty</h3>`;
        } else {
            let html = `<h3>Your Cart</h3><ul>`;
            cartItems.forEach(item => {
                html += `<li>${item.item} - ${item.quantity} × $${item.price.toFixed(2)}</li>`;
            });
            html += `</ul><button id="openCartPage">Open Full Cart</button><button id="checkoutBtn">Checkout</button>`;
            popup.innerHTML = html;
        }
        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 3000);

        setTimeout(() => {
            const openBtn = document.getElementById("openCartPage");
            if (openBtn) openBtn.addEventListener("click", () => window.location.href = "cart.html");
            const chk = document.getElementById("checkoutBtn");
            if (chk) chk.addEventListener("click", () => window.location.href = "payment.html");
        }, 50);
    }

    function showToast(msg, duration = 1500) {
        const div = document.createElement("div");
        div.classList.add("cart-popup");
        div.innerText = msg;
        document.body.appendChild(div);
        setTimeout(() => div.remove(), duration);
    }

    // ---------- Search ----------
    function performSearch() {
        const query = document.getElementById("searchInput").value.toLowerCase();
        const products = document.querySelectorAll(".box");
        products.forEach(box => {
            const title = box.querySelector("h2").innerText.toLowerCase();
            box.style.display = title.includes(query) ? "block" : "none";
        });
    }
    document.getElementById("searchBtn").addEventListener("click", performSearch);
    document.getElementById("searchInput").addEventListener("keydown", e => { if (e.key === "Enter") performSearch(); });

    // ---------- Product details navigation ("See more") ----------
    document.querySelectorAll(".box").forEach(box => {
        const title = box.querySelector("h2").innerText;
        const btn = box.querySelector(".box-content p"); // "See more" element
        const priceBtn = box.querySelector(".add-to-cart-btn");
        const price = priceBtn ? priceBtn.dataset.price : "0.00";
        box.dataset.title = title;
        box.dataset.price = price;

        btn.style.cursor = "pointer";
        btn.addEventListener("click", () => {
            const encoded = encodeURIComponent(JSON.stringify({ title, price }));
            window.location.href = `product.html?data=${encoded}`;
        });
    });

    // ---------- Wishlist system (now opens wishlist.html page) ----------
    // Add wishlist button next to product content (keeps UI)
    document.querySelectorAll(".box").forEach((box) => {
        const content = box.querySelector(".box-content");
        // avoid duplicating if present
        if (!content.querySelector(".wish-btn-container")) {
            const wc = document.createElement("div");
            wc.classList.add("wish-btn-container");
            wc.style.marginTop = "8px";

            const wishBtn = document.createElement("button");
            wishBtn.classList.add("wish-btn");
            wishBtn.innerText = wishlist.some(w => w.item === box.dataset.title) ? "♥ Wishlist" : "♡ Add Wishlist";
            wishBtn.addEventListener("click", () => {
                toggleWishlist(box.dataset.title, parseFloat(box.dataset.price));
                wishBtn.innerText = wishlist.some(w => w.item === box.dataset.title) ? "♥ Wishlist" : "♡ Add Wishlist";
            });

            wc.appendChild(wishBtn);
            content.appendChild(wc);
        }
    });

    function toggleWishlist(item, price) {
        const found = wishlist.find(w => w.item === item);
        if (found) {
            wishlist = wishlist.filter(w => w.item !== item);
            showToast(`${item} removed from wishlist`);
        } else {
            wishlist.push({ item, price, addedAt: Date.now() });
            showToast(`${item} added to wishlist`);
        }
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateWishCount();
    }

    function updateWishCount() {
        wishBadge.innerText = wishlist.length ? `♡ ${wishlist.length}` : "";
    }

    // Replace modal opening with navigation to wishlist page (full page)
    const logoDiv = document.querySelector(".nav-logo");
    const viewWish = document.createElement("div");
    viewWish.style.cursor = "pointer";
    viewWish.style.color = "white";
    viewWish.style.fontSize = "0.8rem";
    viewWish.style.marginLeft = "6px";
    viewWish.innerText = "Wishlist";
    viewWish.addEventListener("click", () => {
        // navigate to wishlist page
        window.location.href = "wishlist.html";
    });
    if (logoDiv && !logoDiv.querySelector(".nav-wishlist-link")) {
        viewWish.classList.add("nav-wishlist-link");
        logoDiv.appendChild(viewWish);
    }

    // keep the old openWishlistModal function intact as a fallback (unused)
    function openWishlistModal() {
        // fallback: small dropdown showing wishlist items
        const modal = document.createElement("div");
        modal.classList.add("dropdown-menu");
        if (wishlist.length === 0) {
            modal.innerHTML = `<div style="padding:10px">Your wishlist is empty.</div>`;
        } else {
            let html = `<h4 style="margin:6px 10px">Wishlist</h4><ul style="padding-left:16px">`;
            wishlist.forEach((w, i) => {
                html += `<li>${w.item} - $${parseFloat(w.price).toFixed(2)} <button data-i="${i}" class="wish-remove">Remove</button> <button data-item="${encodeURIComponent(w.item)}" class="wish-addtocart">Add to Cart</button></li>`;
            });
            html += `</ul>`;
            modal.innerHTML = html;
        }
        document.body.appendChild(modal);
        modal.style.position = "absolute";
        modal.style.top = "70px";
        modal.style.right = "20px";
        modal.querySelectorAll(".wish-remove").forEach(b => {
            b.addEventListener("click", (e) => {
                const i = parseInt(e.target.dataset.i);
                wishlist.splice(i, 1);
                localStorage.setItem("wishlist", JSON.stringify(wishlist));
                modal.remove();
                updateWishCount();
                showToast("Removed from wishlist");
            });
        });
        modal.querySelectorAll(".wish-addtocart").forEach(b => {
            b.addEventListener("click", (e) => {
                const itemName = decodeURIComponent(e.target.dataset.item);
                const found = wishlist.find(w => w.item === itemName);
                addToCart(itemName, found ? parseFloat(found.price) : 0);
            });
        });
        setTimeout(() => modal.remove(), 5000);
    }

    // ---------- Login / Signup (mock) ----------
    const signInDiv = document.querySelector(".nav-signin");
    if (signInDiv) {
        signInDiv.style.cursor = "pointer";
        signInDiv.addEventListener("click", () => openAuthModal());
    }

    function openAuthModal() {
        const modal = document.createElement("div");
        modal.classList.add("dropdown-menu");
        modal.style.width = "320px";
        modal.innerHTML = `
            <h3 style="margin:8px">Sign in</h3>
            <div style="padding:8px">
                <input id="authEmail" placeholder="Email" style="width:100%;padding:8px;margin-bottom:8px"/>
                <input id="authPass" placeholder="Password" type="password" style="width:100%;padding:8px;margin-bottom:8px"/>
                <button id="authSignIn" style="width:100%;padding:8px">Sign In (mock)</button>
                <p style="font-size:0.85rem;margin-top:8px">Don't have an account? <a id="openSignup" style="cursor:pointer;color:#007185">Create one</a></p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.position = "absolute";
        modal.style.top = "70px";
        modal.style.right = "20px";

        document.getElementById("authSignIn").addEventListener("click", () => {
            const email = document.getElementById("authEmail").value.trim();
            if (!email) { alert("Please enter an email"); return; }
            localStorage.setItem("mockUser", JSON.stringify({ email }));
            modal.remove();
            showToast(`Signed in as ${email}`);
            updateSignedInText();
        });

        document.getElementById("openSignup").addEventListener("click", () => {
            modal.remove();
            openSignupModal();
        });

        setTimeout(() => modal.remove(), 10000);
    }

    function openSignupModal() {
        const modal = document.createElement("div");
        modal.classList.add("dropdown-menu");
        modal.style.width = "320px";
        modal.innerHTML = `
            <h3 style="margin:8px">Create account</h3>
            <div style="padding:8px">
                <input id="signName" placeholder="Full name" style="width:100%;padding:8px;margin-bottom:8px"/>
                <input id="signEmail" placeholder="Email" style="width:100%;padding:8px;margin-bottom:8px"/>
                <input id="signPass" placeholder="Password" type="password" style="width:100%;padding:8px;margin-bottom:8px"/>
                <button id="createAcc" style="width:100%;padding:8px">Create (mock)</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.position = "absolute";
        modal.style.top = "70px";
        modal.style.right = "20px";

        document.getElementById("createAcc").addEventListener("click", () => {
            const name = document.getElementById("signName").value.trim();
            const email = document.getElementById("signEmail").value.trim();
            if (!name || !email) { alert("Please enter name and email"); return; }
            localStorage.setItem("mockUser", JSON.stringify({ name, email }));
            modal.remove();
            showToast(`Account created for ${name}`);
            updateSignedInText();
        });

        setTimeout(() => modal.remove(), 10000);
    }

    function updateSignedInText() {
        const user = JSON.parse(localStorage.getItem("mockUser"));
        const signin = document.querySelector(".nav-signin p span");
        const second = document.querySelector(".nav-signin .nav-second");
        if (user) {
            if (signin) signin.innerText = `Hello, ${user.name || user.email}`;
            if (second) second.innerText = `Account & Lists (Signed in)`;
        } else {
            if (signin) signin.innerText = `Hello, sign in`;
            if (second) second.innerText = `Account & Lists`;
        }
    }

    // ---------- Dark Mode toggle ----------
    const searchDiv = document.querySelector(".nav-search");
    const dm = document.createElement("button");
    dm.classList.add("dark-toggle");
    dm.innerText = isDark ? "Light" : "Dark";
    dm.style.marginLeft = "8px";
    dm.style.cursor = "pointer";
    if (searchDiv) searchDiv.appendChild(dm);
    dm.addEventListener("click", () => {
        isDark = !isDark;
        localStorage.setItem("isDark", JSON.stringify(isDark));
        applyDarkMode();
        dm.innerText = isDark ? "Light" : "Dark";
    });

    function applyDarkMode(initial = false) {
        if (isDark) {
            document.documentElement.style.setProperty("--bg-page", "#0f1111");
            document.documentElement.style.setProperty("--text-page", "#ffffff");
            document.body.style.backgroundColor = "#0f1111";
            document.body.style.color = "#fff";
        } else {
            document.documentElement.style.removeProperty("--bg-page");
            document.documentElement.style.removeProperty("--text-page");
            document.body.style.backgroundColor = "";
            document.body.style.color = "";
        }
        if (!initial) showToast(isDark ? "Dark mode enabled" : "Light mode enabled");
    }

    // ---------- Category Filtering ----------
    const select = document.querySelector(".search-select");
    if (select) {
        const cats = new Set();
        document.querySelectorAll(".box").forEach(box => {
            const cat = box.dataset.category || box.querySelector("h2").innerText;
            cats.add(cat);
            box.dataset.category = cat;
        });
        cats.forEach(c => {
            const opt = document.createElement("option");
            opt.value = c;
            opt.innerText = c;
            select.appendChild(opt);
        });

        select.addEventListener("change", () => {
            const val = select.value;
            document.querySelectorAll(".box").forEach(box => {
                box.style.display = (val === "All" || box.dataset.category === val) ? "block" : "none";
            });
        });
    }

    // ---------- Utilities: global access ----------
    window.__AMAZON_CLONE = {
        getCart: () => JSON.parse(localStorage.getItem("cartItems")) || [],
        setCart: (arr) => { localStorage.setItem("cartItems", JSON.stringify(arr)); cartItems = arr; updateCartCount(); },
        getWishlist: () => JSON.parse(localStorage.getItem("wishlist")) || [],
        setWishlist: (arr) => { localStorage.setItem("wishlist", JSON.stringify(arr)); wishlist = arr; updateWishCount(); }
    };

}); // DOMContentLoaded end
