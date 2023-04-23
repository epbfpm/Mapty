'use strict';

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
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  type = inputType.value === 'running';
  // transforms the date into a string and extracts the last 10 digits

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lon]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date = new Date();
    this.description = `${
      this.type ? `Running` : `Cycling`
    } on ${date.getDate()}/${months[date.getMonth() + 1]}`;
    console.log(this.description);
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cyc1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cyc1);

class App {
  #map;
  #mapEv;
  #workouts = [];

  constructor() {
    this._getPosition();

    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    this.containerWorkouts.addEventListener('click', this._moveToPopup);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    this.#map = L.map('map').setView([latitude, longitude], 13);

    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

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

  _clearForm() {
    form.classList.add('hidden');
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
  }

  _newWorkout(e) {
    e.preventDefault();

    // Get data from form
    const type = inputType.value === 'running';
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const special = type ? +inputCadence.value : +inputElevation.value;
    const { lat, lng } = this.#mapEv.latlng;
    let workout;

    /* =========== VALIDATION =========== */
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    const positiveInputs = (...inputs) => inputs.every(input => input > 0);

    if (
      !validInputs(distance, duration, special) ||
      !positiveInputs(distance, duration, special)
    )
      return alert('Inputs have to be positive numbers!');

    /* ========= CREATE NEW OBJ ========= */
    workout = new (type ? Running : Cycling)(
      [lat, lng],
      distance,
      duration,
      special
    );
    this.#workouts.push(workout);

    console.log(workout.type, workout, this.#workouts);
    /* ====== CLEARING FORM FIELDS ====== */
    this._clearForm();

    /* ========== SETING MARKER ========= */
    this._setMarker(workout);

    /* ======== RENDERING WORKOUT ======= */
    this._renderWorkout(workout);
  }

  _setMarker(workout) {
    L.marker(this.#mapEv.latlng)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${inputType.value}-popup`,
        })
      )
      .openPopup()
      .setPopupContent(`${workout.type ? '🏃‍♂️' : '🚴'} ${workout.description}`);
  }
  _renderWorkout(workout) {
    let newObject;

    if (workout.distance && workout.duration) {
      newObject = `<li class="workout workout--${inputType.value}" data-id=${
        workout.id
      }>
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workoutBlock">
          <div class="workout__details">
            <span class="workout__icon">${workout.type ? '🏃‍♂️' : '🚴'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          </div>
          <div class="workoutBlock">
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type
                ? workout.calcPace().toFixed(1)
                : workout.calcSpeed().toFixed(1)
            }</span>
            <span class="workout__unit">min/km</span>
          </div>
     ${
       workout.type
         ? ` <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>`
         : `<div class="workout__details">
            <span class="workout__icon">⛰${'  '}</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
          </div>
        </li>`
     }`;
      form.insertAdjacentHTML('afterend', newObject);
    } else {
      alert('Insert workout details');
    }
  }
  _moveToPopup(e) {
    if (!this.#map) return;
    const workoutEl = e.target.closest('.workout');
    console.log(workoutEl);
  }
}
const app = new App();
