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
    const recommendationsSection = document.getElementById('recommendationsSection');
    const bundlesSection = document.getElementById('bundlesSection');
    const searchInput = document.getElementById('searchInput');

    let products = [];
    let recommendations = [];
    let bundles = [];
    let selectedProducts = [];
    let totalTotal = 0;
    let totalQuantity = 0;

    // Toggle the sidebar
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        body.classList.remove('showcart'); // Close cart if open
    });

    // Toggle the cart display
    cartIcon.addEventListener('click', () => {
        body.classList.toggle('showcart');
        sidebar.classList.remove('open'); // Close sidebar if open
    });

    // Close sidebar and cart when clicking outside of them
    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('open');
        }
        if (!body.classList.contains('showcart') || !cartIcon.contains(event.target)) {
            body.classList.remove('showcart');
        }
    });

    // Prevent clicks inside the cart from closing it
    cartListHTML.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent event from bubbling up to the document level
    });

    // Load products from JSON
    async function loadProductsFromJSON() {
        try {
            const response = await fetch('products.json'); // Ensure this path is correct
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid products data format');
            }

            products = data;
            displayProducts(products); // Initial display of products
        } catch (error) {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<p>Unable to load products. Please try again later.</p>';
        }
    }

    // Display products in the grid
    function displayProducts(productsToDisplay) {
        productGrid.innerHTML = '';

        productsToDisplay.forEach(product => {
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
    }

    // Load recommendations and bundles from JSON
    async function loadRecommendationsAndBundles() {
        try {
            const response = await fetch('recommendations_bundles.json');
            const data = await response.json();

            if (!data.recommendations || !data.bundles) {
                throw new Error('Invalid recommendations or bundles data format');
            }

            recommendations = data.recommendations;
            bundles = data.bundles;

            // Load recommendations
            recommendationsSection.innerHTML = '';
            recommendations.forEach(item => {
                const recommendationItem = document.createElement('div');
                recommendationItem.classList.add('recommendation-item');
                recommendationItem.dataset.id = item.id;
                recommendationItem.dataset.price = item.price;

                recommendationItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="info">
                        <h3>${item.name}</h3>
                        <p class="price">$${item.price.toFixed(2)}</p>
                        <p class="rating">${'★'.repeat(Math.floor(item.rating))}☆ (${item.rating}/5)</p>
                        <p class="description">${item.description}</p>
                        <div class="buttons">
                            <button class="addToCartButton">Add to Cart</button>
                            <button class="button" onclick="location.href='${item.page}'">More Info</button>
                        </div>
                    </div>
                `;

                recommendationsSection.appendChild(recommendationItem);
            });

            // Load bundles
            bundlesSection.innerHTML = '';
            bundles.forEach(item => {
                const bundleItem = document.createElement('div');
                bundleItem.classList.add('bundleItem');
                bundleItem.dataset.id = item.id;
                bundleItem.dataset.price = item.price;

                bundleItem.innerHTML = `
                    <div class="offer-badge">${item.offerBadge}</div>
                    <img src="${item.image}" alt="${item.name}">
                    <div class="bundleInfo">
                        <h3>${item.name}</h3>
                        <p class="old-price">$${item.oldPrice.toFixed(2)}</p>
                        <p class="new-price">$${item.price.toFixed(2)}</p>
                        <div class="buttons">
                            <button class="addToCartButton">Add to Cart</button>
                            <button class="buttonoffer" onclick="location.href='${item.page}'">More Info</button>
                        </div>
                    </div>
                `;

                bundlesSection.appendChild(bundleItem);
            });
        } catch (error) {
            console.error('Error loading recommendations and bundles:', error);
        }
    }

    // Search functionality
    function searchProducts() {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery)
        );
        displayProducts(filteredProducts);
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

        const productItems = productGrid.getElementsByClassName('productItem');

        for (let i = 0; i < productItems.length; i++) {
            const productPrice = parseFloat(productItems[i].dataset.price);

            if (productPrice >= minPrice && productPrice <= maxPrice) {
                productItems[i].style.display = 'block';
            } else {
                productItems[i].style.display = 'none';
            }
        }
    }

    // Add to cart function
    // Add to cart function
// Add to cart function
function addToCart(id_product, price) {
    let product = products.find(product => product.id == id_product) ||
                  recommendations.find(item => item.id == id_product) ||
                  bundles.find(item => item.id == id_product);
    
    if (product) {
        console.log(`Adding product to cart:`, product); // Debugging line to check which product is being added
        
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
                <div class="cartProductTotalPrice">$${price.toFixed(2)}</div>
                <div class="cartProductQuantity">
                    <button class="minusButton">-</button>
                    <span>1</span>
                    <button class="plusButton">+</button>
                </div>
            `;
            cartListHTML.appendChild(newSelectedProduct);
    
            totalQuantity++;
            updateCartIconQuantity();
    
            totalTotal += price;
            checkoutTotalHTML.innerText = "Checkout: $" + totalTotal.toFixed(2);
    
            selectedProducts.push({
                id: product.id,
                price: price,
                quantity: 1
            });
        }
    } else {
        console.warn(`Product with id ${id_product} not found.`);
    }
}




    // Handle Add to Cart button clicks
    function handleAddToCartButtonClick(event) {
        if (event.target.classList.contains('addToCartButton')) {
            event.preventDefault();
            event.stopPropagation(); // Prevent the event from bubbling up to the document level
    
            const item = event.target.closest('[data-id]');
            const id_product = item.dataset.id;
            const price = parseFloat(item.dataset.price);
            addToCart(id_product, price);
        }
    }
    

    productGrid.addEventListener('click', handleAddToCartButtonClick);
    recommendationsSection.addEventListener('click', handleAddToCartButtonClick);
    bundlesSection.addEventListener('click', handleAddToCartButtonClick);

    // Change quantity in cart
    cartListHTML.addEventListener('click', (event) => {
        if (event.target.classList.contains('minusButton') || event.target.classList.contains('plusButton')) {
            event.stopPropagation(); // Prevent the event from bubbling up and triggering document-level click handlers
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
                    removeProductFromCart(id_product);
                    return;
                }
            }

            updateCartHTML();
        } else {
            console.warn(`Product with id ${id_product} not found in cart.`);
        }
    }

    function removeProductFromCart(id_product) {
        const productIndex = selectedProducts.findIndex(item => item.id == id_product);
        if (productIndex !== -1) {
            const product = selectedProducts[productIndex];
            totalTotal -= product.price * product.quantity;
            selectedProducts.splice(productIndex, 1);

            const productElement = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
            if (productElement) {
                productElement.remove();
            }

            totalQuantity--;
            updateCartIconQuantity();
            updateCartHTML();
        }
    }

    // Update cart icon quantity
    function updateCartIconQuantity() {
        onCartIconQuantityHTML.innerText = totalQuantity;
    }

    // Update cart HTML
    function updateCartHTML() {
        selectedProducts.forEach(item => {
            const productElement = cartListHTML.querySelector(`.cartItem[data-id='${item.id}']`);
            if (productElement) {
                const quantityElement = productElement.querySelector('.cartProductQuantity span');
                const totalPriceElement = productElement.querySelector('.cartProductTotalPrice');
                quantityElement.innerText = item.quantity;
                totalPriceElement.innerText = `$${(item.price * item.quantity).toFixed(2)}`;
            }
        });
        checkoutTotalHTML.innerText = "Checkout: $" + totalTotal.toFixed(2);
    }

    // Clear cart
    clearCartButton.addEventListener('click', () => {
        selectedProducts = [];
        totalTotal = 0;
        totalQuantity = 0;
        cartListHTML.innerHTML = '';
        updateCartIconQuantity();
        updateCartHTML();
    });

    // Event listeners for price range and search
    priceRangeMin.addEventListener('input', updatePriceFilter);
    priceRangeMax.addEventListener('input', updatePriceFilter);
    searchInput.addEventListener('input', debounce(searchProducts, 300));

    // Initialize
    loadProductsFromJSON();
    loadRecommendationsAndBundles();
});
