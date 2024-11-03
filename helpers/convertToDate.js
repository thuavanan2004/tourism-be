const today = new Date();
const currentYear = today.getFullYear();


const convertToDate = (stringDays) => {
  const arrDays = stringDays.split(",");

  const dateObjects = arrDays.map(item => {
    const [day, month] = item.split("/").map(Number);

    let year = currentYear;
    const date = new Date(year, month - 1, day + 1);

    if (today > date) {
      year += 1;
    }
    return new Date(year, month - 1, day + 1);
  })

  return dateObjects;
}

module.exports = convertToDate;