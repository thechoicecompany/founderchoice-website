/* Cart (localStorage) and WhatsApp message builder. No server involved. */
(function () {
  "use strict";
  var KEY = "fc_cart_v1";
  var C = {
    get: function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    save: function (a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} C.badge(); },
    add: function (id, qty) {
      qty = qty || 1; var a = C.get(), i = a.filter(function (x) { return x.id === id; })[0];
      if (i) i.qty = Math.min(99, i.qty + qty); else a.push({ id: id, qty: qty });
      C.save(a);
    },
    setQty: function (id, q) {
      C.save(C.get().map(function (x) { return x.id === id ? { id: id, qty: Math.min(99, q) } : x; })
        .filter(function (x) { return x.qty > 0; }));
    },
    remove: function (id) { C.save(C.get().filter(function (x) { return x.id !== id; })); },
    clear: function () { C.save([]); },
    lines: function () {
      return C.get().map(function (l) {
        var p = window.PRODUCTS.filter(function (p) { return p.id === l.id; })[0];
        return p ? { p: p, qty: l.qty } : null;
      }).filter(Boolean);
    },
    count: function () { return C.get().reduce(function (s, x) { return s + x.qty; }, 0); },
    total: function () { return C.lines().reduce(function (s, l) { return s + l.p.price * l.qty; }, 0); },
    badge: function () {
      var n = C.count();
      Array.prototype.forEach.call(document.querySelectorAll("[data-cart-count]"), function (el) { el.textContent = n; el.hidden = n === 0; });
    }
  };
  function fmt(n) { return window.FC.currency + Number(n).toLocaleString("en-IN"); }
  function link(text) { return "https://wa.me/" + window.FC.whatsapp + "?text=" + encodeURIComponent(text); }
  function order(lines, c) {
    var t = "New order - " + window.FC.brand + "\n\nName: " + c.name + "\nPhone: " + c.phone + "\nAddress: " + c.address + "\n\nItems:\n";
    var total = 0;
    lines.forEach(function (l, i) {
      var sub = l.p.price * l.qty; total += sub;
      t += (i + 1) + ". " + l.p.name + " x" + l.qty + " - " + fmt(sub) + "\n";
    });
    t += "\nTotal: " + fmt(total);
    if (c.note) t += "\nNote: " + c.note;
    return t;
  }
  function single(p, qty) {
    var u = window.FC.site + "/product.html?id=" + p.id;
    return "Hi " + window.FC.brand + ", I want to order:\n" + p.name + " x" + qty + " - " + fmt(p.price * qty) + "\n" + u;
  }
  window.Cart = C; window.fmt = fmt; window.WA = { link: link, order: order, single: single };
})();
