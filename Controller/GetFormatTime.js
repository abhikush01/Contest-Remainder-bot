function formatDateTo12Hour(dateString) {
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }); // Get abbreviated month name
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;

  const formattedDateTime = `${day} ${month} ${year}, ${formattedTime}`;

  return formattedDateTime;
}

function formatDateFromSeconds(seconds) {
  const date = new Date(seconds * 1000);

  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formatted = date.toLocaleString("en-IN", options);

  return formatted.replace(",", "");
}

module.exports = { formatDateTo12Hour, formatDateFromSeconds };
