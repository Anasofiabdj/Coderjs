function Producto(nombre, precio) {
  this.nombre = nombre;
  this.precio = precio;
}

const productosJSON = JSON.parse(localStorage.getItem("productos")) || [];
const productosAgregados = [];

const listaProductos = document.getElementById("lista-productos");
const totalSuma = document.getElementById("total-suma");
const agregarBtn = document.getElementById("agregar-btn");
const buscarBtn = document.getElementById("buscar-btn");
const eliminarBtn = document.getElementById("eliminar-btn");

function sumarPrecios(array) {
  let total = 0;
  for (const item of array) {
    total += item.precio;
  }
  return total;
}

function buscarProducto(array, nombre) {
  return array.find((producto) => producto.nombre === nombre);
}

function agregarElemento() {
  Swal.fire({
    title: "Agregar producto",
    html: `
      <label>Nombre:</label>
      <input id="nombre-input" class="swal2-input" type="text" autofocus pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+" title="Solo se permiten letras y espacios">

      <label>Precio:</label>
      <input id="precio-input" class="swal2-input" type="number" step="0.01">
    `,
    showCancelButton: true,
    confirmButtonText: "Agregar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const nombre = document.getElementById("nombre-input").value.trim();
      const precio = parseFloat(document.getElementById("precio-input").value);

      if (isNaN(precio) || nombre === "") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error, los valores no son válidos. Intenta nuevamente.",
        });
        return;
      }

      if (buscarProducto(productosAgregados, nombre) || buscarProducto(productosJSON, nombre)) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "El producto ya se encuentra en la lista.",
        });
        return;
      }

      const producto = new Producto(nombre, precio);

      productosAgregados.push(producto);
      localStorage.setItem("productos", JSON.stringify(productosAgregados.concat(productosJSON)));

      const listItem = document.createElement("li");
      listItem.textContent = `${nombre}: $${precio.toFixed(2)}`;
      listaProductos.appendChild(listItem);

      Swal.fire({
        icon: "success",
        title: "Producto agregado a la lista",
        text: `Se ha agregado el producto "${nombre}".`,
        timer: 4000,
      });

      const sumarProductos = sumarPrecios(productosAgregados) + sumarPrecios(productosJSON);
      totalSuma.textContent = `El total de la compra es: $${sumarProductos.toFixed(2)}`;
    }
  });
}

function buscarElemento() {
  Swal.fire({
    title: "Buscar producto",
    text: "Ingrese el nombre del producto a buscar:",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    showCancelButton: true,
    confirmButtonText: "Buscar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: (nombre) => {
      const productoEncontrado = buscarProducto(productosJSON.concat(productosAgregados), nombre);
      if (!productoEncontrado) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `El producto "${nombre}" no se encuentra en la lista.`,
        });
        return false;
      }
      return productoEncontrado;
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.value) {
      Swal.fire({
        icon: "success",
        title: "Producto encontrado",
        text: `El producto ${result.value.nombre} está en la lista y su precio es $${result.value.precio.toFixed(2)}.`,
      });
    }
  });
}

function eliminarElemento() {
  Swal.fire({
    title: "Eliminar producto",
    text: "Ingrese el nombre del producto a eliminar:",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    showCancelButton: true,
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    showLoaderOnConfirm: true,
    preConfirm: (nombre) => {
      const productoIndexAgregados = productosAgregados.findIndex((producto) => producto.nombre === nombre);
      const productoIndexJSON = productosJSON.findIndex((producto) => producto.nombre === nombre);

      if (productoIndexAgregados === -1 && productoIndexJSON === -1) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `El producto "${nombre}" no se encuentra en la lista.`,
        });
        return false;
      }

      if (productoIndexAgregados !== -1) {
        productosAgregados.splice(productoIndexAgregados, 1);
      } else if (productoIndexJSON !== -1) {
        productosJSON.splice(productoIndexJSON, 1);
      }

      localStorage.setItem("productos", JSON.stringify(productosJSON));

      return nombre;
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.value) {
      Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        text: `El producto "${result.value}" ha sido eliminado de la lista.`,
      });
      actualizarLista();
    }
  });
}

function actualizarLista() {
  listaProductos.innerHTML = "";
  for (const producto of productosAgregados.concat(productosJSON)) {
    const listItem = document.createElement("li");
    listItem.textContent = `${producto.nombre}: $${producto.precio.toFixed(2)}`;
    listaProductos.appendChild(listItem);
  }
  const sumarProductos = sumarPrecios(productosAgregados) + sumarPrecios(productosJSON);
  totalSuma.textContent = `El total de la compra es: $${sumarProductos.toFixed(2)}`;
}

async function cargarProductos() {
  try {
    const response = await fetch('productos.json');
    if (!response.ok) {
      throw new Error('Error al cargar el archivo JSON');
    }
    const productos = await response.json();
    return productos;
  } catch (error) {
    throw error;
  }
}

function mostrarProductosEnHTML(productos) {
  productosJSON.push(...productos); 
  localStorage.setItem("productos", JSON.stringify(productosJSON.concat(productosAgregados))); 

  for (const producto of productos) {
    const listItem = document.createElement("li");
    listItem.textContent = `${producto.nombre}: $${producto.precio.toFixed(2)}`;
    listaProductos.appendChild(listItem);
  }

  actualizarLista();
}

async function main() {
  try {
    const productos = await cargarProductos();
    mostrarProductosEnHTML(productos);
  } catch (error) {
    console.error('Error al cargar productos:', error);
  }
}

main();

agregarBtn.addEventListener("click", agregarElemento);
buscarBtn.addEventListener("click", buscarElemento);
eliminarBtn.addEventListener("click", eliminarElemento);

window.addEventListener("load", () => {
  actualizarLista();
});
