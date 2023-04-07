const form=document.querySelector('.custom-product-form');
const variants=JSON.parse(form.querySelector('script').innerHTML);
const variant_containers=form.querySelectorAll('.variant-container');
const variant_dimension=form.querySelector('.variant-dimen-info .variant-dimension');
const variant_name=form.querySelector('.variant-dimen-info .variant-name');
const cart_button=form.querySelector('.cart-btn');
const variant_title=document.querySelector('.product__title .variant__title');
const total=cart_button.querySelector('.total');
const formData={};
const items=[];
const price_regular=document.querySelector('product-info .price__regular .price-item');
const price_compare=document.querySelector('product-info .price__sale .price-item--regular');
const price_sale=document.querySelector('product-info .price__sale .price-item--sale');
const currency=price_regular.innerText.trim()[0];
variant_containers.forEach(container=>{
  const quantity=parseInt(container.querySelector('.variant-quantity').innerText);
  if(quantity>0){
    const new_item={
      'id':container.dataset.variantId,
      'quantity':quantity
    }
    items.push(new_item);
  }
})
variant_containers.forEach(container=>{
  container.addEventListener('click',e=>{
    const current_container=e.target.closest('.variant-container');
    if(!current_container.hasAttribute('disabled')){
    variant_containers.forEach(container=>{
      container.setAttribute('zero','');
    })
    current_container.removeAttribute('zero');
//                  if(parseInt(current_container.querySelector('.variant-quantity').innerText)==0){
//                  current_container.querySelector('.variant-quantity').innerText=1;
//              }

    if(e.target.classList.contains('plus')){
        const quantity_container=e.target.closest('.variant-quantity-selector').querySelector(".variant-quantity");
        const old_quantity=parseInt(quantity_container.innerText);
        const new_quantity=old_quantity+1;
        quantity_container.innerText=new_quantity;
        const id=current_container.dataset.variantId;
        const current_price= parseFloat(total.innerText.slice(1));
        const variant_price= parseFloat(current_container.dataset.price);
        const updated_price=current_price+variant_price;
        if(updated_price==0){
          cart_button.setAttribute('disabled','');
        }
        else {
          cart_button.removeAttribute('disabled');
        }
        total.innerText=`${currency}${updated_price.toFixed(2)}`;
        let already_in_items=false;
        let index;
        for (let i=0;i<items.length;i++){
          if(items[i].id===id){
            already_in_items=true;
            index=i;
          }
        }
        if(already_in_items){
          items[index].quantity=new_quantity;
        }
        else{
        let new_item={
          'id':id,
          "quantity":new_quantity
        }
        items.push(new_item);
        }
    }
    else if(e.target.classList.contains('minus')){
        const quantity_container=e.target.closest('.variant-quantity-selector').querySelector(".variant-quantity");
        const old_quantity=parseInt(quantity_container.innerText);
        if(old_quantity>0){
          const new_quantity=old_quantity-1
          quantity_container.innerText=new_quantity;     
          const current_price= parseFloat(total.innerText.slice(1));
          const variant_price= parseFloat(current_container.dataset.price);
          const id=current_container.dataset.variantId;                        
          const updated_price=current_price-variant_price;
          if(updated_price==0){
            cart_button.setAttribute('disabled','');
          }
          else cart_button.removeAttribute('disabled');
          let already_in_items=false;
          let index;
          for (let i=0;i<items.length;i++){
            if(items[i].id===id){
              already_in_items=true;
              index=i;
            }
          }
          if(already_in_items){
            if(new_quantity==0){
              items.splice(index,1);
            }
            else{
              items[index].quantity=new_quantity;
            }
          }
          else{
          let new_item={
            'id':id,
            "quantity":new_quantity
          }
          items.push(new_item);
          }
          total.innerText=`${currency}${updated_price.toFixed(2)}`
        }                           
        
    }
    }
    
    variant_dimension.innerText=current_container.dataset.dimension;
    variant_name.innerText=current_container.dataset.name;
    price_regular.innerText=currency+current_container.dataset.price;
    price_sale.innerText=currency+current_container.dataset.price;
    price_compare.innerText=currency+current_container.dataset.comparePrice;
    variant_title.innerText=current_container.dataset.name;
    variant_title.style.backgroundColor=current_container.dataset.color;
  })
})              
cart_button.addEventListener('click',e=>{
  formData.items=items;
  form.querySelector('.loading-overlay__spinner').style.display="inline-block";
  form.querySelector('.cart-btn-text').style.display='none';
  cart_button.setAttribute('disabled','');
  const data=fetch(window.Shopify.routes.root + 'cart/add.js', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      return response.json();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  data.then(response=>{
    form.querySelector('.loading-overlay__spinner').style.display="none";
    cart_button.removeAttribute('disabled');
    form.querySelector('.cart-btn-text').style.display='flex';

    if(response.status==422){
      const error=form.querySelector('.error-msg');
      error.innerText=`${response.message}! ${response.description}`;
      error.style.maxHeight = error.scrollHeight + "px";
      setTimeout(()=>{
        error.style.maxHeight = null;
      },3000)
    }else{
      const req=fetch(window.Shopify.routes.root+'cart.js',{
        method:"GET"
      }).then(response=>{return response.json()}).catch((error)=>{console.error('Error: ',error)});
      
       req.then(cartData=>{
        console.log(cartData);
        if($('div.cart-count-bubble').length==0){
          document.querySelector('#cart-icon-bubble').insertAdjacentHTML('beforeend',`<div class="cart-count-bubble"><span aria-hidden="true">${cartData.item_count}</span><span class="visually-hidden">${cartData.item_count} items</span></div>`);
        }
        else $('div.cart-count-bubble').text(cartData.item_count);
        
        $('.cart-drawer-items-container').html('');
        cartItem_html = '';
        $.each(cartData.items, function (i, item) {
            let item_price;
            let compare_price=false;
            for(let i=0;i<variant_containers.length;i++){
                if(item.id==variant_containers[i].dataset.variantId){
                    item_price=currency+ variant_containers[i].dataset.price;
                    if(variant_containers[i].dataset.comparePrice)
                      compare_price=`<del>${currency+variant_containers[i].dataset.comparePrice}</del>`;
                }
            }
            cartItem_html += `
            <div class="cart-drawer-item">
                <a href="${ item.url }"></a>
                    <div class="cart-media">
                        <img src="${item.image}" alt="">
                    </div>
                </a>
                <div class="cart-details">
                    <a href="${ item.url }">
                        <h2>${ item.product_title }
                            <span>${item.variant_title}</span>
                        </h2>
                    </a>
                    <div class="cart-item-quantity">
                        <div class="cart-price">
                            <span>${item_price}
                              ${compare_price?compare_price:''}
                            </span>
                        </div>
                        <div class="cart-item-quantity-box">
                            <div class="qty-wrap" data-variant-id=${item.id}>
                                <button type="button" id="sub" class="sub">
                                <svg class="sub" xmlns="http://www.w3.org/2000/svg" width="8" height="1" viewBox="0 0 8 1">
                                  <rect id="Rectangle_10730" data-name="Rectangle 10730" width="8" height="1" rx="0.5"/>
                                </svg>
                                </button>
                                <input class="qtycount" type="text" id="1" value="${ item.quantity }"
                                    name="updates[]" min="1" max="100" readonly/>
                                <div class="loading-overlay__spinner" style="display:none">
                                  <svg aria-hidden="true" focusable="false" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
                                    <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
                                  </svg>
                                </div>
                                <button type="button" id="add" class="add">
                                <svg class="add" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8">
                                  <rect id="Rectangle_10733" data-name="Rectangle 10733" width="8" height="1" rx="0.5" transform="translate(0 3.5)"/>
                                  <rect id="Rectangle_10732" data-name="Rectangle 10732" width="8" height="1" rx="0.5" transform="translate(4.5) rotate(90)"/>
                                </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        })
       $('.cart-drawer-items-container').html(cartItem_html);
        document.querySelector('.cart-checkout button').innerText=`Checkout (${Shopify.formatMoney( cartData.total_price )})`;-
        showDrawer();
      })
    }
  });
})

