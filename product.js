const priceRangeMin = document.getElementById('priceRangeMin');
        const priceRangeMax = document.getElementById('priceRangeMax');
        const priceValue = document.getElementById('priceValue');
        const productGrid = document.getElementById('productGrid');
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');

        function updatePriceFilter() {
            const minPrice = parseInt(priceRangeMin.value);
            const maxPrice = parseInt(priceRangeMax.value);
            productGrid.style. transform=" translateX(200px)";

            priceValue.textContent = `$${minPrice} - $${maxPrice}`;

            const products = productGrid.getElementsByClassName('productItem');

            for (let i = 0; i < products.length; i++) {
                const productPrice = parseInt(products[i].getAttribute('data-price'));
                
                if (productPrice >= minPrice && productPrice <= maxPrice) {
                    products[i].style.display = 'block';
                } else {
                    products[i].style.display = 'none';
                }
            }
        }

        priceRangeMin.addEventListener('input', updatePriceFilter);
        priceRangeMax.addEventListener('input', updatePriceFilter);

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });