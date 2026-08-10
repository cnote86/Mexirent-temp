(function () {
  "use strict";

  /* ----------------------------------------------------------
     Cuenta regresiva
     Cambia esta fecha por la fecha real de lanzamiento.
     ---------------------------------------------------------- */
  var LAUNCH_DATE = new Date("2026-09-01T00:00:00-06:00");

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tickCountdown() {
    var now = new Date();
    var diff = LAUNCH_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMins.textContent = "00";
      elSecs.textContent = "00";
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var mins = Math.floor((totalSeconds % 3600) / 60);
    var secs = totalSeconds % 60;

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMins.textContent = pad(mins);
    elSecs.textContent = pad(secs);
  }

  if (elDays && elHours && elMins && elSecs) {
    tickCountdown();
    setInterval(tickCountdown, 1000);
  }

  /* ----------------------------------------------------------
     Formulario "Avísame"
     Guarda el correo en localStorage como demo (no hay backend).
     ---------------------------------------------------------- */
  var form = document.getElementById("notify-form");
  var emailInput = document.getElementById("email");
  var note = document.getElementById("form-note");
  var submitBtn = form ? form.querySelector("button[type='submit']") : null;

  function getSelectedRole() {
    var checked = document.querySelector("input[name='role']:checked");
    return checked ? checked.value : "cliente";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function saveSignup(email, role) {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, role: role }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Error al registrar");
    }

    return response.json();
  }

  if (form) {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var email = emailInput.value.trim();
      var role = getSelectedRole();

      if (!isValidEmail(email)) {
        note.textContent = "Ese correo no se ve válido. Revísalo, porfa.";
        note.classList.add("is-error");
        emailInput.focus();
        return;
      }

      note.classList.remove("is-error");
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      try {
        await saveSignup(email, role);

        submitBtn.textContent = "¡Listo!";
        note.textContent =
          role === "proveedor"
            ? "Gracias. Te avisamos en cuanto abramos el registro de proveedores."
            : "Gracias. Te avisamos en cuanto abramos en tu ciudad.";

        form.reset();
        document.querySelector("input[name='role'][value='" + role + "']").checked = true;

        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Avísame cuando esté listo";
        }, 3000);
      } catch (err) {
        note.textContent = "Hubo un error. Intenta de nuevo.";
        note.classList.add("is-error");
        submitBtn.disabled = false;
        submitBtn.textContent = "Avísame cuando esté listo";
      }
    });
  }

  /* ----------------------------------------------------------
     Botón "Quiero ser proveedor": preselecciona el rol y
     enfoca el correo.
     ---------------------------------------------------------- */
  var providerLink = document.getElementById("provider-link");
  if (providerLink) {
    providerLink.addEventListener("click", function () {
      var providerRadio = document.querySelector("input[name='role'][value='proveedor']");
      if (providerRadio) {
        providerRadio.checked = true;
      }
      setTimeout(function () {
        if (emailInput) emailInput.focus();
      }, 450);
    });
  }
})();
