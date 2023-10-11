import { isDailyMenu } from "./functions";
import { Course, DailyMenu, WeeklyMenu } from "./interfaces/Menu";
import { Restaurant } from "./interfaces/Restaurant";

const restaurantRow = (restaurant: Restaurant) => {
  const {name, address, company} = restaurant;
  const tr = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.innerText = name;
  // give addressCell td element a class name
  const addressCell = document.createElement('td');
  addressCell.classList.add('tableAddress');
  addressCell.innerText = address;
  // give companyCell td element a class name
  const companyCell = document.createElement('td');
  companyCell.classList.add('tableCompany');
  companyCell.innerText = company;
  tr.appendChild(nameCell);
  tr.appendChild(addressCell);
  tr.appendChild(companyCell);
  return tr;
};

const restaurantModal = (restaurant: Restaurant, menu: DailyMenu | WeeklyMenu) => {
  const {name, address, city, postalCode, phone, company} = restaurant;
  let html = `<h3>${name}</h3>
    <p>${company}</p>
    <p>${address} ${postalCode} ${city}</p>
    <p>${phone}</p>
    <table>
      <tr>
        <th>Ruokalaji</th>
        <th>Ruokavalio</th>
        <th>Hinta</th>
      </tr>
    `;

    if (isDailyMenu(menu)) {
      menu.courses.forEach((course: Course) => {
        const {name, diets, price} = course;
        html += `
              <tr>
                <td>${name}</td>
                <td>${diets ?? ' - '}</td>
                <td>${price ?? ' - '}</td>
              </tr>
              `;
      });
    } else {
      menu.days.forEach((day) => {
        const {date, courses} = day;
        html += `
              <tr>
                <td colspan="3">${date}</td>
              </tr>
              `;
        courses.forEach((course: Course) => {
          const {name, diets, price} = course;
          html += `
                <tr>
                  <td>${name}</td>
                  <td>${diets ?? ' - '}</td>
                  <td>${price ?? ' - '}</td>
                </tr>
                `;
        });
      });
    }
  html += '</table>';
  return html;
};

const errorModal = (message: string) => {
  const html = `
        <h3>Error</h3>
        <p>${message}</p>
        `;
  return html;
};

export {restaurantRow, restaurantModal, errorModal};
