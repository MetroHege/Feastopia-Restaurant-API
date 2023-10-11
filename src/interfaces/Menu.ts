export interface Course {
    name: string
    price: string
    diets: string[]
  }

 export interface DailyMenu {
    courses: Course[];
  }

/*-----WEEKLY MENU------*/

export interface WeeklyMenu {
  days: {
  date: string
  courses: Course[]
  }[]
}
