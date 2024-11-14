module.exports.buildTourQuery = (filters) => {
  let sortQuery = '';
  if (filters.sortOrder) {
    sortQuery = `ORDER BY tour_detail.adultPrice ${filters.sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }

  let statusQuery = '';
  if (filters.status) {
    statusQuery = `AND tours.status=${filters.status === '1'}`;
  }

  let isFeaturedQuery = '';
  if (filters.isFeatured) {
    isFeaturedQuery = `AND tours.isFeatured=${filters.isFeatured}`;
  }

  let destinationQuery = '';
  if (filters.destinationTo) {
    destinationQuery = `AND tours.destinationId=${filters.destinationTo}`;
  }

  let departureQuery = '';
  if (filters.departureFrom) {
    departureQuery = `AND tours.departureId=${filters.departureFrom}`;
  }

  let transportationQuery = '';
  if (filters.transTypeId) {
    transportationQuery = `AND tours.transportationId=${filters.transTypeId}`;
  }

  let categoryQuery = '';
  if (filters.categoryId) {
    categoryQuery = `AND categories.id=${filters.categoryId}`;
  }

  let dayQuery = '';
  if (filters.fromDate) {
    const [year, month, day] = filters.fromDate.split("-");
    const formattedDate = new Date(year, month - 1, day).toISOString().slice(0, 19).replace('T', ' ');
    dayQuery = `AND tour_detail.dayStart > '${formattedDate}'`;
  }

  return `
    SELECT 
      tours.id,
      tours.title, 
      IFNULL(MAX(images.source), 'default_image.jpg') AS source,
      tours.code, 
      tours.status, 
      tours.isFeatured, 
      tour_detail.adultPrice, 
      tour_detail.dayStart, 
      tour_detail.dayReturn, 
      categories.title AS categories,
      destination.title AS destination, 
      departure.title AS departure, 
      transportation.title AS transportation
    FROM tours
    LEFT JOIN tours_categories ON tours.id = tours_categories.tourId
    LEFT JOIN categories ON tours_categories.categoryId = categories.id
    LEFT JOIN destination ON tours.destinationId = destination.id
    LEFT JOIN transportation ON transportation.id = tours.transportationId
    LEFT JOIN tour_detail ON tour_detail.tourId = tours.id
    LEFT JOIN departure ON departure.id = tours.departureId
    LEFT JOIN images ON images.tourId = tours.id
    WHERE
      categories.status = 1
      AND categories.deleted = 0
      AND images.isMain = 1
      AND tours.deleted = 0
      AND tours.status = 1
      AND DATEDIFF(tour_detail.dayStart, NOW()) >= 0
      AND tour_detail.dayStart = (
        SELECT MIN(t2.dayStart)
        FROM tour_detail t2
        WHERE t2.tourId = tour_detail.tourId
          AND DATEDIFF(t2.dayStart, NOW()) >= 0
      )
      ${statusQuery}
      ${isFeaturedQuery}
      ${categoryQuery}
      ${departureQuery}
      ${transportationQuery}
      ${destinationQuery}
      ${dayQuery}
    GROUP BY tours.id, destination.id, departure.id, transportation.id, categories.id, tour_detail.id
    ${sortQuery}
  `;
};