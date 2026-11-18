/* Page logic. Reads data-page on <body> and runs the matching renderer. */
(function () {
  "use strict";
  var FC = window.FC, P = window.PRODUCTS, Cart = window.Cart, WA = window.WA, fmt = window.fmt;
  var PH = "assets/images/placeholder.svg";
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function img(src, alt, w, h, eager) {
    return '<img src="' + esc(src) + '" alt="' + esc(alt) + '" width="' + w + '" height="' + h + '"' + (eager ? "" : ' loading="lazy"') +
      " decoding=\"async\" onerror=\"this.onerror=null;this.src='" + PH + "'\">";
  }
  function param(k) { return new URLSearchParams(location.search).get(k) || ""; }
  function byId(id) { return P.filter(function (p) { return p.id === id; })[0]; }
  function categories() {
    var m = {}; P.forEach(function (p) { m[p.category] = (m[p.category] || 0) + 1; });
    return Object.keys(m).map(function (k) { return { name: k, n: m[k] }; });
  }
  function toast(msg) {
    var t = $("#toast"); if (!t) { t = document.createElement("div"); t.id = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove("on"); }, 1800);
  }
  function reveal(root) {
    var els = $$(".reveal:not(.in)", root);
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }
  function card(p, i) {
    var u = "product.html?id=" + encodeURIComponent(p.id);
    return '<article class="card reveal" style="--i:' + (i % 6) + '">' +
      '<a class="card-img" href="' + u + '" tabindex="-1" aria-hidden="true">' + img(p.images[0], "", 640, 800) + "</a>" +
      '<div class="card-body"><p class="cat">' + esc(p.category) + '</p><h3><a href="' + u + '">' + esc(p.name) + "</a></h3>" +
      '<div class="row"><span class="price">' + fmt(p.price) + "</span>" +
      '<button type="button" class="btn-sm" data-add="' + esc(p.id) + '"' + (p.inStock ? "" : " disabled") + ">" + (p.inStock ? "Add to cart" : "Sold out") + "</button></div></div></article>";
  }

  /* ---------- shared chrome ---------- */
  function chrome() {
    var btn = $(".menu-btn"), nav = $("#nav");
    if (btn && nav) btn.addEventListener("click", function () { var o = nav.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    var here = location.pathname.split("/").pop() || "index.html";
    $$("#nav a").forEach(function (a) { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
    $$("[data-wa-link]").forEach(function (a) { a.href = WA.link("Hi " + FC.brand + ", I have a question."); a.target = "_blank"; a.rel = "noopener"; });
    $$("[data-fc]").forEach(function (el) { var v = FC[el.getAttribute("data-fc")]; if (v) el.textContent = v; });
    $$("[data-fc-mail]").forEach(function (a) { a.href = "mailto:" + FC.email; a.textContent = FC.email; });
    $$("[data-fc-tel]").forEach(function (a) { a.href = "tel:" + FC.phone.replace(/[^\d+]/g, ""); a.textContent = FC.phone; });
    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
    Cart.badge();
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-add]"); if (!b) return;
      var p = byId(b.getAttribute("data-add")); if (!p) return;
      Cart.add(p.id, 1); toast(p.name + " added to cart");
    });
  }

  /* ---------- home ---------- */
  function home() {
    var cats = $("#cats");
    if (cats) cats.innerHTML = categories().map(function (c, i) {
      return '<li class="reveal" style="--i:' + i + '"><a href="products.html?cat=' + encodeURIComponent(c.name) + '"><span>' + esc(c.name) + '</span><span class="n">' + c.n + (c.n === 1 ? " product" : " products") + "</span></a></li>";
    }).join("");
    var f = P.filter(function (p) { return p.featured; }); if (f.length < 2) f = P.slice(0, 4);
    var box = $("#featured"); if (box) box.innerHTML = f.slice(0, 4).map(card).join("");
  }

  /* ---------- products ---------- */
  function products() {
    var st = { q: param("q"), cat: param("cat"), sort: "new" };
    var q = $("#q"), sort = $("#sort"), chips = $("#chips"), grid = $("#grid"), empty = $("#empty"), count = $("#resultCount");
    q.value = st.q;
    chips.innerHTML = ['<button type="button" class="chip" data-cat="" aria-pressed="false">All</button>'].concat(categories().map(function (c) {
      return '<button type="button" class="chip" data-cat="' + esc(c.name) + '" aria-pressed="false">' + esc(c.name) + "</button>";
    })).join("");
    function draw() {
      var list = P.filter(function (p) {
        var hit = !st.q || (p.name + " " + p.category + " " + p.short).toLowerCase().indexOf(st.q.toLowerCase()) > -1;
        return hit && (!st.cat || p.category === st.cat);
      });
      if (st.sort === "low") list.sort(function (a, b) { return a.price - b.price; });
      if (st.sort === "high") list.sort(function (a, b) { return b.price - a.price; });
      $$(".chip", chips).forEach(function (c) { c.setAttribute("aria-pressed", String(c.getAttribute("data-cat") === st.cat)); });
      grid.classList.toggle("plain", !!(st.q || st.cat) || list.length < 4);
      grid.innerHTML = list.map(card).join("");
      empty.hidden = list.length > 0; grid.hidden = list.length === 0;
      count.textContent = list.length + (list.length === 1 ? " product" : " products") + (st.cat ? " in " + st.cat : "");
      reveal(grid);
    }
    q.addEventListener("input", function () { st.q = q.value.trim(); draw(); });
    sort.addEventListener("change", function () { st.sort = sort.value; draw(); });
    chips.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; st.cat = c.getAttribute("data-cat"); draw(); });
    var reset = $("#resetFilters"); if (reset) reset.addEventListener("click", function () { st.q = ""; st.cat = ""; q.value = ""; draw(); });
    draw();
  }

  /* ---------- product detail ---------- */
  function product() {
    var root = $("#pd"), p = byId(param("id"));
    if (!p) {
      root.innerHTML = '<div class="empty"><h1>We could not find that product</h1><p>The link may be old, or the product has been removed.</p><a class="btn" href="products.html">See all products</a></div>';
      $("#relatedWrap").hidden = true; document.title = "Product not found | " + FC.brand; return;
    }
    var url = FC.site + "/product.html?id=" + encodeURIComponent(p.id);
    document.title = p.name + " | " + FC.brand;
    var md = $('meta[name="description"]'); if (md) md.content = p.short;
    var cn = $('link[rel="canonical"]'); if (cn) cn.href = url;
    var og = $('meta[property="og:title"]'); if (og) og.content = p.name + " | " + FC.brand;
    $("#crumbCat").textContent = p.category; $("#crumbCat").href = "products.html?cat=" + encodeURIComponent(p.category);
    $("#crumbName").textContent = p.name;

    var thumbs = p.images.length > 1 ? '<div class="thumbs">' + p.images.map(function (s, i) {
      return '<button type="button" data-thumb="' + i + '" aria-label="Show image ' + (i + 1) + '" aria-pressed="' + (i === 0) + '">' + img(s, "", 120, 150) + "</button>";
    }).join("") + "</div>" : "";
    root.innerHTML =
      '<div class="pd"><div class="gallery"><div class="gal-main" id="galMain">' + img(p.images[0], p.name, 900, 1125, true) + "</div>" + thumbs + "</div>" +
      '<div class="pd-info"><p class="cat">' + esc(p.category) + '</p><h1>' + esc(p.name) + '</h1><p class="price big">' + fmt(p.price) + "</p>" +
      '<p class="lead">' + esc(p.short) + '</p><ul class="specs">' + p.details.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
      (p.inStock ? '<div class="buy"><div class="qty"><button type="button" data-q="-1" aria-label="Decrease quantity">-</button>' +
        '<input id="qty" type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase quantity">+</button></div>' +
        '<a class="btn btn-accent" id="waOrder" target="_blank" rel="noopener" href="#"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.6-.1l.8-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2z"/></svg>Order on WhatsApp</a>' +
        '<button type="button" class="btn btn-ghost" id="addBtn">Add to cart</button></div>' +
        '<p class="note">Tap Order on WhatsApp and your message is filled in. We confirm stock, final price and delivery before you pay.</p>'
        : '<p class="badge">Sold out right now</p><p class="note">Message us on WhatsApp and we will tell you when it is back.</p><div class="actions"><a class="btn" data-wa-link href="contact.html">Ask on WhatsApp</a></div>') +
      "</div></div>";
    chrome.wa();

    var main = $("#galMain");
    root.addEventListener("click", function (e) {
      var t = e.target.closest("[data-thumb]");
      if (t) { main.innerHTML = img(p.images[+t.getAttribute("data-thumb")], p.name, 900, 1125, true); $$("[data-thumb]", root).forEach(function (b) { b.setAttribute("aria-pressed", String(b === t)); }); }
    });
    var qty = $("#qty");
    if (qty) {
      function n() { var v = parseInt(qty.value, 10); return isNaN(v) || v < 1 ? 1 : Math.min(v, 99); }
      function wa() { $("#waOrder").href = WA.link(WA.single(p, n())); }
      qty.addEventListener("input", wa); qty.addEventListener("change", function () { qty.value = n(); wa(); });
      $$("[data-q]", root).forEach(function (b) { b.addEventListener("click", function () { qty.value = Math.max(1, Math.min(99, n() + (+b.getAttribute("data-q")))); wa(); }); });
      $("#addBtn").addEventListener("click", function () { Cart.add(p.id, n()); toast("Added to cart"); });
      wa();
    }

    var rel = P.filter(function (x) { return x.id !== p.id && x.category === p.category; });
    if (rel.length < 3) rel = rel.concat(P.filter(function (x) { return x.id !== p.id && x.category !== p.category; }));
    var rb = $("#related"); rb.innerHTML = rel.slice(0, 4).map(card).join(""); reveal(rb);

    var ld = document.createElement("script"); ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.short, category: p.category,
      image: p.images.map(function (s) { return FC.site + "/" + s; }), brand: { "@type": "Brand", name: FC.brand },
      offers: { "@type": "Offer", url: url, priceCurrency: "INR", price: p.price, availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" } });
    document.head.appendChild(ld);
  }

  /* ---------- cart ---------- */
  function cart() {
    var list = $("#cartList"), wrap = $("#cartWrap"), empty = $("#cartEmpty"), form = $("#orderForm");
    function draw() {
      var L = Cart.lines();
      empty.hidden = L.length > 0; wrap.hidden = L.length === 0;
      if (!L.length) return;
      list.innerHTML = L.map(function (l) {
        var u = "product.html?id=" + encodeURIComponent(l.p.id);
        return '<li class="line"><a class="line-img" href="' + u + '" tabindex="-1" aria-hidden="true">' + img(l.p.images[0], "", 176, 220) + "</a>" +
          '<div class="line-info"><a href="' + u + '">' + esc(l.p.name) + '</a><span class="cat">' + fmt(l.p.price) + ' each</span>' +
          '<div class="qty sm"><button type="button" data-cq="' + esc(l.p.id) + ':-1" aria-label="Decrease quantity of ' + esc(l.p.name) + '">-</button><input readonly value="' + l.qty + '" aria-label="Quantity of ' + esc(l.p.name) + '"><button type="button" data-cq="' + esc(l.p.id) + ':1" aria-label="Increase quantity of ' + esc(l.p.name) + '">+</button></div></div>' +
          '<div class="line-end"><span>' + fmt(l.p.price * l.qty) + '</span><button type="button" class="link" data-rm="' + esc(l.p.id) + '">Remove</button></div></li>';
      }).join("");
      $("#cartTotal").textContent = fmt(Cart.total());
    }
    list.addEventListener("click", function (e) {
      var q = e.target.closest("[data-cq]"), r = e.target.closest("[data-rm]");
      if (q) { var a = q.getAttribute("data-cq").split(":"), cur = Cart.get().filter(function (x) { return x.id === a[0]; })[0]; if (cur) Cart.setQty(a[0], cur.qty + (+a[1])); draw(); }
      if (r) { Cart.remove(r.getAttribute("data-rm")); draw(); }
    });
    $("#clearCart").addEventListener("click", function () { Cart.clear(); draw(); });
    form.addEventListener("submit", function (e) {
      e.preventDefault(); var ok = true;
      function check(id, test, msg) {
        var f = $("#" + id), er = $("#" + id + "-err"), bad = !test(f.value.trim());
        er.textContent = bad ? msg : ""; f.setAttribute("aria-invalid", String(bad));
        if (bad && ok) f.focus(); ok = ok && !bad;
      }
      check("c-name", function (v) { return v.length >= 2; }, "Please enter your name.");
      check("c-phone", function (v) { var d = v.replace(/\D/g, ""); return d.length >= 10 && d.length <= 13; }, "Enter a phone number with 10 or more digits.");
      check("c-address", function (v) { return v.length >= 8; }, "Please enter your full delivery address.");
      if (!ok) return;
      var text = WA.order(Cart.lines(), { name: $("#c-name").value.trim(), phone: $("#c-phone").value.trim(), address: $("#c-address").value.trim(), note: $("#c-note").value.trim() });
      window.open(WA.link(text), "_blank", "noopener");
    });
    draw();
  }

  /* ---------- contact ---------- */
  function contact() {
    var f = $("#msgForm"); if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = $("#m-name"), m = $("#m-msg"), ok = true;
      [[n, "m-name"], [m, "m-msg"]].forEach(function (x) {
        var bad = x[0].value.trim().length < 2; $("#" + x[1] + "-err").textContent = bad ? "This field is required." : "";
        x[0].setAttribute("aria-invalid", String(bad)); if (bad && ok) x[0].focus(); ok = ok && !bad;
      });
      if (ok) window.open(WA.link("Hi " + FC.brand + ", this is " + n.value.trim() + ".\n" + m.value.trim()), "_blank", "noopener");
    });
  }

  chrome.wa = function () { $$("[data-wa-link]").forEach(function (a) { a.href = WA.link("Hi " + FC.brand + ", I have a question."); a.target = "_blank"; a.rel = "noopener"; }); };
  chrome();
  var page = document.body.getAttribute("data-page");
  var map = { home: home, products: products, product: product, cart: cart, contact: contact };
  if (map[page]) map[page]();
  reveal(document);
})();
