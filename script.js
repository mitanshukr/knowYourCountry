const endpoint = 'https://restcountries.eu/rest/v2/all';

const searchInput = document.querySelector('.search');
const suggestions = document.querySelector('.suggestions');
const countryDetail = document.getElementById('countryDetail');

const originalTextInSuggestions = suggestions.innerHTML;
const countryDetailOriginalText = countryDetail.innerHTML;

function errorHandler() {
  alert("Server Error! Please try after sometime.")
}

const countries = [];
fetch(endpoint)
  .then(response => response.json())
  .then(data => countries.push(...data))
  .catch(errorHandler);

function filterOutput(inputText, countryArray) {
  return countryArray.filter(country => {
    const regex = new RegExp(inputText, 'gi');
    return country.name.match(regex) || country.alpha2Code.match(regex) || country.alpha3Code.match(regex) || country.region.match(regex);;
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function displaySuggestion() {
  suggestions.classList.remove('display-none');
  countryDetail.classList.add('display-none');

  const matchedArray = filterOutput(this.value, countries);
  const html = matchedArray.map(countrySet => {
    const regex = new RegExp(this.value, 'gi');
    const countryName = countrySet.name.replace(regex, `<span class="hl">${this.value}</span>`);
    const countryCode = countrySet.alpha3Code.replace(regex, `<span class="hl">${this.value}</span>`);
    return `
    <li class="countryList">
    <span class="name">${countryName}, ${countryCode}</span>
    <span class="population">${numberWithCommas(countrySet.population)}</span>
    </li>`
  }).join('');

  const nothingFound = '<li>Try something else :(</li>';
  suggestions.innerHTML = searchInput.value == "" ? originalTextInSuggestions : html == "" ? nothingFound : html;

  // if(searchInput.value != "" && html == "")
  //   suggestions.innerHTML = nothingFound;
}

function getCountryDetail() {
  countryDetail.classList.remove('display-none');
  suggestions.classList.add('display-none');

  let [countryName, countryCode] = this.querySelector('.name').textContent.split(', ');
  let countryURI = `https://restcountries.eu/rest/v2/name/${countryName}?fullText=true`;

  searchInput.value = countryName;

  fetch(countryURI)
    .then(blob => blob.json())
    .then(data => {
      let countryData = {
        alpha2Code: data[0].alpha2Code,
        population: numberWithCommas(data[0].population),
        alpha3Code: data[0].alpha3Code,
        area: numberWithCommas(data[0].area),
        capital: data[0].capital,
        nativeName: data[0].nativeName,
        currencies: function () {
          let currencyArray = data[0].currencies.map(item => item.name);
          return currencyArray.join(', ');
        },
        languages: function () {
          let languageArray = data[0].languages.map(item => item.name);
          return languageArray.join(', ');
        },
        name: data[0].name,
        region: data[0].region,
        flag: data[0].flag,
      };

      //CountryDetail is defined at the top.
      countryDetail.querySelector('.name').textContent = countryData.name;
      countryDetail.querySelector('.region').textContent = countryData.region;
      countryDetail.querySelector('.flag').src = countryData.flag;

      let countryDetailInputList = countryDetail.querySelectorAll('.value');

      let count = 0;
      for (const data in countryData) {
        if (data == 'currencies' || data == 'languages')
          countryDetailInputList[count].textContent = countryData[data]();
        else
          countryDetailInputList[count].textContent = countryData[data];
        count++;

        if (count >= 8)
          break;
      }
    }).catch(detailErrorHandler);
}

function detailErrorHandler() {
  countryDetail.innerHTML = countryDetailOriginalText;
  alert("Server error! Please try after sometime.");
}

//MutationObserver: to detech changes in DOM element.
// Normal eventListners can not detect changes in DOM element.
//See MDN for more info.
const observer = new MutationObserver(function () {
  const countryList = document.querySelectorAll('.countryList');
  countryList.forEach(country => country.addEventListener('click', getCountryDetail));
});

observer.observe(suggestions, { subtree: true, childList: true });

// searchInput.addEventListener('change', displaySuggestion);
searchInput.addEventListener('keyup', displaySuggestion);