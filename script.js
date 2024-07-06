// import KEYS from "..assets/..Keys.js"
// import KEYS from "../assets/Keys.js"
import KEYS from "../Keys.js"; // Ruta relativa desde subcarpeta hacia Keys.js en la carpeta principal


const $d = document;
const $arepas = $d.getElementById("arepas");
const $template = $d.getElementById("arepa-template").content;
const $fragment = $d.createDocumentFragment();
const options = { headers: {Authorization: `Bearer ${KEYS.secret}`}}
const FormatoDeMoneda = num => `(S/${num.slice(0, -2)}.${num.slice(-2)})`;

let products, prices;
//Esta linea de Promise.all 
// nos va a permitir hacer diferentes peticiones a una API al mismo tiempo
// y el va a encapsular estas difernets peticiones
//   a medida q estas vayan respondiendo, esto se hace por una buena practica
// para no tener varios fetch regados por nuestra linea de codigo

Promise.all([
    fetch("https://api.stripe.com/v1/products", options),
    fetch("https://api.stripe.com/v1/prices", options)
])
.then(responses => Promise.all(responses.map(res => res.json())))
.then(json => {
    products = json[0].data;
    prices = json[1].data;
    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
        //en  esta linea sgte , solo es referencial para ver q hay adentro
        // console.log(productData);
        $template.querySelector(".arepa").setAttribute("data-price", el.id);
        $template.querySelector("img").src = productData[0].images[0];
        $template.querySelector("img").alt = productData[0].name;
        $template.querySelector("figcaption").innerHTML = 
        `${productData[0].name} </br>
        ${FormatoDeMoneda(el.unit_amount_decimal)} 
   
        `;
        // SI YO COLOCO ESTA LINEA ARRIBA , ME COLOCARÁ TBM EL FORMATO PEN
        // ${(el.currency).toUpperCase()}


        let $clone = $d.importNode($template, true);

        $fragment.appendChild($clone);
    });

    $arepas.appendChild($fragment);
})
.catch(error => {
    let message = error.statuText || "Ocurrió un error en la petición";

    // esta linea es para saber en pantalla q tipo de error es:
    // ya q puede ser un error 404, 403 y como sabes el tipo de error ,bueno 
    // lo haces con esto
    $arepas.innerHTML = `Error: ${error.status}: ${message}`;
})




// let midato=document.getElementsByClassName(nroRecep).value
// A partir de estas lineas ya ocurre la magia de q al darle click 
// a cualquiera
// de las imagenes , me dirije a una UI para realizar el pago:
$d.addEventListener("click", e => {
    if (e.target.matches(".arepas *")) {
        let priceId = e.target.parentElement.getAttribute("data-price");

        // Obten el valor ingresado en el campo de cantidad
        let cantidadInputValue = parseInt($d.getElementById("cantidadInput").value, 10) || 1;
    

        Stripe(KEYS.public).redirectToCheckout({
            lineItems: [{
                price: priceId,
                quantity: cantidadInputValue, // Usa el valor ingresado
            }],
            mode: "subscription",
            
            successUrl: "http://127.0.01:5500/assets/success.html",
            cancelUrl: "http://127.0.01:5500/assets/cancel.html"
            

        })
        .then(res => {
            if (res.error){
                $arepas.insertAdjacentElement("afterend", res.error.message);
            }
        });
    }
});

