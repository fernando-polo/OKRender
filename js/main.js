/* ==========================================
   1. ELEMENTOS DEL DOM
=========================================== */
const figuras = document.querySelectorAll(".scene__figure");
const dropZones = document.querySelectorAll(".scene__drop-zone");
const progressFill = document.getElementById("progress-fill");
const progressLabel = document.getElementById("progress-label");
const completado = document.getElementById("completado");
const botonReiniciar = document.getElementById("boton-reiniciar");
const canvasConfeti = document.getElementById("confeti-canvas");
const ctx = canvasConfeti.getContext("2d");

/* ==========================================
   2. ESTADO
=========================================== */
const TOTAL_FIGURAS = 4;
let figurasColocadas = 0;
let figuraArrastrada = null;

/* ==========================================
   3. DRAG & DROP — ESCRITORIO
=========================================== */
figuras.forEach((figura) => {
  figura.addEventListener("dragstart", (e) => {
    figuraArrastrada = figura;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => figura.classList.add("scene__figure--arrastrando"), 0);
  });

  figura.addEventListener("dragend", () => {
    figura.classList.remove("scene__figure--arrastrando");
    figuraArrastrada = null;
  });
});

dropZones.forEach((zona) => {
  zona.addEventListener("dragover", (e) => {
    e.preventDefault();
    zona.classList.add("scene__drop-zone--activa");
  });

  zona.addEventListener("dragleave", () => {
    zona.classList.remove("scene__drop-zone--activa");
  });

  zona.addEventListener("drop", (e) => {
    e.preventDefault();
    zona.classList.remove("scene__drop-zone--activa");
    validarColocacion(zona);
  });
});

/* ==========================================
   4. DRAG & DROP — TÁCTIL
=========================================== */
let clonFigura = null;
let offsetX = 0;
let offsetY = 0;

figuras.forEach((figura) => {
  figura.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      figuraArrastrada = figura;

      const touch = e.touches[0];
      const rect = figura.getBoundingClientRect();

      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;

      clonFigura = figura.cloneNode(true);
      clonFigura.classList.add("figura-clon");
      document.body.appendChild(clonFigura);

      moverClon(touch.clientX, touch.clientY);
      figura.classList.add("scene__figure--arrastrando");
    },
    { passive: false },
  );

  figura.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      moverClon(touch.clientX, touch.clientY);
      resaltarZonaBajoDedo(touch.clientX, touch.clientY);
    },
    { passive: false },
  );

  figura.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const zonaDestino = obtenerZonaBajoDedo(touch.clientX, touch.clientY);

      if (clonFigura) {
        clonFigura.remove();
        clonFigura = null;
      }

      figura.classList.remove("scene__figure--arrastrando");
      dropZones.forEach((z) => z.classList.remove("scene__drop-zone--activa"));

      if (zonaDestino) validarColocacion(zonaDestino);

      figuraArrastrada = null;
    },
    { passive: false },
  );
});

/* ==========================================
   5. FUNCIONES AUXILIARES — TÁCTIL
=========================================== */
function moverClon(clientX, clientY) {
  clonFigura.style.left = `${clientX - offsetX}px`;
  clonFigura.style.top = `${clientY - offsetY}px`;
}

function obtenerZonaBajoDedo(clientX, clientY) {
  clonFigura.style.display = "none";
  const elementoBajo = document.elementFromPoint(clientX, clientY);
  clonFigura.style.display = "";
  return elementoBajo?.closest(".scene__drop-zone") || null;
}

function resaltarZonaBajoDedo(clientX, clientY) {
  const zonaActual = obtenerZonaBajoDedo(clientX, clientY);
  dropZones.forEach((zona) => {
    if (zona === zonaActual) {
      zona.classList.add("scene__drop-zone--activa");
    } else {
      zona.classList.remove("scene__drop-zone--activa");
    }
  });
}

/* ==========================================
   6. VALIDACIÓN
=========================================== */
function validarColocacion(zona) {
  const tipoEsperado = zona.dataset.acepta;
  const tipoRecibido = figuraArrastrada.dataset.tipo;

  if (tipoEsperado === tipoRecibido) {
    colocarFiguraCorrecta(zona, figuraArrastrada);
  } else {
    mostrarError(figuraArrastrada);
  }
}

function colocarFiguraCorrecta(zona, figura) {
  figura.classList.add("scene__figure--colocada");
  zona.classList.add("scene__drop-zone--correcta");

  figurasColocadas++;
  actualizarProgreso();

  const audioExito = document.getElementById("audio-exito");
  if (audioExito.src) {
    audioExito.currentTime = 0;
    audioExito.play();
  }

  if (figurasColocadas === TOTAL_FIGURAS) {
    setTimeout(() => mostrarCompletado(), 600);
  }
}

function mostrarError(figura) {
  const audioError = document.getElementById("audio-error");
  if (audioError.src) {
    audioError.currentTime = 0;
    audioError.play();
  }

  figura.classList.add("scene__figure--error");
  figura.addEventListener(
    "animationend",
    () => {
      figura.classList.remove("scene__figure--error");
    },
    { once: true },
  );
}

/* ==========================================
   7. PROGRESO
=========================================== */
function actualizarProgreso() {
  const porcentaje = (figurasColocadas / TOTAL_FIGURAS) * 100;
  progressFill.style.width = `${porcentaje}%`;
  progressLabel.textContent = `${figurasColocadas} / ${TOTAL_FIGURAS}`;
}

/* ==========================================
   8. PANTALLA DE COMPLETADO
=========================================== */
function mostrarCompletado() {
  completado.classList.add("completado--visible");
  completado.setAttribute("aria-hidden", "false");
  lanzarConfeti();
}

botonReiniciar.addEventListener("click", reiniciarActividad);

function reiniciarActividad() {
  completado.classList.remove("completado--visible");
  completado.setAttribute("aria-hidden", "true");

  figurasColocadas = 0;
  actualizarProgreso();

  figuras.forEach((figura) => {
    figura.classList.remove("scene__figure--colocada");
    figura.classList.remove("scene__figure--error");
  });

  dropZones.forEach((zona) => {
    zona.classList.remove("scene__drop-zone--correcta");
    zona.classList.remove("scene__drop-zone--activa");
  });
}

/* ==========================================
   9. CONFETI
=========================================== */
const COLORES_CONFETI = [
  "#FF6B35",
  "#4ECDC4",
  "#6BCB77",
  "#FFE66D",
  "#A855F7",
  "#F472B6",
];
const TOTAL_PARTICULAS = 150;
let particulas = [];
let animacionConfeti = null;

function lanzarConfeti() {
  canvasConfeti.width = window.innerWidth;
  canvasConfeti.height = window.innerHeight;

  particulas = Array.from({ length: TOTAL_PARTICULAS }, () => ({
    x: Math.random() * canvasConfeti.width,
    y: Math.random() * -canvasConfeti.height,
    w: Math.random() * 12 + 6,
    h: Math.random() * 6 + 4,
    color: COLORES_CONFETI[Math.floor(Math.random() * COLORES_CONFETI.length)],
    velocidadY: Math.random() * 4 + 2,
    velocidadX: Math.random() * 2 - 1,
    rotacion: Math.random() * 360,
    velocidadR: Math.random() * 4 - 2,
  }));

  if (animacionConfeti) cancelAnimationFrame(animacionConfeti);

  animarConfeti();
}

function animarConfeti() {
  ctx.clearRect(0, 0, canvasConfeti.width, canvasConfeti.height);

  let todasCayeron = true;

  particulas.forEach((p) => {
    p.y += p.velocidadY;
    p.x += p.velocidadX;
    p.rotacion += p.velocidadR;

    if (p.y < canvasConfeti.height) todasCayeron = false;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate((p.rotacion * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });

  if (todasCayeron) {
    ctx.clearRect(0, 0, canvasConfeti.width, canvasConfeti.height);
    return;
  }

  animacionConfeti = requestAnimationFrame(animarConfeti);
}
