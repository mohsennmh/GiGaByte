document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const priceRangeMin = document.getElementById('priceRangeMin');
    const priceRangeMax = document.getElementById('priceRangeMax');
    const priceValue = document.getElementById('priceValue');
    const productGrid = document.getElementById('productGrid');
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const cartIcon = document.getElementById('cartIcon');
    const body = document.querySelector('body');
    const cartListHTML = document.querySelector('.cartList');
    const onCartIconQuantityHTML = document.getElementById('onCartIconQuantity');
    const checkoutTotalHTML = document.querySelector('.checkoutButton');
    const clearCartButton = document.querySelector('.clearcartButton');

    let products = [];
    let selectedProducts = [];
    let totalTotal = 0;
    let totalQuantity = 0;

    // Toggle the sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Toggle the cart display
    cartIcon.addEventListener('click', () => {
        body.classList.toggle('showcart');
    });

    // Load products from JSON
    async function loadProductsFromJSON() {
        try {
            const response = await fetch('products.json'); // Ensure this path is correct
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            // Check if products array is present
            if (!Array.isArray(data)) {
                throw new Error('Invalid products data format');
            }

            products = data;

            // Clear existing products in the grid
            productGrid.innerHTML = '';

            // Display products
            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.classList.add('productItem');
                productElement.dataset.id = product.id;
                productElement.dataset.price = product.price;
                productElement.innerHTML = `
                    <a href="${product.page}" class="productLink">
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="productDescription">${product.description}</p>
                        <p class="productPrice">$${product.price.toFixed(2)}</p>
                        <button class="addToCartButton" aria-label="Add to cart">Add to Cart</button>
                    </a>
                `;
                productGrid.appendChild(productElement);
            });

            // Reapply the filter with current values
            updatePriceFilter();
        } catch (error) {
            console.error('Error loading products:', error);
            // Optionally display an error message to the user
            productGrid.innerHTML = '<p>Unable to load products. Please try again later.</p>';
        }
    }

    // Debounce function
    let debounceTimeout;
    function debounce(func, delay) {
        return function(...args) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Update price filter
    function updatePriceFilter() {
        const minPrice = parseFloat(priceRangeMin.value) || 0;
        const maxPrice = parseFloat(priceRangeMax.value) || Infinity;
        priceValue.textContent = `$${minPrice} - $${maxPrice}`;

        const products = productGrid.getElementsByClassName('productItem');

        for (let i = 0; i < products.length; i++) {
            const productPrice = parseFloat(products[i].dataset.price);

            if (productPrice >= minPrice && productPrice <= maxPrice) {
                products[i].style.display = 'block';
            } else {
                products[i].style.display = 'none';
            }
        }
    }

    // Add to cart event listener
productGrid.addEventListener('click', (event) => {
    if (event.target.classList.contains('addToCartButton')) {
        event.preventDefault();  // Prevents the default anchor tag behavior
        const id_product = event.target.closest('.productItem').dataset.id;
        addToCart(id_product);
    }
});


    // Add product to cart
    function addToCart(id_product) {
        const product = products.find(product => product.id == id_product);
        if (product) {
            const existingProductInCart = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);

            if (existingProductInCart) {
                changeQuantityCart(id_product, 'plus');
            } else {
                const newSelectedProduct = document.createElement('div');
                newSelectedProduct.dataset.id = product.id;
                newSelectedProduct.classList.add('cartItem');
                newSelectedProduct.innerHTML = `
                    <div class="cartProductImage">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <div class="cartProductName">${product.name}</div>
                    <div class="cartProductTotalPrice">$${product.price.toFixed(2)}</div>
                    <div class="cartProductQuantity">
                        <button class="minusButton">-</button>
                        <span>1</span>
                        <button class="plusButton">+</button>
                    </div>
                `;
                cartListHTML.appendChild(newSelectedProduct);

                totalQuantity++;
                updateCartIconQuantity();

                totalTotal += product.price;
                checkoutTotalHTML.innerText = "Checkout: $" + totalTotal.toFixed(2);

                selectedProducts.push({
                    ...product,
                    quantity: 1
                });
            }
        } else {
            console.warn(`Product with id ${id_product} not found.`);
        }
    }

    // Change quantity in cart
    cartListHTML.addEventListener('click', (event) => {
        if (event.target.classList.contains('minusButton') || event.target.classList.contains('plusButton')) {
            const product_id = event.target.closest('.cartItem').dataset.id;
            const type = event.target.classList.contains('plusButton') ? 'plus' : 'minus';
            changeQuantityCart(product_id, type);
        }
    });

    function changeQuantityCart(id_product, action) {
        const product = selectedProducts.find(item => item.id == id_product);
        if (product) {
            if (action === 'plus') {
                product.quantity++;
                totalTotal += product.price;
            } else if (action === 'minus') {
                if (product.quantity > 1) {
                    product.quantity--;
                    totalTotal -= product.price;
                } else {
                    removeFromCart(id_product);
                    return;
                }
            }

            const existingProductInCart = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
            if (existingProductInCart) {
                existingProductInCart.querySelector('.cartProductQuantity span').innerText = product.quantity;
                existingProductInCart.querySelector('.cartProductTotalPrice').innerText = `$${(product.price * product.quantity).toFixed(2)}`;
            }

            totalQuantity = selectedProducts.reduce((total, item) => total + item.quantity, 0);
            updateCartIconQuantity();
        }
    }

    // Remove from cart
    function removeFromCart(id_product) {
        const product = selectedProducts.find(item => item.id == id_product);
        if (product) {
            totalTotal -= product.price * product.quantity;
            totalQuantity -= product.quantity;

            updateCartIconQuantity();

            const cartItem = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
            if (cartItem) {
                cartItem.remove();
            }

            selectedProducts = selectedProducts.filter(item => item.id != id_product);
        }
    }

    // Update cart icon quantity and total
    function updateCartIconQuantity() {
        onCartIconQuantityHTML.innerText = totalQuantity;
        checkoutTotalHTML.innerText = "Checkout: $" + totalTotal.toFixed(2);
    }

    // Clear cart
    clearCartButton.addEventListener('click', () => {
        cartListHTML.innerHTML = '';
        selectedProducts = [];
        totalQuantity = 0;
        totalTotal = 0;
        updateCartIconQuantity();
        body.classList.remove('showcart');
    });

    // Initialize
    loadProductsFromJSON();
    priceRangeMin.addEventListener('input', debounce(updatePriceFilter, 300));
    priceRangeMax.addEventListener('input', debounce(updatePriceFilter, 300));
});
