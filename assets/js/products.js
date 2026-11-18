/* Add or edit products here. One image file per entry in assets/images/products/.
   id: lowercase, no spaces. price: number only. featured: true shows it on the home page. */
window.PRODUCTS = [
  { id:"product-01", name:"Product Name 01", category:"Category One", price:499,
    images:["assets/images/products/sample-1.jpg"], featured:true, inStock:true,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight","Colour options"] },
  { id:"product-02", name:"Product Name 02", category:"Category One", price:799,
    images:["assets/images/products/sample-2.jpg"], featured:true, inStock:true,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight"] },
  { id:"product-03", name:"Product Name 03", category:"Category Two", price:1299,
    images:["assets/images/products/sample-3.jpg","assets/images/products/sample-3b.jpg"], featured:true, inStock:true,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight","Care or usage"] },
  { id:"product-04", name:"Product Name 04", category:"Category Two", price:349,
    images:["assets/images/products/sample-4.jpg"], featured:true, inStock:true,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight"] },
  { id:"product-05", name:"Product Name 05", category:"Category Three", price:1999,
    images:["assets/images/products/sample-5.jpg"], featured:false, inStock:true,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight"] },
  { id:"product-06", name:"Product Name 06", category:"Category Three", price:599,
    images:["assets/images/products/sample-6.jpg"], featured:false, inStock:false,
    short:"One plain sentence about what this is and who it is for.",
    details:["Material or ingredients","Size or weight"] }
];
