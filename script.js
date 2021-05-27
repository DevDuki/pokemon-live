
// This will be a list of all pokemon types (e.g. fire, plant, rock, etc.)
let allTypes = []

// Descriptions to each generation for a better story telling to the user
const generationDescriptions = {
  generation1:{
    description:  "The first generation of the Pokémon franchise features the original 151 fictional species of the " +
        "creatures introduced to the core video game series in the 1996 Game Boy games Pokémon Red and Blue."
  },
  generation2:{
    description:  "The second generation of the Pokémon franchise features 100 fictional species of creatures introduced " +
        "to the core video game series in the 1999 Game Boy Color games Pokémon Gold and Silver, set in the Johto region."
  },
  generation3:{
    description:  "The third generation of the Pokémon franchise features 135 fictional species of creatures introduced " +
        "to the core video game series in the 2002 Game Boy Advance games Pokémon Ruby and Sapphire. Some Pokémon " +
        "in this generation were introduced in animated adaptations of the franchise before Ruby and Sapphire."
  },
  generation4:{
    description:  "The fourth generation of the Pokémon franchise features 107 fictional species of creatures introduced " +
        "to the core video game series in the 2006 Nintendo DS games Pokémon Diamond and Pearl. Some Pokémon " +
        "in this generation were introduced in animated adaptations of the franchise before Diamond and Pearl, " +
        "such as Bonsly, Mime Jr. and Munchlax, which were recurring characters in the Pokémon anime series in 2005 and 2006."
  },
  generation5:{
    description:  "The fifth generation of the Pokémon franchise features 156 fictional species of creatures introduced " +
        "to the core video game series in the 2010 Nintendo DS games Pokémon Black and White. Some Pokémon in this " +
        "generation were introduced in animated adaptations of the franchise before Black and White."
  },
  generation6:{
    description:  "The sixth generation of the Pokémon franchise features 72 fictional species of creatures introduced " +
        "to the core video game series in the 2013 Nintendo 3DS games Pokémon X and Y. Some Pokémon in this " +
        "generation were introduced in animated adaptations of the franchise before X and Y."
  }
}

// Here we prepare all the data necessary for our app.
const getData = async () => {
  const pokeCSV = await d3.csv('./poke-data/pokemon.csv')
  const pokeAPI = await d3.json('./poke-data/pokeDataFromAPI.json')
  const typesResponse = await fetch('https://pokeapi.co/api/v2/type')
  const typesJSON = await typesResponse.json()
  allTypes = typesJSON.results
      .map(result => result.name)
      .filter(type => type !== 'shadow')
      .filter(type => type !== 'unknown')

  let mergedPokeData = pokeCSV.map(pokemon => {
    const poke = pokeAPI.find(pa => {
      if(pa){
        return pa.name === pokemon.Name.toLowerCase()
      }
    })

    if(poke) {
      return {
        ...poke,
        generation: pokemon.Generation,
        attack: pokemon.Attack,
        defense: pokemon.Defense,
        hp: pokemon.HP,
      }
    } else {
      return
    }

  })

  mergedPokeData = mergedPokeData.filter(data => data !== undefined)

  return mergedPokeData
}


// After fetching and preparing the data we build the app
getData().then(data => {
  //###############################################################################################################
  // GENERATION

  // Getting all the elements we need to work on for the generation selection part
  const barChartContainerGeneration = document.getElementById('barchart-container-generation')
  const elementOverviewLeft         = document.getElementById('overview-container-left')
  const elementOverviewRight        = document.getElementById('overview-container-right')
  const tableName1                  = document.querySelector('.unit-name1')
  const tableName2                  = document.querySelector('.unit-name2')
  const genSelector1                = document.getElementById('gen-selector-1')
  const genSelector2                = document.getElementById('gen-selector-2')
  const totalGen1Field              = document.getElementById('total-gen1')
  const totalGen2Field              = document.getElementById('total-gen2')
  const gen1DescriptionField        = document.querySelector('.gen1Description')
  const gen2DescriptionField        = document.querySelector('.gen2Description')

  // This function updates the chart every time a new generation is selected from the select element
  const updateBarChart = () => {
    // Get the values of both selectors
    const valueSelector1 = genSelector1.value
    const valueSelector2 = genSelector2.value

    // Reset the barchart and both overview cards
    barChartContainerGeneration.textContent = ''
    elementOverviewLeft.textContent = ''
    elementOverviewRight.textContent = ''

    // Get total amount of pokemon in each chosen generation
    const totalPokeInGen1 = data.filter(d => d.generation === valueSelector1).length
    const totalPokeInGen2 = data.filter(d => d.generation === valueSelector2).length

    // Update the Texts in the cards
    totalGen1Field.innerHTML = `Total Pokemon: ${totalPokeInGen1}`
    totalGen2Field.innerHTML = `Total Pokemon: ${totalPokeInGen2}`
    gen1DescriptionField.innerHTML = `${generationDescriptions[`generation${valueSelector1}`].description}`
    gen2DescriptionField.innerHTML = `${generationDescriptions[`generation${valueSelector2}`].description}`


    // Add all bars to all three charts
    allTypes.forEach(type => {
      createBar(type, valueSelector1, valueSelector2)
    })

    // Sort left and right overviews and reapply those bars
    const overviewBarsLeft = elementOverviewLeft.querySelectorAll('.wrapperElements')
    const overviewBarsRight = elementOverviewRight.querySelectorAll('.wrapperElements')

    const overviewBarsLeftSorted = [...overviewBarsLeft].sort((a, b) => b.childNodes[2].innerHTML - a.childNodes[2].innerHTML)
    const overviewBarsRightSorted = [...overviewBarsRight].sort((a, b) => b.childNodes[2].innerHTML - a.childNodes[2].innerHTML)

    elementOverviewLeft.textContent = ''
    elementOverviewRight.textContent = ''

    overviewBarsLeftSorted.forEach(bar => {
      elementOverviewLeft.appendChild(bar)
    })
    overviewBarsRightSorted.forEach(bar => {
      elementOverviewRight.appendChild(bar)
    })
  }

  // Get all possible generations and prefix the number with the word "Generation", so that they can be included as options to both selectors
  const genSelectors = [...new Set(data.map(d => d.generation))]
      .map(generationNr => `Generation ${generationNr}`)

  // Now fill each possible options to both select elements
  genSelectors.forEach(genSelection => {
    const option1 = document.createElement('option')
    const option2 = document.createElement('option')
    option1.innerHTML = genSelection
    option2.innerHTML = genSelection
    option1.value = genSelection.slice(-1)
    option2.value = genSelection.slice(-1)
    genSelector1.appendChild(option1)
    genSelector2.appendChild(option2)
  })

  // change event listener to both selectors in order to update barcharts and the poke selectors which appear later in the app
  genSelector1.addEventListener('change', () => {
    updateBarChart()
    fillPokeSelector()
  })
  genSelector2.addEventListener('change', () => {
    updateBarChart()
    fillPokeSelector()
  })

  // Function to create the element overviews on the side
  const createOverview = (type, pokeAmount, position) => {

    // Note to self, next time use template strings and just paste plain HTML code in the innerHTML of the parent element. Example: container.innterHTML = `<div class="something">...</div>`
    const elementWrapper = document.createElement('div')
    const elementLogo = document.createElement('div')
    const logo = document.createElement('img')
    const elementName = document.createElement('div')
    const ratioField = document.createElement('div')

    elementWrapper.classList.add('wrapperElements')
    elementWrapper.classList.add('element-card__unit-stats')
    elementWrapper.classList.add('element-card_color')
    elementWrapper.classList.add('clearfix')
    elementLogo.classList.add('element')
    elementLogo.classList.add('first')
    logo.classList.add('iconElements')
    elementName.classList.add('element')
    elementName.classList.add('second')
    ratioField.classList.add('element')
    ratioField.classList.add('third')

    // Determine which of the overviews should be filled with bars
    const container = position === 'left'
        ? elementOverviewLeft
        : elementOverviewRight

    container.appendChild(elementWrapper)
    elementWrapper.appendChild(elementLogo)
    elementWrapper.appendChild(elementName)
    elementWrapper.appendChild(ratioField)
    elementLogo.appendChild(logo)

    logo.src = `./src/media/icons/${type}.png`
    elementName.innerHTML = type
    ratioField.innerHTML = `${pokeAmount}`
  }

  // Function to create the center barchart
  const createBar = (type, generation1 = 0, generation2 = 0) => {
    // Note to self, again use template strings instead, next time
    const barContainer = document.createElement('div')
    const barTooltip = document.createElement('span')
    const barLogo = document.createElement('div')
    const barComparisonContainer = document.createElement('div')
    const barGen1 = document.createElement('div')
    const barGen2 = document.createElement('div')
    const barBackground1 = document.createElement('div')
    const barBackground2 = document.createElement('div')
    const ratioContainer = document.createElement('div')
    const ratio1 = document.createElement('div')
    const ratio2 = document.createElement('div')
    const logo = document.createElement('img')

    barContainer.classList.add('bar-container')
    barContainer.classList.add('element-card')
    barContainer.classList.add('tooltip')
    barTooltip.classList.add('tooltiptext')
    barLogo.classList.add('bar-logo')
    barComparisonContainer.classList.add('bar-comparison-container')
    barGen1.classList.add('bar')
    barGen2.classList.add('bar')
    barBackground1.classList.add('background-bar')
    barBackground2.classList.add('background-bar')
    ratioContainer.classList.add('ratio-container')
    ratio1.classList.add('ratio')
    ratio2.classList.add('ratio')
    logo.classList.add('iconElementsBarchart')

    barChartContainerGeneration.appendChild(barContainer)
    barContainer.appendChild(barLogo)
    barContainer.appendChild(barComparisonContainer)
    barContainer.appendChild(ratioContainer)
    barContainer.appendChild(barTooltip)
    barLogo.appendChild(logo)
    barComparisonContainer.appendChild(barGen1)
    barComparisonContainer.appendChild(barGen2)
    barGen1.appendChild(barBackground1)
    barGen2.appendChild(barBackground2)
    ratioContainer.appendChild(ratio1)
    ratioContainer.appendChild(ratio2)

    // Get the amount of pokemon from the first selector and the corresponding type
    const pokeGenOneWithType = data
        .filter(d => d.generation === generation1)
        .filter(d => d.types.includes(type)).length

    // Get the amount of pokemon from the second selector and the corresponding type
    const pokeGenTwoWithType = data
        .filter(d => d.generation === generation2)
        .filter(d => d.types.includes(type)).length

    const totalPokeInGens = pokeGenOneWithType + pokeGenTwoWithType

    // Calculate the ratio between both generation in order to get the % value
    const ratioGen1 = Math.ceil(pokeGenOneWithType / (totalPokeInGens/100))
    const ratioGen2 = Math.floor(pokeGenTwoWithType / (totalPokeInGens/100))

    // Update both overviews
    createOverview(type, pokeGenOneWithType, 'left')
    createOverview(type, pokeGenTwoWithType, 'right')


    tableName1.innerHTML = `Generation ${generation1}`
    tableName2.innerHTML = `Generation ${generation2}`

    logo.src = `./src/media/icons/${type}.png`

    barBackground1.style.width = `${ratioGen1}%`
    barBackground2.style.width = `${ratioGen2}%`

    ratio1.innerHTML = `${ratioGen1}%`
    ratio2.innerHTML = `${ratioGen2}%`

    barTooltip.innerHTML = `${type}`

    barBackground1.style.backgroundColor = '#686af1'
    barBackground2.style.backgroundColor = '#f05454'
  }

  // END OF GENERATION PART
  //###############################################################################################################

  //###############################################################################################################
  //POKEMON

  // Getting all the elements we need to work on for the pokemon selection part
  const pokeSelector1 = document.getElementById('poke-selector-1')
  const pokeSelector2 = document.getElementById('poke-selector-2')
  const pokeSelectorLabel1 = document.getElementById('label-pokeselector1')
  const pokeSelectorLabel2 = document.getElementById('label-pokeselector2')
  const barChartContainerPokemon = document.getElementById('barchart-container-pokemon')
  const cardItem1 = document.getElementById("cardItem1")
  const cardItem2 = document.getElementById("cardItem2")

  // Function that updates the center bar chart
  const updatePokeBarChart = () => {
    const valueSelector1 = pokeSelector1.value
    const valueSelector2 = pokeSelector2.value

    barChartContainerPokemon.textContent = ''

    const poke1Data = data.filter(d => d.name === valueSelector1)[0]
    const poke2Data = data.filter(d => d.name === valueSelector2)[0]

    createPokeBar(poke1Data.hp, poke2Data.hp,'HP')
    createPokeBar(poke1Data.attack, poke2Data.attack, 'ATK')
    createPokeBar(poke1Data.defense, poke2Data.defense, 'DEF')
    createPokeBar(poke1Data.height, poke2Data.height, 'HEIGHT')
    
    pokeSelectorLabel1.innerHTML = `Choose a Pokemone in Generation ${genSelector1.value}:`
    pokeSelectorLabel2.innerHTML = `Choose a Pokemone in Generation ${genSelector2.value}:`
  }

  // Creates a bar in the poke bar chart with attribute values of both chosen pokemon and the attribute name, like "ATK", "DEF", etc.
  const createPokeBar = (pokemonAttr1, pokemonAttr2, attrName) => {
    const barContainer = document.createElement('div')
    const barTooltip = document.createElement('span')
    const barLogo = document.createElement('div')
    const barComparisonContainer = document.createElement('div')
    const barGen1 = document.createElement('div')
    const barGen2 = document.createElement('div')
    const barBackground1 = document.createElement('div')
    const barBackground2 = document.createElement('div')
    const ratioContainer = document.createElement('div')
    const ratio1 = document.createElement('div')
    const ratio2 = document.createElement('div')
    const logo = document.createElement('img')

    barContainer.classList.add('bar-container')
    barContainer.classList.add('element-card')
    barContainer.classList.add('tooltip')
    barTooltip.classList.add('tooltiptext')
    barLogo.classList.add('bar-logo')
    barComparisonContainer.classList.add('bar-comparison-container')
    barGen1.classList.add('bar')
    barGen2.classList.add('bar')
    barBackground1.classList.add('background-bar')
    barBackground2.classList.add('background-bar')
    ratioContainer.classList.add('ratio-container')
    ratio1.classList.add('ratio')
    ratio2.classList.add('ratio')
    logo.classList.add('iconElementsBarchart')

    barChartContainerPokemon.appendChild(barContainer)
    barContainer.appendChild(barLogo)
    barContainer.appendChild(barComparisonContainer)
    barContainer.appendChild(ratioContainer)
    barContainer.appendChild(barTooltip)
    barLogo.appendChild(logo)
    barComparisonContainer.appendChild(barGen1)
    barComparisonContainer.appendChild(barGen2)
    barGen1.appendChild(barBackground1)
    barGen2.appendChild(barBackground2)
    ratioContainer.appendChild(ratio1)
    ratioContainer.appendChild(ratio2)

    const pokeAtrrTotal = parseInt(pokemonAttr1) + parseInt(pokemonAttr2)

    // Get the ratio between both pokemon, in order to adjust the width of the bar
    const ratioPokeAttr1 = Math.ceil(pokemonAttr1 / (pokeAtrrTotal/100))
    const ratioPokeAttr2 = Math.floor(pokemonAttr2 / (pokeAtrrTotal/100))


    logo.src = `./src/media/icons/${attrName}.png`

    barBackground1.style.width = `${ratioPokeAttr1}%`
    barBackground2.style.width = `${ratioPokeAttr2}%`

    ratio1.innerHTML = `${pokemonAttr1}`
    ratio2.innerHTML = `${pokemonAttr2}`

    barTooltip.innerHTML = `${attrName}`

    barBackground1.style.backgroundColor = '#686af1'
    barBackground2.style.backgroundColor = '#f05454'
  }

  // Function that creates a card depending on the chosen pokemon and on which container the card should be built in
  const loadCard = (pokemonName, container) => {
    // Get the pokemon by its name
    const pokemon = data.filter(d => d.name === pokemonName)[0]

    // ELEMENT OF POKEMON
    const elementOfPokemon = container.querySelector('.elementOfPokemon')
    elementOfPokemon.innerHTML = `${pokemon.types[0]} ${pokemon.types.length > 1 ? `and ${pokemon.types[1]}` : ""}`

    // NAME OF POKEMON
    const nameOfPokemon = container.querySelector('.nameOfPokemon')
    nameOfPokemon.innerHTML = pokemon.name

    // DESCRIPTION OF POKEMON
    const descriptionOfPokemon = container.querySelector('.descriptionOfPokemon')
    descriptionOfPokemon.innerHTML = pokemon.description

    // ATK OF POKEMON
    const atkOfPokemon = container.querySelector('.atkOfPokemon')
    atkOfPokemon.innerHTML = pokemon.attack

    // HEIGHT OF POKEMON
    const heightOfPokemon = container.querySelector('.heightOfPokemon')
    heightOfPokemon.innerHTML = pokemon.height

    // HP OF POKEMON
    const hpOfPokemon = container.querySelector('.hpOfPokemon')
    hpOfPokemon.innerHTML = pokemon.hp

    // DEF OF POKEMON
    const defOfPokemon = container.querySelector('.defOfPokemon')
    defOfPokemon.innerHTML = pokemon.defense

    // IMG OF POKEMON
    const imgOfPokemon = container.querySelector('.imgOfPokemon')
    imgOfPokemon.src = pokemon.sprites.front_default

    // IMG OF BACKGROUND
    const background = container.querySelector('.pokemonBackground')
    background.style.backgroundImage = `url(./src/media/backgrounds/${pokemon.types[0]}B.png`
  }

  // Functions used by an event handler which updates both cards
  const updatePokemon = (event) => {

    // If this function is called for an initial load (first time when the page is opened by the user), create cards with bulbasaur as default pokemon on both sides
    if(!event){
      loadCard("bulbasaur", cardItem1)
      loadCard("bulbasaur", cardItem2)
      return
    }

    // Get the selector which triggered the event
    const selector = event.target

    // Determine to which card the selectore belongs to
    const container = selector.id === pokeSelector1.id
      ? cardItem1
      : cardItem2

    // Update the card by the selected pokemon and the corresponding container
    loadCard(selector.value, container)
  }

  
  // Function that fills the pokeselectors filtered by the previous chosen generations, so that only pokemon from the chosen generation will be able to be selected
  const fillPokeSelector = () => {
    // Reset the options in the selector to none, so the new ones can be refilled
    pokeSelector1.innerHTML = ''
    pokeSelector2.innerHTML = ''

    // Get all pokemon from the selected generation
    const selectedGen1Pokemon = data.filter(d => d.generation === genSelector1.value)
    const selectedGen2Pokemon = data.filter(d => d.generation === genSelector2.value)

    // Now fill the selectors with the pokemon names
    selectedGen1Pokemon.forEach(pokemon => {
      const option = document.createElement('option')
      option.innerHTML = pokemon.name
      option.value = pokemon.name
      pokeSelector1.appendChild(option)
    })

    selectedGen2Pokemon.forEach(pokemon => {
      const option = document.createElement('option')
      option.innerHTML = pokemon.name
      option.value = pokemon.name
      pokeSelector2.appendChild(option)
    })
    
    // Trigger the change event listnere manually, in order to update the pokemon card
    const event = new Event('change')
    pokeSelector1.dispatchEvent(event)
    pokeSelector2.dispatchEvent(event)
  }

  // Event listeners to both selectors, which causes the card and the chart to update
  pokeSelector1.addEventListener('change', (event) => {
    updatePokemon(event)
    updatePokeBarChart()
  })
  pokeSelector2.addEventListener('change', (event) => {
    updatePokemon(event)
    updatePokeBarChart()
  })

  // END OF POKEMON PART
  //###############################################################################################################
    

  // Functions that are being called on the initial page load, so that charts are filled with default values instead of empty charts
  updateBarChart()
  updatePokemon()
  fillPokeSelector()
})




// Copied from a codepen project
// Gradient background animation
const colors = [[135,31,31,1],
    [151,115,67,1],
    [93,185,185,1],
    [3,1,150,20]];

let firstStep = 0;
const colorChangeSpeed = 0.002;
const colorStepsAll = [0,1,2,3];

function changeColors() {

  const c1 = colors[colorStepsAll[0]];
  const c2 = colors[colorStepsAll[1]];
  const c3 = colors[colorStepsAll[2]];
  const c4 = colors[colorStepsAll[3]];

  const initStep = 1 - firstStep;

  const r_first = Math.round(initStep * c1[0] + firstStep * c2[0]);
  const g_first = Math.round(initStep * c1[1] + firstStep * c2[1]);
  const b_first = Math.round(initStep * c1[2] + firstStep * c2[2]);

  const colorMix = "rgb(" + r_first + "," + g_first + "," + b_first + ")";

  const r_second = Math.round(initStep * c3[0] + firstStep * c4[0]);
  const g_second = Math.round(initStep * c3[1] + firstStep * c4[1]);
  const b_second = Math.round(initStep * c3[2] + firstStep * c4[2]);

  const colorMix2 = "rgb(" + r_second + "," + g_second + "," + b_second + ")";

  $('#gradient').css({
    background: "-webkit-gradient(linear, left top, right top, from("+colorMix+"), to("+colorMix2+"))"})


firstStep += colorChangeSpeed;

if ( firstStep >= 1 ) {
  firstStep %= 1;
  colorStepsAll[0] = colorStepsAll[1];
  colorStepsAll[2] = colorStepsAll[3];

  colorStepsAll[1] = ( colorStepsAll[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
  colorStepsAll[3] = ( colorStepsAll[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
}}

setInterval(changeColors, 10);
