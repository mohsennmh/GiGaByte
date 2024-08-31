let cartIcon = document.getElementById('cartIcon');
let body = document.querySelector('body');
let listProductHTML = document.getElementById('productGrid');
let cartListHTML = document.querySelector('.cartList'); 
let oncartIconQuantityHTML = document.getElementById('onCartIconQuantity');
let checkoutTotalHTML = document.querySelector('.checkoutButton'); 
let clearCartButton = document.querySelector('.clearcartButton');
let products = [];
let selectedProducts = []; 
let totalTotal = 0; 
let totalQuantity = 0;

// Toggle the cart display
cartIcon.addEventListener('click', () => {
    body.classList.toggle('showcart');
});

// Load products from HTML
function loadProductsFromHTML() {
    let productItems = listProductHTML.querySelectorAll('.productItem');
    let recommendationItems = document.querySelectorAll('.recommendation-item');
    let bundleItems = document.querySelectorAll('.bundleItem');
    
    // Load products from existing product grid
    products = Array.from(productItems).map(item => {
        return {
            id: item.dataset.id,
            name: item.querySelector('h3').innerText,
            image: item.querySelector('img').src,
            price: parseFloat(item.querySelector('.productPrice').innerText.replace('$', '')),
            description: item.querySelector('.productDescription').innerText
        };
    });

    // Load products from recommendations section
    products = products.concat(Array.from(recommendationItems).map(item => {
        return {
            id: item.dataset.id,
            name: item.querySelector('h3').innerText,
            image: item.querySelector('img').src,
            price: parseFloat(item.dataset.price),
            description: item.querySelector('.description') ? item.querySelector('.description').innerText : ''
        };
    }));

    // Load products from bundles section
    products = products.concat(Array.from(bundleItems).map(item => {
        return {
            id: item.dataset.id,
            name: item.querySelector('h3').innerText,
            image: item.querySelector('img').src,
            price: parseFloat(item.dataset.price),
            description: item.querySelector('.description') ? item.querySelector('.description').innerText : ''
        };
    }));

    console.log(products); // Optional: Check if products are correctly loaded
}


// Initialize
loadProductsFromHTML();

// Add to cart event listener
listProductHTML.addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList.contains('addToCartButton')) { 
        let id_product = target.closest('.productItem').dataset.id;
        console.log(id_product);
        addToCart(id_product);   
    }
});

function addToCart(id_product) {
    let product = products.find(product => product.id == id_product);
    if (product) {
        let existingProductInCart = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
        
        // If the product is already in the cart, increment quantity
        if (existingProductInCart) {
            changeQuantityCart(id_product, 'plus');
        } else {
            // Create a new product cart in the cart
            let newSelectedProduct = document.createElement('div');
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

            // Update total quantity and display it
            totalQuantity++;
            oncartIconQuantityHTML.innerText = totalQuantity;
            
            // Update total and display it
            totalTotal += product.price;
            checkoutTotalHTML.innerText = "checkout : $" + totalTotal.toFixed(2);

            // Add the product to the selectedProducts array
            selectedProducts.push({
                ...product,
                quantity: 1 // Set initial quantity to 1
            });
        }
    }
}

// Change quantity
cartListHTML.addEventListener('click', (event) => {
    let target = event.target;
    if (target.classList.contains('minusButton') || target.classList.contains('plusButton')) {
        let product_id = target.closest('.cartItem').dataset.id;
        let type = target.classList.contains('plusButton') ? 'plus' : 'minus';
        changeQuantityCart(product_id, type);
    }
});

function changeQuantityCart(id_product, action) {
    let product = selectedProducts.find(item => item.id == id_product);
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
                return; // Exit function after removing
            }
        }

        // Update the cart item display
        let existingProductInCart = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
        if (existingProductInCart) {
            existingProductInCart.querySelector('.cartProductQuantity span').innerText = product.quantity;
            existingProductInCart.querySelector('.cartProductTotalPrice').innerText = `$${(product.price * product.quantity).toFixed(2)}`;
        }

        // Update total quantity and display it
        totalQuantity = selectedProducts.reduce((total, item) => total + item.quantity, 0);
        oncartIconQuantityHTML.innerText = totalQuantity;

        // Update total and display it
        checkoutTotalHTML.innerText = "checkout : $" + totalTotal.toFixed(2);
    }
}

// Remove from cart
function removeFromCart(id_product) {
    let product = selectedProducts.find(item => item.id == id_product);
    if (product) {
        totalTotal -= product.price * product.quantity; // Decrease total by the product's total price
        totalQuantity -= product.quantity; // Decrease the total quantity

        // Update total display
        oncartIconQuantityHTML.innerText = totalQuantity;
        checkoutTotalHTML.innerText = "checkout : $" + totalTotal.toFixed(2);

        // Remove product from the cart HTML
        let cartItem = cartListHTML.querySelector(`.cartItem[data-id='${id_product}']`);
        if (cartItem) {
            cartItem.remove();
        }

        // Remove product from selectedProducts array
        selectedProducts = selectedProducts.filter(item => item.id != id_product);
    }
}

// Clear cart
clearCartButton.addEventListener('click', () => {
    cartListHTML.innerHTML = ''; // Clear the cart HTML
    selectedProducts = []; // Clear the selected products array
    totalQuantity = 0;
    totalTotal = 0;
    oncartIconQuantityHTML.innerText = totalQuantity;
    checkoutTotalHTML.innerText = "checkout : $0";
    body.classList.remove('showcart');
});
document.body.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart')) {
        let id_product = event.target.closest('[data-id]').dataset.id;
        addToCart(id_product);
    }
});
