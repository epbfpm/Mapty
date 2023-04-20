'use strict';

// prettier-ignore
/* ================================== */
/*              VAVIABLES             */
/* ================================== */
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* ========= QUERY SELECTORS ======== */
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

/* ================================== */
/*       MAP AND FORM BEHAVIOUR       */
/* ================================== */
class App {
  #map;
  #mapEv;
  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert('Could not get your position');
        }
      );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13);

    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    /* ============ MAP STYLE =========== */
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    /* ======== CLICK EV LISTENER ======= */
    this.#map.on('click', this._showForm.bind(this));
  }

  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _showForm(ev) {
    this.#mapEv = ev;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _newWorkout(e) {
    e.preventDefault();
    /* =========== SET MARKER =========== */
    L.marker(this.#mapEv.latlng)
      .addTo(this.#map)
      .bindPopup(
        L.popup(
          {
            maxWidth: 200,
            minWidth: 50,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
          },
          'Running'
        )
      )
      .openPopup()
      .setPopupContent('Workout');

    /* ====== CLEARING FORM FIELDS ====== */
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }
}
const app = new App();

class Workout {
  constructor(id, distance, duration, coords, date) {
    this.id = id;
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = date;
  }
}

class Running extends Workout {
  constructor(id, distance, duration, coords, date, name, cadence, pace) {
    super(id, distance, duration, coords, date);
    this.name = name;
    this.cadence = cadence;
    this.pace = pace;
  }
}

class Cycling extends Workout {
  constructor(
    id,
    distance,
    duration,
    coords,
    date,
    name,
    elevationGain,
    speed
  ) {
    super(id, distance, duration, coords, date);
    this.name = name;
    this.elevationGain = elevationGain;
    this.speed = speed;
  }
}
