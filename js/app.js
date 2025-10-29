const store = { products: [], cart: JSON.parse(localStorage.getItem('cart')||'[]') };
const fmtCLP = (n)=> new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);

async function loadProducts(){
  const res = await fetch('data/products.json?v='+Date.now());
  store.products = await res.json();
  renderProducts(store.products);
  renderCart();
}

function renderProducts(list){
  const grid = document.getElementById('grid');
  if(!grid) return;
  grid.innerHTML = list.map(p=>`
    <article class="card">
      <img src="${p.img}" alt="${p.title}" class="${p.popular?'lock':''}">
      <div class="p">
        <div class="flex" style="justify-content:space-between">
          <span class="badge">🧩 ${p.materials}</span>
          ${p.popular ? '<span class="badge popular">🔥 Popular</span>' : ''}
        </div>
        <h3 style="margin:.4rem 0">${p.title}</h3>
        <div class="flex">
          <span class="badge">💧 ${p.capacity_l} L</span>
          <span class="badge">🧯 ${p.nozzles} boquillas</span>
          <span class="badge">⚙️ Bomba ${p.pump}</span>
        </div>
        <p class="price" style="margin:.6rem 0">${fmtCLP(p.price_clp)}</p>
        <div class="flex">
          <button class="btn solid" onclick="addToCart('${p.id}')">🛒 Agregar</button>
          <a class="btn" href="viewer3d/index.html?id=${p.id}">👁️ 3D</a>
          <a class="btn" href="pages/configurador.html?id=${p.id}">🛠️ Configurar</a>
        </div>
        <p class="mini">⏱️ Bajo pedido: ${p.lead_time_days} días hábiles</p>
      </div>
    </article>
  `).join('');
}

function addToCart(id){
  const ex = store.cart.find(x=>x.id===id);
  if(ex){ ex.qty += 1; } else { store.cart.push({id, qty:1}); }
  localStorage.setItem('cart', JSON.stringify(store.cart));
  renderCart();
  toast('Producto agregado al carrito');
}

function renderCart(){
  const target = document.getElementById('cart');
  if(!target) return;
  const rows = store.cart.map(i=>{
    const p = store.products.find(x=>x.id===i.id);
    const subtotal = p.price_clp * i.qty;
    return `<tr>
      <td>${p.title}</td>
      <td><input class="input" style="width:80px" type="number" min="1" value="${i.qty}" oninput="updateQty('${i.id}', this.value)"></td>
      <td>${fmtCLP(p.price_clp)}</td>
      <td>${fmtCLP(subtotal)}</td>
      <td><button class="btn" onclick="removeItem('${i.id}')">✖️</button></td>
    </tr>`
  }).join('');
  const total = store.cart.reduce((a,i)=>{
    const p = store.products.find(x=>x.id===i.id);
    return a + p.price_clp * i.qty;
  },0);
  target.innerHTML = `
    <table class="table">
      <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>${rows || '<tr><td colspan="5">Tu carrito está vacío</td></tr>'}</tbody>
      <tfoot><tr><th colspan="3" style="text-align:right">Total:</th><th>${fmtCLP(total)}</th><th></th></tr></tfoot>
    </table>
  `;
}

function updateQty(id, v){
  const n = Math.max(1, parseInt(v||'1',10));
  const item = store.cart.find(x=>x.id===id);
  if(item){ item.qty = n; localStorage.setItem('cart', JSON.stringify(store.cart)); renderCart(); }
}

function removeItem(id){
  store.cart = store.cart.filter(x=>x.id!==id);
  localStorage.setItem('cart', JSON.stringify(store.cart));
  renderCart();
}

function checkout(){
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(store.cart))));
  location.href = 'pages/checkout.html?cart=' + payload;
}

function filterProducts(){
  const cap = document.getElementById('f-cap').value;
  const max = parseInt(document.getElementById('f-max').value||'0',10);
  let list = [...store.products];
  if(cap) list = list.filter(p=> p.capacity_l >= parseInt(cap,10));
  if(max) list = list.filter(p=> p.price_clp <= max);
  renderProducts(list);
}

function toast(msg){
  const el = document.querySelector('.toast');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(()=> el.style.display='none', 2000);
}

function updateCalculator(){
  const vol = parseFloat(document.getElementById('calc-vol')?.value||'0');
  const ec = parseFloat(document.getElementById('calc-ec')?.value||'0');
  if(!document.getElementById('calc-out')) return;
  const mlA = vol * ec * 1.0;
  const mlB = vol * ec * 1.0;
  document.getElementById('calc-out').innerHTML = `<b>${mlA.toFixed(0)} mL</b> de Solución A y <b>${mlB.toFixed(0)} mL</b> de Solución B (estimación).`;
}

window.addEventListener('DOMContentLoaded', loadProducts);
