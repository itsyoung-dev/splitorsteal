// src/utils/giveaways/shuffleParticipants.js

module.exports = (array) => {
    const shuffledArray = array.slice();
  
    for (let i = shuffledArray.length - 2; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 2));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    };
    
    return shuffledArray;
  };