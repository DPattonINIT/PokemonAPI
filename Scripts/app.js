const searchBar = document.getElementById("searchBar");
const searchBTN = document.getElementById("searchBTN");
const pokemonImg = document.getElementById("pokemonImg");
const pokemonName = document.getElementById("pokemonName");
const shinyBTN = document.getElementById("shinyBTN");
const randomBTN = document.getElementById("randomBTN");
const favoritesBTN = document.getElementById("favoritesBTN");
const pokemonType = document.getElementById("pokemonType");
const abilitiesText = document.getElementById("abilitiesText");
const movesText = document.getElementById("movesText");
const locationText = document.getElementById("locationText");
const evolutionText = document.getElementById("evolutionText");
const favoritesList = document.getElementById("favoritesList");
let currentPokemonName = "";
let isShiny = false;


const GetPokemon = async (userSearch) => {
  try {
    // This  code Check if the search is within the range
    const isNumberSearch = !isNaN(userSearch);
    const searchValue = isNumberSearch
      ? parseInt(userSearch)
      : userSearch.toLowerCase();

    if (isNumberSearch && (searchValue < 1 || searchValue > 251)) {
      alert("Please enter a valid Pokémon Index between 1 and 251.");
      return;
    }

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${searchValue}`
    );
    const data = await response.json();
    currentPokemonName = data.name;

    const speciesUrl = data.species.url;
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();

    const evolutionChainUrl = speciesData.evolution_chain.url;
    const evolutionResponse = await fetch(evolutionChainUrl);
    const evolutionData = await evolutionResponse.json();

    const forwardEvolution = getEvolutionChain(evolutionData.chain);

    evolutionText.innerText = `${forwardEvolution.join(" -> ")}`;
    pokemonImg.src = isShiny ? data.sprites.front_shiny : data.sprites.front_default;
    pokemonName.innerText = data.name;
    pokemonType.innerText = data.types.map((type) => type.type.name).join(", ");
    abilitiesText.innerText = data.abilities
      .map((ability) => ability.ability.name)
      .join(", ");
    movesText.innerText = data.moves.map((move) => move.move.name).join(", ");
    locationText.innerText = data.game_indices
      .map((game) => game.version.name)
      .join(", ");
  } catch (error) {
    alert("Error: Pokémon not found.");
  }
};

// code to extact evolution chain
const getEvolutionChain = (chain) => {
  let evolutionArray = [chain.species.name];

  if (chain.evolves_to.length > 0) {
    for (let i = 0; i < chain.evolves_to.length; i++) {
      const nextEvolutions = getEvolutionChain(chain.evolves_to[i]);
      for (let j = 0; j < nextEvolutions.length; j++) {
        evolutionArray.push(nextEvolutions[j]);
      }
    }
  }
  return evolutionArray;
};

// Search Button Code
searchBTN.addEventListener("click", () => {
  const userSearch = searchBar.value.trim();
  if (userSearch) {
    GetPokemon(userSearch);
  } else {
    alert("Please enter a Pokémon name or Pokédex number.");
  }
});


searchBar.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && searchBar.value.trim()) {
      GetPokemon(searchBar.value.trim());
    } else if (event.key === "Enter") {
      alert("Please enter a Pokémon name or Pokédex number.");
    }
  });

// Local Storage section for favorites
function saveToLocalStorage(pokemon) {
  let pokemonArr = getFromLocalStorage();
  if (pokemonArr.length >= 5) {
    alert("Only 5 favorites allowed. Delete favorites to add more");
    return;
  }
  if (pokemon && !pokemonArr.includes(pokemon)) {
    pokemonArr.push(pokemon);
    localStorage.setItem("pokemonFavorites", JSON.stringify(pokemonArr));
  }
}

function getFromLocalStorage() {
  let saveToLocalStorageData = localStorage.getItem("pokemonFavorites");
  if (saveToLocalStorageData == null) {
    return [];
  }
  return JSON.parse(saveToLocalStorageData);
}

function removeFromLocalStorage(pokemonFavorites) {
  let localStorageData = getFromLocalStorage();
  let pokemonIndex = localStorageData.indexOf(pokemonFavorites);

  localStorageData.splice(pokemonIndex, 1);
  localStorage.setItem("pokemonFavorites", JSON.stringify(localStorageData));
}

function createElement() {
  let pokemonNames = getFromLocalStorage();
  favoritesList.innerHTML = "";

  for (let i = 0; i < pokemonNames.length; i++) {
    let p = document.createElement("p");
    p.innerText = pokemonNames[i];

    p.addEventListener("click", function () {
      GetPokemon(pokemonNames[i]);
    });

    // Creates the remove button
    let removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "removal";

    // "delete" icon for the remove button
    let removeIcon = document.createElement("img");
    removeIcon.src = "./images/remove.png";
    removeIcon.alt = "Remove";
    removeIcon.style.width = "20px";
    removeIcon.style.height = "20px";
    removeBtn.appendChild(removeIcon);

    // Add click event to the remove button
    removeBtn.addEventListener("click", function () {
      removeFromLocalStorage(pokemonNames[i]);
      p.remove();
    });

    // Append the remove button to the 'p' tag
    p.appendChild(removeBtn);
    favoritesList.appendChild(p);
  }
}

favoritesBTN.addEventListener("click", function () {
  if (currentPokemonName) {
    saveToLocalStorage(currentPokemonName);
    createElement();
  } else {
    alert("No Pokémon to add to favorites.");
  }
});

//   Add click event to the random button
randomBTN.addEventListener("click", () => {
  const randomId = Math.floor(Math.random() * 251) + 1;
  GetPokemon(randomId);
});

//  loads my favorites list
window.onload = () => {
  createElement();
};

// Eventlistner for the shiny button
shinyBTN.addEventListener("click", () => {
    isShiny = !isShiny; 
    if (currentPokemonName) {
      GetPokemon(currentPokemonName);  
    }
  });
