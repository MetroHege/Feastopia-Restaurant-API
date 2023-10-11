import {errorModal, restaurantModal, restaurantRow} from './components';
import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import { DailyMenu, WeeklyMenu } from './interfaces/Menu';
import { Restaurant, Restaurants } from './interfaces/Restaurant';
import {apiUrl, uploadUrl, positionOptions} from './variables';

const modal = document.querySelector('dialog');
if (!modal) {
  throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
  modal.close();
});

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

const createTable = (restaurants: Restaurants, menuDate: boolean = true) => {
  const table = document.querySelector('table');
  if (!table) return;
  table.innerHTML = '';
  restaurants.forEach((restaurant) => {
    const tr = restaurantRow(restaurant);
    table.appendChild(tr);
    tr.addEventListener('click', async () => {
      try {
        // remove all highlights
        const allHighs = document.querySelectorAll('.highlight');
        allHighs.forEach((high) => {
          high.classList.remove('highlight');
        });
        // add highlight
        tr.classList.add('highlight');
        // add restaurant data to modal
        modal.innerHTML = '';

        // fetch menu
        const menu = await fetchData<DailyMenu>(
          apiUrl + `/restaurants/daily/${restaurant._id}/fi`
        );
        console.log(menu);

        // fetch weekly menu
        const weeklyMenu = await fetchData<WeeklyMenu>(
          apiUrl + `/restaurants/weekly/${restaurant._id}/fi`
        );

        if (menuDate) {
          const menuHtml = restaurantModal(restaurant, menu);
          modal.insertAdjacentHTML('beforeend', menuHtml);
        } else {
          const menuHtml = restaurantModal(restaurant, weeklyMenu);
          modal.insertAdjacentHTML('beforeend', menuHtml);
        }
        modal.showModal();
      } catch (error) {
        modal.innerHTML = errorModal((error as Error).message);
        modal.showModal();
      }
    });
  });
};

const error = (err: GeolocationPositionError) => {
  console.warn(`ERROR(${err.code}): ${err.message}`);
};

const success = async (pos: GeolocationPosition) => {
  try {
    const crd = pos.coords;
    const restaurants = await fetchData<Restaurants>(apiUrl + '/restaurants');
    console.log(restaurants);
    restaurants.sort((a, b) => {
      const x1 = crd.latitude;
      const y1 = crd.longitude;
      const x2a = a.location.coordinates[1];
      const y2a = a.location.coordinates[0];
      const distanceA = calculateDistance(x1, y1, x2a, y2a);
      const x2b = b.location.coordinates[1];
      const y2b = b.location.coordinates[0];
      const distanceB = calculateDistance(x1, y1, x2b, y2b);
      return distanceA - distanceB;
    });

    createTable(restaurants);

    // buttons for filtering
    const sodexoBtn = document.querySelector('#sodexo');
    const compassBtn = document.querySelector('#compass');
    const resetBtn = document.querySelector('#reset');
    const dayBtn = document.querySelector('#day');
    const weekBtn = document.querySelector('#week');

    console.log(dayBtn);

    sodexoBtn?.addEventListener('click', () => {
      const sodexoRestaurants = restaurants.filter(
        (restaurant: Restaurant) => restaurant.company === 'Sodexo'
      );
      console.log(sodexoRestaurants);
      createTable(sodexoRestaurants);
    });

    compassBtn?.addEventListener('click', () => {
      const compassRestaurants = restaurants.filter(
        (restaurant: Restaurant) => restaurant.company === 'Compass Group'
      );
      console.log(compassRestaurants);
      createTable(compassRestaurants);
    });

    resetBtn?.addEventListener('click', () => {
      createTable(restaurants);
    });

    // gets daily menu
    dayBtn?.addEventListener('click', async () => {
      console.log('day');
      createTable(restaurants, true);
    });

    // gets weekly menu
    weekBtn?.addEventListener('click', async () => {
      createTable(restaurants, false);
    });
  } catch (error) {
    modal.innerHTML = errorModal((error as Error).message);
    modal.showModal();
  }
};

navigator.geolocation.getCurrentPosition(success, error, positionOptions);

// ------------------------------------------------------------

// select forms from the DOM

const loginForm = document.querySelector('#login-form');
const profileForm = document.querySelector('#profile-form');
const avatarForm = document.querySelector('#avatar-form');

// select inputs from the DOM

const usernameInput = document.querySelector('#username') as HTMLInputElement | null;
const passwordInput = document.querySelector('#password') as HTMLInputElement | null;
const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement | null;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement | null;
const avatarInput = document.querySelector('#avatar') as HTMLInputElement | null;

// select profile elements from the DOM

const usernameTarget = document.querySelector('#username-target');
const emailTarget = document.querySelector('#email-target');
const avatarTarget = document.querySelector('#avatar-target');

// function to login

const login = async (user: {username: string, password: string}): Promise<LoginUser> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  };
  return await fetchData<LoginUser>(apiUrl + '/auth/login', options);
};

// function to upload avatar

const uploadAvatar = async (image: File, token: string): Promise<UpdateResult> => {
  const formData = new FormData();
  formData.append('avatar', image);
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  };
  return await fetchData(apiUrl + '/users/avatar', options);
};

// function to update user data

const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  const options: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify(user),
  };
  return await fetchData(apiUrl + '/users', options);
};

// function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form

const addUserDataToDom = (user: User): void => {
  if (!usernameTarget || !emailTarget || !avatarTarget || !profileEmailInput || !profileUsernameInput) {
    return;
  }
  usernameTarget.innerHTML = user.username;
  emailTarget.innerHTML = user.email;
  (avatarTarget as HTMLImageElement).src = uploadUrl + user.avatar;
  profileEmailInput.value = user.email;
  profileUsernameInput.value = user.username;
};

// function to get userdata from API using token

const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom

const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const userData = await getUserData(token);
  addUserDataToDom(userData);
};

// call checkToken on page load to check if token exists and update the DOM

checkToken();

// login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data

loginForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if (!usernameInput || !passwordInput) {
    return;
  }
  const user = {
    username: usernameInput.value,
    password: passwordInput.value,
  };
  const loginData = await login(user);
  console.log(loginData);
  localStorage.setItem('token', loginData.token);
  addUserDataToDom(loginData.data);
});

// profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

profileForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if (!profileEmailInput || !profileUsernameInput) {
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const user = {
    email: profileEmailInput.value,
    username: profileUsernameInput.value,
  };
  const updateData = await updateUserData(user, token);
  console.log(updateData);
  checkToken();
});

// avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

avatarForm?.addEventListener('submit', async (evt)=>{
  evt.preventDefault();
  if (!avatarInput?.files) {
    return;
  }
  const image = avatarInput.files[0];
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  const avatarData = await uploadAvatar(image, token);
  console.log(avatarData);
  checkToken();
});

// dark theme
// queryselector for table element which is inside dialog element
// queryselector for div element with class form-container

const checkbox = document.getElementById("checkbox")
checkbox?.addEventListener("change", () => {
  document.body.classList.toggle("dark")
  document.querySelector("table")?.classList.toggle("tableDark")
  document.querySelector("dialog")?.classList.toggle("dialogDark")
  document.querySelector("form")?.classList.toggle("formDark")
  document.querySelector("main")?.classList.toggle("mainDark")
  document.querySelector("section")?.classList.toggle("sectionDark")
})
