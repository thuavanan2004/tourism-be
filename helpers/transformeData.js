module.exports.transformeData = (tours) => {
  const transformedData = [];
  tours.forEach(item => {
    const existingTour = transformedData.find(tour => tour.code === item.code);

    if (existingTour) {
      existingTour.days.push({
        dayStart: item.dayStart,
        dayReturn: item.dayReturn
      });
    } else {
      transformedData.push({
        title: item.title,
        code: item.code,
        slug: item.slug,
        price: item.price,
        image: item.image,
        destination: item.destination,
        transportation: item.transportation,
        days: [{
          dayStart: item.dayStart,
          dayReturn: item.dayReturn
        }]
      });
    }
  });

  return transformedData;
}