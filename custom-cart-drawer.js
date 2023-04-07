var main_drawer_container = document.querySelector('.product-drawer')
var overlay = document.querySelector('.product-overlay')
const drawer=document.querySelector('.product-drawer-container');
function hideDrawer(){
    overlay.style.opacity = "0";
    overlay.style.visibility="hidden"
    drawer.classList.remove('cart-drawer-shown');
    main_drawer_container.style.visibility="hidden";
    document.querySelector('body').style.overflow='scroll';
}
  var closeCart = document.querySelector('.mob-cart-close')
  closeCart.addEventListener('click' , function(){
     drawer.classList.remove('cart-drawer-shown');
    document.querySelector('body').style.overflow='scroll';
    main_drawer_container.style.visibility="hidden";
    overlay.style.opacity = "0";
    
    
  })
function showDrawer(){
  overlay.style.opacity="0.5";
  overlay.style.visibility="visible";
  drawer.classList.add('cart-drawer-shown');
  main_drawer_container.style.visibility="visible";
  document.querySelector('body').style.overflow='hidden'
}
overlay.addEventListener('click' , function(){
    hideDrawer()
})

const cart_icon=document.getElementById('cart-icon-bubble');
cart_icon.addEventListener('click',e=>{
  showDrawer()
  
})


  $(document).ready(function () {
  const drawer=document.querySelector('cart-drawer-items .cart-drawer-wrapper')
  drawer.addEventListener('click',e=>{
  if(e.target.classList.contains('add')){
    const qtywrap=e.target.closest('.qty-wrap');
    const spinner=qtywrap.querySelector('.loading-overlay__spinner');
    const input=qtywrap.querySelector('.qtycount');
    input.style.display='none';
    spinner.style.display='flex';
    const id=parseInt(qtywrap.dataset.variantId);
    const updates={
      updates:{}
    };
    
    const current_val=parseInt(input.value);
    console.log(current_val)
    const updated_val=current_val+1;
    updates.updates[id]=updated_val;
    input.value=updated_val;
    
    console.log(id)
    console.log(updates);
    const data= fetch(window.Shopify.routes.root + 'cart/update.js', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      .then(response => {
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    data.then(res=>{
      console.log(res)
      if(res.status != 422){
      for(let i=0;i<res.items.length;i++){
        if(res.items[i].id == id){
          input.value=res.items[i].quantity;
            input.style.display='inline-block';
            spinner.style.display='none';
        }
      }
      $('div.cart-count-bubble').text(res.item_count);
      console.log(res);
      let currency = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: res.currency,
      });
      let total=res.total_price/100;
      total=total.toFixed(2);
      total=currency.format(total);
      drawer.querySelector('.cart-checkout button').innerText=`Checkout (${total})`
    }
    })

  }
  else if(e.target.classList.contains('sub')){
    const qtywrap=e.target.closest('.qty-wrap');
    const spinner=qtywrap.querySelector('.loading-overlay__spinner');                  
    const input=qtywrap.querySelector('.qtycount');
    input.style.display='none';
    spinner.style.display='flex';
    const id=parseInt(qtywrap.dataset.variantId);
    const updates={
      updates:{}
    };
    const current_val=parseInt(input.value);
    const updated_val=current_val-1;
    console.log(current_val)
    updates.updates[id]=updated_val;
    input.value=updated_val;
    console.log(id)
    console.log(updates);
    /*const data=jQuery.post(window.Shopify.routes.root + 'cart/update.js', updates);*/
    const data= fetch(window.Shopify.routes.root + 'cart/update.js', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      .then(response => {
        return response.json();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    data.then(res=>{
     console.log(res)
      let flag=false;
      if(res.status != 422){
      for(let i=0;i<res.items.length;i++){
        if(res.items[i].id == id){
          flag=true;
          input.value=res.items[i].quantity;
          input.style.display='inline-block';
          spinner.style.display='none';
          
        }
      }
        console.log(res);
      $('div.cart-count-bubble').text(res.item_count);
      let total=Shopify.formatMoney(res.total_price);
      drawer.querySelector('.cart-checkout button').innerText=`Checkout (${total})`
      if(!flag){
        qtywrap.closest('.cart-drawer-item').style.display='none';
      }
    }
    })
  }
  })
})
